import argparse
import sys
from pathlib import Path

from . import db, netguard, scanner
from .db import ROOT


def _make_demo(a):
    from . import demo_target
    out = demo_target.build(Path(a.out))
    print(f"demo target written to {out}")


def _demo_tls(a):
    from . import demo_tls
    demo_tls.run(Path(a.dir), a.host, a.port)


def _scan(a):
    s = scanner.scan(a.path, probe=a.probe)
    print(f"scan #{s['scan_id']}: {s['files_scanned']} files in {s['seconds']}s -> {s['findings']} findings "
          f"({s['verify_first']} verify-first) -> {s['assets']} assets")
    print("planes: " + ", ".join(f"{k}={v}" for k, v in sorted(s["planes"].items())))
    for msg in ([s["probe_error"]] if s["probe_error"] else []) + s["errors"]:
        print("warning:", msg, file=sys.stderr)
    return 1 if s["probe_error"] else 0


def _demo_attestations(_a):
    from . import attest
    conn = db.connect()
    n = attest.demo_attestations(conn)
    v = attest.sector_view(conn)
    print(f"{n} simulated signed attestations (demo data) across {v['kpi']['sectors']} sectors; "
          f"{v['kpi']['attestations']} verified, {v['kpi']['rejected']} rejected")
    conn.close()


def _bench(a):
    import shutil
    import tempfile
    from . import attest
    if not a.paths:
        print("bench: give at least one path", file=sys.stderr)
        return 2
    tot = {"files": 0, "seconds": 0.0, "findings": 0, "assets": 0, "qv": 0, "hndl": 0}
    planes: set = set()
    verdicts = {"migrate": 0, "contain": 0, "accept": 0}
    tmp = tempfile.mkdtemp(prefix="mox-bench-")
    try:
        conn = db.connect(Path(tmp) / "bench.db")
        for path in a.paths:
            s = scanner.scan(path, conn=conn)
            st = attest.stats(conn, s["scan_id"])
            tot["files"] += s["files_scanned"]
            tot["seconds"] += s["seconds"]
            tot["findings"] += s["findings"]
            tot["assets"] += st["total"]
            tot["qv"] += st["quantum_vulnerable"]
            tot["hndl"] += st["hndl_exposed"]
            planes |= set(s["planes"])
            for k in verdicts:
                verdicts[k] += st["verdicts"][k]
        conn.close()
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    rows = [("files scanned", tot["files"]), ("seconds", f"{tot['seconds']:.2f}"),
            ("planes hit", f"{len(planes)} ({', '.join(sorted(planes))})"), ("findings", tot["findings"]),
            ("assets", tot["assets"]), ("quantum-vuln", tot["qv"]), ("HNDL-exposed", tot["hndl"]),
            ("verdict split", f"MIGRATE {verdicts['migrate']} / CONTAIN {verdicts['contain']} / ACCEPT {verdicts['accept']}")]
    for k, v in rows:
        print(f"{k:<14}: {v}")


def main(argv=None):
    netguard.install()
    p = argparse.ArgumentParser(prog="mox", description="MOX - offline quantum-vulnerable crypto scanner")
    sub = p.add_subparsers(dest="cmd", required=True)
    c = sub.add_parser("make-demo", help="generate the gov-portal-legacy demo target")
    c.add_argument("--out", default=str(ROOT / "demo_target"))
    c.set_defaults(fn=_make_demo)
    c = sub.add_parser("demo-tls", help="serve the demo api-gw cert on 127.0.0.1:8443")
    c.add_argument("--dir", default=str(ROOT / "demo_target"))
    c.add_argument("--host", default="127.0.0.1")
    c.add_argument("--port", type=int, default=8443)
    c.set_defaults(fn=_demo_tls)
    c = sub.add_parser("scan", help="scan a directory (optionally probe a live TLS endpoint)")
    c.add_argument("path")
    c.add_argument("--probe", metavar="HOST:PORT")
    c.set_defaults(fn=_scan)
    c = sub.add_parser("create-admin", help="create an admin user (the only way to get one)")
    c.add_argument("--username")
    c.add_argument("--password")
    c.set_defaults(fn=lambda a: __import__("mox.auth", fromlist=["x"]).cli_create_admin(a))
    c = sub.add_parser("serve", help="serve API + web UI on 127.0.0.1:8000")
    c.add_argument("--port", type=int, default=8000)
    c.set_defaults(fn=lambda a: __import__("mox.api", fromlist=["x"]).serve(port=a.port))
    c = sub.add_parser("demo-attestations", help="simulated signed attestations for 6 sectors (demo data)")
    c.set_defaults(fn=_demo_attestations)
    c = sub.add_parser("bench", help="scan paths and print the numbers for the slides")
    c.add_argument("paths", nargs="*")
    c.set_defaults(fn=_bench)
    args = p.parse_args(argv)
    sys.exit(args.fn(args) or 0)
