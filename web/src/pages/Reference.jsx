import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Failed } from "../components/States.jsx";
import { Tier, Verdict } from "../components/Marks.jsx";

const STATUS_TIER = {
  disallowed: "Critical",
  not_approved: "High",
  deprecated: "Medium",
  approved: "Low",
  hybrid: "Low",
  pending: "Medium",
};

export default function Reference() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);
  const [filter, setFilter] = useState("all"); // all | qv | qs

  const load = () => {
    setErr(null);
    api.reference().then(setData).catch((e) => setErr(e.message || String(e)));
  };

  useEffect(load, []);

  if (err) return <Failed what="NIST reference" err={err} onRetry={load} />;
  if (!data) return <div className="p-6 dim">Loading NIST reference data...</div>;

  const algs = Object.entries(data.algorithms || {}).map(([name, item]) => {
    const now = item.now || (item.size_rules ? item.size_rules[0].now : "approved");
    const y2030 = item.after_2030 || (item.size_rules ? item.size_rules[0].after_2030 : "–");
    const y2035 = item.after_2035 || (item.size_rules ? item.size_rules[0].after_2035 : "–");
    const sourceKey = item.source || (item.size_rules ? item.size_rules[0].source : "");
    const sourceName = data.sources?.[sourceKey] || sourceKey;
    return {
      name,
      qv: item.quantum_vulnerable,
      now,
      y2030,
      y2035,
      notes: item.notes,
      source: sourceName,
    };
  });

  const filtered = algs.filter((a) => {
    if (filter === "qv") return a.qv;
    if (filter === "qs") return !a.qv;
    return true;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="panel p-4 flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-xl font-bold">NIST Cryptographic Transition Reference</div>
          <div className="dim">
            Official transition guidance per NIST SP 800-131A, IR 8547, and FIPS 203/204/205
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={`filt${filter === "all" ? " on" : ""}`}
            onClick={() => setFilter("all")}
          >
            All ({algs.length})
          </button>
          <button
            type="button"
            className={`filt${filter === "qv" ? " on" : ""}`}
            onClick={() => setFilter("qv")}
          >
            Quantum-vulnerable ({algs.filter((a) => a.qv).length})
          </button>
          <button
            type="button"
            className={`filt${filter === "qs" ? " on" : ""}`}
            onClick={() => setFilter("qs")}
          >
            Quantum-safe / Hybrid ({algs.filter((a) => !a.qv).length})
          </button>
        </div>
      </div>

      <div className="panel p-4">
        <table className="bp-table">
          <thead>
            <tr>
              <th style={{ width: "18%" }}>Algorithm</th>
              <th style={{ width: "16%" }}>Quantum Status</th>
              <th style={{ width: "14%" }}>Status Now</th>
              <th style={{ width: "14%" }}>After 2030</th>
              <th style={{ width: "14%" }}>After 2035</th>
              <th style={{ width: "24%" }}>Guidance Source</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.name}>
                <td className="mono font-bold">{a.name}</td>
                <td>
                  <span
                    className="chip"
                    style={{
                      color: a.qv ? "var(--crit-ink)" : "var(--safe-ink)",
                    }}
                  >
                    {a.qv ? "Shor-vulnerable" : "Quantum-resilient"}
                  </span>
                </td>
                <td>
                  <Tier tier={STATUS_TIER[a.now] || "Medium"} />
                  <span className="dim text-[11px]" style={{ marginLeft: "var(--s1)" }}>
                    {a.now}
                  </span>
                </td>
                <td className="mono" style={{ fontSize: 11 }}>{a.y2030}</td>
                <td className="mono" style={{ fontSize: 11 }}>{a.y2035}</td>
                <td className="dim" style={{ fontSize: 11 }}>{a.source || "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
