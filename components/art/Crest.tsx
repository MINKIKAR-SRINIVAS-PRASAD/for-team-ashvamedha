import { initials } from "@/lib/utils";

/**
 * CREST — procedural team badge.
 * Deterministic shield built from the team's two-stop gradient, so 60+ teams can
 * exist without a single logo asset. Replace with real crests later by rendering
 * an <Image> when a logo URL exists.
 */
export function Crest({
  name,
  colors,
  className = "",
  size = 96,
}: {
  name: string;
  colors: [string, string];
  className?: string;
  size?: number;
}) {
  const uid = `crest-${name.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
  const [c1, c2] = colors;

  return (
    <svg
      viewBox="0 0 120 132"
      width={size}
      height={(size * 132) / 120}
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id={`${uid}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <linearGradient id={`${uid}-sheen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="42%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* shield */}
      <path
        d="M60 4 L114 22 V72 C114 100 90 118 60 128 C30 118 6 100 6 72 V22 Z"
        fill={`url(#${uid}-fill)`}
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.2"
      />
      <path
        d="M60 4 L114 22 V72 C114 100 90 118 60 128 C30 118 6 100 6 72 V22 Z"
        fill={`url(#${uid}-sheen)`}
      />
      {/* inner ring + tick marks */}
      <path
        d="M60 16 L102 30 V72 C102 94 82 108 60 116 C38 108 18 94 18 72 V30 Z"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.8"
      />
      {Array.from({ length: 9 }, (_, i) => (
        <line
          key={i}
          x1={26 + i * 8.5}
          y1="122"
          x2={26 + i * 8.5}
          y2={i % 3 === 0 ? 116 : 119}
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="0.7"
        />
      ))}
      {/* monogram */}
      <text
        x="60"
        y="74"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="46"
        fill="#05060a"
        fillOpacity="0.82"
        letterSpacing="1"
      >
        {initials(name)}
      </text>
    </svg>
  );
}
