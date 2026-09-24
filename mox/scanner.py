"""Scan orchestrator: walks a tree, dispatches files to the 7 plane plugins, dedupes, stores results."""
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

from . import db, nist
from .models import Finding
from .planes import binaries, certs, code, configs, containers, deps, tls

FILE_PLANES = (code, deps, configs, certs, containers)
SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "__pycache__", ".pytest_cache", "dist"}
SKIP_SUFFIXES = {".db", ".bak", ".pyc", ".log"}


class Ctx:
    def __init__(self):
        self.depth = 0
        self.errors: list[str] = []
        self.files_scanned = 0
        self.seen: set = set()
        self.plane_ms: dict[str, float] = {}  # top-level wall time per plane (container time includes its contents)

    def scan_file(self, path: Path, rel: str) -> list[Finding]:
        claimed = [p for p in FILE_PLANES if p.wants(path)]
        if not claimed and binaries.looks_binary(path):
            claimed = [binaries]
        out: list[Finding] = []
        for plane in claimed:
            t = time.perf_counter()
            try:
                out += plane.scan(path, rel, self)
            except Exception as e:  # one bad file must not abort a scan
                self.errors.append(f"{plane.NAME}: {rel}: {e}")
            if self.depth == 0:
                self.plane_ms[plane.NAME] = self.plane_ms.get(plane.NAME, 0) + (time.perf_counter() - t) * 1000
        if claimed:
            self.files_scanned += 1
        return out

    @staticmethod
    def walk(root: Path):
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
            for name in sorted(filenames):
                p = Path(dirpath, name)
                if p.suffix.lower() not in SKIP_SUFFIXES and p.is_file():
                    yield p

    def scan_tree(self, root: Path, prefix: str = "", depth: int | None = None, files=None) -> list[Finding]:
        saved = self.depth
        if depth is not None:
            self.depth = depth
        out: list[Finding] = []
        try:
            for p in (files if files is not None else self.walk(root)):
                out += self.scan_file(p, prefix + p.relative_to(root).as_posix())
        finally:
            self.depth = saved
        return out


def _dedupe(findings: list[Finding]) -> list[Finding]:
    seen, out = set(), []
    for f in findings:
        k = f.dedupe_key()
        if k not in seen:
            seen.add(k)
            out.append(f)
    return out


def store_findings(conn, scan_id: int, findings: list[Finding]) -> None:
    rows = []
    for f in findings:
        n = nist.lookup(f.algorithm, f.key_size, f.curve, f.mode)
        qv = n.get("quantum_vulnerable")
        rows.append((scan_id, f.plane, f.algorithm, f.key_size, f.mode, f.curve, f.file, f.line, f.evidence,
                     f.fingerprint, f.confidence, f.detector, int(f.confidence == "low"), n["now"],
                     n["after_2030"], n["after_2035"], None if qv is None else int(qv), n.get("source"),
                     n.get("notes"), json.dumps(f.meta)))
    conn.executemany(
        "INSERT INTO findings(scan_id,plane,algorithm,key_size,mode,curve,file,line,evidence,fingerprint,"
        "confidence,detector,verify_first,nist_now,nist_2030,nist_2035,quantum_vulnerable,nist_source,"
        "nist_notes,meta) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)", rows)


class _Stages:
    """Pipeline stage events with real perf_counter timings (ms since scan start + stage duration)."""

    def __init__(self):
        self.t0 = self.last = time.perf_counter()
        self.events: list[dict] = []

    def __call__(self, stage: str, count: int, detail) -> None:
        now = time.perf_counter()
        self.events.append({"stage": stage, "count": count, "detail": detail,
                            "ms": round((now - self.last) * 1000, 3), "t_ms": round((now - self.t0) * 1000, 3)})
        self.last = now


def scan(target: str | Path, probe: str | None = None, conn=None, settings: dict | None = None,
         overrides: dict | None = None) -> dict:
    """Scan `target`, persist scan + findings + stage events, return a summary dict."""
    target = Path(target).resolve()
    if not target.is_dir():
        raise FileNotFoundError(f"scan target is not a directory: {target}")
    own = conn is None
    conn = conn or db.connect()
    started = datetime.now(timezone.utc).isoformat(timespec="seconds")
    mark = _Stages()
    t0 = mark.t0
    ctx = Ctx()
    files = list(ctx.walk(target))
    mark("Ingest", len(files), {"files": len(files)})
    findings = ctx.scan_tree(target, files=files)
    probe_error = None
    if probe:
        t = time.perf_counter()
        try:
            host, _, port = probe.rpartition(":")
            findings += tls.probe(host or "127.0.0.1", int(port))
            ctx.files_scanned += 1
        except (OSError, ValueError) as e:
            probe_error = f"probe {probe} failed: {e}"
        ctx.plane_ms[tls.NAME] = ctx.plane_ms.get(tls.NAME, 0) + (time.perf_counter() - t) * 1000
    findings = _dedupe(findings)
    seconds = round(time.perf_counter() - t0, 3)
    planes: dict[str, int] = {}
    for f in findings:
        planes[f.plane] = planes.get(f.plane, 0) + 1
    mark("Detect", len(findings), {p: {"findings": planes.get(p, 0), "ms": round(ctx.plane_ms.get(p, 0), 3)}
                                   for p in sorted(set(planes) | set(ctx.plane_ms))})
    verify = sum(f.confidence == "low" for f in findings)
    cur = conn.execute(
        "INSERT INTO scans(target,probe,started_at,seconds,files_scanned,planes_hit,findings_count,probe_error)"
        " VALUES(?,?,?,?,?,?,?,?)",
        (str(target), probe, started, seconds, ctx.files_scanned, json.dumps(planes), len(findings), probe_error))
    scan_id = cur.lastrowid
    store_findings(conn, scan_id, findings)
    conn.commit()
    mark.last = time.perf_counter()  # DB write time is not part of the Correlate stage duration
    from .analyze import analyze
    assets = analyze(scan_id, conn, settings, overrides, mark=mark)
    conn.execute("UPDATE scans SET stages=? WHERE id=?", (json.dumps(mark.events), scan_id))
    conn.commit()
    if own:
        conn.close()
    return {"assets": len(assets), "scan_id": scan_id, "target": str(target), "files_scanned": ctx.files_scanned, "seconds": seconds,
            "planes": planes, "findings": len(findings), "verify_first": verify,
            "probe_error": probe_error, "errors": ctx.errors}
