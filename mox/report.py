"""Compliance Report (PDF). Data = live scan + CBOM stats; PDF is written with the stdlib (no extra deps)."""
from datetime import datetime, timezone

from . import cbom

PLANES = [("Source code", "regex/AST rules over source files"), ("Dependencies", "known crypto libraries and versions"),
          ("Configuration", "TLS/SSH/crypto settings in config files"), ("Certificates & keys", "X.509 and key files, metadata only"),
          ("Containers", "image and manifest crypto usage"), ("Binaries", "linked crypto libraries and constants"),
          ("Live TLS", "handshake probe of the local demo endpoint")]
STANDARDS = ["NIST SP 800-131A (transitions of cryptographic algorithms and key lengths)",
             "NIST IR 8547 (transition to post-quantum cryptography standards)",
             "FIPS 203 (ML-KEM)", "FIPS 204 (ML-DSA)", "FIPS 205 (SLH-DSA)"]
TIERS = ["Critical", "High", "Medium", "Low"]


def build(conn, scan) -> dict:
    assets = cbom._load(conn, scan["id"])
    tiers = {t: sum(1 for a in assets if a["tier"] == t) for t in TIERS}
    verdicts = {v: sum(1 for a in assets if a["verdict"] == v) for v in ("MIGRATE", "CONTAIN", "ACCEPT")}
    qv = [a for a in assets if a["breakdown"]["quantum_vulnerable"]]
    hndl = [a for a in qv if a["breakdown"]["mosca"]["exposure"] > 0]
    cleared = conn.execute("SELECT COUNT(*) FROM fixes WHERE status='cleared'").fetchone()[0]
    return {"generated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "target": scan["target"].replace("\\", "/").split("/")[-1],
            "scan": {"id": scan["id"], "files": scan["files_scanned"], "findings": scan["findings_count"],
                     "seconds": scan["seconds"], "started_at": scan["started_at"]},
            "counts": {"assets": len(assets), "quantum_vulnerable": len(qv), "hndl": len(hndl), "fixes_cleared": cleared},
            "planes": PLANES, "standards": STANDARDS, "tiers": tiers, "verdicts": verdicts,
            "findings": [{"label": a["label"], "tier": a["tier"], "score": a["score"], "verdict": a["verdict"],
                          "confidence": a["breakdown"]["confidence"], "wave": a["wave"]} for a in assets]}


def _t(s) -> str:
    return str(s).replace("→", "->").replace("—", "-").replace("–", "-").encode("latin-1", "replace").decode("latin-1")


def _esc(s) -> str:
    return _t(s).replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class _Pdf:
    W, H, M = 595, 842, 50

    def __init__(self):
        self.pages, self.ops, self.y = [], [], self.H - self.M

    def _new(self):
        if self.ops:
            self.pages.append("\n".join(self.ops))
        self.ops, self.y = [], self.H - self.M

    def text(self, s, size=10, bold=False, x=None, gap=None):
        x = self.M if x is None else x
        if self.y < self.M + size:
            self._new()
        self.ops.append(f"0.106 0.165 0.255 rg BT /{'F2' if bold else 'F1'} {size} Tf {x} {self.y} Td ({_esc(s)}) Tj ET")
        self.y -= size * 1.5 if gap is None else gap

    def para(self, s, size=10):
        n = int((self.W - 2 * self.M) / (size * 0.5))
        line = ""
        for w in _t(s).split():
            if len(line) + len(w) + 1 > n:
                self.text(line, size)
                line = w
            else:
                line = f"{line} {w}".strip()
        if line:
            self.text(line, size)

    def h(self, s):
        self.y -= 8
        if self.y < self.M + 60:
            self._new()
        self.text(s, 13, True, gap=8)
        self.ops.append(f"0.89 0.906 0.929 RG {self.M} {self.y + 2} m {self.W - self.M} {self.y + 2} l S")
        self.y -= 10

    def row(self, cells, widths, bold=False):
        x = self.M
        if self.y < self.M + 10:
            self._new()
        y0 = self.y
        for c, w in zip(cells, widths):
            self.y = y0
            self.text(_t(c)[: max(1, int(w / 5.2))], 9, bold, x=x, gap=0)
            x += w
        self.y = y0 - 14

    def out(self) -> bytes:
        self._new()
        objs = [b"<< /Type /Catalog /Pages 2 0 R >>", b"",
                b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
                b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"]
        kids = []
        for i, c in enumerate(self.pages):
            page, cont = 5 + 2 * i, 6 + 2 * i
            kids.append(f"{page} 0 R")
            foot = f"BT /F1 8 Tf 0.42 0.47 0.52 rg {self.M} 28 Td (MOX Compliance Report - page {i + 1} of {len(self.pages)}) Tj ET"
            body = (c + "\n" + foot).encode("latin-1")
            objs.append((f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {self.W} {self.H}] "
                         f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {cont} 0 R >>").encode())
            objs.append(b"<< /Length %d >>\nstream\n" % len(body) + body + b"\nendstream")
        objs[1] = f"<< /Type /Pages /Kids [{' '.join(kids)}] /Count {len(kids)} >>".encode()
        out, offs = bytearray(b"%PDF-1.4\n"), []
        for i, o in enumerate(objs, 1):
            offs.append(len(out))
            out += b"%d 0 obj\n" % i + o + b"\nendobj\n"
        x = len(out)
        out += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1)
        for o in offs:
            out += b"%010d 00000 n \n" % o
        out += b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objs) + 1, x)
        return bytes(out)


def render_pdf(d: dict) -> bytes:
    p, c, v = _Pdf(), d["counts"], d["verdicts"]
    p.text("Quantum-Readiness Compliance Report", 20, True, gap=26)
    p.text(f"Target: {d['target']}   |   Scan #{d['scan']['id']}   |   Generated {d['generated']}", 9, gap=18)
    p.h("1. Auditor's Declaration")
    p.para("[Placeholder - to be completed by the certifying auditor: name, organisation, accreditation number, date, and a "
           "statement that the audit was performed in accordance with the scope below.]")
    p.text("Signature: ______________________     Date: ______________", 10, gap=20)
    p.h("2. Executive Summary")
    p.para(f"MOX scanned {d['scan']['files']} files across {len(d['planes'])} planes and identified {c['assets']} cryptographic "
           f"assets ({d['scan']['findings']} raw findings). {c['quantum_vulnerable']} are quantum-vulnerable and {c['hndl']} are "
           f"exposed to harvest-now-decrypt-later risk. Verdicts: {v['MIGRATE']} MIGRATE, {v['CONTAIN']} CONTAIN, {v['ACCEPT']} ACCEPT.")
    p.h("3. Scope of Audit")
    p.para(f"Offline static and local-probe analysis of '{d['target']}' ({d['scan']['files']} files, {d['scan']['seconds']} s, "
           f"started {d['scan']['started_at']}). No network calls were made and no private key material was stored; "
           f"metadata and fingerprints only.")
    p.h("4. Tools Used")
    p.text("Discovery planes:", 10, True)
    for n, desc in d["planes"]:
        p.text(f"  - {n}: {desc}", 9.5)
    p.text("Standards and references:", 10, True)
    for s in d["standards"]:
        p.text(f"  - {s}", 9.5)
    p.text("Output format: CycloneDX 1.6 CBOM.", 9.5)
    p.h("5. Findings")
    w = [230, 55, 45, 65, 65, 35]
    p.row(["Asset", "Tier", "Score", "Verdict", "Confidence", "Wave"], w, True)
    for f in d["findings"]:
        p.row([f["label"], f["tier"], f["score"], f["verdict"], f["confidence"], f["wave"]], w)
    p.h("6. Risk Rating")
    for t in TIERS:
        p.text(f"  {t}: {d['tiers'][t]} asset(s)", 10)
    p.h("7. Compliance / Closure Status")
    p.text(f"  MIGRATE (replace with PQC): {v['MIGRATE']}", 10)
    p.text(f"  CONTAIN (compensating controls): {v['CONTAIN']}", 10)
    p.text(f"  ACCEPT (no action needed): {v['ACCEPT']}", 10)
    p.text(f"  Verified fixes cleared in this scan: {c['fixes_cleared']}", 10)
    return p.out()
