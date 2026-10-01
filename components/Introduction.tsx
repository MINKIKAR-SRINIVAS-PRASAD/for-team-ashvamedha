import { Reveal, TitanWords } from "@/components/ui/Reveal";
import { HudStrip } from "@/components/BackgroundEffects";
import { CTA } from "@/components/ui/CTA";
import { FEST_STATS, HUD, SITE } from "@/data/site";

/**
 * INTRODUCTION — the manifesto section.
 *
 * A giant ghosted "2026" sits behind the statement so the eye reads the year
 * before the words, with a three-line titan headline in front.
 */
export function Introduction() {
  return (
    <section className="section-pad relative overflow-hidden" aria-labelledby="intro-heading">
      {/* oversized background year */}
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[clamp(14rem,42vw,40rem)] leading-none tracking-tighter text-white/[0.028]"
      >
        2026
      </span>
      <div className="pointer-events-none absolute inset-0 layer-grid opacity-40" />

      <div className="shell relative">
        <Reveal y={16} blur={false}>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-crimson" />
            <span className="hud text-crimson/90">{"// FEST_PROTOCOL"}</span>
          </div>
        </Reveal>

        <h2
          id="intro-heading"
          className="mt-6 max-w-5xl text-[clamp(2.1rem,6.4vw,5.6rem)] leading-[0.95] text-white"
        >
          <TitanWords text="ONE ARENA." />
          <br />
          <TitanWords
            text="MANY CHAMPIONS."
            className="text-metal"
            delay={0.14}
          />
          <br />
          <TitanWords text="ONE LEGACY." className="text-crimson" delay={0.28} />
        </h2>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
          <Reveal className="lg:col-span-5" delay={0.1}>
            <p className="text-[1.02rem] leading-relaxed text-silver-dim">
              ASHVAMEDHA is the annual sports fest of{" "}
              <span className="text-silver">{SITE.hostLong}</span> — three days in which the campus
              stops being a campus and becomes an arena. Group stages run from first light, finals
              close under the floodlights, and a single table decides who leaves with the
              Ashvamedha Shield.
            </p>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-silver-dim">
              Ten pluse sports. twenty pluse teams. Three days under the arena lights at{" "}
              <span className="text-silver">{SITE.hostLong}</span>. Every court,
              every board, every server room becomes a battlefield with a scoreboard attached.
            </p>

            <div className="mt-8">
              <HudStrip items={[HUD.status, HUD.eventStatus, HUD.season, HUD.uptime]} />
            </div>
          </Reveal>

          <Reveal className="lg:col-span-4" delay={0.18}>
            <div className="panel clip-notch h-full p-6">
              <span className="hud text-crimson/90">{"// WHY IT MATTERS"}</span>
              <ul className="mt-5 space-y-4">
                {[
                  {
                    k: "Scale",
                    v: "10+ disciplines from football to chess, all inside one 72-hour window.",
                  },
                  {
                    k: "Standard",
                    v: "Certified officials, electronic timing and photo-finish review at every final.",
                  },
                  {
                    k: "Spectacle",
                    v: "Four-camera arena broadcast, live commentary and a closing podium ceremony.",
                  },
                ].map((row) => (
                  <li key={row.k} className="flex gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                    <span className="mt-0.5 font-mono text-[10px] tracking-hud text-crimson/80">
                      {row.k.toUpperCase()}
                    </span>
                    <span className="text-[0.9rem] leading-relaxed text-silver-dim">{row.v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal className="lg:col-span-3" delay={0.26}>
            <div className="flex h-full flex-col justify-between gap-8">
              <dl className="space-y-5">
                {FEST_STATS.map((s) => (
                  <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-white/10 pb-3">
                    <dt className="hud">{s.label}</dt>
                    <dd className="font-display text-2xl text-white">{s.value}</dd>
                  </div>
                ))}
              </dl>
              <CTA href="/events" variant="ghost" className="w-full">
                View All Events
              </CTA>
            </div>
          </Reveal>
        </div>

        {/* manifesto strip */}
        <Reveal delay={0.1} className="mt-16">
          <div className="hairline" />
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", t: "Power", d: "Strength events judged on audited lifts and technique." },
              { n: "02", t: "Rivalry", d: "Inter-institute brackets that settle old scores." },
              { n: "03", t: "Teamwork", d: "Relays, squads and relays-within-relays." },
              { n: "04", t: "Legacy", d: "One shield, one table, one permanent record." },
            ].map((c) => (
              <div key={c.n} className="group">
                <span className="font-mono text-[10px] tracking-hud text-crimson/80">{c.n}</span>
                <h3 className="mt-2 text-xl text-white transition-colors duration-300 group-hover:text-crimson">
                  {c.t}
                </h3>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-silver-dim">{c.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
