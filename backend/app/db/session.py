"""
Database session management
"""
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker, AsyncEngine
from app.config import settings
import threading

# Global engine for FastAPI app (main process)
_engine: AsyncEngine | None = None
_engine_lock = threading.Lock()

def get_engine() -> AsyncEngine:
    """Get or create the database engine (thread-safe)"""
    global _engine
    if _engine is None:
        with _engine_lock:
            if _engine is None:
                _engine = create_async_engine(
                    settings.DATABASE_URL,
                    echo=settings.DATABASE_ECHO,
                    future=True,
                    pool_size=10,
                    max_overflow=20,
                    pool_pre_ping=True,  # Verify connections before using
                    pool_recycle=3600,  # Recycle connections after 1 hour
                )
    return _engine

def create_worker_engine() -> AsyncEngine:
    """
    Create a new engine for Celery workers.
    Each worker process should have its own engine to avoid connection conflicts.
    """
    return create_async_engine(
        settings.DATABASE_URL,
        echo=settings.DATABASE_ECHO,
        future=True,
        pool_size=5,  # Smaller pool for workers
        max_overflow=10,
        pool_pre_ping=True,
        pool_recycle=3600,
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

