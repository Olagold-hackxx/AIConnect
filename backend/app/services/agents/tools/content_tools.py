"""
Content Creation Tools for LangChain agents
"""
from typing import Dict, List, Any
try:
    from langchain_core.tools import tool
except ImportError:
    # Fallback for older LangChain versions
    from langchain.tools import tool
from app.services.integrations.seo import SerpAPIService
from app.services.llm import create_llm_service
from app.utils.logger import logger


@tool
async def keyword_research(query: str, location: str = "United States", limit: int = 20) -> Dict[str, Any]:
    """
    Research keywords and get trending hashtags for a topic.
    
    Args:
        query: The topic or keyword to research
        location: Location for search (default: "United States")
        limit: Maximum number of keywords to return (default: 20)
    
    Returns:
        Dictionary with seed_keyword, keywords list, and location
    """
    try:
        serp_service = SerpAPIService()
        result = await serp_service.keyword_research(query, location, limit)
        return result
    except Exception as e:
        logger.error(f"Keyword research failed: {str(e)}")
        return {"error": str(e), "seed_keyword": query, "keywords": []}


@tool
async def get_trending_hashtags(topic: str, platform: str = "twitter") -> List[str]:
    """
    Get trending hashtags for a topic on a specific platform.
    
    Args:
        topic: The topic to find hashtags for
        platform: Platform name (twitter, instagram, etc.)
    
    Returns:
        List of trending hashtags
    """
    try:
        serp_service = SerpAPIService()
        hashtags = await serp_service.get_trending_hashtags(topic, platform)
        return hashtags
    except Exception as e:
        logger.error(f"Hashtag research failed: {str(e)}")
        return []


@tool
async def create_ad_copy(
    product: str,
    target_audience: str,
    platform: str = "facebook",
    tone: str = "persuasive"
) -> Dict[str, Any]:
    """
    Create ad copy for advertising campaigns.
    
    Args:
        product: Product or service to advertise
        target_audience: Target audience description
        platform: Advertising platform (facebook, google_ads, etc.)
        tone: Copy tone (persuasive, informative, emotional, etc.)
    
    Returns:
        Dictionary with ad copy, headline, and call-to-action
    """
    try:
        llm = create_llm_service()
        
        prompt = f"""Create compelling ad copy for:

Product/Service: {product}
Target Audience: {target_audience}
Platform: {platform}
Tone: {tone}

Include:
1. Attention-grabbing headline
2. Compelling body copy
3. Clear call-to-action (CTA)

Make it conversion-focused and platform-appropriate."""
        
        content = await llm.generate_content(
            prompt=prompt,
            temperature=0.8,
            max_tokens=500
        )
        
        return {
            "ad_copy": content.strip(),
            "platform": platform,
            "tone": tone,
            "character_count": len(content.strip())
        }
    except Exception as e:
        logger.error(f"Ad copy creation failed: {str(e)}")
        return {"error": str(e), "platform": platform}


@tool
async def create_social_post(
    topic: str,
    platform: str,
    tone: str = "professional",
    hashtags: List[str] = None
) -> Dict[str, Any]:
    """
    Create a social media post for a specific platform.
    
    Args:
        topic: The topic/content for the post
        platform: Platform name (facebook, instagram, linkedin, twitter, tiktok)
        tone: Post tone (professional, casual, friendly, etc.)
        hashtags: Optional list of hashtags to include
    
    Returns:
        Dictionary with content, hashtags, and platform
    """
    try:
        llm = create_llm_service()
        
        platform_guidelines = {
            "facebook": "280-500 characters, engaging and conversational",
            "instagram": "2200 characters max, visual-first, use emojis",
            "linkedin": "1300 characters max, professional, thought leadership",
            "twitter": "280 characters max, concise and punchy",
            "tiktok": "150 characters max, trending and catchy"
        }
        
        guideline = platform_guidelines.get(platform.lower(), "engaging and platform-appropriate")
        
        prompt = f"""Create an engaging {platform} post about: {topic}

Platform: {platform}
Tone: {tone}
Character limit: {guideline}
{"Hashtags to include: " + ", ".join(hashtags[:10]) if hashtags else ""}

Make it platform-appropriate, engaging, and ready to post."""
        
        content = await llm.generate_content(
            prompt=prompt,
            temperature=0.8,
            max_tokens=500
        )
        
        return {
            "content": content.strip(),
            "platform": platform,
            "hashtags": hashtags or [],
            "character_count": len(content.strip())
        }
    except Exception as e:
        logger.error(f"Social post creation failed: {str(e)}")
        return {"error": str(e), "platform": platform}


@tool
async def generate_image(
    description: str,
    aspect_ratio: str = "1:1",
    number_of_images: int = 1
) -> Dict[str, Any]:
    """
    Generate images using AI.
    
    Args:
        description: Description of the image to generate
        aspect_ratio: Image aspect ratio (1:1, 16:9, 9:16)
        number_of_images: Number of images to generate (default: 1)
    
    Returns:
        Dictionary with image URLs or data
    """
    try:
        llm = create_llm_service()
        images = await llm.generate_image(
            prompt=description,
            aspect_ratio=aspect_ratio,
            number_of_images=number_of_images
        )
        
        # Note: Images are PIL Images - need to be uploaded to storage
        # This returns the image objects, caller should handle upload
        return {
            "images": images,
            "description": description,
            "aspect_ratio": aspect_ratio,
            "count": len(images)
        }
    except Exception as e:
        logger.error(f"Image generation failed: {str(e)}")
        return {"error": str(e)}


@tool
async def optimize_hashtags(
    content: str,
    platform: str,
    topic: str
) -> List[str]:
    """
    Optimize and select hashtags for content.
    
    Args:
        content: The content to optimize hashtags for
        platform: Platform name
        topic: Main topic of the content
    
    Returns:
        List of optimized hashtags
    """
    try:
        # Get trending hashtags
        serp_service = SerpAPIService()
        trending = await serp_service.get_trending_hashtags(topic, platform)
        
        # Use LLM to select most relevant
        llm = create_llm_service()
        
        prompt = f"""Given this content and trending hashtags, select the 5-10 most relevant hashtags:

Content: {content[:500]}
Platform: {platform}
Trending hashtags: {', '.join(trending[:20])}

Select hashtags that:
1. Are relevant to the content
2. Are trending/popular
3. Match the platform's style
4. Will maximize reach

Return only a comma-separated list of hashtags (with # symbol)."""
        
        response = await llm.generate_content(prompt=prompt, temperature=0.3)
        
        # Parse hashtags from response
        import re
        hashtags = re.findall(r'#\w+', response)
        
        return hashtags[:10] if hashtags else trending[:10]
        
    except Exception as e:
        logger.error(f"Hashtag optimization failed: {str(e)}")
        return []


@tool
async def generate_video(
    description: str,
    duration_seconds: int = 30
) -> Dict[str, Any]:
    """
    Generate video content using AI.
    
    Args:
        description: Description of the video to generate
        duration_seconds: Video duration in seconds (default: 30)
    
    Returns:
        Dictionary with video URL or data
    """
    try:
        llm = create_llm_service()
        video_result = await llm.generate_video(
            prompt=description,
            duration_seconds=duration_seconds
        )
        
        return {
            "video_url": video_result.get("video_url") if isinstance(video_result, dict) else None,
            "description": description,
            "duration_seconds": duration_seconds,
            "success": video_result is not None
        }
    except Exception as e:
        logger.error(f"Video generation failed: {str(e)}")
        return {"error": str(e), "success": False}


@tool
async def publish_to_platform(
    platform: str,
    content: str,
    media_urls: List[str] = None
) -> Dict[str, Any]:
    """
    Publish content to a social media platform.
    Note: This tool is called by the agent but actual publishing is handled
    by the ContentCreationExecutor after content generation.
    
    Args:
        platform: Platform name (facebook, instagram, linkedin, twitter, tiktok)
        content: Content to publish
        media_urls: Optional list of media URLs (images/videos)
    
    Returns:
        Dictionary indicating the content is ready for publishing
    """
    # This is a placeholder - actual publishing happens in ContentCreationExecutor
    return {
        "success": True,
        "platform": platform,
        "message": f"Content prepared for {platform}",
        "content_length": len(content),
        "has_media": bool(media_urls),
        "media_count": len(media_urls) if media_urls else 0
    }


# Export all tools
CONTENT_CREATION_TOOLS = [
    keyword_research,
    get_trending_hashtags,
    create_social_post,
    create_ad_copy,
    generate_image,
    generate_video,
    optimize_hashtags,
    publish_to_platform,
]

