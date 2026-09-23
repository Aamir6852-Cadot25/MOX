import sqlite3

import pytest

from mox import demo_target, scanner


@pytest.fixture(autouse=True)
def _isolated_runtime(tmp_path, monkeypatch):
    monkeypatch.setenv("MOX_DATA", str(tmp_path / "data"))
    monkeypatch.setenv("MOX_DB", str(tmp_path / "data" / "mox.db"))


@pytest.fixture(scope="session")
def demo_dir(tmp_path_factory):
    return demo_target.build(tmp_path_factory.mktemp("demo") / "demo_target")


@pytest.fixture()
def scan_demo(demo_dir):
    summary = scanner.scan(demo_dir)
    from mox import db
    conn = db.connect()
    conn.row_factory = sqlite3.Row
    rows = [dict(r) for r in conn.execute("SELECT * FROM findings WHERE scan_id=?", (summary["scan_id"],))]
    conn.close()
    return summary, rows


def scan_files(tmp_path, files: dict):
    """Write {relpath: text} under tmp_path/src, scan it, return the finding rows."""
    from mox import db
    root = tmp_path / "src"
    for rel, text in files.items():
        p = root / rel
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(text, encoding="utf-8")
    summary = scanner.scan(root)
    conn = db.connect()
    rows = [dict(r) for r in conn.execute("SELECT * FROM findings WHERE scan_id=?", (summary["scan_id"],))]
    conn.close()
    return rows
