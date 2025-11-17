"""
Application configuration using Pydantic Settings
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional, Union


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "CODIAN API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/codian"
    DATABASE_ECHO: bool = False
    DATABASE_SSL_REQUIRED: bool = False  # Set to True in production
    DATABASE_SSL_CA: Optional[str] = None  # Path to CA certificate file or content from env
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_USE_SSL: bool = False  # Set to True if Redis requires SSL
    REDIS_SESSION_PREFIX: str = "session:"
    REDIS_CACHE_TTL: int = 3600
    
    # JWT Authentication
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Storage Configuration
    STORAGE_BACKEND: str = "local"  # Options: local, s3
    
    # Local Storage
    LOCAL_STORAGE_PATH: str = "./storage"
    
    # S3 Storage (when STORAGE_BACKEND=s3)
    S3_BUCKET: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    S3_ENDPOINT_URL: Optional[str] = None
    S3_REGION: str = "us-east-1"
    
    # Vector Database
    VECTOR_DB_PROVIDER: str = "chromadb"  # Options: chromadb, pinecone, qdrant, pgvector
    CHROMA_DB_PATH: str = "./chroma_db"  # Path for ChromaDB persistence
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_ENVIRONMENT: Optional[str] = None
    PINECONE_INDEX_NAME: str = "codian"
    QDRANT_URL: Optional[str] = None
    QDRANT_API_KEY: Optional[str] = None
    
    # LLM Providers
    DEFAULT_LLM_PROVIDER: str = "gemini"  # Default provider: gemini, openai, anthropic
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None  # For Gemini
    
    # Gemini Model Configuration
    GOOGLE_MODEL_CONTENT: str = "gemini-2.5-flash"  # For content generation (set GOOGLE_MODEL_CONTENT=gemini-2.5-flash-exp in .env)
    GOOGLE_MODEL_IMAGE: str = "gemini-2.5-flash-image"  # For image generation using Gemini 2.5 Flash Image
    GOOGLE_MODEL_VIDEO: str = "gemini-2.0-flash-exp"  # For video generation
    GOOGLE_EMBEDDING_MODEL: str = "text-embedding-004"  # For embeddings
    
    # OpenAI Model Configuration
    OPENAI_MODEL_CONTENT: str = "gpt-4o"  # For content generation
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"  # For embeddings
    
    # Anthropic Model Configuration
    ANTHROPIC_MODEL_CONTENT: str = "claude-3-5-sonnet-20241022"  # For content generation
    
    # External Integrations
    SERPAPI_KEY: Optional[str] = None  # For keyword research and hashtag trends
    SENDGRID_API_KEY: Optional[str] = None
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # Social Media OAuth Credentials
    FACEBOOK_APP_ID: Optional[str] = None
    FACEBOOK_APP_SECRET: Optional[str] = None
    INSTAGRAM_APP_ID: Optional[str] = None
    INSTAGRAM_APP_SECRET: Optional[str] = None
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None
    TIKTOK_CLIENT_ID: Optional[str] = None
    TIKTOK_CLIENT_SECRET: Optional[str] = None
    TWITTER_CLIENT_ID: Optional[str] = None
    TWITTER_CLIENT_SECRET: Optional[str] = None
    
    # Google OAuth Credentials (for Google Ads & Analytics)
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_ADS_DEVELOPER_TOKEN: Optional[str] = None
    GOOGLE_ADS_PROJECT_ID: Optional[str] = None  
    GOOGLE_ADS_MANAGER_CUSTOMER_ID: Optional[str] = None    
    GOOGLE_REDIRECT_URI: Optional[str] = None
    
    # Meta Ads API (for Facebook/Instagram Ads)
    META_ADS_APP_ID: Optional[str] = None
    META_ADS_APP_SECRET: Optional[str] = None
        
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"
    
    # CORS - can be comma-separated string or list
    CORS_ORIGINS: Union[str, list[str]] = "http://localhost:3000,http://localhost:3001,https://yourdomain.com"
    
    # Frontend and Backend URLs for OAuth redirects
    FRONTEND_URL: Optional[str] = "http://localhost:3000"
    BACKEND_URL: Optional[str] = "http://localhost:8000"
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        """Parse CORS_ORIGINS from comma-separated string or list"""
        if isinstance(v, str):
            # Split by comma and strip whitespace
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables (like PORT from Render)


settings = Settings()
