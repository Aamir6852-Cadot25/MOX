"""Run correlation + scoring + verdicts for a scan and persist assets."""
import json
from pathlib import Path

from . import db
from .correlate import correlate
from .score import score_asset
from .verdict import decide


def analyze(scan_id: int, conn=None, settings: dict | None = None, overrides: dict | None = None) -> list[dict]:
    """overrides: {asset_key: {"x": years, "criticality": 1|2|3}} (asset_key = fingerprint or plane:file:line:alg)."""
    own = conn is None
    conn = conn or db.connect()
    root = conn.execute("SELECT target FROM scans WHERE id=?", (scan_id,)).fetchone()["target"]
    rows = [dict(r) for r in conn.execute("SELECT * FROM findings WHERE scan_id=?", (scan_id,))]
    conn.execute("DELETE FROM asset_locations WHERE asset_id IN (SELECT id FROM assets WHERE scan_id=?)", (scan_id,))
    conn.execute("DELETE FROM assets WHERE scan_id=?", (scan_id,))
    out = []
    for a in correlate(rows, root if root and Path(root).is_dir() else None):
        sc = score_asset(a, settings, (overrides or {}).get(a["key"]))
        a.update(sc, **decide(a, sc))
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
