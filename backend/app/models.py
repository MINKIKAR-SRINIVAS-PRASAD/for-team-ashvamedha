"""MongoDB collection metadata and lightweight records (no SQLAlchemy ORM)."""
from __future__ import annotations

from typing import Any


# Logical collection -> application primary-key field. MongoDB stores that key
# in _id as well, so lookups remain stable and duplicate primary keys are rejected.
PRIMARY_KEYS: dict[str, str] = {
    "events": "slug",
    "teams": "slug",
    "standings": "team_slug",
    "schedule_days": "day",
    "schedule_slots": "id",
    "matches": "id",
    "gallery_items": "id",
    "sponsors": "id",
    "content_blocks": "key",
    "registrations": "id",
    "users": "id",
}


class Record(dict):
    """Dict with attribute access to keep serializer code easy to read."""

    def __getattr__(self, name: str) -> Any:
        try:
            return self[name]
        except KeyError as exc:
            raise AttributeError(name) from exc

    def __setattr__(self, name: str, value: Any) -> None:
        self[name] = value


def as_record(document: dict | None, collection: str | None = None) -> Record | None:
    if document is None:
        return None
    data = dict(document)
    mongo_id = data.pop("_id", None)
    if collection and PRIMARY_KEYS.get(collection) and PRIMARY_KEYS[collection] not in data:
        data[PRIMARY_KEYS[collection]] = mongo_id
    elif "id" not in data and mongo_id is not None and collection in {"users", "registrations", "sponsors", "matches", "gallery_items", "schedule_slots"}:
        data["id"] = mongo_id
    return Record(data)
