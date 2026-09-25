import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { PLANES } from "../components/Pipeline.jsx";
import { Num, Disclosure } from "../components/Motion.jsx";
import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import FolderBrowser from "../components/FolderBrowser.jsx";

const FILE_PLANES = PLANES.filter((p) => p !== "tls");
const PLANE_NAME = { code: "Algorithm calls", dependencies: "Library manifests", configs: "Protocol/config",
  certificates: "Certificates", containers: "Container images", binaries: "Binaries" };

export default function NewScan({ summary, onScanned }) {
  const [path, setPath] = useState(summary?.scan?.target || "");
  const [on, setOn] = useState(() => new Set(FILE_PLANES));
  const [run, setRun] = useState(null); // {state, stages, progress, error, bytesRead}
  const [err, setErr] = useState("");
  const [revealed, setRevealed] = useState(0);
  const [unidentified, setUnidentified] = useState(null);
  const [formOpen, setFormOpen] = useState(true);
  const [browsing, setBrowsing] = useState(false);
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
    setErr(""); setRevealed(0); setUnidentified(null);
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
  const maxFeed = Math.max(1, ...feed.map((f) => f.findings));
  const lastStage = run?.stages?.[run.stages.length - 1];

  // Stagger the (real, final) feed reveal over ~3s total; never before Detect's own numbers exist.
  useEffect(() => {
    if (!detect || !feed.length) return;
    setRevealed(0);
    const step = Math.min(600, 3000 / feed.length);
    const t = setInterval(() => setRevealed((n) => (n >= feed.length ? (clearInterval(t), n) : n + 1)), step);
    return () => clearInterval(t);
  }, [detect]);

  // Real count of assets with no identified algorithm, fetched once the scan is done (never estimated).
  useEffect(() => {
    if (!done) return;
    setFormOpen(false); // collapse "What to scan" once a scan completes (Task 1)
    api.assets().then((assets) => setUnidentified(assets.filter((a) => a.algorithm === "unknown").length)).catch(() => setUnidentified(null));
  }, [done]);

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <PageHeader step="1 Discover" title="What cryptography do we run?" />
      {formOpen ? (
        <form className="bp-card" onSubmit={start}>
          <div className="card-h"><h2>What to scan</h2></div>
          <div className="card-b flex flex-col gap-3">
            <div className="flex gap-2">
              <input className="bp-input mono flex-1" placeholder="D:\code\my-repo" value={path} aria-label="Folder to scan"
                onChange={(e) => setPath(e.target.value)} disabled={running} />
              <button type="button" className="bp-btn" disabled={running} onClick={() => setBrowsing(true)}>
                <Icon name="folder" />Browse&#8230;</button>
              <button className="bp-btn pri" disabled={running || !path.trim() || !on.size}>
                <Icon name="play" />{running ? "Scanning" : "Start scan"}</button>
            </div>
            {browsing && (
              <FolderBrowser start={path} onClose={() => setBrowsing(false)}
                onSelect={(p) => { setPath(p); setBrowsing(false); }} />
            )}
            <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
              {FILE_PLANES.map((p) => (
                <button type="button" key={p} className={`filt${on.has(p) ? " on" : ""}`} aria-pressed={on.has(p)}
                  onClick={() => toggle(p)} disabled={running}>{PLANE_NAME[p]}</button>
              ))}
            </div>
            {err && <div className="errbox">{err}</div>}
          </div>
        </form>
      ) : (
        <div className="panel" style={{ padding: "var(--s2) var(--s4)", fontSize: 12 }}>
          <span className="dim">Target:</span> <span className="mono">{run.path}</span>
          <button type="button" className="linkbtn" style={{ marginLeft: "var(--s3)" }} onClick={() => setFormOpen(true)}>Change source</button>
        </div>
      )}

      {run && !done && (
        <div className="bp-card" style={{ marginTop: "var(--s3)" }}>
          <div className="card-h"><h2>{run.state === "error" ? "Scan failed" : "Scanning\u2026"}</h2>
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
          </div>
        </div>
      )}

      {done && (
        <div className="bp-card" style={{ marginTop: "var(--s3)" }}>
          <div className="card-h"><h2>Scan complete</h2><span className="note mono">{run.path}</span></div>
          <div className="card-b flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="lbl">Inventory, by plane</div>
              {feed.slice(0, revealed).map((f, i) => (
                <div key={f.plane} className="flex items-center gap-2 num-fade" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="mono" style={{ width: 140, fontSize: 11 }}>{PLANE_NAME[f.plane]}</span>
                  <div className="meter-bar" style={{ flex: 1, margin: 0 }}><i style={{ width: `${(100 * f.findings) / maxFeed}%` }} /></div>
                  <span className="mono tn" style={{ width: 40, textAlign: "right", fontSize: 11 }}>{f.findings}</span>
                </div>
              ))}
              {!feed.length && <div className="hint">No cryptographic asset was found in the planes that ran.</div>}
            </div>

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <div className="panel p-3"><div className="dim" style={{ fontSize: 11 }}>Unidentified items</div>
                <div className="mono" style={{ fontSize: 20 }}>{unidentified ?? "\u2013"}</div></div>
              <div className="panel p-3"><div className="dim" style={{ fontSize: 11 }}>Target</div>
                <div className="mono" style={{ fontSize: 13, wordBreak: "break-all" }}>{run.path}</div></div>
              <div className="panel p-3"><div className="dim" style={{ fontSize: 11 }}>Duration</div>
                <div className="mono" style={{ fontSize: 20 }}>{lastStage ? (lastStage.t_ms / 1000).toFixed(1) : "\u2013"}s</div></div>
              <div className="panel p-3"><div className="dim" style={{ fontSize: 11 }}>Outbound connects</div>
                <div className="mono" style={{ fontSize: 20 }}>{run.net?.outbound ?? 0}<span className="dim" style={{ fontSize: 11 }}> (measured)</span></div></div>
            </div>

            {run.stages?.length > 0 && (
              <Disclosure summary="Scan details">
                <div className="mono" style={{ fontSize: 11 }}>
                  {run.stages.map((s) => <div key={s.stage}>{s.stage}: {s.count} in {s.ms.toFixed(1)} ms</div>)}
                </div>
              </Disclosure>
            )}

            <Link className="bp-btn pri" style={{ alignSelf: "flex-start" }} to="/dashboard">Assess quantum risk &#8594;</Link>
          </div>
        </div>
      )}
    </div>
  );
}
