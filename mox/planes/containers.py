"""Plane 6 - containers: docker-save tars (layers extracted to a temp dir, other planes re-run, tagged
plane=containers) and Dockerfiles."""
import io
import json
import re
import tarfile
import tempfile
from pathlib import Path

from ..models import Finding
from . import read_text

NAME = "containers"
MAX_EXTRACT = 256 * 1024 * 1024
_OPENSSL = re.compile(r"openssl\S*?[=\s-]+(\d\.\d\.\d+[a-z]?)|openssl[-_ ]?(\d\.\d\.\d+[a-z]?)", re.I)


def wants(path: Path) -> bool:
    return path.suffix.lower() == ".tar" or path.name.lower().startswith("dockerfile")


def _dockerfile(path: Path, rel: str) -> list[Finding]:
    text = read_text(path) or ""
    out = []
    for i, raw in enumerate(text.splitlines(), 1):
        if raw.strip().startswith("#"):
            continue
        if m := _OPENSSL.search(raw):
            ver = m.group(1) or m.group(2)
            out.append(Finding(NAME, f"OpenSSL {ver}", rel, i, evidence=raw.strip(), confidence="low",
                               detector="dockerfile", meta={"kind": "container-package", "version": ver}))
    return out


def _tag(findings: list[Finding], layer: int, image: str | None) -> list[Finding]:
    for f in findings:
        f.meta.update(origin_plane=f.plane, layer=layer, image=image)
        f.plane = NAME
    return findings


def scan(path: Path, rel: str, ctx) -> list[Finding]:
    if path.name.lower().startswith("dockerfile"):
        return _dockerfile(path, rel)
    if ctx.depth >= 2:
        return []
    out = []
    try:
        with tarfile.open(path, "r:*") as image:
            try:
                manifest = json.load(image.extractfile("manifest.json"))
            except (KeyError, ValueError, AttributeError):
                return []
            total = 0
            for entry in manifest:
                tags = entry.get("RepoTags") or [None]
                for n, layer in enumerate(entry.get("Layers", [])):
                    member = image.extractfile(layer)
                    if member is None:
                        continue
                    with tempfile.TemporaryDirectory(prefix="mox-layer-") as tmp:
                        with tarfile.open(fileobj=io.BytesIO(member.read()), mode="r:*") as lt:
                            for m in lt:
                                total += m.size if m.isfile() else 0
                                if total > MAX_EXTRACT:
                                    raise OSError("image too large")
                                if m.isfile() or m.isdir():
                                    lt.extract(m, tmp, filter="data")
                        found = ctx.scan_tree(Path(tmp), prefix=f"{rel}!/", depth=ctx.depth + 1)
                        out += _tag(found, n, tags[0])
    except (tarfile.TarError, OSError, KeyError):
        ctx.errors.append(f"could not read container image {rel}")
    return out
