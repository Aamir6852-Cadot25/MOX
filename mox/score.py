"""Explainable per-asset risk score (SPEC section 7). Every term is returned so the UI can show 'why this score'."""
import re

from .correlate import _meta

DEFAULTS = {"threat_horizon": 10}
BASE = {"disallowed": 40, "not_approved": 25, "deprecated": 25, "approved": 5, "hybrid": 5, "unknown": 15}
_SEVERITY = ["disallowed", "not_approved", "deprecated", "unknown", "pending", "approved", "hybrid"]
CONF_MULT = {"high": 1.0, "medium": 0.85, "low": 0.6}
CRIT_MULT = {1: 0.8, 2: 1.0, 3: 1.2}
QV_POINTS = 25
_LOW_VALUE = {"test", "tests", "log", "logs", "tmp"}


def _tokens(path: str) -> set[str]:
    return {t for t in re.split(r"[^a-z0-9]+", path.lower()) if t}


def _all_low_value(files: list[str]) -> bool:
    return bool(files) and all(_tokens(f) & _LOW_VALUE for f in files)


def shelf_life(files: list[str]) -> int:
    """X: data shelf-life years from path tags."""
    toks = set().union(*(_tokens(f) for f in files)) if files else set()
    if toks & {"auth", "token", "citizen", "payments"}:
        return 15
    return 1 if _all_low_value(files) else 7


def coupling(f: dict) -> int:
    """Y: migration years by how deeply the crypto is coupled."""
    if re.search(r"firmware|hsm|kms", f["file"].lower()):
        return 6
    if f["plane"] == "binaries":
        return 5
    if f["plane"] == "dependencies" or _meta(f).get("kind") == "container-package":
        return 3
    return 2 if f["plane"] == "code" else 1


def criticality(files: list[str]) -> int:
    toks = set().union(*(_tokens(f) for f in files)) if files else set()
    if toks & {"auth", "token", "citizen", "payments", "kms", "keystore", "gw"}:
        return 3
    return 1 if _all_low_value(files) else 2


def tier(score: float) -> str:
    return "Critical" if score >= 70 else "High" if score >= 50 else "Medium" if score >= 30 else "Low"


def _worst(asset: dict) -> str:
    fs = asset["findings"]
    if asset["hybrid"]:  # plain X25519 is the classical half of the hybrid group, not a separate weakness
        fs = [f for f in fs if f["algorithm"] != "X25519"] or fs
    return min((f["nist_now"] or "unknown" for f in fs), key=lambda s: _SEVERITY.index(s) if s in _SEVERITY else 3)


def score_asset(asset: dict, settings: dict | None = None, override: dict | None = None) -> dict:
    st, ov = {**DEFAULTS, **(settings or {})}, override or {}
    fs = asset["findings"]
    files = [f["file"].split("!")[-1] for f in fs]
    status = _worst(asset)
    base = BASE.get(status, BASE["unknown"])
    qv = any(f["quantum_vulnerable"] for f in fs)
    qv_pts = (QV_POINTS / 2 if asset["hybrid"] else QV_POINTS) if qv else 0
    x = ov["x"] if ov.get("x") is not None else shelf_life(files)
    y = max(coupling(f) for f in fs)
    z = st["threat_horizon"]
    exposure = x + y - z
    mosca = min(25, 3 * exposure) if exposure > 0 else 0
    crit = ov.get("criticality") or criticality(files)
    conf = next((c for c in ("high", "medium") if any(f["confidence"] == c for f in fs)), "low")
    raw = base + qv_pts + mosca
    scaled = raw * CRIT_MULT[crit] * CONF_MULT[conf]
    floor = status == "disallowed"
    final = round(min(100.0, max(0.0, max(scaled, 70) if floor else scaled)), 1)
    return {"score": final, "tier": tier(final),
            "breakdown": {"base": base, "base_status": status, "quantum_vulnerable": qv, "qv_points": qv_pts,
                          "qv_halved_for_hybrid": bool(qv and asset["hybrid"]),
                          "mosca": {"x": x, "y": y, "z": z, "exposure": exposure, "points": mosca},
                          "criticality": crit, "criticality_mult": CRIT_MULT[crit], "confidence": conf,
                          "confidence_mult": CONF_MULT[conf], "raw": raw, "scaled": round(scaled, 1),
                          "floor_applied": bool(floor and scaled < 70), "floor": 70 if floor else None}}
