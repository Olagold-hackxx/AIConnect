"""
Capability service - manages assistant capabilities
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict
from uuid import UUID
from datetime import datetime, timezone
from app.models.capability import Capability
from app.utils.logger import logger


class CapabilityService:
    """Service for managing assistant capabilities"""
    
    # Define required integrations for each capability
    CAPABILITY_INTEGRATIONS = {
        "content_creation": {
            "required": ["facebook"],  # Only 1 required (can be any social platform)
            "optional": ["instagram", "linkedin", "twitter", "tiktok"]
        },
        "campaigns": {
            "required": ["google_ads", "meta_ads"],  # At least one
            "optional": ["sendgrid"]
        },
        "analytics": {
            "required": ["google_analytics"],  # At least one
            "optional": ["google_ads", "meta_ads"]
        }
    }
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def get_capability(
        self,
        capability_id: UUID
    ) -> Optional[Capability]:
        """Get capability by ID"""
        result = await self.db.execute(
            select(Capability).where(Capability.id == capability_id)
        )
        return result.scalar_one_or_none()
    
    async def get_capabilities_for_assistant(
        self,
        assistant_id: UUID
    ) -> List[Capability]:
        """Get all capabilities for an assistant"""
        result = await self.db.execute(
            select(Capability).where(Capability.assistant_id == assistant_id)
        )
        return list(result.scalars().all())
    
    async def create_or_update_capability(
        self,
        assistant_id: UUID,
        capability_type: str,
        config: Optional[Dict] = None
    ) -> Capability:
        """Create or update a capability"""
        result = await self.db.execute(
            select(Capability).where(
                Capability.assistant_id == assistant_id,
                Capability.capability_type == capability_type
            )
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            existing.config = config or existing.config
            existing.updated_at = datetime.now(timezone.utc)
            await self.db.commit()
            await self.db.refresh(existing)
            return existing
        
        # Get required integrations
        integrations_info = self.CAPABILITY_INTEGRATIONS.get(capability_type, {})
        required_integrations = integrations_info.get("required", [])
        
        capability = Capability(
            assistant_id=assistant_id,
            capability_type=capability_type,
            config=config or {},
            integrations_required=required_integrations if isinstance(required_integrations, list) else [],
            status="not_configured",
            integrations_connected=0,
            setup_completed=False
        )
        
        self.db.add(capability)
        await self.db.commit()
        await self.db.refresh(capability)
        
        logger.info(f"Created capability {capability.id} for assistant {assistant_id}")
        return capability
    
    async def update_capability_status(
        self,
        capability_id: UUID,
        status: str,
        integrations_connected: Optional[int] = None
    ) -> Capability:
        """Update capability status"""
        capability = await self.get_capability(capability_id)
        if not capability:
            raise ValueError(f"Capability {capability_id} not found")
        
        capability.status = status
        if integrations_connected is not None:
            capability.integrations_connected = integrations_connected
        
        # Check if setup is complete
        # For capabilities, we need at least ONE of the required integrations
        required_platforms = capability.integrations_required or []
        required_count = len(required_platforms)
        
        # At least one required integration must be connected
        if integrations_connected is not None and integrations_connected > 0:
            if integrations_connected >= required_count:
                # All required integrations connected
                capability.setup_completed = True
                if status in ["not_configured", "configuring"]:
                    capability.status = "active"
            else:
                # Some integrations connected but not all
                capability.setup_completed = False
                if status == "not_configured":
                    capability.status = "configuring"
        else:
            # No integrations connected
            capability.setup_completed = False
            if status == "active":
                capability.status = "configuring"
        
        capability.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        await self.db.refresh(capability)
        
        return capability

