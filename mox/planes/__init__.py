from pathlib import Path

MAX_TEXT = 5 * 1024 * 1024


def read_text(path: Path) -> str | None:
    try:
        if path.stat().st_size > MAX_TEXT:
            return None
        return path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None
