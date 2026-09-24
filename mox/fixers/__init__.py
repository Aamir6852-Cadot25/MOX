"""Fix-and-verify (SPEC section 9): deterministic, text-safe fixers that return the new file text
for one finding, or None when no safe automatic fix exists."""
import difflib
import re
from pathlib import Path

INTERIM = "interim: plan ML-DSA-65 hybrid"
_HASH = {"MD5": re.compile(r"\bmd5\b", re.I), "SHA-1": re.compile(r"\bsha-?1\b(?!\d)", re.I)}
_HASH_EXTS = {".py", ".js", ".java"}
_RSA_SIZE = re.compile(r"(?<![\d.])(1024|2048)(?![\d.])")
_CURVE_LINE = "ssl_ecdh_curve X25519MLKEM768:X25519;"


def _hash_fix(lines, i, alg, ext):
    def sub(m):
        t = m.group(0)
        return "SHA-256" if "-" in t or ext == ".java" else "SHA256" if t.isupper() else "sha256"
    new = _HASH[alg].sub(sub, lines[i])
    return new if new != lines[i] else None


def _rsa_fix(lines, i, ext):
    if not _RSA_SIZE.search(lines[i]):
        return None
    marker = "#" if ext == ".py" else "//"
    return _RSA_SIZE.sub("3072", lines[i], count=1).rstrip("\r\n") + f"  {marker} {INTERIM}"


def _nginx_fix(text: str) -> str | None:
    """Drop legacy protocols, enable TLS 1.3 (the hybrid group is TLS 1.3-only, so offering it without 1.3
    would be a claim that can never take effect), offer X25519MLKEM768 first, and drop static-RSA key
    transport suites when a forward-secret suite remains."""
    from ..planes.configs import static_rsa_suites
    out, changed, has_curve = [], False, bool(re.search(r"^\s*ssl_ecdh_curve\b", text, re.M))
    for raw in text.splitlines(keepends=True):
        s = raw.strip()
        eol = raw[len(raw.rstrip("\r\n")):]
        if m := re.match(r"(\s*ssl_protocols\s+)(.+?);(.*)$", raw.rstrip("\r\n")):
            old = m.group(2).split()
            keep = [t for t in old if t not in ("TLSv1", "TLSv1.1", "SSLv3", "SSLv2")] or ["TLSv1.2"]
            if "TLSv1.3" not in keep:
                keep.append("TLSv1.3")
            changed = changed or keep != old
            out.append(f"{m.group(1)}{' '.join(keep)};{m.group(3)}{eol}")
            if not has_curve:
                indent = re.match(r"\s*", raw).group(0)
                out.append(f"{indent}{_CURVE_LINE}{eol or chr(10)}")
                changed = has_curve = True
        elif m := re.match(r"(\s*ssl_ciphers\s+)(.+?);(.*)$", raw.rstrip("\r\n")):
            suites = [t for t in m.group(2).strip("'\"").split(":") if t]
            drop = set(static_rsa_suites(m.group(2)))
            keep = [t for t in suites if t not in drop and t.upper() != "DES-CBC3-SHA"]
            if keep and keep != suites:  # never leave the server with no suite
                changed = True
                out.append(f"{m.group(1)}{':'.join(keep)};{m.group(3)}{eol}")
            else:
                out.append(raw)
        else:
            out.append(raw)
    return "".join(out) if changed else None


def claims(finding: dict, new_text: str) -> list[dict]:
    """What a patched file can and cannot do, checked against the new text itself. States: 'in-effect'
    (the declared config/code does it), 'not-in-effect' (the rest of the file makes it unreachable), and
    'not-verified' (depends on something MOX cannot see offline). Nothing here is assumed from intent.
    A claim marked limit=True is a stated limitation of the patch, not something the patch sets out to do."""
    if finding["plane"] != "configs":
        return []
    from ..planes.configs import tls_context
    t = tls_context(new_text)
    out = []
    legacy = [p for p in t["protocols"] if p in ("SSLv2", "SSLv3", "TLSv1", "TLSv1.1")]
    out.append({"claim": "Legacy protocols (SSLv3, TLS 1.0, TLS 1.1) disabled",
                "state": "not-in-effect" if legacy else "in-effect",
                "detail": f"ssl_protocols still allows {' '.join(legacy)}" if legacy else f"ssl_protocols {' '.join(t['protocols'])}"})
    if t["hybrid_configured"]:
        out.append({"claim": "Hybrid X25519MLKEM768 negotiable",
                    "state": "in-effect" if t["hybrid_effective"] else "not-in-effect",
                    "detail": "TLS 1.3 enabled and the group is listed first" if t["hybrid_effective"] else t["hybrid_why"]})
        out.append({"claim": "Server TLS library supports X25519MLKEM768", "state": "not-verified",
                    "detail": "needs OpenSSL 3.5+ (or a PQ-capable fork); MOX cannot see the server build offline, and its "
                              "own probe cannot offer the group. Check with a PQ-capable client before relying on it."})
        if t["classical_fallback"]:
            out.append({"claim": "Harvest-now exposure removed", "state": "not-in-effect", "limit": True,
                        "detail": "classical fallback still negotiable (" + ", ".join(t["classical_fallback"])
                                  + "): clients without ML-KEM still get a harvestable key exchange"})
    out.append({"claim": "Static-RSA key transport disabled", "state": "not-in-effect" if t["static_rsa"] else "in-effect",
                "detail": ("still enabled: " + ", ".join(t["static_rsa"])) if t["static_rsa"] else "every listed suite is ECDHE / DHE"})
    return out


def fix_text(finding: dict, text: str) -> str | None:
    """New text of the file for `finding` (a findings row), or None if not auto-fixable."""
    ext = Path(finding["file"].split("!")[-1]).suffix.lower()
    alg, i = finding["algorithm"], (finding["line"] or 0) - 1
    if "!" in finding["file"]:
        return None
    if finding["plane"] == "configs" and ext == ".conf" and (
            (alg in ("TLSv1", "TLSv1.1", "3DES", "DES") or (alg == "RSA" and finding.get("mode") == "key-transport"))
            and re.search(r"^\s*ssl_", text, re.M)):
        return _nginx_fix(text)
    if finding["plane"] != "code" or ext not in _HASH_EXTS or not 0 <= i:
        return None
    lines = text.splitlines(keepends=True)
    if i >= len(lines):
        return None
    if alg in _HASH:
        new = _hash_fix(lines, i, alg, ext)
    elif alg == "RSA" and finding["key_size"] in (1024, 2048) and re.search(r"generat|initialize|keygen", lines[i], re.I):
        new = _rsa_fix(lines, i, ext)
        new = new + ("\n" if lines[i].endswith("\n") else "") if new else None
    else:
        return None
    if new is None:
        return None
    lines[i] = new
    return "".join(lines)


def unified_diff(old: str, new: str, name: str) -> str:
    return "".join(difflib.unified_diff(old.splitlines(keepends=True), new.splitlines(keepends=True),
                                        f"a/{name}", f"b/{name}"))
