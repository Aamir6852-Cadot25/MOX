import { useEffect, useState } from "react";
import { api } from "../api.js";

const LEAVES = ["Sector and scan date", "Asset counts by risk tier", "Verdict split — migrate / contain / accept",
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

export default function Attest({ summary }) {
  const [sector, setSector] = useState("government");
  const [d, setD] = useState(null);
  useEffect(() => { setD(null); api.attest(sector).then(setD).catch(() => setD(false)); }, [summary, sector]);
  if (d === false) return <div className="p-6 dim">Run a scan first.</div>;
  if (!d) return <div className="p-6 dim">Building attestation…</div>;
  const a = d.attestation, r = a.readiness_index, col = r < 35 ? "#ef6a60" : r < 55 ? "#f0b43c" : "#5fd39d";
  const fields = [a, a.assets, a.verdicts, a.coverage, a.signature].reduce((n, o) => n + Object.keys(o).length, 0);
  return (
    <div className="p-5 max-w-[1400px] mx-auto grid gap-4 lg:grid-cols-[340px_1fr_340px]">
      <div className="flex flex-col gap-4">
        <div className="panel p-4" style={{ borderColor: "#2c5a47" }}>
          <div className="h min">LEAVES THE PREMISES</div><div className="dim mb-2">Counts and proofs — never locations</div>
          {LEAVES.map((t) => <div key={t} className="kv"><span>✓ {t}</span></div>)}
        </div>
        <div className="panel p-4" style={{ borderColor: "#6b2b27" }}>
          <div className="h red">NEVER LEAVES</div><div className="dim mb-2">Stays in local SQLite, on-premises</div>
          {STAYS.map((t) => <div key={t} className="kv"><span>✕ {t}</span></div>)}
        </div>
      </div>
      <div className="panel p-4">
        <div className="flex items-center mb-2"><div><div className="h">attestation.json</div><div className="dim">preview — exactly what will be exported</div></div>
          <div className="flex-1" /><span className="chip">{(d.bytes / 1024).toFixed(1)} KB</span></div>
        <pre className="mono text-[12px] overflow-auto" style={{ color: "#cfdcd6", maxHeight: 560 }}>{JSON.stringify(a, null, 2)}</pre>
        <div className="dim mono text-[11px] mt-2">// no paths · no hosts · no key material · no code</div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="panel p-4"><div className="dim text-[11px]" style={{ letterSpacing: 1 }}>READINESS INDEX</div>
          <div className="mono text-[30px] font-bold" style={{ color: col }}>{r}<span className="dim text-[16px]"> / 100</span></div>
          <div style={{ height: 10, background: "#1b2924", borderRadius: 6, margin: "8px 0", overflow: "hidden" }}>
            <div style={{ width: `${r}%`, height: "100%", background: col }} /></div>
          <div className="dim">Weighted by HNDL exposure, quantum-vulnerable share, MIGRATE share and plane coverage</div></div>
        <div className="panel p-4"><div className="h mb-1">Signing</div>
          <div className="kv"><span className="dim">Algorithm</span><span>{a.signature.alg}</span></div>
          <div className="kv"><span className="dim">Operator key</span><span>{a.signature.key_id}</span></div>
          <div className="kv"><span className="dim">CBOM Merkle root</span><span>{a.cbom_merkle_root.slice(0, 6)}…{a.cbom_merkle_root.slice(-4)}</span></div>
          <div className="kv"><span className="dim">Leaves</span><span className="min">{fields} fields, 0 paths</span></div>
          <label className="dim block mt-2 text-[12px]">Sector</label>
          <select className="chip w-full mt-1" value={sector} onChange={(e) => setSector(e.target.value)}>
            {Object.entries(d.sectors).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select></div>
        <div className="panel p-4"><div className="h mb-1">Operator self-check</div>
          {d.checks.map((c) => <div key={c.name} className="kv"><span className={c.ok ? "min" : "red"}>{c.ok ? "✓" : "✕"} {c.name}</span></div>)}
          <button className="btn w-full" style={{ marginTop: 12 }} disabled={!d.checks.every((c) => c.ok)}
            onClick={() => download(sector)}>Export signed attestation</button></div>
      </div>
    </div>
  );
}
