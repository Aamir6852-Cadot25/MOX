import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api.js";
import Pipeline, { PLANES } from "../components/Pipeline.jsx";
import Icon from "../components/Icon.jsx";

const PLANE_NAME = { code: "Source code", dependencies: "Dependencies", configs: "Configuration",
  certificates: "Certificates", containers: "Containers", binaries: "Binaries", tls: "Live TLS" };
const FILE_PLANES = PLANES.filter((p) => p !== "tls");

export default function NewScan({ summary, onScanned }) {
  const [path, setPath] = useState(summary?.scan?.target || "");
  const [on, setOn] = useState(() => new Set(FILE_PLANES));
  const [probe, setProbe] = useState("");
  const [net, setNet] = useState(null);
  const [run, setRun] = useState(null); // {state, stages, progress, error, net}
  const [err, setErr] = useState("");
  const es = useRef(null);
  const loc = useLocation();
  const netRef = useRef(null);

  useEffect(() => () => es.current?.close(), []);
  // The latest scan may load after first render (direct link to /scan): prefill its folder once it arrives.
  useEffect(() => { if (!path && summary?.scan?.target) setPath(summary.scan.target); }, [summary?.scan?.target]);
  useEffect(() => { api.netstat().then(setNet).catch(() => setNet(null)); }, [run?.state]);
  useEffect(() => { if (loc.hash === "#network") netRef.current?.scrollIntoView(); }, [loc.hash, net]);

  const follow = (id) => {
    const src = new EventSource(`/api/scans/${id}/events`);
    es.current = src;
    const upd = (f) => setRun((r) => ({ ...r, ...f(r) }));
    src.addEventListener("progress", (e) => upd(() => ({ progress: JSON.parse(e.data) })));
    src.addEventListener("stage", (e) => upd((r) => ({ stages: [...r.stages, JSON.parse(e.data)] })));
    src.addEventListener("done", (e) => {
      src.close();
      upd(() => ({ state: "done", net: JSON.parse(e.data).net }));
      onScanned();
    });
    src.addEventListener("error", (e) => {
      if (e.data) { // server-sent "error" event: the scan itself failed
        src.close();
        return upd(() => ({ state: "error", error: JSON.parse(e.data).error }));
      }
      if (src.readyState === EventSource.CLOSED) // stream refused (e.g. server restarted, job gone)
        upd(() => ({ state: "error", error: "Lost the progress stream. Check the server is running, then start the scan again." }));
    });
  };

  const start = async (e) => {
    e.preventDefault();
    setErr("");
    es.current?.close();
    try {
      const planes = [...on, ...(probe.trim() ? ["tls"] : [])];
      const st = await api.scanStart(path, planes, probe.trim() || null);
      setRun({ id: st.id, path: st.path, state: "running", stages: [], progress: null, error: null, net: null });
      follow(st.id);
    } catch (e) {
      setErr(e.message);
    }
  };

  const running = run?.state === "running";
  const toggle = (p) => setOn((s) => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n; });
  const sock = Object.fromEntries((net?.planes || []).map((p) => [p.plane, p]));
  const tlsOn = !!probe.trim();
  // Warn before a narrower scan of the same target, so coverage never shrinks without the operator seeing it.
  const norm = (p) => (p || "").trim().replace(/[\\/]+$/, "").replace(/\//g, "\\").toLowerCase();
  const same = summary?.scan && norm(path) === norm(summary.scan.target);
  const dropped = same ? (summary.coverage?.ran || []).filter((p) => p !== "tls" && !on.has(p)) : [];

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="grid gap-3" style={{ gridTemplateColumns: "1fr var(--aside)" }}>
        <form className="bp-card" onSubmit={start}>
          <div className="card-h"><h2>New scan</h2><span className="note">a local folder on this machine; read-only</span></div>
          <div className="card-b flex flex-col gap-3">
            <div className="flex gap-2">
              <input className="bp-input mono flex-1" placeholder="D:\code\my-repo" value={path} aria-label="Folder to scan"
                onChange={(e) => setPath(e.target.value)} disabled={running} />
              <button className="bp-btn pri" disabled={running || !path.trim() || (!on.size && !tlsOn)}>
                <Icon name="play" />{running ? "Scanning" : "Start scan"}</button>
            </div>
            <div>
              <div className="lbl">Planes to scan</div>
              <div className="ptogs">
                {FILE_PLANES.map((p) => (
                  <button type="button" key={p} className={`ptog${on.has(p) ? " on" : ""}`} aria-pressed={on.has(p)}
                    onClick={() => toggle(p)} disabled={running}>
                    <b>{PLANE_NAME[p]}</b><span>{sock[p] ? (sock[p].opens_socket ? "opens a socket" : "reads disk only") : ""}</span>
                  </button>
                ))}
                <div className={`ptog sock${tlsOn ? " on" : ""}`}>
                  <b>{PLANE_NAME.tls}</b>
                  <input className="bp-input mono" style={{ width: "100%" }} placeholder="host:port (off)" value={probe}
                    aria-label="Live TLS endpoint, host:port. Leave empty to keep this plane off." onChange={(e) => setProbe(e.target.value)} disabled={running} />
                  <span>opens a socket, off unless set</span>
                </div>
              </div>
            </div>
            {dropped.length > 0 && !running && (
              <div className="alert warn" role="status"><div className="de">
                {dropped.map((p) => PLANE_NAME[p]).join(", ")} ran in the last scan of this folder (scan #{summary.scan.id}) and
                {dropped.length === 1 ? " is" : " are"} now off. This scan will cover less; the dashboard and report will say so.{" "}
                <button type="button" className="linkbtn" onClick={() => setOn(new Set(FILE_PLANES))}>Turn all planes back on</button>
              </div></div>
            )}
            {err && <div className="errbox">{err}</div>}
            {run?.state === "done" && (
              <div className="flex gap-2 items-center">
                <span className="hint">Scan of <span className="mono">{run.path}</span> finished. Review what it found:</span>
                <Link className="bp-btn pri" to="/queue">Open work queue</Link>
                <Link className="bp-btn" to="/">Open dashboard</Link>
              </div>
            )}
          </div>
        </form>

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
            </> : <div className="hint">Could not read the socket counter. Check the server is running, then reload this page.</div>}
          </div>
        </div>
      </div>

      {run ? (
        <Pipeline stages={run.stages} progress={run.progress} state={run.state} error={run.error} net={run.net}
          disabled={PLANES.filter((p) => (p === "tls" ? !tlsOn : !on.has(p)))}
          note={running ? "live; each stage fills as the scanner reports it" : "timings measured by the scanner (perf_counter)"} />
      ) : (
        <div className="bp-card"><div className="card-b hint">
          Pick a folder and start a scan. Each stage of the pipeline, and each of the 7 planes inside Detect, fills in here as the scanner reports it.
        </div></div>
      )}
    </div>
  );
}
