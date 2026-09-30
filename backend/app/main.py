from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import ValidationError

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import auth, content, matches, public, registrations
from app.seed import ensure_admin, seed_if_empty

STATIC_DIR = Path(__file__).resolve().parent / "static"


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        if settings.auto_seed:
            seed_if_empty(db)
        else:
            ensure_admin(db)
    if settings.secret_key.startswith("dev-only") or settings.admin_password in {"admin123", "change-me-now"}:
        print("[warning] Using default SECRET_KEY or ADMIN_PASSWORD. Set real values in .env before deploying!")
    yield


app = FastAPI(
    title="ASHVAMEDHA 2026 API",
    version="1.0.0",
    description=(
        "Backend for the ASHVAMEDHA 2026 sports-fest website. "
        "Public endpoints need no auth. For /api/admin/* routes, log in via POST /api/auth/login, "
        "then click **Authorize** and paste the accessToken."
    ),
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1024)


@app.exception_handler(ValidationError)
async def pydantic_validation_handler(_: Request, exc: ValidationError):
    """Validation errors raised inside route bodies (PATCH merges) -> clean 422."""
    return JSONResponse(
        status_code=422,
        content={"detail": [{"loc": list(e["loc"]), "msg": e["msg"], "type": e["type"]} for e in exc.errors()]},
    )


app.include_router(public.router)
app.include_router(auth.router)
app.include_router(registrations.router)
app.include_router(matches.router)
app.include_router(content.router)

Path(settings.media_dir).mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=settings.media_dir), name="media")


@app.get("/admin", include_in_schema=False)
def admin_panel():
    return FileResponse(STATIC_DIR / "admin.html")


@app.get("/", include_in_schema=False)
def root():
    return {"name": "ASHVAMEDHA 2026 API", "docs": "/docs", "admin": "/admin", "health": "/api/health"}
