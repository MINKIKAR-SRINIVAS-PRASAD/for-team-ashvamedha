import { SportGlyph } from "@/components/art/SportGlyph";
import { accentOf } from "@/lib/accents";
import type { Accent, FestEvent } from "@/data/events";
import { seed, pad } from "@/lib/utils";

/**
 * BATTLEFIELD FRAME — the procedural stand-in for event / gallery photography.
 *
 * Every frame is deterministically generated from a string seed, so the same
 * event always renders the same artwork (no hydration mismatch, no random
 * flicker). Swap in real photography by setting `image` on the data object —
 * the component then renders a Next.js <Image> instead and nothing else changes.
 */
export function BattlefieldFrame({
  seedKey,
  accent = "crimson",
  glyph,
  index,
  label,
  className = "",
}: {
  seedKey: string;
  accent?: Accent;
  glyph: FestEvent["glyph"];
  index?: number;
  label?: string;
  className?: string;
}) {
  const a = accentOf(accent);
  const s = seed(seedKey);
  const s2 = seed(seedKey + "b");
  const uid = `bf-${seedKey.replace(/[^a-z0-9]/gi, "")}`;

  // Deterministic shard geometry
  const shards = Array.from({ length: 7 }, (_, i) => {
    const t = seed(`${seedKey}-shard-${i}`);
    const x = 6 + t * 82;
    const y = 12 + seed(`${seedKey}-y-${i}`) * 70;
    const w = 4 + t * 14;
    const h = 8 + seed(`${seedKey}-h-${i}`) * 26;
    const rot = (seed(`${seedKey}-r-${i}`) - 0.5) * 60;
    return { x, y, w, h, rot, o: 0.06 + t * 0.16 };
  });

  const horizon = 58 + s * 8; // % from top

  return (
    <div className={`relative overflow-hidden bg-void ${className}`}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <radialGradient id={`${uid}-glow`} cx="50%" cy={horizon + "%"} r="62%">
            <stop offset="0%" stopColor={a.base} stopOpacity="0.55" />
            <stop offset="45%" stopColor={a.deep} stopOpacity="0.3" />
            <stop offset="100%" stopColor="#05060a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d1118" />
            <stop offset="100%" stopColor="#05060a" />
          </linearGradient>
          <linearGradient id={`${uid}-floor`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={a.deep} stopOpacity="0.55" />
            <stop offset="100%" stopColor="#05060a" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id={`${uid}-streak`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* sky */}
        <rect width="100" height="100" fill={`url(#${uid}-sky)`} />
        <rect width="100" height="100" fill={`url(#${uid}-glow)`} />

        {/* distant arena arc */}
        <ellipse
          cx="50"
          cy={horizon + 14}
          rx="62"
          ry="26"
          fill="none"
          stroke={a.base}
          strokeOpacity="0.28"
          strokeWidth="0.4"
        />
        <ellipse
          cx="50"
          cy={horizon + 16}
          rx="46"
          ry="18"
          fill="none"
          stroke="#d7dee9"
          strokeOpacity="0.14"
          strokeWidth="0.3"
        />

        {/* ground plane */}
        <rect y={horizon} width="100" height={100 - horizon} fill={`url(#${uid}-floor)`} />
        {Array.from({ length: 9 }, (_, i) => (
          <line
            key={`g${i}`}
            x1={50 + (i - 4) * 4}
            y1={horizon}
            x2={50 + (i - 4) * 22}
            y2="100"
            stroke="#ffffff"
            strokeOpacity="0.08"
            strokeWidth="0.25"
          />
        ))}

        {/* floating metallic shards */}
        {shards.map((sh, i) => (
          <rect
            key={`s${i}`}
            x={sh.x}
            y={sh.y}
            width={sh.w}
            height={sh.h}
            rx="0.6"
            fill={i % 3 === 0 ? "#d7dee9" : i % 3 === 1 ? a.base : a.deep}
            opacity={sh.o}
            transform={`rotate(${sh.rot} ${sh.x + sh.w / 2} ${sh.y + sh.h / 2})`}
          />
        ))}

        {/* dimensional fracture — deterministic crack polyline */}
        <path
          d={`M${20 + s * 10} 0 L${34 + s2 * 8} 26 L${28 + s * 14} 44 L${42 + s2 * 10} ${horizon} L${36 + s * 12} 100`}
          fill="none"
          stroke={a.base}
          strokeOpacity="0.5"
          strokeWidth="0.7"
        />
        <path
          d={`M${20 + s * 10} 0 L${34 + s2 * 8} 26 L${28 + s * 14} 44 L${42 + s2 * 10} ${horizon} L${36 + s * 12} 100`}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.28"
          strokeWidth="0.22"
        />

        {/* light streaks */}
        <rect y={horizon - 1} width="100" height="0.5" fill={`url(#${uid}-streak)`} />

        {/* HUD ticks */}
        {Array.from({ length: 16 }, (_, i) => (
          <line
            key={`t${i}`}
            x1={4 + i * 6}
            y1="96"
            x2={4 + i * 6}
            y2={i % 4 === 0 ? 93 : 94.6}
            stroke="#d7dee9"
            strokeOpacity={i % 4 === 0 ? 0.4 : 0.18}
            strokeWidth="0.3"
          />
        ))}
      </svg>

      {/* sport sigil watermark */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div
          className="transition-transform duration-700 ease-out group-hover:scale-105"
          style={{ color: a.base }}
        >
          <SportGlyph glyph={glyph} className="h-[42%] w-[42%] opacity-[0.2]" strokeWidth={1} />
        </div>
      </div>

      {/* cinematic overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/35 to-transparent" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] layer-scanlines" />
      <div className="pointer-events-none absolute inset-0 layer-grain" />

      {/* corner HUD */}
      <div className="pointer-events-none absolute inset-3 border border-white/5" />
      {index !== undefined && (
        <span className="pointer-events-none absolute left-4 top-3 font-mono text-[10px] tracking-hud text-silver-dim">
          {pad(index)}
        </span>
      )}
      {label && (
        <span className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] tracking-hud text-silver-dim">
          {label}
        </span>
      )}
    </div>
  );
}
