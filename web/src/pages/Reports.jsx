import { useEffect } from "react";
import { Link, Navigate, NavLink, useParams } from "react-router-dom";
import Cbom from "./Cbom.jsx";
import Roadmap from "./Roadmap.jsx";
import Attest, { prefetchAttest } from "./Attest.jsx";
import Report from "./Report.jsx";
import Audit from "./Audit.jsx";
import Sector from "./Sector.jsx";
import History from "./History.jsx";
import Reference from "./Reference.jsx";
import PageHeader from "../components/PageHeader.jsx";

const PRIMARY = [["cbom", "CBOM"], ["attestation", "Attestation"], ["national", "Sector view (NCIIPC)"], ["more", "More"]];
const MORE = [["roadmap", "Roadmap"], ["compliance", "Compliance"], ["audit", "Audit log"], ["history", "History"], ["reference", "Reference"]];
const MORE_KEYS = new Set(MORE.map(([k]) => k));
const KNOWN = new Set(["cbom", "attestation", "national", ...MORE_KEYS]);

/** D1: what do I hand over, and what changed since last time? "More" groups the less-used reports (Task 5).
 * Default tab is Attestation (Task B3): that is what a CISO opens this page for. */
export default function Reports({ summary }) {
  const { tab } = useParams();
  // Prefetched as soon as the Report page opens, regardless of which tab is active, so switching to
  // the Attestation tab for the default sector never shows a loading flash.
  useEffect(() => prefetchAttest(summary, "government"), [summary]);
  if (!tab || !KNOWN.has(tab)) return <Navigate to="/reports/attestation" replace />;
  const inMore = MORE_KEYS.has(tab);
  return (
    <div className="page">
      <PageHeader title="Can we prove it?" />
      <div className="tabs" role="tablist">
        {PRIMARY.map(([key, label]) => (
          <NavLink key={key} to={key === "more" ? "/reports/roadmap" : `/reports/${key}`} role="tab"
            className={`tab${key === "more" ? (inMore ? " on" : "") : ""}`}
            aria-current={key === "more" && inMore ? "page" : undefined}>
            {label}
          </NavLink>
        ))}
      </div>
      {inMore && (
        <div className="tabs" role="tablist" style={{ borderBottom: "none" }}>
          {MORE.map(([key, label]) => (
            <Link key={key} to={`/reports/${key}`} className={`tab${tab === key ? " on" : ""}`} style={{ fontSize: 11 }}>{label}</Link>
          ))}
        </div>
      )}
      {tab === "cbom" && <Cbom summary={summary} />}
      {tab === "roadmap" && <Roadmap summary={summary} />}
      {tab === "compliance" && <Report summary={summary} />}
      {tab === "attestation" && <Attest summary={summary} />}
      {tab === "national" && <Sector />}
      {tab === "audit" && <Audit />}
      {tab === "history" && <History />}
      {tab === "reference" && <Reference />}
    </div>
  );
}
