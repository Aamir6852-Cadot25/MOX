import React from "react";
import { Settings } from "lucide-react";

export default function Header({
  scans = [],
  selectedScanId,
  onSelectScan,
  netstat,
  onOpenSettings,
}) {
  const formatDate = (isoStr) => {
    if (!isoStr) return "";
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return String(isoStr).slice(0, 16).replace("T", " ");
    }
  };

  return (
    <header>
      <img
        src="/mox-icon.svg"
        alt=""
        width="40"
        height="40"
        style={{ borderRadius: "10px", boxShadow: "0 0 0 1px #0EA5C9" }}
      />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", height: "40px" }}>
        <div className="t" style={{ lineHeight: 0, margin: 0 }}>
          <img src="/mox-wordmark.svg" alt="MOX" height="20" style={{ display: "block" }} />
        </div>
        <div className="s" style={{ lineHeight: 1.2, margin: 0 }}>Cryptographic discovery &amp; PQC readiness</div>
      </div>

      {scans.length > 0 && (
        <div className="hdr-scan-selector" style={{ marginLeft: "20px" }}>
          <select
            className="hdr-select"
            value={selectedScanId || (scans[0] ? scans[0].id : "")}
            onChange={(e) => onSelectScan(Number(e.target.value))}
            title="Switch active project scan"
          >
            {scans.map((s) => {
              const pName = s.project_name || s.target?.split(/[\\/]/).pop() || "Project";
              const date = formatDate(s.started_at);
              return (
                <option key={s.id} value={s.id}>
                  {pName} · scan #{s.id} · {date}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div className="r">
        <span style={{ fontSize: "12px", color: "#C9D6E3", whiteSpace: "nowrap" }}>
          Hosted demo · product runs air-gapped on-premise
        </span>
        <button className="ib" title="Settings" onClick={onOpenSettings}>
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
