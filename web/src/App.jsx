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

export default function App() {
  const [user, setUser] = useState(undefined);
  const [summary, setSummary] = useState(null);
  const nav = useNavigate();

  const refresh = () => api.latest().then(setSummary).catch(() => setSummary(null));
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
    ["Overview", [["/", "Dashboard", true]]],
    ["Findings", [["/queue", "Work queue"], [topAsset ? `/asset/${topAsset}` : "/queue", "Asset detail"]]],
    ["Remediate", [["/fix", "Fix"]]],
    ["Compliance", [["/cbom", "CBOM"], ["/roadmap", "Roadmap"]]],
    ["Reports", [["/attest", "Attest"], ["/report", "Compliance Report"], ["/sector", "Sector"], ["/audit", "Audit"]]],
  ];
  return (
    <div className="shell">
      <aside className="side">
        <div className="logo">MOX</div>
        {groups.map(([g, items]) => (
          <div key={g}>
            <div className="grp">{g}</div>
            {items.map(([to, l, end]) => (
              <NavLink key={l} to={to} end={end} className={({ isActive }) => "nav" + (isActive ? " on" : "")}>{l}</NavLink>
            ))}
          </div>
        ))}
      </aside>
      <div className="main">
        <div className="topbar">
          <div className="dim">{scan ? <>Target <b style={{ color: "var(--text)" }}>{scan.target.split(/[\/]/).pop()}</b></> : "No scan yet"}</div>
          <div className="sp" />
          {scan && <div className="chip">{scan.files_scanned} files · {Object.keys(scan.planes).length} planes · {scan.seconds} s</div>}
          <div className="chip">Offline — 0 outbound calls</div>
          <button className="chip" onClick={() => api.logout().then(() => setUser(null))}>{user.username} · sign out</button>
        </div>
      <Routes>
        <Route path="/" element={<Dashboard summary={summary} onScanned={refresh} />} />
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      </div>
    </div>
  );
}
