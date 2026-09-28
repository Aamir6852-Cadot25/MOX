import React from "react";

export default function Splash({ fading = false }) {
  return (
    <div id="splash" style={{ opacity: fading ? 0 : 1, pointerEvents: fading ? "none" : "auto" }}>
      <div style={{ textAlign: "center" }}>
        <div
          className="logo"
          style={{ width: "64px", height: "64px", fontSize: "22px", margin: "0 auto", borderRadius: "16px", color: "#fff" }}
        >
          MX
        </div>
        <div style={{ fontWeight: 800, fontSize: "24px", marginTop: "14px", color: "var(--hdr)", letterSpacing: "1px" }}>
          M-O-X
        </div>
        <div className="sb">
          <i />
        </div>
        <div style={{ fontSize: "12.5px", color: "var(--mut)" }}>Starting scan engine…</div>
      </div>
    </div>
  );
}
