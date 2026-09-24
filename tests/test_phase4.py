import shutil

import pytest
from fastapi.testclient import TestClient

from mox import auth, cbom, db
from mox.api import create_app
from mox.fixers import fix_text
from tests.conftest import scan_files


def _f(alg, file, line, size=None):
    return {"algorithm": alg, "file": file, "line": line, "key_size": size, "plane": "code"}


def test_fixers_are_text_safe():
    py = "import hashlib\nh = hashlib.md5(b'x')\ng = hashlib.sha1(b'y')\n"
    assert "hashlib.sha256(b'x')" in fix_text(_f("MD5", "a.py", 2), py)
    assert fix_text(_f("SHA-1", "a.py", 3), py).splitlines()[2] == "g = hashlib.sha256(b'y')"
    java = 'MessageDigest.getInstance("SHA-1");\nkpg.initialize(2048);\n'
    assert '"SHA-256"' in fix_text(_f("SHA-1", "A.java", 1), java)
    out = fix_text(_f("RSA", "A.java", 2, 2048), java)
    assert "initialize(3072);" in out and "interim: plan ML-DSA-65 hybrid" in out
    assert fix_text(_f("RSA", "a.py", 1, 4096), "x = 1\n") is None
    conf = ("server {\n    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;\n"
            "    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:AES128-SHA:DES-CBC3-SHA;\n}\n")
    new = fix_text({"algorithm": "TLSv1", "file": "n.conf", "line": 2, "key_size": None, "plane": "configs"}, conf)
    assert "ssl_protocols TLSv1.2;" in new and "DES-CBC3-SHA" not in new
    assert "ssl_ecdh_curve X25519MLKEM768:X25519;" in new


@pytest.fixture()
def client(demo_dir, tmp_path):
    work = tmp_path / "target"
    shutil.copytree(demo_dir, work)
    conn = db.connect()
    auth.create_user(conn, "admin", "correct-horse-1", "admin")
    conn.close()
    c = TestClient(create_app())
    c.post("/api/auth/login", json={"username": "admin", "password": "correct-horse-1"})
    c.post("/api/scans", json={"path": str(work)})
    c.work = work
    return c


def _finding(client, alg, file_part):
    for a in client.get("/api/assets").json():
        for f in client.get(f"/api/assets/{a['id']}").json()["findings"]:
            if f["algorithm"] == alg and file_part in f["file"]:
                return f


def test_fix_diff_and_rescan_clears_finding(client):
    f = _finding(client, "MD5", "auth/passwords.py")
    p = client.post("/api/fixes/preview", json={"finding_id": f["id"]}).json()
    assert "+    return hashlib.sha256(" in p["diff"] and p["status"] == "previewed"
    target = client.work / "auth" / "passwords.py"
    assert "md5" in target.read_text()  # preview writes nothing
    r = client.post(f"/api/fixes/{p['id']}/apply", json={"note": "ok"}).json()
    assert r["status"] == "cleared" and r["cleared"] is True
    assert "sha256" in target.read_text() and (client.work / "auth" / "passwords.py.bak").read_text().count("md5") == 1
    assert client.post(f"/api/fixes/{p['id']}/apply", json={}).status_code == 409
    actions = [a["action"] for a in client.get("/api/audit").json()]
    assert {"fix-preview", "fix-approve", "fix-apply", "fix-rescan"} <= set(actions)
    assert _finding(client, "MD5", "auth/passwords.py") is None


def test_unfixable_and_cbom_schema_valid(client):
    f = _finding(client, "RSA", "vendor/sync-agent.bin")
    assert client.post("/api/fixes/preview", json={"finding_id": f["id"]}).status_code == 422
    c = client.get("/api/cbom").json()
    assert c["valid"] is True, c["errors"]
    assert c["components"] == client.get("/api/scans/latest").json()["kpi"]["assets"]
    comp = c["bom"]["components"][0]
    assert comp["type"] == "cryptographic-asset" and any(p["name"] == "mox:verdict" for p in comp["properties"])
    assert "BEGIN" not in str(c["bom"])
    assert cbom.validate({"bomFormat": "CycloneDX"})  # invalid doc is rejected
    d = client.get("/api/cbom/download")
    assert d.status_code == 200 and "attachment" in d.headers["content-disposition"]


def test_roadmap_five_waves_cover_all_assets(client):
    rm = client.get("/api/roadmap").json()
    assert [w["wave"] for w in rm] == [1, 2, 3, 4, 5]
    assert sum(w["count"] for w in rm) == client.get("/api/scans/latest").json()["kpi"]["assets"]


def test_compliance_report_pdf(client):
    d = client.get("/api/report").json()
    assert d["counts"]["assets"] == len(d["findings"]) and sum(d["tiers"].values()) == d["counts"]["assets"]
    r = client.get("/api/report/download")
    assert r.status_code == 200 and r.content.startswith(b"%PDF-") and r.content.rstrip().endswith(b"%%EOF")
    assert len(r.content) > 2000
