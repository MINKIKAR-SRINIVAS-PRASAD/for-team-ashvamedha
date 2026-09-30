"""
Database tables.

Column names deliberately mirror the frontend's TypeScript fields (snake_case here,
camelCase in the API) so the API can return exactly the shapes in data/*.ts.
"""
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import JSON, Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Event(Base):
    __tablename__ = "events"

    slug: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    arena: Mapped[str] = mapped_column(String(120), default="")
    category: Mapped[str] = mapped_column(String(40))
    tagline: Mapped[str] = mapped_column(String(255), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    date: Mapped[str] = mapped_column(String(60), default="")
    day: Mapped[int] = mapped_column(Integer, default=1)
    time: Mapped[str] = mapped_column(String(60), default="")
    venue: Mapped[str] = mapped_column(String(120), default="")
    team_size: Mapped[str] = mapped_column(String(60), default="")
    min_team_size: Mapped[int] = mapped_column(Integer, default=1)
    max_team_size: Mapped[int] = mapped_column(Integer, default=1)
    registration: Mapped[str] = mapped_column(String(20), default="open")
    entry_fee: Mapped[str] = mapped_column(String(60), default="")
    prize_pool: Mapped[str] = mapped_column(String(60), default="")
    format: Mapped[str] = mapped_column(String(120), default="")
    accent: Mapped[str] = mapped_column(String(20), default="crimson")
    image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    glyph: Mapped[str] = mapped_column(String(40), default="football")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Team(Base):
    __tablename__ = "teams"

    slug: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    institution: Mapped[str] = mapped_column(String(160), default="")
    department: Mapped[str] = mapped_column(String(160), default="")
    captain: Mapped[str] = mapped_column(String(120), default="")
    sport: Mapped[str] = mapped_column(String(80), default="")
    accent: Mapped[str] = mapped_column(String(20), default="crimson")
    crest: Mapped[list[str]] = mapped_column(JSON, default=lambda: ["#e11d2e", "#4a0710"])
    motto: Mapped[str] = mapped_column(String(255), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Standing(Base):
    """
    Manual base values for the championship table. Results of finished matches
    are added on top of these automatically (see services/standings.py), so the
    table never needs hand-editing during the fest.
    """

    __tablename__ = "standings"

    team_slug: Mapped[str] = mapped_column(String(80), primary_key=True)
    team_name: Mapped[str] = mapped_column(String(120))
    matches: Mapped[int] = mapped_column(Integer, default=0)
    wins: Mapped[int] = mapped_column(Integer, default=0)
    losses: Mapped[int] = mapped_column(Integer, default=0)
    points: Mapped[int] = mapped_column(Integer, default=0)
    win_pct: Mapped[Optional[float]] = mapped_column(nullable=True)


class ScheduleDay(Base):
    __tablename__ = "schedule_days"

    day: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=False)
    label: Mapped[str] = mapped_column(String(40))
    date: Mapped[str] = mapped_column(String(40))
    headline: Mapped[str] = mapped_column(String(80), default="")
    note: Mapped[str] = mapped_column(String(255), default="")


class ScheduleSlot(Base):
    __tablename__ = "schedule_slots"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    day: Mapped[int] = mapped_column(Integer)
    time: Mapped[str] = mapped_column(String(5))
    title: Mapped[str] = mapped_column(String(160))
    venue: Mapped[str] = mapped_column(String(120), default="")
    event_slug: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    stage: Mapped[str] = mapped_column(String(80), default="")
    status: Mapped[str] = mapped_column(String(20), default="scheduled")
    duration: Mapped[str] = mapped_column(String(40), default="")


class Match(Base):
    """A fixture. Drives live scores, recent results and (when final) the standings."""

    __tablename__ = "matches"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    event_slug: Mapped[str] = mapped_column(String(80), index=True)
    home_name: Mapped[str] = mapped_column(String(120))
    home_team_slug: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    home_score: Mapped[str] = mapped_column(String(40), default="")
    away_name: Mapped[str] = mapped_column(String(120))
    away_team_slug: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    away_score: Mapped[str] = mapped_column(String(40), default="")
    status: Mapped[str] = mapped_column(String(20), default="upcoming", index=True)
    clock: Mapped[str] = mapped_column(String(40), default="")
    detail: Mapped[str] = mapped_column(String(160), default="")
    stage: Mapped[str] = mapped_column(String(80), default="")
    winner: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # home | away | draw
    result_summary: Mapped[str] = mapped_column(String(120), default="")
    counts_for_standings: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)


class GalleryItem(Base):
    __tablename__ = "gallery_items"

    id: Mapped[str] = mapped_column(String(60), primary_key=True)
    title: Mapped[str] = mapped_column(String(160))
    category: Mapped[str] = mapped_column(String(40))
    image: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    caption: Mapped[str] = mapped_column(String(500), default="")
    span: Mapped[str] = mapped_column(String(10), default="square")
    accent: Mapped[str] = mapped_column(String(20), default="crimson")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class Sponsor(Base):
    __tablename__ = "sponsors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(160))
    logo: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    wordmark: Mapped[str] = mapped_column(String(160), default="")
    tier: Mapped[str] = mapped_column(String(20), default="partner")
    note: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class ContentBlock(Base):
    """Free-form JSON content: champion spotlight, podium 2025, previous editions, …"""

    __tablename__ = "content_blocks"

    key: Mapped[str] = mapped_column(String(60), primary_key=True)
    value: Mapped[Any] = mapped_column(JSON)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class Registration(Base):
    __tablename__ = "registrations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    event_slug: Mapped[str] = mapped_column(String(80), index=True)
    team_name: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    captain_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(160), index=True)
    phone: Mapped[str] = mapped_column(String(20))
    institution: Mapped[str] = mapped_column(String(160))
    department: Mapped[str] = mapped_column(String(160), default="")
    roll_number: Mapped[str] = mapped_column(String(40), default="")
    members: Mapped[list[dict]] = mapped_column(JSON, default=list)
    participant_count: Mapped[int] = mapped_column(Integer, default=1)
    payment_reference: Mapped[str] = mapped_column(String(80), default="")
    # pending | submitted | verified | rejected | not_required
    payment_status: Mapped[str] = mapped_column(String(20), default="pending")
    # submitted | confirmed | rejected | cancelled
    status: Mapped[str] = mapped_column(String(20), default="submitted", index=True)
    admin_notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(60), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="coordinator")  # admin | coordinator
    event_slugs: Mapped[list[str]] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
