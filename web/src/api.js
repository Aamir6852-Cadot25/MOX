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
  setSettings: (body) => call("PUT", "/api/settings", body),
};

export const tierColor = (t) => (t === "Critical" ? "#ef6a60" : t === "High" ? "#f0b43c" : t === "Medium" ? "#d9c26a" : "#79d9ae");
export const tierClass = (t) => (t === "Critical" ? "red" : t === "High" || t === "Medium" ? "amb" : "min");
