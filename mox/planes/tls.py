"""Plane 7 - live TLS probe (`scan --probe host:port`). Certificate verification is off: we inspect, not trust."""
import socket
import ssl

from cryptography import x509

from ..models import Finding
from ..nist import table
from .certs import cert_findings
from .configs import _cipher_algs

NAME = "tls"


def probe(host: str, port: int, timeout: float = 5.0) -> list[Finding]:
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    ctx.minimum_version = ssl.TLSVersion.MINIMUM_SUPPORTED
    try:
        ctx.set_ciphers("ALL:@SECLEVEL=0")
    except ssl.SSLError:
        pass
    rel = f"tls://{host}:{port}"
    with socket.create_connection((host, port), timeout=timeout) as sock:
        with ctx.wrap_socket(sock, server_hostname=host) as ssock:
            proto, cipher = ssock.version(), ssock.cipher()
            der = ssock.getpeercert(binary_form=True)
    base = {"host": host, "port": port, "protocol": proto, "cipher": cipher[0] if cipher else None}
    out = []
    for f in cert_findings(rel, 0, x509.load_der_x509_certificate(der), plane=NAME):
        f.confidence, f.detector = "high", "tls-handshake"
        f.meta.update(base)
        out.append(f)
    if proto and table()["protocols"].get(proto, {}).get("now", "approved") != "approved":
        out.append(Finding(NAME, proto, rel, 0, evidence=f"negotiated {proto}", confidence="high",
                           detector="tls-handshake", meta={"kind": "protocol", **base}))
    for alg in _cipher_algs(base["cipher"] or ""):
        out.append(Finding(NAME, alg, rel, 0, evidence=f"negotiated cipher {base['cipher']}", confidence="high",
                           detector="tls-handshake", meta={"kind": "cipher", **base}))
    return out
