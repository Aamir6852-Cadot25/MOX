import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { Num } from "../components/Motion.jsx";
import Icon from "../components/Icon.jsx";
import PageHeader from "../components/PageHeader.jsx";
import ScanLedger from "../components/ScanLedger.jsx";
import FolderBrowser from "../components/FolderBrowser.jsx";

const PLANES = [
  { id: "code", label: "Source code repositories" },
  { id: "dependencies", label: "Libraries & dependencies" },
  { id: "binaries", label: "Binaries" },
  { id: "containers", label: "Container images" },
  { id: "certificates", label: "Certificates & keys" },
  { id: "protocols", label: "Protocols" },
  { id: "kms", label: "Cloud KMS & Hardware modules" }
];

export default function NewScan({ summary, onScanned }) {
  const [source, setSource] = useState("folder"); // folder, zip, git
  const [path, setPath] = useState(summary?.scan?.target || "");
  const [sector, setSector] = useState("strategic");
  const [criticality, setCriticality] = useState("high");
  
  const [run, setRun] = useState(null);
  const [err, setErr] = useState("");
  const es = useRef(null);
  const [browsing, setBrowsing] = useState(false);

  useEffect(() => () => es.current?.close(), []);

  const start = async (e) => {
    e.preventDefault();
    if (!path.trim()) { setErr("Path required"); return; }
    setErr("");
    setRun({ state: "running", stages: {}, progress: { files: 0, bytes: 0, ms: 0 }, error: null });
    es.current?.close();

    const fd = new FormData();
    fd.append("target", path);
    PLANES.forEach((p) => { if (p.id !== "kms") fd.append("planes", p.id); }); // just sending them

    try {
      const res = await fetch("/api/scan/start", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const loc = res.headers.get("Location");
      if (!loc) throw new Error("No SSE url returned");
      
      const sse = new EventSource(loc);
      es.current = sse;
      
      sse.addEventListener("stage", (ev) => {
        const d = JSON.parse(ev.data);
        setRun((r) => r ? { ...r, stages: { ...r.stages, [d.stage]: d } } : r);
      });
      sse.addEventListener("progress", (ev) => {
        setRun((r) => r ? { ...r, progress: JSON.parse(ev.data) } : r);
      });
      sse.addEventListener("done", async () => {
        sse.close();
        await onScanned();
        setRun((r) => r ? { ...r, state: "done" } : r);
      });
      sse.addEventListener("error", (ev) => {
        sse.close();
        setRun((r) => r ? { ...r, state: "error", error: ev.data } : r);
      });
    } catch (e) {
      setRun(null);
      setErr(e.message);
    }
  };

  return (
    <div className="page">
      <PageHeader title="Discover" step="1 Discover" />
      
      {browsing && <FolderBrowser initial={path} onPick={(p) => { setPath(p); setBrowsing(false); }} onCancel={() => setBrowsing(false)} />}
      
      {/* Top Section: 3 source options */}
      <div className="grid-12" style={{ marginBottom: "var(--s5)" }}>
        <div className="col-12" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--s4)" }}>
          <button className={"ptog" + (source === "folder" ? " on" : "")} onClick={() => setSource("folder")}>
            <Icon name="folder" size="20" />
            <b>Local Folder</b>
            <span>Scan uncommitted code</span>
          </button>
          <button className={"ptog" + (source === "zip" ? " on" : "")} onClick={() => setSource("zip")}>
            <Icon name="folder" size="20" />
            <b>ZIP Archive</b>
            <span>Vendor drop</span>
          </button>
          <button className={"ptog" + (source === "git" ? " on" : "")} onClick={() => setSource("git")}>
            <Icon name="folder" size="20" />
            <b>Local Git</b>
            <span>Repository history</span>
          </button>
        </div>
      </div>

      <div className="grid-12">
        <div className="col-4">
          <form className="bp-card" onSubmit={start} style={{ display: "flex", flexDirection: "column" }}>
            <div className="card-h"><h2>Target &amp; Context</h2></div>
            <div className="card-b" style={{ display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
              <div>
                <div className="lbl">Path to Scan</div>
                <div style={{ display: "flex", gap: "var(--s2)" }}>
                  <input className="bp-input" style={{ flex: 1 }} value={path} onChange={(e) => setPath(e.target.value)} disabled={run?.state === "running"} />
                  {source === "folder" && <button type="button" className="bp-btn" onClick={() => setBrowsing(true)} disabled={run?.state === "running"}>Browse</button>}
                </div>
              </div>
              <div>
                <div className="lbl">Sector</div>
                <select className="bp-input" style={{ width: "100%" }} value={sector} onChange={(e) => setSector(e.target.value)} disabled={run?.state === "running"}>
                  <option value="strategic">Strategic &amp; Public Enterprises</option>
                  <option value="power">Power &amp; Energy</option>
                  <option value="telecom">Telecom</option>
                  <option value="government">Government</option>
                  <option value="banking">Banking &amp; Finance</option>
                </select>
              </div>
              <div>
                <div className="lbl">Default Business Criticality</div>
                <select className="bp-input" style={{ width: "100%" }} value={criticality} onChange={(e) => setCriticality(e.target.value)} disabled={run?.state === "running"}>
                  <option value="high">High (Enterprise Core)</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              {err && <div className="errbox">{err}</div>}
              <button type="submit" className="bp-btn pri" style={{ justifyContent: "center" }} disabled={run?.state === "running"}>
                {run?.state === "running" ? <><Icon name="loader" />Scanning...</> : <><Icon name="play" />Start Discovery</>}
              </button>
            </div>
          </form>

          <div className="bp-card" style={{ marginTop: "var(--s5)" }}>
            <div className="card-h"><h2>7 Discovery Planes</h2></div>
            <div className="card-b" style={{ display: "flex", flexDirection: "column", gap: "var(--s3)" }}>
              {PLANES.map((p) => {
                const count = (summary?.planes && summary.planes[p.id]) || 0;
                const active = run?.state === "done" || summary?.scan;
                return (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "var(--s3)", color: "var(--ink-2)" }}>{p.label}</span>
                    {active ? (
                       <span style={{ fontSize: "11px", fontWeight: "bold", color: count > 0 ? "var(--brand-ink)" : "var(--ink-4)" }}>
                         {count > 0 ? count : "Clear"}
                       </span>
                    ) : (
                       <span style={{ width: "var(--s4)", height: "var(--s1)", background: "var(--line-2)", borderRadius: "2px" }}></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-8" style={{ display: "flex", flexDirection: "column", minHeight: "400px" }}>
          <div className="bp-card wrap-x" style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--term-bg)", overflowY: "auto" }}>
            <div className="card-h" style={{ borderBottom: "1px solid var(--term-line)", background: "var(--surface)" }}>
              <h2>Live Scan Events</h2>
            </div>
            {run ? <ScanLedger run={run} /> : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--term-dim)", fontSize: "var(--s3)", fontFamily: "var(--font-mono)" }}>
                Awaiting discovery start...
              </div>
            )}
          </div>
          
          {(run?.state === "done" || (!run && summary?.scan)) && (
            <div style={{ marginTop: "var(--s4)", background: "var(--surface)", border: "1px solid var(--brand-line)", borderRadius: "var(--r)", padding: "var(--s4)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: "var(--s3)", color: "var(--ink)" }}>
                <b style={{ fontFamily: "var(--font-mono)" }}><Num v={summary?.scan?.files_scanned || 0} /></b> files &rarr;
                <b style={{ fontFamily: "var(--font-mono)", marginLeft: "var(--s2)" }}><Num v={summary?.kpi?.findings || 0} /></b> findings &rarr;
                <b style={{ fontFamily: "var(--font-mono)", marginLeft: "var(--s2)" }}><Num v={summary?.kpi?.assets || 0} /></b> assets &middot;
                <span style={{ margin: "0 8px" }}>{summary?.scan?.seconds || 0} s</span> &middot;
                <span style={{ color: "var(--low-ink)", background: "var(--low-bg)", padding: "0 var(--s2)", borderRadius: "var(--r)", marginLeft: "var(--s2)" }}>0 outbound</span>
              </div>
              <Link to="/dashboard" className="bp-btn pri">Assess Quantum Risk &rarr;</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
