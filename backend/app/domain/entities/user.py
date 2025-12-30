from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class User(BaseModel):
    """
    Domain Entity for User.
    Pure Python, no database dependencies.
    """
    id: str  # UUID
    email: EmailStr
    full_name: str
    hashed_password: str
    organization_id: Optional[str] = None
    role: str = "employee"  # admin, security_analyst, employee
    risk_score: float = 0.0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    def update_risk_score(self, points: float):
        self.risk_score = max(0.0, min(100.0, self.risk_score + points))

class Organization(BaseModel):
    id: str
    name: str
    domain: str
    subscription_tier: str
    created_at: datetime
