.PHONY: help install dev-install run run-dev test lint format clean db-init db-upgrade db-downgrade db-reset db-reset-confirm db-migration db-current db-history db-stamp docker-up docker-down docker-build docker-logs shell setup

# Default target
help:
	@echo "CODIAN Backend - Available Commands:"
	@echo ""
	@echo "Setup:"
	@echo "  make install          - Install production dependencies"
	@echo "  make dev-install      - Install development dependencies"
	@echo "  make venv             - Create virtual environment"
	@echo ""
	@echo "Development:"
	@echo "  make run              - Run the FastAPI server"
	@echo "  make run-dev          - Run server with auto-reload"
	@echo "  make shell            - Open Python shell with app context"
	@echo ""
	@echo "Database:"
	@echo "  make db-init          - Initialize database (create initial migration)"
	@echo "  make db-migration     - Create new migration (use MESSAGE='description')"
	@echo "  make db-upgrade       - Apply all pending migrations"
	@echo "  make db-downgrade     - Rollback one migration"
	@echo "  make db-reset-confirm - Reset database (WARNING: deletes all data)"
	@echo "  make db-current       - Show current database revision"
	@echo "  make db-history       - Show migration history"
	@echo "  make db-stamp         - Stamp database to revision (use REVISION='head')"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint             - Run linters (flake8)"
	@echo "  make format           - Format code with black"
	@echo "  make test             - Run tests"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-up        - Start Docker services"
	@echo "  make docker-down      - Stop Docker services"
	@echo "  make docker-build     - Build Docker images"
	@echo "  make docker-logs      - View Docker logs"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean            - Clean cache files and __pycache__"
	@echo "  make requirements     - Update requirements.txt from installed packages"

# Variables
PYTHON := python3
VENV := venv
PIP := $(VENV)/bin/pip
PYTHON_VENV := $(VENV)/bin/python
ALEMBIC := $(VENV)/bin/alembic
UVICORN := $(VENV)/bin/uvicorn
BLACK := $(VENV)/bin/black
FLAKE8 := $(VENV)/bin/flake8
PYTEST := $(VENV)/bin/pytest

# Setup
venv:
	@echo "Creating virtual environment..."
	$(PYTHON) -m venv $(VENV)
	@echo "Virtual environment created. Activate with: source $(VENV)/bin/activate"

install: venv
	@echo "Installing production dependencies..."
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

dev-install: install
	@echo "Installing development dependencies..."
	$(PIP) install -r requirements-dev.txt

# Development
run:
	@echo "Starting FastAPI server..."
	$(UVICORN) main:app --host 0.0.0.0 --port 8000

run-dev:
	@echo "Starting FastAPI server with auto-reload..."
	$(UVICORN) main:app --host 0.0.0.0 --port 8000 --reload

shell:
	@echo "Opening Python shell with app context..."
	@echo "Available: settings, Base, and all models"
	$(PYTHON_VENV) -c "from app.config import settings; from app.db.base import Base; from app.models import *; import code; code.interact(local=dict(globals(), **locals()))"

# Database
db-init:
	@echo "Creating initial migration..."
	$(ALEMBIC) revision --autogenerate -m "initial migration"
	@echo "Review the migration file, then run: make db-upgrade"

db-migration:
	@if [ -z "$(MESSAGE)" ]; then \
		echo "Error: MESSAGE is required. Usage: make db-migration MESSAGE='your message'"; \
		exit 1; \
	fi
	@echo "Creating migration: $(MESSAGE)"
	$(ALEMBIC) revision --autogenerate -m "$(MESSAGE)"

db-upgrade:
	@echo "Applying migrations..."
	$(ALEMBIC) upgrade head

db-downgrade:
	@echo "Rolling back one migration..."
	$(ALEMBIC) downgrade -1

db-reset:
	@echo "⚠️  WARNING: This will delete all data!"
	@echo "Run manually: make db-reset-confirm"
	@echo "Or: $(ALEMBIC) downgrade base && $(ALEMBIC) upgrade head"

db-reset-confirm:
	@echo "Resetting database..."
	$(ALEMBIC) downgrade base
	$(ALEMBIC) upgrade head
	@echo "Database reset complete"

db-current:
	@echo "Current database revision:"
	$(ALEMBIC) current

db-history:
	@echo "Migration history:"
	$(ALEMBIC) history

db-stamp:
	@if [ -z "$(REVISION)" ]; then \
		echo "Error: REVISION is required. Usage: make db-stamp REVISION=head"; \
		exit 1; \
	fi
	@echo "Stamping database to revision: $(REVISION)"
	$(ALEMBIC) stamp $(REVISION)

# Code Quality
lint:
	@echo "Running linters..."
	$(FLAKE8) app/ --max-line-length=100 --exclude=venv,__pycache__,migrations

format:
	@echo "Formatting code with black..."
	$(BLACK) app/ --line-length=100

format-check:
	@echo "Checking code formatting..."
	$(BLACK) app/ --line-length=100 --check

test:
	@echo "Running tests..."
	$(PYTEST) tests/ -v

test-cov:
	@echo "Running tests with coverage..."
	$(PYTEST) tests/ --cov=app --cov-report=html --cov-report=term

# Docker
docker-up:
	@echo "Starting Docker services..."
	docker-compose up -d

docker-down:
	@echo "Stopping Docker services..."
	docker-compose down

docker-build:
	@echo "Building Docker images..."
	docker-compose build

docker-logs:
	@echo "Viewing Docker logs..."
	docker-compose logs -f

docker-restart:
	@echo "Restarting Docker services..."
	docker-compose restart

docker-ps:
	@echo "Docker containers status:"
	docker-compose ps

# Celery Workers
celery-worker:
	@echo "Starting Celery worker..."
	celery -A app.workers worker --loglevel=info --concurrency=4

celery-worker-dev:
	@echo "Starting Celery worker with auto-reload..."
	watchmedo auto-restart --directory=./app --pattern='*.py' --recursive -- celery -A app.workers worker --loglevel=info --concurrency=4

celery-beat:
	@echo "Starting Celery beat scheduler..."
	celery -A app.workers beat --loglevel=info

celery-flower:
	@echo "Starting Celery Flower (monitoring)..."
	celery -A app.workers flower --port=5555

celery-purge:
	@echo "Purging all tasks from queues..."
	celery -A app.workers purge -f

# Utilities
clean:
	@echo "Cleaning cache files..."
	find . -type d -name "__pycache__" -exec rm -r {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -r {} + 2>/dev/null || true
	rm -rf .pytest_cache
	rm -rf .coverage
	rm -rf htmlcov
	@echo "Clean complete"

requirements:
	@echo "Updating requirements.txt..."
	$(PIP) freeze > requirements.txt
	@echo "Requirements updated. Review and commit changes."

# Database URL helper (for manual SQL access)
db-url:
	@$(PYTHON_VENV) -c "from app.config import settings; print(settings.DATABASE_URL)"

# Health check
health:
	@echo "Checking API health..."
	curl -s http://localhost:8000/health | python -m json.tool || echo "API not running"

# Quick setup (first time)
setup: venv install dev-install
	@echo ""
	@echo "✅ Setup complete!"
	@echo ""
	@echo "Next steps:"
	@echo "1. Create .env file (see ENV_SETUP.md)"
	@echo "2. Run: make db-init"
	@echo "3. Run: make db-upgrade"
	@echo "4. Run: make run-dev"

