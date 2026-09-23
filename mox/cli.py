import argparse
import sys
from pathlib import Path

from . import db, scanner
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


def _later(phase, name):
    def run(_a):
        print(f"`{name}` arrives in phase {phase}", file=sys.stderr)
        return 2
    return run


def main(argv=None):
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
    for name, phase in (("create-admin", 3), ("demo-attestations", 5), ("bench", 5)):
        c = sub.add_parser(name)
        c.add_argument("paths", nargs="*")
        c.set_defaults(fn=_later(phase, name))
    args = p.parse_args(argv)
    sys.exit(args.fn(args) or 0)
