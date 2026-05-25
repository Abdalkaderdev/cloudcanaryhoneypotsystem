"""Regex-based attack classifier. Pure functions, no I/O. Scans ONLY endpoint, body, and query — NOT headers."""
import re
from typing import Dict

SQL_PATTERNS = [
    re.compile(r"\bunion\s+select\b", re.I),
    re.compile(r"\bselect\s+\S{1,40}\s+from\b", re.I),
    re.compile(r"\bor\s+1\s*=\s*1\b", re.I),
    re.compile(r"'\s*or\s*'1'\s*=\s*'1", re.I),
    re.compile(r";\s*drop\s+table", re.I),
    re.compile(r"\bsleep\s*\(", re.I),
    re.compile(r"\binformation_schema\b", re.I),
    re.compile(r"\bxp_cmdshell\b", re.I),
]

XSS_PATTERNS = [
    re.compile(r"<script[\s>]", re.I),
    re.compile(r"javascript:", re.I),
    re.compile(r"\bon(?:error|load|click|mouseover|focus)\s*=", re.I),
    re.compile(r"<img[^>]{1,200}onerror", re.I),
    re.compile(r"document\.cookie", re.I),
    re.compile(r"\balert\s*\(", re.I),
]

CMD_PATTERNS = [
    re.compile(r";\s*(?:ls|cat|whoami|uname|id|wget|curl|nc|bash|sh)\b", re.I),
    re.compile(r"\|\s*(?:ls|cat|whoami|uname|id|wget|curl|nc|bash|sh)\b", re.I),
    re.compile(r"`[^`\n]{1,200}`"),
    re.compile(r"\$\([^)\n]{1,200}\)"),
]

TRAVERSAL_PATTERNS = [
    re.compile(r"\.\./\.\./"),
    re.compile(r"\.\.\\\.\.\\"),
    re.compile(r"%2e%2e%2f", re.I),
    re.compile(r"/etc/passwd"),
    re.compile(r"/proc/self"),
]

RECON_AGENTS = [
    re.compile(r"nmap", re.I),
    re.compile(r"sqlmap", re.I),
    re.compile(r"nikto", re.I),
    re.compile(r"(?:dir|go)buster", re.I),
    re.compile(r"wpscan", re.I),
    re.compile(r"masscan", re.I),
    re.compile(r"zgrab", re.I),
    re.compile(r"^curl/", re.I),
    re.compile(r"^python-requests", re.I),
    re.compile(r"^go-http-client", re.I),
    re.compile(r"^$"),
]

RECON_QUERY_KEYS = ("id", "user", "admin", "debug", "test")


def classify(endpoint: str, method: str, body: str, query: Dict[str, str], headers: Dict[str, str]) -> str:
    user_agent = headers.get("user-agent", "")
    # IMPORTANT: do NOT include headers in the haystack — that produces false positives
    # when a header value happens to mention a tool name.
    hay = " \n ".join([
        endpoint or "",
        body or "",
        "&".join(f"{k}={v}" for k, v in query.items()),
    ])

    # Order matters: XSS / SQL / CMD / traversal beat brute_force when the payload
    # is shoved into a login form's password field.
    if any(p.search(hay) for p in XSS_PATTERNS):
        return "xss"
    if any(p.search(hay) for p in SQL_PATTERNS):
        return "sql_injection"
    if any(p.search(hay) for p in CMD_PATTERNS):
        return "command_injection"
    if any(p.search(hay) for p in TRAVERSAL_PATTERNS):
        return "path_traversal"

    if method == "POST" and re.search(r"login", endpoint or "", re.I) and re.search(r"password|passwd|pwd", body or "", re.I):
        return "brute_force"

    if body and len(body) > 10000:
        return "malformed_payload"

    if any(p.search(user_agent) for p in RECON_AGENTS):
        return "recon"
    if method == "GET" and any(k.lower() in RECON_QUERY_KEYS for k in query.keys()):
        return "recon"

    return "unknown"


def snippet(s: str, n: int = 240) -> str:
    if not s:
        return ""
    return s if len(s) <= n else s[:n] + "…"
