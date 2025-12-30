from abc import ABC, abstractmethod
from typing import Dict, Any
from app.domain.entities.phishing import PhishingIncident

class IThreatIntelProvider(ABC):
    """
    Interface for external threat intelligence providers (Google SB, VirusTotal).
    DIP: Application depends on this, Infrastructure implements it.
    """
    @abstractmethod
    async def check_url(self, url: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def check_file_hash(self, file_hash: str) -> Dict[str, Any]:
        pass

class IPhishingAnalyzer(ABC):
    """
    Interface for the core analysis engine.
    """
    @abstractmethod
    async def analyze(self, incident: PhishingIncident) -> PhishingIncident:
        pass

class INotificationService(ABC):
    @abstractmethod
    async def send_alert(self, incident: PhishingIncident):
        pass
