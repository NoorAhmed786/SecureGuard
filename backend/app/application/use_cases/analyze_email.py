import uuid
from typing import Dict, Any
from app.domain.entities.phishing import PhishingIncident
from app.domain.interfaces.detection import IPhishingAnalyzer
from app.domain.interfaces.repositories import IIncidentRepository

from app.infrastructure.websocket.connection_manager import ConnectionManager
import json

class AnalyzeEmailUseCase:
    """
    Application Service (Use Case) for analyzing an email.
    Orchestrates the flow: Create Incident -> Analysis -> Save -> Broadcast.
    """
    def __init__(
        self,
        repository: IIncidentRepository,
        analyzer: IPhishingAnalyzer,
        manager: ConnectionManager = None
    ):
        self.repository = repository
        self.analyzer = analyzer
        self.manager = manager

    async def execute(self, scan_request: Dict[str, Any], user_id: str) -> PhishingIncident:
        import re
        body = scan_request.get("body", "")
        urls = re.findall(r'(https?://[^\s<>"]+|www\.[^\s<>"]+)', body)
        
        # 1. Create Domain Entity
        incident = PhishingIncident(
            id=str(uuid.uuid4()),
            user_id=user_id,
            raw_email_content=body,
            sender_email=scan_request.get("sender", "unknown"),
            subject=scan_request.get("subject", "No Subject"),
            urls_found=urls
        )

        # 2. Persist initial state
        await self.repository.save(incident)

        # 3. Perform Analysis (Domain Service)
        analyzed_incident = await self.analyzer.analyze(incident)

        # 4. Update and Persist
        await self.repository.save(analyzed_incident)

        # 5. Broadcast real-time alert via WebSocket if manager is present
        if self.manager:
            try:
                alert_payload = {
                    "type": "phishing_alert",
                    "id": analyzed_incident.id,
                    "title": f"Phishing Attempt: {analyzed_incident.sender_email[:20]}...",
                    "level": analyzed_incident.threat_level.value.capitalize(),
                    "time": analyzed_incident.detected_at.isoformat(),
                    "detail": analyzed_incident.subject
                }
                await self.manager.broadcast(json.dumps(alert_payload))
                print(f"Broadcasted alert for incident {analyzed_incident.id}")
            except Exception as e:
                print(f"Failed to broadcast alert: {e}")

        return analyzed_incident
