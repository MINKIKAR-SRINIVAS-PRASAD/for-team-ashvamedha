import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Radio,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";

import { BattlefieldFrame } from "@/components/art/BattlefieldFrame";
import { SportGlyph } from "@/components/art/SportGlyph";
import { CTA } from "@/components/ui/CTA";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventLiveScores } from "@/components/EventLiveScores";
import { REGISTRATION_LABEL } from "@/data/events";
import { REGISTRATION_OPEN } from "@/data/site";
import { findEvent, getFestData } from "@/lib/festData";
import { accentOf } from "@/lib/accents";

/** Pre-render one static page per event. */
export const dynamicParams = true;

export async function generateStaticParams() {
  const { events } = await getFestData();
  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { events } = await getFestData();
  const event = findEvent(events, slug);

  if (!event) {
    return { title: "Event not found" };
  }

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
  const { events } = await getFestData();
  const event = findEvent(events, slug);

  if (!event) {
    notFound();
  }

  const a = accentOf(event.accent);

  const related = events
    .filter(
      (item) =>
        item.slug !== event.slug &&
        item.category === event.category,
    )
    .slice(0, 3);

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
      {/* Event masthead */}
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
            {/* Event information */}
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

              <p className="mt-5 text-[1rem] leading-relaxed text-silver-dim">
                {event.tagline}
              </p>

              <p className="mt-4 text-[0.95rem] leading-relaxed text-silver-dim">
                {event.description}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span
                  className="tag"
                  style={{
                    borderColor: `${a.base}66`,
                    color: a.base,
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: a.base }}
                  />

                  {
                    REGISTRATION_LABEL[
                      REGISTRATION_OPEN
                        ? event.registration
                        : "closed"
                    ]
                  }
                </span>

                <span className="tag">{event.category}</span>
                <span className="tag">{event.format}</span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <CTA
                  href={`/register?event=${event.slug}`}
                  variant="primary"
                  className="!px-7 !py-4"
                  disabled={
                    !REGISTRATION_OPEN ||
                    event.registration === "closed"
                  }
                >
                  {!REGISTRATION_OPEN ||
                  event.registration === "closed"
                    ? "Entries Closed"
                    : "Register Now"}
                </CTA>

                <CTA
                  href="/schedule"
                  variant="ghost"
                  className="!px-7 !py-4"
                >
                  See in Schedule
                </CTA>

                <CTA
                  href="#live-scores"
                  variant="ghost"
                  className="!px-7 !py-4"
                  icon={<Radio className="h-4 w-4" />}
                >
                  Live Score
                </CTA>
              </div>
            </div>

            {/* Event image — use the real photograph when available */}
            <div className="lg:col-span-7">
              <div
                className="relative h-[280px] w-full overflow-hidden clip-notch border border-white/10 sm:h-[360px] lg:h-[440px]"
                style={{
                  boxShadow: `0 40px 120px -60px ${a.base}`,
                }}
              >
                {event.image ? (
                  <Image
                    src={event.image}
                    alt={`${event.name} event`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover"
                  />
                ) : (
                  <BattlefieldFrame
                    seedKey={`detail-${event.slug}`}
                    accent={event.accent}
                    glyph={event.glyph}
                    label={event.category.toUpperCase()}
                    className="h-full w-full"
                  />
                )}
              </div>

              {/* Event details */}
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-3">
                {spec.map((row) => (
                  <div key={row.k}>
                    <dt className="flex items-center gap-2 font-mono text-[9px] tracking-hud text-silver-dim">
                      <row.icon
                        className="h-3.5 w-3.5"
                        style={{ color: a.base }}
                      />

                      {row.k.toUpperCase()}
                    </dt>

                    <dd className="mt-1.5 text-[0.95rem] text-white">
                      {row.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Category division */}
      <div className="shell">
        <div className="hairline" />

        <div className="flex items-center justify-between gap-6 py-6">
          <span className="hud">
            {`// ${event.category.toUpperCase()} DIVISION`}
          </span>

          <SportGlyph
            glyph={event.glyph}
            className="h-8 w-8"
            strokeWidth={1.2}
          />
        </div>

        <div className="hairline" />
      </div>

      {/* Live scores and results */}
      <section
        id="live-scores"
        className="relative section-pad scroll-mt-[var(--nav-h)]"
        aria-label={`${event.name} live scores`}
      >
        <div className="shell">
          <SectionHeader
            protocol="// LIVE_SCOREBOARD"
            title={
              <>
                LIVE SCORES
                <br />
                <span className="text-metal">&amp; RESULTS</span>
              </>
            }
            description={`Every ${event.name} match: live now, up next and finished, updated straight from the arena control room.`}
          />

          <div className="mt-10">
            <EventLiveScores eventSlug={event.slug} />
          </div>
        </div>
      </section>

      {/* Related events */}
      {related.length > 0 && (
        <section
          className="section-pad pt-0"
          aria-label="Related events"
        >
          <div className="shell">
            <SectionHeader
              protocol="// SAME_DIVISION"
              title="ALSO IN THIS DIVISION"
              description={`Other ${event.category.toLowerCase()} events running across the three days.`}
            />

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => {
                const relatedAccent = accentOf(item.accent);

                return (
                  <Link
                    key={item.slug}
                    href={`/events/${item.slug}`}
                    className="group relative overflow-hidden panel clip-notch transition-transform duration-500 hover:-translate-y-1.5"
                    data-cursor-label="VIEW"
                  >
                    {/* Real related-event image with fallback */}
                    <div className="relative h-40 w-full overflow-hidden">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={`${item.name} event`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                        />
                      ) : (
                        <BattlefieldFrame
                          seedKey={item.slug}
                          accent={item.accent}
                          glyph={item.glyph}
                          className="h-40 w-full transition-transform duration-700 group-hover:scale-[1.06]"
                        />
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-xl text-white">
                        {item.name}
                      </h3>

                      <p
                        className="mt-2 font-mono text-[9px] tracking-hud"
                        style={{ color: relatedAccent.base }}
                      >
                        {item.arena.toUpperCase()}
                      </p>

                      <p className="mt-3 text-[0.85rem] leading-relaxed text-silver-dim">
                        {item.tagline}
                      </p>
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