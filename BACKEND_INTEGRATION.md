# Backend integration

The site now reads its data from the ASHVAMEDHA FastAPI backend (`ashvamedha-backend`).

## Run
1. Start the backend (see its README) on http://localhost:8000
2. `cp .env.local.example .env.local`
3. `npm install && npm run dev`

If the backend is not reachable, the site automatically falls back to the static
content in `data/*.ts`, so it never breaks.

## What changed
| File | Change |
| --- | --- |
| `lib/festData.ts` (new) | Fetches `/api/public/bundle` (cached 15 s), static fallback |
| `components/FestDataProvider.tsx` (new) | Shares the data with client components, refreshes every 60 s |
| `app/register/page.tsx`, `components/RegistrationForm.tsx` (new) | Registration form → `POST /api/registrations` |
| `app/layout.tsx` | Fetches data once and wraps the app in the provider |
| `lib/hooks/useLiveFeed.ts` | Polls `/api/matches/live` every 15 s |
| `data/site.ts` | `registrationUrl` → `/register` |
| `app/events/[slug]/page.tsx` | Register button → `/register?event=<slug>`; new events render on demand |
| Pages & components using `data/*` | Import swapped for `getFestData()` (server) or `useFestData()` (client) |
| `next.config.mjs` | Allows images served by a local backend (`http://localhost`) |

Design, layout and animations are untouched. `data/*.ts` is still used for types,
static labels, and as the offline fallback.
