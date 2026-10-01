export interface Team {
  slug: string;
  name: string;
  institution: string;
  department: string;
  captain: string;
  sport: string;
  /** Current championship rank, or null for teams yet to be seeded. */
  rank: number | null;
  accent: "crimson" | "volt" | "violet" | "gold";
  /** Two hex stops used by the procedural crest generator. */
  crest: [string, string];
}

/**
 * TEAMS — data driven roster of participating squads.
 * Add a team here + a leaderboard row in data/leaderboard.ts and the UI follows.
 */
export const TEAMS: Team[] = [
  {
    slug: "slot-1",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "football",
    rank: 1,
    accent: "crimson",
    crest: ["#e11d2e", "#4a0710"],
  },
  {
    slug: "slot-2",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "basketball",
    rank: 2,
    accent: "volt",
    crest: ["#31a8ff", "#062642"],
  },
  {
    slug: "slot-3",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "chess",
    rank: 3,
    accent: "violet",
    crest: ["#7c5cff", "#241048"],
  },
  {
    slug: "slot-4",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "Power Lifting",
    rank: 4,
    accent: "crimson",
    crest: ["#ff5a3c", "#3a0d05"],
  },
  {
    slug: "slot-5",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "Lawn Tennis Tennis",
    rank: 5,
    accent: "gold",
    crest: ["#e8c46a", "#42310d"],
  },
  {
    slug: "slot-6",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "Badminton",
    rank: 6,
    accent: "volt",
    crest: ["#6fd0ff", "#083246"],
  },
  {
    slug: "slot-7",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "Kho-Kho",
    rank: 7,
    accent: "violet",
    crest: ["#b39cff", "#2a1a5e"],
  },
  {
    slug: "slot-8",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "Swimming",
    rank: 8,
    accent: "crimson",
    crest: ["#ff3b57", "#46060f"],
  },
  {
    slug: "slot-9",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "volleyball",
    rank: 9,
    accent: "gold",
    crest: ["#ffd98a", "#4a3611"],
  },
  {
    slug: "slot-10",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "Table Tennis",
    rank: 10,
    accent: "volt",
    crest: ["#3ddc97", "#053827"],
  },
  {
    slug: "slot-11",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "Mixed Cricket",
    rank: 11,
    accent: "crimson",
    crest: ["#c2410c", "#331003"],
  },
  {
    slug: "slot-12",
    name: "-",
    institution: "-",
    department: "-",
    captain: "-",
    sport: "Power Lifting Events",
    rank: 12,
    accent: "gold",
    crest: ["#eab308", "#3f2d03"],
  },
];

export function getTeam(slug: string) {
  return TEAMS.find((t) => t.slug === slug);
}