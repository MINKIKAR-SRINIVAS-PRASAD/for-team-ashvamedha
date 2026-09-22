"use client";

import { useEffect, useState } from "react";
import { LIVE_MATCHES, type LiveMatch } from "@/data/liveScores";

/**
 * Live feed hook.
 *
 * Today it serves the mock payload from data/liveScores.ts. To go live, replace
 * the body of `fetchMatches` with a call to the scoring API — the shape is
 * already identical, so no component needs to change:
 *
 *   const res = await fetch("/api/live", { cache: "no-store" });
 *   return (await res.json()) as LiveMatch[];
 */
async function fetchMatches(): Promise<LiveMatch[]> {
  return LIVE_MATCHES;
}

export function useLiveFeed(pollMs = 30_000) {
  const [matches, setMatches] = useState<LiveMatch[]>(LIVE_MATCHES);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      const next = await fetchMatches();
      if (!alive) return;
      setMatches(next);
      setUpdatedAt(new Date());
    };

    void load();
    const id = window.setInterval(load, pollMs);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [pollMs]);

  return { matches, updatedAt };
}
