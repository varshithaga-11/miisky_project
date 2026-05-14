"""
Utilities for billing and invoice generation.
"""
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from .models import DailyMealBillingSummary, BillingCycleInvoice, UserDietPlanExtraCharge

@transaction.atomic
def generate_invoice(user_diet_plan, period_from, period_to):
    """
    Sums daily billing summaries for a given period and generates an invoice.
    Links the summaries to the invoice for auditability.
    """
    summaries = DailyMealBillingSummary.objects.filter(
        user_diet_plan=user_diet_plan,
        summary_date__range=(period_from, period_to),
        billing_invoice__isnull=True, # Only include un-invoiced summaries
    )

    if not summaries.exists():
        return None

    total_food = summaries.aggregate(
        t=Sum("total_meal_amount")
    )["t"] or Decimal("0.00")

    # Extra charges linked to the plan
    extra = UserDietPlanExtraCharge.objects.filter(
        user_diet_plan=user_diet_plan,
    ).aggregate(t=Sum("amount"))["t"] or Decimal("0.00")

    invoice = BillingCycleInvoice.objects.create(
        user_diet_plan=user_diet_plan,
        user=user_diet_plan.user,
        period_from=period_from,
        period_to=period_to,
        total_food_amount=total_food,
        total_extra_charges=extra,
        grand_total=total_food + extra,
        status="sent" # Default to sent for now
    )

    # Link daily summaries to this invoice
    summaries.update(billing_invoice=invoice)

    return invoice
