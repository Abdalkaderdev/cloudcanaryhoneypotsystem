"""Decoy login: HTML form on GET, captures + 'invalid credentials' on POST."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, Response, jsonify, request

from _lib.capture import capture
from _lib.decoy_html import LOGIN_PAGE, render

app = Flask(__name__)


@app.route("/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
@app.route("/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def handle(path):
    capture(request, "/decoy/login")
    if request.method == "GET":
        return Response(render(LOGIN_PAGE), mimetype="text/html")
    accept = request.headers.get("accept", "")
    if "application/json" in accept or request.is_json:
        return jsonify({
            "success": False,
            "error": "Invalid username or password",
            "code": "AUTH_001"
        }), 401
    return Response(render(LOGIN_PAGE, "Invalid username or password."), mimetype="text/html", status=401)
