"""FastAPI app: /api/* (SPEC section 13) + serves web/dist. Offline; no outbound calls."""
import json
import sqlite3

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import attest, auth, cbom, db, jobs, netguard, report, scanner
from .fixers import flow
from .analyze import analyze
from .db import ROOT
from .score import DEFAULTS, exposed

DIST = ROOT / "web" / "dist"


def _conn():
    # FastAPI enters and exits a sync generator dependency in separate threadpool calls, so close() can run on
    # another thread; a same-thread-only connection then raised ProgrammingError and turned the response into a 500.
    conn = db.connect(check_same_thread=False)
    try:
        yield conn
    finally:
        conn.close()


def _user(request: Request):
    u = auth.read_token(request.cookies.get(auth.COOKIE))
    if not u:
        raise HTTPException(401, "not authenticated")
    return u


class Login(BaseModel):
    username: str
    password: str


class ScanReq(BaseModel):
    path: str | None = None
    probe: str | None = None


class StartReq(BaseModel):
    path: str = ""
    planes: list[str] | None = None
    probe: str | None = None


class SettingsReq(BaseModel):
    threat_horizon: int | None = None


class FixReq(BaseModel):
    finding_id: int


class ApplyReq(BaseModel):
    note: str = ""


class AttestReq(BaseModel):
    sector: str = "government"


class OverrideReq(BaseModel):
    x: int | None = None
    criticality: int | None = None


def _settings(conn) -> dict:
    st = dict(DEFAULTS)
    for r in conn.execute("SELECT key,value FROM settings"):
        st[r["key"]] = json.loads(r["value"])
    return st


def _overrides(conn) -> dict:
    return {r["asset_key"]: {"x": r["x"], "criticality": r["criticality"]}
            for r in conn.execute("SELECT * FROM overrides")}


def _latest(conn):
    return conn.execute("SELECT * FROM scans ORDER BY id DESC LIMIT 1").fetchone()


def _reanalyze(conn, scan_id):
    analyze(scan_id, conn, _settings(conn), _overrides(conn))


def _asset(conn, row, full=False) -> dict:
    d = json.loads(row["data"])
    d["id"] = row["id"]
    d.pop("finding_ids", None)
    d.pop("hybrid_finding_ids", None)
    locs = d.get("locations") or []
    # "Open fix" is offered only where a fixer actually produces a patch for the file as it is now.
    ok = flow.fixable(conn, [l["finding_id"] for l in locs if l["plane"] in ("code", "configs")])
    d["fix_finding"] = next((l["finding_id"] for l in locs if l["finding_id"] in ok), None)
    if full:
        for l in locs:
            l["fixable"] = l["finding_id"] in ok
        d["findings"] = [dict(r) for r in conn.execute(
            "SELECT f.* FROM findings f JOIN asset_locations l ON l.finding_id=f.id"
            " WHERE l.asset_id=? ORDER BY f.file,f.line", (row["id"],))]
    else:
        d.pop("locations", None)
        d.pop("findings", None)
        d["planes"] = sorted({l["plane"] for l in locs})  # plane tag on every queue row
        d["files"] = sorted({l["file"] for l in locs})
    return d


def _assets(conn, scan_id):
    rows = conn.execute("SELECT * FROM assets WHERE scan_id=?", (scan_id,)).fetchall()
    return sorted((_asset(conn, r) for r in rows), key=lambda a: -a["score"])


def _summary(scan, assets) -> dict:
    qv = [a for a in assets if a["breakdown"]["quantum_vulnerable"]]
    hndl = [a for a in qv if exposed(a, "hndl")]
    verdicts = {"MIGRATE": 0, "CONTAIN": 0, "ACCEPT": 0}
    for a in assets:
        verdicts[a["verdict"]] += 1
    planes = json.loads(scan["planes_hit"])
    return {"scan": {k: scan[k] for k in ("id", "target", "started_at", "seconds", "files_scanned",
                                          "findings_count")} | {"planes": planes,
                                                                "net": json.loads(scan["net"] or "null")},
            "kpi": {"files": scan["files_scanned"], "planes": len(planes), "seconds": scan["seconds"],
                    "assets": len(assets), "hndl": len(hndl), "quantum_vulnerable": len(qv),
                    "forgery": sum(1 for a in qv if exposed(a, "forgery")),
                    "undetermined": sum(1 for a in qv if "undetermined" in a["breakdown"]["threats"]),
                    "readiness": attest.readiness({"total": len(assets), "hndl_exposed": len(hndl),
                                                   "quantum_vulnerable": len(qv)},
                                                  {"migrate": verdicts["MIGRATE"]}, len(planes)),
                    "safe": len(assets) - len(qv), "hybrid": sum(1 for a in assets if a["hybrid"])},
            "verdicts": verdicts,
            "stages": json.loads(scan["stages"] or "[]"),
            "field": [{"id": a["id"], "label": a["label"], "exposure": a["breakdown"]["mosca"]["exposure"],
                       "criticality": a["breakdown"]["criticality"], "tier": a["tier"], "score": a["score"]}
                      for a in assets if a["breakdown"]["mosca"]["exposure"] is not None],
            "unplotted": sum(1 for a in assets if a["breakdown"]["mosca"]["exposure"] is None)}


def create_app() -> FastAPI:
    netguard.install()  # count every socket connect this server makes; shown in the top bar
    app = FastAPI(title="MOX", docs_url=None, redoc_url=None, openapi_url=None)

    @app.post("/api/auth/login")
    def login(body: Login, response: Response, conn: sqlite3.Connection = Depends(_conn)):
        row = auth.check_login(conn, body.username, body.password)
        if not row:
            auth.audit(conn, body.username[:64], "login-failed")
            raise HTTPException(401, "invalid credentials")
        auth.audit(conn, row["username"], "login-ok")
        response.set_cookie(auth.COOKIE, auth.make_token(row), httponly=True, samesite="strict", max_age=auth.TTL)
        return {"username": row["username"], "role": row["role"]}

    @app.post("/api/auth/logout")
    def logout(response: Response):
        response.delete_cookie(auth.COOKIE)
        return {"ok": True}

    @app.get("/api/auth/me")
    def me(u=Depends(_user)):
        return {"username": u["sub"], "role": u["role"]}

    @app.post("/api/scans")
    def start_scan(body: ScanReq, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        target = body.path or str(ROOT / "demo_target")
        try:
            s = scanner.scan(target, probe=body.probe, conn=conn, settings=_settings(conn), overrides=_overrides(conn))
        except FileNotFoundError as e:
            raise HTTPException(400, str(e))
        auth.audit(conn, u["sub"], "scan", f"{target} -> {s['findings']} findings, {s['assets']} assets")
        return s

    @app.post("/api/scans/start")
    def scan_start(body: StartReq, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        try:
            return jobs.start(body.path, u["sub"], _settings(conn), _overrides(conn), body.planes, body.probe)
        except jobs.JobError as e:
            raise HTTPException(e.status, str(e))

    @app.get("/api/scans/{job_id}/events")
    def scan_events(job_id: int, request: Request, u=Depends(_user)):
        after = request.headers.get("last-event-id", "0")
        try:
            jobs.status(job_id)  # 404 now, not inside the stream
        except jobs.JobError as e:
            raise HTTPException(e.status, str(e))
        body = jobs.stream(job_id, int(after) if after.isdigit() else 0)
        return StreamingResponse(body, media_type="text/event-stream",
                                 headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"})

    @app.get("/api/netstat")
    def netstat(u=Depends(_user)):
        return netguard.counts() | {"planes": netguard.plane_sockets()}

    @app.get("/api/scans/{job_id}/status")
    def scan_status(job_id: int, u=Depends(_user)):
        try:
            return jobs.status(job_id)
        except jobs.JobError as e:
            raise HTTPException(e.status, str(e))

    @app.get("/api/scans/latest")
    def latest(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        scan = _latest(conn)
        if not scan:
            return {"scan": None}
        return _summary(scan, _assets(conn, scan["id"]))

    @app.get("/api/assets")
    def assets(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        scan = _latest(conn)
        return _assets(conn, scan["id"]) if scan else []

    @app.get("/api/assets/{asset_id}")
    def asset(asset_id: int, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        row = conn.execute("SELECT * FROM assets WHERE id=?", (asset_id,)).fetchone()
        if not row:
            raise HTTPException(404, "asset not found")
        return _asset(conn, row, full=True)

    @app.put("/api/assets/{asset_id}/override")
    def override(asset_id: int, body: OverrideReq, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        row = conn.execute("SELECT * FROM assets WHERE id=?", (asset_id,)).fetchone()
        if not row:
            raise HTTPException(404, "asset not found")
        if body.criticality not in (None, 1, 2, 3) or (body.x is not None and not 0 <= body.x <= 50):
            raise HTTPException(422, "criticality must be 1-3, x 0-50")
        key = json.loads(row["data"])["key"]
        conn.execute("INSERT OR REPLACE INTO overrides(asset_key,x,criticality) VALUES(?,?,?)",
                     (key, body.x, body.criticality))
        conn.commit()
        _reanalyze(conn, row["scan_id"])
        auth.audit(conn, u["sub"], "override", f"{row['label']} x={body.x} criticality={body.criticality}")
        new = next(r for r in conn.execute("SELECT * FROM assets WHERE scan_id=?", (row["scan_id"],))
                   if json.loads(r["data"])["key"] == key)
        return _asset(conn, new, full=True)

    @app.get("/api/settings")
    def get_settings(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        return _settings(conn)

    @app.put("/api/settings")
    def put_settings(body: SettingsReq, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        if body.threat_horizon is not None:
            if not 1 <= body.threat_horizon <= 40:
                raise HTTPException(422, "threat_horizon must be 1-40")
            conn.execute("INSERT OR REPLACE INTO settings(key,value) VALUES('threat_horizon',?)",
                         (json.dumps(body.threat_horizon),))
            conn.commit()
            scan = _latest(conn)
            if scan:
                _reanalyze(conn, scan["id"])
            auth.audit(conn, u["sub"], "settings", f"threat_horizon={body.threat_horizon}")
        return _settings(conn)

    def _fix(fn, *a):
        try:
            return fn(*a)
        except flow.FixError as e:
            raise HTTPException(e.status, str(e))

    @app.post("/api/fixes/preview")
    def fix_preview(body: FixReq, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        return _fix(flow.preview, conn, body.finding_id, u["sub"])

    @app.get("/api/fixes")
    def fix_candidates(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        return flow.candidates(conn)

    @app.get("/api/fixes/{fix_id}")
    def fix_get(fix_id: int, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        return _fix(flow.get, conn, fix_id)

    @app.post("/api/fixes/{fix_id}/apply")
    def fix_apply(fix_id: int, body: ApplyReq, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        r = _fix(flow.apply, conn, fix_id, u["sub"], body.note)
        scan = _latest(conn)
        if scan:
            _reanalyze(conn, scan["id"])
        return r

    def _cbom(conn):
        scan = _latest(conn)
        if not scan:
            raise HTTPException(404, "no scan yet")
        version = 1 + conn.execute("SELECT COUNT(*) FROM fixes WHERE status IN ('cleared','still-present','not-in-effect')").fetchone()[0]
        bom = cbom.build(conn, scan["id"], version)
        return bom, cbom.validate(bom)

    @app.get("/api/cbom")
    def cbom_summary(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        bom, errs = _cbom(conn)
        return {"valid": not errs, "errors": errs, "version": bom["version"], "spec": bom["specVersion"],
                "components": len(bom["components"]), "bom": bom}

    @app.get("/api/cbom/download")
    def cbom_download(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        bom, errs = _cbom(conn)
        if errs:
            raise HTTPException(500, "CBOM failed schema validation")
        auth.audit(conn, u["sub"], "cbom-export", f"v{bom['version']} {len(bom['components'])} components")
        return Response(json.dumps(bom, indent=2), media_type="application/vnd.cyclonedx+json",
                        headers={"Content-Disposition": 'attachment; filename="mox-cbom.cdx.json"'})

    @app.get("/api/roadmap")
    def roadmap(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        scan = _latest(conn)
        return cbom.roadmap(conn, scan["id"]) if scan else []

    def _report(conn):
        scan = _latest(conn)
        if not scan:
            raise HTTPException(404, "no scan yet")
        return report.with_text(report.build(conn, scan))

    @app.get("/api/report")
    def report_data(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        return _report(conn)

    @app.get("/api/report/download")
    def report_download(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        d = _report(conn)
        auth.audit(conn, u["sub"], "report-export", f"{d['counts']['assets']} assets")
        return Response(report.render_pdf(d), media_type="application/pdf",
                        headers={"Content-Disposition": 'attachment; filename="mox-compliance-report.pdf"'})

    def _attest(conn, sector):
        scan = _latest(conn)
        if not scan:
            raise HTTPException(404, "no scan yet")
        try:
            att = attest.build(conn, scan["id"], sector)
        except ValueError as e:
            raise HTTPException(422 if sector not in attest.SECTORS else 500, str(e))
        return scan, att

    @app.get("/api/attest")
    def attest_preview(sector: str = "government", u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        scan, att = _attest(conn, sector)
        return {"attestation": att, "bytes": len(json.dumps(att, indent=2)), "sectors": attest.SECTORS,
                "checks": attest.self_check(conn, att, scan["id"])}

    @app.post("/api/attest/export")
    def attest_export(body: AttestReq, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        _, att = _attest(conn, body.sector)
        auth.audit(conn, u["sub"], "attestation-export",
                   f"{att['sector']} readiness={att['readiness_index']} root={att['cbom_merkle_root'][:12]}")
        return Response(json.dumps(att, indent=2), media_type="application/json",
                        headers={"Content-Disposition": 'attachment; filename="mox-attestation.json"'})

    @app.get("/api/sectors")
    def sectors(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        return attest.sector_view(conn)

    @app.get("/api/audit")
    def audit_log(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        return [dict(r) for r in conn.execute("SELECT * FROM audit ORDER BY id DESC LIMIT 200")]

    if DIST.is_dir():
        app.mount("/assets", StaticFiles(directory=DIST / "assets"), name="assets")

        @app.get("/{path:path}")
        def spa(path: str):
            if path.startswith("api/"):
                raise HTTPException(404)
            f = (DIST / path).resolve()
            if path and f.is_file() and DIST.resolve() in f.parents:
                return FileResponse(f)
            return FileResponse(DIST / "index.html")

    return app


app = create_app()


def serve(host="127.0.0.1", port=8000):
    import uvicorn
    uvicorn.run("mox.api:app", host=host, port=port, log_level="warning")
