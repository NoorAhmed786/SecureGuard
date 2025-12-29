"""
Typosquatting Detection Service

This domain service detects typosquatting attempts by comparing URLs against
a list of protected domains using character substitution and normalization.
"""
from typing import Dict, List
from urllib.parse import urlparse


class TyposquattingDetector:
    """
    Detects typosquatting attempts by identifying lookalike domains.
    
    Typosquatting is a form of cybersquatting where attackers register domains
    that are similar to legitimate domains to deceive users.
    """
    
    def __init__(self, protected_domains: List[str]):
        """
        Initialize the detector with a list of protected domains.
        
        Args:
            protected_domains: List of legitimate domain names to protect against typosquatting
        """
        self.protected_domains = [domain.lower() for domain in protected_domains]
    
    def check_url(self, url: str) -> Dict[str, any]:
        """
        Check if a URL domain is a lookalike of protected domains.
        
        Args:
            url: The URL to check
            
        Returns:
            Dictionary with:
                - is_typosquat (bool): Whether typosquatting was detected
                - target (str, optional): The protected domain being impersonated
        """
        try:
            domain = urlparse(url).netloc.lower()
            if not domain:
                return {"is_typosquat": False}
            
            for protected in self.protected_domains:
                # Skip exact matches (legitimate domain)
                if domain == protected:
                    continue
                
                # Normalize domains by replacing common lookalike characters
                # 0 -> o, 1 -> i, l -> i (common substitutions in phishing)
                normalized_domain = self._normalize_domain(domain)
                normalized_protected = self._normalize_domain(protected)
                
                if normalized_domain == normalized_protected:
                    return {"is_typosquat": True, "target": protected}
            
            return {"is_typosquat": False}
        except Exception:
            # If URL parsing fails, assume it's not a typosquat
            return {"is_typosquat": False}
    
    def _normalize_domain(self, domain: str) -> str:
        """
        Normalize a domain by replacing common lookalike characters.
        
        Args:
            domain: The domain to normalize
            
        Returns:
            Normalized domain string
        """
        return domain.replace('0', 'o').replace('1', 'i').replace('l', 'i')
