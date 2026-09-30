"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PortalCore } from "@/components/art/PortalCore";
import { CTA } from "@/components/ui/CTA";
import { useArenaReady } from "@/lib/hooks/useArenaReady";
import { useMouseParallax } from "@/lib/hooks/useMouseParallax";
import { EASE } from "@/lib/motion";
import type { MotionStyle } from "framer-motion";
import { FEST_STATS, HUD, SITE } from "@/data/site";

/**
 * HERO — the strongest composition on the site.
 *
 * Layers (back to front): portal artefact -> title block -> HUD frame.
 * Each layer moves at a different rate with the pointer, which produces depth
 * without the nausea of large translations (max ~26px of travel).
 */
export function Hero() {
  const ready = useArenaReady();
  const reduce = useReducedMotion();
  const p = useMouseParallax(1);
  /** Per-layer parallax offset. Returns a plain (empty) style for reduced motion. */
  const depth = (k: number): MotionStyle =>
    reduce ? {} : { x: p.x * 26 * k, y: p.y * 18 * k };

  const t = { duration: 1.05, ease: EASE };

  return (
    <section
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-[var(--nav-h)]"
      data-cursor-label=""
      aria-label="ASHVAMEDHA 2026 — the battle begins"
    >
      {/* ---- layer 01: portal artefact (slowest) ---- */}
      <motion.div className="absolute inset-0 -z-10" style={depth(1)}>
        <PortalCore />
      </motion.div>

      {/* ---- layer 02: horizon fog ---- */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[42vh] bg-gradient-to-t from-void via-void/80 to-transparent"
        style={depth(0.4)}
      />

      {/* ---- layer 03: content ---- */}
      <div className="shell relative w-full">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <motion.div
            className="lg:col-span-8 xl:col-span-7"
            style={depth(-0.35)}
            initial="hidden"
            animate={ready ? "show" : "hidden"}
            variants={{ show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } } }}
          >
            {/* HUD status rail */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: t } }}
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              <span className="flex items-center gap-2 border border-crimson/40 bg-crimson/10 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-crimson animate-live-pulse" />
                <span className="hud text-white/90">{HUD.eventStatus}</span>
              </span>
              <span className="hud">{HUD.season}</span>
              <span className="hud hidden sm:inline">{SITE.arena}</span>
            </motion.div>

            {/* Titans: ASHVAMEDHA / 2026 / tagline */}
            <h1 className="mt-6">
              <span className="sr-only">
                ASHVAMEDHA 2026 — {SITE.tagline}, {SITE.hostLong}
              </span>

              <span
                aria-hidden
                className="block overflow-hidden"
                style={{ perspective: 1000 }}
              >
                <motion.span
                  variants={{
                    hidden: { y: "78%", opacity: 0, rotateX: -38 },
                    show: { y: "0%", opacity: 1, rotateX: 0, transition: { duration: 1.25, ease: EASE } },
                  }}
                  className="text-titan text-metal block text-[clamp(3.1rem,12.4vw,13.5rem)]"
                  style={{ transformOrigin: "50% 100%" }}
                >
                  ASHVAMEDHA
                </motion.span>
              </span>

              <span aria-hidden className="mt-1 flex items-end gap-4 sm:gap-6">
                <motion.span
                  variants={{
                    hidden: { opacity: 0, x: -30 },
                    show: { opacity: 1, x: 0, transition: { duration: 1, ease: EASE } },
                  }}
                  className="text-titan block text-[clamp(2.2rem,7vw,6rem)] text-crimson"
                  style={{ textShadow: "0 0 60px rgba(225,29,46,0.55)" }}
                >
                  2026
                </motion.span>
                <motion.span
                  variants={{
                    hidden: { opacity: 0, x: 24 },
                    show: { opacity: 1, x: 0, transition: { duration: 1, ease: EASE } },
                  }}
                  className="mb-1 hidden font-mono text-[10px] leading-relaxed tracking-hud text-silver-dim sm:block"
                >
                  SPORTS
                  <br />
                  FEST
                </motion.span>
              </span>
            </h1>

            {/* tagline */}
            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
              }}
              className="mt-7 flex items-center gap-4"
            >
              <span className="h-px w-10 shrink-0 bg-gradient-to-r from-crimson to-transparent" />
              <span className="text-titan text-shadow-cinema text-[clamp(1.05rem,2.4vw,1.9rem)] tracking-[0.06em] text-white">
                {SITE.tagline}
              </span>
            </motion.p>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 18 },
                show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
              }}
              className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-silver-dim"
            >
              Ten pluse sports. twenty pluse teams. Three days under the arena lights at{" "}
              <span className="text-silver">{SITE.hostLong}</span>. This is not just a sports
              fest — this is the battle for glory.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 22 },
                show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
              }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <CTA
                href={SITE.registrationUrl}
                external
                variant="primary"
                className="!px-7 !py-4"
              >
                Register Now
              </CTA>
              <CTA href="/events" variant="ghost" className="!px-7 !py-4" icon={<ArrowRight className="h-4 w-4" />}>
                Explore Events
              </CTA>
            </motion.div>

            {/* stat rail */}
            <motion.dl
              variants={{
                hidden: { opacity: 0, y: 22 },
                show: { opacity: 1, y: 0, transition: { duration: 1, ease: EASE } },
              }}
              className="mt-11 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4"
            >
              {FEST_STATS.map((s) => (
                <div key={s.label}>
                  <dt className="hud">{s.label}</dt>
                  <dd className="mt-1 font-display text-[1.9rem] leading-none text-white">
                    {s.value}
                  </dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          {/* ---- layer 04: HUD console (desktop only) ---- */}
          <motion.aside
            className="hidden lg:col-span-4 lg:block xl:col-span-5"
            style={depth(-0.7)}
            initial={{ opacity: 0, x: 40 }}
            animate={ready ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.75 }}
          >
            <div className="ml-auto max-w-sm panel clip-notch p-6">
              <div className="flex items-center justify-between">
                <span className="hud text-crimson/90">ARENA CONSOLE</span>
                <span className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-crimson animate-live-pulse" />
                  <span className="hud text-white/80">LIVE</span>
                </span>
              </div>

              <div className="mt-5 space-y-4 font-mono text-[11px] tracking-wider text-silver-dim">
                {[
                  ["SYSTEM", HUD.status],
                  ["ARENA", "IIT BHUBANESWAR"],
                  ["SEASON", SITE.year],
                  ["EVENT WINDOW", "09 -11 OCT 2026"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-4 border-b border-white/5 pb-2">
                    <span>{k}</span>
                    <span className="text-white/90">{v}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <span className="tag !border-crimson/40 !text-crimson/90">REGISTRATION OPEN</span>
                <Link
                  href="/schedule"
                  className="link-underline font-mono text-[10px] tracking-hud text-silver-dim hover:text-white"
                >
                  VIEW SCHEDULE
                </Link>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>

      {/* scroll cue */}
      <motion.div
        className="absolute inset-x-0 bottom-6 flex justify-center"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 1, delay: 1.3 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="hud">SCROLL TO ENTER THE ARENA</span>
          <span className="relative h-10 w-px overflow-hidden bg-white/15">
            <motion.span
              className="absolute inset-x-0 top-0 h-4 bg-crimson"
              animate={{ y: ["-100%", "260%"] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: "easeInOut" }}
            />
          </span>
        </div>
      </motion.div>
    </section>
  );
}
