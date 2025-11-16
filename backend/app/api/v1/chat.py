"""
Chat API routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from uuid import UUID
from app.db.session import get_db
from app.dependencies import get_current_user, get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.chat import MessageCreate, ConversationResponse, ConversationListResponse, ChatStreamChunk
from app.services.chat_service import ChatService
import json

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/stream", response_class=StreamingResponse)
async def stream_chat(
    message: MessageCreate,
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Stream chat response from assistant
    """
    service = ChatService(db)
    
    async def generate():
        try:
            async for chunk in service.stream_chat_response(
                tenant_id=current_tenant.id,
                assistant_id=message.assistant_id,
                user_message=message.content,
                session_id=message.session_id,
                user_id=current_user.id
            ):
                chunk_data = ChatStreamChunk(
                    type="message",
                    content=chunk,
                    conversation_id=None
                )
                yield f"data: {chunk_data.model_dump_json()}\n\n"
            
            # Send done signal
            done_chunk = ChatStreamChunk(type="done")
            yield f"data: {done_chunk.model_dump_json()}\n\n"
        
        except Exception as e:
            error_chunk = ChatStreamChunk(
                type="error",
                content=str(e)
            )
            yield f"data: {error_chunk.model_dump_json()}\n\n"
    
    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


@router.get("/conversations", response_model=ConversationListResponse)
async def list_conversations(
    assistant_id: Optional[UUID] = None,
    limit: int = 50,
    offset: int = 0,
    current_tenant: Tenant = Depends(get_current_tenant),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List conversations for current tenant"""
    service = ChatService(db)
    conversations, total = await service.list_conversations(
        tenant_id=current_tenant.id,
        user_id=current_user.id,
        assistant_id=assistant_id,
        limit=limit,
        offset=offset
    )
    return ConversationListResponse(conversations=conversations, total=total)


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: UUID,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """Get conversation by ID"""
    service = ChatService(db)
    conversation = await service.get_conversation(
        conversation_id=conversation_id,
        tenant_id=current_tenant.id
    )
    return conversation

