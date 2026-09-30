import csv
import io
import re
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Event, Registration, User
from app.schemas import RegistrationIn, RegistrationUpdate
from app.security import (
    can_manage_event,
    ensure_event_access,
    get_current_user,
    registration_limiter,
    require_admin,
)
from app.services.fest import events_map, registration_out

router = APIRouter(prefix="/api", tags=["registrations"])

_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # no 0/O/1/I confusion


def _new_code(db: Session) -> str:
    while True:
        code = "ASV26-" + "".join(secrets.choice(_CODE_ALPHABET) for _ in range(6))
        if not db.scalar(select(Registration.id).where(Registration.code == code)):
            return code


def _fee_required(entry_fee: str) -> bool:
    fee = (entry_fee or "").lower()
    return bool(re.search(r"[1-9]", fee)) and "free" not in fee


# ── Public ──────────────────────────────────────────────────────────────────


@router.post("/registrations", status_code=201, dependencies=[Depends(registration_limiter)])
def register(body: RegistrationIn, db: Session = Depends(get_db)):
    if body.website:  # honeypot tripped -> pretend success, store nothing
        return {"code": "ASV26-XXXXXX", "status": "submitted", "paymentStatus": "pending"}

    event = db.get(Event, body.event_slug)
    if event is None:
        raise HTTPException(404, "That event does not exist")
    if event.registration == "closed":
        raise HTTPException(409, f"Entries for {event.name} are closed")

    count = 1 + len(body.members)
    lo, hi = event.min_team_size, event.max_team_size
    if not (lo <= count <= hi):
        need = f"{lo}" if lo == hi else f"{lo}–{hi}"
        raise HTTPException(
            422,
            f"{event.name} needs {need} participant(s) including the captain; you entered {count}",
        )
    if lo > 1 and not body.team_name:
        raise HTTPException(422, "Team name is required for this event")

    duplicate = db.scalar(
        select(Registration.code).where(
            Registration.event_slug == event.slug,
            Registration.email == body.email,
            Registration.status.in_(["submitted", "confirmed"]),
        )
    )
    if duplicate:
        raise HTTPException(409, f"This email is already registered for {event.name} (code {duplicate})")

    if body.team_name:
        taken = db.scalar(
            select(Registration.id).where(
                Registration.event_slug == event.slug,
                func.lower(Registration.team_name) == body.team_name.lower(),
                Registration.status.in_(["submitted", "confirmed"]),
            )
        )
        if taken:
            raise HTTPException(409, "That team name is already taken for this event")

    if not _fee_required(event.entry_fee):
        payment_status = "not_required"
    elif body.payment_reference:
        payment_status = "submitted"
    else:
        payment_status = "pending"

    reg = Registration(
        code=_new_code(db),
        event_slug=event.slug,
        team_name=body.team_name,
        captain_name=body.captain_name,
        email=body.email,
        phone=body.phone,
        institution=body.institution,
        department=body.department,
        roll_number=body.roll_number,
        members=[m.model_dump(by_alias=True) for m in body.members],
        participant_count=count,
        payment_reference=body.payment_reference,
        payment_status=payment_status,
    )
    db.add(reg)
    db.commit()
    return {
        "code": reg.code,
        "eventName": event.name,
        "status": reg.status,
        "paymentStatus": reg.payment_status,
        "entryFee": event.entry_fee,
    }


@router.get("/registrations/status", summary="Look up your own registration (code + email)")
def registration_status(code: str, email: str, db: Session = Depends(get_db)):
    reg = db.scalar(
        select(Registration).where(
            Registration.code == code.strip().upper(),
            Registration.email == email.strip().lower(),
        )
    )
    if reg is None:
        raise HTTPException(404, "No registration found for that code and email")
    ev = db.get(Event, reg.event_slug)
    return {
        "code": reg.code,
        "eventName": ev.name if ev else reg.event_slug,
        "teamName": reg.team_name,
        "status": reg.status,
        "paymentStatus": reg.payment_status,
        "createdAt": registration_out(reg)["createdAt"],
    }


# ── Admin / coordinators ────────────────────────────────────────────────────


def _filtered_query(user: User, event: Optional[str], status: Optional[str], q: Optional[str]):
    query = select(Registration).order_by(Registration.created_at.desc())
    if user.role != "admin":
        query = query.where(Registration.event_slug.in_(user.event_slugs or ["__none__"]))
    if event:
        query = query.where(Registration.event_slug == event)
    if status:
        query = query.where(Registration.status == status)
    if q:
        like = f"%{q.lower()}%"
        query = query.where(
            or_(
                func.lower(Registration.code).like(like),
                func.lower(Registration.captain_name).like(like),
                func.lower(Registration.email).like(like),
                func.lower(Registration.team_name).like(like),
                Registration.phone.like(like),
            )
        )
    return query


@router.get("/admin/registrations")
def admin_list_registrations(
    event: Optional[str] = None,
    status: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    base = _filtered_query(user, event, status, q)
    total = db.scalar(select(func.count()).select_from(base.order_by(None).subquery()))
    rows = db.scalars(base.limit(limit).offset(offset))
    ev = events_map(db)
    return {"total": total, "items": [registration_out(r, ev) for r in rows]}


@router.get("/admin/registrations/stats")
def admin_registration_stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = select(Registration.event_slug, Registration.status, func.count()).group_by(
        Registration.event_slug, Registration.status
    )
    out: dict[str, dict[str, int]] = {}
    for slug, status, n in db.execute(q):
        if can_manage_event(user, slug):
            out.setdefault(slug, {})[status] = n
    return out


@router.get("/admin/registrations/export.csv")
def admin_export_registrations(
    event: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    rows = db.scalars(_filtered_query(user, event, status, None))
    ev = events_map(db)
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow([
        "Code", "Event", "Team", "Captain", "Email", "Phone", "Institution", "Department",
        "Roll No", "Members", "Participants", "Payment Ref", "Payment Status", "Status",
        "Notes", "Registered At (UTC)",
    ])
    for r in rows:
        members = "; ".join(
            f"{m.get('name', '')}" + (f" ({m.get('rollNumber')})" if m.get("rollNumber") else "")
            for m in (r.members or [])
        )
        w.writerow([
            r.code, ev[r.event_slug].name if r.event_slug in ev else r.event_slug, r.team_name or "",
            r.captain_name, r.email, r.phone, r.institution, r.department, r.roll_number, members,
            r.participant_count, r.payment_reference, r.payment_status, r.status, r.admin_notes,
            r.created_at.strftime("%Y-%m-%d %H:%M"),
        ])
    buf.seek(0)
    name = f"registrations-{event or 'all'}.csv"
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{name}"'},
    )


@router.patch("/admin/registrations/{reg_id}")
def admin_update_registration(
    reg_id: int,
    body: RegistrationUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    reg = db.get(Registration, reg_id)
    if reg is None:
        raise HTTPException(404, "Registration not found")
    ensure_event_access(user, reg.event_slug)
    for field, value in body.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(reg, field, value)
    db.commit()
    return registration_out(reg, events_map(db))


@router.delete("/admin/registrations/{reg_id}", status_code=204, dependencies=[Depends(require_admin)])
def admin_delete_registration(reg_id: int, db: Session = Depends(get_db)):
    reg = db.get(Registration, reg_id)
    if reg is None:
        raise HTTPException(404, "Registration not found")
    db.delete(reg)
    db.commit()
