"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { STATIC_FEST_DATA, fetchFestDataClient, type FestData } from "@/lib/festData";

const FestDataContext = createContext<FestData>(STATIC_FEST_DATA);

/** Keeps client components in sync with the backend (refreshes in the background). */
const REFRESH_MS = 60_000;

export function FestDataProvider({ initial, children }: { initial: FestData; children: ReactNode }) {
  const [data, setData] = useState<FestData>(initial);

  useEffect(() => {
    let alive = true;
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      const next = await fetchFestDataClient();
      if (alive && next) setData(next);
    };
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
