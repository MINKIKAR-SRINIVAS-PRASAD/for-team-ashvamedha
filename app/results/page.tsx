import type { Metadata } from "next";
import { Trophy, Medal } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Crest } from "@/components/art/Crest";
import { CTASection } from "@/components/sections/HomeSections";
import { findTeam, getFestData } from "@/lib/festData";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Results",
  description:
    "ASHVAMEDHA 2026 results — event champions, runners-up and the overall championship podium at IIT Bhubaneswar.",
};

const MEDAL_TONE = {
  gold: { ring: "border-gold/50", text: "text-gold", bg: "rgba(232,196,106,0.12)" },
  silver: { ring: "border-silver/40", text: "text-silver", bg: "rgba(2,222,233,0.1)" },
  bronze: { ring: "border-bronze/45", text: "text-bronze", bg: "rgba(192,122,69,0.12)" },
};

export default async function ResultsPage() {
  const {
    eventChampions: EVENT_CHAMPIONS,
    podium2025: PODIUM_2025,
    recentResults: RECENT_RESULTS,
    teams,
  } = await getFestData();
  const getTeam = (slug: string) => findTeam(teams, slug);
  return (
    <>
      <section className="relative overflow-hidden pt-[calc(var(--nav-h)+3rem)] pb-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(232,196,106,0.18),transparent_64%)]" />
        <div className="shell relative">
          <span className="hud text-gold/90">{"// RESULTS_PROTOCOL"}</span>
          <h1 className="mt-4 text-[clamp(2.6rem,9vw,6.5rem)] leading-[0.88] text-white">
            THE
            <br />
            <span className="text-metal">VERDICT</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-silver-dim">
            Every fixture, every medal. Results are published as soon as the officials sign off, with
            the overall championship podium confirmed on the closing night.
          </p>
        </div>
      </section>

      {/* championship podium */}
      <section className="section-pad pt-4" aria-label="Championship podium">
        <div className="shell">
          <SectionHeader
            protocol="// OVERALL_PODIUM"
            title="THE CHAMPIONSHIP PODIUM"
            description="The three squads that finished the season on the overall table."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {PODIUM_2025.map((p) => {
              const tone = MEDAL_TONE[p.medal];
              const team = getTeam(
                p.team.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z-]/g, ""),
              );
              return (
                <div
                  key={p.place}
                  className={cn(
                    "relative overflow-hidden panel clip-notch p-7 text-center",
                    tone.ring,
                  )}
                  style={{ boxShadow: `inset 0 1px 0 rgba(255,255,255,0.07), 0 40px 110px -70px ${tone.bg}` }}
                >
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                  <div className="flex justify-center">
                    {p.place === 1 ? (
                      <Trophy className={cn("h-7 w-7", tone.text)} />
                    ) : (
                      <Medal className={cn("h-7 w-7", tone.text)} />
                    )}
                  </div>

                  <p className={cn("mt-4 font-display text-5xl leading-none", tone.text)}>
                    {String(p.place).padStart(2, "0")}
                  </p>

                  <div className="mt-5 flex justify-center">
                    {team && <Crest name={team.name} colors={team.crest} size={56} />}
                  </div>

                  <h3 className="mt-4 text-[1.35rem] leading-none text-white">{p.team}</h3>
                  <p className="mt-2.5 font-mono text-[10px] tracking-hud text-silver-dim">
                    {p.points} POINTS · {p.medal.toUpperCase()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* event champions */}
      <section className="section-pad pt-0" aria-label="Event champions">
        <div className="shell">
          <SectionHeader
            protocol="// EVENT_CHAMPIONS"
            title="CROWNED SO FAR"
            description="Event-level champions confirmed by the arena control room."
          />

          <div className="mt-10 overflow-hidden panel clip-notch">
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <caption className="sr-only">Event champions and runners-up at ASHVAMEDHA 2026</caption>
                <thead>
                  <tr className="border-b border-white/10 bg-void/40">
                    {["Event", "Champion", "Runner-up"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-5 py-3.5 font-mono text-[9px] font-normal uppercase tracking-hud text-silver-dim"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {EVENT_CHAMPIONS.map((row) => (
                    <tr key={row.event} className="border-b border-white/[0.06] transition-colors hover:bg-white/[0.03]">
                      <td className="px-5 py-4 font-display text-lg text-white/85">{row.event}</td>
                      <td className="px-5 py-4">
                        <span className="flex items-center gap-2.5">
                          <Trophy className="h-4 w-4 text-gold" />
                          <span className="text-[0.95rem] text-white">{row.champion}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[0.92rem] text-silver-dim">{row.runnerUp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* latest completed fixtures */}
          <div className="mt-12">
            <SectionHeader
              protocol="// LATEST_FIXTURES"
              title="RECENTLY DECIDED"
              description="Final scorelines from the last completed session."
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {RECENT_RESULTS.map((r) => (
                <li key={`${r.sport}-${r.winner}`} className="border border-white/10 bg-void/50 p-5">
                  <span className="font-mono text-[9px] tracking-hud text-silver-dim">
                    {r.sport.toUpperCase()} · {r.stage.toUpperCase()}
                  </span>
                  <p className="mt-3 text-[0.95rem] text-white">
                    {r.winner} <span className="text-silver-dim">def.</span> {r.loser}
                  </p>
                  <p className="mt-1.5 font-mono text-[11px] text-volt">{r.score}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
