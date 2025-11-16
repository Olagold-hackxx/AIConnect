"""
Billing model - represents billing and subscription data
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base


class BillingEvent(Base):
    __tablename__ = "billing_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Stripe data
    stripe_event_id = Column(String(255), unique=True, nullable=True, index=True)
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    
    # Event details
    event_type = Column(String(100), nullable=False)  # subscription.created, payment.succeeded, etc.
    amount = Column(Numeric(10, 2), nullable=True)  # Amount in cents
    currency = Column(String(10), default="usd")
    
    # Metadata
    event_data = Column(JSON, default={})  # Full Stripe event data
    processed = Column(String(10), default="false")  # Whether we processed this event
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    processed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    tenant = relationship("Tenant", backref="billing_events")
    
    def __repr__(self):
        return f"<BillingEvent(id={self.id}, event_type={self.event_type}, tenant_id={self.tenant_id})>"

