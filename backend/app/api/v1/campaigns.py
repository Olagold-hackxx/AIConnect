"""
Campaign Management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel
from datetime import date

from app.db.session import get_db
from app.dependencies import get_current_user, get_current_tenant
from app.models.user import User
from app.models.campaign import Campaign, CampaignAsset
from app.models.integration import SocialIntegration
from app.models.tenant import Tenant
from app.services.integrations.ads import GoogleAdsCampaignService, MetaAdsCampaignService
from app.utils.logger import logger

router = APIRouter(tags=["campaigns"])


class CampaignResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    campaign_type: Optional[str]
    start_date: Optional[date]
    end_date: Optional[date]
    channels: List[str]
    total_budget: Optional[float]
    budget_allocation: Optional[Dict[str, float]]
    status: str
    plan: Optional[Dict[str, Any]]
    metrics: Optional[Dict[str, Any]]
    created_at: str
    execution_id: Optional[str]


class CampaignListResponse(BaseModel):
    campaigns: List[CampaignResponse]


@router.get("/campaigns", response_model=CampaignListResponse)
async def list_campaigns(
    status_filter: Optional[str] = Query(None, description="Filter campaigns by status"),
    current_tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """List all campaigns for the current tenant"""
    try:
        query = select(Campaign).where(Campaign.tenant_id == current_tenant.id)
        
        if status_filter:
            query = query.where(Campaign.status == status_filter)
        
        query = query.order_by(Campaign.created_at.desc())
        
        result = await db.execute(query)
        campaigns = result.scalars().all()
        
        return CampaignListResponse(
            campaigns=[
                CampaignResponse(
                    id=str(c.id),
                    name=c.name,
                    description=c.description,
                    campaign_type=c.campaign_type,
                    start_date=c.start_date,
                    end_date=c.end_date,
                    channels=c.channels,
                    total_budget=float(c.total_budget) if c.total_budget else None,
                    budget_allocation={k: float(v) for k, v in c.budget_allocation.items()} if c.budget_allocation else None,
                    status=c.status,
                    plan=c.plan,
                    metrics=c.metrics,
                    created_at=c.created_at.isoformat() if c.created_at else "",
                    execution_id=str(c.execution_id) if c.execution_id else None
                )
                for c in campaigns
            ]
        )
    except Exception as e:
        logger.error(f"Error listing campaigns: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list campaigns: {str(e)}"
        )


@router.get("/campaigns/{campaign_id}", response_model=CampaignResponse)
async def get_campaign(
    campaign_id: UUID,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific campaign"""
    try:
        result = await db.execute(
            select(Campaign).where(
                Campaign.id == campaign_id,
                Campaign.tenant_id == current_tenant.id
            )
        )
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        return CampaignResponse(
            id=str(campaign.id),
            name=campaign.name,
            description=campaign.description,
            campaign_type=campaign.campaign_type,
            start_date=campaign.start_date,
            end_date=campaign.end_date,
            channels=campaign.channels,
            total_budget=float(campaign.total_budget) if campaign.total_budget else None,
            budget_allocation={k: float(v) for k, v in campaign.budget_allocation.items()} if campaign.budget_allocation else None,
            status=campaign.status,
            plan=campaign.plan,
            metrics=campaign.metrics,
            created_at=campaign.created_at.isoformat() if campaign.created_at else "",
            execution_id=str(campaign.execution_id) if campaign.execution_id else None
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting campaign: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get campaign: {str(e)}"
        )


@router.post("/campaigns/{campaign_id}/approve", response_model=Dict[str, Any])
async def approve_campaign(
    campaign_id: UUID,
    current_tenant: Tenant = Depends(get_current_tenant),
    db: AsyncSession = Depends(get_db)
):
    """
    Approve and launch a campaign to platforms (Google Ads, Meta Ads)
    This will create the actual campaigns in the advertising platforms
    """
    try:
        # Get campaign
        result = await db.execute(
            select(Campaign).where(
                Campaign.id == campaign_id,
                Campaign.tenant_id == current_tenant.id
            )
        )
        campaign = result.scalar_one_or_none()
        
        if not campaign:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Campaign not found"
            )
        
        if campaign.status != "draft":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot approve campaign with status: {campaign.status}"
            )
        
        # Get tenant for website URL
        website_url = current_tenant.website_url if current_tenant.website_url else ""
        
        # Get integrations for each channel
        created_assets = []
        errors = []
        
        for channel in campaign.channels:
            try:
                # Get integration for this channel
                integration_result = await db.execute(
                    select(SocialIntegration).where(
                        SocialIntegration.tenant_id == current_tenant.id,
                        SocialIntegration.platform == channel,
                        SocialIntegration.is_active == True
                    )
                )
                integration = integration_result.scalar_one_or_none()
                
                if not integration:
                    errors.append(f"No active integration found for {channel}")
                    continue
                
                # Extract ad copy from plan
                plan = campaign.plan or {}
                ad_copy = plan.get("ad_copy", {}).get(channel, {})
                
                if channel == "google_ads":
                    # Extract login_customer_id (manager account) and client_id from organizations array
                    # Pattern: login_customer_id = manager account (for auth), client_id = target account (for campaigns)
                    login_customer_id = None  # Manager account for authentication
                    client_id = None  # Client account where campaign is created
                    
                    logger.info(f"Google Ads integration - organizations: {integration.organizations}")
                    logger.info(f"Google Ads integration - meta_data: {integration.meta_data}")
                    
                    # Get manager account (login_customer_id) - this is the account used for authentication
                    # Customer IDs should already be 10 digits as fetched from Google Ads API
                    if integration.organizations and isinstance(integration.organizations, list):
                        manager_account = next(
                            (org for org in integration.organizations if org.get("type") == "manager"),
                            None
                        )
                        if manager_account:
                            login_customer_id = manager_account.get("customer_id")
                            logger.info(f"Found manager account with customer_id: {login_customer_id}")
                            
                            # Validate it's a string (should be 10 digits)
                            if login_customer_id:
                                login_customer_id = str(login_customer_id).strip()
                                
                                # Check if user has selected a default client account
                                default_client_id = None
                                if integration.meta_data and integration.meta_data.get("default_page_id"):
                                    default_client_id = str(integration.meta_data.get("default_page_id")).strip()
                                    logger.info(f"Found default client account from default_page_id: {default_client_id}")
                                
                                # Get client_id from default_page_id if set, otherwise from manager's client_ids
                                client_ids = manager_account.get("client_ids", [])
                                if default_client_id and client_ids and isinstance(client_ids, list):
                                    # Validate that the default_client_id is in the manager's client_ids
                                    client_id_strs = [str(cid).strip() for cid in client_ids]
                                    if default_client_id in client_id_strs:
                                        client_id = default_client_id
                                        logger.info(f"Using selected default client_id: {client_id}")
                                    else:
                                        logger.warning(f"Default client_id {default_client_id} not found in manager's client_ids, will use first available")
                                
                                # If no default selected or invalid, use first valid client_id
                                if not client_id and client_ids and isinstance(client_ids, list) and len(client_ids) > 0:
                                    # Validate client_ids are 10 digits
                                    valid_client_ids = [
                                        str(cid).strip() 
                                        for cid in client_ids 
                                        if str(cid).strip().isdigit() and len(str(cid).strip()) == 10
                                    ]
                                    if valid_client_ids:
                                        client_id = valid_client_ids[0]  # Use first valid client account
                                        logger.info(f"Using first client_id from manager's client_ids: {client_id}")
                                    else:
                                        logger.warning(f"Manager account has no valid client_ids, will use manager account itself")
                    
                    # If no manager account with valid client_ids, use the first organization as both login and client
                    # This means we'll create campaigns in the user's own account (not through manager)
                    if not login_customer_id and integration.organizations and isinstance(integration.organizations, list):
                        first_org = integration.organizations[0]
                        login_customer_id = first_org.get("customer_id")
                        if login_customer_id:
                            login_customer_id = str(login_customer_id).strip()
                            # Validate it's 10 digits
                            if login_customer_id.isdigit() and len(login_customer_id) == 10:
                                logger.info(f"Using first organization as login_customer_id (same account for client): {login_customer_id}")
                                # Only use client_ids if they exist and are valid
                                client_ids = first_org.get("client_ids", [])
                                if client_ids and isinstance(client_ids, list) and len(client_ids) > 0:
                                    valid_client_ids = [
                                        str(cid).strip() 
                                        for cid in client_ids 
                                        if str(cid).strip().isdigit() and len(str(cid).strip()) == 10
                                    ]
                                    if valid_client_ids:
                                        client_id = valid_client_ids[0]
                                        logger.info(f"Using client_id from first org's client_ids: {client_id}")
                    
                    # Fallback to meta_data
                    if not login_customer_id and integration.meta_data:
                        login_customer_id = integration.meta_data.get("customer_id")
                        if login_customer_id:
                            login_customer_id = str(login_customer_id).strip()
                            if login_customer_id.isdigit() and len(login_customer_id) == 10:
                                logger.info(f"Using customer_id from meta_data: {login_customer_id}")
                    
                    # If no client_id found, use login_customer_id (same account - create campaigns in user's own account)
                    # This is the safest approach when manager-client relationship isn't established
                    if not client_id and login_customer_id:
                        client_id = login_customer_id
                        logger.info(f"No client_id found, using login_customer_id as client_id (same account): {client_id}")
                        logger.info("This means campaigns will be created in the user's own account, not through a manager account")
                    
                    if not login_customer_id:
                        errors.append("Google Ads: No manager customer_id found in integration. Please reconnect your Google Ads account.")
                        continue
                    
                    logger.info(f"Final Google Ads IDs - login_customer_id: {login_customer_id}, client_id: {client_id}")
                    
                    # Create Google Ads campaign service
                    try:
                        google_service = GoogleAdsCampaignService(
                            refresh_token=integration.refresh_token or integration.access_token,
                            login_customer_id=login_customer_id,  # Manager account for authentication
                            client_id=client_id  # Client account where campaign is created
                        )
                    except ValueError as e:
                        errors.append(f"Google Ads: Invalid customer_id - {str(e)}")
                        continue
                    except Exception as e:
                        errors.append(f"Google Ads: Error initializing service - {str(e)}")
                        logger.error(f"Google Ads service initialization error: {e}", exc_info=True)
                        continue
                    
                    # Create campaign
                    campaign_result = await google_service.create_campaign(
                        name=campaign.name,
                        budget_amount=float(campaign.budget_allocation.get(channel, 0)),
                        start_date=campaign.start_date,
                        end_date=campaign.end_date
                    )
                    
                    if campaign_result.get("success"):
                        google_campaign_id = campaign_result.get("campaign_id")
                        
                        # Create ad group
                        ad_group_result = await google_service.create_ad_group(
                            campaign_id=google_campaign_id,
                            name=f"{campaign.name} Ad Group"
                        )
                        
                        if ad_group_result.get("success"):
                            ad_group_id = ad_group_result.get("ad_group_id")
                            
                            # Create ad
                            headlines = ad_copy.get("headlines", [])
                            descriptions = ad_copy.get("descriptions", [])
                            
                            ad_result = await google_service.create_ad(
                                ad_group_id=ad_group_id,
                                headlines=headlines[:15] if headlines else ["Discover Our Services", "Best Solutions", "Get Started Today"],
                                descriptions=descriptions[:4] if descriptions else ["Transform your business", "See results today"],
                                final_url=website_url or ad_copy.get("final_url", website_url)
                            )
                            
                            if ad_result.get("success"):
                                # Create campaign asset record
                                asset = CampaignAsset(
                                    campaign_id=campaign.id,
                                    asset_type="ad",
                                    platform="google_ads",
                                    platform_asset_id=ad_result.get("ad_id"),
                                    status="active",
                                    meta_data={
                                        "campaign_id": google_campaign_id,
                                        "ad_group_id": ad_group_id,
                                        "ad_id": ad_result.get("ad_id")
                                    }
                                )
                                db.add(asset)
                                created_assets.append(f"Google Ads: {ad_result.get('ad_id')}")
                
                elif channel == "meta_ads":
                    # Create Meta Ads campaign
                    # Get ad account ID from integration organizations array
                    ad_account_id = None
                    page_id = None
                    
                    # Extract ad account ID from organizations array
                    if integration.organizations and isinstance(integration.organizations, list):
                        # Find the first active ad account
                        for org in integration.organizations:
                            ad_account_id = org.get("ad_account_id") or org.get("id")
                            if ad_account_id:
                                break
                    
                    # Fallback to meta_data
                    if not ad_account_id and integration.meta_data:
                        ad_account_id = integration.meta_data.get("ad_account_id")
                    
                    if not ad_account_id:
                        errors.append("Meta Ads: No ad account ID found. Please reconnect your Meta Ads account.")
                        continue
                    
                    logger.info(f"Meta Ads: Using ad account ID: {ad_account_id}")
                    
                    meta_service = MetaAdsCampaignService(
                        access_token=integration.access_token,
                        ad_account_id=ad_account_id
                    )
                    
                    # Get page ID from integration pages or organizations
                    pages = integration.pages or []
                    if pages and isinstance(pages, list) and len(pages) > 0:
                        page_id = pages[0].get("id") if isinstance(pages[0], dict) else pages[0]
                    
                    # If no page from pages, try to get from organizations
                    if not page_id and integration.organizations:
                        for org in integration.organizations:
                            if org.get("page_id"):
                                page_id = org.get("page_id")
                                break
                    
                    logger.info(f"Meta Ads: Using page ID: {page_id}")
                    
                    # Create campaign
                    campaign_result = await meta_service.create_campaign(
                        name=campaign.name,
                        objective=plan.get("objective", "LINK_CLICKS"),
                        daily_budget=float(campaign.budget_allocation.get(channel, 0)),
                        status="PAUSED"  # Start paused, user can activate later
                    )
                    
                    if campaign_result.get("success"):
                        meta_campaign_id = campaign_result.get("campaign_id")
                        
                        # Create ad set with bid_amount if available
                        bid_amount = plan.get("bid_amount")
                        ad_set_result = await meta_service.create_ad_set(
                            campaign_id=meta_campaign_id,
                            name=f"{campaign.name} Ad Set",
                            optimization_goal=plan.get("optimization_goal", "LINK_CLICKS"),
                            billing_event=plan.get("billing_event", "IMPRESSIONS"),
                            bid_amount=bid_amount,
                            start_time=campaign.start_date,
                            end_time=campaign.end_date,
                            page_id=page_id
                        )
                        
                        if ad_set_result.get("success"):
                            ad_set_id = ad_set_result.get("ad_set_id")
                            
                            # Get image URL from ad_copy if available
                            image_url = ad_copy.get("image_url")
                            
                            # Create ad creative
                            creative_result = await meta_service.create_ad_creative(
                                name=f"{campaign.name} Creative",
                                page_id=page_id,
                                title=ad_copy.get("headlines", [""])[0] if ad_copy.get("headlines") else campaign.name,
                                body=ad_copy.get("descriptions", [""])[0] if ad_copy.get("descriptions") else "",
                                link_url=website_url or ad_copy.get("link_url", website_url),
                                image_url=image_url
                            )
                            
                            if creative_result.get("success"):
                                creative_id = creative_result.get("creative_id")
                                
                                # Create ad
                                ad_result = await meta_service.create_ad(
                                    ad_set_id=ad_set_id,
                                    name=f"{campaign.name} Ad",
                                    creative_id=creative_id,
                                    status="PAUSED"
                                )
                                
                                if ad_result.get("success"):
                                    # Create campaign asset record
                                    asset = CampaignAsset(
                                        campaign_id=campaign.id,
                                        asset_type="ad",
                                        platform="meta_ads",
                                        platform_asset_id=ad_result.get("ad_id"),
                                        status="paused",
                                        meta_data={
                                            "campaign_id": meta_campaign_id,
                                            "ad_set_id": ad_set_id,
                                            "creative_id": creative_id,
                                            "ad_id": ad_result.get("ad_id"),
                                            "ad_account_id": ad_account_id
                                        }
                                    )
                                    db.add(asset)
                                    created_assets.append(f"Meta Ads: {ad_result.get('ad_id')}")
                                else:
                                    errors.append(f"Meta Ads: Failed to create ad: {ad_result.get('error')}")
                            else:
                                errors.append(f"Meta Ads: Failed to create creative: {creative_result.get('error')}")
                        else:
                            errors.append(f"Meta Ads: Failed to create ad set: {ad_set_result.get('error')}")
                    else:
                        errors.append(f"Meta Ads: Failed to create campaign: {campaign_result.get('error')}")
            
            except Exception as e:
                logger.error(f"Error creating campaign for {channel}: {str(e)}")
                errors.append(f"{channel}: {str(e)}")
        
        # Update campaign status
        if created_assets:
            campaign.status = "active"
        else:
            campaign.status = "failed"
        
        await db.commit()
        await db.refresh(campaign)
        
        return {
            "success": len(created_assets) > 0,
            "campaign_id": str(campaign.id),
            "status": campaign.status,
            "created_assets": created_assets,
            "errors": errors
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving campaign: {str(e)}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve campaign: {str(e)}"
        )

