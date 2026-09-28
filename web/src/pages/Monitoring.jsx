import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Bell, Plus, X } from "lucide-react";

export default function Monitoring({ latestScan, assets = [], onNavigate, showToast }) {
  const [projectsList, setProjectsList] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tab, setTab] = useState("git"); // 'git' | 'local' | 'zip'
  const [projectName, setProjectName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .projects()
      .then((res) => {
        if (Array.isArray(res)) setProjectsList(res);
      })
      .catch(() => {});
  }, []);

  const qvCount = assets.filter((a) => a.breakdown?.quantum_vulnerable || a.quantum_vulnerable).length;
  const criticalCount = assets.filter((a) => a.tier === "Critical").length;
  const highCount = assets.filter((a) => a.tier === "High").length;
  const planesCount = latestScan?.kpi?.planes || 6;

  const handleAddProject = async () => {
    if (!projectName) {
      if (showToast) showToast("Please enter a project name");
      return;
    }
    setSubmitting(true);
    try {
      await api.createProject({
        name: projectName,
        sector: "Government",
        system_type: "Web service / API",
        criticality: 3,
        shelf_life_years: 7,
      });
      if (showToast) showToast("Project added to watchlist");
      setShowAddModal(false);
      setProjectName("");
      setRepoUrl("");
      // Refresh projects
      const res = await api.projects();
      if (Array.isArray(res)) setProjectsList(res);
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to add project");
    } finally {
      setSubmitting(false);
    }
  };

  const scanTime = latestScan?.scan?.started_at
    ? new Date(latestScan.scan.started_at).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "26 Sep, 18:37";

  return (
    <section className="page on" id="p-mon">
      <div className="ph">
        <div>
          <h1>Project Watchlist</h1>
          <p>Track each system's crypto posture across scans.</p>
        </div>
        <div className="act">
          <button
            className="btn"
            onClick={() => showToast && showToast("No new notifications")}
          >
            <Bell size={15} /> Notifications
          </button>
          <button className="btn cy" onClick={() => setShowAddModal(true)}>
            <Plus size={15} /> Add Project
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid g4" style={{ marginBottom: "18px" }}>
        <div className="stat">
          <div className="lb">
            <span className="dot" style={{ background: "var(--cy)" }} />
            Monitored projects
          </div>
          <div className="v" style={{ color: "var(--ink)" }}>
            {Math.max(1, projectsList.length)}
          </div>
        </div>

        <div className="stat">
          <div className="lb">
            <span className="dot" style={{ background: "var(--p1)" }} />
            High / critical alerts
          </div>
          <div className="v" style={{ color: "var(--p1)" }}>
            {criticalCount + highCount}
          </div>
        </div>

        <div className="stat">
          <div className="lb">
            <span className="dot" style={{ background: "var(--p2)" }} />
            Quantum-vulnerable assets
          </div>
          <div className="v" style={{ color: "var(--p2)" }}>
            {qvCount}
          </div>
        </div>

        <div className="stat">
          <div className="lb">
            <span className="dot" style={{ background: "var(--ok)" }} />
            Scan planes active
          </div>
          <div className="v" style={{ color: "var(--ok)" }}>
            {planesCount} / 7
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px" }}>
          <h3 style={{ margin: 0 }}>Monitored projects</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Project</th>
              <th>Sector</th>
              <th>Criticality</th>
              <th>Last scan</th>
              <th>Assets</th>
              <th>Quantum-vulnerable</th>
              <th>Readiness</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <b>demo_target</b>
                <div className="mono" style={{ fontSize: "11.5px", color: "var(--mut)" }}>
                  {latestScan?.scan?.target || "D:\\MOX\\demo_target"}
                </div>
              </td>
              <td>Government</td>
              <td>
                <span className="pill p1">3 — High</span>
              </td>
              <td>{scanTime}</td>
              <td>
                <b>{assets.length || 25}</b>
              </td>
              <td>
                <b style={{ color: "var(--p1)" }}>{qvCount || 9}</b>
              </td>
              <td>
                <div className="bar" style={{ width: "120px", margin: 0 }}>
                  <i style={{ width: "38%", background: "var(--p3)" }} />
                </div>
              </td>
              <td>
                <button className="btn" onClick={() => onNavigate("scan")}>
                  Scan now
                </button>
              </td>
            </tr>

            {projectsList
              .filter((p) => p.name !== "demo_target" && p.name !== "Default project")
              .map((p) => (
                <tr key={p.id}>
                  <td>
                    <b>{p.name}</b>
                    <div className="mono" style={{ fontSize: "11.5px", color: "var(--mut)" }}>
                      {p.source_ref || "Local directory"}
                    </div>
                  </td>
                  <td>{p.sector || "Government"}</td>
                  <td>
                    <span className="pill p2">
                      {p.criticality === 3
                        ? "3 — High"
                        : p.criticality === 2
                        ? "2 — Medium"
                        : "1 — Low"}
                    </span>
                  </td>
                  <td>Pending</td>
                  <td>—</td>
                  <td>—</td>
                  <td>
                    <div className="bar" style={{ width: "120px", margin: 0 }}>
                      <i style={{ width: "0%", background: "var(--mut2)" }} />
                    </div>
                  </td>
                  <td>
                    <button className="btn" onClick={() => onNavigate("scan")}>
                      Scan now
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Add Project Modal */}
      {showAddModal && (
        <div className="modal">
          <div className="mc">
            <div className="row">
              <b style={{ fontSize: "16px" }}>Add project to watchlist</b>
              <button
                className="ib"
                style={{ marginLeft: "auto", color: "var(--mut)" }}
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="tabs3">
              <div
                className={`src ${tab === "git" ? "on" : ""}`}
                style={{ padding: "12px" }}
                onClick={() => setTab("git")}
              >
                <b style={{ margin: 0 }}>GitHub repo</b>
              </div>
              <div
                className={`src ${tab === "local" ? "on" : ""}`}
                style={{ padding: "12px" }}
                onClick={() => setTab("local")}
              >
                <b style={{ margin: 0 }}>Local project</b>
              </div>
              <div
                className={`src ${tab === "zip" ? "on" : ""}`}
                style={{ padding: "12px" }}
                onClick={() => setTab("zip")}
              >
                <b style={{ margin: 0 }}>Upload ZIP</b>
              </div>
            </div>

            <label className="f">Project name</label>
            <input
              className="in"
              placeholder="e.g. Payments API"
              style={{ marginBottom: "12px" }}
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <label className="f">Repository URL / Path</label>
            <input
              className="in mono"
              placeholder={
                tab === "git"
                  ? "https://github.com/org/payments-api"
                  : tab === "local"
                  ? "D:\\Projects\\payments-api"
                  : "payments.zip"
              }
              style={{ marginBottom: "12px" }}
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
            />

            {tab === "git" && (
              <>
                <label className="f">Branch</label>
                <input
                  className="in mono"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                />
              </>
            )}

            <div className="row" style={{ justifyContent: "flex-end", marginTop: "18px" }}>
              <button className="btn" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button className="btn cy" onClick={handleAddProject} disabled={submitting}>
                {submitting ? "Adding…" : "Add to watchlist"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
