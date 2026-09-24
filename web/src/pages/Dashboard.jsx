import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import Pipeline from "../components/Pipeline.jsx";
import RiskField, { Swatch } from "../components/RiskField.jsx";
import CoverageRing from "../components/CoverageRing.jsx";
import Icon from "../components/Icon.jsx";

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
  const total = kpi.assets || 1;
  return (
    <div className="dash">
      <div className="head">
        <h1>Dashboard</h1>
        <span className="sub"><span className="mono">{kpi.assets}</span> cryptographic assets correlated from <span className="mono">{summary.scan.findings_count}</span> findings</span>
        <div className="head-act">
          <Link className="bp-btn" to="/report">Compliance report</Link>
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
          <Tile n={kpi.assets} label="Cryptographic assets" sub={`from ${summary.scan.findings_count} findings`} to="/queue" />
          <Tile n={kpi.hndl} tone="crit" label="Harvest-now-decrypt-later exposed" to="/queue"
            sub={`plus ${kpi.forgery ?? 0} exposed to forgery${kpi.undetermined ? `, ${kpi.undetermined} of undeclared purpose` : ""}`}
            title="Shor-breakable key exchange, key transport or encryption whose Mosca exposure is above zero, counted only where the key's own config or code declares that use. Signing keys are counted as forgery; keys whose use is not declared are not counted as either." />
          <Tile n={kpi.quantum_vulnerable} tone="high" label="Quantum-vulnerable (Shor) assets" sub={`${kpi.safe} not Shor-breakable`} to="/queue" />
          <Tile n={kpi.readiness ?? "–"} unit="/100" tone="safe" label="Readiness index" sub="as disclosed in the attestation" to="/attest"
            title="100 − (50 × HNDL-exposed + 30 × quantum-vulnerable + 20 × MIGRATE) / assets, scaled 0.8–1.0 by plane coverage (mox/attest.py)" />
        </div>

        <div className="dash-row">
          <div className="bp-card" style={{ flex: 1, minWidth: 0 }}>
            <div className="card-h"><h2>Verdict split</h2><span className="note">every asset resolves to exactly one verdict</span></div>
            <div className="card-b">
              <div className="vbar">
                {VERDICTS.map(([v, c]) => verdicts[v] > 0 && (
                  <Link key={v} to={`/queue?verdict=${v}`} className={`vseg ${c}`} style={{ flex: verdicts[v] }}
                    aria-label={`${v}: ${verdicts[v]} assets`}>{v} <span className="mono">{verdicts[v]}</span></Link>
                ))}
              </div>
              <div className="vkey">
                {VERDICTS.map(([v, , d]) => <span key={v}><b>{v}</b> <span className="mono">{Math.round((100 * verdicts[v]) / total)}%</span> {d}</span>)}
              </div>
            </div>
          </div>
          <div className="bp-card" style={{ width: "var(--aside)", flex: "0 0 var(--aside)" }}>
            <div className="card-h"><h2>Plane coverage</h2><span className="note">latest scan</span></div>
            <div className="card-b"><CoverageRing stages={summary.stages} /></div>
          </div>
        </div>

        <Pipeline stages={summary.stages} net={summary.scan.net} />

        <div className="bp-card">
          <div className="card-h"><h2>Risk field</h2><span className="note">each dot is one asset; open it with a click or Enter</span></div>
          <div className="card-b">
            <div className="rf-key">
              {["Critical", "High", "Medium", "Low"].map((t) => <span key={t}><Swatch tier={t} />{t}</span>)}
              <span>dot size = risk score</span>
              <span>dashed line = Mosca break-even, X + Y = Z</span>
              {summary.unplotted > 0 && <span>not plotted: <span className="mono">{summary.unplotted}</span> with no identified algorithm (Mosca n/a)</span>}
              <Link to="/queue" className="rf-table">Same data as a table: work queue</Link>
            </div>
            <RiskField field={field} />
          </div>
        </div>
      </div>
    </div>
  );
}
