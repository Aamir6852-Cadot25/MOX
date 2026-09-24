// Shared scan-pipeline constants (docs matched to mox/scanner.py). The rendering that used to live here
// moved into ScanLedger.jsx for the Scan page (Phase 2); CoverageRing.jsx still uses PLANES.
export const STAGES = ["Ingest", "Detect", "Correlate", "Score", "Verdict"];
// Display order matches mox/scanner.py ALL_PLANES.
export const PLANES = ["code", "dependencies", "configs", "certificates", "containers", "binaries", "tls"];

export const fmtMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : ms >= 10 ? `${ms.toFixed(0)} ms` : `${ms.toFixed(2)} ms`);
