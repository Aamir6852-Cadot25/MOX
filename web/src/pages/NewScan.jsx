import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../api.js";
import { PLANES } from "../components/Pipeline.jsx";
import ScanLedger from "../components/ScanLedger.jsx";
import Icon from "../components/Icon.jsx";

const FILE_PLANES = PLANES.filter((p) => p !== "tls");
const PLANE_NAME = { code: "Source code", dependencies: "Dependencies", configs: "Configuration",
  certificates: "Certificates", containers: "Containers", binaries: "Binaries", tls: "Live TLS" };
const PLANE_READS = { code: "source files for crypto API calls", dependencies: "package manifests (npm, pip, Maven, Go)",
  configs: "server and TLS config files", certificates: "certificates and keystores", containers: "docker-save images and Dockerfiles",
  binaries: "compiled binaries for embedded keys" };

const SOURCES = [
  { id: "folder", label: "Local folder", reads: "a local folder on this machine", net: "none" },
  { id: "archive", label: "Archive", reads: ".zip .tar .tar.gz .tgz upload", net: "none" },
  { id: "git", label: "Git repository", reads: "a local clone, or a remote URL (opt-in)", net: "clone only if remote, counted" },
  { id: "container", label: "Container image", reads: "a docker save .tar upload; walks its layers", net: "none" },
  { id: "artefacts", label: "Artefacts", reads: "binaries, certs/keystores, configs", net: "none" },
  { id: "tls", label: "Live TLS endpoints", reads: "a host:port list", net: "yes, opt-in, counted" },
];

const CRIT_LABEL = { 1: "Low", 2: "Normal", 3: "Mission-critical" };

export default function NewScan({ summary, onScanned }) {
  const [source, setSource] = useState("folder");
  const [path, setPath] = useState(summary?.scan?.target || "");
  const [archiveFile, setArchiveFile] = useState(null);
  const [containerFile, setContainerFile] = useState(null);
  const [artefactFiles, setArtefactFiles] = useState([]);
  const [gitMode, setGitMode] = useState("local");
  const [gitRemote, setGitRemote] = useState("");
  const [gitAuthorized, setGitAuthorized] = useState(false);
  const [tlsEndpoints, setTlsEndpoints] = useState([""]);
  const [tlsAuthorized, setTlsAuthorized] = useState(false);
  const [on, setOn] = useState(() => new Set(FILE_PLANES));

  const [projects, setProjects] = useState(null);
  const [meta, setMeta] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [projectOpen, setProjectOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", sector: "", system_type: "", criticality: 2, shelf_life_years: 7 });

  const [net, setNet] = useState(null);
  const [projectsErr, setProjectsErr] = useState("");
  const [run, setRun] = useState(null);
  const [err, setErr] = useState("");
  const es = useRef(null);
  const loc = useLocation();
  const netRef = useRef(null);

  useEffect(() => () => es.current?.close(), []);
  useEffect(() => { if (!path && summary?.scan?.target) setPath(summary.scan.target); }, [summary?.scan?.target]);
  const loadNet = () => api.netstat().then(setNet).catch(() => setNet(null));
  useEffect(() => { loadNet(); }, [run?.state]);
  useEffect(() => { if (loc.hash === "#network") netRef.current?.scrollIntoView(); }, [loc.hash, net]);
  useEffect(() => {
    api.projects().then(setProjects).catch((e) => setProjectsErr(e.message));
    api.projectsMeta().then(setMeta).catch(() => setMeta(null));
  }, []);

  const follow = (id) => {
    const src = new EventSource(`/api/scans/${id}/events`);
    es.current = src;
    const upd = (f) => setRun((r) => ({ ...r, ...f(r) }));
    src.addEventListener("progress", (e) => upd(() => ({ progress: JSON.parse(e.data) })));
    src.addEventListener("stage", (e) => upd((r) => ({ stages: [...r.stages, JSON.parse(e.data)] })));
    src.addEventListener("done", (e) => {
      src.close();
      const d = JSON.parse(e.data);
      upd(() => ({ state: "done", net: d.net, bytesRead: d.bytes_read }));
      onScanned();
    });
    src.addEventListener("error", (e) => {
      if (e.data) {
        src.close();
        return upd(() => ({ state: "error", error: JSON.parse(e.data).error }));
      }
      if (src.readyState === EventSource.CLOSED)
        upd(() => ({ state: "error", error: "Lost the progress stream. Check the server is running, then start the scan again." }));
    });
  };

  const createProject = async () => {
    const p = await api.createProject({ ...newProject, sector: newProject.sector || null });
    setProjects((ps) => [p, ...(ps || [])]);
    setProjectId(p.id);
    setProjectOpen(false);
  };

  const planes = [...on];
  const start = async (e) => {
    e.preventDefault();
    setErr("");
    es.current?.close();
    try {
      let st;
      if (source === "folder") {
        st = await api.scanStart({ source: "folder", path, planes, project_id: projectId });
      } else if (source === "git") {
        st = await api.scanStart(gitMode === "remote"
          ? { source: "git", git_remote: gitRemote, git_authorized: gitAuthorized, planes, project_id: projectId }
          : { source: "git", path, planes, project_id: projectId });
      } else if (source === "tls") {
        st = await api.scanStart({ source: "tls", probes: tlsEndpoints.filter((x) => x.trim()),
          tls_authorized: tlsAuthorized, project_id: projectId });
      } else {
        const files = source === "archive" ? (archiveFile ? [archiveFile] : [])
          : source === "container" ? (containerFile ? [containerFile] : []) : artefactFiles;
        const form = new FormData();
        form.append("source", source);
        form.append("planes", planes.join(","));
        if (projectId) form.append("project_id", projectId);
        for (const f of files) form.append("files", f);
        st = await api.scanUpload(form);
      }
      setRun({ id: st.id, path: st.path, state: "running", stages: [], progress: null, error: null, net: null, bytesRead: null });
      follow(st.id);
    } catch (e) {
      setErr(e.message);
    }
  };

  const running = run?.state === "running";
  const toggle = (p) => setOn((s) => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n; });
  const sock = Object.fromEntries((net?.planes || []).map((p) => [p.plane, p]));
  const project = projects?.find((p) => p.id === projectId);
  const tlsWillRun = source === "tls" && tlsEndpoints.some((x) => x.trim());
  const disabledPlanes = [...(source === "tls" ? [] : FILE_PLANES.filter((p) => !on.has(p))), ...(tlsWillRun ? [] : ["tls"])];
  const ready = !running && (
    (source === "folder" && path.trim()) ||
    (source === "git" && (gitMode === "local" ? path.trim() : gitRemote.trim())) ||
    (source === "archive" && archiveFile) ||
    (source === "container" && containerFile) ||
    (source === "artefacts" && artefactFiles.length) ||
    (source === "tls" && tlsWillRun)
  );

  return (
    <div className="p-4 grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
      <form className="flex flex-col gap-3" onSubmit={start}>
        <div className="bp-card">
          <div className="card-h"><h2>Source</h2><span className="note">what this scan reads</span></div>
          <div className="card-b flex flex-col gap-3">
            <div className="ptogs" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
              {SOURCES.map((s) => (
                <button type="button" key={s.id} className={`ptog${source === s.id ? " on" : ""}`}
                  aria-pressed={source === s.id} onClick={() => setSource(s.id)} disabled={running}>
                  <b>{s.label}</b><span>{s.reads}</span><span>{s.net === "none" ? "reads disk only" : s.net}</span>
                </button>
              ))}
            </div>

            {source === "folder" && (
              <input className="bp-input mono" placeholder="D:\code\my-repo" value={path} aria-label="Folder to scan"
                onChange={(e) => setPath(e.target.value)} disabled={running} />
            )}

            {source === "git" && (
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button type="button" className={`filt${gitMode === "local" ? " on" : ""}`} onClick={() => setGitMode("local")}>Local clone</button>
                  <button type="button" className={`filt${gitMode === "remote" ? " on" : ""}`} onClick={() => setGitMode("remote")}>Remote URL</button>
                </div>
                {gitMode === "local" ? (
                  <input className="bp-input mono" placeholder="D:\code\my-repo" value={path} aria-label="Local clone path"
                    onChange={(e) => setPath(e.target.value)} disabled={running} />
                ) : (
                  <>
                    <input className="bp-input mono" placeholder="git@host:org/repo.git" value={gitRemote}
                      aria-label="Git remote URL" onChange={(e) => setGitRemote(e.target.value)} disabled={running} />
                    <label className="hint flex gap-2 items-center">
                      <input type="checkbox" checked={gitAuthorized} onChange={(e) => setGitAuthorized(e.target.checked)} disabled={running} />
                      Cloning a remote repository is an outbound network call. I authorise it for this scan.
                    </label>
                  </>
                )}
              </div>
            )}

            {source === "archive" && (
              <input type="file" accept=".zip,.tar,.tar.gz,.tgz" aria-label="Archive to upload"
                onChange={(e) => setArchiveFile(e.target.files[0] || null)} disabled={running} />
            )}
            {source === "container" && (
              <input type="file" accept=".tar" aria-label="Container image (docker save .tar)"
                onChange={(e) => setContainerFile(e.target.files[0] || null)} disabled={running} />
            )}
            {source === "artefacts" && (
              <input type="file" multiple aria-label="Artefacts (binaries, certificates, configs)"
                onChange={(e) => setArtefactFiles([...e.target.files])} disabled={running} />
            )}

            {source === "tls" && (
              <div className="flex flex-col gap-2">
                {tlsEndpoints.map((v, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="bp-input mono flex-1" placeholder="host:port" value={v} aria-label={`Live TLS endpoint ${i + 1}`}
                      onChange={(e) => setTlsEndpoints((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))} disabled={running} />
                    {tlsEndpoints.length > 1 && (
                      <button type="button" className="bp-btn" onClick={() => setTlsEndpoints((xs) => xs.filter((_, j) => j !== i))} disabled={running}>
                        <Icon name="x" label="remove" /></button>
                    )}
                  </div>
                ))}
                <button type="button" className="bp-btn" onClick={() => setTlsEndpoints((xs) => [...xs, ""])} disabled={running}>Add endpoint</button>
                <label className="hint flex gap-2 items-center">
                  <input type="checkbox" checked={tlsAuthorized} onChange={(e) => setTlsAuthorized(e.target.checked)} disabled={running} />
                  I am authorised to probe any non-loopback / non-private host in this list.
                </label>
                <div className="hint">Loopback and private (RFC 1918) addresses never need this box.</div>
              </div>
            )}

            {err && <div className="errbox">{err}</div>}
          </div>
        </div>

        <div className="bp-card">
          <div className="card-h"><h2>Project context</h2>
            <span className="note">used to weight scores; override per asset after the scan</span></div>
          <div className="card-b flex flex-col gap-2">
            {projectsErr && <div className="hint">Could not load existing projects: {projectsErr}. New scans will use the Default project.</div>}
            {!projectOpen ? (
              <div className="flex gap-2 items-center">
                <span className="dim">{project ? project.name : "Default project"}</span>
                <button type="button" className="linkbtn" onClick={() => setProjectOpen(true)}>Change</button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <select value={projectId ?? ""} onChange={(e) => setProjectId(e.target.value ? +e.target.value : null)} disabled={running}>
                  <option value="">Default project</option>
                  {(projects || []).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="lbl" style={{ marginTop: "var(--s2)" }}>Or create a new project</div>
                <input placeholder="Project name" value={newProject.name} disabled={running}
                  onChange={(e) => setNewProject((n) => ({ ...n, name: e.target.value }))} />
                <select value={newProject.sector} disabled={running}
                  onChange={(e) => setNewProject((n) => ({ ...n, sector: e.target.value }))}>
                  <option value="">Sector (optional)</option>
                  {Object.entries(meta?.sectors || {}).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input placeholder="System type (optional)" value={newProject.system_type} disabled={running}
                  onChange={(e) => setNewProject((n) => ({ ...n, system_type: e.target.value }))} />
                <div>
                  <div className="lbl">Criticality</div>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((c) => (
                      <button type="button" key={c} className={`filt${newProject.criticality === c ? " on" : ""}`} disabled={running}
                        onClick={() => setNewProject((n) => ({ ...n, criticality: c }))} title={meta?.criticality?.[c]}>
                        {CRIT_LABEL[c]}
                      </button>
                    ))}
                  </div>
                  <div className="hint">{meta?.criticality?.[newProject.criticality]}</div>
                </div>
                <div>
                  <div className="lbl">Data shelf life (years)</div>
                  <div className="flex gap-2">
                    <input className="bp-input mono" style={{ width: 80 }} type="number" min="0" max="50" disabled={running}
                      value={newProject.shelf_life_years}
                      onChange={(e) => setNewProject((n) => ({ ...n, shelf_life_years: +e.target.value }))} />
                    {(meta?.shelf_life_presets || []).map(([key, label, years]) => (
                      <button type="button" key={key} className="filt" disabled={running}
                        onClick={() => setNewProject((n) => ({ ...n, shelf_life_years: years }))}>{label} ({years})</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="bp-btn pri" disabled={running || !newProject.name.trim()} onClick={createProject}>Create project</button>
                  <button type="button" className="bp-btn" onClick={() => setProjectOpen(false)}>Done</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {source !== "tls" && (
          <div className="bp-card">
            <div className="card-h"><h2>Planes</h2><span className="note">what each one reads</span></div>
            <div className="card-b">
              <div className="ptogs">
                {FILE_PLANES.map((p) => (
                  <button type="button" key={p} className={`ptog${on.has(p) ? " on" : ""}`} aria-pressed={on.has(p)}
                    onClick={() => toggle(p)} disabled={running}>
                    <b>{PLANE_NAME[p]}</b><span>reads {PLANE_READS[p]}</span>
                    <span>{sock[p] ? (sock[p].opens_socket ? "opens a socket" : "reads disk only") : ""}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button className="bp-btn pri" style={{ alignSelf: "flex-start" }} disabled={!ready}>
          <Icon name="play" />{running ? "Scanning" : "Start scan"}</button>

        <div className="bp-card" id="network" ref={netRef}>
          <div className="card-h"><h2>Network access</h2></div>
          <div className="card-b flex flex-col gap-2">
            {net ? <>
              <table className="ntab">
                <thead><tr><th>Plane</th><th>Socket</th><th>Evidence</th></tr></thead>
                <tbody>
                  {net.planes.map((p) => (
                    <tr key={p.plane}>
                      <td>{PLANE_NAME[p.plane]}</td>
                      <td className={p.opens_socket ? "yes" : ""}>{p.opens_socket ? "can open" : "none"}</td>
                      <td className="mono" title={p.source}>{p.opens_socket ? `imports ${p.imports.join(", ")}` : "no network imports"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="hint">
                Derived by parsing each plane's source for network imports. Since the server started
                (<span className="mono">{net.since}</span>) it has made <b className="mono">{net.outbound}</b> outbound
                and <b className="mono">{net.loopback}</b> loopback connects.
              </div>
            </> : <div className="hint">Could not read the socket counter, so outbound connects are not being shown. Check the MOX server is running, then <button type="button" className="linkbtn" onClick={loadNet}>retry</button>.</div>}
          </div>
        </div>
      </form>

      <ScanLedger run={run} disabled={disabledPlanes} />
    </div>
  );
}
