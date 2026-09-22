/**
 * Global site configuration — one place to change dates, links and HUD strings.
 */
export const SITE = {
  name: "ASHVAMEDHA",
  year: "2026",
  edition: "Season 2026",
  host: "IIT Bhubaneswar",
  hostLong: "Indian Institute of Technology Bhubaneswar",
  tagline: "THE BATTLE BEGINS",
  subTagline: "THE BATTLE FOR GLORY",
  arena: "ARENA · IIT BHUBANESWAR",
  /** Opening ceremony — used by the Doomsday Clock. */
  startsAt: "2026-11-13T09:00:00+05:30",
  endsAt: "2026-11-15T21:00:00+05:30",
  registrationUrl: "https://ashvamedha.iitbbs.ac.in/register",
  contactEmail: "ashvamedha@iitbbs.ac.in",
  contactPhone: "+91 674 713 5000",
  address: "IIT Bhubaneswar, Argul, Jatni, Khordha — 752050, Odisha, India",
} as const;

export const HUD = {
  status: "SYSTEM ONLINE",
  eventStatus: "EVENT STATUS: ACTIVE",
  season: "SEASON: 2026",
  uptime: "LINK: STABLE",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Schedule", href: "/schedule" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Gallery", href: "/gallery" },
  { label: "Teams", href: "/teams" },
  { label: "Results", href: "/results" },
] as const;

export const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/ashvamedha_iitbbs" },
  { label: "LinkedIn", href: "https://linkedin.com/company/ashvamedha-iitbbs" },
  { label: "YouTube", href: "https://youtube.com/@ashvamedha_iitbbs" },
] as const;

export const FOOTER_LINKS = [
  { label: "Events", href: "/events" },
  { label: "Schedule", href: "/schedule" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Gallery", href: "/gallery" },
  { label: "Teams", href: "/teams" },
  { label: "Results", href: "/results" },
  { label: "Contact", href: "/#contact" },
] as const;

/** Championship counts shown in the intro HUD strip. */
export const FEST_STATS = [
  { label: "Sports", value: "24" },
  { label: "Teams", value: "68" },
  { label: "Athletes", value: "1,240" },
  { label: "Days of Battle", value: "03" },
] as const;
