from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.domain.entities.phishing import PhishingIncident
from app.domain.interfaces.repositories import IIncidentRepository
from app.infrastructure.database.models import IncidentModel

class SQLAlchemyIncidentRepository(IIncidentRepository):
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, incident_id: str) -> Optional[PhishingIncident]:
        result = await self.session.execute(select(IncidentModel).where(IncidentModel.id == incident_id))
        model = result.scalars().first()
        if model:
            # Mapper (Model -> Entity)
            return PhishingIncident(
                id=model.id,
                user_id=model.user_id,
                status=model.status,
                threat_level=model.threat_level,
                confidence_score=model.confidence_score,
                sender_email=model.sender_email,
                subject=model.subject,
                urls_found=model.urls_found if model.urls_found else [],
                raw_email_content=model.raw_email_content
                # etc...
            )
        return None

    async def save(self, incident: PhishingIncident) -> PhishingIncident:
        # Entity -> Model
        model = IncidentModel(
            id=incident.id,
            user_id=incident.user_id,
            status=incident.status,
            threat_level=incident.threat_level,
            confidence_score=incident.confidence_score,
            sender_email=incident.sender_email,
            subject=incident.subject,
            urls_found=incident.urls_found,
            raw_email_content=incident.raw_email_content,
            analysis_report=incident.analysis_report
        )
        await self.session.merge(model)
        await self.session.commit()
        return incident
    
    async def list_by_user(self, user_id: str) -> List[PhishingIncident]:
        return []
