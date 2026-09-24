import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import Icon from "../components/Icon.jsx";
import { Badge, Evidence, Tier, Verdict } from "../components/Marks.jsx";
import { Disclosure } from "../components/Motion.jsx";
import { token, useConfirm } from "../motion.js";
import { recommend } from "../data/pqc_alternatives.js";

const cls = (l) => (l.startsWith("+++") || l.startsWith("---") || l.startsWith("@@") ? "hdr" : l[0] === "+" ? "add" : l[0] === "-" ? "del" : "");
const CLAIM = { "in-effect": ["In effect", "min"], "not-in-effect": ["Not in effect", "red"], "not-verified": ["Not verified", "amb"] };
const RESULT = { cleared: "Finding cleared", "still-present": "Finding still present", "not-in-effect": "Applied, but not fully in effect" };
const STEPS = [["Patch previewed", "Diff generated from the rule for this finding"], ["Analyst approved", "Approval and review note audited"],
  ["Applied with backup", "Original saved next to the file as .bak"], ["Re-scanned", "Same planes re-run on the changed file"]];

/** Recommended alternatives (Task 3): a compact comparison table, the recommended row highlighted. */
function Alternatives({ algorithm, verdict, hndl, criticality }) {
  const r = recommend(algorithm, { verdict, hndl, criticality });
  if (!r) return <div className="hint">No PQC/hybrid alternative is tabled for {algorithm}.</div>;
  return (
    <>
      <table className="bp-table" style={{ width: "100%" }}>
        <thead><tr><th>Option</th><th>Kind</th><th>Standard</th><th>Size (bytes)</th><th>Speed</th><th>Effort</th></tr></thead>
        <tbody>
          {r.options.map((o) => (
            <tr key={o.name} style={o === r.recommended ? { background: "var(--brand-soft)" } : undefined}>
              <td className="mono">{o.name}{o === r.recommended && <Badge family="plain" title="Recommended for this asset"> recommended</Badge>}</td>
              <td>{o.kind}</td>
              <td className="mono">{o.standard}</td>
              <td className="mono">{o.pk ? `pk ${o.pk}` : ""}{o.ct ? `, ct ${o.ct}` : ""}{o.sig ? `, sig ${o.sig}` : ""}{o.size === null && !o.pk ? "–" : ""}</td>
              <td>{o.speed}</td>
              <td>{o.effort}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="hint" style={{ marginTop: "var(--s2)" }}>Recommended because: {r.reason}.</div>
    </>
  );
}

// Every number on this page is a server value from breakdown (see docs/SCORING.md); nothing is recomputed
// here except the Mosca preview while an analyst types, which is replaced by the server's answer on save.
const NIST_B = { disallowed: "crit", not_approved: "high", deprecated: "high", approved: "low", hybrid: "low" };
const CRIT = { 1: "1 low", 2: "2 normal", 3: "3 mission-critical" };
const CHANGE = { certificates: "Re-issue", configs: "Config change", code: "Code change", dependencies: "Upgrade",
  containers: "Rebuild image", binaries: "Vendor update", tls: "Endpoint config" };
const QUANTUM = { shor: "Shor-breakable", grover: "Grover-weakened", none: "not quantum-weakened" };
const TERM = {
  base: (t) => `Base: NIST status ${t.basis.replace("_", " ")}`,
  quantum: (t) => `Quantum: ${QUANTUM[t.basis]}`,
  evidence: (t) => `Evidence: ${EV_LABEL[t.basis]}`,
  subtotal: () => "Subtotal",
  criticality: (t) => `Criticality ${CRIT[t.basis]}`,
  confidence: (t) => `Detector confidence: ${t.basis}`,
};
const EV_LABEL = { observed: "observed", declared: "declared", unverified: "declared, unverified", textual: "textual" };
const THREAT = {
  hndl: ["Harvest-now, decrypt-later exposure",
    "Traffic or data protected by this key can be recorded today and decrypted once a cryptographically relevant quantum computer exists."],
  forgery: ["Signature forgery after a quantum computer exists",
    "Nothing can be harvested; the risk is a forged signature being accepted once a quantum computer exists. It matters for as long as these signatures must be trusted."],
  undetermined: ["Purpose not declared: HNDL or forgery not asserted",
    "Shor-breakable, but no location says whether this key signs or encrypts, so MOX does not count it as harvest-now or forgery exposure. Find where the key is used; the next scan scores what it finds."],
  classical: ["Weak today, without any quantum computer",
    "Disallowed or broken under current NIST guidance. This needs no quantum computer to exploit."],
};
const fmt = (v, op) => (op === "×" ? `×${v.toFixed(2).replace(/0$/, "")}` : op === "=" ? `${v}` : `+${v}`);
const signed = (n) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

function WhyScore({ a, onCrit }) {
  const b = a.breakdown;
  const t = Object.fromEntries(b.terms.map((r) => [r.term, r]));
  const product = `${t.subtotal.value} × ${t.criticality.value} × ${t.confidence.value}`;
  const rounded = b.exact !== a.score;
  return (
    <div className="bp-card">
      <div className="card-h"><h2>Why this score</h2><span className="note">risk only; Mosca and CMCS are separate</span></div>
      <div className="card-b" style={{ paddingTop: 8 }}>
        <div className="brk">
          {b.terms.map((r) => (
            <div key={r.term} className={`brk-r${r.term === "subtotal" ? " sub" : ""}`}
              title={r.citation?.length ? `Source: ${r.citation.join("; ")}` : r.note || ""}>
              {TERM[r.term](r)}
              {r.term === "criticality" && (
                <select aria-label="Business criticality" value={b.criticality} onChange={(e) => onCrit(+e.target.value)}>
                  {[3, 2, 1].map((c) => <option key={c} value={c}>{CRIT[c]}</option>)}
                </select>)}
              {r.note && <span className="bn">{r.note}</span>}
              <span className="bv mono">{fmt(r.value, r.op)}</span>
            </div>
          ))}
          <div className="brk-r tot">
            Risk score <Tier tier={a.tier} />
            <span className="bv mono">{product} = {rounded ? `${b.exact} ≈ ` : ""}{a.score}</span>
          </div>
        </div>
        {t.base.citation?.length > 0 && <div className="cite">Base status source: {t.base.citation.join("; ")}.</div>}
      </div>
    </div>
  );
}

function MoscaCard({ a, onX }) {
  const m = a.breakdown.mosca;
  const [x, setX] = useState(m.x);
  useEffect(() => setX(m.x), [m.x]);
  const deb = useRef(0);
  const [savedLabel, confirmSaved] = useConfirm("", "Saved");
  const edit = (set, save) => (e) => {
    const v = e.target.value === "" ? null : Math.max(0, Math.min(50, Math.round(+e.target.value)));
    set(v ?? "");
    clearTimeout(deb.current);
    if (v != null) deb.current = setTimeout(() => Promise.resolve(save(v)).then(() => confirmSaved(), () => confirmSaved("Not saved")), 400);
  };
  if (m.exposure == null)
    return (
      <>
        <div className="card-h"><h2>Mosca check</h2><span className="note">not applicable</span></div>
        <div className="card-b flex flex-col gap-2">
          <div className="verdict-line">Mosca does not apply: {m.reason}. There is no algorithm to place on the
            quantum timeline, so no exposure is computed. Find a call into it first; if one is found, the next scan scores it.</div>
          <div className="hint">Z is <span className="mono">{m.z}</span> yrs for the organisation; <Link to="/settings">change it in Settings</Link>.</div>
        </div>
      </>
    );
  const X = x === "" ? m.x : x, Z = m.z, Y = m.y;
  const exp = X + Y - Z;
  const span = Math.max(X + Y, Z) * 1.08 || 1;
  const pct = (v) => `${(100 * v) / span}%`;
  const threats = a.breakdown.threats;
  const sigOnly = threats.includes("forgery") && !threats.includes("hndl");
  const broken = a.breakdown.base_status === "disallowed";
  let cls = "", line;
  if (exp > 0)
    line = <>X + Y = {X + Y} &gt; Z = {Z}: <b>exposed by {exp} yrs</b>. {sigOnly
      ? "Signatures made with this key must still be trusted after a quantum computer can forge them."
      : "Data protected today is still secret when it can be decrypted."}</>;
  else if (broken) {
    cls = "warn";
    line = <>X + Y = {X + Y} ≤ Z = {Z}: not quantum-exposed. It is <b>already classically broken</b> (disallowed
      today), which is why it is still wave {a.wave}. Mosca measures the quantum deadline; this asset fails without one.</>;
  } else {
    cls = "safe";
    line = <>X + Y = {X + Y} ≤ Z = {Z}: not quantum-exposed by {signed(-exp).replace("+", "")} yrs of margin.</>;
  }
  return (
    <>
      <div className="card-h"><h2>Mosca check</h2><span className="note mono">X + Y &gt; Z</span></div>
      <div className="card-b">
        <div className="mosca">
          <div className="mbox"><div className="mv mono">{X}</div><div className="mk">X<br />{sigOnly ? "trust life" : "data life"}</div></div>
          <div className="mop">+</div>
          <div className="mbox"><div className="mv mono">{Y}</div><div className="mk">Y<br />migration</div></div>
          <div className="mop">vs</div>
          <div className="mbox"><div className="mv mono">{Z}</div><div className="mk">Z<br />quantum</div></div>
          <div className="mop">=</div>
          <div className={`mbox res${exp > 0 ? "" : " safe"}`}><div className="mv mono">{signed(exp)}</div><div className="mk">yrs<br />exposed</div></div>
        </div>
        <div className="tl" role="img" aria-label={`Timeline: data life ${X} years then migration ${Y} years, quantum horizon at ${Z} years, exposure ${exp} years`}>
          <div className="tl-ax mono">
            <span className="l" style={{ left: 0 }}>now</span>
            <span style={{ left: pct(Z) }}>Z {Z}y</span>
            {X + Y !== Z && <span className="r" style={{ left: pct(X + Y) }}>{X + Y}y</span>}
          </div>
          <div className="tl-tr">
            <div className="tl-x" style={{ width: pct(X) }} />
            <div className="tl-y" style={{ left: pct(X), width: pct(Y) }} />
            <div className="tl-z" style={{ left: pct(Z) }} />
            {exp > 0 && <div className="tl-e" style={{ left: pct(Z), width: pct(exp) }} />}
          </div>
          <div className="tl-key">
            <span><i style={{ background: "var(--brand-line)" }} />{sigOnly ? "Signature trust life (X)" : "Data life (X)"}</span>
            <span><i style={{ background: "var(--high-line)" }} />Migration (Y)</span>
            <span><i style={{ background: "var(--ink)", width: 2 }} />Quantum horizon (Z)</span>
            {exp > 0 && <span><i style={{ background: "var(--crit-ink)" }} />Exposed</span>}
          </div>
        </div>
        <div className={`verdict-line ${cls}`}>{line}</div>
        <div className="fields">
          <div className="fr"><label htmlFor="fx">X {sigOnly ? "signature trust life" : "data shelf life"}</label>
            <input id="fx" className="mono" type="number" min="0" max="50" value={x} onChange={edit(setX, onX)} /><span className="u">yrs</span>
            <span className="hint" aria-live="polite" style={{ minWidth: 48 }}>{savedLabel}</span></div>
          <div className="hint">{m.x_basis}</div>
          <div className="fr"><label>Y migration time</label><span className="mono" style={{ fontSize: 11 }}>{Y}</span><span className="u">yrs</span></div>
          <div className="hint">{m.y_basis}; see Migration complexity below</div>
          <div className="fr"><label>Z quantum horizon</label><span className="mono" style={{ fontSize: 11 }}>{Z}</span><span className="u">yrs</span></div>
          <div className="hint">Organisation-wide; it re-scores every asset. <Link to="/settings">Change it in Settings</Link>.</div>
        </div>
      </div>
    </>
  );
}

function CmcsCard({ c }) {
  return (
    <>
      <div className="card-h"><h2>Migration complexity</h2><span className="note">CMCS</span></div>
      <div className="card-b">
        <div className="flex items-baseline gap-2">
          <span className="big mono">{c.score}</span><span className="mono dim">/10</span>
          <span style={{ fontSize: 11.5, color: "var(--ink-2)" }}>{c.basis}</span>
        </div>
        <div className="hint" style={{ marginTop: 4 }}>How hard this asset is to migrate, independent of how risky it is.</div>
        <div className="meter">
          <div className="meter-tr"><div className="meter-fl" style={{ width: `${c.score * 10}%` }} /></div>
          <div className="meter-ax"><span>Re-issue only</span><span>Vendor-blocked</span></div>
        </div>
        <div className="brk" style={{ marginTop: 8 }}>
          {c.components.map((p) => (
            <div key={p.term} className="brk-r"><span style={{ textTransform: "capitalize" }}>{p.term}</span>
              <span className="bn">{p.basis}</span><span className="bv mono">+{p.value}</span></div>
          ))}
          <div className="brk-r tot">CMCS{c.clamped ? " (clamped to 1–10)" : ""}<span className="bv mono">{c.score}</span></div>
        </div>
      </div>
    </>
  );
}

export default function Asset({ onChanged }) {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [err, setErr] = useState("");
  const [fix, setFix] = useState(null);
  const [fixErr, setFixErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [ripple, setRipple] = useState(false);
  const load = () => api.asset(id).then(setA).catch((e) => setErr(e.status === 404
    ? `${e.message}. It may belong to an older scan`
    : `${e.message}. Reload the page; if it persists, check the server log`));
  useEffect(() => {
    setA(null); setFix(null); setFixErr(""); setNote("");
    load();
  }, [id]);
  useEffect(() => {
    if (a?.fix_finding) api.fixPreview(a.fix_finding).then(setFix).catch((e) => setFixErr(e.message));
  }, [a?.fix_finding]);
  if (err) return <div className="p-6"><div className="errbox">Could not load asset {id}: {err}. The <Link to="/findings">work queue</Link> lists the latest assets.</div></div>;
  if (!a) return <div className="p-6 hint">Loading asset {id}</div>;

  const b = a.breakdown, m = b.mosca;
  const first = a.findings[0];
  const save = async (body) => { setA(await api.override(a.id, { x: m.x, criticality: b.criticality, ...body })); onChanged(); };  // throws on failure: the caller shows "Not saved"
  const nFiles = new Set(a.locations.map((l) => l.file)).size;
  const top = b.threats[0];
  const hndl = b.threats?.includes("hndl");
  const fixable = a.fix_finding;
  const step = fix && fix.status !== "previewed" ? 4 : 1;

  const apply = async () => {
    setBusy(true); setFixErr("");
    try {
      const updated = await api.fixApply(fix.id, note);
      setFix(updated);
      if (updated.status === "cleared") { setRipple(true); setTimeout(() => setRipple(false), token("--t-slow")); }
      onChanged();
    } catch (e) { setFixErr(e.message); }
    setBusy(false);
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="crumb"><Link to="/findings">Findings</Link><span>›</span><span className="mono">asset {a.id}</span></div>
      <div className="asset-hd">
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 className="mono">{a.label}</h1>
          <div className="hint" style={{ marginTop: 4 }}>{top ? THREAT[top][0] : a.reason}.</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Verdict verdict={a.verdict} />
          <span className="flex items-center gap-2"><Tier tier={a.tier} /><span className="mono" style={{ fontSize: 17, fontWeight: 500 }}>{a.score}</span></span>
        </div>
      </div>

      <div className="grid gap-3" style={{ gridTemplateColumns: "280px minmax(0,1fr) 300px" }}>
        <div className="flex flex-col gap-3">
          <div className="bp-card">
            <div className="card-h"><h2>Why</h2></div>
            <div className="card-b hint">{top ? THREAT[top][1] : `${a.reason}. Re-assess at the next scan.`}</div>
          </div>
          <div className="bp-card">
            <div className="card-h"><h2>NIST status</h2></div>
            <div className="card-b">
              <div className="nist3">
                {[["Now", first.nist_now], ["2030", first.nist_2030], ["2035", first.nist_2035]].map(([k, v]) => (
                  <div key={k} className={NIST_B[v] || ""}><div className="k">{k}</div><div className="v">{(v || "unknown").replace("_", " ")}</div></div>
                ))}
              </div>
            </div>
          </div>
          <div className="bp-card">
            <MoscaCard a={a} onX={(x) => save({ x })} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bp-card">
            <div className="card-h"><h2>Recommended alternatives</h2><span className="note">by risk, size and migration effort</span></div>
            <div className="card-b"><Alternatives algorithm={a.algorithm} verdict={a.verdict} hndl={hndl} criticality={b.criticality} /></div>
          </div>
          <div className="bp-card">
            <div className="card-h"><h2>Patch</h2></div>
            <div className="card-b flex flex-col gap-3">
              {!fixable && <div className="hint">No automatic fix for this asset. Change it by hand using a recommended alternative above,
                then re-scan from <Link to="/scan">Discover</Link>; the re-scan shows whether it cleared.</div>}
              {fixable && !fix && !fixErr && <div className="hint">Generating patch…</div>}
              {fixErr && <div className="errbox">{fixErr}</div>}
              {fix && (
                <>
                  <div className="panel py-2"><div className="diff">{fix.diff.split("\n").slice(0, -1).map((l, i) => <div key={i} className={cls(l)}>{l || " "}</div>)}</div></div>
                  {fix.status === "previewed" && (
                    <div className="flex gap-3 items-center">
                      <input className="flex-1" placeholder="Review note (optional)" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
                      <button className="btn" style={{ width: 200 }} disabled={busy} onClick={apply}><Icon name="check" />Approve and apply</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <aside className="flex flex-col gap-3">
          <div className="bp-card verify-card">
            {ripple && <span className="verify-ring" />}
            <div className="card-h"><h2>Verify</h2></div>
            <div className="card-b">
              {STEPS.map(([t, d], i) => (
                <div key={t} className="steps flex gap-3 mb-3" style={{ opacity: i < step ? 1 : 0.5 }}>
                  <span className={`n${i < step ? " done" : ""}`}>{i + 1}</span>
                  <div><div className="h">{t}</div><div className="dim text-[12px]">{d}</div></div>
                </div>
              ))}
              {fix && fix.status !== "previewed" && (
                <div className="panel p-3">
                  <div className={`h ${fix.status === "cleared" ? "" : "red"}`}>{RESULT[fix.status] || fix.status}</div>
                  {fix.status === "cleared" && <div className="hint">Finding cleared: verified by re-scan.</div>}
                  <Link className="bp-btn pri" style={{ marginTop: "var(--s2)", justifyContent: "center" }} to="/dashboard">Back to Quantum Risk</Link>
                </div>
              )}
            </div>
          </div>
          <div className="bp-card">
            <div className="card-h"><h2>Audit trail</h2></div>
            <div className="card-b"><div className="mono text-[11px] dim">{(fix?.trail || []).map((t, i) => <div key={i}>{t.ts.slice(11, 19)} {t.text}</div>)}</div></div>
          </div>
          <div className="bp-card"><div className="card-b">
            <Disclosure summary="Score breakdown"><WhyScore a={a} onCrit={(c) => save({ criticality: c })} /></Disclosure>
          </div></div>
          <div className="bp-card"><div className="card-b">
            <Disclosure summary="Locations">
              <table className="bp-table">
                <thead><tr><th style={{ width: 90 }}>Plane</th><th>Location</th><th style={{ width: 90 }}>Change</th></tr></thead>
                <tbody>
                  {a.locations.map((l) => (
                    <tr key={l.finding_id}>
                      <td>{l.plane}</td>
                      <td className="mono" style={{ color: "var(--ink)", wordBreak: "break-all" }}>{l.file}{l.line ? `:${l.line}` : ""}</td>
                      <td><Badge>{CHANGE[l.plane] || "Review"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="hint" style={{ marginTop: "var(--s2)" }}>{a.findings.length} finding{a.findings.length === 1 ? "" : "s"} → 1 asset, {nFiles} file{nFiles === 1 ? "" : "s"}.</div>
            </Disclosure>
          </div></div>
        </aside>
      </div>
    </div>
  );
}
