"""
Local filesystem storage (for development)
"""
import os
import aiofiles
from pathlib import Path
from typing import BinaryIO
from app.services.storage.base import StorageBackend
from app.utils.errors import StorageError


class LocalStorage(StorageBackend):
    """Local filesystem storage (for development)"""
    
    def __init__(self, base_path: str = "./storage"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    async def upload(
        self, 
        key: str, 
        file: BinaryIO, 
        content_type: str
    ) -> str:
        """Upload file to local storage"""
        try:
            file_path = self.base_path / key
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            async with aiofiles.open(file_path, 'wb') as f:
                content = file.read()
                await f.write(content)
            
            return f"/storage/{key}"
        except Exception as e:
            raise StorageError(f"Failed to upload file: {str(e)}")
    
    async def download(self, key: str) -> bytes:
        """Download file from local storage"""
        try:
            file_path = self.base_path / key
            if not file_path.exists():
                raise StorageError(f"File not found: {key}")
            
            async with aiofiles.open(file_path, 'rb') as f:
                return await f.read()
        except Exception as e:
            raise StorageError(f"Failed to download file: {str(e)}")
    
    async def delete(self, key: str) -> bool:
        """Delete file from local storage"""
        try:
            file_path = self.base_path / key
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            raise StorageError(f"Failed to delete file: {str(e)}")
    
    async def exists(self, key: str) -> bool:
        """Check if file exists"""
        file_path = self.base_path / key
        return file_path.exists()
    
    async def get_url(self, key: str, expires_in: int = 3600) -> str:
        """Get file URL (for local, just return the path)"""
        return f"/storage/{key}"

