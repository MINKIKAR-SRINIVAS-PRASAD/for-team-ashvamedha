/**
 * BACKGROUND SYSTEM — one reusable atmosphere stack for the whole site.
 *
 * Layers (back to front): gradient base -> dimensional grid -> particle field ->
 * energy streaks -> scanlines -> film grain -> vignette.
 *
 * Rendered on the server with zero JS: every movement is a CSS keyframe, and the
 * particle positions are derived deterministically from the index so server and
 * client markup always match.
 */
export function BackgroundEffects() {
  const particles = Array.from({ length: 48 }, (_, i) => {
    const x = ((i * 37) % 100) + ((i % 5) * 0.7);
    const y = ((i * 61) % 100) + ((i % 3) * 0.9);
    const size = 1 + ((i * 13) % 3);
    const dur = 14 + ((i * 7) % 26);
    const delay = -((i * 3) % 24);
    const crimson = i % 7 === 0;
    return { x, y, size, dur, delay, crimson, key: i };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* base gradient wash */}
      <div className="absolute inset-0 bg-void" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_18%_8%,rgba(124,11,22,0.28),transparent_62%),radial-gradient(ellipse_55%_40%_at_88%_22%,rgba(11,78,138,0.22),transparent_60%),radial-gradient(ellipse_70%_50%_at_50%_104%,rgba(124,92,255,0.14),transparent_64%)]" />

      {/* dimensional grid */}
      <div className="absolute inset-0 layer-grid opacity-70" />

      {/* particle field */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <span
            key={p.key}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.crimson ? "#e11d2e" : "#d7dee9",
              opacity: p.crimson ? 0.5 : 0.26,
              boxShadow: p.crimson
                ? "0 0 8px rgba(225,29,46,0.9)"
                : "0 0 6px rgba(215,222,233,0.5)",
              animation: `drift ${p.dur}s ease-in-out ${p.delay}s infinite`,
              willChange: "transform",
            }}
          />
        ))}
      </div>

      {/* energy streaks */}
      <div className="absolute left-0 top-[18%] h-px w-full overflow-hidden opacity-60">
        <div className="h-px w-1/3 bg-gradient-to-r from-transparent via-crimson/70 to-transparent animate-sweep" />
      </div>
      <div
        className="absolute left-0 top-[68%] h-px w-full overflow-hidden opacity-40"
        style={{ animationDelay: "1.6s" }}
      >
        <div
          className="h-px w-1/4 bg-gradient-to-r from-transparent via-volt/60 to-transparent animate-sweep"
          style={{ animationDuration: "5.2s" }}
        />
      </div>

      {/* falling scan bar */}
      <div className="absolute inset-x-0 top-0 h-24 animate-scan-fall bg-gradient-to-b from-transparent via-crimson/[0.07] to-transparent" />

      {/* film grain + scanlines + vignette */}
      <div className="absolute inset-0 layer-scanlines opacity-40" />
      <div className="absolute inset-0 layer-grain animate-grain opacity-[0.55]" />
      <div className="absolute inset-0 layer-vignette" />
    </div>
  );
}

/** Thin HUD strip used inside sections that need a status bar. */
export function HudStrip({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              i === 0 ? "bg-crimson animate-flicker" : "bg-silver-dim/60"
            }`}
          />
          <span className="hud">{item}</span>
        </span>
      ))}
    </div>
  );
}
