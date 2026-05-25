"""Aggregated stats for the dashboard. Caches results in-process to limit Firestore reads."""
import os
import sys
import time
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify

from _lib.firestore_client import ATTACKS_COLLECTION, get_db

app = Flask(__name__)

MONITORED_ENDPOINTS = ["/decoy/login", "/decoy/admin", "/decoy/api"]
MAX_DOCS_PER_REFRESH = 500
CACHE_TTL = 15.0  # seconds — multiple browser polls reuse this result

_cache: dict = {"at": 0.0, "data": None}


def _infra(db_ok: bool, exhausted: bool = False):
    fb_status = "down" if not db_ok else "warn" if exhausted else "ok"
    return [
        {"name": "Decoy Login API",   "status": "ok"},
        {"name": "Decoy Admin API",   "status": "ok"},
        {"name": "Decoy /api/* API",  "status": "ok"},
        {"name": "Firebase Firestore","status": fb_status},
        {"name": "Dashboard",         "status": "ok"}
    ]


def _empty(warning: str | None = None, status: str = "active", db_ok: bool = True):
    return {
        "system_status": status,
        "total_attacks": 0,
        "monitored_endpoints": len(MONITORED_ENDPOINTS),
        "unique_ips": 0,
        "last_hour_attacks": 0,
        "distribution": {},
        "timeline_24h": [{"hours_ago": 23 - i, "count": 0} for i in range(24)],
        "top_attackers": [],
        "infrastructure": _infra(db_ok, exhausted=(warning is not None)),
        **({"warning": warning} if warning else {})
    }


@app.route("/", defaults={"path": ""}, methods=["GET"])
@app.route("/<path:path>", methods=["GET"])
def handle(path):
    now = time.time()
    if _cache["data"] is not None and now - _cache["at"] < CACHE_TTL:
        return jsonify(_cache["data"]), 200

    db = get_db()
    if db is None:
        return jsonify(_empty(
            "Firestore not configured. Set FIREBASE_SERVICE_ACCOUNT_B64 to enable storage.",
            status="degraded", db_ok=False
        )), 200

    now_ms = int(now * 1000)
    since_24h = now_ms - 24 * 3600 * 1000
    since_1h = now_ms - 3600 * 1000

    try:
        docs = list(db.collection(ATTACKS_COLLECTION)
                      .where("timestamp", ">=", since_24h)
                      .order_by("timestamp", direction="DESCENDING")
                      .limit(MAX_DOCS_PER_REFRESH)
                      .stream())
    except Exception as e:
        name = type(e).__name__
        # Free-tier daily quota or transient rate limit — serve last-known-good if we have it
        if _cache["data"] is not None:
            stale = dict(_cache["data"])
            stale["warning"] = f"Showing cached data (Firestore: {name})"
            return jsonify(stale), 200
        warning = "Firestore quota exhausted. Wait for daily reset or upgrade plan." if "ResourceExhausted" in name else f"Firestore read failed: {name}"
        return jsonify(_empty(warning, status="degraded")), 200

    total = 0
    last_hour = 0
    ips: Counter = Counter()
    types: Counter = Counter()
    buckets = [0] * 24
    last_seen: dict = {}
    countries: dict = {}

    for d in docs:
        x = d.to_dict() or {}
        ts = int(x.get("timestamp", 0))
        ip = x.get("ip", "?")
        total += 1
        if ts >= since_1h:
            last_hour += 1
        ips[ip] += 1
        types[x.get("attack_type", "unknown")] += 1
        hours_ago = int((now_ms - ts) // (3600 * 1000))
        if 0 <= hours_ago < 24:
            buckets[23 - hours_ago] += 1
        if ts > last_seen.get(ip, 0):
            last_seen[ip] = ts
            if x.get("country"):
                countries[ip] = x["country"]

    timeline = [{"hours_ago": 23 - i, "count": buckets[i]} for i in range(24)]
    top = [
        {"ip": ip, "count": c, "country": countries.get(ip), "last": last_seen.get(ip, 0)}
        for ip, c in ips.most_common(10)
    ]

    data = {
        "system_status": "active",
        "total_attacks": total,
        "monitored_endpoints": len(MONITORED_ENDPOINTS),
        "unique_ips": len(ips),
        "last_hour_attacks": last_hour,
        "distribution": dict(types),
        "timeline_24h": timeline,
        "top_attackers": top,
        "infrastructure": _infra(True),
        "truncated": total == MAX_DOCS_PER_REFRESH
    }
    _cache["at"] = now
    _cache["data"] = data
    return jsonify(data), 200
