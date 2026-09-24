import { useEffect, useState } from "react";
import { api } from "../api.js";

export default function Cbom({ summary }) {
  const [c, setC] = useState(null);
  useEffect(() => { api.cbom().then(setC).catch(() => setC(false)); }, [summary]);
  if (c === false) return <div className="p-6 dim">Run a scan first.</div>;
  if (!c) return <div className="p-6 dim">Building CBOM…</div>;
  const prop = (x, k) => x.properties.find((p) => p.name === "mox:" + k)?.value;
  return (
    <div className="p-5 max-w-[1300px] mx-auto flex flex-col gap-4">
      <div className="panel p-5 flex items-center gap-4 flex-wrap">
        <div><div className="text-xl font-bold">Cryptographic Bill of Materials</div>
          <div className="dim">CycloneDX {c.spec} · version {c.version} · {c.components} cryptographic assets</div></div>
        <span className={`chip`}>{c.valid ? "schema valid" : "schema INVALID"}</span>
        <div className="flex-1" />
        <a className="btn" style={{ width: 220, textDecoration: "none" }} href="/api/cbom/download">Download CBOM (JSON)</a>
      </div>
      {!c.valid && <div className="panel p-4 red mono text-[12px]">{c.errors.join("\n")}</div>}
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="panel p-4">
          <div className="h mb-2">Components</div>
          {c.bom.components.map((x) => (
            <div key={x["bom-ref"]} className="kv"><span>{x.name} <span className="dim">· {x.cryptoProperties.assetType}</span></span>
              <span>{prop(x, "tier")} · {prop(x, "verdict")} · wave {prop(x, "wave")}</span></div>
          ))}
        </div>
        <div className="panel p-4"><div className="h mb-2">JSON preview <span className="dim font-normal">(first 2 components)</span></div>
          <pre className="mono text-[11px] dim overflow-auto" style={{ maxHeight: 520 }}>{JSON.stringify({ ...c.bom, components: c.bom.components.slice(0, 2) }, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
