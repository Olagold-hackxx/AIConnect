"""
FastAPI application entry point
"""
from fastapi import FastAPI, Request, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from app.config import settings
from app.utils.errors import CODIANException
from app.utils.logger import logger
from app.api.v1 import tenants, chat, assistants, documents, billing, auth, integrations, capabilities, agents, campaigns, scheduled_posts
from typing import Optional
from urllib.parse import urlencode

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="CODIAN - AI Assistant Platform API",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(tenants.router, prefix=settings.API_V1_PREFIX)
app.include_router(chat.router, prefix=settings.API_V1_PREFIX)
app.include_router(assistants.router, prefix=settings.API_V1_PREFIX)
app.include_router(documents.router, prefix=settings.API_V1_PREFIX)
app.include_router(billing.router, prefix=settings.API_V1_PREFIX)
app.include_router(integrations.router, prefix=settings.API_V1_PREFIX)
app.include_router(capabilities.router, prefix=settings.API_V1_PREFIX)
app.include_router(agents.router, prefix=settings.API_V1_PREFIX)
app.include_router(campaigns.router, prefix=settings.API_V1_PREFIX)
app.include_router(scheduled_posts.router, prefix=settings.API_V1_PREFIX)


# Exception handlers
@app.exception_handler(CODIANException)
async def codian_exception_handler(request: Request, exc: CODIANException):
    """Handle CODIAN exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"}
    )


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CODIAN API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/api/google-ads/auth/callback/")
async def google_ads_legacy_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None)
):
    """
    Legacy Google Ads OAuth callback endpoint
    Redirects to the new integrations OAuth callback endpoint
    """
    backend_url = settings.BACKEND_URL or "http://localhost:8000"
    new_callback_url = f"{backend_url}/api/v1/integrations/oauth/google_ads/callback"
    
    # Build query parameters
    params = {}
    if code:
        params["code"] = code
    if state:
        params["state"] = state
    if error:
        params["error"] = error
    
    # Redirect to the new endpoint with all query parameters
    if params:
        query_string = urlencode(params)
        redirect_url = f"{new_callback_url}?{query_string}"
    else:
        redirect_url = new_callback_url
    
    logger.info(f"Legacy Google Ads callback redirecting to: {redirect_url}")
    return RedirectResponse(url=redirect_url)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

