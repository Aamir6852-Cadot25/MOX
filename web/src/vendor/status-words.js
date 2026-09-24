import { useEffect, useRef, useState } from "react";

/** D11: MOX's own vocabulary for short waits that have no richer live signal to show instead
 * (Code Edit "Verify", CBOM build/export, attestation signing, report render, history delta).
 * The scan ledger streams real per-plane facts already, so it never uses these words. */
export const STATUS_WORDS = [
  "Fingerprinting assets…", "Cross-checking NIST tables…",
  "Correlating findings…", "Weighing the exposure window…",
  "Reading the ledger…", "Verifying the fix…",
  "Chasing ciphertext…", "Sealing the attestation…",
  "Counting the waves…", "Tracing the evidence chain…",
];

const DELAY_MS = 400; // avoid flicker on fast calls
const CYCLE_MS = 1800;

/** One word, appearing only past 400ms of `active`, cycling every 1.8s; null the instant `active`
 * goes false so the caller can swap in the real result immediately. No progress implied. */
export function useStatusWord(active) {
  const [word, setWord] = useState(null);
  const idx = useRef(0);

  useEffect(() => {
    if (!active) {
      setWord(null);
      idx.current = 0;
      return;
    }
    let interval;
    const delay = setTimeout(() => {
      setWord(STATUS_WORDS[idx.current]);
      interval = setInterval(() => {
        idx.current = (idx.current + 1) % STATUS_WORDS.length;
        setWord(STATUS_WORDS[idx.current]);
      }, CYCLE_MS);
    }, DELAY_MS);
    return () => {
      clearTimeout(delay);
      clearInterval(interval);
    };
  }, [active]);

  return word;
}
