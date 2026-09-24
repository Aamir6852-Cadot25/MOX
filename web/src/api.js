async function call(method, url, body) {
  const r = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const e = new Error((await r.json().catch(() => ({}))).detail || r.statusText);
    e.status = r.status;
    throw e;
  }
  return r.json();
}

export const api = {
  me: () => call("GET", "/api/auth/me"),
  login: (username, password) => call("POST", "/api/auth/login", { username, password }),
  logout: () => call("POST", "/api/auth/logout"),
  latest: () => call("GET", "/api/scans/latest"),
  scanStart: (path) => call("POST", "/api/scans/start", { path }),
  scanStatus: (id) => call("GET", `/api/scans/${id}/status`),
  scan: (path) => call("POST", "/api/scans", path ? { path } : {}),
  assets: () => call("GET", "/api/assets"),
  asset: (id) => call("GET", `/api/assets/${id}`),
  override: (id, body) => call("PUT", `/api/assets/${id}/override`, body),
  settings: () => call("GET", "/api/settings"),
  fixes: () => call("GET", "/api/fixes"),
  fixPreview: (finding_id) => call("POST", "/api/fixes/preview", { finding_id }),
  fixApply: (id, note) => call("POST", `/api/fixes/${id}/apply`, { note }),
  cbom: () => call("GET", "/api/cbom"),
  roadmap: () => call("GET", "/api/roadmap"),
  attest: (sector) => call("GET", `/api/attest?sector=${sector}`),
  sectors: () => call("GET", "/api/sectors"),
  audit: () => call("GET", "/api/audit"),
  report: () => call("GET", "/api/report"),
  setSettings: (body) => call("PUT", "/api/settings", body),
};

export const tierColor = (t) => (t === "Critical" ? "#B42318" : t === "High" ? "#D9822B" : t === "Medium" ? "#C9A227" : "#2E9E5B");
// UI evidence-state words for stored confidence values (DB values unchanged).
export const EVIDENCE = { high: "Observed", medium: "Declared", low: "Declared, unverified" };
export const evidence = (c) => EVIDENCE[c] || c;
export const tierClass = (t) => (t === "Critical" ? "red" : t === "High" || t === "Medium" ? "amb" : "min");
