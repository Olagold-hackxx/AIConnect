"""
Database session management
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker, AsyncEngine
from app.config import settings
import threading
import ssl
import os
from pathlib import Path

# Global engine for FastAPI app (main process)
_engine: AsyncEngine | None = None
_engine_lock = threading.Lock()

def _get_ssl_context():
    """Create SSL context for database connections if SSL is required"""
    if not settings.DATABASE_SSL_REQUIRED:
        return None
    
    ssl_context = ssl.create_default_context()
    
    # If CA certificate is provided, use it
    if settings.DATABASE_SSL_CA:
        ca_path = settings.DATABASE_SSL_CA
        
        # If it's a file path, use it directly
        if os.path.isfile(ca_path):
            ssl_context.load_verify_locations(ca_path)
        # Otherwise, treat it as certificate content and write to temp file
        elif not os.path.exists(ca_path):
            # Assume it's certificate content from env variable
            # Write to a temporary file
            ca_file_path = Path("/tmp/postgres-ca.crt")
            ca_file_path.write_text(settings.DATABASE_SSL_CA)
            ssl_context.load_verify_locations(str(ca_file_path))
        else:
            ssl_context.load_verify_locations(ca_path)
    
    return ssl_context

def get_engine() -> AsyncEngine:
    """Get or create the database engine (thread-safe)"""
    global _engine
    if _engine is None:
        with _engine_lock:
            if _engine is None:
                connect_args = {}
                ssl_context = _get_ssl_context()
                if ssl_context:
                    connect_args["ssl"] = ssl_context
                
                _engine = create_async_engine(
                    settings.DATABASE_URL,
                    echo=settings.DATABASE_ECHO,
                    future=True,
                    pool_size=10,
                    max_overflow=20,
                    pool_pre_ping=True,  # Verify connections before using
                    pool_recycle=3600,  # Recycle connections after 1 hour
                    connect_args=connect_args,
                )
    return _engine

def create_worker_engine() -> AsyncEngine:
    """
    Create a new engine for Celery workers.
    Each worker process should have its own engine to avoid connection conflicts.
    """
    connect_args = {}
    ssl_context = _get_ssl_context()
    if ssl_context:
        connect_args["ssl"] = ssl_context
    
    return create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DATABASE_ECHO,
        future=True,
        pool_size=5,  # Smaller pool for workers
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=3600,
        connect_args=connect_args,
        # Use NullPool for workers to ensure complete isolation
        # Or use a small pool with proper cleanup
    )

def create_worker_session_factory():
    """
    Create a new session factory for Celery workers.
    This ensures each worker process has its own isolated database connections.
    """
    engine = create_worker_engine()
    return async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )

# Create async session factory for FastAPI app
AsyncSessionLocal = async_sessionmaker(
    get_engine(),
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def get_db() -> AsyncSession:
    """
    Dependency for getting database session
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

