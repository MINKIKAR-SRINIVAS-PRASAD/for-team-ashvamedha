"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ShieldCheck, User } from "lucide-react";
import { login } from "@/lib/adminApi";
import { cn } from "@/lib/utils";

type Mode = "user" | "admin";

const inputCls =
  "w-full border border-white/15 bg-white/[0.03] px-4 py-3 text-[0.95rem] text-white placeholder:text-silver-dim/60 transition-colors focus:border-crimson/70 focus:outline-none";
const labelCls = "hud mb-2 block";

/** One login page, two modes: spectators continue to the site, admins sign in. */
export function LoginPanel() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("user");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(username.trim(), password);
      router.push("/admin");
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <div className="panel clip-notch p-6 sm:p-8">
      <div role="tablist" aria-label="Login type" className="grid grid-cols-2 border border-white/15">
        {(
          [
            { id: "user", label: "User", Icon: User },
            { id: "admin", label: "Admin", Icon: ShieldCheck },
          ] as const
        ).map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={mode === id}
            onClick={() => {
              setMode(id);
              setError(null);
            }}
            className={cn(
              "flex items-center justify-center gap-2 py-3 font-mono text-[11px] uppercase tracking-hud transition-colors",
              mode === id ? "bg-crimson text-white" : "text-silver-dim hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {mode === "user" ? (
        <div className="mt-8">
          <p className="text-[0.95rem] leading-relaxed text-silver-dim">
            Spectators and players don&apos;t need an account. Follow live scores, the schedule and
            results, or register your team.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-primary clip-notch">
              Continue to site <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/register" className="btn btn-ghost clip-notch">
              Register a team
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <p className="text-[0.9rem] leading-relaxed text-silver-dim">
            Sport admins can update live scores and match details for their own sport.
          </p>
          <div>
            <label htmlFor="admin-username" className={labelCls}>
              Username
            </label>
            <input
              id="admin-username"
              className={inputCls}
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="admin-password" className={labelCls}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              className={inputCls}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p role="alert" className="border border-crimson/50 bg-crimson/10 px-4 py-3 text-sm text-white">
              {error}
            </p>
          )}
          <button type="submit" disabled={submitting} className="btn btn-primary clip-notch w-full justify-center">
            {submitting ? "Signing in…" : "Sign in as admin"}
          </button>
        </form>
      )}
    </div>
  );
}
