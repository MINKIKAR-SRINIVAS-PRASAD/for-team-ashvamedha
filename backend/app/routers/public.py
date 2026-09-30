"""Public, read-only endpoints. No login needed. Shapes match frontend data/*.ts."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Event, GalleryItem, Match, ScheduleDay, ScheduleSlot, Sponsor
from app.services import fest

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok"}


@router.get("/public/bundle", summary="Everything the website renders, in one call")
def public_bundle(db: Session = Depends(get_db)):
    return fest.bundle(db)


@router.get("/events")
def events(db: Session = Depends(get_db)):
    return [fest.event_out(e) for e in fest.list_events(db)]


@router.get("/events/{slug}")
def event_detail(slug: str, db: Session = Depends(get_db)):
    e = db.get(Event, slug)
    if e is None:
        raise HTTPException(404, "Event not found")
    return fest.event_out(e)


@router.get("/teams")
def teams(db: Session = Depends(get_db)):
    return fest.list_teams(db)


@router.get("/schedule")
def schedule(day: Optional[int] = Query(None, ge=1, le=10), db: Session = Depends(get_db)):
    q = select(ScheduleSlot).order_by(ScheduleSlot.day, ScheduleSlot.time)
    if day:
        q = q.where(ScheduleSlot.day == day)
    return {
        "days": [fest.day_out(d) for d in db.scalars(select(ScheduleDay).order_by(ScheduleDay.day))],
        "slots": [fest.slot_out(s) for s in db.scalars(q)],
    }


@router.get("/leaderboard")
def leaderboard(db: Session = Depends(get_db)):
    rankings = fest.compute_rankings(db)
    return {"rankings": rankings, "podium": rankings[:3]}


@router.get("/matches/live", summary="Live ticker: live, then upcoming, then just-finished")
def matches_live(db: Session = Depends(get_db)):
    return fest.live_matches(db, fest.events_map(db))


@router.get("/matches")
def matches(
    status: Optional[str] = Query(None, pattern="^(upcoming|live|final)$"),
    event: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = select(Match).order_by(Match.sort_order, Match.created_at.desc())
    if status:
        q = q.where(Match.status == status)
    if event:
        q = q.where(Match.event_slug == event)
    ev = fest.events_map(db)
    return [fest.match_out(m, ev) for m in db.scalars(q)]


@router.get("/results/recent")
def results_recent(limit: int = Query(8, ge=1, le=50), db: Session = Depends(get_db)):
    return fest.recent_results(db, fest.events_map(db), limit)


@router.get("/gallery")
def gallery(db: Session = Depends(get_db)):
    return [fest.gallery_out(g) for g in db.scalars(select(GalleryItem).order_by(GalleryItem.sort_order))]


@router.get("/sponsors")
def sponsors(db: Session = Depends(get_db)):
    return [fest.sponsor_out(s) for s in db.scalars(select(Sponsor).order_by(Sponsor.sort_order))]


@router.get("/content/{key}")
def content(key: str, db: Session = Depends(get_db)):
    if key not in fest.CONTENT_DEFAULTS:
        raise HTTPException(404, f"Unknown content key. Valid keys: {', '.join(fest.CONTENT_DEFAULTS)}")
    return fest.get_content(db, key)
