import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { api, tierClass } from "../api.js";
import { Pager, Search, usePaged } from "../lib.jsx";

const TABS = [["all", "All"], ["MIGRATE", "Migrate"], ["CONTAIN", "Contain"], ["ACCEPT", "Accept"], ["verify", "Verify first"]];
const match = (a, t) => t === "all" || (t === "verify" ? a.verify_first : a.verdict === t);

export default function Queue({ summary }) {
  const [assets, setAssets] = useState([]);
  const [params] = useSearchParams();
  const [tab, setTab] = useState(() => (TABS.some(([k]) => k === params.get("verdict")) ? params.get("verdict") : "all"));
  const nav = useNavigate();
  useEffect(() => { api.assets().then(setAssets); }, [summary]);
  const p = usePaged(assets.filter((a) => match(a, tab)), (a) => `${a.label} ${a.summary} ${a.tier} ${a.verdict}`);
  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="panel pt-4">
        <div className="flex justify-between items-center gap-3 flex-wrap px-4 pb-3 border-b border-[#E3E7ED]">
          <div className="h">Work queue <span className="dim font-normal">— sorted by risk score</span></div>
          <div className="flex gap-2 items-center flex-wrap">
            <Search p={p} placeholder="Search assets…" />
            {TABS.map(([k, l]) => (
              <button key={k} className={"filt" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>
                {l} {assets.filter((a) => match(a, k)).length}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 py-2 dim text-[11px] border-b border-[#E3E7ED]">
          Evidence, separate from severity: <b>Observed</b> parsed certificate or TLS handshake; <b>Declared</b> named in code or config; <b>Declared, unverified</b> a dependency or package that can do it; <b>Textual</b> a string match in bytes.
        </div>
        <div className="row dim text-[11px]" style={{ cursor: "default" }}>
          <span>Asset</span><span className="text-center">Score</span><span title="Code Migration Complexity: how hard this asset is to migrate, independent of how risky it is">CMCS</span><span>Tier</span><span>Evidence</span><span>Verdict</span>
        </div>
        {p.shown.map((a) => (
          <div key={a.id} className="row" onClick={() => nav(`/asset/${a.id}`)}>
            <div>
              <div>{a.label}{a.verify_first && <span className="pill CONTAIN ml-2">verify first</span>}</div>
              <div className="sub">{a.summary} · wave {a.wave}</div>
            </div>
            <div className={`sc ${tierClass(a.tier)}`}>{a.score}</div>
            <div className="mono" title={a.breakdown.cmcs?.basis}>{a.breakdown.cmcs ? `${a.breakdown.cmcs.score}/10` : "—"}</div>
            <div className={tierClass(a.tier)}>{a.tier}</div>
            <div className="dim">{a.breakdown.evidence_label}</div>
            <div><span className={`pill ${a.verdict}`}>{a.verdict}</span></div>
          </div>
        ))}
        {!p.shown.length && <div className="p-6 dim">Nothing here{assets.length ? "" : " — run a scan from the Dashboard"}.</div>}
        <Pager p={p} />
      </div>
    </div>
  );
}
