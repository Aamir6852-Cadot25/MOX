# MOX — JUDGE AUDIT & INTERFACE POLISH

Save as `docs/JUDGE-AUDIT.md`. Run this in Claude Code in one session.
Work in the order given. Do not skip Part A — the defects it finds change Part C.

---

# PART A — BECOME THE EVALUATOR

Stop being the builder. For this part you are **Dr. R. Subramanian**, a senior
technical evaluator. Twenty-two years at NTRO, five of them seconded to NCIIPC
working on cryptographic assurance for power-grid and banking CII operators. You
have personally run crypto inventory exercises at three PSUs. You have read FIPS
203/204/205 in full and you know which NIST documents are still drafts. You have
sat on four hackathon panels and you have seen forty teams present scanners.

You are not hostile. You are *tired*. You have seen thirty-nine tools that grep
for `RSA` and print a list. You are looking for the one that a CII operator could
actually deploy on Monday. You give credit generously when something is real, and
you are merciless about anything that is theatre.

## How you evaluate

Run the application. Click every control. Open the JSON. Read the code where the
UI makes a claim. Then write `docs/AUDIT.md` as a formal evaluation memo.

You are looking for four things, in this order of weight:

**1. Is it operationally honest? (40%)**
Does the tool ever assert something it cannot support? A number with no
derivation, a standard cited as current when it is a draft, a confidence level
that is really a guess, a "verified" that was never verified. One dishonest
number poisons every other number on the screen. This is the category that
disqualifies teams.

**2. Does it prioritise, or does it just list? (25%)**
A CII operator has 40,000 certificates and eleven engineers. A tool that returns
"migrate everything" has moved zero work. Does the ranking actually separate the
urgent from the deferrable, and can you defend the separation to a CISO who wants
to know why item 12 can wait?

**3. Would it survive an air-gapped deployment? (20%)**
Not "does it claim to be offline." Does the dependency tree contain a cloud SDK.
Does a font load from a CDN. Does any code path open a socket the user did not
authorise. Is the claim *measured*, or is it a label someone typed.

**4. Is it legible under pressure? (15%)**
An analyst at 2am, on a 1366×768 government-issue monitor, under fluorescent
light, printing to a greyscale laser printer for a file. Does the interface hold
up, or does it only work as a demo on the builder's screen.

## The specific probes you run

Work through each. Record the answer and your verdict in `docs/AUDIT.md`.

**Honesty probes**
- P1. Pick the highest-scoring asset. Add up the rows in "why this score" by hand.
  Do they equal the total? If not, stop and write it up as a critical finding.
- P2. Find every NIST citation in the UI. For each, is the document final or
  draft, and does the UI say which?
- P3. Find a finding whose evidence grade is "declared, unverified." Does the UI
  make clear that MOX has not confirmed the algorithm is actually reachable?
- P4. Does any screen claim something is "verified" or "validated" without a
  recorded verification event behind it?
- P5. The attestation claims a Merkle root. Recompute it independently. Match?

**Prioritisation probes**
- P6. What is the verdict split? If any verdict is 0% or any verdict is 100%, the
  ranking has collapsed. Find out why and write it up.
- P7. Take the lowest-ranked MIGRATE asset. Argue, as a CISO, that it should be
  deferred. Does the tool give you grounds to refuse?
- P8. Take two assets with the same risk score. Does anything break the tie?
- P9. An asset has negative Mosca exposure but sits in wave 1. Does the interface
  explain this in words, on the card, without the user needing to know Mosca?
- P10. What is the difference between an HNDL-exposed asset and a
  forgery-exposed asset, and does the interface distinguish them?

**Air-gap probes**
- P11. `grep` the dependency manifests for any AI/LLM SDK, analytics, telemetry,
  or crash reporter. Report what you find, including transitively.
- P12. Are fonts, icons and styles vendored, or fetched at runtime?
- P13. Run a scan. Is the outbound-call counter derived from an actual socket
  hook, or is it a constant?
- P14. Which code paths can open a socket? Enumerate them. Can a user open one by
  accident?

**Legibility probes**
- P15. Resize to 1366×768. What breaks?
- P16. Print a screen to greyscale. Can you still tell Critical from Medium?
- P17. Simulate deuteranopia. Which two severities become the same colour?
- P18. Navigate the work queue with the keyboard only. Can you reach a fix?
- P19. Find every empty state. Is each one a direction, or a dead end?
- P20. Time yourself: from cold open, how long to find the single most urgent
  asset and understand why it is urgent? Over 30 seconds is a failure.

## What impresses you (record where the tool earns credit)

- A number you can reconstruct by hand from what is on screen
- A distinction most teams collapse — risk vs migration difficulty, HNDL vs
  forgery, observed vs declared, classically-broken vs quantum-exposed
- A claim that is measured rather than asserted
- An admission of a limit, stated in the product rather than hidden
- Speed that is shown, not claimed
- An export a regulator could actually accept

## Output

`docs/AUDIT.md`, structured as:

```
## Verdict
One paragraph. Would you shortlist this. Why or why not.

## Critical — fix before any demo
## Major — fix before submission
## Minor — fix if time
## Credit where due
## The three questions I would ask in Q&A that this tool cannot currently answer
```

Rank by what a judge notices in the first ninety seconds, not by what is
technically most severe. Be specific: file, line, screen, control.

---

# PART B — DEFECTS ALREADY OBSERVED

These were found by inspection of the running build. Confirm, root-cause and fix
each. Do not rediscover them; start from here.

**B1 — CRITICAL. The verdict split has collapsed to MIGRATE 15 / CONTAIN 0 /
ACCEPT 0.** Earlier the same target produced 11 / 4 / 7. The ACCEPT rule now
requires Mosca exposure ≤ 0, which appears to have swallowed the entire ACCEPT
and CONTAIN populations. A tool that returns "migrate everything" performs no
prioritisation and is the single most damaging thing a judge can see. Re-derive
the verdict rule so that all three verdicts are reachable on a realistic target,
and document the rule in `docs/SCORING.md` with the boundary cases.

**B2 — MAJOR. Scan coverage regressed.** 23 files / 6 planes became 18 files /
4 planes; the configuration plane is off and readiness fell 69 → 51. Find out
whether this is a plane-default change, a demo-target change, or a detector
regression. Coverage must not silently shrink between runs.

**B3 — MAJOR. Risk-field plot labels collide.** On the right of the plot, two
asset labels overlap into unreadable text. Labels need collision handling: show
on hover, or show only the top N by score, or offset with leader lines.

**B4 — MAJOR. The interface reads as blank white.** The page background and the
card background are both white, so nothing has depth and the screen feels empty.
The canvas must be `--paper` (cool light grey) with cards in white on top of it.
This is one token, and it is the difference between "unstyled" and "designed."

**B5 — MAJOR. Large dead space in cards.** The verdict-split card has a single
bar and a paragraph of empty space beneath it. Either the card gives that space
to content, or the card shrinks. Empty space that is not deliberate reads as
unfinished.

**B6 — MINOR. MIGRATE / CONTAIN / ACCEPT pills are visually wrong.** They are
oversized rounded lozenges that dominate their rows and do not match anything
else in the interface. See C3.

---

# PART C — INTERFACE AND MOTION

The brief: **calm, pastel, uniform, uncluttered, and obviously real.** Not a
prototype with placeholder styling. An instrument.

## C1 — Depth through surface, not shadow

Three surfaces, and only three:

```
--paper     #EEF1F4    the page. Every screen sits on this.
--surface   #FFFFFF    cards, tables, panels. White on paper.
--surface-2 #FAFBFC    table headers, card headers, inset areas.
```

Separation comes from the surface change plus a `1px solid var(--line)` border.
**No drop shadows anywhere.** A shadow under every card is the clearest tell of a
generated interface. The one permitted exception is the app frame itself.

## C2 — Motion system

Motion exists to show what changed. It is never decoration. Define these tokens
and use only these:

```
--t-fast    120ms    hover, focus, press
--t-base    200ms    open, close, reveal
--t-slow    320ms    route change, panel slide
--ease      cubic-bezier(0.2, 0, 0.2, 1)
--ease-out  cubic-bezier(0.16, 1, 0.3, 1)   for things entering
```

**Permitted motion — implement all of these:**

| Interaction | Behaviour |
|---|---|
| Button press | `transform: scale(0.98)` for `--t-fast`. Nothing else. |
| Row hover | Background to `--surface-2` over `--t-fast`. No lift, no shadow, no scale. |
| Row select | 2px left border in `--pri` grows in over `--t-fast`. |
| Route change | Outgoing content fades out `80ms`; incoming fades in and rises 4px over `--t-base`. Once, not per-section. |
| Panel / drawer open | Slide from edge over `--t-slow` with `--ease-out`. |
| Expand / collapse | Height transitions over `--t-base`. The chevron rotates in the same duration. |
| Number change | When a metric updates after re-scan, count from old to new over `--t-slow`. Only on change, never on first paint. |
| Filter applied | Rows that leave fade out over `--t-fast`; the list settles over `--t-base`. |
| Scan pipeline | The one place with continuous motion. Bars fill in real time from SSE. The correlate count counts down. Timings appear as each stage lands. |
| Copy / save confirm | Inline label swaps to "Copied" for 1.2s, then back. No toast. |

**Forbidden:**
- Fade-and-slide-up on every section at page load
- Hover lift, hover scale, or hover shadow on cards
- Any looping animation outside an active scan
- Skeleton shimmer — show the real structure with the real count arriving
- Spinners where progress is knowable

Honour `prefers-reduced-motion: reduce` — drop to opacity-only, keep durations.

## C3 — Verdict and status marks

Replace the current oversized pills. A verdict is a classification, not a button:

```
height          18px
padding         0 7px
radius          3px          not 99px
font            500 10px IBM Plex Sans, +0.02em tracking
fill            pastel of the family
text            saturated ink of the same family
border          1px solid, mid tone of the family
```

MIGRATE uses the critical family, CONTAIN the medium family, ACCEPT the low
family. Same geometry for evidence grades and tier marks — one badge component,
one geometry, colour family as the only variable.

## C4 — Iconography

Currently inconsistent. Fix by rule:

- One set only: **Lucide**, vendored locally, never from a CDN
- `16px` in navigation, `14px` inline, `1.5px` stroke, `currentColor`
- Icons appear only in the rail, in buttons that take an action, and as severity
  marks. Never decorating a heading or a card title.
- **No emoji anywhere in the product.** Emoji in a security tool reads as a toy.
- An icon never appears alone unless the control also has a `title` and an
  `aria-label`.

## C5 — Spacing

One scale. Nothing off it.

```
4 · 8 · 12 · 16 · 24 · 32
```

- Card padding `16`, card header height `34`
- Gap between cards `12`
- Table row `36`, cell padding `0 12`
- Space above a section heading `24`, below it `12`
- Controls in a group `8` apart; unrelated groups `16`

Any card taller than its content by more than `24` is wrong — either fill it or
shrink it.

## C6 — Density and hierarchy

Each screen answers **one** question. Name that question in `docs/SCREENS.md`
before touching the layout:

| Screen | Its one question |
|---|---|
| Dashboard | How exposed am I, and is anything on fire? |
| Work queue | What do I do next? |
| Asset detail | Why this, and what exactly do I change? |
| Fix & verify | Is the change safe, and who signed it? |
| CBOM | What do I hand to an auditor? |
| Roadmap | What is the plan over 30 months? |
| Attest | What can I prove without disclosing? |

Anything on a screen that does not serve its question moves or goes. The single
most important number on each screen should be findable in under three seconds.

## C7 — Empty and error states

Every empty state is a direction. "Nothing left to fix automatically" is a dead
end — replace with what to do next and a control that does it. Every error names
what failed, what it means, and the next action. Neither apologises.

---

# PART D — ORDER OF WORK

1. Part A. Write `docs/AUDIT.md`. Show it to me before fixing anything.
2. B1 (verdict collapse) — nothing else matters until all three verdicts are
   reachable.
3. B2, B4 — coverage regression and the paper/surface token.
4. C1, C3, C4, C5 as a single pass across every screen. Do not do this screen by
   screen; do it token-first so it lands uniformly.
5. C2 motion, one interaction at a time, in the table order.
6. B3, B5, C6, C7.
7. Re-run Part A's twenty probes. Append the results to `docs/AUDIT.md` as a
   second pass and state which findings are now closed.

After each numbered step: run the app, take a screenshot, and review it against
the anti-AI-look checklist in the master spec before moving on. If you cannot
screenshot, say so rather than claiming a visual check you did not perform.

---

# THE TEST

Dr. Subramanian opens MOX cold. Within thirty seconds he knows what is most
urgent and why. Within two minutes he has found a number he can reconstruct by
hand, a distinction he did not expect a student team to make, and a limitation
the tool admits to on its own. He cannot find a claim the tool cannot support.

He does not think "good for a hackathon." He thinks "who built this, and are they
available."
