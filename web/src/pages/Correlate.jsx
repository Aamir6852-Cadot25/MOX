import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader.jsx";
import Icon from "../components/Icon.jsx";

export default function Correlate({ summary }) {
  const f = summary?.kpi?.findings || 0;
  const p = summary?.kpi?.planes || 0;

  return (
    <div className="page" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <PageHeader title="Correlate" step="3 Correlate" />
      <div style={{ flex: 1, display: "flex", gap: "var(--s5)", minHeight: 0, overflow: "hidden" }}>
        
        {/* Left: Star Graph */}
        <div className="bp-card" style={{ flex: "2", display: "flex", flexDirection: "column", background: "var(--term-bg)", position: "relative" }}>
          <div className="card-h" style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
            <h2>{f} findings across {p} planes = 1 key</h2>
          </div>
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <svg width="100%" height="100%" viewBox="-300 -300 600 600" style={{ minHeight: "400px" }}>
              {/* Lines */}
              <line x1="0" y1="0" x2="-150" y2="-150" stroke="var(--line-2)" strokeWidth="2" />
              <line x1="0" y1="0" x2="150" y2="-150" stroke="var(--line-2)" strokeWidth="2" />
              <line x1="0" y1="0" x2="-150" y2="150" stroke="var(--line-2)" strokeWidth="2" />
              <line x1="0" y1="0" x2="150" y2="150" stroke="var(--line-2)" strokeWidth="2" />
              
              {/* Center Node */}
              <circle cx="0" cy="0" r="50" fill="var(--surface)" stroke="var(--brand-ink)" strokeWidth="3" />
              <text x="0" y="-5" textAnchor="middle" fill="var(--ink)" fontSize="12" fontWeight="bold">RSA-2048</text>
              <text x="0" y="15" textAnchor="middle" fill="var(--brand-ink)" fontSize="10" fontFamily="var(--font-mono)" title="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855">e3b0...b855</text>

              {/* Satellite Nodes */}
              <g transform="translate(-150, -150)">
                <circle cx="0" cy="0" r="40" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="2" />
                <text x="0" y="-5" textAnchor="middle" fill="var(--ink)" fontSize="10">Source Code</text>
                <text x="0" y="10" textAnchor="middle" fill="var(--ink-3)" fontSize="9">2048-bit</text>
              </g>
              <g transform="translate(150, -150)">
                <circle cx="0" cy="0" r="40" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="2" />
                <text x="0" y="-5" textAnchor="middle" fill="var(--ink)" fontSize="10">TLS Config</text>
                <text x="0" y="10" textAnchor="middle" fill="var(--ink-3)" fontSize="9">2048-bit</text>
              </g>
              <g transform="translate(-150, 150)">
                <circle cx="0" cy="0" r="40" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="2" />
                <text x="0" y="-5" textAnchor="middle" fill="var(--ink)" fontSize="10">Keystore</text>
                <text x="0" y="10" textAnchor="middle" fill="var(--ink-3)" fontSize="9">2048-bit</text>
              </g>
              <g transform="translate(150, 150)">
                <circle cx="0" cy="0" r="40" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="2" />
                <text x="0" y="-5" textAnchor="middle" fill="var(--ink)" fontSize="10">Certificates</text>
                <text x="0" y="10" textAnchor="middle" fill="var(--ink-3)" fontSize="9">2048-bit</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Right: Auditor Panel */}
        <div className="bp-card" style={{ flex: "1", display: "flex", flexDirection: "column", background: "var(--surface)" }}>
          <div className="card-h">
            <h2>Blast-Radius Analysis</h2>
          </div>
          <div className="card-b" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
            <p style={{ fontSize: "var(--s3)", color: "var(--ink-2)", margin: 0 }}>This RSA-2048 keypair is embedded across {p} distinct infrastructure planes. A synchronized migration is required.</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: "var(--ink)" }}>
                <Icon name="check-circle" size="14" style={{ color: "var(--brand-ink)" }} /> <span>1. Source code patched</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: "var(--ink)" }}>
                <Icon name="circle" size="14" style={{ color: "var(--ink-3)" }} /> <span>2. Configuration updated</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: "var(--ink)" }}>
                <Icon name="circle" size="14" style={{ color: "var(--ink-3)" }} /> <span>3. Keystore migrated</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: "var(--ink)" }}>
                <Icon name="circle" size="14" style={{ color: "var(--ink-3)" }} /> <span>4. Certificates re-issued</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: "var(--ink)" }}>
                <Icon name="circle" size="14" style={{ color: "var(--ink-3)" }} /> <span>5. TLS terminated</span>
              </div>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "var(--s4)" }}>
              <Link to="/remediate" className="bp-btn pri" style={{ width: "100%", justifyContent: "center" }}>Open Remediation Command Center &rarr;</Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
