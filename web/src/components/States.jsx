import { Link } from "react-router-dom";

// C7: every empty state is a direction with a control; every error names what failed, what it means and the next
// action. None apologises. A 404 from the API means "no scan yet"; anything else is a load failure, never "empty".

/** Load failure. `what` completes "Could not load ...". */
export function LoadError({ what, err, onRetry }) {
  return (
    <div className="p-4"><div className="errbox" style={{ maxWidth: 720 }}>
      Could not load {what}: {err?.message || String(err)}. Stored scan results are not affected.{" "}
      {onRetry && <button className="linkbtn" onClick={onRetry}>Retry</button>}
    </div></div>
  );
}

/** No scan recorded yet. `what` names the thing that is built from a scan. */
export function NoScan({ what }) {
  return (
    <div className="p-4"><div className="bp-card" style={{ maxWidth: 560 }}>
      <div className="card-h"><h2>No scan yet</h2></div>
      <div className="card-b flex flex-col gap-3">
        <div className="hint">{what} is built from the latest scan. Scan a folder on this machine, then come back here.</div>
        <div><Link className="bp-btn pri" to="/scan">Open New Scan</Link></div>
      </div>
    </div></div>
  );
}

/** Loaded data or a failure, by HTTP status: 404 means no scan, anything else a load error. */
export function Failed({ what, err, onRetry }) {
  return err?.status === 404 ? <NoScan what={what.charAt(0).toUpperCase() + what.slice(1)} /> : <LoadError what={what} err={err} onRetry={onRetry} />;
}

/** A search or filter that matches nothing: say so and offer the control that clears it. */
export function NoMatch({ p, noun }) {
  return (
    <div className="p-4 hint">
      No {noun} matches <span className="mono">{p.q}</span>.{" "}
      <button className="linkbtn" onClick={() => p.setQ("")}>Clear search</button> to see all of them.
    </div>
  );
}
