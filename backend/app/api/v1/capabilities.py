"""
Capability API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.assistant import Assistant
from app.models.capability import Capability
from app.models.integration import SocialIntegration
from app.services.capability_service import CapabilityService
from app.utils.logger import logger
from pydantic import BaseModel

router = APIRouter(tags=["capabilities"])


class CapabilityCreate(BaseModel):
    capability_type: str
    config: Optional[dict] = {}


class CapabilityResponse(BaseModel):
    id: str
    assistant_id: str
    capability_type: str
    status: str
    setup_completed: bool
    integrations_required: List[str]
    integrations_connected: int
    config: dict

    class Config:
        from_attributes = True


@router.get("/assistants/{assistant_id}/capabilities", response_model=dict)
async def list_capabilities(
    assistant_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all capabilities for an assistant"""
    try:
        # Verify assistant belongs to user's tenant
        from sqlalchemy import select
        result = await db.execute(
            select(Assistant).where(
                Assistant.id == assistant_id,
                Assistant.tenant_id == current_user.tenant_id
            )
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assistant not found"
            )
        
        capability_service = CapabilityService(db)
        capabilities = await capability_service.get_capabilities_for_assistant(assistant_id)
        
        return {
            "capabilities": [
                {
                    "id": str(c.id),
                    "assistant_id": str(c.assistant_id),
                    "capability_type": c.capability_type,
                    "status": c.status,
                    "setup_completed": c.setup_completed,
                    "integrations_required": c.integrations_required or [],
                    "integrations_connected": c.integrations_connected,
                    "config": c.config or {}
                }
                for c in capabilities
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error listing capabilities: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list capabilities"
        )


@router.post("/assistants/{assistant_id}/capabilities", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_capability(
    assistant_id: UUID,
    capability_data: CapabilityCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new capability for an assistant"""
    try:
        # Verify assistant belongs to user's tenant
        from sqlalchemy import select
        result = await db.execute(
            select(Assistant).where(
                Assistant.id == assistant_id,
                Assistant.tenant_id == current_user.tenant_id
            )
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assistant not found"
            )
        
        capability_service = CapabilityService(db)
        capability = await capability_service.create_or_update_capability(
            assistant_id=assistant_id,
            capability_type=capability_data.capability_type,
            config=capability_data.config
        )
        
        return {
            "capability": {
                "id": str(capability.id),
                "assistant_id": str(capability.assistant_id),
                "capability_type": capability.capability_type,
                "status": capability.status,
                "setup_completed": capability.setup_completed,
                "integrations_required": capability.integrations_required or [],
                "integrations_connected": capability.integrations_connected,
                "config": capability.config or {}
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating capability: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create capability: {str(e)}"
        )


@router.get("/capabilities/{capability_id}", response_model=dict)
async def get_capability(
    capability_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific capability"""
    try:
        capability_service = CapabilityService(db)
        capability = await capability_service.get_capability(capability_id)
        
        if not capability:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Capability not found"
            )
        
        # Verify it belongs to user's tenant
        from sqlalchemy import select
        result = await db.execute(
            select(Assistant).where(Assistant.id == capability.assistant_id)
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant or assistant.tenant_id != current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return {
            "id": str(capability.id),
            "assistant_id": str(capability.assistant_id),
            "capability_type": capability.capability_type,
            "status": capability.status,
            "setup_completed": capability.setup_completed,
            "integrations_required": capability.integrations_required or [],
            "integrations_connected": capability.integrations_connected,
            "config": capability.config or {}
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting capability: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get capability"
        )


@router.post("/capabilities/{capability_id}/setup", response_model=dict)
async def setup_capability(
    capability_id: UUID,
    config: Optional[dict] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Initialize setup for a capability"""
    try:
        capability_service = CapabilityService(db)
        capability = await capability_service.get_capability(capability_id)
        
        if not capability:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Capability not found"
            )
        
        # Verify it belongs to user's tenant
        from sqlalchemy import select
        result = await db.execute(
            select(Assistant).where(Assistant.id == capability.assistant_id)
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant or assistant.tenant_id != current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Update capability status to configuring and check current integration status
        # Get assistant to find tenant_id
        result = await db.execute(
            select(Assistant).where(Assistant.id == capability.assistant_id)
        )
        assistant = result.scalar_one_or_none()
        
        if assistant:
            # Update integration counts for this capability
            required_platforms = capability.integrations_required or []
            connected_count = 0
            
            for platform in required_platforms:
                platform_result = await db.execute(
                    select(SocialIntegration).where(
                        SocialIntegration.tenant_id == assistant.tenant_id,
                        SocialIntegration.assistant_id == assistant.id,
                        SocialIntegration.platform == platform,
                        SocialIntegration.is_active == True
                    )
                )
                integrations = platform_result.scalars().all()
                if integrations:
                    connected_count += 1
            
            # Update capability with current status
            capability = await capability_service.update_capability_status(
                capability_id=capability_id,
                status="configuring" if connected_count < len(required_platforms) else "active",
                integrations_connected=connected_count
            )
        else:
            # Just update status to configuring
            capability = await capability_service.update_capability_status(
                capability_id=capability_id,
                status="configuring"
            )
        
        # Update config if provided
        if config:
            capability.config = {**(capability.config or {}), **config}
            await db.commit()
            await db.refresh(capability)
        
        return {
            "capability": {
                "id": str(capability.id),
                "assistant_id": str(capability.assistant_id),
                "capability_type": capability.capability_type,
                "status": capability.status,
                "setup_completed": capability.setup_completed,
                "integrations_required": capability.integrations_required or [],
                "integrations_connected": capability.integrations_connected,
                "config": capability.config or {}
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting up capability: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to setup capability: {str(e)}"
        )


@router.get("/capabilities/{capability_id}/setup-status", response_model=dict)
async def get_capability_setup_status(
    capability_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get setup status for a capability"""
    try:
        capability_service = CapabilityService(db)
        capability = await capability_service.get_capability(capability_id)
        
        if not capability:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Capability not found"
            )
        
        # Verify it belongs to user's tenant
        from sqlalchemy import select
        result = await db.execute(
            select(Assistant).where(Assistant.id == capability.assistant_id)
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant or assistant.tenant_id != current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return {
            "capability_id": str(capability.id),
            "status": capability.status,
            "setup_completed": capability.setup_completed,
            "integrations_required": capability.integrations_required or [],
            "integrations_connected": capability.integrations_connected,
            "progress": {
                "required": len(capability.integrations_required or []),
                "connected": capability.integrations_connected,
                "percentage": int((capability.integrations_connected / len(capability.integrations_required or [1])) * 100) if capability.integrations_required else 0
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting setup status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get setup status"
        )

