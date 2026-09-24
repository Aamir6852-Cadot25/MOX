import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api } from "../api.js";

const POLL_MS = 5000;

/** Top-bar pill: outbound socket connects counted by mox/netguard.py since the server started. */
export default function AirGapPill() {
  const [n, setN] = useState(null);
  const [err, setErr] = useState(false);
  const loc = useLocation();
  useEffect(() => {
    let alive = true;
    const load = () => api.netstat().then((d) => alive && (setN(d), setErr(false))).catch(() => alive && setErr(true));
    load();
    const t = setInterval(load, POLL_MS);
    return () => { alive = false; clearInterval(t); };
  }, [loc.pathname]);

  if (err || !n?.installed)
    return <Link to="/scan#network" className="agp unk" title="The socket counter is not reporting. Open New Scan for the network panel.">
      <i className="led" />Outbound calls not measured</Link>;
  const title = `Counts Python-level socket.connect calls in this server process since ${n.since}, not the OS or the network card. ` +
    `Loopback connects (${n.loopback}) are counted separately.` + (n.last ? ` Last outbound: ${n.last.host} at ${n.last.at}.` : "");
  return (
    <Link to="/scan#network" className={`agp${n.outbound ? " bad" : ""}`} title={title}>
      <i className="led" /><span className="mono">{n.outbound}</span> outbound {n.outbound === 1 ? "connect" : "connects"} counted
    </Link>
  );
}
