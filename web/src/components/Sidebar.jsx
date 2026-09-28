import React from "react";
import { FileCode, Wrench, Clock } from "lucide-react";

export const PLANES = [
  ["code", "Source code", "Java, Python, Go, JS crypto calls"],
  ["dependencies", "Libraries & dependencies", "pom.xml, package.json, requirements"],
  ["binaries", "Binaries & executables", "strings in compiled files"],
  ["containers", "Containers & images", "Dockerfile, image layers"],
  ["certificates", "Certificates & keys", "X.509, PEM, PKCS#12 key sizes"],
  ["configs", "Configs & protocols", "nginx, java.security, Terraform KMS"],
  ["tls", "Live TLS endpoint", "authorised host:port probe only"],
];

export default function Sidebar({ currentPage, onNavigate, latestScan }) {
  const ranPlanes = new Set(
    latestScan?.coverage?.ran ||
      (latestScan?.scan?.planes ? Object.keys(latestScan.scan.planes) : ["code", "dependencies", "binaries", "containers", "certificates", "configs"])
  );

  return (
    <aside>
      <div className="sl">PRIMARY</div>

      <div
        className={`ni ${currentPage === "scan" ? "on" : ""}`}
        onClick={() => onNavigate("scan")}
      >
        <span className="n">1</span>
        Scan Source
      </div>

      <div
        className={`ni ${currentPage === "dash" ? "on" : ""}`}
        onClick={() => onNavigate("dash")}
      >
        <span className="n">2</span>
        Dashboard
      </div>

      <div
        className={`ni ${currentPage === "code" ? "on" : ""}`}
        onClick={() => onNavigate("code")}
      >
        <span className="n">3</span>
        Code Edit
      </div>

      <div className="sl" style={{ marginTop: "18px" }}>
        DEEP ANALYSIS
      </div>

      <div
        className={`ni ${currentPage === "cbom" ? "on" : ""}`}
        onClick={() => onNavigate("cbom")}
      >
        <FileCode size={16} />
        CBOM
      </div>

      <div
        className={`ni ${currentPage === "rem" ? "on" : ""}`}
        onClick={() => onNavigate("rem")}
      >
        <Wrench size={16} />
        Remediation
      </div>

      <div
        className={`ni ${currentPage === "hist" ? "on" : ""}`}
        onClick={() => onNavigate("hist")}
      >
        <Clock size={16} />
        History &amp; Reports
      </div>

      <div className="eng">
        <div style={{ fontWeight: 600, color: "#C9D6E3", marginBottom: "6px" }}>
          Scan planes
        </div>
        <div>
          {PLANES.map(([key, label]) => {
            const isHit = ranPlanes.has(key);
            return (
              <div key={key} className="plane-item">
                <span className={`dot ${isHit ? "" : "off"}`} />
                <span>{label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
