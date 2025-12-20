import uuid
from typing import Dict, Any
from backend.app.domain.entities.phishing import PhishingIncident
from backend.app.domain.interfaces.detection import IPhishingAnalyzer
from backend.app.domain.interfaces.repositories import IIncidentRepository

class AnalyzeEmailUseCase:
    """
    Application Service (Use Case) for analyzing an email.
    Orchestrates the flow: Create Incident -> Analysis -> Save.
    """
    def __init__(
        self,
        repository: IIncidentRepository,
        analyzer: IPhishingAnalyzer
    ):
        self.repository = repository
        self.analyzer = analyzer

    async def execute(self, scan_request: Dict[str, Any], user_id: str) -> PhishingIncident:
        # 1. Create Domain Entity
        incident = PhishingIncident(
            id=str(uuid.uuid4()),
            user_id=user_id,
            raw_email_content=scan_request.get("body"),
            sender_email=scan_request.get("sender", "unknown"),
            subject=scan_request.get("subject", "No Subject"),
            # In real app, run parser here to extract URLs/Attachments
        )

        # 2. Persist initial state
        await self.repository.save(incident)

        # 3. Perform Analysis (Domain Service)
        analyzed_incident = await self.analyzer.analyze(incident)

        # 4. Update and Persist
        await self.repository.save(analyzed_incident)

        return analyzed_incident
