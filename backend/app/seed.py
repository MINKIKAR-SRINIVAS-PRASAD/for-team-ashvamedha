"""Seed initial UI content and synchronize official ASHVAMEDHA event facts in MongoDB."""
import json
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any

from pymongo.database import Database

from app.config import settings
from app.database import find_records, get_record, next_sequence, write_record
from app.models import Record
from app.security import hash_password
from app.services.fest import set_content, utcnow

ROOT = Path(__file__).resolve().parent.parent
SEED_FILE = ROOT / "seed_data" / "initial.json"
RULEBOOK_FILE = ROOT / "seed_data" / "rulebook_events.json"
ESPORTS_FILE = ROOT / "seed_data" / "esports_events.json"
LEGACY_SLUGS = {
    "lawn-tennis": ["Lawn Tennis-tennis", "Lawn Tennis Tennis", "lawn"],
    "powerlifting": ["Power Lifting", "gym", "gym-events"],
    "kho-kho": ["Kho-Kho", "Kho kho"],
    "badminton": ["Badminton"],
    "table-tennis": ["tabletennis", "Table Tennis"],
    "mixed-cricket": ["Mixed Cricket", "Mixed cricket", "cricket"],
    "sports-quiz": ["Sports quiz", "sportsquiz"],
    "swimming": ["Swimming"],
    "chess": ["Chess"],
    "volleyball": ["Vollyball", "volleyball"],
    "football": ["Football", "football"],
    "basketball": ["Basketball", "basketball"],
}


def _canonical_aliases() -> dict[str, str]:
    return {alias: canonical for canonical, aliases in LEGACY_SLUGS.items() for alias in aliases}


def ensure_admin(db: Database) -> None:
    if db.users.count_documents({}) == 0:
        now = utcnow()
        user = {
            "id": next_sequence(db, "users", "users"),
            "username": settings.admin_username,
            "username_lower": settings.admin_username.lower(),
            "password_hash": hash_password(settings.admin_password),
            "role": "admin", "event_slugs": [], "is_active": True, "created_at": now,
        }
        write_record(db, "users", user)
        print(f"[seed] created admin user '{settings.admin_username}'")


def ensure_sport_admins(db: Database) -> None:
    if not settings.sport_admin_list:
        return
    if db.users.find_one({"role": "coordinator"}, {"_id": 1}):
        print("[seed] sport admins already exist; SPORT_ADMINS ignored (manage them on /admin)")
        return
    for sport, username, password in settings.sport_admin_list:
        if get_record(db, "events", sport) is None:
            print(f"[seed] skipped sport admin '{username}': unknown sport '{sport}'")
            continue
        if db.users.find_one({"username_lower": username.lower()}, {"_id": 1}):
            continue
        user = {
            "id": next_sequence(db, "users", "users"), "username": username,
            "username_lower": username.lower(), "password_hash": hash_password(password),
            "role": "coordinator", "event_slugs": [sport], "is_active": True, "created_at": utcnow(),
        }
        write_record(db, "users", user)
        print(f"[seed] created {sport} coordinator '{username}'")


def _visual_lookup(seed_data: dict) -> dict[str, dict]:
    lookup = {event.get("slug", ""): event for event in seed_data.get("EVENTS", [])}
    canonical: dict[str, dict] = {}
    for slug, source in lookup.items():
        target = _canonical_aliases().get(slug, slug)
        canonical.setdefault(target, source)
    return canonical


def sync_rulebook_events(db: Database, seed_data: dict | None = None) -> None:
    """Upsert official 12 event records, retaining only existing visual/UI metadata."""
    if seed_data is None:
        seed_data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    visuals = _visual_lookup(seed_data)
    # Sports Quiz was added to the current frontend after the older JSON seed export.
    # These values are presentation metadata taken from data/events.ts, not rulebook facts.
    visuals.setdefault("sports-quiz", {
        "arena": "Quiz Arena", "category": "Board & Mind",
        "tagline": "Two rounds. One sports mind.", "accent": "violet",
        "image": None, "glyph": "sportsquiz",
    })
    existing_docs = list(db.events.find({}))
    existing_by_slug = {doc.get("slug"): doc for doc in existing_docs}
    aliases = _canonical_aliases()
    official = json.loads(RULEBOOK_FILE.read_text(encoding="utf-8"))
    esports = json.loads(ESPORTS_FILE.read_text(encoding="utf-8"))
    official_slugs = {event["slug"] for event in official}
    retained_slugs = official_slugs | {event["slug"] for event in esports}

    # Move references from known legacy event slugs before removing duplicate legacy event records.
    for old_slug, canonical in aliases.items():
        if old_slug == canonical or old_slug in official_slugs:
            continue
        if old_slug not in existing_by_slug:
            continue
        db.registrations.update_many({"event_slug": old_slug}, {"$set": {"event_slug": canonical}})
        db.matches.update_many({"event_slug": old_slug}, {"$set": {"event_slug": canonical}})
        db.schedule_slots.update_many({"event_slug": old_slug}, {"$set": {"event_slug": canonical}})
        for user in db.users.find({"event_slugs": old_slug}):
            slugs = [canonical if slug == old_slug else slug for slug in user.get("event_slugs", [])]
            user["event_slugs"] = list(dict.fromkeys(slugs))
            db.users.replace_one({"_id": user["_id"]}, user)

    for order, source in enumerate(official, start=1):
        slug = source["slug"]
        current = existing_by_slug.get(slug)
        visual = current or visuals.get(slug)
        if visual is None:
            for alias in LEGACY_SLUGS.get(slug, []):
                if alias in existing_by_slug:
                    visual = existing_by_slug[alias]
                    break
        doc: dict[str, Any] = {
            "slug": slug,
            "name": source["name"],
            "arena": (visual or {}).get("arena", ""),
            "category": (visual or {}).get("category", ""),
            "tagline": (visual or {}).get("tagline", ""),
            "description": source["description"],
            "date": "Oct 9–11, 2026",
            "day": 1,
            "time": "TBA",
            "venue": source.get("venue", ""),
            "team_size": source["team_size"],
            "min_team_size": source["min_team_size"],
            "max_team_size": source["max_team_size"],
            "registration": "open",
            "entry_fee": source["entry_fee"],
            "prize_pool": source["prize_pool"],
            "format": source["format"],
            "accent": (visual or {}).get("accent", "crimson"),
            "image": (visual or {}).get("image"),
            "glyph": (visual or {}).get("glyph", slug),
            "sort_order": order,
        }
        db.events.replace_one({"_id": slug}, {**doc, "_id": slug}, upsert=True)

    # The frontend also includes three supplemental esports registrations. They are
    # not listed in the official rulebook, so their event-specific facts stay TBA.
    for event in esports:
        slug = event["slug"]
        existing = existing_by_slug.get(slug)
        if existing:
            # These entries have no rulebook facts. Preserve any details entered by an
            # admin after first seed rather than resetting them to TBA on each startup.
            doc = dict(existing)
        else:
            doc = dict(event)
        doc["_id"] = slug
        db.events.replace_one({"_id": slug}, doc, upsert=True)

    # Keep only the 12 official rulebook events plus the 3 existing form-backed esports entries.
    # Registrations/matches remain in their own collections and are never deleted here.
    db.events.delete_many({"slug": {"$nin": list(retained_slugs)}})
    print("[seed] synchronized the 12 official rulebook events and 3 form-backed esports events")


def seed(db: Database) -> None:
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    now = utcnow()
    team_slug_by_name: dict[str, str] = {}

    # Seed all non-event collections only when the events collection is empty.
    for i, team in enumerate(data.get("TEAMS", [])):
        team_slug_by_name[team["name"]] = team["slug"]
        doc = {
            "slug": team["slug"], "name": team["name"], "institution": team.get("institution", ""),
            "department": team.get("department", ""), "captain": team.get("captain", ""),
            "sport": team.get("sport", ""), "accent": team.get("accent", "crimson"),
            "crest": team.get("crest") or ["#e11d2e", "#4a0710"], "motto": team.get("motto", ""), "sort_order": i,
        }
        write_record(db, "teams", doc)

    for row in data.get("RANKINGS", []):
        doc = {"team_slug": row["teamSlug"], "team_name": row["team"], "matches": row.get("matches", 0),
               "wins": row.get("wins", 0), "losses": row.get("losses", 0), "points": row.get("points", 0),
               "win_pct": row.get("winPct")}
        write_record(db, "standings", doc)

    for day in data.get("DAYS", []):
        write_record(db, "schedule_days", {"day": day["day"], "label": day["label"], "date": day["date"],
            "headline": day.get("headline", ""), "note": day.get("note", "")})

    for slot in data.get("SCHEDULE", []):
        doc = {"id": slot["id"], "day": slot["day"], "time": slot["time"], "title": slot["title"],
               "venue": slot.get("venue", ""), "event_slug": slot.get("eventSlug"), "stage": slot.get("stage", ""),
               "status": slot.get("status", "scheduled"), "duration": slot.get("duration", "")}
        write_record(db, "schedule_slots", doc)

    if settings.seed_demo_matches:
        for i, match in enumerate(data.get("LIVE_MATCHES", [])):
            home, away = match["home"], match["away"]
            canonical_event_slug = _canonical_aliases().get(match["eventSlug"], match["eventSlug"])
            doc = {"id": match["id"], "event_slug": canonical_event_slug, "home_name": home["name"],
                   "home_team_slug": team_slug_by_name.get(home["name"]),
                   "home_score": "" if home.get("score") == "—" else str(home.get("score", "")),
                   "away_name": away["name"], "away_team_slug": team_slug_by_name.get(away["name"]),
                   "away_score": "" if away.get("score") == "—" else str(away.get("score", "")),
                   "status": match["status"], "clock": match.get("clock", ""), "detail": match.get("detail", ""),
                   "stage": match.get("detail", "").split("·")[0].strip(), "winner": None, "result_summary": "",
                   "counts_for_standings": False, "sort_order": i, "match_format": "", "sets": [], "participants": [],
                   "created_at": now, "updated_at": now, "finished_at": None}
            write_record(db, "matches", doc)

    event_slug_by_name = {e["name"]: e["slug"] for e in data.get("EVENTS", [])}
    for index, result in enumerate(data.get("RECENT_RESULTS", []), start=1):
        event_slug = event_slug_by_name.get(result["sport"], aliases_for_result(result["sport"]))
        event_slug = _canonical_aliases().get(event_slug, event_slug)
        doc = {"id": f"seed-result-{index}", "event_slug": event_slug, "home_name": result["winner"],
               "home_team_slug": team_slug_by_name.get(result["winner"]), "home_score": "", "away_name": result["loser"],
               "away_team_slug": team_slug_by_name.get(result["loser"]), "away_score": "", "status": "final", "clock": "",
               "detail": result.get("stage", ""), "stage": result.get("stage", ""), "winner": "home",
               "result_summary": result.get("score", ""), "counts_for_standings": False, "sort_order": index,
               "match_format": "", "sets": [], "participants": [], "created_at": now, "updated_at": now,
               "finished_at": now - timedelta(hours=3, minutes=index)}
        write_record(db, "matches", doc)

    for i, gallery in enumerate(data.get("GALLERY", [])):
        write_record(db, "gallery_items", {"id": gallery.get("id") or f"g-{i}", "title": gallery.get("title") or "Photo", "category": gallery.get("category", ""),
            "image": gallery.get("image"), "caption": gallery.get("caption", ""), "span": gallery.get("span", "square"),
            "accent": gallery.get("accent", "crimson"), "sort_order": i})

    for i, sponsor in enumerate(data.get("SPONSORS", []), start=1):
        write_record(db, "sponsors", {"id": next_sequence(db, "sponsors", "sponsors"), "name": sponsor["name"],
            "logo": sponsor.get("logo"), "wordmark": sponsor.get("wordmark", sponsor["name"].upper()),
            "tier": sponsor.get("tier", "partner"), "note": sponsor.get("note"), "sort_order": i - 1})

    aliases = _canonical_aliases()
    featured = list(dict.fromkeys(aliases.get(slug, slug) for slug in data.get("FEATURED_SLUGS", [])))
    set_content(db, "featuredSlugs", featured)
    set_content(db, "championSpotlight", data.get("CHAMPION_SPOTLIGHT", {}))
    set_content(db, "eventChampions", data.get("EVENT_CHAMPIONS", []))
    set_content(db, "podium2025", data.get("PODIUM_2025", []))
    set_content(db, "previousEditions", data.get("PREVIOUS_EDITIONS", []))
    print("[seed] loaded website content into MongoDB")


def aliases_for_result(sport: str) -> str:
    aliases = _canonical_aliases()
    return aliases.get(sport, sport.lower().replace(" ", "-"))


def seed_if_empty(db: Database) -> None:
    data = json.loads(SEED_FILE.read_text(encoding="utf-8"))
    if db.events.count_documents({}) == 0:
        seed(db)
    sync_rulebook_events(db, data)
    ensure_admin(db)
    ensure_sport_admins(db)


def main() -> None:
    from app.database import connect_database
    db = connect_database()
    reset = "--reset" in __import__("sys").argv
    if reset:
        answer = input("This DELETES ALL DATA including registrations. Type 'yes' to continue: ")
        if answer.strip().lower() != "yes":
            print("Aborted.")
            return
        for name in ["events", "teams", "standings", "schedule_days", "schedule_slots", "matches", "gallery_items",
                     "sponsors", "content_blocks", "registrations", "users", "counters"]:
            db[name].delete_many({})
    seed_if_empty(db)
    print(f"[seed] MongoDB database '{settings.mongodb_db_name}' is ready")


if __name__ == "__main__":
    main()
