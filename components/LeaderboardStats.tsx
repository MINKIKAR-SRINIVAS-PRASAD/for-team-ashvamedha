"use client";

import { useFestData } from "@/components/FestDataProvider";
import { winPercent } from "@/data/leaderboard";

/** Summary numbers above the table; follows the live leaderboard. */
export function LeaderboardStats() {
  const { rankings } = useFestData();
  const best = [...rankings].sort((a, b) => winPercent(b) - winPercent(a))[0];
  const totalMatches = rankings.reduce((sum, r) => sum + r.matches, 0);

  return (
    <dl className="mt-9 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4">
      {[
        { k: "Ranked Squads", v: String(rankings.length) },
        { k: "Fixtures Played", v: String(totalMatches) },
        { k: "Best Win %", v: `${best ? winPercent(best).toFixed(1) : "0.0"}%` },
        { k: "Points at Stake", v: "180" },
      ].map((s) => (
        <div key={s.k}>
          <dt className="hud">{s.k}</dt>
          <dd className="mt-1 font-display text-3xl leading-none text-white">{s.v}</dd>
        </div>
      ))}
    </dl>
  );
}
