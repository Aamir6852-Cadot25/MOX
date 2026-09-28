import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Folder, GitBranch, Upload, Shield, Play } from "lucide-react";

const SOURCES = [
  { id: "folder", label: "Upload folder", sub: "Folder from your computer", icon: Folder },
  { id: "zip", label: "Upload files / ZIP / container", sub: "Source, certs, archives, images", icon: Upload },
  { id: "git", label: "Git repository", sub: "Public HTTPS URL clone", icon: GitBranch },
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

  // Folder Upload State
  const [folderFiles, setFolderFiles] = useState([]);
  const [folderName, setFolderName] = useState("");

  // Files / Archive Upload State
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Git State
  const [gitUrl, setGitUrl] = useState("");
  const [gitBranch, setGitBranch] = useState("main");
  const [gitAuthorized, setGitAuthorized] = useState(false);

  // TLS State
  const [tlsEndpoint, setTlsEndpoint] = useState("");
  const [tlsAuthorized, setTlsAuthorized] = useState(false);

  // Project Info
  const [existingProjects, setExistingProjects] = useState([]);
  const [projectMode, setProjectMode] = useState("new");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [systemType, setSystemType] = useState("Web service / API");
  const [sector, setSector] = useState("Government");
  const [criticality, setCriticality] = useState(3);
  const [shelfLifeYears, setShelfLifeYears] = useState(5);

  // Planes
  const [selectedPlanes, setSelectedPlanes] = useState(
    new Set(["code", "dependencies", "binaries", "containers", "certificates", "configs"])
  );

  // Execution State
  const [showConfirm, setShowConfirm] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [planeStates, setPlaneStates] = useState({});
  const [scanProgressText, setScanProgressText] = useState("7 available · TLS needs an authorised endpoint");

  useEffect(() => {
    api.projects().then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        setExistingProjects(res);
      }
    }).catch((err) => {
      console.warn("Failed to load existing projects:", err);
    });
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

  const handleFolderChange = (e) => {
    const rawFiles = Array.from(e.target.files || []);
    if (rawFiles.length === 0) return;

    const filtered = [];
    let totalSize = 0;
    let skipped = 0;
    let oversized = 0;

    for (const f of rawFiles) {
      const rel = f.webkitRelativePath || f.name;
      const parts = rel.split(/[\\/]/);
      if (parts.some((p) => [".git", "node_modules", ".venv", "venv", "__pycache__", ".pytest_cache", "dist"].includes(p))) {
        skipped++;
        continue;
      }
      if (f.size > 20 * 1024 * 1024) {
        oversized++;
        continue;
      }
      totalSize += f.size;
      filtered.push(f);
    }

    if (totalSize > 100 * 1024 * 1024) {
      if (showToast) showToast("Total folder size exceeds 100 MB limit");
      return;
    }

    if (filtered.length === 0) {
      if (showToast) showToast("0 valid files found (all were skipped or >20 MB)");
      return;
    }

    setFolderFiles(filtered);
    const rootName = rawFiles[0].webkitRelativePath?.split(/[\\/]/)[0] || "project";
    setFolderName(rootName);
    if (!projectName || projectName === "demo_target" || projectName === "") {
      setProjectName(rootName);
    }
    if (showToast) {
      showToast(`Selected "${rootName}": ${filtered.length} files (${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
    }
  };

  const handleFilesChange = (filesList) => {
    const raw = Array.from(filesList || []);
    if (raw.length === 0) return;

    const filtered = [];
    let totalSize = 0;

    for (const f of raw) {
      if (f.size > 20 * 1024 * 1024) {
        if (showToast) showToast(`File ${f.name} exceeds 20 MB limit (skipped)`);
        continue;
      }
      totalSize += f.size;
      filtered.push(f);
    }

    if (totalSize > 100 * 1024 * 1024) {
      if (showToast) showToast("Total upload exceeds 100 MB limit");
      return;
    }

    if (filtered.length === 0) {
      if (showToast) showToast("No valid files to upload");
      return;
    }

    setUploadedFiles(filtered);
    if (!projectName || projectName === "demo_target" || projectName === "") {
      const cleanName = filtered[0].name.replace(/\.[^/.]+$/, "");
      setProjectName(cleanName);
    }
    if (showToast) {
      showToast(`Selected ${filtered.length} file(s) for upload`);
    }
  };

  const validateBeforeStart = () => {
    if (source === "folder" && folderFiles.length === 0) {
      if (showToast) showToast("Please select a folder to upload first");
      return false;
    }
    if (source === "zip" && uploadedFiles.length === 0) {
      if (showToast) showToast("Please select files or an archive to upload first");
      return false;
    }
    if (source === "git") {
      if (!gitUrl.trim()) {
        if (showToast) showToast("Please enter a public HTTPS Git repository URL");
        return false;
      }
      if (!gitAuthorized) {
        if (showToast) showToast("Please check 'I am authorised to scan this repository'");
        return false;
      }
    }
    if (source === "tls") {
      if (!tlsEndpoint.trim()) {
        if (showToast) showToast("Please enter a TLS endpoint (host:port)");
        return false;
      }
      if (!tlsAuthorized) {
        if (showToast) showToast("Please check 'I am authorised to probe this endpoint'");
        return false;
      }
    }
    return true;
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

      if (source === "folder") {
        const formData = new FormData();
        formData.append("source", "folder");
        formData.append("planes", Array.from(selectedPlanes).join(","));
        formData.append("tls_authorized", tlsAuthorized ? "true" : "false");
        if (projId) formData.append("project_id", String(projId));
        if (projName) formData.append("project_name", projName);
        formData.append("sector", sector);
        formData.append("system_type", systemType);
        formData.append("criticality", String(criticality));
        formData.append("shelf_life_years", String(shelfLifeYears));
        for (const file of folderFiles) {
          formData.append("files", file, file.webkitRelativePath || file.name);
        }
        jobRes = await api.scanUpload(formData);
      } else if (source === "zip") {
        const formData = new FormData();
        formData.append("source", "upload");
        formData.append("planes", Array.from(selectedPlanes).join(","));
        formData.append("tls_authorized", tlsAuthorized ? "true" : "false");
        if (projId) formData.append("project_id", String(projId));
        if (projName) formData.append("project_name", projName);
        formData.append("sector", sector);
        formData.append("system_type", systemType);
        formData.append("criticality", String(criticality));
        formData.append("shelf_life_years", String(shelfLifeYears));
        for (const file of uploadedFiles) {
          formData.append("files", file, file.name);
        }
        jobRes = await api.scanUpload(formData);
      } else {
        const req = {
          source: source === "tls" ? "tls" : "git",
          path: "",
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
        throw new Error("Scan job did not return a valid job ID");
      }

      // Stream events from SSE
      const evSource = new EventSource(`/api/scans/${jobId}/events`);
      let finished = false;

      const finishOnce = (data) => {
        if (finished) return;
        finished = true;
        try {
          evSource.close();
        } catch (e) {
          console.warn("EventSource close error:", e);
        }
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
        } catch (e) {
          console.warn("Error parsing stage event:", e);
        }
      });

      evSource.addEventListener("progress", (event) => {
        try {
          const data = JSON.parse(event.data);
          handleProgress(data);
        } catch (e) {
          console.warn("Error parsing progress event:", e);
        }
      });

      evSource.addEventListener("done", (event) => {
        try {
          const data = JSON.parse(event.data);
          finishOnce(data);
        } catch (e) {
          console.warn("Error parsing done event:", e);
          finishOnce({});
        }
      });

      evSource.addEventListener("error", (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.error) {
            evSource.close();
            setIsScanning(false);
            if (showToast) showToast(`Scan error: ${data.error}`);
            setScanProgressText(`Scan error: ${data.error}`);
            return;
          }
        } catch (e) {
          console.warn("Error parsing error event:", e);
        }
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
        } catch (e) {
          console.warn("Error parsing message event:", e);
        }
      };

      evSource.onerror = () => {
        evSource.close();
        checkJobStatus(jobId);
      };
    } catch (err) {
      setIsScanning(false);
      if (showToast) showToast(err.message || "Failed to start scan");
      setScanProgressText("Scan preparation failed");
    }
  };

  const checkJobStatus = async (jobId) => {
    try {
      const res = await api.scanStatus(jobId);
      if (res.state === "error" || res.error) {
        setIsScanning(false);
        if (showToast) showToast(res.error || "Scan job encountered an error");
        setScanProgressText("Scan failed");
        return;
      }
      if (res.state === "done" || res.completed || res.status === "completed" || res.status === "finished") {
        finishScan(jobId, res);
      } else {
        setTimeout(() => checkJobStatus(jobId), 500);
      }
    } catch (e) {
      console.warn("checkJobStatus error:", e);
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
    } catch (e) {
      console.warn("Failed to fetch final scan status:", e);
    }

    const files = finalData?.result?.files_scanned ?? finalData?.files_scanned ?? finalData?.files;
    const findings = finalData?.result?.findings ?? finalData?.findings_count ?? finalData?.findings;
    const assets = finalData?.result?.assets ?? finalData?.assets;
    const seconds = finalData?.result?.seconds ?? finalData?.seconds;
    const scanId = finalData?.result?.scan_id || finalData?.scan_id || finalData?.id || data?.scan_id || data?.id;

    if (files === 0) {
      setIsScanning(false);
      setScanProgressText("Warning: 0 files scanned (no supported files found)");
      if (showToast) showToast("Warning: 0 files scanned — no supported cryptographic files found");
      return;
    }

    if (files !== undefined && findings !== undefined) {
      const secStr = seconds !== undefined ? `${Number(seconds).toFixed(3)} s` : "";
      setScanProgressText(`✓ ${files} files · ${findings} findings → ${assets || 0} assets · ${secStr}`);
    } else {
      setScanProgressText("✓ Scan completed");
    }

    if (showToast) showToast(`Scan completed: ${files} files scanned (${findings || 0} findings)`);

    setTimeout(() => {
      setIsScanning(false);
      if (onScanComplete && scanId) onScanComplete(scanId);
    }, 700);
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
            <h3>Upload folder</h3>
            <p style={{ color: "var(--mut)", fontSize: "13px", margin: "4px 0 14px" }}>
              Select any local codebase or folder from your computer. The browser OS file explorer will open.
            </p>
            <div
              style={{
                border: "1.5px dashed #CBD5E1",
                borderRadius: "10px",
                padding: "26px",
                textAlign: "center",
                color: "var(--mut)",
                cursor: "pointer",
                background: folderFiles.length > 0 ? "rgba(14, 165, 201, 0.05)" : "#FAFBFC",
              }}
              onClick={() => document.getElementById("folder-upload-input").click()}
            >
              <input
                type="file"
                id="folder-upload-input"
                style={{ display: "none" }}
                webkitdirectory=""
                mozdirectory=""
                directory=""
                multiple
                onChange={handleFolderChange}
              />
              <Folder size={32} style={{ color: "var(--cy)", margin: "0 auto 8px" }} />
              <b style={{ color: "var(--ink)", display: "block", fontSize: "14px" }}>
                {folderFiles.length > 0
                  ? `Selected folder: ${folderName} (${folderFiles.length} files, ${(folderFiles.reduce((acc, f) => acc + f.size, 0) / 1024 / 1024).toFixed(2)} MB)`
                  : "Click to open file explorer and select folder"}
              </b>
              <div style={{ fontSize: "12px", marginTop: "6px" }}>
                All code, configs, certs and dependencies will be processed across all 7 scan planes.
              </div>
            </div>
            {folderFiles.length > 0 && (
              <div className="row" style={{ marginTop: "12px" }}>
                <span className="pill cyp">✓ Ready to scan {folderFiles.length} files</span>
                <button
                  className="btn"
                  style={{ marginLeft: "auto" }}
                  onClick={() => document.getElementById("folder-upload-input").click()}
                >
                  Choose different folder
                </button>
              </div>
            )}
          </div>
        )}

        {source === "zip" && (
          <div>
            <h3>Upload files / ZIP / container</h3>
            <p style={{ color: "var(--mut)", fontSize: "13px", margin: "4px 0 14px" }}>
              Upload individual source files, certificates (.pem, .crt, .key), container images (.tar), or ZIP archives.
            </p>
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
                  handleFilesChange(e.dataTransfer.files);
                }
              }}
              onClick={() => document.getElementById("zip-upload-input").click()}
            >
              <input
                type="file"
                id="zip-upload-input"
                style={{ display: "none" }}
                multiple
                onChange={(e) => handleFilesChange(e.target.files)}
              />
              <Upload size={32} style={{ color: "var(--cy)", margin: "0 auto 8px" }} />
              <b style={{ color: "var(--ink)", display: "block", fontSize: "14px" }}>
                {uploadedFiles.length > 0
                  ? `Selected: ${uploadedFiles.map((f) => f.name).join(", ")}`
                  : "Click or drag files, archives (.zip, .tar.gz) or container image (.tar) here"}
              </b>
              <div style={{ fontSize: "12px", marginTop: "6px" }}>
                Accepts binaries, keys, certificates, source code and configs (up to 100 MB).
              </div>
            </div>
            {uploadedFiles.length > 0 && (
              <div className="row" style={{ marginTop: "12px" }}>
                <span className="pill cyp">✓ {uploadedFiles.length} file(s) selected</span>
                <button
                  className="btn"
                  style={{ marginLeft: "auto" }}
                  onClick={() => document.getElementById("zip-upload-input").click()}
                >
                  Choose more files
                </button>
              </div>
            )}
          </div>
        )}

        {source === "git" && (
          <div>
            <h3>Git repository</h3>
            <p style={{ color: "var(--mut)", fontSize: "13px", margin: "4px 0 14px" }}>
              Clone and scan any public HTTPS repository.
            </p>
            <div className="grid" style={{ gridTemplateColumns: "3fr 1fr", gap: "12px" }}>
              <div>
                <label className="f">Git repository URL (HTTPS)</label>
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
            <label style={{ display: "flex", gap: "8px", fontSize: "12.5px", marginTop: "12px", color: "var(--mut)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={gitAuthorized}
                onChange={(e) => setGitAuthorized(e.target.checked)}
                disabled={isScanning}
              />
              I am authorised to clone and scan this repository
            </label>
          </div>
        )}

        {source === "tls" && (
          <div>
            <h3>TLS endpoint</h3>
            <p style={{ color: "var(--mut)", fontSize: "13px", margin: "4px 0 14px" }}>
              Public host:port only. Private or loopback IP ranges are restricted on this hosted prototype.
            </p>
            <div className="row">
              <input
                className="in mono"
                placeholder="example.com:443"
                value={tlsEndpoint}
                onChange={(e) => setTlsEndpoint(e.target.value)}
                disabled={isScanning}
              />
            </div>
            <label style={{ display: "flex", gap: "8px", fontSize: "12.5px", marginTop: "12px", color: "var(--mut)", cursor: "pointer" }}>
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

      {/* Action Button */}
      <button
        className="btn pri"
        disabled={isScanning}
        style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "14px", whiteSpace: "nowrap" }}
        onClick={() => {
          if (validateBeforeStart()) {
            setShowConfirm(true);
          }
        }}
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
            Running cryptographic scan…
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
              Verify target and configuration before launching analysis.
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
                      ? `${folderName} (${folderFiles.length} files)`
                      : source === "git"
                      ? gitUrl
                      : source === "tls"
                      ? tlsEndpoint
                      : uploadedFiles.map((f) => f.name).join(", ") || "Uploaded file(s)"}
                  </td>
                </tr>
                <tr>
                  <td style={{ color: "var(--mut)" }}>Planes</td>
                  <td>{selectedPlanes.size} of 7 planes enabled</td>
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
    </section>
  );
}
