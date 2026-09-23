import hashlib
import json
import threading

from cryptography import x509
from cryptography.hazmat.primitives import serialization as ser

from mox import db, demo_tls, scanner

from conftest import scan_files


def by(rows, **kw):
    return [r for r in rows if all(r[k] == v for k, v in kw.items())]


def test_rsa_1024_vs_4096_on_separate_lines(tmp_path):
    src = ("from cryptography.hazmat.primitives.asymmetric import rsa\n"
           "weak = rsa.generate_private_key(public_exponent=65537, key_size=1024)\n"
           "strong = rsa.generate_private_key(65537, 4096)\n")
    rows = by(scan_files(tmp_path, {"keys.py": src}), algorithm="RSA")
    assert {(r["line"], r["key_size"]) for r in rows} == {(2, 1024), (3, 4096)}
    assert by(rows, key_size=1024)[0]["nist_now"] == "disallowed"
    assert by(rows, key_size=4096)[0]["nist_now"] == "approved"


def test_java_key_size_from_initialize_line(tmp_path):
    src = ('KeyPairGenerator a = KeyPairGenerator.getInstance("RSA");\n'
           "a.initialize(1024);\n"
           'KeyPairGenerator b = KeyPairGenerator.getInstance("RSA"); b.initialize(4096);\n')
    rows = scan_files(tmp_path, {"K.java": src})
    assert {(r["line"], r["key_size"]) for r in rows if r["algorithm"] == "RSA"} == {(2, 1024), (3, 4096)}


def test_dedupe_same_file_line_algorithm(tmp_path):
    # md5-py and md5-generic both match this line -> exactly one finding
    rows = by(scan_files(tmp_path, {"a.py": "digest = hashlib.md5(data).hexdigest()\n"}), algorithm="MD5")
    assert len(rows) == 1


def test_import_and_comment_lines_skipped(tmp_path):
    src = ("import hashlib.md5\n"
           "from Crypto.Cipher import DES\n"
           "# hashlib.md5(x) is banned\n"
           "x = 1  # hashlib.sha1 was here\n")
    java = ('import javax.crypto.Cipher; // DESede\n'
            '// MessageDigest.getInstance("MD5")\n'
            ' * uses RC4 and DES\n')
    rows = scan_files(tmp_path, {"a.py": src, "B.java": java})
    assert rows == []


def test_detects_aes_ecb_and_3des_des_cbc3(tmp_path):
    files = {
        "ecb.py": "cipher = AES.new(key, AES.MODE_ECB)\n",
        "T.java": 'Cipher a = Cipher.getInstance("DESede/CBC/PKCS5Padding");\n'
                  'Cipher b = Cipher.getInstance("AES/ECB/PKCS5Padding");\n'
                  'Cipher c = Cipher.getInstance("DES/CBC/PKCS5Padding");\n',
        "nginx.conf": "ssl_ciphers HIGH:DES-CBC3-SHA;\n",
    }
    rows = scan_files(tmp_path, files)
    ecb = by(rows, algorithm="AES", mode="ECB")
    assert {r["file"] for r in ecb} == {"ecb.py", "T.java"}
    assert ecb[0]["nist_now"] == "deprecated" and ecb[0]["nist_2030"] == "disallowed"
    des3 = by(rows, algorithm="3DES")
    assert {r["file"] for r in des3} == {"T.java", "nginx.conf"}
    assert by(rows, algorithm="DES", file="T.java")[0]["mode"] == "CBC"
    assert all(r["nist_now"] == "disallowed" for r in des3)


def test_certs_plane_spki_sha256_and_no_private_key_in_db(demo_dir, scan_demo):
    _, rows = scan_demo
    cert = x509.load_pem_x509_certificate((demo_dir / "certs" / "api-gw.crt").read_bytes())
    spki = cert.public_key().public_bytes(ser.Encoding.DER, ser.PublicFormat.SubjectPublicKeyInfo)
    want = hashlib.sha256(spki).hexdigest()
    same = [r for r in rows if r["fingerprint"] == want]
    # cert, private key file, same key inside the .p12, cert copy in the container layer
    assert {r["file"] for r in same} == {"certs/api-gw.crt", "certs/api-gw.key", "keystore/app.p12",
                                         "image/app-image.tar!/app/certs/api-gw.crt"}
    assert all(r["confidence"] == "high" for r in same)
    key = by(rows, file="certs/api-gw.key")[0]
    assert json.loads(key["meta"])["kind"] == "private_key"
    raw = db.db_path().read_bytes()
    assert b"PRIVATE KEY" not in raw
    key_der = ser.load_pem_private_key((demo_dir / "certs" / "api-gw.key").read_bytes(), None).private_bytes(
        ser.Encoding.DER, ser.PrivateFormat.PKCS8, ser.NoEncryption())
    assert key_der[40:80] not in raw


def test_certs_plane_facts(scan_demo):
    _, rows = scan_demo
    legacy = by(rows, file="certs/legacy-portal.crt", algorithm="RSA")[0]
    assert legacy["key_size"] == 1024 and json.loads(legacy["meta"])["expired"] is True
    assert by(rows, file="certs/internal-ca.crt")[0]["key_size"] == 4096
    ec = by(rows, file="certs/ecdsa-p256.crt")[0]
    assert (ec["algorithm"], ec["curve"]) == ("ECDSA", "P-256")


def test_containers_plane_tagged(scan_demo):
    _, rows = scan_demo
    inner = [r for r in rows if "app-image.tar!" in r["file"]]
    assert inner and all(r["plane"] == "containers" for r in inner)
    assert json.loads(inner[0]["meta"])["origin_plane"] == "certificates"
    assert any(r["plane"] == "containers" and r["file"] == "Dockerfile" for r in rows)


def test_all_seven_planes_with_probe(demo_dir):
    server = demo_tls.make_server(demo_dir / "certs" / "api-gw.crt", demo_dir / "certs" / "api-gw.key",
                                  port=0)
    port = server.getsockname()[1]
    threading.Thread(target=demo_tls.serve_forever, args=(server,), daemon=True).start()
    try:
        s = scanner.scan(demo_dir, probe=f"127.0.0.1:{port}")
    finally:
        server.close()
    assert s["probe_error"] is None
    assert set(s["planes"]) == {"code", "dependencies", "configs", "certificates", "binaries", "containers", "tls"}
    conn = db.connect()
    tls = [dict(r) for r in conn.execute("SELECT * FROM findings WHERE plane='tls'")]
    gw = [r for r in conn.execute("SELECT fingerprint FROM findings WHERE file='certs/api-gw.crt'")][0][0]
    assert tls[0]["fingerprint"] == gw and tls[0]["confidence"] == "high"


def test_low_confidence_flagged_verify_first(scan_demo):
    _, rows = scan_demo
    low = [r for r in rows if r["confidence"] == "low"]
    assert {r["plane"] for r in low} >= {"dependencies", "binaries"}
    assert all(r["verify_first"] == 1 for r in low)
    assert all(r["verify_first"] == 0 for r in rows if r["confidence"] != "low")


def test_demo_findings_present(scan_demo):
    _, rows = scan_demo
    assert by(rows, file="conf/nginx-edge.conf", algorithm="X25519MLKEM768")[0]["nist_now"] == "hybrid"
    assert {r["algorithm"] for r in by(rows, file="conf/nginx.conf")} >= {"TLSv1", "TLSv1.1", "3DES"}
    assert by(rows, file="infra/kms.tf")[0]["key_size"] == 2048
    assert by(rows, file="services/ecdsa.go")[0]["curve"] == "P-256"
    assert any(r["algorithm"].startswith("OpenSSL 1.1.1") for r in by(rows, plane="binaries"))
