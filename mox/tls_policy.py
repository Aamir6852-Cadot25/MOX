"""Live TLS probe authorisation (docs/MOX_V2_BUILD_PLAN.md Phase 2; closes audit Major 16).

Loopback and RFC 1918 private ranges are allowed by default; any other host needs the operator to tick
"I am authorised to probe this host" for the scan, recorded in the audit log. A bare hostname is never
resolved here (that would itself be a quiet DNS lookup) — only a literal IP is trusted as private; a
hostname always needs authorisation, the conservative default.
"""
import ipaddress


def is_private_host(host: str) -> bool:
    """True for `localhost` and for a literal loopback / RFC 1918 (or RFC 4193 IPv6 unique-local) address."""
    if host.lower() == "localhost":
        return True
    try:
        addr = ipaddress.ip_address(host)
    except ValueError:
        return False  # a hostname: not resolved, so not trusted as private
    return addr.is_loopback or addr.is_private


def check(host: str, authorized: bool) -> None:
    """Raise ValueError with a clear reason if `host` is not private and the scan was not authorised."""
    if not is_private_host(host) and not authorized:
        raise ValueError(
            f'{host} is not "localhost" or a literal loopback / private (RFC 1918) address; probing it '
            'needs the "I am authorised to probe this host" checkbox for this scan')
