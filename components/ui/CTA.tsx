import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/**
 * All CTAs funnel through here so hover behaviour (glow -> lift -> sheen sweep)
 * is identical everywhere, whether the target is internal or external.
 */
type Variant = "primary" | "ghost" | "outline";

export function CTA({
  href,
  children,
  variant = "primary",
  external = false,
  className,
  icon,
  disabled = false,
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  external?: boolean;
  className?: string;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  const label = (
    <>
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon ?? <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />}
      </span>
    </>
  );

  const classes = cn(
    "btn group clip-notch",
    variant === "primary" && "btn-primary",
    variant === "ghost" && "btn-ghost",
    variant === "outline" && "border-white/20 bg-transparent text-silver hover:border-crimson/70 hover:text-white",
    className,
  );

  if (disabled) {
    return (
      <span className={cn(classes, "pointer-events-none opacity-45")} aria-disabled="true">
        {label}
      </span>
    );
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {label}
    </Link>
  );
}
