"""
Live scores. Admins can manage every match; coordinators only matches of the
events assigned to them.
"""
import re
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Event, Match, User, utcnow
from app.schemas import MatchIn, ScoreDelta
from app.security import ensure_event_access, get_current_user
from app.services.fest import events_map, match_out

router = APIRouter(prefix="/api/admin/matches", tags=["live scores"])

_COLUMNS = [c.key for c in Match.__table__.columns]


def _auto_winner(m: Match) -> str | None:
    """Pick the winner from numeric scores when the admin didn't set one."""
    if not (re.fullmatch(r"-?\d+", m.home_score or "") and re.fullmatch(r"-?\d+", m.away_score or "")):
        return None
    h, a = int(m.home_score), int(m.away_score)
    return "home" if h > a else "away" if a > h else "draw"


_NUM = re.compile(r"-?\d+")


def _sync_sets(m: Match) -> None:
    """With per-set scores, the match score is the number of sets each side has won."""
    if m.participants and m.status != "upcoming" and any(not p.get("score") for p in m.participants):
        m.participants = [{**p, "score": p.get("score") or "0"} for p in m.participants]
    if m.match_format and not m.sets and m.status != "upcoming":
        m.sets = [{"home": "0", "away": "0"}]
    if not m.sets:
        return
    home = away = 0
    for s in m.sets:
        h, a = s.get("home", ""), s.get("away", "")
        if _NUM.fullmatch(h) and _NUM.fullmatch(a) and h != a:
            if int(h) > int(a):
                home += 1
            elif int(a) > int(h):
                away += 1
    if m.status == "live":
        # The set being played doesn't count until it's over: leave it out while it's still going.
        last = m.sets[-1]
        h, a = last.get("home", ""), last.get("away", "")
        if _NUM.fullmatch(h) and _NUM.fullmatch(a) and h != a:
            if int(h) > int(a):
                home -= 1
            else:
                away -= 1
    m.home_score, m.away_score = str(home), str(away)


def _apply_status_rules(m: Match, previous_status: str | None) -> None:
    if m.status == "final":
        if previous_status != "final" or m.finished_at is None:
            m.finished_at = utcnow()
        if m.winner is None:
            m.winner = _auto_winner(m)
    else:
        m.finished_at = None
        m.winner = None
    if m.status == "live" and (m.home_score == "" and m.away_score == ""):
        m.home_score = m.away_score = "0"


def _get(db: Session, match_id: str) -> Match:
    m = db.get(Match, match_id)
    if m is None:
        raise HTTPException(404, "Match not found")
    return m


@router.get("", summary="Matches the logged-in user can manage")
def list_my_matches(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = select(Match).order_by(Match.sort_order, Match.created_at.desc())
    if user.role != "admin":
        q = q.where(Match.event_slug.in_(user.event_slugs or []))
    ev = events_map(db)
    return [match_out(m, ev) for m in db.scalars(q)]


@router.post("", status_code=201)
def create_match(body: MatchIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    ensure_event_access(user, body.event_slug)
    if db.get(Event, body.event_slug) is None:
        raise HTTPException(404, f"Unknown event '{body.event_slug}'")
    if db.get(Match, body.id):
        raise HTTPException(409, f"A match with id '{body.id}' already exists")
    m = Match(**body.model_dump())
    _sync_sets(m)
    _apply_status_rules(m, None)
    if body.winner and body.status == "final":
        m.winner = body.winner
    db.add(m)
    db.commit()
    return match_out(m, events_map(db))


@router.patch("/{match_id}", summary="Update any match field (partial, camelCase or snake_case)")
def update_match(
    match_id: str,
    body: dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = _get(db, match_id)
    ensure_event_access(user, m.event_slug)
    current = {c: getattr(m, c) for c in _COLUMNS}
    data = MatchIn.model_validate({**current, **body}).model_dump()
    data["id"] = m.id
    if data["event_slug"] != m.event_slug:
        ensure_event_access(user, data["event_slug"])
        if db.get(Event, data["event_slug"]) is None:
            raise HTTPException(404, f"Unknown event '{data['event_slug']}'")
    previous = m.status
    old_scores = (m.home_score, m.away_score)
    explicit_winner = data["winner"] if "winner" in body else None
    for k, v in data.items():
        setattr(m, k, v)
    _sync_sets(m)
    if m.status == "final":
        if previous != "final" or m.finished_at is None:
            m.finished_at = utcnow()
        if explicit_winner:
            m.winner = explicit_winner
        elif previous != "final" or (m.home_score, m.away_score) != old_scores or m.winner is None:
            m.winner = _auto_winner(m) or (m.winner if previous == "final" else None)
    else:
        _apply_status_rules(m, previous)
    db.commit()
    return match_out(m, events_map(db))


@router.post("/{match_id}/score", summary="Add/subtract points: {side: 'home'|'away', delta: 1}")
def bump_score(
    match_id: str,
    body: ScoreDelta,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    m = _get(db, match_id)
    ensure_event_access(user, m.event_slug)
    if m.match_format and not m.sets:
        m.sets = [{"home": "0", "away": "0"}]
    if m.participants:
        if body.index is None or body.index >= len(m.participants):
            raise HTTPException(400, "Pick which team's score to change")
        parts = [dict(p) for p in m.participants]
        raw = parts[body.index].get("score") or "0"
        if not _NUM.fullmatch(raw):
            raise HTTPException(400, "This score isn't a plain number; edit it directly instead")
        parts[body.index]["score"] = str(max(0, int(raw) + body.delta))
        m.participants = parts
    elif m.sets:
        # +/- changes the points of the set being played (the last one).
        sets = [dict(x) for x in m.sets]
        cur = sets[-1]
        raw = cur.get(body.side) or "0"
        if not _NUM.fullmatch(raw):
            raise HTTPException(400, "This set's score isn't a plain number; edit it directly instead")
        cur[body.side] = str(max(0, int(raw) + body.delta))
        other = "away" if body.side == "home" else "home"
        cur[other] = cur.get(other) or "0"
        m.sets = sets
    else:
        attr = f"{body.side}_score"
        raw = getattr(m, attr) or "0"
        if not _NUM.fullmatch(raw):
            raise HTTPException(400, "This score isn't a plain number; edit it directly instead")
        setattr(m, attr, str(max(0, int(raw) + body.delta)))
    if m.status == "upcoming":
        m.status = "live"
        if not m.participants and not m.sets:
            other = "away_score" if body.side == "home" else "home_score"
            if not getattr(m, other):
                setattr(m, other, "0")
    _sync_sets(m)
    db.commit()
    return match_out(m, events_map(db))


@router.delete("/{match_id}", status_code=204)
def delete_match(match_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    m = _get(db, match_id)
    ensure_event_access(user, m.event_slug)
    db.delete(m)
    db.commit()
