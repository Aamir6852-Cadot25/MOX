/**
 * PQC/hybrid alternatives by classical algorithm family (Task 3, MOX v2 redesign).
 * Sizes are the published FIPS values only; nothing here is measured or simulated.
 * kind: "Hybrid" | "PQC" | "Classical-upgrade". effort/speed are relative words, not benchmarks.
 */
export const FAMILIES = {
  "key-exchange": {
    match: (alg) => ["RSA", "DH", "ECDH", "X25519"].includes(alg),
    options: [
      { name: "Hybrid X25519+ML-KEM-768", kind: "Hybrid", standard: "draft (X25519MLKEM768)", pk: 1216, ct: 1120,
        speed: "Fast", effort: "Medium", when: "recommended default: classical fallback while PQ-only clients are rare" },
      { name: "ML-KEM-768", kind: "PQC", standard: "FIPS 203", pk: 1184, ct: 1088,
        speed: "Fast", effort: "Medium", when: "PQ-only key exchange once every client supports it" },
      { name: "ML-KEM-1024", kind: "PQC", standard: "FIPS 203", pk: 1568, ct: 1568,
        speed: "Fast", effort: "Medium", when: "mission-critical: a higher security level for long-lived keys" },
    ],
  },
  signature: {
    match: (alg) => ["RSA", "ECDSA", "DSA", "EdDSA"].includes(alg),
    options: [
      { name: "ML-DSA-65", kind: "PQC", standard: "FIPS 204", pk: 1952, sig: 3309,
        speed: "Fast", effort: "Medium", when: "recommended default signature replacement" },
      { name: "ML-DSA-44", kind: "PQC", standard: "FIPS 204", pk: 1312, sig: 2420,
        speed: "Fast", effort: "Medium", when: "smaller keys/signatures where ML-DSA-65's margin is not needed" },
      { name: "SLH-DSA-SHA2-128s", kind: "PQC", standard: "FIPS 205", pk: 32, sig: 7856,
        speed: "Slow", effort: "High", when: "long-lived roots: slow signing is fine, and the security proof rests only on hashes" },
    ],
  },
  hash: {
    match: (alg) => ["MD5", "SHA-1"].includes(alg),
    options: [
      { name: "SHA-256", kind: "Classical-upgrade", standard: "FIPS 180-4", size: null,
        speed: "Fast", effort: "Low", when: "recommended default: drop-in digest replacement" },
      { name: "SHA3-256", kind: "Classical-upgrade", standard: "FIPS 202", size: null,
        speed: "Moderate", effort: "Low", when: "a different construction (sponge, not Merkle-Damgard) for defence in depth" },
    ],
  },
  cipher: {
    match: (alg) => ["DES", "3DES", "RC4"].includes(alg),
    options: [
      { name: "AES-256-GCM", kind: "Classical-upgrade", standard: "FIPS 197 / SP 800-38D", size: null,
        speed: "Fast", effort: "Low", when: "recommended default: authenticated encryption, hardware-accelerated" },
    ],
  },
  "weak-cipher": {
    match: (alg) => alg === "AES", // AES-128 flagged by Grover margin
    options: [
      { name: "AES-256-GCM", kind: "Classical-upgrade", standard: "FIPS 197 / SP 800-38D", size: null,
        speed: "Fast", effort: "Low", when: "recommended default: doubles the Grover-resistant key length" },
    ],
  },
};

/** Which family an asset's algorithm falls into, or null if none of the tables apply. RSA is both a
 * key-exchange and a signature algorithm: when its only quantum threat is forgery (certificates, signing
 * keys) the replacement is a signature scheme, never a KEM. */
export function familyFor(algorithm, forgeryOnly = false) {
  if (forgeryOnly && FAMILIES.signature.match(algorithm)) return "signature";
  return Object.entries(FAMILIES).find(([, f]) => f.match(algorithm))?.[0] || null;
}

/**
 * Pick the recommended option for an asset: CONTAIN prefers Hybrid (cannot patch in place);
 * HNDL-exposed prefers the KEM first; mission-critical prefers a higher security level.
 * Returns { family, options, recommended, reason } or null if no table applies.
 */
export function recommend(algorithm, { verdict, hndl, forgery, criticality } = {}) {
  const family = familyFor(algorithm, forgery && !hndl);
  if (!family) return null;
  const options = FAMILIES[family].options;
  let recommended = options[0];
  let reason = recommended.when;
  if (family === "key-exchange") {
    if (verdict === "CONTAIN") {
      recommended = options.find((o) => o.kind === "Hybrid") || options[0];
      reason = "cannot patch in place, so the hybrid group keeps a classical fallback while the fix rolls out";
    } else if (hndl) {
      recommended = options.find((o) => o.name === "ML-KEM-768") || options[0];
      reason = "harvest-now-decrypt-later exposed: the key exchange itself is the risk, so a PQ-only KEM closes it fastest";
    }
    if (criticality === 3 && recommended.name !== "ML-KEM-1024" && family === "key-exchange") {
      const higher = options.find((o) => o.name === "ML-KEM-1024");
      if (higher && !hndl && verdict !== "CONTAIN") { recommended = higher; reason = "mission-critical: a higher security level"; }
    }
  } else if (family === "signature" && criticality === 3) {
    recommended = options.find((o) => o.name === "ML-DSA-65") || options[0];
    reason = "mission-critical: ML-DSA-65's margin over ML-DSA-44";
  }
  return { family, options, recommended, reason };
}
