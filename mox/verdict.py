"""Verdict (CONTAIN / ACCEPT / MIGRATE), PQC replacement map, migration wave (SPEC section 8)."""
from .score import purpose
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

    # RSA: one entry per declared purpose across all locations of the key; "if used for" only when none is declared.
    ps = {"encrypt" if f.get("mode") == "key-transport" else purpose(f)[0] for f in asset["findings"] if f["algorithm"] == "RSA"}
    known = ps - {"undetermined"}
    if "sign" in known:
        add("RSA signatures", MLDSA, MLDSA_NOTE)
    if known - {"sign"}:
        add("RSA key exchange / encryption", MLKEM, MLKEM_NOTE)
    if ps and not known:
        add("RSA, if used for signing", MLDSA, MLDSA_NOTE)
        add("RSA, if used for encryption", MLKEM, MLKEM_NOTE)
    for f in asset["findings"]:
        a, mode = f["algorithm"], (f.get("mode") or "").upper()
        if a == "RSA":
            continue
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


def wave(tier: str, exposure: int | None, verdict: str, status: str = "") -> tuple[int, str]:
    """1 = most urgent ... 5 = validate/attest. Returns (wave, reason in words). docs/SCORING.md §4.
    exposure is None when Mosca does not apply (no identified algorithm)."""
    e = "not applicable" if exposure is None else f"{exposure:+d} yrs"
    if verdict == "ACCEPT":
        return 5, "accepted risk: validate at the next scan and attest"
    if status == "disallowed":
        why = "disallowed today under NIST SP 800-131A Rev.2: it is already classically broken, so it is wave 1"
        if exposure is not None and exposure <= 0:
            why += (f". Mosca exposure is {e}: it is not quantum-exposed, but no quantum computer is needed to "
                    "break it. Mosca only measures the quantum deadline; this asset fails without one")
        return 1, why
    base = {"Critical": 1, "High": 2, "Medium": 3, "Low": 4}[tier]
    if base == 1:
        return 1, f"{tier} risk tier"
    if exposure is None:
        return min(4, base + 1), f"{tier} risk tier; Mosca does not apply (no identified algorithm), so one wave after its tier"
    if exposure > 0:
        return 2, (f"Mosca exposure {e}: data outlives the quantum horizon once migration time is added, "
                   f"so it starts in wave 2 whatever its {tier} risk tier")
    return min(4, base + 1), f"{tier} risk tier and not quantum-exposed yet (Mosca {e}), so one wave after its tier"


_STATUS_WORDS = {"disallowed": "disallowed today", "deprecated": "deprecated today", "not_approved": "not approved",
                 "approved": "approved today", "hybrid": "a hybrid post-quantum group", "pending": "pending standardisation",
                 "unknown": "unrated (no NIST rule matches its name or key size)"}
_QUANTUM_WORDS = {"shor": "Shor-breakable", "grover": "Grover-weakened only", "none": "not quantum-weakened"}
_EVIDENCE_NOTE = {"unverified": " (use not proven)", "textual": " (a string match, not a parsed artefact)"}


def _facts(asset: dict, sc: dict) -> str:
    """The inputs that produced this verdict, in words: NIST status and its source, quantum class, Mosca, evidence."""
    b, m = sc["breakdown"], sc["breakdown"]["mosca"]
    name = f"{asset['algorithm']}-{asset['key_size']}" if asset.get("key_size") else asset["algorithm"]
    cite = (b["terms"][0].get("citation") or [None])[0]
    status = f"{name} is {_STATUS_WORDS.get(b['base_status'], b['base_status'])}" + (f" under {cite}" if cite else "")
    if m["exposure"] is None:
        mosca = "Mosca does not apply (no algorithm identified)"
    else:
        e = m["exposure"]
        arith = f"Mosca {e:+d} yrs (X {m['x']} + Y {m['y']} − Z {m['z']})"
        if e <= 0:
            mosca = f"{arith}, so not quantum-exposed"
        elif b["quantum"] == "shor":
            mosca = f"{arith}, so quantum-exposed"
        else:  # only Shor breaks crypto outright; past the horizon a Grover-class algorithm is weakened, not broken
            mosca = f"{arith}: past the quantum horizon, " + (
                "where Grover halves its strength" if b["quantum"] == "grover" else "but not quantum-weakened")
    evidence = f"evidence {b['evidence_label'].lower()}{_EVIDENCE_NOTE.get(b['evidence'], '')}"
    return f"{status}; {_QUANTUM_WORDS[b['quantum']]}; {mosca}; {evidence}"


def decide(asset: dict, sc: dict) -> dict:
    b = sc["breakdown"]
    m = b["mosca"]
    y, x, exp = m["y"], m["x"], m["exposure"]
    fixable = [f for f in asset["findings"]
               if f["plane"] in _PATCHABLE or (f["plane"] == "containers" and "!" not in f["file"])]
    has_source = bool(fixable)
    if y >= 5 or not has_source:
        v = "CONTAIN"
        why = (f"CONTAIN because migration takes Y = {y} yrs (CMCS {b['cmcs']['score']}: {b['cmcs']['basis']}), "
               "too long to patch in place" if y >= 5 else
               "CONTAIN because no location can be patched in place (only "
               + ", ".join(sorted({f['plane'] for f in asset['findings']})) + ")")
        rec = ["Segment the network path to this asset", "Front it with a crypto-agile gateway",
               "Shorten key lifetime / rotate more often"]
    elif exp is None and sc["tier"] == "Low":
        # A library or package name with no identified algorithm: nothing to migrate until a call site is found.
        v = "ACCEPT"
        why = (f"ACCEPT because it is Low risk ({sc['score']}) with no algorithm identified (a library or package name only); "
               "not verified: MOX has not found a call into it")
        rec = ["Verify usage first: search for calls into this library", "Re-assess at next scan"]
    elif x <= 1 or (sc["tier"] == "Low" and exp is not None and exp <= 0):
        v = "ACCEPT"
        why = (f"ACCEPT because data shelf life X = {x} yr: it expires before a quantum computer matters" if x <= 1 else
               f"ACCEPT because it is Low risk ({sc['score']}) and not quantum-exposed")
        rec = ["Monitor; re-assess at next scan"]
    else:
        because = []
        if b["base_status"] == "disallowed":
            because.append("it is already classically broken")
        elif sc["tier"] != "Low":
            because.append(f"it is {sc['tier']} risk ({sc['score']})")
        if exp is not None and exp > 0:
            because.append(f"it is quantum-exposed by {exp} yrs" if b["quantum"] == "shor"
                           else f"its data outlives the quantum horizon by {exp} yrs")
        n = len({f["file"] for f in fixable})
        v = "MIGRATE"
        why = (f"MIGRATE because {' and '.join(because)}; "
               f"it can be changed in {n} location{'s' if n != 1 else ''} you control")
        rec = ["Replace per the PQC map", "Deploy hybrid first, then retire the classical algorithm"]
    why = f"{_facts(asset, sc)}. {why}"
    reps = replacements(asset)
    return {"verdict": v, "reason": why, "recommendations": rec, "replacements": reps,
            "size_notes": sorted({r["note"] for r in reps if r["note"]}),
            "wave": (w := wave(sc["tier"], exp, v, b["base_status"]))[0], "wave_reason": w[1]}
