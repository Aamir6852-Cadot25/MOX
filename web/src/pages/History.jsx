import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Failed } from "../components/States.jsx";
import Icon from "../components/Icon.jsx";

export default function History() {
  const [scans, setScans] = useState(null);
  const [err, setErr] = useState(null);

  const load = () => {
    setErr(null);
    api.history().then(setScans).catch((e) => setErr(e.message || String(e)));
  };

  useEffect(load, []);

  if (err) return <Failed what="scan history" err={err} onRetry={load} />;
  if (!scans) return <div className="p-6 dim">Loading scan history...</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="panel p-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-xl font-bold">Scan history</div>
          <div className="dim">
            {scans.length} scan{scans.length === 1 ? "" : "s"} recorded in local SQLite database
          </div>
        </div>
        <button type="button" className="bp-btn" onClick={load}>
          <Icon name="refresh-cw" />Refresh
        </button>
      </div>

      <div className="panel p-4">
        <table className="bp-table">
          <thead>
            <tr>
              <th style={{ width: "8%" }}>Scan</th>
              <th style={{ width: "36%" }}>Target</th>
              <th style={{ width: "20%" }}>Timestamp</th>
              <th style={{ width: "12%" }}>Duration</th>
              <th style={{ width: "12%" }}>Files</th>
              <th style={{ width: "12%" }}>Findings</th>
            </tr>
          </thead>
          <tbody>
            {scans.map((s) => (
              <tr key={s.id}>
                <td className="mono">#{s.id}</td>
                <td className="mono" style={{ wordBreak: "break-all" }}>{s.target}</td>
                <td className="dim" style={{ fontSize: 11 }}>
                  {s.started_at ? new Date(s.started_at).toLocaleString() : "–"}
                </td>
                <td className="mono">{s.seconds ? `${s.seconds.toFixed(2)}s` : "–"}</td>
                <td className="mono">{s.files_scanned}</td>
                <td className="mono tn">{s.findings_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!scans.length && (
          <div className="p-4 dim">No scan history recorded yet. Run a discovery scan first.</div>
        )}
      </div>
    </div>
  );
}
