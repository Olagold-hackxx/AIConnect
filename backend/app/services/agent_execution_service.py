"""
Agent Execution Service - manages agent task execution
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timezone
from app.models.agent_execution import AgentExecution
from app.models.content import ContentItem
from app.models.campaign import Campaign
from app.models.analytics import AnalyticsReport
from app.utils.logger import logger


class AgentExecutionService:
    """Service for managing agent executions"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_execution(
        self,
        tenant_id: UUID,
        assistant_id: UUID,
        request_type: str,
        request_data: Dict,
        capability_id: Optional[UUID] = None,
        initiated_by: Optional[UUID] = None
    ) -> AgentExecution:
        """Create a new agent execution"""
        execution = AgentExecution(
            tenant_id=tenant_id,
            assistant_id=assistant_id,
            capability_id=capability_id,
            request_type=request_type,
            request_data=request_data,
            status="queued",
            initiated_by=initiated_by
        )
        
        self.db.add(execution)
        await self.db.commit()
        await self.db.refresh(execution)
        
        logger.info(f"Created agent execution {execution.id} for request type {request_type}")
        return execution
    
    async def update_execution(
        self,
        execution_id: UUID,
        status: Optional[str] = None,
        plan: Optional[Dict] = None,
        steps_executed: Optional[List] = None,
        tools_used: Optional[List] = None,
        result: Optional[Dict] = None,
        error_message: Optional[str] = None,
        tokens_used: Optional[int] = None,
        api_calls_made: Optional[int] = None
    ) -> AgentExecution:
        """Update execution status and data"""
        result_query = await self.db.execute(
            select(AgentExecution).where(AgentExecution.id == execution_id)
        )
        execution = result_query.scalar_one_or_none()
        
        if not execution:
            raise ValueError(f"Execution {execution_id} not found")
        
        if status:
            execution.status = status
            if status == "running" and not execution.started_at:
                execution.started_at = datetime.now(timezone.utc)
            elif status in ["completed", "failed", "cancelled"]:
                execution.completed_at = datetime.now(timezone.utc)
                if execution.started_at:
                    delta = execution.completed_at - execution.started_at
                    execution.execution_time_ms = int(delta.total_seconds() * 1000)
        
        if plan is not None:
            execution.plan = plan
        
        if steps_executed is not None:
            execution.steps_executed = steps_executed
        
        if tools_used is not None:
            execution.tools_used = tools_used
        
        if result is not None:
            execution.result = result
        
        if error_message is not None:
            execution.error_message = error_message
        
        if tokens_used is not None:
            execution.tokens_used = tokens_used
        
        if api_calls_made is not None:
            execution.api_calls_made = api_calls_made
        
        await self.db.commit()
        await self.db.refresh(execution)
        
        return execution
    
    async def get_execution(
        self,
        execution_id: UUID
    ) -> Optional[AgentExecution]:
        """Get execution by ID"""
        result = await self.db.execute(
            select(AgentExecution).where(AgentExecution.id == execution_id)
        )
        return result.scalar_one_or_none()
    
    async def list_executions(
        self,
        tenant_id: UUID,
        assistant_id: Optional[UUID] = None,
        capability_id: Optional[UUID] = None,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[AgentExecution]:
        """List executions for a tenant"""
        query = select(AgentExecution).where(AgentExecution.tenant_id == tenant_id)
        
        if assistant_id:
            query = query.where(AgentExecution.assistant_id == assistant_id)
        
        if capability_id:
            query = query.where(AgentExecution.capability_id == capability_id)
        
        if status:
            query = query.where(AgentExecution.status == status)
        
        query = query.order_by(desc(AgentExecution.created_at)).limit(limit).offset(offset)
        
        result = await self.db.execute(query)
        return list(result.scalars().all())

