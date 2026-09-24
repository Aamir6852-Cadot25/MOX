"""Signed attestation + sector view (SPEC section 11). Counts and proofs only: no paths, hosts, IPs or key material."""
import hashlib
import json
import random
import re
from datetime import datetime, timezone

from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey

from . import cbom, db
from .score import exposed

SCHEMA = "mox.attestation/v1"
SCANNER = f"mox {cbom.VERSION}"
SECTORS = {"power": "Power & Energy", "telecom": "Telecom", "government": "Government",  # NCIIPC critical sectors
           "banking": "Banking, Financial Services & Insurance", "transport": "Transport",
           "strategic": "Strategic & Public Enterprises"}
_RAW = serialization.Encoding.Raw, serialization.PublicFormat.Raw
_LEAK = [re.compile(p, re.I) for p in (
    r"[A-Za-z]:[\\/]", r"(^|[\s\"'=])\.{0,2}/[\w.-]+/", r"\\\\", r"\b\d{1,3}(\.\d{1,3}){3}\b",
    r"\b[a-z0-9-]+(\.[a-z0-9-]+)*\.(com|net|org|in|gov|mil|edu|io|local|lan|internal|corp)\b")]


def _canon(obj) -> bytes:
    return json.dumps(obj, sort_keys=True, separators=(",", ":")).encode()


def _ensure_tables(conn):
    conn.executescript("""
CREATE TABLE IF NOT EXISTS operator_keys(key_id TEXT PRIMARY KEY, pub TEXT, demo INTEGER);
CREATE TABLE IF NOT EXISTS attestations(
  id INTEGER PRIMARY KEY, sector TEXT, key_id TEXT, received_at TEXT, demo INTEGER, data TEXT);""")


def key_id_for(pub: Ed25519PublicKey) -> str:
    return "op-" + hashlib.sha256(pub.public_bytes(*_RAW)).hexdigest()[:8]


def operator_key() -> Ed25519PrivateKey:
    """Local operator key, generated on first use in data/keys/. The private key never leaves that file."""
    f = db.data_dir() / "keys" / "operator.ed25519"
    if not f.exists():
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_bytes(Ed25519PrivateKey.generate().private_bytes(
            serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
    return serialization.load_pem_private_key(f.read_bytes(), None)


def register_key(conn, pub: Ed25519PublicKey, demo=False) -> str:
    _ensure_tables(conn)
    kid = key_id_for(pub)
    conn.execute("INSERT OR REPLACE INTO operator_keys(key_id,pub,demo) VALUES(?,?,?)",
                 (kid, pub.public_bytes(*_RAW).hex(), int(demo)))
    conn.commit()
    return kid


def merkle_root(hashes: list[str]) -> str:
    level = sorted(hashes) or [hashlib.sha256(b"").hexdigest()]
    while len(level) > 1:
        if len(level) % 2:
            level.append(level[-1])
        level = [hashlib.sha256((level[i] + level[i + 1]).encode()).hexdigest() for i in range(0, len(level), 2)]
    return level[0]


def cbom_root(bom: dict) -> str:
    return merkle_root([hashlib.sha256(_canon(c)).hexdigest() for c in bom["components"]])


def stats(conn, scan_id: int) -> dict:
    """Aggregate counts for one scan (also used by `bench`)."""
    assets = [json.loads(r["data"]) for r in conn.execute("SELECT data FROM assets WHERE scan_id=?", (scan_id,))]
    qv = [a for a in assets if a["breakdown"]["quantum_vulnerable"]]
    v = {k: sum(1 for a in assets if a["verdict"] == k.upper()) for k in ("migrate", "contain", "accept")}
    return {"total": len(assets), "quantum_vulnerable": len(qv),
            "hndl_exposed": sum(1 for a in qv if exposed(a, "hndl")),
            "safe_or_out_of_scope": len(assets) - len(qv), "verdicts": v,
            "hybrid": sum(1 for a in assets if a["hybrid"])}


def readiness(assets: dict, verdicts: dict, planes: int) -> int:
    """0-100: penalised by HNDL exposure, quantum-vulnerable share and MIGRATE share; scaled by plane coverage."""
    n = assets["total"] or 1
    raw = 100 - (50 * assets["hndl_exposed"] + 30 * assets["quantum_vulnerable"] + 20 * verdicts["migrate"]) / n
    return max(0, min(100, round(raw * (0.8 + 0.2 * min(planes, 7) / 7))))


def sign(body: dict, key: Ed25519PrivateKey) -> dict:
    body = {k: v for k, v in body.items() if k != "signature"}
    body["signature"] = {"alg": "Ed25519", "key_id": key_id_for(key.public_key()),
                         "sig": key.sign(_canon(body)).hex()}
    return body


def verify(att: dict, conn) -> bool:
    _ensure_tables(conn)
    try:
        sig = att["signature"]
        row = conn.execute("SELECT pub FROM operator_keys WHERE key_id=?", (sig["key_id"],)).fetchone()
        if sig["alg"] != "Ed25519" or not row:
            return False
        body = {k: v for k, v in att.items() if k != "signature"}
        Ed25519PublicKey.from_public_bytes(bytes.fromhex(row["pub"])).verify(bytes.fromhex(sig["sig"]), _canon(body))
        return True
    except (KeyError, TypeError, ValueError, InvalidSignature):
        return False


def leaks(att: dict, forbidden=()) -> list[str]:
    """Strings in the attestation that look like a path, host or IP, or contain a known local path."""
    bad = []

    def walk(o, key=""):
        if isinstance(o, dict):
            for k, v in o.items():
                walk(v, k)
        elif isinstance(o, str) and key not in ("schema", "sig", "cbom_merkle_root"):
            if any(p.search(o) for p in _LEAK) or any(t and t in o for t in forbidden):
                bad.append(o)
    walk(att)
    return bad


def build(conn, scan_id: int, sector: str = "government") -> dict:
    """Build + sign an attestation from the latest scan. Raises ValueError if the self-check fails."""
    if sector not in SECTORS:
        raise ValueError(f"sector must be one of {', '.join(SECTORS)}")
    scan = conn.execute("SELECT * FROM scans WHERE id=?", (scan_id,)).fetchone()
    from .coverage import ran
    st, planes = stats(conn, scan_id), len(ran(scan))  # coverage = planes that ran, not planes that found something
    assets = {k: st[k] for k in ("total", "hndl_exposed", "quantum_vulnerable", "safe_or_out_of_scope")}
    key = operator_key()
    register_key(conn, key.public_key())
    body = {"schema": SCHEMA, "sector": sector, "scan_date": scan["started_at"][:10],
            "coverage": {"planes": planes, "files": scan["files_scanned"]}, "assets": assets,
            "verdicts": st["verdicts"], "readiness_index": readiness(assets, st["verdicts"], planes),
            "hybrid_pq_count": st["hybrid"], "cbom_merkle_root": cbom_root(cbom.build(conn, scan_id)),
            "scanner": SCANNER}
    att = sign(body, key)
    checks = self_check(conn, att, scan_id)
    if not all(c["ok"] for c in checks):
        raise ValueError("attestation self-check failed: " + "; ".join(c["name"] for c in checks if not c["ok"]))
    return att


def self_check(conn, att: dict, scan_id: int) -> list[dict]:
    forbidden = {r["file"] for r in conn.execute("SELECT DISTINCT file FROM findings WHERE scan_id=?", (scan_id,))}
    forbidden.add(conn.execute("SELECT target FROM scans WHERE id=?", (scan_id,)).fetchone()["target"])
    root_ok = att.get("cbom_merkle_root") == cbom_root(cbom.build(conn, scan_id))
    kid = att.get("signature", {}).get("key_id", "?")
    return [{"name": "Root re-derived from local CBOM", "ok": root_ok},
            {"name": "No field contains a path or host", "ok": not leaks(att, forbidden)},
            {"name": f"Signature verifies with {kid}", "ok": verify(att, conn)}]


# ---- sector view (simulated attestations) ----
_PROFILE = {  # sector: (operators, mean readiness, mean assets)
    "power": (9, 28, 190), "telecom": (6, 33, 260), "government": (8, 41, 150),
    "banking": (7, 52, 210), "transport": (4, 47, 120), "strategic": (3, 63, 90)}


def demo_attestations(conn, seed: int = 26164) -> int:
    """Replace demo data with simulated signed attestations for the 6 sectors. Ephemeral keys: private halves are discarded."""
    _ensure_tables(conn)
    conn.execute("DELETE FROM attestations WHERE demo=1")
    conn.execute("DELETE FROM operator_keys WHERE demo=1")
    rnd, n = random.Random(seed), 0
    for sector, (ops, idx, size) in _PROFILE.items():
        for i in range(ops):
            key = Ed25519PrivateKey.generate()
            total = max(20, int(rnd.gauss(size, size * .2)))
            qv = int(total * min(.9, max(.2, rnd.gauss(1 - idx / 120, .08))))
            hndl = int(qv * min(.9, max(.15, rnd.gauss(.62 - idx / 250, .07))))
            mig = int(qv * rnd.uniform(.6, .85))
            con = int((qv - mig) * rnd.uniform(.4, .8))
            assets = {"total": total, "hndl_exposed": hndl, "quantum_vulnerable": qv, "safe_or_out_of_scope": total - qv}
            verdicts = {"migrate": mig, "contain": con, "accept": total - mig - con}
            body = {"schema": SCHEMA, "sector": sector, "scan_date": f"2026-09-{rnd.randint(1, 23):02d}",
                    "coverage": {"planes": rnd.randint(5, 7), "files": rnd.randint(300, 4000)}, "assets": assets,
                    "verdicts": verdicts, "readiness_index": 0, "hybrid_pq_count": int(qv * idx / 600),
                    "cbom_merkle_root": hashlib.sha256(f"demo-{sector}-{i}-{seed}".encode()).hexdigest(),
                    "scanner": SCANNER}
            body["readiness_index"] = max(0, min(100, round(readiness(assets, verdicts, body["coverage"]["planes"])
                                                            + rnd.gauss(0, 3))))
            att = sign(body, key)
            register_key(conn, key.public_key(), demo=True)
            conn.execute("INSERT INTO attestations(sector,key_id,received_at,demo,data) VALUES(?,?,?,1,?)",
                         (sector, att["signature"]["key_id"], datetime.now(timezone.utc).isoformat(timespec="seconds"),
                          json.dumps(att)))
            n += 1
    conn.commit()
    return n


def sector_view(conn) -> dict:
    _ensure_tables(conn)
    rows = [(r["id"], json.loads(r["data"])) for r in conn.execute("SELECT id,data FROM attestations ORDER BY id")]
    good = [(i, a) for i, a in rows if verify(a, conn)]
    sectors = []
    for sid, name in SECTORS.items():
        mine = [a for _, a in good if a["sector"] == sid]
        if not mine:
            continue
        tot = sum(a["assets"]["total"] for a in mine)
        idx = round(sum(a["readiness_index"] for a in mine) / len(mine))
        hndl = sum(a["assets"]["hndl_exposed"] for a in mine)
        contain = sum(a["verdicts"]["contain"] for a in mine)
        sectors.append({"id": sid, "name": name, "operators": len({a["signature"]["key_id"] for a in mine}),
                        "attestations": len(mine), "readiness": idx, "hndl_exposed": hndl, "assets": tot,
                        "contain_share": round(100 * contain / tot) if tot else 0,
                        "hybrid": sum(a["hybrid_pq_count"] for a in mine),
                        "wave": 1 if idx < 35 else 2 if idx < 55 else 3})
    return {"demo": any(a for _, a in rows),
            "kpi": {"attestations": len(good), "rejected": len(rows) - len(good), "sectors": len(sectors),
                    "hndl_exposed": sum(s["hndl_exposed"] for s in sectors),
                    "leaks": sum(len(leaks(a)) for _, a in good)},
            "sectors": sectors,
            "ranking": sorted(({"sector": s["name"], "hndl_exposed": s["hndl_exposed"]} for s in sectors),
                              key=lambda r: -r["hndl_exposed"]),
            "feed": [{"key_id": a["signature"]["key_id"], "sector": a["sector"], "readiness": a["readiness_index"],
                      "root": a["cbom_merkle_root"], "ok": True} for _, a in reversed(good)][:8]}
