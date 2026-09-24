# MOX screens: one question each

Each screen answers one question (docs/JUDGE-AUDIT.md, C6). Anything on a screen that does not serve its
question moves or goes. The most important number must be findable in under three seconds.

| Screen | Route | Its one question | Most important number | Changes in phase 19 |
|---|---|---|---|---|
| Dashboard | `/` | How exposed am I, and is anything on fire? | HNDL-exposed count, plus the wave-1 "most urgent" asset | Verdict card answers "on fire": wave-1 count, the most urgent asset and why, what each verdict holds. The scan pipeline card moves to New Scan. The risk field moves up. |
| Work queue | `/queue` | What do I do next? | Row 1 | Default order is wave, then risk (the plan), not risk alone. A Wave column is added. |
| Asset detail | `/asset/:id` | Why this, and what exactly do I change? | Risk score and tier | Score and tier shown in the header. The recommended replacement moves to the top of the right rail. |
| Fix & verify | `/fix/:id` | Is the change safe, and who signed it? | Claims in effect / not in effect | The approver and time are recorded and shown with the result. |
| CBOM | `/cbom` | What do I hand to an auditor? | Component count + schema valid | Unchanged. |
| Roadmap | `/roadmap` | What is the plan over 30 months? | Wave-1 asset count | **Cannot answer the "30 months" part.** MOX orders the work but has no schedule model. The screen says so instead of inventing dates (docs/AUDIT.md, Major 14). |
| Attest | `/attest` | What can I prove without disclosing? | Self-check results + Merkle root | Unchanged. |
| New Scan | `/scan` | What will this scan cover, and how did the last one run? | Planes on, files found | Shows the latest scan's recorded pipeline when no scan is running (moved from the Dashboard). |
| Compliance Report | `/report` | What do I file? | Verdict counts | Unchanged. |
| Sector | `/sector` | Which critical sector is most exposed? (simulated) | HNDL-exposed by sector | Unchanged. |
| Audit | `/audit` | Who did what, and when? | Latest event | Load errors are shown instead of an empty list. |
| Settings | `/settings` | Which organisation-wide assumptions drive the scores? | Z | Unchanged. |

## Empty and error states (C7)

- **Empty states give a direction and a control.** Examples: "No scan yet … Open New Scan", "No asset matches …
  Clear search".
- **Errors say three things:** what failed, what it means (usually that stored results are unaffected), and the
  next action (Retry). None of them apologise.
- **"No scan" (HTTP 404) and "could not load" (any other failure) are separate states.** A load failure is never
  presented as an empty database.
