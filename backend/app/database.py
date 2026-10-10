from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings

_url = settings.sqlalchemy_url
_connect_args = {"check_same_thread": False} if _url.startswith("sqlite") else {}

engine = create_engine(_url, connect_args=_connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def get_db() -> Iterator[Session]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def add_missing_columns() -> None:
    """
    create_all() never changes a table that already exists. When a new column is
    added to a model, add it to existing databases too (no data is touched).
    """
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            if not insp.has_table(table.name):
                continue
            have = {c["name"] for c in insp.get_columns(table.name)}
            for col in table.columns:
                if col.name in have:
                    continue
                ddl = col.type.compile(dialect=engine.dialect)
                default = col.default.arg if col.default is not None and not callable(col.default.arg) else None
                if default is None and str(ddl).upper() in {"JSON", "JSONB"}:
                    default_sql = " DEFAULT '[]'"
                elif isinstance(default, bool):
                    default_sql = f" DEFAULT {'TRUE' if default else 'FALSE'}"
                elif isinstance(default, (int, float)):
                    default_sql = f" DEFAULT {default}"
                elif isinstance(default, str):
                    default_sql = " DEFAULT '" + default.replace("'", "''") + "'"
                else:
                    default_sql = ""
                conn.execute(text(f'ALTER TABLE {table.name} ADD COLUMN {col.name} {ddl}{default_sql}'))
                print(f"[migrate] added column {table.name}.{col.name}")
