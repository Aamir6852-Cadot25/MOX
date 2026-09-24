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


# ── C2 motion: token durations only, no decoration, reduced motion honoured ──
def _css_text():
    return "\n".join(p.read_text(encoding="utf-8") for p in CSS)


def test_c2_motion_tokens_have_the_specified_values():
    tok = (WEB / "styles" / "tokens.css").read_text(encoding="utf-8")
    for name, val in (("--t-fast", "120ms"), ("--t-base", "200ms"), ("--t-slow", "320ms"), ("--t-route-out", "80ms"),
                      ("--ease", "cubic-bezier(0.2, 0, 0.2, 1)"), ("--ease-out", "cubic-bezier(0.16, 1, 0.3, 1)")):
        assert re.search(re.escape(name) + r":\s*" + re.escape(val) + ";", tok), name


def test_c2_css_durations_come_only_from_tokens():
    bad = _offenders([p for p in CSS if p.name != "tokens.css"], lambda l: re.search(
        r"(transition|animation)[^;{]*?\b\d*\.?\d+m?s\b", l) or re.search(r"transition:\s*all\b", l) or "infinite" in l)
    assert bad == []


def test_c2_no_hover_lift_scale_or_shadow():
    rules = re.findall(r"([^{}]*:hover[^{}]*)\{([^}]*)\}", _css_text())
    assert [sel.strip() for sel, body in rules if re.search(r"transform|box-shadow|translate|scale", body)] == []


def test_c2_reduced_motion_drops_to_opacity():
    css = (WEB / "index.css").read_text(encoding="utf-8")
    block = css.split("@media (prefers-reduced-motion: reduce)", 1)[1]
    assert "transform: none" in block and "@keyframes route-in { from { opacity: 0; } to { opacity: 1; } }" in block


def test_c2_no_motion_literals_in_jsx():
    motion_file = WEB / "motion.js"
    assert _offenders([p for p in JSX if p != motion_file], lambda l: "requestAnimationFrame" in l) == []
    assert _offenders(JSX, lambda l: re.search(r"\b(transition|animation)\s*:", l)) == []


def test_no_custom_class_shadows_a_tailwind_utility():
    """A custom class named like a Tailwind utility silently inherits it (".collapse" got visibility: collapse)."""
    utilities = {"collapse", "visible", "invisible", "hidden", "block", "inline", "flex", "grid", "table", "contents",
                 "static", "fixed", "absolute", "relative", "sticky", "isolate", "truncate", "italic", "underline",
                 "uppercase", "lowercase", "capitalize", "container", "border", "rounded", "shadow", "outline", "ring",
                 "blur", "grow", "shrink", "transform", "transition", "filter", "invert", "sepia", "grayscale", "visible"}
    defined = set(re.findall(r"(?:^|[\s,}>+~])\.([a-zA-Z][\w-]*)", "\n".join(p.read_text(encoding="utf-8") for p in CSS)))
    assert defined & utilities == set()


# ── C6 / C7 ──
def test_c7_no_apologies_or_dead_end_empty_states():
    assert _offenders(JSX, lambda l: re.search(r"\b(sorry|apolog|unfortunately|oops|something went wrong)\b", l, re.I)) == []
    assert _offenders(JSX, lambda l: "Run a scan first" in l or "Nothing left to fix automatically" in l) == []


def test_c7_a_failed_load_is_never_shown_as_empty():
    """.catch(() => setRows([])) turned a server error into "No events yet"."""
    assert _offenders(JSX, lambda l: re.search(r"\.catch\(\(\)\s*=>\s*set\w+\((\[\]|false)\)\)", l)) == []


# ── D8: CipherX green is the one accent, action only, never a meaning or a badge ──
def test_d8_never_white_text_on_brand_fill():
    rules = re.findall(r"([^{}]+)\{([^}]*)\}", _css_text())
    bad = [sel.strip() for sel, body in rules
           if re.search(r"background(?:-color)?:\s*var\(--brand\)", body)
           and re.search(r"color:\s*(var\(--surface\)|white|#fff)", body, re.I)]
    assert bad == []
    jsx = _offenders(JSX, lambda l: "var(--brand)" in l and re.search(r'color:\s*(["\']?)(var\(--surface\)|white|#fff)', l, re.I))
    assert jsx == []


def test_d8_brand_is_never_used_as_text_colour():
    """#81B500 (--brand) is 2.5:1 on light surfaces; text must use --brand-ink instead.
    An icon's stroke (driven by `color` via currentColor, e.g. ".logo svg") is not text; D8 names
    the logo itself as a --brand use, so selectors that colour an svg/icon are exempt."""
    rules = re.findall(r"([^{}]+)\{([^}]*)\}", _css_text())
    bad = [sel.strip() for sel, body in rules
           if "svg" not in sel and re.search(r"(?<![-\w])color:\s*var\(--brand\)(?!-)", body)]
    assert bad == []
    jsx = _offenders(JSX, lambda l: re.search(r'(?<![-\w])color:\s*["\']var\(--brand\)(?!-)', l))
    assert jsx == []


def test_d8_brand_never_appears_inside_a_marks_badge():
    """Green means action now, never severity/meaning, so it can never colour a Tier/Verdict/Evidence badge."""
    badge_rules = re.findall(r"(\.b\.\w+)\s*\{([^}]*)\}", (WEB / "styles" / "asset.css").read_text(encoding="utf-8"))
    bad = [sel for sel, body in badge_rules if "--brand" in body]
    assert bad == []
    marks = (WEB / "components" / "Marks.jsx").read_text(encoding="utf-8")
    assert "brand" not in marks.lower()


def test_c6_every_route_names_its_one_question():
    app = (WEB / "App.jsx").read_text(encoding="utf-8")
    screens = (WEB.parent.parent / "docs" / "SCREENS.md").read_text(encoding="utf-8")
    # D1: old routes are pure redirects to their new home and have no question of their own; "/" decides
    # /scan vs /dashboard (D2); "/reports" is the bare default that picks a tab.
    redirects = {"*", "/", "/reports", "/queue", "/asset/:id", "/fix", "/fix/:findingId",
                 "/cbom", "/roadmap", "/report", "/attest", "/audit"}
    routes = [r for r in re.findall(r'<Route path="([^"]+)"', app) if r not in redirects]
    for r in routes:
        doc = {"/code/:findingId": "/code"}.get(r, r)
        row = next((l for l in screens.splitlines() if f"`{doc}`" in l), None)
        assert row and "?" in row, f"{r} has no question in docs/SCREENS.md"
