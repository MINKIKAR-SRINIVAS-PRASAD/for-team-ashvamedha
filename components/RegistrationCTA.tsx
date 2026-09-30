import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/components/ui/CTA";
import { SITE } from "@/data/site";

/**
 * REGISTRATION CTA — the loudest moment on the site.
 * A single huge red cinematic glow behind two lines of copy and one action.
 */
export function RegistrationCTA() {
  return (
    <section id="register" className="relative overflow-hidden" aria-labelledby="register-heading">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[120vh] w-[130vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(225,29,46,0.35),rgba(124,11,22,0.16)_38%,transparent_68%)]" />
      <div className="pointer-events-none absolute inset-0 layer-scanlines opacity-20" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson/70 to-transparent" />

      <div className="shell relative py-[clamp(5rem,11vw,10rem)]">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Reveal y={14} blur={false}>
            <span className="flex items-center gap-2 border border-crimson/45 bg-crimson/10 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-crimson animate-live-pulse" />
              <span className="hud text-white/90">REGISTRATION WINDOW OPEN</span>
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h2
              id="register-heading"
              className="mt-6 text-[clamp(2.4rem,8vw,6.5rem)] leading-[0.88] text-white"
              style={{ textShadow: "0 0 70px rgba(225,29,46,0.45)" }}
            >
              READY FOR
              <br />
              THE BATTLE?
            </h2>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mt-6 font-display text-[clamp(0.95rem,2vw,1.35rem)] tracking-[0.14em] text-silver">
              ENTER THE ARENA.&nbsp;&nbsp;MAKE YOUR MARK.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <CTA
                href={SITE.registrationUrl}
                external
                variant="primary"
                className="!px-9 !py-5 !text-[0.8rem]"
              >
                Register Now →
              </CTA>
              <CTA href="/events" variant="ghost" className="!px-7 !py-5">
                Browse 10+ Sports
              </CTA>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-7 font-mono text-[10px] tracking-hud text-silver-dim">
              Team entries close 08 OCT 2026 · Individual entries close 11 OCT 2026
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * HERO MESSAGE — the closing statement before the footer.
 */
export function HeroMessage() {
  return (
    <section className="relative overflow-hidden" aria-label="Closing statement">
      <div className="pointer-events-none absolute inset-0 layer-grain opacity-30" />
      <div className="shell relative py-[clamp(4rem,9vw,8rem)]">
        <div className="hairline" />
        <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:items-end">
          <Reveal className="lg:col-span-8" delay={0.05}>
            <p className="text-[clamp(1.5rem,4.4vw,3.4rem)] font-display uppercase leading-[1.06] tracking-tight text-white">
              This is not just a sports fest.
              <br />
              <span className="text-crimson" style={{ textShadow: "0 0 50px rgba(225,29,46,0.5)" }}>
                This is the battle for glory.
              </span>
            </p>
          </Reveal>

          <Reveal className="lg:col-span-4" delay={0.14}>
            <div className="lg:text-right">
              <p className="text-titan text-[clamp(1.1rem,2.6vw,1.7rem)] text-metal">
                ASHVAMEDHA {SITE.year}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-hud text-silver-dim">
                {SITE.hostLong.toUpperCase()}
              </p>
              <p className="mt-4 font-mono text-[10px] tracking-hud text-crimson/80">
                {SITE.arena}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
