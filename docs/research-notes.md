# MOX research notes

These notes are the grounding for MOX's claims. Document status was checked on CSRC on 24 Sep 2026.
Where this research contradicts `docs/MOX_MASTER_BUILD_PROMPT.md`, the research wins, and §6 lists
each contradiction.

## 1. Standards

**FIPS 203 / 204 / 205 (final, Aug 2024).** Sizes in bytes; category is the NIST security category.

| Scheme | Public key | Ciphertext / signature | Category |
|---|---|---|---|
| ML-KEM-512 / 768 / 1024 | 800 / 1,184 / 1,568 | 768 / 1,088 / 1,568 | 1 / 3 / 5 |
| ML-DSA-44 / 65 / 87 | 1,312 / 1,952 / 2,592 | 2,420 / 3,309 / 4,627 | 2 / 3 / 5 |
| SLH-DSA-SHA2-128s / 128f | 32 | 7,856 / 17,088 | 1 |
| SLH-DSA-SHA2-256s | 64 | 29,792 | 5 |

- MOX's defaults are ML-KEM-768 and ML-DSA-65, both category 3. The UI prints the size cost against
  X25519 (32 B) and RSA-2048 (256 B) signatures, because larger handshakes and tokens are the main
  migration friction.
- HQC was selected in March 2025 as a backup KEM. Its standard is not yet final, so MOX does not
  recommend it.

**SP 800-131A.**
- **Rev 2 (2019) is the final, normative document.** Rev 3 is still an initial public draft
  (21 Oct 2024; comments closed 4 Dec 2024; no newer version on CSRC).
- Rev 3 proposes retiring ECB mode for confidentiality and DSA for signature generation.
- It also proposes deprecating SHA-1 and the 224-bit hashes through 31 Dec 2030 and disallowing them
  after that.
- MOX's "now" column follows Rev 2. The 2030 and 2035 columns follow the Rev 3 and IR 8547 drafts and
  are labelled as proposed.

**IR 8547 (initial public draft, 12 Nov 2024; still a draft).** Quantum-vulnerable RSA, ECDSA, EdDSA,
DH and ECDH:
- at 112-bit strength: deprecated after 2030, disallowed after 2035;
- at 128-bit strength and above: disallowed after 2035.

This is the source of MOX's `after_2035: disallowed` for every Shor-class algorithm.

**SP 800-227 (final, Sep 2025).** Guidance on using KEMs. It supports MOX's advice to deploy hybrid
key establishment first.

**CycloneDX 1.6 `cryptoProperties`.** Read from the schema bundled with `cyclonedx-python-lib`.
- `assetType` is one of algorithm, certificate, protocol, related-crypto-material.
- `algorithmProperties` has primitive, parameterSetIdentifier, curve, executionEnvironment,
  implementationPlatform, certificationLevel, mode, padding, cryptoFunctions, classicalSecurityLevel,
  and nistQuantumSecurityLevel (range 0–6).
- `certificateProperties` has subjectName, issuerName, notValidBefore, notValidAfter,
  signatureAlgorithmRef, subjectPublicKeyRef, certificateFormat and certificateExtension. MOX
  currently emits only certificateFormat; this is a gap for the CBOM phase.
- `relatedCryptoMaterialProperties` has type, id, state, algorithmRef, dates, value, size, format and
  securedBy. MOX never emits `value`, because no key material leaves the machine.
- The schema has **no confidence field**. MOX's confidence and evidence go into `properties` as
  `mox:confidence` and `mox:evidence`.

**Mosca, *IEEE Security & Privacy* 16(5), 2018.**
- The model: if X (security shelf life) + Y (migration time) > Z (time until a quantum computer can
  break the crypto), the data is at risk.
- Standard critiques, and how MOX handles each:
  - Z is a probability distribution, not a date; the Global Risk Institute's threat-timeline surveys
    give estimates as odds. MOX makes Z one editable org-wide number and says so.
  - Y is rarely known. MOX derives it from CMCS and publishes the calibration.
  - The inequality is binary. MOX shows the margin in years.
  - The model is silent on crypto that is already classically broken. MOX handles this with its wave
    rule (SCORING.md §4).
  - X means different things for confidentiality (harvest-now-decrypt-later) and for signatures
    (how long they must stay trustworthy). MOX labels X by threat type.

**NCIIPC.**
- Created under Section 70A of the IT Act 2000 (as amended in 2008) by notification of 16 Jan 2014.
  It is administratively part of NTRO.
- Critical Information Infrastructure is defined as a computer resource whose incapacitation would
  have a debilitating impact on national security, the economy, public health or safety.
- Critical sectors: Power and Energy; Banking, Financial Services and Insurance; Telecom; Transport;
  Government; Strategic and Public Enterprises.
- Sector pages in MOX use these six names.

**National Quantum Mission (DST).**
- Approved 19 Apr 2023, ₹6,003.65 crore, running 2023-24 to 2030-31.
- Targets intermediate-scale quantum computers of 50–1,000 physical qubits within 8 years, and
  2,000 km satellite QKD.
- These are not cryptanalytically relevant scales. They set the programme horizon, not Z.

## 2. Interface craft

- **Tufte.**
  - Data-ink: the risk field plot has no gridlines beyond the break-even line and the axis ticks.
  - The Mosca timeline is one bar, with segment lengths proportional to years. Only the exposed span
    gets a colour of its own.
  - Small multiples: the per-plane rows in the pipeline all use one scale, so they compare at a
    glance.
  - Layering: severity is encoded in fill; evidence gets a separate, neutral badge.
- **Bringhurst.** Set one type scale (10 / 11 / 12 / 17 / 24 px) and hold it. The measure for
  explanatory text is 60–75 characters. Figures are set in tabular mono, so columns align.
- **Krug.** Navigation labels are nouns the user already has ("Work queue", not "Triage hub"). Every
  empty state names the next action.
- **Observability and security tools** (Grafana, Datadog, Snyk, Semgrep, Burp, Splunk):
  - They keep severity colour for severity alone.
  - They pack tables densely: rows of about 32–36 px, with numbers right-aligned.
  - They refuse to decorate.
  - Semgrep in particular records `confidence` separately from `impact` and `likelihood` in rule
    metadata. This is the precedent for keeping MOX's evidence grade apart from its severity.

## 3. Engineering

- **SQLite.** Use WAL mode (`PRAGMA journal_mode=WAL`) with `synchronous=NORMAL` for concurrent reads
  during a scan, plus parameterised statements and versioned migrations. MOX uses parameterised
  statements and additive `ALTER` migrations, but it **does not enable WAL yet**; that is a gap for
  the backend phase.
- **Server-Sent Events.** One-way progress over plain HTTP. `Last-Event-ID` gives resumable replay,
  and proxies pass it through. MOX's scan stream follows this pattern (`/api/scans/{id}/events`).
- **Detection rules.**
  - gitleaks: regex, plus keywords as a prefilter, plus an entropy threshold, plus allowlists.
  - TruffleHog: splits verified from unverified results by calling the provider live. MOX cannot do
    that, because it is offline, so "declared, unverified" is shown instead of guessing.
  - Semgrep: matches the syntax tree where a parser exists and falls back to patterns otherwise.
- MOX's rules live in `data/rules.json`, with per-rule detector IDs recorded on every finding.

## 4–5. Applied to MOX

- The scoring model, and its departures from the master prompt, are in `docs/SCORING.md`.
- The replacement mapping stays deterministic and local (no LLM, no network). There is no AI SDK
  among the dependencies in `requirements.txt` or `web/package.json`.

## 6. Contradictions with the master prompt, and what MOX does

1. **Stack.** The prompt asks for Express and TypeScript. CLAUDE.md fixes Python/FastAPI and
   React/JSX, so MOX kept that stack; every capability in the prompt is built on it.
2. **"SP 800-131A Rev 3"** is cited as if in force, but it is a draft. MOX cites Rev 2 for the "now"
   status and marks the 2030 and 2035 columns as proposed (Rev 3 draft, IR 8547 draft).
3. **Risk arithmetic.** The blueprint's score card shows 70 for 40 + 15 + 8 × 1.2, which is 75.6. MOX
   prints the real arithmetic. The formula peaks at 75.6, so the tier cut-offs moved to its anchor
   points (55 / 40 / 25).
4. **Blueprint mislabel.** The blueprint labels a certificate's signature key as HNDL, but the threat
   to a signature is forgery. MOX derives its threat labels (hndl, forgery, classical) from the
   algorithm and how it is used.
5. **Evidence points.** The prompt names four evidence grades but gives points for only three. MOX
   gives declared-unverified +2.
6. **Styling.** The blueprint uses all-caps tracked labels, and the prompt's own pill text uses a
   middle dot. Both break the prompt's anti-AI-look checklist; MOX follows the checklist.
7. **"Constrained" replacement.** The prompt's example maps it to SLH-DSA-SHA2-128s. Its 7,856 B
   signatures and slow signing are poor on bandwidth-constrained links. MOX keeps SLH-DSA for
   long-lived roots and firmware signing, where its hash-only assumption is the point.
8. **CBOM `confidence` field.** CycloneDX 1.6 has no such field, so it is emitted as the property
   `mox:confidence`.
