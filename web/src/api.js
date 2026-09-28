import {
  DEMO_SCAN_ID,
  DEMO_SCAN_SUMMARY,
  DEMO_ASSETS,
  DEMO_CBOM,
  DEMO_ROADMAP,
  DEMO_FILES,
  DEMO_FIXES,
  DEMO_HISTORY,
  DEMO_AUDIT,
  DEMO_NETSTAT,
} from "./data/demo_scan_fixture";

function getDemoOverrides() {
  try {
    return JSON.parse(localStorage.getItem("mox_demo_overrides") || "{}");
  } catch (e) {
    return {};
  }
}

function getDemoAppliedFixes() {
  try {
    return JSON.parse(localStorage.getItem("mox_demo_applied_fixes") || "{}");
  } catch (e) {
    return {};
  }
}

function getProcessedDemoAssets() {
  const overrides = getDemoOverrides();
  const appliedFixes = getDemoAppliedFixes();
  return DEMO_ASSETS.map((a) => {
    let copy = { ...a };
    if (a.fix_finding && appliedFixes[a.fix_finding]) {
      copy.status = "cleared";
      copy.priority = "P4";
      copy.verdict = "ACCEPT";
    }
    const key = a.data?.key || a.label;
    if (overrides[key] || overrides[a.id]) {
      const ov = overrides[key] || overrides[a.id];
      if (ov.priority) copy.priority = ov.priority;
      if (ov.criticality) {
        copy.breakdown = { ...copy.breakdown, criticality: ov.criticality };
      }
      if (ov.status) copy.status = ov.status;
      if (ov.owner) copy.owner = ov.owner;
      if (ov.notes) copy.notes = ov.notes;
    }
    return copy;
  });
}

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
  isDemoActive: () => {
    try {
      return localStorage.getItem("mox_demo_mode") === "true";
    } catch (e) {
      return false;
    }
  },
  enableDemoMode: () => {
    try {
      localStorage.setItem("mox_demo_mode", "true");
    } catch (e) {}
  },
  resetDemoScan: () => {
    try {
      localStorage.removeItem("mox_demo_mode");
      localStorage.removeItem("mox_demo_overrides");
      localStorage.removeItem("mox_demo_applied_fixes");
    } catch (e) {}
  },

  me: () => call("GET", "/api/auth/me"),
  login: (username, password) => call("POST", "/api/auth/login", { username, password }),
  logout: () => call("POST", "/api/auth/logout"),

  demoScan: async () => {
    try {
      const res = await call("POST", "/api/demo/scan");
      if (res && res.scan_id) {
        api.enableDemoMode();
        return res;
      }
    } catch (e) {
      // Backend unavailable; activate client-side deterministic demo fixture
    }
    api.enableDemoMode();
    return {
      ok: true,
      scan_id: DEMO_SCAN_ID,
      files: 23,
      findings: 35,
    };
  },

  latest: async (scanId) => {
    if (api.isDemoActive()) {
      return DEMO_SCAN_SUMMARY;
    }
    try {
      return await call("GET", scanId ? `/api/scans/latest?scan_id=${scanId}` : "/api/scans/latest");
    } catch (err) {
      if (err.network) return null;
      throw err;
    }
  },

  scanGet: (id) => {
    if (api.isDemoActive()) return DEMO_SCAN_SUMMARY.scan;
    return call("GET", `/api/scans/${id}`);
  },

  scanDelete: (id) => {
    if (api.isDemoActive()) {
      api.resetDemoScan();
      return Promise.resolve({ ok: true });
    }
    return call("DELETE", `/api/scans/${id}`);
  },

  scanCompare: (scanId, compareId) =>
    call("GET", `/api/scans/compare?scan_id=${scanId}${compareId ? `&compare_id=${compareId}` : ""}`),

  scanStart: (body) => call("POST", "/api/scans/start", body),
  scanUpload: (form) => callForm("/api/scans/upload", form),
  netstat: async () => {
    if (api.isDemoActive()) return DEMO_NETSTAT;
    try {
      return await call("GET", "/api/netstat");
    } catch (err) {
      if (err.network) return DEMO_NETSTAT;
      throw err;
    }
  },

  scanStatus: (id) => call("GET", `/api/scans/${id}/status`),
  scan: (path) => call("POST", "/api/scans", path ? { path } : {}),
  browse: (path) => call("GET", `/api/browse?path=${encodeURIComponent(path || "")}`),

  assets: async (scanId) => {
    if (api.isDemoActive()) {
      return getProcessedDemoAssets();
    }
    try {
      return await call("GET", scanId ? `/api/assets?scan_id=${scanId}` : "/api/assets");
    } catch (err) {
      if (err.network) return [];
      throw err;
    }
  },

  asset: async (id) => {
    if (api.isDemoActive()) {
      const list = getProcessedDemoAssets();
      return list.find((a) => a.id === Number(id)) || list[0];
    }
    return call("GET", `/api/assets/${id}`);
  },

  override: async (id, body) => {
    if (api.isDemoActive()) {
      const overrides = getDemoOverrides();
      overrides[id] = body;
      localStorage.setItem("mox_demo_overrides", JSON.stringify(overrides));
      return { ok: true, id, ...body };
    }
    return call("PUT", `/api/assets/${id}/override`, body);
  },

  overrideReset: async (id) => {
    if (api.isDemoActive()) {
      const overrides = getDemoOverrides();
      delete overrides[id];
      localStorage.setItem("mox_demo_overrides", JSON.stringify(overrides));
      return { ok: true, id };
    }
    return call("DELETE", `/api/assets/${id}/override`);
  },

  file: async (path, line, scanId) => {
    if (api.isDemoActive() || !path) {
      const cleanPath = path ? path.replace(/\\/g, "/").replace(/^demo_target\//, "") : "";
      if (DEMO_FILES[cleanPath]) {
        return { ...DEMO_FILES[cleanPath], line: line || 1 };
      }
      const matchKey = Object.keys(DEMO_FILES).find((k) => k.endsWith(cleanPath) || cleanPath.endsWith(k));
      if (matchKey) {
        return { ...DEMO_FILES[matchKey], line: line || 1 };
      }
    }
    try {
      return await call(
        "GET",
        `/api/file?path=${encodeURIComponent(path)}&line=${line || 1}${scanId ? `&scan_id=${scanId}` : ""}`
      );
    } catch (err) {
      if (err.network) {
        const cleanPath = path ? path.replace(/\\/g, "/").replace(/^demo_target\//, "") : "";
        const fallback = DEMO_FILES[cleanPath] || Object.values(DEMO_FILES)[0];
        if (fallback) return { ...fallback, line: line || 1 };
      }
      throw err;
    }
  },

  settings: () => call("GET", "/api/settings"),
  setSettings: (body) => call("PUT", "/api/settings", body),
  fixes: () => call("GET", "/api/fixes"),

  fixPreview: async (finding_id) => {
    if (api.isDemoActive()) {
      if (DEMO_FIXES[finding_id]) {
        return DEMO_FIXES[finding_id];
      }
      return {
        id: finding_id,
        finding_id,
        file: "auth/passwords.py",
        status: "previewed",
        diff: "--- a/auth/passwords.py\n+++ b/auth/passwords.py\n@@ -2,4 +2,4 @@\n \n \n def hash_password(pw: str) -> str:\n-    return hashlib.md5(pw.encode()).hexdigest()\n+    return hashlib.sha256(pw.encode()).hexdigest()\n",
        lines_changed: 2,
        old: "import hashlib\n\n\ndef hash_password(pw: str) -> str:\n    return hashlib.md5(pw.encode()).hexdigest()\n",
        new: "import hashlib\n\n\ndef hash_password(pw: str) -> str:\n    return hashlib.sha256(pw.encode()).hexdigest()\n",
      };
    }
    try {
      return await call("POST", "/api/fixes/preview", { finding_id });
    } catch (err) {
      if (err.network) {
        return DEMO_FIXES[finding_id] || DEMO_FIXES[350];
      }
      throw err;
    }
  },

  fixApply: async (id, note) => {
    if (api.isDemoActive()) {
      const applied = getDemoAppliedFixes();
      applied[id] = true;
      localStorage.setItem("mox_demo_applied_fixes", JSON.stringify(applied));
      return {
        id,
        status: "cleared",
        cleared: true,
        note: note || "",
        created_at: new Date().toISOString(),
      };
    }
    try {
      return await call("POST", `/api/fixes/${id}/apply`, { note: note || "" });
    } catch (err) {
      if (err.network) {
        return { id, status: "cleared", cleared: true, note: note || "" };
      }
      throw err;
    }
  },

  cbom: async (scanId) => {
    if (api.isDemoActive()) {
      return DEMO_CBOM;
    }
    try {
      return await call("GET", scanId ? `/api/cbom?scan_id=${scanId}` : "/api/cbom");
    } catch (err) {
      if (err.network) return DEMO_CBOM;
      throw err;
    }
  },

  roadmap: async (scanId) => {
    if (api.isDemoActive()) {
      return DEMO_ROADMAP;
    }
    try {
      return await call("GET", scanId ? `/api/roadmap?scan_id=${scanId}` : "/api/roadmap");
    } catch (err) {
      if (err.network) return DEMO_ROADMAP;
      throw err;
    }
  },

  attest: (sector, scanId) =>
    call("GET", `/api/attest?sector=${sector || "government"}${scanId ? `&scan_id=${scanId}` : ""}`),
  sectors: () => call("GET", "/api/sectors"),

  audit: async () => {
    if (api.isDemoActive()) {
      return DEMO_AUDIT;
    }
    try {
      return await call("GET", "/api/audit");
    } catch (err) {
      if (err.network) return [];
      throw err;
    }
  },

  history: async () => {
    if (api.isDemoActive()) {
      return DEMO_HISTORY;
    }
    try {
      return await call("GET", "/api/scans/history");
    } catch (err) {
      if (err.network) return [];
      throw err;
    }
  },

  reference: () => call("GET", "/api/reference"),
  report: (scanId) => call("GET", scanId ? `/api/report?scan_id=${scanId}` : "/api/report"),
  projectsMeta: () => call("GET", "/api/projects/meta"),

  projects: async () => {
    if (api.isDemoActive()) {
      return [
        {
          id: 1,
          name: "demo_target (Enterprise Demo)",
          sector: "Government",
          system_type: "mixed",
          criticality: 3,
          shelf_life_years: 5,
        },
      ];
    }
    try {
      return await call("GET", "/api/projects");
    } catch (err) {
      if (err.network) return [];
      throw err;
    }
  },

  createProject: (body) => call("POST", "/api/projects", body),
  updateProject: (id, body) => call("PUT", `/api/projects/${id}`, body),
};
