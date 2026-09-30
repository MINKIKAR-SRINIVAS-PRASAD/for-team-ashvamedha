"""
Admin CRUD for site content. One generic factory keeps every resource consistent:

  POST   /api/admin/<resource>          create (full body)
  PATCH  /api/admin/<resource>/{key}    partial update (send only what changes)
  DELETE /api/admin/<resource>/{key}

Bodies accept the same camelCase field names the frontend uses.
"""
import uuid
from pathlib import Path
from typing import Any, Callable, Literal

from fastapi import APIRouter, Body, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, get_db
from app.models import (
    Event,
    GalleryItem,
    Match,
    Registration,
    ScheduleDay,
    ScheduleSlot,
    Sponsor,
    Standing,
    Team,
    User,
)
from app.schemas import (
    EventIn,
    GalleryItemIn,
    ScheduleDayIn,
    ScheduleSlotIn,
    SponsorIn,
    StandingIn,
    TeamIn,
)
from app.security import ensure_event_access, get_current_user, require_admin
from app.services import fest

router = APIRouter(prefix="/api/admin", tags=["admin content"])

Access = Literal["admin", "event"]


def _columns(model: type[Base]) -> list[str]:
    return [c.key for c in model.__table__.columns]


def register_crud(
    resource: str,
    model: type[Base],
    schema: type[BaseModel],
    pk: str,
    serialize: Callable[[Any], dict],
    pk_type: type = str,
    access: Access = "admin",
    before_delete: Callable[[Session, Any], None] | None = None,
) -> None:
    cols = _columns(model)
    tag = [f"admin: {resource}"]

    def check(user: User, obj_or_data: Any) -> None:
        if access == "admin":
            if user.role != "admin":
                raise HTTPException(403, "Admin access required")
            return
        slug = obj_or_data.get("event_slug") if isinstance(obj_or_data, dict) else obj_or_data.event_slug
        ensure_event_access(user, slug)

    def load(db: Session, key: Any):
        obj = db.get(model, key)
        if obj is None:
            raise HTTPException(404, f"{resource[:-1] if resource.endswith('s') else resource} '{key}' not found")
        return obj

    def create(body: dict[str, Any] = Body(...), db: Session = Depends(get_db),
               user: User = Depends(get_current_user)):
        data = schema.model_validate(body).model_dump()
        check(user, data)
        if pk in data and db.get(model, data[pk]) is not None:
            raise HTTPException(409, f"'{data[pk]}' already exists")
        obj = model(**data)
        db.add(obj)
        db.commit()
        return serialize(obj)

    def update(key: pk_type, body: dict[str, Any] = Body(...),  # type: ignore[valid-type]
               db: Session = Depends(get_db), user: User = Depends(get_current_user)):
        obj = load(db, key)
        check(user, obj)
        current = {c: getattr(obj, c) for c in cols}
        data = schema.model_validate({**current, **body}).model_dump()
        data.pop(pk, None)  # primary keys never change
        check(user, {**current, **data})
        for k, v in data.items():
            if k in cols:
                setattr(obj, k, v)
        db.commit()
        return serialize(obj)

    def delete(key: pk_type, db: Session = Depends(get_db),  # type: ignore[valid-type]
               user: User = Depends(get_current_user)):
        obj = load(db, key)
        check(user, obj)
        if before_delete:
            before_delete(db, obj)
        db.delete(obj)
        db.commit()

    op = resource.replace("-", "_")
    router.add_api_route(f"/{resource}", create, methods=["POST"], status_code=201, tags=tag,
                         summary=f"Create {resource}", operation_id=f"create_{op}")
    router.add_api_route(f"/{resource}/{{key}}", update, methods=["PATCH"], tags=tag,
                         summary=f"Update {resource} (partial)", operation_id=f"update_{op}")
    router.add_api_route(f"/{resource}/{{key}}", delete, methods=["DELETE"], status_code=204, tags=tag,
                         summary=f"Delete {resource}", operation_id=f"delete_{op}")


def _event_in_use(db: Session, event: Event) -> None:
    if db.scalar(select(Registration.id).where(Registration.event_slug == event.slug).limit(1)):
        raise HTTPException(409, "This event has registrations. Set registration to 'closed' instead of deleting.")
    if db.scalar(select(Match.id).where(Match.event_slug == event.slug).limit(1)):
        raise HTTPException(409, "This event has matches. Delete its matches first.")


register_crud("events", Event, EventIn, "slug", fest.event_out, before_delete=_event_in_use)
register_crud("teams", Team, TeamIn, "slug", lambda t: fest.team_out(t))
register_crud("standings", Standing, StandingIn, "team_slug", fest.standing_out)
register_crud("schedule-days", ScheduleDay, ScheduleDayIn, "day", fest.day_out, pk_type=int)
# Coordinators may edit schedule slots of their own events (e.g. flip status to "live").
register_crud("schedule", ScheduleSlot, ScheduleSlotIn, "id", fest.slot_out, access="event")
register_crud("gallery", GalleryItem, GalleryItemIn, "id", fest.gallery_out)
register_crud("sponsors", Sponsor, SponsorIn, "id", fest.sponsor_out, pk_type=int)


@router.get("/standings", tags=["admin: standings"], summary="Manual base values (before match results)")
def list_standings(db: Session = Depends(get_db), _: User = Depends(require_admin)):
    return [fest.standing_out(s) for s in db.scalars(select(Standing).order_by(Standing.points.desc()))]


# ── Content blocks ──────────────────────────────────────────────────────────

_CONTENT_TYPES = {
    "featuredSlugs": list,
    "championSpotlight": dict,
    "eventChampions": list,
    "podium2025": list,
    "previousEditions": list,
}


@router.put("/content/{key}", tags=["admin: content"],
            summary="Replace a content block (featuredSlugs, championSpotlight, eventChampions, podium2025, previousEditions)")
def put_content(key: str, value: Any = Body(...), db: Session = Depends(get_db),
                _: User = Depends(require_admin)):
    expected = _CONTENT_TYPES.get(key)
    if expected is None:
        raise HTTPException(404, f"Unknown content key. Valid keys: {', '.join(_CONTENT_TYPES)}")
    if not isinstance(value, expected):
        raise HTTPException(422, f"'{key}' must be a JSON {'array' if expected is list else 'object'}")
    if key == "featuredSlugs":
        missing = [s for s in value if not isinstance(s, str) or db.get(Event, s) is None]
        if missing:
            raise HTTPException(422, f"Unknown event slugs: {missing}")
    fest.set_content(db, key, value)
    db.commit()
    return fest.get_content(db, key)


# ── Uploads ─────────────────────────────────────────────────────────────────

_ALLOWED = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/avif": ".avif",
            "image/svg+xml": ".svg", "image/gif": ".gif"}


@router.post("/uploads", tags=["admin: uploads"],
             summary="Upload an image; use the returned url in gallery/sponsor/event 'image' or 'logo'")
async def upload(file: UploadFile = File(...), _: User = Depends(require_admin)):
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

