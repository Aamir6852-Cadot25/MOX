from mox import nist


def test_rsa_3072_after_2030_is_approved():
    r = nist.lookup("RSA", 3072)
    assert (r["now"], r["after_2030"], r["after_2035"]) == ("approved", "approved", "disallowed")
    assert r["quantum_vulnerable"] is True


def test_rsa_size_boundaries_from_json():
    assert nist.lookup("RSA", 1024)["now"] == "disallowed"
    r = nist.lookup("RSA", 2048)
    assert (r["now"], r["after_2030"]) == ("approved", "deprecated")


def test_missing_entry_is_unknown_not_guessed():
    r = nist.lookup("FrobnicatorX", 512)
    assert r["now"] == "unknown" and r["quantum_vulnerable"] is None and "FrobnicatorX" in r["notes"]
    assert nist.lookup("RSA")["now"] == "unknown"  # size missing -> no guess
    assert nist.lookup("ECDSA", curve="P-999")["now"] == "unknown"


def test_curve_alias_mode_hybrid_and_protocols():
    assert nist.lookup("ECDSA", curve="secp256r1")["after_2030"] == "approved"
    assert nist.lookup("AES", mode="ECB")["after_2030"] == "disallowed"
    assert nist.lookup("AES", 256)["now"] == "approved"
    hy = nist.lookup("X25519MLKEM768")
    assert hy["now"] == "hybrid" and hy["quantum_vulnerable"] is False
    assert nist.lookup("TLSv1")["now"] == "disallowed"
    assert nist.lookup("sha1")["now"] == "deprecated"
    assert nist.lookup("DESede")["now"] == "disallowed"
