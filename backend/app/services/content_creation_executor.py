"""
Content Creation Executor - Orchestrates content creation workflow
"""
from typing import Dict, List, Optional, Any
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from app.models.integration import SocialIntegration
from app.models.content import ContentItem
from app.models.assistant import Assistant
from app.services.rag_service import RAGService
from app.services.agents.digital_marketer_agent import DigitalMarketerAgent
from app.services.agent_execution_service import AgentExecutionService
from app.services.integrations.social import (
    FacebookPostingService,
    InstagramPostingService,
    LinkedInPostingService,
    TwitterPostingService,
    TikTokPostingService
)
from app.services.llm.factory import create_llm_service
from app.utils.logger import logger


class ContentCreationExecutor:
    """Executes content creation workflow"""
    
    def __init__(self, db: AsyncSession, tenant_id: UUID, assistant_id: UUID):
        self.db = db
        self.tenant_id = tenant_id
        self.assistant_id = assistant_id
        self.rag_service = RAGService(db, tenant_id)
        self.execution_service = AgentExecutionService(db)
        self.llm_service = create_llm_service()
    
    async def execute(
        self,
        execution_id: UUID,
        request_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute content creation workflow
        
        Args:
            execution_id: Agent execution ID
            request_data: Request data with user request, platforms, include_images, include_video
        
        Returns:
            Execution result with created content items
        """
        try:
            # Update execution status
            await self.execution_service.update_execution(
                execution_id=execution_id,
                status="running"
            )
            
            user_request = request_data.get("request", "")
            platforms = request_data.get("platforms", [])
            include_images = request_data.get("include_images", False)
            include_video = request_data.get("include_video", False)
            
            # Step 1: Get RAG context from documents
            logger.info(f"Retrieving context for request: {user_request[:100]}...")
            context = await self.rag_service.get_context_for_content_creation(
                user_request=user_request,
                assistant_id=self.assistant_id
            )
            
            # Step 2: Get tenant config for agent
            from sqlalchemy import select
            from app.models.tenant import Tenant
            tenant_result = await self.db.execute(
                select(Tenant).where(Tenant.id == self.tenant_id)
            )
            tenant = tenant_result.scalar_one_or_none()
            
            tenant_config = tenant.config if tenant and tenant.config else {}
            
            # Step 3: Initialize agent with context
            agent = DigitalMarketerAgent(tenant_config=tenant_config)
            
            # Build enhanced request with context
            enhanced_request = f"{user_request}\n\n{context}" if context else user_request
            
            # Step 4: Generate content using agent
            logger.info("Generating content using AI agent...")
            agent_result = await agent.execute(enhanced_request)
            
            if not agent_result.get("success"):
                await self.execution_service.update_execution(
                    execution_id=execution_id,
                    status="failed",
                    error_message=agent_result.get("error", "Content generation failed")
                )
                return agent_result
            
            generated_content = agent_result.get("result", "")
            
            # Step 5: Generate images/videos if requested
            image_urls = []
            video_urls = []
            
            if include_images:
                logger.info("Generating images...")
                try:
                    # Generate image using LLM service
                    image_result = await self.llm_service.generate_image(
                        prompt=user_request,
                        number_of_images=1,
                        aspect_ratio="1:1"
                    )
                    
                    # Handle different return types
                    from app.services.storage import get_storage
                    from io import BytesIO
                    import uuid as uuid_lib
                    
                    storage = get_storage()
                    
                    if isinstance(image_result, dict):
                        if image_result.get("images"):
                            # Images are PIL Images - upload to storage
                            for img in image_result["images"]:
                                try:
                                    # Convert PIL Image to bytes
                                    img_bytes = BytesIO()
                                    img.save(img_bytes, format="PNG")
                                    img_bytes.seek(0)
                                    
                                    # Upload to storage
                                    storage_key = f"tenants/{self.tenant_id}/content/{execution_id}/images/{uuid_lib.uuid4()}.png"
                                    image_url = await storage.upload(
                                        key=storage_key,
                                        file=img_bytes,
                                        content_type="image/png"
                                    )
                                    if image_url:
                                        image_urls.append(image_url)
                                except Exception as e:
                                    logger.error(f"Failed to upload image: {str(e)}")
                        elif image_result.get("image_url"):
                            image_urls.append(image_result["image_url"])
                    elif isinstance(image_result, list):
                        # List of PIL Images
                        for img in image_result:
                            try:
                                img_bytes = BytesIO()
                                img.save(img_bytes, format="PNG")
                                img_bytes.seek(0)
                                
                                storage_key = f"tenants/{self.tenant_id}/content/{execution_id}/images/{uuid_lib.uuid4()}.png"
                                image_url = await storage.upload(
                                    key=storage_key,
                                    file=img_bytes,
                                    content_type="image/png"
                                )
                                if image_url:
                                    image_urls.append(image_url)
                            except Exception as e:
                                logger.error(f"Failed to upload image: {str(e)}")
                    elif image_result:
                        # Direct PIL Image object
                        try:
                            img_bytes = BytesIO()
                            image_result.save(img_bytes, format="PNG")
                            img_bytes.seek(0)
                            
                            storage_key = f"tenants/{self.tenant_id}/content/{execution_id}/images/{uuid_lib.uuid4()}.png"
                            image_url = await storage.upload(
                                key=storage_key,
                                file=img_bytes,
                                content_type="image/png"
                            )
                            if image_url:
                                image_urls.append(image_url)
                        except Exception as e:
                            logger.error(f"Failed to upload image: {str(e)}")
                except Exception as e:
                    logger.error(f"Image generation failed: {str(e)}")
            
            if include_video:
                logger.info("Generating video...")
                try:
                    video_result = await self.llm_service.generate_video(
                        prompt=user_request,
                        duration_seconds=30
                    )
                    
                    from app.services.storage import get_storage
                    from io import BytesIO
                    import uuid as uuid_lib
                    
                    storage = get_storage()
                    
                    if isinstance(video_result, dict):
                        if video_result.get("video_url"):
                            video_urls.append(video_result["video_url"])
                    elif isinstance(video_result, bytes):
                        # Video bytes - upload to storage
                        try:
                            video_bytes = BytesIO(video_result)
                            storage_key = f"tenants/{self.tenant_id}/content/{execution_id}/videos/{uuid_lib.uuid4()}.mp4"
                            video_url = await storage.upload(
                                key=storage_key,
                                file=video_bytes,
                                content_type="video/mp4"
                            )
                            if video_url:
                                video_urls.append(video_url)
                        except Exception as e:
                            logger.error(f"Failed to upload video: {str(e)}")
                    elif video_result:
                        # Video file object
                        try:
                            storage_key = f"tenants/{self.tenant_id}/content/{execution_id}/videos/{uuid_lib.uuid4()}.mp4"
                            video_url = await storage.upload(
                                key=storage_key,
                                file=video_result,
                                content_type="video/mp4"
                            )
                            if video_url:
                                video_urls.append(video_url)
                        except Exception as e:
                            logger.error(f"Failed to upload video: {str(e)}")
                except Exception as e:
                    logger.error(f"Video generation failed: {str(e)}")
            
            # Step 6: Post to selected platforms
            created_content_items = []
            all_media_urls = image_urls + video_urls
            
            for platform in platforms:
                try:
                    # Get integration for this platform
                    integration_result = await self.db.execute(
                        select(SocialIntegration).where(
                            SocialIntegration.tenant_id == self.tenant_id,
                            SocialIntegration.assistant_id == self.assistant_id,
                            SocialIntegration.platform == platform,
                            SocialIntegration.is_active == True
                        )
                    )
                    integration = integration_result.scalar_one_or_none()
                    
                    if not integration:
                        logger.warning(f"No active integration found for {platform}")
                        continue
                    
                    # Post to platform (synchronous call, run in executor to avoid blocking)
                    import asyncio
                    post_result = await asyncio.to_thread(
                        self._post_to_platform,
                        platform=platform,
                        content=generated_content,
                        access_token=integration.access_token,
                        integration_data=integration.meta_data or {},
                        media_urls=all_media_urls if all_media_urls else None
                    )
                    
                    if post_result.get("success"):
                        # Create content item record
                        content_item = ContentItem(
                            tenant_id=self.tenant_id,
                            execution_id=execution_id,
                            content_type="social_post",
                            platform=platform,
                            title=f"Post for {platform}",
                            content=generated_content,
                            publish_status="published",
                            published_at=datetime.now(timezone.utc),
                            platform_post_id=post_result.get("post_id"),
                            images=image_urls if image_urls else [],
                            videos=video_urls if video_urls else [],
                            meta_data={
                                "post_type": post_result.get("post_type", "text"),
                                "post_result": post_result
                            }
                        )
                        
                        self.db.add(content_item)
                        await self.db.commit()
                        await self.db.refresh(content_item)
                        
                        created_content_items.append({
                            "id": str(content_item.id),
                            "platform": platform,
                            "post_id": post_result.get("post_id"),
                            "status": "published"
                        })
                    else:
                        logger.error(f"Failed to post to {platform}: {post_result.get('error')}")
                        created_content_items.append({
                            "platform": platform,
                            "status": "failed",
                            "error": post_result.get("error")
                        })
                
                except Exception as e:
                    logger.error(f"Error posting to {platform}: {str(e)}")
                    created_content_items.append({
                        "platform": platform,
                        "status": "failed",
                        "error": str(e)
                    })
            
            # Step 7: Update execution with results
            await self.execution_service.update_execution(
                execution_id=execution_id,
                status="completed",
                result={
                    "content": generated_content,
                    "content_items": created_content_items,
                    "images_generated": len(image_urls),
                    "videos_generated": len(video_urls),
                    "platforms_posted": [item["platform"] for item in created_content_items if item.get("status") == "published"]
                },
                steps_executed=agent_result.get("steps_executed", []),
                tools_used=agent_result.get("tools_used", [])
            )
            
            return {
                "success": True,
                "execution_id": str(execution_id),
                "content_items": created_content_items,
                "content": generated_content
            }
        
        except Exception as e:
            logger.error(f"Content creation execution failed: {str(e)}")
            await self.execution_service.update_execution(
                execution_id=execution_id,
                status="failed",
                error_message=str(e)
            )
            return {
                "success": False,
                "error": str(e)
            }
    
    def _post_to_platform(
        self,
        platform: str,
        content: str,
        access_token: str,
        integration_data: Dict,
        media_urls: Optional[List[str]] = None
    ) -> Dict:
        """Post content to a specific platform (synchronous posting services)"""
        try:
            if platform == "facebook":
                page_id = integration_data.get("page_id")
                if not page_id:
                    return {"success": False, "error": "Facebook page_id not found"}
                return FacebookPostingService.post(
                    content=content,
                    access_token=access_token,
                    page_id=page_id,
                    media_urls=media_urls
                )
            
            elif platform == "instagram":
                ig_user_id = integration_data.get("ig_user_id") or integration_data.get("instagram_user_id")
                if not ig_user_id:
                    return {"success": False, "error": "Instagram user_id not found"}
                return InstagramPostingService.post(
                    content=content,
                    access_token=access_token,
                    ig_user_id=ig_user_id,
                    media_urls=media_urls
                )
            
            elif platform == "linkedin":
                entity_id = integration_data.get("entity_id") or integration_data.get("organization_id")
                is_organization = integration_data.get("is_organization", False)
                if not entity_id:
                    return {"success": False, "error": "LinkedIn entity_id not found"}
                return LinkedInPostingService.post(
                    content=content,
                    access_token=access_token,
                    entity_id=entity_id,
                    is_organization=is_organization,
                    media_urls=media_urls
                )
            
            elif platform == "twitter":
                return TwitterPostingService.post(
                    text=content,
                    access_token=access_token,
                    image_urls=media_urls
                )
            
            elif platform == "tiktok":
                if not media_urls or not any(url.endswith(('.mp4', '.mov', '.avi')) for url in (media_urls or [])):
                    return {"success": False, "error": "TikTok requires a video"}
                return TikTokPostingService.post(
                    content=content,
                    access_token=access_token,
                    media_urls=media_urls or []
                )
            
            else:
                return {"success": False, "error": f"Unsupported platform: {platform}"}
        
        except Exception as e:
            logger.error(f"Error posting to {platform}: {str(e)}")
            return {"success": False, "error": str(e)}

