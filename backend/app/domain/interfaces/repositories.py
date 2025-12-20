from abc import ABC, abstractmethod
from typing import Optional, List
from backend.app.domain.entities.phishing import PhishingIncident
from backend.app.domain.entities.user import User

class IIncidentRepository(ABC):
    @abstractmethod
    async def get_by_id(self, incident_id: str) -> Optional[PhishingIncident]:
        pass

    @abstractmethod
    async def save(self, incident: PhishingIncident) -> PhishingIncident:
        pass

    @abstractmethod
    async def list_by_user(self, user_id: str) -> List[PhishingIncident]:
        pass

class IUserRepository(ABC):
    @abstractmethod
    async def get_by_email(self, email: str) -> Optional[User]:
        pass
    
    @abstractmethod
    async def save(self, user: User) -> User:
        pass
