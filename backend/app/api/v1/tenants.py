"""
Tenant API routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID
from app.db.session import get_db
from app.dependencies import get_current_user, get_current_tenant
from app.models.user import User
from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantUpdate, TenantResponse, TenantListResponse
from app.services.tenant_service import TenantService

router = APIRouter(prefix="/tenants", tags=["tenants"])


@router.post("", response_model=TenantResponse, status_code=status.HTTP_201_CREATED)
async def create_tenant(
    tenant_data: TenantCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new tenant"""
    service = TenantService(db)
    tenant = await service.create_tenant(
        name=tenant_data.name,
        slug=tenant_data.slug,
        domain=tenant_data.domain,
        brand_voice=tenant_data.brand_voice,
        target_audience=tenant_data.target_audience,
        offerings=tenant_data.offerings
    )
    return tenant


@router.get("/me", response_model=TenantResponse)
async def get_my_tenant(
    current_tenant: Tenant = Depends(get_current_tenant)
):
    """Get current user's tenant"""
    return current_tenant


@router.get("/{tenant_id}", response_model=TenantResponse)
async def get_tenant(
    tenant_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get tenant by ID"""
    service = TenantService(db)
    tenant = await service.get_tenant(tenant_id)
    
    # Ensure user belongs to tenant
    if current_user.tenant_id != tenant_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return tenant


@router.patch("/me", response_model=TenantResponse)
async def update_my_tenant(
    tenant_data: TenantUpdate,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """Update current tenant"""
    service = TenantService(db)
    update_data = tenant_data.model_dump(exclude_unset=True)
    tenant = await service.update_tenant(
        tenant_id=current_tenant.id,
        **update_data
    )
    return tenant


@router.get("", response_model=TenantListResponse)
async def list_tenants(
    limit: int = 50,
    offset: int = 0,
    is_active: bool = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List tenants (admin only - placeholder)"""
    # TODO: Add admin check
    service = TenantService(db)
    tenants, total = await service.list_tenants(
        limit=limit,
        offset=offset,
        is_active=is_active
    )
    return TenantListResponse(tenants=tenants, total=total)

