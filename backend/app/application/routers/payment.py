import stripe
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.database.setup import get_db

# Ensure Stripe API key is loaded
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_mock")

from app.application.dependencies import get_payment_gateway  # noqa: E402
from app.infrastructure.payment.stripe_adapter import StripeAdapter  # noqa: E402

router = APIRouter(prefix="/api/v1/payment", tags=["payment"])

@router.post("/create-checkout-session")
async def create_checkout_session(
    plan_id: str, 
    db: AsyncSession = Depends(get_db),
    payment_gateway: StripeAdapter = Depends(get_payment_gateway)
):
    # Debug: Log incoming request
    print("\n=== CHECKOUT SESSION REQUEST ===")
    print(f"Requested plan_id: '{plan_id}'")
    print(f"ENV STRIPE_PRICE_PRO: '{os.getenv('STRIPE_PRICE_PRO')}'")
    print(f"ENV STRIPE_PRICE_ENTERPRISE: '{os.getenv('STRIPE_PRICE_ENTERPRISE')}'")
    
    # Map friendly plan IDs to actual Stripe Price IDs from environment variables
    price_map = {
        "pro": os.getenv("STRIPE_PRICE_PRO"),
        "enterprise": os.getenv("STRIPE_PRICE_ENTERPRISE")
    }
    
    print(f"Price map: {price_map}")
    price_id = price_map.get(plan_id.lower())
    print(f"Selected price_id: '{price_id}'")
    if not price_id:
        print(f"Error: Price ID not found for plan '{plan_id}'. Check STRIPE_PRICE_PRO/ENTERPRISE in .env")
        raise HTTPException(status_code=400, detail=f"Invalid plan ID: {plan_id}")

    try:
        # Hardcoded for local dev, should come from config/env in production
        success_url = "http://localhost:3000/dashboard?session_id={CHECKOUT_SESSION_ID}"
        cancel_url = "http://localhost:3000/pricing"
        
        # We'll use a demo user ID for now
        session = await payment_gateway.create_checkout_session(
            user_id="demo_user_123",
            price_id=price_id,
            success_url=success_url,
            cancel_url=cancel_url
        )
        
        return {"checkout_url": session.url}
    except Exception as e:
        print(f"DEBUG: Failed to create session for price_id='{price_id}'")
        print(f"Stripe Session Error Detail: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    # Stub for Stripe webhooks
    _payload = await request.body()
    _sig_header = request.headers.get("stripe-signature")
    
    # In a real app, you would verify the webhook signature here
    # event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    
    return {"status": "success"}

@router.get("/subscription-status")
async def get_subscription_status(db: AsyncSession = Depends(get_db)):
    # Stub for checking user subscription status
    return {"status": "free", "plan": "Basic"}
