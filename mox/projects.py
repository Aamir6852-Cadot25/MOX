"""Project entity: CRUD + the fixed vocabularies the Scan page's "Project context" form offers.

Sectors are NCIIPC's six critical-sector names (docs/research-notes.md), plus "other" for anything
outside them; criticality and shelf-life feed scoring per D3 (per-asset override > path heuristic >
project default > hardcoded default, wired in mox/score.py and mox/analyze.py in Phase 1).
"""
from datetime import datetime, timezone

from . import db

SECTORS = ["power", "bfsi", "telecom", "transport", "government", "strategic", "other"]
SECTOR_LABEL = {
    "power": "Power and Energy",
    "bfsi": "Banking, Financial Services and Insurance",
    "telecom": "Telecom",
    "transport": "Transport",
    "government": "Government",
    "strategic": "Strategic and Public Enterprises",
    "other": "Other",
}
CRITICALITY_MEANING = {
    1: "Low — internal tooling or test data; a breach is inconvenient, not dangerous",
    2: "Normal — most production systems; the default for anything not called out below",
    3: "Mission-critical — citizen data, payments, or infrastructure a debilitating impact would hurt",
}
# (id, label, years) — docs/MOX_V2_BUILD_PLAN.md Phase 2, matching mox/score.py's own X heuristic.
SHELF_LIFE_PRESETS = [
    ("session_token", "Session / token", 1),
    ("logs", "Logs", 1),
    ("business_records", "Business records", 7),
    ("citizen_financial", "Citizen / financial data", 15),
]


def validate(name: str, sector: str | None, criticality: int | None, shelf_life_years: int | None) -> None:
    if not (name or "").strip():
        raise ValueError("project name is required")
    if sector is not None and sector not in SECTORS:
        raise ValueError(f"sector must be one of {', '.join(SECTORS)}")
    if criticality is not None and criticality not in (1, 2, 3):
        raise ValueError("criticality must be 1, 2 or 3")
    if shelf_life_years is not None and not 0 <= shelf_life_years <= 50:
        raise ValueError("shelf_life_years must be 0-50")


def create(conn, name, sector=None, system_type=None, criticality=None, shelf_life_years=None,
           source_kind=None, source_ref=None) -> dict:
    validate(name, sector, criticality, shelf_life_years)
    cur = conn.execute(
        "INSERT INTO projects(name,sector,system_type,criticality,shelf_life_years,source_kind,source_ref,created_at)"
        " VALUES(?,?,?,?,?,?,?,?)",
        (name.strip(), sector, system_type, criticality, shelf_life_years, source_kind, source_ref,
         datetime.now(timezone.utc).isoformat(timespec="seconds")))
    conn.commit()
    return db.get_project(conn, cur.lastrowid)


def update(conn, project_id, name=None, sector=None, system_type=None, criticality=None,
           shelf_life_years=None) -> dict:
    row = db.get_project(conn, project_id)
    if not row:
        raise KeyError(project_id)
    merged = {
        "name": name if name is not None else row["name"],
        "sector": sector if sector is not None else row["sector"],
        "system_type": system_type if system_type is not None else row["system_type"],
        "criticality": criticality if criticality is not None else row["criticality"],
        "shelf_life_years": shelf_life_years if shelf_life_years is not None else row["shelf_life_years"],
    }
    validate(merged["name"], merged["sector"], merged["criticality"], merged["shelf_life_years"])
    conn.execute(
        "UPDATE projects SET name=?,sector=?,system_type=?,criticality=?,shelf_life_years=? WHERE id=?",
        (merged["name"].strip(), merged["sector"], merged["system_type"], merged["criticality"],
         merged["shelf_life_years"], project_id))
    conn.commit()
    return db.get_project(conn, project_id)


def list_all(conn) -> list[dict]:
    return [dict(r) for r in conn.execute("SELECT * FROM projects ORDER BY id DESC")]
