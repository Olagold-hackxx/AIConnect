# Environment Variables Configuration

This document describes all environment variables used by the CODIAN API backend.

## Quick Start

1. Copy the example below to create your `.env` file:
```bash
cp ENV_SETUP.md .env
# Then edit .env with your actual values
```

2. Generate a secure SECRET_KEY:
```bash
openssl rand -hex 32
```

## Environment Variables

### Application Settings

```bash
# Application name and version
APP_NAME=CODIAN API
APP_VERSION=1.0.0

# Debug mode (set to false in production)
DEBUG=false

# API prefix
API_V1_PREFIX=/api/v1
```

### Database Configuration

```bash
# PostgreSQL connection string
# Format: postgresql+asyncpg://user:password@host:port/database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/codian

# Echo SQL queries (for debugging)
DATABASE_ECHO=false
```

### Redis Configuration

```bash
# Redis connection URL for caching and OAuth state
REDIS_URL=redis://localhost:6379/0

# Session prefix for Redis keys
REDIS_SESSION_PREFIX=session:

# Cache TTL in seconds
REDIS_CACHE_TTL=3600
```

### JWT Authentication

```bash
# Secret key for JWT tokens (generate with: openssl rand -hex 32)
SECRET_KEY=your-secret-key-change-in-production

# JWT algorithm
ALGORITHM=HS256

# Access token expiration in minutes
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Storage Configuration

```bash
# Storage backend: "local" or "s3"
STORAGE_BACKEND=local

# Local storage path (when STORAGE_BACKEND=local)
LOCAL_STORAGE_PATH=./storage

# S3 Configuration (when STORAGE_BACKEND=s3)
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY=your-aws-access-key
S3_SECRET_KEY=your-aws-secret-key
S3_ENDPOINT_URL=  # Optional: for S3-compatible services
S3_REGION=us-east-1
```

### Vector Database Configuration

```bash
# Vector DB provider: "pinecone", "qdrant", or "pgvector"
VECTOR_DB_PROVIDER=pinecone

# Pinecone Configuration
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX_NAME=codian

# Qdrant Configuration (alternative)
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your-qdrant-api-key
```

### LLM Provider API Keys

```bash
# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Anthropic
ANTHROPIC_API_KEY=your-anthropic-api-key

# Google
GOOGLE_API_KEY=your-google-api-key
```

### External Service Integrations

```bash
# SEO Tools
SERPAPI_KEY=your-serpapi-key

# Email Service
SENDGRID_API_KEY=your-sendgrid-api-key

# Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Social Media OAuth Credentials
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
TIKTOK_CLIENT_ID=your-tiktok-client-id
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

# Google OAuth Credentials (for Google Ads & Analytics)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/integrations/oauth/google_ads/callback
GOOGLE_PROJECT_ID=your-google-project-id
GOOGLE_DEVELOPER_TOKEN=your-google-developer-token

# Google Ads Manager Account (for manager-client relationships)
GOOGLE_ADS_MANAGER_CUSTOMER_ID=2732588600

# Meta Ads API Credentials
META_ADS_APP_ID=your-meta-ads-app-id
META_ADS_APP_SECRET=your-meta-ads-app-secret
META_ADS_ACCESS_TOKEN=your-meta-ads-access-token
```

### Celery Task Queue

```bash
# Celery broker URL
CELERY_BROKER_URL=redis://localhost:6379/1

# Celery result backend
CELERY_RESULT_BACKEND=redis://localhost:6379/2
```

### CORS Configuration

```bash
# Comma-separated list of allowed origins
# Example: http://localhost:3000,http://localhost:3001,https://yourdomain.com
CORS_ORIGINS=http://localhost:3000,http://localhost:3001,https://yourdomain.com
```

## Social Media OAuth Configuration

Social media OAuth credentials can be configured via environment variables (recommended) or stored in the database via the `IntegrationConfig` model.

### Option 1: Environment Variables (Recommended)

Add these to your `.env` file:
```bash
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
TIKTOK_CLIENT_ID=your-tiktok-client-id
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

# Google OAuth Credentials (for Google Ads & Analytics)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/api/v1/integrations/oauth/google_ads/callback
GOOGLE_PROJECT_ID=your-google-project-id
GOOGLE_DEVELOPER_TOKEN=your-google-developer-token

# Google Ads Manager Account (for manager-client relationships)
GOOGLE_ADS_MANAGER_CUSTOMER_ID=2732588600

# Meta Ads API Credentials
META_ADS_APP_ID=your-meta-ads-app-id
META_ADS_APP_SECRET=your-meta-ads-app-secret
META_ADS_ACCESS_TOKEN=your-meta-ads-access-token
```

The system will automatically use these environment variables if available.

### Option 2: Database Configuration

Alternatively, you can store OAuth credentials in the database via the `IntegrationConfig` model:

1. Create IntegrationConfig records in the database for each platform:
   - `facebook` (also used for Instagram)
   - `linkedin`
   - `twitter`
   - `tiktok`
   - `google_ads` (Google Ads API)
   - `google_analytics` (Google Analytics API)
   - `meta_ads` (Meta Ads API)

2. Example SQL:
```sql
INSERT INTO integration_configs (platform, client_id, client_secret, is_enabled, authorization_url, token_url, api_base_url)
VALUES 
  ('facebook', 'your-app-id', 'your-app-secret', true, 'https://www.facebook.com/v18.0/dialog/oauth', 'https://graph.facebook.com/v18.0/oauth/access_token', 'https://graph.facebook.com/v18.0'),
  ('linkedin', 'your-client-id', 'your-client-secret', true, 'https://www.linkedin.com/oauth/v2/authorization', 'https://www.linkedin.com/oauth/v2/accessToken', 'https://api.linkedin.com/v2'),
  ('twitter', 'your-client-id', 'your-client-secret', true, 'https://twitter.com/i/oauth2/authorize', 'https://api.twitter.com/2/oauth2/token', 'https://api.twitter.com/2'),
  ('tiktok', 'your-client-key', 'your-client-secret', true, 'https://www.tiktok.com/v2/auth/authorize/', 'https://open.tiktokapis.com/v2/oauth/token/', 'https://open.tiktokapis.com/v2');
```

**Note:** Environment variables take precedence over database configuration.

## Production Checklist

- [ ] Set `DEBUG=false`
- [ ] Generate a strong `SECRET_KEY` (use `openssl rand -hex 32`)
- [ ] Use production database URL
- [ ] Configure proper `CORS_ORIGINS` for your domain
- [ ] Use S3 storage (`STORAGE_BACKEND=s3`) with proper credentials
- [ ] Set up Redis for production
- [ ] Configure Stripe webhook secret
- [ ] Store sensitive keys in a secrets manager (AWS Secrets Manager, etc.)
- [ ] Never commit `.env` file to version control

## Example .env File

```bash
# Application
APP_NAME=CODIAN API
APP_VERSION=1.0.0
DEBUG=false
API_V1_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/codian
DATABASE_ECHO=false

# Redis
REDIS_URL=redis://localhost:6379/0
REDIS_SESSION_PREFIX=session:
REDIS_CACHE_TTL=3600

# JWT
SECRET_KEY=your-generated-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Storage
STORAGE_BACKEND=local
LOCAL_STORAGE_PATH=./storage

# Vector DB
VECTOR_DB_PROVIDER=pinecone
PINECONE_API_KEY=your-key
PINECONE_ENVIRONMENT=your-env
PINECONE_INDEX_NAME=codian

# External Services
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Social Media OAuth Credentials
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
TIKTOK_CLIENT_ID=your-tiktok-client-id
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret

# Celery
CELERY_BROKER_URL=redis://localhost:6379/1
CELERY_RESULT_BACKEND=redis://localhost:6379/2

# CORS
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

