"""Generic decoy API. Captures any sub-path; returns realistic-looking errors."""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request

from _lib.capture import capture

app = Flask(__name__)


@app.route("/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
@app.route("/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
def handle(path):
    full = f"/decoy/api/{path}" if path else "/decoy/api"
    capture(request, full)
    raw_id = request.headers.get("x-request-id", "anon")
    safe_id = re.sub(r"[^A-Za-z0-9._-]", "", raw_id)[:16] or "anon"
    return jsonify({
        "status": "error",
        "message": "Authentication token required",
        "request_id": f"req_{safe_id}"
    }), 401
