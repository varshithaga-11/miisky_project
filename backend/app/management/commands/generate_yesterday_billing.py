from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from app.billing_utils import calculate_daily_billing_for_date

class Command(BaseCommand):
    help = "Fetches today's date and generates/raises invoices for yesterday's meals."

    def handle(self, *args, **options):
        # Fetch today's date
        today = timezone.now().date()
        # Calculate yesterday's date
        yesterday = today - timedelta(days=1)

        self.stdout.write(f"Today is {today}. Generating billing for yesterday: {yesterday}...")

        results = calculate_daily_billing_for_date(yesterday)

        if results:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully generated/updated billing for {len(results)} plans for {yesterday}."
                )
            )
            for res in results:
                self.stdout.write(f" - {res}")
        else:
            self.stdout.write(self.style.WARNING(f"No active plans or meals found for {yesterday}."))
