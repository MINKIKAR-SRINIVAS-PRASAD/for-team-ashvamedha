"""MongoDB queries and serializers; response shapes stay compatible with the frontend."""
import re
from datetime import datetime, timedelta
from typing import Any

from pymongo.database import Database

from app.config import settings
from app.database import find_records, get_record, write_record
from app.models import Record

CONTENT_DEFAULTS: dict[str, Any] = {
    "featuredSlugs": [],
    "championSpotlight": {"reigning": "", "reigningSport": "", "streak": "", "contenders": []},
    "eventChampions": [],
    "podium2025": [],
    "previousEditions": [],
}
FINAL_VISIBLE_IN_TICKER = timedelta(hours=2)


def utcnow() -> datetime:
    return datetime.utcnow()


def iso(dt) -> str | None:
    if not dt:
        return None
    if isinstance(dt, str):
        try:
            dt = datetime.fromisoformat(dt.replace("Z", "+00:00"))
        except ValueError:
            return dt
    return dt.isoformat(timespec="seconds").replace("+00:00", "") + "Z"


def get_content(db: Database, key: str) -> Any:
    row = get_record(db, "content_blocks", key)
    return row.value if row is not None else CONTENT_DEFAULTS.get(key)


def set_content(db: Database, key: str, value: Any) -> None:
    write_record(db, "content_blocks", {"key": key, "value": value, "updated_at": utcnow()})


def event_out(e: Record) -> dict:
    return {
        "slug": e.slug, "name": e.name, "arena": e.get("arena", ""),
        "category": e.get("category", ""), "tagline": e.get("tagline", ""),
        "description": e.get("description", ""), "date": e.get("date", ""),
        "day": e.get("day", 1), "time": e.get("time", ""), "venue": e.get("venue", ""),
        "teamSize": e.get("team_size", ""), "minTeamSize": e.get("min_team_size", 1),
        "maxTeamSize": e.get("max_team_size", 1), "registration": e.get("registration", "open"),
        "entryFee": e.get("entry_fee", ""), "prizePool": e.get("prize_pool", ""),
        "format": e.get("format", ""), "accent": e.get("accent", "crimson"),
        "image": e.get("image"), "glyph": e.get("glyph", e.slug), "sortOrder": e.get("sort_order", 0),
    }


def team_out(t: Record, rank: int | None = None) -> dict:
    return {
        "slug": t.slug, "name": t.name, "institution": t.get("institution", ""),
        "department": t.get("department", ""), "captain": t.get("captain", ""),
        "sport": t.get("sport", ""), "rank": rank, "accent": t.get("accent", "crimson"),
        "crest": list(t.get("crest") or ["#e11d2e", "#4a0710"]),
        "motto": t.get("motto", ""), "sortOrder": t.get("sort_order", 0),
    }


def standing_out(s: Record) -> dict:
    return {"teamSlug": s.team_slug, "teamName": s.team_name, "matches": s.matches,
            "wins": s.wins, "losses": s.losses, "points": s.points, "winPct": s.get("win_pct")}


def day_out(d: Record) -> dict:
    return {"day": d.day, "label": d.label, "date": d.date,
            "headline": d.get("headline", ""), "note": d.get("note", "")}


def slot_out(s: Record) -> dict:
    out = {"id": s.id, "day": s.day, "time": s.time, "title": s.title,
           "venue": s.get("venue", ""), "stage": s.get("stage", ""),
           "status": s.get("status", "scheduled"), "duration": s.get("duration", "")}
    if s.get("event_slug"):
        out["eventSlug"] = s.event_slug
    return out


def _score(value: Any) -> int | str:
    value = str(value or "").strip()
    if value == "":
        return "—"
    return int(value) if re.fullmatch(r"-?\d+", value) else value


def match_out(m: Record, events: dict[str, Record]) -> dict:
    ev = events.get(m.event_slug)
    out = {
        "id": m.id, "sport": ev.name if ev else m.event_slug, "eventSlug": m.event_slug,
        "home": {"name": m.home_name, "score": _score(m.get("home_score"))},
        "away": {"name": m.away_name, "score": _score(m.get("away_score"))},
        "status": m.status, "detail": m.get("detail", ""),
        "accent": ev.get("accent", "crimson") if ev else "crimson",
        "homeTeamSlug": m.get("home_team_slug"), "awayTeamSlug": m.get("away_team_slug"),
        "homeScoreRaw": m.get("home_score", ""), "awayScoreRaw": m.get("away_score", ""),
        "stage": m.get("stage", ""), "winner": m.get("winner"),
        "resultSummary": m.get("result_summary", ""),
        "countsForStandings": m.get("counts_for_standings", True),
        "sortOrder": m.get("sort_order", 0), "updatedAt": iso(m.get("updated_at")),
        "finishedAt": iso(m.get("finished_at")),
    }
    if m.get("clock"):
        out["clock"] = m.clock
    if m.get("match_format"):
        out["format"] = m.match_format
    if m.get("sets"):
        out["sets"] = [{"home": x.get("home", ""), "away": x.get("away", "")} for x in m.sets]
    if m.get("participants"):
        out["participants"] = [{"name": p.get("name", ""), "score": _score(p.get("score", ""))} for p in m.participants]
    return out


def recent_result_out(m: Record, events: dict[str, Record]) -> dict:
    ev = events.get(m.event_slug)
    if m.get("winner") == "away":
        winner, loser, ws, ls = m.away_name, m.home_name, m.away_score, m.home_score
    else:
        winner, loser, ws, ls = m.home_name, m.away_name, m.home_score, m.away_score
    score = m.get("result_summary") or (f"{ws} – {ls}" if ws or ls else "")
    if not m.get("result_summary") and m.get("sets"):
        w = "away" if m.get("winner") == "away" else "home"
        l = "home" if w == "away" else "away"
        score += " (" + ", ".join(f"{x.get(w, '')}-{x.get(l, '')}" for x in m.sets) + ")"
    return {"sport": ev.name if ev else m.event_slug, "winner": winner, "loser": loser,
            "score": score, "stage": m.get("stage") or m.get("detail", ""),
            "draw": m.get("winner") == "draw"}


def gallery_out(g: Record) -> dict:
    return {"id": g.id, "title": g.title, "category": g.category, "image": g.get("image"),
            "caption": g.get("caption", ""), "span": g.get("span", "square"),
            "accent": g.get("accent", "crimson"), "sortOrder": g.get("sort_order", 0)}


def sponsor_out(s: Record) -> dict:
    out = {"id": s.id, "name": s.name, "logo": s.get("logo"), "wordmark": s.get("wordmark", ""),
           "tier": s.get("tier", "partner"), "sortOrder": s.get("sort_order", 0)}
    if s.get("note"):
        out["note"] = s.note
    return out


def registration_out(r: Record, events: dict[str, Record] | None = None) -> dict:
    ev = (events or {}).get(r.event_slug)
    return {"id": r.id, "code": r.code, "eventSlug": r.event_slug,
            "eventName": ev.name if ev else r.event_slug, "teamName": r.get("team_name"),
            "captainName": r.captain_name, "email": r.email, "phone": r.phone,
            "institution": r.institution, "department": r.get("department", ""),
            "rollNumber": r.get("roll_number", ""), "members": r.get("members") or [],
            "participantCount": r.get("participant_count", 1), "paymentReference": r.get("payment_reference", ""),
            "paymentStatus": r.get("payment_status", "pending"), "status": r.get("status", "submitted"),
            "adminNotes": r.get("admin_notes", ""), "createdAt": iso(r.get("created_at")),
            "updatedAt": iso(r.get("updated_at"))}


def user_out(u: Record) -> dict:
    return {"id": u.id, "username": u.username, "role": u.role,
            "eventSlugs": u.get("event_slugs") or [], "isActive": u.get("is_active", True),
            "createdAt": iso(u.get("created_at"))}


def events_map(db: Database) -> dict[str, Record]:
    return {e.slug: e for e in find_records(db, "events")}


def list_events(db: Database) -> list[Record]:
    return find_records(db, "events", sort=[("sort_order", 1), ("name", 1)])


def _norm(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").strip().lower())


def compute_rankings(db: Database) -> list[dict]:
    teams = {t.slug: t for t in find_records(db, "teams")}
    rows: dict[str, dict] = {}

    def row_for(slug: str, fallback_name: str) -> dict:
        if slug not in rows:
            name = teams[slug].name if slug in teams else fallback_name
            rows[slug] = {"team": name, "teamSlug": slug, "matches": 0, "wins": 0,
                          "losses": 0, "points": 0, "winPct": None}
        return rows[slug]

    for s in find_records(db, "standings"):
        row_for(s.team_slug, s.team_name).update(matches=s.get("matches", 0), wins=s.get("wins", 0),
                                                  losses=s.get("losses", 0), points=s.get("points", 0),
                                                  winPct=s.get("win_pct"))
    lookup: dict[str, str] = {}
    # Leaderboard rows first, so a finished match adds to the row with the same team name.
    for s in find_records(db, "standings"):
        for key in (s.team_slug, s.get("team_name", "")):
            if key and _norm(key) not in {"-", "tbd", "tba", "bye"}:
                lookup.setdefault(_norm(key), s.team_slug)
    for t in teams.values():
        for key in (t.slug, t.name, t.get("department", "")):
            if key:
                lookup.setdefault(_norm(key), t.slug)

    def side_key(slug: str | None, name: str) -> str | None:
        if slug:
            return slug
        n = _norm(name)
        if not n or n in {"tbd", "tba", "-", "bye"}:
            return None
        return lookup.get(n) or n

    finals = find_records(db, "matches", {"status": "final", "winner": {"$ne": None}, "counts_for_standings": True})
    for m in finals:
        if m.get("participants"):
            continue
        hk, ak = side_key(m.get("home_team_slug"), m.home_name), side_key(m.get("away_team_slug"), m.away_name)
        if not hk or not ak or hk == ak:
            continue
        home, away = row_for(hk, m.home_name.strip()), row_for(ak, m.away_name.strip())
        home["matches"] += 1; away["matches"] += 1
        if m.winner == "draw":
            home["points"] += settings.points_draw; away["points"] += settings.points_draw
        else:
            win, lose = (home, away) if m.winner == "home" else (away, home)
            win["wins"] += 1; win["points"] += settings.points_win
            lose["losses"] += 1; lose["points"] += settings.points_loss

    def pct(row: dict) -> float:
        if row["winPct"] is not None:
            return row["winPct"]
        return row["wins"] / row["matches"] if row["matches"] else 0.0

    ordered = sorted(rows.values(), key=lambda row: (-row["points"], -row["wins"], -pct(row), row["team"]))
    result = []
    for index, row in enumerate(ordered, start=1):
        item = {"rank": index, **{k: v for k, v in row.items() if k != "winPct"}}
        if row["winPct"] is not None:
            item["winPct"] = row["winPct"]
        result.append(item)
    return result


def rank_map(rankings: list[dict]) -> dict[str, int]:
    return {r["teamSlug"]: r["rank"] for r in rankings}


def list_teams(db: Database, rankings: list[dict] | None = None) -> list[dict]:
    ranks = rank_map(rankings if rankings is not None else compute_rankings(db))
    teams = find_records(db, "teams", sort=[("sort_order", 1), ("name", 1)])
    return [team_out(team, ranks.get(team.slug)) for team in teams]


def live_matches(db: Database, events: dict[str, Record]) -> list[dict]:
    live = find_records(db, "matches", {"status": "live"}, sort=[("sort_order", 1), ("updated_at", -1)])
    upcoming = find_records(db, "matches", {"status": "upcoming"}, sort=[("sort_order", 1), ("created_at", 1)], limit=6)
    cutoff = utcnow() - FINAL_VISIBLE_IN_TICKER
    finished = find_records(db, "matches", {"status": "final", "finished_at": {"$ne": None, "$gte": cutoff}},
                            sort=[("finished_at", -1)], limit=3)
    return [match_out(m, events) for m in (live + upcoming + finished)[:9]]


def recent_results(db: Database, events: dict[str, Record], limit: int = 8) -> list[dict]:
    rows = find_records(db, "matches", {"status": "final", "winner": {"$ne": None}},
                        sort=[("finished_at", -1), ("updated_at", -1)], limit=limit)
    return [recent_result_out(m, events) for m in rows]


def bundle(db: Database) -> dict:
    events = list_events(db)
    ev_map = {e.slug: e for e in events}
    rankings = compute_rankings(db)
    featured = [s for s in (get_content(db, "featuredSlugs") or []) if s in ev_map]
    return {
        "events": [event_out(e) for e in events], "featuredSlugs": featured,
        "teams": list_teams(db, rankings),
        "days": [day_out(d) for d in find_records(db, "schedule_days", sort=[("day", 1)])],
        "schedule": [slot_out(s) for s in find_records(db, "schedule_slots", sort=[("day", 1), ("time", 1)])],
        "rankings": rankings, "podium": rankings[:3],
        "championSpotlight": get_content(db, "championSpotlight"),
        "liveMatches": live_matches(db, ev_map), "recentResults": recent_results(db, ev_map),
        "eventChampions": get_content(db, "eventChampions"), "podium2025": get_content(db, "podium2025"),
        "previousEditions": get_content(db, "previousEditions"),
        "gallery": [gallery_out(g) for g in find_records(db, "gallery_items", sort=[("sort_order", 1), ("id", 1)])],
        "sponsors": [sponsor_out(s) for s in find_records(db, "sponsors", sort=[("sort_order", 1), ("id", 1)])],
        "payment": {"upiId": settings.upi_id or None, "payeeName": settings.upi_payee_name or None},
        "generatedAt": iso(utcnow()),
    }
