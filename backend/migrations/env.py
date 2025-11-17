"""
Alembic environment configuration for async SQLAlchemy
Note: Alembic uses sync connections, so we convert async URL to sync
"""
from logging.config import fileConfig
from sqlalchemy import pool, create_engine
from sqlalchemy.engine import Connection
from alembic import context
import os
from pathlib import Path

# Import your models and config
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import settings
from app.db.base import Base
# Import all models to ensure they're registered with Base.metadata
from app.models import (  # noqa: F401
    user, tenant, assistant, capability, document, conversation,
    content, integration, billing, agent_execution, analytics, campaign
)

# this is the Alembic Config object
config = context.config

# Convert async database URL to sync for Alembic
# Alembic requires synchronous connections, so we use psycopg2 instead of asyncpg
if "+asyncpg" in settings.DATABASE_URL:
    database_url = settings.DATABASE_URL.replace("+asyncpg", "+psycopg2")
else:
    database_url = settings.DATABASE_URL
config.set_main_option("sqlalchemy.url", database_url)

# Store SSL connect args for use in engine creation
_ssl_connect_args = {}
if settings.DATABASE_SSL_REQUIRED:
    ssl_mode = {"sslmode": "require"}
    if settings.DATABASE_SSL_CA:
        ca_path = settings.DATABASE_SSL_CA
        # If it's a file path, use it directly
        if os.path.isfile(ca_path):
            ssl_mode["sslrootcert"] = ca_path
        # Otherwise, treat it as certificate content and write to temp file
        elif not os.path.exists(ca_path):
            # Assume it's certificate content from env variable
            # Write to a temporary file
            ca_file_path = Path("/tmp/postgres-ca.crt")
            ca_file_path.write_text(settings.DATABASE_SSL_CA)
            ssl_mode["sslrootcert"] = str(ca_file_path)
        else:
            ssl_mode["sslrootcert"] = ca_path
    _ssl_connect_args = ssl_mode

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Use sync engine for Alembic (Alembic doesn't support async well)
    connectable = create_engine(
        database_url,
        poolclass=pool.NullPool,
        connect_args=_ssl_connect_args,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
