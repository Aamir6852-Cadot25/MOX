"""Run correlation + scoring + verdicts for a scan and persist assets."""
import json
from pathlib import Path

from . import db
from .correlate import correlate
from .score import score_asset
from .verdict import decide


def _count(assets: list[dict], key: str, names) -> dict:
    return {n: sum(a[key] == n for a in assets) for n in names}


def analyze(scan_id: int, conn=None, settings: dict | None = None, overrides: dict | None = None,
            mark=None) -> list[dict]:
    """overrides: {asset_key: {"x": years, "criticality": 1|2|3}} (asset_key = fingerprint or plane:file:line:alg).
    mark(stage, count, detail): optional callback fired after Correlate, Score and Verdict finish."""
    own = conn is None
    conn = conn or db.connect()
    mark = mark or (lambda *a: None)
    root = conn.execute("SELECT target FROM scans WHERE id=?", (scan_id,)).fetchone()["target"]
    rows = [dict(r) for r in conn.execute("SELECT * FROM findings WHERE scan_id=?", (scan_id,))]
    conn.execute("DELETE FROM asset_locations WHERE asset_id IN (SELECT id FROM assets WHERE scan_id=?)", (scan_id,))
    conn.execute("DELETE FROM assets WHERE scan_id=?", (scan_id,))
    assets = correlate(rows, root if root and Path(root).is_dir() else None)
    mark("Correlate", len(assets), {"findings": len(rows), "assets": len(assets)})
    for a in assets:
        a.update(score_asset(a, settings, (overrides or {}).get(a["key"])))
    mark("Score", len(assets), _count(assets, "tier", ("Critical", "High", "Medium", "Low")))
    for a in assets:
        a.update(decide(a, a))
    mark("Verdict", len(assets), _count(assets, "verdict", ("MIGRATE", "CONTAIN", "ACCEPT")))
    out = []
    for a in assets:
        a["verify_first"] = all(f["confidence"] == "low" for f in a["findings"])
        data = {k: v for k, v in a.items() if k != "findings"}
        cur = conn.execute("INSERT INTO assets(scan_id,label,algorithm,key_size,fingerprint,data) VALUES(?,?,?,?,?,?)",
                           (scan_id, a["label"], a["algorithm"], a["key_size"], a["fingerprint"], json.dumps(data)))
        a["id"] = cur.lastrowid
        conn.executemany("INSERT INTO asset_locations(asset_id,finding_id) VALUES(?,?)",
                         [(a["id"], i) for i in a["finding_ids"]])
        out.append(a)
    conn.commit()
    if own:
        conn.close()
    return sorted(out, key=lambda a: -a["score"])
