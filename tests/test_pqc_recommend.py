"""Remediate recommendations: a forgery-only RSA asset (certificate, signing key) must get a signature
scheme, never a KEM; an HNDL-exposed RSA key exchange keeps the KEM family."""
import json
import shutil
import subprocess
from pathlib import Path

import pytest

MODULE = Path(__file__).resolve().parents[1] / "web" / "src" / "data" / "pqc_alternatives.js"


def _recommend(alg, opts):
    node = shutil.which("node")
    if not node:
        pytest.skip("node not installed")
    js = (f"import {{ recommend }} from {json.dumps(MODULE.as_uri())};"
          f"console.log(JSON.stringify(recommend({json.dumps(alg)}, {json.dumps(opts)})));")
    out = subprocess.run([node, "--input-type=module", "-e", js], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def test_forgery_only_rsa_gets_a_signature_scheme():
    r = _recommend("RSA", {"verdict": "MIGRATE", "hndl": False, "forgery": True, "criticality": 2})
    assert r["family"] == "signature" and r["recommended"]["name"].startswith("ML-DSA")


def test_hndl_rsa_keeps_the_kem_family():
    r = _recommend("RSA", {"verdict": "MIGRATE", "hndl": True, "forgery": True, "criticality": 3})
    assert r["family"] == "key-exchange" and "ML-KEM" in r["recommended"]["name"]
