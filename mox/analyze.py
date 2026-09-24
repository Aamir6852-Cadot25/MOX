"""Run correlation + scoring + verdicts for a scan and persist assets."""
import json
from pathlib import Path

from . import db, nist
from .correlate import _meta, correlate
from .score import score_asset
from .verdict import decide


def _count(assets: list[dict], key: str, names) -> dict:
    return {n: sum(a[key] == n for a in assets) for n in names}


def _size_key_transport(conn, asset: dict) -> None:
    """A static-RSA cipher suite (mode key-transport) transports session keys under the certificate's own RSA key.
    The config line has no size, so take it from the parsed RSA key it was correlated to and re-rate it, instead of
    scoring it 'unknown'. The finding row is updated so every screen and export shows the same status."""
    keys = [f for f in asset["findings"] if f["algorithm"] == "RSA" and f["fingerprint"] and f["key_size"]]
    if not keys:
        return
    size = keys[0]["key_size"]
    for f in asset["findings"]:
        if f["algorithm"] == "RSA" and f.get("mode") == "key-transport" and not f["key_size"]:
            n = nist.lookup("RSA", size)
            meta = dict(_meta(f), key_size_from=f"SPKI of {keys[0]['file']}")
            f.update(key_size=size, nist_now=n["now"], nist_2030=n["after_2030"], nist_2035=n["after_2035"],
                     nist_source=n["source"], nist_notes=n["notes"], meta=json.dumps(meta))
            conn.execute("UPDATE findings SET key_size=?, nist_now=?, nist_2030=?, nist_2035=?, nist_source=?, "
                         "nist_notes=?, meta=? WHERE id=?", (size, n["now"], n["after_2030"], n["after_2035"],
                                                            n["source"], n["notes"], f["meta"], f["id"]))


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
    for a in assets:
        _size_key_transport(conn, a)
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
