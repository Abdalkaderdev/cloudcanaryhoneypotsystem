"""Request capture pipeline: parse, classify, geo-lookup (cached, short-timeout), write."""
import ipaddress
import time
from typing import Dict, Tuple

import requests
from flask import Request

from .classify import classify, snippet
from .firestore_client import ATTACKS_COLLECTION, get_db

_GEO_CACHE: Dict[str, Tuple[float, dict]] = {}
_GEO_TTL = 24 * 60 * 60  # 24h
_GEO_TIMEOUT = 1.0       # short to stay within Vercel function budget


def _client_ip(req: Request) -> str:
    xff = req.headers.get("x-forwarded-for", "")
    if xff:
        return xff.split(",")[0].strip()
    return req.headers.get("x-real-ip") or (req.remote_addr or "0.0.0.0")


def _strip_headers(headers: dict) -> Dict[str, str]:
    """Drop noisy / sensitive headers before storing. Lower-case keys."""
    out: Dict[str, str] = {}
    for k, v in headers.items():
        out[k.lower()] = v
    for noisy in ("cookie", "set-cookie", "authorization", "proxy-authorization"):
        out.pop(noisy, None)
    return out


def _is_private_ip(ip: str) -> bool:
    try:
        addr = ipaddress.ip_address(ip)
    except ValueError:
        return True  # treat un-parseable as local/skip
    return addr.is_private or addr.is_loopback or addr.is_link_local or addr.is_unspecified


def _geo(ip: str) -> dict:
    if _is_private_ip(ip):
        return {"country": "Local", "country_code": "LO", "city": "Local"}
    now = time.time()
    cached = _GEO_CACHE.get(ip)
    if cached and now - cached[0] < _GEO_TTL:
        return cached[1]
    try:
        r = requests.get(
            f"https://ipapi.co/{ip}/json/",
            headers={"User-Agent": "CloudCanaryHoneypot/1.0"},
            timeout=_GEO_TIMEOUT,
        )
        if r.status_code == 200:
            j = r.json()
            data = {
                "country": j.get("country_name"),
                "country_code": j.get("country_code"),
                "city": j.get("city"),
            }
            _GEO_CACHE[ip] = (now, data)
            return data
    except Exception:
        pass
    return {}


def capture(req: Request, endpoint: str) -> dict:
    headers = _strip_headers(dict(req.headers))
    query = {k: v for k, v in req.args.items()}
    try:
        body = req.get_data(as_text=True) if req.method not in ("GET", "HEAD") else ""
    except Exception:
        body = ""

    ip = _client_ip(req)
    attack_type = classify(endpoint, req.method, body, query, headers)

    log = {
        "timestamp": int(time.time() * 1000),
        "ip": ip,
        "method": req.method,
        "endpoint": endpoint,
        "user_agent": headers.get("user-agent", ""),
        "headers": headers,
        "query": query,
        "body": snippet(body, 4000),
        "attack_type": attack_type,
        "payload_snippet": snippet(body or "&".join(f"{k}={v}" for k, v in query.items()), 240),
    }

    g = _geo(ip)
    if g.get("country"):
        log["country"] = g["country"]
    if g.get("country_code"):
        log["country_code"] = g["country_code"]
    if g.get("city"):
        log["city"] = g["city"]

    # Skip writes for platform health-checks and other internal probes — they
    # arrive with no X-Forwarded-For and resolve to 0.0.0.0 / private ranges,
    # and they would otherwise dominate the dashboard with non-attack traffic.
    skip_write = _is_private_ip(ip) or ip in ("", "0.0.0.0")

    db = get_db()
    if db is not None and not skip_write:
        try:
            ref = db.collection(ATTACKS_COLLECTION).add(log)
            log["id"] = ref[1].id
        except Exception as e:
            print(f"firestore write failed: {type(e).__name__}")

    return log
