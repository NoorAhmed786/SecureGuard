from datetime import datetime
import stripe
from typing import Optional
from backend.app.domain.entities.payment import Subscription, Plan, SubscriptionStatus
from backend.app.domain.interfaces.payment import IPaymentGateway
import os

class StripeAdapter(IPaymentGateway):
    def __init__(self, api_key: str):
        stripe.api_key = api_key

    async def create_subscription(self, user_id: str, plan_id: str, payment_method_id: str) -> Subscription:
        try:
            # 1. Create or retrieve customer
            # customer = stripe.Customer.create(metadata={"user_id": user_id})
            
            # 2. Attach payment method
            # stripe.PaymentMethod.attach(payment_method_id, customer=customer.id)
            
            # 3. Create subscription
            # sub = stripe.Subscription.create(
            #     customer=customer.id,
            #     items=[{"price": plan_id}],
            #     expand=["latest_invoice.payment_intent"],
            # )
            
            # NOTE: For now, we still return a mocked Subscription object for the UI to handle,
            # but the framework is ready for the actual Stripe ID when using Checkout Sessions.
            return Subscription(
                id="sub_real_init_123",
                user_id=user_id,
                plan_id=plan_id,
                stripe_subscription_id="sub_pending",
                status=SubscriptionStatus.ACTIVE,
                current_period_end=datetime.now()
            )
        except Exception as e:
            print(f"Stripe Error: {e}")
            raise e

    async def cancel_subscription(self, subscription_id: str) -> Subscription:
        # stripe.Subscription.delete(subscription_id)
        pass

    async def get_plan(self, plan_id: str) -> Optional[Plan]:
        try:
            # price = stripe.Price.retrieve(plan_id)
            # return Plan(id=price.id, name=price.nickname or "Pro", price_cents=price.unit_amount)
            return Plan(id=plan_id, name="Professional", price_cents=2900)
        except Exception:
            return None

    async def create_checkout_session(self, user_id: str, price_id: str, success_url: str, cancel_url: str):
        """Creates a Stripe Checkout Session for subscription."""
        print(f"\n=== STRIPE ADAPTER ===")
        print(f"Creating session with price_id: '{price_id}'")
        print(f"User ID: '{user_id}'")
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': price_id,
                'quantity': 1,
            }],
            mode='subscription',
            success_url=success_url,
            cancel_url=cancel_url,
            client_reference_id=user_id,
        )
        print(f"Session created successfully: {session.id}")
        return session
