import React, { useState, useEffect } from "react";
import { api } from "../api";
import { RotateCw, FileText, Download, GitCompare, Trash2, ArrowRight } from "lucide-react";

export default function History({
  selectedScanId,
  onSelectScan,
  onScanDeleted,
  onNavigate,
  showToast,
}) {
  const [historyList, setHistoryList] = useState([]);
  const [auditList, setAuditList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Compare modal state
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [compareTargetScan, setCompareTargetScan] = useState(null);
  const [selectedCompareId, setSelectedCompareId] = useState("");

  // Delete modal state
  const [scanToDelete, setScanToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = async () => {
    try {
      const [hist, audit] = await Promise.all([
        api.history().catch(() => []),
        api.audit().catch(() => []),
      ]);
      setHistoryList(Array.isArray(hist) ? hist : []);
      setAuditList(Array.isArray(audit) ? audit : []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (isoStr) => {
    if (!isoStr) return "—";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr.slice(0, 16).replace("T", " ");
    }
  };

  const handleOpenCompare = async (scan) => {
    setCompareTargetScan(scan);
    setShowCompareModal(true);
    setCompareLoading(true);
    setCompareData(null);
    setSelectedCompareId("");
    try {
      const res = await api.scanCompare(scan.id);
      setCompareData(res);
      if (res.previous?.id) {
        setSelectedCompareId(String(res.previous.id));
      }
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to compare scans");
    } finally {
      setCompareLoading(false);
    }
  };

  const handleCustomCompare = async (compareId) => {
    setSelectedCompareId(compareId);
    if (!compareTargetScan) return;
    setCompareLoading(true);
    try {
      const res = await api.scanCompare(compareTargetScan.id, compareId ? Number(compareId) : undefined);
      setCompareData(res);
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to compare scans");
    } finally {
      setCompareLoading(false);
    }
  };

  const handleDeleteScan = async () => {
    if (!scanToDelete) return;
    setDeleting(true);
    try {
      await api.scanDelete(scanToDelete.id);
      if (showToast) showToast(`Scan #${scanToDelete.id} deleted`);
      setScanToDelete(null);
      await loadData();
      if (onScanDeleted) onScanDeleted(scanToDelete.id);
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to delete scan");
    } finally {
      setDeleting(false);
    }
  };

  const downloadFile = async (url, filename) => {
    try {
      if (showToast) showToast(`Downloading ${filename}…`);
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objUrl);
      if (showToast) showToast(`${filename} downloaded`);
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to download file");
    }
  };

  return (
    <section className="page on" id="p-hist">
      <div className="ph">
        <div>
          <h1>Scan History &amp; Reports</h1>
          <p>Every scan is recorded. Open previous project runs, compare changes, or export compliance reports.</p>
        </div>
        <div className="act">
          <button className="btn" onClick={() => onNavigate("scan")}>
            <RotateCw size={15} /> New scan
          </button>
          <button
            className="btn pri"
            onClick={() =>
              downloadFile(
                selectedScanId ? `/api/report/download?scan_id=${selectedScanId}` : "/api/report/download",
                "mox-compliance-report.pdf"
              )
            }
          >
            <FileText size={15} /> Download PDF report
          </button>
          <button
            className="btn gr"
            onClick={() =>
              downloadFile(
                selectedScanId ? `/api/cbom/download?scan_id=${selectedScanId}` : "/api/cbom/download",
                "mox-cbom.cdx.json"
              )
            }
          >
            <Download size={15} /> Download CBOM
          </button>
        </div>
      </div>

      {/* Scans Table Card */}
      <div className="card" style={{ padding: 0, marginBottom: "20px" }}>
        <div style={{ padding: "16px 20px" }}>
          <h3 style={{ margin: 0 }}>
            Scan timeline{" "}
            <span className="rt" style={{ marginLeft: "auto" }}>
              {historyList.length} scans recorded
            </span>
          </h3>
        </div>
        {historyList.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--mut)" }}>
            No scans recorded yet. Run a scan from the Scanner to view history.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Scan</th>
                <th>Project</th>
                <th>Target</th>
                <th>Date</th>
                <th>Files</th>
                <th>Findings</th>
                <th>Assets</th>
                <th>QV Assets</th>
                <th>Critical</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {historyList.map((s) => {
                const isSelected = s.id === selectedScanId;
                const dur = s.duration !== undefined ? `${Number(s.duration).toFixed(3)}s` : `${Number(s.seconds || 0).toFixed(3)}s`;

                return (
                  <tr key={s.id} style={isSelected ? { background: "rgba(14, 165, 201, 0.05)" } : undefined}>
                    <td>
                      <b>#{s.id}</b>
                      {isSelected && (
                        <span
                          className="pill"
                          style={{
                            marginLeft: "6px",
                            background: "rgba(14, 165, 201, 0.15)",
                            color: "#0B7C99",
                            fontSize: "10.5px",
                            fontWeight: 700,
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td>
                      <b>{s.project_name || "Default project"}</b>
                    </td>
                    <td className="mono" style={{ fontSize: "12px", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.target}>
                      {s.target}
                    </td>
                    <td style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{formatDate(s.started_at || s.date)}</td>
                    <td>{s.files ?? s.files_scanned ?? "—"}</td>
                    <td>
                      <span className="pill p3">{s.findings ?? s.findings_count ?? 0}</span>
                    </td>
                    <td>
                      <b>{s.assets_count ?? "—"}</b>
                    </td>
                    <td>
                      <span className={`pill ${s.qv_count > 0 ? "p1" : "p4"}`}>
                        {s.qv_count ?? 0}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${s.critical_count > 0 ? "p1" : "p4"}`}>
                        {s.critical_count ?? 0}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: "12px" }}>{dur}</td>
                    <td>
                      <div className="row" style={{ gap: "6px" }}>
                        <button
                          className={`btn ${isSelected ? "pri" : ""}`}
                          style={{ padding: "4px 8px", fontSize: "11.5px" }}
                          onClick={() => {
                            if (onSelectScan) onSelectScan(s.id);
                            if (onNavigate) onNavigate("dash");
                          }}
                          title="Open this scan in Dashboard and all views"
                        >
                          Open
                        </button>
                        <button
                          className="btn"
                          style={{ padding: "4px 8px", fontSize: "11.5px" }}
                          onClick={() => handleOpenCompare(s)}
                          title="Compare with previous project scan"
                        >
                          <GitCompare size={12} /> Compare
                        </button>
                        <button
                          className="btn"
                          style={{ padding: "4px 8px", fontSize: "11.5px", color: "var(--p1)" }}
                          onClick={() => setScanToDelete(s)}
                          title="Delete scan"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Audit Log Card */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px" }}>
          <h3 style={{ margin: 0 }}>
            Audit log{" "}
            <span className="rt" style={{ marginLeft: "auto" }}>
              Every action logged under local-analyst
            </span>
          </h3>
        </div>
        {auditList.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "var(--mut)" }}>
            No audit events recorded.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {auditList.slice(0, 20).map((a, i) => (
                <tr key={a.id || i}>
                  <td className="mono" style={{ fontSize: "12px" }}>
                    {a.ts ? a.ts.slice(0, 19).replace("T", " ") : "—"}
                  </td>
                  <td>
                    <span className="pill cyp">{a.actor || "local-analyst"}</span>
                  </td>
                  <td>
                    <b>{a.action}</b>
                  </td>
                  <td style={{ fontSize: "12.5px", color: "var(--mut)" }}>
                    {a.detail || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Compare Modal */}
      {showCompareModal && compareTargetScan && (
        <div className="modal">
          <div className="mc" style={{ maxWidth: "820px", width: "95%" }}>
            <div className="row" style={{ justifyContent: "space-between", marginBottom: "12px" }}>
              <div className="row" style={{ gap: "8px" }}>
                <GitCompare size={20} style={{ color: "var(--cy)" }} />
                <b style={{ fontSize: "16px" }}>Compare Scans</b>
              </div>
              <button className="ib" onClick={() => setShowCompareModal(false)}>
                ✕
              </button>
            </div>

            <p style={{ color: "var(--mut)", fontSize: "13px", margin: "0 0 16px" }}>
              Comparing <b>Scan #{compareTargetScan.id}</b> ({compareTargetScan.project_name || "Project"}) with prior baseline.
            </p>

            {/* Compare Select Header */}
            <div className="row" style={{ gap: "12px", background: "var(--bg)", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px" }}>
              <span>Compare against:</span>
              <select
                className="in"
                style={{ maxWidth: "340px", padding: "4px 8px", fontSize: "12.5px" }}
                value={selectedCompareId}
                onChange={(e) => handleCustomCompare(e.target.value)}
              >
                {historyList
                  .filter((s) => s.id !== compareTargetScan.id)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      Scan #{s.id} · {s.project_name} · {formatDate(s.started_at || s.date)}
                    </option>
                  ))}
              </select>
            </div>

            {compareLoading ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--mut)" }}>
                Calculating differences between scans…
              </div>
            ) : !compareData || !compareData.previous ? (
              <div className="box" style={{ padding: "20px", textAlign: "center" }}>
                <b>Initial scan for this project</b>
                <p style={{ color: "var(--mut)", margin: "8px 0 0" }}>
                  No previous scan was found to compare against. This scan established the baseline with{" "}
                  <b>{compareData?.new_assets?.length || 0}</b> cryptographic assets.
                </p>
              </div>
            ) : (
              <div>
                {/* Stats Summary Row */}
                <div className="grid g4" style={{ marginBottom: "18px" }}>
                  <div className="stat" style={{ padding: "12px" }}>
                    <div className="lb">New Assets</div>
                    <div className="v" style={{ color: compareData.new_assets.length > 0 ? "var(--p1)" : "var(--ink)", fontSize: "20px" }}>
                      +{compareData.new_assets.length}
                    </div>
                  </div>
                  <div className="stat" style={{ padding: "12px" }}>
                    <div className="lb">Removed / Fixed</div>
                    <div className="v" style={{ color: compareData.removed_assets.length > 0 ? "var(--ok)" : "var(--ink)", fontSize: "20px" }}>
                      -{compareData.removed_assets.length}
                    </div>
                  </div>
                  <div className="stat" style={{ padding: "12px" }}>
                    <div className="lb">Changed Scores</div>
                    <div className="v" style={{ color: compareData.changed_assets.length > 0 ? "var(--p2)" : "var(--ink)", fontSize: "20px" }}>
                      {compareData.changed_assets.length}
                    </div>
                  </div>
                  <div className="stat" style={{ padding: "12px" }}>
                    <div className="lb">Unchanged</div>
                    <div className="v" style={{ fontSize: "20px" }}>
                      {compareData.unchanged_count}
                    </div>
                  </div>
                </div>

                {/* Diff Tables */}
                {compareData.new_assets.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ color: "var(--p1)", margin: "0 0 8px" }}>
                      + New Assets ({compareData.new_assets.length})
                    </h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Asset</th>
                          <th>Algorithm</th>
                          <th>Tier</th>
                          <th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareData.new_assets.map((a, i) => (
                          <tr key={a.id || i}>
                            <td><b>{a.label}</b></td>
                            <td>{a.algorithm}</td>
                            <td><span className="pill p1">{a.tier}</span></td>
                            <td>{Number(a.score || 0).toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {compareData.removed_assets.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ color: "var(--ok)", margin: "0 0 8px" }}>
                      ✓ Cleared / Removed Assets ({compareData.removed_assets.length})
                    </h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Asset</th>
                          <th>Algorithm</th>
                          <th>Previous Tier</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareData.removed_assets.map((a, i) => (
                          <tr key={a.id || i}>
                            <td><b>{a.label}</b></td>
                            <td>{a.algorithm}</td>
                            <td><span className="pill p4">{a.tier}</span></td>
                            <td><span className="pill qs">CLEARED</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {compareData.changed_assets.length > 0 && (
                  <div style={{ marginBottom: "16px" }}>
                    <h4 style={{ color: "var(--p2)", margin: "0 0 8px" }}>
                      Changed Assets ({compareData.changed_assets.length})
                    </h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Asset</th>
                          <th>Tier Transition</th>
                          <th>Score Transition</th>
                          <th>Verdict</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compareData.changed_assets.map((c, i) => (
                          <tr key={i}>
                            <td><b>{c.asset.label}</b></td>
                            <td>
                              <span className="pill p4">{c.prev_tier}</span>
                              <ArrowRight size={12} style={{ margin: "0 6px", verticalAlign: "middle" }} />
                              <span className="pill p1">{c.curr_tier}</span>
                            </td>
                            <td className="mono">
                              {Number(c.prev_score).toFixed(1)} → {Number(c.curr_score).toFixed(1)}
                            </td>
                            <td>
                              <span className="pill cyp">{c.curr_verdict}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {compareData.new_assets.length === 0 &&
                  compareData.removed_assets.length === 0 &&
                  compareData.changed_assets.length === 0 && (
                    <div style={{ padding: "16px", textAlign: "center", color: "var(--mut)" }}>
                      Identical scan results — no new, removed, or score-altered assets detected.
                    </div>
                  )}
              </div>
            )}

            <div className="row" style={{ justifyContent: "flex-end", marginTop: "18px" }}>
              <button className="btn" onClick={() => setShowCompareModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {scanToDelete && (
        <div className="modal">
          <div className="mc" style={{ maxWidth: "460px" }}>
            <div className="row" style={{ gap: "8px", color: "var(--p1)", marginBottom: "8px" }}>
              <Trash2 size={20} />
              <b style={{ fontSize: "16px" }}>Delete Scan #{scanToDelete.id}?</b>
            </div>
            <p style={{ color: "var(--mut)", fontSize: "13px", lineHeight: 1.6, margin: "0 0 18px" }}>
              Are you sure you want to permanently delete <b>Scan #{scanToDelete.id}</b> for{" "}
              <b>{scanToDelete.project_name || scanToDelete.target}</b>? This will erase all findings,
              asset correlations, and location records for this scan run.
            </p>
            <div className="row" style={{ justifyContent: "flex-end", gap: "8px" }}>
              <button
                className="btn"
                disabled={deleting}
                onClick={() => setScanToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{ background: "var(--p1)", color: "#fff", borderColor: "var(--p1)" }}
                disabled={deleting}
                onClick={handleDeleteScan}
              >
                {deleting ? "Deleting…" : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
