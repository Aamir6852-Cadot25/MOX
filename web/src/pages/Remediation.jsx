import React, { useState, useEffect } from "react";
import { api } from "../api";

const WN = {
  1: "Now — already broken or disallowed",
  2: "Quantum-exposed data (Mosca > 0)",
  3: "High risk",
  4: "Medium risk",
  5: "Accepted — verify next scan",
};

const PRIORITY_MAP = {
  Critical: { code: "P1", pill: "p1" },
  High: { code: "P2", pill: "p2" },
  Medium: { code: "P3", pill: "p3" },
  Low: { code: "P4", pill: "p4" },
};

function repl(a) {
  if (a.replacement) return [a.replacement];
  if (a.replacements && a.replacements[0]) return [a.replacements[0].to, a.replacements[0].note || ""];
  const x = a.algorithm || a.label?.split(" ")[0] || "RSA";
  const loc = a.primary_location || a.files?.[0] || "";
  if (x === "RSA")
    return [
      "ML-KEM-768 (FIPS 203) for key exchange · ML-DSA-65 (FIPS 204) for signatures",
      "Hybrid X25519MLKEM768 in TLS during transition",
    ];
  if (x === "ECDSA")
    return ["ML-DSA-65 (FIPS 204)", "Hybrid ECDSA + ML-DSA certificates during transition"];
  if (["DES", "3DES", "RC4"].includes(x))
    return ["AES-256-GCM", "Grover halves key strength — 256-bit keys stay safe"];
  if (x === "AES")
    return ["AES-256-GCM (authenticated mode, 256-bit key)", "Grover halves key strength"];
  if (x === "MD5" && loc.includes("passwords"))
    return ["Argon2id for password hashing", "Never use a fast hash for passwords"];
  if (x === "MD5" || x === "SHA-1")
    return ["SHA-256 / SHA3-256", "Collision-resistant, NIST approved"];
  if (x.startsWith("OpenSSL"))
    return ["OpenSSL 3.5+ (ships ML-KEM and ML-DSA)", "Rebuild the image / binary"];
  return [
    "Pin a current version and confirm which algorithms it calls",
    "Library name only — usage not yet proven",
  ];
}

export default function Remediation({ assets = [], selectedScanId }) {
  const [backendWaves, setBackendWaves] = useState([]);

  useEffect(() => {
    if (selectedScanId) {
      api.roadmap(selectedScanId)
        .then((res) => {
          if (Array.isArray(res) && res.length > 0) {
            setBackendWaves(res);
          }
        })
        .catch((err) => {
          console.warn("Roadmap fetch error:", err);
        });
    }
  }, [selectedScanId]);
  const wavesOrder = [1, 2, 4, 5];

  return (
    <section className="page on" id="p-rem">
      <div className="ph">
        <div>
          <h1>Remediation Roadmap</h1>
          <p>
            What to change first, and what to change it to. Waves are ordered by NIST status,
            risk and Mosca exposure.
          </p>
        </div>
      </div>

      <div className="card">
        {assets.length === 0 ? (
          <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--mut)" }}>
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "var(--ink)" }}>No cryptographic assets detected</p>
            <p style={{ margin: "6px 0 0", fontSize: "13px" }}>Run a scan on code, certificates, or endpoints to generate migration waves and recommendations.</p>
          </div>
        ) : (
          wavesOrder.map((w) => {
            const waveAssets = assets.filter((a) => (a.wave || (a.verdict === "ACCEPT" ? 5 : 1)) === w);
            if (waveAssets.length === 0) return null;

          return (
            <div key={w} className="wave">
              <div className="wn">
                Wave {w}
                <small>{WN[w]}</small>
                <small>
                  <b>{waveAssets.length}</b> assets
                </small>
              </div>

              <div>
                {waveAssets.slice(0, 6).map((a, idx) => {
                  const cfg = PRIORITY_MAP[a.tier] || { code: "P4", pill: "p4" };
                  const alg = a.algorithm || a.label?.split(" ")[0] || "RSA";
                  const keySize = a.key_size ? `-${a.key_size}` : "";
                  const loc = (a.primary_location || a.files?.[0] || "—").split(":")[0];
                  const r = repl(a);

                  return (
                    <div key={a.id || idx} className="ai">
                      <span className={`pill ${cfg.pill}`}>{cfg.code}</span>
                      <b style={{ minWidth: "150px" }}>
                        {alg}
                        {keySize}
                      </b>
                      <span className="arr">→</span>
                      <span style={{ color: "var(--ok)", fontWeight: 600 }}>{r[0]}</span>
                      <span
                        className="mono"
                        style={{ marginLeft: "auto", fontSize: "11.5px", color: "var(--mut)" }}
                      >
                        {loc}
                      </span>
                    </div>
                  );
                })}

                {waveAssets.length > 6 && (
                  <div style={{ fontSize: "12px", color: "var(--mut)", marginTop: "6px" }}>
                    + {waveAssets.length - 6} more
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      </div>
    </section>
  );
}
