"""Phase 12: risk / Mosca / CMCS are separate, every total is reproducible from its rows (docs/SCORING.md)."""
import itertools

from mox import score
from mox.score import score_asset
from mox.verdict import decide
from test_phase2 import F, asset

PLANES = ["code", "configs", "certificates", "dependencies", "binaries", "tls"]


def test_risk_total_is_the_arithmetic_of_its_rows_for_every_combination():
    """Exhaustive over status x algorithm x plane x confidence x criticality (the 'property test' of §8.1)."""
    n = 0
    for status, (alg, size, qv), plane, conf, crit in itertools.product(
            score.BASE, [("RSA", 2048, 1), ("AES", 128, 0), ("AES", 256, 0), ("MD5", None, 0)], PLANES,
            score.CONF_MULT, score.CRIT_MULT):
        a = asset(F(algorithm=alg, key_size=size, quantum_vulnerable=qv, nist_now=status, plane=plane,
                    confidence=conf, file=f"x/{plane}.txt"))
        sc = score_asset(a, override={"criticality": crit})
        t = {r["term"]: r for r in sc["breakdown"]["terms"]}
        sub = t["base"]["value"] + t["quantum"]["value"] + t["evidence"]["value"]
        assert t["subtotal"]["value"] == sub
        exact = sub * t["criticality"]["value"] * t["confidence"]["value"]
        assert sc["score"] == round(exact, 1) and sc["breakdown"]["exact"] == round(exact, 4)
        assert t["base"]["value"] == score.BASE[status] and t["criticality"]["value"] == score.CRIT_MULT[crit]
        n += 1
    assert n == len(score.BASE) * 4 * len(PLANES) * 3 * 3


def test_mosca_and_cmcs_never_move_the_risk_score():
    a = asset(F(file="auth/x.py"))
    base = score_asset(a)
    for z in (1, 10, 40):
        for x in (0, 5, 30):
            sc = score_asset(a, {"threat_horizon": z}, {"x": x})
            assert sc["score"] == base["score"]
            m = sc["breakdown"]["mosca"]
            assert m["exposure"] == x + m["y"] - z


def test_cmcs_orthogonal_to_risk():
    """Same algorithm and status, different location: identical risk inputs, different CMCS."""
    cert = score_asset(asset(F(plane="certificates", confidence="high")))["breakdown"]["cmcs"]
    binary = score_asset(asset(F(plane="binaries", confidence="high", file="vendor/a.bin")))["breakdown"]["cmcs"]
    assert cert["score"] < binary["score"]
    assert cert["score"] == 2 and binary["score"] == 9  # location 8 + vendor 1


def test_cmcs_components_and_y():
    fs = [F(id=i, plane="configs", algorithm="ECDH", file=f"conf/{i}.conf", fingerprint="k", curve="P-256")
          for i in range(4)]
    c = score_asset(correlate_one(fs))["breakdown"]
    parts = {p["term"]: p["value"] for p in c["cmcs"]["components"]}
    assert parts == {"location": 2, "spread": 1, "vendor": 0, "renegotiation": 1}
    assert c["cmcs"]["score"] == 4 and c["mosca"]["y"] == 2


def correlate_one(fs):
    from mox.correlate import correlate
    return correlate(fs)[0]


def test_evidence_grades():
    g = lambda **kw: score.evidence_grade(F(**kw))
    assert g(plane="certificates") == "observed" and g(plane="tls") == "observed"
    assert g(plane="code") == "declared" and g(plane="configs") == "declared"
    assert g(plane="dependencies") == "unverified" and g(plane="containers") == "unverified"
    assert g(plane="binaries") == "textual" and g(plane="certificates", algorithm="unknown") == "textual"


def test_quantum_classes_and_threats():
    q = lambda **kw: score_asset(asset(F(**kw)))["breakdown"]
    assert q()["quantum"] == "shor" and q()["threats"] == ["hndl", "forgery"]
    assert q(plane="certificates", confidence="high")["threats"] == ["forgery"]
    assert q(algorithm="AES", key_size=128, quantum_vulnerable=0)["quantum"] == "grover"
    assert q(algorithm="AES", key_size=256, quantum_vulnerable=0)["quantum"] == "none"
    assert q(algorithm="ECDH", curve="P-256", quantum_vulnerable=1)["threats"] == ["hndl"]


def test_quantum_exposed_asset_is_never_accepted_on_low_risk_alone():
    a = asset(F(file="auth/x.py"))  # RSA-2048 approved today, Low tier, Mosca +7
    sc = score_asset(a)
    d = decide(a, sc)
    assert sc["tier"] == "Low" and sc["breakdown"]["mosca"]["exposure"] > 0
    assert d["verdict"] == "MIGRATE" and d["wave"] == 2 and "Mosca exposure +7" in d["wave_reason"]
