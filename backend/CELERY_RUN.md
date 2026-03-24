# Running Celery (Production)

## Prerequisites

- Redis running on `localhost:6379`
- For different Redis URL, set `CELERY_BROKER_URL` in settings

## Start services

### 1. Redis (if not running)

```bash
redis-server
```

### 2. Celery worker

```bash
cd backend
celery -A backend worker -l info
```

### 3. Celery Beat (scheduler)

```bash
cd backend
celery -A backend beat -l info
```

Or run worker and beat together:

```bash
celery -A backend worker --beat -l info
```

## Task

- **Task:** `app.tasks.complete_expired_diet_plans`
- **Schedule:** Daily at 00:05 UTC
- **Action:** Marks expired plans completed, sends 3-day and tomorrow expiry notifications to admin + nutritionist

## Manual run

```bash
python manage.py complete_expired_plans
```

Or trigger via Python:

```python
from app.tasks import complete_expired_diet_plans
complete_expired_diet_plans.delay()
```
