import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { Tier, Verdict } from "../components/Marks.jsx";
import { Pager, Search, usePaged } from "../lib.jsx";

export default function Roadmap({ summary }) {
  const [w, setW] = useState(null);
  const [wave, setWave] = useState(0);
  const [err, setErr] = useState("");
  const load = () => { setErr(""); api.roadmap().then(setW).catch((e) => setErr(e.message)); };
  useEffect(load, [summary]);
  const rows = (w || []).flatMap((x) => x.assets.map((a) => ({ ...a, wave: x.wave, wname: x.name })));
  const p = usePaged(wave ? rows.filter((r) => r.wave === wave) : rows, (r) => `${r.label} ${r.tier} ${r.verdict} ${r.wname} ${r.replacement || ""}`);
  if (err) return <div className="p-6"><div className="errbox">Could not load the roadmap: {err}. <button className="linkbtn" onClick={load}>Retry</button></div></div>;
  if (!w) return <div className="p-6 dim">Loading…</div>;
  return (
    <div className="p-4 max-w-[1100px] mx-auto">
      <div className="text-xl font-semibold mb-1">Migration roadmap</div>
      <div className="dim mb-4">Five waves built from each asset's assigned wave (tier + Mosca exposure). Click a wave to filter.</div>
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5 mb-4">
        {w.map((x) => (
          <button key={x.wave} className="panel p-3 text-left cursor-pointer" style={wave === x.wave ? { borderColor: "var(--pri)", background: "var(--pri-soft)" } : {}}
            onClick={() => setWave(wave === x.wave ? 0 : x.wave)}>
            <div className="dim text-[11px]">Wave {x.wave}</div>
            <div className="h">{x.name}</div>
            <div className="dim text-[11px]">{x.goal}. <span className="mono">{x.count}</span> asset{x.count !== 1 ? "s" : ""}</div>
          </button>
        ))}
      </div>
      <div className="panel">
        <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--line)]">
          <div className="h">{wave ? `Wave ${wave} — ${w[wave - 1].name}` : "All waves"}</div>
          <Search p={p} placeholder="Search roadmap…" />
        </div>
        {p.shown.map((a) => (
          <Link key={a.id} to={`/asset/${a.id}`} className="row" style={{ gridTemplateColumns: "60px 1fr 110px 90px", textDecoration: "none", color: "inherit" }}>
            <span className="dim">Wave {a.wave}</span>
            <div><div>{a.label}</div>{a.replacement && <div className="sub">Replace with <span className="mono">{a.replacement}</span></div>}</div>
            <span className="flex items-center gap-2"><Tier tier={a.tier} /><span className="mono">{a.score}</span></span>
            <span><Verdict verdict={a.verdict} /></span>
          </Link>
        ))}
        {!p.shown.length && <div className="p-6 dim">No matching assets.</div>}
        <Pager p={p} />
      </div>
    </div>
  );
}
