import type { FestEvent } from "@/data/events";

/**
 * SPORT GLYPHS — original, abstract geometric marks (one per discipline).
 * Deliberately non-literal: they read as tactical HUD sigils rather than icons.
 */
export function SportGlyph({
  glyph,
  className = "h-6 w-6",
  strokeWidth = 1.4,
}: {
  glyph: FestEvent["glyph"];
  className?: string;
  strokeWidth?: number;
}) {
  const common = {
    className,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (glyph) {
    case "football":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="17" />
          <path d="M24 7v7M24 34v7M7 24h7M34 24h7" />
          <path d="M24 15l7 5-2.7 8.5h-8.6L17 20z" />
          <path d="M17 20l-6 2.5M31 20l6 2.5M19.7 28.5L15 36M28.3 28.5L33 36" />
        </svg>
      );

    case "basketball":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="17" />
          <path d="M7 24h34M24 7v34" />
          <path d="M12 12c6 6 6 18 0 24M36 12c-6 6-6 18 0 24" />
        </svg>
      );

    case "badminton":
      return (
        <svg {...common}>
          <path d="M22 26l-9 9a3 3 0 104 4l9-9" />
          <path d="M25 23l12-12" />
          <path d="M14 34l-4-4 6.5-6.5 4 4z" />
          <path d="M26 12c3-3 8-3 11 0s3 8 0 11" />
          <path d="M22 22l-3-3M28 16l-3-3M31 26l3 3M36 21l3 3" />
        </svg>
      );

    case "tabletennis":
      return (
        <svg {...common}>
          <path d="M9 30l13-13a9 9 0 1013-13" />
          <circle cx="17" cy="32" r="7" />
          <path d="M11 32h12M17 26v12" />
          <circle cx="39" cy="39" r="2.5" />
        </svg>
      );

    case "lawn":
      return (
        <svg {...common}>
          <path d="M40 8L22 26" />
          <path d="M14 34l4 4-6 6-4-4z" />
          <path d="M30 10c5-5 12-3 14 0s3 9 0 11" />
          <path d="M26 6c6-4 14-1 16 4s0 13-5 16" />
          <path d="M28 12l-5 5M34 16l-5 5M22 22l8 8M28 28l8 8" />
        </svg>
      );

    case "kho-kho":
      return (
        <svg {...common}>
          <path d="M16 38h18v5H16z" />
          <path d="M19 38c0-5 1-7 3-10l-2-4h10l-2 4c2 3 3 5 3 10" />
          <path d="M22 24l-3-6 4 2 2-5 3 5 4-2-3 6" />
        </svg>
      );

    case "gym events":
      return (
        <svg {...common}>
          <path d="M4 24h6M38 24h6" />
          <rect x="10" y="14" width="4" height="20" rx="1" />
          <rect x="34" y="14" width="4" height="20" rx="1" />
          <path d="M14 24h20" />
          <path d="M20 18v12M28 18v12" />
        </svg>
      );

    case "chess":
      return (
        <svg {...common}>
          <path d="M18 8h12" />
          <path d="M22 8v6l-6 8h16l-6-8V8" />
          <path d="M18 22h12l4 8H14z" />
          <path d="M14 30h20" />
          <path d="M12 36h24" />
          <path d="M10 41h28" />
        </svg>
      );

    case "esportst":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="15" />
          <path d="M24 4v10M24 34v10M4 24h10M34 24h10" />
          <circle cx="24" cy="24" r="3.5" />
          <path d="M31 17l6-6M17 17l-6-6M31 31l6 6M17 31l-6 6" />
        </svg>
      );

    case "sportsquiz":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="17" />
          <path d="M18 18c0-3 2.5-5 6-5s6 2 6 5c0 3-2 4.5-4.5 6.5-1.5 1.2-2.5 2.3-2.5 4.5" />
          <circle cx="24" cy="36" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );

    case "swimming":
      return (
        <svg {...common}>
          <circle cx="28" cy="9" r="4" />
          <path d="M26 15l-6 7 6 5-4 13" />
          <path d="M20 22l-9 4 3 6 8-3" />
          <path d="M26 27l8 2 4 10" />
          <path d="M31 14l7 3" />
        </svg>
      );

    case "volleyball":
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="17" />
          <path d="M12 11c7 5 10 13 9 22" />
          <path d="M37 15c-7 3-15 2-21-3" />
          <path d="M9 30c8-8 20-9 30-3" />
        </svg>
      );

    default:
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="17" />
          <path d="M24 15l9 6-3.5 11h-11L15 21z" />
        </svg>
      );
  }
}