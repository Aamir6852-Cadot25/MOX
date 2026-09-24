"""Compliance Report (PDF). Data = live scan + CBOM stats; PDF is written with the stdlib (no extra deps)."""
from datetime import datetime, timezone

import io
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from . import cbom
from .score import exposed

PLANES = [("Source code", "regex/AST rules over source files"), ("Dependencies", "known crypto libraries and versions"),
          ("Configuration", "TLS/SSH/crypto settings in config files"), ("Certificates & keys", "X.509 and key files, metadata only"),
          ("Containers", "image and manifest crypto usage"), ("Binaries", "linked crypto libraries and constants"),
          ("Live TLS", "handshake probe of the local demo endpoint")]
STANDARDS = ["NIST SP 800-131A (transitions of cryptographic algorithms and key lengths)",
             "NIST IR 8547 (transition to post-quantum cryptography standards)",
             "FIPS 203 (ML-KEM)", "FIPS 204 (ML-DSA)", "FIPS 205 (SLH-DSA)"]
TIERS = ["Critical", "High", "Medium", "Low"]


def _alg(a) -> str:
    return f"{a['algorithm']}-{a['key_size']}" if a.get("key_size") else a["algorithm"]


def _loc(a) -> str:
    fs = a["findings"]
    if not fs:
        return "-"
    more = f" (+{len(fs) - 1} more)" if len(fs) > 1 else ""
    return f"{fs[0]['file']}:{fs[0]['line']}{more}"


def build(conn, scan) -> dict:
    assets = cbom._load(conn, scan["id"])
    tiers = {t: sum(1 for a in assets if a["tier"] == t) for t in TIERS}
    verdicts = {v: sum(1 for a in assets if a["verdict"] == v) for v in ("MIGRATE", "CONTAIN", "ACCEPT")}
    qv = [a for a in assets if a["breakdown"]["quantum_vulnerable"]]
    hndl = [a for a in qv if exposed(a, "hndl")]
    cleared = conn.execute("SELECT COUNT(*) FROM fixes WHERE status='cleared'").fetchone()[0]
    return {"generated": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "target": scan["target"].replace("\\", "/").split("/")[-1],
            "scan": {"id": scan["id"], "files": scan["files_scanned"], "findings": scan["findings_count"],
                     "seconds": scan["seconds"], "started_at": scan["started_at"]},
            "counts": {"assets": len(assets), "quantum_vulnerable": len(qv), "hndl": len(hndl), "fixes_cleared": cleared},
            "planes": PLANES, "standards": STANDARDS, "tiers": tiers, "verdicts": verdicts,
            "findings": [{"label": a["label"], "algorithm": _alg(a), "location": _loc(a), "tier": a["tier"], "score": a["score"],
                          "verdict": a["verdict"], "confidence": a["breakdown"]["confidence"], "wave": a["wave"]} for a in assets]}


INK, MUTED, LINE = colors.HexColor("#1B2A41"), colors.HexColor("#6B7785"), colors.HexColor("#E3E7ED")


def _footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(20 * mm, 12 * mm, "MOX Compliance Report")
    canvas.drawRightString(A4[0] - 20 * mm, 12 * mm, f"Page {doc.page}")
    canvas.restoreState()


def render_pdf(d: dict) -> bytes:
    ss = getSampleStyleSheet()
    body = ParagraphStyle("b", parent=ss["BodyText"], fontSize=10, leading=14, textColor=INK)
    small = ParagraphStyle("s", parent=body, fontSize=8.5, leading=11)
    title = ParagraphStyle("t", parent=ss["Title"], fontSize=22, leading=26, alignment=0, textColor=INK)
    sub = ParagraphStyle("sub", parent=body, textColor=MUTED)
    h = ParagraphStyle("h", parent=ss["Heading2"], fontSize=13, spaceBefore=14, spaceAfter=6, textColor=INK)
    P = lambda t, st=body: Paragraph(escape(str(t)), st)
    c, v = d["counts"], d["verdicts"]
    story = [P("Quantum-Readiness Compliance Report", title),
             P(f"Target: {d['target']}  |  Scan #{d['scan']['id']}  |  Generated {d['generated']}", sub)]
    rule = Table([[""]], colWidths=[170 * mm], rowHeights=[3])
    rule.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), 1.2, INK)]))
    story += [rule]

    def sec(t):
        story.append(P(t, h))
        story.append(Table([[""]], colWidths=[170 * mm], rowHeights=[2], style=[("LINEBELOW", (0, 0), (-1, -1), 0.5, LINE)]))
        story.append(Spacer(1, 4))

    sec("1. Auditor's Declaration")
    story += [P("[Placeholder - to be completed by the certifying auditor: name, organisation, accreditation number, date, and a "
                "statement that the audit was performed in accordance with the scope below.]"), Spacer(1, 10),
              P("Signature: ______________________          Date: ______________")]
    sec("2. Executive Summary")
    story.append(P(f"MOX scanned {d['scan']['files']} files across {len(d['planes'])} planes and identified {c['assets']} cryptographic "
                   f"assets ({d['scan']['findings']} raw findings). {c['quantum_vulnerable']} are quantum-vulnerable and {c['hndl']} are "
                   f"exposed to harvest-now-decrypt-later risk. Verdicts: {v['MIGRATE']} MIGRATE, {v['CONTAIN']} CONTAIN, {v['ACCEPT']} ACCEPT."))
    sec("3. Scope of Audit")
    story.append(P(f"Offline static and local-probe analysis of '{d['target']}' ({d['scan']['files']} files, {d['scan']['seconds']} s, "
                   f"started {d['scan']['started_at']}). No network calls were made and no private key material was stored; "
                   f"metadata and fingerprints only."))
    sec("4. Tools Used")
    story.append(P("Discovery planes:", ParagraphStyle("bb", parent=body, fontName="Helvetica-Bold")))
    story += [P(f"• {n}: {t}") for n, t in d["planes"]]
    story.append(Spacer(1, 4))
    story.append(P("Standards and references:", ParagraphStyle("bb2", parent=body, fontName="Helvetica-Bold")))
    story += [P(f"• {s}") for s in d["standards"]] + [P("• Output format: CycloneDX 1.6 CBOM.")]
    sec("5. Findings")
    rows = [[P(x, ParagraphStyle("th", parent=small, fontName="Helvetica-Bold", textColor=colors.white))
             for x in ("Algorithm", "Location", "Tier", "Verdict")]]
    rows += [[P(f["algorithm"], small), P(f["location"], small), P(f["tier"], small), P(f["verdict"], small)] for f in d["findings"]]
    t = Table(rows, colWidths=[35 * mm, 87 * mm, 22 * mm, 26 * mm], repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), INK), ("GRID", (0, 0), (-1, -1), 0.5, LINE),
                           ("BOX", (0, 0), (-1, -1), 1, INK), ("VALIGN", (0, 0), (-1, -1), "TOP"),
                           ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7F8FA")])]))
    story.append(t)
    sec("6. Risk Rating")
    story += [P(f"{tier}: {d['tiers'][tier]} asset(s)") for tier in TIERS]
    sec("7. Compliance / Closure Status")
    story += [P(f"MIGRATE (replace with PQC): {v['MIGRATE']}"), P(f"CONTAIN (compensating controls): {v['CONTAIN']}"),
              P(f"ACCEPT (no action needed): {v['ACCEPT']}"), P(f"Verified fixes cleared in this scan: {c['fixes_cleared']}")]
    buf = io.BytesIO()
    SimpleDocTemplate(buf, pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm, topMargin=18 * mm, bottomMargin=20 * mm,
                      title="MOX Compliance Report", author="MOX").build(story, onFirstPage=_footer, onLaterPages=_footer)
    return buf.getvalue()
