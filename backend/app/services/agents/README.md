# LangChain Agent Integration

This module provides LangChain-based agent orchestration for the CODIAN platform, enabling reasoning, planning, tool execution, and memory management.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│         Digital Marketer AI Agent Engine                │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Agent Core (LangChain)                          │  │
│  │  - Reasoning (LLM)                                │  │
│  │  - Planning (Agent Executor)                     │  │
│  │  - Tool Execution (Tool Chain)                   │  │
│  │  - Memory Management (Chat History)              │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Tool Execution Layer                       │
│  • keyword_research (SerpAPI)                          │
│  • get_trending_hashtags (SerpAPI)                     │
│  • create_social_post (LLM)                            │
│  • generate_image (LLM)                                │
│  • optimize_hashtags (LLM + SerpAPI)                   │
└─────────────────────────────────────────────────────────┘
```

## Usage

### Basic Agent Execution

```python
from app.services.agents import DigitalMarketerAgent

# Initialize agent with tenant config
tenant_config = {
    "brand_voice": "professional",
    "target_audience": "small business owners",
    "offerings": "AI-powered marketing automation"
}

agent = DigitalMarketerAgent(
    tenant_config=tenant_config,
    llm_provider="gemini",  # or "openai", "anthropic"
    temperature=0.7
)

# Execute a task
result = await agent.execute(
    request="Create social media posts about AI in healthcare for Facebook and LinkedIn"
)

print(result["result"])  # Generated content
print(result["tools_used"])  # ['keyword_research', 'create_social_post', ...]
print(result["steps_executed"])  # Detailed execution steps
```

### Streaming Execution

```python
# Stream execution for real-time updates
async for update in agent.stream_execute(
    request="Research keywords for 'digital marketing' and create a blog post"
):
    if update["type"] == "chunk":
        print(f"Agent working: {update['data']}")
    elif update["type"] == "complete":
        print("Execution complete!")
```

### With Chat History

```python
chat_history = [
    {"role": "user", "content": "What's our brand voice?"},
    {"role": "assistant", "content": "Your brand voice is professional and friendly."}
]

result = await agent.execute(
    request="Create a post about our new product launch",
    chat_history=chat_history
)
```

## Available Tools

### Content Creation Tools

1. **keyword_research(query, location, limit)**
   - Research keywords and get search data
   - Returns: Dictionary with keywords and trends

2. **get_trending_hashtags(topic, platform)**
   - Find trending hashtags for a topic
   - Returns: List of hashtags

3. **create_social_post(topic, platform, tone, hashtags)**
   - Generate platform-specific social media posts
   - Returns: Dictionary with content, hashtags, character count

4. **generate_image(description, aspect_ratio, number_of_images)**
   - Generate images using AI
   - Returns: Dictionary with image data

5. **optimize_hashtags(content, platform, topic)**
   - Optimize hashtags for content
   - Returns: List of optimized hashtags

## Provider Switching

The agent automatically uses your configured LLM provider:

```python
# Use default from config
agent = DigitalMarketerAgent(tenant_config=config)

# Override provider
agent = DigitalMarketerAgent(
    tenant_config=config,
    llm_provider="openai"  # Switch to OpenAI
)
```

## Integration with Agent Execution Service

```python
from app.services.agent_execution_service import AgentExecutionService
from app.services.agents import DigitalMarketerAgent

# Create execution record
execution_service = AgentExecutionService(db)
execution = await execution_service.create_execution(
    tenant_id=tenant_id,
    assistant_id=assistant_id,
    request_type="create_social_posts",
    request_data={"topic": "AI in healthcare", "platforms": ["facebook", "linkedin"]}
)

# Initialize agent
agent = DigitalMarketerAgent(tenant_config=tenant_config)

# Execute
result = await agent.execute(
    request="Create social posts about AI in healthcare for Facebook and LinkedIn"
)

# Update execution
await execution_service.update_execution(
    execution_id=execution.id,
    status="completed",
    result=result["result"],
    tools_used=result["tools_used"],
    steps_executed=result["steps_executed"]
)
```

## Adding New Tools

1. Create tool function in `tools/content_tools.py`:

```python
from langchain_core.tools import tool

@tool
async def my_new_tool(param1: str, param2: int) -> Dict[str, Any]:
    """
    Description of what the tool does.
    
    Args:
        param1: Description
        param2: Description
    
    Returns:
        Result description
    """
    # Tool implementation
    return {"result": "..."}
```

2. Add to `CONTENT_CREATION_TOOLS` list
3. The agent will automatically have access to it

## LangChain Features Used

- **Agent Executor**: Orchestrates tool calling and reasoning
- **Tool Chain**: Manages tool execution flow
- **Memory**: Chat history for context
- **Streaming**: Real-time execution updates
- **Error Handling**: Graceful failure recovery

## Next Steps

- Add campaign management tools
- Add analytics tools
- Implement LangGraph for complex workflows
- Add vector store integration for RAG
- Add memory persistence (Redis/PostgreSQL)

