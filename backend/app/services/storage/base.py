"""
Abstract storage interface
"""
from abc import ABC, abstractmethod
from typing import BinaryIO


class StorageBackend(ABC):
    """Abstract storage interface"""
    
    @abstractmethod
    async def upload(
        self, 
        key: str, 
        file: BinaryIO, 
        content_type: str
    ) -> str:
        """Upload file and return URL/path"""
        pass
    
    @abstractmethod
    async def download(self, key: str) -> bytes:
        """Download file content"""
        pass
    
    @abstractmethod
    async def delete(self, key: str) -> bool:
        """Delete file"""
        pass
    
    @abstractmethod
    async def exists(self, key: str) -> bool:
        """Check if file exists"""
        pass
    
    @abstractmethod
    async def get_url(self, key: str, expires_in: int = 3600) -> str:
        """Get temporary signed URL"""
        pass

