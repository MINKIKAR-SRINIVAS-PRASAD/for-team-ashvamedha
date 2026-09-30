"""
Everything that turns database rows into the exact JSON shapes the frontend
already uses in data/*.ts.
"""
import re
from datetime import timedelta
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.models import (
    ContentBlock,
    Event,
    GalleryItem,
    Match,
    Registration,
    ScheduleDay,
    ScheduleSlot,
    Sponsor,
    Standing,
    Team,
    User,
    utcnow,
)

# Content blocks that are plain JSON (edited via /api/admin/content/{key})
CONTENT_DEFAULTS: dict[str, Any] = {
    "featuredSlugs": [],
    "championSpotlight": {"reigning": "", "reigningSport": "", "streak": "", "contenders": []},
    "eventChampions": [],
    "podium2025": [],
    "previousEditions": [],
}

# Finished matches stay in the live ticker this long before dropping to "recent results".
FINAL_VISIBLE_IN_TICKER = timedelta(hours=2)


def iso(dt) -> str | None:
    return dt.isoformat(timespec="seconds") + "Z" if dt else None


# ── Content blocks ──────────────────────────────────────────────────────────


def get_content(db: Session, key: str) -> Any:
    row = db.get(ContentBlock, key)
    return row.value if row is not None else CONTENT_DEFAULTS.get(key)


def set_content(db: Session, key: str, value: Any) -> None:
    row = db.get(ContentBlock, key)
    if row is None:
        db.add(ContentBlock(key=key, value=value))
    else:
        row.value = value


# ── Serializers ─────────────────────────────────────────────────────────────


def event_out(e: Event) -> dict:
    return {
        "slug": e.slug,
        "name": e.name,
        "arena": e.arena,
        "category": e.category,
        "tagline": e.tagline,
        "description": e.description,
        "date": e.date,
        "day": e.day,
        "time": e.time,
        "venue": e.venue,
        "teamSize": e.team_size,
        "minTeamSize": e.min_team_size,
        "maxTeamSize": e.max_team_size,
        "registration": e.registration,
        "entryFee": e.entry_fee,
        "prizePool": e.prize_pool,
        "format": e.format,
        "accent": e.accent,
        "image": e.image,
        "glyph": e.glyph,
        "sortOrder": e.sort_order,
    }


def team_out(t: Team, rank: int | None = None) -> dict:
    return {
        "slug": t.slug,
        "name": t.name,
        "institution": t.institution,
        "department": t.department,
        "captain": t.captain,
        "sport": t.sport,
        "rank": rank,
        "accent": t.accent,
        "crest": list(t.crest or ["#e11d2e", "#4a0710"]),
        "motto": t.motto,
        "sortOrder": t.sort_order,
    }


def standing_out(s: Standing) -> dict:
    return {
        "teamSlug": s.team_slug,
        "teamName": s.team_name,
        "matches": s.matches,
        "wins": s.wins,
        "losses": s.losses,
        "points": s.points,
        "winPct": s.win_pct,
    }


def day_out(d: ScheduleDay) -> dict:
    return {"day": d.day, "label": d.label, "date": d.date, "headline": d.headline, "note": d.note}


def slot_out(s: ScheduleSlot) -> dict:
    out = {
        "id": s.id,
        "day": s.day,
        "time": s.time,
        "title": s.title,
        "venue": s.venue,
        "stage": s.stage,
        "status": s.status,
        "duration": s.duration,
    }
    if s.event_slug:
        out["eventSlug"] = s.event_slug
    return out


def _score(v: str) -> int | str:
    v = (v or "").strip()
    if v == "":
        return "—"
    return int(v) if re.fullmatch(r"-?\d+", v) else v


def match_out(m: Match, events: dict[str, Event]) -> dict:
    ev = events.get(m.event_slug)
    out = {
        "id": m.id,
        "sport": ev.name if ev else m.event_slug,
        "eventSlug": m.event_slug,
        "home": {"name": m.home_name, "score": _score(m.home_score)},
        "away": {"name": m.away_name, "score": _score(m.away_score)},
        "status": m.status,
        "detail": m.detail,
        "accent": ev.accent if ev else "crimson",
        # extras (ignored by the public site, used by the admin panel)
        "homeTeamSlug": m.home_team_slug,
        "awayTeamSlug": m.away_team_slug,
        "homeScoreRaw": m.home_score,
        "awayScoreRaw": m.away_score,
        "stage": m.stage,
        "winner": m.winner,
        "resultSummary": m.result_summary,
        "countsForStandings": m.counts_for_standings,
        "sortOrder": m.sort_order,
        "updatedAt": iso(m.updated_at),
        "finishedAt": iso(m.finished_at),
    }
    if m.clock:
        out["clock"] = m.clock
    return out


def recent_result_out(m: Match, events: dict[str, Event]) -> dict:
    ev = events.get(m.event_slug)
    if m.winner == "away":
        winner, loser, ws, ls = m.away_name, m.home_name, m.away_score, m.home_score
    else:
        winner, loser, ws, ls = m.home_name, m.away_name, m.home_score, m.away_score
    score = m.result_summary or (f"{ws} – {ls}" if ws or ls else "")
    return {
        "sport": ev.name if ev else m.event_slug,
        "winner": winner,
        "loser": loser,
        "score": score,
        "stage": m.stage or m.detail,
        "draw": m.winner == "draw",
    }


def gallery_out(g: GalleryItem) -> dict:
    return {
        "id": g.id,
        "title": g.title,
        "category": g.category,
        "image": g.image,
        "caption": g.caption,
        "span": g.span,
        "accent": g.accent,
        "sortOrder": g.sort_order,
    }


def sponsor_out(s: Sponsor) -> dict:
    out = {
        "id": s.id,
        "name": s.name,
        "logo": s.logo,
        "wordmark": s.wordmark,
        "tier": s.tier,
        "sortOrder": s.sort_order,
    }
    if s.note:
        out["note"] = s.note
    return out


def registration_out(r: Registration, events: dict[str, Event] | None = None) -> dict:
    ev = (events or {}).get(r.event_slug)
    return {
        "id": r.id,
        "code": r.code,
        "eventSlug": r.event_slug,
        "eventName": ev.name if ev else r.event_slug,
        "teamName": r.team_name,
        "captainName": r.captain_name,
        "email": r.email,
        "phone": r.phone,
        "institution": r.institution,
        "department": r.department,
        "rollNumber": r.roll_number,
        "members": r.members or [],
        "participantCount": r.participant_count,
        "paymentReference": r.payment_reference,
        "paymentStatus": r.payment_status,
        "status": r.status,
        "adminNotes": r.admin_notes,
        "createdAt": iso(r.created_at),
        "updatedAt": iso(r.updated_at),
    }


def user_out(u: User) -> dict:
    return {
        "id": u.id,
        "username": u.username,
        "role": u.role,
        "eventSlugs": u.event_slugs or [],
        "isActive": u.is_active,
        "createdAt": iso(u.created_at),
    }


# ── Queries ─────────────────────────────────────────────────────────────────


def events_map(db: Session) -> dict[str, Event]:
    return {e.slug: e for e in db.scalars(select(Event))}


def list_events(db: Session) -> list[Event]:
    return list(db.scalars(select(Event).order_by(Event.sort_order, Event.name)))


def compute_rankings(db: Session) -> list[dict]:
    """
    Standings = manual base values (standings table) + every finished match
    that has a winner, both team slugs, and countsForStandings=true.
    """
    teams = {t.slug: t for t in db.scalars(select(Team))}
    rows: dict[str, dict] = {}

    def row_for(slug: str, fallback_name: str) -> dict:
        if slug not in rows:
            name = teams[slug].name if slug in teams else fallback_name
            rows[slug] = {"team": name, "teamSlug": slug, "matches": 0, "wins": 0,
                          "losses": 0, "points": 0, "winPct": None}
        return rows[slug]

    for s in db.scalars(select(Standing)):
        r = row_for(s.team_slug, s.team_name)
        r.update(matches=s.matches, wins=s.wins, losses=s.losses, points=s.points, winPct=s.win_pct)

    finals = db.scalars(
        select(Match).where(
            Match.status == "final",
            Match.winner.is_not(None),
            Match.counts_for_standings.is_(True),
            Match.home_team_slug.is_not(None),
            Match.away_team_slug.is_not(None),
        )
    )
    for m in finals:
        home = row_for(m.home_team_slug, m.home_name)
        away = row_for(m.away_team_slug, m.away_name)
        home["matches"] += 1
        away["matches"] += 1
        if m.winner == "draw":
            home["points"] += settings.points_draw
            away["points"] += settings.points_draw
        else:
            win, lose = (home, away) if m.winner == "home" else (away, home)
            win["wins"] += 1
            win["points"] += settings.points_win
            lose["losses"] += 1
            lose["points"] += settings.points_loss

    def pct(r: dict) -> float:
        if r["winPct"] is not None:
            return r["winPct"]
        return r["wins"] / r["matches"] if r["matches"] else 0.0

    ordered = sorted(rows.values(), key=lambda r: (-r["points"], -r["wins"], -pct(r), r["team"]))
    result = []
    for i, r in enumerate(ordered, start=1):
        item = {"rank": i, **{k: v for k, v in r.items() if k != "winPct"}}
        if r["winPct"] is not None:
            item["winPct"] = r["winPct"]
        result.append(item)
    return result


def rank_map(rankings: list[dict]) -> dict[str, int]:
    return {r["teamSlug"]: r["rank"] for r in rankings}


def list_teams(db: Session, rankings: list[dict] | None = None) -> list[dict]:
    ranks = rank_map(rankings if rankings is not None else compute_rankings(db))
    teams = db.scalars(select(Team).order_by(Team.sort_order, Team.name))
    return [team_out(t, ranks.get(t.slug)) for t in teams]


def live_matches(db: Session, events: dict[str, Event]) -> list[dict]:
    """What the live ticker shows: live -> upcoming -> just-finished."""
    live = db.scalars(select(Match).where(Match.status == "live").order_by(Match.sort_order, Match.updated_at.desc()))
    upcoming = db.scalars(
        select(Match).where(Match.status == "upcoming").order_by(Match.sort_order, Match.created_at)
    )
    cutoff = utcnow() - FINAL_VISIBLE_IN_TICKER
    finished = db.scalars(
        select(Match)
        .where(Match.status == "final", Match.finished_at.is_not(None), Match.finished_at >= cutoff)
        .order_by(Match.finished_at.desc())
    )
    items = list(live) + list(upcoming)[:6] + list(finished)[:3]
    return [match_out(m, events) for m in items[:9]]


def recent_results(db: Session, events: dict[str, Event], limit: int = 8) -> list[dict]:
    q = (
        select(Match)
        .where(Match.status == "final", Match.winner.is_not(None))
        .order_by(Match.finished_at.desc().nulls_last(), Match.updated_at.desc())
        .limit(limit)
    )
    return [recent_result_out(m, events) for m in db.scalars(q)]


def bundle(db: Session) -> dict:
    """Every piece of data the site renders, in one response."""
    events = list_events(db)
    ev_map = {e.slug: e for e in events}
    rankings = compute_rankings(db)
    featured = [s for s in (get_content(db, "featuredSlugs") or []) if s in ev_map]
    return {
        "events": [event_out(e) for e in events],
        "featuredSlugs": featured,
        "teams": list_teams(db, rankings),
        "days": [day_out(d) for d in db.scalars(select(ScheduleDay).order_by(ScheduleDay.day))],
        "schedule": [
            slot_out(s) for s in db.scalars(select(ScheduleSlot).order_by(ScheduleSlot.day, ScheduleSlot.time))
        ],
        "rankings": rankings,
        "podium": rankings[:3],
        "championSpotlight": get_content(db, "championSpotlight"),
        "liveMatches": live_matches(db, ev_map),
        "recentResults": recent_results(db, ev_map),
        "eventChampions": get_content(db, "eventChampions"),
        "podium2025": get_content(db, "podium2025"),
        "previousEditions": get_content(db, "previousEditions"),
        "gallery": [
            gallery_out(g) for g in db.scalars(select(GalleryItem).order_by(GalleryItem.sort_order, GalleryItem.id))
        ],
        "sponsors": [sponsor_out(s) for s in db.scalars(select(Sponsor).order_by(Sponsor.sort_order, Sponsor.id))],
        "payment": {"upiId": settings.upi_id or None, "payeeName": settings.upi_payee_name or None},
        "generatedAt": iso(utcnow()),
    }
