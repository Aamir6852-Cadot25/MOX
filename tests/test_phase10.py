import threading
import time

import pytest
from fastapi.testclient import TestClient

from mox import auth, db, jobs, scanner
from mox.api import create_app

STAGES = ["Ingest", "Detect", "Correlate", "Score", "Verdict"]


@pytest.fixture()
def client():
    conn = db.connect()
    auth.create_user(conn, "admin", "correct-horse-1", "admin")
    conn.close()
    c = TestClient(create_app())
    assert c.post("/api/auth/login", json={"username": "admin", "password": "correct-horse-1"}).status_code == 200
    return c


def _wait(c, job_id, cond, timeout=60):
    end = time.monotonic() + timeout
    while time.monotonic() < end:
        st = c.get(f"/api/scans/{job_id}/status").json()
        if cond(st):
            return st
        time.sleep(0.02)
    raise AssertionError(f"timed out; last status {st}")


def _counts(conn, scan_id):
    q = lambda sql: conn.execute(sql, (scan_id,)).fetchone()[0]
    return (q("SELECT COUNT(*) FROM findings WHERE scan_id=?"), q("SELECT COUNT(*) FROM assets WHERE scan_id=?"),
            sorted(r[0] for r in conn.execute("SELECT data->>'$.score' FROM assets WHERE scan_id=?", (scan_id,))))


def test_api_launcher_matches_cli_scan(client, demo_dir):
    cli = scanner.scan(demo_dir)
    r = client.post("/api/scans/start", json={"path": str(demo_dir)})
    assert r.status_code == 200 and r.json()["running"]
    st = _wait(client, r.json()["id"], lambda s: not s["running"])
    assert st["state"] == "done", st["error"]
    assert [s["stage"] for s in st["stages"]] == STAGES
    conn = db.connect()
    assert _counts(conn, st["scan_id"]) == _counts(conn, cli["scan_id"])
    conn.close()
    latest = client.get("/api/scans/latest").json()
    assert latest["scan"]["id"] == st["scan_id"] and latest["scan"]["target"] == str(demo_dir.resolve())


def test_status_reflects_real_stage_progress(client, demo_dir, monkeypatch):
    """Hold the pipeline after Detect: status must show exactly the stages completed so far, then finish."""
    gate, real = threading.Event(), scanner.scan

    def gated(*a, on_stage, **kw):
        def hook(ev):
            on_stage(ev)
            if ev["stage"] == "Detect":
                assert gate.wait(30)
        return real(*a, on_stage=hook, **kw)

    monkeypatch.setattr(jobs.scanner, "scan", gated)
    job = client.post("/api/scans/start", json={"path": str(demo_dir)}).json()
    mid = _wait(client, job["id"], lambda s: len(s["stages"]) >= 2)
    assert mid["running"] and [s["stage"] for s in mid["stages"]] == STAGES[:2]
    assert mid["stages"][0]["count"] > 0 and mid["stages"][1]["count"] > 0
    assert client.post("/api/scans/start", json={"path": str(demo_dir)}).status_code == 409
    gate.set()
    done = _wait(client, job["id"], lambda s: not s["running"])
    assert done["state"] == "done" and [s["stage"] for s in done["stages"]] == STAGES


@pytest.mark.parametrize("path", ["", "http://example.com/repo", "\\\\server\\share", "relative\\dir", "Z:\\no\\such\\dir"])
def test_launcher_rejects_bad_paths(client, path):
    r = client.post("/api/scans/start", json={"path": path})
    assert r.status_code == 400 and r.json()["detail"]


def test_launcher_rejects_file(client, demo_dir):
    f = next(p for p in demo_dir.rglob("*") if p.is_file())
    assert client.post("/api/scans/start", json={"path": str(f)}).status_code == 400
    assert client.get("/api/scans/99999/status").status_code == 404


def test_cmcs_present_and_in_range(scan_demo):
    conn = db.connect()
    rows = [r[0] for r in conn.execute("SELECT data FROM assets WHERE scan_id=?", (scan_demo[0]["scan_id"],))]
    conn.close()
    import json
    assert rows
    for d in map(json.loads, rows):
        c = d["breakdown"]["cmcs"]
        assert 1 <= c["score"] <= 10 and c["basis"]
        assert c["clamped"] or c["score"] == sum(t["value"] for t in c["components"])
        assert d["breakdown"]["mosca"]["y"] == -(-c["score"] // 2)  # Y derived from CMCS
