"""
Celery configuration for Miisky backend.
"""
from celery import Celery
from celery.schedules import crontab

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

app = Celery("backend")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks(["app"])

app.conf.beat_schedule = {
    # Expiry emails (3d / tomorrow), mark past-due active plans completed, in-app notify admin + nutritionist.
    "complete-expired-diet-plans-daily": {
        "task": "app.tasks.complete_expired_diet_plans",
        "schedule": crontab(hour=0, minute=5),
    },
    # Every Sunday: email each active-plan patient with next week's allotted meals.
    "send-weekly-food-plan-emails-sunday": {
        "task": "app.tasks.send_weekly_food_plan_emails",
        "schedule": crontab(day_of_week="sun", hour=8, minute=0),
    },
}
