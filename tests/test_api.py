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
