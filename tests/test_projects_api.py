"""/api/projects (Phase 2 Project context form): CRUD, validation, and the fixed vocab endpoint."""
from test_phase10 import client  # noqa: F401  (fixture reuse)


def test_meta_lists_sectors_criticality_and_shelf_life_presets(client):
    meta = client.get("/api/projects/meta").json()
    assert set(meta["sectors"]) == {"power", "bfsi", "telecom", "transport", "government", "strategic", "other"}
    assert set(meta["criticality"].keys()) == {"1", "2", "3"}
    assert len(meta["shelf_life_presets"]) == 4


def test_create_list_and_update_project(client):
    p = client.post("/api/projects", json={"name": "Payments API", "sector": "bfsi", "system_type": "service",
                                            "criticality": 3, "shelf_life_years": 15}).json()
    assert p["name"] == "Payments API" and p["criticality"] == 3
    rows = client.get("/api/projects").json()
    assert any(r["id"] == p["id"] for r in rows)
    updated = client.put(f"/api/projects/{p['id']}", json={"criticality": 2}).json()
    assert updated["criticality"] == 2 and updated["name"] == "Payments API"


def test_create_rejects_bad_sector_and_criticality(client):
    assert client.post("/api/projects", json={"name": "X", "sector": "nope"}).status_code == 422
    assert client.post("/api/projects", json={"name": "X", "criticality": 9}).status_code == 422


def test_update_unknown_project_404s(client):
    assert client.put("/api/projects/999999", json={"name": "x"}).status_code == 404


def test_project_writes_are_audited(client):
    client.post("/api/projects", json={"name": "Audited project"})
    audit = client.get("/api/audit").json()
    assert any(a["action"] == "project-create" and "Audited project" in a["detail"] for a in audit)


def test_scan_uses_the_chosen_projects_criticality_for_an_unclassified_path(client, tmp_path):
    p = client.post("/api/projects", json={"name": "High crit project", "criticality": 3}).json()
    (tmp_path / "misc.py").write_text("import hashlib\nhashlib.md5(b'x')\n")
    from test_phase10 import _wait
    r = client.post("/api/scans/start", json={"path": str(tmp_path), "project_id": p["id"]})
    st = _wait(client, r.json()["id"], lambda s: not s["running"])
    assert st["state"] == "done"
    assets = client.get("/api/assets").json()
    assert assets and assets[0]["breakdown"]["criticality"] == 3
