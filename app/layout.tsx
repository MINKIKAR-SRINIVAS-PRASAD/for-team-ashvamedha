import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { CursorEffects } from "@/components/CursorEffects";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PageTransition } from "@/components/PageTransition";
import { SITE } from "@/data/site";
import { FestDataProvider } from "@/components/FestDataProvider";
import { getFestData } from "@/lib/festData";

export const metadata: Metadata = {
  metadataBase: new URL("https://ashvamedha.iitbbs.ac.in"),
  title: {
    default: `ASHVAMEDHA ${SITE.year} — Sports Fest, IIT Bhubaneswar`,
    template: `%s · ASHVAMEDHA ${SITE.year}`,
  },
  description:
    "ASHVAMEDHA 2026 — the annual sports fest of IIT Bhubaneswar. Ten pluse sports, twenty pluse teams, three days of battle. Enter the arena.",
  keywords: [
    "ASHVAMEDHA",
    "ASHVAMEDHA 2026",
    "IIT Bhubaneswar sports fest",
    "sports fest India",
    "inter IIT sports",
    "Odisha sports festival",
  ],
  openGraph: {
    title: `ASHVAMEDHA ${SITE.year} — The Battle Begins`,
    description:
      "The annual sports fest of IIT Bhubaneswar. Ten pluse sports. Three days. One legacy.",
    type: "website",
    locale: "en_IN",
    siteName: `ASHVAMEDHA ${SITE.year}`,
  },
  twitter: {
    card: "summary_large_image",
    title: `ASHVAMEDHA ${SITE.year} — The Battle Begins`,
    description: "The annual sports fest of IIT Bhubaneswar.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const festData = await getFestData();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Typeface is loaded at runtime (with system fallbacks in globals.css)
            so the production build has no external font-fetch dependency. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        />
      </head>
      <body className="antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:bg-crimson focus:px-4 focus:py-2 focus:font-mono focus:text-xs focus:uppercase focus:tracking-hud focus:text-white"
        >
          Skip to content
        </a>

        <FestDataProvider initial={festData}>
          <LoadingScreen />
          <BackgroundEffects />
          <CursorEffects />
          <Navbar />

          <PageTransition>
            <main id="main">{children}</main>
            <Footer />
          </PageTransition>
        </FestDataProvider>
      </body>
    </html>
  );
}
