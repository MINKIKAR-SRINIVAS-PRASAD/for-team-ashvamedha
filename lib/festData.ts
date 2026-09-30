/**
 * FEST DATA — single bridge between the site and the backend.
 *
 * Every page gets its data from `GET /api/public/bundle`. The shapes are the
 * exact ones defined in data/*.ts, and those static files stay as the fallback:
 * if the API is unreachable the site renders exactly as it did before.
 */
import { EVENTS, FEATURED_SLUGS, type FestEvent } from "@/data/events";
import { TEAMS, type Team } from "@/data/teams";
import { DAYS, SCHEDULE, type ScheduleSlot } from "@/data/schedule";
import { CHAMPION_SPOTLIGHT, PODIUM, RANKINGS, type RankingRow } from "@/data/leaderboard";
import {
  EVENT_CHAMPIONS,
  LIVE_MATCHES,
  PODIUM_2025,
  PREVIOUS_EDITIONS,
  RECENT_RESULTS,
  type LiveMatch,
} from "@/data/liveScores";
import { GALLERY, type GalleryItem } from "@/data/gallery";
import { SPONSORS, type Sponsor } from "@/data/sponsors";

export interface RecentResult {
  sport: string;
  winner: string;
  loser: string;
  score: string;
  stage: string;
  draw?: boolean;
}

export interface ChampionSpotlightData {
  reigning: string;
  reigningSport: string;
  streak: string;
  contenders: readonly { name: string; note: string }[];
}

export interface PodiumEntry {
  place: number;
  team: string;
  points: number;
  medal: "gold" | "silver" | "bronze";
}

export interface FestData {
  events: FestEvent[];
  featuredSlugs: string[];
  teams: Team[];
  days: (typeof DAYS)[number][];
  schedule: ScheduleSlot[];
  rankings: RankingRow[];
  podium: RankingRow[];
  championSpotlight: ChampionSpotlightData;
  liveMatches: LiveMatch[];
  recentResults: readonly RecentResult[];
  eventChampions: (typeof EVENT_CHAMPIONS)[number][];
  podium2025: PodiumEntry[];
  previousEditions: (typeof PREVIOUS_EDITIONS)[number][];
  gallery: GalleryItem[];
  sponsors: Sponsor[];
  payment: { upiId: string | null; payeeName: string | null };
}

export const STATIC_FEST_DATA: FestData = {
  events: EVENTS,
  featuredSlugs: [...FEATURED_SLUGS],
  teams: TEAMS,
  days: [...DAYS],
  schedule: SCHEDULE,
  rankings: RANKINGS,
  podium: PODIUM,
  championSpotlight: CHAMPION_SPOTLIGHT,
  liveMatches: LIVE_MATCHES,
  recentResults: RECENT_RESULTS,
  eventChampions: EVENT_CHAMPIONS,
  podium2025: PODIUM_2025,
  previousEditions: PREVIOUS_EDITIONS,
  gallery: GALLERY,
  sponsors: SPONSORS,
  payment: { upiId: null, payeeName: null },
};

const trim = (url: string) => url.replace(/\/+$/, "");

/** URL the browser uses to reach the API. */
export const PUBLIC_API_URL = trim(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");

/** URL the Next.js server uses (can be an internal address). */
const SERVER_API_URL = trim(process.env.API_URL || PUBLIC_API_URL);

/** Seconds a server-rendered page may be served from cache before refetching. */
const REVALIDATE_SECONDS = 15;

function merge(json: Partial<FestData> | null | undefined): FestData {
  const out = { ...STATIC_FEST_DATA };
  if (!json) return out;
  for (const key of Object.keys(STATIC_FEST_DATA) as (keyof FestData)[]) {
    const value = json[key];
    if (value !== undefined && value !== null) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

/** Server-side: fetch the bundle (cached + revalidated), falling back to static data. */
export async function getFestData(): Promise<FestData> {
  try {
    const res = await fetch(`${SERVER_API_URL}/api/public/bundle`, {
      next: { revalidate: REVALIDATE_SECONDS },
    } as RequestInit);
    if (!res.ok) throw new Error(`API responded ${res.status}`);
    return merge((await res.json()) as Partial<FestData>);
  } catch (err) {
    console.warn("[festData] API unavailable, using static data:", (err as Error).message);
    return STATIC_FEST_DATA;
  }
}

/** Browser-side: fetch the latest bundle; returns null on failure. */
export async function fetchFestDataClient(): Promise<FestData | null> {
  try {
    const res = await fetch(`${PUBLIC_API_URL}/api/public/bundle`, { cache: "no-store" });
    if (!res.ok) return null;
    return merge((await res.json()) as Partial<FestData>);
  } catch {
    return null;
  }
}

export function findTeam(teams: Team[], slug: string | undefined | null): Team | undefined {
  return slug ? teams.find((t) => t.slug === slug) : undefined;
}

export function findEvent(events: FestEvent[], slug: string): FestEvent | undefined {
  return events.find((e) => e.slug === slug);
}
