"use client";

import { motion } from "framer-motion";
import { Crown, Flame, Shield } from "lucide-react";
import { Trophy } from "@/components/art/Trophy";
import { Crest } from "@/components/art/Crest";
import { useFestData } from "@/components/FestDataProvider";
import { findTeam } from "@/lib/festData";
import { EASE } from "@/lib/motion";

/**
 * CHAMPION SPOTLIGHT — "WHO WILL RISE?"
 * The only section where gold is allowed to dominate. Trophy, reigning champion
 * and the three contenders, plus the recent edition roll-call.
 */
export function ChampionSpotlight() {
  const {
    championSpotlight: CHAMPION_SPOTLIGHT,
    podium: PODIUM,
    previousEditions: EDITIONS,
    teams,
  } = useFestData();
  const reigning =
    teams.find((t) => t.name === CHAMPION_SPOTLIGHT.reigning) ?? findTeam(teams, "phoenix-brigade");

  return (
    <section className="relative overflow-hidden" aria-labelledby="champions-heading">
      {/* gold-tinted championship glow — the one place gold is allowed to lead */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[70vh] w-[110vw] -translate-x-1/2 -translate-y-1/3 bg-[radial-gradient(ellipse_at_center,rgba(232,196,106,0.16),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 layer-grid opacity-30" />

      <div className="shell relative">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="flex items-center gap-3"
          >
            <span className="h-px w-10 bg-gold/60" />
            <span className="hud text-gold/90">{"// CHAMPIONSHIP_PROTOCOL"}</span>
            <span className="h-px w-10 bg-gold/60" />
          </motion.div>

          <motion.h2
            id="champions-heading"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.85, ease: EASE, delay: 0.08 }}
            className="mt-4 text-[clamp(2.2rem,7vw,5.5rem)] leading-[0.9] text-white"
          >
            WHO WILL RISE?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.8, delay: 0.16 }}
            className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-silver-dim"
          >
            Three squads are still mathematically alive. One shield leaves the arena on the
            closing night.
          </motion.p>
        </div>

        {/* trophy + reigning champion */}
        <div className="mt-14 grid items-center gap-12 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 28 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 1, ease: EASE }}
            className="flex justify-center lg:col-span-4"
          >
            <div className="relative">
              <div className="absolute left-1/2 top-1/2 h-[105%] w-[105%] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-dashed border-gold/20" />
              <Trophy className="h-[300px] w-auto animate-drift sm:h-[360px]" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 34 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="lg:col-span-8"
          >
            <div
              className="relative overflow-hidden panel clip-notch p-7"
              style={{ boxShadow: "0 0 0 1px rgba(232,196,106,0.35), 0 40px 120px -60px rgba(232,196,106,0.9)" }}
            >
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-gold" />
                  <span className="hud text-gold/90">REIGNING CHAMPION</span>
                </span>
                <span className="hud">{CHAMPION_SPOTLIGHT.reigningSport}</span>
              </div>

              <div className="mt-6 flex items-center gap-5">
                {reigning && <Crest name={reigning.name} colors={reigning.crest} size={64} />}
                <div>
                  <h3 className="text-[clamp(1.7rem,4vw,2.8rem)] leading-none text-white">
                    {CHAMPION_SPOTLIGHT.reigning}
                  </h3>
                  <p className="mt-2 flex items-center gap-2 font-mono text-[10px] tracking-hud text-gold/80">
                    <Flame className="h-3.5 w-3.5" />
                    {CHAMPION_SPOTLIGHT.streak.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* contenders */}
              <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">
                {CHAMPION_SPOTLIGHT.contenders.map((c, i) => (
                  <div key={c.name} className="group">
                    <span className="font-mono text-[9px] tracking-hud text-silver-dim">
                      CONTENDER {String(i + 2).padStart(2, "0")}
                    </span>
                    <p className="mt-1.5 text-[1.02rem] text-white transition-colors duration-300 group-hover:text-gold">
                      {c.name}
                    </p>
                    <p className="mt-1.5 text-[0.78rem] leading-snug text-silver-dim">{c.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* podium strip */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {PODIUM.map((row, i) => {
            const team = findTeam(teams, row.teamSlug);
            const tone = ["gold", "silver", "bronze"][i];
            const color = team?.crest[0] ?? "#e8c46a";
            return (
              <motion.div
                key={row.teamSlug}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: EASE, delay: i * 0.1 }}
                className="group relative overflow-hidden border border-white/10 bg-void/60 p-5 transition-transform duration-500 hover:-translate-y-1"
              >
                <span
                  className="absolute left-0 top-0 h-full w-[3px]"
                  style={{ background: color }}
                />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] tracking-hud" style={{ color }}>
                    {tone.toUpperCase()} · #{row.rank}
                  </span>
                  <Shield className="h-3.5 w-3.5 text-silver-dim" />
                </div>
                <p className="mt-3 text-[1.15rem] text-white">{row.team}</p>
                <p className="mt-1 font-mono text-[10px] tracking-hud text-silver-dim">
                  {row.points} POINTS · {row.matches} MATCHES
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* previous editions */}
        <div className="mt-14">
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-white/20" />
            <span className="hud">{"// ARCHIVE"}</span>
          </div>
          <div className="no-scrollbar mt-5 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10">
                  {["Edition", "Champion", "Sports", "Teams"].map((h) => (
                    <th key={h} className="px-3 py-3 font-mono text-[9px] font-normal uppercase tracking-hud text-silver-dim">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EDITIONS.map((e) => (
                  <tr key={e.year} className="border-b border-white/[0.06]">
                    <td className="px-3 py-3.5 font-display text-lg text-white/80">{e.year}</td>
                    <td className="px-3 py-3.5 text-[0.9rem] text-white">{e.champion}</td>
                    <td className="px-3 py-3.5 font-mono text-sm text-silver-dim">{e.sports}</td>
                    <td className="px-3 py-3.5 font-mono text-sm text-silver-dim">{e.teams}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
