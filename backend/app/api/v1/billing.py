"""
Billing API routes - Stripe webhooks and payments
"""
from fastapi import APIRouter, Depends, Request, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from typing import Optional
import stripe
import json
from app.db.session import get_db
from app.config import settings
from app.services.billing_service import BillingService
from app.dependencies import get_current_tenant, get_current_user
from app.models.tenant import Tenant
from app.models.user import User

router = APIRouter(prefix="/billing", tags=["billing"])

# Initialize Stripe
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY


class CreatePaymentIntentRequest(BaseModel):
    plan_id: str
    amount: int  # Amount in cents


class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str
    payment_method_id: Optional[str] = None


@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(..., alias="stripe-signature"),
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Stripe webhook events
    """
    if not settings.STRIPE_WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe webhook secret not configured"
        )
    
    payload = await request.body()
    
    try:
        event = stripe.Webhook.construct_event(
            payload,
            stripe_signature,
            settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload"
        )
    except stripe.error.SignatureVerificationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature"
        )
    
    # Process event
    service = BillingService(db)
    billing_event = await service.process_stripe_event(
        event_data=event.to_dict(),
        event_type=event.type,
        stripe_event_id=event.id
    )
    
    return {"status": "processed", "event_id": billing_event.id}


@router.post("/create-payment-intent")
async def create_payment_intent(
    request: CreatePaymentIntentRequest,
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a Stripe payment intent for a subscription
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe is not configured"
        )
    
    try:
        # Get or create Stripe customer
        customer_id = current_tenant.stripe_customer_id
        if not customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                name=current_user.full_name or current_tenant.name,
                metadata={
                    "tenant_id": str(current_tenant.id),
                    "user_id": str(current_user.id)
                }
            )
            customer_id = customer.id
            current_tenant.stripe_customer_id = customer_id
            await db.commit()
        
        # Create payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency="usd",
            customer=customer_id,
            metadata={
                "tenant_id": str(current_tenant.id),
                "plan_id": request.plan_id,
                "user_id": str(current_user.id)
            },
            automatic_payment_methods={
                "enabled": True,
            },
        )
        
        return {
            "client_secret": payment_intent.client_secret,
            "payment_intent_id": payment_intent.id
        }
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/confirm-payment")
async def confirm_payment(
    request: ConfirmPaymentRequest,
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Confirm a payment intent
    """
    if not settings.STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe is not configured"
        )
    
    try:
        # Retrieve payment intent
        payment_intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
        
        # Confirm payment intent if needed
        if payment_intent.status != "succeeded":
            if request.payment_method_id:
                payment_intent = stripe.PaymentIntent.confirm(
                    request.payment_intent_id,
                    payment_method=request.payment_method_id
                )
            else:
                payment_intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
        
        # Update tenant subscription based on plan
        plan_id = payment_intent.metadata.get("plan_id", "professional")
        current_tenant.subscription_plan = plan_id
        current_tenant.subscription_status = "active"
        
        await db.commit()
        
        return {
            "status": payment_intent.status,
            "payment_intent_id": payment_intent.id,
            "message": "Payment confirmed successfully"
        }
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

