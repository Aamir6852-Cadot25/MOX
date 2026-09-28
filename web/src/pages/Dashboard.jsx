import React, { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import Gauge from "../components/Gauge";

const PRIORITY_MAP = {
  P1: { code: "P1", name: "Fix now", pill: "p1", color: "var(--p1)" },
  P2: { code: "P2", name: "Quantum-exposed", pill: "p2", color: "var(--p2)" },
  P3: { code: "P3", name: "Planned", pill: "p3", color: "var(--p3)" },
  P4: { code: "P4", name: "Monitor", pill: "p4", color: "var(--p4)" },
};

const PRIORITY_ORDER = { P1: 1, P2: 2, P3: 3, P4: 4 };

export default function Dashboard({ latestScan, assets = [], onNavigate, onOpenAsset }) {
  const [filter, setFilter] = useState("ALL");

  if (!latestScan || !latestScan.scan) {
    return (
      <section className="page on" id="p-dash">
        <div className="ph">
          <div>
            <h1>Discovery Dashboard</h1>
            <p>No cryptographic scan has been recorded yet.</p>
          </div>
          <div className="act">
            <button className="btn cy" style={{ whiteSpace: "nowrap" }} onClick={() => onNavigate("scan")}>
              <Plus size={15} /> Run First Scan
            </button>
          </div>
        </div>
        <div className="card empty" style={{ textAlign: "center", padding: "48px 24px" }}>
          <b style={{ fontSize: "16px", color: "var(--ink)", display: "block" }}>No scan data available</b>
          <p style={{ color: "var(--mut)", margin: "8px 0 16px" }}>
            Start a cryptographic discovery scan to map your quantum exposure and assets.
          </p>
          <button className="btn pri" onClick={() => onNavigate("scan")} style={{ whiteSpace: "nowrap" }}>
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
  const scanSeconds = scan.seconds !== undefined ? Number(scan.seconds).toFixed(3) : "0.000";
  const findingsCount = scan.findings_count || assets.length;

  // Sort assets by priority (P1 < P2 < P3 < P4), then score (descending)
  const sortedAssets = [...assets].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] || 4;
    const pb = PRIORITY_ORDER[b.priority] || 4;
    if (pa !== pb) return pa - pb;
    return (b.score || 0) - (a.score || 0);
  });

  const qvAssets = sortedAssets.filter((a) => a.breakdown?.quantum_vulnerable || a.quantum_vulnerable);
  const topAsset = sortedAssets[0] || {};
  const topMosca = topAsset.breakdown?.mosca || {};

  const filteredAssets = sortedAssets.filter((a) => {
    if (filter === "ALL") return true;
    return (a.priority || "P4") === filter;
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

  const migrateCount = sortedAssets.filter((a) => a.verdict === "MIGRATE").length;
  const containCount = sortedAssets.filter((a) => a.verdict === "CONTAIN").length;
  const acceptCount = sortedAssets.filter((a) => a.verdict === "ACCEPT").length;

  return (
    <section className="page on" id="p-dash">
      <div className="ph">
        <div>
          <h1>Discovery Dashboard</h1>
          <p>
            Project <b style={{ color: "#0B7C99" }}>{scan.project_name || targetName}</b> ·{" "}
            <span className="pill cyp">{scan.source || "folder"}</span> · scan #{scan.id} · {filesCount} files ·{" "}
            {planesCount} planes · {scanSeconds} s
          </p>
        </div>
        <div className="act">
          <button className="btn cy" style={{ whiteSpace: "nowrap" }} onClick={() => onNavigate("scan")}>
            <Plus size={15} /> New Scan
          </button>
        </div>
      </div>

      {assets.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <ShieldCheck size={40} style={{ color: "var(--ok)", margin: "0 auto 12px" }} />
          <b style={{ fontSize: "16px", color: "var(--ink)", display: "block" }}>
            No cryptographic assets detected
          </b>
          <p style={{ color: "var(--mut)", margin: "8px auto 16px", maxWidth: "480px" }}>
            The scan scanned {filesCount} file(s) across {planesCount} plane(s). No quantum-vulnerable or legacy cryptographic algorithms were identified.
          </p>
          <button className="btn cy" style={{ whiteSpace: "nowrap" }} onClick={() => onNavigate("scan")}>
            Scan Another Target
          </button>
        </div>
      ) : (
        <>
          {/* 5 KPI Stat Cards */}
          <div className="grid g5" style={{ marginBottom: "10px" }}>
            <div className="stat" style={{ minWidth: 0 }}>
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

            {[
              { code: "P1", label: "P1 Fix now", color: "var(--p1)" },
              { code: "P2", label: "P2 Quantum-exposed", color: "var(--p2)" },
              { code: "P3", label: "P3 Planned", color: "var(--p3)" },
              { code: "P4", label: "P4 Monitor", color: "var(--p4)" },
            ].map((item) => {
              const cnt = assets.filter((a) => (a.priority || "P4") === item.code).length;
              const pct = assets.length ? Math.round((cnt / assets.length) * 100) : 0;
              return (
                <div key={item.code} className="stat" style={{ minWidth: 0 }}>
                  <div className="lb">
                    <span className="dot" style={{ background: item.color }} />
                    {item.label}
                  </div>
                  <div className="v" style={{ color: item.color }}>
                    {cnt}
                  </div>
                  <div className="sub">{pct}% of assets</div>
                  <div className="bar">
                    <i style={{ width: `${pct}%`, background: item.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quantum Risk & Evidence Card */}
          <div className="card" style={{ padding: "12px 16px", marginBottom: "10px" }}>
            <h3 style={{ margin: "0 0 10px" }}>Quantum Risk &amp; Evidence</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "175px 1fr 1fr",
                gap: "12px",
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
                  minWidth: 0,
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
                  HIGHEST PRIORITY
                </div>
                <div
                  style={{
                    fontWeight: 800,
                    color: PRIORITY_MAP[topAsset.priority || "P1"]?.color || "var(--p1)",
                    fontSize: "13px",
                  }}
                  title={topAsset.priority_reason || ""}
                >
                  {topAsset.priority || "P1"} · {PRIORITY_MAP[topAsset.priority || "P1"]?.name?.toUpperCase() || "FIX NOW"}
                </div>
              </div>

              {/* Why this score? */}
              <div className="box why" style={{ minWidth: 0 }}>
                <h4>Why this score?</h4>
                {assets.length === 0 ? (
                  <p style={{ margin: 0 }}>No cryptographic vulnerabilities detected in this scan run.</p>
                ) : (
                  <ul>
                    <li>
                      <b>
                        {qvAssets.length} of {assets.length}
                      </b>{" "}
                      assets use RSA / ECDSA — breakable by Shor's algorithm on a quantum computer.
                    </li>
                    <li>
                      <b>{topAsset.label || topAsset.algorithm || "Asset"}</b>:{" "}
                      {topAsset.reason
                        ? topAsset.reason.split(". ")[0] + "."
                        : "Disallowed under current cryptographic guidelines."}
                      {topMosca.exposure !== null && topMosca.exposure !== undefined ? (
                        <>
                          {" "}
                          Mosca exposure: <b>+{topMosca.exposure} yrs</b> exposed → "harvest now, decrypt later".
                        </>
                      ) : null}
                    </li>
                    <li>
                      Found in {topAsset.locations?.length || topAsset.locations_count || topAsset.findings_count || (topAsset.files ? topAsset.files.length : 1)} {
                        (topAsset.locations?.length || topAsset.locations_count || topAsset.findings_count || (topAsset.files ? topAsset.files.length : 1)) === 1 ? "location" : "locations"
                      }{topAsset.summary ? ` (${topAsset.summary})` : ""} across certificates, code, configs or container images — counted once.
                    </li>
                  </ul>
                )}
              </div>

              {/* Remediation Box */}
              <div className="box fix" style={{ minWidth: 0 }}>
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
            <div className="grid g3" style={{ marginTop: "10px", gap: "10px" }}>
              <div className="stat row" style={{ padding: "10px 14px", minWidth: 0 }}>
                <span className="pill vM" style={{ fontSize: "11.5px", whiteSpace: "nowrap" }}>
                  MIGRATE
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "18px" }}>{migrateCount}</div>
                  <div style={{ fontSize: "11px", color: "var(--mut)" }}>Change the code or key now</div>
                </div>
              </div>

              <div className="stat row" style={{ padding: "10px 14px", minWidth: 0 }}>
                <span className="pill vC" style={{ fontSize: "11.5px", whiteSpace: "nowrap" }}>
                  CONTAIN
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "18px" }}>{containCount}</div>
                  <div style={{ fontSize: "11px", color: "var(--mut)" }}>
                    Too slow to patch (firmware, KMS, binaries) — isolate it
                  </div>
                </div>
              </div>

              <div className="stat row" style={{ padding: "10px 14px", minWidth: 0 }}>
                <span className="pill vA" style={{ fontSize: "11.5px", whiteSpace: "nowrap" }}>
                  ACCEPT
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: "18px" }}>{acceptCount}</div>
                  <div style={{ fontSize: "11px", color: "var(--mut)" }}>Low risk — re-check next scan</div>
                </div>
              </div>
            </div>
          </div>

          {/* Findings Table Card */}
          <div className="card" style={{ padding: 0, marginBottom: 0 }}>
            <div style={{ display: "flex", alignItems: "center", padding: "10px 16px" }}>
              <h3 style={{ margin: 0, fontSize: "13.5px" }}>
                Findings{" "}
                <span style={{ fontWeight: 500, fontSize: "11.5px", color: "var(--mut)", marginLeft: "6px" }}>
                  One asset = one key or algorithm · click row to open in Code Edit
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

            {assets.length === 0 ? (
              <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--mut)" }}>
                No cryptographic findings detected in this scan. All inspected files and endpoints conform to policy.
              </div>
            ) : filteredAssets.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--mut)" }}>
                No findings match priority filter "{filter}".
              </div>
            ) : (
              <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "240px" }}>
                <table style={{ tableLayout: "auto", width: "100%" }}>
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
                      const cfg = PRIORITY_MAP[asset.priority || "P4"] || PRIORITY_MAP.P4;
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
                          onClick={() => onOpenAsset && onOpenAsset(asset.id)}
                          style={{ cursor: "pointer" }}
                          title="Click to open this finding in Code Edit"
                        >
                          <td>
                            <span
                              className={`pill ${cfg.pill}`}
                              title={asset.priority_reason || ""}
                            >
                              {asset.priority || "P4"}
                            </span>
                          </td>
                          <td style={{ color: "#0B7C99", fontWeight: 700 }}>
                            {algName}
                            {keySize}
                          </td>
                          <td className="mono cell-ellipsis" style={{ fontSize: "12px", maxWidth: "220px" }} title={loc.file}>
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
            )}
          </div>
        </>
      )}
    </section>
  );
}
