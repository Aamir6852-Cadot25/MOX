"""Three separate numbers per asset (docs/SCORING.md): risk score, Mosca exposure, CMCS. Never conflated.

Every function returns its components, not just a total, so the UI can print the arithmetic row by row.
"""
import math
import re

from .correlate import _meta
from .nist import cite

DEFAULTS = {"threat_horizon": 10}

# ── risk score terms (docs/SCORING.md §1) ──
BASE = {"disallowed": 40, "deprecated": 25, "not_approved": 25, "unknown": 15, "approved": 5, "hybrid": 5}
QUANTUM = {"shor": 15, "grover": 7, "none": 0}
EVIDENCE = {"observed": 8, "declared": 4, "unverified": 2, "textual": 0}
CRIT_MULT = {3: 1.2, 2: 1.0, 1: 0.85}
CONF_MULT = {"high": 1.0, "medium": 0.85, "low": 0.7}
_SEVERITY = ["disallowed", "not_approved", "deprecated", "unknown", "pending", "approved", "hybrid"]
_EV_ORDER = ["observed", "declared", "unverified", "textual"]
EVIDENCE_LABEL = {"observed": "Observed", "declared": "Declared", "unverified": "Declared, unverified",
                  "textual": "Textual"}
GROVER_ALGS = {"DES", "3DES", "RC4", "MD5", "SHA-1", "SHA-224"}  # symmetric/hash strength < 256 bits
SIG_ALGS = {"DSA", "ECDSA", "EdDSA"}
KEX_ALGS = {"DH", "ECDH", "X25519", "X25519MLKEM768"}

_LOW_VALUE = {"test", "tests", "log", "logs", "tmp"}
_HIGH_VALUE = {"auth", "token", "citizen", "payments"}


def _tokens(path: str) -> set[str]:
    return {t for t in re.split(r"[^a-z0-9]+", path.lower()) if t}


def _all_low_value(files: list[str]) -> bool:
    return bool(files) and all(_tokens(f) & _LOW_VALUE for f in files)


def shelf_life(files: list[str]) -> tuple[int, str]:
    """X default: data shelf-life years from path tags, with the reason."""
    toks = set().union(*(_tokens(f) for f in files)) if files else set()
    if hit := toks & _HIGH_VALUE:
        return 15, f"path tag '{sorted(hit)[0]}': long-lived secrets"
    if _all_low_value(files):
        return 1, "test / log / tmp paths only"
    return 7, "default for unclassified data"


def criticality(files: list[str]) -> int:
    toks = set().union(*(_tokens(f) for f in files)) if files else set()
    if toks & (_HIGH_VALUE | {"kms", "keystore", "gw"}):
        return 3
    return 1 if _all_low_value(files) else 2


# Tier cut-offs sit on the formula's own anchors (docs/SCORING.md §1.3): disallowed + Shor = 55,
# disallowed alone = 40, legacy/deprecated = 25. Anything below is an approved algorithm today.
TIERS = (("Critical", 55), ("High", 40), ("Medium", 25))


def tier(score: float) -> str:
    return next((name for name, cut in TIERS if score >= cut), "Low")


def evidence_grade(f: dict) -> str:
    """How the finding was seen. Observed: parsed from the artefact in use (X.509, TLS handshake).
    Declared: named in source or config. Declared, unverified: a library/package that may or may not be
    called. Textual: a string match in bytes, or a key that could not be parsed."""
    if f["algorithm"] == "unknown" or f["plane"] == "binaries":
        return "textual"
    if f["plane"] in ("certificates", "tls"):
        return "observed"
    if f["plane"] == "dependencies" or f["plane"] == "containers" or _meta(f).get("kind") == "container-package":
        return "unverified"
    return "declared"


def _grover(f: dict) -> bool:
    a = f["algorithm"]
    return a in GROVER_ALGS or (a == "AES" and (f.get("key_size") or 0) < 256)


def _scored_findings(asset: dict) -> list[dict]:
    fs = asset["findings"]
    if asset["hybrid"]:  # plain X25519 is the classical half of the hybrid group, not a separate weakness
        fs = [f for f in fs if f["algorithm"] != "X25519"] or fs
    return fs


def quantum_class(asset: dict) -> str:
    fs = _scored_findings(asset)
    if any(f["quantum_vulnerable"] for f in fs):
        return "shor"
    return "grover" if any(_grover(f) for f in fs) else "none"


def threats(asset: dict) -> list[str]:
    """hndl: recorded ciphertext decrypted later. forgery: signatures forged once a CRQC exists.
    classical: weak today without any quantum computer."""
    out = set()
    for f in _scored_findings(asset):
        a, kind = f["algorithm"], _meta(f).get("kind", "")
        if a in SIG_ALGS or (a == "RSA" and f["plane"] == "certificates"):
            out.add("forgery")
        elif a in KEX_ALGS or a.startswith(("TLS", "SSL")) or kind in ("cipher", "protocol"):
            out.add("hndl")
        elif a == "RSA":
            out |= {"hndl", "forgery"}  # source/config RSA: may encrypt or sign; both until verified
        if f["nist_now"] == "disallowed" or a in ("MD5", "SHA-1", "DES", "RC4"):
            out.add("classical")
    if asset["hybrid"]:
        out.discard("hndl")
    return [t for t in ("hndl", "forgery", "classical") if t in out]


def _worst(asset: dict) -> str:
    return min((f["nist_now"] or "unknown" for f in _scored_findings(asset)),
               key=lambda s: _SEVERITY.index(s) if s in _SEVERITY else 3)


def risk(asset: dict, crit: int) -> dict:
    fs = _scored_findings(asset)
    status = _worst(asset)
    q = quantum_class(asset)
    ev = min((evidence_grade(f) for f in asset["findings"]), key=_EV_ORDER.index)
    conf = next((c for c in ("high", "medium") if any(f["confidence"] == c for f in asset["findings"])), "low")
    src = next((f.get("nist_source") for f in fs if (f["nist_now"] or "unknown") == status and f.get("nist_source")), None)
    base, qp, evp = BASE.get(status, BASE["unknown"]), QUANTUM[q], EVIDENCE[ev]
    subtotal = base + qp + evp
    exact = subtotal * CRIT_MULT[crit] * CONF_MULT[conf]
    terms = [
        {"term": "base", "op": "+", "value": base, "basis": status, "citation": cite(src)},
        {"term": "quantum", "op": "+", "value": qp, "basis": q,
         "note": "hybrid key exchange removes harvest-now risk; signatures stay Shor-vulnerable"
         if asset["hybrid"] else None},
        {"term": "evidence", "op": "+", "value": evp, "basis": ev},
        {"term": "subtotal", "op": "=", "value": subtotal},
        {"term": "criticality", "op": "×", "value": CRIT_MULT[crit], "basis": crit},
        {"term": "confidence", "op": "×", "value": CONF_MULT[conf], "basis": conf},
    ]
    return {"score": round(exact, 1), "exact": round(exact, 4), "terms": terms, "status": status,
            "quantum": q, "evidence": ev, "confidence": conf}


# ── CMCS (docs/SCORING.md §3): how hard this asset is to migrate, independent of how risky it is ──
def _location(f: dict) -> tuple[int, str]:
    if re.search(r"firmware|hsm|kms", f["file"].lower()):
        return 10, "firmware / HSM / KMS"
    if f["plane"] == "binaries":
        return 8, "compiled into a binary"
    if f["plane"] == "containers" or _meta(f).get("kind") == "container-package" or "!" in f["file"]:
        return 5, "container image"
    if f["plane"] == "dependencies":
        return 5, "library dependency"
    if f["plane"] == "code":
        return 4, "hardcoded in source"
    if f["plane"] == "tls":
        return 3, "live endpoint configuration"
    if f["plane"] == "certificates":
        return 2, "certificate re-issue"
    return 2, "configuration change"


def cmcs(asset: dict) -> dict:
    fs = asset["findings"]
    loc, loc_basis = max((_location(f) for f in fs), key=lambda t: t[0])
    files = {f["file"] for f in fs}
    spread = 2 if len(files) >= 10 else 1 if len(files) >= 3 else 0
    vendor = int(any(f["plane"] in ("binaries", "dependencies", "containers") for f in fs))
    reneg = int(any(f["algorithm"] in KEX_ALGS or f["algorithm"].startswith(("TLS", "SSL"))
                    or _meta(f).get("kind") in ("cipher", "protocol") for f in fs))
    total = max(1, min(10, loc + spread + vendor + reneg))
    return {"score": total, "basis": loc_basis, "components": [
        {"term": "location", "value": loc, "basis": loc_basis},
        {"term": "spread", "value": spread, "basis": f"{len(files)} file{'s' if len(files) != 1 else ''}"},
        {"term": "vendor", "value": vendor, "basis": "a vendor or upstream release controls it" if vendor else "you control the code"},
        {"term": "renegotiation", "value": reneg,
         "basis": "both peers must change (key exchange / protocol)" if reneg else "one side can change alone"},
    ], "clamped": total != loc + spread + vendor + reneg}


def migration_years(c: int) -> int:
    """Y: one year of migration effort per 2 CMCS points, rounded up (calibration in docs/SCORING.md §2)."""
    return math.ceil(c / 2)


def score_asset(asset: dict, settings: dict | None = None, override: dict | None = None) -> dict:
    st, ov = {**DEFAULTS, **(settings or {})}, override or {}
    files = [f["file"].split("!")[-1] for f in asset["findings"]]
    crit = ov.get("criticality") or criticality(files)
    r = risk(asset, crit)
    c = cmcs(asset)
    x, x_basis = (ov["x"], "set by an analyst") if ov.get("x") is not None else shelf_life(files)
    y, z = migration_years(c["score"]), st["threat_horizon"]
    return {"score": r["score"], "tier": tier(r["score"]),
            "breakdown": {"terms": r["terms"], "exact": r["exact"], "base_status": r["status"],
                          "quantum": r["quantum"], "quantum_vulnerable": r["quantum"] == "shor",
                          "evidence": r["evidence"], "evidence_label": EVIDENCE_LABEL[r["evidence"]],
                          "confidence": r["confidence"], "criticality": crit, "threats": threats(asset),
                          "mosca": {"x": x, "x_basis": x_basis, "y": y, "y_basis": f"CMCS {c['score']} / 2, rounded up",
                                    "z": z, "exposure": x + y - z},
                          "cmcs": c}}
