"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BattlefieldFrame } from "@/components/art/BattlefieldFrame";
import type { GalleryItem } from "@/data/gallery";
import { useFestData } from "@/components/FestDataProvider";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SPAN_CLASS: Record<GalleryItem["span"], string> = {
  tall: "h-[420px] sm:h-[520px]",
  wide: "h-[260px] sm:h-[320px]",
  square: "h-[340px] sm:h-[400px]",
};

const CATEGORY_GLYPH: Record<string, string> = {
  MATCHDAY: "football",
  ATHLETES: "swimming",
  CROWD: "volleyball",
  CHAMPIONS: "basketball",
  CAMPUS: "swimming",
  "BEHIND THE SCENES": "esports",
};

export function Gallery({ limit }: { limit?: number }) {
  const { gallery } = useFestData();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = useMemo(
    () => (limit ? gallery.slice(0, limit) : gallery),
    [limit, gallery],
  );

  const close = useCallback(() => {
    setOpenIndex(null);
  }, []);

  const step = useCallback(
    (direction: number) => {
      setOpenIndex((index) => {
        if (index === null || items.length === 0) return null;
        return (index + direction + items.length) % items.length;
      });
    },
    [items.length],
  );

  useEffect(() => {
    if (openIndex === null) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
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
      {/* Photograph grid — no gallery filters, titles, or captions. */}
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
        <AnimatePresence mode="popLayout">
          {items.map((item, index) => (
            <motion.figure
              key={item.id}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{
                duration: 0.5,
                ease: EASE,
                delay: Math.min(index * 0.04, 0.3),
              }}
              className="group relative block break-inside-avoid"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className={cn(
                  "relative block w-full overflow-hidden border border-white/10 bg-[#080a0c]",
                  SPAN_CLASS[item.span],
                )}
                aria-label={`Open photograph ${index + 1}`}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                ) : (
                  <BattlefieldFrame
                    seedKey={`gallery-${item.id}`}
                    accent={item.accent}
                    glyph={
CATEGORY_GLYPH[item.category as keyof typeof CATEGORY_GLYPH]                    }
                    label=""
                    className="absolute inset-0 h-full w-full"
                  />
                )}

                <span className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />
              </button>
            </motion.figure>
          ))}
        </AnimatePresence>
      </div>

      {/* Fullscreen photograph viewer — no title or caption. */}
      <AnimatePresence>
        {active && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label="Fullscreen photograph viewer"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close photograph"
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            <motion.div
              className="relative z-10 h-[78vh] w-[92vw] sm:h-[84vh] sm:w-[88vw]"
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {active.image ? (
                <Image
                  src={active.image}
                  alt={active.title}
                  fill
                  sizes="100vw"
                  priority
                  className="object-contain"
                />
              ) : (
                <div className="relative h-full w-full">
                  <BattlefieldFrame
                    seedKey={`gallery-${active.id}`}
                    accent={active.accent}
                    glyph={
                      CATEGORY_GLYPH[active.category as keyof typeof CATEGORY_GLYPH] ?? "football"
                    }
                    label=""
                    className="h-full w-full"
                  />
                </div>
              )}
            </motion.div>

            <button
              type="button"
              onClick={close}
              aria-label="Close fullscreen viewer"
              className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center border border-white/30 bg-black/40 text-white transition-colors hover:border-white sm:right-7 sm:top-7"
            >
              <X className="h-5 w-5" />
            </button>

            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label="Previous photograph"
                  className="absolute left-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/25 bg-black/50 text-2xl text-white transition-colors hover:bg-white/15 sm:left-6"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label="Next photograph"
                  className="absolute right-3 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-white/25 bg-black/50 text-2xl text-white transition-colors hover:bg-white/15 sm:right-6"
                >
                  ›
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}