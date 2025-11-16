"""
Notification tasks (email, webhooks, etc.)
"""
from app.workers import celery_app
from app.utils.logger import logger


@celery_app.task(name="send_email")
def send_email(to: str, subject: str, body: str):
    """
    Send email notification
    Placeholder - Email integration not implemented
    """
    logger.info(f"Sending email to {to}: {subject}")
    
    # TODO: Implement email sending
    # 1. Use SendGrid or similar
    # 2. Send email
    
    logger.info(f"Email sent to {to} (placeholder)")


@celery_app.task(name="send_webhook")
def send_webhook(url: str, payload: dict):
    """
    Send webhook notification
    Placeholder - Webhook integration not implemented
    """
    logger.info(f"Sending webhook to {url}")
    
    # TODO: Implement webhook sending
    # 1. POST to webhook URL
    # 2. Handle retries
    
    logger.info(f"Webhook sent to {url} (placeholder)")

