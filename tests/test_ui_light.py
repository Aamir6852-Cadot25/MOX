"""Tests for the light MOX UI edition.
Ensures no old CipherX / #81B500 tokens, no external Google Fonts, and no unapproved runtime HTTP(S) calls.
"""
import re
from pathlib import Path
import pytest

WEB_SRC = Path(__file__).resolve().parent.parent / "web" / "src"


def _all_files():
    if not WEB_SRC.exists():
        return []
    return [p for p in WEB_SRC.rglob("*") if p.is_file() and "vendor" not in p.parts]


def test_no_legacy_green_accent():
    """Fails if web/src contains the old dark accent #81B500."""
    bad = []
    for f in _all_files():
        content = f.read_text(encoding="utf-8", errors="ignore")
        if "#81b500" in content.lower():
            bad.append(str(f.relative_to(WEB_SRC)))
    assert bad == [], f"Found legacy accent #81B500 in: {bad}"


def test_no_cipherx_references():
    """Fails if web/src contains references to CipherX."""
    bad = []
    for f in _all_files():
        content = f.read_text(encoding="utf-8", errors="ignore")
        if "cipherx" in content.lower():
            bad.append(str(f.relative_to(WEB_SRC)))
    assert bad == [], f"Found CipherX in: {bad}"


def test_no_google_fonts():
    """Fails if web/src links to fonts.googleapis."""
    bad = []
    for f in _all_files():
        content = f.read_text(encoding="utf-8", errors="ignore")
        if "fonts.googleapis" in content.lower():
            bad.append(str(f.relative_to(WEB_SRC)))
    assert bad == [], f"Found fonts.googleapis in: {bad}"


def test_no_external_runtime_urls():
    """Fails if web/src contains external http(s) URLs used at runtime (excluding XML namespaces like w3.org)."""
    bad = []
    url_re = re.compile(r'https?://(?!(?:www\.)?w3\.org)[^\s"\'`)]+')
    for f in _all_files():
        lines = f.read_text(encoding="utf-8", errors="ignore").splitlines()
        for i, line in enumerate(lines, 1):
            line_str = line.strip()
            if line_str.startswith("//") or line_str.startswith("/*") or line_str.startswith("*"):
                continue
            if "github.com" in line_str or "127.0.0.1" in line_str or "localhost" in line_str:
                continue
            if url_re.search(line_str):
                bad.append(f"{f.relative_to(WEB_SRC)}:{i}: {line_str}")
    assert bad == [], f"Found external runtime URLs in: {bad}"


def test_spa_index_and_assets_served():
    from fastapi.testclient import TestClient
    from mox.api import create_app
    client = TestClient(create_app())
    res = client.get("/")
    assert res.status_code == 200
    assert '<div id="root"></div>' in res.text
    scripts = re.findall(r'src="(/assets/[^"]+)"', res.text)
    assert len(scripts) >= 1
    for s in scripts:
        assert client.get(s).status_code == 200
