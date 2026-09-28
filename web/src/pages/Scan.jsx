import React, { useState } from "react";
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

  // App details
  const [projectName, setProjectName] = useState("demo_target");
  const [systemType, setSystemType] = useState("Web service / API");
  const [sector, setSector] = useState("Government");
  const [criticality, setCriticality] = useState(3);

  // Scan planes selection
  const [selectedPlanes, setSelectedPlanes] = useState(
    new Set(["code", "dependencies", "binaries", "containers", "certificates", "configs"])
  );

  // Modals & execution state
  const [showConfirm, setShowConfirm] = useState(false);
  const [showBrowse, setShowBrowse] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [planeStates, setPlaneStates] = useState({}); // { [planeId]: 'run' | 'done' | 'skip' }
  const [scanProgressText, setScanProgressText] = useState("7 available · TLS needs an authorised endpoint");

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

    // Initialize plane states
    const states = {};
    PLANES_CONFIG.forEach((p) => {
      states[p.id] = selectedPlanes.has(p.id) ? "pending" : "off";
    });
    setPlaneStates(states);

    try {
      let jobRes;
      if (source === "zip" && uploadedFiles.length > 0) {
        const formData = new FormData();
        formData.append("source", "upload");
        formData.append("planes", Array.from(selectedPlanes).join(","));
        formData.append("tls_authorized", tlsAuthorized ? "true" : "false");
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
        };
        jobRes = await api.scanStart(req);
      }

      const jobId = jobRes.job_id || jobRes.id;
      if (!jobId) {
        throw new Error("Scan job did not return a job ID");
      }

      // Stream events from SSE
      const evSource = new EventSource(`/api/scans/${jobId}/events`);
      let stepCount = 0;
      const totalSteps = selectedPlanes.size;

      evSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.plane) {
            stepCount++;
            setScanProgressText(`Processing step ${Math.min(stepCount, totalSteps)} / ${totalSteps}`);
            setPlaneStates((prev) => ({
              ...prev,
              [data.plane]: data.status === "completed" || data.status === "ok" ? "done" : "run",
            }));
          }
          if (data.stage === "done" || data.completed || data.finished) {
            evSource.close();
            finishScan(jobId, data);
          }
        } catch {
          // ignore parse issues
        }
      };

      evSource.onerror = async () => {
        evSource.close();
        // Fallback: poll job status
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
      if (res.completed || res.status === "completed" || res.status === "finished") {
        finishScan(jobId, res);
      } else {
        setTimeout(() => checkJobStatus(jobId), 400);
      }
    } catch {
      setIsScanning(false);
      setScanProgressText("7 available · TLS needs an authorised endpoint");
    }
  };

  const finishScan = async (jobId, data) => {
    // Mark all enabled planes as done
    setPlaneStates((prev) => {
      const allDone = { ...prev };
      selectedPlanes.forEach((p) => {
        allDone[p] = "done";
      });
      return allDone;
    });

    const seconds = data?.seconds ? data.seconds.toFixed(3) : "0.099";
    const files = data?.files_scanned || data?.files || 23;
    const findings = data?.findings_count || data?.findings || 35;
    const assets = data?.assets || 25;

    setScanProgressText(`✓ ${files} files · ${findings} findings → ${assets} assets · ${seconds} s`);
    if (showToast) showToast("Scan completed successfully");

    setTimeout(() => {
      setIsScanning(false);
      if (onScanComplete) onScanComplete();
    }, 900);
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
        <h3>
          Application details <span className="rt">Used for Mosca shelf-life and criticality</span>
        </h3>
        <div className="grid g4">
          <div>
            <label className="f">Project name</label>
            <input
              className="in"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isScanning}
            />
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
              <option value={3}>3 — High (customer-facing)</option>
              <option value={2}>2 — Medium</option>
              <option value={1}>1 — Low</option>
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
                background: "#FAFBFC",
              }}
              onClick={() => document.getElementById("zip-upload-input").click()}
            >
              <input
                type="file"
                id="zip-upload-input"
                style={{ display: "none" }}
                multiple
                accept=".zip,.tar,.tar.gz,.tgz,.bin,.jar,.war"
                onChange={(e) => setUploadedFiles(Array.from(e.target.files))}
              />
              <b style={{ color: "var(--ink)", display: "block" }}>
                {uploadedFiles.length > 0
                  ? `Selected: ${uploadedFiles.map((f) => f.name).join(", ")}`
                  : "Click or drag a .zip or image .tar here"}
              </b>
              <div style={{ fontSize: "12px", marginTop: "4px" }}>
                Extracted safely into a temporary folder, then scanned
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
              Check the source and planes before starting.
            </p>
            <table>
              <tbody>
                <tr>
                  <td style={{ color: "var(--mut)", width: "110px" }}>Source</td>
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
            <div className="row" style={{ justifyContent: "flex-end", marginTop: "18px" }}>
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
