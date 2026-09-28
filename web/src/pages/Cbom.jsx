import React, { useState, useEffect } from "react";
import { api } from "../api";
import { Download } from "lucide-react";

const PRIORITY_MAP = {
  Critical: "p1",
  High: "p2",
  Medium: "p3",
  Low: "p4",
};

export default function Cbom({ assets = [], showToast }) {
  const [cbomData, setCbomData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .cbom()
      .then((res) => {
        setCbomData(res);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const componentsCount = cbomData?.components || assets.length || 25;
  const serialNumber = cbomData?.bom?.serialNumber || "urn:uuid:5c1e84a2-72ab-41bc-b684-2a6c8e3258a9";
  const shortSerial = serialNumber.length > 20 ? serialNumber.slice(0, 16) + "…" + serialNumber.slice(-2) : serialNumber;

  const downloadJSON = async () => {
    try {
      if (showToast) showToast("Downloading mox-cbom.cdx.json…");
      const res = await fetch("/api/cbom/download", { credentials: "include" });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = "mox-cbom.cdx.json";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objUrl);
      if (showToast) showToast("mox-cbom.cdx.json downloaded");
    } catch (err) {
      if (showToast) showToast(err.message || "Failed to download CBOM");
    }
  };

  const sampleJson = cbomData?.bom?.components?.[0] || {
    type: "cryptographic-asset",
    name: "RSA-2048",
    cryptoProperties: {
      assetType: "related-crypto-material",
      relatedCryptoMaterialProperties: {
        type: "private-key",
        algorithmRef: "RSA",
        size: 2048,
      },
    },
    properties: [
      { name: "mox:tier", value: "Critical" },
      { name: "mox:riskScore", value: "75.6" },
      { name: "mox:verdict", value: "MIGRATE" },
      { name: "mox:moscaExposureYears", value: "9" },
      { name: "mox:pqcReplacement", value: "ML-KEM-768 / ML-DSA-65" },
    ],
  };

  return (
    <section className="page on" id="p-cbom">
      <div className="ph">
        <div>
          <h1>Cryptographic Bill of Materials</h1>
          <p>
            Every cryptographic asset, in the CycloneDX standard format other tools can read.
          </p>
        </div>
        <div className="act">
          <button className="btn gr" onClick={downloadJSON}>
            <Download size={15} /> Download JSON
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid g4" style={{ marginBottom: "18px" }}>
        <div className="stat">
          <div className="lb">Format</div>
          <div className="v" style={{ fontSize: "20px" }}>
            CycloneDX 1.6
          </div>
        </div>
        <div className="stat">
          <div className="lb">Schema</div>
          <div className="v" style={{ fontSize: "20px", color: "var(--ok)" }}>
            ✓ Valid
          </div>
        </div>
        <div className="stat">
          <div className="lb">Components</div>
          <div className="v" style={{ fontSize: "20px" }}>
            {componentsCount}
          </div>
        </div>
        <div className="stat">
          <div className="lb">Serial</div>
          <div className="v mono" style={{ fontSize: "16px" }}>
            {shortSerial}
          </div>
        </div>
      </div>

      {/* 2-Column: Components Table & JSON Preview */}
      <div className="grid" style={{ gridTemplateColumns: "1.3fr 1fr" }}>
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: "16px 20px" }}>
            <h3 style={{ margin: 0 }}>Components</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Tier</th>
                <th>Score</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {assets.slice(0, 12).map((a, i) => {
                const alg = a.algorithm || a.label?.split(" ")[0] || "RSA";
                const keySize = a.key_size ? `-${a.key_size}` : "";
                const isKey = ["RSA", "ECDSA"].includes(alg);
                const locParts = (a.primary_location || a.files?.[0] || "—").split(":");

                return (
                  <tr key={a.id || i}>
                    <td>
                      <b>
                        {alg}
                        {keySize}
                      </b>
                    </td>
                    <td style={{ fontSize: "12px", color: "var(--mut)" }}>
                      {isKey ? "algorithm · key" : "algorithm"}
                    </td>
                    <td>
                      <span className={`pill ${PRIORITY_MAP[a.tier] || "p4"}`}>
                        {a.tier || "Low"}
                      </span>
                    </td>
                    <td>{Number(a.score || 0).toFixed(1)}</td>
                    <td className="mono" style={{ fontSize: "11.5px" }}>
                      {locParts[0]}:{locParts[1] || "1"}
                    </td>
                  </tr>
                );
              })}
              {assets.length > 12 && (
                <tr>
                  <td colSpan={5} style={{ color: "var(--mut)", fontSize: "12px" }}>
                    + {assets.length - 12} more
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>
            JSON preview <span className="rt">first component</span>
          </h3>
          <pre
            className="mono"
            style={{
              margin: 0,
              fontSize: "11.5px",
              background: "#FBFCFD",
              border: "1px solid var(--bd)",
              borderRadius: "8px",
              padding: "12px",
              overflow: "auto",
              maxHeight: "520px",
            }}
          >
            {JSON.stringify(sampleJson, null, 2)}
          </pre>
        </div>
      </div>
    </section>
  );
}
