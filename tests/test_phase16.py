"""Phase 16: B2 (coverage never shrinks silently), B4 (paper canvas), asset-specific verdict reasons."""
import json

from mox import coverage, db, scanner
from mox.api import ROOT
from mox.report import build, scope_text, with_text

ALL = {"code", "dependencies", "configs", "certificates", "containers", "binaries"}
SUBSET = {"code", "dependencies", "certificates", "containers"}  # the 18-file / 4-plane run of AUDIT B2


def _scan(target, planes=None):
    return scanner.scan(target, planes=planes)


# ── B2 ──
def test_planes_run_counts_planes_that_found_nothing(tmp_path):
    (tmp_path / "src").mkdir()
    (tmp_path / "src" / "a.py").write_text("x = 1\n", encoding="utf-8")
    s = _scan(tmp_path / "src")
    assert set(s["planes_run"]) == ALL and s["planes"] == {} and s["planes_off"] == ["tls"]


def test_narrower_rescan_of_same_target_is_flagged(demo_dir):
    full = _scan(demo_dir)
    assert full["coverage_warning"] is None or "Coverage shrank" not in (full["coverage_warning"] or "")
    narrow = _scan(demo_dir, SUBSET)
    d = narrow["coverage"]
    assert d["prev_id"] == full["scan_id"] and d["lost"] == ["binaries", "configs"] and d["shrank"]
    assert d["files_now"] < d["files_prev"]
    w = narrow["coverage_warning"]
    assert "Configuration" in w and "Binaries" in w and f"scan #{full['scan_id']}" in w and "not comparable" in w


def test_widening_again_is_not_flagged(demo_dir):
    _scan(demo_dir, SUBSET)
    again = _scan(demo_dir)
    assert again["coverage"]["shrank"] is False and again["coverage_warning"] is None
    assert again["coverage"]["gained"] == ["binaries", "configs"]


def test_report_and_kpi_use_planes_run_and_carry_the_warning(demo_dir):
    _scan(demo_dir)
    narrow = _scan(demo_dir, SUBSET)
    conn = db.connect()
    scan = conn.execute("SELECT * FROM scans WHERE id=?", (narrow["scan_id"],)).fetchone()
    d = with_text(build(conn, scan))
    conn.close()
    assert len(d["planes"]) == 4 and "Configuration" in d["planes_not_run"]
    assert "Coverage shrank" in d["scope"] and "across 4 of 7 planes" in d["summary"]


def test_different_target_is_not_compared(demo_dir, tmp_path):
    _scan(demo_dir)
    (tmp_path / "other").mkdir()
    s = _scan(tmp_path / "other", SUBSET)
    assert s["coverage"] is None and s["coverage_warning"] is None


# ── B4 ──
def test_page_canvas_is_paper_and_cards_are_surface():
    css = (ROOT / "web" / "src" / "index.css").read_text(encoding="utf-8")
    body = next(l for l in css.splitlines() if l.startswith("body {"))
    assert "background: var(--paper)" in body
    assert "--line:" not in css.split("}", 1)[0]  # tokens.css is the only source of --line
    assert "background: var(--surface)" in css.split(".bp-card {", 1)[1].split("}", 1)[0]


# ── verdict reason: asset-specific, from the inputs that produced it ──
def _assets(scan_id):
    conn = db.connect()
    out = [json.loads(r["data"]) for r in conn.execute("SELECT data FROM assets WHERE scan_id=?", (scan_id,))]
    conn.close()
    return out


def test_reasons_are_specific_and_unique(demo_dir):
    assets = _assets(_scan(demo_dir)["scan_id"])
    for a in assets:
        assert a["reason"].count(";") >= 3, a["reason"]  # status; quantum; Mosca; evidence
        assert a["reason"].split(". ", 1)[1].startswith(a["verdict"]), a["reason"]
    migrate = [a["reason"] for a in assets if a["verdict"] == "MIGRATE"]
    assert len(set(migrate)) == len(migrate)
    assert "weak or quantum-vulnerable and patchable" not in " ".join(a["reason"] for a in assets)


def test_p7_and_des_reasons_name_their_inputs(demo_dir):
    assets = _assets(_scan(demo_dir)["scan_id"])
    rsa = next(a for a in assets if a["label"].startswith("RSA-2048 payments/Crypto.java:11"))  # RSA-3072 once fixed
    assert "RSA-2048 is approved today under NIST SP 800-131A Rev.2" in rsa["reason"]
    assert "Mosca +7 yrs (X 15 + Y 2 − Z 10), so quantum-exposed" in rsa["reason"]
    assert "evidence declared" in rsa["reason"] and "quantum-exposed by 7 yrs" in rsa["reason"]
    des = next(a for a in assets if a["label"].startswith("DES payments/Crypto.java"))
    assert "disallowed today" in des["reason"] and "already classically broken" in des["reason"]
    # Grover-class: past the horizon is not a quantum break, and the text must not call it quantum-exposed
    assert "quantum-exposed" not in des["reason"] and "where Grover halves its strength" in des["reason"]
    kms = next(a for a in assets if "kms.tf" in a["label"])
    assert "CONTAIN because migration takes Y = 5 yrs (CMCS 10" in kms["reason"]
