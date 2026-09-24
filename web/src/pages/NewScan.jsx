import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { PLANES } from "../components/Pipeline.jsx";
import { Num, Disclosure } from "../components/Motion.jsx";
import Icon from "../components/Icon.jsx";

const FILE_PLANES = PLANES.filter((p) => p !== "tls");
const PLANE_NAME = { code: "Algorithm calls", dependencies: "Library manifests", configs: "Protocol/config",
  certificates: "Certificates", containers: "Container images", binaries: "Binaries" };

export default function NewScan({ summary, onScanned }) {
  const [path, setPath] = useState(summary?.scan?.target || "");
  const [on, setOn] = useState(() => new Set(FILE_PLANES));
  const [run, setRun] = useState(null); // {state, stages, progress, error, bytesRead}
  const [err, setErr] = useState("");
  const [revealed, setRevealed] = useState(0);
  const es = useRef(null);

  useEffect(() => () => es.current?.close(), []);
  useEffect(() => { if (!path && summary?.scan?.target) setPath(summary.scan.target); }, [summary?.scan?.target]);

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
      if (e.data) { src.close(); return upd(() => ({ state: "error", error: JSON.parse(e.data).error })); }
      if (src.readyState === EventSource.CLOSED)
        upd(() => ({ state: "error", error: "Lost the progress stream. Check the server is running, then start the scan again." }));
    });
  };

  const start = async (e) => {
    e.preventDefault();
    setErr(""); setRevealed(0);
    es.current?.close();
    try {
      const st = await api.scanStart({ source: "folder", path, planes: [...on] });
      setRun({ id: st.id, path: st.path, state: "running", stages: [], progress: null, error: null, net: null, bytesRead: null });
      follow(st.id);
    } catch (e2) { setErr(e2.message); }
  };

  const running = run?.state === "running";
  const done = run?.state === "done";
  const toggle = (p) => setOn((s) => { const n = new Set(s); n.has(p) ? n.delete(p) : n.add(p); return n; });
  const detect = run?.stages?.find((s) => s.stage === "Detect")?.detail;
  const filesTotal = FILE_PLANES.reduce((sum, p) => sum + (detect?.[p]?.files ?? run?.progress?.[p]?.total ?? 0), 0);
  const filesDone = FILE_PLANES.reduce((sum, p) => sum + (detect ? (detect[p]?.files ?? 0) : (run?.progress?.[p]?.done ?? 0)), 0);
  const feed = FILE_PLANES.map((p) => ({ plane: p, findings: detect?.[p]?.findings ?? 0 })).filter((f) => detect && f.findings > 0);

  // Stagger the (real, final) feed reveal over ~3s total; never before Detect's own numbers exist.
  useEffect(() => {
    if (!detect || !feed.length) return;
    setRevealed(0);
    const step = Math.min(600, 3000 / feed.length);
    const t = setInterval(() => setRevealed((n) => (n >= feed.length ? (clearInterval(t), n) : n + 1)), step);
    return () => clearInterval(t);
  }, [detect]);

  return (
    <div className="p-4 flex flex-col gap-3" style={{ maxWidth: 900, margin: "0 auto" }}>
      <h1>Discover</h1>
      <form className="bp-card" onSubmit={start}>
        <div className="card-h"><h2>What to scan</h2></div>
        <div className="card-b flex flex-col gap-3">
          <div className="flex gap-2">
            <input className="bp-input mono flex-1" placeholder="D:\code\my-repo" value={path} aria-label="Folder to scan"
              onChange={(e) => setPath(e.target.value)} disabled={running} />
            <button className="bp-btn pri" disabled={running || !path.trim() || !on.size}>
              <Icon name="play" />{running ? "Scanning" : "Start scan"}</button>
          </div>
          <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
            {FILE_PLANES.map((p) => (
              <button type="button" key={p} className={`filt${on.has(p) ? " on" : ""}`} aria-pressed={on.has(p)}
                onClick={() => toggle(p)} disabled={running}>{PLANE_NAME[p]}</button>
            ))}
          </div>
          {err && <div className="errbox">{err}</div>}
        </div>
      </form>

      {run && (
        <div className="bp-card">
          <div className="card-h"><h2>{done ? "Scan complete" : run.state === "error" ? "Scan failed" : "Scanning\u2026"}</h2>
            <span className="note mono">{run.path}</span></div>
          <div className="card-b flex flex-col gap-3">
            {run.state === "error" && <div className="errbox">{run.error}</div>}
            <div className="hint">Files scanned: <b className="mono"><Num k="scan.files" value={filesDone} /></b>{filesTotal > filesDone ? ` of ${filesTotal}` : ""}</div>
            <div className="flex flex-col gap-1">
              {FILE_PLANES.map((p) => {
                const d = detect?.[p];
                const pr = run.progress?.[p];
                const total = d?.files ?? pr?.total ?? 0;
                const doneN = d ? total : pr?.done ?? 0;
                const pct = on.has(p) ? (total ? (100 * doneN) / total : d ? 100 : 0) : 0;
                return (
                  <div key={p} className="flex items-center gap-2" style={{ opacity: on.has(p) ? 1 : 0.4 }}>
                    <span className="mono" style={{ width: 140, fontSize: 11 }}>{PLANE_NAME[p]}</span>
                    <div className="meter-bar" style={{ flex: 1, margin: 0 }}><i style={{ width: `${pct}%` }} /></div>
                    <span className="mono" style={{ width: 70, textAlign: "right", fontSize: 11 }}>{on.has(p) ? `${doneN}/${total}` : "off"}</span>
                  </div>
                );
              })}
            </div>

            {feed.length > 0 && (
              <div className="flex flex-col gap-1">
                <div className="lbl">Found, by type</div>
                {feed.slice(0, revealed).map((f, i) => (
                  <div key={f.plane} className="kv num-fade" style={{ animationDelay: `${i * 40}ms` }}>
                    <span>{PLANE_NAME[f.plane]}</span><span className="mono">{f.findings}</span>
                  </div>
                ))}
              </div>
            )}

            {run.stages?.length > 0 && (
              <Disclosure summary="Scan details">
                <div className="mono" style={{ fontSize: 11 }}>
                  {run.stages.map((s) => <div key={s.stage}>{s.stage}: {s.count} in {s.ms.toFixed(1)} ms</div>)}
                </div>
              </Disclosure>
            )}

            {done && <Link className="bp-btn pri" style={{ alignSelf: "flex-start" }} to="/dashboard">Assess quantum risk &#8594;</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
