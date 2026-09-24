import json

from mox import db


def test_stage_events_are_timed_and_consistent(scan_demo):
    summary, rows = scan_demo
    conn = db.connect()
    stages = json.loads(conn.execute("SELECT stages FROM scans WHERE id=?", (summary["scan_id"],)).fetchone()[0])
    n_assets = conn.execute("SELECT COUNT(*) FROM assets WHERE scan_id=?", (summary["scan_id"],)).fetchone()[0]
    conn.close()
    by = {s["stage"]: s for s in stages}
    assert [s["stage"] for s in stages] == ["Ingest", "Detect", "Correlate", "Score", "Verdict"]
    ts = [s["t_ms"] for s in stages]
    assert all(a < b for a, b in zip(ts, ts[1:])) and all(s["ms"] >= 0 for s in stages)
    assert by["Detect"]["count"] == sum(p["findings"] for p in by["Detect"]["detail"].values()) == len(rows)
    assert by["Correlate"]["detail"] == {"findings": len(rows), "assets": n_assets} and by["Correlate"]["count"] == n_assets
    assert sum(by["Verdict"]["detail"].values()) == sum(by["Score"]["detail"].values()) == n_assets
