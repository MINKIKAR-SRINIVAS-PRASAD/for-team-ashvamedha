"use client";

import { motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/**
 * PAGE TRANSITIONS — cinematic route change.
 *
 * Implemented as a client wrapper keyed on the pathname (rather than an
 * AnimatePresence exit, which App Router navigation does not reliably trigger).
 * Each navigation plays: black curtain -> thin red energy line -> content
 * reveal, in under ~700ms total.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  if (reduce) return <>{children}</>;

  return <TransitionFrame key={pathname}>{children}</TransitionFrame>;
}

function TransitionFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Land at the top of every new route so the reveal starts from the hero.
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return (
    <>
      {/* curtain + energy line, plays once per route */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-[90] bg-void"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.42, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[91] h-px w-full origin-left bg-gradient-to-r from-transparent via-crimson to-transparent"
        initial={{ scaleX: 0, opacity: 0.9, y: 0 }}
        animate={{ scaleX: 1, opacity: 0, y: "100vh" }}
        transition={{ duration: 0.62, ease: [0.65, 0, 0.35, 1] }}
        style={{ boxShadow: "0 0 18px rgba(225,29,46,0.9)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 0.84, 0.24, 1], delay: 0.1 }}
      >
        {children}
      </motion.div>
    </>
  );
}
