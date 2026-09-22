import type { Accent } from "@/data/events";

/**
 * Accent → concrete hex values.
 * Keeps the crimson / volt / violet / gold language consistent across SVG art,
 * inline styles and Tailwind arbitrary values.
 */
export const ACCENT: Record<
  Accent,
  { base: string; deep: string; soft: string; label: string }
> = {
  crimson: { base: "#e11d2e", deep: "#7c0b16", soft: "rgba(225,29,46,0.35)", label: "CRIMSON" },
  volt: { base: "#31a8ff", deep: "#0b4e8a", soft: "rgba(49,168,255,0.35)", label: "ELECTRIC" },
  violet: { base: "#7c5cff", deep: "#2a1a5e", soft: "rgba(124,92,255,0.35)", label: "VIOLET" },
  gold: { base: "#e8c46a", deep: "#4a3611", soft: "rgba(232,196,106,0.35)", label: "GOLD" },
};

export function accentOf(a: Accent | string) {
  return ACCENT[(a as Accent) in ACCENT ? (a as Accent) : "crimson"];
}
