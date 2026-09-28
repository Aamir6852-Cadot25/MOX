import copy
import json

import pytest
from fastapi.testclient import TestClient

from mox import attest, auth, cli, db, scanner
from mox.api import create_app


def test_attestation_has_no_path_or_host_and_signature_verifies(demo_dir):
    s = scanner.scan(demo_dir)
    conn = db.connect()
    att = attest.build(conn, s["scan_id"], "government")
    text = json.dumps(att)
    assert str(demo_dir) not in text and "demo_target" not in text and ".pem" not in text
    assert not attest.leaks(att)
    assert att["schema"] == "mox.attestation/v1" and att["signature"]["alg"] == "Ed25519"
    assert att["assets"]["total"] == s["assets"] and 0 <= att["readiness_index"] <= 100
    assert all(c["ok"] for c in attest.self_check(conn, att, s["scan_id"]))
    forged = copy.deepcopy(att)
    forged["assets"]["hndl_exposed"] = 0
    assert not attest.verify(forged, conn)
    leaky = copy.deepcopy(att)
    leaky["sector"] = "10.1.2.3"
    assert attest.leaks(leaky)


def test_merkle_root_is_order_independent():
    assert attest.merkle_root(["a" * 64, "b" * 64, "c" * 64]) == attest.merkle_root(["c" * 64, "a" * 64, "b" * 64])
    assert attest.merkle_root(["a" * 64]) != attest.merkle_root(["a" * 64, "b" * 64])


def test_sector_view_verifies_ranks_and_rejects_tampering():
    conn = db.connect()
    assert attest.demo_attestations(conn) == 37
    v = attest.sector_view(conn)
    assert v["kpi"]["sectors"] == 6 and v["kpi"]["attestations"] == 37 and v["kpi"]["leaks"] == 0
    hs = [r["hndl_exposed"] for r in v["ranking"]]
    assert hs == sorted(hs, reverse=True)
    # Sector table sorted by exposed assets, most exposed first (Task B3)
    assert [s["hndl_exposed"] for s in v["sectors"]] == sorted((s["hndl_exposed"] for s in v["sectors"]), reverse=True)
    row = conn.execute("SELECT id,data FROM attestations LIMIT 1").fetchone()
    d = json.loads(row["data"])
    d["assets"]["hndl_exposed"] += 500
    conn.execute("UPDATE attestations SET data=? WHERE id=?", (json.dumps(d), row["id"]))
    conn.commit()
    v2 = attest.sector_view(conn)
    assert v2["kpi"]["rejected"] == 1 and v2["kpi"]["attestations"] == 36


def test_api_attest_sectors_audit(demo_dir):
    conn = db.connect()
    auth.create_user(conn, "admin", "correct-horse-1", "admin")
    conn.close()
    c = TestClient(create_app())
    assert c.get("/api/attest").status_code == 404  # no scan yet
    assert c.post("/api/scans", json={"path": str(demo_dir)}).status_code == 200
    p = c.get("/api/attest").json()
    assert all(x["ok"] for x in p["checks"])
    assert c.get("/api/attest?sector=x.y").status_code == 422
    r = c.post("/api/attest/export", json={"sector": "power"})
    assert r.json()["sector"] == "power" and str(demo_dir) not in r.text
    assert any(a["action"] == "attestation-export" for a in c.get("/api/audit").json())
    assert c.get("/api/sectors").json()["sectors"] == []


def test_bench_prints_numbers(demo_dir, capsys):
    with pytest.raises(SystemExit) as e:
        cli.main(["bench", str(demo_dir)])
    assert e.value.code == 0
    out = capsys.readouterr().out
    assert "files scanned" in out and "HNDL-exposed" in out and "verdict split" in out
