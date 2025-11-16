"""
Capability model - tracks which capabilities are set up for each assistant
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base


class Capability(Base):
    __tablename__ = "capabilities"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assistant_id = Column(UUID(as_uuid=True), ForeignKey("assistants.id"), nullable=False, index=True)
    
    # Capability type
    capability_type = Column(String(50), nullable=False)  # content_creation, campaigns, analytics
    status = Column(String(50), default="not_configured")  # not_configured, configuring, active, paused
    
    # Configuration
    config = Column(JSON, default={})
    
    # Setup tracking
    integrations_required = Column(JSON, default=[])  # List of required platform names
    integrations_connected = Column(Integer, default=0)  # Count of connected integrations
    setup_completed = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    assistant = relationship("Assistant", backref="capabilities")
    
    def __repr__(self):
        return f"<Capability(id={self.id}, type={self.capability_type}, assistant_id={self.assistant_id})>"

