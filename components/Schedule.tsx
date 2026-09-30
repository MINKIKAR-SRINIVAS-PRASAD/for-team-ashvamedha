"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import type { ScheduleSlot } from "@/data/schedule";
import { useFestData } from "@/components/FestDataProvider";
import { EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<ScheduleSlot["status"], string> = {
  live: "border-crimson/60 text-crimson",
  completed: "border-white/10 text-silver-dim",
  scheduled: "border-white/15 text-silver",
};

/**
 * SCHEDULE — futuristic event timeline.
 *
 * Desktop: horizontal timeline (each day is a track you scroll sideways).
 * Mobile: the same slots become a vertical timeline with a time rail on the left.
 * Both views read from data/schedule.ts, so adding a slot updates both.
 */
export function Schedule({ previewLimit }: { previewLimit?: number }) {
  const { days, schedule } = useFestData();
  const [filter, setFilter] = useState<string>("all");

  const SCHEDULE_FILTERS = useMemo(
    () => [{ id: "all", label: "All" }, ...days.map((d) => ({ id: String(d.day), label: `Day ${d.day}` }))],
    [days],
  );

  const visibleDays = useMemo(() => {
    const list = filter === "all" ? days : days.filter((d) => String(d.day) === filter);
    if (!previewLimit) return list;
    // Preview mode keeps the timeline honest: cap the slots, not the days.
    return list;
  }, [filter, previewLimit, days]);

  const slotsFor = (day: number) => {
    const list = schedule.filter((s) => s.day === day).sort((a, b) => a.time.localeCompare(b.time));
    return previewLimit ? list.slice(0, previewLimit) : list;
  };

  return (
    <div>
      {/* filter rail */}
      <div className="no-scrollbar -mx-[var(--shell)] mb-10 flex gap-2 overflow-x-auto px-[var(--shell)]">
        {SCHEDULE_FILTERS.map((f) => {
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              aria-pressed={active}
              className={cn(
                "relative shrink-0 border px-4 py-2 font-mono text-[10px] uppercase tracking-hud transition-all duration-300",
                active
                  ? "border-crimson/70 bg-crimson/12 text-white"
                  : "border-white/12 text-silver-dim hover:border-white/30 hover:text-white",
              )}
            >
              {f.label}
              {active && (
                <motion.span
                  layoutId="schedule-filter"
                  className="absolute inset-x-0 -bottom-px h-px bg-crimson"
                  style={{ boxShadow: "0 0 12px rgba(225,29,46,0.9)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {visibleDays.map((d, di) => {
        const slots = slotsFor(d.day);

        return (
          <section key={d.day} className={cn(di > 0 && "mt-14")} aria-labelledby={`day-${d.day}`}>
            {/* day header */}
            <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] tracking-hud text-crimson/90">{d.label}</span>
                  <span className="h-px w-8 bg-crimson/50" />
                  <span className="hud">{d.date}</span>
                </div>
                <h3 id={`day-${d.day}`} className="mt-2 text-[clamp(1.5rem,3.4vw,2.4rem)] leading-none text-white">
                  {d.headline}
                </h3>
              </div>
              <p className="max-w-sm text-[0.86rem] leading-relaxed text-silver-dim">{d.note}</p>
            </div>

            {/* ---- desktop: horizontal timeline ---- */}
            <div className="no-scrollbar mt-8 hidden overflow-x-auto pb-4 lg:block">
              <div className="relative flex min-w-max gap-4 pr-6">
                {/* horizontal axis */}
                <span className="pointer-events-none absolute left-0 top-[26px] h-px w-full bg-gradient-to-r from-crimson/50 via-white/12 to-transparent" />

                {slots.map((slot, i) => (
                  <motion.div
                    key={slot.id}
                    initial={{ opacity: 0, x: 34 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: EASE, delay: Math.min(i * 0.05, 0.4) }}
                    className="relative w-[262px] shrink-0 pt-[26px]"
                  >
                    {/* axis node */}
                    <span
                      className={cn(
                        "absolute left-0 top-[21px] h-2.5 w-2.5 rotate-45 border",
                        slot.status === "live"
                          ? "border-crimson bg-crimson animate-live-pulse"
                          : slot.status === "completed"
                            ? "border-silver-dim/50 bg-silver-dim/30"
                            : "border-white/30 bg-void",
                      )}
                    />
                    <span className="absolute left-4 top-[25px] h-px w-4 bg-white/15" />

                    <SlotCard slot={slot} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ---- mobile: vertical timeline ---- */}
            <ol className="relative mt-8 space-y-4 lg:hidden">
              <span className="pointer-events-none absolute bottom-0 left-[7px] top-0 w-px bg-gradient-to-b from-crimson/50 via-white/12 to-transparent" />
              {slots.map((slot, i) => (
                <motion.li
                  key={slot.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.04, 0.3) }}
                  className="relative pl-7"
                >
                  <span
                    className={cn(
                      "absolute left-0 top-6 h-3.5 w-3.5 rotate-45 border",
                      slot.status === "live"
                        ? "border-crimson bg-crimson animate-live-pulse"
                        : slot.status === "completed"
                          ? "border-silver-dim/50 bg-silver-dim/30"
                          : "border-white/30 bg-void",
                    )}
                  />
                  <SlotCard slot={slot} />
                </motion.li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function SlotCard({ slot }: { slot: ScheduleSlot }) {
  const body = (
    <div
      className={cn(
        "group relative h-full overflow-hidden panel clip-notch p-4 transition-transform duration-500 hover:-translate-y-1",
        slot.status === "live" && "border-crimson/40",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-display text-2xl leading-none text-white">{slot.time}</span>
        <span className={cn("tag !border", STATUS_STYLE[slot.status])}>
          {slot.status === "live" ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-crimson animate-live-pulse" />
              LIVE
            </>
          ) : (
            slot.status.toUpperCase()
          )}
        </span>
      </div>

      <h4 className="mt-3 text-[1.05rem] leading-tight text-white">{slot.title}</h4>

      <div className="mt-2 flex items-center gap-2 text-[0.78rem] text-silver-dim">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-crimson/70" />
        <span className="truncate">{slot.venue}</span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
        <span className="font-mono text-[9px] tracking-hud text-silver-dim">
          {slot.stage.toUpperCase()}
        </span>
        <span className="font-mono text-[9px] tracking-hud text-silver-dim">{slot.duration}</span>
      </div>

      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-crimson to-transparent transition-transform duration-500 group-hover:scale-x-100" />
    </div>
  );

  if (!slot.eventSlug) return body;

  return (
    <Link href={`/events/${slot.eventSlug}`} className="block h-full" data-cursor-label="VIEW">
      {body}
    </Link>
  );
}
