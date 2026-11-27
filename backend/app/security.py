"""Password hashing, login tokens and the FastAPI dependencies that guard admin routes."""
import hashlib
import hmac
import os
import time

import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import settings
from .db import get_db

_bearer = HTTPBearer(auto_error=False)
_ROUNDS = 200_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, _ROUNDS)
    return f"pbkdf2_sha256${_ROUNDS}${salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, rounds, salt, digest = stored.split("$")
        check = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), int(rounds))
        return hmac.compare_digest(check.hex(), digest)
    except (ValueError, AttributeError):
        return False


def make_token(admin_id: str) -> str:
    payload = {"sub": admin_id, "exp": int(time.time()) + settings.token_hours * 3600}
    return jwt.encode(payload, settings.secret_key, algorithm="HS256")


def current_admin(creds: HTTPAuthorizationCredentials = Depends(_bearer)):
    """Any signed-in, active admin. Raises 401 otherwise."""
    if creds is None:
        raise HTTPException(401, "Sign in to continue.")
    try:
        payload = jwt.decode(creds.credentials, settings.secret_key, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(401, "Your session has ended. Sign in again.")
    admin = get_db().admins.find_one({"_id": payload.get("sub")})
    if not admin or not admin.get("active"):
        raise HTTPException(401, "This login is no longer active.")
    return admin


def super_admin(admin=Depends(current_admin)):
    if admin["role"] != "super":
        raise HTTPException(403, "Only the super admin can do this.")
    return admin
