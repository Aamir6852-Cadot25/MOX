import json

from mox import db, scanner
from mox.analyze import analyze
from mox.correlate import correlate
from mox.score import score_asset, tier
from mox.verdict import decide
from conftest import scan_files


def F(**kw):
    d = dict(id=kw.pop("id", 1), plane="code", algorithm="RSA", key_size=2048, mode=None, curve=None, file="a.py",
             line=1, evidence="", fingerprint=None, confidence="medium", nist_now="approved",
             quantum_vulnerable=1, meta="{}")
    d.update(kw)
    return d


def asset(*fs):
    return correlate(list(fs))[0]


def demo_assets(demo_dir):
    s = scanner.scan(demo_dir)
    return s, analyze(s["scan_id"])


def test_one_key_many_places_is_one_asset(demo_dir):
    _, assets = demo_assets(demo_dir)
    gw = [a for a in assets if a["fingerprint"] and a["label"].endswith("api-gw.key")]
    assert len(gw) == 1
    files = {loc["file"] for loc in gw[0]["locations"]}
    assert {"certs/api-gw.crt", "certs/api-gw.key", "keystore/app.p12", "auth/token_signer.py",
            "conf/nginx.conf"} <= files
    assert any("app-image.tar" in f for f in files)  # container copy
    assert gw[0]["summary"].startswith(f"{len(gw[0]['finding_ids'])} findings")
    assert sum(len(a["finding_ids"]) for a in assets) == len(
        db.connect().execute("SELECT id FROM findings WHERE scan_id=?", (assets[0]["findings"][0]["scan_id"],)).fetchall())


def test_tls_peer_joins_asset():
    rows = [F(id=1, plane="certificates", file="certs/k.crt", fingerprint="ab", meta='{"kind":"certificate"}'),
            F(id=2, plane="tls", file="tls://h:1", fingerprint="ab", confidence="high", meta="{}")]
    assert len(correlate(rows)) == 1


def test_score_stores_every_term_and_tiers():
    sc = score_asset(asset(F(nist_now="approved", file="misc/x.py")))
    b = sc["breakdown"]
    assert [t["term"] for t in b["terms"]] == ["base", "quantum", "evidence", "subtotal", "criticality", "confidence"]
    assert set(b["mosca"]) >= {"x", "y", "z", "exposure"} and "points" not in b["mosca"]  # Mosca is not in risk
    assert [tier(s) for s in (55, 40, 25, 24.9)] == ["Critical", "High", "Medium", "Low"]


def test_mosca_per_asset_and_horizon_setting():
    a = asset(F(file="auth/login.py"))  # X=15 (auth), CMCS 4 (source) -> Y=2, Z=10 -> exposure 7
    b = score_asset(a)["breakdown"]["mosca"]
    assert (b["x"], b["y"], b["z"], b["exposure"]) == (15, 2, 10, 7)
    assert score_asset(a, {"threat_horizon": 20})["breakdown"]["mosca"]["exposure"] == -3
    assert score_asset(a, {"threat_horizon": 20})["score"] == score_asset(a)["score"]  # Z never moves risk
    assert score_asset(a, override={"x": 1})["breakdown"]["mosca"]["x"] == 1
    t = score_asset(asset(F(file="tests/log/t.py")))["breakdown"]["mosca"]
    assert t["x"] == 1


def test_disallowed_is_wave_one_even_when_not_quantum_exposed():
    a = asset(F(key_size=1024, nist_now="disallowed", file="misc/x.py"))
    sc = score_asset(a, {"threat_horizon": 30})
    assert sc["breakdown"]["mosca"]["exposure"] < 0
    d = decide(a, sc)
    assert d["verdict"] == "MIGRATE" and d["wave"] == 1
    assert "classically broken" in d["wave_reason"] and "Mosca exposure is -" in d["wave_reason"]


def test_hybrid_keeps_signature_risk_but_drops_hndl():
    crt = F(id=1, plane="certificates", file="certs/e.crt", fingerprint="ee", confidence="high",
            meta='{"kind":"certificate"}', algorithm="ECDSA", curve="P-256", key_size=256)
    tls13 = '{"cert_refs":["certs/e.crt"],"key_refs":[],"tls":{"hybrid_effective":true}}'
    hyb = F(id=2, plane="configs", file="conf/edge.conf", algorithm="X25519MLKEM768", key_size=None,
            nist_now="hybrid", quantum_vulnerable=0, meta=tls13)
    a = asset(crt, hyb)
    assert a["hybrid"]
    b = score_asset(a)["breakdown"]
    assert b["quantum"] == "shor" and "hndl" not in b["threats"] and "forgery" in b["threats"]
    # phase 15 (AUDIT C3): a separately listed classical X25519 fallback keeps HNDL
    fb = F(id=4, plane="configs", file="conf/edge.conf", algorithm="X25519", key_size=None, nist_now="not_approved",
           meta=tls13)
    assert "hndl" in score_asset(asset(crt, hyb, fb))["breakdown"]["threats"]
    # phase 15: a group the config cannot negotiate (no TLS 1.3) is never credited
    no13 = F(id=5, plane="configs", file="conf/edge.conf", algorithm="X25519MLKEM768", key_size=None,
             nist_now="hybrid", quantum_vulnerable=0,
             meta='{"cert_refs":["certs/e.crt"],"tls":{"hybrid_effective":false,"hybrid_why":"TLS 1.2 only"}}')
    x = asset(crt, no13)
    assert not x["hybrid"] and x["hybrid_ineffective"] == ["TLS 1.2 only"]
    # same group named in an unrelated config: co-occurrence is not hybrid
    other = F(id=3, plane="configs", file="conf/other.conf", algorithm="X25519MLKEM768", key_size=None,
              nist_now="hybrid", quantum_vulnerable=0, meta='{"cert_refs":["certs/zzz.crt"]}')
    assets = correlate([crt, other])
    plain = next(x for x in assets if x["fingerprint"] == "ee")
    assert not plain["hybrid"]


def test_demo_hybrid_only_on_edge_endpoint(demo_dir):
    _, assets = demo_assets(demo_dir)
    hyb = [a for a in assets if a["hybrid"]]
    assert len(hyb) == 1 and "ecdsa-p256" in hyb[0]["label"]
    assert hyb[0]["breakdown"]["terms"][1]["note"]


def test_verdict_rules_and_replacements():
    def verdict(f, **kw):
        a = asset(f)
        return decide(a, score_asset(a, **kw))
    assert verdict(F(plane="binaries", file="vendor/a.bin", confidence="low"))["verdict"] == "CONTAIN"
    assert verdict(F(plane="configs", file="infra/kms.tf"))["verdict"] == "CONTAIN"
    assert verdict(F(file="tmp/x.py", key_size=1024, nist_now="disallowed"))["verdict"] == "ACCEPT"  # X<=1
    v = verdict(F(file="auth/x.py"))
    assert v["verdict"] == "MIGRATE" and v["replacements"][0]["to"].startswith("ML-DSA-65")
    assert "3,309" in v["size_notes"][0]
    assert verdict(F(algorithm="MD5", key_size=None, nist_now="not_approved", quantum_vulnerable=0,
                     file="auth/p.py"))["replacements"][0]["to"] == "SHA-256"
    assert verdict(F(algorithm="3DES", nist_now="disallowed", key_size=None, file="auth/p.py"))[
        "replacements"][0]["to"] == "AES-256-GCM"
    assert verdict(F(algorithm="AES", mode="ECB", key_size=None, file="auth/p.py"))["replacements"][0]["to"] == "AES-256-GCM"
    kem = verdict(F(algorithm="ECDH", curve="P-256", file="auth/p.py"))
    assert kem["replacements"][0]["to"].startswith("ML-KEM-768")
    assert "1,184" in kem["size_notes"][0]


def test_waves_assigned_1_to_5(demo_dir):
    _, assets = demo_assets(demo_dir)
    waves = {a["wave"] for a in assets}
    assert waves <= {1, 2, 3, 4, 5} and 1 in waves and 5 in waves
    assert all(a["verdict"] in ("MIGRATE", "CONTAIN", "ACCEPT") for a in assets)


def test_assets_persisted_with_breakdown(tmp_path):
    rows = scan_files(tmp_path, {"x.py": "import hashlib\nhashlib.md5(b'a')\n"})
    conn = db.connect()
    data = json.loads(conn.execute("SELECT data FROM assets").fetchone()["data"])
    assert data["breakdown"]["base_status"] == "not_approved" and data["verdict"] and rows
