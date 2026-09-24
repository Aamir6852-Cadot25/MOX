# MOX — PROJECT STATE EXPORT

Run this once. It produces a single file, `docs/PROJECT_STATE.md`, that I can
hand to another AI session (or read myself later) to get full context without
screenshots. Do not change any product code — this is read-only, documentation
only.

Write `docs/PROJECT_STATE.md` with these sections, in order:

## 1. Identity
- Project name, one-line pitch, target PS (SIH26164 / NTRO / NCIIPC)
- Brand assets currently in the repo: logo file paths, the CipherX name and
  mark if referenced anywhere, any colour named outside tokens.css (flag these
  — they shouldn't exist)
- The exact contents of the `:root` token block in tokens.css, verbatim

## 2. Navigation and screens, as-built
For each route/screen currently in the app:
- Its path and the nav section it currently sits under
- One sentence: what question it answers (pull from docs/SCREENS.md if it
  exists, else infer from the component)
- Its main child components and what data each one renders
- Whether it reads from a real API call or a hardcoded value (flag any hardcoded)

## 3. Engine
- List every function in server/engine/ (or equivalent) with its signature,
  one-line purpose, and which file calls it
- The full current scoring formula, verbatim from docs/SCORING.md if present
- The verdict rule (MIGRATE/CONTAIN/ACCEPT) exactly as currently implemented,
  including the disallowed-can't-ACCEPT rule and the short-shelf-life rule if
  present
- Every permanent regression test file and what invariant each one guards
  (one line per test file, not per test)

## 4. Audit status
- Read docs/AUDIT.md and summarise: total Critical/Major/Minor found, how many
  of each are closed vs open vs partially closed, and the evaluator's current
  verdict line if the file has one
- List the still-open items verbatim, however few

## 5. Data and privacy posture
- Every place the app can open a network socket, verbatim as found in code
  (not as claimed in UI)
- Every third-party dependency in package.json / requirements.txt with one
  word on what it's for; flag anything that looks like an AI SDK, analytics,
  or telemetry package
- Confirm whether SQLite WAL mode is on

## 6. Known gaps
- Anything in the master build spec (docs/MOX_MASTER_BUILD_PROMPT.md if
  present) that is explicitly NOT yet built
- Any TODO / FIXME comments in the codebase, file and line
- The current git log, last 15 commits, one line each (hash + message only)

## 7. Screens rendered
For each of the 12-ish screens, save a screenshot (1280×800, light mode) to
`docs/screenshots/<screen-name>.png` if a screenshot tool is available in this
environment. If not, say so plainly rather than skipping silently.

---

Keep the whole file under 400 lines — summarise rather than dump full file
contents, except for tokens.css and the scoring formula, which should be
verbatim. When done, tell me the file's path and line count, nothing else.
