"""
Pydantic schemas for Chat/Conversation
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    assistant_id: UUID
    conversation_id: Optional[UUID] = None
    session_id: Optional[str] = None
    metadata: Dict[str, Any] = {}


class MessageResponse(BaseModel):
    id: UUID
    conversation_id: UUID
    role: str
    content: str
    tokens_used: int
    model_used: Optional[str]
    tool_calls: List[Dict]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    assistant_id: UUID
    user_id: Optional[UUID]
    session_id: str
    title: Optional[str]
    message_count: int
    total_tokens_used: int
    is_archived: bool
    created_at: datetime
    updated_at: Optional[datetime]
    last_message_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ConversationListResponse(BaseModel):
    conversations: List[ConversationResponse]
    total: int


class ChatStreamChunk(BaseModel):
    """Response chunk for streaming"""
    type: str  # message, tool_call, error, done
    content: Optional[str] = None
    conversation_id: Optional[UUID] = None
    metadata: Optional[Dict[str, Any]] = None

