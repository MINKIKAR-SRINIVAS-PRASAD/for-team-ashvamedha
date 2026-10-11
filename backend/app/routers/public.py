"""Public, read-only endpoints. Response shapes match frontend data/*.ts."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pymongo.database import Database

from app.database import find_records, get_db, get_record
from app.services import cache, fest

router = APIRouter(prefix="/api", tags=["public"])


@router.get("/health")
def health(db: Database = Depends(get_db)):
    db.command("ping")
    return {"status": "ok", "database": "mongodb"}


@router.get("/public/bundle", summary="Everything the website renders, in one call")
def public_bundle(db: Database = Depends(get_db)):
    return cache.cached(("bundle",), lambda: fest.bundle(db))


@router.get("/events")
def events(db: Database = Depends(get_db)):
    return [fest.event_out(event) for event in fest.list_events(db)]


@router.get("/events/{slug}")
def event_detail(slug: str, db: Database = Depends(get_db)):
    event = get_record(db, "events", slug)
    if event is None:
        raise HTTPException(404, "Event not found")
    return fest.event_out(event)


@router.get("/teams")
def teams(db: Database = Depends(get_db)):
    return fest.list_teams(db)


@router.get("/schedule")
def schedule(day: Optional[int] = Query(None, ge=1, le=10), db: Database = Depends(get_db)):
    query = {"day": day} if day else {}
    return {
        "days": [fest.day_out(row) for row in find_records(db, "schedule_days", sort=[("day", 1)])],
        "slots": [fest.slot_out(row) for row in find_records(db, "schedule_slots", query, sort=[("day", 1), ("time", 1)])],
    }


@router.get("/leaderboard")
def leaderboard(db: Database = Depends(get_db)):
    rankings = fest.compute_rankings(db)
    return {"rankings": rankings, "podium": rankings[:3]}


@router.get("/matches/live", summary="Live ticker: live, then upcoming, then just-finished")
def matches_live(db: Database = Depends(get_db)):
    return cache.cached(("matches_live",), lambda: fest.live_matches(db, fest.events_map(db)))


@router.get("/matches")
def matches(
    status: Optional[str] = Query(None, pattern="^(upcoming|live|final)$"),
    event: Optional[str] = None,
    db: Database = Depends(get_db),
):
    def compute():
        query = {}
        if status:
            query["status"] = status
        if event:
            query["event_slug"] = event
        rows = find_records(db, "matches", query, sort=[("sort_order", 1), ("created_at", -1)])
        ev = fest.events_map(db)
        return [fest.match_out(row, ev) for row in rows]

    return cache.cached(("matches", status, event), compute)


@router.get("/results/recent")
def results_recent(limit: int = Query(8, ge=1, le=50), db: Database = Depends(get_db)):
    return cache.cached(("results_recent", limit), lambda: fest.recent_results(db, fest.events_map(db), limit))


@router.get("/gallery")
def gallery(db: Database = Depends(get_db)):
    return [fest.gallery_out(row) for row in find_records(db, "gallery_items", sort=[("sort_order", 1)])]


@router.get("/sponsors")
def sponsors(db: Database = Depends(get_db)):
    return [fest.sponsor_out(row) for row in find_records(db, "sponsors", sort=[("sort_order", 1)])]


@router.get("/content/{key}")
def content(key: str, db: Database = Depends(get_db)):
    if key not in fest.CONTENT_DEFAULTS:
        raise HTTPException(404, f"Unknown content key. Valid keys: {', '.join(fest.CONTENT_DEFAULTS)}")
    return fest.get_content(db, key)
