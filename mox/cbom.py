"""CycloneDX 1.6 CBOM (SPEC section 10) + migration roadmap. Metadata only: no key material."""
import json
import uuid
from datetime import datetime, timezone

from cyclonedx.schema import SchemaVersion
from cyclonedx.validation.json import JsonStrictValidator

VERSION = "0.4.0"
_PRIMITIVE = {"RSA": "pke", "ECDSA": "signature", "EdDSA": "signature", "DSA": "signature", "ECDH": "key-agree",
              "DH": "key-agree", "X25519": "key-agree", "X25519MLKEM768": "kem", "ML-KEM": "kem", "ML-DSA": "signature",
              "MD5": "hash", "SHA-1": "hash", "SHA-256": "hash", "DES": "block-cipher", "3DES": "block-cipher",
              "AES": "block-cipher", "RC4": "stream-cipher"}
_MODES = {"ECB", "CBC", "GCM", "CCM", "CTR", "OFB", "CFB"}
WAVE_NAMES = ["Act now", "Plan", "Engineer agility", "Hybrid deploy", "Validate & attest"]
WAVE_GOALS = ["Critical assets: act first", "High exposure: plan and prepare", "Medium: engineer crypto-agility",
              "Low: deploy hybrid PQC", "Accepted / monitored: validate and attest"]


def _load(conn, scan_id):
    out = []
    for r in conn.execute("SELECT * FROM assets WHERE scan_id=? ORDER BY id", (scan_id,)):
        d = json.loads(r["data"])
        d["id"] = r["id"]
        d["findings"] = [dict(x) for x in conn.execute(
            "SELECT f.* FROM findings f JOIN asset_locations l ON l.finding_id=f.id WHERE l.asset_id=?"
            " ORDER BY f.file,f.line", (r["id"],))]
        out.append(d)
    return sorted(out, key=lambda a: -a["score"])


def _kinds(a):
    return {json.loads(f["meta"] or "{}").get("kind") for f in a["findings"]}


def _crypto(a) -> dict:
    alg, size, kinds = a["algorithm"], a["key_size"], _kinds(a)
    if "private_key" in kinds:
        rm = {"type": "private-key"}
        if size:
            rm["size"] = size
        return {"assetType": "related-crypto-material", "relatedCryptoMaterialProperties": rm}
    if "certificate" in kinds and alg in _PRIMITIVE:
        return {"assetType": "certificate", "certificateProperties": {"certificateFormat": "X.509"}}
    if alg.startswith(("TLSv", "SSLv")):
        return {"assetType": "protocol", "protocolProperties": {"type": "tls", "version": alg.split("v", 1)[1]}}
    ap = {"primitive": _PRIMITIVE.get(alg, "other")}
    f = a["findings"][0]
    if size and alg in _PRIMITIVE:
        ap["parameterSetIdentifier"] = str(size)
    if f.get("curve"):
        ap["curve"] = f["curve"]
    if f.get("mode") and f["mode"].lower() in {m.lower() for m in _MODES}:
        ap["mode"] = f["mode"].lower()
    if a["breakdown"]["quantum_vulnerable"]:
        ap["nistQuantumSecurityLevel"] = 0
    return {"assetType": "algorithm", "algorithmProperties": ap}


def _component(a) -> dict:
    f, b = a["findings"][0], a["breakdown"]
    props = {"nist_now": f["nist_now"], "nist_2030": f["nist_2030"], "nist_2035": f["nist_2035"], "score": a["score"],
             "tier": a["tier"], "verdict": a["verdict"], "wave": a["wave"], "confidence": b["confidence"], "evidence": b["evidence"],
             "locations": len(a["findings"])}
    return {"type": "cryptographic-asset", "bom-ref": f"mox-asset-{a['id']}", "name": a["label"],
            "cryptoProperties": _crypto(a),
            "properties": [{"name": f"mox:{k}", "value": str(v)} for k, v in props.items()]}


def build(conn, scan_id: int, version: int = 1) -> dict:
    scan = conn.execute("SELECT * FROM scans WHERE id=?", (scan_id,)).fetchone()
    assets = _load(conn, scan_id)
    return {"bomFormat": "CycloneDX", "specVersion": "1.6", "serialNumber": f"urn:uuid:{uuid.uuid4()}",
            "version": version,
            "metadata": {"timestamp": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                         "tools": {"components": [{"type": "application", "name": "MOX", "version": VERSION}]},
                         "component": {"type": "application", "bom-ref": "mox-target",
                                       "name": scan["target"].replace("\\", "/").rstrip("/").rsplit("/", 1)[-1]}},
            "components": [_component(a) for a in assets]}


def validate(bom: dict) -> list[str]:
    """Empty list = valid against the CycloneDX 1.6 JSON schema (strict)."""
    err = JsonStrictValidator(SchemaVersion.V1_6).validate_str(json.dumps(bom))
    return [] if err is None else [str(err)]


def roadmap(conn, scan_id: int) -> list[dict]:
    assets = _load(conn, scan_id)
    waves = []
    for i, name in enumerate(WAVE_NAMES, 1):
        mine = [a for a in assets if a["wave"] == i]
        waves.append({"wave": i, "name": name, "goal": WAVE_GOALS[i - 1], "count": len(mine),
                      "assets": [{"id": a["id"], "label": a["label"], "tier": a["tier"], "verdict": a["verdict"],
                                  "score": a["score"], "replacement": (a["replacements"][0]["to"] if a["replacements"] else None)}
                                 for a in mine]})
    return waves
