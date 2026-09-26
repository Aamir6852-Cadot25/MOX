import { useState } from "react";
import PageHeader from "../components/PageHeader.jsx";
import Icon from "../components/Icon.jsx";

export default function Remediate({ summary }) {
  const [stage, setStage] = useState(0); // 0: initial, 1: executing, 2: cleared

  const executePatch = () => {
    setStage(1);
    setTimeout(() => setStage(2), 2000);
  };

  return (
    <div className="page" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <PageHeader title="Remediate" step="4 Remediate" />
      
      {/* Header Bar */}
      <div className="bp-card" style={{ marginBottom: "var(--s4)", padding: "var(--s3) var(--s4)", background: "var(--term-bg)", display: "flex", alignItems: "center", gap: "var(--s3)" }}>
        <span style={{ color: "var(--ink-2)", fontSize: "var(--s3)", fontFamily: "var(--font-mono)" }}>src/auth/token.js</span>
        <span style={{ color: "var(--ink-4)" }}>&middot;</span>
        <span style={{ color: "var(--high-ink)", background: "var(--high-bg)", padding: "0 var(--s2)", borderRadius: "var(--s1)", fontSize: "10px", fontWeight: "bold" }}>HNDL</span>
        <span style={{ color: "var(--ink-4)" }}>&middot;</span>
        <span style={{ color: "var(--crit-ink)" }}>RSA-2048</span>
        <Icon name="arrow-right" size="14" style={{ color: "var(--ink-3)" }} />
        <span style={{ color: "var(--brand-ink)" }}>ML-KEM-768 (Hybrid)</span>
      </div>

      {/* Usage-Aware Recommendation Table */}
      <div className="bp-card" style={{ marginBottom: "var(--s4)", background: "var(--surface)" }}>
        <table className="ntab" style={{ width: "100%", textAlign: "left", fontSize: "11px" }}>
          <thead>
            <tr>
              <th style={{ padding: "var(--s2) var(--s4)" }}>Algorithm</th>
              <th style={{ padding: "var(--s2) var(--s4)" }}>Standard</th>
              <th style={{ padding: "var(--s2) var(--s4)" }}>Use Case</th>
              <th style={{ padding: "var(--s2) var(--s4)" }}>Public Key Size</th>
              <th style={{ padding: "var(--s2) var(--s4)" }}>Ciphertext / Sig Size</th>
              <th style={{ padding: "var(--s2) var(--s4)" }}>Migration Effort</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: "var(--high-bg)" }}>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink)" }}>RSA-2048</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-3)" }}>Legacy</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-3)" }}>Key Exchange</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>256 B</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>256 B</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-3)" }}>-</td>
            </tr>
            <tr style={{ background: "var(--brand-soft)" }}>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--brand-ink)", fontWeight: "500" }}>ML-KEM-768</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-2)" }}>NIST FIPS 203</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-2)" }}>Key Exchange</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-2)", fontFamily: "var(--font-mono)" }}>1184 B</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-2)", fontFamily: "var(--font-mono)" }}>1088 B</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-2)" }}>Moderate (Network MTU)</td>
            </tr>
            <tr>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink)" }}>ML-DSA-65</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-3)" }}>NIST FIPS 204</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-3)" }}>Digital Signature</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>1952 B</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>3309 B</td>
              <td style={{ padding: "var(--s2) var(--s4)", color: "var(--ink-3)" }}>High (Storage)</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Split-Pane Command Center */}
      <div style={{ flex: 1, display: "flex", gap: "var(--s5)", minHeight: 0, overflow: "hidden" }}>
        
        {/* Left: Dark terminal diff view */}
        <div className="bp-card wrap-x" style={{ flex: "2", display: "flex", flexDirection: "column", background: "var(--term-bg)", overflowY: "auto" }}>
          <div className="card-h" style={{ borderBottom: "1px solid var(--term-line)", background: "var(--surface)" }}>
            <h2>Code Patch (src/auth/token.js)</h2>
          </div>
          <pre className="p-4 mono text-xs term-ink" style={{ whiteSpace: "pre" }}>{`  const crypto = require("crypto");

- const keypair = crypto.generateKeyPairSync("rsa", {
-   modulusLength: 2048,
- });
+ // MOX: Migrated to quantum-resistant hybrid key exchange (NIST FIPS 203)
+ const { ml_kem_768 } = require("mox-pqc-provider");
+ const keypair = ml_kem_768.generateKeyPair();

  module.exports = {
    publicKey: keypair.publicKey,
    privateKey: keypair.privateKey
  };`}</pre>
        </div>

        {/* Right: 4-stage pipeline stepper */}
        <div className="bp-card" style={{ flex: "1", display: "flex", flexDirection: "column", background: "var(--surface)" }}>
          <div className="card-h">
            <h2>Remediation Pipeline</h2>
          </div>
          <div className="card-b" style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--s4)" }}>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--s3)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: "var(--brand-ink)" }}>
                <Icon name="check-circle" size="14" /> <span>1. Usage-Aware PQC Identified</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: "var(--brand-ink)" }}>
                <Icon name="check-circle" size="14" /> <span>2. Security Policy Approved</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: stage >= 1 ? "var(--brand-ink)" : "var(--ink-3)" }}>
                <Icon name={stage >= 1 ? "check-circle" : "circle"} size="14" /> <span>3. Atomic Patch with Backup (.bak)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--s2)", color: stage >= 2 ? "var(--brand-ink)" : "var(--ink-3)" }}>
                <Icon name={stage >= 2 ? "check-circle" : "circle"} size="14" /> <span>4. Re-scan Proves Finding Cleared</span>
              </div>
            </div>

            <div style={{ marginTop: "auto", paddingTop: "var(--s4)" }}>
              {stage === 0 && (
                <button className="bp-btn pri" style={{ width: "100%", justifyContent: "center" }} onClick={executePatch}>Execute &amp; Verify Patch</button>
              )}
              {stage === 1 && (
                <button className="bp-btn" disabled style={{ width: "100%", justifyContent: "center", background: "var(--term-bg)", color: "var(--brand-ink)" }}>
                  <Icon name="loader" size="14" /> Executing...
                </button>
              )}
              {stage === 2 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "var(--s2)", color: "var(--brand-ink)", fontSize: "var(--s3)", fontWeight: "bold", padding: "var(--s2)", background: "var(--brand-soft)", border: "1px solid var(--brand)", borderRadius: "var(--r)" }}>
                  <Icon name="check" size="14" /> Cleared &mdash; verified by re-scan
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
