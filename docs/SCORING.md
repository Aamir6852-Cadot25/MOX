# MOX scoring — three separate numbers

MOX gives every asset three numbers. They answer different questions and are never folded into each
other:

| Number | Question | Range | Code |
|---|---|---|---|
| Risk score | How bad is this crypto, as found, where it was found? | 0–75.6 in practice | `mox/score.py: risk()` |
| Mosca exposure | Does the data outlive the quantum horizon once migration time is added? | years, can be negative | `score_asset()` → `breakdown.mosca` |
| CMCS | How hard this asset is to migrate, independent of how risky it is. | 1–10 | `mox/score.py: cmcs()` |

The wave (§4) is the only place where they are combined, and that rule is written out in words on every
asset.

Every function returns its components. The UI prints one row per component, and
`tests/test_phase12.py` checks exhaustively that each total is the arithmetic of its rows.

## 1. Risk score

```
risk = (base + quantum + evidence) × criticality × confidence        rounded to 1 decimal
```

| Term | Source | Values |
|---|---|---|
| base | worst NIST status among the asset's locations (`data/nist_status.json`) | disallowed 40, deprecated / not approved 25, unknown 15, approved / hybrid 5 |
| quantum | algorithm class | Shor-breakable (RSA, DH, DSA, EC*) +15; Grover-weakened (symmetric or hash below 256-bit strength: AES-128, 3DES, DES, RC4, MD5, SHA-1, SHA-224) +7; none 0 |
| evidence | how the finding was seen (§1.1) | observed +8, declared +4, declared-unverified +2, textual 0 |
| criticality | business criticality 1–3, from path tags or an analyst | 3 → ×1.2, 2 → ×1.0, 1 → ×0.85 |
| confidence | best detector confidence among locations | high ×1.0, medium ×0.85, low ×0.7 |

Mosca exposure and CMCS are **not** terms of the risk score. Changing Z or X never moves it; the test
`test_mosca_and_cmcs_never_move_the_risk_score` holds that line.

### 1.1 Evidence grades

| Grade | Meaning | Planes |
|---|---|---|
| Observed | parsed from the artefact that is in use: X.509 key or signature, TLS handshake | certificates, tls |
| Declared | named explicitly in source or configuration | code, configs |
| Declared, unverified | a library or package that *can* do this crypto; use is not proven | dependencies, containers |
| Textual | a string match in bytes, or a key that could not be parsed | binaries, unparseable keys |

The master prompt gives observed 8, declared 4 and textual 0 points. It does not give a value for
declared-unverified, so MOX uses +2, halfway between declared and textual.

### 1.2 Hybrid assets

A certificate whose endpoint negotiates `X25519MLKEM768` stays Shor-class, because its signature can
still be forged. What the hybrid removes is the harvest-now-decrypt-later threat, so the `hndl` tag is
dropped and the quantum row says so in its note. The plain X25519 half is not scored as a separate
weakness.

### 1.3 Tiers

The formula tops out at (40 + 15 + 8) × 1.2 × 1.0 = 75.6, so tier cut-offs placed on a 0–100 scale
would never fire. The cut-offs sit on the formula's own anchor points instead:

| Tier | Cut-off | Anchor |
|---|---|---|
| Critical | ≥ 55 | disallowed + Shor (40 + 15) at neutral multipliers |
| High | ≥ 40 | disallowed alone |
| Medium | ≥ 25 | deprecated / legacy |
| Low | < 25 | approved today |

## 2. Mosca exposure

```
exposure = (X + Y) − Z
X  data shelf life, years   default by path tag: auth/token/citizen/payments 15, test/log/tmp only 1, else 7;
                            editable per asset
Y  migration time, years    ceil(CMCS / 2): one year of effort per two CMCS points
Z  CRQC horizon, years      org-wide setting, default 10, editable
```

A positive value means the data must still be secret, or the signature still trusted, after a
cryptographically relevant quantum computer exists. Which of the two applies is recorded in
`breakdown.threats`:

- `hndl`: key exchange and encryption. Traffic recorded today can be decrypted later, so X counts from
  today.
- `forgery`: signatures. Nothing can be harvested; the risk is a forged signature accepted after Z, so
  X is how long signatures must stay trustworthy.
- `classical`: already weak without any quantum computer.

The Y calibration (two CMCS points per year) is an assumption. It is stated here so a reviewer can
challenge it, and it can be changed in `migration_years()`.

## 3. CMCS: migration complexity

```
CMCS = clamp(1, 10, location + spread + vendor + renegotiation)
```

| Component | Values |
|---|---|
| location (hardest location wins) | certificate re-issue 2, config change 2, live endpoint config 3, source 4, library dependency 5, container image 5, compiled binary 8, firmware / HSM / KMS 10 |
| spread | 3–9 distinct files +1, 10 or more +2 |
| vendor | +1 if a vendor or upstream release controls any location (binary, dependency, container) |
| renegotiation | +1 if both peers must change (key exchange, TLS protocol, cipher suite) |

## 4. Wave: the one place the numbers meet

The rule is applied in this order (`mox/verdict.py: wave`). Each asset carries its reason as
`wave_reason`, and the UI prints it.

1. Verdict ACCEPT → wave 5 (validate and attest).
2. NIST status **disallowed today** → wave 1, whatever Mosca says. It is already classically broken.
3. Tier Critical → wave 1.
4. Mosca exposure > 0 → wave 2. Migration time already overruns the horizon.
5. Otherwise → one wave after the tier (High 3, Medium 4, Low 4).

The verdict never ACCEPTs a quantum-exposed asset on low risk alone. ACCEPT requires X ≤ 1, or a Low
tier together with exposure ≤ 0.

## 5. Worked examples (demo target, Z = 10)

### RSA-1024 `certs/legacy-portal.crt`: negative Mosca, still wave 1

| Row | Value |
|---|---|
| base: disallowed (NIST SP 800-131A Rev.2) | 40 |
| + quantum: Shor | 15 |
| + evidence: observed (parsed X.509) | 8 |
| = subtotal | 63 |
| × criticality 2 | 1.0 |
| × confidence high | 1.0 |
| **risk** | **63.0 → Critical** |

- **Mosca:** X = 7 (default), Y = ceil(2 / 2) = 1, Z = 10, so exposure = 7 + 1 − 10 = **−2 years**.
  It is not quantum-exposed.
- **CMCS:** certificate re-issue 2 + spread 0 + vendor 0 + renegotiation 0 = **2**.
- **Wave 1**, by rule 2. The asset card says why in words: it is disallowed today, so no quantum
  computer is needed to break it. Mosca measures the quantum deadline, and this asset has already
  missed it for other reasons.

### RSA-2048 `api-gw.key`: one key in 6 files

| Row | Value |
|---|---|
| base: unknown (the source location has no rated key size) | 15 |
| + quantum: Shor | 15 |
| + evidence: observed | 8 |
| = subtotal | 38 |
| × criticality 3 (`auth` path tag) | 1.2 |
| × confidence high | 1.0 |
| **risk** | **45.6 → High** |

- **CMCS:** container image 5 + spread 1 (6 files) + vendor 1 + renegotiation 1 = **8**, so Y = 4.
- **Mosca:** X = 15 (`auth`), so exposure = 15 + 4 − 10 = **+9 years**.
- **Wave 2**, by rule 4.

### RSA-2048 `infra/kms.tf`: low risk, hardest to move

- **Risk:** (5 + 15 + 4) × 1.2 × 0.85 = 24.48, which rounds to **24.5 → Low**.
- **CMCS:** KMS location 10, so **10**, and Y = 5.
- **Mosca:** 7 + 5 − 10 = **+2 years**.
- **Verdict CONTAIN** (Y ≥ 5), **wave 2** by rule 4.

This asset is the reason CMCS is kept separate: the risk is low, but it is the hardest asset in the
demo to migrate.
