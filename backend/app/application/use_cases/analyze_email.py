import uuid
import logging
from typing import Dict, Any, Optional
from app.domain.entities.phishing import PhishingIncident
from app.domain.interfaces.detection import IPhishingAnalyzer
from app.domain.interfaces.repositories import IIncidentRepository
from app.infrastructure.websocket.connection_manager import ConnectionManager
import json

logger = logging.getLogger(__name__)

class AnalyzeEmailUseCase:
    """
    Application Service (Use Case) for analyzing an email.
    Orchestrates the domain logic, infrastructure, and notifications.
    """
    def __init__(self, incident_repo: IIncidentRepository, analyzer: IPhishingAnalyzer, manager: Optional[ConnectionManager] = None):
        self.repo = incident_repo
        self.analyzer = analyzer
        self.manager = manager

    async def execute(self, email_data: Dict[str, Any], user_id: str) -> PhishingIncident:
        # Create domain entity from input
        incident = PhishingIncident(
            id=str(uuid.uuid4()),
            user_id=user_id,
            total_score=0.0,
            sender_email=email_data.get("sender", ""),
            subject=email_data.get("subject", ""),
            raw_email_content=email_data.get("body", ""),
            status="analyzing"
        )

        # Domain logic: Analyze via engine
        analyzed_incident = await self.analyzer.analyze(incident)

        # Infrastructure: Save to repo
        await self.repo.save(analyzed_incident)

        # Notify via websocket if manager is present
        if self.manager:
            try:
                alert_payload = {
                    "type": "phishing_alert",
                    "id": analyzed_incident.id,
                    "title": f"High Risk Alert: {analyzed_incident.subject}",
                    "level": analyzed_incident.threat_level.value.capitalize(),
                    "time": "Just Now",
                    "detail": analyzed_incident.subject
                }
                await self.manager.broadcast(json.dumps(alert_payload))
                logger.info(f"Broadcasted alert for incident {analyzed_incident.id}")
            except Exception as e:
                logger.error(f"Failed to broadcast alert: {e}")

        return analyzed_incident
