from datetime import datetime
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class IncidentStatus(str, Enum):
    PENDING = "pending"
    ANALYZING = "analyzing"
    CONFIRMED_PHISHING = "confirmed_phishing"
    SAFE = "safe"
    FALSE_POSITIVE = "false_positive"

class ThreatLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class PhishingIncident(BaseModel):
    id: str
    user_id: str
    raw_email_content: Optional[str] = None
    email_headers: Dict[str, str] = {}
    sender_email: str
    subject: str
    urls_found: List[str] = []
    attachments_metadata: List[Dict[str, Any]] = []
    
    status: IncidentStatus = IncidentStatus.PENDING
    threat_level: ThreatLevel = ThreatLevel.LOW
    confidence_score: float = 0.0  # 0 to 1
    
    detected_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None
    
    analysis_report: Dict[str, Any] = {}

    def mark_as_analyzed(self, score: float, report: Dict[str, Any]):
        self.confidence_score = score
        self.analysis_report = report
        self.status = IncidentStatus.ANALYZING
        if score > 0.8:
            self.threat_level = ThreatLevel.CRITICAL
            self.status = IncidentStatus.CONFIRMED_PHISHING
        elif score > 0.5:
             self.threat_level = ThreatLevel.HIGH
        elif score > 0.2:
             self.threat_level = ThreatLevel.MEDIUM
        else:
             self.threat_level = ThreatLevel.LOW
             self.status = IncidentStatus.SAFE
