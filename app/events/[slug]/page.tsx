import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Ticket, Trophy, Users } from "lucide-react";
import { BattlefieldFrame } from "@/components/art/BattlefieldFrame";
import { SportGlyph } from "@/components/art/SportGlyph";
import { CTA } from "@/components/ui/CTA";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Schedule } from "@/components/Schedule";
import { REGISTRATION_LABEL } from "@/data/events";
import { findEvent, getFestData } from "@/lib/festData";
import { accentOf } from "@/lib/accents";

/** Pre-render one static page per event — no runtime data fetching needed. */
// Pages for events added later through the admin API are rendered on demand.
export const dynamicParams = true;

export async function generateStaticParams() {
  const { events } = await getFestData();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { events } = await getFestData();
  const event = findEvent(events, slug);
  if (!event) return { title: "Event not found" };

  return {
    title: event.name,
    description: `${event.name} at ASHVAMEDHA 2026 — ${event.tagline} ${event.date} at ${event.venue}.`,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { events: EVENTS } = await getFestData();
  const event = findEvent(EVENTS, slug);
  if (!event) notFound();

  const a = accentOf(event.accent);
  const related = EVENTS.filter((e) => e.slug !== event.slug && e.category === event.category).slice(0, 3);
  const spec = [
    { icon: Calendar, k: "Date", v: event.date },
    { icon: Clock, k: "Start Time", v: event.time },
    { icon: MapPin, k: "Venue", v: event.venue },
    { icon: Users, k: "Team Size", v: event.teamSize },
    { icon: Trophy, k: "Prize Pool", v: event.prizePool },
    { icon: Ticket, k: "Entry Fee", v: event.entryFee },
  ];

  return (
    <>
      {/* masthead */}
      <section className="relative overflow-hidden pt-[calc(var(--nav-h)+2.5rem)] pb-12">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
          style={{
            background: `radial-gradient(ellipse at top, ${a.base}33, transparent 62%)`,
          }}
        />

        <div className="shell relative">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 font-mono text-[10px] tracking-hud text-silver-dim transition-colors hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            ALL EVENTS
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3">
                <span
                  className="h-px w-10"
                  style={{ background: a.base }}
                />
                <span className="hud" style={{ color: a.base }}>
                  {"// "}
                  {event.arena.toUpperCase()}
                </span>
              </div>

              <h1 className="mt-4 text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.88] text-white">
                {event.name}
              </h1>

              <p className="mt-5 text-[1rem] leading-relaxed text-silver-dim">{event.tagline}</p>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-silver-dim">{event.description}</p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span
                  className="tag"
                  style={{ borderColor: `${a.base}66`, color: a.base }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: a.base }}
                  />
                  {REGISTRATION_LABEL[event.registration]}
                </span>
                <span className="tag">{event.category}</span>
                <span className="tag">{event.format}</span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <CTA
                  href={`/register?event=${event.slug}`}
                  variant="primary"
                  className="!px-7 !py-4"
                  disabled={event.registration === "closed"}
                >
                  {event.registration === "closed" ? "Entries Closed" : "Register Now"}
                </CTA>
                <CTA href="/schedule" variant="ghost" className="!px-7 !py-4">
                  See in Schedule
                </CTA>
              </div>
            </div>

            {/* key visual */}
            <div className="lg:col-span-7">
              <div
                className="relative overflow-hidden clip-notch border border-white/10"
                style={{ boxShadow: `0 40px 120px -60px ${a.base}` }}
              >
                <BattlefieldFrame
                  seedKey={`detail-${event.slug}`}
                  accent={event.accent}
                  glyph={event.glyph}
                  label={event.category.toUpperCase()}
                  className="h-[280px] w-full sm:h-[360px] lg:h-[440px]"
                />
              </div>

              {/* spec grid */}
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-3">
                {spec.map((row) => (
                  <div key={row.k}>
                    <dt className="flex items-center gap-2 font-mono text-[9px] tracking-hud text-silver-dim">
                      <row.icon className="h-3.5 w-3.5" style={{ color: a.base }} />
                      {row.k.toUpperCase()}
                    </dt>
                    <dd className="mt-1.5 text-[0.95rem] text-white">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* category sigil band */}
      <div className="shell">
        <div className="hairline" />
        <div className="flex items-center justify-between gap-6 py-6">
          <span className="hud">{`// ${event.category.toUpperCase()} DIVISION`}</span>
          <SportGlyph glyph={event.glyph} className="h-8 w-8" strokeWidth={1.2} />
        </div>
        <div className="hairline" />
      </div>

      {/* event schedule block */}
      <section className="section-pad" aria-label={`${event.name} schedule`}>
        <div className="shell">
          <SectionHeader
            protocol="// SESSION_TIMELINE"
            title={
              <>
                WHEN IT
                <br />
                <span className="text-metal">GOES LIVE</span>
              </>
            }
            description="All sessions for this event, with live status markers synced to the arena control room."
          />
          <div className="mt-10">
            <Schedule />
          </div>
        </div>
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="section-pad pt-0" aria-label="Related events">
          <div className="shell">
            <SectionHeader
              protocol="// SAME_DIVISION"
              title="ALSO IN THIS DIVISION"
              description={`Other ${event.category.toLowerCase()} events running across the three days.`}
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => {
                const ra = accentOf(r.accent);
                return (
                  <Link
                    key={r.slug}
                    href={`/events/${r.slug}`}
                    className="group relative overflow-hidden panel clip-notch transition-transform duration-500 hover:-translate-y-1.5"
                    data-cursor-label="VIEW"
                  >
                    <BattlefieldFrame
                      seedKey={r.slug}
                      accent={r.accent}
                      glyph={r.glyph}
                      className="h-40 w-full transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                    <div className="p-5">
                      <h3 className="text-xl text-white">{r.name}</h3>
                      <p className="mt-2 font-mono text-[9px] tracking-hud" style={{ color: ra.base }}>
                        {r.arena.toUpperCase()}
                      </p>
                      <p className="mt-3 text-[0.85rem] leading-relaxed text-silver-dim">{r.tagline}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
