# Deterministic demo reset (SIH recording prep): wipes the DB and operator key, then re-seeds it
# with a REAL scan of the existing demo_target folder (never fabricated data). demo_target itself is
# left untouched so every take scans the exact same files.
#
# Run once before each take:
#   .\scripts\reset_demo.ps1
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
$py = ".venv\Scripts\python.exe"
if (-not (Test-Path $py)) { throw "run .\run.ps1 once first to create .venv" }

Remove-Item -Force -ErrorAction SilentlyContinue data\mox.db, data\mox.db-wal, data\mox.db-shm
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue data\keys

if (-not (Test-Path demo_target)) {
    & $py -m mox make-demo
    if ($LASTEXITCODE) { throw "make-demo failed" }
}

& $py -m mox create-admin --username admin --password "DemoPass123!"
if ($LASTEXITCODE) { throw "create-admin failed" }

& $py -m mox scan demo_target
if ($LASTEXITCODE) { throw "scan failed" }

& $py -m mox demo-attestations
if ($LASTEXITCODE) { throw "demo-attestations failed" }

Write-Host "Demo reset. Sign in as admin / DemoPass123! - start the recording from Discover."
