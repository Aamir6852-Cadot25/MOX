import React from "react";

export default function Splash({ fading = false }) {
  return (
    <div id="splash" style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? "none" : "auto" }}>
      <div style={{ textAlign: "center" }}>
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
        <div className="sb">
          <i />
        </div>
        <div style={{ fontSize: "12.5px", color: "var(--mut)" }}>Starting scan engine…</div>
      </div>
    </div>
  );
}
