"""
Assistant API routes
Users can only select/activate from 3 predefined assistants
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.dependencies import get_current_user, get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.assistant import (
    AssistantResponse, 
    AssistantListResponse, 
    AssistantActivateRequest,
    AssistantUpdate
)
from app.services.assistant_service import AssistantService
from app.services.assistants.base import AssistantType
from app.utils.errors import AssistantNotFoundError

router = APIRouter(prefix="/assistants", tags=["assistants"])


@router.get("", response_model=AssistantListResponse)
async def list_assistants(
    current_tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """
    List all available assistants for current tenant
    Returns all 3 predefined assistants with their activation status
    """
    service = AssistantService(db)
    assistants = await service.get_available_assistants(current_tenant.id)
    
    return AssistantListResponse(
        assistants=assistants,
        total=len(assistants)
    )


@router.get("/{assistant_id}", response_model=AssistantResponse)
async def get_assistant(
    assistant_id: UUID,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """Get assistant by ID"""
    service = AssistantService(db)
    assistant = await service.get_assistant(
        tenant_id=current_tenant.id,
        assistant_id=assistant_id
    )
    return assistant


@router.post("/activate", response_model=AssistantResponse)
async def activate_assistant(
    request: AssistantActivateRequest,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """
    Activate an assistant for the current tenant
    Users can only activate from the 3 predefined assistants
    """
    try:
        assistant_type = AssistantType(request.assistant_type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid assistant type. Must be one of: digital_marketer, executive_assistant, customer_support"
        )
    
    service = AssistantService(db)
    assistant = await service.activate_assistant(
        tenant_id=current_tenant.id,
        assistant_type=assistant_type
    )
    
    return assistant


@router.post("/{assistant_id}/deactivate", response_model=AssistantResponse)
async def deactivate_assistant(
    assistant_id: UUID,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """Deactivate an assistant for the current tenant"""
    service = AssistantService(db)
    assistant = await service.deactivate_assistant(
        tenant_id=current_tenant.id,
        assistant_id=assistant_id
    )
    return assistant


@router.patch("/{assistant_id}", response_model=AssistantResponse)
async def update_assistant(
    assistant_id: UUID,
    assistant_data: AssistantUpdate,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """
    Update assistant configuration
    Only allows updating custom_instructions, system_prompt_override, and tool_config
    """
    service = AssistantService(db)
    assistant = await service.get_assistant(
        tenant_id=current_tenant.id,
        assistant_id=assistant_id
    )
    
    update_data = assistant_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(assistant, field, value)
    
    await db.commit()
    await db.refresh(assistant)
    
    return assistant

