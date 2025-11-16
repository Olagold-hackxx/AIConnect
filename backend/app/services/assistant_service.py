"""
Assistant service - handles assistant initialization and activation
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID
from app.models.assistant import Assistant
from app.services.assistants.base import AssistantType
from app.utils.errors import AssistantNotFoundError
from app.utils.logger import logger


class AssistantService:
    """Service for managing assistants"""
    
    # Predefined assistant configurations
    ASSISTANT_TEMPLATES = {
        AssistantType.DIGITAL_MARKETER: {
            "name": "Digital Marketer",
            "description": "Content creation, SEO optimization, campaign planning, and analytics",
            "llm_provider": "openai",
            "llm_model": "gpt-4o-mini",
            "temperature": "0.7",
            "max_tokens": "2000",
            "enabled_tools": [
                "keyword_research",
                "generate_image",
                "analyze_seo",
                "get_analytics"
            ]
        },
        AssistantType.EXECUTIVE_ASSISTANT: {
            "name": "Executive Assistant",
            "description": "Calendar management, email drafting, meeting prep, and document summarization",
            "llm_provider": "openai",
            "llm_model": "gpt-4o-mini",
            "temperature": "0.7",
            "max_tokens": "2000",
            "enabled_tools": [
                "manage_calendar",
                "draft_email",
                "summarize_document"
            ]
        },
        AssistantType.CUSTOMER_SUPPORT: {
            "name": "Customer Support",
            "description": "Ticket triage, FAQ responses, knowledge base search, and escalation handling",
            "llm_provider": "openai",
            "llm_model": "gpt-4o-mini",
            "temperature": "0.7",
            "max_tokens": "2000",
            "enabled_tools": [
                "search_knowledge_base",
                "create_ticket",
                "escalate_issue"
            ]
        }
    }
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def initialize_default_assistants(self, tenant_id: UUID) -> List[Assistant]:
        """
        Initialize the 3 default assistants for a new tenant
        All assistants start as inactive (not activated)
        """
        assistants = []
        
        for assistant_type, config in self.ASSISTANT_TEMPLATES.items():
            # Check if assistant already exists
            result = await self.db.execute(
                select(Assistant).where(
                    Assistant.tenant_id == tenant_id,
                    Assistant.assistant_type == assistant_type.value
                )
            )
            existing = result.scalar_one_or_none()
            
            if existing:
                assistants.append(existing)
                continue
            
            # Create new assistant
            assistant = Assistant(
                tenant_id=tenant_id,
                assistant_type=assistant_type.value,
                name=config["name"],
                description=config["description"],
                llm_provider=config["llm_provider"],
                llm_model=config["llm_model"],
                temperature=config["temperature"],
                max_tokens=config["max_tokens"],
                enabled_tools=config["enabled_tools"],
                is_active=False,  # Not activated by default
                is_default=False
            )
            
            self.db.add(assistant)
            assistants.append(assistant)
        
        await self.db.commit()
        
        for assistant in assistants:
            await self.db.refresh(assistant)
        
        logger.info(f"Initialized {len(assistants)} default assistants for tenant {tenant_id}")
        return assistants
    
    async def get_available_assistants(self, tenant_id: UUID) -> List[Assistant]:
        """
        Get all available assistants for a tenant (all 3, regardless of activation status)
        """
        result = await self.db.execute(
            select(Assistant).where(
                Assistant.tenant_id == tenant_id
            ).order_by(Assistant.assistant_type)
        )
        assistants = result.scalars().all()
        
        # If no assistants exist, initialize them
        if not assistants:
            assistants = await self.initialize_default_assistants(tenant_id)
        
        return list(assistants)
    
    async def activate_assistant(
        self,
        tenant_id: UUID,
        assistant_type: AssistantType
    ) -> Assistant:
        """
        Activate an assistant for a tenant
        """
        result = await self.db.execute(
            select(Assistant).where(
                Assistant.tenant_id == tenant_id,
                Assistant.assistant_type == assistant_type.value
            )
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant:
            # Initialize if doesn't exist
            await self.initialize_default_assistants(tenant_id)
            result = await self.db.execute(
                select(Assistant).where(
                    Assistant.tenant_id == tenant_id,
                    Assistant.assistant_type == assistant_type.value
                )
            )
            assistant = result.scalar_one_or_none()
        
        if not assistant:
            raise AssistantNotFoundError(f"Assistant type {assistant_type.value} not found")
        
        assistant.is_active = True
        await self.db.commit()
        await self.db.refresh(assistant)
        
        logger.info(f"Activated assistant {assistant.id} ({assistant_type.value}) for tenant {tenant_id}")
        return assistant
    
    async def deactivate_assistant(
        self,
        tenant_id: UUID,
        assistant_id: UUID
    ) -> Assistant:
        """
        Deactivate an assistant for a tenant
        """
        result = await self.db.execute(
            select(Assistant).where(
                Assistant.id == assistant_id,
                Assistant.tenant_id == tenant_id
            )
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant:
            raise AssistantNotFoundError(str(assistant_id))
        
        assistant.is_active = False
        await self.db.commit()
        await self.db.refresh(assistant)
        
        logger.info(f"Deactivated assistant {assistant_id} for tenant {tenant_id}")
        return assistant
    
    async def get_assistant(
        self,
        tenant_id: UUID,
        assistant_id: UUID
    ) -> Assistant:
        """Get assistant by ID"""
        result = await self.db.execute(
            select(Assistant).where(
                Assistant.id == assistant_id,
                Assistant.tenant_id == tenant_id
            )
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant:
            raise AssistantNotFoundError(str(assistant_id))
        
        return assistant


