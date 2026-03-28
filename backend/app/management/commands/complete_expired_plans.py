from django.core.management.base import BaseCommand

from app.tasks import run_complete_expired_plans


class Command(BaseCommand):
    help = (
        "1) Sends email alerts for plans expiring in 3 days and tomorrow to admin + nutritionist; "
        "2) marks expired active plans as completed; "
        "3) creates in-app notifications to admins and the assigned nutritionist when a plan is completed."
    )

    def handle(self, *args, **options):
        result = run_complete_expired_plans()
        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Expiry+3days notified: {result['expiry_3days_notified']}, "
                f"expiry+tomorrow notified: {result['expiry_tomorrow_notified']}, "
                f"expired plans completed: {result['expired_plans_completed']}, "
                f"in-app plan-completed notifications: {result['plan_completed_in_app_notifications']}"
            )
        )
