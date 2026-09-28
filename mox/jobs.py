"""Background scan jobs for the UI launcher: one scan at a time, live events kept in memory and streamed (SSE)."""
import itertools
import json
import threading
from pathlib import Path

from . import auth, db, scanner

_lock = threading.Lock()
_changed = threading.Condition(_lock)  # notified on every new job event; SSE streams wait on it
KEEPALIVE_S = 15
_jobs: dict[int, dict] = {}
_ids = itertools.count(1)


class JobError(Exception):
    def __init__(self, status: int, msg: str):
        super().__init__(msg)
        self.status = status


def _emit(job: dict, kind: str, data) -> None:
    """Append one event to the job log (caller holds _lock) and wake SSE streams."""
    job["events"].append({"seq": len(job["events"]) + 1, "type": kind, "data": data})
    _changed.notify_all()


def _run(job: dict, user: str, settings: dict, overrides: dict) -> None:
    def on_stage(ev):
        with _lock:
            job["stages"].append(ev)
            _emit(job, "stage", ev)

    def on_progress(planes):
        with _lock:
            _emit(job, "progress", planes)
    try:
        conn = db.connect()
        try:
            source_ref = (job.get("source_meta") or {}).get("source_ref")
            s = scanner.scan(job["path"], conn=conn, settings=settings, overrides=overrides, on_stage=on_stage,
                             planes=job["planes"], probe=job["probe"], probes=job.get("probes"),
                             tls_authorized=job.get("tls_authorized", False), on_progress=on_progress,
                             project_id=job.get("project_id"), source_ref=source_ref)
            detail = f"{job['path']} -> {s['findings']} findings, {s['assets']} assets"
            if job.get("tls_authorized") and s.get("probes"):
                detail += f"; TLS probe authorised for {len(s['probes'])} endpoint(s)"
            meta = job.get("source_meta") or {}
            if meta.get("source_kind") and meta["source_kind"] != "folder":
                detail += f"; source={meta['source_kind']}"
                if meta.get("source_ref"):
                    detail += f" ({meta['source_ref']})"
            if meta.get("commit"):
                detail += f"; commit {meta['commit'][:12]}"
            auth.audit(conn, user, "scan", detail)
        finally:
            conn.close()
        with _lock:
            job.update(state="done", scan_id=s["scan_id"], result=s)
            _emit(job, "done", {"scan_id": s["scan_id"], "net": s["net"], "errors": s["errors"][:20],
                                "bytes_read": s["bytes_read"]})
    except Exception as e:  # surface to the UI; never kill the server
        with _lock:
            job.update(state="error", error=str(e))
            _emit(job, "error", {"error": str(e)})
    finally:
        cleanup = job.get("cleanup")
        if cleanup:
            cleanup()


def _probe(raw: str | None) -> str | None:
    s = (raw or "").strip()
    if not s:
        return None
    host, _, port = s.rpartition(":")
    if not host or not port.isdigit() or not 0 < int(port) < 65536 or "/" in host:
        raise JobError(400, "TLS endpoint must be host:port, e.g. 127.0.0.1:8443")
    return s


def _probes(raw: list[str] | None) -> list[str]:
    return [_probe(p) for p in (raw or []) if (p or "").strip()]


def start(path: Path, user: str, settings: dict, overrides: dict, planes: list[str] | None = None,
          probe: str | None = None, probes: list[str] | None = None, tls_authorized: bool = False,
          project_id: int | None = None, cleanup=None, source_meta: dict | None = None) -> dict:
    """`path` must already be a resolved, existing directory (mox/source.py resolves every source kind
    to one); this function no longer validates a raw string itself so every source shares the same check."""
    known = {p.NAME for p in scanner.ALL_PLANES}
    if planes is not None and not set(planes) <= known:
        raise JobError(400, f"unknown plane(s): {', '.join(sorted(set(planes) - known))}")
    probe = _probe(probe)
    probe_list = _probes(probes)
    with _lock:
        if any(j["state"] == "running" for j in _jobs.values()):
            raise JobError(409, "a scan is already running")
        job = {"id": next(_ids), "path": str(path), "state": "running", "stages": [], "scan_id": None,
               "error": None, "result": None, "events": [], "probe": probe, "probes": probe_list,
               "tls_authorized": tls_authorized, "project_id": project_id, "cleanup": cleanup,
               "source_meta": source_meta, "planes": set(planes) if planes is not None else None}
        _jobs[job["id"]] = job
    threading.Thread(target=_run, args=(job, user, settings, overrides), daemon=True).start()
    return status(job["id"])


def stream(job_id: int, after: int = 0):
    """SSE body: replay events after `after` (Last-Event-ID), then follow live until done/error."""
    with _lock:
        if job_id not in _jobs:
            raise JobError(404, "scan job not found")
    sent = after
    while True:
        with _lock:
            job = _jobs[job_id]
            if len(job["events"]) <= sent and job["state"] == "running":
                _changed.wait(KEEPALIVE_S)
            new = job["events"][sent:]
            finished = job["state"] != "running"
        if not new:
            if finished:
                return
            yield ": keepalive\n\n"
            continue
        for ev in new:
            yield f"id: {ev['seq']}\nevent: {ev['type']}\ndata: {json.dumps(ev['data'])}\n\n"
            sent = ev["seq"]
            if ev["type"] in ("done", "error"):
                return


def status(job_id: int) -> dict:
    with _lock:
        job = _jobs.get(job_id)
        if not job:
            raise JobError(404, "scan job not found")
        out = {k: v for k, v in job.items() if k not in ("events", "cleanup")}
        return {**out, "stages": list(job["stages"]), "running": job["state"] == "running",
                "planes": sorted(job["planes"]) if job["planes"] is not None else None}
