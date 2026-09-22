import Link from "next/link";
import { NAV_LINKS } from "@/data/site";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden pt-[var(--nav-h)]">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-burst opacity-50 blur-3xl" />
      <div className="shell relative text-center">
        <span className="hud text-crimson/90">{"// SIGNAL_LOST"}</span>
        <h1 className="mt-4 font-display text-[clamp(4rem,18vw,12rem)] leading-none text-white">
          404
        </h1>
        <p className="mx-auto mt-5 max-w-md text-[0.98rem] leading-relaxed text-silver-dim">
          This sector of the arena does not exist. The bracket you are looking for may have been
          moved or renamed.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="btn btn-primary clip-notch !px-7 !py-4">
            Return to Arena
          </Link>
          <Link href="/events" className="btn btn-ghost clip-notch !px-7 !py-4">
            Browse Events
          </Link>
        </div>

        <ul className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-3">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="font-mono text-[10px] uppercase tracking-hud text-silver-dim transition-colors hover:text-white"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
