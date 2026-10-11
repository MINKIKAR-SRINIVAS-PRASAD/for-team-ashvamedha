"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { RANKINGS } from "@/data/leaderboard";
import {
  createStanding,
  deleteStanding,
  fetchStandings,
  updateStanding,
  type StandingRow,
} from "@/lib/adminApi";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full border border-white/15 bg-white/[0.03] px-2 py-1.5 text-sm text-white placeholder:text-silver-dim/60 transition-colors focus:border-crimson/70 focus:outline-none";
const numCls = cn(inputCls, "w-20 text-right tabular-nums");

type NumKey = "matches" | "wins" | "losses" | "points";
const NUM_KEYS: [NumKey, string][] = [
  // Hidden while the public table shows points only; uncomment to edit them again.
  // ["matches", "Matches"],
  // ["wins", "Wins"],
  // ["losses", "Losses"],
  ["points", "Points"],
];

const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || `team-${Date.now()}`;

/** The website's built-in rows (data/leaderboard.ts), used for "Reset". */
const DEFAULT_ROWS: StandingRow[] = RANKINGS.map((r) => ({
  teamSlug: r.teamSlug,
  teamName: r.team,
  matches: r.matches,
  wins: r.wins,
  losses: r.losses,
  points: r.points,
  winPct: null,
}));

/**
 * Main admin only: edit the leaderboard rows the public site shows.
 * Finished matches still add their points on top of these numbers.
 */
export function LeaderboardPanel({ onError }: { onError: (err: unknown) => void }) {
  const [rows, setRows] = useState<StandingRow[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, StandingRow>>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchStandings();
      setRows(data);
      setDrafts(Object.fromEntries(data.map((r) => [r.teamSlug, r])));
    } catch (err) {
      onError(err);
    }
  }, [onError]);

  useEffect(() => {
    load();
  }, [load]);

  const run = async (fn: () => Promise<unknown>, done: string) => {
    setBusy(true);
    setNotice(null);
    try {
      await fn();
      await load();
      setNotice(done);
    } catch (err) {
      onError(err);
    }
    setBusy(false);
  };

  const edit = (slug: string, patch: Partial<StandingRow>) =>
    setDrafts((d) => ({ ...d, [slug]: { ...d[slug], ...patch } }));

  const isDirty = (r: StandingRow) => {
    const d = drafts[r.teamSlug];
    return d && (d.teamName !== r.teamName || NUM_KEYS.some(([k]) => d[k] !== r[k]));
  };

  const save = (r: StandingRow) => {
    const d = drafts[r.teamSlug];
    return run(
      () =>
        updateStanding(r.teamSlug, {
          teamName: d.teamName.trim() || "-",
          matches: d.matches,
          wins: d.wins,
          losses: d.losses,
          points: d.points,
          // Let the site work out win % from wins and matches.
          winPct: null,
        }),
      `Saved ${d.teamName.trim() || "row"}. The site shows it within about 30 seconds.`,
    );
  };

  const remove = (r: StandingRow) => {
    if (!window.confirm(`Remove "${r.teamName}" from the leaderboard?`)) return;
    run(() => deleteStanding(r.teamSlug), `Removed ${r.teamName}.`);
  };

  const add = (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    let slug = slugify(name);
    if (rows?.some((r) => r.teamSlug === slug)) slug = `${slug}-${Date.now().toString(36)}`;
    run(async () => {
      await createStanding({ teamSlug: slug, teamName: name, matches: 0, wins: 0, losses: 0, points: 0, winPct: null });
      setNewName("");
    }, `Added ${name}.`);
  };

  const reset = () => {
    if (
      !window.confirm(
        "Replace every leaderboard row with the website's 12 default rows (all at 0)? This removes the current rows.",
      )
    )
      return;
    run(async () => {
      for (const r of rows ?? []) await deleteStanding(r.teamSlug);
      for (const r of DEFAULT_ROWS) await createStanding(r);
    }, "Leaderboard reset to the 12 default rows.");
  };

  if (!rows) return <p className="hud">Loading leaderboard…</p>;

  const sorted = [...rows].sort((a, b) => b.points - a.points || b.wins - a.wins || a.teamName.localeCompare(b.teamName));

  return (
    <div className="space-y-5">
      <div className="panel space-y-2 p-5 text-sm text-silver-dim">
        <p>
          Edit a team&apos;s numbers and press <span className="text-white">Save</span>. The public leaderboard
          updates within about 30 seconds, with no code push.
        </p>
        <p>
          Finished matches on the Live scores tab also add points (win 3, draw 1) to the row with the same team
          name, on top of what you type here.
        </p>
      </div>

      {notice && (
        <p role="status" className="border border-volt/40 bg-volt/10 px-4 py-3 text-sm text-white">
          {notice}
        </p>
      )}

      <div className="panel overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="hud px-3 py-3 !text-[0.6rem]">Team</th>
              {NUM_KEYS.map(([, label]) => (
                <th key={label} className="hud px-3 py-3 text-right !text-[0.6rem]">
                  {label}
                </th>
              ))}
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={NUM_KEYS.length + 2} className="px-3 py-6 text-silver-dim">
                  No rows yet. Add a team below, or press &quot;Reset to default rows&quot;.
                </td>
              </tr>
            )}
            {sorted.map((r) => {
              const d = drafts[r.teamSlug] ?? r;
              const dirty = isDirty(r);
              return (
                <tr key={r.teamSlug} className="border-b border-white/5">
                  <td className="px-3 py-2">
                    <input
                      aria-label="Team name"
                      className={inputCls}
                      value={d.teamName}
                      onChange={(e) => edit(r.teamSlug, { teamName: e.target.value })}
                    />
                  </td>
                  {NUM_KEYS.map(([k, label]) => (
                    <td key={k} className="px-3 py-2 text-right">
                      <input
                        aria-label={`${d.teamName} ${label}`}
                        type="number"
                        min={k === "points" ? undefined : 0}
                        inputMode="numeric"
                        className={numCls}
                        value={d[k]}
                        onChange={(e) => edit(r.teamSlug, { [k]: Number(e.target.value) || 0 })}
                      />
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-3 py-2 text-right">
                    <button
                      type="button"
                      disabled={busy || !dirty}
                      onClick={() => save(r)}
                      className="btn btn-primary clip-notch !px-3 !py-1.5 disabled:opacity-40"
                    >
                      <Save className="h-4 w-4" /> Save
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => remove(r)}
                      aria-label={`Remove ${r.teamName}`}
                      className="ml-2 inline-flex h-9 w-9 items-center justify-center border border-white/20 text-silver hover:border-crimson/70 hover:text-white disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <form onSubmit={add} className="flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="hud mb-1.5 block !text-[0.6rem]">New team</span>
            <input
              className={cn(inputCls, "w-64")}
              value={newName}
              placeholder="e.g. Computer Science"
              onChange={(e) => setNewName(e.target.value)}
            />
          </label>
          <button type="submit" disabled={busy || !newName.trim()} className="btn btn-ghost clip-notch !px-4 !py-2">
            <Plus className="h-4 w-4" /> Add team
          </button>
        </form>
        <button type="button" disabled={busy} onClick={reset} className="btn btn-ghost clip-notch !px-4 !py-2">
          <RotateCcw className="h-4 w-4" /> Reset to default rows
        </button>
      </div>
    </div>
  );
}
