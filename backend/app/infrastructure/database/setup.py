from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool
import os

# Using permanent SQLite for persistence without Docker
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./secureguard.db")

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
