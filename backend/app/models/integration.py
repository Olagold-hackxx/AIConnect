"""
Social media integration models
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base


class SocialIntegration(Base):
    """Social media platform integration for a tenant"""
    __tablename__ = "social_integrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    assistant_id = Column(UUID(as_uuid=True), ForeignKey("assistants.id"), nullable=True, index=True)
    
    # Platform info
    platform = Column(String(50), nullable=False)  # facebook, instagram, linkedin, twitter, tiktok, google_ads, meta_ads, google_analytics
    platform_user_id = Column(String(255), nullable=False)  # Platform's user ID
    platform_username = Column(String(255), nullable=True)
    platform_name = Column(String(255), nullable=True)
    
    # Profile data
    profile_data = Column(JSON, default={})  # Full profile data from platform
    access_token = Column(Text, nullable=False)  # Encrypted in production
    refresh_token = Column(Text, nullable=True)
    
    # Token expiry
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    refresh_token_expires_at = Column(DateTime(timezone=True), nullable=True)
    
    # Additional platform-specific data
    pages = Column(JSON, default=[])  # For Facebook/Instagram pages
    organizations = Column(JSON, default=[])  # For LinkedIn organizations
    
    # Status
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    
    # Metadata
    connected_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    meta_data = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    tenant = relationship("Tenant", backref="social_integrations")
    assistant = relationship("Assistant", backref="social_integrations")
    
    def __repr__(self):
        return f"<SocialIntegration(id={self.id}, platform={self.platform}, tenant_id={self.tenant_id})>"


class IntegrationConfig(Base):
    """Configuration for social media platform OAuth apps"""
    __tablename__ = "integration_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Platform info
    platform = Column(String(50), unique=True, nullable=False)  # facebook, instagram, etc.
    
    # OAuth credentials (encrypted in production)
    client_id = Column(String(500), nullable=False)
    client_secret = Column(Text, nullable=False)
    
    # OAuth endpoints
    authorization_url = Column(String(500), nullable=True)
    token_url = Column(String(500), nullable=True)
    api_base_url = Column(String(500), nullable=True)
    
    # Required scopes
    default_scopes = Column(JSON, default=[])
    
    # Status
    is_enabled = Column(Boolean, default=True)
    
    # Metadata
    meta_data = Column(JSON, default={})
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<IntegrationConfig(platform={self.platform}, is_enabled={self.is_enabled})>"

