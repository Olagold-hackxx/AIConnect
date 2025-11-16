"""
Anthropic Claude LLM implementation
"""
import asyncio
from typing import Dict, List, Optional, AsyncGenerator
import json
from app.services.llm.base import BaseLLMService
from app.utils.logger import logger

try:
    from anthropic import AsyncAnthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False
    logger.warning("anthropic library not installed. Install with: pip install anthropic")


class AnthropicService(BaseLLMService):
    """
    Anthropic Claude implementation of BaseLLMService
    """
    
    def __init__(self, api_key: str, model_config: Dict):
        if not ANTHROPIC_AVAILABLE:
            raise ImportError("anthropic library not installed")
        
        super().__init__(api_key, model_config)
        self.client = AsyncAnthropic(api_key=api_key)
    
    async def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate text content using Claude"""
        
        try:
            response = await self.client.messages.create(
                model=self.content_model_name,
                max_tokens=max_tokens,
                temperature=temperature,
                system=system_instruction or "",
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            return response.content[0].text
            
        except Exception as e:
            logger.error(f"Anthropic content generation failed: {str(e)}")
            raise Exception(f"Anthropic content generation failed: {str(e)}")
    
    async def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.5
    ) -> Dict:
        """Generate structured JSON output"""
        
        json_prompt = f"""{prompt}

Return your response as valid JSON only. Do not include any markdown formatting or explanation."""
        
        response_text = await self.generate_content(
            prompt=json_prompt,
            system_instruction=system_instruction,
            temperature=temperature
        )
        
        # Clean response (remove markdown if present)
        response_text = response_text.strip()
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.startswith('```'):
            response_text = response_text[3:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        try:
            return json.loads(response_text.strip())
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON response: {e}")
            raise Exception(f"Failed to parse JSON response: {str(e)}")
    
    async def stream_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """Stream content generation"""
        
        async with self.client.messages.stream(
            model=self.content_model_name,
            max_tokens=4096,
            temperature=temperature,
            system=system_instruction or "",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        ) as stream:
            async for text in stream.text_stream:
                yield text
    
    async def generate_embeddings(
        self,
        texts: List[str],
        task_type: str = "RETRIEVAL_DOCUMENT"
    ) -> List[List[float]]:
        """
        Generate embeddings using Anthropic
        
        Note: Anthropic doesn't have a native embeddings API as of now.
        This would need to use a third-party service or fallback.
        """
        raise NotImplementedError("Anthropic does not currently support embeddings. Use OpenAI or Gemini for embeddings.")

