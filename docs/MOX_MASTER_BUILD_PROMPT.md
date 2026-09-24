# MOX — MASTER BUILD PROMPT

**Hand this entire file to Claude Code (Opus) at the root of the MOX repository.**
Target model: Claude Opus in Claude Code. Do not run this in chat — it requires
repository-wide file access, dependency installation, and iterative screenshot review.

---

## 0. WHO YOU ARE FOR THIS BUILD

You are the lead engineer and design lead for MOX, an enterprise cryptographic
discovery and analysis tool built for India's National Technical Research
Organisation (NTRO) and the National Critical Information Infrastructure
Protection Centre (NCIIPC).

Your work will be evaluated by people who may actually work at NCIIPC. Assume the
evaluator has run a real crypto inventory before, has read NIST SP 800-131A and
FIPS 203/204/205, and will ask you where a number came from. Build accordingly.

You do not produce a demo. You produce a working instrument that a security
engineer would keep open on a second monitor.

---

## 1. RESEARCH FIRST — DO NOT SKIP

Before writing any code, research and write a short findings file at
`docs/research-notes.md`. Do not pad it. Two pages maximum.

**Standards and domain (authoritative sources only)**
- NIST FIPS 203 (ML-KEM), 204 (ML-DSA), 205 (SLH-DSA) — parameter sets, key and
  signature sizes, security levels
- NIST SP 800-131A Rev 3 — transition dates, what is disallowed and when
- NIST SP 800-227 / IR 8547 — PQC transition guidance
- CycloneDX 1.6 `cryptoProperties` schema — the exact shape of
  `algorithmProperties`, `certificateProperties`, `relatedCryptoMaterialProperties`
- Mosca's inequality — original formulation, and the standard critique of it
- NCIIPC's mandate under Section 70A of the IT Act 2000, and the sectors it covers
- DST National Quantum Mission timelines

**Interface craft**
- Edward Tufte, *The Visual Display of Quantitative Information* — data-ink ratio,
  small multiples, layering and separation. Apply this to the risk field plot and
  the Mosca timeline specifically.
- Robert Bringhurst, *The Elements of Typographic Style* — modular scale, measure,
  and why you set one scale and hold it
- Steve Krug, *Don't Make Me Think* — for navigation and labelling only
- Study how professional security and observability tools present dense state:
  Grafana, Datadog, Snyk, Semgrep, Burp Suite, Splunk. Note what they do with
  density, what they do with severity colour, and what they refuse to decorate.

**Engineering**
- Express + SQLite production patterns: WAL mode, prepared statements, migrations
- Server-Sent Events for streaming progress (not WebSockets — SSE is simpler,
  survives proxies, and is the right tool for one-directional progress)
- Static analysis patterns for secret and crypto detection: how Semgrep, gitleaks
  and TruffleHog structure rules and confidence

When your research contradicts anything in this prompt, follow the research and
record the contradiction in `docs/research-notes.md`. That file is evidence that
the work is grounded, and an evaluator may ask to see it.

---

## 2. THE ONE-SENTENCE POSITION

> MOX produces a complete, evidence-graded cryptographic inventory of an
> enterprise, ranks every asset by when quantum actually reaches it, proposes the
> exact patch, and proves the fix landed — without a single byte leaving the
> premises.

Every screen must serve that sentence. If a feature does not serve it, cut it.

---

## 3. WHAT MAKES MOX DIFFERENT — AND WHERE EACH DIFFERENCE MUST APPEAR

This is the most important section in this document. A differentiator that exists
in the code but not on screen does not exist. Each row below is a contract: the
feature must be visible at that exact location.

| # | Differentiator | Must be visible at | Failure mode if misplaced |
|---|---|---|---|
| 1 | **Air-gapped by construction** | Persistent pill in the top bar on every screen: "Air-gapped · 0 outbound calls", with a live counter. Plus a dedicated panel on New Scan listing which planes can open a socket. | Buried in a settings page. Evaluator never sees the single strongest claim. |
| 2 | **Evidence grading** — Observed / Declared / Declared-unverified / Textual | A dedicated column in the work queue, a badge on asset detail, and a `confidence` field in the CBOM. Never mixed with severity. | Findings look like guesses. This is what separates MOX from grep. |
| 3 | **Traceable score** | Asset detail, "Why this score" card. Every term shown as a row with its own value. The total must equal the arithmetic of the rows above it, exactly. | A single number no one trusts. |
| 4 | **Mosca with a timeline, not four boxes** | Asset detail right rail. A horizontal bar showing X, then Y, with a marker at Z, and the overexposed remainder shaded. Editable X / Z recompute live. | The single most cited framework in the problem statement, rendered as arithmetic homework. |
| 5 | **CMCS — migration complexity, scored separately from risk** | Asset detail right rail, directly under Mosca. Explicit label: "how hard this is to migrate, independent of how risky it is." | Conflated with risk. Evaluators will specifically probe whether you understand these are orthogonal. |
| 6 | **Fix → approve → re-scan → attest, as a state machine** | Fix & verify screen, six-step progress rail. Includes a two-person approval gate and a verification contract table listing what will be re-checked. | "We scan and report" — which is what every other team will say. |
| 7 | **Attestation that discloses counts, never locations** | Attest screen, two explicit side-by-side lists: *Leaves the premises* / *Never leaves*. Ed25519 signature, CBOM Merkle root. | The feature NCIIPC cares about most, invisible. |
| 8 | **5-wave roadmap derived from tier + Mosca exposure** | Its own screen, plus a "you are here" marker on asset detail. | Looks like an arbitrary bucket rather than a derived plan. |
| 9 | **Live pipeline visualisation** | New Scan, during the scan. See §6. | The scan looks like a spinner. Judges cannot see the engineering. |
| 10 | **7-plane coverage** | Coverage ring on the dashboard, plane toggles on New Scan, plane tag on every finding. | Depth of scanning invisible. |

---

## 4. DESIGN SYSTEM — NON-NEGOTIABLE

The reference implementation is `MOX_UI_Blueprint.html`. Extract its `:root` block
verbatim into `src/styles/tokens.css` and import it once. After that:

**No component may define a colour, a border radius, a font size, or a row height
of its own. Every value comes from a token.** If a component needs a value the
token set does not have, add it to the token set — do not inline it.

### Palette intent
Cool institutional paper. Muted indigo as the only action colour. Risk expressed
as pastel fills with saturated text, never as saturated fills. The result must
survive being printed in greyscale on a government letterhead and still be
readable, because it will be.

Forbidden outright: neon, glow, gradient decoration, dark-mode-as-default,
`rgba(0,0,0,0.1)` drop shadows on every card, emoji as iconography,
terracotta/cream + high-contrast-serif (the current AI house style — an evaluator
who uses AI tools daily will recognise it on sight).

### Type
IBM Plex Sans and IBM Plex Mono, self-hosted (air-gap: no Google Fonts CDN at
runtime — vendor the woff2 files into the repo).

The mono/sans split carries meaning and must be applied consistently:
- **Mono** = machine truth. Algorithm names, file paths, line numbers, hashes,
  scores, key sizes, version strings, JSON.
- **Sans** = human language. Labels, explanations, headings, button text.

A reader must be able to tell, without reading, which parts of a screen the
machine asserted and which parts a human wrote.

### Geometry — 8pt grid, applied absolutely
```
rail          180px        aside         296px
top bar        44px        table row      36px
card padding   16px        grid gap       12px
radius          6px        control height 28px
```

Tiles in a row have a **fixed** height. They do not size to their content. Most of
the misalignment in the current build comes from content-derived heights.

### Layout law
The application is a **fixed 1280×720 canvas, scaled to fit the viewport**. It does
not reflow. Exactly three regions scroll:
1. the work queue table body,
2. the CBOM component list,
3. the two columns of asset detail (independently).

Everything else fits by construction. If a panel does not fit, the panel is wrong —
do not add a scrollbar to it.

### Anti-AI-look checklist — verify before every commit
- [ ] No ALL-CAPS tracked-out eyebrow label above headings
- [ ] No meta strings joined with middle dots as decoration
- [ ] No `→` appended to button text
- [ ] No fade-and-slide-up entrance on each section
- [ ] No hover transition on every card
- [ ] No numbered markers (01 / 02 / 03) on content that is not a sequence
- [ ] Every border and divider encodes a real boundary, not decoration
- [ ] Motion appears only in response to a user action, or to show scan progress

---

## 5. ARCHITECTURE

```
mox/
├─ server/
│  ├─ index.ts              Express, helmet, rate limit, SSE, JWT
│  ├─ db/
│  │  ├─ schema.sql         SQLite, WAL mode
│  │  └─ migrations/
│  ├─ planes/               one detector module per plane
│  │  ├─ source.ts          AST where a parser exists, pattern otherwise
│  │  ├─ config.ts          java.security, openssl.cnf, ssh_config, nginx
│  │  ├─ deps.ts            package-lock, requirements, pom, go.sum, Cargo.lock
│  │  ├─ certs.ts           X.509 parse — key alg, size, sig alg, validity, SPKI
│  │  ├─ binaries.ts        ELF/PE symbol table + entropy + string heuristics
│  │  ├─ containers.ts      image layer walk, base image crypto inventory
│  │  └─ tls.ts             live handshake — OFF BY DEFAULT, the only socket
│  ├─ engine/
│  │  ├─ knowledge.ts       algorithm KB loader
│  │  ├─ correlate.ts       findings → assets, dedup by SPKI / algorithm+params
│  │  ├─ score.ts           risk score, every term returned separately
│  │  ├─ mosca.ts           X + Y > Z
│  │  ├─ cmcs.ts            migration complexity, orthogonal to risk
│  │  ├─ verdict.ts         MIGRATE / CONTAIN / ACCEPT
│  │  ├─ wave.ts            5-wave assignment from tier + exposure
│  │  └─ recommend.ts       PQC mapping — DETERMINISTIC, NO LLM, NO NETWORK
│  ├─ cbom/                 CycloneDX 1.6 emit + Merkle root
│  ├─ attest/               Ed25519 sign, redacted export
│  └─ fix/                  patch generation, approval ledger, verify contract
├─ data/
│  └─ algorithms.json       the knowledge base — see §7
├─ src/                     React 18 + Vite + TypeScript
│  ├─ styles/tokens.css     THE single source of visual truth
│  ├─ components/           presentational only, token-driven
│  ├─ screens/              one per route
│  └─ lib/
└─ docs/
   ├─ research-notes.md
   ├─ ARCHITECTURE.md
   └─ SCORING.md            every formula, in prose, with worked examples
```

**Absolute constraint: `recommend.ts` contains no LLM call and no network call.**
CryptoVista routed remediation through the Gemini API. That is exactly the failure
MOX exists to avoid. PQC mapping is a deterministic function of
`(algorithm, purpose, key size, constraints)` reading from the local knowledge
base. This must be true, and it must be visibly true — an evaluator may check the
dependency list for an AI SDK.

---

## 6. THE SCAN VISUALISATION — BUILD THIS CAREFULLY

This is where judges see the engineering. Get it right.

The server streams progress over SSE. The New Scan screen renders a **live pipeline
board** while the scan runs — five stages laid out horizontally, each filling as it
completes:

```
INGEST ──────▶ DETECT ──────▶ CORRELATE ──────▶ SCORE ──────▶ VERDICT
23 files       33 findings    33 → 24 assets    24 scored     8/4/11
1.57 ms        109 ms         4.08 ms           0.67 ms       0.11 ms
```

Requirements:
- **Per-plane detail inside DETECT.** Each of the 7 planes shows its own row,
  filling independently with its own file count and timing. This is what makes the
  7-plane claim legible.
- **The dedup is animated.** "33 → 24" must visibly count down. That number is the
  proof that MOX correlates rather than dumps, and it is the single most persuasive
  half-second in the demo.
- **Real timings from `perf_counter`.** Never fake, never interpolated. If a stage
  takes 0.11 ms, show 0.11 ms.
- **Errors are stages too.** A plane that fails shows as a failed segment with the
  reason, not a toast that disappears.
- **The board persists after the scan** and becomes the dashboard's pipeline card,
  so the same visual language carries through.

Motion rule: this is the one place in the product where non-user-triggered motion
is permitted, because it reports real progress. Nowhere else.

---

## 7. THE KNOWLEDGE BASE

Port and extend the 90-algorithm knowledge base found in
`cryptovista/data/crypto_algorithms.json`. Its schema is sound — keep it and add
fields:

```jsonc
{
  "id": "rsa-1024",
  "name": "RSA-1024",
  "aliases": ["rsaEncryption", "RSA 1024", "1.2.840.113549.1.1.1"],
  "category": "DIGITAL_SIGNATURES",
  "purpose": "DIGITAL_SIGNATURE",
  "status": "DEPRECATED",
  "quantum_status": "VULNERABLE_SHOR",
  "classical_security": "BROKEN",
  "key_sizes": [1024],
  "detection_patterns": [ /* regex, per language */ ],
  "languages": ["java", "python", "go", "js"],

  // ADD THESE
  "nist_status": {                    // SP 800-131A Rev 3
    "now": "disallowed",
    "after_2030": "disallowed",
    "after_2035": "disallowed"
  },
  "oids": ["1.2.840.113549.1.1.1"],   // OID matching is far more reliable
                                      //   than name matching in certs & binaries
  "replacement": {
    "primary": "ml-dsa-65",
    "hybrid": "ml-dsa-65+rsa-3072",
    "constrained": "slh-dsa-sha2-128s",
    "rationale": "FIPS 204 Level 3; hybrid composite during transition"
  },
  "sizes": { "pubkey_bytes": 128, "sig_bytes": 128 },
  "cmcs_base": 2,                     // 1–10, migration difficulty
  "citation": "NIST SP 800-131A Rev 3, §4.2"
}
```

The `citation` field is not decoration. It is what lets asset detail say where a
claim came from, which is what makes an NCIIPC reviewer trust the output.

---

## 8. SCORING — THREE SEPARATE NUMBERS, NEVER CONFLATED

Write `docs/SCORING.md` with worked examples before implementing. Each function
returns **the components, not just the total**, so the UI can show the arithmetic.

### 8.1 Risk score (0–100)
Start from CryptoVista's weighted model but make each term inspectable:
```
base            from nist_status          (disallowed 40 / legacy 25 / ok 5)
+ quantum       from quantum_status       (SHOR +15 / GROVER +7 / safe 0)
+ evidence      from detection type       (observed +8 / declared +4 / textual 0)
× criticality   business criticality      (3 → ×1.2, 2 → ×1.0, 1 → ×0.85)
× confidence    detector confidence       (high ×1.0 / med ×0.85 / low ×0.7)
```
The UI renders one row per term. The total must be reproducible by hand from the
rows. Test this with a property test.

### 8.2 Mosca exposure (years)
```
exposure = (X + Y) − Z
X = data shelf life        — user editable, default per asset class
Y = migration time         — derived from CMCS
Z = CRQC horizon           — org-wide setting, default 10 years, user editable
```
**Handle the case that breaks naive implementations, and handle it visibly:** an
asset can have negative Mosca exposure (not quantum-exposed) while still being
wave 1, because it is *already classically broken*. RSA-1024 is exactly this. The
UI must state the resolution in words on the card, not leave the contradiction
sitting there. An evaluator will find this case.

### 8.3 CMCS (1–10)
Orthogonal to risk. Derived from: where the crypto lives (certificate re-issue is
easy, hardcoded in a vendor binary is not), how many locations, whether a vendor
controls it, whether a protocol renegotiation is required.

Label it on screen as: *how hard this asset is to migrate, independent of how risky
it is.* Those exact words, because that is the distinction judges will test.

---

## 9. SCREENS

Build in this order. Do not start the next until the previous passes §11.

1. **New Scan** — target picker, plane toggles with sockets clearly marked, live
   pipeline board (§6)
2. **Dashboard** — 4 metric tiles, verdict split bar, pipeline card, risk field
   plot (Mosca exposure × criticality, dot size = score, dashed break-even line)
3. **Work queue** — the operational centre. Sortable, filterable, with the Evidence
   column. Keyboard navigable: `j`/`k` to move, `Enter` to open, `/` to search.
4. **Asset detail** — two columns. Left: locations, NIST status, why-this-score,
   evidence chain. Right: Mosca timeline, CMCS meter, recommended replacement.
5. **Fix & verify** — six-step rail, diff, impact-before-approval, two-person
   approval gate, verification contract
6. **CBOM** — component table, document metadata, live JSON preview, Merkle root
7. **Roadmap** — 5 wave cards, filterable asset table, owner column with
   unassigned flagged
8. **Attest** — leaves / never-leaves lists, signed JSON preview
9. **Knowledge base** — browsable algorithm reference with citations (port from
   CryptoVista; it is genuinely useful and it demonstrates depth)
10. **History** — scan-over-scan delta. What was fixed, what regressed, what is new.
    This is what turns MOX from a report into a programme.

---

## 10. BACKEND QUALITY BAR

- SQLite in WAL mode. Prepared statements everywhere. Real migrations.
- JWT with short expiry; refresh handled server-side. Argon2id for passwords.
- Helmet, CORS locked to same origin, rate limiting on auth and scan endpoints.
- Every scan writes an immutable row. History is append-only — a compliance tool
  that can rewrite its own history is worthless.
- Every API response carries `{ data, meta: { version, took_ms } }`. The UI shows
  `took_ms`. Speed is a feature; make it legible.
- Structured logs to a local file. No telemetry. No crash reporting to a vendor.
- Graceful degradation: if the Python scanner is absent, the JS fallback runs and
  the UI says which engine produced each finding. Never fail silently.

---

## 11. DEFINITION OF DONE — CHECK EVERY SCREEN AGAINST THIS

A screen is not finished until all of these pass. Take a screenshot and review it
yourself before declaring a screen done.

**Visual**
- [ ] Every colour, size and spacing value resolves to a token
- [ ] All tiles in a row are exactly the same height
- [ ] The screen fits 1280×720 without scrolling, except the three permitted regions
- [ ] Mono is used only for machine-asserted values
- [ ] Passes the §4 anti-AI-look checklist
- [ ] Legible in greyscale

**Functional**
- [ ] Every number on screen traces to a server response, not a constant
- [ ] Empty state written as a direction, not an apology ("Nothing left to fix
      automatically" is a dead end — say what to do next)
- [ ] Error state names what failed and what to do
- [ ] Loading state shows progress, not a spinner
- [ ] Keyboard reachable; focus ring visible
- [ ] No dead controls — if a button is there, it does something

**Defensible**
- [ ] Every claim on screen has a citation available within one click
- [ ] You can answer "where did that number come from" for every figure
- [ ] Nothing contradicts anything on another screen

---

## 12. THE QUESTIONS YOU WILL BE ASKED — BUILD THE ANSWERS IN

Write `docs/EVALUATOR-QA.md` answering each of these, and make sure the product
itself answers them without needing the document.

1. This RSA-1024 shows Mosca −2 but sits in wave 1. Explain.
2. What is the difference between an HNDL risk and a signature-forgery risk, and
   does your UI distinguish them?
3. Your scanner found RSA in a dependency string. Is that asset actually using RSA?
   How does the UI communicate that difference?
4. What happens on a packed or obfuscated binary?
5. What happens with runtime-dispatched crypto that static analysis cannot see?
6. Why is CMCS separate from risk score?
7. What exactly does the attestation disclose, and what does it withhold?
8. Prove nothing left the machine during that scan.
9. Your dashboard says 22 assets from 30 findings. Where did the other 8 go?
10. Show me the CBOM validating against the CycloneDX 1.6 schema.
11. Who can approve a fix, and where is that recorded?
12. Run it again on the same target. Show me the delta.

A product that answers all twelve on screen, without its author speaking, is the
one that wins.

---

## 13. BUILD SEQUENCE

Do not build screens in parallel. Complete each phase before moving on.

1. `docs/research-notes.md` — research, written up
2. `tokens.css` + component primitives (Badge, Card, Table, Tile, Meter, Button)
   — build a `/kitchen-sink` route showing every primitive in every state, and
   review it visually before building any screen
3. Knowledge base: port, extend with `nist_status`, `oids`, `sizes`, `cmcs_base`,
   `citation`
4. Engine: correlate → score → mosca → cmcs → verdict → wave. Unit tests with
   worked examples from `SCORING.md`.
5. Planes, one at a time, each with fixtures. Source → config → deps → certs →
   binaries → containers → TLS.
6. SSE pipeline + New Scan screen
7. Screens 2–10 in the §9 order
8. CBOM schema validation in CI
9. Attestation signing + verification round-trip test
10. Seed a realistic demo target: ~25 files, 6 planes, a known-good expected
    result committed as a fixture. The demo must be reproducible on a fresh clone.

---

## 14. WHAT SUCCESS LOOKS LIKE

An NCIIPC engineer opens MOX on an air-gapped workstation, points it at a repository,
and watches the pipeline resolve 33 findings into 24 assets in under a second. They
open the top item, see exactly why it scored 70 with every term shown, see that
Mosca says it is not quantum-exposed but it is wave 1 because it is already broken,
read the proposed patch, approve it, re-scan, and export an attestation that proves
the fix landed without revealing where the weakness was.

At no point do they wonder what the tool is doing, where a number came from, or
whether anything left the building.

Build that.
