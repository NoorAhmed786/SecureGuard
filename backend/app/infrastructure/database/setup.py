from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
import os

# Priority: use DATABASE_URL from environment (required for Docker/Postgres)
# Fallback to local SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # __file__ is in backend/app/infrastructure/database/setup.py
    # We need to go up 3 levels to reach backend directory
    db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..", "secureguard.db"))
    # Normalize for Windows URI compatibility (forward slashes)
    db_path = db_path.replace("\\", "/")
    DATABASE_URL = f"sqlite+aiosqlite:///{db_path}"

# For PostgreSQL, we need to ensure the driver is asyncpg
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Engine configuration
engine_kwargs = {
    "echo": True,
    "poolclass": NullPool,
}

# SQLite specific arguments
if DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}

engine = create_async_engine(DATABASE_URL, **engine_kwargs)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
