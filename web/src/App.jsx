import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { api } from "./api.js";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Queue from "./pages/Queue.jsx";
import Asset from "./pages/Asset.jsx";
import Fix from "./pages/Fix.jsx";
import Reports from "./pages/Reports.jsx";
import NewScan from "./pages/NewScan.jsx";
import AirGapPill from "./components/AirGapPill.jsx";
import Icon from "./components/Icon.jsx";
import Mark from "./components/Mark.jsx";
import { RouteStage } from "./components/Motion.jsx";

/** D1: every old route redirects to its new home with the same entity selected, preserving any query/hash. */
function OldRoute({ to }) {
  const params = useParams();
  const loc = useLocation();
  return <Navigate to={`${to(params)}${loc.search}${loc.hash}`} replace />;
}

/** D2: post-login landing. No scan in the database -> /scan. Otherwise -> /dashboard. */
function Landing({ summary }) {
  if (!summary) return null;
  return <Navigate to={summary.scan ? "/dashboard" : "/scan"} replace />;
}

export default function App() {
  const [user, setUser] = useState(undefined);
  const [summary, setSummary] = useState(null);
  const nav = useNavigate();

  // A failed load is not "no scan": keep the error so no screen claims the database is empty.
  const refresh = () => api.latest().then(setSummary).catch((e) => setSummary({ scan: null, error: e.message }));
  useEffect(() => {
    api.me().then(setUser).catch(() => setUser(null));
  }, []);
  useEffect(() => {
    if (user) refresh();
  }, [user]);

  if (user === undefined) return null;
  if (!user)
    return (
      <Routes>
        <Route path="*" element={<Login onLogin={(u) => { setUser(u); nav("/"); }} />} />
      </Routes>
    );

  const scan = summary?.scan;
  const work = [["/scan", "1 Discover", "scan-search"], ["/dashboard", "2 Quantum Risk", "layout-dashboard"],
    ["/findings", "3 Remediate", "list-checks"], ["/reports", "4 Report", "file-text"]];
  const navRow = (to, l, icon) => (
    <NavLink key={l} to={to} className={({ isActive }) => "nav" + (isActive ? " on" : "")}><Icon name={icon} size="nav" />{l}</NavLink>
  );
  return (
    <div className="shell">
      <aside className="side">
        <div className="logo"><Mark />MOX</div>
        {work.map(([to, l, icon]) => navRow(to, l, icon))}
      </aside>
      <div className="main">
        <div className="topbar">
          <div className="dim target">{scan ? <>Target <b className="mono" style={{ color: "var(--ink)" }} title={scan.target}>{scan.target}</b></>
            : summary?.error ? <>Could not load the latest scan ({summary.error}). <button className="linkbtn" onClick={refresh}>Retry</button></>
            : summary ? "No scan yet" : "Loading latest scan"}</div>
          <div className="sp" />
          {scan && <div className="chip"><span className="mono">{scan.files_scanned}</span> files, <span className="mono">{summary.kpi.planes}</span> planes, <span className="mono">{scan.seconds}</span> s</div>}
          <AirGapPill />
          <span className="dim" style={{ fontSize: 11 }} title={user.username}>Signed in as CISO</span>
          <button className="bp-btn" onClick={() => api.logout().then(() => setUser(null))}><Icon name="log-out" />Sign out</button>
        </div>
      <RouteStage>{(loc) => (
      <Routes location={loc}>
        <Route path="/" element={<Landing summary={summary} />} />
        <Route path="/scan" element={<NewScan summary={summary} onScanned={refresh} />} />
        <Route path="/dashboard" element={<Dashboard summary={summary} onScanned={refresh} />} />
        <Route path="/findings" element={<Queue summary={summary} />} />
        <Route path="/findings/:id" element={<Asset onChanged={refresh} />} />
        <Route path="/code" element={<Fix onChanged={refresh} summary={summary} />} />
        <Route path="/code/:findingId" element={<Fix onChanged={refresh} />} />
        <Route path="/reports" element={<Navigate to="/reports/cbom" replace />} />
        <Route path="/reports/:tab" element={<Reports summary={summary} />} />
        {/* old routes (D1): redirect to the new home, entity preserved */}
        <Route path="/queue" element={<OldRoute to={() => "/findings"} />} />
        <Route path="/asset/:id" element={<OldRoute to={(p) => `/findings/${p.id}`} />} />
        <Route path="/fix" element={<OldRoute to={() => "/code"} />} />
        <Route path="/fix/:findingId" element={<OldRoute to={(p) => `/code/${p.findingId}`} />} />
        <Route path="/cbom" element={<OldRoute to={() => "/reports/cbom"} />} />
        <Route path="/roadmap" element={<OldRoute to={() => "/reports/roadmap"} />} />
        <Route path="/report" element={<OldRoute to={() => "/reports/compliance"} />} />
        <Route path="/attest" element={<OldRoute to={() => "/reports/attestation"} />} />
        <Route path="/audit" element={<OldRoute to={() => "/reports/audit"} />} />
        <Route path="/sector" element={<OldRoute to={() => "/reports/national"} />} />
        <Route path="/settings" element={<OldRoute to={() => "/dashboard"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      )}</RouteStage>
      </div>
    </div>
  );
}
