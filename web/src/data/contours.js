/**
 * Offset-contour ring for the splash (after the CipherX mark): n closed blobs sharing one organic outline,
 * r(θ) = R0*(1 + Σ a*sin(kθ + φ + i*δ)), pushed inward by i*spread(θ). spread(θ) swings between almost 0 and
 * wide, so the lines pinch together in places and fan apart in others: one twisting ribbon.
 * Pure and deterministic: the same input always gives the same paths.
 */
const TERMS = [
  // [k, amplitude, phase, per-ring phase drift]
  [1, 0.05, 0.3, 0.02],
  [2, 0.14, 0.6, 0.035],
  [3, 0.08, 2.1, -0.05],
  [5, 0.03, 0.9, 0.09],
];
const spread = (t) => 0.55 + 0.5 * Math.sin(2 * t + 0.4) + 0.2 * Math.sin(3 * t + 2.2);
const SAMPLES = 72;

const r1 = (v) => Math.round(v * 10) / 10;

/** Closed Catmull-Rom spline through pts, as SVG cubic Béziers. */
function closedPath(pts) {
  const n = pts.length;
  const at = (i) => pts[(i + n) % n];
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return `${d}Z`;
}

export function contourRings(n = 14, size = 360) {
  const c = size / 2;
  const r0 = size * 0.38;
  const step = size * 0.012;
  const rings = [];
  for (let i = 0; i < n; i++) {
    const pts = [];
    for (let s = 0; s < SAMPLES; s++) {
      const t = (s / SAMPLES) * Math.PI * 2;
      const wobble = TERMS.reduce((acc, [k, a, ph, dr]) => acc + a * Math.sin(k * t + ph + i * dr), 0);
      const r = r0 * (1 + wobble) - i * step * Math.max(0.04, spread(t));
      pts.push([c + r * Math.cos(t), c + r * Math.sin(t)]);
    }
    rings.push(closedPath(pts));
  }
  return rings;
}
