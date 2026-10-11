"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { STATIC_FEST_DATA, fetchFestDataClient, type FestData } from "@/lib/festData";

const FestDataContext = createContext<FestData>(STATIC_FEST_DATA);

/**
 * The pages themselves render from the data in the code (data/*.ts). Only the parts
 * admins change during the fest come from the backend: the leaderboard and recent
 * results. They are fetched as soon as the page opens and then every 30 seconds.
 */
const REFRESH_MS = 30_000;
const LIVE_KEYS = ["rankings", "podium", "recentResults"] as const;

export function FestDataProvider({ initial, children }: { initial: FestData; children: ReactNode }) {
  const [data, setData] = useState<FestData>(initial);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      const next = await fetchFestDataClient();
      if (!alive || !next) return;
      setData((prev) => {
        const out = { ...prev };
        for (const key of LIVE_KEYS) {
          const value = next[key];
          // An empty leaderboard from the backend keeps the built-in rows.
          if (Array.isArray(value) && value.length > 0) Object.assign(out, { [key]: value });
        }
        return out;
      });
    };
    refresh();
    const id = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return <FestDataContext.Provider value={data}>{children}</FestDataContext.Provider>;
}

export function useFestData(): FestData {
  return useContext(FestDataContext);
}
