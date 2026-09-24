"""Permanent UI lint for docs/JUDGE-AUDIT.md Part C1/C3/C4/C5 and the master-prompt anti-AI-look checklist.
Static checks over web/src so the token pass cannot erode screen by screen."""
import re
from pathlib import Path

import pytest

WEB = Path(__file__).resolve().parent.parent / "web" / "src"
CSS = [p for p in WEB.rglob("*.css") if "vendor" not in p.parts]
JSX = [p for p in WEB.rglob("*.js*") if "vendor" not in p.parts]
SCALE = {0, 4, 8, 12, 16, 24, 32}
TW_OFF = r"(?<![\w-])-?(?:p|m)[xytrbl]?-(?:5|7|0\.5|1\.5|2\.5|3\.5)(?![\w.])|(?<![\w-])gap(?:-[xy])?-(?:5|7|0\.5|1\.5|2\.5|3\.5)(?![\w.])"


def _lines(paths):
    for p in paths:
        for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
            yield p.relative_to(WEB).as_posix(), i, line


def _offenders(paths, check):
    return [f"{f}:{i}: {l.strip()[:110]}" for f, i, l in _lines(paths) if check(l)]


def _css_spacing_bad(line):
    bad = False
    for prop, val in re.findall(r"\b((?:padding|margin)(?:-[a-z]+)?|gap|row-gap|column-gap)\s*:\s*([^;}]+)", line):
        for n in re.findall(r"(?<![\w.(-])(-?\d+(?:\.\d+)?)px", val):
            bad |= abs(float(n)) not in SCALE
    return bad


def _jsx_spacing_bad(line):
    if re.search(TW_OFF, line) or re.search(r"(?:^|\s|\")-?(?:p|m|gap)[xytrbl]?-\[\d+px\]", line):
        return True
    for n in re.findall(r"\b(?:padding|margin|gap)\w*:\s*(-?\d+)\b", line):
        if abs(int(n)) not in SCALE:
            return True
    for s in re.findall(r"\b(?:padding|margin)\w*:\s*\"([^\"]+)\"", line):
        if any(abs(float(n)) not in SCALE for n in re.findall(r"(-?\d+(?:\.\d+)?)px", s)):
            return True
    return False


def test_c5_css_spacing_on_scale():
    assert _offenders(CSS, _css_spacing_bad) == []


def test_c5_jsx_spacing_on_scale():
    assert _offenders(JSX, _jsx_spacing_bad) == []


def test_c1_no_drop_shadows():
    css = _offenders(CSS, lambda l: "box-shadow" in l and "inset" not in l and "none" not in l)
    jsx = _offenders(JSX, lambda l: "boxShadow" in l or "shadow-" in l)
    assert css + jsx == []


def test_colours_only_from_tokens():
    css = _offenders([p for p in CSS if p.name != "tokens.css"], lambda l: re.search(r"#[0-9A-Fa-f]{3,8}\b", l))
    jsx = _offenders(JSX, lambda l: re.search(r"[\"'`]#[0-9A-Fa-f]{3,8}\b|\[#[0-9A-Fa-f]{3,8}\]", l))
    assert css + jsx == []


def test_c4_no_emoji_or_glyph_icons():
    glyph = re.compile("[☀-➿\U0001F300-\U0001FAFF▲-▿←✓✕]")
    assert _offenders(JSX, lambda l: glyph.search(l)) == []


def test_checklist_no_middle_dot_meta_or_arrow_buttons():
    assert _offenders(JSX, lambda l: "·" in l) == []
    assert _offenders(JSX, lambda l: re.search("→\\s*(</(?:Link|button|a)>|[\"`]\\s*\\}?\\s*</)", l)) == []


def test_checklist_no_all_caps_eyebrows():
    css = _offenders(CSS, lambda l: "text-transform: uppercase" in l or "text-transform:uppercase" in l)
    jsx = _offenders(JSX, lambda l: re.search(r"\buppercase\b|letterSpacing|>[A-Z][A-Z ]{5,}<", l))
    assert css + jsx == []


@pytest.mark.parametrize("name", ["check", "x", "download", "refresh-cw", "octagon-x", "triangle-alert"])
def test_c4_icons_are_vendored_lucide(name):
    src = (WEB / "vendor" / "lucide" / "icons.js").read_text(encoding="utf-8")
    assert f'"{name}":' in src and "lucide-static" in src
    assert (WEB / "vendor" / "lucide" / "LICENSE").exists()
    assert not _offenders(JSX + CSS, lambda l: re.search(r"https?://(?!www\.w3\.org)", l))
