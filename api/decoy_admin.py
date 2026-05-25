"""Decoy admin: HTML form on GET, captures + denial on POST."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, Response, jsonify, request

from _lib.capture import capture
from _lib.decoy_html import ADMIN_PAGE, render

app = Flask(__name__)


@app.route("/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
@app.route("/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def handle(path):
    capture(request, "/decoy/admin")
    if request.method == "GET":
        return Response(render(ADMIN_PAGE), mimetype="text/html")
    accept = request.headers.get("accept", "")
    if "application/json" in accept or request.is_json:
        return jsonify({
            "error": "Forbidden",
            "code": "ADMIN_403",
            "message": "Administrator privileges required"
        }), 403
    return Response(render(ADMIN_PAGE, "Authentication failed."), mimetype="text/html", status=403)
