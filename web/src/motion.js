// C2 motion helpers. Durations are read from the tokens in styles/tokens.css, never written here.
import { useEffect, useRef, useState } from "react";

export const COPY_HOLD_MS = 1200; // C2 table: the "Copied" label holds for 1.2 s (a hold time, not a transition)

export function token(name) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v.endsWith("ms") ? parseFloat(v) : v.endsWith("s") ? parseFloat(v) * 1000 : 0;
}

export const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeOut = (k) => 1 - (1 - k) ** 3;

/** Animate a number from `from` to `to` over `ms`, calling set(v) each frame. Returns a cancel function. */
export function tween(from, to, ms, set) {
  let raf = 0;
  const t0 = performance.now();
  const tick = (now) => {
    const k = Math.min(1, (now - t0) / ms);
    set(from + (to - from) * easeOut(k));
    if (k < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

// Last value shown per metric, kept across remounts: after a re-scan the dashboard mounts again, and the change
// must still count from the old value. The first value ever shown is painted directly (never on first paint).
const shown = new Map();

/**
 * Number change (C2): counts from the previous value of metric `key` to `value` over --t-slow.
 * Reduced motion: no counting; the new value cross-fades in (opacity only, same duration).
 */
export function useCountTo(key, value) {
  const prev = shown.has(key) ? shown.get(key) : value;
  const [v, setV] = useState(prev);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    shown.set(key, value);
    if (typeof value !== "number" || typeof prev !== "number" || prev === value) return setV(value);
    if (reducedMotion()) {
      setV(value);
      setFading(true);
      const t = setTimeout(() => setFading(false), token("--t-slow"));
      return () => clearTimeout(t);
    }
    const decimals = Number.isInteger(value) && Number.isInteger(prev) ? 0 : 1;
    return tween(prev, value, token("--t-slow"), (x) => setV(Number(x.toFixed(decimals))));
  }, [key, value]);
  return [v, fading];
}

/**
 * Copy / save confirm (C2): the label swaps for COPY_HOLD_MS, then back. No toast.
 * fire() shows `done`; fire("Copy failed") shows a different outcome, so a failure is never labelled a success.
 */
export function useConfirm(idle, done) {
  const [txt, setTxt] = useState(null);
  const t = useRef(0);
  useEffect(() => () => clearTimeout(t.current), []);
  const fire = (label = done) => { setTxt(label); clearTimeout(t.current); t.current = setTimeout(() => setTxt(null), COPY_HOLD_MS); };
  return [txt ?? idle, fire];
}
