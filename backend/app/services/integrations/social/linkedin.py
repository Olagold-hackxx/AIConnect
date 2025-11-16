"""
LinkedIn posting service
"""
import requests
from io import BytesIO
import logging
from typing import Dict, List, Optional
from app.utils.logger import logger

LINKEDIN_API_URL = "https://api.linkedin.com/v2"


class LinkedInPostingService:
    """Service for posting to LinkedIn"""
    
    @staticmethod
    def upload_images(token: str, entity_urn: str, media_urls: List[str]):
        """Upload images to LinkedIn"""
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        }
        
        assets = []
        
        for url in media_urls:
            # Step 1: Register upload
            register_url = f"{LINKEDIN_API_URL}/assets?action=registerUpload"
            register_payload = {
                "registerUploadRequest": {
                    "owner": entity_urn,
                    "recipes": ["urn:li:digitalmediaRecipe:feedshare-image"],
                    "serviceRelationships": [
                        {
                            "relationshipType": "OWNER",
                            "identifier": "urn:li:userGeneratedContent",
                        }
                    ],
                }
            }
            
            register_response = requests.post(
                register_url, json=register_payload, headers=headers
            )
            if register_response.status_code != 200:
                return None, f"Register upload failed: {register_response.text}"
            
            data = register_response.json()
            upload_url = data["value"]["uploadMechanism"][
                "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
            ]["uploadUrl"]
            asset = data["value"]["asset"]
            
            # Step 2: Download the image from URL
            img_resp = requests.get(url)
            if img_resp.status_code != 200:
                return None, f"Failed to download image from {url}"
            
            img_data = BytesIO(img_resp.content)
            
            # Step 3: Upload the image to LinkedIn
            upload_headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/octet-stream",
            }
            upload_resp = requests.put(upload_url, headers=upload_headers, data=img_data)
            if upload_resp.status_code not in [200, 201]:
                return None, f"Image upload failed for {url}: {upload_resp.text}"
            
            assets.append(asset)
        
        return assets, None
    
    @staticmethod
    def post(
        content: str,
        access_token: str,
        entity_id: str,
        is_organization: bool = False,
        media_urls: Optional[List[str]] = None
    ) -> Dict:
        """
        Post content (optionally with image) to LinkedIn
        
        Args:
            content: Post text content
            access_token: LinkedIn access token
            entity_id: LinkedIn person or organization ID
            is_organization: Whether posting as organization
            media_urls: Optional list of image URLs
        """
        entity_urn = (
            f"urn:li:organization:{entity_id}"
            if is_organization
            else f"urn:li:person:{entity_id}"
        )
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
        }
        
        media = []
        if media_urls:
            assets, error = LinkedInPostingService.upload_images(access_token, entity_urn, media_urls)
            if error:
                return {"success": False, "error": error}
            
            for asset in assets:
                media.append(
                    {
                        "status": "READY",
                        "description": {"text": "Image"},
                        "media": asset,
                        "title": {"text": "Attached Image"},
                    }
                )
        
        post_url = f"{LINKEDIN_API_URL}/ugcPosts"
        payload = {
            "author": entity_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {"text": content},
                    "shareMediaCategory": "IMAGE" if media else "NONE",
                    "media": media,
                }
            },
            "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"},
        }
        
        logger.info(f"[LinkedIn] Posting to {post_url} with entity_urn: {entity_urn}, has_media: {bool(media)}")
        logger.debug(f"[LinkedIn] Payload author: {payload['author']}, content_length: {len(content)}")
        
        resp = requests.post(post_url, json=payload, headers=headers)
        logger.info(f"[LinkedIn] Response status: {resp.status_code}")
        
        if resp.status_code in [200, 201]:
            response_data = resp.json()
            post_urn = response_data.get("id")
            logger.info(f"[LinkedIn] Post successful, post_urn: {post_urn}")
            return {
                "success": True,
                "post_id": post_urn,
            }
        
        error_text = resp.text
        logger.error(f"[LinkedIn] Post failed with status {resp.status_code}: {error_text}")
        logger.debug(f"[LinkedIn] Request payload: {payload}, Headers: {dict(headers)}")
        return {"success": False, "error": error_text}

