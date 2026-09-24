/**
 * D9: the one dark surface in the product, used only for the scan ledger, the code editor,
 * JSON/CBOM/attestation previews and the command palette. Everything else stays light.
 */
export default function TerminalSurface({ children, className = "", ...rest }) {
  return <div className={`term-surface ${className}`.trim()} {...rest}>{children}</div>;
}
