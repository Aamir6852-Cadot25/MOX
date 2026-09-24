"""Phase 15: the seven Critical findings of docs/AUDIT.md (first pass)."""
import json
import re
import threading

import pytest

from mox import api, attest, db, scanner


def _assets(scan_id):
    conn = db.connect()
    out = [json.loads(r["data"]) for r in conn.execute("SELECT data FROM assets WHERE scan_id=?", (scan_id,))]
    conn.close()
    return out


def _by_label(assets, prefix):
    return next(a for a in assets if a["label"].startswith(prefix))


# ── C1: the request DB connection must survive setup and teardown on different threads ──
def test_conn_dependency_closes_on_another_thread():
    gen = api._conn()
    conn = next(gen)  # FastAPI enters the dependency on one threadpool thread...
    conn.execute("SELECT 1")
    errors = []

    def teardown():  # ...and may exit it on another
        try:
            next(gen, None)
        except Exception as e:  # noqa: BLE001 - the regression is any exception here
            errors.append(e)
    t = threading.Thread(target=teardown)
    t.start()
    t.join()
    assert errors == []


# ── C6: Mosca only where an algorithm is identified; all three verdicts survive a change of Z ──
def test_library_without_algorithm_has_no_mosca_exposure(demo_dir):
    a = _by_label(_assets(scanner.scan(demo_dir)["scan_id"]), "node-forge")
    m = a["breakdown"]["mosca"]
    assert m["applies"] is False and m["exposure"] is None and "no algorithm identified" in m["reason"]
    assert a["verdict"] == "ACCEPT" and "not verified" in a["reason"]


def test_identified_algorithm_keeps_mosca(demo_dir):
    a = _by_label(_assets(scanner.scan(demo_dir)["scan_id"]), "RSA-1024")
    assert a["breakdown"]["mosca"]["applies"] is True and isinstance(a["breakdown"]["mosca"]["exposure"], int)


@pytest.mark.parametrize("z", [1, 5, 8, 9, 10, 12, 20])
def test_all_three_verdicts_reachable_at_any_horizon(demo_dir, z):
    conn = db.connect()
    s = scanner.scan(demo_dir, conn=conn, settings={"threat_horizon": z})
    v = attest.stats(conn, s["scan_id"])["verdicts"]
    conn.close()
    assert all(v[k] > 0 for k in ("migrate", "contain", "accept")), (z, v)


# ── C3: a fix that cannot take effect is never reported as applied; hybrid is credited only when negotiable ──
from mox.correlate import correlate  # noqa: E402
from mox.fixers import claims, fix_text, flow  # noqa: E402
from tests.conftest import scan_files  # noqa: E402

LEGACY = ("server {\n    listen 443 ssl;\n    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;\n"
          "    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:AES128-SHA:DES-CBC3-SHA;\n"
          "    ssl_certificate certs/api-gw.crt;\n}\n")
UNREACHABLE = ("server {\n    ssl_protocols TLSv1.2;\n    ssl_ecdh_curve X25519MLKEM768:X25519;\n"
               "    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:AES128-SHA;\n}\n")


def test_nginx_fix_enables_tls13_and_drops_static_rsa():
    f = {"plane": "configs", "file": "conf/nginx.conf", "algorithm": "TLSv1", "line": 3, "key_size": None}
    new = fix_text(f, LEGACY)
    assert "TLSv1.3" in new and "AES128-SHA" not in new.replace("GCM-SHA256", "") and "DES-CBC3-SHA" not in new
    c = {x["claim"]: x for x in claims(f, new)}
    assert c["Hybrid X25519MLKEM768 negotiable"]["state"] == "in-effect"
    assert c["Server TLS library supports X25519MLKEM768"]["state"] == "not-verified"
    assert c["Static-RSA key transport disabled"]["state"] == "in-effect"
    assert c["Harvest-now exposure removed"]["state"] == "not-in-effect" and c["Harvest-now exposure removed"]["limit"]


def test_unreachable_hybrid_group_is_not_credited(tmp_path):
    rows = scan_files(tmp_path, {"conf/nginx.conf": UNREACHABLE})
    hyb = next(r for r in rows if r["algorithm"] == "X25519MLKEM768")
    assets = correlate(rows)
    a = next(x for x in assets if hyb["id"] in x["finding_ids"])
    assert a["hybrid"] is False and "can never be negotiated" in a["hybrid_ineffective"][0]
    # the static-RSA suite is its own HNDL finding
    assert any(r["algorithm"] == "RSA" and r["mode"] == "key-transport" for r in rows)


def test_fix_that_cannot_fully_take_effect_is_not_reported_cleared(tmp_path):
    only_rsa = "server {\n    ssl_protocols TLSv1 TLSv1.2;\n    ssl_ciphers AES128-SHA:DES-CBC3-SHA;\n}\n"
    rows = scan_files(tmp_path, {"conf/nginx.conf": only_rsa})
    target = next(r for r in rows if r["algorithm"] == "TLSv1")
    conn = db.connect()
    fx = flow.preview(conn, target["id"], "t")
    assert any(c["state"] == "not-in-effect" for c in fx["claims"])  # visible before approval
    out = flow.apply(conn, fx["id"], "t")
    conn.close()
    assert out["cleared"] is True and out["status"] == "not-in-effect"
    assert "AES128-SHA" in (tmp_path / "src" / "conf" / "nginx.conf").read_text()  # no suite list emptied


# ── C4: HNDL comes from the key's declared purpose, never assumed ──
def _kpi_assets(demo_dir):
    return _assets(scanner.scan(demo_dir)["scan_id"])


def test_kms_sign_verify_key_is_forgery_not_hndl(demo_dir):
    a = _by_label(_kpi_assets(demo_dir), "RSA-2048 infra/kms.tf")
    assert a["breakdown"]["threats"] == ["forgery"]
    assert "SIGN_VERIFY" in a["breakdown"]["purposes"][0]["evidence"]
    assert all("encryption" not in r["from"] for r in a["replacements"])


def test_createsign_is_forgery_and_keygen_is_undetermined(tmp_path):
    rows = scan_files(tmp_path, {
        "web/sign.js": "const crypto = require('crypto');\nconst s = crypto.createSign('RSA-SHA256');\n",
        "gen/Keys.java": 'class K { void g() throws Exception {\n  java.security.KeyPairGenerator k = '
                         'java.security.KeyPairGenerator.getInstance("RSA");\n  k.initialize(3072);\n}}\n'})
    from mox.score import purpose, threats
    by_file = {r["file"]: r for r in rows if r["algorithm"] == "RSA"}
    assert purpose(by_file["web/sign.js"])[0] == "sign"
    keygen = next(r for f, r in by_file.items() if f.startswith("gen/"))
    assert threats({"findings": [keygen], "hybrid": False}) == ["undetermined"]


def test_static_rsa_suite_is_hndl_on_the_certificate_asset(tmp_path):
    rows = scan_files(tmp_path, {"conf/nginx.conf": UNREACHABLE})
    from mox.score import threats
    kt = next(r for r in rows if r["mode"] == "key-transport")
    assert threats({"findings": [kt], "hybrid": False}) == ["hndl"]


def test_demo_hndl_count_only_counts_declared_encryption_paths(demo_dir):
    conn = db.connect()
    st = attest.stats(conn, scanner.scan(demo_dir, conn=conn)["scan_id"])
    conn.close()
    assets = _kpi_assets(demo_dir)
    hndl = [a["label"] for a in assets if "hndl" in a["breakdown"]["threats"] and a["breakdown"]["quantum_vulnerable"]]
    assert not any("kms.tf" in l or "sign.js" in l for l in hndl)
    assert st["hndl_exposed"] <= len(hndl)


# ── C2: every "Open fix" the API offers leads to a patch; the top asset (a certificate) offers none ──
@pytest.fixture()
def client(demo_dir, tmp_path):
    import shutil
    from fastapi.testclient import TestClient
    from mox import auth
    work = tmp_path / "target"
    shutil.copytree(demo_dir, work)
    conn = db.connect()
    auth.create_user(conn, "admin", "correct-horse-1", "admin")
    conn.close()
    c = TestClient(api.create_app())
    assert c.post("/api/auth/login", json={"username": "admin", "password": "correct-horse-1"}).status_code == 200
    assert c.post("/api/scans", json={"path": str(work)}).status_code == 200
    return c


def test_every_offered_fix_previews(client):
    assets = client.get("/api/assets").json()
    offered = [a for a in assets if a["fix_finding"]]
    assert offered, "the demo target has auto-fixable findings"
    for a in offered:
        r = client.post("/api/fixes/preview", json={"finding_id": a["fix_finding"]})
        assert r.status_code == 200, (a["label"], r.json())
    top = _by_label(assets, "RSA-1024")  # the audit's top asset: a certificate, re-issued by hand
    assert top["fix_finding"] is None
    full = client.get(f"/api/assets/{top['id']}").json()
    assert full["fix_finding"] is None and not any(l["fixable"] for l in full["locations"])


# ── C5: the compliance report states only what the scan record supports; no reportlab ──
def test_report_derives_planes_network_and_fixes_from_the_scan(client):
    d = client.get("/api/report").json()
    latest = client.get("/api/scans/latest").json()
    assert len(d["planes"]) == latest["kpi"]["planes"] == 6  # the demo scan runs 6 planes; Live TLS was not run
    assert "Live TLS" in d["planes_not_run"] and "across 6 of 7 planes" in d["summary"]
    net = latest["scan"]["net"]
    assert f"counted {net['outbound']} outbound and {net['loopback']} loopback" in d["scope"]
    assert "No network calls were made" not in d["scope"] and "No live TLS probe was requested" in d["scope"]
    assert all("initial public draft" in s for s in d["standards"] if "8547" in s)
    assert d["counts"]["fixes_cleared"] == 0  # nothing fixed against this scan yet


def test_report_pdf_is_stdlib_and_says_the_same(client):
    import importlib.util
    assert importlib.util.find_spec("reportlab") is None
    src = (api.ROOT / "mox" / "report.py").read_text(encoding="utf-8")
    assert "reportlab" not in src.split('"""', 2)[2]
    r = client.get("/api/report/download")
    assert r.status_code == 200 and r.content.startswith(b"%PDF-1.4") and r.content.rstrip().endswith(b"%%EOF")
    runs = re.findall(rb"\((.*?)(?<!\\)\) Tj", r.content)  # text runs, joined across wrapped lines
    body = " ".join(x.decode("cp1252").replace("\\(", "(").replace("\\)", ")") for x in runs)
    assert "across 6 of 7 planes" in body and "ACCEPT (monitor; re-assess at the next scan)" in body
    assert "no action needed" not in body


def test_report_counts_fixes_only_against_this_scan(client):
    fx = client.post("/api/fixes/preview", json={"finding_id": next(a["fix_finding"] for a in client.get("/api/assets").json()
                                                                      if a["fix_finding"])}).json()
    out = client.post(f"/api/fixes/{fx['id']}/apply", json={"note": ""}).json()
    d = client.get("/api/report").json()["counts"]
    assert d["fixes_cleared"] + d["fixes_not_in_effect"] == 1 and out["status"] in ("cleared", "not-in-effect")
    client.post("/api/scans", json={"path": client.get("/api/scans/latest").json()["scan"]["target"]})
    assert client.get("/api/report").json()["counts"]["fixes_cleared"] == 0  # a new scan starts at zero
