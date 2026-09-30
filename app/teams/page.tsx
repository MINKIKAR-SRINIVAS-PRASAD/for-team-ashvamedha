import type { Metadata } from "next";
import { Teams } from "@/components/Teams";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/sections/HomeSections";
import { getFestData } from "@/lib/festData";

export const metadata: Metadata = {
  title: "Teams",
  description:
    "The squads competing at ASHVAMEDHA 2026 — institutes, departments, captains, sports and current championship ranking.",
};

export default async function TeamsPage() {
  const { teams: TEAMS } = await getFestData();
  const institutes = new Set(TEAMS.map((t) => t.institution));

  return (
    <>
      <section className="relative overflow-hidden pt-[calc(var(--nav-h)+3rem)] pb-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(225,29,46,0.2),transparent_64%)]" />
        <div className="shell relative">
          <span className="hud text-crimson/90">{"// SQUAD_REGISTRY"}</span>
          <h1 className="mt-4 text-[clamp(2.6rem,9vw,6.5rem)] leading-[0.88] text-white">
            THE
            <br />
            <span className="text-metal">SQUADS</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-silver-dim">
            50+ squads are registered across {institutes.size} institutes. Each card carries
            its captain, discipline and current position in the championship table.
          </p>

          <dl className="mt-9 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4">
            {[
              { k: "Squads Listed", v: String(TEAMS.length) },
              { k: "Institutes", v: String(institutes.size) },
              { k: "Seeded", v: String(TEAMS.filter((t) => t.rank).length) },
              { k: "Sports Covered", v: String(new Set(TEAMS.map((t) => t.sport)).size) },
            ].map((s) => (
              <div key={s.k}>
                <dt className="hud">{s.k}</dt>
                <dd className="mt-1 font-display text-3xl leading-none text-white">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-pad pt-4" aria-label="Team cards">
        <div className="shell">
          <SectionHeader
            protocol="// ROSTER"
            title="WHO IS IN CONTENTION"
            description="Hover a card to open its record — crest, institute, department, captain and championship rank."
          />
          <div className="mt-10">
            <Teams />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
