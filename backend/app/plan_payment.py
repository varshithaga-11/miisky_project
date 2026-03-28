"""
Plan payment ledger: split gross patient payment into platform / nutritionist / kitchen pools
and PayoutRecord rows, including mid-plan reassignment via NutritionistReassignment /
MicroKitchenReassignment history.
"""
from __future__ import annotations

from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Optional, Tuple

from django.db import transaction

from .models import (
    MicroKitchenProfile,
    MicroKitchenReassignment,
    NutritionistReassignment,
    PayoutRecord,
    PlanPaymentLedger,
    PlatformPaymentSettings,
    UserDietPlan,
    UserRegister,
)


def _q2(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


def _inclusive_days(d_start, d_end) -> int:
    if not d_start or not d_end or d_end < d_start:
        return 0
    return (d_end - d_start).days + 1


def _intersect_range(
    plan_start, plan_end, seg_start, seg_end
) -> Optional[Tuple]:
    if not plan_start or not plan_end:
        return None
    lo = max(plan_start, seg_start)
    hi = min(plan_end, seg_end)
    if lo <= hi:
        return (lo, hi)
    return None


def get_split_percentages(diet_plan) -> Tuple[Decimal, Decimal, Decimal]:
    """Returns (platform, nutritionist, kitchen) percents summing to 100."""
    defaults = PlatformPaymentSettings.get_solo()
    if diet_plan is None:
        return (
            defaults.default_platform_fee_percent,
            defaults.default_nutritionist_share_percent,
            defaults.default_kitchen_share_percent,
        )
    p = diet_plan.platform_fee_percent
    n = diet_plan.nutritionist_share_percent
    k = diet_plan.kitchen_share_percent
    if p is not None and n is not None and k is not None:
        return (p, n, k)
    return (
        defaults.default_platform_fee_percent,
        defaults.default_nutritionist_share_percent,
        defaults.default_kitchen_share_percent,
    )


def gross_amount_for_user_diet_plan(plan: UserDietPlan) -> Decimal:
    if plan.amount_paid is not None:
        return Decimal(plan.amount_paid)
    if plan.diet_plan:
        return Decimal(plan.diet_plan.final_amount)
    return Decimal("0")


def nutritionist_date_segments(plan: UserDietPlan) -> List[Tuple[int, object, object]]:
    """List of (user_register_id, period_from, period_to) inclusive."""
    sd, ed = plan.start_date, plan.end_date
    if not sd or not ed:
        return []
    rows = list(
        NutritionistReassignment.objects.filter(active_diet_plan=plan).order_by(
            "effective_from", "id"
        )
    )
    if not rows:
        if plan.nutritionist_id:
            return [(plan.nutritionist_id, sd, ed)]
        return []
    out: List[Tuple[int, object, object]] = []
    cursor = sd
    for r in rows:
        eff = r.effective_from or sd
        if eff < sd:
            eff = sd
        prev_end = eff - timedelta(days=1)
        seg = _intersect_range(sd, ed, cursor, prev_end)
        if seg and r.previous_nutritionist_id:
            lo, hi = seg
            out.append((r.previous_nutritionist_id, lo, hi))
        cursor = eff
    if cursor <= ed and plan.nutritionist_id:
        out.append((plan.nutritionist_id, cursor, ed))
    return out


def kitchen_date_segments(plan: UserDietPlan) -> List[Tuple[int, object, object]]:
    """List of (micro_kitchen_profile_id, period_from, period_to) inclusive."""
    sd, ed = plan.start_date, plan.end_date
    if not sd or not ed:
        return []
    rows = list(
        MicroKitchenReassignment.objects.filter(user_diet_plan=plan).order_by(
            "effective_from", "id"
        )
    )
    if not rows:
        if plan.micro_kitchen_id:
            return [(plan.micro_kitchen_id, sd, ed)]
        return []
    out: List[Tuple[int, object, object]] = []
    cursor = sd
    for r in rows:
        eff = r.effective_from
        if eff < sd:
            eff = sd
        prev_end = eff - timedelta(days=1)
        seg = _intersect_range(sd, ed, cursor, prev_end)
        if seg and r.previous_kitchen_id:
            lo, hi = seg
            out.append((r.previous_kitchen_id, lo, hi))
        cursor = eff
    if cursor <= ed and plan.micro_kitchen_id:
        out.append((plan.micro_kitchen_id, cursor, ed))
    return out


def _allocate_pool(pool: Decimal, day_weights: List[int]) -> List[Decimal]:
    total = sum(day_weights)
    if total <= 0 or pool <= 0:
        return [_q2(Decimal("0")) for _ in day_weights]
    raw: List[Decimal] = []
    for w in day_weights:
        raw.append(pool * Decimal(w) / Decimal(total))
    rounded = [_q2(x) for x in raw]
    diff = pool - sum(rounded, start=Decimal("0"))
    if diff != 0 and rounded:
        rounded[-1] = _q2(rounded[-1] + diff)
    return rounded


def refresh_ledger_payouts_if_exists(plan: Optional[UserDietPlan]) -> None:
    if not plan:
        return
    led = PlanPaymentLedger.objects.filter(user_diet_plan=plan).first()
    if led:
        sync_payout_records(led)


@transaction.atomic
def ensure_plan_payment_ledger(plan: UserDietPlan) -> Optional[PlanPaymentLedger]:
    """
    Create ledger on first payment verification and build payout rows.
    Idempotent if ledger already exists (re-syncs nutritionist/kitchen pending rows).
    """
    if not plan.start_date or not plan.end_date:
        return None
    existing = PlanPaymentLedger.objects.filter(user_diet_plan=plan).first()
    if existing:
        sync_payout_records(existing)
        return existing

    gross = gross_amount_for_user_diet_plan(plan)
    p_pct, n_pct, k_pct = get_split_percentages(plan.diet_plan)
    platform_amt = _q2(gross * p_pct / Decimal("100"))
    nutritionist_pool = _q2(gross * n_pct / Decimal("100"))
    kitchen_pool = _q2(gross * k_pct / Decimal("100"))
    # Fix penny drift vs gross
    drift = gross - _q2(platform_amt + nutritionist_pool + kitchen_pool)
    if drift != 0:
        platform_amt = _q2(platform_amt + drift)

    ledger = PlanPaymentLedger.objects.create(
        user_diet_plan=plan,
        gross_amount=_q2(gross),
        platform_fee_percent=p_pct,
        nutritionist_share_percent=n_pct,
        kitchen_share_percent=k_pct,
        platform_fee_amount=platform_amt,
        nutritionist_pool_amount=nutritionist_pool,
        kitchen_pool_amount=kitchen_pool,
        status=PlanPaymentLedger.STATUS_PENDING,
    )
    sync_payout_records(ledger)
    return ledger


@transaction.atomic
def sync_payout_records(ledger: PlanPaymentLedger) -> None:
    plan = ledger.user_diet_plan
    sd, ed = plan.start_date, plan.end_date
    if not sd or not ed:
        return

    # Platform: single row, create if missing; only adjust when still pending
    platform_row = PayoutRecord.objects.filter(
        ledger=ledger, recipient_role=PayoutRecord.ROLE_PLATFORM
    ).first()
    if not platform_row:
        PayoutRecord.objects.create(
            ledger=ledger,
            recipient_role=PayoutRecord.ROLE_PLATFORM,
            nutritionist=None,
            micro_kitchen=None,
            amount=ledger.platform_fee_amount,
            period_from=sd,
            period_to=ed,
            reason=PayoutRecord.REASON_INITIAL,
            status=PayoutRecord.STATUS_PENDING,
        )
    elif platform_row.status == PayoutRecord.STATUS_PENDING:
        platform_row.amount = ledger.platform_fee_amount
        platform_row.period_from = sd
        platform_row.period_to = ed
        platform_row.save(update_fields=["amount", "period_from", "period_to"])

    PayoutRecord.objects.filter(
        ledger=ledger,
        status=PayoutRecord.STATUS_PENDING,
        recipient_role__in=(
            PayoutRecord.ROLE_NUTRITIONIST,
            PayoutRecord.ROLE_KITCHEN,
        ),
    ).delete()

    total_days = _inclusive_days(sd, ed)
    if total_days <= 0:
        total_days = 1

    n_segments = nutritionist_date_segments(plan)
    n_weights = [_inclusive_days(a, b) for _, a, b in n_segments]
    n_amounts = _allocate_pool(ledger.nutritionist_pool_amount, n_weights)
    for i, (nid, pf, pt) in enumerate(n_segments):
        amt = n_amounts[i] if i < len(n_amounts) else Decimal("0")
        if amt <= 0:
            continue
        user = UserRegister.objects.filter(pk=nid).first()
        if not user:
            continue
        PayoutRecord.objects.create(
            ledger=ledger,
            recipient_role=PayoutRecord.ROLE_NUTRITIONIST,
            nutritionist=user,
            micro_kitchen=None,
            amount=amt,
            period_from=pf,
            period_to=pt,
            reason=(
                PayoutRecord.REASON_REASSIGNMENT_SPLIT
                if len(n_segments) > 1
                else PayoutRecord.REASON_INITIAL
            ),
            status=PayoutRecord.STATUS_PENDING,
        )

    k_segments = kitchen_date_segments(plan)
    k_weights = [_inclusive_days(a, b) for _, a, b in k_segments]
    k_amounts = _allocate_pool(ledger.kitchen_pool_amount, k_weights)
    for i, (kid, pf, pt) in enumerate(k_segments):
        amt = k_amounts[i] if i < len(k_amounts) else Decimal("0")
        if amt <= 0:
            continue
        mk = MicroKitchenProfile.objects.filter(pk=kid).first()
        if not mk:
            continue
        PayoutRecord.objects.create(
            ledger=ledger,
            recipient_role=PayoutRecord.ROLE_KITCHEN,
            nutritionist=None,
            micro_kitchen=mk,
            amount=amt,
            period_from=pf,
            period_to=pt,
            reason=(
                PayoutRecord.REASON_REASSIGNMENT_SPLIT
                if len(k_segments) > 1
                else PayoutRecord.REASON_INITIAL
            ),
            status=PayoutRecord.STATUS_PENDING,
        )
