# Registration Portal Closed

This package has public registration disabled.

- Frontend: `data/site.ts` exports `REGISTRATION_OPEN = false`; visible registration actions are disabled and the `/register` page shows a closed message.
- Event cards/details show closed status and open-entry count is zero.
- Backend: `backend/app/config.py` defaults `REGISTRATIONS_OPEN` to false. The public `POST /api/registrations` endpoint returns HTTP 409 while closed. Admin routes for viewing/managing existing records are not disabled.

## Reopening later

Only reopen after organiser approval: set `REGISTRATION_OPEN = true` in `data/site.ts`, set `REGISTRATIONS_OPEN=true` in the backend environment, then redeploy/restart both frontend and backend.

## Important: Google Forms

The website no longer links users into Google Forms. However, these Google Forms are external services. If a person already has a direct form URL, the form owner must open each Google Form and turn off **Accepting responses** to stop responses through direct links too.
