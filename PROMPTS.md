# Prompts to paste into Claude Code (one at a time)

Type /clear after each phase is committed. Use /compact if a session gets long.

## 0 - Plan  (use /model -> Opus for this one)
Read CLAUDE.md and SPEC.md. Write PLAN.md: final file tree + 6 phases with checkbox acceptance checks, max 70 lines. Phases: 1 demo target + 7-plane scanner + NIST lookup; 2 correlation + scoring + verdicts; 3 API + auth + UI (Login, Dashboard, Work queue, Asset detail); 4 fix-and-verify + CBOM + roadmap (+ Fix, CBOM, Roadmap screens); 5 attestation + sector view + bench (+ Attest, Sector, Audit screens); 6 run.ps1 + README demo script + clean-run check. No code yet.

## 1  (switch to /model -> Sonnet from here)
Do Phase 1 of PLAN.md using SPEC sections 2-5. Work without stopping, run tests, commit, report in 10 lines max.

## 2
Do Phase 2 of PLAN.md using SPEC sections 6-8. Work without stopping, run tests, commit, report in 10 lines max.

## 3
Do Phase 3 of PLAN.md using SPEC sections 12-14. First view docs/mockups/ui.css, correlate.html and dashboard_reference.png for the look. Work without stopping, run tests + web build, commit, report in 10 lines max.

## 4
Do Phase 4 of PLAN.md using SPEC sections 9-10 and 14 (Fix, CBOM, Roadmap screens; see fix_verify_reference.png). Work without stopping, run tests + web build, commit, report in 10 lines max.

## 5
Do Phase 5 of PLAN.md using SPEC sections 11, 15 and 14 (Attest, Sector, Audit screens; see attest.html, sector.html). Work without stopping, run tests + web build, commit, report in 10 lines max.

## 6
Do Phase 6: write run.ps1 (venv, pip install, npm install+build, start server) and a README "Demo script" section following SPEC section 1. Then do a clean run: delete data/mox.db, run make-demo, create-admin (user admin, password from env MOX_ADMIN_PW or prompt), scan demo_target with --probe 127.0.0.1:8443 while demo-tls runs, open every screen via the API, fix anything broken. Commit. Report the exact output of: python -m mox bench demo_target

## If something breaks
Tests fail with: <paste the last 15 lines>. Find the root cause and fix it. Report in 5 lines.
