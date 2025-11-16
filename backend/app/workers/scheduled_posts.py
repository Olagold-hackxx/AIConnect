"""
Scheduled Posts Worker - Celery tasks for periodic content posting
"""
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional
from uuid import UUID
from celery.schedules import crontab

from app.workers import celery_app
from app.utils.logger import logger
from app.workers.content_creation import execute_content_creation


@celery_app.task(name="scheduled_posts.process_scheduled", bind=True)
def process_scheduled_posts(self) -> Dict[str, Any]:
    """
    Periodic task that checks for scheduled posts ready to execute
    This is called by Celery Beat on a regular interval
    """
    try:
        # Create a new event loop for this task
        try:
            loop = asyncio.get_event_loop()
            if loop.is_closed():
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        
        async def _process():
            from app.db.session import create_worker_session_factory
            from sqlalchemy import select, and_
            from app.models.content import ScheduledPost
            
            # Create a new session factory for this worker task
            SessionFactory = create_worker_session_factory()
            db = SessionFactory()
            try:
                now = datetime.now(timezone.utc)
                
                # Find all active scheduled posts that are due
                result = await db.execute(
                    select(ScheduledPost).where(
                        and_(
                            ScheduledPost.is_active == True,
                            ScheduledPost.status == "active",
                            ScheduledPost.next_run_at <= now,
                            (ScheduledPost.end_date.is_(None)) | (ScheduledPost.end_date >= now)
                        )
                    )
                )
                scheduled_posts = result.scalars().all()
                
                logger.info(f"Found {len(scheduled_posts)} scheduled posts ready to execute")
                
                executed_count = 0
                for scheduled_post in scheduled_posts:
                    try:
                        # Execute the content creation
                        logger.info(f"Executing scheduled post {scheduled_post.id} ({scheduled_post.name})")
                        
                        # Create execution record first
                        from app.services.agent_execution_service import AgentExecutionService
                        execution_service = AgentExecutionService(db)
                        
                        execution = await execution_service.create_execution(
                            tenant_id=scheduled_post.tenant_id,
                            assistant_id=scheduled_post.assistant_id,
                            capability_id=scheduled_post.capability_id,
                            request_type="create_content",
                            request_data={
                                "request": scheduled_post.request,
                                "platforms": scheduled_post.platforms or [],
                                "include_images": scheduled_post.include_images,
                                "include_video": scheduled_post.include_video,
                            },
                            initiated_by=scheduled_post.created_by
                        )
                        
                        # Prepare request data
                        request_data = {
                            "request": scheduled_post.request,
                            "platforms": scheduled_post.platforms or [],
                            "include_images": scheduled_post.include_images,
                            "include_video": scheduled_post.include_video,
                        }
                        
                        # Queue the content creation task
                        task = execute_content_creation.delay(
                            execution_id=str(execution.id),
                            tenant_id=str(scheduled_post.tenant_id),
                            assistant_id=str(scheduled_post.assistant_id),
                            request_data=request_data
                        )
                        
                        scheduled_post.successful_runs += 1
                        
                        # Update scheduled post
                        scheduled_post.last_run_at = now
                        scheduled_post.total_runs += 1
                        
                        # Calculate next run time based on schedule type
                        next_run = _calculate_next_run(
                            scheduled_post.schedule_type,
                            scheduled_post.schedule_config,
                            now
                        )
                        
                        if next_run:
                            scheduled_post.next_run_at = next_run
                            
                            # Check if we've reached the end date
                            if scheduled_post.end_date and next_run > scheduled_post.end_date:
                                scheduled_post.status = "completed"
                                scheduled_post.is_active = False
                                logger.info(f"Scheduled post {scheduled_post.id} has reached its end date")
                        else:
                            # One-time schedule completed
                            scheduled_post.status = "completed"
                            scheduled_post.is_active = False
                            logger.info(f"One-time scheduled post {scheduled_post.id} completed")
                        
                        await db.commit()
                        executed_count += 1
                        
                    except Exception as e:
                        logger.error(f"Error executing scheduled post {scheduled_post.id}: {str(e)}", exc_info=True)
                        scheduled_post.failed_runs += 1
                        scheduled_post.total_runs += 1
                        
                        # If too many failures, mark as failed
                        if scheduled_post.failed_runs >= 5:
                            scheduled_post.status = "failed"
                            scheduled_post.is_active = False
                            logger.error(f"Scheduled post {scheduled_post.id} marked as failed after 5 failures")
                        
                        await db.commit()
                
                return {
                    "success": True,
                    "executed_count": executed_count,
                    "total_found": len(scheduled_posts)
                }
                
            finally:
                await db.close()
        
        result = loop.run_until_complete(_process())
        loop.close()
        return result
        
    except Exception as e:
        logger.error(f"Error processing scheduled posts: {str(e)}", exc_info=True)
        return {
            "success": False,
            "error": str(e)
        }


def _calculate_next_run(schedule_type: str, schedule_config: Dict[str, Any], current_time: datetime) -> Optional[datetime]:
    """
    Calculate the next run time based on schedule type and configuration
    
    Args:
        schedule_type: one_time, daily, weekly, monthly
        schedule_config: Configuration dict with schedule-specific settings
        current_time: Current datetime
    
    Returns:
        Next run datetime or None if schedule is complete
    """
    if schedule_type == "one_time":
        return None  # One-time schedules don't repeat
    
    elif schedule_type == "daily":
        # Daily schedule: run at a specific time each day
        hour = schedule_config.get("hour", 9)
        minute = schedule_config.get("minute", 0)
        
        # Calculate next run (tomorrow at specified time)
        next_run = current_time.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if next_run <= current_time:
            # If time has passed today, schedule for tomorrow
            next_run += timedelta(days=1)
        
        return next_run
    
    elif schedule_type == "weekly":
        # Weekly schedule: run on specific day(s) of week at specific time
        days_of_week = schedule_config.get("days_of_week", [0])  # 0=Monday, 6=Sunday
        hour = schedule_config.get("hour", 9)
        minute = schedule_config.get("minute", 0)
        
        # Find next matching day
        current_weekday = current_time.weekday()
        next_run = None
        
        # Check remaining days this week
        for day in sorted(days_of_week):
            if day > current_weekday:
                next_run = current_time.replace(hour=hour, minute=minute, second=0, microsecond=0)
                days_ahead = day - current_weekday
                next_run += timedelta(days=days_ahead)
                break
        
        # If no day found this week, use first day of next week
        if next_run is None:
            first_day = min(days_of_week)
            next_run = current_time.replace(hour=hour, minute=minute, second=0, microsecond=0)
            days_ahead = (7 - current_weekday) + first_day
            next_run += timedelta(days=days_ahead)
        
        return next_run
    
    elif schedule_type == "monthly":
        # Monthly schedule: run on specific day(s) of month at specific time
        days_of_month = schedule_config.get("days_of_month", [1])  # List of day numbers (1-31)
        hour = schedule_config.get("hour", 9)
        minute = schedule_config.get("minute", 0)
        
        # Find next matching day
        current_day = current_time.day
        next_run = None
        
        # Check remaining days this month
        for day in sorted(days_of_month):
            if day > current_day:
                try:
                    next_run = current_time.replace(day=day, hour=hour, minute=minute, second=0, microsecond=0)
                    break
                except ValueError:
                    # Invalid day for this month (e.g., Feb 30), skip
                    continue
        
        # If no day found this month, use first day of next month
        if next_run is None:
            first_day = min(days_of_month)
            # Move to next month
            if current_time.month == 12:
                next_month = current_time.replace(year=current_time.year + 1, month=1, day=1, hour=hour, minute=minute, second=0, microsecond=0)
            else:
                next_month = current_time.replace(month=current_time.month + 1, day=1, hour=hour, minute=minute, second=0, microsecond=0)
            
            # Try to set the day
            try:
                next_run = next_month.replace(day=first_day)
            except ValueError:
                # If day doesn't exist in next month (e.g., Feb 30), use last day of month
                from calendar import monthrange
                last_day = monthrange(next_month.year, next_month.month)[1]
                next_run = next_month.replace(day=min(first_day, last_day))
        
        return next_run
    
    else:
        logger.warning(f"Unknown schedule type: {schedule_type}")
        return None

