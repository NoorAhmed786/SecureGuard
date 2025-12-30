from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.setup import get_db
from app.infrastructure.database.models import IncidentModel
from app.domain.entities.phishing import IncidentStatus, ThreatLevel
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/v1/simulation", tags=["simulation"])

@router.post("/blast")
async def blast_simulation(template_id: str, target_users: list[str], db: AsyncSession = Depends(get_db)):
    """Creates mock phishing incidents for target users."""
    templates = {
        "password_reset": {
            "subject": "Urgent: Password Reset Required",
            "body": "Your account has been compromised. Please reset your password at http://secureguard-verify.net/reset",
            "sender": "security-alerts@secureguard.ai"
        },
        "payment_failure": {
            "subject": "Action Required: Payment Method Failed",
            "body": "We could not process your last payment. Please update your billing info at http://secureguard-billing.net/update",
            "sender": "billing@secureguard.ai"
        }
    }
    
    if template_id not in templates:
        raise HTTPException(status_code=400, detail="Invalid template ID")
    
    template = templates[template_id]
    created_count = 0
    
    for user_id in target_users:
        incident = IncidentModel(
            id=str(uuid.uuid4()),
            user_id=user_id,
            sender_email=template["sender"],
            subject=template["subject"],
            raw_email_content=template["body"],
            urls_found=["http://simulation-link.test"],
            status=IncidentStatus.PENDING,
            threat_level=ThreatLevel.HIGH, # Simulations are always "threats" for training
            created_at=datetime.now(timezone.utc)
        )
        db.add(incident)
        created_count += 1
    
    await db.commit()
    return {"status": "success", "blasts_sent": created_count}

@router.post("/track-click")
async def track_simulation_click(incident_id: str, db: AsyncSession = Depends(get_db)):
    """Tracks if a user clicked the simulation link."""
    # In a real app, this would update user risk score
    return {"status": "tracked", "consequence": "User flagged for additional training"}
