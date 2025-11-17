#!/bin/bash
set -e

echo "Waiting for database to be ready..."

# Parse DATABASE_URL if provided, otherwise use defaults
if [ -n "$DATABASE_URL" ]; then
  # Extract host, user, password, and database from DATABASE_URL
  # Format: postgresql+asyncpg://user:password@host:port/database
  DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
  DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
  DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
  
  # Use parsed values or defaults
  DB_HOST=${DB_HOST:-db}
  DB_USER=${DB_USER:-postgres}
  DB_NAME=${DB_NAME:-codian}
else
  DB_HOST=${DATABASE_HOST:-db}
  DB_USER=${DATABASE_USER:-postgres}
  DB_NAME=${DATABASE_NAME:-codian}
fi

# Wait for PostgreSQL to be ready
until pg_isready -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 1
done

echo "Database is ready!"

# Start the application
exec "$@"

