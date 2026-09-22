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
  { rank: 1, team: "Phoenix Brigade", teamSlug: "phoenix-brigade", matches: 12, wins: 11, losses: 1, points: 33 },
  { rank: 2, team: "Titan Syndicate", teamSlug: "titan-syndicate", matches: 12, wins: 10, losses: 2, points: 30 },
  { rank: 3, team: "Obsidian Order", teamSlug: "obsidian-order", matches: 11, wins: 9, losses: 2, points: 27 },
  { rank: 4, team: "Iron Veil", teamSlug: "iron-veil", matches: 10, wins: 8, losses: 2, points: 24 },
  { rank: 5, team: "Silver Lance", teamSlug: "silver-lance", matches: 11, wins: 8, losses: 3, points: 24 },
  { rank: 6, team: "Stormforge", teamSlug: "stormforge", matches: 10, wins: 7, losses: 3, points: 21 },
  { rank: 7, team: "The Quiet War", teamSlug: "quiet-war", matches: 9, wins: 6, losses: 3, points: 18 },
  { rank: 8, team: "Red Meridian", teamSlug: "red-meridian", matches: 10, wins: 6, losses: 4, points: 18 },
  { rank: 9, team: "Walled Court", teamSlug: "walled-court", matches: 10, wins: 5, losses: 5, points: 15 },
  { rank: 10, team: "Night Protocol", teamSlug: "night-protocol", matches: 9, wins: 4, losses: 5, points: 12 },
  { rank: 11, team: "Cinder Crew", teamSlug: "cinder-crew", matches: 9, wins: 3, losses: 6, points: 9 },
  { rank: 12, team: "Apex Collective", teamSlug: "apex-collective", matches: 8, wins: 2, losses: 6, points: 6 },
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
  reigning: "Phoenix Brigade",
  reigningSport: "Football · Season 2025",
  streak: "11-match unbeaten run",
  contenders: [
    { name: "Titan Syndicate", note: "Highest scoring average in the arena" },
    { name: "Obsidian Order", note: "Only squad yet to drop a map" },
    { name: "Iron Veil", note: "Three straight podium finishes" },
  ],
} as const;
