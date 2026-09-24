import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import TerminalSurface from "./TerminalSurface.jsx";
import Icon from "./Icon.jsx";
import { PLANES, STAGES, fmtMs } from "./Pipeline.jsx";
import { reducedMotion, token, tween } from "../motion.js";

const PLANE_LABEL = { code: "source", dependencies: "deps", configs: "config", certificates: "certs",
  containers: "containers", binaries: "binaries", tls: "live tls" };
const TAG = { ok: "[  ok  ]", warn: "[ warn ]", fail: "[ fail ]", skip: "[ skip ]", run: "[ .... ]", wait: "[      ]" };

/** Correlate counts down from raw findings to correlated assets (existing behaviour, D10 motion table). */
function useCountDown(from, to, live) {
  const [v, setV] = useState(live ? from : to);
  useEffect(() => {
    if (!live || from === to || reducedMotion()) return setV(to);
    return tween(from, to, token("--t-slow"), (x) => setV(Math.round(x)));
  }, [from, to, live]);
  return v;
}

function fmtBytes(n) {
  if (n == null) return "–";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/** One line per plane, derived purely from real SSE state: the final Detect report once it lands,
 * otherwise the live progress snapshot, otherwise "waiting". Never a timer, never invented text. */
function planeLine(name, detect, progress, disabled) {
  if (disabled?.includes(name)) return { tag: "skip", text: `${PLANE_LABEL[name]}  off` };
  const d = detect?.[name];
  if (d) {
    const tag = d.status === "failed" ? "fail" : d.status === "partial" ? "warn" : "ok";
    const unit = name === "tls" ? (d.files === 1 ? "endpoint" : "endpoints") : "files";
    let text = `${PLANE_LABEL[name]}  ${d.files}/${d.files} ${unit}  ${fmtMs(d.ms)}  ${d.findings} finding${d.findings === 1 ? "" : "s"}`;
    return { tag, text, detail: d.error };
  }
  const p = progress?.[name];
  if (p) return { tag: "run", text: `${PLANE_LABEL[name]}  reading (${p.done}/${p.total} files)` };
  return { tag: "wait", text: `${PLANE_LABEL[name]}  waiting` };
}

function StageCell({ name, i, got, state }) {
  const s = got[name];
  const idx = STAGES.indexOf(name);
  const running = state === "running" && !s && (idx === 0 || got[STAGES[idx - 1]]);
  const failed = state === "error" && !s && (idx === 0 || got[STAGES[idx - 1]]);
  let value = s ? `${s.count}` : failed ? "failed" : running ? "running" : "–";
  return (
    <div className={`ledger-stage${s ? " done" : ""}${failed ? " failed" : ""}`}>
      <div className="st">{i + 1} {name}</div>
      <div className="sv mono">{value}</div>
      <div className="fill"><i style={{ width: s ? "100%" : running ? "50%" : "0%" }} /></div>
    </div>
  );
}

/**
 * The scan ledger: a TerminalSurface (D9) showing only what real SSE events report. No consumer of
 * this component may pass in a timer-driven value; every number here traces to a stage/progress event.
 */
export default function ScanLedger({ run, disabled = [], onOpenFindings, onOpenDashboard }) {
  const [ripples, setRipples] = useState([]);
  const lastFindings = useRef({});
  const startedAt = useRef(null);
  const [lastEventAt, setLastEventAt] = useState(null);

  const state = run?.state;
  useEffect(() => {
    if (state === "running" && !startedAt.current) startedAt.current = Date.now();
    if (!run) { startedAt.current = null; lastFindings.current = {}; }
  }, [state, run]);

  // D10 ripple: only on a real progress event reporting more findings in some plane than before.
  useEffect(() => {
    if (!run?.progress) return;
    setLastEventAt(Date.now());
    let grew = false;
    for (const [name, p] of Object.entries(run.progress)) {
      const prev = lastFindings.current[name] || 0;
      if (p.findings > prev) grew = true;
      lastFindings.current[name] = p.findings;
    }
    if (grew && !reducedMotion()) {
      const id = Date.now() + Math.random();
      setRipples((r) => [...r.slice(-2), { id }]); // max 3 concurrent (D10)
      setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), token("--t-slow"));
    }
  }, [run?.progress]);
  useEffect(() => { if (run?.stages?.length) setLastEventAt(Date.now()); }, [run?.stages?.length]);

  const got = Object.fromEntries((run?.stages || []).map((s) => [s.stage, s]));
  const corr = got.Correlate?.detail;
  const live = run?.state === "running" || run?.state === "error";
  const shownAssets = useCountDown(corr?.findings ?? 0, corr?.assets ?? 0, live && !!corr);
  const detect = got.Detect?.detail;

  if (!run) return (
    <TerminalSurface className="ledger">
      <div className="ledger-hd"><h2>Scan ledger</h2><span className="note">start a scan to see it fill in, line by line</span></div>
      <div className="ledger-log dim">Nothing has run yet. Every line here comes from the scanner as it works — nothing is simulated.</div>
    </TerminalSurface>
  );

  const elapsedMs = startedAt.current && lastEventAt ? lastEventAt - startedAt.current : null;
  const lines = PLANES.map((n) => ({ name: n, ...planeLine(n, detect, run.progress, disabled) }));

  return (
    <TerminalSurface className="ledger">
      <div className="ledger-hd">
        {ripples.map((r) => <span key={r.id} className="ledger-ring" />)}
        <h2>Scan ledger</h2>
        <span className="note mono">{run.path}</span>
      </div>
      <div className="ledger-stages">
        {STAGES.map((n, i) => <StageCell key={n} name={n} i={i} got={got} state={run.state} />)}
      </div>
      <div className="ledger-body">
        <div className="ledger-log">
          {lines.map((l) => (
            <div key={l.name} className={`ledger-line ${l.tag}`}>
              <span className="tag mono">{TAG[l.tag]}</span><span className="mono">{l.text}</span>
              {l.detail && <span className="detail">{l.detail}</span>}
            </div>
          ))}
          {corr && (
            <div className="ledger-line" style={{ marginTop: "var(--s3)" }}>
              <span className="tag mono">{TAG.ok}</span>
              <span>correlate <span className="ledger-correlate mono">{corr.findings} → {shownAssets}</span> findings into assets</span>
            </div>
          )}
          {run.state === "error" && <div className="ledger-line fail"><span className="tag mono">{TAG.fail}</span><span>{run.error}</span></div>}
        </div>
        <div className="ledger-check">
          {PLANES.map((n) => {
            const d = detect?.[n];
            const p = run.progress?.[n];
            const total = d?.files ?? p?.total ?? 0;
            const done = d ? total : p?.done ?? 0;
            const pct = total ? (100 * done) / total : d ? 100 : 0;
            const cls = d?.status === "failed" ? "failed" : d ? "done" : "";
            return (
              <div key={n} className={`ledger-check-row ${cls}`}>
                <div className="mono">{PLANE_LABEL[n]} {disabled.includes(n) ? "off" : `${done}/${total}`}</div>
                <div className="bar"><i style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </div>
      <div className={`ledger-ft${run.net?.outbound ? " bad" : ""}`}>
        <span>elapsed <b className="mono">{elapsedMs != null ? fmtMs(elapsedMs) : "–"}</b></span>
        <span>bytes read <b className="mono">{fmtBytes(run.bytesRead)}</b></span>
        <span>outbound connects <b className="mono">{run.net ? run.net.outbound : "–"}</b></span>
      </div>
      {run.state === "done" && (
        <div className="ledger-done">
          <span className="dim mono" style={{ fontSize: 11 }}>scan complete</span>
          <Link className="bp-btn pri" to="/findings" onClick={onOpenFindings}><Icon name="list-checks" />Open findings</Link>
          <Link className="bp-btn" to="/dashboard" onClick={onOpenDashboard}>Open dashboard</Link>
        </div>
      )}
    </TerminalSurface>
  );
}
