"""Seed Firestore with realistic mock attack logs for demo / screenshots.

Usage (from repo root):
    pip install firebase-admin
    set FIREBASE_SERVICE_ACCOUNT_B64=<your_base64_value>   # Windows
    export FIREBASE_SERVICE_ACCOUNT_B64=<your_base64_value> # macOS/Linux
    python scripts/seed.py                  # add ~120 events spread over 24h
    python scripts/seed.py --count 300      # custom count
    python scripts/seed.py --wipe           # delete existing logs first

Pulls the same credentials the deployed app uses, so no extra setup required
once Vercel is configured.
"""
import argparse
import os
import random
import sys
import time

THIS = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(THIS, "..", "api"))

from _lib.firestore_client import ATTACKS_COLLECTION, get_db  # noqa: E402


# Real-world-ish attacker IPs (RFC 5737 + documentation ranges) so we don't
# point at any real organisation.
IPS = [
    ("203.0.113.42", "Netherlands", "NL", "Amsterdam"),
    ("198.51.100.7", "Russia",      "RU", "Moscow"),
    ("203.0.113.91", "China",       "CN", "Shanghai"),
    ("198.51.100.244","Brazil",     "BR", "São Paulo"),
    ("203.0.113.18", "Vietnam",     "VN", "Hanoi"),
    ("198.51.100.55","Germany",     "DE", "Frankfurt"),
    ("203.0.113.207","United States","US","Ashburn"),
    ("198.51.100.130","India",      "IN", "Mumbai"),
    ("203.0.113.66", "Turkey",      "TR", "Istanbul"),
    ("198.51.100.99","Iran",        "IR", "Tehran"),
    ("203.0.113.155","Romania",     "RO", "Bucharest"),
    ("198.51.100.18","Singapore",   "SG", "Singapore"),
]

# (endpoint, method, body, query, attack_type, payload_snippet, ua)
SAMPLES = [
    ("/decoy/login", "POST",
     "username=admin&password='+OR+'1'='1",
     {}, "sql_injection",
     "username=admin&password=' OR '1'='1",
     "sqlmap/1.7.6#stable (https://sqlmap.org)"),
    ("/decoy/login", "POST",
     "username=admin&password=admin",
     {}, "brute_force",
     "username=admin&password=admin",
     "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"),
    ("/decoy/login", "POST",
     "username=root&password=root123",
     {}, "brute_force",
     "username=root&password=root123",
     "python-requests/2.32.0"),
    ("/decoy/login", "POST",
     'username=<script>alert(1)</script>&password=x',
     {}, "xss",
     'username=<script>alert(1)</script>&password=x',
     "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"),
    ("/decoy/admin", "GET",
     "",
     {"id": "1' UNION SELECT 1,2,3--"}, "sql_injection",
     "id=1' UNION SELECT 1,2,3--",
     "Mozilla/5.0 (compatible; sqlmap/1.7.6)"),
    ("/decoy/api/users", "GET",
     "",
     {"q": "../../etc/passwd"}, "path_traversal",
     "q=../../etc/passwd",
     "curl/8.5.0"),
    ("/decoy/api/exec", "POST",
     "cmd=; cat /etc/passwd",
     {}, "command_injection",
     "cmd=; cat /etc/passwd",
     "Go-http-client/1.1"),
    ("/decoy", "GET",
     "",
     {}, "recon",
     "",
     "Nmap Scripting Engine"),
    ("/decoy/api/.env", "GET",
     "",
     {}, "recon",
     "",
     "gobuster/3.6"),
    ("/decoy/api/config", "GET",
     "",
     {}, "recon",
     "",
     "Nikto/2.5.0"),
    ("/decoy/login", "POST",
     "username=admin&password=" + "A" * 12000,
     {}, "malformed_payload",
     "username=admin&password=AAAAAAAAAAAA…",
     "python-requests/2.31.0"),
    ("/decoy/api/search", "GET",
     "",
     {"q": "<img src=x onerror=alert(1)>"}, "xss",
     "q=<img src=x onerror=alert(1)>",
     "Mozilla/5.0 (compatible; Baiduspider/2.0)"),
    ("/decoy/admin", "POST",
     "user=admin'; DROP TABLE users; --&pass=x",
     {}, "sql_injection",
     "user=admin'; DROP TABLE users; --&pass=x",
     "sqlmap/1.7.6"),
    ("/decoy/login", "POST",
     "username=test&password=test",
     {}, "brute_force",
     "username=test&password=test",
     "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"),
    ("/decoy/api/upload", "POST",
     "file=`whoami`",
     {}, "command_injection",
     "file=`whoami`",
     "curl/8.4.0"),
]


def make_event(now_ms: int):
    ip, country, cc, city = random.choice(IPS)
    sample = random.choice(SAMPLES)
    endpoint, method, body, query, attack_type, snippet, ua = sample
    # spread timestamps across the past 24h, weighted slightly to the more recent hours
    hours_ago = min(23.9, abs(random.gauss(4, 6)))
    ts = now_ms - int(hours_ago * 3600 * 1000) - random.randint(0, 59_999)
    return {
        "timestamp": ts,
        "ip": ip,
        "method": method,
        "endpoint": endpoint,
        "user_agent": ua,
        "headers": {
            "user-agent": ua,
            "accept": "*/*",
            "host": "cloudcanaryhoneypotsystem.vercel.app",
        },
        "query": query,
        "body": body,
        "attack_type": attack_type,
        "payload_snippet": snippet,
        "country": country,
        "country_code": cc,
        "city": city,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--count", type=int, default=120)
    parser.add_argument("--wipe",  action="store_true")
    args = parser.parse_args()

    db = get_db()
    if db is None:
        sys.exit("ERROR: Firestore not configured. Set FIREBASE_SERVICE_ACCOUNT_B64.")

    col = db.collection(ATTACKS_COLLECTION)

    if args.wipe:
        print("Wiping existing attack_logs...")
        deleted = 0
        for doc in col.stream():
            doc.reference.delete()
            deleted += 1
        print(f"Deleted {deleted} documents.")

    now_ms = int(time.time() * 1000)
    print(f"Seeding {args.count} mock events...")
    batch = db.batch()
    for i in range(args.count):
        event = make_event(now_ms)
        ref = col.document()
        batch.set(ref, event)
        if (i + 1) % 400 == 0:
            batch.commit()
            batch = db.batch()
            print(f"  committed {i + 1}/{args.count}")
    batch.commit()
    print(f"Done. Seeded {args.count} events.")


if __name__ == "__main__":
    main()
