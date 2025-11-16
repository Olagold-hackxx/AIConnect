"""
Celery workers for background tasks
"""
from celery import Celery
from app.config import settings

# Create Celery app with Redis as broker and result backend
celery_app = Celery(
    "codian",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND
)

# Configure Celery with Redis-optimized settings
celery_app.conf.update(
    # Serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    
    # Timezone
    timezone="UTC",
    enable_utc=True,
    
    # Task tracking
    task_track_started=True,
    task_time_limit=1800,  # 30 minutes
    task_soft_time_limit=1500,  # 25 minutes
    
    # Redis-specific settings
    broker_connection_retry_on_startup=True,
    broker_connection_retry=True,
    broker_connection_max_retries=10,
    
    # Result backend settings (Redis)
    result_backend_transport_options={
        "retry_policy": {
            "timeout": 5.0
        },
        "visibility_timeout": 3600,  # 1 hour
        "socket_keepalive": True,
        "socket_keepalive_options": {},
    },
    
    # Task result settings
    result_expires=3600,  # Results expire after 1 hour
    result_persistent=True,  # Persist results in Redis
    
    # Worker settings
    worker_prefetch_multiplier=4,  # Prefetch 4 tasks per worker
    worker_max_tasks_per_child=1000,  # Restart worker after 1000 tasks
    
    # Task routing (optional - comment out to use default queue)
    # Uncomment to route tasks to specific queues:
    # task_routes={
    #     "app.workers.ingestion.*": {"queue": "ingestion"},
    #     "app.workers.content_creation.*": {"queue": "content"},
    #     "app.workers.notifications.*": {"queue": "notifications"},
    # },
    
    # Task acknowledgment
    task_acks_late=True,  # Acknowledge tasks after completion
    task_reject_on_worker_lost=True,  # Reject tasks if worker dies
    
    # Celery Beat schedule for periodic tasks
    beat_schedule={
        'process-scheduled-posts': {
            'task': 'scheduled_posts.process_scheduled',
            'schedule': 60.0,  # Run every 60 seconds to check for scheduled posts
        },
    },
)

# Import tasks to register them
from app.workers import ingestion, notifications, content_creation, campaign_creation, scheduled_posts  # noqa

