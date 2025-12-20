"""
API Key Management Router
Allows users to generate and manage API keys for widget integration
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from backend.app.infrastructure.database.setup import get_db
from backend.app.infrastructure.database.models import APIKeyModel
from backend.app.core.security import get_current_user
import uuid
import secrets

router = APIRouter(prefix="/api/v1/api-keys", tags=["api-keys"])

class CreateAPIKeyRequest(BaseModel):
    name: str

class APIKeyResponse(BaseModel):
    id: str
    name: str
    key: str
    is_active: bool
    created_at: str
    usage_count: int

@router.post("/generate", response_model=APIKeyResponse)
async def generate_api_key(
    request: CreateAPIKeyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Generate a new API key for the user"""
    
    # Generate secure random key
    api_key = f"sg_{secrets.token_urlsafe(32)}"
    key_id = str(uuid.uuid4())
    
    # Create API key record
    key_record = APIKeyModel(
        id=key_id,
        user_id=current_user,
        key=api_key,
        name=request.name,
        is_active=True,
        usage_count=0
    )
    
    db.add(key_record)
    await db.commit()
    
    return APIKeyResponse(
        id=key_id,
        name=request.name,
        key=api_key,
        is_active=True,
        created_at=key_record.created_at.isoformat(),
        usage_count=0
    )

@router.get("/list")
async def list_api_keys(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """List all API keys for the current user"""
    from sqlalchemy import select
    
    result = await db.execute(
        select(APIKeyModel)
        .where(APIKeyModel.user_id == current_user)
        .order_by(APIKeyModel.created_at.desc())
    )
    keys = result.scalars().all()
    
    return [{
        "id": key.id,
        "name": key.name,
        "key": key.key[:10] + "..." if key.key else "",  # Mask the key
        "is_active": key.is_active,
        "created_at": key.created_at.isoformat(),
        "last_used_at": key.last_used_at.isoformat() if key.last_used_at else None,
        "usage_count": key.usage_count
    } for key in keys]

@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Revoke (deactivate) an API key"""
    from sqlalchemy import select, update
    
    # Verify ownership
    result = await db.execute(
        select(APIKeyModel)
        .where(APIKeyModel.id == key_id)
        .where(APIKeyModel.user_id == current_user)
    )
    key = result.scalar_one_or_none()
    
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")
    
    # Deactivate the key
    await db.execute(
        update(APIKeyModel)
        .where(APIKeyModel.id == key_id)
        .values(is_active=False)
    )
    await db.commit()
    
    return {"message": "API key revoked successfully"}
