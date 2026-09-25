# Deterministic demo reset (SIH recording prep): wipes the DB and operator key, then re-seeds it
# with a REAL scan of the existing demo_target folder (never fabricated data). demo_target itself is
# kept (same keys and certs every take); only files patched by a previous take are restored from .bak.
#
# Run once before each take:
#   .\scripts\reset_demo.ps1
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
$py = ".venv\Scripts\python.exe"
if (-not (Test-Path $py)) { throw "run .\run.ps1 once first to create .venv" }

Remove-Item -Force -ErrorAction SilentlyContinue data\mox.db, data\mox.db-wal, data\mox.db-shm
Remove-Item -Recurse -Force -ErrorAction SilentlyContinue data\keys

# Undo patches from previous takes: Approve-and-apply leaves <file>.bak holding the true original.
# Without this, a second take finds nothing left to auto-fix in Remediate.
if (Test-Path demo_target) {
    Get-ChildItem demo_target -Recurse -File -Filter *.bak | ForEach-Object {
        Move-Item -Force $_.FullName ($_.FullName -replace '\.bak$', '')
    }
}

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
