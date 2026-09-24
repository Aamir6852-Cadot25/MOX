import { useEffect, useState } from "react";
import { api } from "../api.js";
import { Failed } from "../components/States.jsx";
import { Check, Tier, Verdict } from "../components/Marks.jsx";
import Icon from "../components/Icon.jsx";


export default function Cbom({ summary }) {
  const [c, setC] = useState(null);
  const load = () => { setC(null); api.cbom().then(setC).catch((e) => setC({ error: e })); };
  useEffect(load, [summary]);
  if (c?.error) return <Failed what="the CBOM" err={c.error} onRetry={load} />;
  if (!c) return <div className="p-6 dim">Building CBOM…</div>;
  const prop = (x, k) => x.properties.find((p) => p.name === "mox:" + k)?.value;
  return (
    <div className="p-4 max-w-[1300px] mx-auto flex flex-col gap-4">
      <div className="panel p-4 flex items-center gap-4 flex-wrap">
        <div><div className="text-xl font-bold">Cryptographic Bill of Materials</div>
          <div className="dim">CycloneDX <span className="mono">{c.spec}</span>, version <span className="mono">{c.version}</span>, <span className="mono">{c.components}</span> cryptographic assets</div></div>
        <Check ok={c.valid}>{c.valid ? "Schema valid (CycloneDX 1.6, bundled schema)" : "Schema invalid"}</Check>
        <div className="flex-1" />
        <a className="btn" style={{ width: 220, textDecoration: "none" }} href="/api/cbom/download"><Icon name="download" />Download CBOM (JSON)</a>
      </div>
      {!c.valid && <div className="panel p-4 red mono text-[12px]">{c.errors.join("\n")}</div>}
      <div className="grid gap-4 items-start lg:grid-cols-[1.4fr_1fr]">
        <div className="panel p-4">
          <div className="h mb-2">Components</div>
          {c.bom.components.map((x) => (
            <div key={x["bom-ref"]} className="kv"><span>{x.name} <span className="dim">({x.cryptoProperties.assetType})</span></span>
              <span className="flex items-center gap-2"><Tier tier={prop(x, "tier")} /><Verdict verdict={prop(x, "verdict")} /><span>wave {prop(x, "wave")}</span></span></div>
          ))}
        </div>
        <div className="panel p-4"><div className="h mb-2">JSON preview <span className="dim font-normal">(one component, capped at 12 lines)</span></div>
          <pre className="mono text-[11px] dim overflow-auto">{(() => {
            const withFields = c.bom.components.find((x) => x.cryptoProperties?.algorithmProperties?.mode
              || x.cryptoProperties?.protocolProperties?.version) || c.bom.components[0];
            return JSON.stringify(withFields, null, 2).split("\n").slice(0, 12).join("\n");
          })()}</pre>
        </div>
      </div>
    </div>
  );
}
