import type { Metadata } from "next";
import { RegistrationForm } from "@/components/RegistrationForm";
import { REGISTRATION_OPEN } from "@/data/site";

export const metadata: Metadata = {
  title: "Registration",
  description: "ASHVAMEDHA 2026 registration status and event information.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const { event } = await searchParams;

  return (
    <section className="relative overflow-hidden pt-[calc(var(--nav-h)+3rem)] pb-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(ellipse_at_top,rgba(225,29,46,0.24),transparent_64%)]" />
      <div className="shell relative">
        <span className="hud text-crimson/90">{"// ENTRY_PROTOCOL"}</span>
        <h1 className="mt-4 text-[clamp(2.6rem,9vw,6.5rem)] leading-[0.88] text-white">
          {REGISTRATION_OPEN ? (
            <>ENTER THE<br /><span className="text-metal">ARENA</span></>
          ) : (
            <>REGISTRATION<br /><span className="text-metal">CLOSED</span></>
          )}
        </h1>
        <p className="mt-6 max-w-2xl text-[1rem] leading-relaxed text-silver-dim">
          {REGISTRATION_OPEN
            ? "Pick your battlefield and complete the registration process."
            : "Registration for ASHVAMEDHA 2026 is now closed. You can still explore events, schedules, results and the gallery."}
        </p>

        <div className="mt-12 max-w-3xl">
          <RegistrationForm initialEvent={event} />
        </div>
      </div>
    </section>
  );
}
