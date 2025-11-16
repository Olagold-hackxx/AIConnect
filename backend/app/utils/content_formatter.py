"""
Content formatting utilities for social media posts
"""
import re
from typing import Optional


def clean_markdown_for_social(content: str, platform: Optional[str] = None) -> str:
    """
    Clean markdown formatting from content to make it suitable for social media posts.
    
    Removes:
    - Markdown headers (**Headline:**, **Body:**, etc.)
    - Bold/italic markdown (**text**, *text*)
    - Extra whitespace and newlines
    - Markdown links (converts to plain text)
    
    Args:
        content: Content with potential markdown formatting
        platform: Optional platform name for platform-specific formatting
    
    Returns:
        Cleaned plain text content
    """
    if not content:
        return ""
    
    # Remove markdown headers like **Headline:**, **Body:**, **Call to Action:**
    content = re.sub(r'\*\*([^*]+):\*\*\s*', '', content)
    
    # Remove bold markdown (**text** or __text__)
    content = re.sub(r'\*\*([^*]+)\*\*', r'\1', content)
    content = re.sub(r'__([^_]+)__', r'\1', content)
    
    # Remove italic markdown (*text* or _text_)
    content = re.sub(r'(?<!\*)\*([^*]+)\*(?!\*)', r'\1', content)
    content = re.sub(r'(?<!_)_([^_]+)_(?!_)', r'\1', content)
    
    # Remove markdown links [text](url) -> text
    content = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', content)
    
    # Remove markdown code blocks ```code``` -> code
    content = re.sub(r'```[^`]*```', '', content, flags=re.DOTALL)
    content = re.sub(r'`([^`]+)`', r'\1', content)
    
    # Remove markdown headers (# Header -> Header)
    content = re.sub(r'^#{1,6}\s+(.+)$', r'\1', content, flags=re.MULTILINE)
    
    # Remove horizontal rules
    content = re.sub(r'^---+\s*$', '', content, flags=re.MULTILINE)
    content = re.sub(r'^\*\*\*\s*$', '', content, flags=re.MULTILINE)
    
    # Clean up multiple newlines (more than 2 consecutive)
    content = re.sub(r'\n{3,}', '\n\n', content)
    
    # Remove leading/trailing whitespace from each line
    lines = [line.strip() for line in content.split('\n')]
    content = '\n'.join(lines)
    
    # Remove empty lines at start and end
    content = content.strip()
    
    # Platform-specific formatting
    if platform == "linkedin":
        # LinkedIn prefers clean paragraphs, remove excessive line breaks
        # But keep paragraph breaks (double newlines)
        content = re.sub(r'\n{2,}', '\n\n', content)
        # Remove single newlines that aren't paragraph breaks
        # But keep them if they're at the end of a sentence
        content = re.sub(r'([.!?])\n([A-Z])', r'\1\n\n\2', content)
    
    elif platform == "twitter":
        # Twitter: remove all newlines, replace with spaces
        content = re.sub(r'\n+', ' ', content)
        content = content.strip()
    
    elif platform in ["facebook", "instagram"]:
        # Facebook/Instagram: keep single newlines for readability
        content = re.sub(r'\n{3,}', '\n\n', content)
    
    return content.strip()

