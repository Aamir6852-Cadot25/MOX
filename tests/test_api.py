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
