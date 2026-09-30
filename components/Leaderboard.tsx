"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Crown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LEADERBOARD_COLUMNS, winPercent, type RankingRow } from "@/data/leaderboard";
import { useFestData } from "@/components/FestDataProvider";
import { findTeam } from "@/lib/festData";
import { EASE } from "@/lib/motion";
import { cn, pad } from "@/lib/utils";

type SortKey = "rank" | "points" | "wins" | "winPct";

/** Medal treatment — reserved exclusively for the championship podium. */
const MEDAL: Record<number, { ring: string; text: string; glow: string; label: string }> = {
  1: {
    ring: "border-gold/60",
    text: "text-gold",
    glow: "0 0 0 1px rgba(232,196,106,0.35), 0 24px 70px -40px rgba(232,196,106,0.9)",
    label: "GOLD",
  },
  2: {
    ring: "border-silver/50",
    text: "text-silver",
    glow: "0 0 0 1px rgba(215,222,233,0.28), 0 24px 70px -42px rgba(215,222,233,0.7)",
    label: "SILVER",
  },
  3: {
    ring: "border-bronze/50",
    text: "text-bronze",
    glow: "0 0 0 1px rgba(192,122,69,0.3), 0 24px 70px -42px rgba(192,122,69,0.7)",
    label: "BRONZE",
  },
};

/**
 * BATTLE RANKINGS — the championship table.
 *
 * Desktop renders a full grid; below `md` the same table becomes horizontally
 * scrollable rather than collapsing into cards, so the column relationships
 * (which are the whole point of a leaderboard) survive on a phone.
 */
export function Leaderboard({ compact = false, rows: rowsProp }: { compact?: boolean; rows?: RankingRow[] }) {
  const { rankings, teams } = useFestData();
  const rows = rowsProp ?? rankings;
  const [sort, setSort] = useState<SortKey>("rank");
  const reduce = useReducedMotion();

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      if (sort === "points") return b.points - a.points;
      if (sort === "wins") return b.wins - a.wins;
      if (sort === "winPct") return winPercent(b) - winPercent(a);
      return a.rank - b.rank;
    });
    return copy;
  }, [rows, sort]);

  const maxPct = 100;

  return (
    <div className="panel clip-notch overflow-hidden">
      {/* toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-4 w-4 text-crimson" />
          <span className="hud text-crimson/90">{"// RANKING_SYSTEM"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="hud mr-1 hidden sm:inline">SORT</span>
          {([
            ["rank", "Rank"],
            ["points", "Points"],
            ["wins", "Wins"],
            ["winPct", "Win %"],
          ] as [SortKey, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSort(key)}
              aria-pressed={sort === key}
              className={cn(
                "border px-3 py-1.5 font-mono text-[9px] uppercase tracking-hud transition-colors duration-300",
                sort === key
                  ? "border-volt/60 bg-volt/10 text-white"
                  : "border-white/12 text-silver-dim hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* table (horizontally scrollable on small screens) */}
      <div className="no-scrollbar overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">
            ASHVAMEDHA 2026 championship standings — rank, team, matches, wins, losses, points
            and win percentage.
          </caption>
          <thead>
            <tr className="border-b border-white/10 bg-void/40">
              {LEADERBOARD_COLUMNS.map((col) => (
                <th
                  key={col}
                  scope="col"
                  className={cn(
                    "whitespace-nowrap px-4 py-3.5 font-mono text-[9px] font-normal uppercase tracking-hud text-silver-dim",
                    col === "Team" ? "text-left" : "text-center",
                  )}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => {
              const medal = MEDAL[row.rank];
              const pct = winPercent(row);
              const team = findTeam(teams, row.teamSlug);

              return (
                <motion.tr
                  key={row.teamSlug}
                  initial={reduce ? undefined : { opacity: 0, y: 16 }}
                  whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.035, 0.45) }}
                  className={cn(
                    "group relative border-b border-white/[0.06] transition-colors duration-300 hover:bg-white/[0.03]",
                    medal && "bg-white/[0.02]",
                  )}
                  style={medal ? { boxShadow: medal.glow } : undefined}
                >
                  {/* rank */}
                  <td className="whitespace-nowrap px-4 py-4">
                    <span className="flex items-center justify-center gap-2">
                      {row.rank === 1 && <Crown className={cn("h-4 w-4", medal?.text)} />}
                      <span
                        className={cn(
                          "font-display text-lg leading-none",
                          medal ? medal.text : "text-silver-dim",
                        )}
                      >
                        {pad(row.rank)}
                      </span>
                    </span>
                  </td>

                  {/* team */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "h-8 w-1 shrink-0 transition-all duration-300 group-hover:h-10",
                          medal ? "" : "bg-white/12",
                        )}
                        style={medal ? { background: team?.crest[0] ?? "#e11d2e" } : undefined}
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/teams#${row.teamSlug}`}
                          className={cn(
                            "link-underline block truncate text-[0.95rem] font-medium transition-colors duration-300 group-hover:text-white",
                            medal ? "text-white" : "text-silver",
                          )}
                        >
                          {row.team}
                        </Link>
                        <span className="font-mono text-[9px] tracking-hud text-silver-dim">
                          {medal ? `${medal.label} · ` : ""}
                          {team?.sport.toUpperCase() ?? "MULTI-SPORT"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-center font-mono text-sm text-silver-dim">{row.matches}</td>
                  <td className="px-4 py-4 text-center font-mono text-sm text-white">{row.wins}</td>
                  <td className="px-4 py-4 text-center font-mono text-sm text-silver-dim">{row.losses}</td>

                  <td className="px-4 py-4 text-center">
                    <span className={cn("font-display text-lg leading-none", medal ? medal.text : "text-white")}>
                      {row.points}
                    </span>
                  </td>

                  {/* win % with rail */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <span className="hidden h-[3px] w-20 overflow-hidden bg-white/10 lg:block">
                        <motion.span
                          className="block h-full origin-left"
                          style={{
                            background: team?.crest[0] ?? "#e11d2e",
                          }}
                          initial={{ scaleX: 0 }}
                          whileInView={{ scaleX: pct / maxPct }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
                        />
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-silver">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!compact && (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-5 py-4">
          <p className="font-mono text-[10px] tracking-hud text-silver-dim">
            Standings recalculated after every completed fixture ·
          </p>
          <p className="font-mono text-[10px] tracking-hud text-silver-dim">
            Scroll horizontally on smaller screens
          </p>
        </div>
      )}
    </div>
  );
}
