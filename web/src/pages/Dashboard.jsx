import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { Disclosure } from "../components/Motion.jsx";
import PageHeader from "../components/PageHeader.jsx";
import YearsBar from "../components/YearsBar.jsx";

const CRIT_LABEL = { 1: "Low", 2: "Normal", 3: "Mission" };
const CRIT_FULL = { 1: "Low criticality", 2: "Normal criticality", 3: "Mission-critical" };
const ROWS = [3, 2, 1];
const COLS = [
  ["safe", "Safe", (e) => e <= -3],
  ["near", "Near horizon", (e) => e > -3 && e <= 0],
  ["exposed", "Exposed", (e) => e > 0],
];
const colOf = (exposure) => COLS.find(([, , test]) => test(exposure))?.[0];
const colTone = (col) => (col === "exposed" ? "crit" : col === "near" ? "high" : "plain");

export default function Dashboard({ summary, onScanned }) {
  const [assets, setAssets] = useState(null);
  const [err, setErr] = useState("");
  const [z, setZ] = useState(null);
  const [zBusy, setZBusy] = useState(false);
  const [filter, setFilter] = useState(null); // {row, col} or null

  const load = () => { api.assets().then(setAssets).catch((e) => setErr(e.message)); };
  useEffect(load, [summary?.scan?.id]);
  useEffect(() => { api.settings().then((s) => setZ(s.threat_horizon)).catch(() => {}); }, []);

  if (!summary) return <div className="page hint">Loading the latest scan</div>;
  if (summary.error)
    return <div className="page"><div className="errbox">Could not load the latest scan: {summary.error}. <button className="linkbtn" onClick={onScanned}>Retry</button></div></div>;
  if (!summary.scan)
    return (
      <div className="page">
        <PageHeader title="What breaks first, and when?" />
        <div className="bp-card" style={{ maxWidth: 560 }}>
          <div className="card-h"><h2>No scan recorded yet</h2></div>
          <div className="card-b flex flex-col gap-3">
            <div className="hint">No scan yet. Discover a folder or repository to see what breaks first under quantum attack.</div>
            <Link className="bp-btn pri" to="/scan">Open Discover</Link>
          </div>
        </div>
      </div>
    );
  if (err) return <div className="page"><div className="errbox">Could not load assets: {err}. <button className="linkbtn" onClick={load}>Retry</button></div></div>;
  if (!assets) return <div className="page hint">Loading assets</div>;

  const saveZ = async (n) => {
    setZ(n);
    setZBusy(true);
    try { await api.setSettings({ threat_horizon: n }); await onScanned(); await load(); } catch { /* keep the slider value; it reflects the last saved Z on reload */ }
    setZBusy(false);
  };

  const plotted = assets.filter((a) => a.breakdown.mosca.exposure != null);
  const notPlotted = assets.filter((a) => a.breakdown.mosca.exposure == null);
  const exposedNow = plotted.filter((a) => a.breakdown.mosca.exposure > 0).length;
  const nearHorizon = plotted.filter((a) => a.breakdown.mosca.exposure > -3 && a.breakdown.mosca.exposure <= 0).length;
  const safeNow = plotted.filter((a) => a.breakdown.mosca.exposure <= -3).length;

  const matrix = {};
  for (const row of ROWS) for (const [col] of COLS) matrix[`${row}:${col}`] = 0;
  for (const a of plotted) matrix[`${a.breakdown.criticality}:${colOf(a.breakdown.mosca.exposure)}`]++;

  const sorted = [...plotted].sort((a, b) =>
    b.breakdown.mosca.exposure - a.breakdown.mosca.exposure || b.breakdown.criticality - a.breakdown.criticality);
  const shown = filter ? sorted.filter((a) => a.breakdown.criticality === filter.row && colOf(a.breakdown.mosca.exposure) === filter.col) : sorted;

  return (
    <div className="page">
      <PageHeader title="What breaks first, and when?"
        action={
          <div className="flex items-center gap-2">
            <label htmlFor="z" className="dim" style={{ fontSize: 12 }}>If a quantum computer arrives in</label>
            <input id="z" type="range" min="1" max="40" value={z ?? 10} disabled={z == null}
              onChange={(e) => saveZ(+e.target.value)} style={{ width: 160 }} />
            <span className="mono tn" style={{ fontSize: 12 }}>{z ?? "–"} yrs</span>
            {zBusy && <span className="hint">re-scoring…</span>}
          </div>
        } />

      <div className="grid grid-cols-3 gap-3" style={{ marginBottom: "var(--gutter)" }}>
        <div className="tile crit"><div className="n tn">{exposedNow}</div><div className="l">Exposed now</div></div>
        <div className="tile high"><div className="n tn">{nearHorizon}</div><div className="l">Within 3 yrs of the horizon</div></div>
        <div className="tile safe"><div className="n tn">{safeNow}</div><div className="l">Safe for now</div></div>
      </div>

      <div className="grid-12">
        <div className="col-5">
          <div className="bp-card">
            <div className="card-h"><h2>Risk matrix</h2>
              {filter && <button type="button" className="linkbtn" style={{ marginLeft: "auto" }} onClick={() => setFilter(null)}>Clear filter</button>}</div>
            <div className="card-b">
              <div className="qr-matrix">
                <div className="qr-matrix-row qr-matrix-head">
                  <span />
                  {COLS.map(([k, l]) => <span key={k} className="qr-matrix-collabel">{l}</span>)}
                </div>
                {ROWS.map((row) => (
                  <div className="qr-matrix-row" key={row}>
                    <span className="qr-matrix-rowlabel">{CRIT_LABEL[row]}</span>
                    {COLS.map(([col]) => {
                      const n = matrix[`${row}:${col}`];
                      const active = filter && filter.row === row && filter.col === col;
                      return (
                        <button key={col} type="button" aria-pressed={active}
                          className={`qr-matrix-cell risk-cell ${n > 0 ? colTone(col) : "plain"}${active ? " active" : ""}`}
                          onClick={() => setFilter(active ? null : { row, col })}>
                          {n > 0 ? n : ""}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="col-7">
          <div className="bp-card">
            <div className="card-h"><h2>Assets{filter ? " (filtered)" : ""}</h2>
              <span className="note">sorted by exposure, then criticality</span></div>
            <div className="card-b" style={{ padding: 0 }}>
              <div className="qr-list">
                {shown.map((a) => {
                  const exp = a.breakdown.mosca.exposure;
                  return (
                    <Link key={a.id} to={`/findings/${a.id}`} className="qr-row">
                      <div style={{ minWidth: 0 }}>
                        <div className="qr-row-loc mono">{a.label}{a.primary_location && <span className="dim"> {a.primary_location}</span>}</div>
                        <div className="qr-row-sub">{CRIT_FULL[a.breakdown.criticality]}</div>
                      </div>
                      <YearsBar m={a.breakdown.mosca} mini />
                      <div className={`qr-row-exp mono tn${exp > 0 ? " exp" : ""}`}>
                        {exp > 0 ? `${exp} yrs overdue` : `${-exp} yrs left`}
                      </div>
                    </Link>
                  );
                })}
                {!shown.length && <div className="p-4 dim">No asset matches this filter.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {notPlotted.length > 0 && (
        <div style={{ marginTop: "var(--gutter)" }}>
          <Disclosure summary={`Not plotted (${notPlotted.length})`}>
            <div className="qr-list panel">
              {notPlotted.map((a) => (
                <Link key={a.id} to={`/findings/${a.id}`} className="qr-row" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="qr-row-loc mono">{a.label}{a.primary_location && <span className="dim"> {a.primary_location}</span>}</div>
                </Link>
              ))}
            </div>
          </Disclosure>
        </div>
      )}
    </div>
  );
}
