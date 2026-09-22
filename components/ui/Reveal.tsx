"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE, VIEWPORT } from "@/lib/motion";

/**
 * Reveal — the single scroll-entrance primitive used across the whole site.
 * Keeping one wrapper (instead of animating every element independently) is what
 * makes the scroll feel like one continuous camera move.
 */
export function Reveal({
  children,
  delay = 0,
  y = 34,
  x = 0,
  blur = true,
  duration = 0.9,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  blur?: boolean;
  duration?: number;
  className?: string;
  once?: boolean;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, x, filter: blur ? "blur(10px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={{ ...VIEWPORT, once }}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Word-by-word titan headline that unrolls in 3D. */
export function TitanWords({
  text,
  className = "",
  delay = 0,
  stagger = 0.08,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) return <span className={className}>{text}</span>;

  return (
    <span className={className} style={{ perspective: 900 }}>
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "72%", opacity: 0, rotateX: -46 }}
            whileInView={{ y: "0%", opacity: 1, rotateX: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.05, ease: EASE, delay: delay + i * stagger }}
            style={{ transformOrigin: "50% 100%" }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
