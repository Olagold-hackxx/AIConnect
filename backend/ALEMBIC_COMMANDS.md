# Alembic Database Migration Commands

## Initial Setup

### 1. Initialize Alembic (if not already done)
```bash
cd backend
alembic init alembic
```

### 2. Configure Alembic for Async SQLAlchemy

Update `alembic/env.py` to use async SQLAlchemy. The file should import from `app.db.base` and `app.config`.

## Common Commands

### Create a New Migration

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "description of changes"

# Create empty migration (manual)
alembic revision -m "description of changes"
```

### Apply Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Apply migrations up to a specific revision
alembic upgrade <revision_id>

# Apply next migration only
alembic upgrade +1
```

### Rollback Migrations

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to a specific revision
alembic downgrade <revision_id>

# Rollback all migrations
alembic downgrade base
```

### View Migration Status

```bash
# Show current revision
alembic current

# Show migration history
alembic history

# Show pending migrations
alembic heads
```

### Other Useful Commands

```bash
# Show SQL for a migration (without applying)
alembic upgrade head --sql

# Show SQL for downgrade
alembic downgrade -1 --sql

# Show detailed migration info
alembic show <revision_id>

# Merge multiple heads (if branches exist)
alembic merge -m "merge message" <revision1> <revision2>
```

## Workflow Examples

### Initial Database Setup
```bash
# 1. Create initial migration from all models
alembic revision --autogenerate -m "initial migration"

# 2. Review the generated migration file in alembic/versions/

# 3. Apply the migration
alembic upgrade head
```

### Adding a New Model
```bash
# 1. Add your model to app/models/
# 2. Import it in app/models/__init__.py
# 3. Generate migration
alembic revision --autogenerate -m "add new model"

# 4. Review and apply
alembic upgrade head
```

### Modifying an Existing Model
```bash
# 1. Modify your model
# 2. Generate migration
alembic revision --autogenerate -m "modify user model"

# 3. Review the migration (especially for data migrations)
# 4. Apply
alembic upgrade head
```

## Troubleshooting

### Reset Database (Development Only!)
```bash
# ⚠️ WARNING: This deletes all data!
# 1. Drop all tables
alembic downgrade base

# 2. Recreate from scratch
alembic upgrade head
```

### Fix Stale Migration State
```bash
# If database is out of sync with migrations
alembic stamp head  # Mark current state as head without running migrations
```

### View Migration SQL
```bash
# See what SQL will be executed
alembic upgrade head --sql > migration.sql
```

## Best Practices

1. **Always review auto-generated migrations** before applying
2. **Test migrations on a copy of production data** before deploying
3. **Use descriptive migration messages**
4. **Never edit existing migrations** - create new ones instead
5. **Keep migrations small and focused**
6. **Test both upgrade and downgrade paths**

## Quick Reference

| Command | Description |
|---------|-------------|
| `alembic current` | Show current database revision |
| `alembic history` | Show migration history |
| `alembic upgrade head` | Apply all pending migrations |
| `alembic downgrade -1` | Rollback one migration |
| `alembic revision --autogenerate -m "msg"` | Auto-generate migration |
| `alembic upgrade head --sql` | Show SQL without executing |

