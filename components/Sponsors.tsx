import { SPONSOR_TIERS } from "@/data/sponsors";
import { getFestData } from "@/lib/festData";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

/**
 * SPONSORS — deliberately quiet.
 * Monochrome/silver by default, brightening on hover. Logo files can be dropped
 * in later via `sponsor.logo`; until then the wordmark renders as styled type.
 */
export async function Sponsors() {
  const { sponsors: SPONSORS } = await getFestData();

  return (
    <div className="space-y-14">
      {SPONSOR_TIERS.map((tier) => {
        const list = SPONSORS.filter((s) => s.tier === tier.tier);
        if (!list.length) return null;
        const isTitle = tier.tier === "title";

        return (
          <div key={tier.tier}>
            <Reveal y={14} blur={false}>
              <div className="flex items-center gap-3">
                <span className={cn("h-px w-8", isTitle ? "bg-gold/70" : "bg-white/20")} />
                <span className={cn("hud", isTitle && "text-gold/90")}>{tier.label}</span>
              </div>
            </Reveal>

            <div
              className={cn(
                "mt-6 grid gap-3",
                isTitle
                  ? "grid-cols-1"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
              )}
            >
              {list.map((s, i) => (
                <Reveal key={s.name} delay={i * 0.05}>
                  <div
                    className={cn(
                      "group flex h-full flex-col items-center justify-center gap-2 border border-white/10 bg-void/50 text-center transition-all duration-500 hover:border-white/25 hover:bg-white/[0.03]",
                      isTitle ? "px-8 py-10" : "px-4 py-7",
                    )}
                  >
                    <span
                      className={cn(
                        "font-display uppercase tracking-[0.14em] text-silver-dim transition-colors duration-500 group-hover:text-white",
                        isTitle ? "text-[clamp(1.1rem,2.6vw,1.9rem)]" : "text-[0.82rem]",
                      )}
                    >
                      {s.wordmark}
                    </span>
                    {s.note && (
                      <span className="font-mono text-[9px] tracking-hud text-silver-dim">
                        {s.note.toUpperCase()}
                      </span>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
