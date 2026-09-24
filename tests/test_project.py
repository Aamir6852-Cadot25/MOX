"""Phase 1 (v2): project entity, WAL mode, D3 criticality/shelf-life precedence."""
import sqlite3

from mox import db
from mox.analyze import analyze
from mox.score import criticality, score_asset, shelf_life

from conftest import scan_files


def F(**kw):
    base = dict(id=1, plane="code", algorithm="RSA", key_size=2048, file="misc/x.py", line=1, evidence="",
                fingerprint=None, confidence="high", detector="d", verify_first=0, nist_now="disallowed",
                nist_2030="disallowed", nist_2035="disallowed", quantum_vulnerable=1, nist_source="s", nist_notes="",
                meta="{}", mode=None, curve=None)
    base.update(kw)
    return base


def asset(*findings):
    from mox.correlate import correlate
    return correlate(list(findings))[0]


def test_wal_mode_is_on():
    conn = db.connect()
    assert conn.execute("PRAGMA journal_mode").fetchone()[0] == "wal"


def test_default_project_created_and_stable():
    conn = db.connect()
    first = db.ensure_default_project(conn)
    second = db.ensure_default_project(conn)
    assert first == second
    row = db.get_project(conn, first)
    assert row["name"] == "Default project"


def test_existing_scans_migrate_to_default_project(tmp_path):
    rows = scan_files(tmp_path, {"a.py": "x = 1\n"})
    conn = db.connect()
    scan_id = rows[0]["scan_id"] if rows else conn.execute("SELECT id FROM scans ORDER BY id DESC LIMIT 1").fetchone()[0]
    scan = conn.execute("SELECT project_id FROM scans WHERE id=?", (scan_id,)).fetchone()
    assert scan["project_id"] == db.ensure_default_project(conn)


def test_path_heuristic_has_no_signal_for_an_unclassified_path():
    """The heuristic returns None (no guess) rather than a default, so a project default can take over (D3)."""
    assert criticality(["misc/x.py"]) is None
    assert shelf_life(["misc/x.py"]) == (None, None)


def test_criticality_precedence_override_beats_heuristic_beats_project_beats_default():
    a = asset(F(file="auth/token.py"))  # path heuristic: 'auth' -> 3 (a strong signal)
    # No project setting, no override: path heuristic wins.
    assert score_asset(a)["breakdown"]["criticality"] == 3
    # A project default of 1 must not override a real path signal.
    assert score_asset(a, {"project_criticality": 1})["breakdown"]["criticality"] == 3
    # An explicit per-asset override outranks everything, even the path heuristic.
    assert score_asset(a, {"project_criticality": 1}, {"criticality": 2})["breakdown"]["criticality"] == 2

    b = asset(F(file="misc/x.py"))  # no path signal
    assert score_asset(b)["breakdown"]["criticality"] == 2  # hardcoded default, no project set
    assert score_asset(b, {"project_criticality": 3})["breakdown"]["criticality"] == 3  # project default wins
    assert score_asset(b, {"project_criticality": 3}, {"criticality": 1})["breakdown"]["criticality"] == 1  # override wins


def test_shelf_life_precedence_matches_criticality():
    a = asset(F(file="auth/token.py"))
    assert score_asset(a)["breakdown"]["mosca"]["x"] == 15  # path heuristic ('auth')
    assert score_asset(a, {"project_shelf_life": 3})["breakdown"]["mosca"]["x"] == 15  # heuristic still wins

    b = asset(F(file="misc/x.py"))
    assert score_asset(b)["breakdown"]["mosca"]["x"] == 7  # hardcoded default
    assert score_asset(b, {"project_shelf_life": 5})["breakdown"]["mosca"]["x"] == 5  # project default wins
    assert score_asset(b, override={"x": 1})["breakdown"]["mosca"]["x"] == 1  # override wins over everything


def test_analyze_reads_project_defaults_for_rescoring(tmp_path):
    conn = db.connect()
    cur = conn.execute(
        "INSERT INTO projects(name,sector,system_type,criticality,shelf_life_years,source_kind,source_ref,created_at)"
        " VALUES('Payments API','bfsi','service',3,15,'folder',NULL,'2026-01-01T00:00:00+00:00')")
    conn.commit()
    project_id = cur.lastrowid
    (tmp_path / "x.py").write_text("import hashlib\nhashlib.md5(b'x')\n", encoding="utf-8")
    from mox import scanner
    summary = scanner.scan(tmp_path, conn=conn, project_id=project_id)
    assets = analyze(summary["scan_id"], conn)
    assert assets and assets[0]["breakdown"]["criticality"] == 3
