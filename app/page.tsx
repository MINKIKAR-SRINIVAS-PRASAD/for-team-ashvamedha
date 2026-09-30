import type { Metadata } from "next";
import { Hero } from "@/components/Hero";
import { Countdown } from "@/components/Countdown";
import { Introduction } from "@/components/Introduction";
import {
  SportsCarouselSection,
  EventsSection,
  LiveSection,
  RankingsSection,
  ChampionSection,
  ScheduleSection,
  GallerySection,
  TeamsSection,
  SponsorsSection,
  CTASection,
} from "@/components/sections/HomeSections";

export const metadata: Metadata = {
  title: "ASHVAMEDHA 2026 — The Battle Begins | IIT Bhubaneswar",
  description:
    "ASHVAMEDHA 2026, the annual sports fest of IIT Bhubaneswar. Twenty pluse sports, fifty pluse teams, three days of battle. Register, follow live scores and watch the championship table.",
};

/**
 * HOME — the full cinematic journey:
 * HERO -> COUNTDOWN -> ABOUT -> SPORTS -> EVENTS -> LIVE -> RANKINGS ->
 * CHAMPIONS -> SCHEDULE -> GALLERY -> TEAMS -> REGISTRATION -> SPONSORS -> FOOTER
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Countdown />
      <Introduction />
      <SportsCarouselSection />
      <EventsSection />
      <LiveSection />
      <RankingsSection />
      <ChampionSection />
      <ScheduleSection />
      <GallerySection />
      <TeamsSection />
      <CTASection />
      <SponsorsSection />
    </>
  );
}
