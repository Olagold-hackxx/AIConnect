"""
Assistant model - represents AI assistants configured for tenants
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base


class Assistant(Base):
    __tablename__ = "assistants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    
    # Assistant configuration
    assistant_type = Column(String(50), nullable=False)  # digital_marketer, executive_assistant, customer_support
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    
    # LLM Configuration
    llm_provider = Column(String(50), default="openai")  # openai, anthropic, google
    llm_model = Column(String(100), default="gpt-4o-mini")  # gpt-4o, claude-3-5-sonnet, etc.
    temperature = Column(String(10), default="0.7")
    max_tokens = Column(String(20), default="2000")
    
    # Vector DB configuration
    vector_db_namespace = Column(String(255), nullable=True)  # Namespace/collection for this assistant
    
    # System prompt customization
    system_prompt_override = Column(Text, nullable=True)
    custom_instructions = Column(Text, nullable=True)
    
    # Tools & capabilities
    enabled_tools = Column(JSON, default=[])  # List of tool names
    tool_config = Column(JSON, default={})  # Tool-specific configurations
    
    # Status
    is_active = Column(Boolean, default=True)
    is_default = Column(Boolean, default=False)  # Default assistant for tenant
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    tenant = relationship("Tenant", backref="assistants")
    conversations = relationship("Conversation", back_populates="assistant")
    
    def __repr__(self):
        return f"<Assistant(id={self.id}, type={self.assistant_type}, tenant_id={self.tenant_id})>"

