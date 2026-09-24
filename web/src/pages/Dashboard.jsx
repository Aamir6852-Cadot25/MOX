import { useState } from "react";
import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { useNavigate } from "react-router-dom";
import { api, tierColor } from "../api.js";

const KPIS = [
  ["hndl", "Harvest-now-decrypt-later exposed", "red"],
  ["quantum_vulnerable", "Quantum-vulnerable assets", "amb"],
  ["safe", "Quantum-safe or out of scope", "min"],
  ["hybrid", "Hybrid PQ endpoints found", ""],
  ["assets", "Cryptographic assets", ""],
  ["files", "Files scanned", ""],
  ["planes", "Planes hit (of 7)", ""],
  ["seconds", "Scan time (s)", ""],
];
const TIERS = ["Critical", "High", "Medium", "Low"];

export default function Dashboard({ summary, onScanned }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
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
    <div className="p-5 flex flex-col gap-4 max-w-[1500px] mx-auto">
      <div className="flex justify-between items-center">
        <div className="h text-base">Dashboard <span className="dim font-normal">— {kpi.assets} cryptographic assets from {summary.scan.findings_count} findings</span></div>
        <div className="w-56"><button className="btn ghost" disabled={busy} onClick={run}>{busy ? "Scanning…" : "Re-scan"}</button></div>
      </div>
      {err && <div className="red">{err}</div>}
      <div className="panel grid grid-cols-2 md:grid-cols-4">
        {KPIS.map(([k, label, cls]) => (
          <div key={k} className="p-4 border-r border-b border-[#1d2b26]">
            <div className={`text-3xl font-bold ${cls}`}>{kpi[k]}</div>
            <div className="dim text-[12px] mt-1">{label}</div>
          </div>
        ))}
      </div>
      <div className="panel p-4">
        <div className="h mb-1">Risk field <span className="dim font-normal">— each dot is one asset: Mosca overexposure (X+Y−Z, years) vs business criticality</span></div>
        <div style={{ height: 340 }}>
          <ResponsiveContainer>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid stroke="#1d2b26" />
              <XAxis type="number" dataKey="exposure" name="Overexposure (yrs)" stroke="#8a9b94" label={{ value: "years overexposed (X+Y−Z)", position: "insideBottom", offset: -10, fill: "#8a9b94" }} />
              <YAxis type="number" dataKey="criticality" name="Criticality" domain={[0.5, 3.5]} ticks={[1, 2, 3]} stroke="#8a9b94" />
              <ZAxis type="number" dataKey="score" range={[50, 220]} name="Score" />
              <ReferenceLine x={0} stroke="#ef6a60" strokeDasharray="4 4" />
              <Tooltip cursor={{ stroke: "#f0b43c" }} contentStyle={{ background: "#0f1916", border: "1px solid #2a3b35" }} />
              {TIERS.map((t) => (
                <Scatter key={t} name={t} data={field.filter((f) => f.tier === t)} fill={tierColor(t)} fillOpacity={0.85}
                  onClick={(d) => nav(`/asset/${d.id}`)} cursor="pointer" />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-4 dim text-[11px]">{TIERS.map((t) => <span key={t}><span style={{ color: tierColor(t) }}>●</span> {t}</span>)}<span>Dot size = score · click a dot to open the asset</span></div>
      </div>
      <div className="panel p-4">
        <div className="h mb-2">Verdict split</div>
        <div className="flex h-7 rounded overflow-hidden">
          {["MIGRATE", "CONTAIN", "ACCEPT"].map((v) => (
            verdicts[v] > 0 && <div key={v} className={`${v} grid place-items-center text-[11px] font-bold`} style={{ width: `${(verdicts[v] / total) * 100}%` }}>{v} {verdicts[v]}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
