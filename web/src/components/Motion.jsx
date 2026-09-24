import { useEffect, useId, useState } from "react";
import { useLocation } from "react-router-dom";
import Icon from "./Icon.jsx";
import { token, useCountTo } from "../motion.js";

/** Number change (C2): a metric that counts from its previous value after a re-scan; plain on first paint. */
export function Num({ k, value }) {
  const [v, fading] = useCountTo(k, value);
  return <span className={fading ? "num-fade" : undefined}>{v}</span>;
}

/**
 * Route change (C2): outgoing content fades out over --t-route-out, then the new route fades in and rises 4px over
 * --t-base, once for the whole route (never per section). A query or hash change on the same path is not a route
 * change. The first page load is painted without animation.
 */
export function RouteStage({ children }) {
  const loc = useLocation();
  const [shown, setShown] = useState(loc);
  const [phase, setPhase] = useState("");
  useEffect(() => {
    if (loc.pathname === shown.pathname) return setShown(loc);
    setPhase("out");
    const t = setTimeout(() => { setShown(loc); setPhase("in"); }, token("--t-route-out"));
    return () => clearTimeout(t);
  }, [loc]);
  return <div key={shown.pathname} className={`route ${phase}`} onAnimationEnd={() => setPhase("")}>{children(shown)}</div>;
}

/** Expand / collapse (C2): height over --t-base; the chevron rotates in the same duration. */
export function Disclosure({ summary, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div>
      <button type="button" className="disclose" aria-expanded={open} aria-controls={id} onClick={() => setOpen((o) => !o)}>
        <span className={`chev${open ? " open" : ""}`} style={{ display: "inline-flex" }}><Icon name="chevron-down" /></span>
        {summary}
      </button>
      <div id={id} className={`expander${open ? " open" : ""}`} aria-hidden={!open}><div>{children}</div></div>
    </div>
  );
}
