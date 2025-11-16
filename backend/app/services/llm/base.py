"""
Base LLM interface - provider-agnostic LLM service
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Optional, AsyncGenerator
from enum import Enum


class LLMProvider(str, Enum):
    """Supported LLM providers"""
    GEMINI = "gemini"
    OPENAI = "openai"
    ANTHROPIC = "anthropic"


class BaseLLMService(ABC):
    """
    Abstract base class for LLM services
    All providers must implement these methods
    """
    
    def __init__(self, api_key: str, model_config: Dict):
        """
        Initialize the LLM service
        
        Args:
            api_key: Provider API key
            model_config: Model configuration dict with keys like:
                - content_model: Model name for content generation
                - image_model: Model name for image generation (optional)
                - video_model: Model name for video generation (optional)
                - embedding_model: Model name for embeddings
        """
        self.api_key = api_key
        self.model_config = model_config
        self.content_model_name = model_config.get("content_model", "")
        self.image_model_name = model_config.get("image_model", "")
        self.video_model_name = model_config.get("video_model", "")
        self.embedding_model_name = model_config.get("embedding_model", "")
    
    @abstractmethod
    async def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """
        Generate text content
        
        Args:
            prompt: User prompt
            system_instruction: System instruction/context
            temperature: Sampling temperature (0.0-2.0)
            max_tokens: Maximum tokens to generate
            
        Returns:
            Generated text content
        """
        pass
    
    @abstractmethod
    async def generate_json(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.5
    ) -> Dict:
        """
        Generate structured JSON output
        
        Args:
            prompt: User prompt
            system_instruction: System instruction
            temperature: Sampling temperature
            
        Returns:
            Parsed JSON dictionary
        """
        pass
    
    @abstractmethod
    async def stream_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7
    ) -> AsyncGenerator[str, None]:
        """
        Stream content generation
        
        Args:
            prompt: User prompt
            system_instruction: System instruction
            temperature: Sampling temperature
            
        Yields:
            Text chunks as they're generated
        """
        pass
    
    async def generate_image(
        self,
        prompt: str,
        aspect_ratio: str = "1:1",
        number_of_images: int = 1
    ) -> List:
        """
        Generate images (optional - not all providers support this)
        
        Args:
            prompt: Image generation prompt
            aspect_ratio: Image aspect ratio
            number_of_images: Number of images to generate
            
        Returns:
            List of image data (format depends on provider)
        """
        raise NotImplementedError("Image generation not supported by this provider")
    
    async def generate_video(
        self,
        prompt: str,
        duration_seconds: int = 5,
        aspect_ratio: str = "16:9"
    ) -> bytes:
        """
        Generate video (optional - not all providers support this)
        
        Args:
            prompt: Video generation prompt
            duration_seconds: Video duration
            aspect_ratio: Video aspect ratio
            
        Returns:
            Video bytes
        """
        raise NotImplementedError("Video generation not supported by this provider")
    
    async def generate_embeddings(
        self,
        texts: List[str],
        task_type: str = "RETRIEVAL_DOCUMENT"
    ) -> List[List[float]]:
        """
        Generate embeddings
        
        Args:
            texts: List of texts to embed
            task_type: Task type for embeddings
            
        Returns:
            List of embedding vectors
        """
        raise NotImplementedError("Embeddings not supported by this provider")

