"""
Sync UserRegister ↔ health-related junction tables from questionnaire API payloads.
Accepts legacy-style string lists and structured health-condition dicts.
"""

from datetime import date, datetime

from django.db import transaction

from .models import (
    ActivityMaster,
    AutoimmuneMaster,
    DeficiencyMaster,
    DigestiveIssueMaster,
    HabitMaster,
    HealthConditionMaster,
    SkinIssueMaster,
    SymptomMaster,
    UserAutoimmune,
    UserDeficiency,
    UserDigestiveIssue,
    UserHabit,
    UserHealthCondition,
    UserPhysicalActivity,
    UserRegister,
    UserSkinIssue,
    UserSymptom,
)


def _norm_name(s):
    return (s or "").strip()


def _is_placeholder_name(name: str) -> bool:
    """Skip storing literal 'None', 'N/A', etc. as master rows."""
    if not name:
        return True
    low = name.strip().lower()
    return low in ("none", "n/a", "na", "nil", "-", "no", "nothing")


def _parse_date(val):
    if val is None or val == "":
        return None
    if isinstance(val, date):
        return val
    if isinstance(val, datetime):
        return val.date()
    if isinstance(val, str):
        try:
            return date.fromisoformat(val[:10])
        except ValueError:
            return None
    return None


def _safe_int(val):
    if val is None or val == "":
        return None
    try:
        return int(val)
    except (TypeError, ValueError):
        return None


def _truncate255(s):
    s = _norm_name(s)
    if not s:
        return None
    return s[:255] if len(s) > 255 else s


def _sync_user_habits(user: UserRegister, items):
    """Sync UserHabit from list of master ids (int) or dicts with id + optional other_text, frequency, since_when, comments."""
    UserHabit.objects.filter(user=user).delete()
    if not items:
        return
    for raw in items:
        if isinstance(raw, int):
            try:
                h = HabitMaster.objects.get(pk=raw)
            except HabitMaster.DoesNotExist:
                continue
            UserHabit.objects.create(user=user, habit=h)
            continue
        if isinstance(raw, str):
            name = _norm_name(raw)
            if _is_placeholder_name(name):
                continue
            h, _ = HabitMaster.objects.get_or_create(name=name)
            UserHabit.objects.create(user=user, habit=h)
            continue
        if not isinstance(raw, dict):
            continue
        hid = raw.get("habit_id") or raw.get("id")
        if hid is None:
            continue
        try:
            h = HabitMaster.objects.get(pk=int(hid))
        except (HabitMaster.DoesNotExist, TypeError, ValueError):
            continue
        cm = raw.get("comments")
        if isinstance(cm, str):
            cm = cm.strip() or None
        else:
            cm = None
        UserHabit.objects.create(
            user=user,
            habit=h,
            other_text=_truncate255(raw.get("other_text")),
            frequency=_safe_int(raw.get("frequency")),
            since_when=_parse_date(raw.get("since_when")),
            comments=cm,
        )


def _sync_user_physical_activities(user: UserRegister, items):
    """Sync UserPhysicalActivity from list of master ids or dicts with id + optional other_text, frequency, duration_minutes."""
    UserPhysicalActivity.objects.filter(user=user).delete()
    if not items:
        return
    for raw in items:
        if isinstance(raw, int):
            try:
                a = ActivityMaster.objects.get(pk=raw)
            except ActivityMaster.DoesNotExist:
                continue
            UserPhysicalActivity.objects.create(user=user, activity=a)
            continue
        if isinstance(raw, str):
            name = _norm_name(raw)
            if _is_placeholder_name(name):
                continue
            a, _ = ActivityMaster.objects.get_or_create(name=name)
            UserPhysicalActivity.objects.create(user=user, activity=a)
            continue
        if not isinstance(raw, dict):
            continue
        aid = raw.get("activity_id") or raw.get("id")
        if aid is None:
            continue
        try:
            a = ActivityMaster.objects.get(pk=int(aid))
        except (ActivityMaster.DoesNotExist, TypeError, ValueError):
            continue
        UserPhysicalActivity.objects.create(
            user=user,
            activity=a,
            other_text=_truncate255(raw.get("other_text")),
            frequency=_safe_int(raw.get("frequency")),
            duration_minutes=_safe_int(raw.get("duration_minutes")),
        )


def _sync_health_conditions(user: UserRegister, items):
    UserHealthCondition.objects.filter(user=user).delete()
    if not items:
        return
    for raw in items:
        if isinstance(raw, str):
            name = _norm_name(raw)
            if _is_placeholder_name(name):
                continue
            cond, _ = HealthConditionMaster.objects.get_or_create(
                name=name,
                defaults={"category": "other"},
            )
            UserHealthCondition.objects.create(
                user=user, condition=cond, has_condition=True
            )
            continue
        if not isinstance(raw, dict):
            continue
        cid = raw.get("condition_id")
        has_flag = raw.get("has_condition", True)
        since = _parse_date(raw.get("since_when"))
        comments = raw.get("comments") or None
        if cid:
            try:
                cond = HealthConditionMaster.objects.get(pk=int(cid))
            except (HealthConditionMaster.DoesNotExist, TypeError, ValueError):
                continue
            UserHealthCondition.objects.create(
                user=user,
                condition=cond,
                has_condition=bool(has_flag),
                since_when=since,
                comments=comments,
            )
            continue
        name = _norm_name(raw.get("name"))
        if _is_placeholder_name(name):
            continue
        cat = raw.get("category") or "other"
        if cat not in dict(HealthConditionMaster.CATEGORY_CHOICES):
            cat = "other"
        cond, _ = HealthConditionMaster.objects.get_or_create(
            name=name,
            defaults={"category": cat},
        )
        UserHealthCondition.objects.create(
            user=user,
            condition=cond,
            has_condition=bool(raw.get("has_condition", True)),
            since_when=since,
            comments=comments,
        )


def _sync_name_m2m(user, items, MasterModel, UserModel, fk_field: str):
    UserModel.objects.filter(user=user).delete()
    if not items:
        return
    for raw in items:
        if isinstance(raw, int):
            try:
                m = MasterModel.objects.get(pk=raw)
            except MasterModel.DoesNotExist:
                continue
            UserModel.objects.create(user=user, **{fk_field: m})
            continue
        if isinstance(raw, str):
            name = _norm_name(raw)
            if _is_placeholder_name(name):
                continue
            m, _ = MasterModel.objects.get_or_create(name=name)
            UserModel.objects.create(user=user, **{fk_field: m})
            continue
        if isinstance(raw, dict):
            rid = raw.get("id")
            if rid is not None:
                try:
                    m = MasterModel.objects.get(pk=int(rid))
                except (MasterModel.DoesNotExist, TypeError, ValueError):
                    continue
                UserModel.objects.create(user=user, **{fk_field: m})
                continue
            name = _norm_name(raw.get("name"))
            if _is_placeholder_name(name):
                continue
            m, _ = MasterModel.objects.get_or_create(name=name)
            UserModel.objects.create(user=user, **{fk_field: m})


def sync_user_questionnaire_relations(user: UserRegister, payload: dict):
    """
    Only keys present in payload are updated; omitted keys leave existing rows unchanged.
    """
    if not user or not user.pk:
        return
    with transaction.atomic():
        if "health_conditions" in payload:
            _sync_health_conditions(user, payload.get("health_conditions"))
        if "symptoms" in payload:
            _sync_name_m2m(
                user, payload.get("symptoms"), SymptomMaster, UserSymptom, "symptom"
            )
        if "deficiencies" in payload:
            _sync_name_m2m(
                user,
                payload.get("deficiencies"),
                DeficiencyMaster,
                UserDeficiency,
                "deficiency",
            )
        if "autoimmune_diseases" in payload:
            _sync_name_m2m(
                user,
                payload.get("autoimmune_diseases"),
                AutoimmuneMaster,
                UserAutoimmune,
                "disease",
            )
        if "digestive_issues" in payload:
            _sync_name_m2m(
                user,
                payload.get("digestive_issues"),
                DigestiveIssueMaster,
                UserDigestiveIssue,
                "issue",
            )
        if "skin_issues" in payload:
            _sync_name_m2m(
                user,
                payload.get("skin_issues"),
                SkinIssueMaster,
                UserSkinIssue,
                "skin_issue",
            )
        if "habits" in payload:
            _sync_user_habits(user, payload.get("habits"))
        if "physical_activities" in payload:
            _sync_user_physical_activities(user, payload.get("physical_activities"))
