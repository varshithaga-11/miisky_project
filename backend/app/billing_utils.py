"""
Utilities for billing and invoice generation.
"""
from decimal import Decimal
from django.db import transaction
from django.db.models import Sum
from django.utils.timezone import now
from .models import DailyMealBillingSummary, BillingCycleInvoice, UserDietPlanExtraCharge

@transaction.atomic
def get_or_create_active_invoice(user_diet_plan):
    """
    Finds or creates a 'draft' invoice for the current plan.
    Currently, we assume one invoice per plan for simplicity, 
    but this can be expanded to support multiple cycles.
    """
    invoice = BillingCycleInvoice.objects.filter(
        user_diet_plan=user_diet_plan,
        status="draft"
    ).first()

    if not invoice:
        # If no draft exists, create one covering the whole plan period
        invoice = BillingCycleInvoice.objects.create(
            user_diet_plan=user_diet_plan,
            user=user_diet_plan.user,
            period_from=user_diet_plan.start_date or now().date(),
            period_to=user_diet_plan.end_date or now().date(),
            status="draft"
        )
    return invoice

@transaction.atomic
def update_invoice_totals(invoice):
    """
    Recalculates the totals for a specific invoice based on linked
    daily summaries and extra charges.
    """
    # 1. Sum up Daily Summaries (Food)
    # We find summaries that are either already linked to this invoice 
    # OR fall within the date range and are not linked to ANY invoice yet.
    summaries = DailyMealBillingSummary.objects.filter(
        user_diet_plan=invoice.user_diet_plan,
        summary_date__range=(invoice.period_from, invoice.period_to)
    ).filter(billing_invoice__isnull=True) | DailyMealBillingSummary.objects.filter(billing_invoice=invoice)

    # Link unlinked summaries to this invoice
    summaries.update(billing_invoice=invoice)

    total_food = summaries.aggregate(t=Sum("total_meal_amount"))["t"] or Decimal("0.00")

    # 2. Sum up Extra Charges
    # Similar logic: find charges linked to plan and this invoice period
    extra_qs = UserDietPlanExtraCharge.objects.filter(
        user_diet_plan=invoice.user_diet_plan,
        created_at__date__range=(invoice.period_from, invoice.period_to)
    ).filter(billing_invoice__isnull=True) | UserDietPlanExtraCharge.objects.filter(billing_invoice=invoice)

    # Link unlinked charges
    extra_qs.update(billing_invoice=invoice)

    total_extra = extra_qs.aggregate(t=Sum("amount"))["t"] or Decimal("0.00")

    # 3. Update Invoice
    invoice.total_food_amount = total_food
    invoice.total_extra_charges = total_extra
    invoice.grand_total = total_food + total_extra
    invoice.save()

    return invoice

def generate_invoice(user_diet_plan, period_from, period_to):
    """
    Legacy helper for manual generation.
    """
    invoice = BillingCycleInvoice.objects.create(
        user_diet_plan=user_diet_plan,
        user=user_diet_plan.user,
        period_from=period_from,
        period_to=period_to,
        status="sent"
    )
    update_invoice_totals(invoice)
    return invoice

def calculate_daily_billing_for_date(target_date):
    """
    Core logic to calculate billing for a specific date.
    Fetches UserMeals for active plans on target_date,
    sums meal_price, stores in DailyMealBillingSummary,
    and updates the corresponding draft invoice.
    """
    from .models import DailyMealBillingSummary, UserDietPlan, UserMeal
    from django.db.models import Sum

    # Get all active plans for target_date
    active_plans = UserDietPlan.objects.filter(
        status="active",
        start_date__lte=target_date,
        end_date__gte=target_date,
    ).select_related("user")

    results = []
    for plan in active_plans:
        # Fetch target_date's meals for this plan
        meals = UserMeal.objects.filter(
            user_diet_plan=plan,
            meal_date=target_date,
            status__in=["scheduled", "prepared", "delivered"],
        ).select_related("meal_type", "food")

        if not meals.exists():
            continue

        total = meals.aggregate(
            t=Sum("meal_price")
        )["t"] or Decimal("0.00")

        # Build breakdown for audit
        breakdown = [
            {
                "meal_type": m.meal_type.name if m.meal_type else None,
                "food":      m.food.name if m.food else None,
                "price":     str(m.meal_price or 0),
            }
            for m in meals
        ]

        # Store — one row per plan per day
        summary, created = DailyMealBillingSummary.objects.update_or_create(
            user_diet_plan=plan,
            summary_date=target_date,
            defaults={
                "user":               plan.user,
                "total_meal_amount":  total,
                "total_meals_count":  meals.count(),
                "meal_breakdown":     breakdown,
            }
        )

        # Automatically update or create a draft invoice for this plan
        invoice = get_or_create_active_invoice(plan)
        update_invoice_totals(invoice)
        
        results.append(f"{plan.pk}: {total}")
    
    return results
