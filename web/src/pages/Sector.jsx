import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Pager, Search, usePaged } from "../lib.jsx";

const COLS = { cursor: "default", gridTemplateColumns: "1fr 90px 60px 110px 60px" };

export default function Sector() {
  const [v, setV] = useState(null);
  const p = usePaged(v?.sectors || [], (s) => s.name);
  useEffect(() => { api.sectors().then(setV).catch(() => setV(false)); }, []);
  if (v === false) return <div className="p-6 dim">Could not load sector view.</div>;
  if (!v) return <div className="p-6 dim">Loading…</div>;
  const k = v.kpi;
  if (!k.attestations)
    return <div className="p-6 dim">No attestations yet. Run <span className="mono">python -m mox demo-attestations</span> to generate simulated ones (demo data).</div>;
  const kpis = [[k.attestations, "signed attestations verified"], [k.sectors, "critical sectors reporting"],
    [k.hndl_exposed.toLocaleString(), "HNDL-exposed assets, nationally", "red"], [k.leaks, "file paths or hostnames disclosed"]];
  return (
    <div className="p-5 max-w-[1400px] mx-auto flex flex-col gap-4">
      <div className="flex gap-2 items-center flex-wrap"><span className="chip">simulated attestations · demo data</span>
        <span className="chip">0 inventories received</span>
        {k.rejected > 0 && <span className="chip red">{k.rejected} rejected: bad signature</span>}</div>
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {kpis.map(([n, l, c]) => <div key={l} className="panel p-4"><div className={`mono text-[28px] font-bold ${c || ""}`}>{n}</div><div className="dim text-[11.5px]">{l}</div></div>)}
          </div>
          <div className="panel">
            <div className="flex justify-between items-center px-4 py-3 border-b border-[#E3E7ED]"><div className="h">Sectors</div><Search p={p} placeholder="Search sectors…" /></div>
            <div className="row dim text-[11px]" style={COLS}><span>Sector</span><span>Readiness</span><span>Wave</span><span>CONTAIN share</span><span>Hybrid</span></div>
            {p.shown.map((s) => (
              <div key={s.id} className="row" style={COLS}>
                <div><div>{s.name}</div><div className="sub">{s.operators} operators · {s.attestations} attestations</div></div>
                <span className="mono font-bold">{s.readiness}<span className="dim"> /100</span></span><span>{s.wave}</span><span>{s.contain_share}%</span><span>{s.hybrid}</span>
              </div>
            ))}
            {!p.shown.length && <div className="p-6 dim">No matching sectors.</div>}
            <Pager p={p} />
          </div>
          <div className="panel p-3 text-[12px] dim" style={{ borderStyle: "dashed" }}>
            Every number on this screen arrived as a signed attestation (simulated · demo data). The sector view can see which sectors are exposed — but not which server, which file, or which key.</div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="panel p-4"><div className="h">If RSA-2048 falls tomorrow</div><div className="dim mb-2">sectors ranked by HNDL-exposed assets</div>
            {v.ranking.map((r, i) => <div key={r.sector} className="kv"><span><span className="dim">{i + 1}</span> &nbsp;{r.sector}</span><span>{r.hndl_exposed}</span></div>)}</div>
          <div className="panel p-4"><div className="h mb-1">Incoming attestations</div>
            {v.feed.map((f) => <div key={f.root + f.key_id} className="kv mono text-[11px]"><span>✓ {f.key_id} · {f.sector} · idx {f.readiness}</span><span>{f.root.slice(0, 4)}…{f.root.slice(-4)}</span></div>)}</div>
        </div>
      </div>
    </div>
  );
}
