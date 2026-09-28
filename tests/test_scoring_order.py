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


def test_priority_logic_rsa_p2_and_des_p1():
    """An RSA-2048 asset with Mosca +6 must be P2; a DES asset with Mosca -5 must be P1 (disallowed)
    and never below an exposed quantum-vulnerable asset unless it is wave 1."""
    from mox.analyze import assign_priority, PRIORITY_ORDER
    from mox.verdict import decide

    # 1. RSA-2048 with Mosca +6:
    # Approved today, quantum_vulnerable=1.
    # With z=10, y=2, x=14 -> exposure = 14 + 2 - 10 = +6
    a_rsa = asset(F(algorithm="RSA", key_size=2048, nist_now="approved", quantum_vulnerable=1, file="misc/app.py"))
    a_rsa.update(score_asset(a_rsa, settings={"threat_horizon": 10}, override={"x": 14}))
    a_rsa.update(decide(a_rsa, a_rsa))
    assign_priority(a_rsa)

    assert a_rsa["breakdown"]["mosca"]["exposure"] == 6
    assert a_rsa["breakdown"]["quantum_vulnerable"] is True
    assert a_rsa["wave"] == 2  # Wave 2 because Mosca exposure > 0
    assert a_rsa["priority"] == "P2"
    assert "Mosca +6 yrs" in a_rsa["priority_reason"]

    # 2. DES asset with Mosca -5:
    # Classically broken / disallowed today, quantum_vulnerable=0.
    # With z=10, y=2, x=3 -> exposure = 3 + 2 - 10 = -5
    a_des = asset(F(algorithm="DES", key_size=None, nist_now="disallowed", quantum_vulnerable=0, file="misc/old.py"))
    a_des.update(score_asset(a_des, settings={"threat_horizon": 10}, override={"x": 3}))
    a_des.update(decide(a_des, a_des))
    assign_priority(a_des)

    assert a_des["breakdown"]["mosca"]["exposure"] == -5
    assert a_des["breakdown"]["base_status"] == "disallowed"
    assert a_des["wave"] == 1  # Wave 1 because disallowed today
    assert a_des["priority"] == "P1"
    assert "Disallowed" in a_des["priority_reason"]

    # 3. Ordering: DES (P1) is never below an exposed quantum-vulnerable asset (P2, Wave 2)
    assets = [a_rsa, a_des]
    sorted_assets = sorted(assets, key=lambda a: (PRIORITY_ORDER.get(a.get("priority", "P4"), 4), -float(a.get("score") or 0)))
    assert sorted_assets[0] is a_des
    assert sorted_assets[1] is a_rsa

    # 4. An exposed quantum-vulnerable asset in wave 1 (e.g. RSA-1024 disallowed) is P1
    a_rsa1024 = asset(F(algorithm="RSA", key_size=1024, nist_now="disallowed", quantum_vulnerable=1, file="misc/weak.py"))
    a_rsa1024.update(score_asset(a_rsa1024, settings={"threat_horizon": 10}, override={"criticality": 3, "x": 14}))
    a_rsa1024.update(decide(a_rsa1024, a_rsa1024))
    assign_priority(a_rsa1024)
    assert a_rsa1024["wave"] == 1
    assert a_rsa1024["priority"] == "P1"

    all_three = sorted([a_rsa, a_des, a_rsa1024], key=lambda a: (PRIORITY_ORDER.get(a.get("priority", "P4"), 4), -float(a.get("score") or 0)))
    assert all_three[-1] is a_rsa  # RSA-2048 (P2) is at the bottom
    assert all_three[0]["priority"] == "P1"
    assert all_three[1]["priority"] == "P1"
    assert {a["algorithm"] for a in all_three[:2]} == {"DES", "RSA"}

