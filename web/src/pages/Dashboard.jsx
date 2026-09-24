import { useState } from "react";
import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { api, tierColor } from "../api.js";

const TIERS = ["Critical", "High", "Medium", "Low"];
const MORE = [["safe", "Quantum-safe or out of scope"], ["hybrid", "Hybrid PQ endpoints found"], ["files", "Files scanned"],
  ["planes", "Planes hit (of 7)"], ["seconds", "Scan time (s)"]];

function Kpi({ n, label, accent }) {
  return (
    <div className="card" style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}>
      <div className="kpi-n">{n}</div><div className="kpi-l">{label}</div>
    </div>
  );
}

const fmtMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : ms >= 10 ? `${ms.toFixed(0)} ms` : `${ms.toFixed(2)} ms`);
const join = (o) => Object.entries(o).filter(([, v]) => v).map(([k, v]) => `${k} ${v}`).join(" · ");
const STAGE_TEXT = {
  Ingest: (s) => [`${s.count} files`, "found in target tree"],
  Detect: (s) => [`${s.count} findings`, Object.entries(s.detail).filter(([, p]) => p.findings).map(([k, p]) => `${k} ${p.findings} (${fmtMs(p.ms)})`).join(" · ")],
  Correlate: (s) => [`${s.detail.findings} → ${s.detail.assets}`, "raw findings → assets"],
  Score: (s) => [`${s.count} scored`, join(s.detail)],
  Verdict: (s) => [join(s.detail) || "0", "at scan time"],
};

function Pipeline({ stages }) {
  return (
    <div className="card">
      <div className="h mb-2">Pipeline <span className="dim font-normal">— recorded stage timings from the latest scan (perf_counter)</span></div>
      {!stages?.length ? <div className="dim">No stage data for this scan — re-scan to record it.</div> : (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {stages.map((s, i) => {
            const [main, sub] = STAGE_TEXT[s.stage]?.(s) ?? [s.count, ""];
            return (
              <div key={s.stage} className="node relative" style={{ padding: 10 }}>
                <div className="p">{i + 1}. {s.stage}</div>
                <div className="text-lg font-bold">{main}</div>
                <div className="dim text-[11px]">{sub}</div>
                <div className="mono text-[11px] mt-1">{fmtMs(s.ms)} <span className="dim">· t+{fmtMs(s.t_ms)}</span></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi n={kpi.assets} label="Cryptographic assets" />
        <Kpi n={kpi.hndl} label="Harvest-now-decrypt-later exposed" accent="#B42318" />
        <Kpi n={kpi.quantum_vulnerable} label="Quantum-vulnerable assets" accent="#D9822B" />
        <div className="card">
          <div className="flex gap-1.5 flex-wrap kpi-n" style={{ fontSize: 13, lineHeight: "36px" }}>
            {["MIGRATE", "CONTAIN", "ACCEPT"].map((v) => <span key={v} className={`pill ${v}`}>{v} {verdicts[v]}</span>)}
          </div>
          <div className="kpi-l">Verdict split</div>
        </div>
      </div>
      <Pipeline stages={summary.stages} />
      <div className="card">
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
        <div className="card flex flex-col gap-3">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {MORE.map(([k, l]) => (
              <div key={k}><div className="kpi-n" style={{ fontSize: 28 }}>{kpi[k]}</div><div className="kpi-l">{l}</div></div>
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
