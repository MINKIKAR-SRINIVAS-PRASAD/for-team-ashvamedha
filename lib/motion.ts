import type { Transition, Variants } from "framer-motion";

/** Cubic-bezier tuple — framer-motion accepts this shape for `ease` directly. */
type Curve = [number, number, number, number];

/**
 * Shared motion language. Every section reuses these curves so the site reads as
 * one continuous cinematic camera move instead of a pile of unrelated effects.
 *
 * NOTE: easing tuples are typed as mutable 4-tuples — framer-motion's Easing
 * type rejects `readonly` arrays produced by `as const`.
 */
export const EASE: Curve = [0.16, 0.84, 0.24, 1];
export const EASE_INK: Curve = [0.65, 0, 0.35, 1];

export const cinemaTransition: Transition = { duration: 0.9, ease: EASE };

/** Heavy panel rise used for section shells. */
export const shellRise: Variants = {
  hidden: { opacity: 0, y: 46 },
  show: { opacity: 1, y: 0, transition: { duration: 0.95, ease: EASE } },
};

/** Cinematic horizontal reveal for event rows (alternating direction). */
export function lateralReveal(fromLeft: boolean): Variants {
  return {
    hidden: { opacity: 0, x: fromLeft ? -90 : 90, filter: "blur(12px)" },
    show: {
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 1.05, ease: EASE },
    },
  };
}

/** Clip-path wipe for imagery. */
export const clipWipe: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)", opacity: 0.35 },
  show: {
    clipPath: "inset(0 0% 0 0)",
    opacity: 1,
    transition: { duration: 1.15, ease: EASE_INK },
  },
};

export const stagger = (staggerChildren = 0.09, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/** Word-by-word titan headline reveal. */
export const wordReveal: Variants = {
  hidden: { opacity: 0, y: "65%", rotateX: -42 },
  show: {
    opacity: 1,
    y: "0%",
    rotateX: 0,
    transition: { duration: 1.1, ease: EASE },
  },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const VIEWPORT = { once: true, amount: 0.25 };
