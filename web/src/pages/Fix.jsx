import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";

const cls = (l) => (l.startsWith("+++") || l.startsWith("---") || l.startsWith("@@") ? "hdr" : l[0] === "+" ? "add" : l[0] === "-" ? "del" : "");
const CLAIM = { "in-effect": ["In effect", "min"], "not-in-effect": ["Not in effect", "red"], "not-verified": ["Not verified", "amb"] };
const RESULT = { cleared: "Finding cleared", "still-present": "Finding still present", "not-in-effect": "Applied, but not fully in effect" };
const STEPS = [["Patch previewed", "Diff generated from the rule for this finding"], ["Analyst approved", "Approval and review note audited"],
  ["Applied with backup", "Original saved next to the file as .bak"], ["Re-scanned", "Same planes re-run on the changed file"]];

function List() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState("");
  const load = () => { setErr(""); api.fixes().then(setRows).catch((e) => setErr(e.message)); };
  useEffect(load, []);
  if (err) return <div className="p-6"><div className="errbox">Could not load the fix list: {err}. <button className="linkbtn" onClick={load}>Retry</button></div></div>;
  if (!rows) return <div className="p-6 dim">Loading…</div>;
  return (
    <div className="p-5 max-w-[1100px] mx-auto"><div className="panel p-4">
      <div className="h mb-2">Auto-fixable findings <span className="dim font-normal">— from the latest scan</span></div>
      {rows.length === 0 && (
        <div className="dim">No finding in the latest scan has an automatic fix. The remaining MIGRATE assets need a manual
          change; each asset page names the replacement. <Link className="link" to="/queue?verdict=MIGRATE">Open the MIGRATE queue</Link>,
          change the code or config, then <Link className="link" to="/scan">re-scan</Link> to verify.</div>)}
      {rows.map((f) => (
        <Link key={f.id} to={`/fix/${f.id}`} className="kv" style={{ textDecoration: "none" }}>
          <span>{f.algorithm}{f.key_size ? `-${f.key_size}` : ""} · {f.file}:{f.line}</span><span className="link">Preview fix →</span>
        </Link>
      ))}
    </div></div>
  );
}

export default function Fix({ onChanged }) {
  const { findingId } = useParams();
  const nav = useNavigate();
  const [fix, setFix] = useState(null);
  const [err, setErr] = useState("");
  const [errStatus, setErrStatus] = useState(0);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setFix(null); setErr("");
    if (findingId) api.fixPreview(+findingId).then(setFix).catch((e) => { setErr(e.message); setErrStatus(e.status); });
  }, [findingId]);
  if (!findingId) return <List />;
  if (err) return (
    <div className="p-6 flex flex-col gap-3" style={{ maxWidth: 760 }}>
      <div className="errbox">{errStatus === 422
        ? <>MOX has no automatic fix for this location ({err}). Change it by hand using the replacement on the asset page,
          then re-scan; the re-scan shows whether the finding cleared.</>
        : <>Could not prepare the fix: {err}. Nothing was written to disk.</>}</div>
      <div className="flex gap-2">
        <button className="bp-btn" onClick={() => nav(-1)}>Back to the asset</button>
        <Link className="bp-btn" to="/fix">Auto-fixable findings</Link>
        <Link className="bp-btn" to="/scan">Re-scan</Link>
      </div>
    </div>
  );
  if (!fix) return <div className="p-6 dim">Generating patch…</div>;

  const applied = fix.status !== "previewed";
  const step = applied ? 4 : 1;
  const apply = async () => { setBusy(true); try { setFix(await api.fixApply(fix.id, note)); onChanged(); } catch (e) { setErr(e.message); } setBusy(false); };
  const lines = fix.diff.split("\n").slice(0, -1);
  const interim = fix.diff.includes("interim");
  return (
    <div className="p-5 grid gap-4 max-w-[1500px] mx-auto lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-4">
        <div className="panel p-5">
          <Link to="/fix" className="dim text-[12px]">← All fixes</Link>
          <div className="text-xl font-bold mt-2">{fix.algorithm}{fix.key_size ? `-${fix.key_size}` : ""} at <span className="mono">{fix.file}:{fix.line}</span></div>
          <div className="dim">Proposed change for 1 file · {fix.lines_changed} changed lines · nothing is written until you approve</div>
        </div>
        <div className="panel py-2"><div className="diff">{lines.map((l, i) => <div key={i} className={cls(l)}>{l || " "}</div>)}</div></div>
        {fix.claims?.length > 0 ? (
          <div className="panel p-4 text-[13px]">
            <div className="h mb-1">What this patch does{applied ? ", checked against the file on disk after the re-scan" : ", checked against the patched text before you approve"}</div>
            {fix.claims.map((c) => (
              <div key={c.claim} style={{ padding: "6px 0", borderBottom: "1px solid var(--line)" }}>
                <div><b className={CLAIM[c.state][1]}>{CLAIM[c.state][0]}</b> {c.claim}{c.limit ? " (limit of this patch)" : ""}</div>
                <div className="dim text-[12px]">{c.detail}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel p-4 text-[13px]"><div className="h mb-1">Why this change</div>
            <div className="dim">{interim
              ? "RSA-3072 is only an interim step: it stays quantum-vulnerable. The comment marks the line for the ML-DSA-65 hybrid migration."
              : "MD5 and SHA-1 are broken for collision resistance; SHA-256 is a drop-in replacement for the digest. The re-scan confirms the line changed; it cannot confirm callers accept the longer digest."}</div></div>
        )}
        {!applied && (
          <div className="panel p-4 flex gap-3 items-center">
            <input className="flex-1" placeholder="Review note (optional)" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
            <button className="btn" style={{ width: 200 }} disabled={busy} onClick={apply}>Approve &amp; apply</button>
            <button className="btn ghost" style={{ width: 100 }} onClick={() => nav("/fix")}>Cancel</button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4">
        <div className="panel p-4">
          <div className="h mb-3">Fix and verify</div>
          {STEPS.map(([t, d], i) => (
            <div key={t} className="flex gap-3 mb-3" style={{ opacity: i < step ? 1 : 0.4 }}>
              <div className="mono font-bold" style={{ width: 26, height: 26, borderRadius: 13, background: i < step ? "#1B2A41" : "#EEF1F5", color: i < step ? "#fff" : "#1B2A41", textAlign: "center", lineHeight: "26px" }}>{i + 1}</div>
              <div><div className="font-bold">{t}</div><div className="dim text-[12px]">{d}</div></div>
            </div>
          ))}
          {applied && (
            <div className="panel p-3" style={{ borderColor: "#1B2A41" }}>
              <div className={`h ${fix.status === "cleared" ? "" : "red"}`}>{RESULT[fix.status] || fix.status}</div>
              <div className="dim text-[12px]">{fix.status === "still-present"
                ? "The re-scan still reports this finding; the backup is kept."
                : `Re-scan of ${fix.file} no longer reports ${fix.algorithm}${fix.key_size ? `-${fix.key_size}` : ""} at this location. Assets, scores and the CBOM were refreshed.`}
                {fix.status === "not-in-effect" && " Part of the change cannot take effect as written; see the list on the left. It is not counted as a cleared fix."}
                {(fix.claims || []).some((c) => c.state === "not-verified") && " Some effects depend on the server build and are marked not verified."}</div>
            </div>
          )}
        </div>
        <div className="panel p-4">
          <div className="h mb-2">Audit trail</div>
          <div className="mono text-[11px] dim">{(fix.trail || []).map((t, i) => <div key={i}>{t.ts.slice(11, 19)} {t.text}</div>)}</div>
        </div>
      </div>
    </div>
  );
}
