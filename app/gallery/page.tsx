import type { Metadata } from "next";
import { Gallery } from "@/components/Gallery";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CTASection } from "@/components/sections/HomeSections";
import { GALLERY_CATEGORIES } from "@/data/gallery";
import { getFestData } from "@/lib/festData";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Matchday, athletes, crowd, champions and behind the scenes at ASHVAMEDHA — the arena archive from IIT Bhubaneswar.",
};

export default async function GalleryPage() {
  const { gallery: GALLERY } = await getFestData();
  return (
    <>
      <section className="relative overflow-hidden pt-[calc(var(--nav-h)+3rem)] pb-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(124,92,255,0.2),transparent_64%)]" />
        <div className="shell relative">
          <span className="hud text-violet/90">{"// ARENA_ARCHIVE"}</span>
          <h1 className="mt-4 text-[clamp(2.6rem,9vw,6.5rem)] leading-[0.88] text-white">
            FROM THE
            <br />
            <span className="text-metal">ARENA FLOOR</span>
          </h1>
          <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-silver-dim">
            {GALLERY.length} frames from across the arena — floodlit finals, track takeoffs, capacity
            crowds and the production crew working behind the scenes.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {GALLERY_CATEGORIES.slice(1).map((c) => (
              <span key={c} className="tag">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad pt-4" aria-label="Gallery">
        <div className="shell">
          <SectionHeader
            protocol="// FRAME_INDEX"
            title="THE ARCHIVE"
            description="Filter by category; open any frame fullscreen with the keyboard arrows."
          />
          <div className="mt-10">
            <Gallery />
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
