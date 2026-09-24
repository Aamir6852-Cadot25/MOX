import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Check, Tier, Verdict } from "../components/Marks.jsx";
import Icon from "../components/Icon.jsx";

import { Pager, Search, usePaged } from "../lib.jsx";

const TIERS = ["Critical", "High", "Medium", "Low"];

export default function Report({ summary }) {
  const [d, setD] = useState(null);
  const p = usePaged(d?.findings || [], (f) => `${f.label} ${f.tier} ${f.verdict}`);
  useEffect(() => { api.report().then(setD).catch(() => setD(false)); }, [summary]);
  if (d === false) return <div className="p-6 dim">Run a scan first.</div>;
  if (!d) return <div className="p-6 dim">Building report…</div>;
  const c = d.counts, v = d.verdicts;
  const Sec = ({ n, t, children }) => <div className="panel p-4"><div className="h mb-2">{n}. {t}</div>{children}</div>;
  return (
    <div className="p-4 max-w-[1000px] mx-auto flex flex-col gap-4">
      <div className="panel p-4 flex items-center gap-4 flex-wrap">
        <div><div className="text-xl font-semibold">Compliance Report</div>
          <div className="dim">Target <span className="mono">{d.target}</span>, scan <span className="mono">#{d.scan.id}</span>, generated <span className="mono">{d.generated}</span></div></div>
        <div className="flex-1" />
        <a className="btn" style={{ width: 220, textDecoration: "none" }} href="/api/report/download"><Icon name="download" />Download report (PDF)</a>
      </div>
      <Sec n={1} t="Auditor's Declaration"><div className="dim">[Placeholder — to be completed by the certifying auditor: name, organisation, accreditation number, date and signature.]</div></Sec>
      <Sec n={2} t="Executive Summary">{d.summary}</Sec>
      <Sec n={3} t="Scope of Audit">{d.scope}</Sec>
      <Sec n={4} t="Tools Used">
        <div className="grid md:grid-cols-2 gap-x-6">
          <div>{d.planes.map(([n, t]) => <div key={n} className="kv"><span>{n}</span><span className="dim">{t}</span></div>)}</div>
          <div>{d.standards.map((s) => <div key={s} className="kv"><span>{s}</span></div>)}</div>
        </div>
      </Sec>
      <div className="panel">
        <div className="flex justify-between items-center px-4 py-3 border-b border-[var(--line)]"><div className="h">5. Findings</div><Search p={p} placeholder="Search findings…" /></div>
        {p.shown.map((f, i) => (
          <div key={i} className="row" style={{ cursor: "default", gridTemplateColumns: "1fr 60px 80px 90px 60px" }}>
            <span>{f.label}</span><span className="sc">{f.score}</span><span><Tier tier={f.tier} /></span><span><Verdict verdict={f.verdict} /></span><span className="dim">wave {f.wave}</span>
          </div>
        ))}
        <Pager p={p} />
      </div>
      <Sec n={6} t="Risk Rating">
        <div className="grid grid-cols-4 gap-3">{TIERS.map((t) => <div key={t}><div className="text-2xl font-semibold">{d.tiers[t]}</div><div className="dim text-[12px]">{t}</div></div>)}</div>
      </Sec>
      <Sec n={7} t="Compliance / Closure Status">
        <div className="flex gap-2 flex-wrap items-center">
          {["MIGRATE", "CONTAIN", "ACCEPT"].map((k) => <span key={k} className="flex items-center gap-1"><Verdict verdict={k} /><span className="mono">{v[k]}</span></span>)}
          <span className="dim ml-2">{c.fixes_cleared} fix(es) verified cleared by re-scan against this scan
            {c.fixes_not_in_effect ? `; ${c.fixes_not_in_effect} applied but not fully in effect` : ""}
            {c.unverified_accepts ? `; ${c.unverified_accepts} ACCEPT on unverified evidence` : ""}</span>
        </div>
      </Sec>
    </div>
  );
}
