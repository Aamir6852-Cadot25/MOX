# AGENTS.md — MOX (light UI edition)

This workspace uses the light MOX UI edition.

## The target
- The finished UI must look and behave like `reference/MOX_UI_Preview.html` (and `docs/ui-reference/MOX_UI_Preview.html`) and the reference screenshots. That is the single source of truth for design.
- Backend = `mox/` (FastAPI, port 8000). Do NOT change backend behaviour. Small read-only additions are allowed only if a screen truly cannot be built otherwise — say so in the report.

## Truth rules
- Every number on screen comes from the API. No hard-coded counts. The preview uses demo data only as a picture.
- A fix is "cleared" only after the re-scan says so.
- Anything simulated is labelled "demo data".
- Standards: say final or draft (e.g. IR 8547 is a draft).

## Offline
- No network at runtime: no CDN, no Google Fonts link, no analytics. Bundle fonts and icons via npm (@fontsource/inter, @fontsource/jetbrains-mono, lucide-react) — they are compiled into web/dist.

## Style (light only)
- Header #0B2540, sidebar #0F2B46, active item #1B3F5E, page bg #F4F6F9, cards white with 1px #E5E8EC border, radius 10px.
- Accent cyan #0EA5C9. Severity: P1 #DC2626, P2 #EA580C, P3 #D97706, P4 #64748B. Verdicts: MIGRATE red tint, CONTAIN amber tint, ACCEPT green tint.
- Inter for UI, JetBrains Mono for paths/code/JSON. Uppercase small grey labels. No neon, no gradients (except the logo tile), no emojis.

## Done (every phase)
.venv\Scripts\python -m pytest -q green · npm --prefix web run build green · app opened and each touched page checked in a browser
(if not possible, write "not visually verified") · git add -A; git commit -m "ui: <summary>" · report <= 12 lines.
