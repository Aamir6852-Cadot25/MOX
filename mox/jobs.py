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


def validate_path(raw: str) -> Path:
    """Local folder only: no URLs, no UNC/network shares, must exist and be a directory."""
    s = (raw or "").strip().strip('"')
    if not s:
        raise JobError(400, "enter a folder path")
    if "://" in s or s.startswith(("\\\\", "//")):
        raise JobError(400, "only local folders can be scanned (no URLs or network shares)")
    p = Path(s).expanduser()
    if not p.is_absolute():
        raise JobError(400, "enter an absolute folder path, e.g. D:\\code\\my-repo")
    if not p.exists():
        raise JobError(400, f"path does not exist: {s}")
    if not p.is_dir():
        raise JobError(400, f"not a directory: {s}")
    return p.resolve()


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
            s = scanner.scan(job["path"], conn=conn, settings=settings, overrides=overrides, on_stage=on_stage,
                             planes=job["planes"], probe=job["probe"], on_progress=on_progress)
            auth.audit(conn, user, "scan", f"{job['path']} -> {s['findings']} findings, {s['assets']} assets")
        finally:
            conn.close()
        with _lock:
            job.update(state="done", scan_id=s["scan_id"], result=s)
            _emit(job, "done", {"scan_id": s["scan_id"], "net": s["net"], "errors": s["errors"][:20]})
    except Exception as e:  # surface to the UI; never kill the server
        with _lock:
            job.update(state="error", error=str(e))
            _emit(job, "error", {"error": str(e)})


def _probe(raw: str | None) -> str | None:
    s = (raw or "").strip()
    if not s:
        return None
    host, _, port = s.rpartition(":")
    if not host or not port.isdigit() or not 0 < int(port) < 65536 or "/" in host:
        raise JobError(400, "TLS endpoint must be host:port, e.g. 127.0.0.1:8443")
    return s


def start(raw_path: str, user: str, settings: dict, overrides: dict, planes: list[str] | None = None,
          probe: str | None = None) -> dict:
    path = validate_path(raw_path)
    known = {p.NAME for p in scanner.ALL_PLANES}
    if planes is not None and not set(planes) <= known:
        raise JobError(400, f"unknown plane(s): {', '.join(sorted(set(planes) - known))}")
    probe = _probe(probe)
    with _lock:
        if any(j["state"] == "running" for j in _jobs.values()):
            raise JobError(409, "a scan is already running")
        job = {"id": next(_ids), "path": str(path), "state": "running", "stages": [], "scan_id": None,
               "error": None, "result": None, "events": [], "probe": probe,
               "planes": set(planes) if planes is not None else None}
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
        out = {k: v for k, v in job.items() if k != "events"}
        return {**out, "stages": list(job["stages"]), "running": job["state"] == "running",
                "planes": sorted(job["planes"]) if job["planes"] is not None else None}
