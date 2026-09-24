"""Background scan jobs for the UI launcher: one scan at a time, live stage events kept in memory."""
import itertools
import threading
from pathlib import Path

from . import auth, db, scanner

_lock = threading.Lock()
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


def _run(job: dict, user: str, settings: dict, overrides: dict) -> None:
    def on_stage(ev):
        with _lock:
            job["stages"].append(ev)
    try:
        conn = db.connect()
        try:
            s = scanner.scan(job["path"], conn=conn, settings=settings, overrides=overrides, on_stage=on_stage)
            auth.audit(conn, user, "scan", f"{job['path']} -> {s['findings']} findings, {s['assets']} assets")
        finally:
            conn.close()
        with _lock:
            job.update(state="done", scan_id=s["scan_id"], result=s)
    except Exception as e:  # surface to the UI; never kill the server
        with _lock:
            job.update(state="error", error=str(e))


def start(raw_path: str, user: str, settings: dict, overrides: dict) -> dict:
    path = validate_path(raw_path)
    with _lock:
        if any(j["state"] == "running" for j in _jobs.values()):
            raise JobError(409, "a scan is already running")
        job = {"id": next(_ids), "path": str(path), "state": "running", "stages": [], "scan_id": None,
               "error": None, "result": None}
        _jobs[job["id"]] = job
    threading.Thread(target=_run, args=(job, user, settings, overrides), daemon=True).start()
    return status(job["id"])


def status(job_id: int) -> dict:
    with _lock:
        job = _jobs.get(job_id)
        if not job:
            raise JobError(404, "scan job not found")
        return {**job, "stages": list(job["stages"]), "running": job["state"] == "running"}
