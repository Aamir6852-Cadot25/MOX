import React from "react";
import { Settings } from "lucide-react";

export default function Header({
  scans = [],
  selectedScanId,
  onSelectScan,
  netstat,
  onOpenSettings,
}) {
  const outbound = netstat?.outbound || 0;

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
    } catch {
      return isoStr.slice(0, 16).replace("T", " ");
    }
  };

  return (
    <header>
      <div className="logo">MX</div>
      <div>
        <div className="t">M-O-X</div>
        <div className="s">Cryptographic discovery &amp; PQC readiness</div>
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
        <span>
          Offline · {outbound} outbound connection{outbound === 1 ? "" : "s"}
        </span>
        <button className="ib" title="Settings" onClick={onOpenSettings}>
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
