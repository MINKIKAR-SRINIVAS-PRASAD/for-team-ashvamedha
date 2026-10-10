/**
 * ADMIN API — login session + authenticated calls to the backend.
 *
 * The token from POST /api/auth/login is kept in sessionStorage: it survives a
 * refresh, but opening the site in a new tab or browser asks for the login again.
 */

import type { MatchFormat, SetScore } from "@/data/liveScores";
import { PUBLIC_API_URL } from "@/lib/festData";

const TOKEN_KEY = "ashvamedha-admin-token";

export interface AdminUser {
  id: number;
  username: string;
  /** "admin" manages every sport; "coordinator" is a sport admin. */
  role: "admin" | "coordinator";
  eventSlugs: string[];
  isActive: boolean;
}

export type MatchStatus = "upcoming" | "live" | "final";

export interface AdminMatch {
  id: string;
  sport: string;
  eventSlug: string;
  home: { name: string; score: number | string };
  away: { name: string; score: number | string };
  homeScoreRaw: string;
  awayScoreRaw: string;
  homeTeamSlug: string | null;
  awayTeamSlug: string | null;
  status: MatchStatus;
  clock?: string;
  detail: string;
  stage: string;
  winner: "home" | "away" | "draw" | null;
  resultSummary: string;
  updatedAt: string | null;
  format?: MatchFormat;
  sets?: SetScore[];
  participants?: { name: string; score: number | string }[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage blocked: session lasts for this page only */
  }
}

function errorMessage(body: unknown, fallback: string): string {
  const detail = (body as { detail?: unknown } | null)?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  return fallback;
}

export async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${PUBLIC_API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Can't reach the server. Is the backend running?", 0);
  }
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401) setToken(null);
    throw new ApiError(errorMessage(body, `Request failed (${res.status})`), res.status);
  }
  return body as T;
}

export async function login(username: string, password: string): Promise<AdminUser> {
  const out = await adminFetch<{ accessToken: string; user: AdminUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  setToken(out.accessToken);
  return out.user;
}

export function logout() {
  setToken(null);
}

export const fetchMe = () => adminFetch<AdminUser>("/api/auth/me");

export const fetchMyMatches = () => adminFetch<AdminMatch[]>("/api/admin/matches");

export const updateMatch = (id: string, patch: Record<string, unknown>) =>
  adminFetch<AdminMatch>(`/api/admin/matches/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const bumpScore = (id: string, side: "home" | "away", delta: number) =>
  adminFetch<AdminMatch>(`/api/admin/matches/${encodeURIComponent(id)}/score`, {
    method: "POST",
    body: JSON.stringify({ side, delta }),
  });

/** Multi-team matches (quiz): change the score of the team at `index`. */
export const bumpTeamScore = (id: string, index: number, delta: number) =>
  adminFetch<AdminMatch>(`/api/admin/matches/${encodeURIComponent(id)}/score`, {
    method: "POST",
    body: JSON.stringify({ index, delta }),
  });

export const createMatch = (data: Record<string, unknown>) =>
  adminFetch<AdminMatch>("/api/admin/matches", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteMatch = (id: string) =>
  adminFetch<void>(`/api/admin/matches/${encodeURIComponent(id)}`, { method: "DELETE" });

/* Account management (main admin only) */

export const fetchUsers = () => adminFetch<AdminUser[]>("/api/admin/users");

export const createSportAdmin = (sport: string, username: string, password: string) =>
  adminFetch<AdminUser>("/api/admin/users", {
    method: "POST",
    body: JSON.stringify({ username, password, role: "coordinator", eventSlugs: [sport] }),
  });

export const updateUser = (
  id: number,
  patch: { username?: string; password?: string; isActive?: boolean },
) =>
  adminFetch<AdminUser>(`/api/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

export const deleteUser = (id: number) =>
  adminFetch<void>(`/api/admin/users/${id}`, { method: "DELETE" });
