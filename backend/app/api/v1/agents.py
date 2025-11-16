"""
Agent Execution API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.assistant import Assistant
from app.services.agent_execution_service import AgentExecutionService
from app.utils.logger import logger

router = APIRouter(tags=["agents"])


class AgentExecutionRequest(BaseModel):
    assistant_id: str
    capability_id: Optional[str] = None
    request_type: str
    request_data: Dict[str, Any]


class AgentExecutionResponse(BaseModel):
    execution: Dict[str, Any]
    message: str


@router.post("/agent/execute", response_model=AgentExecutionResponse, status_code=status.HTTP_202_ACCEPTED)
async def execute_agent(
    request: AgentExecutionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Execute an agent task (content creation, campaign, analytics, etc.)
    Returns immediately with execution ID, actual execution runs in background
    """
    try:
        assistant_id = UUID(request.assistant_id)
        capability_id = UUID(request.capability_id) if request.capability_id else None
        
        # Verify assistant belongs to user's tenant
        from sqlalchemy import select
        result = await db.execute(
            select(Assistant).where(
                Assistant.id == assistant_id,
                Assistant.tenant_id == current_user.tenant_id
            )
        )
        assistant = result.scalar_one_or_none()
        
        if not assistant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assistant not found"
            )
        
        # Create execution record
        execution_service = AgentExecutionService(db)
        execution = await execution_service.create_execution(
            tenant_id=current_user.tenant_id,
            assistant_id=assistant_id,
            capability_id=capability_id,
            request_type=request.request_type,
            request_data=request.request_data,
            initiated_by=current_user.id
        )
        
        # Execute in Celery based on request type
        if request.request_type == "create_content":
            from app.workers.content_creation import execute_content_creation
            
            # Queue Celery task
            task = execute_content_creation.delay(
                execution_id=str(execution.id),
                tenant_id=str(current_user.tenant_id),
                assistant_id=str(assistant_id),
                request_data=request.request_data
            )
            
            logger.info(f"Queued content creation task {task.id} for execution {execution.id}")
        elif request.request_type == "create_campaign":
            from app.workers.campaign_creation import execute_campaign_creation
            
            # Queue Celery task
            task = execute_campaign_creation.delay(
                execution_id=str(execution.id),
                tenant_id=str(current_user.tenant_id),
                assistant_id=str(assistant_id),
                request_data=request.request_data
            )
            
            logger.info(f"Queued campaign creation task {task.id} for execution {execution.id}")
        else:
            # For other request types, update status to indicate it's not implemented yet
            await execution_service.update_execution(
                execution_id=execution.id,
                status="failed",
                error_message=f"Request type '{request.request_type}' not yet implemented"
            )
        
        return AgentExecutionResponse(
            execution={
                "id": str(execution.id),
                "status": execution.status,
                "request_type": execution.request_type,
                "created_at": execution.created_at.isoformat() if execution.created_at else None
            },
            message="Execution started"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing agent: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute agent: {str(e)}"
        )




@router.get("/agent/executions/{execution_id}", response_model=Dict)
async def get_execution(
    execution_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get execution status and results"""
    try:
        execution_service = AgentExecutionService(db)
        execution = await execution_service.get_execution(execution_id)
        
        if not execution:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Execution not found"
            )
        
        # Verify it belongs to user's tenant
        if execution.tenant_id != current_user.tenant_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        return {
            "execution": {
                "id": str(execution.id),
                "status": execution.status,
                "request_type": execution.request_type,
                "request_data": execution.request_data,
                "result": execution.result,
                "error_message": execution.error_message,
                "steps_executed": execution.steps_executed or [],
                "tools_used": execution.tools_used or [],
                "started_at": execution.started_at.isoformat() if execution.started_at else None,
                "completed_at": execution.completed_at.isoformat() if execution.completed_at else None,
                "execution_time_ms": execution.execution_time_ms,
                "created_at": execution.created_at.isoformat() if execution.created_at else None
            }
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting execution: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get execution"
        )


@router.get("/agent/executions", response_model=Dict)
async def list_executions(
    assistant_id: Optional[UUID] = None,
    capability_id: Optional[UUID] = None,
    status_filter: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List agent executions for the current user's tenant"""
    try:
        execution_service = AgentExecutionService(db)
        executions = await execution_service.list_executions(
            tenant_id=current_user.tenant_id,
            assistant_id=assistant_id,
            capability_id=capability_id,
            status=status_filter,
            limit=limit,
            offset=offset
        )
        
        return {
            "executions": [
                {
                    "id": str(e.id),
                    "status": e.status,
                    "request_type": e.request_type,
                    "request_data": e.request_data,
                    "result": e.result,
                    "error_message": e.error_message,
                    "steps_executed": e.steps_executed or [],
                    "tools_used": e.tools_used or [],
                    "started_at": e.started_at.isoformat() if e.started_at else None,
                    "completed_at": e.completed_at.isoformat() if e.completed_at else None,
                    "created_at": e.created_at.isoformat() if e.created_at else None
                }
                for e in executions
            ],
            "total": len(executions)
        }
    
    except Exception as e:
        logger.error(f"Error listing executions: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list executions"
        )

