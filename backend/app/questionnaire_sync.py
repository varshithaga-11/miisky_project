"""
Sync UserRegister ↔ health-related junction tables from questionnaire API payloads.
Accepts legacy-style string lists and structured health-condition dicts.
"""

from datetime import date, datetime

from django.db import transaction

from .models import (
    AutoimmuneMaster,
    DeficiencyMaster,
    DigestiveIssueMaster,
    HealthConditionMaster,
    SymptomMaster,
    UserAutoimmune,
    UserDeficiency,
    UserDigestiveIssue,
    UserHealthCondition,
    UserRegister,
    UserSymptom,
)


def _norm_name(s):
    return (s or "").strip()


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


def _sync_health_conditions(user: UserRegister, items):
    UserHealthCondition.objects.filter(user=user).delete()
    if not items:
        return
    for raw in items:
        if isinstance(raw, str):
            name = _norm_name(raw)
            if not name:
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
        if not name:
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
            if not name:
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
            if not name:
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
