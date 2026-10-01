import Link from "next/link";
import { Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { FOOTER_LINKS, HUD, SITE, SOCIALS } from "@/data/site";

const SOCIAL_ICON = {
  Instagram,
  LinkedIn: Linkedin,
  YouTube: Youtube,
} as const;

/** Deterministic drifting particles — no JS, no random values. */
function FooterParticles() {
  const dots = Array.from({ length: 26 }, (_, i) => ({
    left: (i * 41) % 100,
    top: (i * 67) % 100,
    size: 1 + ((i * 11) % 3),
    dur: 16 + ((i * 5) % 22),
    delay: -((i * 4) % 20),
    crimson: i % 6 === 0,
    key: i,
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((d) => (
        <span
          key={d.key}
          className="absolute rounded-full animate-drift"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: `${d.size}px`,
            height: `${d.size}px`,
            background: d.crimson ? "#e11d2e" : "#d7dee9",
            opacity: d.crimson ? 0.45 : 0.2,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export function Footer() {
  return (
    <footer id="contact" className="relative mt-10 overflow-hidden border-t border-white/10 bg-graphite/60">
      <FooterParticles />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-crimson/50 to-transparent" />

      <div className="shell relative py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="relative flex h-9 w-9 items-center justify-center">
                <span className="absolute inset-0 rotate-45 border border-crimson/70 transition-transform duration-500 group-hover:rotate-[135deg]" />
                <span className="absolute inset-[7px] rotate-45 bg-crimson/90" />
              </span>
              <span>
                <span className="block font-display text-lg tracking-[0.16em] text-white">
                  ASHVAMEDHA
                </span>
                <span className="block font-mono text-[9px] tracking-hud text-crimson/85">
                  {SITE.year}
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-[0.88rem] leading-relaxed text-silver-dim">
              The annual sports fest of {SITE.hostLong}. Ten pluse sports, three days, one
              championship shield — and the only arena in Odisha that runs a broadcast for every
              final.
            </p>

            <div className="mt-6 space-y-3 text-[0.85rem]">
              <p className="flex items-start gap-2.5 text-silver-dim">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-crimson/80" />
                <span>{SITE.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-crimson/80" />
                <a href={`mailto:${SITE.contactEmail}`} className="link-underline text-silver-dim hover:text-white">
                  {SITE.contactEmail}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-crimson/80" />
                <a href={`tel:${SITE.contactPhone.replace(/\s/g, "")}`} className="link-underline text-silver-dim hover:text-white">
                  {SITE.contactPhone}
                </a>
              </p>
            </div>
          </div>

          {/* nav */}
          <nav className="lg:col-span-3" aria-label="Footer navigation">
            <h2 className="text-sm tracking-[0.18em] text-white">Explore</h2>
            <ul className="mt-5 space-y-3">
              {FOOTER_LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="link-underline font-mono text-[11px] uppercase tracking-hud text-silver-dim transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* social */}
          <div className="lg:col-span-3">
            <h2 className="text-sm tracking-[0.18em] text-white">Follow the Arena</h2>
            <ul className="mt-5 space-y-3">
              {SOCIALS.map((s) => {
                const Icon = SOCIAL_ICON[s.label as keyof typeof SOCIAL_ICON];
                return (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-hud text-silver-dim transition-colors hover:text-white"
                    >
                      <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      {s.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* registration */}
          <div className="lg:col-span-2">
            <h2 className="text-sm tracking-[0.18em] text-white">Entry</h2>
            <a
              href={SITE.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary clip-notch mt-5 w-full !px-4 !py-3"
            >
              Register
            </a>
            <p className="mt-4 font-mono text-[9px] leading-relaxed tracking-hud text-silver-dim">
              {HUD.eventStatus}
              <br />
              {HUD.season}
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="font-mono text-[10px] tracking-hud text-silver-dim">
            © ASHVAMEDHA {SITE.year} · {SITE.host.toUpperCase()}
          </p>
        </div>
      </div>
    </footer>
  );
}
