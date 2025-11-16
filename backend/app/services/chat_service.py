"""
Chat service - handles conversations and messages
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Optional, Dict, AsyncGenerator
from uuid import UUID, uuid4
from datetime import datetime
from app.models.conversation import Conversation, Message
from app.models.assistant import Assistant
from app.models.tenant import Tenant
from app.services.assistants.factory import AssistantFactory
from app.services.assistants.base import AssistantType
from app.utils.errors import AssistantNotFoundError, ConversationNotFoundError
from app.utils.logger import logger


class ChatService:
    """Service for handling chat conversations"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_conversation(
        self,
        tenant_id: UUID,
        assistant_id: UUID,
        user_id: Optional[UUID] = None,
        session_id: Optional[str] = None
    ) -> Conversation:
        """Create a new conversation"""
        if not session_id:
            session_id = str(uuid4())
        
        # Verify assistant exists and belongs to tenant
        result = await self.db.execute(
            select(Assistant).where(
                Assistant.id == assistant_id,
                Assistant.tenant_id == tenant_id,
                Assistant.is_active == True
            )
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant:
            raise AssistantNotFoundError(str(assistant_id))
        
        conversation = Conversation(
            tenant_id=tenant_id,
            assistant_id=assistant_id,
            user_id=user_id,
            session_id=session_id
        )
        
        self.db.add(conversation)
        await self.db.commit()
        await self.db.refresh(conversation)
        
        logger.info(f"Created conversation {conversation.id} for tenant {tenant_id}")
        return conversation
    
    async def get_conversation(
        self,
        conversation_id: UUID,
        tenant_id: UUID
    ) -> Conversation:
        """Get conversation by ID"""
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.id == conversation_id,
                Conversation.tenant_id == tenant_id
            )
        )
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            raise ConversationNotFoundError(str(conversation_id))
        
        return conversation
    
    async def get_conversation_by_session(
        self,
        session_id: str,
        tenant_id: UUID
    ) -> Optional[Conversation]:
        """Get conversation by session ID"""
        result = await self.db.execute(
            select(Conversation).where(
                Conversation.session_id == session_id,
                Conversation.tenant_id == tenant_id
            )
        )
        return result.scalar_one_or_none()
    
    async def list_conversations(
        self,
        tenant_id: UUID,
        user_id: Optional[UUID] = None,
        assistant_id: Optional[UUID] = None,
        limit: int = 50,
        offset: int = 0
    ) -> tuple[List[Conversation], int]:
        """List conversations for a tenant"""
        query = select(Conversation).where(
            Conversation.tenant_id == tenant_id,
            Conversation.is_archived == False
        )
        
        if user_id:
            query = query.where(Conversation.user_id == user_id)
        
        if assistant_id:
            query = query.where(Conversation.assistant_id == assistant_id)
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one()
        
        # Get conversations
        query = query.order_by(desc(Conversation.last_message_at)).limit(limit).offset(offset)
        result = await self.db.execute(query)
        conversations = result.scalars().all()
        
        return list(conversations), total
    
    async def add_message(
        self,
        conversation_id: UUID,
        role: str,
        content: str,
        tokens_used: int = 0,
        model_used: Optional[str] = None,
        tool_calls: List[Dict] = None,
        metadata: Dict = None
    ) -> Message:
        """Add a message to a conversation"""
        message = Message(
            conversation_id=conversation_id,
            role=role,
            content=content,
            tokens_used=tokens_used,
            model_used=model_used,
            tool_calls=tool_calls or [],
            message_metadata=metadata or {}
        )
        
        self.db.add(message)
        
        # Update conversation
        result = await self.db.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        conversation = result.scalar_one_or_none()
        if not conversation:
            raise ConversationNotFoundError(str(conversation_id))
        
        conversation.message_count += 1
        conversation.total_tokens_used += tokens_used
        conversation.last_message_at = datetime.utcnow()
        
        await self.db.commit()
        await self.db.refresh(message)
        
        return message
    
    async def get_messages(
        self,
        conversation_id: UUID,
        limit: int = 100
    ) -> List[Message]:
        """Get messages for a conversation"""
        result = await self.db.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at)
            .limit(limit)
        )
        return list(result.scalars().all())
    
    async def stream_chat_response(
        self,
        tenant_id: UUID,
        assistant_id: UUID,
        user_message: str,
        session_id: Optional[str] = None,
        user_id: Optional[UUID] = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream chat response from assistant
        Placeholder - AI integration not implemented
        """
        # Get or create conversation
        conversation = None
        if session_id:
            conversation = await self.get_conversation_by_session(session_id, tenant_id)
        
        if not conversation:
            conversation = await self.create_conversation(
                tenant_id=tenant_id,
                assistant_id=assistant_id,
                user_id=user_id,
                session_id=session_id
            )
        
        # Save user message
        await self.add_message(
            conversation_id=conversation.id,
            role="user",
            content=user_message
        )
        
        # Get assistant
        result = await self.db.execute(
            select(Assistant).where(Assistant.id == assistant_id)
        )
        assistant_model = result.scalar_one_or_none()
        
        if not assistant_model:
            raise AssistantNotFoundError(str(assistant_id))
        
        # Get tenant config
        result = await self.db.execute(
            select(Tenant).where(Tenant.id == tenant_id)
        )
        tenant = result.scalar_one_or_none()
        
        tenant_config = {
            "brand_voice": tenant.brand_voice if tenant else "professional",
            "target_audience": tenant.target_audience if tenant else "general",
            "offerings": tenant.offerings if tenant else ""
        }
        
        # Create assistant instance
        assistant_type = AssistantType(assistant_model.assistant_type)
        assistant = AssistantFactory.create(
            assistant_type=assistant_type,
            tenant_id=str(tenant_id)
        )
        
        # Get conversation history
        messages = await self.get_messages(conversation.id)
        message_history = [
            {"role": msg.role, "content": msg.content}
            for msg in messages
        ]
        
        # Stream response (placeholder)
        response_content = ""
        async for chunk in assistant.stream_response(
            messages=message_history,
            session_id=conversation.session_id,
            tenant_config=tenant_config
        ):
            response_content += chunk
            yield chunk
        
        # Save assistant response
        await self.add_message(
            conversation_id=conversation.id,
            role="assistant",
            content=response_content
        )

