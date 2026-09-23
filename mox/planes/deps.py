"""Plane 2 - dependency manifests. Presence of a crypto library is not proof of use -> low confidence."""
import json
import re
from functools import lru_cache
from pathlib import Path

from ..db import ROOT
from ..models import Finding
from . import read_text

NAME = "dependencies"
FILES = {"requirements.txt", "package.json", "pom.xml", "go.mod", "build.gradle"}


@lru_cache(maxsize=1)
def _libs() -> dict:
    return json.loads((ROOT / "data" / "rules.json").read_text(encoding="utf-8"))["deps"]


def wants(path: Path) -> bool:
    return path.name.lower() in FILES


def _finding(rel, lib, version, line, evidence, note):
    return Finding(NAME, lib, rel, line, evidence=evidence, confidence="low", detector="dep-manifest",
                   meta={"kind": "library", "version": version, "note": note})


def scan(path: Path, rel: str, ctx) -> list[Finding]:
    text = read_text(path)
    if text is None:
        return []
    libs, name, out = _libs(), path.name.lower(), []
    lines = text.splitlines()
    if name == "package.json":
        try:
            data = json.loads(text)
        except ValueError:
            return []
        deps = {**data.get("devDependencies", {}), **data.get("dependencies", {})}
        for lib, ver in deps.items():
            if lib.lower() in libs:
                ln = next((i for i, l in enumerate(lines, 1) if f'"{lib}"' in l), 0)
                out.append(_finding(rel, lib.lower(), ver, ln, f'"{lib}": "{ver}"', libs[lib.lower()]))
    elif name == "pom.xml":
        for m in re.finditer(r"<artifactId>\s*([\w.-]+)\s*</artifactId>(?:\s*<version>\s*([^<\s]+))?", text):
            lib = m.group(1).lower()
            if lib in libs:
                ln = text.count("\n", 0, m.start()) + 1
                out.append(_finding(rel, lib, m.group(2), ln, f"{m.group(1)} {m.group(2) or ''}", libs[lib]))
    else:  # requirements.txt, go.mod, build.gradle: token search per line
        for i, raw in enumerate(lines, 1):
            s = raw.strip()
            if not s or s.startswith(("#", "//")):
                continue
            for lib in libs:
                m = re.search(rf"(?<![\w.-]){re.escape(lib)}(?![\w-])\s*(?:[=<>~!]=?|\s|:)*\s*([\w.\-]*)", s, re.I)
                if m:
                    out.append(_finding(rel, lib, m.group(1) or None, i, s, libs[lib]))
    return out
