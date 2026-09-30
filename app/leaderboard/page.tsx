import type { Metadata } from "next";
import { Leaderboard } from "@/components/Leaderboard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ChampionSpotlight } from "@/components/ChampionSpotlight";
import { CTASection } from "@/components/sections/HomeSections";
import { winPercent } from "@/data/leaderboard";
import { getFestData } from "@/lib/festData";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "ASHVAMEDHA 2026 championship standings — rank, matches, wins, losses, points and win percentage for every competing squad.",
};

export default async function LeaderboardPage() {
  const { rankings: RANKINGS } = await getFestData();
  const best = [...RANKINGS].sort((a, b) => winPercent(b) - winPercent(a))[0];
  const totalMatches = RANKINGS.reduce((sum, r) => sum + r.matches, 0);

  return (
    <>
      <section className="relative overflow-hidden pt-[calc(var(--nav-h)+3rem)] pb-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(232,196,106,0.18),transparent_64%)]" />
        <div className="shell relative">
          <span className="hud text-gold/90">{"// RANKING_SYSTEM"}</span>
          <h1 className="mt-4 text-[clamp(2.6rem,9vw,6.5rem)] leading-[0.88] text-white">
            THE CHAMPIONS&apos;
            <br />
            <span className="text-metal">TABLE</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-silver-dim">
            Standings are recalculated after every completed fixture. Sort by rank, points, wins or
            win percentage — the podium is locked to gold, silver and bronze.
          </p>

          <dl className="mt-9 grid max-w-3xl grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-6 sm:grid-cols-4">
            {[
              { k: "Ranked Squads", v: String(RANKINGS.length) },
              { k: "Fixtures Played", v: String(totalMatches) },
              { k: "Best Win %", v: `${winPercent(best).toFixed(1)}%` },
              { k: "Points at Stake", v: "180" },
            ].map((s) => (
              <div key={s.k}>
                <dt className="hud">{s.k}</dt>
                <dd className="mt-1 font-display text-3xl leading-none text-white">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section-pad pt-4" aria-label="Full standings">
        <div className="shell">
          <SectionHeader
            protocol="// FULL_STANDINGS"
            title="BATTLE RANKINGS"
            description="Tap a team name to open its squad record. On smaller screens, scroll the table sideways to see every column."
          />
          <div className="mt-10">
            <Leaderboard />
          </div>
        </div>
      </section>

      <div className="section-pad pt-0">
        <ChampionSpotlight />
      </div>

      <CTASection />
    </>
  );
}
