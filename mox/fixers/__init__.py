"""Fix-and-verify (SPEC section 9): deterministic, text-safe fixers that return the new file text
for one finding, or None when no safe automatic fix exists."""
import difflib
import re
from pathlib import Path

INTERIM = "interim: plan ML-DSA-65 hybrid"
_HASH = {"MD5": re.compile(r"md5", re.I), "SHA-1": re.compile(r"sha-?1(?!\d)", re.I)}
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
    out, changed, has_curve = [], False, bool(re.search(r"^\s*ssl_ecdh_curve\b", text, re.M))
    for raw in text.splitlines(keepends=True):
        s = raw.strip()
        if m := re.match(r"(\s*ssl_protocols\s+)(.+?);(.*)$", raw.rstrip("\r\n")):
            keep = [t for t in m.group(2).split() if t not in ("TLSv1", "TLSv1.1", "SSLv3", "SSLv2")]
            eol = raw[len(raw.rstrip("\r\n")):]
            if keep != m.group(2).split():
                changed = True
            out.append(f"{m.group(1)}{' '.join(keep or ['TLSv1.2', 'TLSv1.3'])};{m.group(3)}{eol}")
            if not has_curve:
                indent = re.match(r"\s*", raw).group(0)
                out.append(f"{indent}{_CURVE_LINE}{eol or chr(10)}")
                changed = has_curve = True
        elif s.startswith("ssl_ciphers") and "DES-CBC3-SHA" in s:
            new = re.sub(r":?DES-CBC3-SHA|DES-CBC3-SHA:?", "", raw, count=1)
            changed = changed or new != raw
            out.append(new)
        else:
            out.append(raw)
    return "".join(out) if changed else None


def fix_text(finding: dict, text: str) -> str | None:
    """New text of the file for `finding` (a findings row), or None if not auto-fixable."""
    ext = Path(finding["file"].split("!")[-1]).suffix.lower()
    alg, i = finding["algorithm"], (finding["line"] or 0) - 1
    if "!" in finding["file"]:
        return None
    if finding["plane"] == "configs" and ext == ".conf" and (
            alg in ("TLSv1", "TLSv1.1", "3DES", "DES") and re.search(r"^\s*ssl_", text, re.M)):
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
