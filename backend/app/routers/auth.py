from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import LoginIn, UserCreate, UserUpdate
from app.security import (
    create_token,
    get_current_user,
    hash_password,
    login_limiter,
    require_admin,
    verify_password,
)
from app.services.fest import user_out

router = APIRouter(prefix="/api", tags=["auth & users"])


@router.post("/auth/login", dependencies=[Depends(login_limiter)])
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(func.lower(User.username) == body.username.lower()))
    if user is None or not user.is_active or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Wrong username or password")
    return {"accessToken": create_token(user), "tokenType": "bearer", "user": user_out(user)}


@router.get("/auth/me")
def me(user: User = Depends(get_current_user)):
    return user_out(user)


@router.get("/admin/users", dependencies=[Depends(require_admin)])
def list_users(db: Session = Depends(get_db)):
    return [user_out(u) for u in db.scalars(select(User).order_by(User.username))]


@router.post("/admin/users", status_code=201, dependencies=[Depends(require_admin)])
def create_user(body: UserCreate, db: Session = Depends(get_db)):
    if db.scalar(select(User).where(func.lower(User.username) == body.username.lower())):
        raise HTTPException(409, "Username already taken")
    u = User(
        username=body.username,
        password_hash=hash_password(body.password),
        role=body.role,
        event_slugs=body.event_slugs,
    )
    db.add(u)
    db.commit()
    return user_out(u)


@router.patch("/admin/users/{user_id}")
def update_user(
    user_id: int,
    body: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    u = db.get(User, user_id)
    if u is None:
        raise HTTPException(404, "User not found")
    if u.id == admin.id and (body.role == "coordinator" or body.is_active is False):
        raise HTTPException(400, "You cannot demote or deactivate yourself")
    if body.password:
        u.password_hash = hash_password(body.password)
    if body.role is not None:
        u.role = body.role
    if body.event_slugs is not None:
        u.event_slugs = body.event_slugs
    if body.is_active is not None:
        u.is_active = body.is_active
    db.commit()
    return user_out(u)


@router.delete("/admin/users/{user_id}", status_code=204)
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    u = db.get(User, user_id)
    if u is None:
        raise HTTPException(404, "User not found")
    if u.id == admin.id:
        raise HTTPException(400, "You cannot delete yourself")
    db.delete(u)
    db.commit()
