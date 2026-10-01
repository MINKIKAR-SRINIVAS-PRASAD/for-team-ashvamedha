import { SectionHeader } from "@/components/ui/SectionHeader";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/components/ui/CTA";
import { EventCarousel } from "@/components/EventCarousel";
import { SportsGrid } from "@/components/SportsGrid";
import { Leaderboard } from "@/components/Leaderboard";
import { LiveScores } from "@/components/LiveScores";
import { Schedule } from "@/components/Schedule";
import { Gallery } from "@/components/Gallery";
import { Teams } from "@/components/Teams";
import { Sponsors } from "@/components/Sponsors";
import { ChampionSpotlight } from "@/components/ChampionSpotlight";
import { RegistrationCTA, HeroMessage } from "@/components/RegistrationCTA";
import { getFestData } from "@/lib/festData";
import { EventRow } from "@/components/EventCard";

/**
 * HOME SECTIONS — each section of the user journey lives here as a small,
 * composable unit so app/page.tsx stays a readable table of contents rather
 * than a monolithic file. Every section shares the same header + reveal system.
 */

export function SportsCarouselSection() {
  return (
    <section className="section-pad relative" aria-label="Featured battlegrounds">
      <div className="shell">
        <SectionHeader
          protocol="// BATTLEFIELD_01"
          title={
            <>
              FEATURED
              <br />
              <span className="text-metal">BATTLEGROUNDS</span>
            </>
          }
          description="Six headline arenas. Drag, swipe or use the arrow keys — every card opens its full event protocol."
          action={<CTA href="/events" variant="ghost">All 10+ Events</CTA>}
        />
        <div className="mt-12">
          <EventCarousel />
        </div>
      </div>
    </section>
  );
}

export async function EventsSection() {
  const { events: EVENTS } = await getFestData();
  return (
    <section className="section-pad relative" aria-labelledby="events-heading">
      <div className="shell">
        <h2 id="events-heading" className="sr-only">
          ASHVAMEDHA 2026 events
        </h2>
        <SectionHeader
          protocol="// EVENT_PROTOCOL"
          title={
            <>
              ENTER THE
              <br />
              <span className="text-crimson">BATTLEFIELD</span>
            </>
          }
          description="Each sport enters the arena with its own rules, venue and prize pool. Choose your battlefield and register before the bracket locks."
          action={<CTA href="/events">Browse All</CTA>}
        />

        {/* alternating cinematic rows — the flagship event treatment */}
        <div className="mt-10">
          {EVENTS.slice(0, 4).map((event, i) => (
            <EventRow key={event.slug} event={event} index={i} />
          ))}
        </div>

        <Reveal className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t border-white/10 pt-8">
          <p className="max-w-lg text-[0.9rem] leading-relaxed text-silver-dim">
            Twelve more disciplines are running across the arena — from Lawn Tennis Tennis and Table Tennis
            to Power Lifting trials and the Chess bracket.
          </p>
          <CTA href="/events" variant="ghost">
            See All 10+ Sports
          </CTA>
        </Reveal>
      </div>
    </section>
  );
}

export function LiveSection() {
  return (
    <section className="section-pad relative" aria-labelledby="live-heading">
      <div className="shell">
        <SectionHeader
          protocol="// LIVE_STATUS"
          title={
            <>
              THE ARENA
              <br />
              <span className="text-metal">RIGHT NOW</span>
            </>
          }
          description="Live scorelines from across the ground, refreshed every thirty seconds throughout the fest window."
          action={
            <span className="flex items-center gap-2 border border-crimson/45 bg-crimson/10 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-crimson animate-live-pulse" />
              <span className="hud text-white/90">FEED ACTIVE</span>
            </span>
          }
        />
        <div className="mt-12">
          <LiveScores />
        </div>
      </div>
    </section>
  );
}

export function RankingsSection() {
  return (
    <section className="section-pad relative" aria-labelledby="rankings-heading">
      <div className="shell">
        <SectionHeader
          protocol="// RANKING_SYSTEM"
          title={
            <>
              BATTLE
              <br />
              <span className="text-metal">RANKINGS</span>
            </>
          }
          description="Every completed fixture moves the table. Gold, silver and bronze are reserved for the podium — nobody else."
          action={<CTA href="/leaderboard" variant="ghost">Full Standings</CTA>}
        />
        <div className="mt-12">
          <Leaderboard />
        </div>
      </div>
    </section>
  );
}

export function ChampionSection() {
  return (
    <div className="section-pad">
      <ChampionSpotlight />
    </div>
  );
}

export function ScheduleSection() {
  return (
    <section className="section-pad relative" aria-labelledby="schedule-heading">
      <div className="shell">
        <SectionHeader
          protocol="// TIMELINE_PROTOCOL"
          title={
            <>
              THREE DAYS
              <br />
              <span className="text-volt">OF BATTLE</span>
            </>
          }
          description="From the opening ceremony to the closing podium — the full running order, with filterable days and live status markers."
          action={<CTA href="/schedule" variant="ghost">Full Schedule</CTA>}
        />
        <div className="mt-12">
          <Schedule previewLimit={4} />
        </div>
      </div>
    </section>
  );
}

export function GallerySection() {
  return (
    <section className="section-pad relative" aria-labelledby="gallery-heading">
      <div className="shell">
        <SectionHeader
          protocol="// ARENA_ARCHIVE"
          title={
            <>
              FROM THE
              <br />
              <span className="text-metal">ARENA FLOOR</span>
            </>
          }
          description="Matchday, athletes, crowd and the champions — a look back at what the arena looks like when it is full."
          action={<CTA href="/gallery" variant="ghost">Open Gallery</CTA>}
        />
        <div className="mt-12">
          <Gallery limit={6} />
        </div>
      </div>
    </section>
  );
}

export function TeamsSection() {
  return (
    <section className="section-pad relative" aria-labelledby="teams-heading">
      <div className="shell">
        <SectionHeader
          protocol="// SQUAD_REGISTRY"
          title={
            <>
              THE SQUADS
              <br />
              <span className="text-metal">IN CONTENTION</span>
            </>
          }
          description="fifty pluse squads are registered. These are the ones the table is watching."
          action={<CTA href="/teams" variant="ghost">All Teams</CTA>}
        />
        <div className="mt-12">
          <Teams limit={8} />
        </div>
      </div>
    </section>
  );
}

export function SponsorsSection() {
  return (
    <section className="section-pad relative" aria-labelledby="sponsors-heading">
      <div className="shell">
        <SectionHeader
          protocol="// PARTNER_NETWORK"
          title="POWERING THE ARENA"
          description="ASHVAMEDHA 2026 runs on the support of its partners and the Odisha sports community."
          align="center"
        />
        <div className="mt-14">
          <Sponsors />
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <>
      <RegistrationCTA />
      <HeroMessage />
    </>
  );
}

