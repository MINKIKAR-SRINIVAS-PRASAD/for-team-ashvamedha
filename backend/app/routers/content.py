"""MongoDB-backed admin CRUD for event, schedule, team, standing, gallery and sponsor data."""
import uuid
from pathlib import Path
from typing import Any, Callable, Literal

from fastapi import APIRouter, Body, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from pymongo.database import Database

from app.config import settings
from app.database import delete_record, find_records, get_db, get_record, next_sequence, write_record
from app.models import Record
from app.schemas import EventIn, GalleryItemIn, ScheduleDayIn, ScheduleSlotIn, SponsorIn, StandingIn, TeamIn
from app.security import ensure_event_access, get_current_user, require_admin
from app.services import fest

router = APIRouter(prefix="/api/admin", tags=["admin content"])
Access = Literal["admin", "event"]


def _event_in_use(db: Database, event: Record) -> None:
    if db.registrations.find_one({"event_slug": event.slug}, {"_id": 1}):
        raise HTTPException(409, "This event has registrations. Set registration to 'closed' instead of deleting.")
    if db.matches.find_one({"event_slug": event.slug}, {"_id": 1}):
        raise HTTPException(409, "This event has matches. Delete its matches first.")


_RESOURCE_SPECS: dict[str, dict[str, Any]] = {
    "events": {"collection": "events", "schema": EventIn, "pk": "slug", "serialize": fest.event_out, "access": "admin", "pk_type": str},
    "teams": {"collection": "teams", "schema": TeamIn, "pk": "slug", "serialize": lambda item: fest.team_out(item), "access": "admin", "pk_type": str},
    "standings": {"collection": "standings", "schema": StandingIn, "pk": "team_slug", "serialize": fest.standing_out, "access": "admin", "pk_type": str},
    "schedule-days": {"collection": "schedule_days", "schema": ScheduleDayIn, "pk": "day", "serialize": fest.day_out, "access": "admin", "pk_type": int},
    "schedule": {"collection": "schedule_slots", "schema": ScheduleSlotIn, "pk": "id", "serialize": fest.slot_out, "access": "event", "pk_type": str},
    "gallery": {"collection": "gallery_items", "schema": GalleryItemIn, "pk": "id", "serialize": fest.gallery_out, "access": "admin", "pk_type": str},
    "sponsors": {"collection": "sponsors", "schema": SponsorIn, "pk": "id", "serialize": fest.sponsor_out, "access": "admin", "pk_type": int},
}


def register_crud(resource: str, spec: dict[str, Any]) -> None:
    collection = spec["collection"]
    schema: type[BaseModel] = spec["schema"]
    pk = spec["pk"]
    serialize: Callable[[Any], dict] = spec["serialize"]
    access: Access = spec["access"]
    pk_type = spec["pk_type"]
    tag = [f"admin: {resource}"]

    def check(user: Record, obj_or_data: Any) -> None:
        if access == "admin":
            if user.role != "admin":
                raise HTTPException(403, "Admin access required")
            return
        event_slug = obj_or_data.get("event_slug") if isinstance(obj_or_data, dict) else obj_or_data.event_slug
        ensure_event_access(user, event_slug)

    def create(body: dict[str, Any] = Body(...), db: Database = Depends(get_db), user: Record = Depends(get_current_user)):
        data = schema.model_validate(body).model_dump()
        check(user, data)
        if resource == "sponsors":
            data["id"] = next_sequence(db, "sponsors", "sponsors")
        key = data.get(pk)
        if key is not None and get_record(db, collection, key) is not None:
            raise HTTPException(409, f"'{key}' already exists")
        try:
            obj = write_record(db, collection, data)
        except Exception as exc:
            if "duplicate key" in str(exc).lower():
                raise HTTPException(409, f"'{key}' already exists") from exc
            raise
        return serialize(obj)

    def update(key: pk_type, body: dict[str, Any] = Body(...), db: Database = Depends(get_db), user: Record = Depends(get_current_user)):
        obj = get_record(db, collection, key)
        if obj is None:
            label = resource[:-1] if resource.endswith("s") else resource
            raise HTTPException(404, f"{label} '{key}' not found")
        check(user, obj)
        data = schema.model_validate({**dict(obj), **body}).model_dump()
        data[pk] = key
        check(user, data)
        updated = Record({**dict(obj), **data})
        if collection == "sponsors":
            updated.id = key
        saved = write_record(db, collection, updated)
        return serialize(saved)

    def delete(key: pk_type, db: Database = Depends(get_db), user: Record = Depends(get_current_user)):
        obj = get_record(db, collection, key)
        if obj is None:
            label = resource[:-1] if resource.endswith("s") else resource
            raise HTTPException(404, f"{label} '{key}' not found")
        check(user, obj)
        if resource == "events":
            _event_in_use(db, obj)
        delete_record(db, collection, key)
        return None

    # Set the route parameter types dynamically so OpenAPI keeps ints for integer IDs.
    update.__annotations__["key"] = pk_type
    delete.__annotations__["key"] = pk_type
    op = resource.replace("-", "_")
    router.add_api_route(f"/{resource}", create, methods=["POST"], status_code=201, tags=tag,
                         summary=f"Create {resource}", operation_id=f"create_{op}")
    router.add_api_route(f"/{resource}/{{key}}", update, methods=["PATCH"], tags=tag,
                         summary=f"Update {resource} (partial)", operation_id=f"update_{op}")
    router.add_api_route(f"/{resource}/{{key}}", delete, methods=["DELETE"], status_code=204, tags=tag,
                         summary=f"Delete {resource}", operation_id=f"delete_{op}")


for _resource, _spec in _RESOURCE_SPECS.items():
    register_crud(_resource, _spec)


@router.get("/standings", tags=["admin: standings"], summary="Manual base values (before match results)")
def list_standings(db: Database = Depends(get_db), _: Record = Depends(require_admin)):
    return [fest.standing_out(row) for row in find_records(db, "standings", sort=[("points", -1)])]


_CONTENT_TYPES = {"featuredSlugs": list, "championSpotlight": dict, "eventChampions": list, "podium2025": list, "previousEditions": list}


@router.put("/content/{key}", tags=["admin: content"], summary="Replace an editable JSON content block")
def put_content(key: str, value: Any = Body(...), db: Database = Depends(get_db), _: Record = Depends(require_admin)):
    expected = _CONTENT_TYPES.get(key)
    if expected is None:
        raise HTTPException(404, f"Unknown content key. Valid keys: {', '.join(_CONTENT_TYPES)}")
    if not isinstance(value, expected):
        raise HTTPException(422, f"'{key}' must be a JSON {'array' if expected is list else 'object'}")
    if key == "featuredSlugs":
        missing = [slug for slug in value if not isinstance(slug, str) or get_record(db, "events", slug) is None]
        if missing:
            raise HTTPException(422, f"Unknown event slugs: {missing}")
    fest.set_content(db, key, value)
    return fest.get_content(db, key)


_ALLOWED = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif",
            "image/svg+xml": ".svg", "image/gif": ".gif"}


@router.post("/uploads", tags=["admin: uploads"], summary="Upload an image; use the returned URL in content")
async def upload(file: UploadFile = File(...), _: Record = Depends(require_admin)):
    ext = _ALLOWED.get(file.content_type or "")
    if ext is None:
        raise HTTPException(415, "Only JPG, PNG, WEBP, AVIF, GIF or SVG images are allowed")
    data = await file.read(settings.max_upload_mb * 1024 * 1024 + 1)
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(413, f"File is larger than {settings.max_upload_mb} MB")
    media = Path(settings.media_dir)
    media.mkdir(parents=True, exist_ok=True)
    name = uuid.uuid4().hex + ext
    (media / name).write_bytes(data)
    return {"url": f"{settings.public_base_url.rstrip('/')}/media/{name}", "filename": name}
