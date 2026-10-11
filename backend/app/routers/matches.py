"""Live scores. Admins manage all matches; coordinators only assigned events."""
import re
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Body, Depends, HTTPException
from pymongo.database import Database

from app.database import delete_record, find_records, get_db, get_record, write_record
from app.models import Record
from app.schemas import MatchIn, ScoreDelta
from app.security import ensure_event_access, get_current_user
from app.services.fest import events_map, match_out

router = APIRouter(prefix="/api/admin/matches", tags=["live scores"])
_NUM = re.compile(r"-?\d+")


def _auto_winner(match: Record) -> str | None:
    if not (re.fullmatch(r"-?\d+", match.get("home_score", "") or "") and
            re.fullmatch(r"-?\d+", match.get("away_score", "") or "")):
        return None
    home, away = int(match.home_score), int(match.away_score)
    return "home" if home > away else "away" if away > home else "draw"


def _sync_sets(match: Record) -> None:
    if match.get("participants") and match.status != "upcoming" and any(not p.get("score") for p in match.participants):
        match.participants = [{**p, "score": p.get("score") or "0"} for p in match.participants]
    if match.get("match_format") and not match.get("sets") and match.status != "upcoming":
        match.sets = [{"home": "0", "away": "0"}]
    if not match.get("sets"):
        return
    home_sets = away_sets = 0
    for score in match.sets:
        home, away = score.get("home", ""), score.get("away", "")
        if _NUM.fullmatch(home) and _NUM.fullmatch(away) and home != away:
            if int(home) > int(away):
                home_sets += 1
            elif int(away) > int(home):
                away_sets += 1
    if match.status == "live":
        last = match.sets[-1]
        home, away = last.get("home", ""), last.get("away", "")
        if _NUM.fullmatch(home) and _NUM.fullmatch(away) and home != away:
            if int(home) > int(away):
                home_sets -= 1
            else:
                away_sets -= 1
    match.home_score, match.away_score = str(home_sets), str(away_sets)


def _apply_status_rules(match: Record, previous_status: str | None) -> None:
    if match.status == "final":
        if previous_status != "final" or match.get("finished_at") is None:
            match.finished_at = datetime.utcnow()
        if match.get("winner") is None:
            match.winner = _auto_winner(match)
    else:
        match.finished_at = None
        match.winner = None
    if match.status == "live" and not match.get("home_score") and not match.get("away_score"):
        match.home_score = match.away_score = "0"


def _get(db: Database, match_id: str) -> Record:
    match = get_record(db, "matches", match_id)
    if match is None:
        raise HTTPException(404, "Match not found")
    return match


@router.get("", summary="Matches the logged-in user can manage")
def list_my_matches(db: Database = Depends(get_db), user: Record = Depends(get_current_user)):
    query = {} if user.role == "admin" else {"event_slug": {"$in": user.get("event_slugs") or []}}
    rows = find_records(db, "matches", query, sort=[("sort_order", 1), ("created_at", -1)])
    events = events_map(db)
    return [match_out(row, events) for row in rows]


@router.post("", status_code=201)
def create_match(body: MatchIn, db: Database = Depends(get_db), user: Record = Depends(get_current_user)):
    ensure_event_access(user, body.event_slug)
    if get_record(db, "events", body.event_slug) is None:
        raise HTTPException(404, f"Unknown event '{body.event_slug}'")
    if get_record(db, "matches", body.id) is not None:
        raise HTTPException(409, f"A match with id '{body.id}' already exists")
    now = datetime.utcnow()
    value = body.model_dump()
    value.update(created_at=now, updated_at=now, finished_at=None)
    match = Record(value)
    _sync_sets(match)
    _apply_status_rules(match, None)
    if body.winner and body.status == "final":
        match.winner = body.winner
    write_record(db, "matches", match)
    return match_out(match, events_map(db))


@router.patch("/{match_id}", summary="Update any match field (partial, camelCase or snake_case)")
def update_match(
    match_id: str,
    body: dict[str, Any] = Body(...),
    db: Database = Depends(get_db),
    user: Record = Depends(get_current_user),
):
    match = _get(db, match_id)
    ensure_event_access(user, match.event_slug)
    previous = match.status
    old_scores = (match.get("home_score", ""), match.get("away_score", ""))
    explicit_winner = body.get("winner") if "winner" in body else body.get("winner")
    data = MatchIn.model_validate({**dict(match), **body}).model_dump()
    data["id"] = match.id
    if data["event_slug"] != match.event_slug:
        ensure_event_access(user, data["event_slug"])
        if get_record(db, "events", data["event_slug"]) is None:
            raise HTTPException(404, f"Unknown event '{data['event_slug']}'")
    updated = Record(data)
    updated.created_at = match.get("created_at") or datetime.utcnow()
    updated.updated_at = datetime.utcnow()
    updated.finished_at = match.get("finished_at")
    for key in ("home_score", "away_score"):
        updated.setdefault(key, "")
    _sync_sets(updated)
    if updated.status == "final":
        if previous != "final" or updated.get("finished_at") is None:
            updated.finished_at = datetime.utcnow()
        if explicit_winner:
            updated.winner = explicit_winner
        elif previous != "final" or (updated.home_score, updated.away_score) != old_scores or updated.get("winner") is None:
            updated.winner = _auto_winner(updated) or (updated.get("winner") if previous == "final" else None)
    else:
        _apply_status_rules(updated, previous)
    write_record(db, "matches", updated)
    return match_out(updated, events_map(db))


@router.post("/{match_id}/score", summary="Add/subtract points: {side: 'home'|'away', delta: 1}")
def bump_score(
    match_id: str,
    body: ScoreDelta,
    db: Database = Depends(get_db),
    user: Record = Depends(get_current_user),
):
    match = _get(db, match_id)
    ensure_event_access(user, match.event_slug)
    if match.get("match_format") and not match.get("sets"):
        match.sets = [{"home": "0", "away": "0"}]
    if match.get("participants"):
        if body.index is None or body.index >= len(match.participants):
            raise HTTPException(400, "Pick which team's score to change")
        participants = [dict(p) for p in match.participants]
        raw = participants[body.index].get("score") or "0"
        if not _NUM.fullmatch(raw):
            raise HTTPException(400, "This score isn't a plain number; edit it directly instead")
        participants[body.index]["score"] = str(max(0, int(raw) + body.delta))
        match.participants = participants
    elif match.get("sets"):
        sets = [dict(score) for score in match.sets]
        current = sets[-1]
        raw = current.get(body.side) or "0"
        if not _NUM.fullmatch(raw):
            raise HTTPException(400, "This set's score isn't a plain number; edit it directly instead")
        current[body.side] = str(max(0, int(raw) + body.delta))
        other = "away" if body.side == "home" else "home"
        current[other] = current.get(other) or "0"
        match.sets = sets
    else:
        attr = f"{body.side}_score"
        raw = match.get(attr) or "0"
        if not _NUM.fullmatch(raw):
            raise HTTPException(400, "This score isn't a plain number; edit it directly instead")
        match[attr] = str(max(0, int(raw) + body.delta))
    if match.status == "upcoming":
        match.status = "live"
        if not match.get("participants") and not match.get("sets"):
            other_attr = "away_score" if body.side == "home" else "home_score"
            if not match.get(other_attr):
                match[other_attr] = "0"
    _sync_sets(match)
    match.updated_at = datetime.utcnow()
    write_record(db, "matches", match)
    return match_out(match, events_map(db))


@router.delete("/{match_id}", status_code=204)
def delete_match(match_id: str, db: Database = Depends(get_db), user: Record = Depends(get_current_user)):
    match = _get(db, match_id)
    ensure_event_access(user, match.event_slug)
    delete_record(db, "matches", match_id)
    return None
