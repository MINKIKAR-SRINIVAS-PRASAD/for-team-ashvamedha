# ASHVAMEDHA 2026 — Cinematic Sports-Fest Frontend

Premium, dark, futuristic sports-fest website for **ASHVAMEDHA 2026 · IIT Bhubaneswar**.
Creative direction: *a cinematic superhero-scale sports battle* — dimensional fractures,
metallic artefacts, red energy warning UI and championship gold, built entirely from
original artwork (no third-party or licensed assets).

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (verified passing)
npm start        # serve the production build
```

Node 18.18+ (Node 20 recommended).

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| UI | React 19 + TypeScript (strict) |
| Styling | Tailwind CSS 3 with a CSS-variable token layer |
| Motion | Framer Motion (layout, whileInView, springs) + CSS keyframes |
| Icons | Lucide React |
| GSAP | installed and available for timeline work |

---

## Project structure

```
app/
  layout.tsx            Root shell: loader, background, cursor, navbar, footer, transitions
  page.tsx              Home — the full cinematic journey (thin table of contents)
  globals.css           Design tokens, keyframes, component classes
  icon.svg              Favicon
  not-found.tsx         404 ("SIGNAL_LOST")
  events/page.tsx       All battlegrounds (carousel + filterable grid)
  events/[slug]/page.tsx Per-event protocol page (statically generated)
  schedule/page.tsx     3-day timeline
  leaderboard/page.tsx  Championship table + champion spotlight
  gallery/page.tsx      Cinematic masonry archive
  teams/page.tsx        Squad registry
  results/page.tsx      Podium, event champions, recent fixtures

components/
  Navbar · Hero · Countdown · Introduction            (shell + opening acts)
  EventCarousel EventCard SportsGrid           (sports + events)
  LiveScores Leaderboard ChampionSpotlight     (competition surfaces)
  Schedule Gallery Teams Sponsors              (fest surfaces)
  RegistrationCTA Footer                       (conversion + closure)
  LoadingScreen CursorEffects BackgroundEffects PageTransition
  art/      PortalCore · BattlefieldFrame · SportGlyph · Crest · Trophy
  ui/       Reveal · SectionHeader · CTA
  sections/ HomeSections.tsx (composes the home page)

data/
  site.ts events.ts teams.ts schedule.ts leaderboard.ts liveScores.ts gallery.ts sponsors.ts
lib/
  utils.ts motion.ts accents.ts hooks/{useCountdown,useMouseParallax,useLiveFeed,useArenaReady}
```

---

## Where to change things

| I want to… | Edit |
| --- | --- |
| Change dates, tagline, register link, contact | `data/site.ts` |
| Add / remove / edit a sport | `data/events.ts` |
| Change the carousel line-up | `FEATURED_SLUGS` in `data/events.ts` |
| Edit the timetable | `data/schedule.ts` |
| Change standings / podium | `data/leaderboard.ts` |
| Swap live-score data for a real API | `lib/hooks/useLiveFeed.ts` |
| Change colours, type, glows | `app/globals.css` (tokens) + `tailwind.config.ts` |
| Add team crests / gallery photos / sponsor logos | drop files in `public/`, then set `image` / `logo` in the matching `data/*.ts` entry |

### Re-skinning
Every colour lives in `app/globals.css` in two forms — `--x` (hex, for gradients and
SVG) and `--x-rgb` (triplet, so Tailwind opacity modifiers like `bg-crimson/70` work).
Change those and the whole site follows. The brand hierarchy is:

**BLACK → CRIMSON → SILVER → ELECTRIC BLUE** (gold reserved for champions).

---

## Artwork: procedural by default

All imagery — hero portal, event frames, gallery, team crests, trophy — is generated
as **deterministic SVG/CSS artwork** from a string seed. Benefits: zero licensed
assets, no hydration mismatch, tiny payload, infinitely scalable.

To use real photography instead, set the `image` field on the relevant data object
(`image: "/events/football.jpg"`) and drop the file in `public/`. The components already
switch to `next/image` automatically — no code change needed.

---

## Performance & accessibility

- Server components by default; `"use client"` only where interactivity requires it.
- Pointer parallax and the custom cursor are rAF-throttled, cleanup on unmount, and
  disabled on touch devices (`pointer: fine` gate).
- `prefers-reduced-motion` disables the loader, cursor, parallax and every decorative
  animation.
- Images are lazy-loaded with explicit sizes; the carousel renders at most 7 slides.
- Semantic landmarks, single `h1` per page, visible focus rings, skip-to-content link,
  ARIA on the carousel / lightbox / tables, and horizontal-scroll fallbacks so no
  content is lost on small screens.

---

## Responsiveness

Designed and tested for 1440 / 1280 / 1024 / 768 / 430 / 390 / 360 px. Mobile is its own
composition: full-screen hamburger menu, vertical timelines, vertically stacked event
rows, and horizontally scrollable leaderboard/calendar tables rather than squeezed columns.

---

## Deploy

Static-friendly on any Node host:

```bash
npm run build && npm start
```

Works out of the box on Vercel, Netlify, Render or a plain Node server.
