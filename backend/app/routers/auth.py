from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pymongo.database import Database

from app.database import delete_record, find_records, get_db, get_record, insert_record, next_sequence, write_record
from app.models import Record
from app.schemas import LoginIn, UserCreate, UserUpdate
from app.security import create_token, get_current_user, hash_password, login_limiter, require_admin, verify_password
from app.services.fest import user_out

router = APIRouter(prefix="/api", tags=["auth & users"])


@router.post("/auth/login", dependencies=[Depends(login_limiter)])
def login(body: LoginIn, db: Database = Depends(get_db)):
    user = db.users.find_one({"username_lower": body.username.lower()})
    from app.models import as_record
    user = as_record(user, "users")
    if user is None or not user.get("is_active", True) or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Wrong username or password")
    return {"accessToken": create_token(user), "tokenType": "bearer", "user": user_out(user)}


@router.get("/auth/me")
def me(user: Record = Depends(get_current_user)):
    return user_out(user)


@router.get("/admin/users", dependencies=[Depends(require_admin)])
def list_users(db: Database = Depends(get_db)):
    return [user_out(user) for user in find_records(db, "users", sort=[("username_lower", 1)])]


@router.post("/admin/users", status_code=201, dependencies=[Depends(require_admin)])
def create_user(body: UserCreate, db: Database = Depends(get_db)):
    username_lower = body.username.lower()
    if db.users.find_one({"username_lower": username_lower}):
        raise HTTPException(409, "Username already taken")
    user = {
        "id": next_sequence(db, "users", "users"),
        "username": body.username,
        "username_lower": username_lower,
        "password_hash": hash_password(body.password),
        "role": body.role,
        "event_slugs": body.event_slugs,
        "is_active": True,
        "created_at": datetime.utcnow(),
    }
    write_record(db, "users", user)
    return user_out(Record(user))


@router.patch("/admin/users/{user_id}")
def update_user(
    user_id: int,
    body: UserUpdate,
    db: Database = Depends(get_db),
    admin: Record = Depends(require_admin),
):
    user = get_record(db, "users", user_id)
    if user is None:
        raise HTTPException(404, "User not found")
    if user.id == admin.id and (body.role == "coordinator" or body.is_active is False):
        raise HTTPException(400, "You cannot demote or deactivate yourself")
    if body.username:
        username_lower = body.username.lower()
        if username_lower != user.username_lower and db.users.find_one({"username_lower": username_lower, "_id": {"$ne": user_id}}):
            raise HTTPException(409, "Username already taken")
        user.username = body.username
        user.username_lower = username_lower
    if body.password:
        user.password_hash = hash_password(body.password)
    if body.role is not None:
        user.role = body.role
    if body.event_slugs is not None:
        user.event_slugs = body.event_slugs
    if body.is_active is not None:
        user.is_active = body.is_active
    write_record(db, "users", user)
    return user_out(user)


@router.delete("/admin/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Database = Depends(get_db), admin: Record = Depends(require_admin)):
    user = get_record(db, "users", user_id)
    if user is None:
        raise HTTPException(404, "User not found")
    if user.id == admin.id:
        raise HTTPException(400, "You cannot delete yourself")
    delete_record(db, "users", user_id)
    return None
