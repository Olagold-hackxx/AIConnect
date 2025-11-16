"""
SerpAPI integration service for keyword research and trending hashtags
"""
from typing import Dict, List
from app.config import settings
from app.utils.logger import logger
import httpx

try:
    from serpapi import GoogleSearch
    SERPAPI_AVAILABLE = True
except ImportError:
    SERPAPI_AVAILABLE = False
    logger.warning("serpapi library not installed. Install with: pip install google-search-results")


class SerpAPIService:
    """
    SerpAPI integration for keyword research and trending hashtags
    """
    
    def __init__(self):
        if not SERPAPI_AVAILABLE:
            raise ImportError("serpapi library not installed")
        
        if not settings.SERPAPI_KEY:
            raise ValueError("SERPAPI_KEY not configured")
        
        self.api_key = settings.SERPAPI_KEY
    
    async def keyword_research(
        self,
        query: str,
        location: str = "United States",
        limit: int = 20
    ) -> Dict:
        """
        Research keywords and get search volume data
        """
        
        try:
            # Get related searches
            params = {
                "api_key": self.api_key,
                "engine": "google",
                "q": query,
                "location": location,
                "num": limit
            }
            
            # Run in thread pool since GoogleSearch is synchronous
            import asyncio
            loop = asyncio.get_event_loop()
            
            def _search():
                search = GoogleSearch(params)
                return search.get_dict()
            
            results = await loop.run_in_executor(None, _search)
            
            keywords = []
            
            # Extract related searches - handle different response structures
            if results and "related_searches" in results:
                for related in results["related_searches"]:
                    # SerpAPI can return different structures - handle both "query" and "text" keys
                    if isinstance(related, dict):
                        keyword_text = related.get("query") or related.get("text") or related.get("title") or related.get("string", "")
                        if keyword_text:
                            keywords.append({
                                "keyword": keyword_text,
                                "link": related.get("link", "")
                            })
                    elif isinstance(related, str):
                        # Sometimes related_searches is just a list of strings
                        keywords.append({
                            "keyword": related,
                            "link": ""
                        })
            
            # Get search suggestions (autocomplete)
            try:
                suggest_params = {
                    "api_key": self.api_key,
                    "engine": "google_autocomplete",
                    "q": query
                }
                
                def _suggest():
                    suggest_search = GoogleSearch(suggest_params)
                    return suggest_search.get_dict()
                
                suggest_results = await loop.run_in_executor(None, _suggest)
                
                if suggest_results and "suggestions" in suggest_results:
                    for suggestion in suggest_results["suggestions"][:limit]:
                        if isinstance(suggestion, dict):
                            keyword_value = suggestion.get("value") or suggestion.get("suggestion", "")
                            if keyword_value:
                                keywords.append({
                                    "keyword": keyword_value,
                                    "relevance": suggestion.get("relevance", 0)
                                })
                        elif isinstance(suggestion, str):
                            keywords.append({
                                "keyword": suggestion,
                                "relevance": 0
                            })
            except Exception as suggest_error:
                logger.warning(f"SerpAPI autocomplete suggestions failed: {str(suggest_error)}, continuing with related searches only")
            
            # If no keywords found, return at least the seed keyword
            if not keywords:
                keywords = [{"keyword": query, "relevance": 1.0}]
            
            return {
                "seed_keyword": query,
                "keywords": keywords[:limit],
                "location": location
            }
            
        except Exception as e:
            logger.error(f"SerpAPI keyword research failed: {str(e)}", exc_info=True)
            # Return a fallback result instead of raising
            return {
                "seed_keyword": query,
                "keywords": [{"keyword": query, "relevance": 1.0}],
                "location": location,
                "error": str(e)
            }
    
    async def get_trending_hashtags(
        self,
        topic: str,
        platform: str = "twitter"
    ) -> List[str]:
        """
        Get trending hashtags for a topic
        """
        
        try:
            params = {
                "api_key": self.api_key,
                "engine": "google",
                "q": f"{topic} hashtags {platform}",
                "num": 20
            }
            
            import asyncio
            loop = asyncio.get_event_loop()
            
            def _search():
                search = GoogleSearch(params)
                return search.get_dict()
            
            results = await loop.run_in_executor(None, _search)
            
            hashtags = []
            
            # Extract hashtags from organic results
            if "organic_results" in results:
                import re
                for result in results["organic_results"]:
                    snippet = result.get("snippet", "")
                    # Extract hashtags from snippet
                    found_tags = re.findall(r'#\w+', snippet)
                    hashtags.extend(found_tags)
            
            # Remove duplicates and return top hashtags
            unique_hashtags = list(dict.fromkeys(hashtags))
            
            return unique_hashtags[:15]
            
        except Exception as e:
            logger.error(f"Hashtag research failed: {str(e)}")
            raise Exception(f"Hashtag research failed: {str(e)}")

