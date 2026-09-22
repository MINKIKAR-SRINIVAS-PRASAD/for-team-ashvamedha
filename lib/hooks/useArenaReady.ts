"use client";

import { useEffect, useState } from "react";

/**
 * Signals that the arena intro (loading screen) is finished.
 *
 * Hero and other first-paint sections gate their entrance on this so the
 * cinematic reveal is actually *seen* — otherwise they would animate behind the
 * loader and be over before it lifts.
 *
 * Returns true immediately when the intro has already played this session (or
 * when the loader was skipped for reduced-motion users).
 */
export function useArenaReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("ashvamedha:intro") === "1") {
      setReady(true);
      return;
    }

    const onReady = () => setReady(true);
    window.addEventListener("ashvamedha:ready", onReady);

    // Backstop: never leave the hero hidden if the ready event is missed.
    const timer = window.setTimeout(() => setReady(true), 5200);

    return () => {
      window.removeEventListener("ashvamedha:ready", onReady);
      window.clearTimeout(timer);
    };
  }, []);

  return ready;
}
