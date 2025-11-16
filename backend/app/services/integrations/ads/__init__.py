"""
Ads integration services
"""
from app.services.integrations.ads.google_ads_service import GoogleAdsCampaignService
from app.services.integrations.ads.meta_ads_service import MetaAdsCampaignService

__all__ = [
    "GoogleAdsCampaignService",
    "MetaAdsCampaignService",
]

