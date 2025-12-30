from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.setup import get_db
from app.infrastructure.database.models import IncidentModel

from app.domain.entities.phishing import ThreatLevel

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])

@router.get("/all-alerts")
async def get_all_alerts(db: AsyncSession = Depends(get_db)):
    # Fetch all incidents ordered by date
    alerts_result = await db.execute(
        select(IncidentModel).order_by(IncidentModel.detected_at.desc())
    )
    incidents = alerts_result.scalars().all()
    
    alerts = []
    for inc in incidents:
        alerts.append({
            "id": inc.id,
            "title": f"Phishing Attempt: {inc.sender_email[:20]}...",
            "level": inc.threat_level.value.capitalize(),
            "time": inc.detected_at.isoformat(),
            "detail": inc.subject
        })

    return alerts

@router.get("/stats")
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # 1. Total Scans (Incidents)
    total_scans_result = await db.execute(select(func.count(IncidentModel.id)))
    total_scans = total_scans_result.scalar() or 0

    # 2. Threats Detected (High or Critical)
    threats_result = await db.execute(
        select(func.count(IncidentModel.id)).where(IncidentModel.threat_level.in_([ThreatLevel.HIGH, ThreatLevel.CRITICAL]))
    )
    threats_detected = threats_result.scalar() or 0

    # 3. Recent Alerts
    alerts_result = await db.execute(
        select(IncidentModel).order_by(IncidentModel.detected_at.desc()).limit(5)
    )
    recent_incidents = alerts_result.scalars().all()
    
    alerts = []
    for inc in recent_incidents:
        alerts.append({
            "id": inc.id,
            "title": f"Phishing Attempt: {inc.sender_email[:20]}...",
            "level": inc.threat_level.value.capitalize(),
            "time": inc.detected_at.isoformat(),
            "detail": inc.subject
        })

    return {
        "total_scans": total_scans,
        "threats_detected": threats_detected,
        "training_progress": 65,
        "security_score": 85,
        "alerts": alerts
    }
