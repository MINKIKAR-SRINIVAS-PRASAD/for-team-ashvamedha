"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, Clock, MapPin, Users } from "lucide-react";
import { BattlefieldFrame } from "@/components/art/BattlefieldFrame";
import { SportGlyph } from "@/components/art/SportGlyph";
import { REGISTRATION_LABEL, type FestEvent } from "@/data/events";
import { accentOf } from "@/lib/accents";
import { EASE } from "@/lib/motion";
import { cn, pad } from "@/lib/utils";

/** Small status chip: open / closing soon / closed. */
function StatusChip({ state }: { state: FestEvent["registration"] }) {
  const tone =
    state === "open"
      ? "border-emerald-400/40 text-emerald-300/90"
      : state === "closing"
        ? "border-crimson/50 text-crimson"
        : "border-white/15 text-silver-dim";
  return (
    <span className={cn("tag", tone)}>
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          state === "open" ? "bg-emerald-400" : state === "closing" ? "bg-crimson animate-live-pulse" : "bg-silver-dim",
        )}
      />
      {REGISTRATION_LABEL[state]}
    </span>
  );
}

/**
 * EVENT ROW — the flagship alternating left/right battlefield row.
 * Reveals with cinematic horizontal movement from the side it sits on.
 */
export function EventRow({ event, index }: { event: FestEvent; index: number }) {
  const reduce = useReducedMotion();
  const a = accentOf(event.accent);
  const fromLeft = index % 2 === 0;

  return (
    <motion.article
      initial={reduce ? undefined : { opacity: 0, x: fromLeft ? -70 : 70, filter: "blur(10px)" }}
      whileInView={reduce ? undefined : { opacity: 1, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1, ease: EASE }}
      className={cn(
        "group relative grid items-center gap-8 border-t border-white/10 py-10 lg:grid-cols-12 lg:gap-12 lg:py-14",
      )}
      style={{ ["--accent" as string]: a.base }}
    >
      {/* accent spine */}
      <span
        className="pointer-events-none absolute left-0 top-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 group-hover:scale-x-100"
        style={{ background: `linear-gradient(90deg, ${a.base}, transparent)` }}
      />

      {/* ---- imagery ---- */}
      <div
        className={cn(
          "relative lg:col-span-7",
          !fromLeft && "lg:order-2",
        )}
      >
        <div className="relative overflow-hidden clip-notch">
          {event.image ? (
            <Image
              src={event.image}
              alt={`${event.name} at ASHVAMEDHA 2026`}
              width={1200}
              height={800}
              sizes="(max-width: 1024px) 100vw, 58vw"
              loading="lazy"
              className="h-[240px] w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.06] sm:h-[320px] lg:h-[380px]"
            />
          ) : (
            <BattlefieldFrame
              seedKey={event.slug}
              accent={event.accent}
              glyph={event.glyph}
              index={index + 1}
              label={event.category.toUpperCase()}
              className="h-[240px] w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.05] sm:h-[320px] lg:h-[380px]"
            />
          )}

          {/* corner bracket */}
          <span className="pointer-events-none absolute right-0 top-0 h-10 w-10 border-r border-t" style={{ borderColor: a.base }} />
        </div>
      </div>

      {/* ---- content ---- */}
      <div className={cn("lg:col-span-5", !fromLeft && "lg:order-1")}>
        <div className="flex items-center gap-4">
          <span className="font-display text-3xl leading-none text-white/15">{pad(index + 1)}</span>
          <span className="h-px flex-1 bg-white/10" />
          <StatusChip state={event.registration} />
        </div>

        <h3 className="mt-4 text-[clamp(1.9rem,4.6vw,3.4rem)] leading-[0.92] text-white">
          {event.name}
        </h3>

        <p
          className="mt-2 font-mono text-[10px] tracking-hud"
          style={{ color: a.base }}
        >
          {event.arena.toUpperCase()}
        </p>

        <p className="mt-4 max-w-md text-[0.92rem] leading-relaxed text-silver-dim">
          {event.description}
        </p>

        {/* spec grid */}
        <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3 border-t border-white/10 pt-5 text-[0.78rem]">
          {[
            { icon: Calendar, k: "Date", v: event.date },
            { icon: Clock, k: "Time", v: event.time },
            { icon: MapPin, k: "Venue", v: event.venue },
            { icon: Users, k: "Team Size", v: event.teamSize },
          ].map((row) => (
            <div key={row.k} className="flex items-start gap-2.5">
              <row.icon className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: a.base }} />
              <div>
                <dt className="font-mono text-[9px] tracking-hud text-silver-dim">{row.k.toUpperCase()}</dt>
                <dd className="text-silver">{row.v}</dd>
              </div>
            </div>
          ))}
        </dl>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href={`/events/${event.slug}`}
            data-cursor-label="VIEW"
            className="btn clip-notch"
            style={{
              borderColor: `${a.base}66`,
              background: `${a.base}14`,
              color: "#fff",
            }}
          >
            Enter the battle
            <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="font-mono text-[10px] tracking-hud text-silver-dim">
            PRIZE {event.prizePool}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

/**
 * EVENT CARD — compact poster used in grids and the events page.
 */
export function EventCard({ event, index = 0 }: { event: FestEvent; index?: number }) {
  const a = accentOf(event.accent);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.04, 0.4) }}
      className="group relative flex flex-col overflow-hidden panel clip-slant transition-transform duration-500 hover:-translate-y-1.5"
      style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06)` }}
    >
      <Link href={`/events/${event.slug}`} className="flex h-full flex-col" data-cursor-label="VIEW">
        <div className="relative">
          {event.image ? (
            <Image
              src={event.image}
              alt={`${event.name} at ASHVAMEDHA 2026`}
              width={800}
              height={600}
              sizes="(max-width: 768px) 100vw, 33vw"
              loading="lazy"
              className="h-44 w-full object-cover transition-transform duration-700 group-hover:scale-[1.08]"
            />
          ) : (
            <BattlefieldFrame
              seedKey={event.slug}
              accent={event.accent}
              glyph={event.glyph}
              className="h-44 w-full transition-transform duration-700 group-hover:scale-[1.06]"
            />
          )}
          <span
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-60"
            style={{ background: `linear-gradient(90deg, transparent, ${a.base}, transparent)` }}
          />
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[9px] tracking-hud text-silver-dim">
              {event.category.toUpperCase()}
            </span>
            <span
              className="font-mono text-[9px] tracking-hud"
              style={{ color: a.base }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <h3 className="mt-2 text-2xl leading-none text-white transition-colors duration-300 group-hover:text-white">
            {event.name}
          </h3>

          <p className="mt-3 flex-1 text-[0.84rem] leading-relaxed text-silver-dim">
            {event.tagline}
          </p>

          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3.5">
            <span className="font-mono text-[9px] tracking-hud text-silver-dim">
              DAY {event.day} · {event.time}
            </span>
            <span
              className="flex items-center gap-1.5 font-mono text-[9px] tracking-hud text-white/90 transition-transform duration-300 group-hover:translate-x-0.5"
            >
              VIEW
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>

        <SportGlyph
          glyph={event.glyph}
          strokeWidth={1}
          className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 opacity-[0.06] transition-opacity duration-500 group-hover:opacity-[0.14]"
        />
      </Link>
    </motion.article>
  );
}
