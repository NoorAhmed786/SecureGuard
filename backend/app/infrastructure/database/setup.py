from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
import os

# Using permanent SQLite for persistence
# Database is stored in the backend directory
# __file__ is in backend/app/infrastructure/database/setup.py
# We need to go up 3 levels to reach backend directory
db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..", "secureguard.db"))
# Normalize for Windows URI compatibility (forward slashes)
db_path = db_path.replace("\\", "/")
# Priority: use our calculated path to backend/secureguard.db
# This prevents outdated .env variables from pointing to non-existent folders
DATABASE_URL = f"sqlite+aiosqlite:///{db_path}"

engine = create_async_engine(
    DATABASE_URL, 
    echo=True,
    poolclass=NullPool,
    connect_args={"check_same_thread": False}
)

AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
