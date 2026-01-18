"""
Widget API Router
Public API for embeddable JavaScript widget
Allows real-time URL checking from client websites
"""
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.infrastructure.database.setup import get_db
from app.infrastructure.database.models import APIKeyModel, WidgetEventModel
from app.infrastructure.threat_intel.google_safe_browsing import GoogleSafeBrowsingProvider
from app.infrastructure.ai.classifier import classifier
from datetime import datetime
import uuid
import os
from app.application.dependencies import get_websocket_manager

router = APIRouter(prefix="/api/v1/widget", tags=["widget"])

# Initialize threat provider
GOOGLE_SAFE_BROWSING_API_KEY = os.getenv("GOOGLE_SAFE_BROWSING_API_KEY", "mock")
threat_provider = GoogleSafeBrowsingProvider(api_key=GOOGLE_SAFE_BROWSING_API_KEY)

class URLCheckRequest(BaseModel):
    url: str

class URLCheckResponse(BaseModel):
    is_safe: bool
    threat_score: float  # 0.0 to 1.0
    threat_type: str  # 'safe', 'phishing', 'malware', 'suspicious'
    message: str

async def verify_api_key(
    x_api_key: str = Header(..., alias="X-API-Key"),
    db: AsyncSession = Depends(get_db)
) -> APIKeyModel:
    """Verify API key from header"""
    from sqlalchemy import select, update
    
    result = await db.execute(
        select(APIKeyModel)
        .where(APIKeyModel.key == x_api_key)
        .where(APIKeyModel.is_active.is_(True))
    )
    api_key = result.scalar_one_or_none()
    
    if not api_key:
        raise HTTPException(status_code=401, detail="Invalid or inactive API key")
    
    # Update last used timestamp and usage count
    await db.execute(
        update(APIKeyModel)
        .where(APIKeyModel.id == api_key.id)
        .values(
            last_used_at=datetime.utcnow(),
            usage_count=APIKeyModel.usage_count + 1
        )
    )
    await db.commit()
    
    return api_key



@router.post("/check-url", response_model=URLCheckResponse)
async def check_url(
    request: URLCheckRequest,
    db: AsyncSession = Depends(get_db),
    api_key: APIKeyModel = Depends(verify_api_key),
    manager = Depends(get_websocket_manager)
):
    """
    Check if a URL is safe (public endpoint for widget)
    Requires API key authentication
    """
    import asyncio
    from app.core.logging import logger

    try:
        url = request.url
        logger.info(f"Checking URL: {url}")
        
        # 1. Check with threat intelligence
        threat_check = await threat_provider.check_url(url)
        logger.info(f"Threat check result: {threat_check}")
        
        # 2. Use AI classifier for additional analysis (in thread pool to avoid blocking)
        loop = asyncio.get_event_loop()
        ai_score = await loop.run_in_executor(None, classifier.predict_score, f"URL: {url}")
        logger.info(f"AI score: {ai_score}")
        
        # Combine scores
        is_threat = not threat_check["safe"] or ai_score > 0.7
        threat_score = max(ai_score, 0.9 if not threat_check["safe"] else 0.0)
        
        # Determine threat type
        if not threat_check["safe"]:
            threat_type = threat_check.get("threat_type", "phishing")
        elif ai_score > 0.7:
            threat_type = "suspicious"
        else:
            threat_type = "safe"
        
        # Log the event
        event = WidgetEventModel(
            id=str(uuid.uuid4()),
            api_key_id=api_key.id,
            event_type="url_check",
            url_checked=url,
            is_threat=is_threat,
            threat_score=threat_score,
            event_metadata={"threat_check": threat_check}
        )
        db.add(event)
        await db.commit()
        
        # BROADCAST ALERT IF THREAT DETECTED
        if is_threat:
            print(f"Broadcasting threat alert for {url}")
            alert_message = f"New Threat Detected: {threat_type.upper()} attempt blocked from {url} (Score: {threat_score:.2f})"
            await manager.broadcast(alert_message)
        
        return URLCheckResponse(
            is_safe=not is_threat,
            threat_score=threat_score,
            threat_type=threat_type,
            message="URL appears safe" if not is_threat else f"Warning: Potential {threat_type} detected"
        )
    
    except Exception as e:
        # Avoid leaking full exception details in production
        from app.core.logging import logger
        logger.error(f"Widget URL check error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal security analysis failed")

@router.get("/analytics")
async def get_widget_analytics(
    db: AsyncSession = Depends(get_db),
    api_key: APIKeyModel = Depends(verify_api_key)
):
    """Get analytics for widget usage"""
    from sqlalchemy import select, func
    
    # Total checks
    total_result = await db.execute(
        select(func.count(WidgetEventModel.id))
        .where(WidgetEventModel.api_key_id == api_key.id)
    )
    total_checks = total_result.scalar()
    
    # Threats blocked
    threats_result = await db.execute(
        select(func.count(WidgetEventModel.id))
        .where(WidgetEventModel.api_key_id == api_key.id)
        .where(WidgetEventModel.is_threat.is_(True))
    )
    threats_blocked = threats_result.scalar()
    
    return {
        "total_checks": total_checks,
        "threats_blocked": threats_blocked,
        "safe_checks": total_checks - threats_blocked,
        "block_rate": (threats_blocked / total_checks * 100) if total_checks > 0 else 0
    }
