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
// must still count from the old value. A metric never seen before counts up from 0 (Task 6: first view, 400ms).
const shown = new Map();

/**
 * Number change (C2 + Task 6): counts from the previous value of metric `key` to `value`, over --t-slow on
 * change or --t-count (400ms) on first view. Reduced motion: no counting; the new value cross-fades in.
 */
export function useCountTo(key, value) {
  const seenBefore = shown.has(key);
  const prev = seenBefore ? shown.get(key) : 0;
  const [v, setV] = useState(typeof value === "number" ? prev : value);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    shown.set(key, value);
    if (typeof value !== "number" || typeof prev !== "number" || prev === value) return setV(value);
    const dur = seenBefore ? token("--t-slow") : token("--t-count");
    if (reducedMotion()) {
      setV(value);
      setFading(true);
      const t = setTimeout(() => setFading(false), dur);
      return () => clearTimeout(t);
    }
    const decimals = Number.isInteger(value) && Number.isInteger(prev) ? 0 : 1;
    return tween(prev, value, dur, (x) => setV(Number(x.toFixed(decimals))));
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
