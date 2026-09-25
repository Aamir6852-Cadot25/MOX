"""Server-side directory listing for the Discover folder picker (MOX runs on the machine it scans,
so this is a local filesystem browse, not a browser upload). Lists subdirectories only; never reads
file contents. No restriction on which local paths can be browsed - the scan endpoint accepts any
local folder already (mox/source.py validate_local_path), so this mirrors that."""
import os
import string
from pathlib import Path


def _drives() -> list[str]:
    return [f"{L}:\\" for L in string.ascii_uppercase if Path(f"{L}:\\").exists()]


def default_root() -> str:
    if os.name == "nt":
        drives = _drives()
        return drives[0] if drives else str(Path.home())
    return str(Path.home())


def list_dir(raw: str | None) -> dict:
    """Returns {"path", "parent", "dirs": [{"name","path"}], "error"}. On Windows with no path given
    (or a path above a drive root), lists drives instead of a single directory."""
    s = (raw or "").strip().strip('"') or default_root()
    p = Path(s).expanduser()
    if not p.is_absolute():
        return {"path": s, "parent": None, "dirs": [], "error": "not an absolute path"}
    try:
        p = p.resolve()
    except OSError as e:
        return {"path": s, "parent": None, "dirs": [], "error": str(e)}
    if not p.exists():
        return {"path": str(p), "parent": None, "dirs": [], "error": "path does not exist"}
    if not p.is_dir():
        return {"path": str(p), "parent": None, "dirs": [], "error": "not a directory"}
    try:
        entries = sorted((c.name for c in p.iterdir() if c.is_dir() and not c.name.startswith(".")),
                          key=str.lower)
    except OSError as e:
        return {"path": str(p), "parent": None, "dirs": [], "error": str(e)}
    parent = str(p.parent) if p.parent != p else None
    return {"path": str(p), "parent": parent,
            "dirs": [{"name": n, "path": str(p / n)} for n in entries], "error": None}
