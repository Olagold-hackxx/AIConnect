"""
Google Ads API utility functions
"""
import asyncio
from typing import List, Optional, Dict, Any
from app.config import settings
from app.utils.logger import logger
import httpx

# Constants
GOOGLE_ADS_LIBRARY_ERROR = "google-ads library not installed. Install with: pip install google-ads"


async def get_customer_ids(refresh_token: str, access_token: Optional[str] = None) -> List[str]:
    """
    Get accessible customer IDs using Google Ads API
    
    Args:
        refresh_token: OAuth refresh token
        access_token: Optional OAuth access token (for initial auth)
        
    Returns:
        List of customer IDs
    """
    try:
        # Google Ads API client is synchronous, so we run it in a thread pool
        def _get_customer_ids_sync():
            try:
                from google.ads.googleads.client import GoogleAdsClient
                
                # Build client config - don't specify login_customer_id for initial listing
                client_config = {
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "developer_token": settings.GOOGLE_ADS_DEVELOPER_TOKEN,
                    "refresh_token": refresh_token,
                    "use_proto_plus": True,
                }
                
                # If we have an access_token, we can use it (though refresh_token should work)
                # The Google Ads client will use refresh_token to get a new access_token if needed
                
                logger.info(f"Initializing Google Ads client to list accessible customers")
                client = GoogleAdsClient.load_from_dict(client_config)
                
                # Try using CustomerService.list_accessible_customers() first
                try:
                    customer_service = client.get_service("CustomerService")
                    logger.info("Calling list_accessible_customers()")
                    response = customer_service.list_accessible_customers()
                    
                    customer_ids = []
                    for res in response.resource_names:
                        # Extract customer ID from resource name like "customers/1234567890"
                        customer_id = res.split("/")[-1]
                        # Validate it's 10 digits
                        if customer_id.isdigit() and len(customer_id) == 10:
                            customer_ids.append(customer_id)
                        else:
                            logger.warning(f"Invalid customer ID format from Google Ads API: {customer_id} (from resource: {res})")
                    
                    logger.info(f"Found {len(customer_ids)} valid customer IDs: {customer_ids}")
                    return customer_ids
                except Exception as e:
                    logger.warning(f"list_accessible_customers() failed: {e}, trying alternative method")
                    
                    # Alternative: Use GoogleAdsService to query customers
                    # This requires at least one customer ID, so we'll try to get it from the OAuth token
                    # Actually, we can't query without a customer ID, so let's try a different approach
                    
                    # Try using the access token to get user info and then query
                    # But we don't have access_token here, only refresh_token
                    
                    # Re-raise the original error since we don't have a good alternative
                    raise
            except ImportError:
                logger.error(GOOGLE_ADS_LIBRARY_ERROR)
                return []
            except Exception as e:
                logger.error(f"Error getting customer IDs: {e}", exc_info=True)
                return []
        
        # Run synchronous Google Ads API call in thread pool
        loop = asyncio.get_event_loop()
        customer_ids = await loop.run_in_executor(None, _get_customer_ids_sync)
        return customer_ids
        
    except Exception as e:
        logger.error(f"Error getting customer IDs: {e}", exc_info=True)
        return []


async def send_manager_link_request(
    refresh_token: str,
    manager_customer_id: str,
    client_customer_id: str
) -> Dict[str, Any]:
    """
    Send manager link request to establish manager-client relationship
    
    Args:
        refresh_token: OAuth refresh token
        manager_customer_id: Manager account customer ID
        client_customer_id: Client account customer ID
        
    Returns:
        Response dict with success status
    """
    try:
        def _send_manager_link_sync():
            try:
                from google.ads.googleads.client import GoogleAdsClient
                
                client = GoogleAdsClient.load_from_dict({
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "developer_token": settings.GOOGLE_ADS_DEVELOPER_TOKEN,
                    "refresh_token": refresh_token,
                    "login_customer_id": str(client_customer_id),
                    "use_proto_plus": True,
                })
                
                service = client.get_service("CustomerClientLinkService")
                operation = client.get_type("CustomerClientLinkOperation")
                link = operation.create
                link.client_customer = f"customers/{client_customer_id}"
                link.status = client.enums.ManagerLinkStatusEnum.PENDING
                
                response = service.mutate_customer_client_link(
                    customer_id=client_customer_id,
                    operation=operation
                )
                return {"success": True, "response": str(response)}
            except ImportError:
                logger.error(GOOGLE_ADS_LIBRARY_ERROR)
                return {"success": False, "error": "Google Ads library not installed"}
            except Exception as e:
                logger.error(f"Manager link request failed: {e}")
                return {"success": False, "error": str(e)}
        
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _send_manager_link_sync)
        return result
        
    except Exception as e:
        logger.error(f"Error sending manager link request: {e}")
        return {"success": False, "error": str(e)}


async def get_client_ids(
    refresh_token: str,
    manager_customer_id: str
) -> List[str]:
    """
    Get client IDs under a manager account
    
    Args:
        refresh_token: OAuth refresh token
        manager_customer_id: Manager account customer ID
        
    Returns:
        List of client customer IDs
    """
    try:
        def _get_client_ids_sync():
            try:
                from google.ads.googleads.client import GoogleAdsClient
                
                client = GoogleAdsClient.load_from_dict({
                    "client_id": settings.GOOGLE_CLIENT_ID,
                    "client_secret": settings.GOOGLE_CLIENT_SECRET,
                    "developer_token": settings.GOOGLE_ADS_DEVELOPER_TOKEN,
                    "refresh_token": refresh_token,
                    "login_customer_id": str(manager_customer_id),
                    "use_proto_plus": True,
                })
                
                service = client.get_service("GoogleAdsService")
                query = """
                    SELECT customer_client.client_customer, customer_client.level
                    FROM customer_client
                    WHERE customer_client.level = 1
                """
                results = service.search(customer_id=str(manager_customer_id), query=query)
                client_ids = []
                for row in results:
                    resource_name = row.customer_client.client_customer
                    client_id = resource_name.split("/")[-1]
                    # Validate client_id is 10 digits
                    if client_id.isdigit() and len(client_id) == 10:
                        client_ids.append(client_id)
                    else:
                        logger.warning(f"Invalid client_id format from Google Ads API: {client_id} (length: {len(client_id)})")
                return client_ids
            except ImportError:
                logger.error(GOOGLE_ADS_LIBRARY_ERROR)
                return []
            except Exception as e:
                logger.warning(f"Failed to get client IDs for customer {manager_customer_id}: {e}")
                return []
        
        loop = asyncio.get_event_loop()
        client_ids = await loop.run_in_executor(None, _get_client_ids_sync)
        return client_ids
        
    except Exception as e:
        logger.warning(f"Error getting client IDs: {e}")
        return []


async def revoke_google_oauth_token(refresh_token: str) -> bool:
    """
    Revoke the OAuth token from Google's servers
    
    Args:
        refresh_token: OAuth refresh token to revoke
        
    Returns:
        True if revocation was successful, False otherwise
    """
    try:
        revocation_url = "https://oauth2.googleapis.com/revoke"
        
        params = {
            "token": refresh_token,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(revocation_url, params=params)
            
            if response.status_code == 200:
                logger.info("Successfully revoked Google OAuth token")
                return True
            else:
                logger.warning(f"Failed to revoke Google OAuth token: {response.status_code} - {response.text}")
                return False
                
    except Exception as e:
        logger.error(f"Error revoking Google OAuth token: {str(e)}")
        return False

