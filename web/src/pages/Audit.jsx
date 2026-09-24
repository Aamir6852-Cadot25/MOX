import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Audit() {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.audit().then(setRows).catch(() => setRows([])); }, []);
  if (!rows) return <div className="p-6 dim">Loading…</div>;
  return (
    <div className="p-4 max-w-[1300px] mx-auto"><div className="panel p-4">
      <div className="h mb-2">Audit log <span className="dim font-normal">(latest {rows.length})</span></div>
      {rows.map((r) => (
        <div key={r.id} className="kv mono text-[11.5px]"><span className="flex gap-3"><span className="dim">{r.ts}</span><span>{r.actor}</span><b>{r.action}</b></span><span className="dim">{r.detail}</span></div>
      ))}
      {!rows.length && <div className="dim">No events yet.</div>}
    </div></div>
  );
}
