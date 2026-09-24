"""Phase 11: SSE scan stream, per-plane Detect detail, plane toggles, air-gap socket counter."""
import json
import socket

import pytest

from mox import db, netguard, scanner
from test_phase10 import STAGES, _wait, client  # noqa: F401  (fixture reuse)

PLANES = [p.NAME for p in scanner.ALL_PLANES]


def _sse(text):
    events = []
    for block in text.strip().split("\n\n"):
        ev = dict(line.split(": ", 1) for line in block.splitlines() if not line.startswith(":"))
        if ev:
            events.append({"id": int(ev["id"]), "type": ev["event"], "data": json.loads(ev["data"])})
    return events


def test_sse_streams_progress_stages_and_done(client, demo_dir):
    job = client.post("/api/scans/start", json={"path": str(demo_dir)}).json()
    r = client.get(f"/api/scans/{job['id']}/events")
    assert r.status_code == 200 and r.headers["content-type"].startswith("text/event-stream")
    evs = _sse(r.text)
    assert [e["id"] for e in evs] == list(range(1, len(evs) + 1))
    assert [e["data"]["stage"] for e in evs if e["type"] == "stage"] == STAGES
    assert evs[-1]["type"] == "done" and evs[-1]["data"]["net"]["outbound"] == 0
    prog = [e["data"] for e in evs if e["type"] == "progress"]
    assert prog, "Detect must stream per-plane progress"
    last = prog[-1]
    assert all(p["done"] == p["total"] for p in last.values())
    # progress arrives between Ingest and Detect, never after Detect
    kinds = [e["type"] if e["type"] != "stage" else e["data"]["stage"] for e in evs]
    assert kinds.index("Ingest") < kinds.index("progress") and max(
        i for i, k in enumerate(kinds) if k == "progress") < kinds.index("Detect")
    # replay from Last-Event-ID resumes after that event
    again = _sse(client.get(f"/api/scans/{job['id']}/events", headers={"Last-Event-ID": "2"}).text)
    assert again[0]["id"] == 3 and again[-1]["type"] == "done"


def test_sse_unknown_job_404(client):
    assert client.get("/api/scans/9999/events").status_code == 404


def test_detect_detail_reports_all_seven_planes(demo_dir):
    s = scanner.scan(demo_dir)
    conn = db.connect()
    stages = json.loads(conn.execute("SELECT stages FROM scans WHERE id=?", (s["scan_id"],)).fetchone()[0])
    conn.close()
    detect = next(e for e in stages if e["stage"] == "Detect")["detail"]
    ingest = next(e for e in stages if e["stage"] == "Ingest")["detail"]
    assert list(detect) == PLANES
    assert detect["tls"]["status"] == "off"  # no probe: the only socket-capable plane never ran
    assert sum(p["findings"] for p in detect.values()) == s["findings"]
    for name, p in detect.items():
        assert p["files"] == ingest["planes"].get(name, 0)
        assert p["status"] in ("ok", "idle", "off", "partial", "failed")


def test_plane_toggle_skips_disabled_planes(demo_dir):
    s = scanner.scan(demo_dir, planes={"certificates"})
    assert set(s["planes"]) <= {"certificates"} and s["findings"] > 0


def test_failed_probe_is_a_failed_segment(demo_dir):
    with socket.socket() as srv:  # grab a free port, then close it so the probe is refused
        srv.bind(("127.0.0.1", 0))
        port = srv.getsockname()[1]
    s = scanner.scan(demo_dir, probe=f"127.0.0.1:{port}")
    conn = db.connect()
    stages = json.loads(conn.execute("SELECT stages FROM scans WHERE id=?", (s["scan_id"],)).fetchone()[0])
    conn.close()
    tls = next(e for e in stages if e["stage"] == "Detect")["detail"]["tls"]
    assert tls["status"] == "failed" and "failed" in tls["error"]


def test_bad_plane_and_probe_rejected(client, demo_dir):
    assert client.post("/api/scans/start", json={"path": str(demo_dir), "planes": ["nope"]}).status_code == 400
    assert client.post("/api/scans/start", json={"path": str(demo_dir), "probe": "http://x"}).status_code == 400


def test_netguard_counts_outbound_separately_from_loopback():
    netguard.install()
    before = netguard.counts()
    for addr in (("127.0.0.1", 9), ("192.0.2.1", 9)):  # 192.0.2.0/24 is TEST-NET: never routed
        with socket.socket() as s:
            s.setblocking(False)
            s.connect_ex(addr)
    after = netguard.counts()
    assert after["loopback"] - before["loopback"] == 1
    assert after["outbound"] - before["outbound"] == 1


def test_netstat_derives_socket_planes_from_source(client):
    d = client.get("/api/netstat").json()
    assert d["installed"]
    by = {p["plane"]: p for p in d["planes"]}
    assert list(by) == PLANES
    assert [n for n, p in by.items() if p["opens_socket"]] == ["tls"]
    assert set(by["tls"]["imports"]) >= {"socket", "ssl"}


@pytest.mark.parametrize("host", ["localhost", "::1", "127.0.0.5"])
def test_loopback_classification(host):
    assert netguard._is_loopback((host, 1))
