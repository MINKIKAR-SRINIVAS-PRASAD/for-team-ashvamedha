/**
 * FEST DATA — single bridge between the site and the backend.
 *
 * Every page gets its data from GET /api/public/bundle.
 *
 * The backend contains the official event data.
 * Static frontend data remains the fallback.
 *
 * Additional frontend-only events and gallery entries are
 * preserved even when the API does not return them.
 */

import {
  EVENTS,
  FEATURED_SLUGS,
  type FestEvent,
} from "@/data/events";

import {
  TEAMS,
  type Team,
} from "@/data/teams";

import {
  DAYS,
  SCHEDULE,
  type ScheduleSlot,
} from "@/data/schedule";

import {
  CHAMPION_SPOTLIGHT,
  PODIUM,
  RANKINGS,
  type RankingRow,
} from "@/data/leaderboard";

import {
  EVENT_CHAMPIONS,
  PODIUM_2025,
  PREVIOUS_EDITIONS,
  RECENT_RESULTS,
  type LiveMatch,
} from "@/data/liveScores";

import {
  GALLERY,
  type GalleryItem,
} from "@/data/gallery";

import {
  SPONSORS,
  type Sponsor,
} from "@/data/sponsors";

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
  contenders: readonly {
    name: string;
    note: string;
  }[];
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

  payment: {
    upiId: string | null;
    payeeName: string | null;
  };
}

/**
 * Static fallback data.
 *
 * Event and gallery images are defined in:
 * data/events.ts
 * data/gallery.ts
 */
export const STATIC_FEST_DATA: FestData = {
  events: EVENTS,

  featuredSlugs: [...FEATURED_SLUGS],

  teams: TEAMS,

  days: [...DAYS],

  schedule: SCHEDULE,

  rankings: RANKINGS,

  podium: PODIUM,

  championSpotlight: CHAMPION_SPOTLIGHT,

  // Do not show invented scores when the backend is unavailable.
  liveMatches: [],

  recentResults: RECENT_RESULTS,

  eventChampions: EVENT_CHAMPIONS,

  podium2025: PODIUM_2025,

  previousEditions: PREVIOUS_EDITIONS,

  gallery: GALLERY,

  sponsors: SPONSORS,

  payment: {
    upiId: null,
    payeeName: null,
  },
};

const trim = (url: string) => url.replace(/\/+$/, "");

/**
 * Browser-side API URL.
 */
export const PUBLIC_API_URL = trim(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
);

/**
 * Server-side API URL.
 */
const SERVER_API_URL = trim(
  process.env.API_URL || PUBLIC_API_URL,
);

/**
 * Server cache duration.
 */
const REVALIDATE_SECONDS = 15;

/**
 * Merge API data with static fallback data.
 *
 * - Keeps frontend-only events and gallery items.
 * - Preserves static image paths when matching API items exist.
 * - Prevents null image values from removing local photos.
 * - Retains the rest of the API data.
 */
function merge(
  json: Partial<FestData> | null | undefined,
): FestData {
  const out: FestData = {
    ...STATIC_FEST_DATA,
  };

  if (!json) {
    return out;
  }

  /**
   * Merge normal bundle fields.
   *
   * Events and gallery receive special handling below.
   */
  for (const key of Object.keys(
    STATIC_FEST_DATA,
  ) as (keyof FestData)[]) {
    if (key === "events" || key === "gallery") {
      continue;
    }

    const value = json[key];

    if (value !== undefined && value !== null) {
      Object.assign(out, {
        [key]: value,
      });
    }
  }

  /**
   * EVENTS
   *
   * API events remain first.
   * Static events missing from the API are appended.
   * Static image paths take priority for matching events.
   */
  if (json.events) {
    const staticBySlug = new Map(
      STATIC_FEST_DATA.events.map(
        (event) => [event.slug, event] as const,
      ),
    );

    const apiSlugs = new Set(
      json.events.map((event) => event.slug),
    );

    out.events = [
      ...json.events.map((event) => {
        const fallback = staticBySlug.get(event.slug);

        return {
          ...(fallback ?? {}),
          ...event,

          // Use the new local image when one is defined.
          image: fallback?.image || event.image || null,
        };
      }),

      ...STATIC_FEST_DATA.events.filter(
        (event) => !apiSlugs.has(event.slug),
      ),
    ];
  }

  /**
   * GALLERY
   *
   * API gallery entries remain first.
   * Static entries missing from the API are appended.
   * New local gallery image paths take priority for matching IDs.
   */
  if (json.gallery) {
    const staticById = new Map(
      STATIC_FEST_DATA.gallery.map(
        (item) => [item.id, item] as const,
      ),
    );

    const apiIds = new Set(
      json.gallery.map((item) => item.id),
    );

    out.gallery = [
      ...json.gallery.map((item) => {
        const fallback = staticById.get(item.id);

        return {
          ...(fallback ?? {}),
          ...item,

          // Keep the local gallery photo instead of an old API path.
          image: fallback?.image || item.image || null,
        };
      }),

      ...STATIC_FEST_DATA.gallery.filter(
        (item) => !apiIds.has(item.id),
      ),
    ];
  }

  return out;
}

/**
 * Server-side:
 * Fetch the current bundle.
 */
export async function getFestData(): Promise<FestData> {
  /**
   * During production builds, use the static data.
   * This avoids requiring the backend to be reachable
   * while Next.js pre-renders the website.
   */
  if (process.env.NODE_ENV === "production") {
    return STATIC_FEST_DATA;
  }

  try {
    const res = await fetch(
      `${SERVER_API_URL}/api/public/bundle`,
      {
        next: {
          revalidate: REVALIDATE_SECONDS,
        },
      } as RequestInit,
    );

    if (!res.ok) {
      throw new Error(`API responded ${res.status}`);
    }

    return merge(
      (await res.json()) as Partial<FestData>,
    );
  } catch (err) {
    console.warn(
      "[festData] API unavailable, using static data:",
      (err as Error).message,
    );

    return STATIC_FEST_DATA;
  }
}

/**
 * Browser-side:
 * Fetch the latest bundle without caching.
 */
export async function fetchFestDataClient(): Promise<FestData | null> {
  try {
    const res = await fetch(
      `${PUBLIC_API_URL}/api/public/bundle`,
      {
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return null;
    }

    const json = (await res.json()) as Partial<FestData>;

    return merge(json);
  } catch {
    return null;
  }
}

/**
 * Find a team by slug.
 */
export function findTeam(
  teams: Team[],
  slug: string | undefined | null,
): Team | undefined {
  return slug
    ? teams.find((team) => team.slug === slug)
    : undefined;
}

/**
 * Find an event by slug.
 */
export function findEvent(
  events: FestEvent[],
  slug: string,
): FestEvent | undefined {
  return events.find((event) => event.slug === slug);
}