"""Lazy Firestore client. firebase-admin is imported only on first DB use to keep cold starts fast."""
import base64
import json
import os
import threading
from typing import Optional

ATTACKS_COLLECTION = "attack_logs"

_db = None
_init_lock = threading.Lock()


def _load_service_account_info() -> Optional[dict]:
    b64 = os.environ.get("FIREBASE_SERVICE_ACCOUNT_B64")
    if b64:
        try:
            return json.loads(base64.b64decode(b64).decode("utf-8"))
        except Exception:
            return None
    project_id = os.environ.get("FIREBASE_PROJECT_ID")
    client_email = os.environ.get("FIREBASE_CLIENT_EMAIL")
    private_key = os.environ.get("FIREBASE_PRIVATE_KEY")
    if project_id and client_email and private_key:
        return {
            "type": "service_account",
            "project_id": project_id,
            "client_email": client_email,
            "private_key": private_key.replace("\\n", "\n"),
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    return None


def get_db():
    """Return a Firestore client, or None if no credentials are configured."""
    global _db
    if _db is not None:
        return _db
    with _init_lock:
        if _db is not None:
            return _db
        info = _load_service_account_info()
        if info is None:
            return None
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            try:
                firebase_admin.initialize_app(credentials.Certificate(info))
            except ValueError:
                # already initialised in this process — fine
                pass
            _db = firestore.client()
        except Exception as e:
            print(f"firestore init failed: {type(e).__name__}")
            return None
    return _db
