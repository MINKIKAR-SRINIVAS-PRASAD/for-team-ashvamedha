"use client";

import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, ExternalLink, Plus, Trash2 } from "lucide-react";
import type { FestEvent } from "@/data/events";
import { useFestData } from "@/components/FestDataProvider";
import { getGoogleFormUrl } from "@/lib/googleForms";
import { cn } from "@/lib/utils";

type ApiEvent = FestEvent & { minTeamSize?: number; maxTeamSize?: number };
type Member = { name: string; rollNumber: string };

/** Participants allowed (captain included). Uses the API's limits, else parses "11 + 5 subs". */
function limitsOf(e: ApiEvent | undefined): [number, number] {
  if (!e) return [1, 1];
  if (e.minTeamSize && e.maxTeamSize) return [e.minTeamSize, e.maxTeamSize];
  const nums = (e.teamSize.match(/\d+/g) ?? []).map(Number);
  if (!nums.length) return [1, 1];
  if (e.teamSize.includes("+") && !/relay/i.test(e.teamSize) && nums.length >= 2) {
    return [nums[0], nums[0] + nums[1]];
  }
  return [Math.min(...nums), Math.max(...nums)];
}

const inputCls =
  "w-full border border-white/15 bg-white/[0.03] px-4 py-3 text-[0.95rem] text-white placeholder:text-silver-dim/60 transition-colors focus:border-crimson/70 focus:outline-none";
const labelCls = "hud mb-2 block";

export function RegistrationForm({ initialEvent }: { initialEvent?: string }) {
  const { events } = useFestData();
  const openEvents = useMemo(
    () => events.filter((e) => e.registration !== "closed") as ApiEvent[],
    [events],
  );

  const [eventSlug, setEventSlug] = useState(
    openEvents.some((e) => e.slug === initialEvent)
      ? (initialEvent as string)
      : openEvents[0]?.slug ?? "",
  );
  const event = openEvents.find((e) => e.slug === eventSlug);
  const [minP, maxP] = limitsOf(event);

  const [members, setMembers] = useState<Member[]>(() =>
    Array.from({ length: Math.max(0, minP - 1) }, () => ({
      name: "",
      rollNumber: "",
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openedForm, setOpenedForm] = useState<string | null>(null);

  const participants = 1 + members.length;
  const needsTeamName = minP > 1;
  const allowsTeam = maxP > 1;

  const changeEvent = (slug: string) => {
    setEventSlug(slug);
    setError(null);
    setOpenedForm(null);

    const [lo, hi] = limitsOf(openEvents.find((e) => e.slug === slug));
    setMembers((prev) => {
      const next = prev.slice(0, Math.max(0, hi - 1));
      while (next.length < lo - 1) next.push({ name: "", rollNumber: "" });
      return next;
    });
  };

  const updateMember = (i: number, field: keyof Member, value: string) =>
    setMembers((prev) =>
      prev.map((m, j) => (j === i ? { ...m, [field]: value } : m)),
    );

  function onSubmit(ev: FormEvent<HTMLFormElement>) {
    ev.preventDefault();
    if (!event) return;

    setError(null);

    const formUrl = getGoogleFormUrl(event.slug, event.name);
    if (!formUrl) {
      setError(
        `Google Form is not configured yet for ${event.name}. Please contact the organisers.`,
      );
      return;
    }

    // The website form is now a pre-registration step only.
    // No payment, UPI/UTR, or payment API call is required here.
    setSubmitting(true);

    // This runs directly from the user's submit click, so browsers are less
    // likely to block the new tab as a popup.
    const newWindow = window.open(formUrl, "_blank", "noopener,noreferrer");

    if (!newWindow) {
      setError(
        "Your browser blocked the Google Form popup. Please allow popups for this site and try again.",
      );
      setSubmitting(false);
      return;
    }

    setOpenedForm(event.name);
    setSubmitting(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!openEvents.length) {
    return (
      <div className="panel clip-notch p-8 text-center text-silver-dim">
        Registrations are closed for all events right now.
      </div>
    );
  }

  if (openedForm) {
    const currentEvent = openEvents.find((e) => e.name === openedForm);
    const formUrl = currentEvent
      ? getGoogleFormUrl(currentEvent.slug, currentEvent.name)
      : null;

    return (
      <div className="panel clip-notch p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto h-12 w-12 text-crimson" />
        <h2 className="mt-5 text-[clamp(1.8rem,5vw,3rem)] leading-none text-white">
          REGISTRATION CONTINUES
        </h2>
        <p className="mt-4 text-silver-dim">
          The {openedForm} Google Form has been opened in a new tab.
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-silver-dim">
          Complete the Google Form to finish your registration. There is no
          payment step on this website.
        </p>

        {formUrl && (
          <a
            href={formUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary clip-notch mt-8 inline-flex items-center gap-2 !px-6 !py-3"
          >
            OPEN GOOGLE FORM <ExternalLink className="h-4 w-4" />
          </a>
        )}

        <button
          type="button"
          onClick={() => {
            setOpenedForm(null);
            setMembers(
              Array.from({ length: Math.max(0, minP - 1) }, () => ({
                name: "",
                rollNumber: "",
              })),
            );
          }}
          className="btn btn-ghost clip-notch mt-4 block mx-auto !px-6 !py-3"
        >
          Register for another event
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="panel clip-notch space-y-8 p-6 sm:p-10"
      noValidate={false}
    >
      {/* honeypot — hidden from humans */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label className={labelCls} htmlFor="event">
          Event
        </label>
        <select
          id="event"
          value={eventSlug}
          onChange={(e) => changeEvent(e.target.value)}
          className={inputCls}
          required
        >
          {openEvents.map((e) => (
            <option key={e.slug} value={e.slug} className="bg-black">
              {e.name}
              {e.registration === "closing" ? " (closing soon)" : ""}
            </option>
          ))}
        </select>
        {event && (
          <p className="mt-2 font-mono text-[11px] tracking-hud text-silver-dim">
            {event.teamSize} ·{" "}
            {minP === maxP ? `${minP}` : `${minP}–${maxP}`} participant(s) incl.
            captain · {event.venue}
          </p>
        )}
      </div>

      {allowsTeam && (
        <div>
          <label className={labelCls} htmlFor="teamName">
            Team name {needsTeamName ? "" : "(optional)"}
          </label>
          <input
            id="teamName"
            name="teamName"
            required={needsTeamName}
            maxLength={120}
            className={inputCls}
            placeholder="e.g. - "
          />
        </div>
      )}

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="hud mb-4 text-white/90">
          {allowsTeam ? "Captain details" : "Your details"}
        </legend>
        <div>
          <label className={labelCls} htmlFor="captainName">
            Full name
          </label>
          <input
            id="captainName"
            name="captainName"
            required
            minLength={2}
            autoComplete="name"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="rollNumber">
            Roll number / ID
          </label>
          <input
            id="rollNumber"
            name="rollNumber"
            maxLength={40}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="phone">
            Mobile number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            pattern="(\+?91[\s-]?)?[6-9]\d{9}"
            autoComplete="tel"
            className={inputCls}
            placeholder="10-digit mobile"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="institution">
            Institution
          </label>
          <input
            id="institution"
            name="institution"
            required
            minLength={2}
            defaultValue="IIT Bhubaneswar"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="department">
            School / department
          </label>
          <input
            id="department"
            name="department"
            className={inputCls}
          />
        </div>
      </fieldset>

      {allowsTeam && (
        <fieldset>
          <legend className="hud mb-4 text-white/90">
            Team members ({participants}/{maxP} incl. captain
            {minP > 1 ? `, minimum ${minP}` : ""})
          </legend>
          <div className="space-y-3">
            {members.map((m, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={m.name}
                  onChange={(e) => updateMember(i, "name", e.target.value)}
                  required={i < minP - 1}
                  placeholder={`Member ${i + 2} name`}
                  className={inputCls}
                />
                <input
                  value={m.rollNumber}
                  onChange={(e) =>
                    updateMember(i, "rollNumber", e.target.value)
                  }
                  placeholder="Roll no."
                  className={inputCls}
                />
                <button
                  type="button"
                  aria-label={`Remove member ${i + 2}`}
                  disabled={members.length <= minP - 1}
                  onClick={() =>
                    setMembers((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="shrink-0 border border-white/15 px-3 text-silver-dim hover:text-white disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {participants < maxP && (
            <button
              type="button"
              onClick={() =>
                setMembers((prev) => [
                  ...prev,
                  { name: "", rollNumber: "" },
                ])
              }
              className="mt-4 flex items-center gap-2 font-mono text-[11px] tracking-hud text-silver hover:text-white"
            >
              <Plus className="h-4 w-4" /> ADD MEMBER
            </button>
          )}
        </fieldset>
      )}

      {error && (
        <p
          role="alert"
          className="border border-crimson/50 bg-crimson/10 px-4 py-3 text-sm text-white"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-primary clip-notch w-full !py-4 disabled:opacity-60"
      >
        {submitting ? "Opening Google Form…" : "Continue to Google Form →"}
      </button>

      <p className="text-center text-xs leading-relaxed text-silver-dim">
        No payment is required here. After you submit, you&apos;ll be taken to
        the Google Form for the selected sport.
      </p>
    </form>
  );
}
