"""
Billing service - handles Stripe webhooks and billing events
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Dict, Optional
from uuid import UUID
from datetime import datetime
from app.models.billing import BillingEvent
from app.models.tenant import Tenant
from app.utils.errors import TenantNotFoundError
from app.utils.logger import logger


class BillingService:
    """Service for handling billing"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def process_stripe_event(
        self,
        event_data: Dict,
        event_type: str,
        stripe_event_id: str
    ) -> BillingEvent:
        """Process a Stripe webhook event"""
        # Check if event already processed
        result = await self.db.execute(
            select(BillingEvent).where(
                BillingEvent.stripe_event_id == stripe_event_id
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            logger.info(f"Event {stripe_event_id} already processed")
            return existing
        
        # Extract tenant info from event
        customer_id = event_data.get('customer')
        subscription_id = event_data.get('subscription') or event_data.get('data', {}).get('object', {}).get('subscription')
        
        # Find tenant by Stripe customer ID
        tenant = None
        if customer_id:
            result = await self.db.execute(
                select(Tenant).where(
                    Tenant.stripe_customer_id == customer_id
                )
            )
            tenant = result.scalar_one_or_none()
        
        # Create billing event
        billing_event = BillingEvent(
            tenant_id=tenant.id if tenant else None,
            stripe_event_id=stripe_event_id,
            stripe_customer_id=customer_id,
            stripe_subscription_id=subscription_id,
            event_type=event_type,
            event_data=event_data,
            processed="false"
        )
        
        self.db.add(billing_event)
        await self.db.commit()
        await self.db.refresh(billing_event)
        
        # Process event based on type
        if tenant:
            await self._handle_event_for_tenant(tenant, event_type, event_data)
            billing_event.processed = "true"
            billing_event.processed_at = datetime.utcnow()
            await self.db.commit()
        
        logger.info(f"Processed Stripe event {stripe_event_id} of type {event_type}")
        return billing_event
    
    async def _handle_event_for_tenant(
        self,
        tenant: Tenant,
        event_type: str,
        event_data: Dict
    ):
        """Handle specific event types for tenant"""
        if event_type == "customer.subscription.created":
            subscription = event_data.get('data', {}).get('object', {})
            tenant.stripe_subscription_id = subscription.get('id')
            tenant.subscription_status = "active"
            tenant.subscription_plan = subscription.get('items', {}).get('data', [{}])[0].get('price', {}).get('nickname', 'starter')
        
        elif event_type == "customer.subscription.updated":
            subscription = event_data.get('data', {}).get('object', {})
            status = subscription.get('status')
            tenant.subscription_status = status
            tenant.subscription_plan = subscription.get('items', {}).get('data', [{}])[0].get('price', {}).get('nickname', tenant.subscription_plan)
        
        elif event_type == "customer.subscription.deleted":
            tenant.subscription_status = "cancelled"
            tenant.stripe_subscription_id = None
        
        elif event_type == "invoice.payment_succeeded":
            tenant.subscription_status = "active"
        
        elif event_type == "invoice.payment_failed":
            tenant.subscription_status = "past_due"
        
        await self.db.commit()

