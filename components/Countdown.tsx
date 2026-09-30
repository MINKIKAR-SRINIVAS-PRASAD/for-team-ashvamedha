"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useCountdown } from "@/lib/hooks/useCountdown";
import { EASE } from "@/lib/motion";
import { SITE } from "@/data/site";
import { pad } from "@/lib/utils";

/**
 * COUNTDOWN — "THE DOOMSDAY CLOCK".
 *
 * Four glass/metal panels with tabular figures so the digits never reflow as
 * the seconds tick. Seconds animate with a subtle scale pulse.
 */
export function Countdown() {
  const reduce = useReducedMotion();
  const clock = useCountdown(SITE.startsAt);

  const units = [
    { label: "Days", value: pad(clock.days, 2) },
    { label: "Hours", value: pad(clock.hours, 2) },
    { label: "Minutes", value: pad(clock.minutes, 2) },
    { label: "Seconds", value: pad(clock.seconds, 2) },
  ];

  return (
    <section className="section-pad relative" aria-label="Countdown to ASHVAMEDHA 2026">
      <div className="shell">
        <div className="panel clip-notch relative overflow-hidden px-5 py-10 sm:px-10 sm:py-14">
          {/* interior atmosphere */}
          <div className="pointer-events-none absolute inset-0 layer-scanlines opacity-25" />
          <div className="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-[radial-gradient(ellipse_at_center,rgba(225,29,46,0.28),transparent_70%)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-crimson/60 to-transparent" />

          <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center gap-3 lg:justify-start">
                <span className="h-1.5 w-1.5 rounded-full bg-crimson animate-live-pulse" />
                <span className="hud text-crimson/90">{"// COUNTDOWN_PROTOCOL"}</span>
              </div>
              <h2 className="mt-3 text-[clamp(1.6rem,3.6vw,2.9rem)] leading-none text-white">
                {clock.elapsed ? "THE ARENA IS OPEN" : "THE DOOMSDAY CLOCK"}
              </h2>
              <p className="mt-2.5 max-w-md text-sm text-silver-dim">
                {clock.elapsed
                  ? "Opening ceremony in progress at IIT Bhubaneswar."
                  : "Opening ceremony · 09 October 2026, 09:00 IST · Main Ground."}
              </p>
            </div>

            <div className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
              {units.map((u, i) => (
                <motion.div
                  key={u.label}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.7, ease: EASE, delay: i * 0.08 }}
                  className="group relative overflow-hidden border border-white/10 bg-gradient-to-b from-carbon/90 to-void/90 px-3 py-4 text-center sm:px-5 sm:py-6"
                >
                  {/* brushed metal top edge */}
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,rgba(225,29,46,0.22),transparent_65%)]" />

                  <motion.span
                    key={u.value}
                    initial={reduce || u.label !== "Seconds" ? undefined : { scale: 1.06, opacity: 0.6 }}
                    animate={reduce || u.label !== "Seconds" ? undefined : { scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35 }}
                    className="relative block font-display text-[clamp(2rem,5.2vw,3.6rem)] leading-none tabular-nums text-white"
                    style={{ textShadow: "0 0 30px rgba(225,29,46,0.28)" }}
                  >
                    {u.value}
                  </motion.span>

                  <span className="relative mt-2 block font-mono text-[10px] tracking-hud text-silver-dim">
                    {u.label.toUpperCase()}
                  </span>
                  <span className="pointer-events-none absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-crimson to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
