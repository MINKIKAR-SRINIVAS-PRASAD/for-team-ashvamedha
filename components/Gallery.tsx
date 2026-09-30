"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BattlefieldFrame } from "@/components/art/BattlefieldFrame";
import { GALLERY_CATEGORIES, type GalleryItem } from "@/data/gallery";
import { useFestData } from "@/components/FestDataProvider";
import { accentOf } from "@/lib/accents";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SPAN_CLASS: Record<GalleryItem["span"], string> = {
  tall: "h-[420px] sm:h-[520px]",
  wide: "h-[260px] sm:h-[320px]",
  square: "h-[340px] sm:h-[400px]",
};

/** Glyph key per gallery category so each frame gets a fitting sigil. */
const CATEGORY_GLYPH = {
  MATCHDAY: "football",
  ATHLETES: "swimming",
  CROWD: "volleyball",
  CHAMPIONS: "basketball",
  CAMPUS: "swimming",
  "BEHIND THE SCENES": "esportst",
} as const;

/**
 * GALLERY — cinematic masonry with a fullscreen lightbox.
 * Scroll reveal, hover zoom, category filtering and keyboard-accessible lightbox
 * (Esc to close, ← / → to move between frames).
 */
export function Gallery({ limit }: { limit?: number }) {
  const { gallery } = useFestData();
  const [filter, setFilter] = useState<string>("ALL");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = useMemo(() => {
    const list = filter === "ALL" ? gallery : gallery.filter((g) => g.category === filter);
    return limit ? list.slice(0, limit) : list;
  }, [filter, limit, gallery]);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (dir: number) =>
      setOpenIndex((i) => (i === null ? null : (i + dir + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, step]);

  const active = openIndex === null ? null : items[openIndex];

  return (
    <div>
      {!limit && (
        <div
          className="no-scrollbar -mx-[var(--shell)] mb-9 flex gap-2 overflow-x-auto px-[var(--shell)]"
          role="tablist"
          aria-label="Filter gallery by category"
        >
          {GALLERY_CATEGORIES.map((cat) => {
            const isActive = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(cat)}
                className={cn(
                  "relative shrink-0 border px-4 py-2 font-mono text-[10px] uppercase tracking-hud transition-all duration-300",
                  isActive
                    ? "border-volt/60 bg-volt/10 text-white"
                    : "border-white/12 text-silver-dim hover:border-white/30 hover:text-white",
                )}
              >
                {cat}
                {isActive && (
                  <motion.span
                    layoutId="gallery-filter"
                    className="absolute inset-x-0 -bottom-px h-px bg-volt"
                    style={{ boxShadow: "0 0 12px rgba(49,168,255,0.9)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* masonry via CSS columns — no JS layout measurement */}
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.figure
              key={item.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.6, ease: EASE, delay: Math.min(i * 0.05, 0.4) }}
              className="group relative block break-inside-avoid"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(i)}
                className={cn(
                  "relative block w-full overflow-hidden clip-notch border border-white/10",
                  SPAN_CLASS[item.span],
                )}
                data-cursor-label="OPEN"
                aria-label={`Open ${item.title} fullscreen`}
              >
                <BattlefieldFrame
                  seedKey={`gallery-${item.id}`}
                  accent={item.accent}
                  glyph={CATEGORY_GLYPH[item.category]}
                  label={item.category}
                  className="absolute inset-0 h-full w-full transition-transform duration-[900ms] ease-out group-hover:scale-[1.08]"
                />

                {/* hover overlay */}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-70" />
                <span
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${accentOf(item.accent).base}, transparent)`,
                  }}
                />

                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-left">
                  <span>
                    <span className="block font-display text-lg leading-none text-white">
                      {item.title}
                    </span>
                    <span className="mt-1 block font-mono text-[9px] tracking-hud text-silver-dim">
                      {item.category}
                    </span>
                  </span>
                  <ZoomIn className="h-4 w-4 shrink-0 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </figcaption>
              </button>
            </motion.figure>
          ))}
        </AnimatePresence>
      </div>

      {/* ---- lightbox ---- */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${active.title} — fullscreen view`}
          >
            <div className="absolute inset-0 bg-void/95 backdrop-blur-md" onClick={close} />

            <motion.div
              className="relative z-10 w-full max-w-5xl"
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="relative overflow-hidden clip-notch border border-white/15">
                <BattlefieldFrame
                  seedKey={`gallery-${active.id}`}
                  accent={active.accent}
                  glyph={CATEGORY_GLYPH[active.category]}
                  label={active.category}
                  className="h-[52vh] w-full sm:h-[64vh]"
                />
              </div>

              <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h3 className="text-2xl text-white">{active.title}</h3>
                  <p className="mt-1.5 max-w-xl text-[0.88rem] leading-relaxed text-silver-dim">
                    {active.caption}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="btn btn-ghost clip-notch !px-4 !py-2.5"
                    aria-label="Previous image"
                  >
                    ←
                  </button>
                  <span className="font-mono text-[10px] tracking-hud text-silver-dim">
                    {String((openIndex ?? 0) + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="btn btn-ghost clip-notch !px-4 !py-2.5"
                    aria-label="Next image"
                  >
                    →
                  </button>
                </div>
              </div>
            </motion.div>

            <button
              type="button"
              onClick={close}
              aria-label="Close fullscreen view"
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center border border-white/20 text-white transition-colors hover:border-crimson/70 hover:text-crimson sm:right-8 sm:top-8"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
