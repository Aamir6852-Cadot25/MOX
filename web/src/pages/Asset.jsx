import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import Icon from "../components/Icon.jsx";
import { Badge, Evidence, Tier, Verdict } from "../components/Marks.jsx";
import { Disclosure } from "../components/Motion.jsx";
import { useConfirm } from "../motion.js";

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
            <span><i style={{ background: "var(--pri-line)" }} />{sigOnly ? "Signature trust life (X)" : "Data life (X)"}</span>
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
  const load = () => api.asset(id).then(setA).catch((e) => setErr(e.status === 404
    ? `${e.message}. It may belong to an older scan`
    : `${e.message}. Reload the page; if it persists, check the server log`));
  useEffect(() => {
    setA(null);
    load();
  }, [id]);
  if (err) return <div className="p-6"><div className="errbox">Could not load asset {id}: {err}. The <Link to="/queue">work queue</Link> lists the latest assets.</div></div>;
  if (!a) return <div className="p-6 hint">Loading asset {id}</div>;

  const b = a.breakdown, m = b.mosca;
  const first = a.findings[0];
  const save = async (body) => { setA(await api.override(a.id, { x: m.x, criticality: b.criticality, ...body })); onChanged(); };  // throws on failure: the caller shows "Not saved"
  const planes = [...new Set(a.locations.map((l) => l.plane))];
  const nFiles = new Set(a.locations.map((l) => l.file)).size;
  const top = b.threats[0];
  const fixable = a.fix_finding ? { finding_id: a.fix_finding } : null; // server-checked: a fixer produces a patch
  const rep = a.replacements[0];

  return (
    <div className="split">
      <div className="lft">
        <div className="crumb"><Link to="/queue">Work queue</Link><span>›</span><span className="mono">asset {a.id}</span></div>
        <div className="asset-hd">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 className="mono">{a.label}</h1>
            {a.fingerprint && <div className="spki mono">SPKI SHA-256 {a.fingerprint.slice(0, 32)}…</div>}
            <div className="tags">
              {planes.map((p) => <Badge key={p}>Plane: {p}</Badge>)}
              <Badge family={b.criticality === 3 ? "crit" : "plain"}>Criticality {CRIT[b.criticality]}</Badge>
              <Evidence grade={b.evidence} label={`Evidence: ${b.evidence_label}`} />
              {a.verify_first && <Badge family="high">Verify first</Badge>}
            </div>
          </div>
          <Verdict verdict={a.verdict} />
        </div>

        {top ? (
          <div className={`alert${top === "forgery" || top === "undetermined" ? " warn" : ""}`}>
            <div style={{ flex: 1 }}>
              {b.threats.map((t) => <div key={t} style={{ marginBottom: 4 }}><div className="ti">{THREAT[t][0]}</div><div className="de">{THREAT[t][1]}</div></div>)}
              {b.purposes?.length > 0 && (
                <div className="de" style={{ marginTop: 8 }}>
                  <Disclosure summary={<>Declared purpose at {b.purposes.length} location{b.purposes.length === 1 ? "" : "s"}:{" "}
                    {[...new Set(b.purposes.map((p) => p.purpose))].join(", ")}</>}>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                      {b.purposes.map((p, i) => <li key={i}><span className="mono">{p.file}{p.line ? `:${p.line}` : ""}</span> {p.purpose}: {p.evidence}</li>)}
                    </ul>
                  </Disclosure>
                </div>)}
            </div>
            {fixable && a.verdict !== "ACCEPT" && <Link className="bp-btn" to={`/fix/${fixable.finding_id}`}><Icon name="wrench" />Open fix</Link>}
          </div>
        ) : (
          m.exposure == null ? (
            <div className="alert warn"><div><div className="ti">No algorithm identified: use not verified</div>
              <div className="de">MOX found this library or package but no call into it, so it cannot say which algorithm
                is in use or whether it is quantum-vulnerable. {a.reason}.</div></div></div>
          ) : (
            <div className="alert calm"><div><div className="ti">No quantum or classical weakness recorded</div>
              <div className="de">{a.reason}. Re-assess at the next scan.</div></div></div>
          )
        )}

        <div className="bp-card">
          <div className="card-h"><h2>Locations: what breaks if this asset changes</h2>
            <span className="note mono">{a.findings.length} finding{a.findings.length === 1 ? "" : "s"} → 1 asset, {nFiles} file{nFiles === 1 ? "" : "s"}</span></div>
          <table className="bp-table">
            <thead><tr><th style={{ width: 110 }}>Plane</th><th>Location</th><th style={{ width: 110 }}>Change type</th><th style={{ width: 60 }}></th></tr></thead>
            <tbody>
              {a.locations.map((l) => (
                <tr key={l.finding_id}>
                  <td>{l.plane}</td>
                  <td className="mono" style={{ color: "var(--ink)", wordBreak: "break-all" }}>{l.file}{l.line ? `:${l.line}` : ""}</td>
                  <td><Badge>{CHANGE[l.plane] || "Review"}</Badge></td>
                  <td>{l.fixable ? <Link to={`/fix/${l.finding_id}`}>Fix</Link>
                    : <span className="hint" title="No automatic fix for this location: change it by hand; the next scan verifies it">manual</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="g2">
          <div className="bp-card">
            <div className="card-h"><h2>NIST status</h2><span className="note">{first.nist_source ? "cited below" : "no table entry"}</span></div>
            <div className="card-b">
              <div className="nist3">
                {[["Now", first.nist_now], ["After 2030", first.nist_2030], ["After 2035", first.nist_2035]].map(([k, v]) => (
                  <div key={k} className={NIST_B[v] || ""}><div className="k">{k}</div><div className="v">{(v || "unknown").replace("_", " ")}</div></div>
                ))}
              </div>
              <div className="cite">
                {b.terms[0].citation?.length ? <>Source: {b.terms[0].citation.join("; ")}. </> : null}
                {first.nist_notes || ""}
                {[...new Map(a.findings.filter((f) => f.nist_notes && f.algorithm !== first.algorithm)
                  .map((f) => [f.algorithm, f.nist_notes])).entries()].map(([alg, n]) => <span key={alg}> {alg}: {n}.</span>)}
                {a.findings.length > 1 && <> Shown for <span className="mono">{first.file}</span>; the score uses the worst status across all locations (<span className="mono">{b.base_status.replace("_", " ")}</span>).</>}
              </div>
            </div>
          </div>
          <WhyScore a={a} onCrit={(c) => save({ criticality: c })} />
        </div>

        <div className="bp-card">
          <div className="card-h"><h2>Evidence chain</h2><span className="note">fact, analysis, recommendation</span></div>
          <div className="card-b">
            <div className="chain">
              {[
                ["Fact", `${a.algorithm}${a.key_size ? ` key, ${a.key_size} bit` : ""}, seen in ${nFiles} file${nFiles === 1 ? "" : "s"}. Evidence: ${b.evidence_label.toLowerCase()}${b.evidence === "unverified" ? ": a library that can do this, use not proven" : b.evidence === "textual" ? ": a string match, not a parsed artefact" : ""}.`],
                ["Normalised", `${a.algorithm}${a.key_size ? `-${a.key_size}` : ""}, ${QUANTUM[b.quantum]}${a.fingerprint ? `, SPKI ${a.fingerprint.slice(0, 8)}…` : ""}`],
                ["Analysis", `NIST ${b.base_status.replace("_", " ")} now. Risk ${a.score} (${a.tier}). Mosca exposure ${m.exposure == null ? "not applicable (no identified algorithm)" : `${signed(m.exposure)} yrs`}. CMCS ${b.cmcs.score}/10.`],
                ["Recommendation", `${a.verdict}${rep ? `: ${rep.from} to ${rep.to}` : ""}, wave ${a.wave} of 5`],
              ].map(([k, v], i, all) => (
                <div key={k}>
                  <div className={`ch-link${i === all.length - 1 ? " out" : ""}`}><div className="k">{k}</div><div className="v">{v}</div></div>
                  {i < all.length - 1 && <div className="tick" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <aside className="rgt">
        <MoscaCard a={a} onX={(x) => save({ x })} />
        <CmcsCard c={b.cmcs} />
        <div className="card-h"><h2>Recommended replacement</h2></div>
        <div className="card-b flex flex-col gap-2">
          {rep ? (
            <div className="rep">
              <div className="to mono">{rep.to}</div>
              <div className="fr2">replaces {rep.from}</div>
              {a.replacements.slice(1).map((r) => <div key={r.from + r.to} className="fr2">and {r.from} with <span className="mono">{r.to}</span></div>)}
              {a.size_notes.map((n) => <div key={n} className="nt">{n}</div>)}
            </div>
          ) : <div className="hint">No replacement is mapped for {a.algorithm}. {a.reason}.</div>}
          <div>
            <div className="lbl" style={{ marginBottom: 0 }}>Migration wave, this asset</div>
            <div className="wstrip" role="list">
              {[1, 2, 3, 4, 5].map((w) => <div key={w} role="listitem" className={w === a.wave ? "here" : ""}
                aria-current={w === a.wave ? "step" : undefined}>{w === a.wave ? `Wave ${w}` : w}</div>)}
            </div>
            <div className="hint" style={{ marginTop: 8 }}>{a.wave_reason ? a.wave_reason.charAt(0).toUpperCase() + a.wave_reason.slice(1) + "." : ""}</div>
          </div>
          <div className="hint"><Verdict verdict={a.verdict} /> {a.reason}.</div>
          {fixable && a.verdict !== "ACCEPT" && <Link className="bp-btn pri" style={{ justifyContent: "center" }} to={`/fix/${fixable.finding_id}`}><Icon name="wrench" />Open fix and verify</Link>}
          {!fixable && a.verdict === "MIGRATE" && (
            <div className="hint">No automatic fix for this asset. Change it by hand{rep ? <>: {rep.from} to <span className="mono">{rep.to}</span></> : null}.
              Then run a scan from <Link to="/scan">New Scan</Link>; the re-scan shows whether it cleared.</div>)}
          <Link className="bp-btn" style={{ justifyContent: "center" }} to="/roadmap">Open roadmap</Link>
        </div>
      </aside>
    </div>
  );
}
