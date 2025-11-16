"""
Campaign models - marketing campaigns and their assets
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Integer, Text, Date, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base


class Campaign(Base):
    __tablename__ = "campaigns"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    execution_id = Column(UUID(as_uuid=True), ForeignKey("agent_executions.id"), nullable=True, index=True)
    
    # Campaign details
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    campaign_type = Column(String(50), nullable=True)  # product_launch, brand_awareness, lead_generation
    
    # Duration
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    # Channels
    channels = Column(JSON, nullable=False)  # ["google_ads", "meta_ads", "email", "social"]
    
    # Budget
    total_budget = Column(Numeric(10, 2), nullable=True)
    budget_allocation = Column(JSON, nullable=True)  # Per channel allocation
    spent_to_date = Column(Numeric(10, 2), default=0)
    
    # Status
    status = Column(String(50), default="draft")  # draft, scheduled, active, paused, completed
    
    # Campaign plan
    plan = Column(JSON, nullable=True)  # The AI-generated campaign strategy
    
    # Performance
    metrics = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant", backref="campaigns")
    execution = relationship("AgentExecution", backref="campaigns")
    assets = relationship("CampaignAsset", back_populates="campaign", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Campaign(id={self.id}, name={self.name}, status={self.status})>"


class CampaignAsset(Base):
    __tablename__ = "campaign_assets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    campaign_id = Column(UUID(as_uuid=True), ForeignKey("campaigns.id"), nullable=False, index=True)
    content_item_id = Column(UUID(as_uuid=True), ForeignKey("content_items.id"), nullable=True, index=True)
    
    # Asset details
    asset_type = Column(String(50), nullable=True)  # ad, email, social_post, landing_page
    platform = Column(String(50), nullable=True)  # google_ads, facebook, instagram, email
    
    # Platform-specific IDs
    platform_asset_id = Column(String(255), nullable=True)  # ID in the external platform
    
    # Status
    status = Column(String(50), default="draft")  # draft, scheduled, active, paused, completed
    launched_at = Column(DateTime(timezone=True), nullable=True)
    
    # Performance
    impressions = Column(Integer, default=0)
    clicks = Column(Integer, default=0)
    conversions = Column(Integer, default=0)
    spend = Column(Numeric(10, 2), default=0)
    
    # Metadata
    meta_data = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    campaign = relationship("Campaign", back_populates="assets")
    content_item = relationship("ContentItem", backref="campaign_assets")
    
    def __repr__(self):
        return f"<CampaignAsset(id={self.id}, type={self.asset_type}, platform={self.platform})>"

