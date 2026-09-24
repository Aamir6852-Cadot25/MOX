import os
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

SCHEMA = """
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
CREATE TABLE IF NOT EXISTS audit(
  id INTEGER PRIMARY KEY, ts TEXT, actor TEXT, action TEXT, detail TEXT);
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS overrides(asset_key TEXT PRIMARY KEY, x INTEGER, criticality INTEGER);
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
    conn.executescript(SCHEMA)
    cols = {r["name"] for r in conn.execute("PRAGMA table_info(scans)")}
    if "stages" not in cols:
        conn.execute("ALTER TABLE scans ADD COLUMN stages TEXT")  # phase 8: pipeline stage events (JSON)
    if "net" not in cols:
        conn.execute("ALTER TABLE scans ADD COLUMN net TEXT")  # phase 11: socket connects during the scan (JSON)
    return conn
