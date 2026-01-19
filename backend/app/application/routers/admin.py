from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from app.infrastructure.database.setup import get_db
from app.infrastructure.database.user_repository import UserRepository, UserCreate
from app.infrastructure.database.models import UserModel, IncidentModel
from app.application.dependencies import get_websocket_manager
import json



router = APIRouter(prefix="/api/v1/admin", tags=["admin"])

@router.get("/users", response_model=List[Dict[str, Any]])
async def get_users(db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    users = await repo.get_all_users()
    
    # Get alert counts per user
    results = []
    
    
    for user in users:
        alert_count_result = await db.execute(
            select(func.count(IncidentModel.id)).where(IncidentModel.user_id == user.id)
        )
        alert_count = alert_count_result.scalar() or 0
        
        results.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "risk_score": user.risk_score,
            "subscription_status": user.subscription_status,
            "created_at": user.created_at.isoformat(),
            "alert_count": alert_count
        })
    return results

@router.get("/alerts", response_model=List[Dict[str, Any]])
async def get_all_alerts(db: AsyncSession = Depends(get_db)):
    # Simple join to get user info if available
    result = await db.execute(
        select(IncidentModel, UserModel.email, UserModel.full_name)
        .outerjoin(UserModel, IncidentModel.user_id == UserModel.id)
        .order_by(IncidentModel.detected_at.desc())
    )
    
    alerts = []
    for row in result.all():
        inc, user_email, user_full_name = row
        alerts.append({
            "id": inc.id,
            "user_email": user_email or "Unknown",
            "user_full_name": user_full_name or "Unknown",
            "sender": inc.sender_email,
            "subject": inc.subject,
            "status": inc.status.value,
            "threat_level": inc.threat_level.value,
            "confidence_score": inc.confidence_score,
            "detected_at": inc.detected_at.isoformat()
        })
    
    return alerts

@router.post("/users")
async def create_admin_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    repo = UserRepository(db)
    existing_user = await repo.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = await repo.create_user(user)
    return {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "msg": "User created successfully"
    }

@router.post("/broadcast-alert")
async def broadcast_alert(
    incident_id: str = Body(..., embed=True),
    custom_message: str = Body(None, embed=True),
    db: AsyncSession = Depends(get_db),
    manager = Depends(get_websocket_manager)
):
    """
    Broadcasts a high-priority security warning to all connected users.
    One-click remediation tool for admins.
    """
    # 1. Fetch incident details
    result = await db.execute(select(IncidentModel).where(IncidentModel.id == incident_id))
    incident = result.scalar_one_or_none()
    
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    # 2. Construct broadcast payload
    payload = {
        "type": "broadcast_warning",
        "title": "🚨 SECURITY ACTION REQUIRED",
        "message": custom_message or f"An active threat '{incident.subject}' was detected and blocked. Please remain vigilant.",
        "level": incident.threat_level.value.upper(),
        "timestamp": incident.detected_at.isoformat()
    }
    
    # 3. Broadcast via WebSocket
    await manager.broadcast(json.dumps(payload))
    
    return {"status": "success", "message": f"Security warning broadcasted for incident {incident_id}"}
