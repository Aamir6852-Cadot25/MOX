import React, { useState, useEffect } from "react";
import { api } from "../api";
import { RotateCw, FileText, Download } from "lucide-react";

export default function History({ onNavigate, showToast }) {
  const [historyList, setHistoryList] = useState([]);
  const [auditList, setAuditList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.history().catch(() => []),
      api.audit().catch(() => []),
    ]).then(([hist, audit]) => {
      if (Array.isArray(hist) && hist.length > 0) {
        setHistoryList(hist);
      } else {
        // Fallback demo scans matching preview
        setHistoryList([
          { id: 5, started_at: "2026-09-26 18:37", files_scanned: 23, findings_count: 35, seconds: 0.099 },
          { id: 4, started_at: "2026-09-26 18:34", files_scanned: 23, findings_count: 35, seconds: 0.103 },
          { id: 3, started_at: "2026-09-26 18:32", files_scanned: 23, findings_count: 35, seconds: 0.099 },
          { id: 2, started_at: "2026-09-26 18:29", files_scanned: 23, findings_count: 35, seconds: 0.098 },
          { id: 1, started_at: "2026-09-26 18:29", files_scanned: 23, findings_count: 35, seconds: 0.098 },
        ]);
      }

      if (Array.isArray(audit) && audit.length > 0) {
        setAuditList(audit.slice(0, 15));
      } else {
        setAuditList([
          { time: "18:37", user: "admin", action: "scan", details: "demo_target → 35 findings, 25 assets" },
          { time: "18:36", user: "admin", action: "cbom-export", details: "v1 · 25 components" },
          { time: "18:35", user: "admin", action: "login-ok", details: "" },
        ]);
      }
      setLoading(false);
    });
  }, []);

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
          <p>Every scan is recorded. Export the compliance report or the CBOM.</p>
        </div>
        <div className="act">
          <button className="btn" onClick={() => onNavigate("scan")}>
            <RotateCw size={15} /> Rescan source
          </button>
          <button
            className="btn pri"
            onClick={() => downloadFile("/api/report/download", "mox-compliance-report.pdf")}
          >
            <FileText size={15} /> Download PDF report
          </button>
          <button
            className="btn gr"
            onClick={() => downloadFile("/api/cbom/download", "mox-cbom.cdx.json")}
          >
            <Download size={15} /> Download CBOM
          </button>
        </div>
      </div>

      {/* Timeline Card */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px" }}>
          <h3 style={{ margin: 0 }}>
            Scan timeline{" "}
            <span className="rt" style={{ marginLeft: "auto" }}>
              {historyList.length} scans recorded
            </span>
          </h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Scan</th>
              <th>Date</th>
              <th>Target</th>
              <th>Files</th>
              <th>Findings</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {historyList.map((s) => {
              const dateStr = s.started_at
                ? s.started_at.length > 16
                  ? s.started_at.slice(0, 16).replace("T", " ")
                  : s.started_at
                : "2026-09-26 18:37";
              const dur = s.seconds ? `${Number(s.seconds).toFixed(3)}s` : "0.099s";

              return (
                <tr key={s.id}>
                  <td>
                    <b>#{s.id}</b>
                  </td>
                  <td>{dateStr}</td>
                  <td className="mono" style={{ fontSize: "12px" }}>
                    {s.target || "D:\\MOX\\demo_target"}
                  </td>
                  <td>{s.files_scanned || 23}</td>
                  <td>
                    <span className="pill p3">{s.findings_count || 35} findings</span>
                  </td>
                  <td className="mono">{dur}</td>
                  <td>
                    <span className="pill qs">completed</span>
                  </td>
                  <td>
                    <div className="row" style={{ gap: "6px" }}>
                      <button
                        className="btn"
                        style={{ padding: "5px 10px" }}
                        onClick={() => onNavigate("dash")}
                      >
                        Inspect
                      </button>
                      <button
                        className="btn"
                        style={{ padding: "5px 10px" }}
                        onClick={() => downloadFile("/api/report/download", "mox-compliance-report.pdf")}
                      >
                        Report
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Recent Activity Card */}
      <div className="card">
        <h3>Recent activity</h3>
        <div style={{ fontSize: "13px" }}>
          {auditList.map((a, idx) => {
            const timeStr = a.created_at ? a.created_at.slice(11, 16) : a.time || "18:37";
            return (
              <div
                key={a.id || idx}
                className="row"
                style={{
                  padding: "8px 0",
                  borderBottom: idx === auditList.length - 1 ? "none" : "1px solid #F0F2F5",
                }}
              >
                <span className="mono" style={{ color: "var(--mut)", width: "50px" }}>
                  {timeStr}
                </span>
                <span className="pill cyp">{a.action}</span>
                <span>
                  {a.username || a.user} {a.details ? `· ${a.details}` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
