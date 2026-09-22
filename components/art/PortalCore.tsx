/**
 * PORTAL CORE — the hero centrepiece.
 *
 * An ORIGINAL abstract "dimensional fracture" artefact: a cracked cosmic sphere
 * ringed by counter-rotating dimensional bands, bleeding red energy and metallic
 * fragments. Nothing here reproduces any existing film artwork, character or
 * logo — it is built entirely from primitives and gradients.
 *
 * Rendered as static SVG + CSS keyframes (no JS animation loop) so it costs the
 * main thread almost nothing.
 */
export function PortalCore({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`} aria-hidden>
      {/* deep ambient bloom */}
      <div className="absolute left-1/2 top-[46%] h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-burst opacity-70 blur-[2px]" />
      <div className="absolute left-1/2 top-[46%] h-[74vmin] w-[74vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-portal-cone opacity-30 blur-[70px] animate-spin-slow" />

      <svg
        viewBox="0 0 1000 1000"
        className="absolute left-1/2 top-[46%] h-[132vmin] w-[132vmin] -translate-x-1/2 -translate-y-1/2"
      >
        <defs>
          <radialGradient id="pc-sphere" cx="42%" cy="34%" r="72%">
            <stop offset="0%" stopColor="#eef2f9" stopOpacity="0.95" />
            <stop offset="26%" stopColor="#9aa4b6" stopOpacity="0.72" />
            <stop offset="52%" stopColor="#3a1520" stopOpacity="0.85" />
            <stop offset="78%" stopColor="#7c0b16" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#05060a" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="pc-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="34%" stopColor="#ff5a3c" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c0b16" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="pc-band" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d7dee9" stopOpacity="0.55" />
            <stop offset="45%" stopColor="#e11d2e" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#31a8ff" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="pc-metal" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7B8393" />
            <stop offset="35%" stopColor="#F4F7FB" />
            <stop offset="55%" stopColor="#9AA3B4" />
            <stop offset="100%" stopColor="#2a3140" />
          </linearGradient>
          <filter id="pc-blur">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* counter-rotating dimensional bands */}
        <g className="animate-spin-slow" style={{ transformOrigin: "500px 500px" }}>
          <circle
            cx="500"
            cy="500"
            r="430"
            fill="none"
            stroke="url(#pc-band)"
            strokeWidth="1.2"
            strokeDasharray="180 46 8 46"
            opacity="0.7"
          />
          <circle
            cx="500"
            cy="500"
            r="376"
            fill="none"
            stroke="#d7dee9"
            strokeOpacity="0.18"
            strokeWidth="0.8"
            strokeDasharray="2 14"
          />
        </g>
        <g className="animate-spin-reverse" style={{ transformOrigin: "500px 500px" }}>
          <ellipse
            cx="500"
            cy="500"
            rx="452"
            ry="176"
            fill="none"
            stroke="#e11d2e"
            strokeOpacity="0.4"
            strokeWidth="1"
            transform="rotate(-22 500 500)"
          />
          <ellipse
            cx="500"
            cy="500"
            rx="452"
            ry="176"
            fill="none"
            stroke="#31a8ff"
            strokeOpacity="0.22"
            strokeWidth="0.8"
            transform="rotate(38 500 500)"
          />
        </g>

        {/* the artefact itself */}
        <circle cx="500" cy="500" r="300" fill="url(#pc-sphere)" />
        <circle cx="500" cy="500" r="300" fill="none" stroke="#05060a" strokeOpacity="0.55" />

        {/* fractured crust — angular plates breaking off the sphere edge */}
        <g fill="url(#pc-metal)" opacity="0.5" filter="url(#pc-blur)">
          <path d="M500 200 L640 268 L600 372 L470 350 Z" />
          <path d="M800 500 L742 620 L640 592 L668 470 Z" />
          <path d="M500 800 L372 742 L408 640 L540 664 Z" />
          <path d="M200 500 L262 378 L366 410 L336 532 Z" />
        </g>

        {/* incandescent core */}
        <circle cx="500" cy="500" r="150" fill="url(#pc-core)" className="animate-flicker" />
        <circle cx="500" cy="500" r="150" fill="none" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" />

        {/* fracture cracks radiating from the core */}
        <g stroke="#ffffff" strokeOpacity="0.34" fill="none" strokeWidth="1.1">
          <path d="M500 350 L520 452 L470 500 L516 566 L492 650" />
          <path d="M500 350 L452 420 L500 470" />
          <path d="M650 500 L556 512 L520 556" />
          <path d="M350 500 L444 488 L470 452" />
          <path d="M500 650 L544 604 L600 596" />
        </g>

        {/* shard debris on wider orbit */}
        {Array.from({ length: 26 }, (_, i) => {
          const ang = (i / 26) * Math.PI * 2;
          const rad = 340 + ((i * 37) % 150);
          const x = 500 + Math.cos(ang) * rad;
          const y = 500 + Math.sin(ang) * rad * 0.66;
          const sz = 4 + ((i * 13) % 16);
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={sz}
              height={sz * 0.35}
              fill={i % 5 === 0 ? "#e11d2e" : "#d7dee9"}
              opacity={0.12 + ((i * 7) % 30) / 100}
              transform={`rotate(${(i * 47) % 360} ${x} ${y})`}
            />
          );
        })}
      </svg>

      {/* horizon light bar under the artefact */}
      <div className="absolute left-1/2 top-[74%] h-px w-[76vw] max-w-[1100px] -translate-x-1/2 bg-gradient-to-r from-transparent via-crimson/70 to-transparent" />
      <div className="absolute left-1/2 top-[74%] h-[18px] w-[42vw] -translate-x-1/2 bg-crimson/25 blur-2xl" />
    </div>
  );
}
