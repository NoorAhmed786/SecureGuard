from datetime import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    INCOMPLETE = "incomplete"

class Plan(BaseModel):
    id: str
    name: str # "Pro", "Enterprise"
    price_cents: int
    currency: str = "usd"
    features: List[str] = []

class Subscription(BaseModel):
    id: str
    user_id: str
    plan_id: str
    stripe_subscription_id: str
    status: SubscriptionStatus
    current_period_end: datetime
    cancel_at_period_end: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Invoice(BaseModel):
    id: str
    subscription_id: str
    amount_paid_cents: int
    status: str # "paid", "open", "void"
    invoice_pdf_url: Optional[str] = None
    created_at: datetime
