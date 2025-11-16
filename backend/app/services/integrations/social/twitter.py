"""
Twitter/X posting service
"""
import requests
import httpx
import base64
from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta
from app.utils.logger import logger


class TwitterPostingService:
    """Service for posting to Twitter/X"""
    
    @staticmethod
    async def refresh_access_token(
        refresh_token: str,
        client_id: str,
        client_secret: str
    ) -> Dict:
        """
        Refresh Twitter access token using refresh token
        
        Args:
            refresh_token: Twitter refresh token
            client_id: Twitter OAuth2 client ID
            client_secret: Twitter OAuth2 client secret
        
        Returns:
            Dictionary with new access_token, refresh_token, and expires_in
        """
        try:
            credentials = f"{client_id}:{client_secret}"
            b64_credentials = base64.b64encode(credentials.encode()).decode()
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.twitter.com/2/oauth2/token",
                    data={
                        "refresh_token": refresh_token,
                        "grant_type": "refresh_token"
                    },
                    headers={
                        "Authorization": f"Basic {b64_credentials}",
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                )
                
                if response.status_code != 200:
                    error_data = response.json() if response.content else {}
                    error_msg = error_data.get("error_description", f"Token refresh failed with status {response.status_code}")
                    logger.error(f"[Twitter] Token refresh failed: {error_msg}")
                    return {"success": False, "error": error_msg}
                
                token_data = response.json()
                return {
                    "success": True,
                    "access_token": token_data.get("access_token"),
                    "refresh_token": token_data.get("refresh_token"),  # Twitter may return a new refresh token
                    "expires_in": token_data.get("expires_in", 7200)  # Default 2 hours
                }
        
        except Exception as e:
            logger.error(f"[Twitter] Token refresh error: {str(e)}", exc_info=True)
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def upload_media_v2(image_url: str, bearer_token: str):
        """Upload media to Twitter"""
        upload_url = "https://upload.twitter.com/1.1/media/upload.json"
        headers = {"Authorization": f"Bearer {bearer_token}"}
        
        image_response = requests.get(image_url)
        image_response.raise_for_status()
        
        files = {"media": image_response.content}
        response = requests.post(upload_url, headers=headers, files=files)
        
        if response.status_code == 200:
            return response.json().get("media_id_string"), None
        return None, response.text
    
    @staticmethod
    async def post(
        text: str,
        access_token: str,
        image_urls: Optional[List[str]] = None,
        refresh_token: Optional[str] = None,
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        token_expires_at: Optional[datetime] = None,
        integration_id: Optional[str] = None,
        db_session = None
    ) -> Dict:
        """
        Post to Twitter/X using OAuth2 Bearer token
        Automatically refreshes token if expired or about to expire
        
        Args:
            text: Tweet text content
            access_token: Twitter OAuth2 bearer token
            image_urls: Optional list of image URLs
            refresh_token: Optional refresh token for refreshing access token
            client_id: Optional Twitter OAuth2 client ID
            client_secret: Optional Twitter OAuth2 client secret
            token_expires_at: Optional datetime when token expires
            integration_id: Optional integration ID for updating token in DB
            db_session: Optional database session for updating token
        """
        try:
            bearer_token = access_token
            
            # Check if token needs refresh (expired or expires in next 5 minutes)
            needs_refresh = False
            if refresh_token and client_id and client_secret:
                if token_expires_at:
                    # Check if token is expired or expires soon
                    time_until_expiry = (token_expires_at - datetime.now(timezone.utc)).total_seconds()
                    if time_until_expiry < 300:  # Less than 5 minutes
                        needs_refresh = True
                        logger.info(f"[Twitter] Token expires in {time_until_expiry:.0f} seconds, refreshing...")
                else:
                    # If we don't know expiry, refresh anyway to be safe
                    needs_refresh = True
                    logger.info("[Twitter] Token expiry unknown, refreshing to ensure validity...")
            
            # Refresh token if needed
            if needs_refresh:
                logger.info("[Twitter] Refreshing access token...")
                refresh_result = await TwitterPostingService.refresh_access_token(
                    refresh_token=refresh_token,
                    client_id=client_id,
                    client_secret=client_secret
                )
                
                if refresh_result.get("success"):
                    bearer_token = refresh_result["access_token"]
                    new_refresh_token = refresh_result.get("refresh_token", refresh_token)
                    expires_in = refresh_result.get("expires_in", 7200)
                    new_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
                    
                    logger.info("[Twitter] Token refreshed successfully")
                    
                    # Update token in database if integration_id and db_session provided
                    if integration_id and db_session:
                        try:
                            from app.models.integration import SocialIntegration
                            from sqlalchemy import select
                            
                            result = await db_session.execute(
                                select(SocialIntegration).where(SocialIntegration.id == integration_id)
                            )
                            integration = result.scalar_one_or_none()
                            
                            if integration:
                                integration.access_token = bearer_token
                                if new_refresh_token:
                                    integration.refresh_token = new_refresh_token
                                integration.token_expires_at = new_expires_at
                                await db_session.commit()
                                logger.info(f"[Twitter] Updated token in database for integration {integration_id}")
                        except Exception as db_error:
                            logger.warning(f"[Twitter] Failed to update token in database: {str(db_error)}")
                            # Continue with posting even if DB update fails
                else:
                    logger.error(f"[Twitter] Token refresh failed: {refresh_result.get('error')}")
                    # Continue with original token - it might still work
                    logger.warning("[Twitter] Attempting to post with original token (may fail if expired)")
            
            # Validate token format (should not be empty)
            if not bearer_token or not bearer_token.strip():
                logger.error("[Twitter] Bearer token is empty or invalid")
                return {"success": False, "error": "Bearer token is empty or invalid"}
            
            logger.info(f"[Twitter] Using bearer token (first 20 chars): {bearer_token[:20]}...")
            
            media_ids = []
            if image_urls:
                logger.info(f"[Twitter] Uploading {len(image_urls)} media file(s)...")
                for url in image_urls:
                    media_id, error = TwitterPostingService.upload_media_v2(url, bearer_token)
                    if not media_id:
                        logger.error(f"[Twitter] Media upload failed for {url}: {error}")
                        return {"success": False, "error": f"Media upload failed: {error}"}
                    media_ids.append(media_id)
                    logger.info(f"[Twitter] Media uploaded successfully, media_id: {media_id}")
            
            # Use Twitter API v2 for posting
            tweet_url = "https://api.twitter.com/2/tweets"
            headers = {
                "Authorization": f"Bearer {bearer_token}",
                "Content-Type": "application/json",
            }
            
            payload = {"text": text}
            if media_ids:
                payload["media"] = {"media_ids": media_ids}
            
            logger.info(f"[Twitter] Posting tweet - text_length: {len(text)}, has_media: {bool(media_ids)}")
            logger.debug(f"[Twitter] Request URL: {tweet_url}")
            logger.debug(f"[Twitter] Request headers: Authorization=Bearer {bearer_token[:20]}...")
            logger.debug(f"[Twitter] Payload: {payload}")
            
            response = requests.post(tweet_url, headers=headers, json=payload)
            logger.info(f"[Twitter] Response status: {response.status_code}")
            
            if response.status_code in [200, 201]:
                response_data = response.json()
                post_id = response_data.get("data", {}).get("id")
                logger.info(f"[Twitter] Post successful, post_id: {post_id}")
                return {
                    "success": True,
                    "post_id": post_id,
                }
            
            # Log detailed error information
            error_text = response.text
            try:
                error_json = response.json()
                error_detail = error_json.get("detail", error_json.get("error", error_text))
                logger.error(f"[Twitter] Post failed with status {response.status_code}: {error_detail}")
                logger.debug(f"[Twitter] Full error response: {error_json}")
            except (ValueError, KeyError):
                logger.error(f"[Twitter] Post failed with status {response.status_code}: {error_text}")
            
            logger.debug(f"[Twitter] Request URL: {tweet_url}")
            logger.debug(f"[Twitter] Request headers: {dict(headers)}")
            logger.debug(f"[Twitter] Payload: {payload}")
            
            return {"success": False, "error": error_text}
        
        except requests.exceptions.RequestException as e:
            logger.error(f"[Twitter] Request exception: {str(e)}")
            return {"success": False, "error": f"Request failed: {str(e)}"}
        except Exception as e:
            logger.error(f"[Twitter] Posting error: {str(e)}", exc_info=True)
            return {"success": False, "error": str(e)}

