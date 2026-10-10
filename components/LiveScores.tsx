"use client";

import { motion } from "framer-motion";
import { Radio } from "lucide-react";
import Link from "next/link";
import { useFestData } from "@/components/FestDataProvider";
import { FORMAT_LABEL, type LiveMatch } from "@/data/liveScores";
import { useLiveFeed } from "@/lib/hooks/useLiveFeed";
import { accentOf } from "@/lib/accents";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * LIVE SCORES — driven entirely by `useLiveFeed`.
 *
 * The hook serves mock data today; swapping it for a real scoring API requires
 * no change here because the payload shape is already identical.
 */
export function LiveScores({ showResults = true }: { showResults?: boolean }) {
  const { matches, updatedAt } = useLiveFeed();
  const { recentResults } = useFestData();

  return (
    <div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {matches.map((m, i) => (
          <MatchCard key={m.id} m={m} i={i} />
        ))}
      </div>

      <p className="mt-5 flex items-center gap-2 font-mono text-[10px] tracking-hud text-silver-dim">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Feed synced {updatedAt ? updatedAt.toLocaleTimeString("en-IN", { hour12: false }) : "—"} · polling
        every 30s
      </p>

      {/* results strip */}
      {showResults && (
        <div className="mt-10">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-volt" />
            <span className="hud text-volt/90">{"// COMPLETED_FIXTURES"}</span>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recentResults.map((r, i) => (
              <motion.li
                key={`${r.sport}-${r.winner}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                className="border border-white/10 bg-void/50 p-4"
              >
                <span className="font-mono text-[9px] tracking-hud text-silver-dim">
                  {r.sport.toUpperCase()} · {r.stage.toUpperCase()}
                </span>
                <p className="mt-2.5 text-[0.9rem] text-white">
                  {r.winner} <span className="text-silver-dim">def.</span> {r.loser}
                </p>
                <p className="mt-1 font-mono text-[11px] text-volt">{r.score}</p>
              </motion.li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** One scoreboard card; shared by the home ticker and each event page. */
export function MatchCard({ m, i = 0, showLink = true }: { m: LiveMatch; i?: number; showLink?: boolean }) {
  const a = accentOf(m.accent);
  const live = m.status === "live";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.65, ease: EASE, delay: i * 0.07 }}
      className="group relative overflow-hidden panel clip-notch"
    >
      {/* status bar */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
        <span className="flex items-center gap-2.5">
          {live ? (
            <>
              <span
                className="h-2 w-2 rounded-full animate-live-pulse"
                style={{ background: a.base }}
              />
              <span className="font-mono text-[10px] tracking-hud text-white">LIVE</span>
            </>
          ) : (
            <span className="font-mono text-[10px] tracking-hud text-silver-dim">
              {m.status === "final" ? "FINAL" : "UPCOMING"}
            </span>
          )}
        </span>
        <span
          className="font-mono text-[10px] tracking-hud"
          style={{ color: live ? a.base : undefined }}
        >
          {m.clock}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] tracking-hud text-silver-dim">
            {m.sport.toUpperCase()}
            {m.format ? ` · ${FORMAT_LABEL[m.format].toUpperCase()}` : ""}
          </span>
          <Radio className="h-3.5 w-3.5 text-silver-dim" />
        </div>

        {m.participants && m.participants.length > 2 ? (
          <TeamTable m={m} live={live} />
        ) : (
          <>
            {/* scoreline */}
            <div className="mt-5 space-y-3">
              {(["home", "away"] as const).map((key, si) => {
                const side = m[key];
                return (
                  <div key={`${key}-${side.name}`} className="flex items-center justify-between gap-4">
                    <span className={cn("min-w-0", si === 0 ? "text-white" : "text-silver")}>
                      <span className="block truncate text-[0.95rem]">{side.name}</span>
                      {m.sets && m.sets.length > 0 && (
                        <span className="mt-1 flex flex-wrap gap-1.5 font-mono text-[10px] tabular-nums text-silver-dim">
                          {m.sets.map((st, k) => (
                            <span
                              key={k}
                              className={cn(
                                "border border-white/10 px-1.5 py-0.5",
                                Number(st[key]) > Number(st[key === "home" ? "away" : "home"]) && "text-white",
                              )}
                            >
                              {st[key] || "0"}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                    <span
                      className={cn(
                        "font-display text-3xl leading-none tabular-nums",
                        live ? "text-white" : "text-silver-dim",
                      )}
                      style={live && si === 0 ? { textShadow: `0 0 24px ${a.base}66` } : undefined}
                    >
                      {side.score}
                    </span>
                  </div>
                );
              })}
            </div>
            {m.sets && m.sets.length > 0 && (
              <p className="mt-3 font-mono text-[9px] tracking-hud text-silver-dim">
                SETS WON{live ? ` · SET ${m.sets.length} IN PLAY` : ""}
              </p>
            )}
          </>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3.5">
          <span className="font-mono text-[9px] tracking-hud text-silver-dim">{m.detail}</span>
          {showLink && (
            <Link
              href={`/events/${m.eventSlug}`}
              className="font-mono text-[9px] tracking-hud text-white/80 transition-colors hover:text-white"
              data-cursor-label="VIEW"
            >
              VIEW EVENT →
            </Link>
          )}
        </div>
      </div>

      {/* hover energy floor */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: `linear-gradient(90deg, transparent, ${a.base}, transparent)` }}
      />
    </motion.article>
  );
}

/** Multi-team round (sports quiz): every team, highest score first. */
function TeamTable({ m, live }: { m: LiveMatch; live: boolean }) {
  const num = (v: number | string) => (typeof v === "number" ? v : Number.isNaN(Number(v)) ? -1 : Number(v));
  const rows = [...(m.participants ?? [])].sort((x, y) => num(y.score) - num(x.score));
  return (
    <ol className="mt-5 space-y-1.5">
      {rows.map((p, k) => (
        <li key={`${p.name}-${k}`} className="flex items-center justify-between gap-4">
          <span className={cn("flex min-w-0 items-center gap-2.5 text-[0.9rem]", k === 0 ? "text-white" : "text-silver")}>
            <span className="w-5 font-mono text-[10px] text-silver-dim">{String(k + 1).padStart(2, "0")}</span>
            <span className="truncate">{p.name}</span>
          </span>
          <span
            className={cn(
              "font-display text-xl leading-none tabular-nums",
              live || k === 0 ? "text-white" : "text-silver-dim",
            )}
          >
            {p.score}
          </span>
        </li>
      ))}
    </ol>
  );
}
