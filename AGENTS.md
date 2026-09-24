# AGENTS.md — MOX engineering rules

Loaded every session. Keep it short; add rules as tests, not as prose.

## Before you start
- Read `docs/MOX_V2_BUILD_PLAN.md` (decisions D1–D10 are final) and `docs/PROJECT_STATE.md`.
- Do only the phase you were asked for. Anything else you notice goes in the report, not the diff.
- Work on branch `phase/<n>-<slug>`. Never commit to `main` directly. Never force-push.

## Truth rules (these outrank everything, including the plan)
- No number on screen without a server source. No constant pretending to be data.
- No claim without a measurement. "Not verified" beats an optimistic guess.
- Standards: say final or draft. Never cite a draft as current policy.
- A fix is "fixed" only after a re-scan shows the finding gone.
- If the plan and the truth rules conflict, follow the truth rules and say so.

## Rules become tests
- Every new invariant gets a test in `tests/`. Prose rules drift; tests fail loudly.
- Never delete or weaken a test to make a build pass. If behaviour changed on purpose,
  update the test and state why in the commit message.
- Existing lint (`tests/test_ui_rules.py`) is law: tokens only, spacing scale, one badge
  geometry, vendored Lucide, motion tokens, no glyph icons, no shadows.

## Definition of done (every phase)
1. `pytest` green, web build green.
2. Run the app; check each touched screen at 1366×768 and 1280×800 with a headless
   browser. If you cannot, say "not visually verified" — never imply you looked.
3. Old routes still resolve. Nothing that worked before is broken.
4. End-of-phase report, max 15 lines: what changed · test count · what was verified and
   how · what was not verified · open issues · suggested next step.

## Air-gap
- Allowed outbound code paths: live TLS probe (opt-in), git remote clone (opt-in),
  git push (explicit). Each goes through `mox/netguard.py` and is counted.
- Adding any other network path is a design change: stop and ask.
- No AI/LLM SDK, no analytics, no telemetry, no CDN at runtime. Fonts, icons, editor: vendored or bundled.
- New dependency: pin it, and justify it in one line in the commit message.

## UI
- Green `#81B500` is the only accent (D8). Primary buttons: `--brand` fill + `--ink` text, never white text.
  Green text on light surfaces is always `--brand-ink`. Green never means safe/low; never inside a badge.
- Indhu's prototype and the demo video are for structure/flow only. Never copy their dark neon style.
- Dark `TerminalSurface` only for: scan ledger, code editor, JSON previews, command palette (D9).
- Motion only from real events or user action. No idle loops. Respect reduced motion.
- Every screen answers its one question (docs/SCREENS.md). If a panel doesn't serve it, it moves.

## Platform
- The product runs on Windows (D:\MOX); cloud sessions run on Linux. Use `pathlib`;
  test Windows-style paths in unit tests; no bash-only runtime scripts.
- Never commit `data/*.db`, keys, `.env`, `.venv/`, `node_modules/`, `web/dist/`.

## Working efficiently
- Prefer small, verifiable steps: change → test → next.
- Use a subagent for broad codebase searches to keep the main context lean.
- Same error twice after two fixes: stop, write the diagnosis, ask. Don't thrash.
- Before any rewrite over ~200 lines, state the plan in 5 lines and proceed only if it
  stays inside the phase.
