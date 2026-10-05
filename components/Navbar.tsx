"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
} from "framer-motion";
import { FileText, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV_LINKS, SITE } from "@/data/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const { scrollYProgress } = useScroll();

  const energy = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 28,
    mass: 0.4,
  });

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ================================================================
          HEADER
         ================================================================ */}

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[110] w-full overflow-x-clip transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-graphite/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        {/* Scroll energy line */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-crimson-deep via-crimson to-ember"
          style={{ scaleX: energy }}
        />

        <nav className="shell mx-auto flex h-[var(--nav-h)] w-full min-w-0 max-w-full items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4 lg:gap-5 lg:px-0">
          {/* ============================================================
              BRAND
             ============================================================ */}

          <Link
            href="/"
            className="group flex min-w-0 shrink items-center gap-2 sm:gap-3"
            data-cursor-label="HOME"
            aria-label={`${SITE.name} ${SITE.year} home`}
          >
            {/* Official ASHVAMEDHA logo */}
            <span className="relative flex h-8 w-8 shrink-0 items-center justify-center sm:h-10 sm:w-10">
              <img
                src="/images2026/ash-logo.png"
                alt="ASHVAMEDHA"
                className="h-full w-full object-contain"
              />
            </span>

            {/* Brand text */}
            <span className="min-w-0 leading-none">
              <span className="block truncate font-display text-[11px] tracking-[0.14em] text-white sm:text-[15px] sm:tracking-[0.16em]">
                ASHVAMEDHA
              </span>

              <span className="block truncate font-mono text-[7px] tracking-[0.16em] text-crimson/85 sm:text-[9px] sm:tracking-hud">
                {SITE.year} · IIT BBS
              </span>
            </span>
          </Link>

          {/* ============================================================
              DESKTOP NAVIGATION
             ============================================================ */}

          <ul className="hidden min-w-0 items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-cursor-label={link.label.toUpperCase()}
                    className={cn(
                      "relative block whitespace-nowrap px-3 py-2 font-mono text-[10px] uppercase tracking-hud transition-colors duration-300 xl:px-3.5 xl:text-[11px]",
                      active
                        ? "text-white"
                        : "text-silver-dim hover:text-white",
                    )}
                  >
                    {link.label}

                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-2 -bottom-px h-px bg-crimson"
                        style={{
                          boxShadow:
                            "0 0 12px rgba(184, 75, 63, 0.82)",
                        }}
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}

            {/* ==========================================================
                RULEBOOK
               ========================================================== */}

            <li>
              <a
                href="/images2026/documents/ashvamedha-2026-rulebook.pdf"
                download="ASHVAMEDHA-2026-Rulebook.pdf"
                data-cursor-label="RULEBOOK"
                className="relative flex items-center gap-1.5 whitespace-nowrap px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-silver-dim transition-colors duration-300 hover:text-white xl:px-3"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span>Rulebook</span>
              </a>
            </li>

            {/* ==========================================================
                BROCHURE
               ========================================================== */}

            <li>
              <a
                href="/images2026/documents/ashvamedha-2026-brochure.pdf"
                download="ASHVAMEDHA-2026-Brochure.pdf"
                data-cursor-label="BROCHURE"
                className="relative flex items-center gap-1.5 whitespace-nowrap px-2.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-silver-dim transition-colors duration-300 hover:text-white xl:px-3"
              >
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span>Brochure</span>
              </a>
            </li>
          </ul>

          {/* ============================================================
              RIGHT ACTIONS
             ============================================================ */}

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Login (users + sport admins) */}
            <Link
              href="/login"
              data-cursor-label="LOGIN"
              className={cn(
                "whitespace-nowrap px-2 py-2 font-mono text-[10px] uppercase tracking-hud transition-colors duration-300 xl:text-[11px]",
                pathname === "/login" || pathname.startsWith("/admin")
                  ? "text-white"
                  : "text-silver-dim hover:text-white",
              )}
            >
              Login
            </Link>

            {/* Desktop Register */}
            <a
              href={SITE.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="ENTER"
              className="btn btn-primary clip-notch hidden !px-5 !py-2.5 md:inline-flex"
            >
              Register
            </a>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/15 bg-black/20 text-white transition-colors hover:border-crimson/70 hover:text-crimson active:scale-95 sm:h-11 sm:w-11 lg:hidden"
            >
              {open ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ================================================================
          FULL-SCREEN MOBILE MENU
         ================================================================ */}

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] overflow-hidden lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* MOBILE MENU BACKGROUND */}

            <div
              className="absolute inset-0"
              style={{
                backgroundColor: "rgba(184, 75, 63, 0.82)",
              }}
            />

            {/* ==========================================================
                MENU CONTENT
               ========================================================== */}

            <motion.ul
              className="relative flex h-full w-full flex-col justify-center gap-1 overflow-y-auto px-5 pb-8 pt-20 sm:px-8"
              initial="hidden"
              animate="show"
              variants={{
                show: {
                  transition: {
                    staggerChildren: 0.055,
                  },
                },
              }}
            >
              {/* ========================================================
                  NORMAL NAV LINKS
                 ======================================================== */}

              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: {
                      opacity: 0,
                      x: -26,
                    },
                    show: {
                      opacity: 1,
                      x: 0,
                      transition: {
                        duration: 0.4,
                      },
                    },
                  }}
                >
                  <Link
                    href={link.href}
                    className="flex min-w-0 items-baseline gap-3 border-b border-white/20 py-4 sm:gap-4"
                  >
                    <span className="shrink-0 font-mono text-[10px] tracking-hud text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="truncate font-display text-2xl uppercase tracking-tight text-white sm:text-3xl">
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              ))}

              {/* ========================================================
                  RULEBOOK
                 ======================================================== */}

              <motion.li
                variants={{
                  hidden: {
                    opacity: 0,
                    x: -26,
                  },
                  show: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      duration: 0.4,
                    },
                  },
                }}
              >
                <a
                  href="/documents/ashvamedha-2026-rulebook.pdf"
                  download="ASHVAMEDHA-2026-Rulebook.pdf"
                  className="flex min-w-0 items-baseline gap-3 border-b border-white/20 py-4 sm:gap-4"
                >
                  <span className="shrink-0 font-mono text-[10px] tracking-hud text-white/70">
                    08
                  </span>

                  <span className="flex items-center gap-3 font-display text-2xl uppercase tracking-tight text-white sm:text-3xl">
                    <FileText className="h-6 w-6 shrink-0" />
                    Rulebook
                  </span>
                </a>
              </motion.li>

              {/* ========================================================
                  BROCHURE
                 ======================================================== */}

              <motion.li
                variants={{
                  hidden: {
                    opacity: 0,
                    x: -26,
                  },
                  show: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      duration: 0.4,
                    },
                  },
                }}
              >
                <a
                  href="/documents/ashvamedha-2026-brochure.pdf"
                  download="ASHVAMEDHA-2026-Brochure.pdf"
                  className="flex min-w-0 items-baseline gap-3 border-b border-white/20 py-4 sm:gap-4"
                >
                  <span className="shrink-0 font-mono text-[10px] tracking-hud text-white/70">
                    09
                  </span>

                  <span className="flex items-center gap-3 font-display text-2xl uppercase tracking-tight text-white sm:text-3xl">
                    <FileText className="h-6 w-6 shrink-0" />
                    Brochure
                  </span>
                </a>
              </motion.li>

              {/* ========================================================
                  REGISTER
                 ======================================================== */}

              <motion.li
                className="mt-6 w-full sm:mt-8"
                variants={{
                  hidden: {
                    opacity: 0,
                    y: 18,
                  },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: {
                      duration: 0.4,
                    },
                  },
                }}
              >
                <a
                  href={SITE.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary clip-notch flex w-full justify-center border border-white/20 bg-black/25"
                >
                  Register Now
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}