import { Fragment, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import Icon from "../components/Icon.jsx";
import { Badge, Evidence, Tier, Verdict } from "../components/Marks.jsx";
import { Disclosure } from "../components/Motion.jsx";
import PageHeader from "../components/PageHeader.jsx";
import YearsBar from "../components/YearsBar.jsx";
import { token, useConfirm } from "../motion.js";
import { recommend } from "../data/pqc_alternatives.js";

const cls = (l) => (l.startsWith("+++") || l.startsWith("---") || l.startsWith("@@") ? "hdr" : l[0] === "+" ? "add" : l[0] === "-" ? "del" : "");
const RESULT = { cleared: "Finding cleared", "still-present": "Finding still present", "not-in-effect": "Applied, but not fully in effect" };
const STEPS = [["Patch previewed", "Diff generated from the rule for this finding"], ["Analyst approved", "Approval and review note audited"],
  ["Applied with backup", "Original saved next to the file as .bak"], ["Re-scanned", "Same planes re-run on the changed file"]];
const NIST_WORD = { disallowed: "disallowed", not_approved: "not approved", deprecated: "deprecated", approved: "approved", hybrid: "hybrid", unknown: "unrated" };
const CRIT = { 1: "1 low", 2: "2 normal", 3: "3 mission-critical" };
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

/** A path wraps only at "/", never inside a segment (Task B1). */
function WrapPath({ path }) {
  const parts = path.split("/");
  return <>{parts.map((seg, i) => (i === 0 ? seg : <Fragment key={i}>/<wbr />{seg}</Fragment>))}</>;
}

/** Which alternatives-table option the generated patch actually applies, detected from its own diff text
 * (Task 3): the Decision card must never highlight an option the patch does not produce. */
function optionFromDiff(diff, options) {
  if (!diff || !options) return null;
  if (diff.includes("X25519MLKEM768")) return options.find((o) => o.name.startsWith("Hybrid")) || null;
  if (diff.includes("AES-256-GCM")) return options.find((o) => o.name === "AES-256-GCM") || null;
  if (/SHA-?256/i.test(diff)) return options.find((o) => o.name === "SHA-256") || null;
  return null;
}

/** Decision card (Task B1): one-sentence why, the usage-aware recommended replacement, then the alternatives. */
function Decision({ a, top, fix }) {
  const b = a.breakdown;
  const hndl = b.threats?.includes("hndl");
  const r = recommend(a.algorithm, { verdict: a.verdict, hndl, forgery: b.threats?.includes("forgery"), criticality: b.criticality });
  const why = top ? THREAT[top][0] : a.reason;
  const patched = r ? optionFromDiff(fix?.diff, r.options) : null;
  const recommended = patched || r?.recommended;
  const reason = patched ? "this is exactly what the generated patch applies" : r?.reason;
  return (
    <div className="bp-card">
      <div className="card-h"><h2>Decision</h2></div>
      <div className="card-b flex flex-col gap-3">
        <div className="hint">{why}. {r ? <>Replace with <span className="mono">{recommended.name}</span>: {reason}.</> : null}</div>
        {!r && <div className="hint">No PQC/hybrid alternative is tabled for <span className="mono">{a.algorithm}</span>.</div>}
        {r && (
          <table className="bp-table alt-table">
            <colgroup><col style={{ width: "26%" }} /><col style={{ width: "12%" }} /><col style={{ width: "16%" }} />
              <col style={{ width: "22%" }} /><col style={{ width: "12%" }} /><col style={{ width: "12%" }} /></colgroup>
            <thead><tr><th>Option</th><th>Kind</th><th>Standard</th><th>Size</th><th>Speed</th><th>Effort</th></tr></thead>
            <tbody>
              {r.options.map((o) => (
                <tr key={o.name} style={o === recommended ? { background: "var(--brand-soft)" } : undefined}>
                  <td className="mono" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {o.name}{o === recommended && <Badge family="plain" title="Recommended for this asset"> recommended</Badge>}</td>
                  <td>{o.kind}</td>
                  <td className="mono">{o.standard}</td>
                  <td className="mono">
                    {o.pk && <>pk {o.pk}</>}{o.pk && o.ct && <> &middot; </>}{o.ct && <>ct {o.ct}</>}
                    {(o.pk || o.ct) && o.sig && <> &middot; </>}{o.sig && <>sig {o.sig}</>}
                    {!o.pk && !o.ct && !o.sig && "–"}
                  </td>
                  <td>{o.speed}</td>
                  <td>{o.effort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function WhyScore({ a, onCrit }) {
  const b = a.breakdown;
  const t = Object.fromEntries(b.terms.map((r) => [r.term, r]));
  const product = `${t.subtotal.value} × ${t.criticality.value} × ${t.confidence.value}`;
  const rounded = b.exact !== a.score;
  return (
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
      {t.base.citation?.length > 0 && <div className="cite">Base status source: {t.base.citation.join("; ")}.</div>}
    </div>
  );
}

function MoscaDetail({ a, onX }) {
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
    return <div className="hint">Mosca does not apply: {m.reason}. There is no algorithm to place on the quantum timeline.</div>;
  const X = x === "" ? m.x : x, Z = m.z, Y = m.y;
  const threats = a.breakdown.threats;
  const sigOnly = threats.includes("forgery") && !threats.includes("hndl");
  return (
    <>
      <YearsBar m={{ ...m, x: X }} />
      <div className="fields">
        <div className="fr"><label htmlFor="fx">X {sigOnly ? "signature trust life" : "data shelf life"}</label>
          <input id="fx" className="mono" type="number" min="0" max="50" value={x} onChange={edit(setX, onX)} /><span className="u">yrs</span>
          <span className="hint" aria-live="polite" style={{ minWidth: 48 }}>{savedLabel}</span></div>
        <div className="hint">{m.x_basis}</div>
        <div className="fr"><label>Y migration time</label><span className="mono" style={{ fontSize: 11 }}>{Y}</span><span className="u">yrs</span></div>
        <div className="hint">{m.y_basis}</div>
        <div className="fr"><label>Z quantum horizon</label><span className="mono" style={{ fontSize: 11 }}>{Z}</span><span className="u">yrs</span></div>
        <div className="hint">Organisation-wide; it re-scores every asset.</div>
      </div>
    </>
  );
}

export default function Asset({ onChanged, summary }) {
  const { id } = useParams();
  const [a, setA] = useState(null);
  const [err, setErr] = useState("");
  const [fix, setFix] = useState(null);
  const [fixErr, setFixErr] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [rescan, setRescan] = useState(null); // null | "running" | {cleared} | {error}
  const load = () => api.asset(id).then(setA).catch((e) => setErr(e.status === 404
    ? `${e.message}. It may belong to an older scan`
    : `${e.message}. Reload the page; if it persists, check the server log`));
  useEffect(() => {
    setA(null); setFix(null); setFixErr(""); setNote(""); setRescan(null);
    load();
  }, [id]);
  useEffect(() => {
    if (a?.fix_finding) api.fixPreview(a.fix_finding).then(setFix).catch((e) => setFixErr(e.message));
  }, [a?.fix_finding]);
  if (err) return <div className="page"><div className="errbox">Could not load asset {id}: {err}. The <Link to="/findings">work queue</Link> lists the latest assets.</div></div>;
  if (!a) return <div className="page hint">Loading asset {id}</div>;

  const b = a.breakdown, m = b.mosca;
  const exp = m.exposure;
  const terms = Object.fromEntries(b.terms.map((r) => [r.term, r]));
  // The finding that actually drove the risk score's worst-case base status (score.py's _worst), not just findings[0].
  const first = a.findings.find((f) => (f.nist_now || "unknown") === terms.base.basis) || a.findings[0];
  const save = async (body) => { setA(await api.override(a.id, { x: m.x, criticality: b.criticality, ...body })); onChanged(); };  // throws on failure: the caller shows "Not saved"
  const nFiles = new Set(a.locations.map((l) => l.file)).size;
  const top = b.threats[0];
  const fixable = a.fix_finding;
  const step = fix && fix.status !== "previewed" ? 4 : 1;
  const formulaLine = `${terms.subtotal.value} × ${terms.criticality.value} × ${terms.confidence.value} = ${a.score}`;
  const primaryFile = a.locations[0]?.file;
  const r = recommend(a.algorithm, { verdict: a.verdict, hndl: b.threats?.includes("hndl"), forgery: b.threats?.includes("forgery"), criticality: b.criticality });

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

  const reScanToVerify = async () => {
    setRescan("running");
    try {
      const target = summary?.scan?.target;
      if (!target) throw new Error("no scan target recorded");
      await api.scan(target);
      const list = await api.assets();
      setRescan({ cleared: !list.some((x) => x.key === a.key) });
      onChanged();
    } catch (e) { setRescan({ error: e.message }); }
  };

  return (
    <div className="page">
      <PageHeader step={<><Link to="/findings">3 Remediate</Link> {"›"} {a.label}</>} title="What exactly do we do?" />

      <div className="rmd-band">
        <span className="mono rmd-band-asset" title={a.label}>{a.label}</span>
        <Verdict verdict={a.verdict} />
        <Tier tier={a.tier} />
        <span className="mono">{a.score}</span>
        <span className="dim">Wave {a.wave}</span>
        <span className={`mono${exp > 0 ? " red" : ""}`}>{exp == null ? "not applicable" : exp > 0 ? `${exp} yrs overdue` : `${-exp} yrs left`}</span>
      </div>

      <div className="grid-12">
        <div className="col-8 flex flex-col gap-3">
          <Decision a={a} top={top} fix={fix} />

          <div className="bp-card">
            <div className="card-h"><h2>{fixable ? "Patch" : "What to change"}</h2></div>
            <div className="card-b flex flex-col gap-3">
              {fixable && !fix && !fixErr && <div className="hint">Generating patch…</div>}
              {fixErr && <div className="errbox">{fixErr}</div>}
              {fixable && fix && (
                <>
                  <div className="panel py-2 wrap-x"><div className="diff">{fix.diff.split("\n").slice(0, -1).map((l, i) => <div key={i} className={cls(l)}>{l || " "}</div>)}</div></div>
                  {fix.status === "previewed" && (
                    <div className="flex gap-3 items-center">
                      <input className="flex-1" placeholder="Review note (optional)" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
                      <button className="btn" style={{ width: 200 }} disabled={busy} onClick={apply}><Icon name="check" />Approve and apply</button>
                    </div>
                  )}
                </>
              )}
              {!fixable && (
                <>
                  <ol className="checklist">
                    <li>Replace <span className="mono">{a.algorithm}</span> with {r ? <span className="mono">{r.recommended.name}</span> : "a reviewed alternative"} in {nFiles} file{nFiles === 1 ? "" : "s"}: <WrapPath path={primaryFile} />{nFiles > 1 ? ", and the other locations below" : ""}.</li>
                    {nFiles > 1 && <li>Update every other location of this asset (see Locations in the rail).</li>}
                    <li>Re-scan to verify the finding is gone.</li>
                  </ol>
                  <button type="button" className="bp-btn pri" style={{ alignSelf: "flex-start" }} disabled={rescan === "running"} onClick={reScanToVerify}>
                    <Icon name="refresh-cw" />{rescan === "running" ? "Re-scanning…" : "Re-scan to verify"}</button>
                  {rescan && rescan !== "running" && (
                    rescan.error
                      ? <div className="errbox">{rescan.error}</div>
                      : <div className={`verdict-line ${rescan.cleared ? "safe" : ""}`}>{rescan.cleared ? "Finding cleared: not seen in the new scan." : "Still present: the new scan found this asset again."}</div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <aside className="col-4 rail-sticky flex flex-col gap-3">
          <div className="bp-card"><div className="card-b">
            <YearsBar m={m} mini />
            <div className="hint" style={{ marginTop: "var(--s2)" }}>
              {exp == null ? `Not applicable: ${m.reason}.` : exp > 0 ? `Exposed by ${exp} yrs.` : `Safe by ${-exp} yrs.`}</div>
          </div></div>
          <div className="bp-card"><div className="card-b">
            <div className="dim" style={{ fontSize: 11 }}>Score</div>
            <div className="mono" style={{ fontSize: 13 }}>{formulaLine}</div>
          </div></div>
          <div className="bp-card"><div className="card-b">
            <div className="dim" style={{ fontSize: 11 }}>Location</div>
            <div className="mono" style={{ fontSize: 12, wordBreak: "break-all" }}>{primaryFile && <WrapPath path={primaryFile} />}{a.locations[0]?.line ? `:${a.locations[0].line}` : ""}</div>
            {nFiles > 1 && <div className="hint">+ {nFiles - 1} other file{nFiles > 2 ? "s" : ""}</div>}
          </div></div>
          {fixable && (
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
          )}
          <div className="bp-card"><div className="card-b">
            <div className="dim" style={{ fontSize: 11 }}>NIST status</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)" }}>
              Now {NIST_WORD[first.nist_now] || "unrated"} &middot; 2030 {NIST_WORD[first.nist_2030] || "unrated"} &middot; 2035 {NIST_WORD[first.nist_2035] || "unrated"}
            </div>
          </div></div>
          <div className="bp-card"><div className="card-b">
            <Disclosure summary="Score and Mosca detail">
              <WhyScore a={a} onCrit={(c) => save({ criticality: c })} />
              <div style={{ marginTop: "var(--s3)" }}><MoscaDetail a={a} onX={(x) => save({ x })} /></div>
            </Disclosure>
          </div></div>
          <div className="bp-card"><div className="card-b">
            <Disclosure summary="Locations">
              <table className="bp-table">
                <thead><tr><th style={{ width: 90 }}>Plane</th><th>Location</th><th style={{ width: 90 }}>Evidence</th></tr></thead>
                <tbody>
                  {a.locations.map((l) => (
                    <tr key={l.finding_id}>
                      <td>{l.plane}</td>
                      <td className="mono" style={{ color: "var(--ink)", wordBreak: "break-all" }}><WrapPath path={l.file} />{l.line ? `:${l.line}` : ""}</td>
                      <td><Evidence grade={b.evidence} label={b.evidence_label} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="hint" style={{ marginTop: "var(--s2)" }}>{a.findings.length} finding{a.findings.length === 1 ? "" : "s"} → 1 asset, {nFiles} file{nFiles === 1 ? "" : "s"}.</div>
            </Disclosure>
          </div></div>
          <div className="bp-card"><div className="card-b">
            <Disclosure summary="Audit trail">
              <div className="mono text-[11px] dim">{(fix?.trail || []).map((t, i) => <div key={i}>{t.ts.slice(11, 19)} {t.text}</div>)}
                {!fix?.trail?.length && <div>No fix has been applied to this asset yet.</div>}</div>
            </Disclosure>
          </div></div>
        </aside>
      </div>
    </div>
  );
}
