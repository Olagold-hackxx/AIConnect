"""
Google Gemini LLM implementation
"""
import asyncio
from typing import Dict, List, Optional, AsyncGenerator
import json
import io
from io import BytesIO
from app.services.llm.base import BaseLLMService
from app.utils.logger import logger

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    genai = None
    logger.warning("google-generativeai not installed. Install with: pip install google-generativeai")

# Try to import new genai API (available in newer versions)
try:
    from google import genai as new_genai
    from google.genai import types
    NEW_GENAI_AVAILABLE = True
except ImportError:
    NEW_GENAI_AVAILABLE = False
    new_genai = None
    types = None
    logger.warning("New google.genai API not available. Using legacy API for image generation.")

try:
    from PIL import Image
    Image_available = True
except ImportError:
    Image = None
    Image_available = False
    logger.warning("PIL/Pillow not installed. Install with: pip install Pillow")


class GeminiService(BaseLLMService):
    """
    Google Gemini implementation of BaseLLMService
    """
    
    def __init__(self, api_key: str, model_config: Dict):
        if not GEMINI_AVAILABLE or genai is None:
            raise ImportError("google-generativeai library not installed. Install with: pip install google-generativeai>=0.8.0")
        
        super().__init__(api_key, model_config)
        genai.configure(api_key=api_key)
        
        self.content_model = genai.GenerativeModel(self.content_model_name)
        
        # Initialize image model using Gemini 2.5 Flash Image
        # Note: Image generation uses the new google-genai API, not this model
        # This is kept for backward compatibility but won't be used
        self.image_model = None
        
        # Initialize new genai client for image generation (using new API - primary method)
        if NEW_GENAI_AVAILABLE and new_genai:
            try:
                self.genai_client = new_genai.Client(api_key=api_key)
            except Exception as e:
                logger.warning(f"Failed to initialize new genai client: {str(e)}")
                self.genai_client = None
        else:
            self.genai_client = None
        
        self.video_model = genai.GenerativeModel(self.video_model_name) if self.video_model_name else None
    
    async def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> str:
        """Generate text content using Gemini"""
        
        try:
            generation_config = genai.types.GenerationConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            )
            
            # If system_instruction is provided, prepend it to the prompt
            # Gemini API doesn't support system_instruction as a separate parameter in this version
            if system_instruction:
                full_prompt = f"{system_instruction}\n\n{prompt}"
            else:
                full_prompt = prompt
            
            response = await asyncio.to_thread(
                self.content_model.generate_content,
                full_prompt,
                generation_config=generation_config
            )
            
            # Extract text from response - handle multiple response structures
            text_parts = []
            
            # Method 1: Try response.candidates[0].content.parts (most common structure)
            if hasattr(response, 'candidates') and response.candidates:
                for candidate in response.candidates:
                    if hasattr(candidate, 'content'):
                        # Check candidate.content.parts
                        if hasattr(candidate.content, 'parts') and candidate.content.parts:
                            for part in candidate.content.parts:
                                if hasattr(part, 'text') and part.text:
                                    text_parts.append(str(part.text))
                        # Check if candidate.content has text directly
                        elif hasattr(candidate.content, 'text') and candidate.content.text:
                            text_parts.append(str(candidate.content.text))
                    # Check if candidate has text directly
                    elif hasattr(candidate, 'text') and candidate.text:
                        text_parts.append(str(candidate.text))
            
            # Method 2: Try response.parts as fallback
            if not text_parts and hasattr(response, 'parts') and response.parts:
                for part in response.parts:
                    if hasattr(part, 'text') and part.text:
                        text_parts.append(str(part.text))
            
            # Method 3: Try response.content.parts
            if not text_parts and hasattr(response, 'content'):
                if hasattr(response.content, 'parts') and response.content.parts:
                    for part in response.content.parts:
                        if hasattr(part, 'text') and part.text:
                            text_parts.append(str(part.text))
                elif hasattr(response.content, 'text') and response.content.text:
                    text_parts.append(str(response.content.text))
            
            # Method 4: Try response.text as last resort (works for simple responses)
            if not text_parts:
                try:
                    if hasattr(response, 'text') and response.text:
                        text_parts.append(str(response.text))
                except Exception as text_error:
                    logger.debug(f"response.text access failed (expected for multi-part): {text_error}")
            
            # Method 5: Try to get text from first candidate directly
            if not text_parts and hasattr(response, 'candidates') and response.candidates:
                first_candidate = response.candidates[0]
                # Try various attributes
                for attr in ['text', 'content', 'output', 'message']:
                    if hasattr(first_candidate, attr):
                        attr_value = getattr(first_candidate, attr)
                        if isinstance(attr_value, str) and attr_value.strip():
                            text_parts.append(attr_value)
                        elif hasattr(attr_value, 'text') and attr_value.text:
                            text_parts.append(str(attr_value.text))
            
            # If we found text in any method, return it
            if text_parts:
                result = ''.join(text_parts).strip()
                if result:
                    return result
            
            # Last resort: Log the response structure for debugging
            logger.error(f"Failed to extract text from Gemini response. Response structure: {type(response)}, attributes: {dir(response)}")
            if hasattr(response, 'candidates'):
                logger.error(f"Candidates: {response.candidates}")
            if hasattr(response, 'parts'):
                logger.error(f"Parts: {response.parts}")
            
            # If we get here, no text was found
            raise Exception("Failed to extract text from response: No text content found in response parts. Response may be empty or contain non-text content.")
            
        except Exception as e:
            logger.error(f"Gemini content generation failed: {str(e)}")
            raise Exception(f"Gemini content generation failed: {str(e)}")
    
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
        
        generation_config = genai.types.GenerationConfig(
            temperature=temperature,
        )
        
        # If system_instruction is provided, prepend it to the prompt
        # Gemini API doesn't support system_instruction as a separate parameter in this version
        if system_instruction:
            full_prompt = f"{system_instruction}\n\n{prompt}"
        else:
            full_prompt = prompt
        
        response = await asyncio.to_thread(
            self.content_model.generate_content,
            full_prompt,
            generation_config=generation_config,
            stream=True
        )
        
        for chunk in response:
            if chunk.text:
                yield chunk.text
    
    async def generate_image(
        self,
        prompt: str,
        aspect_ratio: str = "1:1",
        number_of_images: int = 1
    ) -> List[bytes]:
        """
        Generate images using Gemini 2.5 Flash Image model via the new google-genai API.
        
        Args:
            prompt: Text prompt for image generation
            aspect_ratio: Image aspect ratio (e.g., "1:1", "16:9", "9:16")
            number_of_images: Number of images to generate
        
        Returns:
            List of image data as bytes
        """
        try:
            # Use the new google-genai API if available
            if self.genai_client and NEW_GENAI_AVAILABLE:
                logger.info(f"Generating {number_of_images} image(s) with Gemini 2.5 Flash Image (new API), prompt: {prompt[:100]}...")
                
                model_name = self.image_model_name or "gemini-2.5-flash-image"
                
                # Generate content using the new API
                def _generate():
                    response = self.genai_client.models.generate_content(
                        model=model_name,
                        contents=[prompt],
                    )
                    return response
                
                response = await asyncio.to_thread(_generate)
                
                images = []
                
                # Process response: response.parts (simpler structure)
                if hasattr(response, 'parts') and response.parts:
                    for i, part in enumerate(response.parts):
                        if hasattr(part, 'text') and part.text is not None:
                            logger.debug(f"Response part {i+1} contains text: {part.text[:100]}")
                        elif hasattr(part, 'inline_data') and part.inline_data is not None:
                            try:
                                # Use part.as_image() method to get PIL Image, then convert to bytes
                                if hasattr(part, 'as_image'):
                                    pil_image = part.as_image()
                                    if Image_available and Image:
                                        img_bytes = BytesIO()
                                        pil_image.save(img_bytes, format='PNG')
                                        image_data = img_bytes.getvalue()
                                        images.append(image_data)
                                        logger.info(f"Generated image {len(images)} ({len(image_data)} bytes)")
                                    else:
                                        # Fallback: try to get data directly
                                        image_data = part.inline_data.data
                                        if image_data:
                                            images.append(image_data)
                                            logger.info(f"Generated image {len(images)} ({len(image_data)} bytes)")
                            except Exception as img_error:
                                logger.warning(f"Failed to process generated image {len(images)+1}: {str(img_error)}")
                                continue
                
                if not images:
                    error_msg = "No images generated in response"
                    logger.error(f"Gemini image generation failed: {error_msg}")
                    raise Exception(f"Image generation failed: {error_msg}")
                
                logger.info(f"Successfully generated {len(images)} image(s)")
                return images
            
            # Fallback to legacy API if new API is not available
            elif self.image_model:
                logger.info(f"Generating {number_of_images} image(s) with Gemini 2.5 Flash Image (legacy API), prompt: {prompt[:100]}...")
                
                def _generate():
                    response = self.image_model.generate_content(prompt)
                    return response
                
                response = await asyncio.to_thread(_generate)
                
                images = []
                
                # Process generated images from inline_data_parts (legacy API)
                if hasattr(response, 'inline_data_parts') and response.inline_data_parts:
                    for i, part in enumerate(response.inline_data_parts):
                        if part.mime_type and part.mime_type.startswith('image/'):
                            try:
                                image_data = part.data
                                if image_data:
                                    images.append(image_data)
                                    logger.info(f"Generated image {i+1} ({len(image_data)} bytes)")
                            except Exception as img_error:
                                logger.warning(f"Failed to process generated image {i+1}: {str(img_error)}")
                                continue
                
                # If no images found in inline_data_parts, try alternative response structure
                if not images and hasattr(response, 'parts'):
                    for i, part in enumerate(response.parts):
                        if hasattr(part, 'inline_data') and part.inline_data:
                            try:
                                image_data = part.inline_data.data
                                if image_data:
                                    images.append(image_data)
                                    logger.info(f"Generated image {i+1} ({len(image_data)} bytes)")
                            except Exception as img_error:
                                logger.warning(f"Failed to process generated image {i+1}: {str(img_error)}")
                                continue
                
                if not images:
                    error_msg = "No images generated in response"
                    logger.error(f"Gemini image generation failed: {error_msg}")
                    raise Exception(f"Image generation failed: {error_msg}")
                
                logger.info(f"Successfully generated {len(images)} image(s)")
                return images
            else:
                raise Exception("Image generation not available. Please ensure google-genai>=1.0.0 is installed for the new API, or google-generativeai is installed for the legacy API.")
            
        except Exception as e:
            logger.error(f"Gemini image generation failed: {str(e)}", exc_info=True)
            raise Exception(f"Gemini image generation failed: {str(e)}")
    
    async def generate_video(
        self,
        prompt: str,
        duration_seconds: int = 5,
        aspect_ratio: str = "16:9"
    ) -> bytes:
        """Generate video using Gemini 2.0 Flash"""
        
        try:
            if not self.video_model:
                raise Exception("Video generation model not configured")
            
            # Note: Video generation API may vary - this is a placeholder structure
            video_config = {
                "prompt": prompt,
                "duration": duration_seconds,
                "aspect_ratio": aspect_ratio
            }
            
            response = await asyncio.to_thread(
                self.video_model.generate_content,
                str(video_config)
            )
            
            # Process video response
            if hasattr(response, 'parts') and response.parts:
                video_data = response.parts[0].video_data
                return video_data
            
            raise Exception("Video generation not yet fully implemented")
            
        except Exception as e:
            logger.error(f"Gemini video generation failed: {str(e)}")
            raise Exception(f"Gemini video generation failed: {str(e)}")
    
    async def generate_embeddings(
        self,
        texts: List[str],
        task_type: str = "RETRIEVAL_DOCUMENT"
    ) -> List[List[float]]:
        """Generate embeddings using Google text-embedding-004"""
        
        try:
            # Ensure model name has the "models/" prefix
            model_name = self.embedding_model_name
            if not model_name.startswith("models/"):
                model_name = f"models/{model_name}"
            
            result = await asyncio.to_thread(
                genai.embed_content,
                model=model_name,
                content=texts,
                task_type=task_type
            )
            
            # Google's embed_content returns:
            # - For single text: {'embedding': [0.1, 0.2, ...]}
            # - For multiple texts: {'embedding': [[0.1, 0.2, ...], [0.3, 0.4, ...], ...]}
            embeddings = result.get('embedding', [])
            
            if not embeddings:
                logger.warning("No embeddings returned from Google API")
                return []
            
            # Check if it's a single embedding (list of floats) or multiple (list of lists)
            if isinstance(embeddings[0], (int, float)):
                # Single embedding - wrap in list to match expected return type
                return [embeddings]
            else:
                # Multiple embeddings - return as is
                return embeddings
            
        except Exception as e:
            logger.error(f"Embedding generation failed: {str(e)}")
            raise Exception(f"Embedding generation failed: {str(e)}")

