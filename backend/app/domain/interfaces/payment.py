from abc import ABC, abstractmethod
from typing import Optional
from backend.app.domain.entities.payment import Subscription, Plan

class IPaymentGateway(ABC):
    """
    Interface for Payment Gateway (e.g., Stripe).
    """
    @abstractmethod
    async def create_subscription(self, user_id: str, plan_id: str, payment_method_id: str) -> Subscription:
        pass

    @abstractmethod
    async def cancel_subscription(self, subscription_id: str) -> Subscription:
        pass

    @abstractmethod
    async def get_plan(self, plan_id: str) -> Optional[Plan]:
        pass
