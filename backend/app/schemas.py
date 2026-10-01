"""
Request bodies. Every schema accepts camelCase (what the frontend uses) and
snake_case. Field names match model attributes, so validated data can be
written straight onto a row.
"""
import re
import secrets
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator
from pydantic.alias_generators import to_camel

Accent = Literal["crimson", "volt", "violet", "gold"]
Category = Literal["Team Sport", "Racquet", "Board & Mind", "Power & Fitness", "Chess"]
RegistrationState = Literal["open", "closing", "closed"]
Glyph = Literal[
    "football", "basketball", "Badminton", "tabletennis", "Lawn Tennis",
    "Kho-Kho", "Power Lifting", "chess", "Swimming", "volleyball",
]
SlotStatus = Literal["scheduled", "live", "completed"]
MatchStatus = Literal["upcoming", "live", "final"]
Winner = Literal["home", "away", "draw"]
GalleryCategory = Literal["MATCHDAY", "ATHLETES", "CROWD", "CHAMPIONS", "CAMPUS", "BEHIND THE SCENES"]
Span = Literal["tall", "wide", "square"]
SponsorTier = Literal["title", "powered", "partner"]
PaymentStatus = Literal["pending", "submitted", "verified", "rejected", "not_required"]
RegStatus = Literal["submitted", "confirmed", "rejected", "cancelled"]
Role = Literal["admin", "coordinator"]

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


def new_id(prefix: str = "") -> str:
    return prefix + secrets.token_hex(5)


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="ignore",
        str_strip_whitespace=True,
    )


def _check_slug(v: str) -> str:
    if not SLUG_RE.match(v):
        raise ValueError("must be lowercase letters, numbers and hyphens (e.g. 'table-tennis')")
    return v


# ── Content schemas ─────────────────────────────────────────────────────────


class EventIn(CamelModel):
    slug: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=120)
    arena: str = ""
    category: Category
    tagline: str = ""
    description: str = ""
    date: str = ""
    day: int = Field(1, ge=1, le=3)
    time: str = ""
    venue: str = ""
    team_size: str = ""
    min_team_size: int = Field(1, ge=1, le=50)
    max_team_size: int = Field(1, ge=1, le=50)
    registration: RegistrationState = "open"
    entry_fee: str = ""
    prize_pool: str = ""
    format: str = ""
    accent: Accent = "crimson"
    image: Optional[str] = None
    glyph: Glyph = "football"
    sort_order: int = 0

    validate_slug = field_validator("slug")(_check_slug)

    @model_validator(mode="after")
    def _sizes(self):
        if self.max_team_size < self.min_team_size:
            raise ValueError("maxTeamSize must be >= minTeamSize")
        return self


class TeamIn(CamelModel):
    slug: str = Field(min_length=1, max_length=80)
    name: str = Field(min_length=1, max_length=120)
    institution: str = ""
    department: str = ""
    captain: str = ""
    sport: str = ""
    accent: Accent = "crimson"
    crest: list[str] = Field(default_factory=lambda: ["#e11d2e", "#4a0710"], min_length=2, max_length=2)
    motto: str = ""
    sort_order: int = 0

    validate_slug = field_validator("slug")(_check_slug)


class StandingIn(CamelModel):
    team_slug: str
    team_name: str
    matches: int = Field(0, ge=0)
    wins: int = Field(0, ge=0)
    losses: int = Field(0, ge=0)
    points: int = 0
    win_pct: Optional[float] = Field(None, ge=0, le=100)


class ScheduleDayIn(CamelModel):
    day: int = Field(ge=1, le=10)
    label: str
    date: str
    headline: str = ""
    note: str = ""


class ScheduleSlotIn(CamelModel):
    id: str = Field(default_factory=lambda: new_id("slot-"))
    day: int = Field(ge=1, le=10)
    time: str
    title: str = Field(min_length=1)
    venue: str = ""
    event_slug: Optional[str] = None
    stage: str = ""
    status: SlotStatus = "scheduled"
    duration: str = ""

    @field_validator("time")
    @classmethod
    def _time(cls, v: str) -> str:
        if not re.match(r"^([01]\d|2[0-3]):[0-5]\d$", v):
            raise ValueError("time must be 24h HH:MM, e.g. '09:30'")
        return v


class GalleryItemIn(CamelModel):
    id: str = Field(default_factory=lambda: new_id("g-"))
    title: str = Field(min_length=1)
    category: GalleryCategory
    image: Optional[str] = None
    caption: str = ""
    span: Span = "square"
    accent: Accent = "crimson"
    sort_order: int = 0


class SponsorIn(CamelModel):
    name: str = Field(min_length=1)
    logo: Optional[str] = None
    wordmark: str = ""
    tier: SponsorTier = "partner"
    note: Optional[str] = None
    sort_order: int = 0

    @model_validator(mode="after")
    def _wordmark(self):
        if not self.wordmark:
            self.wordmark = self.name.upper()
        return self


# ── Matches ─────────────────────────────────────────────────────────────────


class MatchIn(CamelModel):
    id: str = Field(default_factory=lambda: new_id("m-"))
    event_slug: str
    home_name: str = Field(min_length=1)
    home_team_slug: Optional[str] = None
    home_score: str = ""
    away_name: str = Field(min_length=1)
    away_team_slug: Optional[str] = None
    away_score: str = ""
    status: MatchStatus = "upcoming"
    clock: str = ""
    detail: str = ""
    stage: str = ""
    winner: Optional[Winner] = None
    result_summary: str = ""
    counts_for_standings: bool = True
    sort_order: int = 0

    @field_validator("home_score", "away_score", mode="before")
    @classmethod
    def _score_to_str(cls, v: Any) -> str:
        if v is None:
            return ""
        return str(v)


class ScoreDelta(CamelModel):
    side: Literal["home", "away"]
    delta: int = Field(ge=-100, le=100)


# ── Registrations ───────────────────────────────────────────────────────────

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_RE = re.compile(r"^(\+?91[\s-]?)?[6-9]\d{9}$")


class Member(CamelModel):
    name: str = Field(min_length=2, max_length=120)
    roll_number: str = Field("", max_length=40)


class RegistrationIn(CamelModel):
    event_slug: str
    team_name: Optional[str] = Field(None, max_length=120)
    captain_name: str = Field(min_length=2, max_length=120)
    email: str = Field(max_length=160)
    phone: str = Field(max_length=20)
    institution: str = Field(min_length=2, max_length=160)
    department: str = Field("", max_length=160)
    roll_number: str = Field("", max_length=40)
    members: list[Member] = Field(default_factory=list, max_length=49)
    payment_reference: str = Field("", max_length=80)
    # Honeypot: real users never fill this hidden field.
    website: str = ""

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        v = v.lower()
        if not EMAIL_RE.match(v):
            raise ValueError("enter a valid email address")
        return v

    @field_validator("phone")
    @classmethod
    def _phone(cls, v: str) -> str:
        compact = re.sub(r"[\s-]", "", v)
        if not PHONE_RE.match(compact):
            raise ValueError("enter a valid 10-digit Indian mobile number")
        return compact[-10:]

    @field_validator("team_name")
    @classmethod
    def _team(cls, v: Optional[str]) -> Optional[str]:
        return v or None


class RegistrationUpdate(CamelModel):
    status: Optional[RegStatus] = None
    payment_status: Optional[PaymentStatus] = None
    admin_notes: Optional[str] = None


# ── Auth / users ────────────────────────────────────────────────────────────


class LoginIn(CamelModel):
    username: str
    password: str


class UserCreate(CamelModel):
    username: str = Field(min_length=3, max_length=60)
    password: str = Field(min_length=8, max_length=128)
    role: Role = "coordinator"
    event_slugs: list[str] = Field(default_factory=list)


class UserUpdate(CamelModel):
    password: Optional[str] = Field(None, min_length=8, max_length=128)
    role: Optional[Role] = None
    event_slugs: Optional[list[str]] = None
    is_active: Optional[bool] = None
