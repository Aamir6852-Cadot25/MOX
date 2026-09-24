import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, tierClass } from "../api.js";

const nistCls = (s) => (s === "disallowed" ? "red" : s === "approved" || s === "hybrid" ? "min" : "amb");

export default function Asset({ onChanged }) {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [horizon, setHorizon] = useState(null);
  useEffect(() => {
    api.asset(id).then(setA);
    api.settings().then((s) => setHorizon(s.threat_horizon));
  }, [id]);
  if (!a) return <div className="p-6 dim">Loading…</div>;

  const b = a.breakdown, m = b.mosca;
  const first = a.findings[0];
  const set = async (body) => { setA(await api.override(a.id, body)); onChanged(); };
  const setZ = async (z) => { setHorizon(z); await api.setSettings({ threat_horizon: z }); onChanged(); };
  const rows = [
    ["Base (NIST now: " + b.base_status + ")", b.base],
    ["Quantum-vulnerable" + (b.qv_halved_for_hybrid ? " (halved: hybrid)" : ""), b.qv_points],
    [`Mosca X+Y−Z = ${m.x}+${m.y}−${m.z} = ${m.exposure}`, m.points],
    ["Raw", b.raw],
    [`× criticality ${b.criticality} (${b.criticality_mult}) × confidence ${b.confidence} (${b.confidence_mult})`, b.scaled],
    ...(b.floor_applied ? [["Floor: disallowed algorithm, minimum", b.floor]] : []),
  ];
  const mosca = [[m.x, "X data life"], "+", [m.y, "Y migration"], ">", [m.z, "Z quantum"], "=", [(m.exposure > 0 ? "+" : "") + m.exposure, "yrs exposed"]];
  return (
    <div className="p-5 grid gap-4 max-w-[1500px] mx-auto lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-4">
        <div className="panel p-5">
          <Link to="/queue" className="dim text-[12px]">← Work queue</Link>
          <div className="flex items-center gap-3 mt-2">
            <div className="text-2xl font-bold" style={{ color: "#f2f7f4" }}>{a.label}</div>
            <span className={`pill ${a.verdict}`}>{a.verdict}</span>
            {a.verify_first && <span className="pill CONTAIN">verify first</span>}
          </div>
          {a.fingerprint && <div className="mono dim mt-1 text-[12px]">SPKI SHA-256 {a.fingerprint.slice(0, 32)}…</div>}
          <div className="mt-4 flex items-center gap-3 rounded-lg p-3" style={{ background: "#15241f", border: "1px dashed #37574b" }}>
            <div className="mono text-xl font-bold min whitespace-nowrap">{a.findings.length} → 1</div>
            <div>{a.summary}. Fix this one asset and every location below is covered.</div>
          </div>
        </div>
        <div className="panel p-5">
          <div className="h mb-3">Locations — what breaks if this asset changes</div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr] items-center">
            <div className="flex flex-col gap-2">
              {a.locations.map((l) => (
                <div key={l.finding_id} className="node"><div className="p">{l.plane}</div><div className="f">{l.file}{l.line ? `:${l.line}` : ""}</div>
                  <Link to={`/fix/${l.finding_id}`} className="text-[11px] min">Fix →</Link></div>
              ))}
            </div>
            <div className="dim text-2xl text-center">→</div>
            <div className="core"><div className="a">{a.label}</div><div className="b">{a.algorithm}{a.key_size ? `-${a.key_size}` : ""} · score {a.score}</div></div>
          </div>
        </div>
        <div className="panel p-5">
          <div className="h mb-2">NIST status</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[["Now", first.nist_now], ["After 2030", first.nist_2030], ["After 2035", first.nist_2035]].map(([l, v]) => (
              <div key={l} className="node"><div className="p">{l}</div><div className={`text-lg font-bold ${nistCls(v)}`}>{v}</div></div>
            ))}
          </div>
          {first.nist_source && <div className="dim text-[11px] mt-2">{first.nist_source}{first.nist_notes ? ` — ${first.nist_notes}` : ""}</div>}
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="panel p-4">
          <div className="h mb-1">Why this score</div>
          <div className={`text-4xl font-bold ${tierClass(a.tier)}`}>{a.score} <span className="text-base">{a.tier}</span></div>
          <div className="mt-2">{rows.map(([k, v]) => <div key={k} className="kv"><span>{k}</span><span>{v}</span></div>)}</div>
        </div>
        <div className="panel p-4">
          <div className="h mb-2">Mosca check</div>
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
            {mosca.map((c, i) => typeof c === "string"
              ? <span key={i} className="dim">{c}</span>
              : <div key={i} className="node" style={{ padding: 8, ...(i === 6 && m.exposure > 0 ? { borderColor: "#e5534b" } : {}) }}>
                  <div className="text-lg font-bold">{c[0]}</div><div className="dim text-[10px]">{c[1]}</div>
                </div>)}
          </div>
          <div className="mt-3 grid gap-2 text-[12px]">
            <label className="flex justify-between items-center">X shelf-life (yrs)
              <input type="number" min="0" max="50" defaultValue={m.x} key={"x" + m.x} className="w-20"
                onBlur={(e) => e.target.value !== "" && +e.target.value !== m.x && set({ x: +e.target.value, criticality: b.criticality })} /></label>
            <label className="flex justify-between items-center">Criticality
              <select value={b.criticality} onChange={(e) => set({ x: m.x, criticality: +e.target.value })}>
                <option value="1">1 low</option><option value="2">2 normal</option><option value="3">3 mission-critical</option>
              </select></label>
            <label className="flex justify-between items-center">Z threat horizon (project, yrs)
              <input type="number" min="1" max="40" value={horizon ?? ""} className="w-20"
                onChange={(e) => e.target.value && setZ(+e.target.value)} /></label>
          </div>
        </div>
        <div className="panel p-4">
          <div className="h mb-1">Recommended replacement</div>
          {a.replacements.length
            ? a.replacements.map((r, i) => <div key={i} className="kv"><span>{r.from}</span><span className="min">{r.to}</span></div>)
            : <div className="dim">No replacement needed</div>}
          {a.size_notes.map((n) => <div key={n} className="dim text-[11px] mt-2">{n}</div>)}
          <div className="kv mt-2"><span>Migration wave</span><span>{a.wave} of 5</span></div>
          <div className="mt-2"><span className={`pill ${a.verdict}`}>{a.verdict}</span> <span className="dim text-[12px]">{a.reason}</span></div>
          <ul className="dim text-[12px] mt-2 list-disc pl-4">{a.recommendations.map((r) => <li key={r}>{r}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}
