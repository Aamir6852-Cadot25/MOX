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
  return (
    <>
      <div className="top">
        <div className="logo"><span className="m">MO</span><span className="x">X</span></div>
        <div className="tgt">{scan ? <>Target <b>{scan.target.split(/[\\/]/).pop()}</b></> : "No scan yet"}</div>
        <div className="tabs">
          <NavLink to="/" end className={({ isActive }) => "tab" + (isActive ? " on" : "")}>Dashboard</NavLink>
          <NavLink to="/queue" className={({ isActive }) => "tab" + (isActive ? " on" : "")}>Work queue</NavLink>
          {[["/fix", "Fix"], ["/cbom", "CBOM"], ["/roadmap", "Roadmap"], ["/attest", "Attest"], ["/sector", "Sector"], ["/audit", "Audit"]].map(([to, l]) => (
            <NavLink key={to} to={to} className={({ isActive }) => "tab" + (isActive ? " on" : "")}>{l}</NavLink>
          ))}
        </div>
        <div className="sp" />
        {scan && <div className="chip">{scan.files_scanned} files · {Object.keys(scan.planes).length} planes · {scan.seconds} s</div>}
        <div className="chip ok">Offline — 0 outbound calls</div>
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
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}
