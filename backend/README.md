# ASHVAMEDHA 2026 — FastAPI + MongoDB Atlas backend

FastAPI backend for the ASHVAMEDHA 2026 website. It stores application data in MongoDB Atlas and keeps the existing API routes and frontend response shapes.

## 1. Set up MongoDB Atlas

1. Create a free MongoDB Atlas cluster and a database user.
2. In Atlas, add your current IP under **Network Access** (for local development). For a hosted API, allow the host's outbound IPs or use the deployment provider's documented networking setup.
3. Choose **Connect → Drivers → Python** and copy the connection URI.
4. URL-encode special characters in the database user's password before adding it to the URI.

## 2. Run locally on Windows

PowerShell commands from the repository root:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
Copy-Item .env.example .env
notepad .env
```

In `backend/.env`, set at least these values (use your own Atlas URI and strong secrets; do not commit `.env`):

```dotenv
MONGODB_URI=mongodb+srv://YOUR_DB_USER:YOUR_URL_ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=ashvamedha2026
SECRET_KEY=put-a-long-random-secret-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=put-a-strong-password-here
CORS_ORIGINS=http://localhost:3000
PUBLIC_BASE_URL=http://localhost:8000
AUTO_SEED=true
SEED_DEMO_MATCHES=false
```

Start the API:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Verify:

- `http://localhost:8000/` — API identity
- `http://localhost:8000/api/health` — should return `{"status":"ok","database":"mongodb"}`
- `http://localhost:8000/docs` — interactive API docs
- `http://localhost:8000/admin` — admin panel

Run the Next.js frontend in a separate terminal with `NEXT_PUBLIC_API_URL=http://localhost:8000` (see root `BACKEND_INTEGRATION.md`).

## 3. First startup and seed data

With `AUTO_SEED=true`, the backend seeds the website content only when the events collection is empty, then syncs the 12 official events from `seed_data/rulebook_events.json`. It also retains the three existing Google-Form-backed esports entries (Valorant, BGMI and Free Fire) from `seed_data/esports_events.json`. Their missing tournament details stay `TBA`; the official rulebook is not used to invent those details. Default site content includes teams, base standings, schedule, gallery, sponsors and content blocks. Sample live matches are disabled unless `SEED_DEMO_MATCHES=true`.

The main admin user is created only when the MongoDB `users` collection is empty. Change the `.env` admin password before first startup. Sport coordinators can be created once with `SPORT_ADMINS=slug:username:password;another-slug:username:password`; after coordinators exist, manage them through the admin UI.

## 4. Roles and API capabilities

- **admin** — events, teams, standings, schedule days, gallery, sponsors, user accounts, registrations, live matches and content blocks.
- **coordinator** — matches and schedule slots for their assigned `eventSlugs`; can view and update registrations for assigned events.
- Public read endpoints need no login.

All existing route paths remain, including `/api/public/bundle`, `/api/events`, `/api/teams`, `/api/schedule`, `/api/leaderboard`, `/api/matches/live`, `/api/results/recent`, `/api/gallery`, `/api/sponsors`, `/api/registrations`, `/api/admin/matches`, `/api/admin/registrations`, and the `/api/admin` CRUD endpoints.

### Registrations

`POST /api/registrations` validates event status and participant limits, checks duplicate active email/team entries, and stores the registration in MongoDB. It returns a code such as `ASV26-K7P2QX`. The current website flow sends entrants to Google Forms; those submissions happen in Google Forms, not this API, unless the frontend flow is changed later. `UPI_ID` and `UPI_PAYEE_NAME` remain available for the existing API/admin use.

### Live scores and standings

The live ticker and recent results read from the `matches` collection. Finished matches affect computed standings when they have a winner, both team slugs, and `countsForStandings: true`. Defaults are 3 points for a win, 1 for a draw, 0 for a loss.

### Gallery/sponsor uploads

`POST /api/admin/uploads` still writes uploaded files into the backend `media/` directory and returns an URL. MongoDB stores gallery/sponsor/image metadata, not the file bytes. For hosted environments with ephemeral disks, move media to Cloudinary or object storage separately.

## 5. One-time SQLite-to-MongoDB import (optional)

If you have an existing `ashvamedha.db` file with real entries you need to preserve, back it up first and copy the file somewhere safe. From the `backend` directory, with `MONGODB_URI` set:

```powershell
python migrate_sqlite_to_mongo.py "C:\path\to\ashvamedha.db"
```

The importer uses the Python standard library for SQLite reading. It skips a target collection if MongoDB already contains documents there, to avoid overwriting live data. Use `--overwrite` only after backing up Atlas and checking which collection data should be updated:

```powershell
python migrate_sqlite_to_mongo.py "C:\path\to\ashvamedha.db" --overwrite
```

This importer preserves collection primary keys and attempts to parse JSON/date fields. After import, start the backend normally; the startup sync canonicalizes the official event slugs. Check registration counts and logins before abandoning the old database file.

## 6. Deploy

Deploy the `backend` directory as a Python web service. Example start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Set `MONGODB_URI`, `MONGODB_DB_NAME`, `SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `CORS_ORIGINS=https://your-frontend-domain`, `PUBLIC_BASE_URL=https://your-api-domain`, and other required environment values in the host dashboard. Set frontend `NEXT_PUBLIC_API_URL=https://your-api-domain` and redeploy the frontend.

## Project layout

```text
app/main.py                   FastAPI app, lifespan, CORS and routers
app/config.py                 MongoDB/security settings from .env
app/database.py               MongoClient, indexes and CRUD helpers
app/models.py                 MongoDB collection key metadata and records
app/schemas.py                Request validation (camelCase)
app/security.py               Password hashing, JWT, roles and rate limits
app/seed.py                   Seeds content and syncs event data
app/services/fest.py          MongoDB serializers, standings, live ticker and bundle
app/routers/                  Public, auth, registrations, matches and content
app/static/admin.html         Control room UI
seed_data/initial.json        Existing website seed content
seed_data/rulebook_events.json Official event facts
seed_data/esports_events.json Existing supplemental esports UI entries
migrate_sqlite_to_mongo.py    Optional one-time data importer
```
