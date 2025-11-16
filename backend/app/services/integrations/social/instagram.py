"""
Instagram posting service
"""
import requests
import time
import logging
from typing import Dict, List, Optional
from urllib.parse import quote
from app.utils.logger import logger


class InstagramPostingService:
    """Service for posting to Instagram"""
    
    @staticmethod
    def post(
        content: str,
        access_token: str,
        ig_user_id: str,
        media_urls: Optional[List[str]] = None
    ) -> Dict:
        """
        Unified Instagram posting function
        
        Args:
            content: Post caption/content
            access_token: Facebook Page access token for Instagram Business
            ig_user_id: Instagram Business Account ID
            media_urls: Optional list of media URLs
        
        Returns:
            Dict with success status and post details
        """
        try:
            logger.info(f"[Instagram] Starting post - ig_user_id: {ig_user_id}, content_length: {len(content)}, has_media: {bool(media_urls)}")
            base_url = f"https://graph.instagram.com/{ig_user_id}"
            
            # No media - Instagram doesn't support text-only posts
            if not media_urls:
                logger.error(f"[Instagram] No media URLs provided - Instagram requires at least one image or video")
                return {
                    "success": False,
                    "error": "Instagram requires at least one image or video",
                }
            
            # Filter valid media URLs
            image_urls = [
                url for url in media_urls
                if any(url.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"])
            ]
            
            video_urls = [
                url for url in media_urls
                if any(url.lower().endswith(ext) for ext in [".mp4", ".mov", ".avi"])
            ]
            
            total_media = len(image_urls) + len(video_urls)
            
            # Single media (image or video)
            if total_media == 1:
                media_url = image_urls[0] if image_urls else video_urls[0]
                is_video = bool(video_urls)
                return InstagramPostingService._post_single_media(
                    base_url, access_token, content, media_url, is_video
                )
            
            # Multiple media (carousel) - Instagram supports up to 10 items
            elif total_media > 1:
                all_media = [(url, False) for url in image_urls] + [
                    (url, True) for url in video_urls
                ]
                return InstagramPostingService._post_carousel(
                    base_url, access_token, content, all_media[:10]
                )
            
            else:
                return {"success": False, "error": "No valid media URLs found"}
        
        except Exception as e:
            logger.error(f"Instagram posting error: {str(e)}")
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def _post_single_media(
        base_url: str, access_token: str, content: str, media_url: str, is_video: bool
    ) -> Dict:
        """Post single media to Instagram"""
        try:
            # Step 1: Create Media Container
            container_url = f"{base_url}/media?access_token={access_token}"
            media_payload = {"caption": content}
            
            if is_video:
                media_payload["media_type"] = "VIDEO"
                media_payload["video_url"] = media_url
            else:
                media_payload["image_url"] = media_url
            
            logger.info(f"[Instagram] Creating media container - is_video: {is_video}, media_url: {media_url[:50]}...")
            container_resp = requests.post(container_url, data=media_payload)
            container_data = container_resp.json()
            logger.info(f"[Instagram] Container creation response status: {container_resp.status_code}")
            
            if "id" not in container_data:
                logger.error(f"[Instagram] Failed to create media container: {container_data}")
                return {
                    "success": False,
                    "error": f"Failed to create media container: {container_data}",
                }
            
            creation_id = container_data["id"]
            logger.info(f"[Instagram] Media container created, creation_id: {creation_id}")
            
            # Step 2: Publish Media Container
            publish_url = f"{base_url}/media_publish?access_token={access_token}"
            publish_payload = {"creation_id": creation_id}
            
            # Wait for Instagram to process the media
            wait_time = 5 if is_video else 3
            logger.info(f"[Instagram] Waiting {wait_time} seconds for media processing...")
            time.sleep(wait_time)
            
            logger.info(f"[Instagram] Publishing media container...")
            publish_resp = requests.post(publish_url, data=publish_payload)
            publish_data = publish_resp.json()
            logger.info(f"[Instagram] Publish response status: {publish_resp.status_code}")
            
            if "id" in publish_data:
                logger.info(f"[Instagram] Media published successfully, post_id: {publish_data['id']}")
                return {
                    "success": True,
                    "post_id": publish_data["id"],
                    "post_type": "single_video" if is_video else "single_image",
                }
            else:
                logger.error(f"[Instagram] Failed to publish media: {publish_data}")
                return {"success": False, "error": f"Failed to publish: {publish_data}"}
        
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def _post_carousel(
        base_url: str, access_token: str, content: str, media_list: List[tuple]
    ) -> Dict:
        """Post carousel (multiple media) to Instagram"""
        try:
            # Step 1: Create media containers for each item
            media_ids = []
            
            for media_url, is_video in media_list:
                container_url = f"{base_url}/media?access_token={access_token}"
                media_payload = {"is_carousel_item": "true"}
                
                if is_video:
                    media_payload["media_type"] = "VIDEO"
                    media_payload["video_url"] = media_url
                else:
                    media_payload["image_url"] = media_url
                
                container_resp = requests.post(container_url, data=media_payload)
                container_data = container_resp.json()
                
                if "id" not in container_data:
                    logger.warning(f"Failed to create container for {media_url}: {container_data}")
                    continue
                
                media_ids.append(container_data["id"])
            
            if not media_ids:
                return {"success": False, "error": "Failed to create any media containers"}
            
            # Step 2: Create carousel container
            carousel_url = f"{base_url}/media?access_token={access_token}"
            carousel_payload = {
                "media_type": "CAROUSEL",
                "children": ",".join(media_ids),
                "caption": content,
            }
            
            carousel_resp = requests.post(carousel_url, data=carousel_payload)
            carousel_data = carousel_resp.json()
            
            if "id" not in carousel_data:
                return {
                    "success": False,
                    "error": f"Failed to create carousel: {carousel_data}",
                }
            
            carousel_id = carousel_data["id"]
            
            # Step 3: Publish carousel
            publish_url = f"{base_url}/media_publish?access_token={access_token}"
            publish_payload = {"creation_id": carousel_id}
            
            time.sleep(5)  # Wait for processing
            
            publish_resp = requests.post(publish_url, data=publish_payload)
            publish_data = publish_resp.json()
            
            if "id" in publish_data:
                return {
                    "success": True,
                    "post_id": publish_data["id"],
                    "post_type": "carousel",
                    "media_count": len(media_ids),
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to publish carousel: {publish_data}",
                }
        
        except Exception as e:
            return {"success": False, "error": str(e)}

