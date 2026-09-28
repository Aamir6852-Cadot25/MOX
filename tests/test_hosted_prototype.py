import os
import pytest
from mox import db, scanner, source, tls_policy
from test_phase10 import client, _wait  # noqa: F401


def test_folder_upload_preserves_relative_paths(client, tmp_path):
    files = [
        ("my_project/src/auth.py", b"import hashlib\nhashlib.md5(b'1')\n"),
        ("my_project/src/crypto.py", b"import hashlib\nhashlib.sha1(b'2')\n"),
    ]
    r = client.post("/api/scans/upload", data={"source": "folder"},
                    files=[("files", (name, content, "text/plain")) for name, content in files])
    assert r.status_code == 200
    st = _wait(client, r.json()["id"], lambda s: not s["running"])
    assert st["state"] == "done"
    assert st["result"]["findings"] >= 2
    # Verify file content is retrievable via /api/file
    f_res = client.get(f"/api/file?scan_id={st['scan_id']}&path=src/auth.py&line=1")
    assert f_res.status_code == 200
    assert "hashlib.md5" in f_res.json()["content"]


def test_tls_policy_blocks_private_when_hosted(monkeypatch):
    monkeypatch.setenv("PORT", "8000")
    with pytest.raises(ValueError, match="blocked on this hosted prototype"):
        tls_policy.check("127.0.0.1", authorized=True)
    with pytest.raises(ValueError, match="blocked on this hosted prototype"):
        tls_policy.check("localhost", authorized=True)
    # Public host with authorization allowed
    tls_policy.check("8.8.8.8", authorized=True)


def test_history_shows_clean_target_name(client):
    hist = client.get("/api/scans/history").json()
    assert isinstance(hist, list)
    for h in hist:
        assert "mox-scan-" not in (h.get("target") or "")
