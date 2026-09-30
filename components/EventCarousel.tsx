"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { BattlefieldFrame } from "@/components/art/BattlefieldFrame";
import type { FestEvent } from "@/data/events";
import { useFestData } from "@/components/FestDataProvider";
import { accentOf } from "@/lib/accents";
import { cn, pad } from "@/lib/utils";

const AUTOPLAY_MS = 5200;

/**
 * EVENT CAROUSEL — premium 3D battle carousel.
 *
 * The centre card is dominant and sharp; neighbours shrink, darken, rotate away
 * from the viewer and pick up a blur, producing real depth. Supports drag,
 * swipe, keyboard (← / →), autoplay with pause-on-hover and pause-on-focus.
 *
 * Position offsets are computed around a virtual centre index, so the ring wraps
 * infinitely in both directions.
 */
export function EventCarousel({ events }: { events?: FestEvent[] }) {
  const { events: allEvents, featuredSlugs } = useFestData();
  const items = useMemo(() => {
    const picked = featuredSlugs.map((s) => allEvents.find((e) => e.slug === s)).filter(
      Boolean,
    ) as FestEvent[];
    return events ?? (picked.length ? picked : allEvents.slice(0, 6));
  }, [events, allEvents, featuredSlugs]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const dragging = useRef(false);
  const count = items.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  // Autoplay — halts on hover, focus, drag, reduced-motion, or manual pause.
  useEffect(() => {
    if (!playing || paused || reduce || count < 2) return;
    const id = window.setInterval(() => go(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [playing, paused, reduce, count, go]);

  const active = items[index];
  const a = accentOf(active.accent);

  /** Shortest signed distance from the active card, wrapped to the ring. */
  const offsetOf = (i: number) => {
    let d = i - index;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    return d;
  };

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured battlegrounds"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      tabIndex={-1}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          go(1);
        }
      }}
    >
      {/* stage */}
      <div
        className="perspective relative h-[430px] select-none sm:h-[470px] lg:h-[540px]"
        onPointerDown={() => {
          dragging.current = false;
        }}
      >
        <motion.div
          className="absolute inset-0"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.14}
          dragMomentum={false}
          onDragStart={() => {
            dragging.current = true;
          }}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60 || info.velocity.x < -420) go(1);
            else if (info.offset.x > 60 || info.velocity.x > 420) go(-1);
          }}
        >
          {items.map((ev, i) => {
            const off = offsetOf(i);
            const isActive = off === 0;
            const absOff = Math.abs(off);
            if (absOff > 3) return null;
            const ea = accentOf(ev.accent);

            return (
              <motion.article
                key={ev.slug}
                className="absolute left-1/2 top-1/2 w-[78vw] max-w-[420px] sm:w-[60vw] lg:w-[420px]"
                style={{ transformStyle: "preserve-3d" }}
                animate={{
                  x: `calc(-50% + ${off * 56}%)`,
                  y: "-50%",
                  z: -absOff * 130,
                  rotateY: off * -26,
                  scale: 1 - absOff * 0.13,
                  opacity: absOff > 2 ? 0 : 1 - absOff * 0.26,
                  filter: `blur(${absOff * 3.4}px) brightness(${1 - absOff * 0.3})`,
                }}
                transition={{ type: "spring", stiffness: 190, damping: 26, mass: 0.7 }}
                aria-hidden={!isActive}
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}: ${ev.name}`}
              >
                <div
                  className={cn(
                    "group relative overflow-hidden clip-notch border transition-colors duration-500",
                    isActive ? "border-white/20" : "border-white/5",
                  )}
                  style={{
                    boxShadow: isActive
                      ? `0 40px 120px -50px ${ea.base}, inset 0 1px 0 rgba(255,255,255,0.12)`
                      : "inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                >
                  {ev.image ? (
                    <Image
                      src={ev.image}
                      alt={`${ev.name} at ASHVAMEDHA 2026`}
                      width={840}
                      height={600}
                      sizes="(max-width: 768px) 78vw, 420px"
                      className="h-[300px] w-full object-cover sm:h-[330px] lg:h-[380px]"
                    />
                  ) : (
                    <BattlefieldFrame
                      seedKey={`carousel-${ev.slug}`}
                      accent={ev.accent}
                      glyph={ev.glyph}
                      className="h-[300px] w-full sm:h-[330px] lg:h-[380px]"
                    />
                  )}

                  {/* active-card info */}
                  <div
                    className={cn(
                      "absolute inset-x-0 bottom-0 p-5 transition-opacity duration-500",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] tracking-hud text-white/70">
                        {ev.category.toUpperCase()}
                      </span>
                      <span className="font-mono text-[9px] tracking-hud" style={{ color: ea.base }}>
                        {pad(i + 1)}
                      </span>
                    </div>
                    <h3 className="mt-2 text-[clamp(1.6rem,4vw,2.4rem)] leading-none text-white">
                      {ev.name}
                    </h3>
                    <p className="mt-1.5 font-mono text-[10px] tracking-hud" style={{ color: ea.base }}>
                      {ev.arena.toUpperCase()}
                    </p>
                    <p className="mt-3 max-w-sm text-[0.84rem] leading-relaxed text-silver-dim">
                      {ev.tagline}
                    </p>
                    <Link
                      href={`/events/${ev.slug}`}
                      className="btn mt-4 clip-notch !px-5 !py-2.5 text-white"
                      style={{ borderColor: `${ea.base}70`, background: `${ea.base}1F` }}
                      tabIndex={isActive ? 0 : -1}
                      data-cursor-label="ENTER"
                    >
                      View event
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>

      {/* controls */}
      <div className="mt-8 flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous event"
            className="flex h-11 w-11 items-center justify-center border border-white/15 text-white transition-all duration-300 hover:-translate-x-0.5 hover:border-crimson/70 hover:text-crimson"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next event"
            className="flex h-11 w-11 items-center justify-center border border-white/15 text-white transition-all duration-300 hover:translate-x-0.5 hover:border-crimson/70 hover:text-crimson"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause carousel autoplay" : "Resume carousel autoplay"}
            className="flex h-11 w-11 items-center justify-center border border-white/15 text-white transition-colors duration-300 hover:border-volt/70 hover:text-volt"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
        </div>

        {/* progress rail */}
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          {items.map((ev, i) => (
            <button
              key={ev.slug}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to ${ev.name}`}
              aria-current={i === index}
              className="group relative h-[3px] flex-1 overflow-hidden bg-white/12 transition-colors"
            >
              <motion.span
                className="absolute inset-y-0 left-0"
                style={{ background: accentOf(ev.accent).base }}
                initial={false}
                animate={{ width: i === index ? "100%" : i < index ? "100%" : "0%" }}
                transition={{ duration: i === index ? AUTOPLAY_MS / 1000 : 0.3, ease: "linear" }}
              />
            </button>
          ))}
        </div>

        <span className="hidden font-mono text-[10px] tracking-hud text-silver-dim sm:block">
          <span className="text-white/90">{pad(index + 1)}</span> / {pad(count)}
        </span>
      </div>

      <AnimatePresence>
        <motion.p
          key={a.label}
          className="sr-only"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          Now showing {active.name}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
