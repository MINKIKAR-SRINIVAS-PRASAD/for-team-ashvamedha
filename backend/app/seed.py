"""
ASHVAMEDHA 2026 database seeding and event synchronization.

The event facts below are synchronized from the official ASHVAMEDHA 2026
Rule Book. Existing registrations and other database tables are preserved.

Commands:

  python -m app.seed
      Seed missing data and synchronize the 12 official events.

  python -m app.seed --reset
      DROP everything and re-seed (destroys registrations!)
"""

import json
import re
import sys
from datetime import timedelta
from pathlib import Path

from sqlalchemy import delete, select
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


# ---------------------------------------------------------------------------
# OFFICIAL ASHVAMEDHA 2026 EVENTS
# ---------------------------------------------------------------------------
#
# Factual event information comes from the official Rule Book.
#
# The following fields are site/UI fields:
#   arena, category, tagline, accent, image, glyph
#
# Existing visual fields are preserved where possible so the website design
# does not suddenly lose its existing artwork/styling.
#
# Exact event-specific schedule dates/times are NOT given in the Rule Book,
# so those values are intentionally shown as TBA.
#

RULEBOOK_EVENTS = [
    {
        "slug": "basketball",
        "name": "Basketball",
        "team_size": "5–12 players",
        "min_team_size": 5,
        "max_team_size": 12,
        "entry_fee": "Boys ₹3500 / Girls ₹2000",
        "prize_pool": (
            "Boys Winner ₹8000 / Runner-up ₹5000; "
            "Girls Winner ₹5000 / Runner-up ₹2500"
        ),
        "format": "FIBA rules; tournament type depends on the number of participating teams.",
        "description": (
            "Team size is minimum 5 and maximum 12 players. "
            "The tournament follows FIBA rules as adopted by the Basketball Federation of India."
        ),
    },
    {
        "slug": "volleyball",
        "name": "Volleyball",
        "team_size": "6–12 players",
        "min_team_size": 6,
        "max_team_size": 12,
        "entry_fee": "Boys ₹3500 / Girls ₹2000",
        "prize_pool": (
            "Boys Winner ₹9000 / Runner-up ₹5500; "
            "Girls Winner ₹4000 / Runner-up ₹2000"
        ),
        "format": (
            "League: best of 3 sets; semi-finals/final: best of 5 sets; "
            "sets to 25 points, final set to 15; FIVB rules."
        ),
        "description": (
            "Teams consist of 6–12 players. League matches are best of 3 sets, "
            "while semi-finals and final are best of 5 sets."
        ),
    },
    {
        "slug": "football",
        "name": "Football",
        "team_size": "7–16 players",
        "min_team_size": 7,
        "max_team_size": 16,
        "entry_fee": "₹4000 per team",
        "prize_pool": "Winner ₹12000 / Runner-up ₹8000",
        "format": (
            "50-minute match (2×25); extra time 16 minutes (2×8); "
            "penalty shoot-out for tied knockouts."
        ),
        "description": (
            "Each team must have 7–16 players. Matches are 50 minutes "
            "with 25-minute halves. Extra time and penalties apply as specified "
            "in the rule book."
        ),
        "venue": "SAC Football Ground",
    },
    {
        "slug": "badminton",
        "name": "Badminton",
        "team_size": "Maximum 4 players",
        "min_team_size": 1,
        "max_team_size": 4,
        "entry_fee": "₹1500 per team",
        "prize_pool": (
            "Boys Winner ₹5000 / Runner-up ₹2500; "
            "Girls Winner ₹5000 / Runner-up ₹2500"
        ),
        "format": (
            "Knockout/elimination; singles, doubles, singles; "
            "best of 3 games to 21 points."
        ),
        "description": (
            "Each team can have up to 4 players. The match sequence is "
            "singles, doubles and singles, with a team needing 2 wins out of 3."
        ),
    },
    {
        "slug": "table-tennis",
        "name": "Table Tennis",
        "team_size": "3–4 boys + 1–2 girls",
        "min_team_size": 4,
        "max_team_size": 6,
        "entry_fee": "₹2000 per team",
        "prize_pool": "Winner ₹5000 / Runner-up ₹2500",
        "format": (
            "Best of 5; Men Singles, Women Singles, Men Doubles, "
            "Mixed Doubles, Men Singles."
        ),
        "description": (
            "A team consists of 3–4 boys and 1–2 girls. "
            "Matches follow the five-game team sequence specified in the rule book."
        ),
    },
    {
        "slug": "lawn-tennis",
        "name": "Lawn Tennis",
        "team_size": "2–4 players",
        "min_team_size": 2,
        "max_team_size": 4,
        "entry_fee": "₹1500 per team",
        "prize_pool": "Winner ₹3500 / Runner-up ₹2500",
        "format": (
            "2 singles + 1 doubles; each best of 3 sets; "
            "reverse singles if tied; AITA rules."
        ),
        "description": (
            "Teams must have 2–4 players. Each tie consists of two singles "
            "and one doubles match. The tournament uses a synthetic court and Dunlop balls."
        ),
    },
    {
        "slug": "chess",
        "name": "Chess",
        "team_size": "4–6 players",
        "min_team_size": 4,
        "max_team_size": 6,
        "entry_fee": "₹1500 per team",
        "prize_pool": "Winner ₹4000 / Runner-up ₹2500",
        "format": (
            "Swiss system; FIDE laws/rules; 4 players play each round; "
            "qualifier/knockout may be used depending on entries."
        ),
        "description": (
            "Each team has 4–6 players including 2 substitutes. "
            "Four players compete in each round under FIDE rules."
        ),
    },
    {
        "slug": "powerlifting",
        "name": "Powerlifting",
        "team_size": "Individual",
        "min_team_size": 1,
        "max_team_size": 1,
        "entry_fee": "₹500 per person",
        "prize_pool": (
            "Winner ₹1500 / Runner-up ₹1000 / 2nd Runner-up ₹800"
        ),
        "format": (
            "Squat, deadlift and bench press; 3 attempts for each lift; DOTS scoring."
        ),
        "description": (
            "Powerlifting is an individual event consisting of squat, deadlift "
            "and bench press, with three attempts for each lift."
        ),
    },
    {
        "slug": "kho-kho",
        "name": "Kho-Kho",
        "team_size": "12 players",
        "min_team_size": 12,
        "max_team_size": 12,
        "entry_fee": "₹2500 per team",
        "prize_pool": "Winner ₹6000 / Runner-up ₹4000",
        "format": (
            "2 innings; chasing/defence turns are 9 minutes for men "
            "and 7 minutes for women; knockout format."
        ),
        "description": (
            "Each team has 12 players, with 9 starting players. "
            "Matches consist of two innings and follow the standard rules specified."
        ),
        "venue": "Hockey Ground",
    },
    {
        "slug": "swimming",
        "name": "Swimming",
        "team_size": "Individual",
        "min_team_size": 1,
        "max_team_size": 1,
        "entry_fee": "₹1500 single event / ₹2500 both events",
        "prize_pool": (
            "Winner ₹5500 / Runner-up ₹3500 / 2nd Runner-up ₹2500"
        ),
        "format": (
            "100 m Freestyle and 100 m Breaststroke."
        ),
        "description": (
            "The swimming events are 100 m Freestyle and 100 m Breaststroke. "
            "Participants must remain within their designated lane."
        ),
    },
    {
        "slug": "sports-quiz",
        "name": "Sports Quiz",
        "team_size": "1–3 participants",
        "min_team_size": 1,
        "max_team_size": 3,
        "entry_fee": "₹200 per team",
        "prize_pool": (
            "Winner ₹2000 / Runner-up ₹1500 / 2nd Runner-up ₹500"
        ),
        "format": (
            "Two preliminary rounds and a final; approximately 20–30 preliminary questions; "
            "top 8 teams advance to the final."
        ),
        "description": (
            "Teams may have three participants, two participants or a lone participant. "
            "The quiz has two preliminary rounds followed by a final."
        ),
    },
    {
        "slug": "mixed-cricket",
        "name": "Mixed Cricket",
        "team_size": "10 players (5 boys + 5 girls)",
        "min_team_size": 10,
        "max_team_size": 10,
        "entry_fee": "₹3000 per team",
        "prize_pool": "Winner ₹6000 / Runner-up ₹4500",
        "format": (
            "5 overs per innings; tennis ball and bat; "
            "mixed batting and bowling participation rules as specified."
        ),
        "description": (
            "Each team consists of 10 players: 5 boys and 5 girls. "
            "Each innings is 5 overs and uses a tennis ball and bat. "
            "At least 2 girls must bowl in every innings."
        ),
    },
]


# Legacy slugs used by the old database/frontend.
# These are only aliases for migrating existing visual metadata.
LEGACY_SLUGS = {
    "lawn-tennis": ["Lawn Tennis-tennis", "lawn"],
    "powerlifting": ["Power Lifting", "gym", "gym-events"],
    "kho-kho": ["Kho-Kho", "Kho kho"],
    "badminton": ["Badminton"],
    "table-tennis": ["tabletennis", "Table Tennis"],
    "mixed-cricket": ["Mixed Cricket", "cricket"],
    "sports-quiz": ["Sports quiz", "sportsquiz"],
    "swimming": ["Swimming"],
    "chess": ["chess"],
    "volleyball": ["volleyball"],
    "football": ["football"],
    "basketball": ["basketball"],
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


def _find_existing_event(
    existing: dict[str, Event],
    slug: str,
) -> Event | None:
    """
    Find an existing event by canonical slug or one of the old legacy slugs.
    This lets us preserve old visual metadata while replacing factual data.
    """
    candidates = [slug, *LEGACY_SLUGS.get(slug, [])]

    for candidate in candidates:
        event = existing.get(candidate)
        if event is not None:
            return event

    return None


def sync_rulebook_events(db: Session) -> None:
    """
    Synchronize the Event table to exactly the 12 official Rule Book events.

    Registrations are stored independently using event_slug, so no registration
    rows are deleted here.
    """
    canonical_slugs = {event["slug"] for event in RULEBOOK_EVENTS}

    # Capture existing events first so their visual metadata can be reused.
    existing_events = {
        event.slug: event
        for event in db.scalars(select(Event)).all()
    }

    # Remove obsolete event rows such as Gym, Valorant, Athletics, etc.
    obsolete_slugs = [
        slug
        for slug in existing_events
        if slug not in canonical_slugs
    ]

    if obsolete_slugs:
        db.execute(
            delete(Event).where(Event.slug.in_(obsolete_slugs))
        )
        print(
            "[seed] removed obsolete events: "
            + ", ".join(obsolete_slugs)
        )

    for sort_order, source in enumerate(RULEBOOK_EVENTS, start=1):
        event = db.get(Event, source["slug"])

        # If canonical row doesn't exist, look for an old alias.
        visual_source = event or _find_existing_event(
            existing_events,
            source["slug"],
        )

        if event is None:
            event = Event(
                slug=source["slug"],
                name=source["name"],
                arena="",
                category="",
                tagline="",
                description="",
                date="Oct 9–11, 2026",
                day=1,
                time="TBA",
                venue="",
                team_size="",
                min_team_size=1,
                max_team_size=1,
                registration="open",
                entry_fee="",
                prize_pool="",
                format="",
                accent="crimson",
                image=None,
                glyph=source["slug"],
                sort_order=sort_order,
            )
            db.add(event)

        # -------------------------------------------------------------------
        # FACTUAL FIELDS — overwritten from the Rule Book
        # -------------------------------------------------------------------
        event.slug = source["slug"]
        event.name = source["name"]
        event.team_size = source["team_size"]
        event.min_team_size = source["min_team_size"]
        event.max_team_size = source["max_team_size"]
        event.entry_fee = source["entry_fee"]
        event.prize_pool = source["prize_pool"]
        event.format = source["format"]
        event.description = source["description"]

        # Overall fest dates are on the Rule Book cover.
        # Event-specific schedule times are not specified in the Rule Book.
        event.date = "Oct 9–11, 2026"
        event.day = 1
        event.time = "TBA"

        # Explicit venues stated in the Rule Book.
        event.venue = source.get(
            "venue",
            visual_source.venue if visual_source else "",
        )

        # Registration is a website state, not a Rule Book fact.
        event.registration = "open"

        # -------------------------------------------------------------------
        # VISUAL/UI FIELDS — preserve existing design data where available.
        # These are not used as the source for event facts.
        # -------------------------------------------------------------------
        if visual_source is not None:
            event.arena = visual_source.arena or ""
            event.category = visual_source.category or ""
            event.tagline = visual_source.tagline or ""
            event.accent = visual_source.accent or "crimson"
            event.image = visual_source.image
            event.glyph = visual_source.glyph or source["slug"]
        else:
            event.arena = ""
            event.category = ""
            event.tagline = ""
            event.accent = "crimson"
            event.image = None
            event.glyph = source["slug"]

        event.sort_order = sort_order

    db.commit()

    print("[seed] synchronized official ASHVAMEDHA 2026 events")
    print(
        "[seed] official events: "
        + ", ".join(event["name"] for event in RULEBOOK_EVENTS)
    )


def seed(db: Session) -> None:
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))

    # Existing project seed content.
    # Event facts are synchronized again below from the official Rule Book.
    for i, e in enumerate(data["EVENTS"]):
        lo, hi = _guess_limits(e.get("teamSize", ""))

        db.add(
            Event(
                slug=e["slug"],
                name=e["name"],
                arena=e.get("arena", ""),
                category=e["category"],
                tagline=e.get("tagline", ""),
                description=e.get("description", ""),
                date=e.get("date", ""),
                day=e.get("day", 1),
                time=e.get("time", ""),
                venue=e.get("venue", ""),
                team_size=e.get("teamSize", ""),
                min_team_size=lo,
                max_team_size=hi,
                registration=e.get("registration", "open"),
                entry_fee=e.get("entryFee", ""),
                prize_pool=e.get("prizePool", ""),
                format=e.get("format", ""),
                accent=e.get("accent", "crimson"),
                image=e.get("image"),
                glyph=e.get("glyph", "football"),
                sort_order=i,
            )
        )

    team_slug_by_name: dict[str, str] = {}

    for i, t in enumerate(data["TEAMS"]):
        team_slug_by_name[t["name"]] = t["slug"]

        db.add(
            Team(
                slug=t["slug"],
                name=t["name"],
                institution=t.get("institution", ""),
                department=t.get("department", ""),
                captain=t.get("captain", ""),
                sport=t.get("sport", ""),
                accent=t.get("accent", "crimson"),
                crest=t.get("crest") or ["#e11d2e", "#4a0710"],
                motto=t.get("motto", ""),
                sort_order=i,
            )
        )

    for r in data["RANKINGS"]:
        db.add(
            Standing(
                team_slug=r["teamSlug"],
                team_name=r["team"],
                matches=r["matches"],
                wins=r["wins"],
                losses=r["losses"],
                points=r["points"],
                win_pct=r.get("winPct"),
            )
        )

    for d in data["DAYS"]:
        db.add(
            ScheduleDay(
                day=d["day"],
                label=d["label"],
                date=d["date"],
                headline=d.get("headline", ""),
                note=d.get("note", ""),
            )
        )

    for s in data["SCHEDULE"]:
        db.add(
            ScheduleSlot(
                id=s["id"],
                day=s["day"],
                time=s["time"],
                title=s["title"],
                venue=s.get("venue", ""),
                event_slug=s.get("eventSlug"),
                stage=s.get("stage", ""),
                status=s.get("status", "scheduled"),
                duration=s.get("duration", ""),
            )
        )

    # Demo fixtures.
    for i, m in enumerate(data["LIVE_MATCHES"]):
        home, away = m["home"], m["away"]

        db.add(
            Match(
                id=m["id"],
                event_slug=m["eventSlug"],
                home_name=home["name"],
                home_team_slug=team_slug_by_name.get(home["name"]),
                home_score="" if home["score"] == "—" else str(home["score"]),
                away_name=away["name"],
                away_team_slug=team_slug_by_name.get(away["name"]),
                away_score="" if away["score"] == "—" else str(away["score"]),
                status=m["status"],
                clock=m.get("clock", ""),
                detail=m.get("detail", ""),
                stage=m.get("detail", "").split("·")[0].strip(),
                counts_for_standings=False,
                sort_order=i,
            )
        )

    slug_by_event_name = {
        e["name"]: e["slug"]
        for e in data["EVENTS"]
    }

    now = utcnow()

    for i, r in enumerate(data["RECENT_RESULTS"]):
        db.add(
            Match(
                id=f"seed-result-{i + 1}",
                event_slug=slug_by_event_name.get(
                    r["sport"],
                    r["sport"].lower(),
                ),
                home_name=r["winner"],
                home_team_slug=team_slug_by_name.get(r["winner"]),
                away_name=r["loser"],
                away_team_slug=team_slug_by_name.get(r["loser"]),
                status="final",
                winner="home",
                result_summary=r["score"],
                stage=r.get("stage", ""),
                detail=r.get("stage", ""),
                counts_for_standings=False,
                finished_at=now - timedelta(hours=3, minutes=i),
            )
        )

    for i, g in enumerate(data["GALLERY"]):
        db.add(
            GalleryItem(
                id=g["id"],
                title=g["title"],
                category=g["category"],
                image=g.get("image"),
                caption=g.get("caption", ""),
                span=g.get("span", "square"),
                accent=g.get("accent", "crimson"),
                sort_order=i,
            )
        )

    for i, s in enumerate(data["SPONSORS"]):
        db.add(
            Sponsor(
                name=s["name"],
                logo=s.get("logo"),
                wordmark=s.get("wordmark", s["name"].upper()),
                tier=s.get("tier", "partner"),
                note=s.get("note"),
                sort_order=i,
            )
        )

    set_content(db, "featuredSlugs", data["FEATURED_SLUGS"])
    set_content(db, "championSpotlight", data["CHAMPION_SPOTLIGHT"])
    set_content(db, "eventChampions", data["EVENT_CHAMPIONS"])
    set_content(db, "podium2025", data["PODIUM_2025"])
    set_content(db, "previousEditions", data["PREVIOUS_EDITIONS"])

    db.commit()

    print("[seed] loaded frontend content into the database")


def seed_if_empty(db: Session) -> None:
    # Preserve the old behavior for the rest of the site's seed data.
    if db.scalar(select(Event.slug).limit(1)) is None:
        seed(db)

    # ALWAYS synchronize event data, even when the DB already contains events.
    sync_rulebook_events(db)

    ensure_admin(db)


def main() -> None:
    reset = "--reset" in sys.argv

    if reset:
        answer = input(
            "This DELETES ALL DATA including registrations. "
            "Type 'yes' to continue: "
        )

        if answer.strip().lower() != "yes":
            print("Aborted.")
            return

        Base.metadata.drop_all(bind=engine)

    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        seed_if_empty(db)


if __name__ == "__main__":
    main()