"""
Live scores. Admins can manage every match; coordinators only matches of the
events assigned to them.
"""
import re
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException
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


@router.post("", status_code=201)
def create_match(body: MatchIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    ensure_event_access(user, body.event_slug)
    if db.get(Event, body.event_slug) is None:
        raise HTTPException(404, f"Unknown event '{body.event_slug}'")
    if db.get(Match, body.id):
        raise HTTPException(409, f"A match with id '{body.id}' already exists")
    m = Match(**body.model_dump())
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
    attr = f"{body.side}_score"
    raw = getattr(m, attr) or "0"
    if not re.fullmatch(r"-?\d+", raw):
        raise HTTPException(400, "This score isn't a plain number; edit it directly instead")
    setattr(m, attr, str(max(0, int(raw) + body.delta)))
    if m.status == "upcoming":
        m.status = "live"
        other = "away_score" if body.side == "home" else "home_score"
        if not getattr(m, other):
            setattr(m, other, "0")
    db.commit()
    return match_out(m, events_map(db))


@router.delete("/{match_id}", status_code=204)
def delete_match(match_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    m = _get(db, match_id)
    ensure_event_access(user, m.event_slug)
    db.delete(m)
    db.commit()
