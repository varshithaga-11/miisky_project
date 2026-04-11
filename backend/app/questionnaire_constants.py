"""
Allowlists for comma-separated CharField questionnaire answers.
Normalized storage: lowercase snake_case tokens, comma-separated, no spaces around commas in DB optional.
"""

from rest_framework.serializers import ValidationError

MEAL_SLOT_KEYS = frozenset(
    (
        "early_morning",
        "breakfast",
        "mid_morning",
        "lunch",
        "evening_snacks",
        "dinner",
        "none",
    )
)

PHYSICAL_ACTIVITY_KEYS = frozenset(
    (
        "walking",
        "jogging_running",
        "gym_strength",
        "yoga",
        "cycling",
        "swimming",
        "aerobics_zumba",
        "sports",
        "home_workout",
        "other",
    )
)

LIFESTYLE_HABIT_KEYS = frozenset(
    (
        "smoking",
        "alcohol",
        "tobacco_pan",
        "excess_tea_coffee",
        "skipping_meals",
        "junk_food",
        "none",
        "other",
    )
)


def normalize_comma_keys(value, allowlist: frozenset) -> str:
    """Split, strip, validate tokens; return comma-separated unique keys in stable sorted order."""
    if value is None or value == "":
        return ""
    if not isinstance(value, str):
        value = str(value)
    parts = [p.strip().lower().replace(" ", "_") for p in value.split(",") if p.strip()]
    bad = [p for p in parts if p not in allowlist]
    if bad:
        raise ValidationError(
            f"Invalid keys: {', '.join(bad)}. Allowed: {', '.join(sorted(allowlist))}"
        )
    uniq = []
    seen = set()
    for p in parts:
        if p not in seen:
            seen.add(p)
            uniq.append(p)
    return ",".join(uniq)
