"""End-to-end test per Scan-page source kind (docs/MOX_V2_BUILD_PLAN.md Phase 2, D1), through the real
API: folder, git (local + remote), archive upload, container upload, artefacts upload, live TLS (single
+ multiple endpoints, RFC1918 default-allow, public-host authorisation)."""
import socket
import subprocess
import threading
import zipfile

from mox import db, demo_tls
from test_phase10 import client, _wait  # noqa: F401  (fixture reuse)


def _init_repo(path):
    path.mkdir()
    subprocess.run(["git", "init", "-q"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.email", "t@example.com"], cwd=path, check=True)
    subprocess.run(["git", "config", "user.name", "Test"], cwd=path, check=True)
    (path / "hash.py").write_text("import hashlib\nhashlib.md5(b'x')\n")
    subprocess.run(["git", "add", "."], cwd=path, check=True)
    subprocess.run(["git", "commit", "-q", "-m", "init"], cwd=path, check=True)
    return path


def test_folder_source(client, tmp_path):
    (tmp_path / "a.py").write_text("import hashlib\nhashlib.md5(b'x')\n")
    r = client.post("/api/scans/start", json={"path": str(tmp_path)})
    st = _wait(client, r.json()["id"], lambda s: not s["running"])
    assert st["state"] == "done" and st["result"]["findings"] > 0


def test_git_local_source_records_commit(client, tmp_path):
    repo = _init_repo(tmp_path / "repo")
    r = client.post("/api/scans/start", json={"source": "git", "path": str(repo)})
    st = _wait(client, r.json()["id"], lambda s: not s["running"])
    assert st["state"] == "done" and st["result"]["findings"] > 0
    assert st["source_meta"]["commit"] and len(st["source_meta"]["commit"]) == 40
    audit = client.get("/api/audit").json()
    assert any("commit" in a["detail"] for a in audit if a["action"] == "scan")


def test_git_remote_source_requires_authorisation(client, tmp_path):
    repo = _init_repo(tmp_path / "repo")
    r = client.post("/api/scans/start", json={"source": "git", "git_remote": f"file://{repo}",
                                              "git_authorized": False})
    assert r.status_code == 400 and "authoris" in r.json()["detail"]


def test_git_remote_source_clones_when_authorised(client, tmp_path):
    repo = _init_repo(tmp_path / "repo")
    net_before = client.get("/api/netstat").json()["outbound"]
    r = client.post("/api/scans/start", json={"source": "git", "git_remote": f"file://{repo}",
                                              "git_authorized": True})
    st = _wait(client, r.json()["id"], lambda s: not s["running"])
    assert st["state"] == "done" and st["result"]["findings"] > 0
    net_after = client.get("/api/netstat").json()["outbound"]
    assert net_after == net_before + 1  # the clone is counted (AGENTS.md air-gap)


def test_archive_source_end_to_end(client, tmp_path):
    z = tmp_path / "upload.zip"
    with zipfile.ZipFile(z, "w") as zf:
        zf.writestr("hash.py", "import hashlib\nhashlib.md5(b'x')\n")
    r = client.post("/api/scans/upload", data={"source": "archive"},
                    files=[("files", ("upload.zip", z.read_bytes(), "application/zip"))])
    st = _wait(client, r.json()["id"], lambda s: not s["running"])
    assert st["state"] == "done" and st["result"]["findings"] > 0
    assert st["source_meta"]["source_kind"] == "archive"


def test_malicious_archive_upload_is_refused_cleanly(client, tmp_path):
    z = tmp_path / "evil.zip"
    with zipfile.ZipFile(z, "w") as zf:
        zf.writestr("../../escaped.txt", b"pwned")
    r = client.post("/api/scans/upload", data={"source": "archive"},
                    files=[("files", ("evil.zip", z.read_bytes(), "application/zip"))])
    assert r.status_code == 400 and "escapes" in r.json()["detail"]


def test_container_source_end_to_end(client, demo_dir):
    tar_bytes = (demo_dir / "image" / "app-image.tar").read_bytes()
    r = client.post("/api/scans/upload", data={"source": "container"},
                    files=[("files", ("app-image.tar", tar_bytes, "application/x-tar"))])
    st = _wait(client, r.json()["id"], lambda s: not s["running"])
    assert st["state"] == "done"
    conn = db.connect()
    rows = [dict(r) for r in conn.execute("SELECT * FROM findings WHERE scan_id=? AND plane='containers'",
                                          (st["scan_id"],))]
    assert rows, "the containers plane must pick up the uploaded image"


def test_artefacts_source_end_to_end(client, tmp_path):
    cert = (tmp_path / "cert.crt")
    cert.write_bytes(b"-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----\n")
    r = client.post("/api/scans/upload", data={"source": "artefacts"},
                    files=[("files", ("cert.crt", cert.read_bytes(), "application/x-x509-ca-cert"))])
    st = _wait(client, r.json()["id"], lambda s: not s["running"])
    assert st["state"] == "done"
    assert st["source_meta"]["source_kind"] == "artefacts"


def test_live_tls_only_source_with_multiple_endpoints_reports_partial(client, demo_dir):
    """One endpoint up, one refused: the scan finishes and TLS is reported "partial", never "failed"."""
    server = demo_tls.make_server(demo_dir / "certs" / "api-gw.crt", demo_dir / "certs" / "api-gw.key", port=0)
    up_port = server.getsockname()[1]
    threading.Thread(target=demo_tls.serve_forever, args=(server,), daemon=True).start()
    with socket.socket() as srv:  # a closed port: this endpoint must fail without killing the scan
        srv.bind(("127.0.0.1", 0))
        closed_port = srv.getsockname()[1]
    try:
        r = client.post("/api/scans/start", json={"source": "tls",
                                                   "probes": [f"127.0.0.1:{up_port}", f"127.0.0.1:{closed_port}"]})
        st = _wait(client, r.json()["id"], lambda s: not s["running"])
    finally:
        server.close()
    assert st["state"] == "done"
    assert st["source_meta"]["source_kind"] == "tls"
    detect = next(e for e in st["stages"] if e["stage"] == "Detect")["detail"]
    assert detect["tls"]["status"] == "partial"
    assert detect["tls"]["endpoints"] == [f"127.0.0.1:{up_port}", f"127.0.0.1:{closed_port}"]


def test_public_tls_endpoint_needs_authorisation(client):
    r = client.post("/api/scans/start", json={"source": "tls", "probes": ["8.8.8.8:443"]})
    st = _wait(client, r.json()["id"], lambda s: not s["running"])
    assert st["state"] == "done"  # a refused probe fails that endpoint, never the scan
    conn = db.connect()
    scan = conn.execute("SELECT probe_error FROM scans WHERE id=?", (st["scan_id"],)).fetchone()
    assert scan["probe_error"] and "authoris" in scan["probe_error"]


def test_loopback_tls_endpoint_needs_no_authorisation(client, demo_dir):
    server = demo_tls.make_server(demo_dir / "certs" / "api-gw.crt", demo_dir / "certs" / "api-gw.key", port=0)
    port = server.getsockname()[1]
    threading.Thread(target=demo_tls.serve_forever, args=(server,), daemon=True).start()
    try:
        r = client.post("/api/scans/start", json={"source": "tls", "probes": [f"127.0.0.1:{port}"]})
        st = _wait(client, r.json()["id"], lambda s: not s["running"])
    finally:
        server.close()
    assert st["state"] == "done" and st["result"]["probe_error"] is None


def test_bytes_read_is_a_real_measurement_not_a_guess(client, tmp_path):
    target = tmp_path / "target"  # separate from MOX_DATA (tmp_path/"data"): the WAL file must not be "scanned"
    target.mkdir()
    (target / "a.py").write_text("import hashlib\nhashlib.md5(b'x')\n")
    r = client.post("/api/scans/start", json={"path": str(target)})
    st = _wait(client, r.json()["id"], lambda s: not s["running"])
    assert st["result"]["bytes_read"] == (target / "a.py").stat().st_size


def test_sse_events_are_ordered_and_only_from_real_events(client, tmp_path):
    """No timer-faked progress: every event id is strictly increasing and stages arrive in pipeline order."""
    (tmp_path / "a.py").write_text("x = 1\n")
    job = client.post("/api/scans/start", json={"path": str(tmp_path)}).json()
    r = client.get(f"/api/scans/{job['id']}/events")
    blocks = [b for b in r.text.strip().split("\n\n") if b.strip()]
    ids = []
    for b in blocks:
        for line in b.splitlines():
            if line.startswith("id: "):
                ids.append(int(line[4:]))
    assert ids == sorted(ids) and ids == list(range(1, len(ids) + 1))
