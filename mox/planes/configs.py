"""Plane 4 - configs: nginx/apache/openssl/java.security/terraform -> protocols, ciphers, curves, key specs."""
import re
from pathlib import Path

from ..models import Finding
from ..nist import norm_curve, table
from . import read_text

NAME = "configs"
SUFFIXES = {".conf", ".cnf", ".tf", ".security"}
_CURVE_ALG = {"X25519MLKEM768": "X25519MLKEM768", "X25519": "X25519"}


def wants(path: Path) -> bool:
    return path.suffix.lower() in SUFFIXES or path.name.lower() == "java.security"


def _cipher_algs(spec: str) -> list[str]:
    algs = []
    for tok in re.split(r"[:,\s]+", spec):
        if tok.startswith("!"):
            continue
        t = tok.upper().lstrip("+-@")
        alg = ("3DES" if re.search(r"3DES|DES-CBC3|DES-EDE3|DESEDE|TRIPLEDES", t)
               else "RC4" if "RC4" in t else "DES" if re.search(r"(?<![A-Z0-9])DES(?![A-Z0-9])", t) else None)
        if alg and alg not in algs:
            algs.append(alg)
    return algs


def _curve_alg(tok: str) -> tuple[str, str | None]:
    tok = tok.strip()
    if tok in _CURVE_ALG:
        return _CURVE_ALG[tok], None
    return "ECDH", norm_curve(tok)


def _refs(text: str) -> dict:
    def grab(directive):
        return re.findall(rf"^\s*{directive}\s+([^;\s]+)", text, re.M)
    return {"kind": "config", "cert_refs": grab("ssl_certificate") + grab("SSLCertificateFile"),
            "key_refs": grab("ssl_certificate_key") + grab("SSLCertificateKeyFile"),
            "server_name": (grab("server_name") or [None])[0], "listen": (grab("listen") or [None])[0]}


def scan(path: Path, rel: str, ctx) -> list[Finding]:
    text = read_text(path)
    if text is None:
        return []
    meta = _refs(text)
    weak = {k for k, v in table()["protocols"].items() if v["now"] != "approved"}
    out: list[Finding] = []

    def add(alg, i, raw, size=None, curve=None, mode=None, det="config"):
        out.append(Finding(NAME, alg, rel, i, size, mode, curve, raw.strip(), confidence="medium",
                           detector=det, meta=dict(meta, cert_refs=list(meta["cert_refs"]),
                                                   key_refs=list(meta["key_refs"]))))

    for i, raw in enumerate(text.splitlines(), 1):
        s = raw.strip()
        if not s or s.startswith(("#", "//", ";")):
            continue
        if m := re.match(r"(?:ssl_protocols|SSLProtocol|MinProtocol)\b\s*[= ]*(.+?);?$", s):
            for tok in re.split(r"[\s,]+", m.group(1)):
                tok = tok.lstrip("+")
                if tok in weak:
                    add(tok, i, raw, det="protocol")
        elif m := re.match(r"(?:ssl_ciphers|SSLCipherSuite|CipherString)\b\s*[= ]*(.+?);?$", s):
            for alg in _cipher_algs(m.group(1).strip("'\"")):
                add(alg, i, raw, det="cipher")
        elif m := re.match(r"(?:ssl_ecdh_curve|SSLOpenSSLConfCmd\s+Curves|Groups)\b\s*[= ]*(.+?);?$", s):
            for tok in filter(None, m.group(1).split(":")):
                alg, curve = _curve_alg(tok)
                add(alg, i, raw, size=int(curve[2:]) if curve and curve.startswith("P-") else None,
                    curve=curve, det="curve")
        elif m := re.match(r"default_bits\s*=\s*(\d+)", s):
            add("RSA", i, raw, size=int(m.group(1)), det="openssl-bits")
        elif m := re.match(r"default_md\s*=\s*(md5|sha1)\b", s, re.I):
            add("MD5" if m.group(1).lower() == "md5" else "SHA-1", i, raw, det="openssl-md")
        elif m := re.match(r"(?:jdk\.tls|jdk\.security)\.legacyAlgorithms\s*=\s*(.+)", s):
            for tok in re.split(r"[,\s]+", m.group(1)):
                alg = {"DES": "DES", "DESEDE": "3DES", "RC4": "RC4", "MD5": "MD5", "SHA1": "SHA-1"}.get(tok.upper())
                if alg:
                    add(alg, i, raw, det="java-security")
        elif m := re.search(r'key_spec\s*=\s*"([^"]+)"', s):
            spec = m.group(1)
            if r := re.fullmatch(r"RSA_(\d+)", spec):
                add("RSA", i, raw, size=int(r.group(1)), det="terraform")
            elif r := re.fullmatch(r"ECC_NIST_P(\d+)", spec):
                add("ECDSA", i, raw, size=int(r.group(1)), curve=f"P-{r.group(1)}", det="terraform")
        elif m := re.match(r"rsa_bits\s*=\s*(\d+)", s):
            add("RSA", i, raw, size=int(m.group(1)), det="terraform")
    return out
