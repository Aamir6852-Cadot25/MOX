import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import RiskField, { Swatch } from "../components/RiskField.jsx";
import CoverageRing from "../components/CoverageRing.jsx";
import Icon from "../components/Icon.jsx";
import { Num } from "../components/Motion.jsx";
import { Tier, Verdict } from "../components/Marks.jsx";

const VERDICTS = [["MIGRATE", "m", "replace per the PQC map"], ["CONTAIN", "c", "isolate; cannot patch in place"], ["ACCEPT", "a", "monitor; validate at next scan"]];

function Tile({ n, unit, label, sub, tone, to, title }) {
  return (
    <Link to={to} className={`tile ${tone || ""}`} title={title}>
      <span className="n mono">{n}{unit && <span className="u">{unit}</span>}</span>
      <span className="l">{label}{sub && <><br /><span className="s">{sub}</span></>}</span>
    </Link>
  );
}

export default function Dashboard({ summary, onScanned }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const scanDemo = async () => {
    setBusy(true);
    setErr("");
    try {
      await api.scan();
      await onScanned();
    } catch (e) {
      setErr(`${e.message}. Generate it first with: python -m mox make-demo`);
    }
    setBusy(false);
  };

  if (!summary) return <div className="p-6 hint">Loading the latest scan</div>;
  if (summary.error)
    return (
      <div className="p-6">
        <div className="errbox" style={{ maxWidth: 560 }}>
          Could not load the latest scan: {summary.error}. Stored results are not affected.{" "}
          <button className="linkbtn" onClick={onScanned}>Retry</button>
        </div>
      </div>
    );
  if (!summary.scan)
    return (
      <div className="p-6">
        <div className="bp-card" style={{ maxWidth: 560 }}>
          <div className="card-h"><h2>No scan recorded yet</h2></div>
          <div className="card-b flex flex-col gap-3">
            <div className="hint">Point MOX at a folder on this machine from New Scan, or scan the bundled demo target to see every screen populated.</div>
            <div className="flex gap-2">
              <Link className="bp-btn pri" to="/scan">Open New Scan</Link>
              <button className="bp-btn" disabled={busy} onClick={scanDemo}>{busy ? "Scanning demo target" : "Scan the demo target"}</button>
            </div>
            {err && <div className="errbox">{err}</div>}
          </div>
        </div>
      </div>
    );

  const { kpi, verdicts, field } = summary;
  const vd = summary.verdict_detail;
  const total = kpi.assets || 1;
  return (
    <div className="dash">
      <div className="head">
        <h1>Dashboard</h1>
        <span className="sub"><span className="mono">{kpi.assets}</span> cryptographic assets correlated from <span className="mono">{summary.scan.findings_count}</span> findings</span>
        <div className="head-act">
          <Link className="bp-btn" to="/reports/compliance">Compliance report</Link>
          <Link className="bp-btn pri" to="/scan"><Icon name="refresh-cw" />Re-scan</Link>
        </div>
      </div>
      <div className="dash-b">
        {summary.coverage?.warning && (
          <div className="alert warn" role="status">
            <div style={{ flex: 1 }}><div className="ti">Coverage shrank</div><div className="de">{summary.coverage.warning}</div></div>
            <Link className="bp-btn" to="/scan"><Icon name="refresh-cw" />Re-scan with all planes</Link>
          </div>
        )}
        <div className="tiles">
          <Tile n={<Num k="kpi.assets" value={kpi.assets} />} label="Cryptographic assets" sub={`from ${summary.scan.findings_count} findings`} to="/findings" />
          <Tile n={<Num k="kpi.hndl" value={kpi.hndl} />} tone="crit" label="Harvest-now-decrypt-later exposed" to="/findings"
            sub={`plus ${kpi.forgery ?? 0} exposed to forgery${kpi.undetermined ? `, ${kpi.undetermined} of undeclared purpose` : ""}`}
            title="Shor-breakable key exchange, key transport or encryption whose Mosca exposure is above zero, counted only where the key's own config or code declares that use. Signing keys are counted as forgery; keys whose use is not declared are not counted as either." />
          <Tile n={<Num k="kpi.qv" value={kpi.quantum_vulnerable} />} tone="high" label="Quantum-vulnerable (Shor) assets" sub={`${kpi.safe} not Shor-breakable`} to="/findings" />
          <Tile n={kpi.readiness == null ? "–" : <Num k="kpi.readiness" value={kpi.readiness} />} unit="/100" tone="safe" label="Readiness index" sub="as disclosed in the attestation" to="/reports/attestation"
            title="100 − (50 × HNDL-exposed + 30 × quantum-vulnerable + 20 × MIGRATE) / assets, scaled 0.8–1.0 by plane coverage (mox/attest.py)" />
        </div>

        <div className="dash-row">
          <div className="bp-card" style={{ flex: 1, minWidth: 0 }}>
            <div className="card-h"><h2>Verdict split</h2><span className="note">every asset resolves to exactly one verdict</span></div>
            <div className="card-b">
              <div className="vbar">
                {VERDICTS.map(([v, c]) => verdicts[v] > 0 && (
                  <Link key={v} to={`/findings?verdict=${v}`} className={`vseg ${c}`} style={{ flex: verdicts[v] }}
                    aria-label={`${v}: ${verdicts[v]} assets`}>{v} <span className="mono"><Num k={`verdict.${v}`} value={verdicts[v]} /></span></Link>
                ))}
              </div>
              {vd?.most_urgent && (
                <div className="urgent">
                  <span className="lbl" style={{ margin: 0 }}>On fire now</span>
                  <span><span className="mono">{vd.wave1}</span> asset{vd.wave1 === 1 ? "" : "s"} in wave 1. Most urgent:</span>
                  <Link to={`/findings/${vd.most_urgent.id}`} className="mono">{vd.most_urgent.label}</Link>
                  <Tier tier={vd.most_urgent.tier} />
                  <span className="dim">{vd.most_urgent.why}.</span>
                </div>
              )}
              <div className="vcols">
                {VERDICTS.map(([v, , d]) => (
                  <Link key={v} to={`/findings?verdict=${v}`} className="vcol">
                    <span className="vh"><Verdict verdict={v} /><span className="mono"><Num k={`verdict.${v}`} value={verdicts[v]} /></span>
                      <span className="dim mono"><Num k={`verdict.${v}.pct`} value={Math.round((100 * verdicts[v]) / total)} />%</span></span>
                    <span className="dim">{d}</span>
                    {v === "MIGRATE" && vd && <span><span className="mono">{vd.migrate.wave1}</span> in wave 1, <span className="mono">{vd.migrate.auto_fix}</span> with an automatic fix</span>}
                    {v === "CONTAIN" && vd && (vd.contain.length
                      ? vd.contain.map(([why, n]) => <span key={why}><span className="mono">{n}</span> {why}</span>)
                      : <span>none: every asset can be patched in place</span>)}
                    {v === "ACCEPT" && vd && <span><span className="mono">{vd.accept.unverified}</span> on unverified evidence (verify first)</span>}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="bp-card" style={{ width: "var(--aside)", flex: "0 0 var(--aside)" }}>
            <div className="card-h"><h2>Plane coverage</h2><span className="note">latest scan</span></div>
            <div className="card-b"><CoverageRing stages={summary.stages} /></div>
          </div>
        </div>


        <div className="bp-card">
          <div className="card-h"><h2>Risk field</h2><span className="note">each dot is one asset; open it with a click or Enter</span></div>
          <div className="card-b">
            <div className="rf-key">
              {["Critical", "High", "Medium", "Low"].map((t) => <span key={t}><Swatch tier={t} />{t}</span>)}
              <span>dot size = risk score</span>
              <span>labels: highest risk that fit; hover or focus a dot for any other</span>
              <span>dashed line = Mosca break-even, X + Y = Z</span>
              {summary.unplotted > 0 && <span>not plotted: <span className="mono">{summary.unplotted}</span> with no identified algorithm (Mosca n/a)</span>}
              <Link to="/findings" className="rf-table">Same data as a table: work queue</Link>
            </div>
            <RiskField field={field} />
          </div>
        </div>
      </div>
    </div>
  );
}
