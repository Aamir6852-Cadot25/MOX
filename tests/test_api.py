import pytest
from fastapi.testclient import TestClient

from mox import auth, db
from mox.api import create_app


@pytest.fixture()
def client(demo_dir):
    conn = db.connect()
    auth.create_user(conn, "admin", "correct-horse-1", "admin")
    conn.close()
    c = TestClient(create_app())
    c.demo = str(demo_dir)
    return c


def login(c, pw="correct-horse-1"):
    return c.post("/api/auth/login", json={"username": "admin", "password": pw})


def test_requires_auth(client):
    for u in ("/api/assets", "/api/scans/latest", "/api/settings", "/api/audit", "/api/auth/me"):
        assert client.get(u).status_code == 401


def test_no_public_registration_and_role_not_from_request(client):
    r = client.post("/api/auth/register", json={"username": "x", "password": "y" * 9, "role": "admin"})
    assert r.status_code in (404, 405)
    r = client.post("/api/auth/login", json={"username": "admin", "password": "correct-horse-1", "role": "root"})
    assert r.json()["role"] == "admin"
    conn = db.connect()
    assert conn.execute("SELECT COUNT(*) FROM users").fetchone()[0] == 1
    assert conn.execute("SELECT pw_hash FROM users").fetchone()[0].startswith("$argon2id$")


def test_login_audited_and_cookie_httponly(client):
    assert login(client, "wrong-password").status_code == 401
    r = login(client)
    assert r.status_code == 200 and "httponly" in r.headers["set-cookie"].lower()
    actions = [a["action"] for a in client.get("/api/audit").json()]
    assert "login-failed" in actions and "login-ok" in actions


def test_scan_assets_and_settings(client):
    login(client)
    assert client.get("/api/scans/latest").json() == {"scan": None}
    s = client.post("/api/scans", json={"path": client.demo}).json()
    assert s["assets"] > 0
    summ = client.get("/api/scans/latest").json()
    assert summ["kpi"]["assets"] == s["assets"] and sum(summ["verdicts"].values()) == s["assets"]
    lst = client.get("/api/assets").json()
    assert lst == sorted(lst, key=lambda a: -a["score"])
    gw = next(a for a in lst if a["label"].endswith("api-gw.key"))
    assert gw["primary_location"] and gw["primary_location"].split(":")[0] in gw["files"]
    d = client.get(f"/api/assets/{gw['id']}").json()
    assert len(d["findings"]) > 1 and "→ 1 asset" in d["summary"]
    assert "BEGIN" not in str(d)
    before = d["breakdown"]["mosca"]["exposure"]
    client.put("/api/settings", json={"threat_horizon": 20})
    after = next(a for a in client.get("/api/assets").json() if a["label"] == gw["label"])
    assert after["breakdown"]["mosca"]["exposure"] == before - 10
    o = client.put(f"/api/assets/{after['id']}/override", json={"criticality": 1}).json()
    assert o["breakdown"]["criticality"] == 1
    assert client.post("/api/scans", json={"path": "Z:/nope"}).status_code == 400


def test_browse_lists_subdirectories(client, tmp_path):
    assert client.get("/api/browse").status_code == 401  # unauthenticated
    login(client)
    root = tmp_path / "browse-root"
    (root / "alpha").mkdir(parents=True)
    (root / "beta").mkdir()
    (root / "afile.txt").write_text("x")
    r = client.get("/api/browse", params={"path": str(root)}).json()
    assert r["error"] is None
    assert [d["name"] for d in r["dirs"]] == ["alpha", "beta"]
    assert r["dirs"][0]["path"] == str(root / "alpha")
    assert r["parent"] == str(root.parent)
    into_alpha = client.get("/api/browse", params={"path": r["dirs"][0]["path"]}).json()
    assert into_alpha["dirs"] == [] and into_alpha["error"] is None
    missing = client.get("/api/browse", params={"path": str(root / "nope")}).json()
    assert missing["error"] == "path does not exist"


def test_urgent_asset_has_algorithm_and_location(client):
    """Dashboard's "Most urgent: <algorithm> <file:line>" line reads these two fields off the
    highest-exposure overdue asset (or, if none is overdue, the highest score) - regression for a
    blank gap when an asset's location data was missing."""
    login(client)
    client.post("/api/scans", json={"path": client.demo})
    assets = client.get("/api/assets").json()
    overdue = [a for a in assets if (a["breakdown"]["mosca"]["exposure"] or 0) > 0]
    urgent = max(overdue, key=lambda a: a["breakdown"]["mosca"]["exposure"]) if overdue \
        else max(assets, key=lambda a: a["score"])
    assert urgent["algorithm"]
    location = urgent["primary_location"] or (urgent["files"][0] if urgent["files"] else None) or urgent["label"]
    assert location
    line = f"Most urgent: {urgent['algorithm']} {location}"
    assert line.strip() and not line.endswith(" ") and ",  " not in f"{line}, "


def test_discover_type_counts_match_the_cbom(client):
    """Discover's artefact-type counts come from the CBOM classifier, so the two screens always agree."""
    login(client)
    client.post("/api/scans", json={"path": client.demo})
    by_type = client.get("/api/scans/latest").json()["by_type"]
    comps = client.get("/api/cbom").json()["bom"]["components"]
    assert sum(by_type.values()) == len(comps)
    types = [c["cryptoProperties"]["assetType"] for c in comps]
    assert by_type["certificates"] == types.count("certificate")
    assert by_type["keys"] == types.count("related-crypto-material")
    assert by_type["protocols"] == types.count("protocol")
    assert by_type["algorithms"] + by_type["libraries"] == types.count("algorithm")
    assert by_type["keys"] >= 1 and by_type["libraries"] >= 1


def test_history_and_reference_endpoints(client):
    login(client)
    client.post("/api/scans", json={"path": client.demo})
    history = client.get("/api/scans/history").json()
    assert len(history) >= 1
    assert history[0]["target"]
    assert history[0]["findings_count"] >= 1
    ref = client.get("/api/reference").json()
    assert "algorithms" in ref
    assert "RSA" in ref["algorithms"]


def test_file_view_endpoint(client):
    assert client.get("/api/file?path=payments/Crypto.java").status_code == 401
    login(client)
    # 404 if no scan yet
    assert client.get("/api/file?path=payments/Crypto.java").status_code == 404
    client.post("/api/scans", json={"path": client.demo})
    # valid file inside demo_dir
    r = client.get("/api/file?path=payments/Crypto.java&line=16")
    assert r.status_code == 200
    data = r.json()
    assert data["line"] == 16
    assert data["total_lines"] > 0
    assert "public class Crypto" in data["content"]
    assert any("DES/CBC/PKCS5Padding" in l for l in data["lines"])
    # path traversal attempt should be 403
    assert client.get("/api/file?path=../../setup.py").status_code == 403
    # non-existent file
    assert client.get("/api/file?path=nonexistent.java").status_code == 404
