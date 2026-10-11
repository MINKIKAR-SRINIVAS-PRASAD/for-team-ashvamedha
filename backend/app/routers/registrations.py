import csv
import io
import re
import secrets
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pymongo.database import Database

from app.config import settings
from app.database import delete_record, find_records, get_db, get_record, next_sequence, write_record
from app.models import Record
from app.schemas import RegistrationIn, RegistrationUpdate
from app.security import can_manage_event, ensure_event_access, get_current_user, registration_limiter, require_admin
from app.services.fest import events_map, registration_out

router = APIRouter(prefix="/api", tags=["registrations"])
_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def _new_code(db: Database) -> str:
    while True:
        code = "ASV26-" + "".join(secrets.choice(_CODE_ALPHABET) for _ in range(6))
        if not db.registrations.find_one({"code": code}, {"_id": 1}):
            return code


def _fee_required(entry_fee: str) -> bool:
    fee = (entry_fee or "").lower()
    return bool(re.search(r"[1-9]", fee)) and "free" not in fee


@router.post("/registrations", status_code=201, dependencies=[Depends(registration_limiter)])
def register(body: RegistrationIn, db: Database = Depends(get_db)):
    if not settings.registrations_open:
        raise HTTPException(409, "The ASHVAMEDHA 2026 registration portal is closed.")
    if body.website:
        return {"code": "ASV26-XXXXXX", "status": "submitted", "paymentStatus": "pending"}

    event = get_record(db, "events", body.event_slug)
    if event is None:
        raise HTTPException(404, "That event does not exist")
    if event.get("registration", "open") == "closed":
        raise HTTPException(409, f"Entries for {event.name} are closed")

    count = 1 + len(body.members)
    lo, hi = event.get("min_team_size", 1), event.get("max_team_size", 1)
    if not (lo <= count <= hi):
        need = f"{lo}" if lo == hi else f"{lo}–{hi}"
        raise HTTPException(422, f"{event.name} needs {need} participant(s) including the captain; you entered {count}")
    if lo > 1 and not body.team_name:
        raise HTTPException(422, "Team name is required for this event")

    active_statuses = ["submitted", "confirmed"]
    if db.registrations.find_one({"event_slug": event.slug, "email_lower": body.email.lower(), "status": {"$in": active_statuses}}):
        existing = db.registrations.find_one({"event_slug": event.slug, "email_lower": body.email.lower(), "status": {"$in": active_statuses}}, {"code": 1})
        raise HTTPException(409, f"This email is already registered for {event.name} (code {existing['code']})")
    if body.team_name:
        taken = db.registrations.find_one({"event_slug": event.slug, "team_name_lower": body.team_name.lower(), "status": {"$in": active_statuses}})
        if taken:
            raise HTTPException(409, "That team name is already taken for this event")

    if not _fee_required(event.get("entry_fee", "")):
        payment_status = "not_required"
    elif body.payment_reference:
        payment_status = "submitted"
    else:
        payment_status = "pending"

    now = datetime.utcnow()
    reg = {
        "id": next_sequence(db, "registrations", "registrations"),
        "code": _new_code(db),
        "event_slug": event.slug,
        "team_name": body.team_name,
        "team_name_lower": body.team_name.lower() if body.team_name else "",
        "captain_name": body.captain_name,
        "email": body.email,
        "email_lower": body.email.lower(),
        "phone": body.phone,
        "institution": body.institution,
        "department": body.department,
        "roll_number": body.roll_number,
        "members": [member.model_dump(by_alias=True) for member in body.members],
        "participant_count": count,
        "payment_reference": body.payment_reference,
        "payment_status": payment_status,
        "status": "submitted",
        "admin_notes": "",
        "created_at": now,
        "updated_at": now,
    }
    write_record(db, "registrations", reg)
    return {"code": reg["code"], "eventName": event.name, "status": reg["status"],
            "paymentStatus": reg["payment_status"], "entryFee": event.get("entry_fee", "")}


@router.get("/registrations/status", summary="Look up your own registration (code + email)")
def registration_status(code: str, email: str, db: Database = Depends(get_db)):
    reg = db.registrations.find_one({"code": code.strip().upper(), "email_lower": email.strip().lower()})
    from app.models import as_record
    reg = as_record(reg, "registrations")
    if reg is None:
        raise HTTPException(404, "No registration found for that code and email")
    event = get_record(db, "events", reg.event_slug)
    return {"code": reg.code, "eventName": event.name if event else reg.event_slug,
            "teamName": reg.get("team_name"), "status": reg.status,
            "paymentStatus": reg.get("payment_status", "pending"), "createdAt": registration_out(reg)["createdAt"]}


def _filtered_query(user: Record, event: Optional[str], status: Optional[str], q: Optional[str]) -> dict:
    clauses: list[dict] = []
    if user.role != "admin":
        clauses.append({"event_slug": {"$in": user.get("event_slugs") or ["__none__"]}})
    if event:
        clauses.append({"event_slug": event})
    if status:
        clauses.append({"status": status})
    if q:
        pattern = re.escape(q.strip())
        clauses.append({"$or": [{field: {"$regex": pattern, "$options": "i"}} for field in
                                  ("code", "captain_name", "email", "team_name", "phone")]})
    return {"$and": clauses} if clauses else {}


@router.get("/admin/registrations")
def admin_list_registrations(
    event: Optional[str] = None,
    status: Optional[str] = None,
    q: Optional[str] = None,
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    db: Database = Depends(get_db),
    user: Record = Depends(get_current_user),
):
    base = _filtered_query(user, event, status, q)
    total = db.registrations.count_documents(base)
    rows = find_records(db, "registrations", base, sort=[("created_at", -1)], limit=limit, skip=offset)
    ev = events_map(db)
    return {"total": total, "items": [registration_out(row, ev) for row in rows]}


@router.get("/admin/registrations/stats")
def admin_registration_stats(db: Database = Depends(get_db), user: Record = Depends(get_current_user)):
    out: dict[str, dict[str, int]] = {}
    for row in db.registrations.aggregate([
        {"$group": {"_id": {"event_slug": "$event_slug", "status": "$status"}, "count": {"$sum": 1}}}
    ]):
        slug, state, count = row["_id"]["event_slug"], row["_id"]["status"], row["count"]
        if can_manage_event(user, slug):
            out.setdefault(slug, {})[state] = count
    return out


@router.get("/admin/registrations/export.csv")
def admin_export_registrations(
    event: Optional[str] = None,
    status: Optional[str] = None,
    db: Database = Depends(get_db),
    user: Record = Depends(get_current_user),
):
    rows = find_records(db, "registrations", _filtered_query(user, event, status, None), sort=[("created_at", -1)])
    ev = events_map(db)
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Code", "Event", "Team", "Captain", "Email", "Phone", "Institution", "Department",
                     "Roll No", "Members", "Participants", "Payment Ref", "Payment Status", "Status", "Notes", "Registered At (UTC)"])
    for row in rows:
        members = "; ".join(f"{member.get('name', '')}" + (f" ({member.get('rollNumber')})" if member.get("rollNumber") else "")
                             for member in (row.get("members") or []))
        created_at = row.get("created_at")
        created_text = created_at.strftime("%Y-%m-%d %H:%M") if hasattr(created_at, "strftime") else str(created_at or "")
        writer.writerow([row.code, ev[row.event_slug].name if row.event_slug in ev else row.event_slug,
                         row.get("team_name") or "", row.captain_name, row.email, row.phone, row.institution,
                         row.get("department", ""), row.get("roll_number", ""), members,
                         row.get("participant_count", 1), row.get("payment_reference", ""), row.get("payment_status", "pending"),
                         row.get("status", "submitted"), row.get("admin_notes", ""), created_text])
    buf.seek(0)
    filename = f"registrations-{event or 'all'}.csv"
    return StreamingResponse(iter([buf.getvalue()]), media_type="text/csv",
                             headers={"Content-Disposition": f'attachment; filename="{filename}"'})


@router.patch("/admin/registrations/{reg_id}")
def admin_update_registration(
    reg_id: int,
    body: RegistrationUpdate,
    db: Database = Depends(get_db),
    user: Record = Depends(get_current_user),
):
    reg = get_record(db, "registrations", reg_id)
    if reg is None:
        raise HTTPException(404, "Registration not found")
    ensure_event_access(user, reg.event_slug)
    for field, value in body.model_dump(exclude_unset=True).items():
        if value is not None:
            reg[field] = value
    reg.updated_at = datetime.utcnow()
    write_record(db, "registrations", reg)
    return registration_out(reg, events_map(db))


@router.delete("/admin/registrations/{reg_id}", status_code=204, dependencies=[Depends(require_admin)])
def admin_delete_registration(reg_id: int, db: Database = Depends(get_db)):
    if get_record(db, "registrations", reg_id) is None:
        raise HTTPException(404, "Registration not found")
    delete_record(db, "registrations", reg_id)
    return None
