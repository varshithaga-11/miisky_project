"""
Plan payment: PlanPaymentSnapshot (frozen at verify) + PayoutTracker (per recipient / period)
+ PayoutTransaction (real transfers). Reassignment closes unpaid trackers and opens new rows.
"""
from __future__ import annotations

import logging
from datetime import timedelta
from decimal import Decimal
from typing import List, Optional, Tuple

from django.db import transaction
from django.utils import timezone

from .models import (
    MicroKitchenProfile,
    MicroKitchenReassignment,
    NutritionistReassignment,
    PayoutTracker,
    PlanPaymentSnapshot,
    UserDietPlan,
    UserRegister,
)

logger = logging.getLogger(__name__)

# Default split of gross when DietPlans has no per-plan override (must sum to 100).
DEFAULT_PLATFORM_PCT = Decimal("15")
DEFAULT_NUTRITION_PCT = Decimal("15")
DEFAULT_KITCHEN_PCT = Decimal("60")


def _q2(value: Decimal) -> Decimal:
    return value.quantize(Decimal("0.01"))


def _inclusive_days(d_start, d_end) -> int:
    if not d_start or not d_end or d_end < d_start:
        return 0
    return (d_end - d_start).days + 1


def _intersect_range(plan_start, plan_end, seg_start, seg_end) -> Optional[Tuple]:
    if not plan_start or not plan_end:
        return None
    lo = max(plan_start, seg_start)
    hi = min(plan_end, seg_end)
    if lo <= hi:
        return (lo, hi)
    return None


def get_split_percentages(diet_plan) -> Tuple[Decimal, Decimal, Decimal]:
    if diet_plan is None:
        return (DEFAULT_PLATFORM_PCT, DEFAULT_NUTRITION_PCT, DEFAULT_KITCHEN_PCT)
    p = diet_plan.platform_fee_percent
    n = diet_plan.nutritionist_share_percent
    k = diet_plan.kitchen_share_percent
    if p is not None and n is not None and k is not None:
        return (p, n, k)
    return (DEFAULT_PLATFORM_PCT, DEFAULT_NUTRITION_PCT, DEFAULT_KITCHEN_PCT)


def gross_amount_for_user_diet_plan(plan: UserDietPlan) -> Decimal:
    if plan.amount_paid is not None:
        return Decimal(plan.amount_paid)
    if plan.diet_plan:
        return Decimal(plan.diet_plan.final_amount)
    return Decimal("0")


def nutritionist_date_segments(plan: UserDietPlan) -> List[Tuple[int, object, object]]:
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
    rounded = []
    for w in day_weights:
        rounded.append(_q2(pool * Decimal(w) / Decimal(total)))
    diff = pool - sum(rounded, start=Decimal("0"))
    if diff != 0 and rounded:
        rounded[-1] = _q2(rounded[-1] + diff)
    return rounded


def _has_blocking_partial_payouts(snapshot: PlanPaymentSnapshot) -> bool:
    return PayoutTracker.objects.filter(
        snapshot=snapshot,
        payout_type__in=(
            PayoutTracker.PAYOUT_TYPE_NUTRITIONIST,
            PayoutTracker.PAYOUT_TYPE_KITCHEN,
        ),
        is_closed=False,
        paid_amount__gt=0,
    ).exists()


@transaction.atomic
def sync_payout_trackers(snapshot: PlanPaymentSnapshot) -> None:
    plan = snapshot.user_diet_plan
    sd, ed = plan.start_date, plan.end_date
    if not sd or not ed:
        return

    block_nk = _has_blocking_partial_payouts(snapshot)

    # Platform: single open tracker; update while nothing paid
    plat = PayoutTracker.objects.filter(
        snapshot=snapshot,
        payout_type=PayoutTracker.PAYOUT_TYPE_PLATFORM,
        is_closed=False,
    ).first()
    if plat:
        if plat.paid_amount == 0:
            plat.total_amount = snapshot.platform_amount
            plat.period_from = sd
            plat.period_to = ed
            plat.save(update_fields=["total_amount", "period_from", "period_to"])
    else:
        PayoutTracker.objects.create(
            snapshot=snapshot,
            payout_type=PayoutTracker.PAYOUT_TYPE_PLATFORM,
            nutritionist=None,
            micro_kitchen=None,
            total_amount=snapshot.platform_amount,
            paid_amount=Decimal("0"),
            period_from=sd,
            period_to=ed,
            status=PayoutTracker.STATUS_PENDING,
        )

    if block_nk:
        logger.warning(
            "Skipping nutritionist/kitchen tracker resync for snapshot %s: partial payouts exist.",
            snapshot.pk,
        )
        return

    now = timezone.now()
    PayoutTracker.objects.filter(
        snapshot=snapshot,
        payout_type__in=(
            PayoutTracker.PAYOUT_TYPE_NUTRITIONIST,
            PayoutTracker.PAYOUT_TYPE_KITCHEN,
        ),
        is_closed=False,
        paid_amount=0,
    ).update(
        is_closed=True,
        status=PayoutTracker.STATUS_CLOSED,
        closed_reason="Period resync (verify or reassignment)",
        closed_on=now,
    )

    total_days = _inclusive_days(sd, ed)
    if total_days <= 0:
        total_days = 1

    n_segments = nutritionist_date_segments(plan)
    n_weights = [_inclusive_days(a, b) for _, a, b in n_segments]
    n_amounts = _allocate_pool(snapshot.nutrition_amount, n_weights)
    for i, (nid, pf, pt) in enumerate(n_segments):
        amt = n_amounts[i] if i < len(n_amounts) else Decimal("0")
        if amt <= 0:
            continue
        user = UserRegister.objects.filter(pk=nid).first()
        if not user:
            continue
        PayoutTracker.objects.create(
            snapshot=snapshot,
            payout_type=PayoutTracker.PAYOUT_TYPE_NUTRITIONIST,
            nutritionist=user,
            micro_kitchen=None,
            total_amount=amt,
            paid_amount=Decimal("0"),
            period_from=pf,
            period_to=pt,
            status=PayoutTracker.STATUS_PENDING,
        )

    k_segments = kitchen_date_segments(plan)
    k_weights = [_inclusive_days(a, b) for _, a, b in k_segments]
    k_amounts = _allocate_pool(snapshot.kitchen_amount, k_weights)
    for i, (kid, pf, pt) in enumerate(k_segments):
        amt = k_amounts[i] if i < len(k_amounts) else Decimal("0")
        if amt <= 0:
            continue
        mk = MicroKitchenProfile.objects.filter(pk=kid).first()
        if not mk:
            continue
        PayoutTracker.objects.create(
            snapshot=snapshot,
            payout_type=PayoutTracker.PAYOUT_TYPE_KITCHEN,
            nutritionist=None,
            micro_kitchen=mk,
            total_amount=amt,
            paid_amount=Decimal("0"),
            period_from=pf,
            period_to=pt,
            status=PayoutTracker.STATUS_PENDING,
        )


def refresh_payout_trackers_if_exists(plan: Optional[UserDietPlan]) -> None:
    if not plan:
        return
    snap = PlanPaymentSnapshot.objects.filter(user_diet_plan=plan).first()
    if snap:
        sync_payout_trackers(snap)


@transaction.atomic
def ensure_plan_payment_snapshot(plan: UserDietPlan) -> Optional[PlanPaymentSnapshot]:
    if not plan.start_date or not plan.end_date:
        return None
    existing = PlanPaymentSnapshot.objects.filter(user_diet_plan=plan).first()
    if existing:
        sync_payout_trackers(existing)
        return existing

    gross = gross_amount_for_user_diet_plan(plan)
    p_pct, n_pct, k_pct = get_split_percentages(plan.diet_plan)
    platform_amt = _q2(gross * p_pct / Decimal("100"))
    nutrition_amt = _q2(gross * n_pct / Decimal("100"))
    kitchen_amt = _q2(gross - platform_amt - nutrition_amt)

    snap = PlanPaymentSnapshot.objects.create(
        user_diet_plan=plan,
        total_amount=_q2(gross),
        platform_percent=p_pct,
        nutrition_percent=n_pct,
        kitchen_percent=k_pct,
        platform_amount=platform_amt,
        nutrition_amount=nutrition_amt,
        kitchen_amount=kitchen_amt,
    )
    sync_payout_trackers(snap)
    return snap


# Backwards-compatible alias
ensure_plan_payment_ledger = ensure_plan_payment_snapshot
refresh_ledger_payouts_if_exists = refresh_payout_trackers_if_exists
