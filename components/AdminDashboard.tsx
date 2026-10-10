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
  bumpTeamScore,
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
import { FORMAT_LABEL, type MatchFormat, type SetScore } from "@/data/liveScores";
import { cn } from "@/lib/utils";

const REFRESH_MS = 15_000;

/** Sports scored set by set, with singles/doubles. */
const isRacquet = (slug: string) => /badminton|table-tennis|tennis/i.test(slug);
/** Sports where one round has many teams. */
const isQuiz = (slug: string) => /quiz/i.test(slug);

const FORMATS = Object.entries(FORMAT_LABEL) as [MatchFormat, string][];

const setsToText = (sets: SetScore[] | undefined) => (sets ?? []).map((x) => `${x.home}-${x.away}`).join(", ");
const textToSets = (text: string): SetScore[] =>
  text
    .split(/[,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => {
      const [home = "", away = ""] = t.split(/\s*[-–:]\s*/);
      return { home: home.trim(), away: away.trim() };
    });

/** Team names already in the system, offered as suggestions so results reach the leaderboard. */
const TEAM_LIST_ID = "admin-team-names";

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
  const { events, teams } = useFestData();
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
      <datalist id={TEAM_LIST_ID}>
        {teams.map((t) => (
          <option key={t.slug} value={t.name} />
        ))}
      </datalist>

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
  format: MatchFormat | "";
  setsText: string;
  teamsText: string;
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
  format: m.format ?? "",
  setsText: setsToText(m.sets),
  teamsText: (m.participants ?? []).map((p) => p.name).join("\n"),
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

  const multi = (m.participants?.length ?? 0) > 0;
  const racquet = isRacquet(m.eventSlug) || Boolean(m.format) || (m.sets?.length ?? 0) > 0;

  const save = () =>
    act(async () => {
      const { format, setsText, teamsText, ...rest } = draft;
      const patch: Record<string, unknown> = { ...rest, winner: draft.winner || null };
      if (racquet) {
        patch.matchFormat = format;
        patch.sets = textToSets(setsText);
      }
      if (multi) {
        // Keep each team's score when only names are added, removed or reordered.
        const old = new Map((m.participants ?? []).map((p) => [p.name, String(p.score === "—" ? "" : p.score)]));
        patch.participants = teamsText
          .split("\n")
          .map((n) => n.trim())
          .filter(Boolean)
          .map((name) => ({ name, score: old.get(name) ?? "" }));
        delete patch.homeName;
        delete patch.awayName;
        delete patch.homeScore;
        delete patch.awayScore;
      }
      const out = await updateMatch(m.id, patch);
      setDirty(false);
      return out;
    });

  const setStatus = (status: MatchStatus) => act(() => updateMatch(m.id, { status }));

  const nextSet = () =>
    act(() => updateMatch(m.id, { sets: [...(m.sets ?? []), { home: "0", away: "0" }] }));

  const remove = () => {
    const label = multi ? `this ${sportName} round` : `${m.home.name} vs ${m.away.name}`;
    if (!window.confirm(`Delete ${label}?`)) return;
    act(async () => {
      await deleteMatch(m.id);
      onDeleted();
    });
  };

  const current = m.sets?.[m.sets.length - 1];
  const numeric = racquet
    ? !current || (/^\d*$/.test(current.home) && /^\d*$/.test(current.away))
    : /^\d*$/.test(m.homeScoreRaw) && /^\d*$/.test(m.awayScoreRaw);

  const side = (s: "home" | "away") => (
    <div className="flex flex-col items-center gap-2 text-center">
      <span className="line-clamp-2 min-h-[2.5rem] text-sm text-white">{m[s].name}</span>
      <span className="font-display text-5xl text-white">{(s === "home" ? m.homeScoreRaw : m.awayScoreRaw) || "–"}</span>
      {racquet && current && (
        <span className="font-mono text-xs text-silver">
          Set {m.sets!.length}: <span className="text-white">{current[s] || "0"}</span>
        </span>
      )}
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
          {m.format ? ` · ${FORMAT_LABEL[m.format]}` : ""}
          {m.stage ? ` · ${m.stage}` : ""}
        </span>
        <span className={cn("border px-2 py-0.5 font-mono text-[10px] uppercase tracking-hud", STATUS_STYLE[m.status])}>
          {m.status}
        </span>
      </header>

      {multi ? (
        <ul className="mt-4 space-y-2">
          {(m.participants ?? []).map((p, idx) => (
            <li key={`${p.name}-${idx}`} className="flex items-center justify-between gap-3 border-b border-white/5 pb-2">
              <span className="min-w-0 truncate text-sm text-white">{p.name}</span>
              <span className="flex items-center gap-2">
                <span className="w-10 text-right font-display text-2xl tabular-nums text-white">{p.score}</span>
                {m.status !== "final" && (
                  <>
                    <button
                      type="button"
                      aria-label={`${p.name} minus one`}
                      disabled={busy}
                      onClick={() => act(() => bumpTeamScore(m.id, idx, -1))}
                      className="flex h-9 w-9 items-center justify-center border border-white/20 text-silver hover:border-crimson/70 hover:text-white disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={`${p.name} plus one`}
                      disabled={busy}
                      onClick={() => act(() => bumpTeamScore(m.id, idx, 1))}
                      className="flex h-9 w-9 items-center justify-center border border-crimson/60 bg-crimson/20 text-white hover:bg-crimson/40 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {side("home")}
            <span className="hud">{racquet ? "sets" : "vs"}</span>
            {side("away")}
          </div>
          {racquet && (m.sets?.length ?? 0) > 0 && (
            <p className="mt-3 text-center font-mono text-xs text-silver-dim">
              {m.sets!.map((x, k) => `S${k + 1} ${x.home || 0}-${x.away || 0}`).join(" · ")}
            </p>
          )}
        </>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {m.status === "upcoming" && (
          <button type="button" disabled={busy} onClick={() => setStatus("live")} className="btn btn-primary clip-notch !px-4 !py-2">
            <Play className="h-4 w-4" /> Start
          </button>
        )}
        {m.status === "live" && racquet && (
          <button type="button" disabled={busy} onClick={nextSet} className="btn btn-ghost clip-notch !px-4 !py-2">
            <Plus className="h-4 w-4" /> Next set
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
          {multi ? (
            <label className="col-span-2 block">
              <span className={labelCls}>Teams (one per line)</span>
              <textarea
                className={cn(inputCls, "min-h-[8rem]")}
                value={draft.teamsText}
                onChange={(e) => set("teamsText", e.target.value)}
              />
            </label>
          ) : (
            <>
              <Field label="Home team" value={draft.homeName} onChange={(v) => set("homeName", v)} list={TEAM_LIST_ID} />
              <Field label="Away team" value={draft.awayName} onChange={(v) => set("awayName", v)} list={TEAM_LIST_ID} />
            </>
          )}
          {racquet ? (
            <>
              <FormatSelect value={draft.format} onChange={(v) => set("format", v)} />
              <Field
                label="Set scores (home-away)"
                value={draft.setsText}
                onChange={(v) => set("setsText", v)}
                placeholder="e.g. 11-7, 9-11, 11-5"
              />
            </>
          ) : (
            !multi && (
              <>
                <Field label="Home score" value={draft.homeScore} onChange={(v) => set("homeScore", v)} placeholder="e.g. 74" />
                <Field label="Away score" value={draft.awayScore} onChange={(v) => set("awayScore", v)} />
              </>
            )
          )}
          <Field label="Clock / period" value={draft.clock} onChange={(v) => set("clock", v)} placeholder="e.g. Q4 · 04:12" />
          <Field label="Stage" value={draft.stage} onChange={(v) => set("stage", v)} placeholder="e.g. Semi-final I" />
          <div className="col-span-2">
            <Field label="Venue / detail" value={draft.detail} onChange={(v) => set("detail", v)} placeholder="e.g. Court 01" />
          </div>
          {m.status === "final" && !multi && (
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
  list,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  list?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input
        className={inputCls}
        value={value}
        placeholder={placeholder}
        list={list}
        required={required}
        autoComplete="off"
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function FormatSelect({ value, onChange }: { value: MatchFormat | ""; onChange: (v: MatchFormat) => void }) {
  return (
    <label className="block">
      <span className={labelCls}>Singles or doubles</span>
      <select className={inputCls} value={value || "singles"} onChange={(e) => onChange(e.target.value as MatchFormat)}>
        {FORMATS.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
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
  const [format, setFormat] = useState<MatchFormat>("singles");
  const [quizTeams, setQuizTeams] = useState<string[]>(["", "", "", ""]);
  const [busy, setBusy] = useState(false);
  const quiz = isQuiz(eventSlug);
  const racquet = isRacquet(eventSlug);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const names = quizTeams.map((n) => n.trim()).filter(Boolean);
    if (quiz && names.length < 2) {
      onError(new Error("Add at least two teams."));
      return;
    }
    setBusy(true);
    try {
      await createMatch({
        eventSlug,
        stage,
        detail,
        status: "upcoming",
        ...(quiz ? { participants: names.map((name) => ({ name })) } : { homeName, awayName }),
        ...(racquet ? { matchFormat: format } : {}),
      });
      setHomeName("");
      setAwayName("");
      setQuizTeams(["", "", "", ""]);
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
        {quiz ? (
          <div className="sm:col-span-2">
            <span className={labelCls}>Teams in this round ({quizTeams.length})</span>
            <div className="grid gap-2 sm:grid-cols-2">
              {quizTeams.map((name, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    className={inputCls}
                    value={name}
                    list={TEAM_LIST_ID}
                    autoComplete="off"
                    placeholder={`Team ${idx + 1}`}
                    onChange={(e) => setQuizTeams((t) => t.map((x, k) => (k === idx ? e.target.value : x)))}
                  />
                  {quizTeams.length > 2 && (
                    <button
                      type="button"
                      aria-label={`Remove team ${idx + 1}`}
                      onClick={() => setQuizTeams((t) => t.filter((_, k) => k !== idx))}
                      className="flex w-10 shrink-0 items-center justify-center border border-white/20 text-silver hover:text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              disabled={quizTeams.length >= 40}
              onClick={() => setQuizTeams((t) => [...t, ""])}
              className="btn btn-ghost clip-notch mt-3 !px-4 !py-2"
            >
              <Plus className="h-4 w-4" /> Add team
            </button>
          </div>
        ) : (
          <>
            <Field label="Home team" value={homeName} onChange={setHomeName} list={TEAM_LIST_ID} required />
            <Field label="Away team" value={awayName} onChange={setAwayName} list={TEAM_LIST_ID} required />
          </>
        )}
        {racquet && (
          <div className="sm:col-span-2">
            <FormatSelect value={format} onChange={setFormat} />
          </div>
        )}
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
