Build the complete MOX web frontend in this workspace, from scratch, in one run. Work through the steps below in order without stopping to ask me, unless something truly blocks you.

## 0. Context — read first
- Read AGENTS.md. It overrides anything you may remember about an older MOX UI (dark theme, green #81B500, CipherX, splash rings). Ignore all of that.
- The design target is reference/MOX_UI_Preview.html (open it in the browser and click through every page) and reference/target_*.png. Match layout, spacing, colours, wording and interactions as closely as possible.
- The backend is mox/ (FastAPI on http://127.0.0.1:8000). Read mox/api.py for the exact endpoints and field names. Do not change backend behaviour.
- web/ has package.json, vite.config.js (already proxies /api → 8000), index.html and public/, but NO src/. You create web/src from scratch.
- reference/pqc_alternatives.js holds the PQC replacement options per algorithm family (FIPS sizes). Copy it into web/src/data/ and use it for "Recommended fix" and the Remediation page.

## 1. Setup
- Stack: React 18 + Vite + Tailwind v4 (@tailwindcss/vite, already in package.json) + react-router-dom + recharts. Add only: lucide-react, @fontsource/inter, @fontsource/jetbrains-mono (bundled, offline). Pin versions.
- Create design tokens (CSS variables) exactly as in AGENTS.md / the preview. Build shared components: AppShell (header + sidebar), PageHeader, Card, Stat, Pill, TierPill, VerdictPill, Chips, DataTable, Modal, Toast, EmptyState, Skeleton, Gauge.
- API client: same-origin fetch with credentials: "include" (auth is an httpOnly cookie). 401 → go to Login. Show a banner "Can't reach the MOX server" when the API is down. Show the server's error text in toasts.

## 2. App shell, splash, login
- Header (#0B2540): logo tile "MX", "M-O-X", subtitle "Cryptographic discovery & PQC readiness"; right: "Last scan: <time> · Offline · <n> outbound connections" (GET /api/netstat + /api/scans/latest), settings icon, sign-out (POST /api/auth/logout).
- Sidebar (#0F2B46): PRIMARY → 1 Scan Source, 2 Dashboard, 3 Code Edit, 4 Monitoring, 5 History & Reports (numbered badges). DEEP ANALYSIS → CBOM, Remediation. Bottom: "Scan planes" list with green dot for planes that ran in the last scan, grey for off (from scans/latest coverage).
- Splash: white, logo, "M-O-X", thin cyan bar, "Starting scan engine…" — only while GET /api/auth/me resolves.
- Login card like target_login.png (POST /api/auth/login). Note under the button: "Accounts are created by an administrator."

## 3. Scan Source (target_scan.png)
- 4 source cards: Local project (folder input + Browse → modal using GET /api/browse?path=), GitHub repository (URL, branch, "I am authorised" checkbox → git_authorized), ZIP / container upload (drag-drop → POST /api/scans/upload multipart: source, planes, files), TLS endpoint (host:port + authorised checkbox).
- Application details card: project name, system type, sector, business criticality, shelf life — options from GET /api/projects/meta; create/update via /api/projects; pass project_id to the scan.
- Scan planes grid: the 7 planes (code, dependencies, binaries, containers, certificates, configs, tls) with captions as in the preview; click to toggle; TLS off unless an endpoint is given.
- "Confirm scan" modal → POST /api/scans/start. Then stream GET /api/scans/{job_id}/events (Server-Sent Events): mark each plane running / done from real events, show "Processing step n / N", then the real totals (files, findings → assets, seconds). Never fake progress. When finished, go to Dashboard.

## 4. Dashboard (target_dash.png) — GET /api/scans/latest + GET /api/assets
- Subtitle: project, source pill, scan #, files, planes, seconds.
- 5 stat cards: Total assets (+ "n findings merged"), P1 Critical, P2 High, P3 Medium, P4 Low (tier → P1–P4) with thin bars.
- "Quantum Risk & Evidence": gauge = highest asset score; "Why this score?" bullets from real data (quantum-vulnerable count, top asset's NIST reason + Mosca X + Y − Z = exposure, how many locations merged); green "Remediation" box from the replacement options; row of MIGRATE / CONTAIN / ACCEPT counts with one-line meaning.
- Findings table with ALL/P1–P4 chips: Priority, Algorithm (+key size), File, Line (from primary_location), Planes, Quantum status, Risk score, Mosca (+n yrs exposed / n yrs safe / n/a), Verdict. Row click → Code Edit for that asset. Empty state with "Run first scan" when there is no scan.

## 5. Code Edit (target_code.png)
- Left: Project explorer — asset count pill, filter box, folder tree built from asset locations, each file with the highest P badge and count.
- Middle: file path + "Target line: n"; source view with line numbers and the target line highlighted. If the backend has no endpoint to read a file's text, add ONE small read-only endpoint GET /api/file?path=&line= restricted to the last scan's target folder (text files only, size-limited) and add a pytest for it; for binaries/certs show a metadata card instead.
- "Preview fix" (only when the asset has fix_finding) → POST /api/fixes/preview → show the diff inline (red removed, green added). "Apply & re-scan" → POST /api/fixes/{id}/apply → show the real result status (cleared / still-present / not-in-effect).
- Right: Finding details (GET /api/assets/{id}): numbered rows Algorithm, File, Line, Risk, Quantum, Verdict + wave; red "Why this is weak" (first sentence of reason); green "Recommended fix" (from pqc_alternatives); footer "summary · seen in n locations".

## 6. Monitoring (target_mon.png)
- Stat cards: monitored projects, high/critical alerts, quantum-vulnerable assets, scan planes active.
- Projects table from GET /api/projects (+ latest scan numbers where available) with "Scan now".
- "Add project" modal (GitHub / Local / ZIP tabs, name, URL/path, branch) → POST /api/projects.

## 7. History & Reports (target_hist.png)
- Buttons: Rescan source, Download PDF report (GET /api/report/download), Download CBOM (GET /api/cbom/download) — download via fetch → blob.
- Scan timeline from GET /api/scans/history. "Recent activity" from GET /api/audit.

## 8. CBOM (target_cbom.png) — GET /api/cbom
- Stat cards: format (CycloneDX + spec), schema valid ✓ / errors, components, serial number. Components table, JSON preview (dark text on light, mono), Download JSON.

## 9. Remediation (target_rem.png) — GET /api/roadmap (+ assets)
- Waves with a one-line meaning, count, and rows: P badge, algorithm → recommended replacement (green), file.

## 10. Settings (small page from the header icon)
- Threat horizon Z (years) via GET/PUT /api/settings, with a one-line explanation of Mosca's rule.

## 11. Finish and verify
1. `npm --prefix web install`, `npm --prefix web run build` — fix every error and warning.
2. `.venv\Scripts\python -m pytest -q` (create .venv with `python -m venv .venv` and `pip install -r requirements.txt` if missing) — all green.
3. Start `.venv\Scripts\python -m mox serve`, open http://127.0.0.1:8000, log in, run a scan of demo_target, and walk every page side by side with reference/MOX_UI_Preview.html at 1366×768. Fix differences.
4. Add tests/test_ui_light.py: fails if web/src contains "#81B500", "CipherX", "fonts.googleapis" or any http(s) URL used at runtime.
5. Commit: `git add -A; git commit -m "ui: light MOX frontend"`.
6. Final report (≤ 15 lines): pages done, endpoints used, anything added to the backend, tests count, what you checked in the browser, anything that differs from the preview and why.
