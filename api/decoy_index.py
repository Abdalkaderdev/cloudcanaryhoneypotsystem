"""Decoy landing page at /decoy — captures recon visits."""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, Response, request

from _lib.capture import capture
from _lib.decoy_html import INDEX_PAGE, render

app = Flask(__name__)


@app.route("/", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
@app.route("/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
def handle(path):
    capture(request, "/decoy")
    return Response(render(INDEX_PAGE), mimetype="text/html")
