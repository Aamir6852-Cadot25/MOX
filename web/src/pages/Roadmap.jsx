import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, tierClass } from "../api.js";

export default function Roadmap({ summary }) {
  const [w, setW] = useState(null);
  useEffect(() => { api.roadmap().then(setW); }, [summary]);
  if (!w) return <div className="p-6 dim">Loading…</div>;
  return (
    <div className="p-5 max-w-[1500px] mx-auto">
      <div className="text-xl font-bold mb-1" style={{ color: "#f2f7f4" }}>Migration roadmap</div>
      <div className="dim mb-4">Five waves built from each asset's assigned wave (tier + Mosca exposure).</div>
      <div className="grid gap-3 lg:grid-cols-5">
        {w.map((x) => (
          <div key={x.wave} className="panel p-3">
            <div className="mono min text-[11px]">WAVE {x.wave}</div>
            <div className="h">{x.name}</div>
            <div className="dim text-[11px] mb-2">{x.goal} · {x.count} asset{x.count !== 1 ? "s" : ""}</div>
            {x.assets.length === 0 && <div className="dim text-[12px]">No assets</div>}
            {x.assets.map((a) => (
              <Link key={a.id} to={`/asset/${a.id}`} className="node block mb-2" style={{ textDecoration: "none" }}>
                <div className="f">{a.label}</div>
                <div className="text-[11px]"><span className={tierClass(a.tier)}>{a.tier} {a.score}</span> · <span className="dim">{a.verdict}</span></div>
                {a.replacement && <div className="dim text-[11px]">→ {a.replacement}</div>}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
