"""
Pydantic schemas for Assistant
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from uuid import UUID


class AssistantResponse(BaseModel):
    """Assistant response schema"""
    id: UUID
    tenant_id: UUID
    assistant_type: str
    name: str
    description: Optional[str]
    llm_provider: str
    llm_model: str
    temperature: str
    max_tokens: str
    vector_db_namespace: Optional[str]
    system_prompt_override: Optional[str]
    custom_instructions: Optional[str]
    enabled_tools: List[str]
    tool_config: Dict
    is_active: bool  # Whether this assistant is activated for the tenant
    is_default: bool
    created_at: datetime
    updated_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class AssistantListResponse(BaseModel):
    """List of assistants with metadata"""
    assistants: List[AssistantResponse]
    total: int


class AssistantActivateRequest(BaseModel):
    """Request to activate an assistant"""
    assistant_type: str = Field(..., pattern="^(digital_marketer|executive_assistant|customer_support)$")


class AssistantUpdate(BaseModel):
    """Update assistant configuration (limited fields)"""
    custom_instructions: Optional[str] = None
    system_prompt_override: Optional[str] = None
    tool_config: Optional[Dict] = None
