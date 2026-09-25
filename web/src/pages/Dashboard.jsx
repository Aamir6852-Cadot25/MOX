import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { Disclosure } from "../components/Motion.jsx";
import Icon from "../components/Icon.jsx";
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
const colTone = (col) => (col === "exposed" ? "crit" : col === "near" ? "high" : col === "safe" ? "safe" : "plain");

export default function Dashboard({ summary, onScanned }) {
  const [assets, setAssets] = useState(null);
  const [err, setErr] = useState("");
  const [z, setZ] = useState(null);
  const [zBusy, setZBusy] = useState(false);
  const [filter, setFilter] = useState(null); // {row, col} or null
  const seq = useRef(0); // only the newest horizon change may write results; older responses are dropped

  const load = (n = seq.current) => { api.assets().then((a) => { if (n === seq.current) setAssets(a); }).catch((e) => setErr(e.message)); };
  useEffect(() => load(), [summary?.scan?.id]);
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
    const mine = ++seq.current;
    try { await api.setSettings({ threat_horizon: n }); if (mine !== seq.current) return; await onScanned(); load(mine); } catch { /* keep the slider value; it reflects the last saved Z on reload */ }
    if (mine === seq.current) setZBusy(false);
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

  // Most urgent (Task 2): the highest years-overdue asset, or the highest score if none is overdue.
  const overdue = plotted.filter((a) => a.breakdown.mosca.exposure > 0);
  const urgent = assets.length
    ? (overdue.length ? overdue.reduce((best, a) => (a.breakdown.mosca.exposure > best.breakdown.mosca.exposure ? a : best))
      : assets.reduce((best, a) => (a.score > best.score ? a : best)))
    : null;
  const urgentExp = urgent?.breakdown.mosca.exposure;

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

      {urgent && (
        <div className="urgent-line" style={{ marginBottom: "var(--gutter)" }}>
          <div className="flex items-center gap-2" style={{ color: "var(--crit-ink)" }}>
            <Icon name="triangle-alert" />
            <span className="mono font-bold" style={{ color: "var(--ink)" }}>Most urgent: {urgent.label || urgent.algorithm}</span>
          </div>
          <span className="chip" style={{ color: "var(--crit-ink)", background: "var(--crit-bg)", borderColor: "var(--crit-line)", fontSize: 11 }}>
            {urgentExp > 0 ? `${urgentExp} yrs overdue (X + Y − Z)` : `score ${urgent.score}`}
          </span>
          <Link className="bp-btn pri" style={{ marginLeft: "auto" }} to={`/findings/${urgent.id}`}>Fix this &#8594;</Link>
        </div>
      )}

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
                  const threats = a.breakdown.threats || [];
                  return (
                    <Link key={a.id} to={`/findings/${a.id}`} className="qr-row">
                      <div style={{ minWidth: 0 }}>
                        <div className="qr-row-loc mono">
                          {a.label}{a.primary_location && <span className="dim"> {a.primary_location}</span>}
                          {threats.includes("hndl") && (
                            <span className="chip" style={{ color: "var(--crit-ink)", background: "var(--crit-bg)", borderColor: "var(--crit-line)", fontSize: 10, padding: "0 var(--s1)", height: "var(--badge-h)", marginLeft: "var(--s2)" }}>
                              HNDL
                            </span>
                          )}
                          {threats.includes("forgery") && (
                            <span className="chip" style={{ color: "var(--high-ink)", background: "var(--high-bg)", borderColor: "var(--high-line)", fontSize: 10, padding: "0 var(--s1)", height: "var(--badge-h)", marginLeft: "var(--s2)" }}>
                              Forgery
                            </span>
                          )}
                        </div>
                        <div className="qr-row-sub">{CRIT_FULL[a.breakdown.criticality]}
                          <span className="mono"> &middot; X {a.breakdown.mosca.x} + Y {a.breakdown.mosca.y} &minus; Z {a.breakdown.mosca.z} = {exp}</span></div>
                      </div>
                      <YearsBar m={a.breakdown.mosca} mini />
                      <div className={`qr-row-exp mono tn${exp > 0 ? " exp" : ""}`}>
                        {exp > 0 ? `${exp} yr${exp === 1 ? "" : "s"} overdue` : `${-exp} yr${exp === -1 ? "" : "s"} left`}
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
