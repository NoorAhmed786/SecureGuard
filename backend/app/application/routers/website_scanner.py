"""
Website Scanner API Router
Allows users to scan websites for security vulnerabilities
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.infrastructure.database.setup import get_db
from app.infrastructure.database.models import WebsiteScanModel
from app.infrastructure.security.security_scanner import scanner
from app.core.security import get_current_user
import uuid
from typing import Dict, Any

router = APIRouter(prefix="/api/v1/scanner", tags=["website-scanner"])

class ScanRequest(BaseModel):
    url: str

class ScanResponse(BaseModel):
    scan_id: str
    url: str
    security_score: float
    vulnerabilities_count: int
    vulnerabilities: list
    checks: Dict[str, Any]

@router.post("/scan-website", response_model=ScanResponse)
async def scan_website(
    request: ScanRequest,
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """
    Scan a website for security vulnerabilities
    Returns comprehensive security report
    """
    try:
        # Perform the scan
        scan_results = await scanner.scan_website(request.url)
        
        # Save scan to database
        scan_id = str(uuid.uuid4())
        scan_record = WebsiteScanModel(
            id=scan_id,
            user_id=current_user,
            url=scan_results["url"],
            scan_results=scan_results,
            security_score=scan_results["security_score"],
            vulnerabilities_found=scan_results["vulnerabilities_count"]
        )
        
        db.add(scan_record)
        await db.commit()
        
        return ScanResponse(
            scan_id=scan_id,
            url=scan_results["url"],
            security_score=scan_results["security_score"],
            vulnerabilities_count=scan_results["vulnerabilities_count"],
            vulnerabilities=scan_results["vulnerabilities"],
            checks=scan_results["checks"]
        )
    
    except Exception as e:
        print(f"Scan error: {e}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

@router.get("/history")
async def get_scan_history(
    db: AsyncSession = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get user's scan history"""
    from sqlalchemy import select
    
    result = await db.execute(
        select(WebsiteScanModel)
        .where(WebsiteScanModel.user_id == current_user)
        .order_by(WebsiteScanModel.scanned_at.desc())
        .limit(20)
    )
    scans = result.scalars().all()
    
    return [{
        "id": scan.id,
        "url": scan.url,
        "security_score": scan.security_score,
        "vulnerabilities_found": scan.vulnerabilities_found,
        "scanned_at": scan.scanned_at.isoformat()
    } for scan in scans]
