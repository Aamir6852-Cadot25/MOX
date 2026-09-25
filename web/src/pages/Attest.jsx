import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Failed } from "../components/States.jsx";
import { Check } from "../components/Marks.jsx";
import Icon from "../components/Icon.jsx";
import { useConfirm } from "../motion.js";

const LEAVES = ["Sector and scan date", "Asset counts: total, quantum-vulnerable, HNDL-exposed", "Verdict split — migrate / contain / accept",
  "Readiness index (0–100)", "Merkle root of the local CBOM", "Scanner version + Ed25519 signature"];
const STAYS = ["File paths, hostnames, IP addresses", "Which key is weak, and where it lives",
  "Source code and configuration", "The CBOM itself"];

function download(sector) {
  return fetch("/api/attest/export", {
    method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sector }),
  }).then((r) => r.blob()).then((b) => {
    const u = URL.createObjectURL(b);
    const l = document.createElement("a");
    l.href = u; l.download = "mox-attestation.json"; l.click();
    URL.revokeObjectURL(u);
  });
}

const SECTOR_NAMES = { power: "Power & Energy", telecom: "Telecom", government: "Government",
  banking: "Banking, Financial Services & Insurance", transport: "Transport", strategic: "Strategic & Public Enterprises" };

export default function Attest({ summary }) {
  const [sector, setSector] = useState("government");
  const [d, setD] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(true);
  const [copyLabel, confirmCopy] = useConfirm("Copy root", "Copied");
  const copyRoot = (root) => navigator.clipboard.writeText(root).then(() => confirmCopy(), () => confirmCopy("Copy blocked"));
  const load = () => {
    setBusy(true); setErr(null);
    api.attest(sector).then((r) => { setD(r); setBusy(false); })
      .catch((e) => { setErr(e); setBusy(false); });
  };
  // Sector switcher stays interactive across loads: it never unmounts, so a slow or failed
  // fetch for one sector can't strand the user on a spinner with no way back.
  useEffect(load, [summary, sector]);
  const sectorPicker = (
    <select className="chip w-full mt-1" value={sector} onChange={(e) => setSector(e.target.value)}>
      {Object.entries(d?.sectors || SECTOR_NAMES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
    </select>
  );
  if (err)
    return (
      <div className="flex flex-col gap-4" style={{ maxWidth: 420 }}>
        <Failed what="the attestation" err={err} onRetry={load} />
        <div className="panel p-4"><label className="dim block mb-1 text-[12px]">Sector</label>{sectorPicker}</div>
      </div>
    );
  if (!d) return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 420 }}>
      <div className="p-6 dim">Building attestation for {SECTOR_NAMES[sector] || sector}…</div>
      <div className="panel p-4"><label className="dim block mb-1 text-[12px]">Sector</label>{sectorPicker}</div>
    </div>
  );
  const a = d.attestation, r = a.readiness_index;
  const fields = [a, a.assets, a.verdicts, a.coverage, a.signature].reduce((n, o) => n + Object.keys(o).length, 0);
  return (
    <div className="grid gap-4 items-start lg:grid-cols-[280px_minmax(0,1fr)_280px]">
      <div className="flex flex-col gap-4">
        <div className="panel p-4">
          <div className="h">Leaves the organisation</div><div className="dim mb-2">Counts and proofs — never locations</div>
          {LEAVES.map((t) => <div key={t} className="kv"><Check ok>{t}</Check></div>)}
        </div>
        <div className="panel p-4">
          <div className="h">Never leaves</div><div className="dim mb-2">Stays in local SQLite, on-premises</div>
          {STAYS.map((t) => <div key={t} className="kv"><span className="flex items-center gap-2"><Icon name="x" label="does not leave" />{t}</span></div>)}
        </div>
      </div>
      <div className={`panel p-4${busy ? " busy" : ""}`}>
        <div className="flex items-center mb-2"><div><div className="h">attestation.json</div><div className="dim">preview — exactly what will be exported</div></div>
          <div className="flex-1" /><span className="chip">{busy ? "updating…" : `${(d.bytes / 1024).toFixed(1)} KB`}</span></div>
        <pre className="mono text-[12px] overflow-auto" style={{ maxHeight: 560 }}>{JSON.stringify(a, null, 2)}</pre>
        <div className="dim text-[11px] mt-2">No paths, hosts, key material or code: checked by the self-check on the right.</div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="panel p-4"><div className="h">Readiness index</div>
          <div className="mono text-[30px] font-bold" style={{ color: "var(--ink)" }}>{r}<span className="dim text-[16px]"> / 100</span></div>
          <div className="meter-bar"><i style={{ width: `${r}%` }} /></div>
          <div className="dim">Weighted by HNDL exposure, quantum-vulnerable share, MIGRATE share and plane coverage</div>
          <button className="btn w-full" style={{ marginTop: 12 }} disabled={!d.checks.every((c) => c.ok)}
            onClick={() => download(sector)}><Icon name="download" />Export attestation</button></div>
        <div className="panel p-4"><div className="h mb-1">Signing</div>
          <div className="kv"><span className="dim">Algorithm</span><span>{a.signature.alg}</span></div>
          <div className="kv"><span className="dim">Operator key</span><span>{a.signature.key_id}</span></div>
          <div className="kv"><span className="dim">CBOM Merkle root</span><span title={a.cbom_merkle_root}>{a.cbom_merkle_root.slice(0, 6)}…{a.cbom_merkle_root.slice(-4)}</span></div>
          <button type="button" className="bp-btn" style={{ marginTop: 8 }} aria-live="polite" onClick={() => copyRoot(a.cbom_merkle_root)}>{copyLabel}</button>
          <div className="kv"><span className="dim">Leaves</span><span>{fields} fields, 0 paths</span></div>
          <label className="dim block mt-2 text-[12px]">Sector</label>
          {sectorPicker}</div>
        <div className="panel p-4"><div className="h mb-1">Operator self-check</div>
          {d.checks.map((c) => <div key={c.name} className="kv"><Check ok={c.ok}>{c.name}</Check></div>)}</div>
      </div>
    </div>
  );
}
