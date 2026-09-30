/**
 * EVENT SYSTEM — fully data driven.
 * Add / remove / edit a sport here and every surface (grid, carousel, schedule,
 * event detail pages, registration CTAs) updates automatically.
 */

export type Accent = "crimson" | "volt" | "violet" | "gold";

export type RegistrationState = "open" | "closing" | "closed";

export interface FestEvent {
  /** Stable slug used for /events/[slug] routes. */
  slug: string;
  /** Display name. */
  name: string;
  /** Short battlefield title, e.g. "THE ARENA". */
  arena: string;
  /** Discipline bucket used by the filter rail. */
  category: "Team Sport" | "Racquet" | "Board & Mind" | "Power & Fitness" | "Esports";
  /** One-line cinematic hook. */
  tagline: string;
  /** 2–3 sentence realistic description. */
  description: string;
  date: string;
  day: 1 | 2 | 3;
  time: string;
  venue: string;
  teamSize: string;
  registration: RegistrationState;
  entryFee: string;
  prizePool: string;
  format: string;
  accent: Accent;
  /** Optional real photography path (public/…). Procedural art renders when null. */
  image?: string | null;
  /** Glyph key consumed by components/art/SportGlyph.tsx */
  glyph:
    | "football"
    | "basketball"
    | "badminton"
    | "tabletennis"
    | "lawn"
    | "chess"
    | "gym"
    | "valorant"
    | "athletics"
    | "volleyball";
}

export const EVENTS: FestEvent[] = [
  {
    slug: "football",
    name: "Football",
    arena: "The Arena",
    category: "Team Sport",
    tagline: "Eleven against the storm.",
    description:
      "The flagship battle of ASHVAMEDHA, played across a full 90-minute war of endurance and structure. Group stages run on the main ground before the floodlit final decides who lifts the Ashvamedha Shield.",
    date: "09-11 Oct 2026",
    day: 1,
    time: "09:00 onwards",
    venue: "Main Ground",
    teamSize: "11 + 5 subs",
    registration: "closing",
    entryFee: "₹1,200 / team",
    prizePool: "₹45,000",
    format: "Group stage + knockout",
    accent: "crimson",
    image: null,
    glyph: "football",
  },
  {
    slug: "basketball",
    name: "Basketball",
    arena: "Court 01 Protocol",
    category: "Team Sport",
    tagline: "Four quarters. No retreat.",
    description:
      "Fast-break basketball under the arena lights with a shot-clock enforced at 24 seconds. Played 5v5 across four ten-minute quarters with a knockout bracket for the top eight squads.",
    date: "09-11 Oct 2026",
    day: 2,
    time: "10:30 onwards",
    venue: "Court 01",
    teamSize: "5 + 4 subs",
    registration: "open",
    entryFee: "₹900 / team",
    prizePool: "₹30,000",
    format: "Knockout bracket",
    accent: "volt",
    image: null,
    glyph: "basketball",
  },
  {
    slug: "badminton",
    name: "Badminton",
    arena: "Indoor Hall",
    category: "Racquet",
    tagline: "Speed you can hear.",
    description:
      "Singles and doubles combat on four regulation courts with BWF-scoring to 21. Quarter-final losers enter a repechage ladder so no campaign ends without a second strike.",
    date: "09–10 Oct 2026",
    day: 1,
    time: "11:30 onwards",
    venue: "Indoor Hall",
    teamSize: "1 or 2",
    registration: "open",
    entryFee: "₹250 / player",
    prizePool: "₹18,000",
    format: "Singles + doubles, BWF 21",
    accent: "gold",
    image: null,
    glyph: "badminton",
  },
  {
    slug: "table-tennis",
    name: "Table Tennis",
    arena: "Precision Bay",
    category: "Racquet",
    tagline: "Reflex is a weapon.",
    description:
      "Eight tables running in parallel, best-of-five to 11 points. Known across the circuit for upsets — the shortest distance between an underdog and a trophy.",
    date: "09-11 Oct 2026",
    day: 1,
    time: "14:00 onwards",
    venue: "Indoor Hall — Bay 2",
    teamSize: "1 or 2",
    registration: "open",
    entryFee: "₹200 / player",
    prizePool: "₹12,000",
    format: "Best of 5, knockout",
    accent: "volt",
    image: null,
    glyph: "tabletennis",
  },
  {
    slug: "lawn-tennis",
    name: "Lawn Tennis",
    arena: "Sun Court",
    category: "Racquet",
    tagline: "Long rallies break hearts.",
    description:
      "Hard-court tennis with pro-set scoring in the early rounds and best-of-three sets from the semi-finals. Played under the open Odisha sky with a dedicated medical bay on standby.",
    date: "10 Oct 2026",
    day: 2,
    time: "07:00 onwards",
    venue: "Lawn Courts",
    teamSize: "1 or 2",
    registration: "closing",
    entryFee: "₹300 / player",
    prizePool: "₹15,000",
    format: "Pro-set then best of 3",
    accent: "gold",
    image: null,
    glyph: "lawn",
  },
  {
    slug: "chess",
    name: "Chess",
    arena: "The Quiet War",
    category: "Board & Mind",
    tagline: "Silence, then devastation.",
    description:
      "FIDE standard blitz and rapid formats in a sound-controlled hall, arbiter-monitored throughout. Nine rounds of Swiss pairings decide the grandmaster of ASHVAMEDHA.",
    date: "09 Oct 2026",
    day: 1,
    time: "09:30 onwards",
    venue: "Lecture Hall Complex",
    teamSize: "1",
    registration: "open",
    entryFee: "₹150 / player",
    prizePool: "₹10,000",
    format: "Swiss, 9 rounds",
    accent: "violet",
    image: null,
    glyph: "chess",
  },
  {
    slug: "gym",
    name: "Gym",
    arena: "Iron Protocol",
    category: "Power & Fitness",
    tagline: "Against gravity, and yourself.",
    description:
      "Raw strength benchmarks across squat, bench press and deadlift judged on bodyweight multipliers. Technique is audited by certified spotters — form beats ego every time.",
    date: "11 Oct 2026",
    day: 3,
    time: "08:00 onwards",
    venue: "Strength & Conditioning Centre",
    teamSize: "1",
    registration: "open",
    entryFee: "₹200 / athlete",
    prizePool: "₹14,000",
    format: "3-lift total",
    accent: "crimson",
    image: null,
    glyph: "gym",
  },
  {
    slug: "gym-events",
    name: "Gym Events",
    arena: "Iron Gauntlet",
    category: "Power & Fitness",
    tagline: "A gauntlet of five trials.",
    description:
      "Arm wrestling, plank hold, pull-up endurance, farmer's carry and a timed relay of four stations. Scored on aggregate — the most complete athlete wins, not the biggest.",
    date: "11 Oct 2026",
    day: 3,
    time: "15:00 onwards",
    venue: "Strength & Conditioning Centre",
    teamSize: "1 + relay of 4",
    registration: "open",
    entryFee: "₹250 / athlete",
    prizePool: "₹16,000",
    format: "5 trials, aggregate points",
    accent: "crimson",
    image: null,
    glyph: "gym",
  },
  {
    slug: "valorant",
    name: "Valorant",
    arena: "Server War",
    category: "Esports",
    tagline: "Five operators. One site.",
    description:
      "LAN-adjacent competitive FPS on a 100 Mbps dedicated line with best-of-three series throughout. Coaches get a comms slot behind the players — strategy is part of the spectacle.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "16:00 onwards",
    venue: "Systems Lab — Esports Bay",
    teamSize: "5 + 1 coach",
    registration: "closing",
    entryFee: "₹1,000 / team",
    prizePool: "₹35,000",
    format: "Best of 3 / Bo5 final",
    accent: "violet",
    image: null,
    glyph: "valorant",
  },
  {
    slug: "athletics",
    name: "Athletics",
    arena: "The Track",
    category: "Power & Fitness",
    tagline: "Milliseconds define legacies.",
    description:
      "100m, 200m, 400m, 4x100m relay plus long jump and shot put. Electronic timing with photo-finish review ensures every podium is beyond dispute.",
    date: "10 Oct 2026",
    day: 2,
    time: "06:30 onwards",
    venue: "Athletics Track",
    teamSize: "Individual + relay of 4",
    registration: "open",
    entryFee: "₹150 / event",
    prizePool: "₹22,000",
    format: "Heats + finals",
    accent: "volt",
    image: null,
    glyph: "athletics",
  },
  {
    slug: "volleyball",
    name: "Volleyball",
    arena: "Court 02",
    category: "Team Sport",
    tagline: "Six hands, one wall.",
    description:
      "Six-a-side volleyball played to 25 points with rally scoring. Rotation discipline decides the tight sets — the final has gone to five sets three years running.",
    date: "10-11 Oct 2026",
    day: 2,
    time: "15:30 onwards",
    venue: "Court 02",
    teamSize: "6 + 4 subs",
    registration: "open",
    entryFee: "₹800 / team",
    prizePool: "₹25,000",
    format: "Group + knockout",
    accent: "gold",
    image: null,
    glyph: "volleyball",
  },
  {
    slug: "cricket",
    name: "Cricket",
    arena: "Sunset Oval",
    category: "Team Sport",
    tagline: "Ten overs of chaos.",
    description:
      "T10 knockout cricket with a hard ball, played across two days on the main oval. Powerplay restrictions and a super-over for ties keep the campaign brutally fast.",
    date: "09-11 Oct 2026",
    day: 1,
    time: "13:00 onwards",
    venue: "Main Ground",
    teamSize: "11 + 4 subs",
    registration: "closed",
    entryFee: "₹1,500 / team",
    prizePool: "₹40,000",
    format: "T10 knockout + super over",
    accent: "crimson",
    image: null,
    glyph: "football",
  },
];

export const EVENT_CATEGORIES = [
  "All",
  "Team Sport",
  "Racquet",
  "Board & Mind",
  "Power & Fitness",
  "Esports",
] as const;

export const REGISTRATION_LABEL: Record<RegistrationState, string> = {
  open: "Registration Open",
  closing: "Closing Soon",
  closed: "Entries Closed",
};

export function getEvent(slug: string) {
  return EVENTS.find((e) => e.slug === slug);
}

export function getEventsByDay(day: number) {
  return EVENTS.filter((e) => e.day === day);
}

/** Cards featured in the 3D carousel — the headline battlegrounds. */
export const FEATURED_SLUGS = [
  "football",
  "basketball",
  "valorant",
  "badminton",
  "athletics",
  "chess",
] as const;
