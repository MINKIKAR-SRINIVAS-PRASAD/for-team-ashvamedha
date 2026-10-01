import type { Metadata } from "next";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SportsGrid } from "@/components/SportsGrid";
import { EventCarousel } from "@/components/EventCarousel";
import { CTASection } from "@/components/sections/HomeSections";
import { EVENT_CATEGORIES } from "@/data/events";
import { getFestData } from "@/lib/festData";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Every sport at ASHVAMEDHA 2026 — football, basketball, Badminton, Table Tennis, Kho-Kho, Lawn Tennis Tennis, Power Lifting, chess and more, with dates, venues and registration status.",
};

export default async function EventsPage() {
  const { events: EVENTS } = await getFestData();
  return (
    <>
      {/* page masthead */}
      <section className="relative overflow-hidden pt-[calc(var(--nav-h)+3rem)] pb-14">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(225,29,46,0.24),transparent_64%)]" />
        <div className="shell relative">
          <span className="hud text-crimson/90">{"// EVENT_PROTOCOL"}</span>
          <h1 className="mt-4 text-[clamp(2.6rem,9vw,6.5rem)] leading-[0.88] text-white">
            ALL
            <br />
            <span className="text-metal">BATTLEFIELDS</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-silver-dim">
            {"10+"} disciplines across {EVENT_CATEGORIES.length - 1} categories. Filter by
            category, open any event for its full protocol — date, venue, format, prize pool and
            registration status.
          </p>

          <dl className="mt-9 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4">
            {[
              { k: "Disciplines", v:"10+" },
             // { k: "Team Sports", v: String(EVENTS.filter((e) => e.category === "Team Sport").length) },
              { k: "Team Sports", v: "20+" },
              { k: "Open Entries", v: String(EVENTS.filter((e) => e.registration !== "closed").length) },
              { k: "Total Prize", v: "₹2.8L" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="hud">{s.k}</dt>
                <dd className="mt-1 font-display text-3xl leading-none text-white">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* carousel */}
      <section className="section-pad pt-0" aria-label="Featured events">
        <div className="shell">
          <SectionHeader
            protocol="// BATTLEFIELD_01"
            title="FEATURED ARENAS"
            description="The headline battlegrounds, in 3D. Drag, swipe or use ← / →."
          />
          <div className="mt-10">
            <EventCarousel />
          </div>
        </div>
      </section>

      {/* full grid */}
      <section className="section-pad pt-0" aria-label="All events">
        <div className="shell">
          <SectionHeader
            protocol="// FULL_ROSTER"
            title="EVERY SPORT"
            description="Every event carries a live registration status — closing dates are enforced by the arena control room."
          />
          <div className="mt-10">
            <SportsGrid />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
