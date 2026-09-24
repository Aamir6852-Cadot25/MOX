"""Argon2id passwords, JWT session cookie, audit log (SPEC section 12)."""
import getpass
import os
import secrets
import sys
import time
from datetime import datetime, timezone

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerifyMismatchError

from . import db

_ph = PasswordHasher()  # argon2id by default
COOKIE = "mox_session"
TTL = 8 * 3600
_DUMMY = _ph.hash("mox-dummy-password")  # verified against when the user is unknown (uniform timing)


def secret() -> str:
    env = os.environ.get("MOX_SECRET")
    if env and len(env) >= 32:
        return env
    f = db.data_dir() / "keys" / "secret"
    if not f.exists():
        f.parent.mkdir(parents=True, exist_ok=True)
        f.write_text(secrets.token_hex(32))
    return f.read_text().strip()


def audit(conn, actor: str, action: str, detail: str = ""):
    conn.execute("INSERT INTO audit(ts,actor,action,detail) VALUES(?,?,?,?)",
                 (datetime.now(timezone.utc).isoformat(timespec="seconds"), actor, action, detail))
    conn.commit()


def create_user(conn, username: str, password: str, role: str = "admin"):
    if len(password) < 8:
        raise ValueError("password must be at least 8 characters")
    conn.execute("INSERT INTO users(username,pw_hash,role,created_at) VALUES(?,?,?,?)",
                 (username, _ph.hash(password), role, datetime.now(timezone.utc).isoformat(timespec="seconds")))
    conn.commit()


def check_login(conn, username: str, password: str):
    row = conn.execute("SELECT * FROM users WHERE username=?", (username,)).fetchone()
    try:
        _ph.verify(row["pw_hash"] if row else _DUMMY, password)
    except (VerifyMismatchError, InvalidHashError):
        return None
    return row


def make_token(row) -> str:
    return jwt.encode({"sub": row["username"], "role": row["role"], "exp": int(time.time()) + TTL},
                      secret(), algorithm="HS256")


def read_token(token: str | None):
    if not token:
        return None
    try:
        return jwt.decode(token, secret(), algorithms=["HS256"])
    except jwt.PyJWTError:
        return None


def cli_create_admin(a):
    conn = db.connect()
    username = a.username or input("admin username: ").strip()
    password = a.password or getpass.getpass("password (min 8 chars): ")
    try:
        create_user(conn, username, password, "admin")
    except Exception as e:
        print(f"create-admin failed: {e}", file=sys.stderr)
        return 1
    audit(conn, "cli", "create-admin", username)
    print(f"admin '{username}' created")
