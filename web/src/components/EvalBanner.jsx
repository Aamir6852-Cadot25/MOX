/**
 * Thin evaluation-build notice, above every page's header (shared, one place to remove later):
 * delete the <EvalBanner /> render in App.jsx and the three "banner-h" offsets it left in index.css
 * (.side top, .topbar top, .main margin-top) to take it out again.
 */
export default function EvalBanner() {
  return (
    <div className="eval-banner">
      MOX v0.4 — SIH 2026 evaluation build. Demo data only, not an operational deployment.
    </div>
  );
}
