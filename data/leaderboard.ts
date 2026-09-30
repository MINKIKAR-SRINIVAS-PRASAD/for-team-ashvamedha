/**
 * LEADERBOARD — championship table. Rankings recompute from these rows only.
 */
export interface RankingRow {
  rank: number;
  team: string;
  teamSlug: string;
  matches: number;
  wins: number;
  losses: number;
  points: number;
  /** Optional override; computed from wins/matches when omitted. */
  winPct?: number;
}

export const RANKINGS: RankingRow[] = [
  { rank: 1, team: "-", teamSlug: "slot-1", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
  { rank: 2, team: "-", teamSlug: "slot-2", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
  { rank: 3, team: "-", teamSlug: "slot-3", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
  { rank: 4, team: "-", teamSlug: "slot-4", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
  { rank: 5, team: "-", teamSlug: "slot-5", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
  { rank: 6, team: "-", teamSlug: "slot-6", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
  { rank: 7, team: "-", teamSlug: "slot-7", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
  { rank: 8, team: "-", teamSlug: "slot-8", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
  { rank: 9, team: "-", teamSlug: "slot-9", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
  { rank: 10, team: "-", teamSlug: "slot-10", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
  { rank: 11, team: "-", teamSlug: "slot-11", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
  { rank: 12, team: "-", teamSlug: "slot-12", matches: 0, wins: 0, losses: 0, points: 0, winPct: 0 },
];

export const LEADERBOARD_COLUMNS = [
  "Rank",
  "Team",
  "Matches",
  "Wins",
  "Losses",
  "Points",
  "Win %",
] as const;

export function winPercent(row: RankingRow) {
  if (row.winPct !== undefined) return row.winPct;
  if (row.matches === 0) return 0;
  return Math.round((row.wins / row.matches) * 1000) / 10;
}

/** Championship podium — the only rows that receive gold / silver / bronze treatment. */
export const PODIUM = RANKINGS.slice(0, 3);

export const CHAMPION_SPOTLIGHT = {
  reigning: "-",
  reigningSport: "Season 2026",
  streak: "Awaiting Opening Fixtures",
  contenders: [
    { name: "-", note: "TBD" },
    { name: "-", note: "TBD" },
    { name: "-", note: "TBD" },
  ],
} as const;
