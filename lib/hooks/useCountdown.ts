"use client";

import { useEffect, useState } from "react";
import { msToClock } from "@/lib/utils";

export interface Clock {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** True once the target moment has passed. */
  elapsed: boolean;
}

const ZERO: Clock = { days: 0, hours: 0, minutes: 0, seconds: 0, elapsed: false };

/**
 * Countdown to an ISO timestamp.
 * Starts at zero and fills in on mount so server HTML and client HTML match
 * (no hydration mismatch from `Date.now()`).
 */
export function useCountdown(target: string): Clock {
  const [clock, setClock] = useState<Clock>(ZERO);

  useEffect(() => {
    const at = new Date(target).getTime();
    if (Number.isNaN(at)) return;

    const tick = () => {
      const delta = at - Date.now();
      setClock({ ...msToClock(delta), elapsed: delta <= 0 });
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return clock;
}
