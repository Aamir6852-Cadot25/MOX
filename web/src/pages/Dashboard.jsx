import React, { useState } from "react";
import { Plus } from "lucide-react";
import Gauge from "../components/Gauge";

const PRIORITY_MAP = {
  Critical: { code: "P1", pill: "p1", color: "var(--p1)" },
  High: { code: "P2", pill: "p2", color: "var(--p2)" },
  Medium: { code: "P3", pill: "p3", color: "var(--p3)" },
  Low: { code: "P4", pill: "p4", color: "var(--p4)" },
};

export default function Dashboard({ latestScan, assets = [], onNavigate, onOpenAsset }) {
  const [filter, setFilter] = useState("ALL");

  if (!latestScan || !latestScan.scan || assets.length === 0) {
    return (
      <section className="page on" id="p-dash">
        <div className="ph">
          <div>
            <h1>Discovery Dashboard</h1>
            <p>No cryptographic scan has been recorded yet.</p>
          </div>
          <div className="act">
            <button className="btn cy" onClick={() => onNavigate("scan")}>
              <Plus size={15} /> Run First Scan
            </button>
          </div>
        </div>
        <div className="card empty">
          <b>No scan data available</b>
          <p>Start a cryptographic discovery scan to map your quantum exposure and assets.</p>
          <button className="btn pri" onClick={() => onNavigate("scan")} style={{ marginTop: "12px" }}>
            Open Scanner
          </button>
        </div>
      </section>
    );
  }

  const scan = latestScan.scan;
  const targetName = scan.target ? scan.target.split(/[\\/]/).pop() : "demo_target";
  const filesCount = scan.files_scanned || 0;
  const planesCount = latestScan.kpi?.planes || (scan.planes ? Object.keys(scan.planes).length : 6);
  const scanSeconds = scan.seconds !== undefined ? Number(scan.seconds).toFixed(3) : "0.099";
  const findingsCount = scan.findings_count || assets.length;

  const countByTier = (tier) => assets.filter((a) => a.tier === tier).length;
  const qvAssets = assets.filter((a) => a.breakdown?.quantum_vulnerable || a.quantum_vulnerable);
  const topAsset = assets[0] || {};
  const topMosca = topAsset.breakdown?.mosca || {};

  const filteredAssets = assets.filter((a) => {
    if (filter === "ALL") return true;
    return PRIORITY_MAP[a.tier]?.code === filter;
  });

  const getPrimaryLoc = (a) => {
    if (a.primary_location) {
      const parts = a.primary_location.split(":");
      return { file: parts[0] || "—", line: parts[1] || "—" };
    }
    const loc = a.locations?.[0] || a.files?.[0];
    if (typeof loc === "string") return { file: loc, line: "—" };
    if (loc && typeof loc === "object") return { file: loc.file || "—", line: loc.line || "—" };
    return { file: "—", line: "—" };
  };

  const migrateCount = assets.filter((a) => a.verdict === "MIGRATE").length;
  const containCount = assets.filter((a) => a.verdict === "CONTAIN").length;
  const acceptCount = assets.filter((a) => a.verdict === "ACCEPT").length;

  return (
    <section className="page on" id="p-dash">
      <div className="ph">
        <div>
          <h1>Discovery Dashboard</h1>
          <p>
            Project <b style={{ color: "#0B7C99" }}>{targetName}</b> ·{" "}
            <span className="pill cyp">folder</span> · scan #{scan.id} · {filesCount} files ·{" "}
            {planesCount} planes · {scanSeconds} s
          </p>
        </div>
        <div className="act">
          <button className="btn cy" onClick={() => onNavigate("scan")}>
            <Plus size={15} /> New Scan
          </button>
        </div>
      </div>

      {/* 5 KPI Stat Cards */}
      <div className="grid g5" style={{ marginBottom: "18px" }}>
        <div className="stat">
          <div className="lb">
            <span className="dot" style={{ background: "var(--cy)" }} />
            Total assets
          </div>
          <div className="v" style={{ color: "var(--ink)" }}>
            {assets.length}
          </div>
          <div className="sub">{findingsCount} findings merged</div>
          <div className="bar">
            <i style={{ width: "100%", background: "var(--cy)" }} />
          </div>
        </div>

        {["Critical", "High", "Medium", "Low"].map((tier) => {
          const cfg = PRIORITY_MAP[tier];
          const cnt = countByTier(tier);
          const pct = assets.length ? Math.round((cnt / assets.length) * 100) : 0;
          return (
            <div key={tier} className="stat">
              <div className="lb">
                <span className="dot" style={{ background: cfg.color }} />
                {cfg.code} — {tier}
              </div>
              <div className="v" style={{ color: cfg.color }}>
                {cnt}
              </div>
              <div className="sub">{tier === "Critical" && cnt > 0 ? "fix now" : `${pct}% of assets`}</div>
              <div className="bar">
                <i style={{ width: `${pct}%`, background: cfg.color }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quantum Risk & Evidence Card */}
      <div className="card">
        <h3>Quantum Risk &amp; Evidence</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "190px 1fr 1fr",
            gap: "18px",
            alignItems: "stretch",
          }}
        >
          {/* Gauge Column */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--bd)",
              borderRadius: "10px",
              padding: "14px",
            }}
          >
            <Gauge score={topAsset.score || 0} />
            <div
              style={{
                fontSize: "10.5px",
                letterSpacing: ".8px",
                color: "var(--mut)",
                fontWeight: 600,
                marginTop: "8px",
              }}
            >
              HIGHEST RISK
            </div>
            <div
              style={{
                fontWeight: 800,
                color: PRIORITY_MAP[topAsset.tier]?.color || "var(--p1)",
                fontSize: "13px",
              }}
            >
              {topAsset.tier ? topAsset.tier.toUpperCase() : "CRITICAL"}
            </div>
          </div>

          {/* Why this score? */}
          <div className="box why">
            <h4>Why this score?</h4>
            <ul>
              <li>
                <b>
                  {qvAssets.length} of {assets.length}
                </b>{" "}
                assets use RSA / ECDSA — breakable by Shor's algorithm on a quantum computer.
              </li>
              <li>
                <b>{topAsset.label || "RSA-2048"}</b>:{" "}
                {topAsset.reason
                  ? topAsset.reason.split(". ")[0] + "."
                  : "NIST-disallowed for TLS today; Shor-breakable."}
                {topMosca.exposure !== null && topMosca.exposure !== undefined ? (
                  <>
                    {" "}
                    Mosca exposure: <b>+{topMosca.exposure} yrs</b> exposed → "harvest now, decrypt later".
                  </>
                ) : null}
              </li>
              <li>
                Found in {topAsset.findings_count || topAsset.locations?.length || 1} place(s) across
                certificates, code, configs or container images — counted once.
              </li>
            </ul>
          </div>

          {/* Remediation Box */}
          <div className="box fix">
            <h4>Remediation</h4>
            <ul>
              <li>
                Key exchange → <b>ML-KEM-768</b> (FIPS 203); signatures → <b>ML-DSA-65</b> (FIPS 204).
              </li>
              <li>Run hybrid X25519MLKEM768 in TLS during the transition.</li>
              <li>Replace DES / 3DES / RC4 with AES-256-GCM; MD5 / SHA-1 with SHA-256.</li>
              <li>Re-scan after fixes to prove each finding is cleared.</li>
            </ul>
          </div>
        </div>

        {/* Verdict 3-column stats */}
        <div className="grid g3" style={{ marginTop: "16px" }}>
          <div className="stat row" style={{ padding: "14px" }}>
            <span className="pill vM" style={{ fontSize: "12px" }}>
              MIGRATE
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "20px" }}>{migrateCount}</div>
              <div style={{ fontSize: "12px", color: "var(--mut)" }}>Change the code or key now</div>
            </div>
          </div>

          <div className="stat row" style={{ padding: "14px" }}>
            <span className="pill vC" style={{ fontSize: "12px" }}>
              CONTAIN
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "20px" }}>{containCount}</div>
              <div style={{ fontSize: "12px", color: "var(--mut)" }}>
                Too slow to patch (firmware, KMS, binaries) — isolate it
              </div>
            </div>
          </div>

          <div className="stat row" style={{ padding: "14px" }}>
            <span className="pill vA" style={{ fontSize: "12px" }}>
              ACCEPT
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "20px" }}>{acceptCount}</div>
              <div style={{ fontSize: "12px", color: "var(--mut)" }}>Low risk — re-check next scan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Findings Table Card */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px" }}>
          <h3 style={{ margin: 0 }}>
            Findings{" "}
            <span style={{ fontWeight: 500, fontSize: "12px", color: "var(--mut)", marginLeft: "6px" }}>
              One asset = one key or algorithm, even if found in many files · click a row to open it
            </span>
          </h3>
          <div className="chips" style={{ marginLeft: "auto" }}>
            {["ALL", "P1", "P2", "P3", "P4"].map((chip) => (
              <span
                key={chip}
                className={`chip ${filter === chip ? "on" : ""}`}
                onClick={() => setFilter(chip)}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Priority</th>
                <th>Algorithm</th>
                <th>File</th>
                <th>Line</th>
                <th>Planes</th>
                <th>Quantum status</th>
                <th>Risk score</th>
                <th>Mosca</th>
                <th>Verdict</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map((asset, idx) => {
                const cfg = PRIORITY_MAP[asset.tier] || { code: "P4", pill: "p4" };
                const loc = getPrimaryLoc(asset);
                const isQ = asset.breakdown?.quantum_vulnerable || asset.quantum_vulnerable;
                const mosca = asset.breakdown?.mosca;
                const planes = asset.planes ? asset.planes.join(", ") : "code";
                const algName = asset.algorithm || asset.label?.split(" ")[0] || "RSA";
                const keySize = asset.key_size ? `-${asset.key_size}` : "";

                return (
                  <tr
                    key={asset.id || idx}
                    className="cl"
                    onClick={() => onOpenAsset && onOpenAsset(asset.id, asset)}
                  >
                    <td>
                      <span className={`pill ${cfg.pill}`}>
                        {cfg.code} {asset.tier ? asset.tier.toUpperCase() : "LOW"}
                      </span>
                    </td>
                    <td style={{ color: "#0B7C99", fontWeight: 700 }}>
                      {algName}
                      {keySize}
                    </td>
                    <td className="mono" style={{ fontSize: "12px" }}>
                      {loc.file}
                    </td>
                    <td className="mono" style={{ color: "var(--p3)", fontWeight: 600 }}>
                      {loc.line}
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--mut)" }}>{planes}</td>
                    <td>
                      <span className={`pill ${isQ ? "qv" : "qs"}`}>
                        {isQ ? "Quantum-vulnerable" : "Not Shor-breakable"}
                      </span>
                    </td>
                    <td>
                      <b>{Number(asset.score || 0).toFixed(1)}</b>
                      <span style={{ color: "var(--mut)" }}> / 100</span>
                    </td>
                    <td style={{ fontSize: "12px" }}>
                      {mosca?.exposure === null || mosca?.exposure === undefined ? (
                        <span style={{ color: "var(--mut)" }}>n/a</span>
                      ) : mosca.exposure > 0 ? (
                        <b style={{ color: "var(--p1)" }}>+{mosca.exposure} yrs exposed</b>
                      ) : (
                        <span style={{ color: "var(--ok)" }}>{mosca.exposure} yrs · safe</span>
                      )}
                    </td>
                    <td>
                      <span className={`pill v${(asset.verdict || "A")[0]}`}>
                        {asset.verdict || "ACCEPT"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
