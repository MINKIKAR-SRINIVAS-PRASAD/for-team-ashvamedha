"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CURSOR EFFECTS — desktop only.
 *
 * Two layers: an instant dot and a lagging ring that lerps toward the pointer.
 * Position is written straight to the DOM inside a single rAF loop, so moving
 * the mouse never triggers a React re-render.
 *
 * Any element can opt in with `data-cursor="view"` (label is uppercased) or
 * `data-cursor-label="ENTER THE BATTLE"`.
 */
export function CursorEffects() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (reduce || !fine) return;

    setEnabled(true);
    document.body.dataset.customCursor = "on";

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { ...target };
    let raf = 0;
    let hovering = false;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.("[data-cursor]") as HTMLElement | null;
      const interactive =
        el ??
        ((e.target as HTMLElement)?.closest?.(
          "a,button,[role='button'],input,select,textarea",
        ) as HTMLElement | null);

      if (!interactive) return;
      hovering = true;
      const label =
        interactive.dataset.cursorLabel ??
        (interactive.dataset.cursor && interactive.dataset.cursor !== "hover"
          ? interactive.dataset.cursor.toUpperCase()
          : "");
      if (labelRef.current) labelRef.current.textContent = label;
    };

    const onOut = (e: MouseEvent) => {
      const from = (e.target as HTMLElement)?.closest?.("[data-cursor],a,button");
      if (!from) return;
      hovering = false;
      if (labelRef.current) labelRef.current.textContent = "";
    };

    const loop = () => {
      ring.x += (target.x - ring.x) * 0.16;
      ring.y += (target.y - ring.y) * 0.16;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        const scale = hovering ? 2.5 : 1;
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%) scale(${scale})`;
        ringRef.current.style.opacity = hovering ? "1" : "0.75";
      }
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("mouseout", onOut, true);
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("mouseout", onOut, true);
      cancelAnimationFrame(raf);
      delete document.body.dataset.customCursor;
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[95]" aria-hidden>
      <div
        ref={ringRef}
        className="absolute left-0 top-0 h-8 w-8 rounded-full border border-crimson/80 transition-[width,height] duration-300"
        style={{
          boxShadow: "0 0 22px rgba(225,29,46,0.55), inset 0 0 12px rgba(225,29,46,0.25)",
        }}
      >
        <span
          ref={labelRef}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[3.2px] tracking-hud text-white/90"
        />
      </div>
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-1.5 w-1.5 rounded-full bg-white"
        style={{ boxShadow: "0 0 10px rgba(255,255,255,0.9)" }}
      />
    </div>
  );
}
