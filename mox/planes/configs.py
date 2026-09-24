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


# OpenSSL-format TLS 1.2 suites with no ECDHE/DHE prefix use static RSA key transport: the session key is
# encrypted to the certificate's RSA key, so recorded traffic falls to whoever later recovers that key.
_STATIC_RSA = re.compile(r"(?:AES\d*|DES|DES-CBC3|3DES|RC4|CAMELLIA\d*|SEED|IDEA|NULL)(?:-[A-Z0-9]+)*|RSA|kRSA")


def static_rsa_suites(spec: str) -> list[str]:
    toks = [t for t in re.split(r"[:,\s]+", spec.strip("'\"")) if t]
    return [t for t in toks if not t.startswith(("!", "-", "@")) and _STATIC_RSA.fullmatch(t.lstrip("+").upper())]


def tls_context(text: str) -> dict:
    """What the declared TLS config can negotiate. Declared only: MOX cannot see the server's TLS library."""
    protos = []
    for m in re.finditer(r"^\s*(?:ssl_protocols|SSLProtocol)\s+([^;\n]+)", text, re.M):
        protos += [t.lstrip("+") for t in m.group(1).split() if not t.startswith("-")]
    groups = []
    for m in re.finditer(r"^\s*(?:ssl_ecdh_curve|SSLOpenSSLConfCmd\s+Curves)\s+([^;\n]+)", text, re.M):
        groups += [g for g in m.group(1).strip().split(":") if g]
    rsa = []
    for m in re.finditer(r"^\s*(?:ssl_ciphers|SSLCipherSuite)\s+([^;\n]+)", text, re.M):
        rsa += static_rsa_suites(m.group(1))
    tls13 = "TLSv1.3" in protos
    hybrid = "X25519MLKEM768" in groups
    why = None
    if hybrid and not protos:
        why = "no ssl_protocols line, so whether TLS 1.3 is enabled depends on the server build; not verified"
    elif hybrid and not tls13:
        why = f"X25519MLKEM768 is a TLS 1.3 group but ssl_protocols allows only {' '.join(protos)}; it can never be negotiated"
    return {"protocols": protos, "groups": groups, "static_rsa": rsa, "hybrid_configured": hybrid,
            "hybrid_effective": hybrid and tls13, "hybrid_why": why,
            "classical_fallback": [g for g in groups if g != "X25519MLKEM768"] + (["TLS 1.2"] if hybrid and "TLSv1.2" in protos else [])}


_TF_USAGE = {"SIGN_VERIFY": "sign", "ENCRYPT_DECRYPT": "encrypt", "KEY_AGREEMENT": "key-agreement"}


def _tf_key_usage(lines: list[str], idx: int) -> tuple[str, str] | None:
    """key_usage declared in the same Terraform resource block as line idx (0-based), with its line."""
    start = next((j for j in range(idx, -1, -1) if re.match(r"\s*resource\s", lines[j])), 0)
    for j in range(start, len(lines)):
        if j > idx and re.match(r"\s*resource\s", lines[j]):
            break
        if m := re.search(r'key_usage\s*=\s*"([A-Z_]+)"', lines[j]):
            return (_TF_USAGE[m.group(1)], f"line {j + 1}: {lines[j].strip()}") if m.group(1) in _TF_USAGE else None
    return None


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
    if re.search(r"^\s*(?:ssl_|SSL)", text, re.M):
        meta["tls"] = tls_context(text)
    weak = {k for k, v in table()["protocols"].items() if v["now"] != "approved"}
    out: list[Finding] = []

    def add(alg, i, raw, size=None, curve=None, mode=None, det="config"):
        out.append(Finding(NAME, alg, rel, i, size, mode, curve, raw.strip(), confidence="medium",
                           detector=det, meta=dict(meta, cert_refs=list(meta["cert_refs"]),
                                                   key_refs=list(meta["key_refs"]))))

    lines = text.splitlines()
    for i, raw in enumerate(lines, 1):
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
            if rsa := static_rsa_suites(m.group(1)):
                add("RSA", i, raw, mode="key-transport", det="cipher-kex")
                out[-1].meta.update(kind="cipher", purpose="key-transport", suites=rsa)
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
            n = len(out)
            if r := re.fullmatch(r"RSA_(\d+)", spec):
                add("RSA", i, raw, size=int(r.group(1)), det="terraform")
            elif r := re.fullmatch(r"ECC_NIST_P(\d+)", spec):
                add("ECDSA", i, raw, size=int(r.group(1)), curve=f"P-{r.group(1)}", det="terraform")
            if len(out) > n and (u := _tf_key_usage(lines, i - 1)):
                out[-1].meta.update(purpose=u[0], purpose_evidence=u[1])
        elif m := re.match(r"rsa_bits\s*=\s*(\d+)", s):
            add("RSA", i, raw, size=int(m.group(1)), det="terraform")
    return out
