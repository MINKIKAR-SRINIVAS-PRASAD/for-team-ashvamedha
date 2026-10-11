"""MongoDB Atlas connection and collection helpers."""
from __future__ import annotations

from collections.abc import Iterator
from datetime import datetime
from typing import Any

from fastapi import HTTPException
from pymongo import ASCENDING, DESCENDING, MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from pymongo.errors import DuplicateKeyError
from pymongo import ReturnDocument

from app.config import settings
from app.models import PRIMARY_KEYS, Record, as_record

_client: MongoClient | None = None
_database: Database | None = None


def connect_database() -> Database:
    """Create/ping the Atlas connection and ensure indexes."""
    global _client, _database
    if not settings.mongodb_uri.strip():
        raise RuntimeError(
            "MONGODB_URI is missing. Create backend/.env from backend/.env.example "
            "and paste your MongoDB Atlas connection string."
        )
    if _database is None:
        _client = MongoClient(
            settings.mongodb_uri.strip(),
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            appname="ASHVAMEDHA-2026-API",
        )
        _client.admin.command("ping")
        _database = _client[settings.mongodb_db_name]
        ensure_indexes(_database)
    return _database


def close_database() -> None:
    global _client, _database
    if _client is not None:
        _client.close()
    _client = None
    _database = None


def get_database() -> Database:
    if _database is not None:
        return _database
    return connect_database()


def get_db() -> Iterator[Database]:
    """FastAPI dependency: a process-wide, thread-safe PyMongo Database."""
    try:
        database = get_database()
    except Exception as exc:
        # Only connection acquisition errors become a clean 503. Do not wrap exceptions
        # raised later by the route handler as database failures.
        raise HTTPException(status_code=503, detail="Database is unavailable. Check the MongoDB Atlas connection settings.") from exc
    yield database


def ensure_indexes(db: Database) -> None:
    # Backfill normalized query fields before creating indexes, including on a database
    # imported from the old SQLite schema which did not have these helper fields.
    for user in db.users.find({"username_lower": {"$exists": False}}, {"_id": 1, "username": 1}):
        db.users.update_one({"_id": user["_id"]}, {"$set": {"username_lower": str(user.get("username", "")).lower()}})
    for registration in db.registrations.find({"email_lower": {"$exists": False}}, {"_id": 1, "email": 1, "team_name": 1}):
        db.registrations.update_one(
            {"_id": registration["_id"]},
            {"$set": {
                "email_lower": str(registration.get("email", "")).lower(),
                "team_name_lower": str(registration.get("team_name") or "").lower(),
            }},
        )
    db.users.create_index([("username_lower", ASCENDING)], unique=True, name="users_username_lower_unique")
    db.registrations.create_index([("code", ASCENDING)], unique=True, name="registrations_code_unique")
    db.registrations.create_index([("event_slug", ASCENDING), ("email_lower", ASCENDING), ("status", ASCENDING)])
    db.registrations.create_index([("event_slug", ASCENDING), ("team_name_lower", ASCENDING), ("status", ASCENDING)])
    db.matches.create_index([("event_slug", ASCENDING), ("status", ASCENDING), ("sort_order", ASCENDING)])
    db.schedule_slots.create_index([("day", ASCENDING), ("time", ASCENDING)])
    db.gallery_items.create_index([("sort_order", ASCENDING), ("id", ASCENDING)])
    db.sponsors.create_index([("sort_order", ASCENDING), ("id", ASCENDING)])


def collection_name(model_or_name: Any) -> str:
    if isinstance(model_or_name, str):
        return model_or_name
    name = getattr(model_or_name, "collection", None)
    if not name:
        raise ValueError(f"No MongoDB collection is configured for {model_or_name!r}")
    return name


def get_record(db: Database, collection: str, key: Any) -> Record | None:
    return as_record(db[collection].find_one({"_id": key}), collection)


def find_records(
    db: Database,
    collection: str,
    query: dict | None = None,
    sort: list[tuple[str, int]] | None = None,
    limit: int = 0,
    skip: int = 0,
) -> list[Record]:
    cursor = db[collection].find(query or {})
    if sort:
        cursor = cursor.sort(sort)
    if skip:
        cursor = cursor.skip(skip)
    if limit:
        cursor = cursor.limit(limit)
    return [as_record(doc, collection) for doc in cursor]  # type: ignore[list-item]


def write_record(db: Database, collection: str, value: dict | Record) -> Record:
    data = dict(value)
    pk_field = PRIMARY_KEYS[collection]
    key = data.get(pk_field)
    if key is None:
        raise ValueError(f"Missing primary key '{pk_field}' for collection '{collection}'")
    data["_id"] = key
    db[collection].replace_one({"_id": key}, data, upsert=True)
    return as_record(data, collection)  # type: ignore[return-value]


def insert_record(db: Database, collection: str, value: dict | Record) -> Record:
    data = dict(value)
    pk_field = PRIMARY_KEYS[collection]
    key = data.get(pk_field)
    if key is None:
        raise ValueError(f"Missing primary key '{pk_field}' for collection '{collection}'")
    data["_id"] = key
    db[collection].insert_one(data)
    return as_record(data, collection)  # type: ignore[return-value]


def delete_record(db: Database, collection: str, key: Any) -> bool:
    return db[collection].delete_one({"_id": key}).deleted_count > 0


def next_sequence(db: Database, sequence_name: str, collection: str) -> int:
    """Atomic integer IDs, used for legacy API fields that are integers."""
    highest_doc = db[collection].find_one({}, {"_id": 1}, sort=[("_id", DESCENDING)])
    highest = highest_doc.get("_id", 0) if highest_doc else 0
    if not isinstance(highest, int):
        highest = 0
    db.counters.update_one(
        {"_id": sequence_name},
        {"$setOnInsert": {"seq": highest}},
        upsert=True,
    )
    counter = db.counters.find_one_and_update(
        {"_id": sequence_name},
        {"$inc": {"seq": 1}},
        return_document=ReturnDocument.AFTER,
    )
    return int(counter["seq"])


def update_timestamp(record: Record, field: str = "updated_at") -> None:
    record[field] = datetime.utcnow()


def translate_duplicate_key(exc: DuplicateKeyError, message: str = "A record with that key already exists") -> HTTPException:
    return HTTPException(status_code=409, detail=message)
