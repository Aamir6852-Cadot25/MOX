import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import Icon from "../components/Icon.jsx";
import { Num, Disclosure } from "../components/Motion.jsx";
import { Tier, Verdict } from "../components/Marks.jsx";

const QUANTUM = { shor: "Shor-breakable", grover: "Grover-weakened", none: "not quantum-weakened" };
const CRIT_LABEL = { 1: "Low", 2: "Normal", 3: "Mission-critical" };
const ROWS = [3, 2, 1];
const COLS = [
  ["safe", "Safe", (e) => e <= -3],
  ["near", "Near horizon", (e) => e > -3 && e <= 0],
  ["exposed", "Exposed", (e) => e > 0],
];
const SEVERITY = ["safe", "low", "med", "high", "crit"];
const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

function colOf(exposure) {
  return COLS.find(([, , test]) => test(exposure))?.[0];
}

/** Neutral to red by row (criticality) + column (exposure) severity: mission-critical + exposed is worst. */
function cellClass(row, colKey) {
  const rowIdx = ROWS.indexOf(row); // 0 = mission-critical
  const colIdx = COLS.findIndex(([k]) => k === colKey);
  const combined = Math.min(4, (2 - rowIdx) + colIdx);
  return SEVERITY[combined];
}

function ScoreBar({ b, score, tier }) {
  const t = Object.fromEntries(b.terms.map((r) => [r.term, r]));
  const subtotal = t.subtotal.value || 1;
  const seg = [["base", t.base.value, "crit"], ["quantum", t.quantum.value, "high"], ["evidence", t.evidence.value, "med"]];
  return (
    <div className="flex flex-col gap-1">
      <div className="flex" style={{ height: 14, borderRadius: "var(--r)", overflow: "hidden", border: "1px solid var(--line)" }}>
        {seg.map(([k, v, fam]) => v > 0 && (
          <div key={k} title={`${k}: +${v}`} style={{ flex: v, background: `var(--${fam}-line)` }} />
        ))}
      </div>
      <div className="hint mono">{t.subtotal.value} (base+quantum+evidence) &times; {t.criticality.value} crit &times; {t.confidence.value} conf = <b>{score}</b> <Tier tier={tier} /></div>
    </div>
  );
}

function MoscaMini({ m }) {
  if (m.exposure == null) return <div className="hint">Mosca not applicable: {m.reason}.</div>;
  const span = Math.max(m.x + m.y, m.z) * 1.08 || 1;
  const pct = (v) => `${(100 * v) / span}%`;
  const exp = m.exposure;
  return (
    <div className="flex flex-col gap-1">
      <div className="tl-tr" style={{ position: "relative", height: 8 }}>
        <div className="tl-x" style={{ width: pct(m.x) }} />
        <div className="tl-y" style={{ left: pct(m.x), width: pct(m.y) }} />
        <div className="tl-z" style={{ left: pct(m.z) }} />
        {exp > 0 && <div className="tl-e" style={{ left: pct(m.z), width: pct(exp) }} />}
      </div>
      <div className="hint mono">X {m.x}y + Y {m.y}y vs Z {m.z}y &mdash; {exp > 0 ? <b className="red">exposed by {exp} yrs</b> : <b className="min">safe by {-exp} yrs</b>}</div>
    </div>
  );
}

function DetailPanel({ asset, onClose }) {
  const b = asset.breakdown, m = b.mosca;
  const hndl = b.threats?.includes("hndl");
  return (
    <div className="bp-card" style={{ marginTop: "var(--s3)" }}>
      <div className="card-h"><h2>{asset.label}</h2>
        <button type="button" className="linkbtn" style={{ marginLeft: "auto" }} onClick={onClose}>Close</button></div>
      <div className="card-b flex flex-col gap-3">
        <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
          <span className="b plain">{QUANTUM[b.quantum]}</span>
          <span className="b plain">lifetime {m.x ?? "–"}y</span>
          <span className="b plain">{CRIT_LABEL[b.criticality]} criticality</span>
          {hndl && <span className="b crit">harvest-now-decrypt-later</span>}
        </div>
        <ScoreBar b={b} score={asset.score} tier={asset.tier} />
        <MoscaMini m={m} />
        <Disclosure summary="Show formula">
          <div className="brk" style={{ marginTop: "var(--s2)" }}>
            {b.terms.map((r) => (
              <div key={r.term} className={`brk-r${r.term === "subtotal" ? " sub" : ""}`}>
                <span>{r.term}</span><span className="bn">{r.basis}</span>
                <span className="bv mono">{r.op}{r.value}</span>
              </div>
            ))}
          </div>
        </Disclosure>
        <div className="flex gap-2">
          <Link className="bp-btn pri" to={asset.fix_finding ? `/code/${asset.fix_finding}` : "/findings"}>Fix &#8594;</Link>
          <Link className="bp-btn" to={`/findings/${asset.id}`}>Full detail</Link>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ summary, onScanned }) {
  const [assets, setAssets] = useState(null);
  const [err, setErr] = useState("");
  const [z, setZ] = useState(null);
  const [zBusy, setZBusy] = useState(false);
  const [filter, setFilter] = useState(null); // {row, col} or null
  const [selected, setSelected] = useState(null);

  const load = () => { api.assets().then(setAssets).catch((e) => setErr(e.message)); };
  useEffect(load, [summary?.scan?.id]);
  useEffect(() => { api.settings().then((s) => setZ(s.threat_horizon)).catch(() => {}); }, []);

  if (!summary) return <div className="p-6 hint">Loading the latest scan</div>;
  if (summary.error)
    return <div className="p-6"><div className="errbox">Could not load the latest scan: {summary.error}. <button className="linkbtn" onClick={onScanned}>Retry</button></div></div>;
  if (!summary.scan)
    return (
      <div className="p-6"><div className="bp-card" style={{ maxWidth: 560 }}>
        <div className="card-h"><h2>No scan recorded yet</h2></div>
        <div className="card-b flex flex-col gap-3">
          <div className="hint">No scan yet. Discover a folder or repository to see what breaks first under quantum attack.</div>
          <Link className="bp-btn pri" to="/scan">Open Discover</Link>
        </div>
      </div></div>
    );
  if (err) return <div className="p-6"><div className="errbox">Could not load assets: {err}. <button className="linkbtn" onClick={load}>Retry</button></div></div>;
  if (!assets) return <div className="p-6 hint">Loading assets</div>;

  const kpi = summary.kpi;
  const plotted = assets.filter((a) => a.breakdown.mosca.exposure != null);
  const notPlotted = assets.length - plotted.length;
  const matrix = {};
  for (const row of ROWS) for (const [col] of COLS) matrix[`${row}:${col}`] = 0;
  for (const a of plotted) matrix[`${a.breakdown.criticality}:${colOf(a.breakdown.mosca.exposure)}`]++;

  const shown = assets.filter((a) => {
    if (!filter) return true;
    if (filter === "unplotted") return a.breakdown.mosca.exposure == null;
    return a.breakdown.criticality === filter.row && colOf(a.breakdown.mosca.exposure) === filter.col;
  });

  const saveZ = async (n) => {
    setZ(n);
    setZBusy(true);
    try { await api.setSettings({ threat_horizon: n }); await onScanned(); await load(); } catch { /* keep the slider value; the pill below shows the last saved Z on reload */ }
    setZBusy(false);
  };

  const setCrit = async (asset, crit) => {
    await api.override(asset.id, { criticality: crit });
    load();
  };

  const verdicts = summary.verdicts;
  const vtotal = (verdicts.MIGRATE || 0) + (verdicts.CONTAIN || 0) + (verdicts.ACCEPT || 0) || 1;

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="head" style={{ background: "none", border: 0, padding: 0 }}>
        <h1>Quantum risk: what breaks first?</h1>
      </div>

      <div className="bp-card">
        <div className="card-b flex gap-3 items-center">
          <label htmlFor="z" className="lbl" style={{ margin: 0 }}>Quantum horizon (Z)</label>
          <input id="z" type="range" min="1" max="40" value={z ?? 10} disabled={z == null}
            onChange={(e) => saveZ(+e.target.value)} style={{ flex: 1 }} />
          <span className="mono">{z ?? "–"} yrs</span>
          {zBusy && <span className="hint">re-scoring…</span>}
        </div>
      </div>

      <div className="hint">
        <span className="mono">{kpi.assets}</span> assets &middot; <span className="mono">{kpi.hndl}</span> harvest-now-decrypt-later exposed &middot;{" "}
        <span className="mono">{kpi.quantum_vulnerable}</span> Shor-vulnerable &middot; readiness <span className="mono">{kpi.readiness ?? "–"}/100</span>
      </div>
      <div className="vbar" style={{ height: 10 }}>
        {["MIGRATE", "CONTAIN", "ACCEPT"].map((v) => verdicts[v] > 0 && (
          <div key={v} className={`vseg ${v === "MIGRATE" ? "m" : v === "CONTAIN" ? "c" : "a"}`} style={{ flex: verdicts[v] }} title={`${v}: ${verdicts[v]}`} />
        ))}
      </div>

      <div className="bp-card">
        <div className="card-h"><h2>Risk matrix</h2><span className="note">rows: business criticality &middot; columns: Mosca exposure &middot; click a cell to filter</span></div>
        <div className="card-b">
          <table className="bp-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th></th>{COLS.map(([k, l]) => <th key={k} style={{ textAlign: "center" }}>{l}</th>)}</tr></thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row}>
                  <td className="dim" style={{ whiteSpace: "nowrap" }}>{row} {CRIT_LABEL[row]}</td>
                  {COLS.map(([col]) => {
                    const n = matrix[`${row}:${col}`];
                    const active = filter && filter !== "unplotted" && filter.row === row && filter.col === col;
                    return (
                      <td key={col} style={{ padding: "var(--s1)" }}>
                        <button type="button" className={`b risk-cell ${cellClass(row, col)}`} style={{ width: "100%", height: 44, fontSize: 15, border: active ? "2px solid var(--ink)" : undefined }}
                          onClick={() => setFilter(active ? null : { row, col })}>{n}</button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {notPlotted > 0 && (
            <button type="button" className="linkbtn" style={{ marginTop: "var(--s2)" }} onClick={() => setFilter(filter === "unplotted" ? null : "unplotted")}>
              not plotted ({notPlotted}) &mdash; no identified algorithm
            </button>
          )}
        </div>
      </div>

      <div className="bp-card">
        <div className="card-h"><h2>Assets{filter ? " (filtered)" : ""}</h2>
          {filter && <button type="button" className="linkbtn" style={{ marginLeft: "auto" }} onClick={() => setFilter(null)}>Clear filter</button>}</div>
        <div className="card-b" style={{ padding: 0 }}>
          <table className="bp-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th className="p-2">Algorithm / file:line</th><th>Type</th><th>Lifetime</th><th>Criticality</th><th>Verdict</th><th></th></tr></thead>
            <tbody>
              {shown.map((a) => (
                <tr key={a.id} className="row" onClick={() => setSelected(a.id === selected ? null : a.id)} style={{ cursor: "pointer" }}>
                  <td className="mono">{a.label}</td>
                  <td>{QUANTUM[a.breakdown.quantum]}</td>
                  <td className="mono">{a.breakdown.mosca.x ?? "–"}y</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select value={a.breakdown.criticality} onChange={(e) => setCrit(a, +e.target.value)}>
                      {[3, 2, 1].map((c) => <option key={c} value={c}>{CRIT_LABEL[c]}</option>)}
                    </select>
                  </td>
                  <td><Verdict verdict={a.verdict} /></td>
                  <td><Link to={a.fix_finding ? `/code/${a.fix_finding}` : `/findings/${a.id}`} onClick={(e) => e.stopPropagation()}>Fix &#8594;</Link></td>
                </tr>
              ))}
              {!shown.length && <tr><td className="p-2 dim" colSpan={6}>No asset matches this filter.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selected != null && (() => {
        const asset = assets.find((a) => a.id === selected);
        return asset ? <DetailPanel asset={asset} onClose={() => setSelected(null)} /> : null;
      })()}
    </div>
  );
}
