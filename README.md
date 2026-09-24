# MOX — offline quantum-vulnerable crypto scanner (SIH 2026, PS SIH26164)

Finds every quantum-vulnerable cryptographic asset in a codebase, scores it, gives a verdict
(MIGRATE / CONTAIN / ACCEPT), fixes it, proves the fix, and exports a CycloneDX 1.6 CBOM plus a
signed attestation. Runs fully offline; the network is only used once to install dependencies.

## Setup
Windows 11 + PowerShell, Python 3.12, Node 18+.

    .\run.ps1

It creates `.venv`, installs dependencies, builds the web app, generates `demo_target/`, asks you
to create the admin account (first run only), scans the demo target, creates simulated sector
attestations and serves http://127.0.0.1:8000.

## CLI
    python -m mox make-demo                 generate demo_target/
    python -m mox demo-tls                  serve the demo api-gw cert on 127.0.0.1:8443
    python -m mox scan <path> [--probe host:port]
    python -m mox create-admin              the only way to create a user
    python -m mox demo-attestations         simulated signed attestations, 6 sectors (demo data)
    python -m mox bench <path...>           files, seconds, planes, findings, assets, QV, HNDL, verdicts
    python -m mox serve                     API + web UI on 127.0.0.1:8000

## Demo script
1. **Login → Dashboard.** Sign in, open Dashboard, run a scan of `demo_target/`. Real counts and scan time.
2. **Work queue.** Ranked by risk; each row has a MIGRATE / CONTAIN / ACCEPT chip.
3. **Asset detail.** Open the api-gw RSA key: one key found in several places is ONE asset. Show the score breakdown, verdict and PQC replacement.
4. **Fix.** Preview the diff → Approve → patch applied with backup → automatic re-scan → "finding cleared".
5. **CBOM + Roadmap.** Export the CycloneDX CBOM (badge "schema valid"), then show the 5-wave roadmap.
6. **Attest.** What leaves vs what never leaves, JSON preview, self-check, export the signed attestation.
7. **Sector view.** Built only from signed attestations (simulated, labelled demo data).

For the live TLS probe: run `python -m mox demo-tls` in a second terminal, then
`python -m mox scan demo_target --probe 127.0.0.1:8443`.

## Numbers for slides
Run `python -m mox bench demo_target` (numbers are measured, never hard-coded).
