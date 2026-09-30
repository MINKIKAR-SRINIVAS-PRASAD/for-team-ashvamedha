"use client";

import { useEffect, useState } from "react";
import type { LiveMatch } from "@/data/liveScores";
import { useFestData } from "@/components/FestDataProvider";
import { PUBLIC_API_URL } from "@/lib/festData";

/**
 * Live feed hook — polls the backend's live ticker.
 * Starts from the server-rendered data (so there's no flash), then refreshes.
 * If the API is unreachable it keeps showing the last good data.
 */
async function fetchMatches(): Promise<LiveMatch[] | null> {
  try {
    const res = await fetch(`${PUBLIC_API_URL}/api/matches/live`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as LiveMatch[];
  } catch {
    return null;
  }
}

export function useLiveFeed(pollMs = 15_000) {
  const { liveMatches } = useFestData();
  const [matches, setMatches] = useState<LiveMatch[]>(liveMatches);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (document.visibilityState !== "visible") return;
      const next = await fetchMatches();
      if (!alive || !next) return;
      setMatches(next);
      setUpdatedAt(new Date());
    };

    void load();
    const id = window.setInterval(load, pollMs);
    document.addEventListener("visibilitychange", load);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", load);
    };
  }, [pollMs]);

  return { matches, updatedAt };
}
