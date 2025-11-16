"""
S3-compatible storage (AWS S3, MinIO, Backblaze B2, etc.)
"""
import boto3
from botocore.exceptions import ClientError
from typing import BinaryIO
from app.services.storage.base import StorageBackend
from app.utils.errors import StorageError


class S3Storage(StorageBackend):
    """S3-compatible storage (AWS S3, MinIO, Backblaze B2, etc.)"""
    
    def __init__(
        self,
        bucket_name: str,
        access_key: str,
        secret_key: str,
        endpoint_url: str = None,  # For S3-compatible services
        region: str = "us-east-1"
    ):
        self.bucket_name = bucket_name
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            endpoint_url=endpoint_url,
            region_name=region
        )
    
    async def upload(
        self, 
        key: str, 
        file: BinaryIO, 
        content_type: str
    ) -> str:
        """Upload file to S3"""
        try:
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                key,
                ExtraArgs={'ContentType': content_type}
            )
            return f"s3://{self.bucket_name}/{key}"
        except ClientError as e:
            raise StorageError(f"Failed to upload to S3: {str(e)}")
    
    async def download(self, key: str) -> bytes:
        """Download file from S3"""
        try:
            response = self.s3_client.get_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return response['Body'].read()
        except ClientError as e:
            raise StorageError(f"Failed to download from S3: {str(e)}")
    
    async def delete(self, key: str) -> bool:
        """Delete file from S3"""
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return True
        except ClientError as e:
            raise StorageError(f"Failed to delete from S3: {str(e)}")
    
    async def exists(self, key: str) -> bool:
        """Check if file exists in S3"""
        try:
            self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return True
        except ClientError:
            return False
    
    async def get_url(self, key: str, expires_in: int = 3600) -> str:
        """Generate presigned URL"""
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expires_in
            )
            return url
        except ClientError as e:
            raise StorageError(f"Failed to generate presigned URL: {str(e)}")

