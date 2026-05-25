# Cloud Canary Honeypot System

A lightweight cloud honeypot that deploys intentionally vulnerable decoy API endpoints, captures every interaction with full request context, classifies the activity (recon, brute-force, SQLi, XSS, command-injection, path-traversal, etc.), and visualises everything on a live dashboard.

Built to accompany the BSc thesis *Cloud Canary Honeypot System* by Lass Nawzad Hameed (UKH, June 2026).

## Architecture

| Layer | Implementation | Thesis match |
|---|---|---|
| Decoy API endpoints | **Python + Flask** serverless functions on Vercel | ✅ matches "Python and Flask" |
| Storage | **Firebase Firestore** via `firebase-admin` Python SDK | ✅ matches thesis |
| Dashboard frontend | **Next.js 14** (React + TypeScript + Tailwind) — "HTML, CSS, JavaScript" | ✅ matches thesis |
| Visualisation | Custom Recharts dashboard | ⚠️ substitute — ELK Stack isn't deployable on Vercel; the dashboard mirrors Kibana's metrics |
| Hosting | Vercel (Next.js + Python serverless in a single project) | ⚠️ substitute — thesis names Firebase Hosting |

The Firestore database, attack classification, capture pipeline, and decoy endpoint behaviour all follow the thesis design.

## Decoy endpoints

| URL | Behaviour |
|---|---|
| `/decoy` | Landing page listing the other decoys (also captures recon visits) |
| `/decoy/login` | Fake admin portal — HTML form on GET, captures POSTs, always returns "invalid credentials" |
| `/decoy/admin` | Fake admin console — HTML form on GET, captures POSTs, always returns "forbidden" |
| `/decoy/api`, `/decoy/api/*` | Generic decoy REST API — always returns "authentication required" |

Every request hitting any of these is captured to Firestore with: IP, headers, method, endpoint, query string, body snippet, user agent, geo info, and classification.

## Dashboard

Lives at `/`. Polls `/api/stats` and `/api/logs` every 6 seconds and shows:

- System status, total attacks, monitored endpoints, unique threat IPs, last-hour activity
- Attack distribution pie chart
- 24-hour attack timeline (UTC)
- Live attack log table
- Infrastructure status
- Top attackers

## Local development

```bash
# Install JS deps for the dashboard
npm install

# Install Python deps for the decoy / API functions
pip install -r requirements.txt

# Run Next.js (dashboard only; the Python functions only run on Vercel)
npm run dev
```

For local-only end-to-end testing of the Python functions, use Vercel CLI:

```bash
npm i -g vercel
vercel dev
```

## Deployment

1. Push this repo to GitHub.
2. Create a new project on Vercel and import the repo.
3. Add the environment variable **`FIREBASE_SERVICE_ACCOUNT_B64`** in Vercel Project Settings → Environment Variables. Value is the base64-encoded JSON of a Firebase service account with Firestore write access:
   ```bash
   base64 -w0 serviceAccount.json
   ```
   (Or set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` individually.)
4. Deploy. Vercel auto-detects Next.js and the `@vercel/python` runtime from `vercel.json`.

## Firestore schema

Single collection: `attack_logs`. Each document:

```json
{
  "timestamp": 1716636000000,
  "ip": "203.0.113.42",
  "method": "POST",
  "endpoint": "/decoy/login",
  "user_agent": "sqlmap/1.7.6",
  "headers": { "...": "..." },
  "query": { "...": "..." },
  "body": "username=admin&password=' OR 1=1--",
  "attack_type": "sql_injection",
  "payload_snippet": "username=admin&password=' OR 1=1--",
  "country": "Netherlands",
  "country_code": "NL",
  "city": "Amsterdam"
}
```

**Firestore rules** (deny-all client access) are shipped in `firestore.rules` and configured via `firebase.json`. The server-side Admin SDK used by the Python functions bypasses these rules. To deploy them:

```bash
# Once, install the Firebase CLI
npm install -g firebase-tools
firebase login

# Deploy rules only (does not touch your data or other Firebase resources)
firebase deploy --only firestore:rules --project YOUR_PROJECT_ID
```

The dashboard reads via `/api/stats` and `/api/logs`, which run server-side. The browser never talks to Firestore directly.

## Ethics & legal

This honeypot is intentionally vulnerable on the **decoy paths only** and is deployed in an environment isolated from any production system. No real user data is involved. Captured payloads are stored only in the project's Firestore instance and are not redistributed. See thesis Chapter 6, "Ethics and Legal Considerations".

## Seeding mock data (for screenshots / demo)

After the env var is configured, you can populate Firestore with realistic mock attacks:

```bash
pip install firebase-admin
set FIREBASE_SERVICE_ACCOUNT_B64=<your_base64>     # Windows
python scripts/seed.py                              # 120 events spread across 24h
python scripts/seed.py --count 300                  # more
python scripts/seed.py --wipe                       # clear existing first
```

The mock IPs use RFC 5737 documentation ranges so they don't point at any real organisation.

## License

MIT
