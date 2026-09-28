async function call(method, url, body) {
  let r;
  try {
    r = await fetch(url, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const e = new Error("Can't reach the MOX server");
    e.network = true;
    throw e;
  }
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    const e = new Error(data.detail || r.statusText || "Request failed");
    e.status = r.status;
    throw e;
  }
  return r.json();
}

async function callForm(url, form) {
  let r;
  try {
    r = await fetch(url, { method: "POST", credentials: "include", body: form });
  } catch (err) {
    const e = new Error("Can't reach the MOX server");
    e.network = true;
    throw e;
  }
  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    const e = new Error(data.detail || r.statusText || "Upload failed");
    e.status = r.status;
    throw e;
  }
  return r.json();
}

export const api = {
  me: () => call("GET", "/api/auth/me"),
  login: (username, password) => call("POST", "/api/auth/login", { username, password }),
  logout: () => call("POST", "/api/auth/logout"),
  latest: (scanId) => call("GET", scanId ? `/api/scans/latest?scan_id=${scanId}` : "/api/scans/latest"),
  scanGet: (id) => call("GET", `/api/scans/${id}`),
  scanDelete: (id) => call("DELETE", `/api/scans/${id}`),
  scanCompare: (scanId, compareId) =>
    call("GET", `/api/scans/compare?scan_id=${scanId}${compareId ? `&compare_id=${compareId}` : ""}`),
  scanStart: (body) => call("POST", "/api/scans/start", body),
  scanUpload: (form) => callForm("/api/scans/upload", form),
  netstat: () => call("GET", "/api/netstat"),
  scanStatus: (id) => call("GET", `/api/scans/${id}/status`),
  scan: (path) => call("POST", "/api/scans", path ? { path } : {}),
  browse: (path) => call("GET", `/api/browse?path=${encodeURIComponent(path || "")}`),
  assets: (scanId) => call("GET", scanId ? `/api/assets?scan_id=${scanId}` : "/api/assets"),
  asset: (id) => call("GET", `/api/assets/${id}`),
  override: (id, body) => call("PUT", `/api/assets/${id}/override`, body),
  overrideReset: (id) => call("DELETE", `/api/assets/${id}/override`),
  file: (path, line, scanId) =>
    call("GET", `/api/file?path=${encodeURIComponent(path)}&line=${line || 1}${scanId ? `&scan_id=${scanId}` : ""}`),
  settings: () => call("GET", "/api/settings"),
  setSettings: (body) => call("PUT", "/api/settings", body),
  fixes: () => call("GET", "/api/fixes"),
  fixPreview: (finding_id) => call("POST", "/api/fixes/preview", { finding_id }),
  fixApply: (id, note) => call("POST", `/api/fixes/${id}/apply`, { note: note || "" }),
  cbom: (scanId) => call("GET", scanId ? `/api/cbom?scan_id=${scanId}` : "/api/cbom"),
  roadmap: (scanId) => call("GET", scanId ? `/api/roadmap?scan_id=${scanId}` : "/api/roadmap"),
  attest: (sector, scanId) =>
    call("GET", `/api/attest?sector=${sector || "government"}${scanId ? `&scan_id=${scanId}` : ""}`),
  sectors: () => call("GET", "/api/sectors"),
  audit: () => call("GET", "/api/audit"),
  history: () => call("GET", "/api/scans/history"),
  reference: () => call("GET", "/api/reference"),
  report: (scanId) => call("GET", scanId ? `/api/report?scan_id=${scanId}` : "/api/report"),
  projectsMeta: () => call("GET", "/api/projects/meta"),
  projects: () => call("GET", "/api/projects"),
  createProject: (body) => call("POST", "/api/projects", body),
  updateProject: (id, body) => call("PUT", `/api/projects/${id}`, body),
};
