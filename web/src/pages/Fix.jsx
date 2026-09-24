import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";

const cls = (l) => (l.startsWith("+++") || l.startsWith("---") || l.startsWith("@@") ? "hdr" : l[0] === "+" ? "add" : l[0] === "-" ? "del" : "");
const STEPS = [["Patch previewed", "Diff generated from the rule for this finding"], ["Analyst approved", "Approval and review note audited"],
  ["Applied with backup", "Original saved next to the file as .bak"], ["Re-scanned", "Same planes re-run on the changed file"]];

function List() {
  const [rows, setRows] = useState(null);
  useEffect(() => { api.fixes().then(setRows); }, []);
  if (!rows) return <div className="p-6 dim">Loading…</div>;
  return (
    <div className="p-5 max-w-[1100px] mx-auto"><div className="panel p-4">
      <div className="h mb-2">Auto-fixable findings <span className="dim font-normal">— from the latest scan</span></div>
      {rows.length === 0 && <div className="dim">Nothing left to fix automatically.</div>}
      {rows.map((f) => (
        <Link key={f.id} to={`/fix/${f.id}`} className="kv" style={{ textDecoration: "none" }}>
          <span>{f.algorithm}{f.key_size ? `-${f.key_size}` : ""} · {f.file}:{f.line}</span><span className="min">Preview fix →</span>
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
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    setFix(null); setErr("");
    if (findingId) api.fixPreview(+findingId).then(setFix).catch((e) => setErr(e.message));
  }, [findingId]);
  if (!findingId) return <List />;
  if (err) return <div className="p-6"><div className="panel p-4 amb">{err}</div><Link to="/fix" className="dim text-[12px]">← All fixes</Link></div>;
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
          <div className="text-xl font-bold mt-2" style={{ color: "#f2f7f4" }}>{fix.algorithm}{fix.key_size ? `-${fix.key_size}` : ""} at <span className="mono">{fix.file}:{fix.line}</span></div>
          <div className="dim">Proposed change for 1 file · {fix.lines_changed} changed lines · nothing is written until you approve</div>
        </div>
        <div className="panel py-2"><div className="diff">{lines.map((l, i) => <div key={i} className={cls(l)}>{l || " "}</div>)}</div></div>
        <div className="panel p-4 text-[13px]"><div className="h mb-1">Why this change</div>
          <div className="dim">{interim
            ? "RSA-3072 is only an interim step: it stays quantum-vulnerable. The comment marks the line for the ML-DSA-65 hybrid migration."
            : fix.file.endsWith(".conf")
              ? "Legacy protocols and ciphers are removed and the hybrid X25519MLKEM768 group is offered first, with X25519 as fallback."
              : "MD5 and SHA-1 are broken for collision resistance; SHA-256 is a drop-in replacement for the digest."}</div></div>
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
              <div className="mono font-bold" style={{ width: 26, height: 26, borderRadius: 13, background: i < step ? "#79d9ae" : "#1a2a24", color: "#0b1511", textAlign: "center", lineHeight: "26px" }}>{i + 1}</div>
              <div><div className="font-bold">{t}</div><div className="dim text-[12px]">{d}</div></div>
            </div>
          ))}
          {applied && (
            <div className="panel p-3" style={{ borderColor: fix.cleared ? "#79d9ae" : "#f0b43c" }}>
              <div className={`h ${fix.cleared ? "min" : "amb"}`}>{fix.cleared ? "Finding cleared" : "Finding still present"}</div>
              <div className="dim text-[12px]">{fix.cleared
                ? `Re-scan of ${fix.file} no longer reports ${fix.algorithm}${fix.key_size ? `-${fix.key_size}` : ""} at this location. Assets, scores and the CBOM were refreshed.`
                : "The re-scan still reports this finding; the backup is kept."}</div>
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
