import { useState } from "react";
import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { api, tierColor } from "../api.js";

const TIERS = ["Critical", "High", "Medium", "Low"];
const MORE = [["safe", "Quantum-safe or out of scope"], ["hybrid", "Hybrid PQ endpoints found"], ["files", "Files scanned"],
  ["planes", "Planes hit (of 7)"], ["seconds", "Scan time (s)"]];

function Kpi({ n, label, cls = "" }) {
  return <div className="panel p-4"><div className={`text-3xl font-semibold ${cls}`}>{n}</div><div className="dim text-[12px] mt-1">{label}</div></div>;
}

export default function Dashboard({ summary, onScanned }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [more, setMore] = useState(false);
  const nav = useNavigate();
  const run = async () => {
    setBusy(true);
    setErr("");
    try {
      await api.scan();
      await onScanned();
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  if (!summary?.scan)
    return (
      <div className="p-10 max-w-xl mx-auto">
        <div className="panel p-6 flex flex-col gap-3">
          <div className="h">No scan yet</div>
          <div className="dim">Scan the demo repository (run <span className="mono">python -m mox make-demo</span> first).</div>
          <button className="btn" disabled={busy} onClick={run}>{busy ? "Scanning…" : "Scan demo repository"}</button>
          {err && <div className="red">{err}</div>}
        </div>
      </div>
    );

  const { kpi, verdicts, field } = summary;
  const total = Object.values(verdicts).reduce((a, b) => a + b, 0) || 1;
  return (
    <div className="p-5 flex flex-col gap-4 max-w-[1300px] mx-auto">
      <div className="flex justify-between items-center">
        <div className="h text-base">Dashboard <span className="dim font-normal">— {kpi.assets} cryptographic assets from {summary.scan.findings_count} findings</span></div>
        <div className="w-40"><button className="btn ghost" disabled={busy} onClick={run}>{busy ? "Scanning…" : "Re-scan"}</button></div>
      </div>
      {err && <div className="red">{err}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi n={kpi.assets} label="Cryptographic assets" />
        <Kpi n={kpi.hndl} label="Harvest-now-decrypt-later exposed" cls="red" />
        <Kpi n={kpi.quantum_vulnerable} label="Quantum-vulnerable assets" />
        <div className="panel p-4">
          <div className="flex gap-1.5 flex-wrap">
            {["MIGRATE", "CONTAIN", "ACCEPT"].map((v) => <span key={v} className={`pill ${v}`}>{v} {verdicts[v]}</span>)}
          </div>
          <div className="dim text-[12px] mt-2">Verdict split</div>
        </div>
      </div>
      <div className="panel p-4">
        <div className="h mb-1">Risk field <span className="dim font-normal">— each dot is one asset: Mosca overexposure (X+Y−Z, years) vs business criticality</span></div>
        <div style={{ height: 340 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid stroke="#E3E7ED" />
              <XAxis type="number" dataKey="exposure" name="Overexposure (yrs)" stroke="#6B7785" label={{ value: "years overexposed (X+Y−Z)", position: "insideBottom", offset: -10, fill: "#6B7785" }} />
              <YAxis type="number" dataKey="criticality" name="Criticality" domain={[0.5, 3.5]} ticks={[1, 2, 3]} stroke="#6B7785" />
              <ZAxis type="number" dataKey="score" range={[50, 220]} name="Score" />
              <ReferenceLine x={0} stroke="#6B7785" strokeDasharray="4 4" />
              <Tooltip cursor={{ stroke: "#6B7785" }} contentStyle={{ background: "#fff", border: "1px solid #E3E7ED" }} />
              {TIERS.map((t) => (
                <Scatter key={t} name={t} data={field.filter((f) => f.tier === t)} fill={tierColor(t)} fillOpacity={0.85}
                  onClick={(d) => nav(`/asset/${d.id}`)} cursor="pointer" />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 dim text-[11px]">{TIERS.map((t) => <span key={t}><span style={{ color: tierColor(t) }}>●</span> {t}</span>)}<span>Dot size = score · click a dot to open the asset</span></div>
      </div>
      <div><button className="btn ghost" style={{ width: 200 }} onClick={() => setMore(!more)}>{more ? "Hide full findings" : "View full findings"}</button></div>
      {more && (
        <div className="panel p-4 flex flex-col gap-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {MORE.map(([k, l]) => (
              <div key={k}><div className="text-2xl font-semibold">{kpi[k]}</div><div className="dim text-[12px]">{l}</div></div>
            ))}
          </div>
          <div className="flex h-7 rounded overflow-hidden">
            {["MIGRATE", "CONTAIN", "ACCEPT"].map((v) => (
              verdicts[v] > 0 && <div key={v} className={`${v} grid place-items-center text-[11px] font-bold`} style={{ width: `${(verdicts[v] / total) * 100}%` }}>{v} {verdicts[v]}</div>
            ))}
          </div>
          <div><Link to="/queue" className="link">Open the work queue →</Link></div>
        </div>
      )}
    </div>
  );
}
