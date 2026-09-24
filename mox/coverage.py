"""Scan coverage: which planes ran, which were off, and whether coverage shrank against the previous scan of the
same target. Coverage must never shrink silently (docs/AUDIT.md, B2)."""
import json
from pathlib import PureWindowsPath, PurePosixPath

PLANE_NAMES = {"code": "Source code", "dependencies": "Dependencies", "configs": "Configuration",
               "certificates": "Certificates", "containers": "Containers", "binaries": "Binaries", "tls": "Live TLS"}


def ran(scan) -> list[str]:
    """Planes that ran in this scan. Scans recorded before phase 16 only stored planes that found something."""
    if scan["planes_run"]:
        return json.loads(scan["planes_run"])
    return sorted(json.loads(scan["planes_hit"] or "{}"))


def off(scan) -> list[str]:
    return json.loads(scan["planes_off"]) if scan["planes_off"] else []


def _same_target(a: str, b: str) -> bool:
    norm = lambda p: str(PureWindowsPath(p) if "\\" in p or ":" in p else PurePosixPath(p)).rstrip("\\/").lower()
    return norm(a) == norm(b)


def delta(conn, scan) -> dict | None:
    """Compare with the previous scan of the same target. None when there is no earlier scan of it."""
    prev = next((r for r in conn.execute("SELECT * FROM scans WHERE id<? ORDER BY id DESC", (scan["id"],))
                 if _same_target(r["target"], scan["target"])), None)
    if prev is None:
        return None
    now_ran, prev_ran = set(ran(scan)), set(ran(prev))
    lost, gained = sorted(prev_ran - now_ran), sorted(now_ran - prev_ran)
    return {"prev_id": prev["id"], "prev_started": prev["started_at"], "lost": lost, "gained": gained,
            "lost_names": [PLANE_NAMES.get(p, p) for p in lost],
            "files_prev": prev["files_scanned"], "files_now": scan["files_scanned"],
            "shrank": bool(lost) or scan["files_scanned"] < prev["files_scanned"]}


def warning(d: dict | None) -> str | None:
    """One sentence for the CLI, the dashboard and the report; None when coverage did not shrink."""
    if not d or not d["shrank"]:
        return None
    parts = []
    if d["lost"]:
        parts.append(f"{', '.join(d['lost_names'])} ran in scan #{d['prev_id']} but not in this one")
    if d["files_now"] < d["files_prev"]:
        parts.append(f"{d['files_prev'] - d['files_now']} fewer files ({d['files_now']} vs {d['files_prev']})")
    return ("Coverage shrank against the previous scan of this target: " + "; ".join(parts)
            + ". Counts, verdicts and readiness are not comparable between the two scans.")
