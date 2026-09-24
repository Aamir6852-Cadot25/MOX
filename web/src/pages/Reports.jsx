import { Navigate, NavLink, useParams } from "react-router-dom";
import Cbom from "./Cbom.jsx";
import Roadmap from "./Roadmap.jsx";
import Attest from "./Attest.jsx";
import Report from "./Report.jsx";
import Audit from "./Audit.jsx";

const TABS = [
  ["cbom", "CBOM"], ["roadmap", "Roadmap"], ["compliance", "Compliance"],
  ["attestation", "Attestation"], ["audit", "Audit log"], ["history", "History"], ["reference", "Reference"],
];
const KNOWN = new Set(TABS.map(([k]) => k));

/** D1: what do I hand over, and what changed since last time? History and Reference tabs land in Phase 6. */
export default function Reports({ summary }) {
  const { tab } = useParams();
  if (!tab || !KNOWN.has(tab)) return <Navigate to="/reports/cbom" replace />;
  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="tabs" role="tablist">
        {TABS.map(([key, label]) => (
          <NavLink key={key} to={`/reports/${key}`} role="tab" className={({ isActive }) => `tab${isActive ? " on" : ""}`}>
            {label}
          </NavLink>
        ))}
      </div>
      {tab === "cbom" && <Cbom summary={summary} />}
      {tab === "roadmap" && <Roadmap summary={summary} />}
      {tab === "compliance" && <Report summary={summary} />}
      {tab === "attestation" && <Attest summary={summary} />}
      {tab === "audit" && <Audit />}
      {tab === "history" && (
        <div className="panel p-4 dim">Scan-over-scan history and delta land in Phase 6.</div>
      )}
      {tab === "reference" && (
        <div className="panel p-4 dim">A browsable NIST status reference lands in Phase 6.</div>
      )}
    </div>
  );
}
