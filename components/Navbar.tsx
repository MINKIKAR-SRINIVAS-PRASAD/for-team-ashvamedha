"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NAV_LINKS, SITE } from "@/data/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const { scrollYProgress } = useScroll();
  const energy = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the full-screen mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[80] transition-all duration-500",
          scrolled
            ? "border-b border-white/10 bg-graphite/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        {/* scroll energy line */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[2px] origin-left bg-gradient-to-r from-crimson-deep via-crimson to-ember"
          style={{ scaleX: energy }}
        />

        <nav className="shell flex h-[var(--nav-h)] items-center justify-between gap-6">
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3"
            data-cursor-label="HOME"
            aria-label={`${SITE.name} ${SITE.year} home`}
          >
            <span className="relative flex h-8 w-8 items-center justify-center">
              <span className="logo-ash"><img src="/components/images2026/ash-logo.jpeg" alt="Ashvamedha" />
              </span>
              {/* <span className="absolute inset-0 rotate-45 border border-crimson/70 transition-transform duration-500 group-hover:rotate-[135deg]" />
              <span className="absolute inset-[6px] rotate-45 bg-crimson/90" /> */}
            </span>
            <span className="leading-none">
              <span className="block font-display text-[15px] tracking-[0.16em] text-white">
                ASHVAMEDHA
              </span>
              <span className="block font-mono text-[9px] tracking-hud text-crimson/85">
                {SITE.year} · IIT BBS
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    data-cursor-label={link.label.toUpperCase()}
                    className={cn(
                      "relative block px-3.5 py-2 font-mono text-[11px] uppercase tracking-hud transition-colors duration-300",
                      active ? "text-white" : "text-silver-dim hover:text-white",
                    )}
                  >
                    {link.label}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-2 -bottom-px h-px bg-crimson"
                        style={{ boxShadow: "0 0 12px rgba(225,29,46,0.9)" }}
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-3">
            <a
              href={SITE.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="ENTER"
              className="btn btn-primary clip-notch hidden !px-5 !py-2.5 md:inline-flex"
            >
              Register
            </a>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="flex h-10 w-10 items-center justify-center border border-white/15 text-white transition-colors hover:border-crimson/70 hover:text-crimson lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Full-screen mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[79] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-void/97" />
            <div className="absolute inset-0 layer-grid opacity-40" />
            <div className="absolute inset-x-0 top-0 h-[45vh] bg-[radial-gradient(ellipse_at_top,rgba(225,29,46,0.3),transparent_70%)]" />

            <motion.ul
              className="relative flex h-full flex-col justify-center gap-1 px-8 pt-20"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.055 } } }}
            >
              {NAV_LINKS.map((link, i) => (
                <motion.li
                  key={link.href}
                  variants={{
                    hidden: { opacity: 0, x: -26 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.4 } },
                  }}
                >
                  <Link
                    href={link.href}
                    className="flex items-baseline gap-4 border-b border-white/5 py-4"
                  >
                    <span className="font-mono text-[10px] tracking-hud text-crimson/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-3xl uppercase tracking-tight text-white">
                      {link.label}
                    </span>
                  </Link>
                </motion.li>
              ))}

              <motion.li
                className="mt-8"
                variants={{
                  hidden: { opacity: 0, y: 18 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
              >
                <a
                  href={SITE.registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary clip-notch w-full"
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
