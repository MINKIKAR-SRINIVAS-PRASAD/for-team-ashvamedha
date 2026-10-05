import type { Metadata } from "next";
import { LoginPanel } from "@/components/LoginPanel";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to ASHVAMEDHA 2026 as a user or a sport admin.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <section className="relative overflow-hidden pt-[calc(var(--nav-h)+3rem)] pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(225,29,46,0.24),transparent_64%)]" />
      <div className="shell relative">
        <span className="hud text-crimson/90">{"// ACCESS_PROTOCOL"}</span>
        <h1 className="mt-4 text-[clamp(2.6rem,9vw,6.5rem)] leading-[0.88] text-white">
          IDENTIFY
          <br />
          <span className="text-metal">YOURSELF</span>
        </h1>

        <div className="mt-12 max-w-xl">
          <LoginPanel />
        </div>
      </div>
    </section>
  );
}
