"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const STAGES = [
  { at: 0, label: "INITIALIZING ARENA" },
  { at: 24, label: "CALIBRATING ARENA SENSORS" },
  { at: 48, label: "SYNCING BATTLE PROTOCOLS" },
  { at: 72, label: "LOADING CHAMPIONS" },
  { at: 92, label: "ARENA ONLINE" },
];

type Phase = "loading" | "exiting" | "gone";

/**
 * LOADING SCREEN — plays once per browser session.
 *
 * Progress tracks real page readiness (document + fonts settled) rather than a
 * fake fixed timer, and force-completes after 4.2s so a slow connection can
 * never trap a visitor. Reduced-motion users skip it entirely.
 *
 * On completion it dispatches `ashvamedha:ready`, which the hero listens for.
 */
export function LoadingScreen() {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<Phase>("loading");
  const [mounted, setMounted] = useState(false);

  const finish = () => {
    sessionStorage.setItem("ashvamedha:intro", "1");
    setPhase("exiting");
    window.dispatchEvent(new Event("ashvamedha:ready"));
    window.setTimeout(() => setPhase("gone"), 760);
  };

  useEffect(() => {
    setMounted(true);

    if (sessionStorage.getItem("ashvamedha:intro") === "1") {
      setPhase("gone");
      return;
    }
    if (reduce) {
      finish();
      return;
    }

    let value = 0;
    let settled = document.readyState === "complete";
    let raf = 0;

    const onLoad = () => {
      settled = true;
    };
    if (!settled) window.addEventListener("load", onLoad, { once: true });

    const started = performance.now();
    let finishedAt = 0;

    const step = (now: number) => {
      const ceiling = settled ? 100 : 88;
      value = Math.min(ceiling, value + (now - started < 900 ? 1.9 : 0.95));
      setProgress(Math.min(100, Math.floor(value)));

      const timedOut = now - started > 4200;
      if (value >= 99.5 || timedOut) {
        setProgress(100);
        if (!finishedAt) {
          finishedAt = now;
          window.setTimeout(finish, 420);
        }
        return;
      }
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("load", onLoad);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  if (!mounted || phase === "gone") return null;

  const stage = STAGES.reduce((acc, s) => (progress >= s.at ? s.label : acc), STAGES[0].label);
  const exiting = phase === "exiting";

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-void"
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1, filter: exiting ? "blur(16px)" : "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
      style={{ pointerEvents: exiting ? "none" : "auto" }}
      role="status"
      aria-live="polite"
      aria-label="Initialising arena"
    >
      <div className="absolute inset-0 layer-grain opacity-40" />
      <div className="absolute inset-0 layer-vignette" />
      <div className="absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-burst opacity-60 blur-2xl" />

      {/* exit energy line */}
      <motion.div
        className="absolute left-0 top-1/2 h-px w-full origin-left bg-gradient-to-r from-transparent via-crimson to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={exiting ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      <div className="relative w-[min(92vw,520px)] px-6">
        <div className="flex items-end justify-between">
          <span className="hud text-crimson/90">{"// ASHVAMEDHA_2026"}</span>
          <span className="font-mono text-4xl font-semibold tabular-nums text-white/95 sm:text-5xl">
            {progress}%
          </span>
        </div>

        <div className="relative mt-5 h-[3px] w-full overflow-hidden bg-white/10">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-crimson-deep via-crimson to-ember"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/70 to-transparent"
            style={{ left: `calc(${progress}% - 4rem)` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="hud">{stage}</span>
          <span className="hud hidden sm:inline">IIT BHUBANESWAR</span>
        </div>
      </div>

      <p className="absolute bottom-8 hud text-center px-6">
        Do not power down — arena initialising
      </p>
    </motion.div>
  );
}
