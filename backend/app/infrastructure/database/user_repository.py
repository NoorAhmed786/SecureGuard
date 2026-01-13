from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.infrastructure.database.models import UserModel as User
from app.core.security import get_password_hash
from pydantic import BaseModel
import uuid

class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str = "New User"
    role: str = "user"

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_by_email(self, email: str):
        result = await self.db.execute(select(User).where(User.email == email))
        return result.scalars().first()

    async def get_all_users(self):
        result = await self.db.execute(select(User).order_by(User.created_at.desc()))
        return result.scalars().all()

    async def create_user(self, user: UserCreate):
        hashed_password = get_password_hash(user.password)
        db_user = User(
            id=str(uuid.uuid4()),
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name,
            role=user.role
        )
        self.db.add(db_user)
        await self.db.commit()
        await self.db.refresh(db_user)
        return db_user
