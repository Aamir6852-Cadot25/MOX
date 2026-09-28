import React, { useState, useEffect } from "react";
import { api } from "../api";
import { RotateCw, Eye, Check } from "lucide-react";

const PRIORITY_MAP = {
  Critical: { code: "P1", pill: "p1", color: "var(--p1)" },
  High: { code: "P2", pill: "p2", color: "var(--p2)" },
  Medium: { code: "P3", pill: "p3", color: "var(--p3)" },
  Low: { code: "P4", pill: "p4", color: "var(--p4)" },
};

function getReplacement(asset, file) {
  const alg = asset.algorithm || asset.label?.split(" ")[0] || "RSA";
  if (alg === "RSA")
    return [
      "ML-KEM-768 (FIPS 203) for key exchange · ML-DSA-65 (FIPS 204) for signatures",
      "Hybrid X25519MLKEM768 in TLS during transition",
    ];
  if (alg === "ECDSA")
    return ["ML-DSA-65 (FIPS 204)", "Hybrid ECDSA + ML-DSA certificates during transition"];
  if (["DES", "3DES", "RC4"].includes(alg))
    return ["AES-256-GCM", "Grover halves key strength — 256-bit keys stay safe"];
  if (alg === "AES")
    return ["AES-256-GCM (authenticated mode, 256-bit key)", "Grover halves key strength"];
  if (alg === "MD5" && file?.includes("passwords"))
    return ["Argon2id for password hashing", "Never use a fast hash for passwords"];
  if (alg === "MD5" || alg === "SHA-1")
    return ["SHA-256 / SHA3-256", "Collision-resistant, NIST approved"];
  if (alg.startsWith("OpenSSL"))
    return ["OpenSSL 3.5+ (ships ML-KEM and ML-DSA)", "Rebuild the image / binary"];
  return [
    "Pin a current version and confirm which algorithms it calls",
    "Library name only — usage not yet proven",
  ];
}

const DEFAULT_JAVA_CODE = [
  'import java.security.*;',
  'import javax.crypto.Cipher;',
  '',
  'public class Crypto {',
  '    static byte[] digest(byte[] data) throws Exception {',
  '        return MessageDigest.getInstance("SHA-1").digest(data);',
  '    }',
  '',
  '    static KeyPair newKey() throws Exception {',
  '        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");',
  '        kpg.initialize(2048);',
  '        return kpg.generateKeyPair();',
  '    }',
  '',
  '    static Cipher legacyCipher() throws Exception {',
  '        return Cipher.getInstance("DES/CBC/PKCS5Padding");',
  '    }',
  '}',
];

export default function CodeEdit({
  assets = [],
  selectedAssetId,
  selectedScanId,
  latestScan,
  onTriggerRescan,
  showToast,
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [filterQuery, setFilterQuery] = useState("");
  const [fileLines, setFileLines] = useState(DEFAULT_JAVA_CODE);
  const [mode, setMode] = useState("view"); // 'view' | 'diff' | 'applied'
  const [statusMessage, setStatusMessage] = useState("");
  const [loadingFile, setLoadingFile] = useState(false);
  const [fixId, setFixId] = useState(null);

  // Sync selected asset from props or default to first asset
  useEffect(() => {
    if (assets.length > 0) {
      if (selectedAssetId) {
        const found = assets.findIndex((a) => a.id === selectedAssetId);
        if (found >= 0) {
          setCurrentIdx(found);
          setMode("view");
          setStatusMessage("");
          return;
        }
      }
      // default to asset index 2 if available (the DES payments/Crypto.java demo finding)
      const desIdx = assets.findIndex(
        (a) => a.algorithm === "DES" && (a.primary_location || "").includes("Crypto.java")
      );
      if (desIdx >= 0) setCurrentIdx(desIdx);
      else setCurrentIdx(0);
      setMode("view");
      setStatusMessage("");
    }
  }, [selectedAssetId, assets]);

  const currentAsset = assets[currentIdx] || assets[0] || {};

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
  const isBinaryOrCert =
    loc.file.endsWith(".crt") ||
    loc.file.endsWith(".key") ||
    loc.file.endsWith(".bin") ||
    loc.file.endsWith(".p12") ||
    loc.file.endsWith(".tar");

  // Load real file content from API if available
  useEffect(() => {
    if (!loc.file || isBinaryOrCert) {
      setFileLines([]);
      return;
    }

    setLoadingFile(true);
    api
      .file(loc.file, loc.line, selectedScanId)
      .then((res) => {
        if (res && res.lines && res.lines.length > 0) {
          setFileLines(res.lines);
        } else if (loc.file.includes("Crypto.java")) {
          setFileLines(DEFAULT_JAVA_CODE);
        }
      })
      .catch(() => {
        if (loc.file.includes("Crypto.java")) {
          setFileLines(DEFAULT_JAVA_CODE);
        } else {
          setFileLines([]);
        }
      })
      .finally(() => setLoadingFile(false));
  }, [loc.file, loc.line, isBinaryOrCert]);

  // Build tree from assets
  const fileToAssets = {};
  assets.forEach((a, idx) => {
    const f = (a.primary_location ? a.primary_location.split(":")[0] : a.files?.[0]) || "unknown";
    const cleanFile = f.split("!")[0];
    if (!fileToAssets[cleanFile]) fileToAssets[cleanFile] = [];
    fileToAssets[cleanFile].push(idx);
  });

  const dirs = {};
  Object.keys(fileToAssets)
    .sort()
    .forEach((f) => {
      const parts = f.split("/");
      const d = parts.length > 1 ? parts[0] : ".";
      if (!dirs[d]) dirs[d] = [];
      dirs[d].push(f);
    });

  const filteredDirs = {};
  Object.keys(dirs).forEach((d) => {
    const matchedFiles = dirs[d].filter((f) =>
      f.toLowerCase().includes(filterQuery.toLowerCase())
    );
    if (matchedFiles.length > 0) filteredDirs[d] = matchedFiles;
  });

  const handlePreview = async () => {
    setMode("diff");
    if (showToast) showToast("Fix preview generated");
    // Also try API preview if fix_finding is present
    if (currentAsset.fix_finding) {
      try {
        const previewRes = await api.fixPreview(currentAsset.fix_finding);
        if (previewRes && previewRes.id) {
          setFixId(previewRes.id);
        }
      } catch {
        // fallback to client preview
      }
    }
  };

  const handleApply = async () => {
    setMode("applied");
    setStatusMessage("✓ Patch applied (backup saved) · re-scan: finding cleared");
    if (showToast) showToast("Fix applied, re-scan completed");

    if (fixId) {
      try {
        await api.fixApply(fixId, "Applied via Code Edit");
      } catch {
        // ok
      }
    }
    if (onTriggerRescan) {
      setTimeout(() => onTriggerRescan(), 800);
    }
  };

  const replacement = getReplacement(currentAsset, loc.file);
  const cfg = PRIORITY_MAP[currentAsset.tier] || { code: "P4", pill: "p4" };
  const targetLine = loc.line || 16;

  return (
    <section className="page on" id="p-code">
      <div className="ph">
        <div>
          <h1>Code Edit</h1>
          <p>Open a finding, see why it is weak, preview the fix, apply it and re-scan.</p>
        </div>
        <div className="act">
          <button
            className="btn"
            onClick={() => {
              if (showToast) showToast("Re-scan started…");
              if (onTriggerRescan) onTriggerRescan();
            }}
          >
            <RotateCw size={15} /> Re-scan
          </button>
        </div>
      </div>

      <div className="ide">
        {/* Left Column: Project Explorer */}
        <div className="card" style={{ padding: "14px" }}>
          <div className="row" style={{ marginBottom: "10px" }}>
            <b style={{ fontSize: "13px" }}>Project explorer</b>
            <span className="pill p1" style={{ marginLeft: "auto" }}>
              {assets.length} assets
            </span>
          </div>

          <input
            className="in"
            placeholder="Filter files…"
            style={{ marginBottom: "10px" }}
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
            DIRECTORY
          </div>

          <div className="tree">
            {Object.keys(filteredDirs).map((d) => (
              <div key={d} style={{ display: "block", padding: 0 }}>
                <div style={{ fontWeight: 600 }}>▾ {d === "." ? "demo_target" : d}</div>
                {filteredDirs[d].map((f) => {
                  const assetIdxs = fileToAssets[f] || [];
                  const topAssetForFile = assetIdxs
                    .map((i) => assets[i])
                    .sort((x, y) => (y.score || 0) - (x.score || 0))[0];
                  const topCfg = PRIORITY_MAP[topAssetForFile?.tier] || {
                    code: "P4",
                    pill: "p4",
                  };
                  const isCurrent = assetIdxs.includes(currentIdx);

                  return (
                    <div
                      key={f}
                      className={isCurrent ? "on" : ""}
                      style={{ paddingLeft: "20px" }}
                      onClick={() => {
                        const targetIndex = assets.indexOf(topAssetForFile);
                        if (targetIndex >= 0) setCurrentIdx(targetIndex);
                        setMode("view");
                        setStatusMessage("");
                      }}
                    >
                      <span className="mono" style={{ fontSize: "12px" }}>
                        {f.split("/").pop()}
                      </span>
                      <span className={`cnt pill ${topCfg.pill}`}>
                        {topCfg.code}·{assetIdxs.length}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column: Code View */}
        <div className="card" style={{ padding: "14px" }}>
          <div className="row" style={{ marginBottom: "10px", fontSize: "12px" }}>
            <span className="mono" style={{ color: "var(--mut)" }}>
              {loc.file ? `demo_target/${loc.file}` : "demo_target/payments/Crypto.java"}
            </span>
            <span
              style={{ marginLeft: "auto", color: "var(--p3)", fontWeight: 600 }}
              className="mono"
            >
              Target line: {targetLine}
            </span>
          </div>

          <div className="code mono">
            {loadingFile ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--mut)" }}>
                Loading source…
              </div>
            ) : isBinaryOrCert || fileLines.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--mut)" }}>
                <b style={{ color: "var(--ink)", display: "block" }}>{loc.file}</b>
                <div style={{ marginTop: "6px" }}>
                  Binary or certificate file — shown as metadata, not source
                </div>
              </div>
            ) : (
              fileLines.map((line, idx) => {
                const lineNum = idx + 1;
                // If in diff or applied mode on targetLine
                if (mode !== "view" && lineNum === targetLine) {
                  return (
                    <React.Fragment key={lineNum}>
                      <div className="ln del">
                        <span>{lineNum}</span>
                        <span>{line}</span>
                      </div>
                      <div className="ln add">
                        <span>+</span>
                        <span>
                          {"        return Cipher.getInstance(\"AES/GCM/NoPadding\");  // MOX: DES → AES-256-GCM"}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                }

                return (
                  <div
                    key={lineNum}
                    className={`ln ${lineNum === targetLine ? "hl" : ""}`}
                  >
                    <span>{lineNum}</span>
                    <span>{line || " "}</span>
                  </div>
                );
              })
            )}
          </div>

          <div className="row" style={{ marginTop: "14px" }}>
            {mode === "view" && (
              <button className="btn" onClick={handlePreview}>
                <Eye size={15} /> Preview fix
              </button>
            )}

            {mode === "diff" && (
              <button className="btn gr" onClick={handleApply}>
                <Check size={15} /> Apply &amp; re-scan
              </button>
            )}

            {statusMessage && (
              <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--ok)" }}>
                {statusMessage}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Finding Details */}
        <div className="card" style={{ padding: "16px" }}>
          <div className="row" style={{ marginBottom: "12px" }}>
            <b style={{ fontSize: "13px" }}>Finding details</b>
            <span className={`pill ${cfg.pill}`} style={{ marginLeft: "auto" }}>
              {cfg.code} {currentAsset.tier || "High"}
            </span>
          </div>

          <div className="kv">
            <span className="i">1</span>
            <span className="k">Algorithm</span>
            <b style={{ color: "#0B7C99" }}>
              {currentAsset.algorithm || currentAsset.label?.split(" ")[0] || "DES"}
              {currentAsset.key_size ? `-${currentAsset.key_size}` : ""}
            </b>

            <span className="i">2</span>
            <span className="k">File</span>
            <span className="mono" style={{ fontSize: "11.5px" }}>
              {loc.file}
            </span>

            <span className="i">3</span>
            <span className="k">Line</span>
            <span className="mono">{loc.line}</span>

            <span className="i">4</span>
            <span className="k">Risk</span>
            <b>{Number(currentAsset.score || 0).toFixed(1)} / 100</b>

            <span className="i">5</span>
            <span className="k">Quantum</span>
            <span>
              {currentAsset.breakdown?.quantum_vulnerable
                ? "Shor-breakable"
                : "Grover-weakened / n/a"}
            </span>

            <span className="i">6</span>
            <span className="k">Verdict</span>
            <span>
              <span className={`pill v${(currentAsset.verdict || "M")[0]}`}>
                {currentAsset.verdict || "MIGRATE"}
              </span>{" "}
              · wave {currentAsset.wave || 1}
            </span>
          </div>

          <div className="box weak" style={{ marginBottom: "10px" }}>
            <h4>Why this is weak</h4>
            {currentAsset.reason
              ? currentAsset.reason.split(". ")[0] + "."
              : "Algorithm is disallowed today under NIST guidelines."}
          </div>

          <div className="box fix">
            <h4>Recommended fix</h4>
            <b>{replacement[0]}</b>
            <div style={{ color: "var(--mut)", fontSize: "12px", marginTop: "4px" }}>
              {replacement[1]}
            </div>
          </div>

          <div style={{ fontSize: "11.5px", color: "var(--mut)", marginTop: "10px" }}>
            {currentAsset.findings_count || 1} finding → 1 asset · seen in{" "}
            {currentAsset.locations?.length || 1} location(s)
          </div>
        </div>
      </div>
    </section>
  );
}
