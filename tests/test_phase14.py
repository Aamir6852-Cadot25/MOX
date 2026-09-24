"""Phase 14: work queue list payload: plane tag on every row, fix target, no raw finding rows."""
from test_phase10 import client  # noqa: F401  (fixture reuse)


def test_queue_rows_carry_planes_files_and_fix_target(client, demo_dir):
    client.post("/api/scans", json={"path": str(demo_dir)})
    rows = client.get("/api/assets").json()
    assert rows and all(r["planes"] and r["files"] for r in rows)
    assert all("findings" not in r and "locations" not in r for r in rows)
    for r in rows:
        if r["fix_finding"] is not None:
            full = client.get(f"/api/assets/{r['id']}").json()
            assert r["fix_finding"] in {f["id"] for f in full["findings"] if f["plane"] != "binaries"}
    binary_only = [r for r in rows if r["planes"] == ["binaries"]]
    assert binary_only and all(r["fix_finding"] is None for r in binary_only)
    evs = {r["breakdown"]["evidence"] for r in rows}
    assert evs <= {"observed", "declared", "unverified", "textual"} and len(evs) >= 3
