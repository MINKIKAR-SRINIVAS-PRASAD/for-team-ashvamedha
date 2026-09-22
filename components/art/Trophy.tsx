/**
 * TROPHY — original championship artefact (a faceted "Ashvamedha Shield" cup).
 * Pure SVG, gold gradient, used by the champion spotlight and /results.
 */
export function Trophy({ className = "h-64 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 300" className={className} aria-hidden>
      <defs>
        <linearGradient id="tr-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff3d0" />
          <stop offset="28%" stopColor="#e8c46a" />
          <stop offset="52%" stopColor="#8a6a1f" />
          <stop offset="74%" stopColor="#ffe7a8" />
          <stop offset="100%" stopColor="#7a5a14" />
        </linearGradient>
        <linearGradient id="tr-steel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#5b6373" />
          <stop offset="45%" stopColor="#e7ecf5" />
          <stop offset="100%" stopColor="#3a4150" />
        </linearGradient>
        <radialGradient id="tr-aura" cx="50%" cy="42%" r="60%">
          <stop offset="0%" stopColor="#e11d2e" stopOpacity="0.55" />
          <stop offset="60%" stopColor="#7c0b16" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#05060a" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="120" cy="120" r="130" fill="url(#tr-aura)" />

      {/* bowl */}
      <path
        d="M46 40 H194 C194 108 168 152 120 168 C72 152 46 108 46 40 Z"
        fill="url(#tr-gold)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.4"
      />
      {/* faceted inner bowl */}
      <path d="M62 50 H178 C176 104 154 140 120 154 C86 140 64 104 62 50 Z" fill="#05060a" fillOpacity="0.42" />
      <path d="M120 50 V154" stroke="rgba(255,242,205,0.45)" strokeWidth="1" />
      <path d="M74 52 L120 154 L166 52" fill="none" stroke="rgba(255,242,205,0.35)" strokeWidth="0.8" />

      {/* handles */}
      <path
        d="M46 52 C14 52 10 96 44 104"
        fill="none"
        stroke="url(#tr-gold)"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M194 52 C226 52 230 96 196 104"
        fill="none"
        stroke="url(#tr-gold)"
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* stem + base */}
      <path d="M112 168 h16 v34 h-16 z" fill="url(#tr-steel)" />
      <path d="M86 202 h68 l12 22 H74 z" fill="url(#tr-gold)" />
      <rect x="68" y="224" width="104" height="14" rx="2" fill="url(#tr-steel)" />
      <rect x="60" y="238" width="120" height="16" rx="3" fill="url(#tr-gold)" />

      {/* laurel tick ring */}
      {Array.from({ length: 22 }, (_, i) => {
        const ang = (i / 22) * Math.PI * 2;
        const x = 120 + Math.cos(ang) * 96;
        const y = 40 + Math.sin(ang) * 40;
        return (
          <line
            key={i}
            x1={x}
            y1={y}
            x2={120 + Math.cos(ang) * 88}
            y2={40 + Math.sin(ang) * 34}
            stroke="#e8c46a"
            strokeOpacity="0.3"
            strokeWidth="1.4"
          />
        );
      })}

      {/* engraved plate */}
      <text
        x="120"
        y="90"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="26"
        fill="#fff3d0"
        fillOpacity="0.9"
        letterSpacing="2"
      >
        CHAMPION
      </text>
      <text
        x="120"
        y="112"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="11"
        fill="#e8c46a"
        fillOpacity="0.8"
        letterSpacing="4"
      >
        2026
      </text>
    </svg>
  );
}
