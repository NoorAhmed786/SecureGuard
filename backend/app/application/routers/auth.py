from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.database.setup import get_db
from app.infrastructure.database.user_repository import UserRepository, UserCreate
from app.core.security import (
    verify_password, 
    create_access_token
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register")
async def register_user(user: UserCreate, db=Depends(get_db)):
    repo = UserRepository(db)
    existing_user = await repo.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Force role to 'user' for public registration
    user.role = "user"
    await repo.create_user(user)
    return {"email": user.email, "msg": "User created successfully"}

@router.post("/login")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: AsyncSession = Depends(get_db)
):
    repo = UserRepository(db)
    user = await repo.get_user_by_email(form_data.username) 
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer"}
