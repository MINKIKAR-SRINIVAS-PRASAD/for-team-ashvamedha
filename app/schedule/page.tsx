import type { Metadata } from "next";
import { Schedule } from "@/components/Schedule";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/sections/HomeSections";
import { getFestData } from "@/lib/festData";

export const metadata: Metadata = {
  title: "Schedule",
  description:
    "The full ASHVAMEDHA 2026 running order — three days, 24 sports, opening ceremony to closing podium at IIT Bhubaneswar.",
};

export default async function SchedulePage() {
  const { days: DAYS, schedule: SCHEDULE } = await getFestData();
  const liveCount = SCHEDULE.filter((s) => s.status === "live").length;

  return (
    <>
      <section className="relative overflow-hidden pt-[calc(var(--nav-h)+3rem)] pb-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(49,168,255,0.2),transparent_64%)]" />
        <div className="shell relative">
          <span className="hud text-volt/90">{"// TIMELINE_PROTOCOL"}</span>
          <h1 className="mt-4 text-[clamp(2.6rem,9vw,6.5rem)] leading-[0.88] text-white">
            THREE DAYS
            <br />
            <span className="text-metal">OF BATTLE</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-silver-dim">
            From the opening ceremony on 09 October to the podium on the closing night — every
            session, venue and stage. Scroll the timeline sideways on desktop, or follow it top to
            bottom on mobile.
          </p>

          <dl className="mt-9 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4">
            {[
              { k: "Days", v: String(DAYS.length) },
              { k: "Sessions", v: String(SCHEDULE.length) },
              { k: "Live Now", v: String(liveCount) },
              { k: "Venues", v: "8" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="hud">{s.k}</dt>
                <dd className="mt-1 font-display text-3xl leading-none text-white">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-pad pt-4" aria-label="Full timetable">
        <div className="shell">
          <SectionHeader
            protocol="// SESSION_INDEX"
            title="RUNNING ORDER"
            description="Filter by day. Live sessions are marked in crimson; completed sessions are dimmed."
          />
          <div className="mt-10">
            <Schedule />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
