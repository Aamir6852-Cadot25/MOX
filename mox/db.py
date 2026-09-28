import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

DEFAULT_PROJECT = "Default project"

SCHEMA = """
CREATE TABLE IF NOT EXISTS projects(
  id INTEGER PRIMARY KEY, name TEXT, sector TEXT, system_type TEXT, criticality INTEGER,
  shelf_life_years INTEGER, source_kind TEXT, source_ref TEXT, created_at TEXT);
CREATE TABLE IF NOT EXISTS scans(
  id INTEGER PRIMARY KEY, target TEXT, probe TEXT, started_at TEXT, seconds REAL,
  files_scanned INTEGER, planes_hit TEXT, findings_count INTEGER, probe_error TEXT);
CREATE TABLE IF NOT EXISTS findings(
  id INTEGER PRIMARY KEY, scan_id INTEGER REFERENCES scans(id), plane TEXT, algorithm TEXT,
  key_size INTEGER, mode TEXT, curve TEXT, file TEXT, line INTEGER, evidence TEXT, fingerprint TEXT,
  confidence TEXT, detector TEXT, verify_first INTEGER, nist_now TEXT, nist_2030 TEXT, nist_2035 TEXT,
  quantum_vulnerable INTEGER, nist_source TEXT, nist_notes TEXT, meta TEXT);
CREATE INDEX IF NOT EXISTS ix_findings_scan ON findings(scan_id);
CREATE TABLE IF NOT EXISTS assets(
  id INTEGER PRIMARY KEY, scan_id INTEGER, label TEXT, algorithm TEXT, key_size INTEGER,
  fingerprint TEXT, data TEXT);
CREATE TABLE IF NOT EXISTS asset_locations(
  id INTEGER PRIMARY KEY, asset_id INTEGER REFERENCES assets(id), finding_id INTEGER REFERENCES findings(id));
CREATE TABLE IF NOT EXISTS fixes(
  id INTEGER PRIMARY KEY, finding_id INTEGER, file TEXT, status TEXT, diff TEXT, backup TEXT,
  created_at TEXT, data TEXT);
CREATE TABLE IF NOT EXISTS scan_files(
  scan_id INTEGER, path TEXT, content TEXT, is_binary INTEGER,
  PRIMARY KEY(scan_id, path));
CREATE TABLE IF NOT EXISTS audit(
  id INTEGER PRIMARY KEY, ts TEXT, actor TEXT, action TEXT, detail TEXT);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS overrides(
  asset_key TEXT PRIMARY KEY, x INTEGER, criticality INTEGER, priority TEXT, owner TEXT, status TEXT, notes TEXT);
CREATE TABLE IF NOT EXISTS users(
  id INTEGER PRIMARY KEY, username TEXT UNIQUE, pw_hash TEXT, role TEXT, created_at TEXT);
"""


def data_dir() -> Path:
    return Path(os.environ.get("MOX_DATA") or ROOT / "data")


def db_path() -> Path:
    return Path(os.environ.get("MOX_DB") or data_dir() / "mox.db")


def connect(path=None, check_same_thread=True) -> sqlite3.Connection:
    """check_same_thread=False only for one-request connections whose setup and teardown FastAPI may run on
    different threadpool threads; such a connection is still used by one request at a time."""
    p = Path(path) if path else db_path()
    p.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(p, check_same_thread=check_same_thread)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.executescript(SCHEMA)
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(scans)")}
    if "stages" not in cols:
        conn.execute("ALTER TABLE scans ADD COLUMN stages TEXT")  # phase 8: pipeline stage events (JSON)
    if "net" not in cols:
        conn.execute("ALTER TABLE scans ADD COLUMN net TEXT")  # phase 11: socket connects during the scan (JSON)
    if "planes_run" not in cols:  # phase 16: coverage = planes that ran (not planes that found something)
        conn.execute("ALTER TABLE scans ADD COLUMN planes_run TEXT")
        conn.execute("ALTER TABLE scans ADD COLUMN planes_off TEXT")
    if "project_id" not in cols:  # phase 1 (v2): every scan belongs to a project; migrate old scans to the default
        conn.execute("ALTER TABLE scans ADD COLUMN project_id INTEGER")
        default_id = ensure_default_project(conn)
        conn.execute("UPDATE scans SET project_id=? WHERE project_id IS NULL", (default_id,))
    if "source_ref" not in cols:
        conn.execute("ALTER TABLE scans ADD COLUMN source_ref TEXT")
    override_cols = {r["name"] for r in conn.execute("PRAGMA table_info(overrides)")}
    for col, col_type in [("priority", "TEXT"), ("owner", "TEXT"), ("status", "TEXT"), ("notes", "TEXT")]:
        if col not in override_cols:
            conn.execute(f"ALTER TABLE overrides ADD COLUMN {col} {col_type}")
    conn.commit()
    return conn


def ensure_default_project(conn: sqlite3.Connection) -> int:
    """The project every scan belongs to until Phase 2's project picker assigns another one."""
    row = conn.execute("SELECT id FROM projects WHERE name=?", (DEFAULT_PROJECT,)).fetchone()
    if row:
        return row["id"]
    cur = conn.execute(
        "INSERT INTO projects(name,sector,system_type,criticality,shelf_life_years,source_kind,source_ref,created_at)"
        " VALUES(?,NULL,NULL,NULL,NULL,'folder',NULL,?)",
        (DEFAULT_PROJECT, datetime.now(timezone.utc).isoformat(timespec="seconds")))
    conn.commit()
    return cur.lastrowid


def get_project(conn: sqlite3.Connection, project_id: int | None) -> dict | None:
    if project_id is None:
        return None
    row = conn.execute("SELECT * FROM projects WHERE id=?", (project_id,)).fetchone()
    return dict(row) if row else None
