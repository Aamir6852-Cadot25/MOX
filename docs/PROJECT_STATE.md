# MOX: PROJECT STATE (generated 2026-09-24, HEAD 99e2ed4, read-only export)

## 1. Identity
- **Name:** MOX. **Pitch:** an offline tool that finds every quantum-vulnerable cryptographic asset in a codebase,
  scores it, gives a verdict (MIGRATE / CONTAIN / ACCEPT), fixes it, proves the fix, and exports a CycloneDX CBOM
  plus a signed attestation.
- **Target:** Smart India Hackathon 2026, PS SIH26164, NTRO. NCIIPC is referenced for the critical-sector list
  (docs/research-notes.md); it is not in the code.
- **Stack as built:** Python 3.12 + FastAPI + stdlib sqlite3 (`mox/`), React + Vite + Tailwind + Recharts (`web/`).
  The master build prompt describes Express/TypeScript; CLAUDE.md overrides it with the Python stack.
- **Brand assets:** no logo file exists. The mark is the text "MOX" (`.logo` in `web/src/index.css:19`, used in
  `App.jsx:56` and `pages/Login.jsx:19`). Favicon: none found. Vendored assets: Lucide icons
  (`web/src/vendor/lucide/icons.js`), IBM Plex fonts (`web/src/vendor/plex`).
- **CipherX:** not referenced anywhere in the repo (grep, excluding node_modules/.git/dist).
- **Colours outside tokens.css:** none found. A grep for hex/rgb literals in `web/src` outside tokens.css returned
  nothing, and `tests/test_ui_rules.py::test_colours_only_from_tokens` enforces it.
- **tokens.css.** It has two `:root` blocks, both verbatim below (`web/src/styles/tokens.css`).

```css
:root{
  /* surfaces */
  --paper:#EEF1F4;
  --canvas:#F6F8F9;
  --surface:#FFFFFF;
  --surface-2:#FAFBFC;

  /* ink */
  --ink:#1E2A35;
  --ink-2:#4B5A68;
  --ink-3:#7E8B97;
  --ink-4:#A4AFB9;

  /* lines */
  --line:#E3E8ED;
  --line-2:#D2DAE1;

  /* primary */
  --pri:#3D5A7A;
  --pri-soft:#E9EEF4;
  --pri-line:#C6D2E0;

  /* risk — pastel fill, saturated ink */
  --crit-bg:#F9E9E6; --crit-ink:#9A382B; --crit-line:#E9C9C2;
  --high-bg:#FAF0E2; --high-ink:#8C5C1C; --high-line:#EAD7BC;
  --med-bg:#F7F3E2;  --med-ink:#74641E;  --med-line:#E5DDBE;
  --low-bg:#E9F0EB;  --low-ink:#3C6A4E;  --low-line:#CEDFD4;
  --safe-bg:#E5EEF0; --safe-ink:#2E5D66; --safe-line:#C7DCE0;

  /* geometry — 8pt grid */
  --r:6px;
  --pad:16px;
  --gap:12px;
  --row:36px;
  --rail:180px;
  --aside:296px;
  --bar:44px;
}
:root{
  --font-sans:"IBM Plex Sans","Segoe UI",system-ui,sans-serif;
  --font-mono:"IBM Plex Mono",Consolas,monospace;
  --s1:4px; --s2:8px; --s3:12px; --s4:16px; --s5:24px; --s6:32px;
  --card-h:34px;
  --badge-h:18px; --badge-px:7px; --badge-r:3px; --badge-fs:10px; --badge-track:.02em;
  --ic-nav:16px; --ic-inline:14px; --ic-stroke:1.5;
  --t-fast:120ms; --t-base:200ms; --t-slow:320ms; --t-route-out:80ms;
  --ease:cubic-bezier(0.2, 0, 0.2, 1);
  --ease-out:cubic-bezier(0.16, 1, 0.3, 1);
}
```

## 2. Navigation and screens, as-built
Nav groups (`web/src/App.jsx`): Overview, Findings, Remediate, Compliance, Reports, Organisation. Shell: rail,
top bar (target, files/planes/seconds chip, AirGapPill, user, sign out). Every route is behind login; `/login` is
shown when unauthenticated. Questions come from docs/SCREENS.md.

| Route | Nav section | Question | Main components and data | API or hardcoded |
|---|---|---|---|---|
| `/` Dashboard | Overview | How exposed am I, and is anything on fire? | KPI tiles, verdict card (wave-1 count, most urgent asset, what each verdict holds), CoverageRing, RiskField (Mosca exposure x criticality), unplotted count | `summary` from `/api/scans/latest`. The `VERDICTS` array holds only labels and descriptions; all numbers are from the scan. |
| `/scan` New Scan | Overview | What will this scan cover, and how did the last one run? | Plane toggles, folder and probe inputs, Pipeline (7 planes, 5 stages), live SSE events, netstat sockets | `/api/scans/start`, `/api/scans/{id}/events` (SSE), `/api/netstat`. The `PLANES` and `STAGES` constants are labels. |
| `/queue` Work queue | Findings | What do I do next? | Sortable table (Wave, risk, Mosca, CMCS, evidence, plane), tabs and filters, j/k/Enter/`/` keys | `/api/assets`. |
| `/asset/:id` Asset detail | Findings | Why this, and what exactly do I change? | Score arithmetic rows, NIST card, Mosca card with X override, CMCS breakdown, evidence chain, locations, replacement rail, purpose expander | `/api/assets/{id}`, `PUT .../override`. |
| `/fix`, `/fix/:findingId` | Remediate | Is the change safe, and who signed it? | Fix candidates list; 4-step rail (previewed, approved, applied with backup, re-scanned); diff; claims in effect or not in effect; approver and time | `/api/fixes`, `/api/fixes/preview`, `/api/fixes/{id}/apply`. The `STEPS` array is labels. |
| `/cbom` | Compliance | What do I hand to an auditor? | Component count, schema-valid flag, Merkle root, JSON preview, download | `/api/cbom`, `/api/cbom/download`. |
| `/roadmap` | Compliance | What is the plan over 30 months? | Five wave cards and their assets. The screen states it has no schedule model, so it shows no dates and no owner column. | `/api/roadmap`. |
| `/attest` | Reports | What can I prove without disclosing? | Sector select, self-check results, Merkle root (copy), signed JSON, export | `/api/attest`, `POST /api/attest/export`. The `LEAVES` and `STAYS` lists are static copy; the audit says they match the JSON fields. |
| `/report` Compliance Report | Reports | What do I file? | Verdict counts by tier, scope text, network statement, PDF download | `/api/report`, `/api/report/download`. |
| `/sector` | Reports | Which critical sector is most exposed? (simulated) | KPIs, per-sector ranking, tamper checks. It carries the chip "Simulated attestations: demo data". | `/api/sectors`. **Data is simulated**, generated by `mox demo-attestations` (labelled demo data). |
| `/audit` | Reports | Who did what, and when? | Audit log table | `/api/audit`. |
| `/settings` | Organisation | Which organisation-wide assumptions drive the scores? | Z (CRQC horizon) with a before/after verdict split, explicit save | `/api/settings`, `PUT /api/settings`. |

Shared components: `AirGapPill` (`/api/netstat`), `CoverageRing`, `Pipeline`, `RiskField`, `Marks`
(Tier/Verdict/Evidence badges, one geometry), `States` (LoadError, NoScan, Failed, NoMatch), `Motion`
(RouteStage), `Icon` (vendored Lucide).
**Hardcoded values:** no hardcoded numbers found in the screens. Static text is limited to the label lists
above. The only simulated data is the sector attestations (labelled demo data).

## 3. Engine
Location is `mox/` (there is no `server/engine/`). Callers below are found by name matching, so treat them as
approximate; generic names (`scan`, `build`, `get`) are cross-matched across modules.

**Pipeline:** `scanner.scan` (planes -> `Finding`) -> `analyze.analyze` (`correlate` -> `score.score_asset` ->
`verdict.decide`) -> stored in SQLite.

| Function | Purpose | Called from |
|---|---|---|
| `scanner.scan(target, probe, conn, settings, ...)` | Run the enabled planes over a folder and store findings | api, jobs, cli |
| `scanner.plane_report`, `store_findings` | Per-plane detail; persist findings | scanner, fixers.flow |
| `analyze.analyze(scan_id, conn, settings, overrides, ...)` | Correlate, score, verdict for one scan | api, scanner |
| `analyze._size_key_transport(conn, asset)` | Size static-RSA suites from the correlated certificate | analyze |
| `correlate.correlate(findings, root)` | Findings to assets, dedup by key (SPKI) | analyze |
| `score.risk(asset, crit)` | Risk formula, every term returned | score |
| `score.cmcs(asset)`, `migration_years(c)` | Migration complexity; Y = ceil(CMCS/2) | score |
| `score.score_asset(asset, settings, override)` | Risk + Mosca + CMCS + tier + threats | analyze |
| `score.shelf_life`, `criticality`, `tier`, `evidence_grade`, `quantum_class`, `purpose`, `threats`, `exposed` | Score inputs; `exposed(a, threat)` feeds the HNDL and forgery counts | score, verdict, api, attest, report |
| `verdict.decide(asset, sc)` | MIGRATE / CONTAIN / ACCEPT, reason, replacements, wave | analyze |
| `verdict.wave(tier, exposure, verdict, status)` | Wave 1 to 5 with reason | verdict |
| `verdict.replacements(asset)`, `_facts` | PQC map (deterministic, local); reason text | verdict |
| `nist.lookup`, `identified`, `cite`, `table`, `norm_curve` | Read `data/nist_status.json` | analyze, scanner, score, planes, report |
| `planes.{code,deps,configs,certs,containers,binaries}.scan(path, rel, ctx)` and `.wants` | Per-plane detectors | scanner |
| `planes.tls.probe(host, port, timeout)` | Live handshake, the only outbound socket | scanner |
| `coverage.ran / off / delta / warning` | Flag a narrower rescan of the same target | api, attest, report, scanner |
| `cbom.build / validate / roadmap` | CycloneDX 1.6 CBOM, schema check, wave roadmap | api, attest, report, cli |
| `attest.build / sign / verify / merkle_root / cbom_root / self_check / leaks / sector_view / demo_attestations / readiness / stats` | Signed redacted attestation; sector view | api, cli |
| `report.build / with_text / render_pdf / network_statement` | Compliance report and hand-rolled PDF | api |
| `fixers.fix_text / claims / unified_diff` | Text-safe fixers, claims in effect | flow |
| `fixers.flow.preview / apply / candidates / fixable` | Preview, approve, apply with .bak, re-scan | api |
| `jobs.start / stream / status / validate_path / _probe` | Background scan job and SSE | api |
| `netguard.install / counts / plane_sockets` | Socket hook and ast-derived socket claim | api, scanner |
| `auth.*`, `db.connect`, `demo_target.build`, `demo_tls.run`, `cli.main` | Users and JWT, DB, demo data, CLI | api, cli |

### Scoring formula (verbatim, docs/SCORING.md §1)
```
risk = (base + quantum + evidence) × criticality × confidence        rounded to 1 decimal
```
| Term | Values |
|---|---|
| base | worst NIST status: disallowed 40, deprecated / not approved 25, unknown 15, approved / hybrid 5 |
| quantum | Shor-breakable +15; Grover-weakened (AES-128, 3DES, DES, RC4, MD5, SHA-1, SHA-224) +7; none 0 |
| evidence | observed +8, declared +4, declared-unverified +2, textual 0 |
| criticality | 3 → ×1.2, 2 → ×1.0, 1 → ×0.85 |
| confidence | high ×1.0, medium ×0.85, low ×0.7 |

Tiers: Critical ≥ 55, High ≥ 40, Medium ≥ 25, Low < 25 (max 75.6).
Mosca exposure = (X + Y) − Z: X is shelf life (auth/token/citizen/payments 15, test/log/tmp only 1, else 7),
Y = ceil(CMCS/2), Z = org setting (default 10). It is not applicable when no algorithm is identified.
CMCS = clamp(1, 10, location + spread + vendor + renegotiation). None of Mosca or CMCS feed the risk score.

### Verdict rule as implemented (`mox/verdict.py: decide`), in order
1. **CONTAIN** if Y ≥ 5 or no location is patchable in place.
2. **ACCEPT** if there is no identified algorithm (Mosca n/a), the tier is Low, and the asset is not disallowed.
   The reason says "not verified".
3. **ACCEPT** if the asset is not disallowed and (X ≤ 1, or the tier is Low and exposure ≤ 0). This is the
   short-shelf-life rule.
4. **MIGRATE** otherwise.

**Disallowed today is never ACCEPT.** `broken = base_status == "disallowed"` skips rules 2 and 3, so it is
CONTAIN or MIGRATE. Code matches docs/SCORING.md §4.1.
Wave: ACCEPT gives 5; disallowed gives 1; Critical gives 1; exposure > 0 gives 2; else one wave after the tier.

### Permanent regression tests (207 tests total at HEAD per AUDIT.md)
| File | Invariant |
|---|---|
| `tests/test_scoring_order.py` | Only broken crypto reaches Critical; broken outranks Shor-later; demo DES outranks hybrid endpoints; disallowed is never ACCEPT; short-shelf-life DES is MIGRATE |
| `tests/test_phase12.py` | Risk, Mosca and CMCS are separate; each total equals the arithmetic of its rows; exposed asset never ACCEPTed on low risk alone |
| `tests/test_phase15.py` | The seven audit Criticals: thread-safe DB dependency, no Mosca without an algorithm, all three verdicts reachable for any Z, nginx fix and hybrid credit, fixes not reported cleared unless effective, KMS SIGN_VERIFY is forgery |
| `tests/test_phase16.py` | Coverage never shrinks silently; verdict reasons are specific and unique |
| `tests/test_ui_rules.py` | UI lint: spacing scale, no shadows, colours only from tokens, no glyph icons, vendored Lucide, motion tokens only, screens' questions |
| `tests/test_nist.py` | NIST table lookups: size boundaries, unknown rather than guessed |
| `tests/test_planes.py` | Detector facts; no private key stored in DB; dedupe |
| `tests/test_phase2.py` | Correlation into one asset, score terms stored, disallowed is wave 1, hybrid handling, verdict rules |
| `tests/test_phase4.py` | Fixers text-safe; fix clears finding on re-scan; CBOM schema-valid; five waves cover all assets; PDF |
| `tests/test_phase5.py` | Attestation has no path or host and its signature verifies; Merkle order independence; tamper rejection |
| `tests/test_phase10.py`, `test_phase11.py`, `test_phase8.py`, `test_phase14.py` | Scan launcher and SSE, plane toggles, socket counter, timed stages, queue payload |
| `tests/test_api.py` | Auth required, no public registration, login audited, httpOnly cookie |

## 4. Audit status (docs/AUDIT.md, third pass at build 270bd17; pytest 207 passed)
- **Critical: 7 found, 7 closed.**
- **Major: 23 found:** 7 closed, 3 partly closed, 1 disclosed but not fixed (Major 14, Roadmap has no time),
  12 open.
- **Minor: 9 rows in the closure table:** 3 closed, 6 open. The first-pass Minor section has more; the closure
  table is the tracked set.
- Part B and Part C items: all closed (C6 with one disclosed gap).
- **Evaluator verdict (Dr. R. Subramanian, role-played):** "**Shortlisted.**" Four claims still say more than
  MOX has measured: the pill says "Air-gapped", Sector "verified" has no trust anchor, ECB "now" comes from a
  draft, and the Merkle root changes on an unchanged rescan.

**Still open, verbatim from "Still open, in the order I would fix them":**
1. **Major 2:** the pill reads "0 outbound connects counted", not "Air-gapped".
2. **Major 3:** "verified" on Sector becomes "signature valid against a registered key", with a note that key
   enrolment is out of scope.
3. **Major 1:** ECB `now` follows Rev.2 (approved), with the Rev.3 draft shown as proposed; the 2030/2035
   boxes are marked "proposed".
4. **Major 5:** stable `bom-ref` from the asset key, and scoring properties excluded from the Merkle leaves.
5. **Major 10:** tie-break by Mosca exposure, then CMCS (lower first), then label.
6. **Major 19 (risk field) and Major 20:** severity shapes on the risk-field dots; a print stylesheet for queue
   and report.
7. **Majors 9, 12, 13, 15, 16, 17** and the Minor list.

Also partly closed: Majors 6, 8, 19. Open Q&A: averaging readiness across operators with different Z (the
attestation carries neither Z nor the plane list).

## 5. Data and privacy posture
**Places that can open or accept a network socket (as found in code):**
- `mox/planes/tls.py:25`: `socket.create_connection((host, port), timeout)`. This is the only outbound connect. It
  runs only when a probe `host:port` is supplied. `jobs._probe` checks the format but does **not** restrict the
  host to loopback (audit Major 16, open).
- `mox/api.py:408`: `uvicorn.run(..., host="127.0.0.1", port=8000)`. This is the local server. `serve(host=...)`
  is a parameter, and the CLI exposes only `--port`.
- `mox/demo_tls.py:10-14`: a demo TLS server bound to `127.0.0.1:8443` by default (`mox demo-tls`, host and port
  are CLI args).
- `mox/netguard.py:50-60`: wraps `socket.connect/connect_ex` to count connects. It does not open sockets itself.
  It counts Python-level connects only (Major 2).
- Frontend: same-origin `fetch` and `EventSource` (`web/src/api.js`, `Attest.jsx:14`, `NewScan.jsx:30`). No
  absolute http(s) URLs in `web/src` outside vendored files. Fonts are self-hosted.

**Python dependencies (requirements.txt, unpinned):** fastapi (web), uvicorn (server), cryptography (X.509 and
Ed25519), argon2-cffi (password hash), pyjwt (session token), cyclonedx-python-lib[json-validation] (CBOM),
pytest (tests), httpx (test client).
**Node:** react, react-dom, react-router-dom (UI), recharts (charts); dev: vite, @vitejs/plugin-react,
tailwindcss, @tailwindcss/vite (build).
**Flags:** no AI SDK, analytics or telemetry package in either list. `httpx` is a test-client dependency; nothing
in `mox/` imports it (only `netguard.NET_MODULES` names it).
**SQLite WAL:** **not on.** No `journal_mode` or WAL pragma anywhere in `mox/db.py` or the code, so it uses the
default rollback journal. The master prompt asks for WAL.

## 6. Known gaps
**In the master build prompt, not built:**
- Knowledge base screen (§9 item 9) and History / scan-over-scan delta screen (§9 item 10). Neither route exists.
- Fix & verify: the spec has a six-step rail and a two-person approval gate. Built: a four-step rail with a
  single approver.
- Roadmap: no owner column and no schedule (disclosed on screen).
- `docs/ARCHITECTURE.md` does not exist; the knowledge base is `data/nist_status.json` + `data/rules.json`, not
  `algorithms.json`; SQLite WAL is off; live TLS is opt-in by probe field (matches "off by default").
- All items in the audit's open list above.
- The Stack differences (Express/TS vs Python) are deliberate, per CLAUDE.md.

**TODO / FIXME / XXX / HACK comments:** none found in `mox/`, `web/src` (excluding vendor), `tests/`, `run.ps1`.

**Last 15 commits:**
```
99e2ed4 phase 20: Part D step 7 - twenty probes re-run, third pass and closure table in AUDIT.md
270bd17 phase 19: Part D step 6 - one question per screen, dashboard answers what is on fire, label collisions, dead space, empty and error states
fe7a4a4 phase 18: Part D step 5 - C2 motion system on tokens, reduced motion, motion lint
cd0d298 phase 17: Part D step 4 - token-first surface, one badge geometry, vendored Lucide + IBM Plex, spacing scale, UI lint
63c861c phase 16b: disallowed-today crypto is never ACCEPT; permanent verdict invariant test
72a049c phase 16: B2 coverage never shrinks silently, B4 paper canvas, asset-specific verdict reasons
4bc790e phase 15b: risk ordering - X25519 rated like ECDH P-256, key-transport suites sized from the certificate, permanent ordering tests
be371c9 phase 15: close audit criticals C1-C7
789f84c phase 14: work queue (sortable risk/Mosca/CMCS, evidence + plane filters, j/k/Enter/slash keys, scrolling body)
ef53529 phase 13: dashboard (tiles, verdict bar, coverage ring, SVG risk field), HNDL vs forgery exposure split
f897dea research notes: verified standards status, CycloneDX 1.6 crypto schema, NCIIPC sectors, spec contradictions
5fb3ef7 phase 12: spec scoring (risk / Mosca / CMCS separate), evidence grades, reasoned waves, asset detail rebuild
b141b09 phase 11: SSE scan pipeline with per-plane progress, air-gap socket counter, plane toggles
bb74f32 phase 10: live scan launcher (background job + stage polling), CMCS score
3a303ec phase 9: API scan->latest stages integration test; verified phase 8 end to end
```
(Long messages for be371c9 and earlier are truncated in this list; hash and start of message only.)

## 7. Screens rendered
**No screenshots were captured.** A browser tool (Claude in Chrome) is available, but every screen sits behind
login. Signing in means typing a password into the page, which I must not do, and I did not create an account
either. No server was started. Nothing was written to `docs/screenshots/`.
To produce them: log in yourself in a Chrome tab on http://127.0.0.1:8000, then ask for the twelve screens at
1280x800. Older screenshots at 1366x768 were taken in phases 17 to 20 and are described in PLAN.md, but they are
not stored in the repo.
