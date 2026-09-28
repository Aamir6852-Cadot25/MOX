import React, { useState, useEffect } from "react";

const SPLASH_LINES = [
  "Loading NIST SP 800-131A & IR 8547 rules…",
  "Preparing 7 scan planes…",
  "Loading PQC replacements: ML-KEM (FIPS 203), ML-DSA (FIPS 204)…",
  "Calibrating Mosca risk model X + Y > Z…",
  "Ready",
];

export default function Splash({ fading = false }) {
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLineIdx((prev) => (prev < SPLASH_LINES.length - 1 ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const progressPct = Math.min(100, Math.round(((lineIdx + 1) / SPLASH_LINES.length) * 100));

  return (
    <div id="splash" style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? "none" : "auto", transition: "opacity 0.4s ease" }}>
      <div style={{ textAlign: "center", minWidth: "320px", maxWidth: "480px" }}>
        <img
          src="/mox-icon.svg"
          alt=""
          width="96"
          height="96"
          style={{ borderRadius: "24px", boxShadow: "0 0 0 1px #0EA5C9" }}
        />
        <div style={{ marginTop: "14px" }}>
          <img src="/mox-wordmark.svg" alt="MOX" height="48" />
        </div>
        <div className="sb" style={{ height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden", margin: "18px 0" }}>
          <i style={{ display: "block", height: "100%", width: `${progressPct}%`, background: "var(--cy)", transition: "width 0.8s ease" }} />
        </div>
        <div style={{ fontSize: "13px", color: "var(--mut)", height: "20px", fontStyle: "normal" }}>
          {SPLASH_LINES[lineIdx]}
        </div>
      </div>
    </div>
  );
}
