import React, { useState, useEffect } from "react";
import { api } from "../api";
import { X, Check } from "lucide-react";

export default function SettingsModal({ isOpen, onClose, onSaved, showToast }) {
  const [horizon, setHorizon] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.settings()
        .then((res) => {
          if (res && res.threat_horizon) setHorizon(res.threat_horizon);
        })
        .catch((err) => {
          console.warn("Failed to load settings:", err);
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.setSettings({ threat_horizon: Number(horizon) });
      if (onSaved) onSaved(Number(horizon));
      onClose();
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to save settings");
      else console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="mc" style={{ width: "500px" }}>
        <div className="row" style={{ marginBottom: "14px" }}>
          <b style={{ fontSize: "16px" }}>Organisation Settings</b>
          <button className="ib" style={{ marginLeft: "auto", color: "var(--mut)" }} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <p style={{ color: "var(--mut)", fontSize: "13px", margin: "0 0 16px" }}>
          Organisation-wide cryptographic assumptions that drive risk and Mosca exposure calculations.
        </p>

        <div style={{ marginBottom: "16px" }}>
          <label className="f">Quantum Threat Horizon (Z in years)</label>
          <div className="row" style={{ gap: "12px", alignItems: "center" }}>
            <input
              type="range"
              min="1"
              max="30"
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <input
              type="number"
              className="in mono"
              value={horizon}
              onChange={(e) => setHorizon(Number(e.target.value))}
              style={{ width: "70px", textAlign: "center" }}
              min="1"
              max="40"
            />
            <span style={{ fontSize: "13px", color: "var(--mut)" }}>years</span>
          </div>
        </div>

        <div className="box why" style={{ marginBottom: "16px" }}>
          <h4 style={{ color: "var(--p3)" }}>Mosca's Theorem: (X + Y) − Z</h4>
          <div style={{ fontSize: "12px", color: "var(--ink)", lineHeight: 1.5 }}>
            If the shelf-life of your confidential data (<b>X</b>) plus your system migration time (<b>Y</b>) exceeds
            the estimated arrival of a cryptanalytically relevant quantum computer (<b>Z = {horizon} yrs</b>), your
            data is already vulnerable to "harvest now, decrypt later" attacks today.
          </div>
        </div>

        <div className="row" style={{ justifyContent: "flex-end", marginTop: "18px" }}>
          <button className="btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button className="btn pri" onClick={handleSave} disabled={saving}>
            <Check size={15} /> {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
