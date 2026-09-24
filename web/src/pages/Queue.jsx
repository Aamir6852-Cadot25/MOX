import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, tierClass } from "../api.js";

const TABS = [["all", "All"], ["MIGRATE", "Migrate"], ["CONTAIN", "Contain"], ["ACCEPT", "Accept"], ["verify", "Verify first"]];
const match = (a, t) => t === "all" || (t === "verify" ? a.verify_first : a.verdict === t);

export default function Queue({ summary }) {
  const [assets, setAssets] = useState([]);
  const [tab, setTab] = useState("all");
  const nav = useNavigate();
  useEffect(() => { api.assets().then(setAssets); }, [summary]);
  const shown = assets.filter((a) => match(a, tab));
  return (
    <div className="p-5 max-w-[1100px] mx-auto">
      <div className="panel pt-4">
        <div className="flex justify-between items-center px-4 pb-3 border-b border-[#1d2b26]">
          <div className="h">Work queue <span className="dim font-normal">— sorted by risk score</span></div>
          <div className="flex gap-2">
            {TABS.map(([k, l]) => (
              <button key={k} className={"filt" + (tab === k ? " on" : "")} onClick={() => setTab(k)}>
                {l} {assets.filter((a) => match(a, k)).length}
              </button>
            ))}
          </div>
        </div>
        <div className="row dim text-[11px]" style={{ cursor: "default" }}>
          <span>Asset</span><span className="text-center">Score</span><span>Tier</span><span>Confidence</span><span>Verdict</span>
        </div>
        {shown.map((a) => (
          <div key={a.id} className="row" onClick={() => nav(`/asset/${a.id}`)}>
            <div>
              <div style={{ color: "#e2ece7" }}>{a.label}{a.verify_first && <span className="pill CONTAIN ml-2">verify first</span>}</div>
              <div className="sub">{a.summary} · wave {a.wave}</div>
            </div>
            <div className={`sc ${tierClass(a.tier)}`}>{a.score}</div>
            <div className={tierClass(a.tier)}>{a.tier}</div>
            <div className="dim">{a.breakdown.confidence}</div>
            <div><span className={`pill ${a.verdict}`}>{a.verdict}</span></div>
          </div>
        ))}
        {!shown.length && <div className="p-6 dim">Nothing here{assets.length ? "" : " — run a scan from the Dashboard"}.</div>}
      </div>
    </div>
  );
}
