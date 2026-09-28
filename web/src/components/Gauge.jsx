import React from "react";

export default function Gauge({ score = 0 }) {
  const r = 62;
  const C = 2 * Math.PI * r;
  const val = Math.min(100, Math.max(0, Number(score) || 0));
  const dash = (C * val) / 100;

  const color =
    val >= 55 ? "var(--p1)" : val >= 40 ? "var(--p2)" : val >= 25 ? "var(--p3)" : "var(--p4)";

  return (
    <div className="gauge">
      <svg width="150" height="150">
        <circle cx="75" cy="75" r={r} stroke="#EEF1F5" strokeWidth="12" fill="none" />
        <circle
          cx="75"
          cy="75"
          r={r}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          transform="rotate(-90 75 75)"
        />
      </svg>
      <div className="gv">
        <div>
          <b>{Math.round(val)}</b>
          <small>/ 100</small>
        </div>
      </div>
    </div>
  );
}
