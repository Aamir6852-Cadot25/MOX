"""Plane 5 - certificates & keys (PEM/DER/PKCS#12). Only public facts + SPKI SHA-256 are kept;
private key material is parsed in memory to read its public half and never persisted."""
import hashlib
import re
from datetime import datetime, timezone
from pathlib import Path

from cryptography import x509
from cryptography.hazmat.primitives import serialization as ser
from cryptography.hazmat.primitives.asymmetric import dsa, ec, ed448, ed25519, rsa, x448, x25519
from cryptography.hazmat.primitives.serialization import pkcs12

from ..models import Finding
from ..nist import norm_curve

NAME = "certificates"
EXTS = {".pem", ".crt", ".cer", ".der", ".key", ".p12", ".pfx", ".p8", ".pub"}
P12_PASSWORDS = (None, b"", b"changeit", b"password")
_PEM = re.compile(r"-----BEGIN ([A-Z0-9 ]+)-----.*?-----END \1-----", re.S)


def wants(path: Path) -> bool:
    return path.suffix.lower() in EXTS


def _pub_info(pub):
    if isinstance(pub, rsa.RSAPublicKey):
        return "RSA", pub.key_size, None
    if isinstance(pub, ec.EllipticCurvePublicKey):
        return "ECDSA", pub.curve.key_size, norm_curve(pub.curve.name)
    if isinstance(pub, dsa.DSAPublicKey):
        return "DSA", pub.key_size, None
    if isinstance(pub, (ed25519.Ed25519PublicKey, ed448.Ed448PublicKey)):
        return "EdDSA", 256 if isinstance(pub, ed25519.Ed25519PublicKey) else 456, None
    if isinstance(pub, (x25519.X25519PublicKey, x448.X448PublicKey)):
        return "X25519", 256, None
    return type(pub).__name__, None, None


def spki_sha256(pub) -> str:
    der = pub.public_bytes(ser.Encoding.DER, ser.PublicFormat.SubjectPublicKeyInfo)
    return hashlib.sha256(der).hexdigest()


def _label(alg, size, curve):
    return f"{alg} {curve}" if curve else f"{alg}-{size}" if size else alg


def key_finding(rel, line, pub, kind, extra=None) -> Finding:
    alg, size, curve = _pub_info(pub)
    what = "private key" if kind == "private_key" else "public key"
    return Finding(NAME, alg, rel, line, size, None, curve, f"{what} {_label(alg, size, curve)}",
                   spki_sha256(pub), "high", "key-parse", {"kind": kind, **(extra or {})})


def cert_findings(rel, line, cert, plane=NAME) -> list[Finding]:
    pub = cert.public_key()
    alg, size, curve = _pub_info(pub)
    try:
        sig = cert.signature_hash_algorithm.name.upper() if cert.signature_hash_algorithm else None
    except Exception:
        sig = None
    not_after = cert.not_valid_after_utc
    meta = {"kind": "certificate", "subject": cert.subject.rfc4514_string(),
            "issuer": cert.issuer.rfc4514_string(), "not_after": not_after.isoformat(),
            "expired": not_after < datetime.now(timezone.utc), "sig_alg": sig,
            "self_signed": cert.subject == cert.issuer}
    fp = spki_sha256(pub)
    ev = f"X.509 {_label(alg, size, curve)} sig={sig} {meta['subject']}"
    out = [Finding(plane, alg, rel, line, size, None, curve, ev, fp, "high", "x509-parse", meta)]
    if sig in ("SHA1", "MD5"):
        out.append(Finding(plane, "SHA-1" if sig == "SHA1" else "MD5", rel, line,
                           evidence=f"certificate signed with {sig}", fingerprint=fp, confidence="high",
                           detector="x509-sig", meta={"kind": "certificate-signature", "subject": meta["subject"]}))
    return out


def _locked(rel, line, why) -> Finding:
    return Finding(NAME, "unknown", rel, line, evidence=why, confidence="low", detector="key-parse",
                   meta={"kind": "locked"})


def _pem_block(rel, line, kind, block: bytes) -> list[Finding]:
    try:
        if kind == "CERTIFICATE":
            return cert_findings(rel, line, x509.load_pem_x509_certificate(block))
        if "PRIVATE KEY" in kind:
            if kind == "ENCRYPTED PRIVATE KEY":
                return [_locked(rel, line, "encrypted private key; algorithm not inspected")]
            return [key_finding(rel, line, ser.load_pem_private_key(block, None).public_key(), "private_key")]
        if "PUBLIC KEY" in kind:
            return [key_finding(rel, line, ser.load_pem_public_key(block), "public_key")]
    except TypeError:
        return [_locked(rel, line, "encrypted private key; algorithm not inspected")]
    except Exception:
        pass
    return []


def _p12(rel, data: bytes) -> list[Finding]:
    for pw in P12_PASSWORDS:
        try:
            key, cert, extra = pkcs12.load_key_and_certificates(data, pw)
        except Exception:
            continue
        out = []
        if key is not None:
            out.append(key_finding(rel, 0, key.public_key(), "private_key", {"container": "pkcs12"}))
        for c in ([cert] if cert else []) + list(extra or []):
            out += cert_findings(rel, 0, c)
        return out
    return [_locked(rel, 0, "password-protected PKCS#12; contents not inspected")]


def _der(rel, data: bytes) -> list[Finding]:
    attempts = (
        lambda: cert_findings(rel, 0, x509.load_der_x509_certificate(data)),
        lambda: [key_finding(rel, 0, ser.load_der_private_key(data, None).public_key(), "private_key")],
        lambda: [key_finding(rel, 0, ser.load_der_public_key(data), "public_key")],
    )
    for attempt in attempts:
        try:
            return attempt()
        except Exception:
            continue
    return []


def scan(path: Path, rel: str, ctx) -> list[Finding]:
    try:
        if path.stat().st_size > 5 * 1024 * 1024:
            return []
        data = path.read_bytes()
    except OSError:
        return []
    if path.suffix.lower() in (".p12", ".pfx"):
        return _p12(rel, data)
    if b"-----BEGIN" in data:
        text = data.decode("ascii", errors="ignore")
        out = []
        for m in _PEM.finditer(text):
            line = text.count("\n", 0, m.start()) + 1
            out += _pem_block(rel, line, m.group(1), m.group().encode("ascii"))
        return out
    return _der(rel, data)
