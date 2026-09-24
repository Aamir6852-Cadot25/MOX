"""Permanent ordering invariants for the risk score (docs/SCORING.md §1.3, §1.4). Regression guard for the
phase-15 inversion where a hybrid endpoint's X25519 fallback outranked live DES.

1. Critical means "disallowed + Shor". Nothing without a disallowed or deprecated status may reach Critical,
   checked against every rule in data/nist_status.json at the most aggravating multipliers.
2. Classically broken today outranks classically sound but Shor-breakable, at equal criticality, evidence and
   confidence.
"""
import itertools

import pytest

from mox import nist, score, scanner
from mox.analyze import analyze
from mox.score import score_asset
from test_phase2 import F, asset

BROKEN = {"disallowed", "deprecated"}
EVIDENCE_PLANES = {"observed": "certificates", "declared": "code", "unverified": "dependencies", "textual": "binaries"}


def _rules():
    """(label, algorithm, key_size, curve, mode, status, quantum_vulnerable) for every rule in the NIST table."""
    t = nist.table()
    for name, e in t["algorithms"].items():
        qv = e.get("quantum_vulnerable")
        for r in e.get("size_rules", []):
            yield f"{name}-{r['min']}", name, r["min"] or 1, None, None, r["now"], qv
        for curve, r in e.get("curve_rules", {}).items():
            yield f"{name} {curve}", name, int(curve[2:]), curve, None, r["now"], qv
        for mode, r in e.get("mode_rules", {}).items():
            yield f"{name}-{mode}", name, 128, None, mode, r["now"], qv
        if not any(k in e for k in ("size_rules", "curve_rules", "mode_rules")):
            yield name, name, None, None, None, e["now"], qv
    for name, p in t["protocols"].items():
        yield name, name, None, None, None, p["now"], None


def _worst_case(alg, size, curve, mode, status, qv):
    """Highest score this rule can produce: observed evidence, high confidence, mission-critical."""
    a = asset(F(algorithm=alg, key_size=size, curve=curve, mode=mode, nist_now=status, quantum_vulnerable=int(bool(qv)),
                plane="certificates", confidence="high", file="certs/x.crt"))
    return score_asset(a, override={"criticality": 3})


@pytest.mark.parametrize("label,alg,size,curve,mode,status,qv", list(_rules()), ids=lambda v: str(v))
def test_nothing_short_of_broken_reaches_critical(label, alg, size, curve, mode, status, qv):
    if status in BROKEN:
        return
    sc = _worst_case(alg, size, curve, mode, status, qv)
    assert sc["tier"] != "Critical", f"{label} ({status}) scores {sc['score']} at worst case"


def test_unknown_status_shor_key_cannot_reach_critical():
    assert _worst_case("RSA", None, None, None, "unknown", 1)["tier"] != "Critical"


@pytest.mark.parametrize("crit,conf,grade", list(itertools.product(score.CRIT_MULT, score.CONF_MULT, EVIDENCE_PLANES)))
def test_broken_today_outranks_sound_but_shor(crit, conf, grade):
    plane = EVIDENCE_PLANES[grade]

    def s(**kw):
        return score_asset(asset(F(plane=plane, confidence=conf, file=f"x/{plane}.bin", **kw)),
                           override={"criticality": crit})["score"]
    broken = [s(algorithm="DES", key_size=None, nist_now="disallowed", quantum_vulnerable=0),
              s(algorithm="3DES", key_size=None, nist_now="disallowed", quantum_vulnerable=0),
              s(algorithm="RSA", key_size=1024, nist_now="disallowed", quantum_vulnerable=1)]
    sound_shor = [s(algorithm="RSA", key_size=3072, nist_now="approved", quantum_vulnerable=1),
                  s(algorithm="ECDSA", key_size=256, curve="P-256", nist_now="approved", quantum_vulnerable=1),
                  s(algorithm="X25519", key_size=None, nist_now=nist.lookup("X25519")["now"], quantum_vulnerable=1)]
    assert min(broken) > max(sound_shor), (broken, sound_shor)


def test_demo_des_outranks_every_hybrid_configured_endpoint(demo_dir):
    s = scanner.scan(demo_dir)
    assets = analyze(s["scan_id"])
    des = next(a for a in assets if a["label"].startswith("DES payments/Crypto.java"))
    hybrid_cfg = [a for a in assets if a["hybrid"] or a.get("hybrid_ineffective")]
    assert hybrid_cfg, "the demo has a hybrid-configured endpoint"
    for a in hybrid_cfg:
        assert des["score"] > a["score"], (des["score"], a["label"], a["score"])
        assert "hndl" in a["breakdown"]["threats"]  # the classical fallback stays tagged; it just doesn't drive the base


# ── verdict invariant: disallowed today is never ACCEPT, whatever the tier or Mosca exposure ──
@pytest.mark.parametrize("alg,size,qv", [("DES", None, 0), ("3DES", None, 0), ("RSA", 1024, 1)])
def test_disallowed_is_never_accepted(alg, size, qv):
    from mox.verdict import decide
    seen = set()
    for crit, conf, grade, z, path in itertools.product(score.CRIT_MULT, score.CONF_MULT, EVIDENCE_PLANES,
                                                        (1, 10, 40), ("tests/fixture.py", "logs/x.py", "app/x.py")):
        plane = EVIDENCE_PLANES[grade]
        a = asset(F(algorithm=alg, key_size=size, nist_now="disallowed", quantum_vulnerable=qv, plane=plane,
                    confidence=conf, file=path if plane == "code" else f"{path}.{plane}"))
        a.update(score_asset(a, {"threat_horizon": z}, {"criticality": crit}))
        v = decide(a, a)["verdict"]
        assert v != "ACCEPT", (alg, crit, conf, grade, z, path, a["tier"], a["breakdown"]["mosca"]["exposure"])
        seen.add(v)
    assert "MIGRATE" in seen  # patchable locations still migrate; unpatchable ones are CONTAINed


def test_short_shelf_life_des_in_a_test_file_is_migrated_not_accepted():
    """The case that used to ACCEPT: DES in a test-only path gets X = 1, and X <= 1 accepted at any tier."""
    from mox.verdict import decide
    a = asset(F(algorithm="DES", key_size=None, nist_now="disallowed", quantum_vulnerable=0, confidence="low",
                file="tests/legacy_fixture.py"))
    a.update(score_asset(a, override={"criticality": 1}))
    assert a["breakdown"]["mosca"]["x"] == 1 and a["breakdown"]["mosca"]["exposure"] < 0
    d = decide(a, a)
    assert d["verdict"] == "MIGRATE" and "disallowed crypto is never accepted" in d["reason"]
