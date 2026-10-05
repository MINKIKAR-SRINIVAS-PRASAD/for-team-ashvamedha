"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, LogOut, Minus, Play, Plus, RotateCcw, Square, Trash2 } from "lucide-react";
import { SportAdminsPanel } from "@/components/SportAdminsPanel";
import { useFestData } from "@/components/FestDataProvider";
import {
  ApiError,
  bumpScore,
  createMatch,
  deleteMatch,
  fetchMe,
  fetchMyMatches,
  getToken,
  logout,
  updateMatch,
  type AdminMatch,
  type AdminUser,
  type MatchStatus,
} from "@/lib/adminApi";
import { cn } from "@/lib/utils";

const REFRESH_MS = 15_000;

const inputCls =
  "w-full border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-silver-dim/60 transition-colors focus:border-crimson/70 focus:outline-none";
const labelCls = "hud mb-1.5 block !text-[0.6rem]";

const STATUS_STYLE: Record<MatchStatus, string> = {
  live: "border-crimson/70 bg-crimson/15 text-white",
  upcoming: "border-white/20 text-silver-dim",
  final: "border-volt/50 text-volt",
};

export function AdminDashboard() {
  const router = useRouter();
  const { events } = useFestData();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [matches, setMatches] = useState<AdminMatch[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"scores" | "admins">("scores");

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/login");
        return;
      }
      setError((err as Error).message);
    },
    [router],
  );

  const refresh = useCallback(async () => {
    try {
      setMatches(await fetchMyMatches());
    } catch (err) {
      handleError(err);
    }
  }, [handleError]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    fetchMe()
      .then((me) => {
        setUser(me);
        return refresh();
      })
      .catch(handleError);
  }, [router, refresh, handleError]);

  useEffect(() => {
    if (!user) return;
    const t = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(t);
  }, [user, refresh]);

  const eventName = useCallback(
    (slug: string) => events.find((e) => e.slug === slug)?.name ?? slug,
    [events],
  );

  /** Sports this account may manage. */
  const sports = useMemo(() => {
    if (!user) return [];
    return user.role === "admin" ? events.map((e) => e.slug) : user.eventSlugs;
  }, [user, events]);

  const replaceMatch = (m: AdminMatch) =>
    setMatches((prev) => prev?.map((x) => (x.id === m.id ? m : x)) ?? prev);

  const run = async (fn: () => Promise<AdminMatch | void>) => {
    setError(null);
    try {
      const m = await fn();
      if (m) replaceMatch(m);
    } catch (err) {
      handleError(err);
    }
  };

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  if (!user || !matches) {
    return <p className="hud">{error ?? "Loading control room…"}</p>;
  }

  const scope =
    user.role === "admin" ? "All sports" : user.eventSlugs.map(eventName).join(", ") || "No sport assigned";
  const order: MatchStatus[] = ["live", "upcoming", "final"];
  const sorted = [...matches].sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));

  return (
    <div className="space-y-8">
      <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <span className="hud">Signed in as</span>
          <p className="mt-1 font-display text-2xl uppercase text-white">{user.username}</p>
          <p className="mt-1 text-sm text-silver-dim">
            {user.role === "admin" ? "Super admin" : "Sport admin"} · {scope}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={onLogout} className="btn btn-ghost clip-notch !py-2.5">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </div>

      {user.role === "admin" && (
        <div role="tablist" aria-label="Control room sections" className="flex border-b border-white/10">
          {(
            [
              ["scores", "Live scores"],
              ["admins", "Sport admins"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "-mb-px border-b-2 px-4 py-3 font-mono text-[11px] uppercase tracking-hud transition-colors",
                tab === id ? "border-crimson text-white" : "border-transparent text-silver-dim hover:text-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="border border-crimson/50 bg-crimson/10 px-4 py-3 text-sm text-white">
          {error}
        </p>
      )}

      {user.role === "admin" && tab === "admins" ? (
        <SportAdminsPanel events={events} onError={handleError} />
      ) : (
        <>
      {sports.length > 0 && (
        <NewMatchForm sports={sports} eventName={eventName} onCreated={refresh} onError={handleError} />
      )}

      {sorted.length === 0 ? (
        <p className="text-silver-dim">
          No matches yet for {scope}. Add one above and it will appear on the site&apos;s live feed.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {sorted.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              sportName={eventName(m.eventSlug)}
              run={run}
              onDeleted={() => setMatches((prev) => prev?.filter((x) => x.id !== m.id) ?? prev)}
            />
          ))}
        </div>
      )}

        </>
      )}

      <p className="text-sm text-silver-dim">
        Changes show on the <Link href="/" className="underline hover:text-white">public site</Link> within
        about 15 seconds.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

type Draft = {
  homeName: string;
  awayName: string;
  homeScore: string;
  awayScore: string;
  clock: string;
  stage: string;
  detail: string;
  resultSummary: string;
  winner: "" | "home" | "away" | "draw";
};

const draftOf = (m: AdminMatch): Draft => ({
  homeName: m.home.name,
  awayName: m.away.name,
  homeScore: m.homeScoreRaw,
  awayScore: m.awayScoreRaw,
  clock: m.clock ?? "",
  stage: m.stage,
  detail: m.detail,
  resultSummary: m.resultSummary,
  winner: m.winner ?? "",
});

function MatchCard({
  match: m,
  sportName,
  run,
  onDeleted,
}: {
  match: AdminMatch;
  sportName: string;
  run: (fn: () => Promise<AdminMatch | void>) => Promise<void>;
  onDeleted: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(() => draftOf(m));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);

  // Take server updates (other admins, auto-refresh) unless this card has unsaved edits.
  useEffect(() => {
    if (!dirty) setDraft(draftOf(m));
  }, [m, dirty]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setDraft((d) => ({ ...d, [k]: v }));
    setDirty(true);
  };

  const act = async (fn: () => Promise<AdminMatch | void>) => {
    setBusy(true);
    await run(fn);
    setBusy(false);
  };

  const save = () =>
    act(async () => {
      const out = await updateMatch(m.id, {
        ...draft,
        winner: draft.winner || null,
      });
      setDirty(false);
      return out;
    });

  const setStatus = (status: MatchStatus) => act(() => updateMatch(m.id, { status }));

  const remove = () => {
    if (!window.confirm(`Delete ${m.home.name} vs ${m.away.name}?`)) return;
    act(async () => {
      await deleteMatch(m.id);
      onDeleted();
    });
  };

  const numeric = /^\d*$/.test(m.homeScoreRaw) && /^\d*$/.test(m.awayScoreRaw);

  const side = (s: "home" | "away") => (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="line-clamp-2 min-h-[2.5rem] text-sm text-white">{m[s].name}</span>
      <span className="font-display text-5xl text-white">{(s === "home" ? m.homeScoreRaw : m.awayScoreRaw) || "–"}</span>
      {numeric && m.status !== "final" && (
        <div className="flex gap-2">
          <button
            type="button"
            aria-label={`${m[s].name} minus one`}
            disabled={busy}
            onClick={() => act(() => bumpScore(m.id, s, -1))}
            className="flex h-10 w-10 items-center justify-center border border-white/20 text-silver hover:border-crimson/70 hover:text-white disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`${m[s].name} plus one`}
            disabled={busy}
            onClick={() => act(() => bumpScore(m.id, s, 1))}
            className="flex h-10 w-10 items-center justify-center border border-crimson/60 bg-crimson/20 text-white hover:bg-crimson/40 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <article className="panel p-5">
      <header className="flex items-center justify-between gap-3">
        <span className="hud">
          {sportName}
          {m.stage ? ` · ${m.stage}` : ""}
        </span>
        <span className={cn("border px-2 py-0.5 font-mono text-[10px] uppercase tracking-hud", STATUS_STYLE[m.status])}>
          {m.status}
        </span>
      </header>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {side("home")}
        <span className="hud">vs</span>
        {side("away")}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {m.status === "upcoming" && (
          <button type="button" disabled={busy} onClick={() => setStatus("live")} className="btn btn-primary clip-notch !px-4 !py-2">
            <Play className="h-4 w-4" /> Start
          </button>
        )}
        {m.status === "live" && (
          <button type="button" disabled={busy} onClick={() => setStatus("final")} className="btn btn-primary clip-notch !px-4 !py-2">
            <Square className="h-4 w-4" /> Finish
          </button>
        )}
        {m.status === "final" && (
          <button type="button" disabled={busy} onClick={() => setStatus("live")} className="btn btn-ghost clip-notch !px-4 !py-2">
            <RotateCcw className="h-4 w-4" /> Reopen
          </button>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={remove}
          className="btn btn-ghost clip-notch ml-auto !px-4 !py-2"
          aria-label="Delete match"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <details className="mt-5 border-t border-white/10 pt-4">
        <summary className="hud cursor-pointer hover:text-white">Edit match details</summary>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Field label="Home team" value={draft.homeName} onChange={(v) => set("homeName", v)} />
          <Field label="Away team" value={draft.awayName} onChange={(v) => set("awayName", v)} />
          <Field label="Home score" value={draft.homeScore} onChange={(v) => set("homeScore", v)} placeholder="e.g. 74 or 21-18, 21-15" />
          <Field label="Away score" value={draft.awayScore} onChange={(v) => set("awayScore", v)} />
          <Field label="Clock / period" value={draft.clock} onChange={(v) => set("clock", v)} placeholder="e.g. Q4 · 04:12" />
          <Field label="Stage" value={draft.stage} onChange={(v) => set("stage", v)} placeholder="e.g. Semi-final I" />
          <div className="col-span-2">
            <Field label="Venue / detail" value={draft.detail} onChange={(v) => set("detail", v)} placeholder="e.g. Court 01" />
          </div>
          {m.status === "final" && (
            <>
              <label className="block">
                <span className={labelCls}>Winner</span>
                <select className={inputCls} value={draft.winner} onChange={(e) => set("winner", e.target.value as Draft["winner"])}>
                  <option value="">Auto (from score)</option>
                  <option value="home">{draft.homeName || "Home"}</option>
                  <option value="away">{draft.awayName || "Away"}</option>
                  <option value="draw">Draw</option>
                </select>
              </label>
              <Field label="Result summary" value={draft.resultSummary} onChange={(v) => set("resultSummary", v)} />
            </>
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <button type="button" disabled={busy || !dirty} onClick={save} className="btn btn-primary clip-notch !px-4 !py-2">
            Save details
          </button>
          {dirty && (
            <button
              type="button"
              onClick={() => {
                setDraft(draftOf(m));
                setDirty(false);
              }}
              className="btn btn-ghost clip-notch !px-4 !py-2"
            >
              Discard
            </button>
          )}
        </div>
      </details>
    </article>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input className={inputCls} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/* -------------------------------------------------------------------------- */

function NewMatchForm({
  sports,
  eventName,
  onCreated,
  onError,
}: {
  sports: string[];
  eventName: (slug: string) => string;
  onCreated: () => Promise<void>;
  onError: (err: unknown) => void;
}) {
  const [eventSlug, setEventSlug] = useState(sports[0]);
  const [homeName, setHomeName] = useState("");
  const [awayName, setAwayName] = useState("");
  const [stage, setStage] = useState("");
  const [detail, setDetail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createMatch({ eventSlug, homeName, awayName, stage, detail, status: "upcoming" });
      setHomeName("");
      setAwayName("");
      setStage("");
      setDetail("");
      await onCreated();
    } catch (err) {
      onError(err);
    }
    setBusy(false);
  };

  return (
    <details className="panel p-5">
      <summary className="hud cursor-pointer hover:text-white">+ Add a match</summary>
      <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={cn(labelCls, "flex items-center gap-1.5")}>
            Sport {sports.length === 1 && <Lock className="h-3 w-3" aria-label="locked" />}
          </span>
          <select
            className={cn(inputCls, sports.length === 1 && "cursor-not-allowed opacity-70")}
            value={eventSlug}
            disabled={sports.length === 1}
            onChange={(e) => setEventSlug(e.target.value)}
          >
            {sports.map((s) => (
              <option key={s} value={s}>
                {eventName(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Home team</span>
          <input className={inputCls} required value={homeName} onChange={(e) => setHomeName(e.target.value)} />
        </label>
        <label className="block">
          <span className={labelCls}>Away team</span>
          <input className={inputCls} required value={awayName} onChange={(e) => setAwayName(e.target.value)} />
        </label>
        <Field label="Stage" value={stage} onChange={setStage} placeholder="e.g. Quarter-final" />
        <Field label="Venue / detail" value={detail} onChange={setDetail} placeholder="e.g. Court 02" />
        <div className="sm:col-span-2">
          <button type="submit" disabled={busy} className="btn btn-primary clip-notch !px-5 !py-2.5">
            {busy ? "Adding…" : `Add ${eventName(eventSlug)} match`}
          </button>
        </div>
      </form>
    </details>
  );
}
