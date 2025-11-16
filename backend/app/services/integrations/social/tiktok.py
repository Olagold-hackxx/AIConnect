"""
TikTok posting service
"""
import requests
import os
import logging
import tempfile
from typing import Dict, List, Optional
from app.utils.logger import logger


class TikTokPostingService:
    """Service for posting to TikTok"""
    
    @staticmethod
    def post(
        content: str,
        access_token: str,
        media_urls: List[str],
        video_width: int = 1080,
        video_height: int = 1920,
        video_duration_seconds: int = 30,
    ) -> Dict:
        """
        TikTok posting with proper handling for unaudited clients
        
        Args:
            content: Video caption
            access_token: TikTok access token
            media_urls: List containing video URL
            video_width: Video width in pixels (default: 1080)
            video_height: Video height in pixels (default: 1920)
            video_duration_seconds: Video duration in seconds (default: 30)
        """
        temp_path = None
        try:
            video_url = media_urls[0] if media_urls else None
            if not video_url:
                return {"success": False, "error": "TikTok requires a video URL"}
            
            caption = content
            
            # Step 1: Download from URL
            logger.info(f"[TikTok] Downloading video from: {video_url[:50]}...")
            response = requests.get(video_url, stream=True)
            logger.info(f"[TikTok] Video download response status: {response.status_code}")
            if response.status_code != 200:
                logger.error(f"[TikTok] Failed to download video: {response.status_code}, response: {response.text[:200]}")
                return {
                    "success": False,
                    "error": f"Failed to download video: {response.status_code}",
                }
            
            with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_file:
                for chunk in response.iter_content(chunk_size=8192):
                    temp_file.write(chunk)
                temp_path = temp_file.name
            
            file_size = os.path.getsize(temp_path)
            
            if file_size == 0:
                os.unlink(temp_path)
                return {"success": False, "error": "Downloaded file is empty"}
            
            logger.info(f"Downloaded video: {file_size} bytes")
            
            # Step 2: Create video info
            video_info = {
                "format": "mp4",
                "mime_type": "video/mp4",
                "width": video_width,
                "height": video_height,
                "duration": int(video_duration_seconds * 1000),
                "bit_rate": int((file_size * 8) / video_duration_seconds),
                "frame_rate": 30.0,
                "codec": "h264",
                "size": file_size,
            }
            
            # Step 3: Prepare init data with MANDATORY SELF_ONLY privacy for unaudited clients
            init_data = {
                "post_info": {
                    "title": caption[:150],
                    "privacy_level": "SELF_ONLY",  # MANDATORY for unaudited clients
                    "disable_duet": False,
                    "disable_comment": False,
                    "disable_stitch": False,
                    "video_cover_timestamp_ms": 1000,
                },
                "source_info": {
                    "source": "FILE_UPLOAD",
                    "video_size": file_size,
                    "chunk_size": min(file_size, 64 * 1024 * 1024),
                    "total_chunk_count": 1,
                },
            }
            
            # Step 4: Initialize upload
            response = requests.post(
                "https://open.tiktokapis.com/v2/post/publish/video/init/",
                json=init_data,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Content-Type": "application/json; charset=UTF-8",
                },
            )
            
            result = response.json()
            logger.info(f"[TikTok] Init response status: {response.status_code}, result: {result}")
            
            # Enhanced error handling
            if response.status_code != 200:
                error_code = result.get("error", {}).get("code", "unknown")
                error_message = result.get("error", {}).get("message", "Unknown error")
                logger.error(f"[TikTok] Init failed with status {response.status_code}: {error_code} - {error_message}")
                
                if temp_path:
                    os.unlink(temp_path)
                
                return {
                    "success": False,
                    "error": f"TikTok API Error ({error_code}): {error_message}",
                    "error_code": error_code,
                }
            
            if result.get("error", {}).get("code") != "ok":
                logger.error(f"[TikTok] Init failed: {result}")
                if temp_path:
                    os.unlink(temp_path)
                return {"success": False, "error": f"Init failed: {result}"}
            
            upload_url = result["data"]["upload_url"]
            publish_id = result["data"]["publish_id"]
            logger.info(f"[TikTok] Init successful, upload_url: {upload_url[:50]}..., publish_id: {publish_id}")
            
            # Step 5: Upload file
            logger.info(f"[TikTok] Uploading video ({file_size} bytes) to upload URL...")
            with open(temp_path, "rb") as video_file:
                upload_response = requests.put(
                    upload_url,
                    data=video_file,
                    headers={
                        "Content-Type": "video/mp4",
                        "Content-Length": str(file_size),
                        "Content-Range": f"bytes 0-{file_size-1}/{file_size}",
                    },
                    timeout=300,
                )
            
            logger.info(f"[TikTok] Upload response status: {upload_response.status_code}")
            if upload_response.status_code not in [200, 201, 204]:
                logger.error(f"[TikTok] Upload failed: {upload_response.text[:200]}")
            
            # Step 6: Cleanup
            if temp_path:
                os.unlink(temp_path)
            
            if upload_response.status_code not in [200, 201, 204]:
                logger.error(f"[TikTok] Upload failed with status {upload_response.status_code}: {upload_response.text[:200]}")
                return {"success": False, "error": f"Upload failed: {upload_response.text}"}
            
            logger.info(f"[TikTok] Video uploaded successfully, publish_id: {publish_id}")
            return {
                "success": True,
                "post_id": publish_id,
                "message": "Video uploaded successfully as PRIVATE post",
                "privacy_level": "SELF_ONLY",
            }
        
        except Exception as e:
            # Cleanup temp file if it exists
            if temp_path and os.path.exists(temp_path):
                try:
                    os.unlink(temp_path)
                except:
                    pass
            logger.error(f"[TikTok] Exception during posting: {str(e)}", exc_info=True)
            return {"success": False, "error": str(e)}

