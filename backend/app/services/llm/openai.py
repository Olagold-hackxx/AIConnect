"""
OpenAI LLM implementation
"""
import asyncio
from typing import Dict, List, Optional, AsyncGenerator
import json
from app.services.llm.base import BaseLLMService
from app.utils.logger import logger

try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    logger.warning("openai library not installed. Install with: pip install openai")


class OpenAIService(BaseLLMService):
    """
    OpenAI implementation of BaseLLMService
    """
    
    def __init__(self, api_key: str, model_config: Dict):
        if not OPENAI_AVAILABLE:
            raise ImportError("openai library not installed")
        
        super().__init__(api_key, model_config)
        self.client = AsyncOpenAI(api_key=api_key)
    
    async def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate text content using OpenAI"""
        
        try:
            messages = []
            
            if system_instruction:
                messages.append({
                    "role": "system",
                    "content": system_instruction
                })
            
            messages.append({
                "role": "user",
                "content": prompt
            })
            
            response = await self.client.chat.completions.create(
                model=self.content_model_name,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI content generation failed: {str(e)}")
            raise Exception(f"OpenAI content generation failed: {str(e)}")
    
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
        
        messages = []
        
        if system_instruction:
            messages.append({
                "role": "system",
                "content": system_instruction
            })
        
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        stream = await self.client.chat.completions.create(
            model=self.content_model_name,
            messages=messages,
            temperature=temperature,
            stream=True
        )
        
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    async def generate_image(
        self,
        prompt: str,
        aspect_ratio: str = "1:1",
        number_of_images: int = 1
    ) -> List:
        """Generate images using DALL-E 3"""
        
        try:
            # Map aspect ratios to DALL-E sizes
            size_map = {
                "1:1": "1024x1024",
                "16:9": "1792x1024",
                "9:16": "1024x1792"
            }
            size = size_map.get(aspect_ratio, "1024x1024")
            
            images = []
            for _ in range(number_of_images):
                response = await self.client.images.generate(
                    model="dall-e-3",
                    prompt=prompt,
                    size=size,
                    quality="standard",
                    n=1
                )
                
                # Return image URLs
                images.append(response.data[0].url)
            
            return images
            
        except Exception as e:
            logger.error(f"OpenAI image generation failed: {str(e)}")
            raise Exception(f"OpenAI image generation failed: {str(e)}")
    
    async def generate_embeddings(
        self,
        texts: List[str],
        task_type: str = "RETRIEVAL_DOCUMENT"
    ) -> List[List[float]]:
        """Generate embeddings using OpenAI text-embedding-3"""
        
        try:
            # OpenAI embeddings model
            embedding_model = self.embedding_model_name or "text-embedding-3-small"
            
            response = await self.client.embeddings.create(
                model=embedding_model,
                input=texts
            )
            
            return [item.embedding for item in response.data]
            
        except Exception as e:
            logger.error(f"OpenAI embedding generation failed: {str(e)}")
            raise Exception(f"OpenAI embedding generation failed: {str(e)}")

