"""Optional one-time importer for an existing ashvamedha.db SQLite database.

Run from backend/ after setting MONGODB_URI in .env:
  python migrate_sqlite_to_mongo.py path\to\ashvamedha.db

By default, a whole target collection is skipped if it already contains data.
Use --overwrite to upsert source rows into matching MongoDB _id values.
"""
from __future__ import annotations

import argparse
import json
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any

from pymongo.database import Database

from app.database import connect_database, ensure_indexes
from app.models import PRIMARY_KEYS

TABLE_TO_COLLECTION = {
    "events": "events", "teams": "teams", "standings": "standings",
    "schedule_days": "schedule_days", "schedule_slots": "schedule_slots",
    "matches": "matches", "gallery_items": "gallery_items", "sponsors": "sponsors",
    "content_blocks": "content_blocks", "registrations": "registrations", "users": "users",
}
JSON_FIELDS = {
    "teams": {"crest"}, "matches": {"sets", "participants"}, "registrations": {"members"},
    "users": {"event_slugs"}, "content_blocks": {"value"},
}
DATETIME_FIELDS = {"created_at", "updated_at", "finished_at"}


def normalize_value(table: str, key: str, value: Any) -> Any:
    if value is None:
        return None
    if key in JSON_FIELDS.get(table, set()) and isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return value
    if key in DATETIME_FIELDS and isinstance(value, str) and value:
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00")).replace(tzinfo=None)
        except ValueError:
            return value
    return value


def primary_key(table: str, row: dict[str, Any]) -> Any:
    field = PRIMARY_KEYS[TABLE_TO_COLLECTION[table]]
    return row[field]


def import_sqlite(db: Database, sqlite_path: Path, overwrite: bool) -> None:
    if not sqlite_path.exists():
        raise FileNotFoundError(f"SQLite file not found: {sqlite_path}")
    conn = sqlite3.connect(str(sqlite_path))
    conn.row_factory = sqlite3.Row
    try:
        tables = {r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")}
        tables.discard("sqlite_sequence")
        total = 0
        for table, collection in TABLE_TO_COLLECTION.items():
            if table not in tables:
                continue
            target = db[collection]
            target_count = target.count_documents({})
            if target_count and not overwrite:
                print(f"[skip] {table} -> {collection}: target already has {target_count} docs (use --overwrite to upsert)")
                continue
            source_rows = conn.execute(f'SELECT * FROM "{table}"').fetchall()
            table_count = 0
            for sql_row in source_rows:
                row = {key: normalize_value(table, key, sql_row[key]) for key in sql_row.keys()}
                pk = primary_key(table, row)
                row["_id"] = pk
                if table == "users":
                    row["username_lower"] = str(row.get("username", "")).lower()
                elif table == "registrations":
                    row["email_lower"] = str(row.get("email", "")).lower()
                    row["team_name_lower"] = str(row.get("team_name") or "").lower()
                target.replace_one({"_id": pk}, row, upsert=True)
                table_count += 1
            total += table_count
            print(f"[ok] {table} -> {collection}: imported/upserted {table_count} docs")
        ensure_indexes(db)
        print(f"Migration finished: {total} rows imported/upserted. Verify the app before decommissioning SQLite.")
    finally:
        conn.close()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("sqlite_file", type=Path, help="Path to the old ashvamedha.db file")
    parser.add_argument("--overwrite", action="store_true", help="Upsert rows even when destination collections are non-empty")
    args = parser.parse_args()
    db = connect_database()
    import_sqlite(db, args.sqlite_file, args.overwrite)


if __name__ == "__main__":
    main()
