/** The CipherX wave path (web/src/vendor/cipherx/mark.svg), shared by the mark and the splash loading line. */
export const WAVE_D = "M2 14c1.667-4 3.333-6 5-6s3.333 6 5 6 3.333-6 5-6 3.333 2 5 6";

/** The CipherX wave mark, inlined so it can pick up currentColor like Icon.jsx. */
export default function Mark({ size = 18 }) {
  return (
    <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" style={{ width: size, height: size }} aria-hidden="true" focusable="false">
      <path d={WAVE_D} />
    </svg>
  );
}
