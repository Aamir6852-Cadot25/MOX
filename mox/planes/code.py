"""Plane 1 - source code. Regex rules from data/rules.json; key size comes from the MATCHED LINE."""
import json
import re
from functools import lru_cache
from pathlib import Path

from ..db import ROOT
from ..models import Finding
from ..nist import norm_curve
from . import read_text

NAME = "code"
EXTS = {".py", ".java", ".js", ".ts", ".go", ".c", ".cs"}
_SKIP = re.compile(r"""^(?:import\s|from\s+\S+\s+import\s|using\s|package\s|\#\s*include\b
    |(?:const|let|var)\s+.*=\s*require\(|(?:\w+\s+)?"[\w./@-]+"\s*,?$)""", re.X)
_COMMENT_PREFIX = ("#", "//", "/*", "*", "--")
_MIN_SIZE = 512


@lru_cache(maxsize=1)
def _rules():
    out = []
    for r in json.loads((ROOT / "data" / "rules.json").read_text(encoding="utf-8"))["code"]:
        out.append({**r, "_re": re.compile(r["pattern"]),
                    "_size": re.compile(r["size"]) if r.get("size") else None,
                    "_mode": re.compile(r["mode_re"]) if r.get("mode_re") else None,
                    "_curve": re.compile(r["curve_re"]) if r.get("curve_re") else None,
                    "_req": re.compile(r["file_requires"]) if r.get("file_requires") else None})
    return out


def wants(path: Path) -> bool:
    return path.suffix.lower() in EXTS


def _code_part(line: str, ext: str) -> str | None:
    s = line.strip()
    if not s or s.startswith(_COMMENT_PREFIX) or _SKIP.match(s):
        return None
    marker = r"\s#[^'\"]*$" if ext == ".py" else r"\s//[^'\"]*$"
    return re.sub(marker, "", line)


def _size(rx, line: str) -> int | None:
    vals = [int(m) for m in rx.findall(line) if _MIN_SIZE <= int(m) and int(m) != 65537]
    return vals[-1] if vals else None


def scan(path: Path, rel: str, ctx) -> list[Finding]:
    text = read_text(path)
    if text is None:
        return []
    ext = path.suffix.lower()[1:]
    rules = [r for r in _rules() if "langs" not in r or ext in r["langs"]]
    out, seen = [], set()
    for i, raw in enumerate(text.splitlines(), 1):
        line = _code_part(raw, path.suffix.lower())
        if line is None:
            continue
        for r in rules:
            if not r["_re"].search(line) or (r["_req"] and not r["_req"].search(text)):
                continue
            size = _size(r["_size"], line) if r["_size"] else None
            if r.get("size_required") and size is None:
                continue
            curve = None
            if r["_curve"] and (m := r["_curve"].search(line)):
                curve = norm_curve(m.group(1))
                size = int(curve[2:]) if curve and re.fullmatch(r"P-\d+", curve) else size
            mode = r.get("mode")
            if r["_mode"] and (m := r["_mode"].search(line)):
                mode = m.group(1).upper()
            f = Finding(NAME, r["algorithm"], rel, i, size, mode, curve, raw.strip(),
                        confidence="medium", detector=r["id"])
            if f.dedupe_key() not in seen:
                seen.add(f.dedupe_key())
                out.append(f)
    return out
