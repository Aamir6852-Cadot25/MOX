# Creates D:\MOX-LIGHT: the MOX backend + demo data, WITHOUT the old UI, old rules or old docs.
$src = "D:\MOX"; $dst = "D:\MOX-LIGHT"
if (Test-Path $dst) { Write-Host "$dst already exists - delete it first." -ForegroundColor Red; Read-Host "Press Enter to close"; exit 1 }
robocopy $src $dst /E /NFL /NDL /NJH /NJS `
  /XD node_modules .venv dist .git .pytest_cache __pycache__ "$src\web" "$src\docs" "$src\PIC" `
  /XF "$src\fix.py" "$src\fix2.py" "$src\CLAUDE.md" "$src\AGENTS.md" "$src\PLAN.md" "$src\PROMPTS.md" "$src\SPEC.md" "$src\README.md" test_ui_rules.py test_splash.py test_phase15.py *.bak | Out-Null
robocopy "$src\web" "$dst\web" /E /NFL /NDL /NJH /NJS /XD "$src\web\src" node_modules dist | Out-Null
robocopy "$src\docs\new-ui-kit\reference" "$dst\reference" /E /NFL /NDL /NJH /NJS | Out-Null
Copy-Item "$src\docs\new-ui-kit\AGENTS.md" "$dst\AGENTS.md"
Copy-Item "$src\docs\new-ui-kit\MASTER_PROMPT.md" "$dst\reference\MASTER_PROMPT.md"
Set-Location $dst
git init -q
git add -A
git commit -q -m "baseline: MOX backend without old UI"
Write-Host "Done. Open D:\MOX-LIGHT in Antigravity." -ForegroundColor Green
Read-Host "Press Enter to close"
