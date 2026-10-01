/**
 * LIVE FEED — mock payload shaped exactly like the future API response so the
 * polling layer can be swapped in without touching the UI components.
 */
export interface LiveMatch {
  id: string;
  sport: string;
  eventSlug: string;
  home: { name: string; score: number | string };
  away: { name: string; score: number | string };
  status: "live" | "upcoming" | "final";
  /** Clock / period label, e.g. "68'". */
  clock?: string;
  detail: string;
  accent: "crimson" | "volt" | "violet" | "gold";
}

export const LIVE_MATCHES: LiveMatch[] = [
  {
    id: "live-fb-1",
    sport: "football",
    eventSlug: "football",
    home: { name: " - ", score: 2 },
    away: { name: "Cinder Crew", score: 1 },
    status: "live",
    clock: "68'",
    detail: "Semi-final I · Main Ground",
    accent: "crimson",
  },
  {
    id: "live-bb-1",
    sport: "basketball",
    eventSlug: "basketball",
    home: { name: "Titan Syndicate", score: 74 },
    away: { name: "Apex Collective", score: 69 },
    status: "live",
    clock: "Q4 · 04:12",
    detail: "Round of 16 · Court 01",
    accent: "volt",
  },
  {
    id: "live-vl-1",
    sport: "chess",
    eventSlug: "chess",
    home: { name: "Obsidian Order", score: 1 },
    away: { name: "Night Protocol", score: 1 },
    status: "live",
    clock: "MAP 3",
    detail: "Upper Bracket Final · Chess Bay",
    accent: "violet",
  },
  {
    id: "next-at-1",
    sport: "Swimming",
    eventSlug: "Swimming",
    home: { name: "Red Meridian", score: "—" },
    away: { name: "Field A", score: "—" },
    status: "upcoming",
    clock: "13:30",
    detail: "400m Final · Swimming Track",
    accent: "gold",
  },
];

/** Results already locked in for today — rendered in the results strip. */
export const RECENT_RESULTS = [
  { sport: "Table Tennis", winner: "Night Protocol", loser: "Stormforge", score: "3 – 2", stage: "Round of 16" },
  { sport: "Badminton", winner: "Stormforge", loser: "Silver Lance", score: "21-18, 21-16", stage: "Round of 32" },
  { sport: "Kho-Kho", winner: "The Quiet War", loser: "Apex Collective", score: "4 – 1", stage: "Swiss R4" },
  { sport: "chess", winner: "Obsidian Order", loser: "Iron Veil", score: "13 – 9", stage: "Opening Series" },
] as const;

/** Final podium data used by /results and the champion spotlight. */
export const PODIUM_2025 = [
  { place: 1, team: "Phoenix Brigade", points: 33, medal: "gold" as const },
  { place: 2, team: "Titan Syndicate", points: 30, medal: "silver" as const },
  { place: 3, team: "Obsidian Order", points: 27, medal: "bronze" as const },
];

export const PREVIOUS_EDITIONS = [
  { year: "2025", champion: "Phoenix Brigade", sports: 22, teams: 61 },
  { year: "2024", champion: "Titan Syndicate", sports: 20, teams: 54 },
  { year: "2023", champion: "Obsidian Order", sports: 18, teams: 47 },
];

/** Event-level champions crowned so far this season. */
export const EVENT_CHAMPIONS = [
  { event: "Mixed Cricket", champion: "Cinder Crew", runnerUp: "Phoenix Brigade" },
  { event: "Kho-Kho", champion: "The Quiet War", runnerUp: "Apex Collective" },
  { event: "Table Tennis", champion: "Night Protocol", runnerUp: "Stormforge" },
  { event: "Power Lifting", champion: "Iron Veil", runnerUp: "Apex Collective" },
];
