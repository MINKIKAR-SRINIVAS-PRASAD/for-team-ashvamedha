"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { HudStrip } from "@/components/BackgroundEffects";
import { CTA } from "@/components/ui/CTA";
import { FEST_STATS, HUD, SITE } from "@/data/site";

export function Introduction() {
  return (
    <section
      className="relative overflow-hidden pt-0 pb-16 sm:pb-20 lg:pb-24"
      aria-labelledby="intro-heading"
    >
      {/* ============================================================
          OVERSIZED BACKGROUND YEAR
         ============================================================ */}

      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[clamp(14rem,42vw,40rem)] leading-none tracking-tighter text-white/[0.028]"
      >
        2026
      </span>

      <div className="pointer-events-none absolute inset-0 layer-grid opacity-40" />

      <div className="shell relative">

        {/* ============================================================
            FEST PROTOCOL
           ============================================================ */}

        <Reveal
          y={16}
          blur={false}
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-crimson" />

            <span className="hud text-crimson/90">
              {"// FEST_PROTOCOL"}
            </span>
          </div>
        </Reveal>

        {/* ============================================================
            MAIN HEADLINE
           ============================================================ */}

        <h2
          id="intro-heading"
          className="mt-5 max-w-5xl text-[clamp(2.1rem,6.4vw,5.6rem)] leading-[0.95] text-white"
        >
          <motion.span
            className="block"
            initial={{
              opacity: 0,
              y: 24,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.7,
              ease: "easeOut",
            }}
          >
            ONE ARENA.
          </motion.span>

          <motion.span
            className="block text-metal"
            initial={{
              opacity: 0,
              y: 24,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.7,
              delay: 0.12,
              ease: "easeOut",
            }}
          >
            MANY CHAMPIONS.
          </motion.span>

          <motion.span
            className="block text-crimson"
            initial={{
              opacity: 0,
              y: 24,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.2,
            }}
            transition={{
              duration: 0.7,
              delay: 0.24,
              ease: "easeOut",
            }}
          >
            ONE LEGACY.
          </motion.span>
        </h2>

        {/* ============================================================
            MAIN CONTENT
           ============================================================ */}

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">

          {/* ==========================================================
              LEFT COLUMN
             ========================================================== */}

          <Reveal
            className="lg:col-span-5"
            delay={0.1}
          >
            <p className="text-[1.02rem] leading-relaxed text-silver-dim">
              ASHVAMEDHA is the annual sports fest of{" "}
              <span className="text-silver">
                {SITE.hostLong}
              </span>{" "}
              — three days in which the campus stops
              being a campus and becomes an arena. Group
              stages run from first light, finals close under
              the floodlights, and a single table decides who
              leaves with the Ashvamedha Shield.
            </p>

            <p className="mt-5 text-[1.02rem] leading-relaxed text-silver-dim">
              Ten pluse sports. twenty pluse teams. Three
              days under the arena lights at{" "}
              <span className="text-silver">
                {SITE.hostLong}
              </span>
              . Every court, every board, every server room
              becomes a battlefield with a scoreboard
              attached.
            </p>

            <div className="mt-7">
              <HudStrip
                items={[
                  HUD.status,
                  HUD.eventStatus,
                  HUD.season,
                  HUD.uptime,
                ]}
              />
            </div>
          </Reveal>

          {/* ==========================================================
              WHY IT MATTERS
             ========================================================== */}

          <Reveal
            className="lg:col-span-4"
            delay={0.18}
          >
            <div className="panel clip-notch h-full p-6">
              <span className="hud text-crimson/90">
                {"// WHY IT MATTERS"}
              </span>

              <ul className="mt-5 space-y-4">
                {[
                  {
                    k: "Scale",
                    v: "10+ disciplines from football to chess, all inside one 72-hour window.",
                  },
                  {
                    k: "Standard",
                    v: "Certified officials, electronic timing and photo-finish review at every final.",
                  },
                  {
                    k: "Spectacle",
                    v: "Four-camera arena broadcast, live commentary and a closing podium ceremony.",
                  },
                ].map((row) => (
                  <li
                    key={row.k}
                    className="flex gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0"
                  >
                    <span className="mt-0.5 shrink-0 font-mono text-[10px] tracking-hud text-crimson/80">
                      {row.k.toUpperCase()}
                    </span>

                    <span className="text-[0.9rem] leading-relaxed text-silver-dim">
                      {row.v}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          {/* ==========================================================
              STATS
             ========================================================== */}

          <Reveal
            className="lg:col-span-3"
            delay={0.26}
          >
            <div className="flex h-full flex-col justify-between gap-8">
              <dl className="space-y-5">
                {FEST_STATS.map((s) => (
                  <div
                    key={s.label}
                    className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3"
                  >
                    <dt className="hud">
                      {s.label}
                    </dt>

                    <dd className="font-display text-2xl text-white">
                      {s.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <CTA
                href="/events"
                variant="ghost"
                className="w-full"
              >
                View All Events
              </CTA>
            </div>
          </Reveal>
        </div>

        {/* ============================================================
            MANIFESTO STRIP
           ============================================================ */}

        <Reveal
          delay={0.1}
          className="mt-12"
        >
          <div className="hairline" />

          <div className="mt-7 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: "01",
                t: "Power",
                d: "Strength events judged on audited lifts and technique.",
              },
              {
                n: "02",
                t: "Rivalry",
                d: "Inter-institute brackets that settle old scores.",
              },
              {
                n: "03",
                t: "Teamwork",
                d: "Relays, squads and relays-within-relays.",
              },
              {
                n: "04",
                t: "Legacy",
                d: "One shield, one table, one permanent record.",
              },
            ].map((c) => (
              <div
                key={c.n}
                className="group"
              >
                <span className="font-mono text-[10px] tracking-hud text-crimson/80">
                  {c.n}
                </span>

                <h3 className="mt-2 text-xl text-white transition-colors duration-300 group-hover:text-crimson">
                  {c.t}
                </h3>

                <p className="mt-2 text-[0.88rem] leading-relaxed text-silver-dim">
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}