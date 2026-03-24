"""
Celery tasks for Miisky app.
"""
from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta

from .models import UserDietPlan, UserRegister


def _full_name(user):
    if not user:
        return "Unknown"
    name = f"{(user.first_name or '').strip()} {(user.last_name or '').strip()}".strip()
    return name or (getattr(user, "username", None) or "Unknown")


def _send_expiry_notifications(target_date, label, admin_emails):
    plans = (
        UserDietPlan.objects.select_related("user", "nutritionist", "diet_plan")
        .filter(status="active", end_date=target_date)
    )
    sent_count = 0
    for plan in plans:
        patient_name = _full_name(plan.user)
        nutritionist_name = _full_name(plan.nutritionist)
        plan_name = plan.diet_plan.title if plan.diet_plan else "Diet Plan"

        subject = f"Plan expiry alert ({label}) - {patient_name}"
        message = (
            f"Patient: {patient_name}\n"
            f"Plan: {plan_name}\n"
            f"Nutritionist: {nutritionist_name}\n"
            f"End date: {plan.end_date}\n"
            f"Status: {plan.status}\n\n"
            f"This patient plan is completing {label}."
        )
        recipients = set(admin_emails)
        if plan.nutritionist and plan.nutritionist.email:
            recipients.add(plan.nutritionist.email)
        if not recipients:
            continue
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=None,
                recipient_list=list(recipients),
                fail_silently=False,
            )
            sent_count += 1
        except Exception:
            pass
    return sent_count


def run_complete_expired_plans():
    """
    Core logic: expire plans, send 3-day and tomorrow notifications.
    Returns dict with counts.
    """
    today = timezone.now().date()
    in_3_days = today + timedelta(days=3)
    tomorrow = today + timedelta(days=1)

    admins = UserRegister.objects.filter(
        role="admin", is_active=True
    ).exclude(email__isnull=True).exclude(email="")
    admin_emails = list(admins.values_list("email", flat=True))

    count_3_days = _send_expiry_notifications(
        target_date=in_3_days,
        label="in 3 days",
        admin_emails=admin_emails,
    )
    count_tomorrow = _send_expiry_notifications(
        target_date=tomorrow,
        label="tomorrow",
        admin_emails=admin_emails,
    )

    updated = UserDietPlan.objects.filter(
        status="active",
        end_date__lt=today,
    ).update(status="completed")

    return {
        "expiry_3days_notified": count_3_days,
        "expiry_tomorrow_notified": count_tomorrow,
        "expired_plans_completed": updated,
    }


@shared_task
def complete_expired_diet_plans():
    """
    Celery task: expire plans and send notifications.
    Scheduled daily via Celery Beat.
    """
    return run_complete_expired_plans()
