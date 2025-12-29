"""
Advanced Phishing Analysis Service

This domain service orchestrates multiple detection mechanisms to analyze
phishing incidents, including AI/ML classification, threat intelligence,
and typosquatting detection.
"""
from typing import Dict, Any
from app.domain.entities.phishing import PhishingIncident
from app.domain.interfaces.detection import IPhishingAnalyzer, IThreatIntelProvider
from app.domain.services.typosquatting import TyposquattingDetector
from app.infrastructure.ai.classifier import PhishingClassifier


class AdvancedPhishingAnalyzer(IPhishingAnalyzer):
    """
    Advanced phishing analyzer that combines multiple detection techniques:
    - AI/ML content classification
    - Threat intelligence (Safe Browsing API)
    - Typosquatting detection
    
    This follows the Strategy pattern and Dependency Inversion Principle
    by depending on abstractions (IThreatIntelProvider) rather than concrete implementations.
    """
    
    def __init__(
        self,
        threat_provider: IThreatIntelProvider,
        typo_detector: TyposquattingDetector,
        classifier: PhishingClassifier
    ):
        """
        Initialize the analyzer with required dependencies.
        
        Args:
            threat_provider: Threat intelligence provider (e.g., Google Safe Browsing)
            typo_detector: Typosquatting detection service
            classifier: AI/ML phishing classifier
        """
        self.threat_provider = threat_provider
        self.typo_detector = typo_detector
        self.classifier = classifier
    
    async def analyze(self, incident: PhishingIncident) -> PhishingIncident:
        """
        Perform comprehensive phishing analysis on an incident.
        
        The analysis combines:
        1. AI/ML content analysis for suspicious patterns
        2. URL threat intelligence checks
        3. Typosquatting detection
        
        Args:
            incident: The phishing incident to analyze
            
        Returns:
            The incident with updated analysis results and threat score
        """
        score = 0.0
        indicators = []
        
        # 1. AI/ML Content Analysis
        full_text = f"{incident.subject} {incident.raw_email_content}"
        ml_score = self.classifier.predict_score(full_text)
        
        score = ml_score
        if ml_score > 0.7:
            indicators.append({
                "type": "content",
                "severity": "high",
                "label": "Suspicious Content",
                "message": f"AI detected high-risk language patterns (confidence: {ml_score:.2f})."
            })
        elif ml_score > 0.4:
            indicators.append({
                "type": "content",
                "severity": "medium",
                "label": "Cautionary Language",
                "message": "Content contains patterns often used in social engineering."
            })
        
        # 2. Link Analysis (Safe Browsing + Typosquatting)
        high_threat_found = False
        for url in incident.urls_found:
            # Typosquatting Check
            typo_result = self.typo_detector.check_url(url)
            if typo_result["is_typosquat"]:
                high_threat_found = True
                target = typo_result.get("target", "unknown")
                indicators.append({
                    "type": "link",
                    "severity": "critical",
                    "label": "Typosquatting Detected",
                    "message": f"Fraudulent link '{url}' mimics '{target}'."
                })
            
            # Threat Intelligence Check
            threat_result = await self.threat_provider.check_url(url)
            if not threat_result.get("safe", True):
                high_threat_found = True
                indicators.append({
                    "type": "link",
                    "severity": "critical",
                    "label": "Malicious URL",
                    "message": f"URL '{url}' is blacklisted in security databases."
                })
        
        # 3. Sender Analysis (Simple check for now)
        if any(keyword in incident.sender_email.lower() for keyword in ["support", "admin", "secure", "verify"]):
             indicators.append({
                "type": "sender",
                "severity": "low",
                "label": "Sender Profile",
                "message": "Sender uses common official-sounding keywords."
            })

        # If any high-threat indicators found, boost the score
        if high_threat_found:
            score = max(score, 0.95)
        
        # Mark incident as analyzed with final score and indicators
        incident.mark_as_analyzed(score, {"indicators": indicators})
        return incident
