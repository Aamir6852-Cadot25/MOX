from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding

KEY_PATH = "certs/api-gw.key"


def sign(payload: bytes) -> bytes:
    with open(KEY_PATH, "rb") as f:
        key = serialization.load_pem_private_key(f.read(), password=None)
    return key.sign(payload, padding.PKCS1v15(), hashes.SHA256())
