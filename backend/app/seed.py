"""
Loads the content currently hard-coded in the frontend (seed_data/initial.json,
exported from data/*.ts) into the database, and creates the first admin.

  python -m app.seed            # seed only if the database is empty
  python -m app.seed --reset    # DROP everything and re-seed (destroys registrations!)
"""
import json
import re
import sys
from datetime import timedelta
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models import (
    Event,
    GalleryItem,
    Match,
    ScheduleDay,
    ScheduleSlot,
    Sponsor,
    Standing,
    Team,
    User,
    utcnow,
)
from app.security import hash_password
from app.services.fest import set_content

SEED_FILE = Path(__file__).resolve().parent.parent / "seed_data" / "initial.json"

# Participants allowed per registration (captain included). Edit later via the API.
TEAM_LIMITS = {
    "football": (11, 16),
    "basketball": (5, 9),
    "Badminton": (1, 2),
    "table-tennis": (1, 2),
    "Lawn Tennis-tennis": (1, 2),
    "Kho-Kho": (1, 1),
    "Power Lifting": (1, 1),
    "chess": (5, 6),
    "Swimming": (1, 4),
    "volleyball": (6, 10),
    "Mixed Cricket": (11, 15),
}


def _guess_limits(team_size: str) -> tuple[int, int]:
    nums = [int(n) for n in re.findall(r"\d+", team_size or "")]
    if not nums:
        return 1, 1
    if "+" in team_size and "relay" not in team_size.lower() and len(nums) >= 2:
        return nums[0], nums[0] + nums[1]
    return min(nums), max(nums)


def ensure_admin(db: Session) -> None:
    if db.scalar(select(User.id).limit(1)) is None:
        db.add(
            User(
                username=settings.admin_username,
                password_hash=hash_password(settings.admin_password),
                role="admin",
                event_slugs=[],
            )
        )
        db.commit()
        print(f"[seed] created admin user '{settings.admin_username}'")


def seed(db: Session) -> None:
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    for i, e in enumerate(data["EVENTS"]):
        lo, hi = TEAM_LIMITS.get(e["slug"]) or _guess_limits(e.get("teamSize", ""))
        db.add(Event(
            slug=e["slug"], name=e["name"], arena=e.get("arena", ""), category=e["category"],
            tagline=e.get("tagline", ""), description=e.get("description", ""), date=e.get("date", ""),
            day=e.get("day", 1), time=e.get("time", ""), venue=e.get("venue", ""),
            team_size=e.get("teamSize", ""), min_team_size=lo, max_team_size=hi,
            registration=e.get("registration", "open"), entry_fee=e.get("entryFee", ""),
            prize_pool=e.get("prizePool", ""), format=e.get("format", ""), accent=e.get("accent", "crimson"),
            image=e.get("image"), glyph=e.get("glyph", "football"), sort_order=i,
        ))

    team_slug_by_name: dict[str, str] = {}
    for i, t in enumerate(data["TEAMS"]):
        team_slug_by_name[t["name"]] = t["slug"]
        db.add(Team(
            slug=t["slug"], name=t["name"], institution=t.get("institution", ""),
            department=t.get("department", ""), captain=t.get("captain", ""), sport=t.get("sport", ""),
            accent=t.get("accent", "crimson"), crest=t.get("crest") or ["#e11d2e", "#4a0710"],
            motto=t.get("motto", ""), sort_order=i,
        ))

    for r in data["RANKINGS"]:
        db.add(Standing(
            team_slug=r["teamSlug"], team_name=r["team"], matches=r["matches"], wins=r["wins"],
            losses=r["losses"], points=r["points"], win_pct=r.get("winPct"),
        ))

    for d in data["DAYS"]:
        db.add(ScheduleDay(day=d["day"], label=d["label"], date=d["date"],
                           headline=d.get("headline", ""), note=d.get("note", "")))
    for s in data["SCHEDULE"]:
        db.add(ScheduleSlot(
            id=s["id"], day=s["day"], time=s["time"], title=s["title"], venue=s.get("venue", ""),
            event_slug=s.get("eventSlug"), stage=s.get("stage", ""), status=s.get("status", "scheduled"),
            duration=s.get("duration", ""),
        ))

    # Demo fixtures: they do NOT count toward standings (the seeded table already includes history).
    for i, m in enumerate(data["LIVE_MATCHES"]):
        home, away = m["home"], m["away"]
        db.add(Match(
            id=m["id"], event_slug=m["eventSlug"],
            home_name=home["name"], home_team_slug=team_slug_by_name.get(home["name"]),
            home_score="" if home["score"] == "—" else str(home["score"]),
            away_name=away["name"], away_team_slug=team_slug_by_name.get(away["name"]),
            away_score="" if away["score"] == "—" else str(away["score"]),
            status=m["status"], clock=m.get("clock", ""), detail=m.get("detail", ""),
            stage=m.get("detail", "").split("·")[0].strip(), counts_for_standings=False, sort_order=i,
        ))

    slug_by_event_name = {e["name"]: e["slug"] for e in data["EVENTS"]}
    now = utcnow()
    for i, r in enumerate(data["RECENT_RESULTS"]):
        db.add(Match(
            id=f"seed-result-{i + 1}", event_slug=slug_by_event_name.get(r["sport"], r["sport"].lower()),
            home_name=r["winner"], home_team_slug=team_slug_by_name.get(r["winner"]),
            away_name=r["loser"], away_team_slug=team_slug_by_name.get(r["loser"]),
            status="final", winner="home", result_summary=r["score"], stage=r.get("stage", ""),
            detail=r.get("stage", ""), counts_for_standings=False,
            finished_at=now - timedelta(hours=3, minutes=i),
        ))

    for i, g in enumerate(data["GALLERY"]):
        db.add(GalleryItem(
            id=g["id"], title=g["title"], category=g["category"], image=g.get("image"),
            caption=g.get("caption", ""), span=g.get("span", "square"), accent=g.get("accent", "crimson"),
            sort_order=i,
        ))
    for i, s in enumerate(data["SPONSORS"]):
        db.add(Sponsor(name=s["name"], logo=s.get("logo"), wordmark=s.get("wordmark", s["name"].upper()),
                       tier=s.get("tier", "partner"), note=s.get("note"), sort_order=i))

    set_content(db, "featuredSlugs", data["FEATURED_SLUGS"])
    set_content(db, "championSpotlight", data["CHAMPION_SPOTLIGHT"])
    set_content(db, "eventChampions", data["EVENT_CHAMPIONS"])
    set_content(db, "podium2025", data["PODIUM_2025"])
    set_content(db, "previousEditions", data["PREVIOUS_EDITIONS"])

    db.commit()
    print("[seed] loaded frontend content into the database")


def seed_if_empty(db: Session) -> None:
    if db.scalar(select(Event.slug).limit(1)) is None:
        seed(db)
    ensure_admin(db)


def main() -> None:
    reset = "--reset" in sys.argv
    if reset:
        answer = input("This DELETES ALL DATA including registrations. Type 'yes' to continue: ")
        if answer.strip().lower() != "yes":
            print("Aborted.")
            return
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_if_empty(db)


if __name__ == "__main__":
    main()
