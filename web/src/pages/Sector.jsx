import { useEffect, useState } from "react";
import { api } from "../api.js";

const AMB = "#f39a3a";
const col = (i) => (i < 35 ? "#ef6a60" : i < 55 ? "#f0b43c" : "#79d9ae");

export default function Sector() {
  const [v, setV] = useState(null);
  useEffect(() => { api.sectors().then(setV).catch(() => setV(false)); }, []);
  if (v === false) return <div className="p-6 dim">Could not load sector view.</div>;
  if (!v) return <div className="p-6 dim">Loading…</div>;
  const k = v.kpi;
  if (!k.attestations)
    return <div className="p-6 dim">No attestations yet. Run <span className="mono">python -m mox demo-attestations</span> to generate simulated ones (demo data).</div>;
  const kpis = [[k.attestations, "signed attestations verified", "#f3ebdd"], [k.sectors, "critical sectors reporting", AMB],
    [k.hndl_exposed.toLocaleString(), "HNDL-exposed assets, nationally", "#ef6a60"], [k.leaks, "file paths or hostnames disclosed", "#5fd39d"]];
  return (
    <div className="p-5 max-w-[1400px] mx-auto flex flex-col gap-4">
      <div className="flex gap-2 items-center flex-wrap"><span className="chip" style={{ color: "#c9b99c" }}>simulated attestations · demo data</span>
        <span className="chip ok">0 inventories received</span>
        {k.rejected > 0 && <span className="chip red">{k.rejected} rejected: bad signature</span>}</div>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {kpis.map(([n, l, c]) => <div key={l} className="panel p-4"><div className="mono text-[28px] font-bold" style={{ color: c }}>{n}</div><div className="dim text-[11.5px]">{l}</div></div>)}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {v.sectors.map((s) => (
              <div key={s.id} className="panel p-4 relative">
                <span className="chip absolute" style={{ right: 12, top: 12, color: col(s.readiness) }}>WAVE {s.wave}</span>
                <div className="font-bold" style={{ color: "#f3ebdd" }}>{s.name}</div>
                <div className="dim text-[11px]">{s.operators} operators · {s.attestations} attestations</div>
                <div className="mono text-[34px] font-bold" style={{ color: col(s.readiness) }}>{s.readiness}<span className="dim text-[14px]"> /100</span></div>
                <div style={{ height: 8, background: "#2b2419", borderRadius: 5, overflow: "hidden", margin: "6px 0" }}><div style={{ width: `${s.readiness}%`, height: "100%", background: col(s.readiness) }} /></div>
                <div className="flex justify-between dim text-[11.5px]"><span>CONTAIN share: {s.contain_share}%</span><span>hybrid: {s.hybrid}</span></div>
              </div>
            ))}
          </div>
          <div className="panel p-3 text-[12px]" style={{ border: "1px dashed #6d5419", color: "#e5c98d" }}>
            Every number on this screen arrived as a signed attestation (simulated · demo data). The sector view can see which sectors are exposed — but not which server, which file, or which key.</div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="panel p-4"><div className="h">If RSA-2048 falls tomorrow</div><div className="dim mb-2">sectors ranked by HNDL-exposed assets</div>
            {v.ranking.map((r, i) => <div key={r.sector} className="kv"><span><span className="dim">{i + 1}</span> &nbsp;{r.sector}</span><span style={{ color: i < 2 ? "#ef6a60" : i < 5 ? "#f0b43c" : "#79d9ae" }}>{r.hndl_exposed}</span></div>)}</div>
          <div className="panel p-4"><div className="h mb-1">Incoming attestations</div>
            {v.feed.map((f) => <div key={f.root + f.key_id} className="kv mono text-[11px]"><span><span className="min">✓</span> {f.key_id} · {f.sector} · idx {f.readiness}</span><span>{f.root.slice(0, 4)}…{f.root.slice(-4)}</span></div>)}</div>
        </div>
      </div>
    </div>
  );
}
