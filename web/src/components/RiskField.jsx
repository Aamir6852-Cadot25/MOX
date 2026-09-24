import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Mosca exposure (x) against business criticality (y); dot area tracks the risk score.
// Tier is carried by fill style as well as hue (solid / solid / tint / hollow) so it survives greyscale
// print and colour-vision deficiency; the tier inks alone fail CVD separation (High vs Medium).
const W = 960, H = 250, M = { l: 118, r: 24, t: 26, b: 34 };
const STYLE = {
  Critical: { fill: "var(--crit-ink)", stroke: "var(--crit-ink)" },
  High: { fill: "var(--high-ink)", stroke: "var(--high-ink)" },
  Medium: { fill: "var(--med-bg)", stroke: "var(--med-ink)" },
  Low: { fill: "var(--surface)", stroke: "var(--low-ink)" },
};
const CRIT = { 3: "3 mission-critical", 2: "2 normal", 1: "1 low" };
const MAX_SCORE = 75.6; // (40 + 15 + 8) x 1.2 x 1.0, docs/SCORING.md
const LABEL_TOP = 5;    // label candidates, highest risk first
const CH = 6.3;         // advance of IBM Plex Mono at 10.5px (0.6 em): label width = characters x CH
const radius = (s) => 4 + 7 * Math.sqrt(Math.max(0, s) / MAX_SCORE);

export function Swatch({ tier }) {
  const s = STYLE[tier];
  return <svg width="10" height="10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill={s.fill} stroke={s.stroke} strokeWidth="1.5" /></svg>;
}

export default function RiskField({ field }) {
  const nav = useNavigate();
  const [hover, setHover] = useState(null);
  const { dots, ticks, x0, x, exposedN } = useMemo(() => {
    const es = field.map((f) => f.exposure);
    const lo = Math.min(-3, ...es) - 1, hi = Math.max(3, ...es) + 1;
    const x = (e) => M.l + ((e - lo) / (hi - lo)) * (W - M.l - M.r);
    const rowH = (H - M.t - M.b) / 3;
    const y = (c) => M.t + (3 - c) * rowH + rowH / 2;
    const step = hi - lo > 16 ? 4 : 2;
    const ticks = [];
    for (let t = Math.ceil(lo / step) * step; t <= hi; t += step) ticks.push(t);
    // Assets on the same (exposure, criticality) cell stack vertically instead of hiding each other.
    const seen = {};
    const dots = [...field].sort((a, b) => b.score - a.score).map((f) => {
      const k = `${f.exposure}:${f.criticality}`;
      const i = (seen[k] = (seen[k] ?? -1) + 1);
      const r = radius(f.score);
      const off = i === 0 ? 0 : (i % 2 ? -1 : 1) * Math.ceil(i / 2) * 9;
      return { ...f, cx: x(f.exposure), cy: y(f.criticality) + off, r };
    });
    return { dots, ticks, x0: x(0), x, exposedN: field.filter((f) => f.exposure > 0).length };
  }, [field]);
  // B3: labels never collide. The top-scoring assets are tried right, left, above, then below their dot; a spot is
  // taken only if it stays inside the plot and overlaps no placed label and no other dot. The rest are left to
  // hover / focus, which names every dot.
  const labels = useMemo(() => {
    const placed = [];
    const rectHitsDot = (b, d) => {
      const nx = Math.max(b.x, Math.min(d.cx, b.x + b.w)), ny = Math.max(b.y, Math.min(d.cy, b.y + b.h));
      return (nx - d.cx) ** 2 + (ny - d.cy) ** 2 < (d.r + 2) ** 2;
    };
    const free = (b, own) => b.x >= M.l && b.x + b.w <= W - M.r && b.y >= M.t && b.y + b.h <= H - M.b
      && !placed.some((p) => b.x < p.x + p.w + 4 && b.x + b.w + 4 > p.x && b.y < p.y + p.h && b.y + b.h > p.y)
      && !dots.some((d) => d.id !== own.id && rectHitsDot(b, d));
    for (const d of dots.slice(0, LABEL_TOP)) {
      const w = d.label.length * CH, h = 12;
      const spot = [[d.cx + d.r + 6, d.cy - h / 2], [d.cx - d.r - 6 - w, d.cy - h / 2],
        [d.cx - w / 2, d.cy - d.r - 4 - h], [d.cx - w / 2, d.cy + d.r + 4]]
        .map(([x, y]) => ({ x, y, w, h })).find((b) => free(b, d));
      if (spot) placed.push({ ...spot, id: d.id, text: d.label });
    }
    return placed;
  }, [dots]);

  return (
    <div className="rf">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Risk field: ${field.length} assets, ${exposedN} right of the Mosca break-even line`}>
        {[3, 2, 1].map((c, i) => {
          const yy = M.t + i * ((H - M.t - M.b) / 3);
          return (
            <g key={c}>
              {i > 0 && <line x1={M.l} x2={W - M.r} y1={yy} y2={yy} className="rf-grid" />}
              <text x={M.l - 10} y={yy + (H - M.t - M.b) / 6 + 4} textAnchor="end" className="rf-lab">{CRIT[c]}</text>
            </g>
          );
        })}
        <line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} className="rf-axis" />
        {ticks.map((t) => (
          <text key={t} x={x(t)} y={H - M.b + 15} textAnchor="middle" className="rf-tick mono">{t > 0 ? `+${t}` : t}</text>
        ))}
        <text x={(M.l + W - M.r) / 2} y={H - 3} textAnchor="middle" className="rf-lab">years of Mosca exposure (X + Y − Z)</text>
        <line x1={x0} x2={x0} y1={M.t - 14} y2={H - M.b} className="rf-zero" />
        <text x={x0 - 6} y={M.t - 6} textAnchor="end" className="rf-lab">not quantum-exposed</text>
        <text x={x0 + 6} y={M.t - 6} className="rf-lab">exposed: <tspan className="mono">{exposedN}</tspan> asset{exposedN === 1 ? "" : "s"}</text>
        {dots.map((d) => (
          <g key={d.id} className="rf-dot" tabIndex={0} role="link"
            aria-label={`${d.label}: ${d.tier}, risk ${d.score}, Mosca ${d.exposure} years, criticality ${d.criticality}`}
            onMouseEnter={() => setHover(d)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(d)} onBlur={() => setHover(null)}
            onClick={() => nav(`/asset/${d.id}`)} onKeyDown={(e) => e.key === "Enter" && nav(`/asset/${d.id}`)}>
            <circle cx={d.cx} cy={d.cy} r={d.r + 5} fill="transparent" />
            <circle cx={d.cx} cy={d.cy} r={d.r} fill={STYLE[d.tier].fill} stroke="var(--surface)" strokeWidth="3" />
            <circle cx={d.cx} cy={d.cy} r={d.r} fill={STYLE[d.tier].fill} stroke={STYLE[d.tier].stroke} strokeWidth="1.5" />
          </g>
        ))}
        {labels.map((l) => <text key={l.id} x={l.x} y={l.y + l.h - 3} className="rf-dl mono" aria-hidden="true">{l.text}</text>)}
      </svg>
      {hover && (
        <div className="rf-tip" style={{ left: `${(100 * hover.cx) / W}%`, top: `${(100 * (hover.cy - hover.r)) / H}%` }}>
          <div className="mono" style={{ color: "var(--ink)" }}>{hover.label}</div>
          <div><Swatch tier={hover.tier} /> {hover.tier}, risk <span className="mono">{hover.score}</span></div>
          <div>Mosca <span className="mono">{hover.exposure > 0 ? "+" : ""}{hover.exposure}</span> yrs, criticality <span className="mono">{hover.criticality}</span></div>
        </div>
      )}
    </div>
  );
}
