/**
 * TEAMS — data driven roster of participating squads.
 * Add a team here + a leaderboard row in data/leaderboard.ts and the UI follows.
 */
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
  motto: string;
}

export const TEAMS: Team[] = [
  {
    slug: "phoenix-brigade",
    name: "Phoenix Brigade",
    institution: "IIT Bhubaneswar",
    department: "School of Mechanical Sciences",
    captain: "A. Mahapatra",
    sport: "Football",
    rank: 1,
    accent: "crimson",
    crest: ["#e11d2e", "#4a0710"],
    motto: "Rise. Repeat. Reign.",
  },
  {
    slug: "titan-syndicate",
    name: "Titan Syndicate",
    institution: "IIT Bhubaneswar",
    department: "School of Electrical Sciences",
    captain: "R. Nayak",
    sport: "Basketball",
    rank: 2,
    accent: "volt",
    crest: ["#31a8ff", "#062642"],
    motto: "Above the rim, beyond the noise.",
  },
  {
    slug: "obsidian-order",
    name: "Obsidian Order",
    institution: "NIT Rourkela",
    department: "Department of Computer Science",
    captain: "S. Patel",
    sport: "Valorant",
    rank: 3,
    accent: "violet",
    crest: ["#7c5cff", "#241048"],
    motto: "Every site is ours.",
  },
  {
    slug: "iron-veil",
    name: "Iron Veil",
    institution: "IIT Bhubaneswar",
    department: "School of Infrastructure",
    captain: "K. Das",
    sport: "Gym",
    rank: 4,
    accent: "crimson",
    crest: ["#ff5a3c", "#3a0d05"],
    motto: "Weight is only a rumour.",
  },
  {
    slug: "silver-lance",
    name: "Silver Lance",
    institution: "KIIT Bhubaneswar",
    department: "School of Law",
    captain: "P. Mohanty",
    sport: "Lawn Tennis",
    rank: 5,
    accent: "gold",
    crest: ["#e8c46a", "#42310d"],
    motto: "Placed, not played.",
  },
  {
    slug: "stormforge",
    name: "Stormforge",
    institution: "IIT Bhubaneswar",
    department: "School of Basic Sciences",
    captain: "N. Behera",
    sport: "Badminton",
    rank: 6,
    accent: "volt",
    crest: ["#6fd0ff", "#083246"],
    motto: "Smash first, doubt later.",
  },
  {
    slug: "quiet-war",
    name: "The Quiet War",
    institution: "IIT Bhubaneswar",
    department: "School of Humanities",
    captain: "A. Rout",
    sport: "Chess",
    rank: 7,
    accent: "violet",
    crest: ["#b39cff", "#2a1a5e"],
    motto: "We win it in silence.",
  },
  {
    slug: "red-meridian",
    name: "Red Meridian",
    institution: "CET Bhubaneswar",
    department: "Department of Civil Engineering",
    captain: "V. Sahu",
    sport: "Athletics",
    rank: 8,
    accent: "crimson",
    crest: ["#ff3b57", "#46060f"],
    motto: "Milliseconds are ours.",
  },
  {
    slug: "walled-court",
    name: "Walled Court",
    institution: "IIT Bhubaneswar",
    department: "School of Minerals",
    captain: "D. Panda",
    sport: "Volleyball",
    rank: 9,
    accent: "gold",
    crest: ["#ffd98a", "#4a3611"],
    motto: "Six hands. One wall.",
  },
  {
    slug: "night-protocol",
    name: "Night Protocol",
    institution: "VSSUT Burla",
    department: "Department of Electronics",
    captain: "T. Jena",
    sport: "Table Tennis",
    rank: 10,
    accent: "volt",
    crest: ["#3ddc97", "#053827"],
    motto: "Reflex over reason.",
  },
  {
    slug: "cinder-crew",
    name: "Cinder Crew",
    institution: "IIT Bhubaneswar",
    department: "School of Earth Sciences",
    captain: "M. Sahoo",
    sport: "Cricket",
    rank: 11,
    accent: "crimson",
    crest: ["#c2410c", "#331003"],
    motto: "Ten overs is a lifetime.",
  },
  {
    slug: "apex-collective",
    name: "Apex Collective",
    institution: "IIT Bhubaneswar",
    department: "Open Category",
    captain: "H. Mishra",
    sport: "Gym Events",
    rank: 12,
    accent: "gold",
    crest: ["#eab308", "#3f2d03"],
    motto: "All five trials. No excuses.",
  },
];

export function getTeam(slug: string) {
  return TEAMS.find((t) => t.slug === slug);
}
