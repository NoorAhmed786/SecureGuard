"""
Security Scanner Infrastructure
Provides website vulnerability scanning capabilities
"""
import ssl
import socket
import requests
from urllib.parse import urlparse
from typing import Dict, Any
import re

class SecurityScanner:
    """Scans websites for security vulnerabilities"""
    
    def __init__(self):
        self.timeout = 10
        self.protected_brands = [
            "google.com", "microsoft.com", "apple.com", "amazon.com",
            "facebook.com", "paypal.com", "bank", "secure"
        ]
    
    async def scan_website(self, url: str) -> Dict[str, Any]:
        """
        Comprehensive security scan of a website
        Returns detailed vulnerability report
        """
        results = {
            "url": url,
            "vulnerabilities": [],
            "security_score": 100,  # Start at 100, deduct for issues
            "checks": {}
        }
        
        # SECURITY: Always enforce HTTPS for security scanning
        # We normalize user input to HTTPS to ensure secure connections
        # Use urlparse to safely detect and upgrade scheme
        parsed = urlparse(url)
        if not parsed.scheme:
            # No scheme provided, prepend https
            url = f"https://{url}"
            parsed = urlparse(url)
        elif parsed.scheme == "http":
            # Upgrade http to https
            url = url.replace("http", "https", 1)
            parsed = urlparse(url)
        
        domain = parsed.netloc
        
        # 1. SSL/HTTPS Check
        ssl_check = self._check_ssl(url, domain)
        results["checks"]["ssl"] = ssl_check
        if not ssl_check["secure"]:
            results["vulnerabilities"].append({
                "type": "SSL/HTTPS",
                "severity": "HIGH",
                "description": ssl_check["message"]
            })
            results["security_score"] -= 30
        
        # 2. Security Headers Check
        headers_check = self._check_security_headers(url)
        results["checks"]["headers"] = headers_check
        missing_headers = headers_check.get("missing", [])
        if missing_headers:
            results["vulnerabilities"].append({
                "type": "Security Headers",
                "severity": "MEDIUM",
                "description": f"Missing headers: {', '.join(missing_headers)}"
            })
            results["security_score"] -= len(missing_headers) * 5
        
        # 3. Typosquatting/Phishing Domain Check
        typo_check = self._check_typosquatting(domain)
        results["checks"]["typosquatting"] = typo_check
        if typo_check["is_suspicious"]:
            results["vulnerabilities"].append({
                "type": "Phishing/Typosquatting",
                "severity": "CRITICAL",
                "description": typo_check["message"]
            })
            results["security_score"] -= 40
        
        # 4. Form Security Check
        forms_check = self._check_forms(url)
        results["checks"]["forms"] = forms_check
        if forms_check.get("insecure_forms", 0) > 0:
            results["vulnerabilities"].append({
                "type": "Insecure Forms",
                "severity": "HIGH",
                "description": f"Found {forms_check['insecure_forms']} forms without HTTPS"
            })
            results["security_score"] -= 20
        
        # Ensure score doesn't go below 0
        results["security_score"] = max(0, results["security_score"])
        results["vulnerabilities_count"] = len(results["vulnerabilities"])
        
        return results
    
    def _check_ssl(self, url: str, domain: str) -> Dict[str, Any]:
        """Check if website uses HTTPS and has valid SSL certificate"""
        try:
            if not url.startswith('https://'):
                return {
                    "secure": False,
                    "message": "Website does not use HTTPS encryption",
                    "has_certificate": False
                }
            
            # Try to verify SSL certificate
            context = ssl.create_default_context()
            context.minimum_version = ssl.TLSVersion.TLSv1_2
            with socket.create_connection((domain, 443), timeout=self.timeout) as sock:
                with context.wrap_socket(sock, server_hostname=domain) as ssock:
                    cert = ssock.getpeercert()
                    return {
                        "secure": True,
                        "message": "Valid SSL certificate found",
                        "has_certificate": True,
                        "issuer": dict(x[0] for x in cert.get('issuer', []))
                    }
        except Exception as e:
            return {
                "secure": False,
                "message": f"SSL verification failed: {str(e)}",
                "has_certificate": False
            }
    
    def _check_security_headers(self, url: str) -> Dict[str, Any]:
        """Check for important security headers"""
        important_headers = [
            'Strict-Transport-Security',
            'X-Frame-Options',
            'X-Content-Type-Options',
            'Content-Security-Policy',
            'X-XSS-Protection'
        ]
        
        try:
            response = requests.get(url, timeout=self.timeout, allow_redirects=True)
            headers = response.headers
            
            missing = []
            present = []
            
            for header in important_headers:
                if header.lower() in [h.lower() for h in headers.keys()]:
                    present.append(header)
                else:
                    missing.append(header)
            
            return {
                "present": present,
                "missing": missing,
                "total_checked": len(important_headers),
                "score": len(present) / len(important_headers) * 100
            }
        except Exception as e:
            return {
                "error": str(e),
                "present": [],
                "missing": important_headers,
                "total_checked": len(important_headers),
                "score": 0
            }
    
    def _check_typosquatting(self, domain: str) -> Dict[str, Any]:
        """Check if domain looks like a typosquatting/phishing attempt"""
        domain_lower = domain.lower()
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'paypa1',  # paypal with 1
            r'g00gle',  # google with 0s
            r'micr0soft',  # microsoft with 0
            r'amaz0n',  # amazon with 0
            r'faceb00k',  # facebook with 0s
            r'-secure',  # fake security suffix
            r'-login',  # fake login suffix
            r'-verify',  # fake verify suffix
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, domain_lower):
                return {
                    "is_suspicious": True,
                    "message": f"Domain contains suspicious pattern: {pattern}",
                    "confidence": 0.8
                }
        
        # Check for lookalike of protected brands
        for brand in self.protected_brands:
            if brand in domain_lower and domain_lower != brand:
                # Domain contains brand name but isn't the exact brand
                return {
                    "is_suspicious": True,
                    "message": f"Domain may be impersonating: {brand}",
                    "confidence": 0.7
                }
        
        return {
            "is_suspicious": False,
            "message": "No typosquatting patterns detected",
            "confidence": 0.0
        }
    
    def _check_forms(self, url: str) -> Dict[str, Any]:
        """Check for insecure forms (HTTP forms collecting data)"""
        try:
            response = requests.get(url, timeout=self.timeout)
            html = response.text
            
            # Simple regex to find forms
            forms = re.findall(r'<form[^>]*>', html, re.IGNORECASE)
            
            insecure_count = 0
            if not url.startswith('https://'):
                # All forms on HTTP site are insecure
                insecure_count = len(forms)
            
            return {
                "total_forms": len(forms),
                "insecure_forms": insecure_count,
                "message": f"Found {len(forms)} forms, {insecure_count} potentially insecure"
            }
        except Exception as e:
            return {
                "error": str(e),
                "total_forms": 0,
                "insecure_forms": 0
            }

scanner = SecurityScanner()
