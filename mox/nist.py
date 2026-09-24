"""NIST status lookup driven entirely by data/nist_status.json (never hard-coded)."""
import json
import re
from functools import lru_cache
from pathlib import Path

NIST_PATH = Path(__file__).resolve().parent.parent / "data" / "nist_status.json"

_ALIASES = {
    "SHA1": "SHA-1", "SHA-1": "SHA-1", "SHA224": "SHA-224", "SHA256": "SHA-256", "SHA384": "SHA-384",
    "SHA512": "SHA-512", "SHA-256": "SHA-256", "SHA-384": "SHA-384", "SHA-512": "SHA-512",
    "TDES": "3DES", "DESEDE": "3DES", "TRIPLEDES": "3DES", "3DES": "3DES",
    "ED25519": "EdDSA", "ED448": "EdDSA", "EDDSA": "EdDSA",
}
_CURVES = {"SECP192R1": "P-192", "PRIME192V1": "P-192", "SECP224R1": "P-224", "SECP256R1": "P-256",
           "PRIME256V1": "P-256", "SECP384R1": "P-384", "SECP521R1": "P-521"}
_UNRATED = {"now": "unknown", "after_2030": "unknown", "after_2035": "unknown"}


@lru_cache(maxsize=1)
def table() -> dict:
    return json.loads(NIST_PATH.read_text(encoding="utf-8"))


def norm_curve(name: str | None) -> str | None:
    if not name:
        return None
    key = re.sub(r"[-_ ]", "", name).upper()
    if key in _CURVES:
        return _CURVES[key]
    m = re.fullmatch(r"P(\d{3})", key)
    return f"P-{m.group(1)}" if m else name


def _pick(rec: dict) -> dict:
    keys = ("now", "after_2030", "after_2035", "legacy_use", "source", "notes")
    return {k: rec.get(k) for k in keys}


def lookup(algorithm: str, key_size: int | None = None, curve: str | None = None,
           mode: str | None = None) -> dict:
    """Return {now, after_2030, after_2035, quantum_vulnerable, legacy_use, source, notes}.
    Missing entries yield status "unknown" plus a note; nothing is guessed."""
    t = table()
    name = _ALIASES.get(algorithm.upper().replace(" ", ""), algorithm)
    if name in t["protocols"]:
        p = t["protocols"][name]
        return {"now": p["now"], "after_2030": p["now"], "after_2035": p["now"], "legacy_use": None,
                "quantum_vulnerable": None, "source": p.get("source"), "notes": p.get("notes")}
    algs = t["algorithms"]
    entry = next((v for k, v in algs.items() if k.upper() == name.upper()), None)
    if entry is None:
        return {**_UNRATED, "quantum_vulnerable": None, "legacy_use": None, "source": None,
                "notes": f"no NIST entry for '{algorithm}'"}
    out = {"quantum_vulnerable": entry.get("quantum_vulnerable")}
    rec, why = None, None
    if mode and mode.upper() in {k.upper() for k in entry.get("mode_rules", {})}:
        rec = next(v for k, v in entry["mode_rules"].items() if k.upper() == mode.upper())
    elif "size_rules" in entry:
        if key_size is None:
            why = f"{algorithm} key size unknown"
        else:
            rec = next((r for r in entry["size_rules"] if r["min"] <= key_size <= r["max"]), None)
            why = None if rec else f"no NIST rule for {algorithm}-{key_size}"
    elif "curve_rules" in entry:
        c = norm_curve(curve)
        rec = entry["curve_rules"].get(c) if c else None
        why = None if rec else f"no NIST rule for {algorithm} curve {curve or '(unknown)'}"
    elif "mode_rules" in entry:
        why = f"{algorithm} mode unknown"
    else:
        rec = entry
    if rec is None:
        return {**_UNRATED, **out, "legacy_use": None, "source": None, "notes": why}
    return {**_pick(rec), **out}


def identified(algorithm: str | None) -> bool:
    """True when the name is an algorithm or protocol the NIST table rates. A library or package name
    ('node-forge', 'OpenSSL 1.1.1k') is not an algorithm: nothing is known about what it is used for."""
    if not algorithm:
        return False
    t = table()
    name = _ALIASES.get(algorithm.upper().replace(" ", ""), algorithm)
    return name in t["protocols"] or any(k.upper() == name.upper() for k in t["algorithms"])


def cite(source: str | None) -> list[str]:
    """Expand a table source key list ("131A, 8547") into full document names for the UI."""
    names = table()["sources"]
    return [names.get(k.strip(), k.strip()) for k in (source or "").split(",") if k.strip()]
