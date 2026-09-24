# MOX — Evaluation memo (Part A, first pass)

**Evaluator:** Dr. R. Subramanian (role-played per `docs/JUDGE-AUDIT.md`)
**Build:** `789f84c` (phase 14), `web/dist` built 2026-09-24 12:06, `pytest` 70 passed
**Method:** I ran `python -m mox serve` against an isolated `MOX_DATA` copy, not the team's DB. I scanned a copy of
`demo_target/`, which already had the team's earlier fixes applied (nginx, passwords.py, sign.js). I used the API
with curl and drove the UI in headless Chrome over the DevTools protocol at 1366×768, with emulated achromatopsia,
deuteranopia and print media. The Chrome extension was not connected, so this is not a real 2am monitor.
Screenshots were used for the visual checks. I recomputed the Merkle root independently. I read the code behind
every claim I cite.

Baseline on a full 6-plane scan: 23 files, 30 findings, 22 assets, **MIGRATE 11 / CONTAIN 4 / ACCEPT 7**,
3 HNDL-exposed, readiness 69.

---

## Verdict

**Not shortlisted as it stands. I would re-examine it if the Critical list is closed, because the foundations are
the best I have seen this cycle.** Most teams merge risk, Mosca exposure and migration difficulty into one number.
MOX keeps them apart. It grades evidence as observed, declared or unverified. Its score reconstructs by hand to the
decimal. Its outbound-call counter is a real socket hook, not a label. That is serious work.

It then spends that credibility in places a CII operator would check first. The nginx "fix" writes a config that
can never negotiate the hybrid group, and MOX then credits that endpoint as hybrid-protected. The red headline HNDL
number includes a key whose own config says `SIGN_VERIFY`. The compliance report hard-codes "7 planes" and "no
network calls". The whole ACCEPT population flips to MIGRATE when one global setting moves by two years. Finally,
about one cold load in eight shows **"No scan recorded yet"** over a database holding 22 assets, because of a
threading bug in the DB dependency. That last one is what I would see in my first ninety seconds.

---

## Critical — fix before any demo

Ranked by what a judge notices first.

**C1. The dashboard intermittently says "No scan recorded yet" when a scan exists.** Screen: Dashboard, Work queue
top bar, Asset detail, Fix.
- **Measured:** 5 of 40 cold loads of `/` rendered the empty state (screenshot taken). 2 of 30 cold loads of
  `/queue` showed "No scan yet" in the top bar over a full 22-row table, and the rail then highlights both "Work
  queue" and "Asset detail". Across 148 API calls on page load, 6 returned 500.
- **Root cause:** `mox/api.py:19-24`. `_conn()` is a sync generator dependency, and FastAPI may run its teardown
  on a different threadpool thread. `conn.close()` then raises `sqlite3.ProgrammingError: SQLite objects created
  in a thread can only be used in that same thread` (23 tracebacks in the server log). The response becomes a 500
  and the connection leaks. The tests do not catch this; they all pass.
- **Secondary damage:**
  - `Roadmap.jsx:9` and `Fix.jsx:11` have no `.catch`, so on a 500 they sit on "Loading…" forever. `/fix` hung
    3 of 10 times.
  - `Asset.jsx:184` misreads a 500 as "It may belong to an older scan".
  - The empty dashboard's "Scan the demo target" button (`Dashboard.jsx:26`, `api.py:163`) silently rescans the
    bundled `demo_target`, replacing whatever the operator was looking at.

**C2. The primary call to action on the top-ranked asset is a dead end.**
- Queue "Open first fix" (`Queue.jsx:74,90`) and Asset "Open fix" / "Open fix and verify" (`Asset.jsx:220,306`)
  appear whenever a location is not in a binary. They do not check whether a fixer exists.
- For the #1 asset (RSA-1024 `legacy-portal.crt`, finding 12), preview returns
  `422 no automatic fix for RSA at certs/legacy-portal.crt:1`. The same happens for `auth/token_signer.py:10` and
  for CONTAIN assets such as `infra/kms.tf`.
- `Fix.jsx:38` renders the raw server text ("Internal Server Error" or the 422 detail) with only "← All fixes".
  That list says "Nothing left to fix automatically." (`Fix.jsx:16`), so the loop ends there.
- `api.py:105` sets `fix_finding` from plane alone and should consult the fixer registry.

**C3. The nginx fixer creates a false "hybrid" claim, and MOX then scores against it.**
- `mox/fixers/__init__.py:29-49` inserts `ssl_ecdh_curve X25519MLKEM768:X25519;` next to `ssl_protocols TLSv1.2;`.
- **Problem 1 — the group can never be used here:** X25519MLKEM768 is a TLS 1.3 group, and the fixer removed
  TLS 1.0/1.1 without adding 1.3 when 1.2 was present (`:38`).
- **Problem 2 — a static-RSA cipher stays enabled:** the fixer removes only `DES-CBC3-SHA` and leaves `AES128-SHA`
  (static-RSA key transport, no forward secrecy). That is exactly the harvest-now path the hybrid group is meant to
  close.
- **Problem 3 — it can stop nginx starting:** the group name is also rejected outright by OpenSSL builds older
  than 3.5, so nginx will refuse to start on most current distributions.
- **How MOX scores the result:**
  - `correlate.py:79` marks the api-gw asset `hybrid` because the group string is present.
  - `score.py:111-112` then **drops HNDL** for it.
  - `score.py:133-135` prints "hybrid key exchange removes harvest-now risk".
  - The attestation reports `hybrid_pq_count: 2`.
- **What the UI claims:** `Fix.jsx:59` tells the analyst "Legacy protocols and ciphers are removed and the hybrid
  X25519MLKEM768 group is offered first". Both halves are false for the file on disk (verified against
  `conf/nginx.conf` vs `.bak`).
- This is the "proves the fix" step proving something untrue.

**C4. The HNDL headline counts keys that cannot be harvested.**
- Dashboard tile "3 Harvest-now-decrypt-later exposed" (`Dashboard.jsx:66`), from `score.py:103-108`. Any RSA not
  seen in a certificate is tagged `{hndl, forgery}` "until verified", and it then counts in the HNDL tile as
  **fact**. The three counted assets are:
  - `infra/kms.tf:4`, whose config line 3 reads `key_usage = "SIGN_VERIFY"`. It is a signing key and cannot be
    harvested. The asset page still says "Traffic or data protected by this key can be recorded today".
  - `vendor/sync-agent.bin` RSA, which is **textual** evidence (a string in bytes).
  - `payments/Crypto.java:11`, a `KeyPairGenerator` with unknown use.
- The same rule tags `web/sign.js:8` (`crypto.createSign('RSA-SHA256')`) as HNDL.
- The one asset with a real HNDL path is `api-gw` behind `AES128-SHA` static RSA. It is counted as forgery only,
  and then as hybrid-safe (C3).
- **Net:** of the 3 on the red tile, 0 are demonstrated and 1 is contradicted by its own source line. The
  attestation exports this number as `hndl_exposed`.

**C5. The Compliance Report hard-codes claims the scan does not support.** Screen: Compliance Report and its PDF.
- **"7 planes":** `report.py:92` and `Report.jsx:25` say "MOX scanned 23 files across **7** planes".
  `len(d['planes'])` is the static list at `report.py:16-19`, not planes hit. Only 6 ran, and Live TLS is listed
  under "Tools Used" when it never ran.
- **"No network calls were made":** `report.py:96-98` prints this unconditionally, whether or not a probe ran or
  the counter moved. The measured `scan.net` is right there and unused.
- **"Verified fixes cleared in this scan":** `report.py:44,118` counts `fixes` across **all time and all
  targets**, not this scan.
- **"ACCEPT (no action needed)":** `report.py:118` contradicts the product's own ACCEPT text ("Monitor;
  re-assess").
- **Undeclared dependency, false comment:** `report.py:1` says "PDF is written with the stdlib (no extra deps)",
  but line 7 imports `reportlab`. That package is not on the allowed-deps list in `CLAUDE.md`, and it pulls in
  `pillow`.
- **Undated citations:** `report.py:20-22` cites "NIST SP 800-131A" with no revision and "NIST IR 8547" with no
  draft status.
- A regulator reads this page first. Every one of these is a claim with no derivation.

**C6. The verdict split collapses to 15 / 0 / 0 when the global horizon moves by two years (root cause of
Part B1).** Reproduced with the planes and settings below; the 4-plane subset is the one in B1 (18 files,
15 assets).

| Planes | Z = 10 | Z = 8 (or less) |
|---|---|---|
| all 6 | 11 / 4 / 7 | 18 / 4 / 0 |
| code, deps, certs, containers | 8 / 0 / 7 | **15 / 0 / 0** |

- **Why ACCEPT is a knife edge:**
  - `score.py:199-201` computes Mosca exposure for **every** asset, including a library name with no algorithm
    (`node-forge`, threats `[]`), with X=7 by default and Y from CMCS.
  - Every dependency lands on exposure **exactly 0** at Z=10.
  - `verdict.py:70` ACCEPTs only if exposure ≤ 0, so Z=9 flips all seven dependencies to MIGRATE.
  - None of them is quantum-vulnerable. Mosca should not apply to them at all.
- **Why CONTAIN disappears:** it comes only from `binaries` (no source) and the `kms` path token (Y≥5,
  `verdict.py:65`). Turn those planes off and CONTAIN is structurally unreachable.
- **How Z gets changed by accident:** Z is editable on **every asset page**, labelled "Z quantum horizon, all
  assets" (`Asset.jsx:139-140`), with a 400 ms debounce (`:74-79`). Typing "15" saves Z=1 first. That triggers a
  full re-analysis of every asset, and it is not disclosed in the attestation.

**C7. The correlation table, MOX's signature feature, is invisible at 1366×768.**
- Asset detail, card "Locations: what breaks if this asset changes". `.split .lft` is a fixed-height flex column
  (`styles/asset.css:12`) and `.bp-card` has `overflow:hidden` (`index.css:56`), so the card flex-shrinks.
- **Measured on asset 1 (api-gw):** table 282 px tall inside a 98 px card, so 7 rows with at most 2 visible.
- **On asset 4:** 0 rows visible, header only.
- "7 findings → 1 asset" is the thing I would ask to see, and the screen hides it.

---

## Major — fix before submission

**Honesty**

1. **Draft NIST documents drive "now" statuses and future columns without a draft label on the value.**
   - `nist_status.json:52` sets AES-ECB `now: deprecated` from **SP 800-131A Rev.3 initial public draft**, and
     that adds +25 base risk. The team's own `docs/research-notes.md:30` says "now" follows Rev.2 final.
   - `nist_status.json:16,20` credit RSA/DH-2048 `after_2030: deprecated` to "131A, 8547". Rev.2 says no such
     thing; that is IR 8547 **draft**.
   - The Asset "NIST status" boxes (`Asset.jsx:250`) render After 2030 / After 2035 in the same style as "Now",
     with no "proposed" marker. The citation line does say "initial public draft", which earns partial credit.
   - The CBOM `mox:nist_2030/2035` properties carry no status either.
2. **"Air-gapped" is asserted from a narrower measurement.** `AirGapPill.jsx:27` prints "Air-gapped: 0 outbound
   calls". `netguard.py:45-60` hooks only Python `socket.connect/connect_ex` in the server process. It does not
   see:
   - DNS lookups: `getaddrinfo` runs in C before `connect`.
   - UDP `sendto`.
   - Other processes, such as `pip` in `run.ps1`.
   - SMB reads from a mapped drive letter (`jobs.validate_path` blocks only UNC).

   The number is honest; the word is not. Say "0 outbound connects counted".
3. **Attestation "verified" has no trust anchor.**
   - `attest.verify` (`attest.py:98-109`) checks a signature against a key that **the same database registered**
     (`register_key`). The demo generator mints a key, signs, stores the public half and discards the private half
     (`attest.py:171-188`).
   - Sector view "37 signed attestations verified" (`Sector.jsx:16`) therefore proves self-consistency, not
     operator identity.
   - The page is labelled demo data (credit), but the tile's word "verified" is not.
   - The attestation also omits Z, X defaults and plane list, so readiness indices from two operators are not
     comparable. The sector view averages them anyway (`attest.py:207`).
4. **The Attest page promises a field the export does not contain.** "Asset counts by risk tier"
   (`Attest.jsx:4`) is not in the JSON, which has total, hndl, qv and safe only.
5. **The Merkle root is not stable for an unchanged tree.** `bom-ref` is `mox-asset-<DB row id>`. Re-scanning the
   identical folder moved the root from `339a9ae7…bebee` to `1163b28d…982b`. Components also embed score, verdict
   and wave, so changing a setting changes the root with no crypto change. A regulator cannot use two roots to say
   "nothing changed".
6. **ACCEPT with a green "No quantum or classical weakness recorded" on unverified evidence.**
   - Asset 6 (`node-forge`, "Declared, unverified", "Verify first") shows the calm green alert (`Asset.jsx:223`)
     and ACCEPT. MOX never checked whether RSA from that library is reachable.
   - The evidence chain line does say "use not proven", but the banner and the verdict override it.
   - An unverified item should be "Verify first", not ACCEPT.
7. **The wave explanation contradicts itself.**
   - `verdict.py:48-49` says of RSA-1024 (exposure −2): "Mosca only measures the quantum deadline, which this
     asset has **already missed**". −2 means it has *not* missed the quantum deadline.
   - The Mosca card (`Asset.jsx:94-95`) words it correctly, so the two panes disagree on one screen.
8. **"exposed: 7 assets" on the risk field includes assets that are not quantum-exposed.**
   - `RiskField.jsx:44,67` counts `exposure > 0` over all assets. That includes DES `payments/Crypto.java:16`, MD5
     and OpenSSL strings in `sync-agent.bin`, none of which Shor touches.
   - The dashboard tiles (HNDL 3 + forgery 4) reach the same 7 from a different set. That is a coincidence, and a
     judge will not believe it is one.
9. **Readiness is shown in a "safe" colour whatever its value** (`Dashboard.jsx:70`, `tone="safe"`). The formula
   also triple-counts one asset (HNDL ⊂ QV, and usually MIGRATE) with undefended weights 50/30/20
   (`attest.py:84-88`). The formula is disclosed on hover, which is credit; the colour is not honest.

**Prioritisation**

10. **Ties are broken by DB insertion order.**
    - `Queue.jsx:53` falls back to `b.score - a.score`, which is 0 on a tie, then API order.
    - Asset 14 (`kms.tf`, 24.5, CONTAIN, Mosca +2, CMCS 10) sits above asset 15 (`Crypto.java:11`, 24.5, MIGRATE,
      Mosca +7, CMCS 4) for no stated reason.
    - The three `conf/java.security:3` assets tie at 43.4 / 43.4 / 30.6, and they are one line.
11. **Queue order and wave order disagree with no explanation.**
    - Sorted by risk, RC4 (Medium, wave 4) ranks above `kms.tf` (wave 2), and `api-gw` (wave 2) sits among
      wave-1 rows.
    - The screen's question is "What do I do next?", and the queue gives two different answers.
    - The Risk tier ignores HNDL entirely: `Crypto.java:11` is **Low** tier with Mosca +7.
12. **The same algorithm gets different verdicts because of detector confidence.** ECDSA P-256 in
    `ecdsa-p256.crt` (observed, high) is MIGRATE wave 4. ECDSA P-256 in `services/ecdsa.go` (declared, medium) is
    ACCEPT wave 5. Same X, same Z. I cannot defend "we accepted it because the scanner was less sure it saw it" to
    a CISO.
13. **Dashboard tiles do not filter.** "3 HNDL exposed", "9 quantum-vulnerable" and "22 assets" all link to the
    unfiltered `/queue` (`Dashboard.jsx:65-69`). I cannot click the red number to see the three.
14. **The roadmap has waves but no time.**
    - Waves have names and counts but no dates, durations or engineer-effort.
    - Wave 1 is named "Discover" yet holds remediation work.
    - Wave 3 is empty.
    - Screen question: "What is the plan over 30 months?". There is no month on it.

**Air gap**

15. **The install is not reproducible offline.**
    - `requirements.txt` is unpinned, with no hashes and no wheelhouse.
    - `run.ps1:7` runs `pip install` on **every** launch. pip's self-version check contacts PyPI unless
      `--disable-pip-version-check` is passed.
    - There is no documented offline bundle path.
    - `web/package-lock.json` exists (credit).
    - `recharts` is an unused dependency.
16. **A user can open an outbound socket by typing.** The "Live TLS" field on New Scan (`NewScan.jsx:88`) and
    `jobs._probe` (`jobs.py:71-78`) accept any `host:port`, including public hostnames. There is no confirmation
    and no loopback-only default. DNS resolution happens before the hook can count it.
17. **The per-plane socket claim is shallow.** `netguard.plane_sockets` parses only each plane module's *direct*
    imports. A plane that calls a helper which opens a socket would show "reads disk only". The scanner and
    correlate modules are not inspected.

**Legibility**

18. **Attest overflows at 1366.** The page is 1928 px wide. The `340px 1fr 340px` grid (`Attest.jsx:30`) plus an
    unwrapped `<pre>` pushes the Signing, Self-check and Export column off-screen, behind a horizontal scrollbar.
19. **Critical and High are identical in greyscale and under deuteranopia on the risk field.**
    `RiskField.jsx:8-10` gives both solid fill. The comment admits "tier inks alone fail CVD separation" but only
    fixes Medium and Low.
    - In the queue under achromatopsia, all tier and verdict pills become the same grey lozenge; only the text
      survives.
    - Answer to P17: **Critical and High** merge. Medium and Low stay distinct by shape.
20. **Printing loses most of the queue.** There is no `@media print` anywhere. The rail and top bar print, the
    queue is an inner scroll box, and the PDF is **1 page with about 11 of 22 rows**.
21. **Risk-field labels collide (confirms B3).** "DES payments/Cry…" overprints "RSA-2048 api-gw" at +7/+9 on the
    mission-critical row, and the right-edge label is clipped. "RSA-1024 legacy-portal.crt" runs through
    neighbouring dots at −2.
22. **Page and card are both near-white (confirms B4).** `index.css:8,10` sets `body` to `--bg:#F7F8FA`, not
    `--paper:#EEF1F4`, and redefines `--line` after `tokens.css`, so two token systems coexist. Several screens
    (Fix, CBOM, Roadmap, Attest, Report) still use the pre-blueprint `.panel`/`.pill` styling with drop shadows
    (`index.css:23-24`).
23. **Dead space in the Verdict split card (confirms B5).** About 70 px of empty card under one bar at 1366.

---

## Minor — fix if time

- **The CBOM is schema-valid but thin.**
  - Six libraries (OpenSSL, node-forge, bcprov…) are modelled as `assetType: algorithm, primitive: other`.
    They are libraries, not algorithms.
  - Certificates carry only `certificateFormat`: no `signatureAlgorithmRef`, `subjectPublicKeyRef`,
    `notValidAfter` or fingerprint.
  - No OIDs, no `occurrences`/evidence locations, no dependency graph from asset to locations. The CBOM never
    leaves the premises, so it can afford to carry locations.
- **The Merkle construction is non-standard.** It hashes hex-string concatenations with no leaf/node domain
  separation, and it duplicates the last odd node, so `[a,b,c]` and `[a,b,c,c]` share a root (`attest.py:60-66`).
  It is harmless today but it will be asked about. No inclusion proof is exportable, so the tree adds nothing a
  flat hash would not.
- **Scan time disagrees on one screen.** The top bar says 0.105 s; the pipeline says Verdict landed at +121 ms.
- **A failed probe looks complete.** A failed Live TLS probe renders a full bar and "1/1" in the pipeline. The
  error is only in 10 px text.
- **Three findings on one config line become three assets.** `jdk.tls.legacyAlgorithms=DES, DESede, RC4` becomes
  three High/Medium "assets", which inflates counts. It is also a *legacy* (last-resort) list, and that nuance is
  not shown.
- **Asset 14 contradicts itself.** "Vendor: you control the code +0" sits beside "Location: firmware / HSM / KMS
  +10". CMCS 10 comes from the substring `kms` in a path (`score.py:147`).
- **The top bar shows the full absolute target path, wrapping to two lines.** It also leaks the user's home path
  into screenshots.
- **Glyphs used as icons.** `✓`/`✕` on Attest and Sector; `▾`/`▴` and `→` are text glyphs rather than a vendored
  icon set.
- **Motion is not handled.** `prefers-reduced-motion` is honoured only in `Pipeline.jsx:17`, and the CSS has no
  motion tokens.

---

## Credit where due

- **A number I can reconstruct by hand.** Highest asset, RSA-1024 `legacy-portal.crt`: 40 (disallowed) + 15
  (Shor) + 8 (observed) = 63, × 1.0 × 1.0 = **63.0**. It matches exactly (P1). Asset 14 shows its rounding
  honestly: "24 × 1.2 × 0.85 = 24.48 ≈ 24.5". Readiness 69 reconstructs from the hover formula:
  (100 − 640/22) × 0.971.
- **Distinctions most teams collapse:**
  - risk vs Mosca vs CMCS, each with its own breakdown;
  - HNDL vs forgery, with the X label switching to "signature trust life";
  - observed / declared / unverified / textual evidence, filterable;
  - "classically broken" vs "quantum-exposed" on the Mosca card.
- **Measured, not asserted.** The socket counter is a real hook. A loopback probe to `127.0.0.1:9` moved
  `loopback` from 1 to 2 and was recorded per scan (`guard: true`). Across every page load, headless Chrome saw
  **zero** requests to any origin other than 127.0.0.1. Fonts are system fonts and CSS is bundled, with nothing
  fetched (P12).
- **The Merkle root recomputes independently.** From the downloaded CBOM:
  `339a9ae7ee2bc0839c52b63936e2cb82431032af356ee03ae78682a4c88bebee` matches the attestation (P5). The self-check
  re-derives it too.
- **The dependency tree is clean.** 57 Python packages and 186 npm lock entries contain no AI/LLM SDK, analytics,
  telemetry or crash reporter (P11).
- **Limits admitted in the product.**
  - "Declared, unverified … use not proven".
  - X shown as "default for unclassified data".
  - The Sector page labelled "simulated attestations · demo data".
  - The NIST citation spells out "initial public draft".
- **Speed is shown.** Per-plane ms and per-stage timings come from perf_counter and stream over SSE.
- **Keyboard.** From `/queue`: `j j Enter` opens the third asset, and 2× Tab reaches "Open fix" (P18). It then
  dead-ends; see C2.
- **The attestation genuinely leaks nothing.** No path, host or IP (checked by regex plus the scan's own file
  list).

---

## The three questions I would ask in Q&A that this tool cannot currently answer

1. **"Your fix added X25519MLKEM768 to a server you left on TLS 1.2 with `AES128-SHA` enabled. Show me a
   handshake where that group is negotiated. If you can't, why does MOX mark this endpoint hybrid and remove its
   harvest-now exposure?"**
   The live probe cannot answer, because Python's `ssl` never offers the hybrid group. So nothing in MOX ever
   *observes* hybrid; it only reads it from config.
2. **"Two operators submit readiness 69. One ran six planes with Z = 10, the other four planes with Z = 8. What
   does the sector view learn from averaging them, and how would I know?"**
   The attestation carries neither Z nor the plane list, nor any trust anchor for the operator key. Readiness is
   an undisclosed-weight index, and the root changes on every rescan of an unchanged tree.
3. **"Your #1 item is a public-facing RSA-1024 TLS certificate and you recommend ML-DSA-65. Which CA will issue
   that certificate on Monday, and which browser will accept it? And why does MOX tell me this certificate is
   forgery-only when your own config enables static-RSA key exchange?"**
   The replacement map ignores deployability, where the interim answer is RSA-3072 or ECDSA P-256 now and PQ when
   the WebPKI supports it. Threat classification ignores the cipher suites that actually use the key.

---

## Probe record (P1–P20)

| # | Answer | Verdict |
|---|---|---|
| P1 | RSA-1024 `legacy-portal.crt`: 40 + 15 + 8 = 63, × 1.0 × 1.0 = 63.0 = total | **Pass** |
| P2 | On screen: SP 800-131A Rev.2 (final, labelled 2019); IR 8547 (draft, labelled "initial public draft"); FIPS 186-5 (final). The AES-ECB "now" comes from the 131A Rev.3 draft. The 2030/2035 boxes are unmarked. The PDF cites both 131A and 8547 undated | **Partial** (Major 1, C5) |
| P3 | `node-forge` is "Declared, unverified" with a Verify-first badge and an "use not proven" line, but ACCEPT plus a green "No weakness recorded" | **Partial** (Major 6) |
| P4 | Sector "37 signed attestations verified" against self-registered keys. Report "Verified fixes … in this scan" is all-time. Fix "cleared" is backed by a re-scan event (good) | **Fail** (Major 3, C5) |
| P5 | Recomputed root matches. It is not stable across rescans | **Pass**, with Major 5 |
| P6 | 11 / 4 / 7 on the full scan. It collapses to 15 / 0 / 0 on 4 planes with Z ≤ 8; cause in C6 | **Fail** (fragile) |
| P7 | Lowest MIGRATE: RSA-3072 `Crypto.java:11`, 24.5 Low. Its X = 15 comes from the path token "payments", which is shown and editable, so a CISO has grounds to argue. The verdict reason is the generic "weak or quantum-vulnerable and patchable" | **Partial** |
| P8 | 24.5 vs 24.5 (assets 14 and 15): nothing breaks the tie except insertion order | **Fail** (Major 10) |
| P9 | RSA-1024, Mosca −2, wave 1. The Mosca card explains it correctly in words; the wave reason contradicts it ("already missed") | **Partial** (Major 7) |
| P10 | Distinguished in tiles, alerts and the X label. Misclassified for SIGN_VERIFY and `createSign` keys, and blind to cipher suites | **Partial** (C4) |
| P11 | No AI, telemetry or analytics. `reportlab` + `pillow` sit outside the allowed list. Unpinned; pip version check on every launch | **Pass** on telemetry, Major 15 |
| P12 | System fonts, bundled CSS, 0 external requests observed | **Pass** |
| P13 | A real `socket.connect` hook; the loopback count moved on a probe. It misses DNS, UDP and other processes | **Pass**, with Major 2 |
| P14 | TLS probe (user-typed, any host), `demo_tls` listener, uvicorn on 127.0.0.1, `run.ps1` pip/npm, mapped network drives. The New Scan field is one keystroke from an outbound connect | **Partial** (Major 16) |
| P15 | Attest scrolls horizontally (1928 px). Asset Locations clipped to 0–2 rows. Dashboard risk field below the fold | **Fail** (C7, Major 18) |
| P16 | Queue survives greyscale by text only. Tier and verdict pills become identical. The risk field loses Critical vs High | **Partial** |
| P17 | **Critical and High** become the same colour and fill on the risk field | **Fail** |
| P18 | Reaches "Open fix" in 4 keystrokes; the fix then 422s. Rows are not tab-focusable (j/k only) | **Partial** |
| P19 | Good: Queue (Clear filters, Start a scan) and Dashboard empty. Dead ends: Fix "Nothing left to fix automatically."; CBOM/Attest/Report "Run a scan first." with no control; Pipeline "Run a new scan" with no link; Roadmap/Fix list hang on "Loading…" on error | **Fail** |
| P20 | Dashboard renders in 483 ms, but the most urgent asset is not named above the fold at 1366×768. Via Work queue it is about 15 s to the name and about 25 s to "why" on Asset detail. 1 in 8 cold opens shows the false empty state | **Pass** only when the page loads; **Fail** at 12.5% |

---

# Second pass — after phase 15 (C1–C7)

**Build:** phase 15 working tree. `pytest` 91 passed (was 70; 21 new tests in `tests/test_phase15.py`, 3 older
tests updated to the new rules). `npm --prefix web run build` passes.

**Method:** same as the first pass. Isolated `MOX_DATA`, the same audit-state copy of `demo_target` (with the
earlier bad nginx fix still on disk), headless Chrome over the DevTools protocol at 1366×768, API via curl.

**New baseline on the full 6-plane scan:**
- 23 files, **31** findings (+1: the static-RSA `AES128-SHA` suite is now its own finding), 22 assets.
- **MIGRATE 11 / CONTAIN 4 / ACCEPT 7**.
- **HNDL 1** (was 3), forgery 2, purpose undeclared 2, hybrid 1 (was 2).
- Readiness 73 (was 69, because the HNDL count fell).

## Critical findings: status

| # | Finding | Status | Evidence |
|---|---|---|---|
| C1 | Dashboard intermittently "No scan recorded yet" | **Closed** | 0/40 cold dashboard loads false-empty (was 5/40). 0 of 208 and 0 of 270 API calls returned 5xx (was 6/148). 0 `ProgrammingError` in the server log (was 23). Regression test `test_conn_dependency_closes_on_another_thread` fails before the fix and passes after. A failed load now says "Could not load the latest scan … Retry", never "no scan". Roadmap and Fix list no longer hang on error. |
| C2 | "Open fix" on the top asset is a dead end | **Closed** | `fix_finding` is computed from the fixer registry against the file on disk (`flow.fixable`). RSA-1024 `legacy-portal.crt` offers no "Open fix". Its Locations rows say "manual", and the card gives the manual path plus re-scan. Every `fix_finding` the API offers previews with 200 (test). Queue "Open first fix" → `/fix/<id>` renders a diff. A direct 422 now explains the manual path, with Back / Auto-fixable / Re-scan controls. The empty Fix list links to the MIGRATE queue and re-scan. |
| C3 | Fixer creates a false "hybrid" claim | **Closed** | See the notes below this table. |
| C4 | HNDL counts keys that cannot be harvested | **Closed** | See the notes below this table. |
| C5 | Report hard-codes claims; `reportlab` | **Closed** | See the notes below this table. |
| C6 | Verdict split collapses when Z moves | **Closed** | See the notes below this table. |
| C7 | Locations table invisible at 1366×768 | **Closed** | `.split .lft > * { flex-shrink: 0 }`. `api-gw`: **8 of 8** rows visible, card 354 px vs table 318 px (was about 2 of 7). RSA-1024: 1 of 1 (was 0). |

**C3 notes.**
- **The fixer:** it now adds TLS 1.3 whenever it offers X25519MLKEM768. It drops static-RSA suites only when a
  forward-secret suite remains.
- **What the analyst sees:** the Fix screen lists each claim before approval, checked against the patched text,
  as **In effect / Not in effect / Not verified**. After apply the claims are re-derived from the file on disk.
- **Status when a claim fails:** a patch with any claim not in effect gets status `not-in-effect`. That status is
  never counted as cleared (test `test_fix_that_cannot_fully_take_effect_is_not_reported_cleared`).
- **Things MOX cannot check offline are labelled, not claimed:**
  - "Server TLS library supports X25519MLKEM768" is always **Not verified**, because it needs OpenSSL 3.5+.
  - "Harvest-now exposure removed" is shown as **Not in effect (limit of this patch)** while an X25519 or TLS 1.2
    fallback remains.
- **Hybrid credit:** an asset is `hybrid` only when its declared config can negotiate the group. `api-gw`
  (TLS 1.2-only config) now reads "hybrid group configured but not negotiable: … can never be negotiated". The
  attestation reports `hybrid_pq_count: 1` (was 2). Its real harvest path, `AES128-SHA` static-RSA key
  transport, is now found and counted as HNDL.
- **No blanket discount:** there is no longer a blanket "hybrid removes HNDL". The X25519MLKEM768 group itself
  is not harvestable, while a separately listed classical fallback keeps `hndl`.

**C4 notes.**
- **What counts as HNDL:** purpose is read from each key's own evidence (`score.purpose`), and only a declared
  encryption, key-agreement or key-transport use counts.
- **How the three audited assets resolved:**
  - `infra/kms.tf` is **forgery** only, citing "line 3: key_usage = "SIGN_VERIFY"".
  - `web/sign.js` is forgery (`createSign`).
  - `payments/Crypto.java:11` (`KeyPairGenerator`) and the `sync-agent.bin` string are **"Purpose not declared:
    HNDL or forgery not asserted"**.
- **Dashboard tile:** "1 Harvest-now-decrypt-later exposed · plus 2 exposed to forgery, 2 of undeclared purpose".
  The one is `api-gw` via `AES128-SHA`. The asset page prints the declared purpose per location with its source
  line.
- **Replacement map:** it follows purpose. `kms.tf` is offered ML-DSA only. An undeclared key gets "RSA, if used
  for signing / for encryption".

**C5 notes.**
- **Summary:** "MOX scanned 23 files across **6 of 7** planes …". The "Not run: Live TLS" line lists planes that
  did not run.
- **Network:** the statement comes from `scan.net`: "the socket hook … counted 0 outbound and 0 loopback connects
  … DNS lookups and other processes are not counted". With a probe to 127.0.0.1:9 it reads "counted 0 outbound
  and 1 loopback … A live TLS probe of 127.0.0.1:9 was requested and failed (…)".
- **Standards:** only those the scan's findings cite, with revision and draft status. IR 8547 and 131A Rev.3 say
  "initial public draft".
- **Fixes:** counted per scan through `scan_id` on the fix record. `not-in-effect` fixes are reported separately.
- **ACCEPT:** now "monitor; re-assess at the next scan", plus "6 rest on unverified evidence".
- **reportlab:** gone from `requirements.txt` and the venv (`pillow` with it). The PDF is written by
  `mox/report.py` with the standard library. It renders as 2 A4 pages and says the same sentences as the screen
  (`report.with_text`).

**C6 notes.**
- **Mosca exclusion:** assets with no identified algorithm (7 library or package names) get
  `mosca.applies = false` and `exposure = null`. They are not scored as 0. The queue shows "n/a", the asset page
  says "Mosca does not apply", and the risk field reports "not plotted: 7".
- **Robustness to Z:** Z = 8 now gives **12 / 4 / 6** (was 18 / 4 / 0). On the B1 four-plane subset it gives
  **9 / 0 / 6** (was 15 / 0 / 0). The only mover is the Shor-class ECDSA key in `services/ecdsa.go`, which is
  correct Mosca sensitivity.
- **Z control:** Z moved to **Settings** with an explicit "Save and re-score". It reports "Z changed from 10 to 8.
  Verdict split: 11 / 4 / 7 → 12 / 4 / 6". The asset page shows Z read-only (no `#fz` input).
- **Tests and docs:** all three verdicts are reachable for Z ∈ {1, 5, 8, 9, 10, 12, 20}. The rule and boundary
  cases are in `docs/SCORING.md` §4.1.

### Changes a judge will notice that were not asked for

- **`api-gw` is now Critical (57.6) and `ecdsa-p256.crt` is High (48.0).** Both were High 45.6 and Medium 28.
  A separately listed X25519 fallback is no longer hidden behind the hybrid credit, and `data/nist_status.json`
  rates X25519 `not_approved` (base 25). The fallback is real and harvestable, and the score note says why. The
  best-hardened endpoint in the demo now outranks DES in `payments`, which a judge will question.
- **The nginx fixer output for the pristine demo target changed:** `ssl_protocols TLSv1.2 TLSv1.3;`, and
  `AES128-SHA` removed. Existing phase 4 and phase 2 tests were updated to the new rule rather than deleted.

## Probe record, second pass

| # | First pass | Second pass | Change |
|---|---|---|---|
| P1 | Pass | **Pass.** 40 + 15 + 8 = 63, × 1.0 × 1.0 = 63.0 | — |
| P2 | Partial | **Partial.** The report now labels drafts. The ECB "now" status still comes from a draft, and the asset 2030/2035 boxes are still unmarked | Report part closed (C5); Major 1 open |
| P3 | Partial | **Partial.** An unverified library now shows an amber "No algorithm identified: use not verified" banner and an ACCEPT reason ending "not verified". The report counts 6 unverified ACCEPTs. The verdict is still ACCEPT | Improved (Major 6 partly) |
| P4 | Fail | **Partial.** The report's "verified fixes" are now per scan, and `not-in-effect` is never counted as cleared. Sector "verified" still has no trust anchor | C5 part closed; Major 3 open |
| P5 | Pass | **Pass.** Recomputed root matches; `hybrid_pq_count` 1 | Stability across rescans still open (Major 5) |
| P6 | Fail | **Pass.** 11 / 4 / 7; all three verdicts reachable for Z 1–20; 12 / 4 / 6 at Z = 8 | Closed (C6) |
| P7 | Partial | **Partial.** Lowest MIGRATE is still RSA-3072 `Crypto.java:11`. It now shows "Purpose not declared", which gives a CISO a concrete question to push back with | Slightly better |
| P8 | Fail | **Fail.** Ties are unchanged (43.4 ×2, 30.6 ×2, 24.5 ×2, 11.9 ×6); insertion order still decides | Open (Major 10) |
| P9 | Partial | **Pass.** The wave reason now reads "Mosca exposure is -2 yrs: it is not quantum-exposed, but no quantum computer is needed to break it", consistent with the Mosca card | Closed as a side effect of C6 (Major 7) |
| P10 | Partial | **Pass.** HNDL vs forgery is derived from declared purpose, with the source line shown. Undeclared purpose is its own state | Closed (C4) |
| P11 | Pass / Major | **Pass.** `reportlab` and `pillow` removed; no telemetry. Unpinned requirements and the pip version check remain | C5 part closed; Major 15 open |
| P12 | Pass | **Pass.** 0 external requests across every page load | — |
| P13 | Pass | **Pass.** A probe to 127.0.0.1:9 moved `loopback` 1 → 2, and the report now states the counted numbers | Report wording closed (C5); Major 2 open |
| P14 | Partial | **Partial.** Unchanged | Major 16/17 open |
| P15 | Fail | **Partial.** Asset Locations fully visible. Attest still 1928 px wide | C7 closed; Major 18 open |
| P16 | Partial | **Partial.** Unchanged; queue print is still 1 page | Major 19/20 open |
| P17 | Fail | **Fail.** Critical and High still share a solid fill on the risk field | Major 19 open |
| P18 | Partial | **Pass.** `j` + Enter opens `api-gw`, and 2× Tab reaches "Open fix", which renders a real diff. The queue "Open first fix" previews | Closed (C2) |
| P19 | Fail | **Partial.** Fix list empty state, Fix 422, Roadmap, Fix list and Dashboard load errors all give a next action now. CBOM, Attest and Report "Run a scan first." are still bare | C1/C2 parts closed |
| P20 | Pass / Fail 12.5% | **Pass.** Dashboard rendered in 117 ms, 0/40 false empties. The most urgent asset is still not named above the fold at 1366×768 (Work queue row 1 is) | C1 closed |

**Still open from the first pass (not in this pass's scope):**
- Majors 1, 2, 3, 4, 5, 9, 10–23.
- Major 6 and Major 8 in part. The risk field's "exposed: 6" still counts DES and MD5, which are not
  quantum-exposed.
- The Minor list.
- Part B: B2 (plane coverage), B3 (label collisions — still visible at −2 and on the right edge), B4 (paper
  token) and B5 (verdict-card dead space).
