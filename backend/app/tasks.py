"""
Celery tasks for Miisky app.
"""
from celery import shared_task
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta, datetime

from .models import Notification, UserDietPlan, UserMeal, UserRegister


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

    expired_qs = UserDietPlan.objects.filter(
        status="active",
        end_date__lt=today,
    ).select_related("user", "nutritionist", "diet_plan")
    expired_plans = list(expired_qs)
    updated = 0
    if expired_plans:
        plan_ids = [p.pk for p in expired_plans]
        updated = UserDietPlan.objects.filter(pk__in=plan_ids).update(status="completed")

    admin_ids = list(
        UserRegister.objects.filter(role="admin", is_active=True).values_list("id", flat=True)
    )
    plan_completed_in_app = 0
    for plan in expired_plans:
        patient_name = _full_name(plan.user)
        plan_name = plan.diet_plan.title if plan.diet_plan else "Diet plan"
        body = (
            f"{patient_name}'s plan \"{plan_name}\" is now completed (ended {plan.end_date})."
        )
        target_ids = set(admin_ids)
        if plan.nutritionist_id:
            target_ids.add(plan.nutritionist_id)
        for uid in target_ids:
            Notification.objects.create(
                user_id=uid,
                title="Patient diet plan completed",
                body=body,
            )
            plan_completed_in_app += 1

    return {
        "expiry_3days_notified": count_3_days,
        "expiry_tomorrow_notified": count_tomorrow,
        "expired_plans_completed": updated,
        "plan_completed_in_app_notifications": plan_completed_in_app,
    }


@shared_task
def complete_expired_diet_plans():
    """
    Celery task: expire plans and send notifications.
    Scheduled daily via Celery Beat.
    """
    return run_complete_expired_plans()


def _next_week_date_range(base_date):
    """
    Returns next week's Monday..Sunday range based on base_date.
    When run on Sunday, range starts on next day (Monday).
    """
    days_until_next_monday = (7 - base_date.weekday()) % 7
    if days_until_next_monday == 0:
        days_until_next_monday = 7
    week_start = base_date + timedelta(days=days_until_next_monday)
    week_end = week_start + timedelta(days=6)
    return week_start, week_end


def _weekly_food_html_message(patient_name, plan_name, week_start, week_end, meals):
    """
    Generates a professional HTML table for the weekly food plan.
    """
    # Group meals by date
    grouped_meals = {}
    for meal in meals:
        date_str = str(meal.meal_date)
        if date_str not in grouped_meals:
            grouped_meals[date_str] = []
        grouped_meals[date_str].append(meal)

    html = f"""
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #2563eb; margin-bottom: 5px;">Weekly Food Plan</h2>
            <p style="color: #666; font-size: 14px;">{week_start} to {week_end}</p>
        </div>
        
        <p>Hello <strong>{patient_name}</strong>,</p>
        <p>Your nutrition plan "<strong>{plan_name}</strong>" has been updated for the upcoming week. Here is your scheduled menu:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px;">
            <thead>
                <tr style="background-color: #2563eb; color: white;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #1e40af;">Meal Type</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #1e40af;">Food</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #1e40af;">Qty</th>
                </tr>
            </thead>
            <tbody>
    """

    if not meals:
        html += """
                <tr>
                    <td colspan="3" style="padding: 20px; text-align: center; color: #999; font-style: italic;">
                        No meals are currently allotted for this week.
                    </td>
                </tr>
        """
    else:
        sorted_dates = sorted(grouped_meals.keys())
        for date_str in sorted_dates:
            # Format date for display
            try:
                display_date = datetime.strptime(date_str, "%Y-%m-%d").strftime("%A, %b %d")
            except:
                display_date = date_str
                
            html += f"""
                <tr style="background-color: #f8fafc;">
                    <td colspan="3" style="padding: 8px 12px; font-weight: bold; color: #1e293b; border-bottom: 1px solid #e2e8f0; font-size: 13px;">
                        {display_date}
                    </td>
                </tr>
            """
            for meal in grouped_meals[date_str]:
                meal_type = meal.meal_type.name if getattr(meal, "meal_type", None) else "Meal"
                food_name = meal.food.name if getattr(meal, "food", None) else "To be updated"
                qty = meal.quantity if meal.quantity not in (None, "") else "-"
                
                html += f"""
                <tr>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #475569;">{meal_type}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: 500;">{food_name}</td>
                    <td style="padding: 10px 12px; border-bottom: 1px solid #f1f5f9; text-align: center; color: #475569;">{qty}</td>
                </tr>
                """

    html += """
            </tbody>
        </table>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #94a3b8; text-align: center;">
            <p>This is an automated message from the Miisky Nutrition Team.</p>
            <p>If you have any questions, please contact your assigned nutritionist.</p>
        </div>
    </div>
    """
    return html


def _weekly_food_email_message(patient_name, plan_name, week_start, week_end, meals):
    lines = [
        f"Hello {patient_name},",
        "",
        f"Here is your food plan for next week ({week_start} to {week_end})",
        f"Plan: {plan_name}",
        "",
    ]

    if not meals:
        lines.extend(
            [
                "No meals are allotted yet for next week.",
                "Please contact your nutritionist/support team if this is unexpected.",
            ]
        )
        return "\n".join(lines)

    current_date = None
    for meal in meals:
        if meal.meal_date != current_date:
            current_date = meal.meal_date
            lines.extend(["", f"{current_date}:"])
        meal_type = meal.meal_type.name if getattr(meal, "meal_type", None) else "Meal"
        food_name = meal.food.name if getattr(meal, "food", None) else "Food to be updated"
        qty = f" ({meal.quantity})" if meal.quantity not in (None, "") else ""
        lines.append(f"- {meal_type}: {food_name}{qty}")

    lines.extend(
        [
            "",
            "Regards,",
            "Miisky Team",
        ]
    )
    return "\n".join(lines)


def run_send_weekly_food_plan_emails():
    """
    Core logic:
    - Find active plans overlapping next week
    - Email each patient with their next week's allotted foods
    """
    today = timezone.localdate()
    week_start, week_end = _next_week_date_range(today)

    plans = (
        UserDietPlan.objects.select_related("user", "diet_plan")
        .filter(
            status="active",
            start_date__lte=week_end,
            end_date__gte=week_start,
            user__isnull=False,
        )
        .exclude(user__email__isnull=True)
        .exclude(user__email="")
    )

    emailed = 0
    failed = 0

    for plan in plans.iterator(chunk_size=200):
        patient = plan.user
        patient_name = _full_name(patient)
        plan_name = plan.diet_plan.title if plan.diet_plan else "Diet Plan"
        meals = list(
            UserMeal.objects.filter(
                user_diet_plan=plan,
                meal_date__range=[week_start, week_end],
            )
            .select_related("meal_type", "food")
            .order_by("meal_date", "meal_type__name", "id")
        )

        subject = f"Your weekly food plan ({week_start} to {week_end})"
        message = _weekly_food_email_message(
            patient_name=patient_name,
            plan_name=plan_name,
            week_start=week_start,
            week_end=week_end,
            meals=meals,
        )
        html_message = _weekly_food_html_message(
            patient_name=patient_name,
            plan_name=plan_name,
            week_start=week_start,
            week_end=week_end,
            meals=meals,
        )

        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=None,
                recipient_list=[patient.email],
                fail_silently=False,
                html_message=html_message,
            )
            emailed += 1
        except Exception:
            failed += 1

    return {
        "week_start": str(week_start),
        "week_end": str(week_end),
        "emails_sent": emailed,
        "emails_failed": failed,
    }


@shared_task
def send_weekly_food_plan_emails():
    """
    Celery task:
    Sends next week's allotted food plan to active-plan patients.
    Intended to run every Sunday via Celery Beat.
    """
    return run_send_weekly_food_plan_emails()


@shared_task
def send_user_credentials_email(user_id, raw_password):
    """
    Sends account credentials (username/password) to a newly registered user.
    """
    try:
        user = UserRegister.objects.get(id=user_id)
        if not user.email:
            return f"User {user_id} has no email."

        full_name = _full_name(user)
        subject = "Your Miisky Account Credentials"
        message = (
            f"Hello {full_name},\n\n"
            f"Your account has been successfully created on the Miisky platform.\n\n"
            f"Here are your login credentials:\n"
            f"Username: {user.username}\n"
            f"Password: {raw_password}\n\n"
            f"Please log in at your earliest convenience and consider changing your password for enhanced security.\n\n"
            f"Regards,\n"
            f"Miisky Team"
        )

        send_mail(
            subject=subject,
            message=message,
            from_email=None,  # Uses DEFAULT_FROM_EMAIL from settings
            recipient_list=[user.email],
            fail_silently=False,
        )
        return f"Credentials email sent to {user.email}"
    except UserRegister.DoesNotExist:
        return f"User {user_id} does not exist."
    except Exception as e:
        return f"Failed to send email: {str(e)}"
