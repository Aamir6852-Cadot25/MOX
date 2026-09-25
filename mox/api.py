"""FastAPI app: /api/* (SPEC section 13) + serves web/dist. Offline; no outbound calls."""
import json
import sqlite3

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, Response, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import attest, auth, browse, cbom, coverage, db, extract, gitsource, jobs, netguard, projects, report, scanner, source
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
    probes: list[str] | None = None
    tls_authorized: bool = False
    project_id: int | None = None
    source: str = "folder"  # "folder" | "git" | "tls"
    git_remote: str | None = None
    git_authorized: bool = False


class SettingsReq(BaseModel):
    threat_horizon: int | None = None


class ProjectReq(BaseModel):
    name: str
    sector: str | None = None
    system_type: str | None = None
    criticality: int | None = None
    shelf_life_years: int | None = None


class ProjectUpdateReq(BaseModel):
    name: str | None = None
    sector: str | None = None
    system_type: str | None = None
    criticality: int | None = None
    shelf_life_years: int | None = None


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
    # One real file:line for the queue/matrix row (Quantum Risk list); None when the location has no line.
    loc0 = locs[0] if locs else None
    d["primary_location"] = (f"{loc0['file']}:{loc0['line']}" if loc0 and loc0.get("line") else loc0["file"] if loc0 else None)
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


def _verdict_detail(assets) -> dict:
    """What each verdict holds, for the dashboard's "is anything on fire?" (docs/SCREENS.md). All from the scan."""
    by = {v: [a for a in assets if a["verdict"] == v] for v in ("MIGRATE", "CONTAIN", "ACCEPT")}
    wave1 = sorted((a for a in by["MIGRATE"] + by["CONTAIN"] if a["wave"] == 1), key=lambda a: -a["score"])
    contain = {}
    for a in by["CONTAIN"]:
        k = a["breakdown"]["cmcs"]["basis"]
        contain[k] = contain.get(k, 0) + 1
    top = wave1[0] if wave1 else None
    return {"wave1": len(wave1),
            "most_urgent": top and {"id": top["id"], "label": top["label"], "tier": top["tier"], "score": top["score"],
                                    "why": top["wave_reason"].split(". ")[0]},
            "migrate": {"wave1": sum(1 for a in by["MIGRATE"] if a["wave"] == 1),
                        "auto_fix": sum(1 for a in by["MIGRATE"] if a.get("fix_finding"))},
            "contain": sorted(contain.items(), key=lambda kv: -kv[1]),
            "accept": {"unverified": sum(1 for a in by["ACCEPT"] if a.get("verify_first"))}}


def _summary(conn, scan, assets) -> dict:
    qv = [a for a in assets if a["breakdown"]["quantum_vulnerable"]]
    hndl = [a for a in qv if exposed(a, "hndl")]
    verdicts = {"MIGRATE": 0, "CONTAIN": 0, "ACCEPT": 0}
    for a in assets:
        verdicts[a["verdict"]] += 1
    planes = json.loads(scan["planes_hit"])
    ran = coverage.ran(scan)
    return {"scan": {k: scan[k] for k in ("id", "target", "started_at", "seconds", "files_scanned",
                                          "findings_count")} | {"planes": planes,
                                                                "net": json.loads(scan["net"] or "null")},
            "coverage": {"ran": ran, "off": coverage.off(scan), "delta": (d := coverage.delta(conn, scan)),
                         "warning": coverage.warning(d)},
            "kpi": {"files": scan["files_scanned"], "planes": len(ran), "seconds": scan["seconds"],
                    "assets": len(assets), "hndl": len(hndl), "quantum_vulnerable": len(qv),
                    "forgery": sum(1 for a in qv if exposed(a, "forgery")),
                    "undetermined": sum(1 for a in qv if "undetermined" in a["breakdown"].get("threats", [])),
                    "readiness": attest.readiness({"total": len(assets), "hndl_exposed": len(hndl),
                                                   "quantum_vulnerable": len(qv)},
                                                  {"migrate": verdicts["MIGRATE"]}, len(ran)),
                    "safe": len(assets) - len(qv), "hybrid": sum(1 for a in assets if a["hybrid"])},
            "verdicts": verdicts,
            "verdict_detail": _verdict_detail(assets),
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

    @app.get("/api/browse")
    def browse_dir(path: str = "", u=Depends(_user)):
        return browse.list_dir(path)

    @app.post("/api/scans")
    def start_scan(body: ScanReq, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        target = body.path or str(ROOT / "demo_target")
        try:
            s = scanner.scan(target, probe=body.probe, conn=conn, settings=_settings(conn), overrides=_overrides(conn))
        except FileNotFoundError as e:
            raise HTTPException(400, str(e))
        auth.audit(conn, u["sub"], "scan", f"{target} -> {s['findings']} findings, {s['assets']} assets")
        return s

    def _resolve_source(body: StartReq):
        if body.source == "git":
            return source.from_git(body.path or None, body.git_remote, body.git_authorized)
        if body.source == "tls":
            return source.tls_only()
        return source.from_folder(body.path)

    @app.post("/api/scans/start")
    def scan_start(body: StartReq, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        try:
            resolved = _resolve_source(body)
        except (source.SourceError, gitsource.GitError) as e:
            raise HTTPException(400, str(e))
        try:
            return jobs.start(resolved.path, u["sub"], _settings(conn), _overrides(conn), body.planes, body.probe,
                              body.probes, body.tls_authorized, body.project_id, cleanup=resolved.cleanup,
                              source_meta=resolved.meta)
        except jobs.JobError as e:
            resolved.cleanup()
            raise HTTPException(e.status, str(e))

    @app.post("/api/scans/upload")
    async def scan_upload(kind: str = Form(alias="source"), planes: str = Form(""), probes: str = Form(""),
                          tls_authorized: bool = Form(False), project_id: int | None = Form(None),
                          files: list[UploadFile] = File(...), u=Depends(_user),
                          conn: sqlite3.Connection = Depends(_conn)):
        """Archive / container image / artefacts (D1): the upload is placed or safely extracted into a
        fresh per-scan temp directory, then scanned exactly like a local folder (mox/source.py)."""
        try:
            payload = [(f.filename or "upload", await f.read()) for f in files]
            resolved = source.from_upload(kind, payload)
        except (extract.UnsafeArchive, source.SourceError) as e:
            raise HTTPException(400, str(e))
        plane_list = [p for p in planes.split(",") if p] or None
        probe_list = [p for p in probes.split(",") if p]
        try:
            return jobs.start(resolved.path, u["sub"], _settings(conn), _overrides(conn), plane_list, None,
                              probe_list, tls_authorized, project_id, cleanup=resolved.cleanup,
                              source_meta=resolved.meta)
        except jobs.JobError as e:
            resolved.cleanup()
            raise HTTPException(e.status, str(e))

    @app.get("/api/projects/meta")
    def projects_meta(u=Depends(_user)):
        return {"sectors": projects.SECTOR_LABEL, "criticality": projects.CRITICALITY_MEANING,
                "shelf_life_presets": projects.SHELF_LIFE_PRESETS}

    @app.get("/api/projects")
    def projects_list(u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        return projects.list_all(conn)

    @app.post("/api/projects")
    def projects_create(body: ProjectReq, u=Depends(_user), conn: sqlite3.Connection = Depends(_conn)):
        try:
            p = projects.create(conn, body.name, body.sector, body.system_type, body.criticality,
                                body.shelf_life_years, source_kind="folder")
        except ValueError as e:
            raise HTTPException(422, str(e))
        auth.audit(conn, u["sub"], "project-create", p["name"])
        return p

    @app.put("/api/projects/{project_id}")
    def projects_update(project_id: int, body: ProjectUpdateReq, u=Depends(_user),
                        conn: sqlite3.Connection = Depends(_conn)):
        try:
            p = projects.update(conn, project_id, body.name, body.sector, body.system_type,
                                body.criticality, body.shelf_life_years)
        except KeyError:
            raise HTTPException(404, "project not found")
        except ValueError as e:
            raise HTTPException(422, str(e))
        auth.audit(conn, u["sub"], "project-update", p["name"])
        return p

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
        return _summary(conn, scan, _assets(conn, scan["id"]))

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
