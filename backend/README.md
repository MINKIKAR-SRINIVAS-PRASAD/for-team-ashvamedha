# ASHVAMEDHA 2026 — Backend (FastAPI)

API, database and admin panel for the ASHVAMEDHA 2026 sports-fest website.
Returns data in exactly the shapes the Next.js frontend already uses.

## 1. Run locally (5 minutes)

Requires Python 3.10+.

```bash
cd ashvamedha-backend
python -m venv .venv
# Windows: .venv\Scripts\activate      macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # Windows: copy .env.example .env
# edit .env -> set ADMIN_PASSWORD and SECRET_KEY
uvicorn app.main:app --reload
```

On first start it creates `ashvamedha.db` (SQLite), loads all the content that is
currently in the frontend's `data/*.ts`, and creates the admin user from `.env`.

| URL | What |
| --- | --- |
| http://localhost:8000/admin | Control room: live scores + registrations (phone friendly) |
| http://localhost:8000/docs | Interactive API docs — edit events, teams, gallery, sponsors, users… |
| http://localhost:8000/api/public/bundle | Everything the website renders |

Then run the frontend with `NEXT_PUBLIC_API_URL=http://localhost:8000` (see its `BACKEND_INTEGRATION.md`).

## 2. Roles

- **admin** — everything.
- **coordinator** — only the events listed in their `eventSlugs`: manage those matches,
  change those schedule slots, view/update those registrations.

Create a coordinator: `/docs` → `POST /api/auth/login` → copy `accessToken` → **Authorize** →
`POST /api/admin/users` with
`{"username": "football-coord", "password": "min-8-chars", "role": "coordinator", "eventSlugs": ["football"]}`.

## 3. How things work

**Live scores.** Create a match in `/admin` (or `POST /api/admin/matches`). Press ▶ Start,
use + / − to score, ■ Finish when it's over. The site polls every 15 s.

**Standings.** Leaderboard = base values in the `standings` table + every finished match
that has a winner, both team slugs and `countsForStandings: true`
(win 3 / draw 1 / loss 0, configurable in `.env`). Nothing to recalculate by hand.
The seeded demo matches do *not* count, so they don't change the seeded table.

**Registrations.** `POST /api/registrations` validates team size per event
(`minTeamSize`/`maxTeamSize`, captain included), blocks closed events, duplicate emails
and duplicate team names, and returns a code like `ASV26-K7P2QX`.
Set `UPI_ID` in `.env` to show payment details on the form; entrants can add a UTR number,
and coordinators mark payments verified in `/admin`. Export CSV from `/admin`.

**Content.** Events, teams, schedule, gallery, sponsors, standings:
`POST / PATCH / DELETE /api/admin/<resource>` — PATCH takes only the fields you change,
using the same camelCase names as the frontend. Other sections (champion spotlight,
podium 2025, previous editions, event champions, featured carousel):
`PUT /api/admin/content/{key}`. Images: `POST /api/admin/uploads`, then paste the
returned `url` into an item's `image` / `logo`.

## 4. Before the fest

- Replace the demo content (teams, matches, standings are placeholders from the design).
- Set a strong `SECRET_KEY` and `ADMIN_PASSWORD`.
- Reset everything (⚠ deletes registrations): `python -m app.seed --reset`

## 5. Deploy (example: Render + Neon, both have free tiers)

1. Create a Postgres database on Neon/Supabase; copy its connection string.
2. Push this folder to GitHub → Render → New Web Service.
   Build: `pip install -r requirements.txt` · Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   (or use the Dockerfile).
3. Environment: `DATABASE_URL`, `SECRET_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
   `CORS_ORIGINS=https://your-frontend-domain`, `PUBLIC_BASE_URL=https://your-api-domain`, `UPI_ID`.
4. Set `NEXT_PUBLIC_API_URL=https://your-api-domain` on the frontend and redeploy it.

Uploaded images live in `media/`. On hosts with ephemeral disks (Render free tier) they
disappear on redeploy — use a persistent disk or move uploads to Cloudinary/S3.

## Project layout

```
app/
  main.py            app, CORS, routers, /admin, /media
  config.py          settings from .env
  database.py        SQLAlchemy engine/session
  models.py          tables
  schemas.py         request validation (camelCase)
  security.py        password hashing, JWT, roles, rate limits
  seed.py            loads seed_data/initial.json (exported from the frontend)
  services/fest.py   serializers (frontend shapes), standings, live ticker, bundle
  routers/           public, auth, registrations, matches, content
  static/admin.html  control room UI
seed_data/initial.json
```
