"""HTML responses for decoy pages — kept deliberately plain to mimic a small, vulnerable web app."""

LOGIN_PAGE = """<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Portal Login</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;margin:0;padding:40px}
  .box{background:#fff;max-width:380px;margin:60px auto;padding:32px;border:1px solid #ddd;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
  h1{font-size:20px;margin:0 0 4px;color:#333}
  p.sub{font-size:12px;color:#888;margin:0 0 24px}
  label{display:block;font-size:13px;color:#444;margin:12px 0 4px}
  input{width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #ccc;border-radius:4px;font-size:14px}
  button{margin-top:18px;width:100%;padding:10px;background:#2563eb;color:#fff;border:0;border-radius:4px;font-size:14px;cursor:pointer}
  .err{color:#b91c1c;font-size:12px;margin-top:12px;__err__}
  .foot{color:#999;font-size:11px;text-align:center;margin-top:18px}
</style></head><body>
<div class="box">
  <h1>Admin Portal</h1>
  <p class="sub">Internal access only · v2.4.1</p>
  <form method="post" action="/decoy/login" autocomplete="off">
    <label>Username</label>
    <input name="username" type="text" required>
    <label>Password</label>
    <input name="password" type="password" required>
    <button type="submit">Sign in</button>
    <div class="err">__err_text__</div>
  </form>
  <div class="foot">© Internal Services · Build 24.05.18</div>
</div>
</body></html>
"""

ADMIN_PAGE = """<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin Console</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;background:#1a1d23;color:#e5e7eb;margin:0;padding:0}
  header{background:#0f1115;padding:14px 24px;border-bottom:1px solid #2a2f37}
  h1{margin:0;font-size:16px;color:#9ca3af;font-weight:500}
  .auth{max-width:380px;margin:80px auto;background:#0f1115;padding:32px;border:1px solid #2a2f37;border-radius:6px}
  label{display:block;font-size:12px;color:#9ca3af;margin:10px 0 4px}
  input{width:100%;box-sizing:border-box;padding:8px 10px;background:#1a1d23;color:#fff;border:1px solid #2a2f37;border-radius:4px;font-size:14px}
  button{margin-top:18px;width:100%;padding:10px;background:#dc2626;color:#fff;border:0;border-radius:4px;font-size:14px;cursor:pointer}
  .err{color:#f87171;font-size:12px;margin-top:12px;__err__}
</style></head><body>
<header><h1>Admin Console · Restricted</h1></header>
<form class="auth" method="post" action="/decoy/admin" autocomplete="off">
  <label>Admin username</label>
  <input name="username" type="text" required>
  <label>Admin password</label>
  <input name="password" type="password" required>
  <button type="submit">Authenticate</button>
  <div class="err">__err_text__</div>
</form>
</body></html>
"""

INDEX_PAGE = """<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><title>Internal Services</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;background:#f5f5f5;margin:0;padding:48px;color:#333}
  .container{max-width:520px;margin:0 auto;background:#fff;padding:32px;border:1px solid #ddd;border-radius:6px}
  ul{padding-left:18px}a{color:#2563eb}
</style></head><body>
<div class="container">
  <h2>Internal Services</h2>
  <p>Available endpoints:</p>
  <ul>
    <li><a href="/decoy/login">/decoy/login</a> — Admin portal</li>
    <li><a href="/decoy/admin">/decoy/admin</a> — Admin console</li>
    <li><code>/decoy/api/*</code> — Internal API</li>
  </ul>
  <p style="color:#888;font-size:12px;margin-top:32px">For authorised personnel only.</p>
</div>
</body></html>
"""


def render(template: str, error: str = "") -> str:
    if error:
        return template.replace("__err__", "").replace("__err_text__", error)
    return template.replace("__err__", "display:none").replace("__err_text__", "")
