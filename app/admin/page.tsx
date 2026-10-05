import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Control Room",
  description: "Update live scores and match details for your sport.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <section className="relative overflow-hidden pt-[calc(var(--nav-h)+3rem)] pb-24">
      <div className="shell relative">
        <span className="hud text-crimson/90">{"// CONTROL_ROOM"}</span>
        <h1 className="mt-4 text-[clamp(2.2rem,7vw,4.5rem)] leading-[0.9] text-white">
          LIVE <span className="text-metal">SCORES</span>
        </h1>
        <div className="mt-10">
          <AdminDashboard />
        </div>
      </div>
    </section>
  );
}
