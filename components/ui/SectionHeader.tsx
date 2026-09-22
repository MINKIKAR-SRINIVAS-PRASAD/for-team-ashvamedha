import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/Reveal";

/**
 * SectionHeader — the shared masthead for every section.
 * The `protocol` label (e.g. "// BATTLEFIELD_01") is the recurring HUD motif that
 * threads the sections together.
 */
export function SectionHeader({
  protocol,
  title,
  description,
  align = "left",
  action,
  className,
}: {
  protocol: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <div className={cn("max-w-3xl", align === "center" && "mx-auto")}>
        <Reveal y={16} blur={false}>
          <div
            className={cn(
              "flex items-center gap-3",
              align === "center" && "justify-center",
            )}
          >
            <span className="h-px w-10 bg-crimson" />
            <span className="hud text-crimson/90">{protocol}</span>
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <h2 className="mt-4 text-[clamp(2rem,5vw,4.25rem)] leading-[0.92] text-white">
            {title}
          </h2>
        </Reveal>

        {description && (
          <Reveal delay={0.12}>
            <p className="mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-silver-dim">
              {description}
            </p>
          </Reveal>
        )}
      </div>

      {action && <Reveal delay={0.16}>{action}</Reveal>}
    </div>
  );
}
