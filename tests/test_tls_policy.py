"""Live TLS probe authorisation (Phase 2; closes audit Major 16): loopback/RFC1918 allowed by default,
any other host needs the per-scan authorisation checkbox."""
import pytest

from mox.tls_policy import check, is_private_host


@pytest.mark.parametrize("host", ["127.0.0.1", "localhost", "LOCALHOST", "10.0.0.5", "172.16.0.1",
                                   "192.168.1.1", "::1"])
def test_loopback_and_rfc1918_are_private(host):
    assert is_private_host(host) is True


@pytest.mark.parametrize("host", ["8.8.8.8", "1.1.1.1", "example.com"])
def test_public_hosts_and_hostnames_are_not_private(host):
    assert is_private_host(host) is False


def test_private_host_needs_no_authorisation():
    check("127.0.0.1", authorized=False)  # does not raise


def test_public_host_without_authorisation_is_refused():
    with pytest.raises(ValueError, match="authoris"):
        check("8.8.8.8", authorized=False)


def test_public_host_with_authorisation_is_allowed():
    check("8.8.8.8", authorized=True)  # does not raise


def test_hostname_is_never_resolved_and_needs_authorisation():
    with pytest.raises(ValueError):
        check("example.com", authorized=False)
