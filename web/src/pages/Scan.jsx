import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Folder, GitBranch, Upload, Shield, Play } from "lucide-react";
import BrowseModal from "../components/BrowseModal";

const SOURCES = [
  { id: "folder", label: "Local project", sub: "Folder on this machine", icon: Folder },
  { id: "git", label: "GitHub repository", sub: "Clone & scan a URL", icon: GitBranch },
  { id: "zip", label: "ZIP / container upload", sub: "Archive or image .tar", icon: Upload },
  { id: "tls", label: "TLS endpoint", sub: "Probe an authorised host", icon: Shield },
];

const PLANES_CONFIG = [
  { id: "code", label: "1. Source code", sub: "Java, Python, Go, JS crypto calls" },
  { id: "dependencies", label: "2. Libraries & dependencies", sub: "pom.xml, package.json, requirements" },
  { id: "binaries", label: "3. Binaries & executables", sub: "strings in compiled files" },
  { id: "containers", label: "4. Containers & images", sub: "Dockerfile, image layers" },
  { id: "certificates", label: "5. Certificates & keys", sub: "X.509, PEM, PKCS#12 key sizes" },
  { id: "configs", label: "6. Configs & protocols", sub: "nginx, java.security, Terraform KMS" },
  { id: "tls", label: "7. Live TLS endpoint", sub: "authorised host:port probe only" },
];

export default function Scan({ onScanComplete, showToast }) {
  const [source, setSource] = useState("folder");
  const [folderPath, setFolderPath] = useState("D:\\MOX\\demo_target");
  const [gitUrl, setGitUrl] = useState("");
  const [gitBranch, setGitBranch] = useState("main");
  const [gitAuthorized, setGitAuthorized] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [tlsEndpoint, setTlsEndpoint] = useState("127.0.0.1:8443");
  const [tlsAuthorized, setTlsAuthorized] = useState(false);

  // Projects
  const [existingProjects, setExistingProjects] = useState([]);
  const [projectMode, setProjectMode] = useState("new"); // 'new' | 'existing'
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectName, setProjectName] = useState("demo_target");
  const [systemType, setSystemType] = useState("Web service / API");
  const [sector, setSector] = useState("Government");
  const [criticality, setCriticality] = useState(3);
  const [shelfLifeYears, setShelfLifeYears] = useState(5);

  // Scan planes selection
  const [selectedPlanes, setSelectedPlanes] = useState(
    new Set(["code", "dependencies", "binaries", "containers", "certificates", "configs"])
  );

  // Modals & execution state
  const [showConfirm, setShowConfirm] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [planeStates, setPlaneStates] = useState({});
  const [scanProgressText, setScanProgressText] = useState("7 available · TLS needs an authorised endpoint");

  useEffect(() => {
    api.projects().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setExistingProjects(res);
      }
    }).catch(() => {});
  }, []);

  const handleSelectExistingProject = (projId) => {
    setSelectedProjectId(projId);
    const p = existingProjects.find((x) => String(x.id) === String(projId));
    if (p) {
      setProjectName(p.name || "");
      if (p.sector) setSector(p.sector);
      if (p.system_type) setSystemType(p.system_type);
      if (p.criticality) setCriticality(p.criticality);
      if (p.shelf_life_years) setShelfLifeYears(p.shelf_life_years);
    }
  };

  const togglePlane = (id) => {
    if (isScanning) return;
    const next = new Set(selectedPlanes);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPlanes(next);
  };

  const startScanJob = async () => {
    setShowConfirm(false);
    setIsScanning(true);
    setScanProgressText("Initialising scanner…");

    const states = {};
    PLANES_CONFIG.forEach((p) => {
      states[p.id] = selectedPlanes.has(p.id) ? "pending" : "off";
    });
    setPlaneStates(states);

    try {
      let jobRes;
      const projId = projectMode === "existing" && selectedProjectId ? Number(selectedProjectId) : undefined;
      const projName = projectName.trim() || undefined;

      if (source === "zip" && uploadedFiles.length > 0) {
        const formData = new FormData();
        formData.append("source", "archive");
        formData.append("planes", Array.from(selectedPlanes).join(","));
        formData.append("tls_authorized", tlsAuthorized ? "true" : "false");
        if (projId) formData.append("project_id", String(projId));
        if (projName) formData.append("project_name", projName);
        formData.append("sector", sector);
        formData.append("system_type", systemType);
        formData.append("criticality", String(criticality));
        formData.append("shelf_life_years", String(shelfLifeYears));
        for (const file of uploadedFiles) {
          formData.append("files", file);
        }
        jobRes = await api.scanUpload(formData);
      } else {
        const req = {
          source: source === "tls" ? "tls" : source === "git" ? "git" : "folder",
          path: source === "folder" ? folderPath : source === "git" ? gitUrl : "",
          planes: Array.from(selectedPlanes),
          probe: source === "tls" ? tlsEndpoint : undefined,
          tls_authorized: tlsAuthorized,
          git_remote: source === "git" ? gitUrl : undefined,
          git_authorized: gitAuthorized,
          project_id: projId,
          project_name: projName,
          sector,
          system_type: systemType,
          criticality: Number(criticality),
          shelf_life_years: Number(shelfLifeYears),
        };
        jobRes = await api.scanStart(req);
      }

      const jobId = jobRes.job_id || jobRes.id;
      if (!jobId) {
        throw new Error("Scan job did not return a job ID");
      }

      // Stream events from SSE
      const evSource = new EventSource(`/api/scans/${jobId}/events`);
      let finished = false;

      const finishOnce = (data) => {
        if (finished) return;
        finished = true;
        try {
          evSource.close();
        } catch {}
        finishScan(jobId, data);
      };

      const handleStage = (data) => {
        if (data && data.stage) {
          setScanProgressText(`Stage: ${data.stage} · ${data.count || 0} findings / items`);
        }
      };

      const handleProgress = (planesData) => {
        if (planesData && typeof planesData === "object") {
          setPlaneStates((prev) => {
            const next = { ...prev };
            Object.keys(planesData).forEach((p) => {
              const info = planesData[p];
              if (info) {
                if (info.status === "ok" || info.status === "done" || (info.total && info.done >= info.total)) {
                  next[p] = "done";
                } else if (info.status === "failed") {
                  next[p] = "skip";
                } else if (info.done > 0 || info.status === "run") {
                  next[p] = "run";
                }
              }
            });
            return next;
          });
        }
      };

      evSource.addEventListener("stage", (event) => {
        try {
          const data = JSON.parse(event.data);
          handleStage(data);
        } catch {}
      });

      evSource.addEventListener("progress", (event) => {
        try {
          const data = JSON.parse(event.data);
          handleProgress(data);
        } catch {}
      });

      evSource.addEventListener("done", (event) => {
        try {
          const data = JSON.parse(event.data);
          finishOnce(data);
        } catch {
          finishOnce({});
        }
      });

      evSource.addEventListener("error", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.error) {
            evSource.close();
            setIsScanning(false);
            alert(`Scan error: ${data.error}`);
            setScanProgressText(`Scan error: ${data.error}`);
            return;
          }
        } catch {}
        checkJobStatus(jobId);
      });

      evSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.stage) handleStage(data);
          if (data.plane) {
            setPlaneStates((prev) => ({
              ...prev,
              [data.plane]: data.status === "completed" || data.status === "ok" ? "done" : "run",
            }));
          }
          if (data.stage === "done" || data.completed || data.finished || data.scan_id) {
            finishOnce(data);
          }
        } catch {}
      };

      evSource.onerror = () => {
        evSource.close();
        checkJobStatus(jobId);
      };
    } catch (err) {
      setIsScanning(false);
      alert(err.message || "Failed to start scan");
      setScanProgressText("7 available · TLS needs an authorised endpoint");
    }
  };

  const checkJobStatus = async (jobId) => {
    try {
      const res = await api.scanStatus(jobId);
      if (res.state === "error" || res.error) {
        setIsScanning(false);
        alert(res.error || "Scan job encountered an error");
        setScanProgressText("Scan failed");
        return;
      }
      if (res.state === "done" || res.completed || res.status === "completed" || res.status === "finished") {
        finishScan(jobId, res);
      } else {
        setTimeout(() => checkJobStatus(jobId), 500);
      }
    } catch {
      setIsScanning(false);
      setScanProgressText("7 available · TLS needs an authorised endpoint");
    }
  };

  const finishScan = async (jobId, data) => {
    setPlaneStates((prev) => {
      const allDone = { ...prev };
      selectedPlanes.forEach((p) => {
        allDone[p] = "done";
      });
      return allDone;
    });

    let finalData = data;
    try {
      const s = await api.scanStatus(jobId);
      if (s) finalData = s;
    } catch {
      // ignore
    }

    const files = finalData?.files_scanned ?? finalData?.files;
    const findings = finalData?.findings_count ?? finalData?.findings;
    const assets = finalData?.assets;
    const seconds = finalData?.seconds !== undefined ? Number(finalData.seconds).toFixed(3) : "";
    const scanId = finalData?.scan_id || finalData?.id || data?.scan_id || data?.id;

    if (files !== undefined && findings !== undefined) {
      setScanProgressText(`✓ ${files} files · ${findings} findings → ${assets || 0} assets · ${seconds} s`);
    } else {
      setScanProgressText("✓ Scan completed");
    }

    if (showToast) showToast("Scan completed successfully");

    setTimeout(() => {
      setIsScanning(false);
      if (onScanComplete) onScanComplete(scanId);
    }, 800);
  };

  const currentSourceInfo = SOURCES.find((s) => s.id === source);

  return (
    <section className="page on" id="p-scan">
      <div className="ph">
        <div>
          <h1>Cryptographic Discovery Scanner</h1>
          <p>Choose a source, describe the system, pick the scan planes.</p>
        </div>
      </div>

      {/* Sources Grid */}
      <div className="grid g4" style={{ marginBottom: "18px" }}>
        {SOURCES.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              className={`src ${source === s.id ? "on" : ""}`}
              onClick={() => !isScanning && setSource(s.id)}
            >
              <Icon size={24} style={{ color: "var(--cy)", margin: "0 auto" }} />
              <b>{s.label}</b>
              <span>{s.sub}</span>
            </div>
          );
        })}
      </div>

      {/* Application Details Card */}
      <div className="card">
        <div className="row" style={{ marginBottom: "12px", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0 }}>
            Application details <span className="rt">Used for Mosca shelf-life and criticality</span>
          </h3>
          <div className="row" style={{ gap: "14px", fontSize: "13px" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
              <input
                type="radio"
                name="projMode"
                checked={projectMode === "new"}
                onChange={() => setProjectMode("new")}
                disabled={isScanning}
              />
              New project
            </label>
            {existingProjects.length > 0 && (
              <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                <input
                  type="radio"
                  name="projMode"
                  checked={projectMode === "existing"}
                  onChange={() => {
                    setProjectMode("existing");
                    if (!selectedProjectId && existingProjects[0]) {
                      handleSelectExistingProject(existingProjects[0].id);
                    }
                  }}
                  disabled={isScanning}
                />
                Existing project
              </label>
            )}
          </div>
        </div>

        <div className="grid g4">
          <div>
            <label className="f">
              {projectMode === "existing" ? "Select Project" : "Project Name"}
            </label>
            {projectMode === "existing" ? (
              <select
                className="in"
                value={selectedProjectId}
                onChange={(e) => handleSelectExistingProject(e.target.value)}
                disabled={isScanning}
              >
                {existingProjects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="in"
                value={projectName}
                placeholder="e.g. Core Banking Gateway"
                onChange={(e) => setProjectName(e.target.value)}
                disabled={isScanning}
              />
            )}
          </div>
          <div>
            <label className="f">System type</label>
            <select
              className="in"
              value={systemType}
              onChange={(e) => setSystemType(e.target.value)}
              disabled={isScanning}
            >
              <option>Web service / API</option>
              <option>Mobile backend</option>
              <option>Firmware / HSM</option>
              <option>Library</option>
              <option>Batch processing</option>
            </select>
          </div>
          <div>
            <label className="f">Sector</label>
            <select
              className="in"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              disabled={isScanning}
            >
              <option>Government</option>
              <option>Banking &amp; finance</option>
              <option>Telecom</option>
              <option>Power &amp; energy</option>
              <option>Transport</option>
              <option>Healthcare</option>
              <option>Defence</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="f">Business criticality</label>
            <select
              className="in"
              value={criticality}
              onChange={(e) => setCriticality(Number(e.target.value))}
              disabled={isScanning}
            >
              <option value={3}>3 — High (customer-facing / critical)</option>
              <option value={2}>2 — Medium (internal operations)</option>
              <option value={1}>1 — Low (auxiliary)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Source Input Box */}
      <div className="card">
        {source === "folder" && (
          <div>
            <h3>Project folder</h3>
            <div className="row" style={{ gap: "8px" }}>
              <input
                className="in mono"
                value={folderPath}
                onChange={(e) => setFolderPath(e.target.value)}
                disabled={isScanning}
              />
              <button
                className="btn cy"
                disabled={isScanning}
                onClick={() => setShowBrowse(true)}
              >
                Browse
              </button>
            </div>
            <p style={{ fontSize: "12px", color: "var(--ok)", margin: "8px 0 0" }}>
              ✓ Runs fully offline — files never leave this machine.
            </p>
          </div>
        )}

        {source === "git" && (
          <div>
            <h3>Repository</h3>
            <div className="grid" style={{ gridTemplateColumns: "3fr 1fr", gap: "12px" }}>
              <div>
                <label className="f">Git URL</label>
                <input
                  className="in mono"
                  placeholder="https://github.com/org/repo.git"
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  disabled={isScanning}
                />
              </div>
              <div>
                <label className="f">Branch</label>
                <input
                  className="in mono"
                  value={gitBranch}
                  onChange={(e) => setGitBranch(e.target.value)}
                  disabled={isScanning}
                />
              </div>
            </div>
            <label style={{ display: "flex", gap: "8px", fontSize: "12.5px", marginTop: "10px", color: "var(--mut)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={gitAuthorized}
                onChange={(e) => setGitAuthorized(e.target.checked)}
                disabled={isScanning}
              />
              I am authorised to scan this repository
            </label>
          </div>
        )}

        {source === "zip" && (
          <div>
            <h3>Upload</h3>
            <div
              style={{
                border: "1.5px dashed #CBD5E1",
                borderRadius: "10px",
                padding: "26px",
                textAlign: "center",
                color: "var(--mut)",
                cursor: "pointer",
                background: uploadedFiles.length > 0 ? "rgba(14, 165, 201, 0.05)" : "#FAFBFC",
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const files = Array.from(e.dataTransfer.files);
                  setUploadedFiles(files);
                  if (files.length > 0 && (!projectName || projectName === "demo_target")) {
                    const cleanName = files[0].name.replace(/\.(zip|tar\.gz|tar|tgz|jar|war)$/i, "");
                    setProjectName(cleanName);
                  }
                }
              }}
              onClick={() => document.getElementById("zip-upload-input").click()}
            >
              <input
                type="file"
                id="zip-upload-input"
                style={{ display: "none" }}
                multiple
                accept=".zip,.tar,.tar.gz,.tgz,.bin,.jar,.war"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setUploadedFiles(files);
                  if (files.length > 0 && (!projectName || projectName === "demo_target")) {
                    const cleanName = files[0].name.replace(/\.(zip|tar\.gz|tar|tgz|jar|war)$/i, "");
                    setProjectName(cleanName);
                  }
                }}
              />
              <Upload size={24} style={{ color: "var(--cy)", margin: "0 auto 8px" }} />
              <b style={{ color: "var(--ink)", display: "block" }}>
                {uploadedFiles.length > 0
                  ? `Selected: ${uploadedFiles.map((f) => `${f.name} (${(f.size / 1024).toFixed(1)} KB)`).join(", ")}`
                  : "Click or drag a .zip or image .tar here"}
              </b>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Extracted safely into a temporary folder, then scanned with live progress streaming
              </div>
            </div>
          </div>
        )}

        {source === "tls" && (
          <div>
            <h3>TLS endpoint</h3>
            <div className="row">
              <input
                className="in mono"
                value={tlsEndpoint}
                onChange={(e) => setTlsEndpoint(e.target.value)}
                disabled={isScanning}
              />
            </div>
            <label style={{ display: "flex", gap: "8px", fontSize: "12.5px", marginTop: "10px", color: "var(--mut)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={tlsAuthorized}
                onChange={(e) => setTlsAuthorized(e.target.checked)}
                disabled={isScanning}
              />
              I am authorised to probe this endpoint
            </label>
          </div>
        )}
      </div>

      {/* Scan Planes Grid */}
      <div className="card">
        <h3>
          Scan planes <span className="rt">{scanProgressText}</span>
        </h3>
        <div className="grid g4">
          {PLANES_CONFIG.map((p) => {
            const isSel = selectedPlanes.has(p.id);
            const state = planeStates[p.id];
            let statusClass = isSel ? "sel" : "off";
            if (state === "run") statusClass = "run";
            else if (state === "done") statusClass = "done";

            return (
              <div
                key={p.id}
                className={`pl ${statusClass}`}
                onClick={() => togglePlane(p.id)}
              >
                <div className="c" />
                <div>
                  <b>{p.label}</b>
                  <span className="mono">{p.sub}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Big Action Button */}
      <button
        className="btn pri"
        disabled={isScanning}
        style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "14px" }}
        onClick={() => setShowConfirm(true)}
      >
        {isScanning ? (
          <>
            <span
              style={{
                width: "14px",
                height: "14px",
                border: "2px solid #fff",
                borderTopColor: "transparent",
                borderRadius: "50%",
                display: "inline-block",
                animation: "sp .8s linear infinite",
              }}
            />
            Running analysis…
          </>
        ) : (
          <>
            <Play size={16} fill="currentColor" />
            Run Cryptographic Scan
          </>
        )}
      </button>

      {/* Confirm Scan Modal */}
      {showConfirm && (
        <div className="modal">
          <div className="mc">
            <div className="row">
              <b style={{ fontSize: "16px" }}>Confirm scan</b>
              <button
                className="ib"
                style={{ marginLeft: "auto", color: "var(--mut)" }}
                onClick={() => setShowConfirm(false)}
              >
                ✕
              </button>
            </div>
            <p style={{ color: "var(--mut)", fontSize: "13px", margin: "6px 0 16px" }}>
              Check the project, source and planes before starting.
            </p>
            <table>
              <tbody>
                <tr>
                  <td style={{ color: "var(--mut)", width: "110px" }}>Project</td>
                  <td>
                    <b>{projectName || "Default project"}</b> ({systemType} · {sector})
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "var(--mut)" }}>Source</td>
                  <td>
                    <b>{currentSourceInfo?.label}</b>
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "var(--mut)" }}>Target</td>
                  <td className="mono">
                    {source === "folder"
                      ? folderPath
                      : source === "git"
                      ? gitUrl
                      : source === "tls"
                      ? tlsEndpoint
                      : uploadedFiles.map((f) => f.name).join(", ") || "Uploaded file"}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "var(--mut)" }}>Planes</td>
                  <td>{selectedPlanes.size} of 7 planes</td>
                </tr>
                <tr>
                  <td style={{ color: "var(--mut)" }}>Network</td>
                  <td>
                    {source === "tls"
                      ? "Outbound probe to target port only"
                      : "Offline — no data leaves this machine"}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="row" style={{ justifyContent: "flex-end", marginTop: "18px", gap: "8px" }}>
              <button className="btn" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
              <button className="btn pri" onClick={startScanJob}>
                Start scan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Browse Folder Modal */}
      <BrowseModal
        isOpen={showBrowse}
        initialPath={folderPath}
        onSelect={(p) => setFolderPath(p)}
        onClose={() => setShowBrowse(false)}
      />
    </section>
  );
}
