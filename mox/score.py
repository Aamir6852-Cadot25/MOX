"""Three separate numbers per asset (docs/SCORING.md): risk score, Mosca exposure, CMCS. Never conflated.

Every function returns its components, not just a total, so the UI can print the arithmetic row by row.
"""
import math
import re

from .correlate import _meta
from .nist import cite, identified

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


def shelf_life(files: list[str]) -> tuple[int | None, str | None]:
    """X from path tags, with the reason. None when the path gives no signal, so score_asset can fall back
    to the project default (D3: per-asset override > path heuristic > project default)."""
    toks = set().union(*(_tokens(f) for f in files)) if files else set()
    if hit := toks & _HIGH_VALUE:
        return 15, f"path tag '{sorted(hit)[0]}': long-lived secrets"
    if _all_low_value(files):
        return 1, "test / log / tmp paths only"
    return None, None


def criticality(files: list[str]) -> int | None:
    """Business criticality from path tags. None when the path gives no signal (see shelf_life)."""
    toks = set().union(*(_tokens(f) for f in files)) if files else set()
    if toks & (_HIGH_VALUE | {"kms", "keystore", "gw"}):
        return 3
    return 1 if _all_low_value(files) else None


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
    # Every finding is scored. A separately listed X25519 (e.g. "X25519MLKEM768:X25519") is a classical
    # fallback a non-PQ client will negotiate, not the internal half of the hybrid group, so it stays.
    return asset["findings"]


def quantum_class(asset: dict) -> str:
    fs = _scored_findings(asset)
    if any(f["quantum_vulnerable"] for f in fs):
        return "shor"
    return "grover" if any(_grover(f) for f in fs) else "none"


_SIGN_USE = re.compile(r"sign|signature|verif|jws|jwt|pss|pkcs1_?v1_?5", re.I)
_ENC_USE = re.compile(r"encrypt|decrypt|cipher|oaep|wrap|seal|kem|rsa/ecb|rsa/none", re.I)


def purpose(f: dict) -> tuple[str, str]:
    """What this key is declared to do, from its own evidence only: (purpose, where that was read).
    purpose is sign / encrypt / key-agreement / key-transport / undetermined. Nothing is assumed."""
    m = _meta(f)
    if m.get("purpose"):
        return m["purpose"], m.get("purpose_evidence") or f"{f['detector']} at {f['file']}:{f['line']}"
    if f["plane"] == "certificates":
        return "sign", "an X.509 certificate key signs; key transport through it is recorded as a separate cipher finding"
    if f["plane"] == "code":
        ev = f.get("evidence") or ""
        s, e = bool(_SIGN_USE.search(ev)), bool(_ENC_USE.search(ev))
        if s != e:
            return ("sign" if s else "encrypt"), f"call on {f['file']}:{f['line']}: {ev.strip()[:80]}"
    return "undetermined", "no usage declared at this location (key generation, a string match, or a bare key spec)"


def threats(asset: dict) -> list[str]:
    """hndl: recorded ciphertext decrypted later. forgery: signatures forged once a CRQC exists.
    classical: weak today without any quantum computer. undetermined: a Shor-class key whose purpose
    (signing or encryption) is not declared anywhere MOX can read, so neither HNDL nor forgery is asserted."""
    out = set()
    for f in _scored_findings(asset):
        a, kind = f["algorithm"], _meta(f).get("kind", "")
        if a == "X25519MLKEM768":
            continue  # the hybrid group itself is not harvestable; its classical fallbacks are separate findings
        if a in SIG_ALGS:
            out.add("forgery")
        elif a in KEX_ALGS or a.startswith(("TLS", "SSL")) or kind in ("cipher", "protocol"):
            out.add("hndl")
        elif a in ("RSA", "DH"):
            p = purpose(f)[0]
            out.add({"sign": "forgery", "encrypt": "hndl", "key-agreement": "hndl",
                     "key-transport": "hndl"}.get(p, "undetermined"))
        if f["nist_now"] == "disallowed" or a in ("MD5", "SHA-1", "DES", "RC4"):
            out.add("classical")
    if out & {"hndl", "forgery"}:  # another location of the same key declared what it is for
        out.discard("undetermined")
    # No blanket discount for hybrid: HNDL is removed only when nothing classical is left to negotiate, which
    # the findings above already express (a classical fallback group or static-RSA suite keeps "hndl").
    return [t for t in ("hndl", "forgery", "undetermined", "classical") if t in out]


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
         "note": ("hybrid X25519MLKEM768 is negotiable per the config (declared, not observed: the offline probe "
                  "cannot offer it); classical fallbacks are still scored")
         if asset["hybrid"] else ("hybrid group configured but not negotiable: " + "; ".join(asset["hybrid_ineffective"]))
         if asset.get("hybrid_ineffective") else None},
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
    # D3: per-asset override > path heuristic > project default > hardcoded default.
    crit = ov.get("criticality") or criticality(files) or st.get("project_criticality") or 2
    r = risk(asset, crit)
    c = cmcs(asset)
    if ov.get("x") is not None:
        x, x_basis = ov["x"], "set by an analyst"
    else:
        x, x_basis = shelf_life(files)
        if x is None:
            x, x_basis = (st["project_shelf_life"], "project default shelf life") \
                if st.get("project_shelf_life") is not None else (7, "default for unclassified data")
    y, z = migration_years(c["score"]), st["threat_horizon"]
    # Mosca asks when a known algorithm breaks. With no identified algorithm (a library or package name only)
    # there is nothing to put on that timeline, so exposure is left out rather than scored as 0.
    applies = any(identified(f["algorithm"]) for f in _scored_findings(asset))
    mosca = {"applies": applies, "x": x, "x_basis": x_basis, "y": y, "y_basis": f"CMCS {c['score']} / 2, rounded up",
             "z": z, "exposure": x + y - z if applies else None,
             "reason": None if applies else "no algorithm identified: only a library or package name was found"}
    calculated_tier = tier(r["score"])
    prio_override = ov.get("priority")
    prio_map = {"P1": "Critical", "P2": "High", "P3": "Medium", "P4": "Low"}
    final_tier = prio_map.get(prio_override, calculated_tier) if prio_override else calculated_tier

    return {"score": r["score"], "tier": final_tier,
            "priority_override": prio_override,
            "owner": ov.get("owner"),
            "status": ov.get("status"),
            "notes": ov.get("notes"),
            "edited": bool(ov.get("priority") or ov.get("owner") or ov.get("status") or ov.get("notes") or ov.get("x") is not None or ov.get("criticality") is not None),
            "breakdown": {"terms": r["terms"], "exact": r["exact"], "base_status": r["status"],
                          "quantum": r["quantum"], "quantum_vulnerable": r["quantum"] == "shor",
                          "evidence": r["evidence"], "evidence_label": EVIDENCE_LABEL[r["evidence"]],
                          "confidence": r["confidence"], "criticality": crit, "threats": threats(asset),
                          "purposes": [{"file": f["file"], "line": f["line"], "purpose": p, "evidence": why}
                                       for f in asset["findings"] if f["algorithm"] in ("RSA", "DH")
                                       and _meta(f).get("kind") != "cipher" for p, why in [purpose(f)]],
                          "mosca": mosca,
                          "cmcs": c}}


def exposed(a: dict, threat: str) -> bool:
    """Quantum-exposed for one threat: Shor-breakable, that threat applies, and Mosca exposure > 0.
    'hndl' = harvest-now-decrypt-later; 'forgery' = signatures trusted past the quantum horizon."""
    b = a["breakdown"]
    e = b["mosca"]["exposure"]
    return b["quantum_vulnerable"] and threat in b.get("threats", []) and e is not None and e > 0
