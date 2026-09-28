import React from "react";
import { Settings, LogOut } from "lucide-react";

export default function Header({ latestScan, netstat, onOpenSettings, onSignOut }) {
  const scanTime = latestScan?.scan?.started_at
    ? new Date(latestScan.scan.started_at).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "No scans yet";

  const targetName = latestScan?.scan?.target
    ? latestScan.scan.target.split(/[\\/]/).pop()
    : "demo_target";

  const outbound = netstat?.outbound || 0;

  return (
    <header>
      <div className="logo">MX</div>
      <div>
        <div className="t">M-O-X</div>
        <div className="s">Cryptographic discovery &amp; PQC readiness</div>
      </div>

      <div className="r">
        <span>
          Last scan: <b>{scanTime}</b> · Offline · {outbound} outbound connection{outbound === 1 ? "" : "s"}
        </span>
        <span className="demo">Preview · {targetName} data</span>
        <button className="ib" title="Settings" onClick={onOpenSettings}>
          <Settings size={17} />
        </button>
        <button className="ib" title="Sign out" onClick={onSignOut}>
          <LogOut size={17} />
        </button>
      </div>
    </header>
  );
}
