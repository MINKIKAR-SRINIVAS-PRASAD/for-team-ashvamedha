"use client";

import { useEffect, useState } from "react";
import type { LiveMatch } from "@/data/liveScores";
import { useFestData } from "@/components/FestDataProvider";
import { MatchCard } from "@/components/LiveScores";
import { PUBLIC_API_URL } from "@/lib/festData";

const GROUPS: { status: LiveMatch["status"]; label: string; empty: string }[] = [
  { status: "live", label: "// LIVE_NOW", empty: "No match is live right now." },
  { status: "upcoming", label: "// UP_NEXT", empty: "No upcoming matches scheduled yet." },
  { status: "final", label: "// RESULTS", empty: "No results yet." },
];

/**
 * Every match of one sport (live, upcoming and finished), refreshed every 30s.
 * Starts from the server-rendered ticker so there's no empty flash, and keeps the
 * last good data if the API can't be reached.
 */
export function EventLiveScores({ eventSlug, pollMs = 30_000 }: { eventSlug: string; pollMs?: number }) {
  const { liveMatches } = useFestData();
  const [matches, setMatches] = useState<LiveMatch[]>(() =>
    liveMatches.filter((m) => m.eventSlug === eventSlug),
  );
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const res = await fetch(`${PUBLIC_API_URL}/api/matches?event=${encodeURIComponent(eventSlug)}`, {
          cache: "no-store",
        });
        if (!res.ok || !alive) return;
        setMatches((await res.json()) as LiveMatch[]);
        setUpdatedAt(new Date());
      } catch {
        /* offline: keep showing the last good data */
      }
    };

    void load();
    const id = window.setInterval(load, pollMs);
    document.addEventListener("visibilitychange", load);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", load);
    };
  }, [eventSlug, pollMs]);

  return (
    <div className="space-y-10">
      {GROUPS.map((g) => {
        const list = matches.filter((m) => m.status === g.status);
        return (
          <div key={g.status}>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-volt" />
              <span className="hud text-volt/90">{g.label}</span>
              <span className="hud">({list.length})</span>
            </div>
            {list.length === 0 ? (
              <p className="mt-4 text-[0.9rem] text-silver-dim">{g.empty}</p>
            ) : (
              <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {list.map((m, i) => (
                  <MatchCard key={m.id} m={m} i={i} showLink={false} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      <p className="flex items-center gap-2 font-mono text-[10px] tracking-hud text-silver-dim">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Feed synced {updatedAt ? updatedAt.toLocaleTimeString("en-IN", { hour12: false }) : "—"} · updates
        every 30s
      </p>
    </div>
  );
}
