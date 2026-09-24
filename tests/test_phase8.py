import json

from fastapi.testclient import TestClient

from mox import auth, db
from mox.api import create_app


def test_api_scan_then_latest_returns_timed_stages(demo_dir):
    """Full loop through the API: POST a scan, then GET /api/scans/latest must serve that scan's 5 timed stages."""
    conn = db.connect()
    auth.create_user(conn, "admin", "correct-horse-1", "admin")
    conn.close()
    c = TestClient(create_app())
    assert c.post("/api/auth/login", json={"username": "admin", "password": "correct-horse-1"}).status_code == 200
    r = c.post("/api/scans", json={"path": str(demo_dir)})
    assert r.status_code == 200
    latest = c.get("/api/scans/latest").json()
    assert latest["scan"]["id"] == r.json()["scan_id"]
    stages = latest["stages"]
    assert [s["stage"] for s in stages] == ["Ingest", "Detect", "Correlate", "Score", "Verdict"]
    ts = [s["t_ms"] for s in stages]
    assert all(a < b for a, b in zip(ts, ts[1:]))
    assert all(s["ms"] > 0 for s in stages)


def test_stage_events_are_timed_and_consistent(scan_demo):
    summary, rows = scan_demo
    conn = db.connect()
    stages = json.loads(conn.execute("SELECT stages FROM scans WHERE id=?", (summary["scan_id"],)).fetchone()[0])
    n_assets = conn.execute("SELECT COUNT(*) FROM assets WHERE scan_id=?", (summary["scan_id"],)).fetchone()[0]
    conn.close()
    by = {s["stage"]: s for s in stages}
    assert [s["stage"] for s in stages] == ["Ingest", "Detect", "Correlate", "Score", "Verdict"]
    ts = [s["t_ms"] for s in stages]
    assert all(a < b for a, b in zip(ts, ts[1:])) and all(s["ms"] >= 0 for s in stages)
    assert by["Detect"]["count"] == sum(p["findings"] for p in by["Detect"]["detail"].values()) == len(rows)
    assert by["Correlate"]["detail"] == {"findings": len(rows), "assets": n_assets} and by["Correlate"]["count"] == n_assets
    assert sum(by["Verdict"]["detail"].values()) == sum(by["Score"]["detail"].values()) == n_assets
