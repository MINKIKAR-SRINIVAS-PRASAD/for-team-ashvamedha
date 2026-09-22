import type { Config } from "tailwindcss";

/**
 * Single source of truth for the ASHVAMEDHA visual identity.
 *
 * Colours are declared as `rgb(var(--x-rgb) / <alpha-value>)` so Tailwind's
 * opacity modifiers (bg-crimson/70, via-volt/60 …) work correctly, while
 * app/globals.css still exposes the same palette as hex vars for SVG art and
 * inline styles. Re-skin the whole site from one place.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "rgb(var(--void-rgb) / <alpha-value>)",
        graphite: "rgb(var(--graphite-rgb) / <alpha-value>)",
        carbon: "rgb(var(--carbon-rgb) / <alpha-value>)",
        steel: "rgb(var(--steel-rgb) / <alpha-value>)",
        line: "var(--line)",
        crimson: {
          DEFAULT: "rgb(var(--crimson-rgb) / <alpha-value>)",
          deep: "rgb(var(--crimson-deep-rgb) / <alpha-value>)",
          ember: "rgb(var(--ember-rgb) / <alpha-value>)",
        },
        silver: {
          DEFAULT: "rgb(var(--silver-rgb) / <alpha-value>)",
          dim: "rgb(var(--silver-dim-rgb) / <alpha-value>)",
        },
        volt: {
          DEFAULT: "rgb(var(--volt-rgb) / <alpha-value>)",
          deep: "rgb(var(--volt-deep-rgb) / <alpha-value>)",
        },
        violet: "rgb(var(--violet-rgb) / <alpha-value>)",
        gold: "rgb(var(--gold-rgb) / <alpha-value>)",
        bronze: "rgb(var(--bronze-rgb) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
      letterSpacing: {
        hud: "0.28em",
        titan: "-0.03em",
      },
      backgroundImage: {
        "portal-cone":
          "conic-gradient(from 180deg at 50% 50%, rgba(225,29,46,0.55), rgba(49,168,255,0.25), rgba(124,92,255,0.35), rgba(225,29,46,0.55))",
        "metal-sheen":
          "linear-gradient(180deg, #F4F7FB 0%, #C9CFDA 34%, #7B8393 52%, #E7ECF5 68%, #9AA3B4 100%)",
        "red-burst":
          "radial-gradient(circle at 50% 50%, rgba(225,29,46,0.55) 0%, rgba(124,11,22,0.28) 38%, transparent 72%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(225,29,46,0.45), 0 0 34px -6px rgba(225,29,46,0.7)",
        "glow-volt":
          "0 0 0 1px rgba(49,168,255,0.45), 0 0 34px -6px rgba(49,168,255,0.65)",
        bevel:
          "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.6)",
        panel: "0 30px 90px -40px rgba(0,0,0,0.95)",
      },
      keyframes: {
        "grain-shift": {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "20%": { transform: "translate3d(-2%,1%,0)" },
          "40%": { transform: "translate3d(1%,-2%,0)" },
          "60%": { transform: "translate3d(-1%,2%,0)" },
          "80%": { transform: "translate3d(2%,-1%,0)" },
        },
        drift: {
          "0%": { transform: "translate3d(0,0,0) scale(1)" },
          "50%": { transform: "translate3d(0,-18px,0) scale(1.04)" },
          "100%": { transform: "translate3d(0,0,0) scale(1)" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "spin-reverse": {
          from: { transform: "rotate(360deg)" },
          to: { transform: "rotate(0deg)" },
        },
        sweep: {
          "0%": { transform: "translateX(-130%)" },
          "100%": { transform: "translateX(330%)" },
        },
        flicker: {
          "0%,100%": { opacity: "1" },
          "42%": { opacity: "0.72" },
          "45%": { opacity: "1" },
          "62%": { opacity: "0.85" },
        },
        "scan-fall": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "0.7" },
          "100%": { transform: "translateY(100vh)", opacity: "0" },
        },
        "live-pulse": {
          "0%,100%": { opacity: "1", boxShadow: "0 0 0 0 rgba(225,29,46,0.7)" },
          "50%": { opacity: "0.85", boxShadow: "0 0 0 7px rgba(225,29,46,0)" },
        },
      },
      animation: {
        grain: "grain-shift 6s steps(6) infinite",
        drift: "drift 12s ease-in-out infinite",
        "spin-slow": "spin-slow 42s linear infinite",
        "spin-reverse": "spin-reverse 62s linear infinite",
        sweep: "sweep 3.6s cubic-bezier(0.45,0,0.2,1) infinite",
        flicker: "flicker 5.5s linear infinite",
        "scan-fall": "scan-fall 7s linear infinite",
        "live-pulse": "live-pulse 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
