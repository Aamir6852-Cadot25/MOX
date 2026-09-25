# MOX: setup + build + start on http://127.0.0.1:8000 (Windows PowerShell). Network is only needed for pip/npm install.
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if (-not (Test-Path .venv\Scripts\python.exe)) { python -m venv .venv }
$py = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
& $py -m pip install --quiet -r requirements.txt
if ($LASTEXITCODE) { throw "pip install failed" }

# Install only when node_modules is missing, but always rebuild dist - a stale bundle from a
# previous run must never keep serving old frontend code after a source change.
if (-not (Test-Path web\node_modules)) {
    npm --prefix web ci
    if ($LASTEXITCODE) { throw "npm ci failed" }
}
npm --prefix web run build
if ($LASTEXITCODE) { throw "web build failed" }

if (-not (Test-Path demo_target)) { & $py -m mox make-demo }

$users = & $py -c "from mox import db; print(db.connect().execute('SELECT COUNT(*) FROM users').fetchone()[0])"
if ($users -eq "0") {
    Write-Host "No users yet - create the admin account:"
    & $py -m mox create-admin
    if ($LASTEXITCODE) { throw "create-admin failed" }
}

& $py -m mox scan demo_target
& $py -m mox demo-attestations

Write-Host "MOX running on http://127.0.0.1:8000 (Ctrl+C to stop)"
& $py -m mox serve
