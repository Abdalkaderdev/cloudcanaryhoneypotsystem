"""Recent attack logs for the dashboard live feed, with in-process caching."""
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request

from _lib.firestore_client import ATTACKS_COLLECTION, get_db

app = Flask(__name__)

CACHE_TTL = 300.0  # 5 minutes
_cache: dict = {"at": 0.0, "limit": 0, "data": None}


@app.route("/", defaults={"path": ""}, methods=["GET"])
@app.route("/<path:path>", methods=["GET"])
def handle(path):
    db = get_db()
    if db is None:
        return jsonify({"logs": []}), 200

    try:
        limit = max(1, min(int(request.args.get("limit", 50)), 200))
    except (TypeError, ValueError):
        limit = 50

    now = time.time()
    if (_cache["data"] is not None
            and _cache["limit"] >= limit
            and now - _cache["at"] < CACHE_TTL):
        return jsonify({"logs": _cache["data"][:limit]}), 200

    try:
        q = (db.collection(ATTACKS_COLLECTION)
               .order_by("timestamp", direction="DESCENDING")
               .limit(limit))
        out = []
        for d in q.stream():
            x = d.to_dict() or {}
            out.append({
                "id": d.id,
                "timestamp": x.get("timestamp"),
                "ip": x.get("ip"),
                "method": x.get("method"),
                "endpoint": x.get("endpoint"),
                "attack_type": x.get("attack_type"),
                "payload_snippet": x.get("payload_snippet", ""),
                "country": x.get("country"),
                "country_code": x.get("country_code"),
                "user_agent": x.get("user_agent", "")
            })
        _cache["at"] = now
        _cache["limit"] = limit
        _cache["data"] = out
        return jsonify({"logs": out}), 200
    except Exception as e:
        name = type(e).__name__
        if _cache["data"] is not None:
            return jsonify({"logs": _cache["data"][:limit], "warning": f"cached ({name})"}), 200
        return jsonify({"logs": [], "warning": f"firestore read failed: {name}"}), 200
