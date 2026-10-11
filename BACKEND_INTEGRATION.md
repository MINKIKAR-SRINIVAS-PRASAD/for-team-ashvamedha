# Backend integration

The Next.js site reads its data from the ASHVAMEDHA FastAPI backend (`backend/`), which now uses MongoDB Atlas for persistence.

## Run
1. Set `MONGODB_URI` and `MONGODB_DB_NAME` in `backend/.env` and start FastAPI on `http://localhost:8000` (see `backend/README.md`).
2. Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_API_URL=http://localhost:8000`.
3. Run `npm install && npm run dev` from the repository root.

If the API is unreachable, the site still falls back to static content in `data/*.ts`.

## Data and endpoints
The API response contract is unchanged: `/api/public/bundle` supplies events, teams, schedule, standings, live scores, gallery, sponsors and content blocks. Public endpoints need no auth; `/api/admin/*` endpoints use the existing bearer-token login. MongoDB stores events, users/admins, registrations, matches, schedules, teams, standings, gallery/sponsor metadata, and editable content blocks. The real images uploaded through `/api/admin/uploads` remain in the backend `media/` directory; use Cloudinary/object storage if deployed media needs to persist across host restarts.
