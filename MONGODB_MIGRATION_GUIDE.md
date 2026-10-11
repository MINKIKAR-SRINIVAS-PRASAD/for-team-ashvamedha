# ASHVAMEDHA 2026 — MongoDB Atlas migration guide (Windows)

This build converts the FastAPI backend from SQLAlchemy/SQLite to PyMongo/MongoDB Atlas while keeping the existing API route paths and frontend response formats.

## A. Back up your current project

1. Make a copy of your current project folder before replacing anything.
2. Extract this ZIP to a new folder for testing first. Do not put Atlas credentials into source files or commit your `.env` file.

## B. Create an Atlas database

1. Sign in to MongoDB Atlas and create a cluster.
2. Create a **Database User** with a strong password.
3. Under **Network Access**, add your current IP for local development.
4. Choose **Connect → Drivers → Python** and copy the connection string.
5. If the database password contains characters such as `@`, `:`, `/`, `?`, `#`, or `%`, URL-encode those characters before using the URI.

## C. Configure the backend

Open PowerShell in the extracted project folder and run:

```powershell
cd backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
Copy-Item .env.example .env
notepad .env
```

In `backend/.env`, replace the placeholders. Example format only — do not copy these placeholder credentials literally:

```dotenv
MONGODB_URI=mongodb+srv://YOUR_DB_USER:YOUR_URL_ENCODED_PASSWORD@YOUR_CLUSTER.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=ashvamedha2026
SECRET_KEY=REPLACE_WITH_A_LONG_RANDOM_SECRET
ADMIN_USERNAME=admin
ADMIN_PASSWORD=REPLACE_WITH_A_STRONG_UNIQUE_PASSWORD
CORS_ORIGINS=http://localhost:3000
PUBLIC_BASE_URL=http://localhost:8000
AUTO_SEED=true
SEED_DEMO_MATCHES=false
```

Save `.env`. It is ignored by Git.

## D. Start and verify FastAPI

Keep the PowerShell terminal open in the `backend` folder and run:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On first start with an empty Atlas database, the app creates indexes, seeds the current site content, creates the first admin account, and syncs 12 official rulebook events plus the existing Valorant/BGMI/Free Fire entries whose unconfirmed details stay `TBA`.

Open these in your browser:

- `http://localhost:8000/api/health` — should return `{"status":"ok","database":"mongodb"}`.
- `http://localhost:8000/docs` — FastAPI interactive API documentation.
- `http://localhost:8000/api/public/bundle` — the complete website-data response.
- `http://localhost:8000/admin` — the existing admin dashboard.

If startup reports a MongoDB server-selection/timeout error, check the URI, database username/password, Atlas Network Access IP allowlist, and internet connection. Never paste your actual URI/password into a public chat or GitHub issue.

## E. Connect the Next.js frontend

In the project root, create or edit `.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000
API_URL=http://localhost:8000
```

Open a second terminal in the repository root and run:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000`. The frontend has a static-data fallback if the API isn't reachable, so confirm `/api/health` and `/api/public/bundle` before assuming frontend content is being served from MongoDB.

## F. What data is in MongoDB?

The backend stores events, user/admin accounts, registrations made through the API, schedule days and slots, matches/live scores, teams, base standings, gallery metadata, sponsor metadata, and editable content blocks. Collections are created as needed. Uploaded image files are still saved to `backend/media/`; only their metadata/URLs are in MongoDB. For cloud hosting, persist `media/` or move file uploads to Cloudinary/object storage.

**Current website registration flow:** the registration page opens event-specific Google Forms. Those submissions are stored by Google Forms, not in MongoDB. The FastAPI `POST /api/registrations` endpoint remains available for registrations sent directly to the backend, and stores those submissions in MongoDB.

## G. Import an existing SQLite database (only if you have one)

The uploaded project ZIP does not contain a live `ashvamedha.db` file. A fresh Atlas database is seeded from the bundled JSON content. If you have a separate SQLite database with registrations/users/matches you need to preserve, back it up and import it **before using the new Atlas data for real operations**.

From the `backend` directory, with `.env` configured:

```powershell
python migrate_sqlite_to_mongo.py "C:\full\path\to\ashvamedha.db"
```

The importer skips any target MongoDB collection that already has documents, to avoid overwriting. Use `--overwrite` only after backing up Atlas and verifying the target collection contents:

```powershell
python migrate_sqlite_to_mongo.py "C:\full\path\to\ashvamedha.db" --overwrite
```

The importer uses Python's built-in SQLite reader and preserves integer/string IDs, JSON columns and timestamps where possible. Verify login, registration counts, match scores, schedule and gallery before decommissioning your old database file. Do not use the app's `--reset` option on production data.

## H. Deploy later

For deployment, set these environment variables in the backend host's dashboard: `MONGODB_URI`, `MONGODB_DB_NAME`, `SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `CORS_ORIGINS`, and `PUBLIC_BASE_URL`. Deploy the backend first; then set the frontend's `NEXT_PUBLIC_API_URL` to the public backend URL. Never use a MongoDB URI or admin password prefixed with `NEXT_PUBLIC_`.


## Registration portal closure

The public frontend registration portal is currently closed by `REGISTRATION_OPEN = false` in `data/site.ts`. This disables the registration buttons and Google Form launch flow across the website. The FastAPI `POST /api/registrations` endpoint is also closed by default with `REGISTRATIONS_OPEN=false` in `backend/.env` (the same default is used if this variable is omitted). To reopen, the organisers must deliberately set both switches to `true`, redeploy/restart, and verify the official status first.

Important: the frontend previously linked to separately hosted Google Forms. Code changes on this website cannot turn off response collection inside Google Forms themselves. If anyone still has a direct Google Form URL, the form owner must independently turn off “Accepting responses” in each form to fully stop submissions through those external links.
