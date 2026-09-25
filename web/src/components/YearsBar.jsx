/**
 * The years bar shared by Quantum Risk (asset list rows) and Remediate (sticky rail):
 * X (data/trust life, grey) then Y (migration time, amber — red once exposed) against
 * a Z tick (quantum horizon); the exposed span past Z is drawn in red.
 */
export default function YearsBar({ m, mini = false }) {
  if (!m || m.exposure == null) return <div className="hint" style={{ fontSize: 10.5 }}>not applicable</div>;
  const exp = m.exposure;
  const span = Math.max(m.x + m.y, m.z) * 1.08 || 1;
  const pct = (v) => `${(100 * v) / span}%`;
  return (
    <div className={`years-bar${mini ? " mini" : ""}`} role="img"
      aria-label={`data life ${m.x} years, migration ${m.y} years, horizon ${m.z} years, ${exp > 0 ? `exposed by ${exp} years` : `safe by ${-exp} years`}`}>
      <div className="tl-tr">
        <div className="tl-x" style={{ width: pct(m.x) }} />
        <div className={`tl-y${exp > 0 ? " exp" : ""}`} style={{ left: pct(m.x), width: pct(m.y) }} />
        <div className="tl-z" style={{ left: pct(m.z) }} />
        {exp > 0 && <div className="tl-e" style={{ left: pct(m.z), width: pct(exp) }} />}
      </div>
    </div>
  );
}
