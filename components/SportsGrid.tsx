"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { EventCard } from "@/components/EventCard";
import { EVENT_CATEGORIES } from "@/data/events";
import { useFestData } from "@/components/FestDataProvider";
import { cn } from "@/lib/utils";

/**
 * SPORTS GRID — filterable, data-driven event grid with animated layout.
 * Adding a sport to data/events.ts is the only step required to extend it.
 */
export function SportsGrid({ limit }: { limit?: number }) {
  const { events } = useFestData();
  const [filter, setFilter] = useState<string>("All");

  const filtered = useMemo(() => {
    const list = filter === "All" ? events : events.filter((e) => e.category === filter);
    return limit ? list.slice(0, limit) : list;
  }, [filter, limit, events]);

  return (
    <div>
      {!limit && (
        <div
          className="no-scrollbar -mx-[var(--shell)] mb-9 flex gap-2 overflow-x-auto px-[var(--shell)] pb-1"
          role="tablist"
          aria-label="Filter events by category"
        >
          {EVENT_CATEGORIES.map((cat) => {
            const active = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(cat)}
                className={cn(
                  "relative shrink-0 border px-4 py-2 font-mono text-[10px] uppercase tracking-hud transition-all duration-300",
                  active
                    ? "border-crimson/70 bg-crimson/12 text-white"
                    : "border-white/12 text-silver-dim hover:border-white/30 hover:text-white",
                )}
              >
                {cat}
                {active && (
                  <motion.span
                    layoutId="event-filter"
                    className="absolute inset-x-0 -bottom-px h-px bg-crimson"
                    style={{ boxShadow: "0 0 12px rgba(225,29,46,0.9)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}

      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((ev, i) => (
            <EventCard key={ev.slug} event={ev} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {!limit && filtered.length === 0 && (
        <p className="py-16 text-center text-silver-dim">
          No events in this category yet — check back when the bracket is announced.
        </p>
      )}
    </div>
  );
}
