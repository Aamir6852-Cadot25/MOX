import { createElement } from "react";
import { ICONS } from "../vendor/lucide/icons.js";

/**
 * Lucide icon from the vendored set (Part C4). size: "nav" (16px) or "inline" (14px), both tokens.
 * An icon with no visible text next to it must be given a label; it becomes role="img" with aria-label and title.
 */
export default function Icon({ name, size = "inline", label }) {
  const node = ICONS[name];
  if (!node) throw new Error(`icon "${name}" is not vendored in src/vendor/lucide/icons.js`);
  const px = size === "nav" ? "var(--ic-nav)" : "var(--ic-inline)";
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true, focusable: "false" };
  return (
    <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
      style={{ width: px, height: px }} {...a11y}>
      {label && <title>{label}</title>}
      {node.map(([tag, attrs], i) => createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}
