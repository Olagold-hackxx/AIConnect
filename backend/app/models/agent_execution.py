"""
Agent Execution model - tracks agent tasks and their results
"""
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON, Integer, Text, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.db.base import Base


class AgentExecution(Base):
    __tablename__ = "agent_executions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False, index=True)
    assistant_id = Column(UUID(as_uuid=True), ForeignKey("assistants.id"), nullable=False, index=True)
    capability_id = Column(UUID(as_uuid=True), ForeignKey("capabilities.id"), nullable=True, index=True)
    
    # Request
    request_type = Column(String(100), nullable=False)  # create_blog_post, launch_campaign, generate_report
    request_data = Column(JSON, nullable=False)
    
    # Execution
    status = Column(String(50), default="queued")  # queued, running, completed, failed, cancelled
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    execution_time_ms = Column(Integer, nullable=True)
    
    # Agent workflow
    plan = Column(JSON, nullable=True)  # The agent's execution plan
    steps_executed = Column(JSON, default=[])  # Array of executed steps
    tools_used = Column(JSON, default=[])  # Array of tools used
    
    # Results
    result = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Resource usage
    tokens_used = Column(Integer, default=0)
    api_calls_made = Column(Integer, default=0)
    
    # User who initiated
    initiated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    tenant = relationship("Tenant", backref="agent_executions")
    assistant = relationship("Assistant", backref="agent_executions")
    capability = relationship("Capability", backref="agent_executions")
    
    def __repr__(self):
        return f"<AgentExecution(id={self.id}, type={self.request_type}, status={self.status})>"

