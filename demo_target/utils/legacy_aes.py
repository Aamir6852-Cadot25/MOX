from Crypto.Cipher import AES


def encrypt_blob(key: bytes, blob: bytes) -> bytes:
    cipher = AES.new(key, AES.MODE_ECB)
    return cipher.encrypt(blob)
