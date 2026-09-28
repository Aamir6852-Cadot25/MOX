# MOX screens: one question each

Each screen answers one question (docs/JUDGE-AUDIT.md, C6). Anything on a screen that does not serve its
question moves or goes. The most important number must be findable in under three seconds.

Five primary pages (docs/MOX_V2_BUILD_PLAN.md, D1), plus two secondary pages in the rail footer.

| Screen | Route | Its one question | Most important number |
|---|---|---|---|
| Scan | `/scan` | What am I scanning, and what is it finding right now? | Planes on, files found |
| Dashboard | `/dashboard` | How exposed am I, and why? | HNDL-exposed count, plus the wave-1 "most urgent" asset |
| Findings | `/findings` | What exactly is wrong, where, and in what order do I fix it? | Row 1 |
| Findings (detail) | `/findings/:id` | What exactly is wrong, where, and in what order do I fix it? | Risk score and tier |
| Code Edit | `/code` | What do I change on this line, and did it work? | Claims in effect / not in effect |
| Reports | `/reports/:tab` | What do I hand over, and what changed since last time? | Component count, verdict counts, or the Merkle root, depending on the tab |
| Settings | `/settings` | Which organisation-wide assumptions drive the scores? | Z |
| Sector | `/sector` | Which critical sector is most exposed? (simulated) | HNDL-exposed by sector |

## Empty and error states (C7)

- **Empty states give a direction and a control.** Examples: "No scan yet … Open New Scan", "No asset matches …
  Clear search".
- **Errors say three things:** what failed, what it means (usually that stored results are unaffected), and the
  next action (Retry). None of them apologise.
- **"No scan" (HTTP 404) and "could not load" (any other failure) are separate states.** A load failure is never
  presented as an empty database.



* `/correlate`: What is the blast radius? (Correlate)

* `/remediate`: How do we fix it? (Remediate)
* `/report`: Can we prove it? (Report)
* `/report/:tab`: Can we prove it? (Report tab)

* `/correlate`: What is the blast radius? (Correlate)
* `/remediate`: How do we fix it? (Remediate)
* `/report`: Can we prove it? (Report)
* `/report/:tab`: Can we prove it? (Report tab)
