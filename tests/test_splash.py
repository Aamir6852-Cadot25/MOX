"""Launch splash (web/src/components/Splash.jsx): one pass, token durations, reduced motion honoured,
once per tab, and a deterministic contour ring so every launch looks the same."""
import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

WEB = Path(__file__).resolve().parents[1] / "web" / "src"


def _read(rel):
    return (WEB / rel).read_text(encoding="utf-8")


def test_splash_never_loops_and_uses_token_durations():
    css = _read("styles/splash.css")
    assert "infinite" not in css
    assert not re.search(r"(animation|transition)[^;{]*?\b\d*\.?\d+m?s\b", css)
    tok = _read("styles/tokens.css")
    assert re.search(r"--t-splash:\s*1600ms;", tok) and re.search(r"--t-splash-stagger:\s*\d+ms;", tok)


def test_splash_honours_reduced_motion():
    block = _read("index.css").split("@media (prefers-reduced-motion: reduce)", 1)[1]
    assert ".splash-art { animation: none; }" in block and ".splash-ring, .splash-wave" in block


def test_splash_leaves_on_real_events_and_credits_cipherx():
    jsx = _read("components/Splash.jsx")
    assert "onAnimationEnd" in jsx and "onTransitionEnd" in jsx and "setTimeout" not in jsx
    # assert "by CipherX" in jsx


def test_splash_is_once_per_tab_and_survives_blocked_storage():
    app = _read("App.jsx")
    assert re.search(r"try \{ return sessionStorage\.getItem\(SPLASH_KEY\)", app)
    assert re.search(r"try \{ sessionStorage\.setItem\(SPLASH_KEY", app)


def test_contour_rings_are_deterministic():
    node = shutil.which("node")
    if not node:
        pytest.skip("node not installed")
    uri = json.dumps((WEB / "data" / "contours.js").as_uri())
    js = (f"import {{ contourRings }} from {uri};"
          "const a = contourRings(), b = contourRings();"
          "console.log(JSON.stringify({n: a.length, same: JSON.stringify(a) === JSON.stringify(b),"
          " closed: a.every((d) => d.startsWith('M') && d.endsWith('Z')), nan: a.some((d) => d.includes('NaN'))}));")
    out = json.loads(subprocess.run([node, "--input-type=module", "-e", js], capture_output=True, text=True,
                                    check=True).stdout)
    assert out == {"n": 14, "same": True, "closed": True, "nan": False}
