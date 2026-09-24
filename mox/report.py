"""Compliance Report. Every statement is derived from the scan record; nothing is hard-coded.
The PDF is written with the Python standard library only (PDF 1.4, base-14 Helvetica, no embedded fonts)."""
import json
from datetime import datetime, timezone

from . import cbom
from .nist import cite
from .score import exposed

PLANES = {"code": ("Source code", "regex rules over source files"),
          "dependencies": ("Dependencies", "known crypto libraries and versions in manifests"),
          "configs": ("Configuration", "TLS / SSH / crypto settings in config files"),
          "certificates": ("Certificates & keys", "X.509 and key files, metadata and SPKI fingerprints only"),
          "containers": ("Containers", "image layers and Dockerfiles"),
          "binaries": ("Binaries", "crypto library names and constants in compiled files"),
          "tls": ("Live TLS", "handshake probe of an endpoint the operator named")}
TIERS = ["Critical", "High", "Medium", "Low"]
VERDICT_MEANING = {"MIGRATE": "replace per the PQC map", "CONTAIN": "compensating controls; cannot patch in place",
                   "ACCEPT": "monitor; re-assess at the next scan"}


def _alg(a) -> str:
    return f"{a['algorithm']}-{a['key_size']}" if a.get("key_size") else a["algorithm"]


def _loc(a) -> str:
    fs = a["findings"]
    if not fs:
        return "-"
    more = f" (+{len(fs) - 1} more)" if len(fs) > 1 else ""
    return f"{fs[0]['file']}:{fs[0]['line']}{more}"


def network_statement(net: dict | None, probe: str | None, probe_error: str | None) -> str:
    """What the scan record says about sockets, in words. Never asserts more than was counted."""
    if not net or not net.get("guard"):
        s = "This scan ran without the socket hook, so network connects were not measured."
    else:
        s = (f"During the scan the socket hook (mox/netguard.py) counted {net['outbound']} outbound and "
             f"{net['loopback']} loopback connects from the MOX process. DNS lookups and other processes are not counted.")
    if probe:
        s += f" A live TLS probe of {probe} was requested" + (f" and failed ({probe_error})." if probe_error else ".")
    else:
        s += " No live TLS probe was requested."
    return s


def build(conn, scan) -> dict:
    assets = cbom._load(conn, scan["id"])
    tiers = {t: sum(1 for a in assets if a["tier"] == t) for t in TIERS}
    verdicts = {v: sum(1 for a in assets if a["verdict"] == v) for v in ("MIGRATE", "CONTAIN", "ACCEPT")}
    qv = [a for a in assets if a["breakdown"]["quantum_vulnerable"]]
    hit = json.loads(scan["planes_hit"] or "{}")
    ran = [p for p in PLANES if p in hit]
    fixes = {s: 0 for s in ("cleared", "not-in-effect", "still-present")}
    for r in conn.execute("SELECT status, data FROM fixes"):
        if json.loads(r["data"] or "{}").get("scan_id") == scan["id"] and r["status"] in fixes:
            fixes[r["status"]] += 1
    sources = {s for (s,) in conn.execute("SELECT DISTINCT nist_source FROM findings WHERE scan_id=?", (scan["id"],)) if s}
    standards = sorted({c for s in sources for c in cite(s)})
    reps = {r["to"] for a in assets for r in a.get("replacements", [])}
    for alg, src in (("ML-KEM", "203"), ("ML-DSA", "204")):  # the replacement standards this report recommends
        if any(alg in r for r in reps):
            standards += cite(src)
    net = json.loads(scan["net"] or "null") if "net" in scan.keys() else None
    return {"generated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "target": scan["target"].replace("\\", "/").split("/")[-1],
            "scan": {"id": scan["id"], "files": scan["files_scanned"], "findings": scan["findings_count"],
                     "seconds": scan["seconds"], "started_at": scan["started_at"]},
            "counts": {"assets": len(assets), "quantum_vulnerable": len(qv),
                       "hndl": sum(1 for a in qv if exposed(a, "hndl")),
                       "undetermined": sum(1 for a in qv if "undetermined" in a["breakdown"]["threats"]),
                       "fixes_cleared": fixes["cleared"], "fixes_not_in_effect": fixes["not-in-effect"],
                       "unverified_accepts": sum(1 for a in assets if a["verdict"] == "ACCEPT" and a.get("verify_first"))},
            "planes": [list(PLANES[p]) for p in ran], "planes_not_run": [PLANES[p][0] for p in PLANES if p not in hit],
            "network": network_statement(net, scan["probe"], scan["probe_error"]),
            "standards": list(dict.fromkeys(standards)), "tiers": tiers, "verdicts": verdicts,
            "findings": [{"label": a["label"], "algorithm": _alg(a), "location": _loc(a), "tier": a["tier"], "score": a["score"],
                          "verdict": a["verdict"], "confidence": a["breakdown"]["confidence"], "wave": a["wave"]} for a in assets]}


def with_text(d: dict) -> dict:
    """The report data plus the exact sentences the PDF prints, so the screen and the PDF cannot disagree."""
    return {**d, "summary": summary_text(d), "scope": scope_text(d)}


def _are(n: int) -> str:
    return "is" if n == 1 else "are"


def summary_text(d: dict) -> str:
    c, v = d["counts"], d["verdicts"]
    n = len(d["planes"])
    return (f"MOX scanned {d['scan']['files']} files across {n} of {n + len(d['planes_not_run'])} planes and correlated "
            f"{d['scan']['findings']} findings into {c['assets']} cryptographic assets. {c['quantum_vulnerable']} "
            f"{_are(c['quantum_vulnerable'])} quantum-vulnerable (Shor). {c['hndl']} {_are(c['hndl'])} exposed to "
            f"harvest-now-decrypt-later risk through a declared encryption or key-exchange use; {c['undetermined']} "
            f"more {'has' if c['undetermined'] == 1 else 'have'} no declared purpose. Verdicts: "
            f"{v['MIGRATE']} MIGRATE, {v['CONTAIN']} CONTAIN, {v['ACCEPT']} ACCEPT.")


def scope_text(d: dict) -> str:
    s = (f"Static analysis of '{d['target']}': {d['scan']['files']} files in {d['scan']['seconds']} s, started "
         f"{d['scan']['started_at']}. Planes run: {', '.join(p[0] for p in d['planes']) or 'none'}.")
    if d["planes_not_run"]:
        s += f" Not run: {', '.join(d['planes_not_run'])}; findings in those planes are not in this report."
    return s + " " + d["network"] + " MOX stores metadata and fingerprints only, never private key material."


# ---------------------------------------------------------------- minimal PDF writer (stdlib only)
_W = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278] + [556] * 10 + [
    278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
    667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556,
    278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334,
    260, 334, 584]  # Helvetica AFM widths, ASCII 32-126
_SUBST = {"→": "->", "−": "-", "×": "x", "≤": "<=", "≥": ">=", "–": "-", "—": "-",
          "…": "...", "‘": "'", "’": "'", "“": '"', "”": '"', "•": "-"}
A4 = (595.28, 841.89)
M = 56.7  # 20 mm margins
INK, MUTED, LINE = (0.106, 0.165, 0.255), (0.42, 0.467, 0.522), (0.89, 0.906, 0.929)


def _clean(s) -> str:
    s = "".join(_SUBST.get(ch, ch) for ch in str(s))
    return s.encode("cp1252", "replace").decode("cp1252")


def _width(s: str, size: float, bold=False) -> float:
    w = sum(_W[ord(ch) - 32] if 32 <= ord(ch) <= 126 else 556 for ch in s)
    return w * size / 1000 * (1.06 if bold else 1.0)


def _wrap(s: str, size: float, width: float, bold=False) -> list[str]:
    out = []
    for para in _clean(s).split("\n"):
        line = ""
        for word in para.split(" "):
            cand = f"{line} {word}" if line else word
            if _width(cand, size, bold) <= width or not line:
                line = cand
            else:
                out.append(line)
                line = word
        out.append(line)
    return out


def _esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


class _Doc:
    def __init__(self):
        self.pages: list[list[str]] = []
        self.new_page()

    def new_page(self):
        self.pages.append([])
        self.y = A4[1] - M

    def need(self, h):
        if self.y - h < M + 20:
            self.new_page()

    def text(self, x, y, s, size=10, bold=False, rgb=INK):
        self.pages[-1].append(f"BT /{'F2' if bold else 'F1'} {size} Tf {rgb[0]:.3f} {rgb[1]:.3f} {rgb[2]:.3f} rg "
                              f"{x:.2f} {y:.2f} Td ({_esc(s)}) Tj ET")

    def rule(self, y, w=0.5, rgb=LINE, x0=M, x1=A4[0] - M):
        self.pages[-1].append(f"{rgb[0]:.3f} {rgb[1]:.3f} {rgb[2]:.3f} RG {w} w {x0:.2f} {y:.2f} m {x1:.2f} {y:.2f} l S")

    def fill(self, x, y, w, h, rgb):
        self.pages[-1].append(f"{rgb[0]:.3f} {rgb[1]:.3f} {rgb[2]:.3f} rg {x:.2f} {y:.2f} {w:.2f} {h:.2f} re f")

    def para(self, s, size=10, bold=False, rgb=INK, gap=4, indent=0):
        lead = size * 1.4
        for ln in _wrap(s, size, A4[0] - 2 * M - indent, bold):
            self.need(lead)
            self.y -= lead
            self.text(M + indent, self.y, ln, size, bold, rgb)
        self.y -= gap

    def heading(self, s):
        self.need(40)
        self.y -= 14
        self.para(s, 13, True, gap=2)
        self.rule(self.y)
        self.y -= 6

    def table(self, rows, widths, size=8.5):
        lead = size * 1.3
        for n, row in enumerate(rows):
            cells = [_wrap(c, size, w - 8, n == 0) for c, w in zip(row, widths)]
            h = max(len(c) for c in cells) * lead + 6
            self.need(h)
            top = self.y
            if n == 0:
                self.fill(M, top - h, sum(widths), h, INK)
            x = M
            for c, w in zip(cells, widths):
                for i, ln in enumerate(c):
                    self.text(x + 4, top - 4 - (i + 1) * lead + 2, ln, size, n == 0, (1, 1, 1) if n == 0 else INK)
                x += w
            self.y = top - h
            self.rule(self.y)

    def render(self, title: str) -> bytes:
        objs = [b"<< /Type /Catalog /Pages 2 0 R >>", None,
                b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
                b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
                f"<< /Title ({_esc(_clean(title))}) /Producer (MOX) >>".encode("cp1252")]
        kids = []
        for i, ops in enumerate(self.pages, 1):
            foot = (f"BT /F1 8 Tf {MUTED[0]} {MUTED[1]} {MUTED[2]} rg {M:.2f} 34 Td (MOX Compliance Report) Tj ET "
                    f"BT /F1 8 Tf {A4[0] - M - 60:.2f} 34 Td (Page {i} of {len(self.pages)}) Tj ET")
            stream = ("\n".join(ops) + "\n" + foot).encode("cp1252")
            objs.append(b"<< /Length %d >>\nstream\n" % len(stream) + stream + b"\nendstream")
            objs.append(f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {A4[0]} {A4[1]}] "
                        f"/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents {len(objs)} 0 R >>".encode())
            kids.append(len(objs))
        objs[1] = f"<< /Type /Pages /Kids [{' '.join(f'{k} 0 R' for k in kids)}] /Count {len(kids)} >>".encode()
        out, offs = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"), []
        for n, body in enumerate(objs, 1):
            offs.append(len(out))
            out += b"%d 0 obj\n" % n + body + b"\nendobj\n"
        xref = len(out)
        out += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1)
        out += b"".join(b"%010d 00000 n \n" % o for o in offs)
        out += b"trailer\n<< /Size %d /Root 1 0 R /Info 5 0 R >>\nstartxref\n%d\n%%%%EOF\n" % (len(objs) + 1, xref)
        return bytes(out)


def render_pdf(d: dict) -> bytes:
    c, v = d["counts"], d["verdicts"]
    doc = _Doc()
    doc.para("Quantum-Readiness Compliance Report", 22, True, gap=2)
    doc.para(f"Target: {d['target']}  |  Scan #{d['scan']['id']}  |  Generated {d['generated']}", 10, rgb=MUTED)
    doc.rule(doc.y, 1.2, INK)
    doc.heading("1. Auditor's Declaration")
    doc.para("[Placeholder - to be completed by the certifying auditor: name, organisation, accreditation number, date, "
             "and a statement that the audit was performed in accordance with the scope below.]")
    doc.para("Signature: ______________________          Date: ______________")
    doc.heading("2. Executive Summary")
    doc.para(summary_text(d))
    doc.heading("3. Scope of Audit")
    doc.para(scope_text(d))
    doc.heading("4. Tools Used")
    doc.para("Discovery planes that ran:", bold=True)
    for n, t in d["planes"]:
        doc.para(f"- {n}: {t}", indent=8, gap=0)
    doc.y -= 4
    doc.para("Standards cited by the findings in this scan:", bold=True)
    for s in d["standards"]:
        doc.para(f"- {s}", indent=8, gap=0)
    doc.para("- Output format: CycloneDX 1.6 CBOM.", indent=8)
    doc.heading("5. Findings")
    doc.table([["Algorithm", "Location", "Tier", "Verdict", "Wave"]] +
              [[f["algorithm"], f["location"], f["tier"], f["verdict"], str(f["wave"])] for f in d["findings"]],
              [95, 225, 60, 70, 31.9])
    doc.heading("6. Risk Rating")
    for t in TIERS:
        doc.para(f"{t}: {d['tiers'][t]} asset(s)", gap=0)
    doc.heading("7. Compliance / Closure Status")
    for k in ("MIGRATE", "CONTAIN", "ACCEPT"):
        doc.para(f"{k} ({VERDICT_MEANING[k]}): {v[k]}", gap=0)
    if c["unverified_accepts"]:
        doc.para(f"Of the ACCEPT verdicts, {c['unverified_accepts']} rest on unverified evidence (a library with no call site found).", gap=0)
    doc.para(f"Fixes verified cleared by re-scan against this scan: {c['fixes_cleared']}", gap=0)
    if c["fixes_not_in_effect"]:
        doc.para(f"Fixes applied but not fully in effect: {c['fixes_not_in_effect']} (not counted as cleared)", gap=0)
    return doc.render("MOX Compliance Report")
