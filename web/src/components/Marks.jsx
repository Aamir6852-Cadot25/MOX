import Icon from "./Icon.jsx";

/**
 * Part C3: one badge component, one geometry (.b, tokens --badge-*). The colour family is the only variable.
 * Tiers also carry a Lucide severity mark, so Critical / High / Medium / Low differ by shape as well as hue
 * (greyscale print and colour-vision deficiency).
 */
export function Badge({ family = "plain", icon, title, children }) {
  return <span className={`b ${family}`} title={title}>{icon && <Icon name={icon} />}{children}</span>;
}

const TIER = { Critical: ["crit", "octagon-x"], High: ["high", "triangle-alert"], Medium: ["med", "circle-alert"],
  Low: ["low", "circle-dot"] };
export function Tier({ tier, children }) {
  const [family, icon] = TIER[tier] || ["plain"];
  return <Badge family={family} icon={icon}>{tier}{children}</Badge>;
}

const VERDICT = { MIGRATE: "crit", CONTAIN: "med", ACCEPT: "safe" };
export function Verdict({ verdict }) {
  return <Badge family={VERDICT[verdict] || "plain"}>{verdict}</Badge>;
}

const EVIDENCE = { observed: "obs", declared: "plain", unverified: "plain", textual: "plain" };
export function Evidence({ grade, label }) {
  return <Badge family={EVIDENCE[grade] || "plain"} title="How the crypto was seen; separate from severity">{label}</Badge>;
}

/** A pass / fail status mark: icon plus text, never the icon alone. */
export function Check({ ok, children }) {
  return (
    <span className={ok ? "mark-ok" : "mark-bad"} style={{ display: "inline-flex", alignItems: "center", gap: "var(--s2)" }}>
      <Icon name={ok ? "check" : "x"} label={ok ? "passes" : "fails"} />{children}
    </span>
  );
}
