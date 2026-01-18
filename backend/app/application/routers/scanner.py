from fastapi import APIRouter
from pydantic import BaseModel
import httpx
import ssl
import socket
import datetime
from typing import List, Dict, Any

router = APIRouter(prefix="/api/v1/scanner", tags=["scanner"])

class ScanRequest(BaseModel):
    url: str

class Finding(BaseModel):
    id: int
    title: str
    status: str
    icon: str
    color: str
    detail: str

class ScanResponse(BaseModel):
    domain: str
    score: int
    findings: List[Finding]

def check_typosquatting(domain: str) -> Dict[str, Any]:
    # Simplified typosquatting check (can be expanded)
    protected_domains = ["google.com", "microsoft.com", "secureguard.ai"]
    for protected in protected_domains:
        if domain == protected:
            continue
        
        # Check for lookalikes (simple distance or character swap)
        norm_domain = domain.replace('0', 'o').replace('1', 'i').replace('l', 'i')
        norm_protected = protected.replace('0', 'o').replace('1', 'i').replace('l', 'i')
        
        if norm_domain == norm_protected:
            return {"is_typosquat": True, "target": protected}
    return {"is_typosquat": False}

async def check_ssl(domain: str) -> Dict[str, Any]:
    try:
        context = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                # Check expiry
                not_after_str = cert.get('notAfter')
                not_after = datetime.datetime.strptime(not_after_str, '%b %d %H:%M:%S %Y %Z')
                if not_after > datetime.datetime.utcnow():
                    return {"status": "Secure", "detail": f"Certificate is valid until {not_after_str}."}
                else:
                    return {"status": "Expired", "detail": "Certificate has expired."}
    except Exception as e:
        return {"status": "Critical", "detail": f"SSL Check failed: {str(e)}"}

@router.post("/scan", response_model=ScanResponse)
async def run_scan(request: ScanRequest):
    from urllib.parse import urlparse
    
    # SECURITY: Always enforce HTTPS for security scanning
    # We normalize user input to HTTPS to ensure secure connections
    target_url = request.url.strip()
    
    # Remove any existing scheme and enforce HTTPS
    if target_url.startswith('http://'):
        # Replace insecure HTTP with HTTPS
        target_url = target_url.replace('http://', 'https://', 1)
    elif not target_url.startswith('https://'):
        # Add HTTPS if no scheme provided
        target_url = f"https://{target_url}"
        
    parsed = urlparse(target_url)
    domain = parsed.netloc or parsed.path  # fallback if no scheme
    domain = domain.split(':')[0] # Remove port if present

    findings = []
    score = 100

    # 1. SSL Check
    ssl_result = await check_ssl(domain)
    findings.append(Finding(
        id=1,
        title="SSL Certificate",
        status=ssl_result["status"],
        icon="Lock",
        color="text-emerald-500" if ssl_result["status"] == "Secure" else "text-red-500",
        detail=ssl_result["detail"]
    ))
    if ssl_result["status"] != "Secure":
        score -= 20

    # 2. Header Checks
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"https://{domain}")
            headers = response.headers

            # HSTS
            hsts = headers.get("Strict-Transport-Security")
            findings.append(Finding(
                id=2,
                title="HSTS Header",
                status="Secure" if hsts else "Missing",
                icon="Shield",
                color="text-emerald-500" if hsts else "text-orange-500",
                detail="Strict-Transport-Security header is present." if hsts else "HSTS is not enabled, allowing potential downgrade attacks."
            ))
            if not hsts:
                score -= 10

            # XSS Protection
            xss = headers.get("X-XSS-Protection")
            findings.append(Finding(
                id=3,
                title="XSS Protection",
                status="Enabled" if xss else "Missing",
                icon="Shield",
                color="text-emerald-500" if xss else "text-blue-500",
                detail="X-XSS-Protection header is correctly configured." if xss else "Cross-Site Scripting protection header is missing."
            ))

            # Content Type Options
            nosniff = headers.get("X-Content-Type-Options")
            findings.append(Finding(
                id=4,
                title="MIME Sniffing",
                status="Protected" if nosniff == "nosniff" else "Risky",
                icon="Activity",
                color="text-emerald-500" if nosniff == "nosniff" else "text-yellow-500",
                detail="X-Content-Type-Options: nosniff is set." if nosniff == "nosniff" else "MIME type sniffing is not disabled."
            ))

    except Exception as e:
        findings.append(Finding(
            id=5,
            title="Availability",
            status="Error",
            icon="AlertTriangle",
            color="text-red-500",
            detail=f"Could not reach domain: {str(e)}"
        ))
        score = 0

    # 3. Typosquatting
    typo_res = check_typosquatting(domain)
    findings.append(Finding(
        id=6,
        title="Typosquatting",
        status="Danger" if typo_res["is_typosquat"] else "Clear",
        icon="Globe",
        color="text-red-500" if typo_res["is_typosquat"] else "text-emerald-500",
        detail=f"Domain looks like {typo_res['target']}!" if typo_res["is_typosquat"] else "No high-risk lookalike domains detected."
    ))
    if typo_res["is_typosquat"]:
        score -= 40

    return ScanResponse(
        domain=domain,
        score=max(0, score),
        findings=findings
    )
