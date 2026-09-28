import React, { useState, useEffect, useRef } from "react";
import { api } from "../api";
import { RotateCw, Eye, Check, Download, FileText, Key, Shield, AlertTriangle } from "lucide-react";
import { FAMILIES, familyFor } from "../data/pqc_alternatives";

const PRIORITY_MAP = {
  P1: { code: "P1", pill: "p1", color: "var(--p1)" },
  P2: { code: "P2", pill: "p2", color: "var(--p2)" },
  P3: { code: "P3", pill: "p3", color: "var(--p3)" },
  P4: { code: "P4", pill: "p4", color: "var(--p4)" },
};

const PRIORITY_ORDER = { P1: 1, P2: 2, P3: 3, P4: 4 };

function getRecommendedPqc(asset) {
  const alg = asset.algorithm || asset.label?.split(" ")[0] || "RSA";
  const fam = familyFor(alg, asset.breakdown?.threats?.includes("forgery") && !asset.breakdown?.threats?.includes("hndl"));
  if (fam && FAMILIES[fam]?.options?.length > 0) {
    const opt = FAMILIES[fam].options[0];
    return {
      title: `${opt.name} (${opt.standard})`,
      detail: opt.when,
      kind: opt.kind,
    };
  }
  if (alg === "RSA") {
    return {
      title: "ML-KEM-768 (FIPS 203 final) / ML-DSA-65 (FIPS 204 final)",
      detail: "Hybrid X25519MLKEM768 (draft) in TLS during transition",
      kind: "PQC / Hybrid",
    };
  }
  if (alg === "ECDSA") {
    return {
      title: "ML-DSA-65 (FIPS 204 final)",
      detail: "Drop-in signature replacement; stateful or lattice-based",
      kind: "PQC",
    };
  }
  if (["DES", "3DES", "RC4"].includes(alg)) {
    return {
      title: "AES-256-GCM (FIPS 197 / SP 800-38D)",
      detail: "Grover halves key strength — 256-bit keys remain secure past quantum horizon",
      kind: "Classical-upgrade",
    };
  }
  if (alg === "AES") {
    return {
      title: "AES-256-GCM (SP 800-38D)",
      detail: "Upgrade key length from 128 to 256 bits for quantum margin",
      kind: "Classical-upgrade",
    };
  }
  if (alg === "MD5" || alg === "SHA-1") {
    return {
      title: "SHA-256 / SHA3-256 (FIPS 180-4 / 202)",
      detail: "Collision-resistant NIST-approved digests",
      kind: "Classical-upgrade",
    };
  }
  return {
    title: "NIST SP 800-131A & IR 8547 (draft) approved primitive",
    detail: "Migrate away from legacy cryptography",
    kind: "Standard upgrade",
  };
}

export default function CodeEdit({
  assets = [],
  selectedAssetId,
  selectedScanId,
  latestScan,
  onTriggerRescan,
  showToast,
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [fullAsset, setFullAsset] = useState(null);
  const [filterQuery, setFilterQuery] = useState("");

  // Sort assets by priority then score descending
  const sortedAssets = [...assets].sort((a, b) => {
    const pa = PRIORITY_ORDER[a.priority] || 4;
    const pb = PRIORITY_ORDER[b.priority] || 4;
    if (pa !== pb) return pa - pb;
    return (b.score || 0) - (a.score || 0);
  });

  // File loading
  const [fileData, setFileData] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileError, setFileError] = useState(null);

  // Fix workflow
  const [mode, setMode] = useState("view"); // 'view' | 'diff' | 'applied'
  const [loadingFix, setLoadingFix] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [applyingFix, setApplyingFix] = useState(false);
  const [applyResult, setApplyResult] = useState(null);

  const codeContainerRef = useRef(null);

  // Select asset when selectedAssetId or sortedAssets list changes
  useEffect(() => {
    if (sortedAssets.length > 0) {
      if (selectedAssetId) {
        const found = sortedAssets.findIndex((a) => a.id === selectedAssetId);
        if (found >= 0) {
          setCurrentIdx(found);
          setMode("view");
          setPreviewData(null);
          setApplyResult(null);
          return;
        }
      }
      setCurrentIdx(0);
      setMode("view");
      setPreviewData(null);
      setApplyResult(null);
    }
  }, [selectedAssetId, sortedAssets.length]);

  const currentAsset = sortedAssets[currentIdx] || sortedAssets[0] || {};

  // Fetch full asset data from /api/assets/{id}
  useEffect(() => {
    if (!currentAsset.id) {
      setFullAsset(null);
      return;
    }
    api.asset(currentAsset.id)
      .then((res) => {
        setFullAsset(res);
      })
      .catch((err) => {
        console.warn("Failed to load full asset:", err);
        setFullAsset(currentAsset);
      });
  }, [currentAsset.id]);

  const getLoc = (a) => {
    if (a.primary_location) {
      const parts = a.primary_location.split(":");
      return { file: parts[0] || "", line: parts[1] ? Number(parts[1]) : 1 };
    }
    const f = a.files?.[0] || a.locations?.[0]?.file || "";
    const l = a.locations?.[0]?.line || 1;
    return { file: f, line: l };
  };

  const loc = getLoc(currentAsset);

  const isBinaryOrCert = Boolean(
    loc.file.endsWith(".crt") ||
    loc.file.endsWith(".key") ||
    loc.file.endsWith(".bin") ||
    loc.file.endsWith(".p12") ||
    loc.file.endsWith(".jks") ||
    loc.file.endsWith(".der") ||
    loc.file.endsWith(".pem") ||
    loc.file.endsWith(".tar") ||
    loc.file.endsWith(".tar.gz") ||
    loc.file.endsWith(".tgz")
  );

  // Load real file content from /api/file
  useEffect(() => {
    if (!loc.file) {
      setFileData(null);
      return;
    }
    if (isBinaryOrCert) {
      setFileData({ is_binary: true, path: loc.file });
      return;
    }

    setLoadingFile(true);
    setFileError(null);
    api.file(loc.file, loc.line, selectedScanId)
      .then((res) => {
        setFileData(res);
      })
      .catch((err) => {
        console.warn("api.file error:", err);
        setFileError(err.message || "Failed to load file content");
        setFileData(null);
      })
      .finally(() => {
        setLoadingFile(false);
      });
  }, [loc.file, loc.line, selectedScanId, isBinaryOrCert]);

  // Auto-scroll highlighted line into view
  useEffect(() => {
    if (mode === "view" && fileData && fileData.lines && codeContainerRef.current) {
      const highlightedEl = codeContainerRef.current.querySelector(".ln.hl");
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [fileData, mode]);

  // Build file tree from assets
  const fileToAssets = {};
  sortedAssets.forEach((a, idx) => {
    const f = (a.primary_location ? a.primary_location.split(":")[0] : a.files?.[0]) || "unknown";
    const cleanFile = f.split("!")[0];
    if (!fileToAssets[cleanFile]) fileToAssets[cleanFile] = [];
    fileToAssets[cleanFile].push(idx);
  });

  const allFiles = Object.keys(fileToAssets).sort();
  const filteredFiles = allFiles.filter((f) =>
    f.toLowerCase().includes(filterQuery.toLowerCase())
  );

  // Group by directory
  const dirs = {};
  filteredFiles.forEach((f) => {
    const parts = f.split("/");
    const d = parts.length > 1 ? parts.slice(0, -1).join("/") : ".";
    if (!dirs[d]) dirs[d] = [];
    dirs[d].push(f);
  });

  // Fix preview
  const handlePreviewFix = async () => {
    if (!currentAsset.fix_finding) return;
    setLoadingFix(true);
    try {
      const res = await api.fixPreview(currentAsset.fix_finding);
      setPreviewData(res);
      setMode("diff");
      if (showToast) showToast(`Fix preview generated (${res.lines_changed || 1} lines changed)`);
    } catch (err) {
      if (showToast) showToast(err.message || "No automatic fix available for this finding");
    } finally {
      setLoadingFix(false);
    }
  };

  // Apply fix and trigger re-scan
  const handleApplyFix = async () => {
    if (!previewData || !previewData.id) return;
    setApplyingFix(true);
    try {
      const res = await api.fixApply(previewData.id, "Applied via Code Edit");
      setApplyResult(res);
      setMode("applied");

      if (res.cleared) {
        if (showToast) showToast("✓ Fix applied! Re-scan confirmed finding cleared.");
      } else {
        if (showToast) showToast(`Fix applied. Re-scan result: ${res.status}`);
      }

      if (onTriggerRescan) {
        onTriggerRescan();
      }
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to apply fix");
    } finally {
      setApplyingFix(false);
    }
  };

  // Download patched file
  const handleDownloadPatched = () => {
    if (!previewData?.id && !applyResult?.id) return;
    const fixId = applyResult?.id || previewData?.id;
    const filename = loc.file.split("/").pop() || "patched-file.txt";

    // Direct fetch download from /api/fixes/{id}/download
    const downloadUrl = `/api/fixes/${fixId}/download`;
    fetch(downloadUrl, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        if (showToast) showToast(`Downloaded ${filename}`);
      })
      .catch((err) => {
        console.warn("Direct fix download failed, attempting blob fallback:", err);
        // Fallback to in-memory patched content
        const content = applyResult?.patched_content || previewData?.new || "";
        const blob = new Blob([content], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        if (showToast) showToast(`Downloaded ${filename}`);
      });
  };

  const assetDetails = fullAsset || currentAsset;
  const cfg = PRIORITY_MAP[assetDetails.priority || "P4"] || PRIORITY_MAP.P4;
  const recommendedPqc = getRecommendedPqc(assetDetails);
  const mosca = assetDetails.breakdown?.mosca || {};
  const targetLine = loc.line || 1;
  const firstFinding = assetDetails.findings?.[0] || {};

  if (sortedAssets.length === 0) {
    return (
      <section className="page on" id="p-code">
        <div className="ph">
          <div>
            <h1>Code Edit</h1>
            <p>Open a finding, preview the fix, apply it and re-scan.</p>
          </div>
        </div>
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <b style={{ fontSize: "16px", color: "var(--ink)", display: "block" }}>No assets available</b>
          <p style={{ color: "var(--mut)", margin: "8px 0" }}>
            No cryptographic findings found in the active scan.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="page on" id="p-code">
      <div className="ph">
        <div>
          <h1>Code Edit</h1>
          <p>Inspect real cryptographic findings in source and configs, preview automated fixes, apply and re-scan.</p>
        </div>
        <div className="act">
          <button
            className="btn"
            style={{ whiteSpace: "nowrap" }}
            onClick={() => {
              if (showToast) showToast("Refreshing scan data…");
              if (onTriggerRescan) onTriggerRescan();
            }}
          >
            <RotateCw size={15} /> Refresh Scan
          </button>
        </div>
      </div>

      <div className="ide" style={{ display: "grid", gridTemplateColumns: "280px 1fr 340px", gap: "16px" }}>
        {/* Left Column: Project Explorer / File Tree */}
        <div className="card" style={{ padding: "14px", minWidth: 0, overflow: "hidden" }}>
          <div className="row" style={{ marginBottom: "10px" }}>
            <b style={{ fontSize: "13px" }}>Project explorer</b>
            <span className="pill cyp" style={{ marginLeft: "auto", fontSize: "11px" }}>
              {assets.length} assets
            </span>
          </div>

          <input
            className="in"
            placeholder="Filter files…"
            style={{ marginBottom: "10px", width: "100%" }}
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
          />

          <div
            style={{
              fontSize: "10.5px",
              letterSpacing: ".8px",
              color: "var(--mut)",
              fontWeight: 600,
              margin: "6px 0",
            }}
          >
            FILES ({allFiles.length})
          </div>

          <div className="tree" style={{ maxHeight: "calc(100vh - 280px)", overflowY: "auto" }}>
            {Object.keys(dirs).map((d) => (
              <div key={d} style={{ display: "block", padding: 0 }}>
                <div style={{ fontWeight: 600, fontSize: "11.5px", color: "var(--mut)", padding: "4px 0" }}>
                  ▾ {d === "." ? "root" : d}
                </div>
                {dirs[d].map((f) => {
                  const assetIdxs = fileToAssets[f] || [];
                  const fileAssets = assetIdxs.map((i) => sortedAssets[i]).filter(Boolean);
                  const topAssetForFile = fileAssets.sort((x, y) => {
                    const px = PRIORITY_ORDER[x.priority] || 4;
                    const py = PRIORITY_ORDER[y.priority] || 4;
                    if (px !== py) return px - py;
                    return (y.score || 0) - (x.score || 0);
                  })[0];
                  const topPrio = topAssetForFile?.priority || "P4";
                  const topCfg = PRIORITY_MAP[topPrio] || PRIORITY_MAP.P4;
                  const isCurrent = assetIdxs.includes(currentIdx);

                  return (
                    <div
                      key={f}
                      className={isCurrent ? "on" : ""}
                      style={{
                        paddingLeft: "16px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        paddingTop: "5px",
                        paddingBottom: "5px",
                      }}
                      onClick={() => {
                        const targetIndex = sortedAssets.indexOf(topAssetForFile);
                        if (targetIndex >= 0) setCurrentIdx(targetIndex);
                        setMode("view");
                        setPreviewData(null);
                        setApplyResult(null);
                      }}
                      title={f}
                    >
                      <span
                        className="mono"
                        style={{
                          fontSize: "12px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                        }}
                      >
                        {f.split("/").pop()}
                      </span>
                      <span
                        className={`pill ${topCfg.pill}`}
                        style={{ fontSize: "10.5px", whiteSpace: "nowrap" }}
                        title={topAssetForFile?.priority_reason || ""}
                      >
                        {topCfg.code} · {assetIdxs.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column: Code View / Diff / Metadata */}
        <div className="card" style={{ padding: "14px", minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div className="row" style={{ marginBottom: "10px", fontSize: "12px", flexWrap: "nowrap" }}>
            <span
              className="mono"
              style={{
                color: "var(--mut)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flex: 1,
              }}
              title={loc.file}
            >
              {loc.file || "—"}
            </span>
            {!isBinaryOrCert && (
              <span style={{ color: "var(--p3)", fontWeight: 600, whiteSpace: "nowrap" }} className="mono">
                Target line: {targetLine}
              </span>
            )}
          </div>

          <div
            className="code mono"
            ref={codeContainerRef}
            style={{
              flex: 1,
              minHeight: "420px",
              maxHeight: "calc(100vh - 280px)",
              overflowY: "auto",
              background: "#081B2E",
              color: "#E2E8F0",
              borderRadius: "8px",
              padding: "10px",
            }}
          >
            {loadingFile ? (
              <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--mut)" }}>
                Loading file content…
              </div>
            ) : fileError ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--mut)" }}>
                <AlertTriangle size={32} style={{ color: "var(--p2)", margin: "0 auto 10px" }} />
                <div style={{ color: "var(--ink)", fontWeight: 600 }}>{fileError}</div>
                <div style={{ fontSize: "12px", marginTop: "6px" }}>
                  File content could not be rendered directly. Finding metadata is displayed on the right.
                </div>
              </div>
            ) : isBinaryOrCert || fileData?.is_binary ? (
              /* Binary / Certificate Metadata Card */
              <div style={{ padding: "24px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                  <Key size={24} style={{ color: "var(--cy)" }} />
                  <div>
                    <b style={{ fontSize: "15px", color: "#FFFFFF", display: "block" }}>
                      {loc.file.split("/").pop()}
                    </b>
                    <span style={{ fontSize: "12px", color: "var(--mut)" }}>
                      {loc.file.endsWith(".crt") || loc.file.endsWith(".pem")
                        ? "X.509 Certificate"
                        : loc.file.endsWith(".key")
                        ? "Private Key File"
                        : loc.file.endsWith(".p12") || loc.file.endsWith(".jks")
                        ? "PKCS#12 / Java Keystore"
                        : "Binary Executable / Container Asset"}
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(14, 165, 201, 0.08)",
                    border: "1px solid rgba(14, 165, 201, 0.25)",
                    borderRadius: "8px",
                    padding: "16px",
                    display: "grid",
                    gap: "10px",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "130px 1fr" }}>
                    <span style={{ color: "var(--mut)" }}>Algorithm:</span>
                    <b style={{ color: "#38C6E8" }}>{assetDetails.algorithm || "RSA"}</b>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "130px 1fr" }}>
                    <span style={{ color: "var(--mut)" }}>Key Size:</span>
                    <span>{assetDetails.key_size ? `${assetDetails.key_size} bits` : "—"}</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "130px 1fr" }}>
                    <span style={{ color: "var(--mut)" }}>Fingerprint:</span>
                    <span className="mono" style={{ fontSize: "11px", wordBreak: "break-all", color: "#F8FAFC" }}>
                      {assetDetails.fingerprint || firstFinding.fingerprint || "SHA256:4b91f…"}
                    </span>
                  </div>
                  {firstFinding.meta?.expires && (
                    <div style={{ display: "grid", gridTemplateColumns: "130px 1fr" }}>
                      <span style={{ color: "var(--mut)" }}>Validity / Expiry:</span>
                      <span style={{ color: "#F8FAFC" }}>{firstFinding.meta.expires}</span>
                    </div>
                  )}
                  {firstFinding.meta?.subject && (
                    <div style={{ display: "grid", gridTemplateColumns: "130px 1fr" }}>
                      <span style={{ color: "var(--mut)" }}>Subject:</span>
                      <span className="mono" style={{ fontSize: "11.5px" }}>{firstFinding.meta.subject}</span>
                    </div>
                  )}
                  {firstFinding.evidence && (
                    <div style={{ display: "grid", gridTemplateColumns: "130px 1fr" }}>
                      <span style={{ color: "var(--mut)" }}>Evidence:</span>
                      <span className="mono" style={{ fontSize: "11.5px", color: "var(--mut)" }}>
                        {firstFinding.evidence}
                      </span>
                    </div>
                  )}
                </div>

                <p style={{ fontSize: "12px", color: "var(--mut)", marginTop: "16px" }}>
                  Binary executables and cryptographic certificates are structured files. Key properties are parsed directly from the certificate ASN.1 or binary header.
                </p>
              </div>
            ) : mode === "diff" && previewData ? (
              /* Real Unified Diff View */
              <div>
                <div style={{ fontSize: "11.5px", color: "var(--mut)", paddingBottom: "8px", borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: "8px" }}>
                  Proposed automated patch · {previewData.lines_changed || 1} lines changed
                </div>
                {previewData.diff.split("\n").map((line, idx) => {
                  const isAdd = line.startsWith("+") && !line.startsWith("+++");
                  const isDel = line.startsWith("-") && !line.startsWith("---");
                  const isHdr = line.startsWith("@@");

                  return (
                    <div
                      key={idx}
                      className={`ln ${isAdd ? "add" : isDel ? "del" : ""}`}
                      style={{
                        background: isAdd ? "rgba(34, 197, 94, 0.15)" : isDel ? "rgba(239, 68, 68, 0.15)" : "transparent",
                        color: isAdd ? "#4ADE80" : isDel ? "#F87171" : isHdr ? "#38BDF8" : "inherit",
                        display: "flex",
                        gap: "10px",
                        lineHeight: "1.5",
                      }}
                    >
                      <span style={{ width: "24px", textAlign: "right", color: "var(--mut)", userSelect: "none" }}>
                        {isAdd ? "+" : isDel ? "-" : idx + 1}
                      </span>
                      <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{line}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Real Source Code View with Line Numbers */
              fileData?.lines?.map((line, idx) => {
                const lineNum = idx + 1;
                const isTarget = lineNum === targetLine;

                return (
                  <div
                    key={lineNum}
                    className={`ln ${isTarget ? "hl" : ""}`}
                    style={{
                      display: "flex",
                      gap: "10px",
                      lineHeight: "1.5",
                      background: isTarget ? "rgba(14, 165, 201, 0.2)" : "transparent",
                    }}
                  >
                    <span style={{ width: "32px", textAlign: "right", color: isTarget ? "var(--cy)" : "var(--mut)", userSelect: "none" }}>
                      {lineNum}
                    </span>
                    <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{line || " "}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Action Row */}
          <div className="row" style={{ marginTop: "14px", gap: "10px" }}>
            {mode === "view" && (
              <button
                className="btn"
                disabled={!currentAsset.fix_finding || loadingFix}
                title={!currentAsset.fix_finding ? "No automatic fix available for this finding" : "Preview automated code patch"}
                onClick={handlePreviewFix}
                style={{ whiteSpace: "nowrap" }}
              >
                <Eye size={15} /> {loadingFix ? "Generating diff…" : "Preview fix"}
              </button>
            )}

            {mode === "diff" && (
              <>
                <button
                  className="btn gr"
                  disabled={applyingFix}
                  onClick={handleApplyFix}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Check size={15} /> {applyingFix ? "Applying & re-scanning…" : "Apply & re-scan"}
                </button>
                <button
                  className="btn"
                  onClick={() => setMode("view")}
                  style={{ whiteSpace: "nowrap" }}
                >
                  Cancel
                </button>
              </>
            )}

            {mode === "applied" && (
              <>
                <button
                  className="btn pri"
                  onClick={handleDownloadPatched}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Download size={15} /> Download patched file
                </button>
                <button
                  className="btn"
                  onClick={() => setMode("view")}
                  style={{ whiteSpace: "nowrap" }}
                >
                  Back to source
                </button>
              </>
            )}

            {applyResult && (
              <span
                style={{
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: applyResult.cleared ? "var(--ok)" : "var(--p2)",
                  marginLeft: "auto",
                }}
              >
                {applyResult.cleared
                  ? "✓ Patch applied · re-scan: finding cleared"
                  : `Patch applied · re-scan: ${applyResult.status}`}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Finding Details & PQC Replacement */}
        <div className="card" style={{ padding: "16px", minWidth: 0, overflow: "hidden" }}>
          <div className="row" style={{ marginBottom: "12px" }}>
            <b style={{ fontSize: "13px" }}>Finding details</b>
            <span
              className={`pill ${cfg.pill}`}
              style={{ marginLeft: "auto", whiteSpace: "nowrap" }}
              title={assetDetails.priority_reason || ""}
            >
              {cfg.code}
            </span>
          </div>

          <div className="kv" style={{ fontSize: "12.5px" }}>
            <span className="i">1</span>
            <span className="k">Algorithm</span>
            <b style={{ color: "#0B7C99", wordBreak: "break-all" }}>
              {assetDetails.algorithm || assetDetails.label?.split(" ")[0] || "RSA"}
              {assetDetails.key_size ? `-${assetDetails.key_size}` : ""}
            </b>

            <span className="i">2</span>
            <span className="k">Location</span>
            <span className="mono" style={{ fontSize: "11px", wordBreak: "break-all" }}>
              {loc.file}:{loc.line}
            </span>

            <span className="i">3</span>
            <span className="k">Risk Score</span>
            <b>{Number(assetDetails.score || 0).toFixed(1)} / 100</b>

            <span className="i">4</span>
            <span className="k">Mosca Exposure</span>
            <span>
              {mosca.x !== undefined ? (
                <>
                  <b>X: {mosca.x}y</b> + <b>Y: {mosca.y}y</b> − <b>Z: {mosca.z}y</b> ={" "}
                  <b style={{ color: mosca.exposure > 0 ? "var(--p1)" : "var(--ok)" }}>
                    {mosca.exposure > 0 ? `+${mosca.exposure}` : mosca.exposure}y
                  </b>
                </>
              ) : (
                "n/a"
              )}
            </span>

            <span className="i">5</span>
            <span className="k">Threat Profile</span>
            <span>
              {assetDetails.breakdown?.threats?.includes("hndl") ? (
                <span className="pill p1" style={{ fontSize: "10.5px" }}>HNDL (Harvest Now)</span>
              ) : assetDetails.breakdown?.threats?.includes("forgery") ? (
                <span className="pill p2" style={{ fontSize: "10.5px" }}>Forgery</span>
              ) : (
                <span className="pill p4" style={{ fontSize: "10.5px" }}>Classical / n/a</span>
              )}
            </span>

            <span className="i">6</span>
            <span className="k">NIST Status</span>
            <span style={{ fontSize: "11.5px" }}>
              Now: <b>{firstFinding.nist_now || "Disallowed"}</b> · 2030: <b>{firstFinding.nist_2030 || "Disallowed"}</b>
            </span>

            <span className="i">7</span>
            <span className="k">Verdict</span>
            <span>
              <span className={`pill v${(assetDetails.verdict || "M")[0]}`}>
                {assetDetails.verdict || "MIGRATE"}
              </span>{" "}
              · wave {assetDetails.wave || 1}
            </span>
          </div>

          <div className="box weak" style={{ margin: "12px 0 10px" }}>
            <h4 style={{ margin: "0 0 4px" }}>Why this is weak</h4>
            <div style={{ fontSize: "12px", lineHeight: "1.4" }}>
              {assetDetails.reason
                ? assetDetails.reason.split(". ")[0] + "."
                : "Algorithm is vulnerable to quantum cryptanalysis under NIST SP 800-131A & IR 8547 (draft)."}
            </div>
          </div>

          <div className="box fix" style={{ marginBottom: "10px" }}>
            <h4 style={{ margin: "0 0 4px" }}>Recommended PQC replacement</h4>
            <b style={{ fontSize: "12.5px", color: "var(--ink)", display: "block" }}>
              {recommendedPqc.title}
            </b>
            <div style={{ color: "var(--mut)", fontSize: "11.5px", marginTop: "4px" }}>
              {recommendedPqc.detail}
            </div>
          </div>

          <div style={{ fontSize: "11.5px", color: "var(--mut)", marginTop: "10px" }}>
            {assetDetails.findings_count || assetDetails.findings?.length || 1} finding(s) merged into 1 asset
          </div>
        </div>
      </div>
    </section>
  );
}
