"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Trash2, UserPlus } from "lucide-react";
import type { FestEvent } from "@/data/events";
import {
  createSportAdmin,
  deleteUser,
  fetchUsers,
  updateUser,
  type AdminUser,
} from "@/lib/adminApi";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full border border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-silver-dim/60 transition-colors focus:border-crimson/70 focus:outline-none";
const labelCls = "hud mb-1.5 block !text-[0.6rem]";

/** Main admin only: every sport with its admins; rename, reset password, add, disable, remove. */
export function SportAdminsPanel({
  events,
  onError,
}: {
  events: FestEvent[];
  onError: (err: unknown) => void;
}) {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setUsers(await fetchUsers());
    } catch (err) {
      onError(err);
    }
  }, [onError]);

  useEffect(() => {
    load();
  }, [load]);

  const done = async (message: string) => {
    setNotice(message);
    await load();
  };

  if (!users) return <p className="hud">Loading sport admins…</p>;

  const sportAdmins = users.filter((u) => u.role === "coordinator");

  return (
    <div className="space-y-5">
      <p className="text-sm text-silver-dim">
        Each sport admin can only update matches of their own sport. Change a username or set a new
        password here; the old password stops working straight away.
      </p>
      {notice && (
        <p role="status" className="border border-volt/40 bg-volt/10 px-4 py-3 text-sm text-white">
          {notice}
        </p>
      )}
      <div className="grid gap-5 lg:grid-cols-2">
        {events.map((ev) => (
          <SportCard
            key={ev.slug}
            sport={ev}
            admins={sportAdmins.filter((u) => u.eventSlugs.includes(ev.slug))}
            onDone={done}
            onError={(err) => {
              setNotice(null);
              onError(err);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function SportCard({
  sport,
  admins,
  onDone,
  onError,
}: {
  sport: FestEvent;
  admins: AdminUser[];
  onDone: (message: string) => Promise<void>;
  onError: (err: unknown) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await createSportAdmin(sport.slug, username.trim(), password);
      setUsername("");
      setPassword("");
      await onDone(`Added ${sport.name} admin '${username.trim()}'.`);
    } catch (err) {
      onError(err);
    }
    setBusy(false);
  };

  return (
    <section className="panel p-5">
      <header className="flex items-center justify-between">
        <h3 className="font-display text-xl uppercase text-white">{sport.name}</h3>
        <span className="hud">
          {admins.length} admin{admins.length === 1 ? "" : "s"}
        </span>
      </header>

      <div className="mt-4 space-y-3">
        {admins.length === 0 && <p className="text-sm text-silver-dim">No admin yet.</p>}
        {admins.map((u) => (
          <AdminRow key={u.id} user={u} onDone={onDone} onError={onError} />
        ))}
      </div>

      <details className="mt-4 border-t border-white/10 pt-4">
        <summary className="hud flex cursor-pointer items-center gap-2 hover:text-white">
          <UserPlus className="h-3.5 w-3.5" /> Add {sport.name} admin
        </summary>
        <form onSubmit={add} className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block">
            <span className={labelCls}>Username</span>
            <input className={inputCls} required minLength={3} value={username} onChange={(e) => setUsername(e.target.value)} />
          </label>
          <label className="block">
            <span className={labelCls}>Password (min 8)</span>
            <input
              className={inputCls}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={busy} className="btn btn-primary clip-notch !px-4 !py-2">
            Add
          </button>
        </form>
      </details>
    </section>
  );
}

function AdminRow({
  user: u,
  onDone,
  onError,
}: {
  user: AdminUser;
  onDone: (message: string) => Promise<void>;
  onError: (err: unknown) => void;
}) {
  const [username, setUsername] = useState(u.username);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setUsername(u.username), [u.username]);

  const changed = username.trim() !== u.username || password.length > 0;

  const act = async (fn: () => Promise<unknown>, message: string) => {
    setBusy(true);
    try {
      await fn();
      setPassword("");
      await onDone(message);
    } catch (err) {
      onError(err);
    }
    setBusy(false);
  };

  const save = (e: FormEvent) => {
    e.preventDefault();
    const patch: { username?: string; password?: string } = {};
    if (username.trim() !== u.username) patch.username = username.trim();
    if (password) patch.password = password;
    act(() => updateUser(u.id, patch), `Saved '${patch.username ?? u.username}'.`);
  };

  return (
    <form onSubmit={save} className={cn("border border-white/10 p-3", !u.isActive && "opacity-60")}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Username</span>
          <input className={inputCls} required minLength={3} value={username} onChange={(e) => setUsername(e.target.value)} />
        </label>
        <label className="block">
          <span className={labelCls}>New password</span>
          <input
            className={inputCls}
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="Leave blank to keep"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="submit" disabled={busy || !changed} className="btn btn-primary clip-notch !px-4 !py-2">
          Save
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            act(
              () => updateUser(u.id, { isActive: !u.isActive }),
              `${u.isActive ? "Disabled" : "Enabled"} '${u.username}'.`,
            )
          }
          className="btn btn-ghost clip-notch !px-4 !py-2"
        >
          {u.isActive ? "Disable" : "Enable"}
        </button>
        <button
          type="button"
          disabled={busy}
          aria-label={`Remove ${u.username}`}
          onClick={() => {
            if (window.confirm(`Remove admin '${u.username}'?`)) act(() => deleteUser(u.id), `Removed '${u.username}'.`);
          }}
          className="btn btn-ghost clip-notch ml-auto !px-4 !py-2"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
