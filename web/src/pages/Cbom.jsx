import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Download, Sliders, RotateCcw, Check, X, ShieldCheck, AlertCircle } from "lucide-react";

const PRIORITY_MAP = {
  P1: { code: "P1", pill: "p1" },
  P2: { code: "P2", pill: "p2" },
  P3: { code: "P3", pill: "p3" },
  P4: { code: "P4", pill: "p4" },
};

const PRIORITY_ORDER = { P1: 1, P2: 2, P3: 3, P4: 4 };

export default function Cbom({ selectedScanId, assets = [], onAssetUpdated, showToast }) {
  const [cbomData, setCbomData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sort assets by priority then score descending
  const sortedAssets = [...assets].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] || 4;
    const pb = PRIORITY_ORDER[b.priority] || 4;
    if (pa !== pb) return pa - pb;
    return (b.score || 0) - (a.score || 0);
  });

  // Edit side panel state
  const [editingAsset, setEditingAsset] = useState(null);
  const [priorityOverride, setPriorityOverride] = useState("Auto");
  const [criticality, setCriticality] = useState(2);
  const [shelfLifeX, setShelfLifeX] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("Open");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedCompRef, setSelectedCompRef] = useState(null);

  const loadCbom = async () => {
    try {
      const res = await api.cbom(selectedScanId);
      setCbomData(res);
    } catch (err) {
      console.warn("CBOM fetch error:", err);
      setCbomData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCbom();
  }, [selectedScanId]);

  const openEditPanel = (asset) => {
    setEditingAsset(asset);
    setPriorityOverride(asset.priority_override || "Auto");
    setCriticality(asset.breakdown?.criticality || 2);
    setShelfLifeX(asset.breakdown?.mosca?.x !== undefined ? String(asset.breakdown.mosca.x) : "");
    setOwner(asset.owner || "");
    setStatus(asset.status || "Open");
    setNotes(asset.notes || "");
  };

  const closeEditPanel = () => {
    setEditingAsset(null);
  };

  const handleSaveOverride = async () => {
    if (!editingAsset) return;
    setSaving(true);
    try {
      const body = {
        priority: priorityOverride === "Auto" ? "" : priorityOverride,
        criticality: Number(criticality),
        x: shelfLifeX !== "" ? Number(shelfLifeX) : undefined,
        owner: owner.trim(),
        status: status,
        notes: notes.trim(),
      };
      await api.override(editingAsset.id, body);
      if (showToast) showToast("CBOM component override saved");
      closeEditPanel();
      await loadCbom();
      if (onAssetUpdated) onAssetUpdated();
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to save override");
    } finally {
      setSaving(false);
    }
  };

  const handleResetOverride = async () => {
    if (!editingAsset) return;
    setSaving(true);
    try {
      await api.overrideReset(editingAsset.id);
      if (showToast) showToast("Component reset to automatic calculation");
      closeEditPanel();
      await loadCbom();
      if (onAssetUpdated) onAssetUpdated();
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to reset override");
    } finally {
      setSaving(false);
    }
  };

  const downloadJSON = async () => {
    try {
      if (showToast) showToast("Downloading mox-cbom.cdx.json…");
      const url = selectedScanId ? `/api/cbom/download?scan_id=${selectedScanId}` : "/api/cbom/download";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = "mox-cbom.cdx.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objUrl);
      if (showToast) showToast("mox-cbom.cdx.json downloaded");
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to download CBOM");
    }
  };

  const componentsCount = cbomData?.components || assets.length || 0;
  const cbomVersion = cbomData?.version || 1;
  const serialNumber = cbomData?.bom?.serialNumber || "urn:uuid:—";
  const shortSerial = serialNumber.length > 24 ? serialNumber.slice(0, 18) + "…" + serialNumber.slice(-4) : serialNumber;

  // Selected or first component JSON for display
  const componentsList = cbomData?.bom?.components || [];
  const activeComponent = selectedCompRef
    ? componentsList.find((c) => c["bom-ref"] === selectedCompRef)
    : componentsList[0];

  return (
    <section className="page on" id="p-cbom">
      <div className="ph">
        <div>
          <h1>Cryptographic Bill of Materials</h1>
          <p>
            CycloneDX 1.6 standard CBOM. Component priorities and metadata can be edited and audited.
          </p>
        </div>
        <div className="act">
          <button className="btn gr" onClick={downloadJSON}>
            <Download size={15} /> Download JSON
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid g4" style={{ marginBottom: "18px" }}>
        <div className="stat">
          <div className="lb">Format</div>
          <div className="v" style={{ fontSize: "19px" }}>
            CycloneDX 1.6
          </div>
          <div className="sub">CBOM Spec §10</div>
        </div>
        <div className="stat">
          <div className="lb">Schema Validation</div>
          <div className="v" style={{ fontSize: "19px", color: cbomData?.valid ? "var(--ok)" : "var(--p1)" }}>
            {cbomData?.valid ? (
              <span className="row" style={{ gap: "4px" }}>
                <ShieldCheck size={18} /> Valid
              </span>
            ) : (
              <span className="row" style={{ gap: "4px" }}>
                <AlertCircle size={18} /> Errors ({cbomData?.errors?.length || 0})
              </span>
            )}
          </div>
          <div className="sub">Strict schema check</div>
        </div>
        <div className="stat">
          <div className="lb">Components &amp; Version</div>
          <div className="v" style={{ fontSize: "19px" }}>
            {componentsCount} <span style={{ fontSize: "13px", color: "var(--mut)", fontWeight: 500 }}>v{cbomVersion}</span>
          </div>
          <div className="sub">Increments on edits</div>
        </div>
        <div className="stat">
          <div className="lb">Serial Number</div>
          <div className="v mono" style={{ fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis" }} title={serialNumber}>
            {shortSerial}
          </div>
          <div className="sub">Deterministic UUID</div>
        </div>
      </div>

      {/* 2-Column: Components Table & JSON Preview */}
      <div className="grid" style={{ gridTemplateColumns: "1.35fr 1fr", gap: "18px" }}>
        {/* Table Column */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px" }}>
            <h3 style={{ margin: 0 }}>
              Components{" "}
              <span className="rt" style={{ marginLeft: "auto" }}>
                Click row to view JSON · Click Edit to override
              </span>
            </h3>
          </div>

          {assets.length === 0 ? (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--mut)" }}>
              No cryptographic components identified in this scan.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Priority</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sortedAssets.map((a) => {
                  const alg = a.algorithm || a.label?.split(" ")[0] || "RSA";
                  const keySize = a.key_size ? `-${a.key_size}` : "";
                  const locParts = (a.primary_location || a.files?.[0] || "—").split(":");
                  const bomRef = `mox-asset-${a.id}`;
                  const isCurrentRow = activeComponent?.["bom-ref"] === bomRef;
                  const isEdited = Boolean(a.edited || a.priority_override || a.owner || a.status || a.notes);

                  return (
                    <tr
                      key={a.id}
                      style={{
                        cursor: "pointer",
                        background: isCurrentRow ? "rgba(14, 165, 201, 0.07)" : undefined,
                      }}
                      onClick={() => setSelectedCompRef(bomRef)}
                    >
                      <td>
                        <div style={{ fontWeight: 700 }}>
                          {alg}{keySize}
                        </div>
                        <div className="mono" style={{ fontSize: "11px", color: "var(--mut)" }}>
                          {bomRef}
                        </div>
                      </td>
                      <td>
                        <div className="row" style={{ gap: "4px" }}>
                          <span
                            className={`pill ${PRIORITY_MAP[a.priority || "P4"]?.pill || "p4"}`}
                            title={a.priority_reason || ""}
                          >
                            {a.priority || "P4"}
                          </span>
                          {isEdited && (
                            <span
                              className="pill"
                              style={{
                                background: "rgba(14, 165, 201, 0.15)",
                                color: "#0B7C99",
                                fontSize: "10.5px",
                                fontWeight: 700,
                              }}
                            >
                              EDITED
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ fontSize: "12.5px" }}>{a.owner || "—"}</td>
                      <td>
                        <span
                          className="pill"
                          style={{
                            fontSize: "11px",
                            background: a.status === "Fixed" ? "rgba(22, 163, 74, 0.12)" : "rgba(100, 116, 139, 0.1)",
                            color: a.status === "Fixed" ? "var(--ok)" : "var(--mut)",
                          }}
                        >
                          {a.status || "Open"}
                        </span>
                      </td>
                      <td><b>{Number(a.score || 0).toFixed(1)}</b></td>
                      <td className="mono" style={{ fontSize: "11.5px", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={a.primary_location || a.files?.[0]}>
                        {locParts[0]}:{locParts[1] || "1"}
                      </td>
                      <td>
                        <button
                          className="btn cy"
                          style={{ padding: "4px 8px", fontSize: "11.5px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditPanel(a);
                          }}
                          title="Override priority, owner, status, notes"
                        >
                          <Sliders size={12} /> Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* JSON Preview Column */}
        <div className="card" style={{ padding: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--bd)" }}>
            <h3 style={{ margin: 0 }}>
              CycloneDX Component JSON{" "}
              {activeComponent && (
                <span className="mono" style={{ fontSize: "12px", color: "var(--cy)", fontWeight: 600 }}>
                  ({activeComponent["bom-ref"]})
                </span>
              )}
            </h3>
          </div>
          <pre
            className="mono"
            style={{
              padding: "16px",
              margin: 0,
              fontSize: "12px",
              background: "#F8FAFC",
              color: "var(--ink)",
              overflow: "auto",
              flex: 1,
              maxHeight: "560px",
              lineHeight: 1.45,
            }}
          >
            {activeComponent
              ? JSON.stringify(activeComponent, null, 2)
              : "{\n  \"message\": \"Select a component to inspect CycloneDX properties\"\n}"}
          </pre>
        </div>
      </div>

      {/* Edit Side Panel Drawer */}
      {editingAsset && (
        <div className="side-panel-overlay" onClick={closeEditPanel}>
          <div className="side-panel" onClick={(e) => e.stopPropagation()}>
            <div className="side-panel-header">
              <div>
                <b style={{ fontSize: "16px" }}>Edit Component</b>
                <div className="mono" style={{ fontSize: "12px", color: "var(--mut)", marginTop: "2px" }}>
                  {editingAsset.label} ({editingAsset.algorithm})
                </div>
              </div>
              <button className="ib" onClick={closeEditPanel}>
                <X size={18} />
              </button>
            </div>

            <div className="side-panel-body">
              {/* Priority Override */}
              <div className="field">
                <label className="f">Priority override</label>
                <select
                  className="in"
                  value={priorityOverride}
                  onChange={(e) => setPriorityOverride(e.target.value)}
                  disabled={saving}
                >
                  <option value="Auto">Auto (calculated from CMCS + Mosca)</option>
                  <option value="P1">P1 — Critical (immediate remediation)</option>
                  <option value="P2">P2 — High (plan for migration)</option>
                  <option value="P3">P3 — Medium (crypto-agility)</option>
                  <option value="P4">P4 — Low (monitor / accepted)</option>
                </select>
                <span className="f-desc">
                  Overrides the calculated risk tier across all dashboards and reports.
                </span>
              </div>

              {/* Criticality & Shelf-life */}
              <div className="grid g2" style={{ gap: "12px" }}>
                <div className="field">
                  <label className="f">Business Criticality</label>
                  <select
                    className="in"
                    value={criticality}
                    onChange={(e) => setCriticality(Number(e.target.value))}
                    disabled={saving}
                  >
                    <option value={3}>3 — Critical</option>
                    <option value={2}>2 — Medium</option>
                    <option value={1}>1 — Low</option>
                  </select>
                </div>
                <div className="field">
                  <label className="f">Shelf-life X (years)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    className="in mono"
                    placeholder="e.g. 10"
                    value={shelfLifeX}
                    onChange={(e) => setShelfLifeX(e.target.value)}
                    disabled={saving}
                  />
                </div>
              </div>

              {/* Owner */}
              <div className="field">
                <label className="f">Owner</label>
                <input
                  className="in"
                  placeholder="e.g. Payments Core Team / Jane Doe"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  disabled={saving}
                />
                <span className="f-desc">Exported as CycloneDX property mox:owner</span>
              </div>

              {/* Status */}
              <div className="field">
                <label className="f">Status</label>
                <select
                  className="in"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  disabled={saving}
                >
                  <option value="Open">Open</option>
                  <option value="In progress">In progress</option>
                  <option value="Accepted risk">Accepted risk</option>
                  <option value="Fixed">Fixed</option>
                </select>
                <span className="f-desc">Exported as CycloneDX property mox:status</span>
              </div>

              {/* Notes */}
              <div className="field">
                <label className="f">Notes &amp; Justification</label>
                <textarea
                  className="in mono"
                  rows={4}
                  placeholder="Document risk rationale or migration plan…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={saving}
                  style={{ resize: "vertical" }}
                />
                <span className="f-desc">Exported as CycloneDX property mox:note</span>
              </div>
            </div>

            <div className="side-panel-footer">
              <button
                className="btn"
                style={{ color: "var(--p3)" }}
                onClick={handleResetOverride}
                disabled={saving}
                title="Remove analyst overrides and restore automatic scan calculations"
              >
                <RotateCcw size={13} /> Reset to automatic
              </button>
              <div className="row" style={{ gap: "8px" }}>
                <button className="btn" onClick={closeEditPanel} disabled={saving}>
                  Cancel
                </button>
                <button className="btn pri" onClick={handleSaveOverride} disabled={saving}>
                  <Check size={14} /> {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
