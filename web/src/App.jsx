import { useEffect, useState } from "react";
import { NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api } from "./api.js";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Queue from "./pages/Queue.jsx";
import Asset from "./pages/Asset.jsx";
import Fix from "./pages/Fix.jsx";
import Cbom from "./pages/Cbom.jsx";
import Roadmap from "./pages/Roadmap.jsx";
import Attest from "./pages/Attest.jsx";
import Sector from "./pages/Sector.jsx";
import Audit from "./pages/Audit.jsx";
import Report from "./pages/Report.jsx";
import NewScan from "./pages/NewScan.jsx";
import Settings from "./pages/Settings.jsx";
import AirGapPill from "./components/AirGapPill.jsx";
import Icon from "./components/Icon.jsx";
import { RouteStage } from "./components/Motion.jsx";

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
  const topAsset = summary?.field?.[0]?.id;
  const groups = [
    ["Overview", [["/", "Dashboard", "layout-dashboard", true], ["/scan", "New Scan", "scan-search"]]],
    ["Findings", [["/queue", "Work queue", "list-checks"], [topAsset ? `/asset/${topAsset}` : "/queue", "Asset detail", "key-round"]]],
    ["Remediate", [["/fix", "Fix", "wrench"]]],
    ["Compliance", [["/cbom", "CBOM", "file-braces"], ["/roadmap", "Roadmap", "map"]]],
    ["Reports", [["/attest", "Attest", "signature"], ["/report", "Compliance Report", "file-text"], ["/sector", "Sector", "landmark"], ["/audit", "Audit", "scroll-text"]]],
    ["Organisation", [["/settings", "Settings", "settings"]]],
  ];
  return (
    <div className="shell">
      <aside className="side">
        <div className="logo">MOX</div>
        {groups.map(([g, items]) => (
          <div key={g}>
            <div className="grp">{g}</div>
            {items.map(([to, l, icon, end]) => (
              <NavLink key={l} to={to} end={end} className={({ isActive }) => "nav" + (isActive ? " on" : "")}><Icon name={icon} size="nav" />{l}</NavLink>
            ))}
          </div>
        ))}
      </aside>
      <div className="main">
        <div className="topbar">
          <div className="dim target">{scan ? <>Target <b className="mono" style={{ color: "var(--ink)" }} title={scan.target}>{scan.target}</b></>
            : summary?.error ? <>Could not load the latest scan ({summary.error}). <button className="linkbtn" onClick={refresh}>Retry</button></>
            : summary ? "No scan yet" : "Loading latest scan"}</div>
          <div className="sp" />
          {scan && <div className="chip"><span className="mono">{scan.files_scanned}</span> files, <span className="mono">{summary.kpi.planes}</span> planes, <span className="mono">{scan.seconds}</span> s</div>}
          <AirGapPill />
          <span className="dim" style={{ fontSize: 11 }}>{user.username}</span>
          <button className="bp-btn" onClick={() => api.logout().then(() => setUser(null))}><Icon name="log-out" />Sign out</button>
        </div>
      <RouteStage>{(loc) => (
      <Routes location={loc}>
        <Route path="/" element={<Dashboard summary={summary} onScanned={refresh} />} />
        <Route path="/scan" element={<NewScan summary={summary} onScanned={refresh} />} />
        <Route path="/queue" element={<Queue summary={summary} />} />
        <Route path="/asset/:id" element={<Asset onChanged={refresh} />} />
        <Route path="/fix" element={<Fix onChanged={refresh} />} />
        <Route path="/fix/:findingId" element={<Fix onChanged={refresh} />} />
        <Route path="/cbom" element={<Cbom summary={summary} />} />
        <Route path="/roadmap" element={<Roadmap summary={summary} />} />
        <Route path="/attest" element={<Attest summary={summary} />} />
        <Route path="/sector" element={<Sector />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/report" element={<Report summary={summary} />} />
        <Route path="/settings" element={<Settings summary={summary} onChanged={refresh} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      )}</RouteStage>
      </div>
    </div>
  );
}
