import { PLANES } from "./Pipeline.jsx";

const NAME = { code: "Source code", dependencies: "Dependencies", configs: "Configuration", certificates: "Certificates",
  containers: "Containers", binaries: "Binaries", tls: "Live TLS" };
const WORD = { ok: "scanned", partial: "partly failed", failed: "failed", idle: "ran, no files", off: "off" };

/** 7-plane coverage from the latest scan's Detect stage detail (server data; nothing assumed). */
export default function CoverageRing({ stages }) {
  const detect = stages?.find((s) => s.stage === "Detect")?.detail || {};
  const status = (p) => detect[p]?.status ?? (detect[p] ? "ok" : "off");
  const ran = PLANES.filter((p) => status(p) !== "off").length;
  const R = 30, C = 2 * Math.PI * R, seg = C / 7, gap = 3;
  return (
    <div className="cov">
      <svg width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={`${ran} of 7 planes ran`}>
        {PLANES.map((p, i) => (
          <circle key={p} cx="42" cy="42" r={R} className={`cov-seg ${status(p)}`} fill="none" strokeWidth="9"
            strokeDasharray={`${seg - gap} ${C - seg + gap}`} strokeDashoffset={-i * seg} transform="rotate(-90 42 42)">
            <title>{NAME[p]}: {WORD[status(p)]}</title>
          </circle>
        ))}
        <text x="42" y="41" textAnchor="middle" className="cov-n mono">{ran}/7</text>
        <text x="42" y="54" textAnchor="middle" className="cov-l">planes ran</text>
      </svg>
      <div className="cov-list">
        {PLANES.map((p) => (
          <div key={p} className={`cov-row ${status(p)}`}>
            <i />{NAME[p]}<span className="mono">{detect[p]?.files != null && status(p) !== "off" ? `${detect[p].files} files` : WORD[status(p)]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
