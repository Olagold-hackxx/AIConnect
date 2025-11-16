"""
Campaign Creation Tools for LangChain agents
"""
from typing import Dict, List, Any, Optional
try:
    from langchain_core.tools import tool
except ImportError:
    from langchain.tools import tool
from app.utils.logger import logger


@tool
async def create_campaign_plan(
    campaign_objective: str,
    target_audience: str,
    budget: float,
    duration_days: int,
    channels: List[str] = None
) -> Dict[str, Any]:
    """
    Create a comprehensive campaign plan with strategy, messaging, and asset requirements.
    
    Args:
        campaign_objective: The main goal of the campaign (e.g., "product launch", "brand awareness", "lead generation")
        target_audience: Description of the target audience
        budget: Total campaign budget in dollars
        duration_days: Campaign duration in days
        channels: List of channels to use (e.g., ["google_ads", "meta_ads"])
    
    Returns:
        Dictionary with campaign plan including strategy, messaging, ad copy, and budget allocation
    """
    try:
        if channels is None:
            channels = ["google_ads", "meta_ads"]
        
        # Calculate budget allocation (default: 50/50 split)
        budget_per_channel = budget / len(channels) if channels else budget
        
        plan = {
            "objective": campaign_objective,
            "target_audience": target_audience,
            "total_budget": budget,
            "duration_days": duration_days,
            "channels": channels,
            "budget_allocation": {channel: budget_per_channel for channel in channels},
            "strategy": f"Campaign focused on {campaign_objective} targeting {target_audience}",
            "messaging": {
                "primary_message": f"Focus on {campaign_objective}",
                "key_benefits": [],
                "call_to_action": "Learn More"
            },
            "ad_requirements": {
                "headlines": [],
                "descriptions": [],
                "landing_page_url": None
            }
        }
        
        return {"success": True, "plan": plan}
    except Exception as e:
        logger.error(f"Campaign plan creation failed: {str(e)}")
        return {"success": False, "error": str(e)}


@tool
async def generate_ad_copy(
    campaign_objective: str,
    product_service: str,
    target_audience: str,
    platform: str = "google_ads"
) -> Dict[str, Any]:
    """
    Generate ad copy for ads (headlines, descriptions, etc.).
    
    Args:
        campaign_objective: The campaign goal
        product_service: Product or service being promoted
        target_audience: Target audience description
        platform: Platform for the ad (google_ads, meta_ads)
    
    Returns:
        Dictionary with ad copy including headlines and descriptions
    """
    try:
        # This will be enhanced by the LLM in the agent
        ad_copy = {
            "platform": platform,
            "headlines": [],
            "descriptions": [],
            "call_to_action": "Learn More"
        }
        
        if platform == "google_ads":
            # Google Ads requires 3 headlines and 2 descriptions
            ad_copy["headlines"] = [
                f"Discover {product_service}",
                f"Best {product_service} Solutions",
                f"{product_service} for {target_audience}"
            ]
            ad_copy["descriptions"] = [
                f"Transform your business with {product_service}. Perfect for {target_audience}.",
                f"Get started today and see results. Designed for {target_audience}."
            ]
        elif platform == "meta_ads":
            # Meta Ads format
            ad_copy["headlines"] = [
                f"{product_service} - Perfect for {target_audience}",
                f"Transform Your Business Today"
            ]
            ad_copy["descriptions"] = [
                f"Discover how {product_service} can help you achieve {campaign_objective}. "
                f"Designed specifically for {target_audience}."
            ]
        
        return {"success": True, "ad_copy": ad_copy}
    except Exception as e:
        logger.error(f"Ad copy generation failed: {str(e)}")
        return {"success": False, "error": str(e)}


@tool
async def allocate_budget(
    total_budget: float,
    channels: List[str],
    allocation_strategy: str = "equal"
) -> Dict[str, Any]:
    """
    Allocate budget across different channels.
    
    Args:
        total_budget: Total campaign budget
        channels: List of channels
        allocation_strategy: Strategy for allocation (equal, performance_based, manual)
    
    Returns:
        Dictionary with budget allocation per channel
    """
    try:
        if allocation_strategy == "equal":
            budget_per_channel = total_budget / len(channels) if channels else total_budget
            allocation = {channel: budget_per_channel for channel in channels}
        else:
            # Default to equal allocation
            budget_per_channel = total_budget / len(channels) if channels else total_budget
            allocation = {channel: budget_per_channel for channel in channels}
        
        return {"success": True, "allocation": allocation}
    except Exception as e:
        logger.error(f"Budget allocation failed: {str(e)}")
        return {"success": False, "error": str(e)}


# Export tools
CAMPAIGN_TOOLS = [
    create_campaign_plan,
    generate_ad_copy,
    allocate_budget,
]

