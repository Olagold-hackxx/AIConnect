"""
Assistant Factory - creates appropriate assistant instance
"""
from app.services.assistants.base import BaseAssistant, AssistantType
from app.services.assistants.digital_marketer import DigitalMarketerAssistant


class AssistantFactory:
    """Factory to instantiate the correct assistant based on type"""
    
    @staticmethod
    def create(
        assistant_type: AssistantType,
        tenant_id: str,
        llm_service=None,
        vector_service=None,
        redis_client=None
    ) -> BaseAssistant:
        """
        Create assistant instance based on type
        
        Args:
            assistant_type: Type of assistant to create
            tenant_id: Tenant ID
            llm_service: LLM service instance (optional)
            vector_service: Vector DB service instance (optional)
            redis_client: Redis client instance (optional)
        """
        if assistant_type == AssistantType.DIGITAL_MARKETER:
            return DigitalMarketerAssistant(
                tenant_id=tenant_id,
                llm_service=llm_service,
                vector_service=vector_service,
                redis_client=redis_client
            )
        
        # Future assistants (commented out for Phase 2/3)
        # elif assistant_type == AssistantType.EXECUTIVE_ASSISTANT:
        #     from app.services.assistants.executive_assistant import ExecutiveAssistant
        #     return ExecutiveAssistant(...)
        
        # elif assistant_type == AssistantType.CUSTOMER_SUPPORT:
        #     from app.services.assistants.customer_support import CustomerSupportAssistant
        #     return CustomerSupportAssistant(...)
        
        else:
            raise ValueError(f"Unknown assistant type: {assistant_type}")

