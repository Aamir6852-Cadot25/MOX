# MOX v2 — FIVE-PAGE BUILD PLAN

Save as `docs/MOX_V2_BUILD_PLAN.md`. Read with `AGENTS.md` and `docs/PROJECT_STATE.md`.
Run **one phase per cloud session**. Do only the phase you are asked for.

Baseline: HEAD 99e2ed4, 207 tests, audit verdict "shortlisted". Everything that works
today keeps working. This plan **reorganises and extends**; it does not rewrite the
engine, the scoring, or the tests.

---

## 0. Decisions (final — do not re-litigate inside a phase)

**D1. Five primary pages, interlinked.** Nav order and routes:

| # | Page | Route | Answers | Absorbs (today's routes) |
|---|---|---|---|---|
| 1 | Scan | `/scan` | What am I scanning, and what is it finding right now? | `/scan` |
| 2 | Dashboard | `/dashboard` | How exposed am I, and why? | `/` |
| 3 | Findings | `/findings`, `/findings/:assetId` | What exactly is wrong, where, and in what order do I fix it? | `/queue`, `/asset/:id` |
| 4 | Code Edit | `/code?asset=&file=&line=` | What do I change on this line, and did it work? | `/fix`, `/fix/:id` |
| 5 | Reports | `/reports/:tab` | What do I hand over, and what changed since last time? | `/cbom`, `/roadmap`, `/report`, `/attest`, `/audit` |

Secondary (rail footer, not primary): Settings (`/settings`), Sector view (`/sector`, demo data).
Every old route **redirects** to its new home with the same entity selected. No dead links.

**D2. Landing.** Post-login: no scan in DB → `/scan`. Otherwise → `/dashboard`.
Scan is always first in the rail.

**D3. Business criticality is set BEFORE the scan, refined AFTER.**
Scoring needs it at scan time (criticality multiplier, Mosca X default), so the scan
form asks for project context first — optional, with defaults, never blocking. After the
scan, per-asset overrides remain (one repo holds payment code and test utilities; one
project-wide value is too coarse). Path heuristics stay as the middle layer.
Precedence: per-asset override > path heuristic > project default.

**D4. Findings table drops the Risk score and Risk level columns.** Priority (P1–P4,
derived from tier) replaces both. The score and its arithmetic stay in the detail panel —
traceability is not lost, only de-duplicated.

**D5. Findings rows are assets, expandable to locations.** Correlation (N findings →
M assets) is MOX's differentiator; the table must show it. A Flat toggle lists every
location as its own row for line-by-line work.

**D6. Code suggestions are deterministic. No LLM, ever.** Rule-based rewrites from a local
table. Asymmetric → PQC swaps are almost never one line; they are labelled
**structural change** with the library requirement, never offered as a one-keystroke
ghost-text fix.

**D7. Git in Code Edit is local-first.** Commit goes to a local branch with no network.
Push is a separate, explicit action: only when the source is a git repo with a remote,
confirmed in a dialog that says it is an outbound call, routed through netguard and
counted in the top-bar pill. Non-git sources get "Download .patch".

**D8. The UI is built around CipherX green `#81B500`.** It replaces indigo as MOX's one
accent: every action, every active state, every moment of work. Legibility is fixed by
**what it is paired with**, not by avoiding it. Measured WCAG contrast:

| Token | Value | Use | Pairing and ratio |
|---|---|---|---|
| `--brand` | `#81B500` | primary button fill, active scan, progress, ripple, logo | `--ink` text on it: **5.9:1** ✓ |
| `--brand-hover` | `#74A300` | primary button hover/press | `--ink` text: **4.9:1** ✓ |
| `--brand-ink` | `#4E6F00` | green **text** on light, links, focus ring, active nav label | on white **5.8:1**, on paper **5.2:1** ✓ |
| `--brand-soft` | `#F2F8E1` | active nav row, selected table row, selected tab | `--brand-ink` text on it: **5.4:1** ✓ |
| `--brand-line` | `#C9DE8F` | borders of selected/active elements | decorative only |
| on terminal | `#81B500` on `--term-bg` | prompt, cursor, correlate count, `[  ok  ]` | **6.3:1** ✓ |

Hard rules (lint-enforced):
- **Never white text on `--brand`** (2.5:1, fails). Primary buttons are green with dark ink text.
- **Never `#81B500` as text on a light surface** (2.5:1). Use `--brand-ink`.
- Focus rings use `--brand-ink` (needs 3:1 against the page; `#81B500` is 2.5:1).
- `--pri` indigo is retired; replace every use with the brand tokens above.

**Green is action, never meaning.** Because green now means "do this / this is active", it
can't also mean "safe" or "low risk". So the semantic families move off green:
- **Low** tier → neutral slate (`--low-bg:#EEF1F4; --low-ink:#4B5A68` 6.2:1; `--low-line:#D2DAE1`).
  Grey-for-low is the convention in Snyk, Jira, Sentry.
- **ACCEPT** verdict and **Quantum-safe** status → the existing teal `--safe-*` family.
- Critical / High / Medium keep their current pastel families.
Update `tests/test_ui_rules.py` so `--brand*` can never appear inside a Marks badge.

**Inspiration, not imitation.** Indhu's Antigravity prototype and the MOX demo video are
references for **structure and flow only** (five categories, scan-first, the findings
table, the Quantum Risk Graphic & Evidence Rationale section, code edit). Do **not** copy
their dark neon theme, gradients, glows, gradient progress bars, all-caps labels or card
layouts. MOX stays light, calm, flat, token-driven, with green as its single accent.

**D9. Terminal is a surface, not a theme.** The UI stays light and calm. One dark
`TerminalSurface` component is used for exactly: scan ledger, code editor, JSON/CBOM/
attestation previews, command palette (Ctrl+K). Tokens:
`--term-bg:#1B2530; --term-ink:#D6DEE5; --term-dim:#7E8B97; --term-line:#2A3642;`
Terminal status tags are ASCII, systemd-style: `[  ok  ]` `[ skip ]` `[ fail ]` `[ .... ]`
(the glyph-icon lint stays in force).

**D10. The CipherX ripple is the scan's motion signature.** Concentric rings expand from
the ledger's origin **only when a real SSE event reports a newly discovered asset**
(max 3 concurrent rings). No looping idle animation. Reduced motion → static count.

**D11. Short waits get a name, not a spinner — MOX's own vocabulary, in `--brand-ink`.**
Claude's habit of naming its own work ("Pondering…", "Marinating…") is worth the same
spirit here, not the same words — MOX gets a security/crypto-flavoured list of its own so
it doesn't read as borrowed:

```
Fingerprinting assets…      Cross-checking NIST tables…
Correlating findings…       Weighing the exposure window…
Reading the ledger…         Verifying the fix…
Chasing ciphertext…         Sealing the attestation…
Counting the waves…         Tracing the evidence chain…
```

Rules:
- Only for a real async call with **no** richer live signal already (Code Edit "Verify",
  CBOM build/export, attestation signing, report render, history delta). The scan ledger
  already streams real per-plane facts (D10) — it never uses these generic words.
- Text only, `--brand-ink` on light, `--brand` on the terminal surface. No spinner icon
  alongside it — the changing word *is* the motion.
- Appears only past 400ms (avoid flicker on fast calls); cycles one word every ~1.8s;
  replaced immediately by the real result, never lingers after the response lands.
- Never implies a step count or progress percentage it can't back up — it's a "still
  working, honestly" signal, not a fake progress bar.
- Word list lives in one file (`web/src/vendor/status-words.js`) so it's easy to extend
  without touching component logic.

---

## Phase order and why

Ordered by what a judge touches first and what breaks worst if missing. If the cloud
credit runs out after any phase, the app is still whole.

| Phase | Name | Model |
|---|---|---|
| 1 | Foundations: IA, routes, tokens, project entity | Sonnet |
| 2 | Scan page | Sonnet (Opus for archive safety review) |
| 3 | Findings table | Sonnet |
| 4 | Code Edit | Opus |
| 5 | Dashboard: Quantum Risk Graphic & Evidence Rationale | Sonnet |
| 6 | Reports hub + History delta | Sonnet |
| 7 | Splash + Login | Sonnet |
| 8 | Re-audit + demo seed | Opus |

Every phase ends with: `pytest` green, web build green, UI lint green, one commit series on
branch `phase/<n>-<slug>`, and the end-of-phase report defined in `AGENTS.md`.

---

## Phase 1 — Foundations

Goal: the five-page skeleton exists and every existing feature is reachable from it.

1. Rail: groups **Work** (Scan, Dashboard, Findings, Code Edit, Reports) and footer
   (Settings, Sector). Routes per D1; redirects from every old route, entity preserved.
2. Tokens: add the `--brand*` set and `--term-*` (D8, D9); retire `--pri`; move Low to slate and
   ACCEPT/Quantum-safe to the teal family. Lint: no white text on `--brand`, no `#81B500` as
   text on a light surface, no `--brand*` inside badges.
3. `web/src/vendor/cipherx/mark.svg`: the CipherX wave mark, recreated as clean SVG
   paths (not a traced raster), `currentColor`-driven. Wordmark "MOX" + small mark in the
   top bar. Favicon from the mark.
4. `TerminalSurface` component (D9), unused screens untouched for now.
5. `web/src/vendor/status-words.js` (D11): the word list and a small `useStatusWord(active)`
   hook — one word, cycling every 1.8s, only after 400ms. No consumers yet; Phase 4 and
   Phase 6 use it.
6. Project entity: `projects` table (id, name, sector [NCIIPC's six from
   research-notes.md], system_type, criticality 1–3, shelf_life_years, source_kind,
   source_ref, created_at). A scan belongs to a project. Migration keeps existing scans
   under an auto-created "Default project". Scoring reads project defaults per D3.
7. SQLite WAL mode on (`PRAGMA journal_mode=WAL`), with a test.
8. Audit Major 2: pill wording becomes "0 outbound connects counted" (it counts Python-level
   connects; say exactly that in its tooltip).

Acceptance: every old URL lands on the right new page; 207+ tests pass; new tests for
redirects, WAL, project-default precedence (D3), brand allowlist.

---

## Phase 2 — Scan page

Layout: left column = **Source** then **Project context** then **Planes**; right column =
**Scan ledger** (TerminalSurface). Start button bottom-left, primary.

**Sources** (segmented control; each shows what it reads and whether it can touch the network):

| Source | Input | Network |
|---|---|---|
| Local folder | path | none |
| Archive | .zip .tar .tar.gz .tgz upload | none |
| Git repository | local clone path (records commit SHA); remote URL clone is opt-in | clone only if remote URL, counted |
| Container image | `docker save` .tar upload; walk layers | none |
| Artefacts | binaries (.jar .war .ear .class .exe .dll .so .apk .bin), certs/keystores (.pem .crt .cer .der .p12 .pfx .jks), configs | none |
| Live TLS endpoints | `host:port` list | yes, opt-in, counted |

Archive and image extraction **must** be safe, with tests for each:
zip-slip/path traversal rejected, symlinks not followed, total uncompressed cap (default
2 GB), compression-ratio cap (reject > 100:1), file-count cap, extraction into a per-scan
temp dir that is removed after scanning. A malicious archive must fail with a clear
reason, never a stack trace.

Live TLS (closes audit Major 16): loopback and RFC 1918 ranges allowed by default; any
public host requires an explicit per-scan "I am authorised to probe this host" checkbox,
recorded in the audit log.

**Project context** (collapsed if a project is selected): name, sector, system type,
criticality (1–3 with one-line meaning each), data shelf life (years, with presets:
session/token 1, logs 1, business records 7, citizen/financial 15). Defaults shown.
Helper text: "Used to weight scores. You can override per asset after the scan."

**Planes**: the existing seven toggles, each with a one-line "reads …" description.

**Scan ledger** (the visualisation):
- Top: the stage rail Ingest → Detect → Correlate → Score → Verdict, each filling from SSE.
- Body: a streaming terminal log of **real** events only:
  `[  ok  ] certs      6/6 files   315 ms   6 findings`
  `[ .... ] binaries   reading vendor/sync-agent.bin`
  `[ skip ] live tls   off`
- Per-plane checklist on the right edge of the ledger: seven rows, each with its own
  progress bar and counter; ticks off as each plane completes.
- Correlate: the existing count-down (e.g. 30 → 22), large, in `--brand` on the dark surface.
- Ripple (D10) behind the ledger header on each newly discovered asset.
- Footer: elapsed time, bytes read, outbound connects (from netguard).
- On completion: a summary line and two actions: **Open findings** (primary), **Open dashboard**.
- Failure of a plane is a `[ fail ]` line with the reason; the scan continues.

Acceptance: each source kind has an end-to-end test on a fixture; archive-safety tests;
SSE ordering test; the ledger renders only from events (no timers faking progress).

---

## Phase 3 — Findings

Columns, in order:

| Column | Content |
|---|---|
| (expander) | shows "+N locations" when grouped |
| Priority | P1–P4 from tier, severity shape + label (existing Marks geometry) |
| Algorithm | mono, with key size/parameter (e.g. `RSA-2048`, `DES`, `ECDSA P-256`) |
| File | mono, path relative to target, truncated from the left |
| Line | mono, right-aligned |
| Quantum status | Shor-breakable / Grover-weakened / Hybrid / Quantum-safe / Undetermined |
| Verdict | MIGRATE / CONTAIN / ACCEPT badge |
| Evidence | Observed / Declared / Declared-unverified / Textual |
| Action | "Edit code" (icon + label) → `/code?asset=&file=&line=` |

**Hierarchical sort** (default and tie-breakers — closes audit Major 10):
Priority → Wave → Mosca exposure (desc) → CMCS (asc) → File → Line.
Clicking a header makes it the primary key; the remaining chain stays as stable
tie-breakers. A small line above the table states the active chain in words.

Filters: priority chips, verdict, quantum status, plane, evidence, text search.
Keyboard: j/k, Enter (detail), e (edit code), / (search) — keep existing.
Row click opens the **detail panel** on the right (today's asset-detail content,
condensed): score arithmetic, NIST card with final/draft marking, Mosca, CMCS, evidence
chain, locations. `/findings/:assetId` deep-links to it.

Acceptance: sort-chain unit test with ties; grouped/flat parity (same locations);
every old `/queue` and `/asset/:id` link resolves.

---

## Phase 4 — Code Edit

Three panes: **file tree** (left) · **editor** (centre, TerminalSurface) · **finding
panel** (right). Bottom bar for save/verify/commit.

Editor: CodeMirror 6, bundled via npm (no CDN). Syntax for Java, Python, JS/TS, Go, C/C++,
config formats. Flagged lines get a gutter mark in the priority shape. Binaries,
certificates and keystores open a read-only parsed view instead of text.

File tree: only the scanned target; per-file and per-folder finding counts; filter by
priority; opening from Findings jumps to the exact line.

**Finding panel** (right), top to bottom:
1. The finding: algorithm, location, priority, quantum status, evidence.
2. **Why this is weak** — from the NIST table, with citation and final/draft marking.
3. **What fits here** — replacement chosen by *purpose* (encryption / key exchange /
   signature / hashing / MAC), with sizes and the trade-off in one line.
4. **Change class** — "one-line swap" or "structural change — requires <library ≥ version>".
5. **What else changes** — other locations of the same asset (correlation).

**Suggestions (Copilot-style, deterministic):**
- `data/rewrites.json`: rules keyed by language + pattern → replacement template,
  notes, change class, citation. Start with high-value one-line swaps:
  Java `Cipher.getInstance("DES…"/"DESede…"/"…/ECB/…")`, `MessageDigest.getInstance("MD5"/"SHA-1")`;
  Python `hashlib.md5/sha1`, `Crypto.Cipher.DES`; Node `crypto.createHash('md5'|'sha1')`,
  `createCipheriv('des…')`; Go `crypto/des`, `crypto/md5`; config `ssl_protocols`,
  `ssl_ciphers`, `jdk.tls.disabledAlgorithms`.
- One-line swaps show as **ghost text** on the flagged line: Tab accepts, Esc dismisses,
  Alt+] next suggestion. The accepted edit is a normal editor change (undoable).
- Structural changes never appear as ghost text; the panel shows a code sketch and the
  library requirement instead.
- Every rule has a unit test: input line → expected output, and a negative test.

**Bottom bar:**
- **Save** — existing fixers flow (writes `.bak`), path confined to the target root.
- **Verify** — re-scan the edited file; while it runs, show a D11 status word (e.g.
  "Verifying the fix…"); show each claim as in effect / not in effect / not
  verified (existing claims model). Never report "fixed" without the re-scan.
- **Commit** — local only: branch `mox/fix-<asset-key>`, message
  `fix(crypto): <from> → <to> in <file>:<line> [<NIST ref>]`, author = the user's git
  identity from `git config`, approver recorded in MOX's audit log.
- **Push** — only if the source is a git repo with a remote; confirmation dialog states it
  is an outbound network call; goes through netguard; pill increments.
- **Download .patch** — for non-git sources.

Acceptance: path-traversal tests on save; rewrite-rule tests; verify shows "not in effect"
when the edit didn't remove the finding; commit test on a temp repo; push disabled when no
remote.

---

## Phase 5 — Dashboard

Top: the four KPI tiles (keep). Then a section titled exactly
**Quantum Risk Graphic & Evidence Rationale** — the phrase the problem statement uses.

- Left, **Quantum risk graphic**: the risk field (Mosca exposure × criticality) with
  severity shapes on dots (closes Major 19), dashed break-even line, readiness index.
- Right, **Evidence rationale**: for the selected dot (default: most urgent asset) —
  the fact → normalised → analysis → recommendation chain and the score arithmetic,
  reusing existing components. Clicking a dot updates it; "Open in Findings" and
  "Edit code" link out.

Below: verdict split, coverage ring, HNDL vs forgery split (keep). Every tile and segment
links to Findings with the matching filter applied.

---

## Phase 6 — Reports hub

Tabs under `/reports/:tab`: **History** · CBOM · Roadmap · Compliance · Attestation ·
Audit log · Reference.

- **History (new):** scan list; pick any two scans → delta: fixed, new, regressed,
  unchanged, with counts and links. This is §9 item 10 of the master spec.
- **Reference (new):** the local NIST status table as a browsable page with citations
  and final/draft marking (§9 item 9).
- Existing CBOM, Roadmap, Compliance, Attestation, Audit screens move in unchanged, plus
  audit Major 5 (stable `bom-ref` from the asset key; scoring properties excluded from
  Merkle leaves, so an unchanged rescan keeps the same root). CBOM build/export, report
  render and attestation signing use a D11 status word while they run.

---

## Phase 7 — Splash and login

**Splash:** shown on cold start only, while `/api/health` resolves. Rule: if boot takes
under 150 ms, skip it; once shown, keep it at least 600 ms so it doesn't flash; never an
artificial delay beyond that. Content: the CipherX mark drawing its wave in `--brand`,
"MOX" wordmark, one status line from real boot data (e.g. "Rules loaded · 90 algorithms").
Reduced motion: static mark.

**Login** (real users): username, password with show/hide, sign-in. Lockout after 5
failures for 5 minutes (server-side, audited). Idle session timeout 15 minutes with a
1-minute warning. After login: role and last sign-in time shown in the top bar menu.
Footer: "Accounts are created by an operator (`python -m mox create-admin`). No password
reset over the network." Air-gap pill visible on the login page.

---

## Phase 8 — Re-audit and demo seed

1. Re-run the twenty probes from `docs/JUDGE-AUDIT.md`; append a fourth pass to
   `docs/AUDIT.md`.
2. Seed `demo_target/` so every source kind and every plane produces findings, including
   at least: one one-line swap per language, one structural change, one hybrid endpoint,
   one HNDL key, one forgery-only key, one CONTAIN (vendor binary).
3. Answer the twelve evaluator questions in `docs/EVALUATOR-QA.md` against the new UI.
4. Screenshots of the five pages at 1280×800 into `docs/screenshots/` if a headless
   browser is available; if not, say so.
5. Final check note for the human: run on Windows locally (`run.ps1`) before recording.
