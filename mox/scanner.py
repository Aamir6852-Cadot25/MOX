"""Scan orchestrator: walks a tree, dispatches files to the 7 plane plugins, dedupes, stores results."""
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path

from . import db, netguard, nist, tls_policy
from .models import Finding
from .planes import binaries, certs, code, configs, containers, deps, tls

FILE_PLANES = (code, deps, configs, certs, containers)
ALL_PLANES = FILE_PLANES + (binaries, tls)  # display order; tls is the only plane that opens a socket
PROGRESS_EVERY_S = 0.03  # live Detect progress: at most one snapshot per 30 ms (plus a final one)
SKIP_DIRS = {".git", "node_modules", ".venv", "venv", "__pycache__", ".pytest_cache", "dist"}
SKIP_SUFFIXES = {".db", ".bak", ".pyc", ".log"}


class Ctx:
    def __init__(self, enabled: set[str] | None = None, on_progress=None):
        self.depth = 0
        self.errors: list[str] = []
        self.files_scanned = 0
        self.bytes_read = 0  # size on disk of every top-level file actually claimed by a plane (Scan ledger footer)
        self.seen: set = set()
        self.enabled = enabled if enabled is not None else {p.NAME for p in ALL_PLANES if p is not tls}
        self.plane_ms: dict[str, float] = {}  # top-level wall time per plane (container time includes its contents)
        self.plane_total: dict[str, int] = {}  # files claimed per plane at Ingest (top level)
        self.plane_done: dict[str, int] = {}
        self.plane_raw: dict[str, int] = {}  # findings before dedupe, for live progress
        self.plane_err: dict[str, list[str]] = {}
        self.on_progress = on_progress
        self._last_emit = 0.0

    def claim(self, path: Path) -> list:
        claimed = [p for p in FILE_PLANES if p.NAME in self.enabled and p.wants(path)]
        if not claimed and binaries.NAME in self.enabled and binaries.looks_binary(path):
            claimed = [binaries]
        return claimed

    def plan(self, files: list[Path]) -> list[tuple[Path, list]]:
        """Ingest: decide which planes own each file, so Detect can report done/total per plane."""
        out = [(p, self.claim(p)) for p in files]
        for _, claimed in out:
            for plane in claimed:
                self.plane_total[plane.NAME] = self.plane_total.get(plane.NAME, 0) + 1
        return out

    def progress(self, final: bool = False) -> None:
        now = time.perf_counter()
        if self.on_progress and (final or now - self._last_emit >= PROGRESS_EVERY_S):
            self._last_emit = now
            self.on_progress({n: {"done": self.plane_done.get(n, 0), "total": self.plane_total.get(n, 0),
                                  "findings": self.plane_raw.get(n, 0), "ms": round(self.plane_ms.get(n, 0), 3),
                                  "errors": len(self.plane_err.get(n, []))} for n in self.plane_total})

    def scan_file(self, path: Path, rel: str, claimed: list | None = None) -> list[Finding]:
        claimed = self.claim(path) if claimed is None else claimed
        out: list[Finding] = []
        for plane in claimed:
            t = time.perf_counter()
            got: list[Finding] = []
            try:
                got = plane.scan(path, rel, self)
            except Exception as e:  # one bad file must not abort a scan
                self.errors.append(f"{plane.NAME}: {rel}: {e}")
                if self.depth == 0:
                    self.plane_err.setdefault(plane.NAME, []).append(f"{rel}: {e}")
            out += got
            if self.depth == 0:
                n = plane.NAME
                self.plane_ms[n] = self.plane_ms.get(n, 0) + (time.perf_counter() - t) * 1000
                self.plane_done[n] = self.plane_done.get(n, 0) + 1
                self.plane_raw[n] = self.plane_raw.get(n, 0) + sum(f.plane == n for f in got)
        if claimed:
            self.files_scanned += 1
            if self.depth == 0:
                try:
                    self.bytes_read += path.stat().st_size
                except OSError:
                    pass
                self.progress()
        return out

    @staticmethod
    def walk(root: Path):
        base = Path(root).resolve()
        for dirpath, dirnames, filenames in os.walk(root):  # os.walk does not follow directory symlinks
            dirnames[:] = sorted(d for d in dirnames if d not in SKIP_DIRS)
            for name in sorted(filenames):
                p = Path(dirpath, name)
                if p.suffix.lower() in SKIP_SUFFIXES or not p.is_file():
                    continue
                if p.is_symlink() and base not in p.resolve().parents:
                    continue  # never read outside the folder the user chose
                yield p

    def scan_tree(self, root: Path, prefix: str = "", depth: int | None = None, plan=None) -> list[Finding]:
        saved = self.depth
        if depth is not None:
            self.depth = depth
        out: list[Finding] = []
        try:
            for p, claimed in (plan if plan is not None else ((f, None) for f in self.walk(root))):
                out += self.scan_file(p, prefix + p.relative_to(root).as_posix(), claimed)
        finally:
            self.depth = saved
        return out


def plane_report(ctx: Ctx, findings: list[Finding], probe_list: list[str] | None = None) -> dict:
    """Detect-stage detail for all 7 planes: files, findings (after dedupe), ms, status and failure reason.
    TLS is bookkept through the same ctx fields as any file plane (one "file" per endpoint probed), so a
    scan with several live endpoints reports "partial" when some fail and "failed" only when all do."""
    counts: dict[str, int] = {}
    for f in findings:
        counts[f.plane] = counts.get(f.plane, 0) + 1
    out = {}
    for mod in ALL_PLANES:
        n = mod.NAME
        errs = ctx.plane_err.get(n, [])
        total = ctx.plane_total.get(n, 0)
        if n not in ctx.enabled:
            status = "off"
        elif errs and len(errs) >= total:
            status = "failed"
        elif errs:
            status = "partial"
        else:
            status = "ok" if total else "idle"
        out[n] = {"files": total, "findings": counts.get(n, 0), "ms": round(ctx.plane_ms.get(n, 0), 3),
                  "status": status, "errors": len(errs), "error": errs[0] if errs else None,
                  **({"endpoints": probe_list} if mod is tls and probe_list else {})}
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

    def __init__(self, on_stage=None):
        self.t0 = self.last = time.perf_counter()
        self.events: list[dict] = []
        self.on_stage = on_stage

    def __call__(self, stage: str, count: int, detail) -> None:
        now = time.perf_counter()
        self.events.append({"stage": stage, "count": count, "detail": detail,
                            "ms": round((now - self.last) * 1000, 3), "t_ms": round((now - self.t0) * 1000, 3)})
        self.last = now
        if self.on_stage:  # live progress (API scan jobs); called the moment each stage completes
            self.on_stage(self.events[-1])


def scan(target: str | Path, probe: str | None = None, probes: list[str] | None = None, conn=None,
         settings: dict | None = None, overrides: dict | None = None, on_stage=None,
         planes: set[str] | None = None, on_progress=None, project_id: int | None = None,
         tls_authorized: bool = False) -> dict:
    """Scan `target`, persist scan + findings + stage events, return a summary dict. Read-only on `target`.
    on_stage(event): fired as each pipeline stage completes. on_progress(snapshot): per-plane Detect progress.
    planes: file planes to run (default all six); tls runs only when `probe`/`probes` is given.
    probe: one "host:port" (back-compat); probes: any number more, run in addition to `probe`.
    tls_authorized: the operator ticked "I am authorised to probe this host" for this scan — required for
    any endpoint that is not loopback/RFC 1918 (mox/tls_policy.py; closes audit Major 16).
    project_id: the project this scan belongs to (default: the auto-created "Default project")."""
    target = Path(target).resolve()
    if not target.is_dir():
        raise FileNotFoundError(f"scan target is not a directory: {target}")
    own = conn is None
    conn = conn or db.connect()
    project_id = project_id if project_id is not None else db.ensure_default_project(conn)
    probe_list = list(dict.fromkeys(([probe] if probe else []) + list(probes or [])))
    started = datetime.now(timezone.utc).isoformat(timespec="seconds")
    net0 = netguard.counts()
    mark = _Stages(on_stage)
    t0 = mark.t0
    enabled = set(planes) if planes is not None else {p.NAME for p in FILE_PLANES + (binaries,)}
    enabled = (enabled - {tls.NAME}) | ({tls.NAME} if probe_list else set())
    ctx = Ctx(enabled, on_progress)
    if probe_list:
        ctx.plane_total[tls.NAME] = len(probe_list)
    plan = ctx.plan(list(ctx.walk(target)))
    mark("Ingest", len(plan), {"files": len(plan), "planes": dict(ctx.plane_total)})
    ctx.progress(final=True)
    findings = ctx.scan_tree(target, plan=plan)
    for raw in probe_list:
        t = time.perf_counter()
        host, _, port_s = raw.rpartition(":")
        host = host or "127.0.0.1"
        got: list[Finding] = []
        try:
            tls_policy.check(host, tls_authorized)
            got = tls.probe(host, int(port_s))
            ctx.files_scanned += 1
        except (OSError, ValueError) as e:
            ctx.plane_err.setdefault(tls.NAME, []).append(f"probe {raw} failed: {e}")
        findings += got
        ctx.plane_ms[tls.NAME] = ctx.plane_ms.get(tls.NAME, 0) + (time.perf_counter() - t) * 1000
        ctx.plane_done[tls.NAME] = ctx.plane_done.get(tls.NAME, 0) + 1
        ctx.plane_raw[tls.NAME] = ctx.plane_raw.get(tls.NAME, 0) + sum(f.plane == tls.NAME for f in got)
    ctx.progress(final=True)
    findings = _dedupe(findings)
    seconds = round(time.perf_counter() - t0, 3)
    planes: dict[str, int] = {}
    for f in findings:
        planes[f.plane] = planes.get(f.plane, 0) + 1
    report = plane_report(ctx, findings, probe_list)
    probe_error = (ctx.plane_err.get(tls.NAME) or [None])[0]
    probe_col = ", ".join(probe_list) or None
    mark("Detect", len(findings), report)
    # Coverage = planes that ran (a plane that ran and found nothing still counts); failed and off planes do not.
    planes_run = [n for n, d in report.items() if d["status"] in ("ok", "idle", "partial")]
    planes_off = [n for n, d in report.items() if d["status"] == "off"]
    verify = sum(f.confidence == "low" for f in findings)
    cur = conn.execute(
        "INSERT INTO scans(target,probe,started_at,seconds,files_scanned,planes_hit,findings_count,probe_error,"
        "planes_run,planes_off,project_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
        (str(target), probe_col, started, seconds, ctx.files_scanned, json.dumps(planes), len(findings), probe_error,
         json.dumps(planes_run), json.dumps(planes_off), project_id))
    scan_id = cur.lastrowid
    store_findings(conn, scan_id, findings)
    conn.commit()
    mark.last = time.perf_counter()  # DB write time is not part of the Correlate stage duration
    from .analyze import analyze
    assets = analyze(scan_id, conn, settings, overrides, mark=mark)
    net1 = netguard.counts()  # connects made by this process while the scan ran (see mox/netguard.py)
    net = {"guard": net1["installed"], "outbound": net1["outbound"] - net0["outbound"],
           "loopback": net1["loopback"] - net0["loopback"]}
    conn.execute("UPDATE scans SET stages=?, net=? WHERE id=?", (json.dumps(mark.events), json.dumps(net), scan_id))
    conn.commit()
    from . import coverage
    cov = coverage.delta(conn, conn.execute("SELECT * FROM scans WHERE id=?", (scan_id,)).fetchone())
    if own:
        conn.close()
    return {"assets": len(assets), "scan_id": scan_id, "target": str(target), "files_scanned": ctx.files_scanned, "seconds": seconds,
            "planes": planes, "planes_run": planes_run, "planes_off": planes_off, "findings": len(findings),
            "verify_first": verify, "probe_error": probe_error, "probes": probe_list, "errors": ctx.errors, "net": net,
            "bytes_read": ctx.bytes_read, "coverage": cov, "coverage_warning": coverage.warning(cov)}
