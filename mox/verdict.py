"""Verdict (CONTAIN / ACCEPT / MIGRATE), PQC replacement map, migration wave (SPEC section 8)."""
MLKEM_NOTE = "ML-KEM-768 public key 1,184 B (vs 32 B X25519) - larger TLS handshake"
MLDSA_NOTE = "ML-DSA-65 signature 3,309 B (vs 256 B RSA-2048 / 64 B ECDSA P-256) - larger tokens and certs"
MLKEM = "ML-KEM-768 (X25519MLKEM768 hybrid)"
MLDSA = "ML-DSA-65 (hybrid first)"
_SIG = {"ECDSA", "EdDSA", "DSA"}
_KEX = {"DH", "ECDH", "X25519"}
_PATCHABLE = {"code", "configs", "dependencies", "certificates"}


def replacements(asset: dict) -> list[dict]:
    out, seen = [], set()

    def add(frm, to, note=None):
        if (frm, to) not in seen:
            seen.add((frm, to))
            out.append({"from": frm, "to": to, "note": note})

    for f in asset["findings"]:
        a, mode = f["algorithm"], (f.get("mode") or "").upper()
        if a == "RSA":
            add("RSA signatures", MLDSA, MLDSA_NOTE)
            if f["plane"] in ("tls", "configs"):
                add("RSA key exchange", MLKEM, MLKEM_NOTE)
        elif a in _SIG:
            add(f"{a} signatures", MLDSA, MLDSA_NOTE)
        elif a in _KEX:
            add(f"{a} key exchange", MLKEM, MLKEM_NOTE)
        elif a in ("MD5", "SHA-1"):
            add(a, "SHA-256")
        elif a in ("DES", "3DES", "RC4") or mode == "ECB":
            add(a + (" ECB" if mode == "ECB" else ""), "AES-256-GCM")
        elif a.startswith(("TLSv1", "SSLv")):
            add(a, "TLS 1.2+ / TLS 1.3")
    if not out and asset["findings"][0]["plane"] in ("dependencies", "binaries", "containers"):
        add(asset["algorithm"], "upgrade to a PQC-capable release (e.g. OpenSSL 3.5+); verify usage first")
    return out


def wave(tier: str, exposure: int, verdict: str) -> int:
    """1 = most urgent ... 5 = validate/attest. Critical is always wave 1; accepted assets go to wave 5."""
    if verdict == "ACCEPT":
        return 5
    base = {"Critical": 1, "High": 2, "Medium": 3, "Low": 4}[tier]
    return base if base == 1 or exposure > 0 else min(5, base + 1)


def decide(asset: dict, sc: dict) -> dict:
    b = sc["breakdown"]
    y, x = b["mosca"]["y"], b["mosca"]["x"]
    has_source = any(f["plane"] in _PATCHABLE or (f["plane"] == "containers" and "!" not in f["file"])
                     for f in asset["findings"])
    if y >= 5 or not has_source:
        v = "CONTAIN"
        why = f"vendor binary / firmware / HSM / KMS coupling (Y={y})" if y >= 5 else "no patchable source location"
        rec = ["Segment the network path to this asset", "Front it with a crypto-agile gateway",
               "Shorten key lifetime / rotate more often"]
    elif sc["score"] < 30 or x <= 1:
        v = "ACCEPT"
        why = f"score {sc['score']} < 30" if sc["score"] < 30 else "data shelf-life X <= 1 year"
        rec = ["Monitor; re-assess at next scan"]
    else:
        v, why = "MIGRATE", "weak or quantum-vulnerable and patchable"
        rec = ["Replace per the PQC map", "Deploy hybrid first, then retire the classical algorithm"]
    reps = replacements(asset)
    return {"verdict": v, "reason": why, "recommendations": rec, "replacements": reps,
            "size_notes": sorted({r["note"] for r in reps if r["note"]}),
            "wave": wave(sc["tier"], b["mosca"]["exposure"], v)}
