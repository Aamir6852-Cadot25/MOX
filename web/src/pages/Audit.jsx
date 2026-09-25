import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { LoadError } from "../components/States.jsx";

export default function Audit() {
  const [rows, setRows] = useState(null);
  const load = () => { setRows(null); api.audit().then(setRows).catch((e) => setRows({ error: e })); };
  useEffect(load, []);
  if (rows?.error) return <LoadError what="the audit log" err={rows.error} onRetry={load} />;
  if (!rows) return <div className="p-6 dim">Loading…</div>;
  return (
    <div className="panel p-4">
      <div className="h mb-2">Audit log <span className="dim font-normal">(latest {rows.length})</span></div>
      {rows.map((r) => (
        <div key={r.id} className="kv mono text-[11.5px]"><span className="flex gap-3"><span className="dim">{r.ts}</span><span>{r.actor}</span><b>{r.action}</b></span><span className="dim">{r.detail}</span></div>
      ))}
      {!rows.length && <div className="hint">Nothing recorded yet. Sign-ins, scans, fixes, settings changes and exports appear here as they happen. <Link className="link" to="/scan">Start a scan</Link> to record the first.</div>}
    </div>
  );
}
