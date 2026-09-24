# MOX — rules for Claude Code (read every session)

MOX = our Smart India Hackathon 2026 MVP for PS SIH26164 (NTRO): an OFFLINE tool that
finds every quantum-vulnerable cryptographic asset in a codebase, scores it, gives a
verdict, fixes it, proves the fix, and exports a CycloneDX CBOM + a signed attestation.
Full requirements: SPEC.md (read only the section a task needs). Plan: PLAN.md.

## Stack (do not change)
- Backend + scanner: Python 3.12, FastAPI, SQLite (stdlib sqlite3). Package: `mox/`.
- Frontend: React + Vite + Tailwind + Recharts in `web/`, built to `web/dist`, served by FastAPI.
- Allowed deps. Python: fastapi, uvicorn, cryptography, argon2-cffi, pyjwt,
  cyclonedx-python-lib[json-validation], pytest, httpx. Node: react, react-dom,
  react-router-dom, vite, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite, recharts.
  Ask before adding anything else.
- Windows 11 + PowerShell. Provide `run.ps1` (setup + build + start on http://127.0.0.1:8000).

## Hard rules
- Offline: no network calls at runtime, ever. No telemetry.
- Never store private key material in the DB or outputs. Metadata + fingerprints only.
- Everything simulated is labelled "demo data" in the UI.
- Numbers shown in the UI must come from real scans, never hard-coded.

## Token discipline
- Replies: ≤10 lines — files changed, tests result, next step. No code echoes, no essays.
- Read only files you need. Never open: node_modules, .venv, web/dist, *.db, *.tar, *.bin, *.p12.
- Edit in place; don't rewrite unchanged code. Keep files small and focused.
- View mockup images/HTML in docs/mockups only when building that screen.
- Don't ask me questions you can answer from SPEC.md; make a sensible choice and note it.

## Definition of done (every phase)
`python -m pytest -q` passes, `npm --prefix web run build` passes (if web touched),
then `git add -A; git commit -m "phase N: <summary>"`. Update PLAN.md checkboxes.

@AGENTS.md
