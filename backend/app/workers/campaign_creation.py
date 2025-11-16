"""
Campaign Creation Worker - Celery tasks for campaign creation
"""
import asyncio
import uuid
from typing import Dict, Any, Optional, List
from uuid import UUID
from datetime import datetime, date, timedelta
from decimal import Decimal

from app.workers import celery_app
from app.utils.logger import logger


@celery_app.task(name="campaign.create_execution", bind=True, max_retries=1)
def execute_campaign_creation(
    self,
    execution_id: str,
    tenant_id: str,
    assistant_id: str,
    request_data: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Main Celery task for campaign creation execution
    
    This orchestrates the entire workflow:
    1. RAG retrieval for context
    2. Campaign plan generation using AI agent
    3. Ad copy generation
    4. Campaign structure creation (draft status)
    5. User review and approval
    6. Campaign launch to platforms
    
    Args:
        execution_id: Execution UUID string
        tenant_id: Tenant UUID string
        assistant_id: Assistant UUID string
        request_data: Request data with campaign objective, budget, channels, etc.
    
    Returns:
        Execution result with campaign draft
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
        
        async def _execute():
            from app.db.session import create_worker_session_factory
            from app.services.agent_execution_service import AgentExecutionService
            from app.services.rag_service import RAGService
            from app.services.agents.digital_marketer_agent import DigitalMarketerAgent
            from app.models.campaign import Campaign
            from app.models.tenant import Tenant
            from app.models.integration import SocialIntegration
            from sqlalchemy import select
            from datetime import datetime, timezone
            import json
            
            # Create a new session factory for this worker task
            SessionFactory = create_worker_session_factory()
            db = SessionFactory()
            try:
                execution_service = AgentExecutionService(db)
                
                # Update status to running
                await execution_service.update_execution(
                    execution_id=UUID(execution_id),
                    status="running"
                )
                
                # Task tracking
                tasks = []
                
                logger.info("=" * 80)
                logger.info("CAMPAIGN CREATION EXECUTION STARTED")
                logger.info(f"Execution ID: {execution_id}")
                logger.info(f"Tenant ID: {tenant_id}")
                logger.info(f"Assistant ID: {assistant_id}")
                logger.info("=" * 80)
                
                # Get tenant and website URL
                tenant_result = await db.execute(
                    select(Tenant).where(Tenant.id == UUID(tenant_id))
                )
                tenant = tenant_result.scalar_one_or_none()
                website_url = tenant.website_url if tenant and tenant.website_url else ""
                
                # Step 1: RAG retrieval
                logger.info("[TASK 1/5] Starting RAG retrieval...")
                try:
                    rag_service = RAGService(db, UUID(tenant_id))
                    user_request = request_data.get("objective", "") + " " + request_data.get("description", "")
                    context = await rag_service.retrieve_relevant_context(
                        query=user_request,
                        assistant_id=UUID(assistant_id),
                        limit=10
                    )
                    tasks.append({"task": "RAG Retrieval", "status": "PASSED"})
                    logger.info(f"[TASK 1/5] ✓ PASSED - Retrieved {len(context)} relevant chunks")
                except Exception as e:
                    logger.error(f"[TASK 1/5] ✗ FAILED - RAG retrieval failed: {str(e)}")
                    tasks.append({"task": "RAG Retrieval", "status": "FAILED", "error": str(e)})
                    context = ""
                
                # Step 2: Get tenant config
                tenant_config = tenant.custom_config if tenant and tenant.custom_config else {}
                
                # Step 3: Initialize agent
                logger.info("[TASK 2/5] Initializing AI agent...")
                try:
                    agent = DigitalMarketerAgent(tenant_config=tenant_config)
                    tasks.append({"task": "Agent Initialization", "status": "PASSED"})
                    logger.info("[TASK 2/5] ✓ PASSED - Agent initialized")
                except Exception as e:
                    logger.error(f"[TASK 2/5] ✗ FAILED - Agent initialization failed: {str(e)}")
                    tasks.append({"task": "Agent Initialization", "status": "FAILED", "error": str(e)})
                    raise
                
                # Step 4: Generate campaign plan using agent
                logger.info("[TASK 3/5] Generating campaign plan...")
                try:
                    # Build enhanced request
                    campaign_objective = request_data.get("objective", "")
                    target_audience = request_data.get("target_audience", tenant.target_audience if tenant else "")
                    budget = request_data.get("budget", 0)
                    duration_days = request_data.get("duration_days", 30)
                    channels = request_data.get("channels", ["google_ads", "meta_ads"])
                    
                    enhanced_request = f"""
Create a comprehensive marketing campaign plan for:
- Objective: {campaign_objective}
- Target Audience: {target_audience}
- Budget: ${budget}
- Duration: {duration_days} days
- Channels: {', '.join(channels)}

Context from knowledge base:
{context}

Generate:
1. Campaign strategy and messaging
2. Ad copy for each channel (headlines, descriptions)
3. Budget allocation across channels
4. Campaign timeline

Include the website URL: {website_url} in all ad copy where links are needed.
"""
                    
                    agent_result = await agent.execute(enhanced_request)
                    
                    if not agent_result.get("success"):
                        raise Exception(agent_result.get("error", "Campaign plan generation failed"))
                    
                    # Parse agent result to extract campaign plan
                    generated_plan = agent_result.get("result", "")
                    
                    # Extract structured data from agent response
                    # The agent should return JSON or structured text we can parse
                    campaign_plan = {
                        "strategy": generated_plan,
                        "objective": campaign_objective,
                        "target_audience": target_audience,
                        "budget": budget,
                        "duration_days": duration_days,
                        "channels": channels,
                        "ad_copy": {}  # Will be populated from agent response
                    }
                    
                    tasks.append({"task": "Campaign Plan Generation", "status": "PASSED"})
                    logger.info("[TASK 3/5] ✓ PASSED - Campaign plan generated")
                    
                except Exception as e:
                    logger.error(f"[TASK 3/5] ✗ FAILED - Campaign plan generation failed: {str(e)}")
                    tasks.append({"task": "Campaign Plan Generation", "status": "FAILED", "error": str(e)})
                    raise
                
                # Step 5: Create campaign draft in database
                logger.info("[TASK 4/5] Creating campaign draft...")
                try:
                    # Calculate dates
                    start_date = datetime.now().date()
                    end_date = start_date + timedelta(days=duration_days)
                    
                    # Budget allocation
                    budget_per_channel = budget / len(channels) if channels else budget
                    budget_allocation = {channel: budget_per_channel for channel in channels}
                    
                    # Create campaign record
                    campaign = Campaign(
                        id=uuid.uuid4(),
                        tenant_id=UUID(tenant_id),
                        execution_id=UUID(execution_id),
                        name=f"{campaign_objective} Campaign",
                        description=request_data.get("description", ""),
                        campaign_type=request_data.get("campaign_type", "brand_awareness"),
                        start_date=start_date,
                        end_date=end_date,
                        channels=channels,
                        total_budget=Decimal(str(budget)),
                        budget_allocation=budget_allocation,
                        status="draft",  # Draft status - waiting for user approval
                        plan=campaign_plan,
                        metrics={}
                    )
                    
                    db.add(campaign)
                    await db.commit()
                    await db.refresh(campaign)
                    
                    tasks.append({"task": "Campaign Draft Creation", "status": "PASSED"})
                    logger.info(f"[TASK 4/5] ✓ PASSED - Campaign draft created: {campaign.id}")
                    
                except Exception as e:
                    logger.error(f"[TASK 4/5] ✗ FAILED - Campaign draft creation failed: {str(e)}")
                    tasks.append({"task": "Campaign Draft Creation", "status": "FAILED", "error": str(e)})
                    await db.rollback()
                    raise
                
                # Step 6: Update execution with result
                logger.info("[TASK 5/5] Finalizing execution...")
                try:
                    await execution_service.update_execution(
                        execution_id=UUID(execution_id),
                        status="completed",
                        result={
                            "campaign_id": str(campaign.id),
                            "campaign_name": campaign.name,
                            "status": campaign.status,
                            "plan": campaign_plan,
                            "tasks": tasks
                        },
                        steps_executed=tasks
                    )
                    
                    tasks.append({"task": "Execution Finalization", "status": "PASSED"})
                    logger.info("[TASK 5/5] ✓ PASSED - Execution finalized")
                    
                except Exception as e:
                    logger.error(f"[TASK 5/5] ✗ FAILED - Execution finalization failed: {str(e)}")
                    tasks.append({"task": "Execution Finalization", "status": "FAILED", "error": str(e)})
                
                # Summary
                passed_tasks = sum(1 for t in tasks if t.get("status") == "PASSED")
                failed_tasks = sum(1 for t in tasks if t.get("status") == "FAILED")
                
                logger.info("=" * 80)
                logger.info("CAMPAIGN CREATION EXECUTION COMPLETED")
                logger.info(f"Tasks Passed: {passed_tasks}/{len(tasks)}")
                logger.info(f"Tasks Failed: {failed_tasks}/{len(tasks)}")
                logger.info(f"Campaign ID: {campaign.id}")
                logger.info(f"Campaign Status: {campaign.status}")
                logger.info("=" * 80)
                
                return {
                    "success": True,
                    "campaign_id": str(campaign.id),
                    "status": campaign.status,
                    "tasks": tasks
                }
                
            finally:
                await db.close()
        
        result = loop.run_until_complete(_execute())
        loop.close()
        return result
        
    except Exception as e:
        logger.error(f"Campaign creation execution failed: {str(e)}", exc_info=True)
        
        # Update execution status to failed
        try:
            from app.db.session import create_worker_session_factory
            from app.services.agent_execution_service import AgentExecutionService
            
            # Create event loop for error handling
            try:
                error_loop = asyncio.get_event_loop()
                if error_loop.is_closed():
                    error_loop = asyncio.new_event_loop()
                    asyncio.set_event_loop(error_loop)
            except RuntimeError:
                error_loop = asyncio.new_event_loop()
                asyncio.set_event_loop(error_loop)
            
            async def _update_error():
                SessionFactory = create_worker_session_factory()
                db = SessionFactory()
                try:
                    execution_service = AgentExecutionService(db)
                    await execution_service.update_execution(
                        execution_id=UUID(execution_id),
                        status="failed",
                        error_message=str(e)
                    )
                finally:
                    await db.close()
            
            error_loop.run_until_complete(_update_error())
            error_loop.close()
        except Exception as update_error:
            logger.error(f"Failed to update execution status: {str(update_error)}")
        
        raise self.retry(exc=e, countdown=120)

