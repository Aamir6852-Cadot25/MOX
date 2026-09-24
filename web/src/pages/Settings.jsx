import { useEffect, useState } from "react";
import { api } from "../api.js";

const split = (v) => (v ? `${v.MIGRATE} / ${v.CONTAIN} / ${v.ACCEPT}` : "–");

// Organisation-wide settings. Z moves every asset's Mosca exposure, verdict and wave, so it is changed here,
// deliberately, with an explicit save, and the before / after verdict split is shown.
export default function Settings({ summary, onChanged }) {
  const [z, setZ] = useState("");
  const [saved, setSaved] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [change, setChange] = useState(null); // {from, to, before, after}
  const load = () => { setErr(""); api.settings().then((s) => { setSaved(s.threat_horizon); setZ(String(s.threat_horizon)); }).catch((e) => setErr(e.message)); };
  useEffect(load, []);
  useEffect(() => { if (change && !change.after && summary?.verdicts) setChange((c) => ({ ...c, after: summary.verdicts })); }, [summary]);

  const n = Number(z);
  const valid = Number.isInteger(n) && n >= 1 && n <= 40;
  const save = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const before = summary?.verdicts;
      const s = await api.setSettings({ threat_horizon: n });
      setChange({ from: saved, to: s.threat_horizon, before, after: null });
      setSaved(s.threat_horizon);
      await onChanged();
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  };

  return (
    <div className="p-5 flex flex-col gap-3" style={{ maxWidth: 760 }}>
      <form className="bp-card" onSubmit={save}>
        <div className="card-h"><h2>Quantum threat horizon (Z)</h2><span className="note">organisation-wide</span></div>
        <div className="card-b flex flex-col gap-3">
          <div className="hint">
            Years until a cryptographically relevant quantum computer is assumed to exist. Every asset's Mosca exposure is
            X + Y − Z, so changing Z re-scores every asset in the latest scan and can move its verdict and wave. It never
            changes a risk score. The change is written to the audit log.
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="z" className="lbl" style={{ margin: 0 }}>Z</label>
            <input id="z" className="bp-input mono" style={{ width: 80 }} type="number" min="1" max="40" value={z}
              onChange={(e) => setZ(e.target.value)} disabled={saved == null} />
            <span className="hint">years (1–40)</span>
            <button className="bp-btn pri" disabled={busy || !valid || n === saved}>{busy ? "Re-scoring" : "Save and re-score"}</button>
          </div>
          {!valid && z !== "" && <div className="errbox">Z must be a whole number of years from 1 to 40.</div>}
          {err && <div className="errbox">Could not save: {err}. The previous value <span className="mono">{saved}</span> is still in force.</div>}
          {change && (
            <div className="hint">
              Z changed from <span className="mono">{change.from}</span> to <span className="mono">{change.to}</span>.
              Verdict split (migrate / contain / accept): <span className="mono">{split(change.before)}</span> →{" "}
              <span className="mono">{change.after ? split(change.after) : "re-scoring"}</span>.
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
