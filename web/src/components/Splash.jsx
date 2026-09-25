import { useState } from "react";
import { contourRings } from "../data/contours.js";
import Mark, { WAVE_D } from "./Mark.jsx";

const SIZE = 360;
const C = SIZE / 2;
const RINGS = contourRings(14, SIZE);

/**
 * Launch splash, once per tab: the CipherX offset-contour ring, the MOX wordmark with the green X, and the wave
 * line that draws as the loading indicator. It leaves only on real events: the wave's animationend AND `ready`
 * (the app's own boot requests have answered). One pass, no loop.
 */
export default function Splash({ ready, onDone }) {
  const [drawn, setDrawn] = useState(false);
  const out = drawn && ready;
  return (
    <div className={`splash${out ? " out" : ""}`} role="status" aria-label="Loading MOX" aria-busy={!out}
      onTransitionEnd={(e) => { if (out && e.target === e.currentTarget) onDone(); }}>
      <svg className="splash-art" viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true" focusable="false">
        {RINGS.map((d, i) => <path key={i} className="splash-ring" d={d} pathLength="1" style={{ "--i": i }} />)}
        <g className="splash-word">
          <text x={C + 18} y={C + 20} textAnchor="end" className="splash-mo">MO</text>
          <path className="splash-x" d={`M${C + 26} ${C - 25}L${C + 64} ${C + 20}M${C + 64} ${C - 25}L${C + 26} ${C + 20}`} />
        </g>
        <path className="splash-wave" d={WAVE_D} pathLength="1" transform={`translate(${C - 48} ${C + 14}) scale(4)`}
          onAnimationEnd={() => setDrawn(true)} />
      </svg>
      <div className="splash-by"><Mark size={14} />by CipherX</div>
    </div>
  );
}
