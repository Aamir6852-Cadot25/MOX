"""Project CRUD and validation (Phase 2 Project context form; the entity itself is Phase 1)."""
import pytest

from mox import db, projects


def test_create_validates_sector_criticality_and_shelf_life(tmp_path):
    conn = db.connect()
    with pytest.raises(ValueError, match="name"):
        projects.create(conn, "")
    with pytest.raises(ValueError, match="sector"):
        projects.create(conn, "Payments API", sector="nope")
    with pytest.raises(ValueError, match="criticality"):
        projects.create(conn, "Payments API", criticality=9)
    with pytest.raises(ValueError, match="shelf_life"):
        projects.create(conn, "Payments API", shelf_life_years=999)


def test_create_and_get_roundtrip():
    conn = db.connect()
    p = projects.create(conn, "Payments API", sector="bfsi", system_type="service",
                        criticality=3, shelf_life_years=15, source_kind="folder")
    assert p["name"] == "Payments API" and p["sector"] == "bfsi" and p["criticality"] == 3
    assert db.get_project(conn, p["id"])["shelf_life_years"] == 15


def test_update_merges_and_revalidates():
    conn = db.connect()
    p = projects.create(conn, "Old name", criticality=1)
    updated = projects.update(conn, p["id"], name="New name", criticality=2)
    assert updated["name"] == "New name" and updated["criticality"] == 2
    with pytest.raises(ValueError):
        projects.update(conn, p["id"], criticality=9)


def test_update_unknown_project_raises_keyerror():
    conn = db.connect()
    with pytest.raises(KeyError):
        projects.update(conn, 999999, name="x")


def test_list_all_orders_newest_first():
    conn = db.connect()
    a = projects.create(conn, "First")
    b = projects.create(conn, "Second")
    rows = projects.list_all(conn)
    ids = [r["id"] for r in rows]
    assert ids.index(b["id"]) < ids.index(a["id"])


def test_sectors_are_the_six_nciipc_names_plus_other():
    assert projects.SECTORS == ["power", "bfsi", "telecom", "transport", "government", "strategic", "other"]
    assert set(projects.SECTOR_LABEL) == set(projects.SECTORS)


def test_shelf_life_presets_match_the_scoring_heuristic():
    years = {label: y for _, label, y in projects.SHELF_LIFE_PRESETS}
    assert years == {"Session / token": 1, "Logs": 1, "Business records": 7, "Citizen / financial data": 15}
