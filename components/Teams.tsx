"use client";

import { motion } from "framer-motion";
import { Trophy as TrophyIcon } from "lucide-react";
import { Crest } from "@/components/art/Crest";
import type { Team } from "@/data/teams";
import { useFestData } from "@/components/FestDataProvider";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * TEAMS — participant cards.
 * Hover expands the card, brightens the surface and lights the crest.
 * Each card carries an `id` matching the team slug so /teams#phoenix-brigade
 * deep-links from the leaderboard work.
 */
export function Teams({ limit }: { limit?: number }) {
  const { teams } = useFestData();
  const list = limit ? teams.slice(0, limit) : teams;

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {list.map((team, i) => (
        <TeamCard key={team.slug} team={team} index={i} />
      ))}
    </div>
  );
}

function TeamCard({ team, index }: { team: Team; index: number }) {
  return (
    <motion.article
      id={team.slug}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: EASE, delay: Math.min(index * 0.045, 0.4) }}
      className="group relative scroll-mt-28 overflow-hidden panel clip-notch p-5 transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.02]"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
    >
      {/* hover wash */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(ellipse at top, ${team.crest[0]}22, transparent 68%)`,
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="transition-transform duration-500 group-hover:scale-[1.06]" style={{ filter: "drop-shadow(0 0 0 transparent)" }}>
          <span
            className="block transition-[filter] duration-500 group-hover:[filter:drop-shadow(0_0_18px_var(--team-glow))]"
            style={{ ["--team-glow" as string]: `${team.crest[0]}bb` }}
          >
            <Crest name={team.name} colors={team.crest} size={62} />
          </span>
        </div>

        {team.rank ? (
          <span
            className="flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[9px] tracking-hud"
            style={{ borderColor: `${team.crest[0]}66`, color: team.crest[0] }}
          >
            <TrophyIcon className="h-3 w-3" />#{team.rank}
          </span>
        ) : (
          <span className="tag">UNSEEDED</span>
        )}
      </div>

      <h3 className="relative mt-4 text-[1.35rem] leading-none text-white">{team.name}</h3>

      <p className="relative mt-2 font-mono text-[9px] tracking-hud text-silver-dim">
        {team.sport.toUpperCase()}
      </p>

      <dl className="relative mt-4 space-y-1.5 border-t border-white/10 pt-3.5 text-[0.8rem]">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-mono text-[9px] tracking-hud text-silver-dim">INSTITUTE</dt>
          <dd className="truncate text-right text-silver">{team.institution}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-mono text-[9px] tracking-hud text-silver-dim">DEPT</dt>
          <dd className="truncate text-right text-silver-dim">{team.department}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="font-mono text-[9px] tracking-hud text-silver-dim">CAPTAIN</dt>
          <dd className="text-right text-white">{team.captain}</dd>
        </div>
      </dl>

      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${team.crest[0]}, transparent)` }}
      />
    </motion.article>
  );
}

/** Compact crest + name strip used for podium lists and results pages. */
export function TeamChip({ slug, className }: { slug: string; className?: string }) {
  const { teams } = useFestData();
  const team = teams.find((t) => t.slug === slug);
  if (!team) return null;
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <Crest name={team.name} colors={team.crest} size={26} />
      <span className="text-[0.9rem] text-white">{team.name}</span>
    </span>
  );
}
