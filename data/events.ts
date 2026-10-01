/**
 * EVENT SYSTEM — fully data driven.
 *
 * Source of event facts:
 * ASHVAMEDHA 2026 RULEBOOK
 *
 * The rulebook gives the overall festival dates as Oct 9–11, 2026.
 * Sport-specific time/venue details are only filled where the rulebook
 * explicitly provides them. Otherwise they remain "TBA".
 */

export type Accent = "crimson" | "volt" | "violet" | "gold";

export type RegistrationState = "open" | "closing" | "closed";

export interface FestEvent {
  /** Stable slug used for /events/[slug] routes. */
  slug: string;

  /** Official display name. */
  name: string;

  /** UI-only battlefield title. */
  arena: string;

  /** UI filter bucket. */
  category:
    | "Team Sport"
    | "Racquet"
    | "Board & Mind"
    | "Power & Fitness"
    | "Esports";

  /** UI-only short hook. */
  tagline: string;

  /** Rulebook-based event summary. */
  description: string;

  /** Overall ASHVAMEDHA event window from the rulebook cover. */
  date: string;

  /** Exact sport day is not specified in the rulebook. */
  day: 1 | 2 | 3;

  /** Sport-specific time is not specified in the rulebook. */
  time: string;

  /** Venue only where the rulebook explicitly states it. */
  venue: string;

  /** Rulebook participant/team size. */
  teamSize: string;

  /**
   * Current website registration UI state.
   * The rulebook does not specify whether registration is open/closing/closed.
   */
  registration: RegistrationState;

  /** Rulebook registration fee. */
  entryFee: string;

  /** Rulebook prize information. */
  prizePool: string;

  /** Rulebook-based format summary. */
  format: string;

  /** UI-only visual accent. */
  accent: Accent;

  image?: string | null;

  /** UI glyph identifier. */
  glyph:
    | "football"
    | "basketball"
    | "badminton"
    | "tabletennis"
    | "lawn"
    | "kho-kho"
    | "gym events"
    | "esportst"
    | "swimming"
    | "volleyball"
    | "chess"
    | "sportsquiz";
}

export const EVENTS: FestEvent[] = [
  {
    slug: "basketball",
    name: "Basketball",
    arena: "Basketball",
    category: "Team Sport",
    tagline: "FIBA rules, five on court.",
    description:
      "Basketball will be conducted according to FIBA rules as adopted by the Basketball Federation of India. Teams must have a minimum of 5 and a maximum of 12 players.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "TBA",
    teamSize: "5–12 players",
    registration: "open",
    entryFee: "Boys ₹3,500 / Girls ₹2,000",
    prizePool:
      "Boys Winner ₹8,000 / Runner-up ₹5,000; Girls Winner ₹5,000 / Runner-up ₹2,500",
    format:
      "FIBA rules; tournament type decided according to number of participating teams",
    accent: "volt",
    image: null,
    glyph: "basketball",
  },

  {
    slug: "football",
    name: "Football",
    arena: "The Arena",
    category: "Team Sport",
    tagline: "Standard FIFA rules.",
    description:
      "Football follows standard FIFA rules. A team must consist of a minimum of 7 and maximum of 16 players, with ten outfield players and one goalkeeper in the stated playing formation.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "SAC Football Ground",
    teamSize: "7–16 players",
    registration: "open",
    entryFee: "₹4,000 / team",
    prizePool: "Winner ₹12,000 / Runner-up ₹8,000",
    format:
      "50-minute match (2 × 25 min); extra time 16 min (2 × 8 min); penalty shoot-out in tied knockout matches",
    accent: "crimson",
    image: null,
    glyph: "football",
  },

  {
    slug: "volleyball",
    name: "Vollyball",
    arena: "Vollyball Court",
    category: "Team Sport",
    tagline: "Six players. Rally scoring.",
    description:
      "Vollyball teams must contain a minimum of 6 and maximum of 12 members. League matches are best of 3 sets, while semi-finals and finals are best of 5 sets.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "TBA",
    teamSize: "6–12 players",
    registration: "open",
    entryFee: "Boys ₹3,500 / Girls ₹2,000",
    prizePool:
      "Boys Winner ₹9,000 / Runner-up ₹5,500; Girls Winner ₹4,000 / Runner-up ₹2,000",
    format:
      "League: best of 3 sets; semi-finals/finals: best of 5 sets; FIVB rules",
    accent: "gold",
    image: null,
    glyph: "volleyball",
  },

  {
    slug: "badminton",
    name: "Badminton",
    arena: "Badminton Arena",
    category: "Racquet",
    tagline: "Three games decide the tie.",
    description:
      "Badminton is a team event with a maximum of 4 players. The sequence is singles, doubles and singles, with a team winning when it takes 2 of the 3 games.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "TBA",
    teamSize: "Maximum 4 players",
    registration: "open",
    entryFee: "₹1,500 / team",
    prizePool:
      "Boys Winner ₹5,000 / Runner-up ₹2,500; Girls Winner ₹5,000 / Runner-up ₹2,500",
    format:
      "Knockout/elimination; singles, doubles, singles; best of 3 games to 21 points",
    accent: "gold",
    image: null,
    glyph: "badminton",
  },

  {
    slug: "table-tennis",
    name: "Table tennis",
    arena: "Table Tennis Bay",
    category: "Racquet",
    tagline: "Five matches. One team.",
    description:
      "Table tennis matches are best of 5. Teams contain 3–4 boys and 1–2 girls, with men's singles, women's singles, men's doubles, mixed doubles and men's singles.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "TBA",
    teamSize: "3–4 boys + 1–2 girls",
    registration: "open",
    entryFee: "₹2,000 / team",
    prizePool: "Winner ₹5,000 / Runner-up ₹2,500",
    format:
      "Best of 5; 5-match team order: Men's Singles, Women's Singles, Men's Doubles, Mixed Doubles, Men's Singles",
    accent: "volt",
    image: null,
    glyph: "tabletennis",
  },

  {
    slug: "lawn-tennis",
    name: "Lawn tennis",
    arena: "Lawn Tennis Court",
    category: "Racquet",
    tagline: "Singles, doubles, reverse singles.",
    description:
      "Lawn tennis follows AITA rules. Each team has 2–4 players and plays two singles and one doubles match, with reverse singles used when teams are tied at one match each.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "TBA",
    teamSize: "2–4 players",
    registration: "open",
    entryFee: "₹1,500 / team",
    prizePool: "Winner ₹3,500 / Runner-up ₹2,500",
    format:
      "Two singles + one doubles; best of 3 sets; league and knockout formats as specified in the rulebook",
    accent: "gold",
    image: null,
    glyph: "lawn",
  },

  {
    slug: "chess",
    name: "Chess",
    arena: "Chess Hall",
    category: "Board & Mind",
    tagline: "FIDE Swiss team battle.",
    description:
      "Chess is a team event conducted under FIDE laws and tournament rules. Each team must have 4–6 players, including up to 2 substitutes, with 4 players playing in a round.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "TBA",
    teamSize: "4–6 players (2 substitutes); 4 play per round",
    registration: "open",
    entryFee: "₹1,500 / team",
    prizePool: "Winner ₹4,000 / Runner-up ₹2,500",
    format:
      "FIDE Swiss system; qualifier/knockout may precede the Swiss league depending on entries",
    accent: "violet",
    image: null,
    glyph: "chess",
  },

  {
    slug: "powerlifting",
    name: "Power lifting",
    arena: "Powerlifting Arena",
    category: "Power & Fitness",
    tagline: "Three lifts. One DOTS score.",
    description:
      "Powerlifting uses the DOTS scoring system to compare lifters across body weights. Each participant performs squat, deadlift and bench press, with three attempts for each lift.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "TBA",
    teamSize: "Individual",
    registration: "open",
    entryFee: "₹500 / person",
    prizePool:
      "Winner ₹1,500 / Runner-up ₹1,000 / 2nd Runner-up ₹800",
    format: "Squat + deadlift + bench press; DOTS scoring",
    accent: "crimson",
    image: null,
    glyph: "gym events",
  },

  {
    slug: "kho-kho",
    name: "Kho-kho",
    arena: "Kho-kho Ground",
    category: "Team Sport",
    tagline: "Nine start. Twelve make the team.",
    description:
      "Each Kho-kho team consists of 12 players, with 9 taking the field at the beginning. Matches consist of two innings with chasing and defence turns.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "Hockey Ground",
    teamSize: "12 players (9 start)",
    registration: "open",
    entryFee: "₹2,500 / team",
    prizePool: "Winner ₹6,000 / Runner-up ₹4,000",
    format:
      "Two innings; 9-minute turns for Men and 7-minute turns for Women; knockout matches",
    accent: "violet",
    image: null,
    glyph: "kho-kho",
  },

  {
    slug: "swimming",
    name: "Swimming",
    arena: "Swimming Pool",
    category: "Power & Fitness",
    tagline: "Two individual events.",
    description:
      "The rulebook specifies 100 m Freestyle and 100 m Breaststroke events. Participants must follow lane, starting and stroke regulations, with the fastest valid timing determining ranking.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "TBA",
    teamSize: "Individual",
    registration: "open",
    entryFee: "₹1,500 / single event; ₹2,500 / both events",
    prizePool:
      "Winner ₹5,500 / Runner-up ₹3,500 / 2nd Runner-up ₹2,500",
    format: "100 m Freestyle + 100 m Breaststroke",
    accent: "volt",
    image: null,
    glyph: "swimming",
  },

  {
    slug: "sports-quiz",
    name: "Sports quiz",
    arena: "Quiz Arena",
    category: "Board & Mind",
    tagline: "Two rounds. One sports mind.",
    description:
      "The Sports Quiz consists of a preliminary round and a final round. Questions are from the world of sports, with the top 8 teams from prelims advancing to the finals.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "TBA",
    teamSize: "2–3 participants or individual",
    registration: "open",
    entryFee: "₹200 / team",
    prizePool:
      "Winner ₹2,000 / Runner-up ₹1,500 / 2nd Runner-up ₹500",
    format:
      "Two rounds: preliminary + final; prelims contain 20–30 questions; top 8 teams advance",
    accent: "violet",
    image: null,
    glyph: "sportsquiz",
  },

  {
    slug: "mixed-cricket",
    name: "Mixed cricket",
    arena: "Cricket Ground",
    category: "Team Sport",
    tagline: "Five overs. Five boys. Five girls.",
    description:
      "Each Mixed Cricket team consists of 10 players — 5 boys and 5 girls. Matches use a tennis ball and bat, with at least one boy and one girl at the crease while girls remain available to bat.",
    date: "09–11 Oct 2026",
    day: 1,
    time: "TBA",
    venue: "TBA",
    teamSize: "10 players (5 boys + 5 girls)",
    registration: "open",
    entryFee: "₹3,000 / team",
    prizePool: "Winner ₹6,000 / Runner-up ₹4,500",
    format:
      "5 overs per innings; tennis ball; Super Over for tied knockout matches",
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

/** Cards featured in the 3D carousel. */
export const FEATURED_SLUGS = [
  "football",
  "basketball",
  "chess",
  "badminton",
  "swimming",
  "kho-kho",
] as const;