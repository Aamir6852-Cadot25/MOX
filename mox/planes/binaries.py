"""Plane 3 - strings scan of non-text files. Strings are weak evidence -> low confidence."""
import json
import re
from functools import lru_cache
from pathlib import Path

from ..db import ROOT
from ..models import Finding

NAME = "binaries"
BIN_EXTS = {".bin", ".so", ".dll", ".exe", ".dylib", ".o", ".a"}
MAX_BYTES = 64 * 1024 * 1024
_STRINGS = re.compile(rb"[\x20-\x7e]{6,}")


@lru_cache(maxsize=1)
def _rules():
    raw = json.loads((ROOT / "data" / "rules.json").read_text(encoding="utf-8"))["binaries"]
    return [(re.compile(r["pattern"]), r["algorithm"]) for r in raw]


def looks_binary(path: Path) -> bool:
    if path.suffix.lower() in BIN_EXTS:
        return True
    try:
        with open(path, "rb") as f:
            return b"\0" in f.read(4096)
    except OSError:
        return False


def scan(path: Path, rel: str, ctx) -> list[Finding]:
    try:
        if path.stat().st_size > MAX_BYTES:
            return []
        data = path.read_bytes()
    except OSError:
        return []
    out, seen = [], set()
    for sm in _STRINGS.finditer(data):
        s = sm.group().decode("ascii")
        for rx, alg in _rules():
            for m in rx.finditer(s):
                name = m.group() if alg == "@match" else alg
                key = (name, m.group())
                if key in seen:
                    continue
                seen.add(key)
                out.append(Finding(NAME, name, rel, 0, evidence=f"string '{m.group()}'", confidence="low",
                                   detector="binary-strings",
                                   meta={"kind": "binary-string", "offset": sm.start() + m.start()}))
    return out
