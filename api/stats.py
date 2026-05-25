"""Aggregated stats for the dashboard."""
import os
import sys
import time
from collections import Counter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify

from _lib.firestore_client import ATTACKS_COLLECTION, get_db

app = Flask(__name__)

MONITORED_ENDPOINTS = ["/decoy/login", "/decoy/admin", "/decoy/api"]
MAX_DOCS_PER_REFRESH = 5000


@app.route("/", defaults={"path": ""}, methods=["GET"])
@app.route("/<path:path>", methods=["GET"])
def handle(path):
    db = get_db()
    if db is None:
        return jsonify({
            "system_status": "degraded",
            "total_attacks": 0,
            "monitored_endpoints": len(MONITORED_ENDPOINTS),
            "unique_ips": 0,
            "last_hour_attacks": 0,
            "distribution": {},
            "timeline_24h": [{"hours_ago": 23 - i, "count": 0} for i in range(24)],
            "top_attackers": [],
            "infrastructure": _infra(False),
            "warning": "Firestore not configured. Set FIREBASE_SERVICE_ACCOUNT_B64 to enable storage."
        }), 200

    now_ms = int(time.time() * 1000)
    since_24h = now_ms - 24 * 3600 * 1000
    since_1h = now_ms - 3600 * 1000

    try:
        docs = list(db.collection(ATTACKS_COLLECTION)
                      .where("timestamp", ">=", since_24h)
                      .order_by("timestamp", direction="DESCENDING")
                      .limit(MAX_DOCS_PER_REFRESH)
                      .stream())
    except Exception as e:
        return jsonify({"error": "firestore read failed", "detail": type(e).__name__}), 500

    total = 0
    last_hour = 0
    ips: Counter = Counter()
    types: Counter = Counter()
    buckets = [0] * 24  # index 0 = 23h ago, index 23 = current hour
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

    return jsonify({
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
    }), 200


def _infra(db_ok: bool):
    return [
        {"name": "Decoy Login API",   "status": "ok"},
        {"name": "Decoy Admin API",   "status": "ok"},
        {"name": "Decoy /api/* API",  "status": "ok"},
        {"name": "Firebase Firestore","status": "ok" if db_ok else "down"},
        {"name": "Dashboard",         "status": "ok"}
    ]
