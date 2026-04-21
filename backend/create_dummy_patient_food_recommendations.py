import os
import random
import sys

import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from app.models import (
    FoodName,
    MealType,
    PatientFoodRecommendation,
    UserNutritionistMapping,
    UserRegister,
)


PATIENT_USERNAME = "varshithagapatient1"

QUANTITIES = [
    "1 bowl",
    "2 bowls",
    "1 cup",
    "1 plate",
    "2 slices",
    "100g",
    "150g",
    "200g",
]

NOTES = [
    "Prefer fresh preparation.",
    "Avoid extra oil and spice.",
    "Use minimal salt.",
    "Can be paired with salad.",
    "Best taken warm.",
    "Hydrate well alongside this.",
    "Adjust portion based on hunger.",
    "Choose steamed or grilled variant when possible.",
]

COMMENTS = [
    "Suggested for your current meal plan.",
    "Good option for balanced nutrition.",
    "Keep this in your weekly rotation.",
    "Easy to digest and practical.",
    "Try this 2-3 times this week.",
    "Use as an alternative to heavier options.",
    "Fits your ongoing diet goals.",
    "Can be included during active plan days.",
]


def pick_recommending_nutritionist(patient: UserRegister) -> UserRegister | None:
    active_mapping = (
        UserNutritionistMapping.objects.select_related("nutritionist")
        .filter(user=patient, is_active=True, nutritionist__role="nutritionist")
        .first()
    )
    if active_mapping and active_mapping.nutritionist:
        return active_mapping.nutritionist

    return UserRegister.objects.filter(role="nutritionist").order_by("id").first()


def build_food_sequence(all_foods: list[FoodName], target_count: int) -> list[FoodName]:
    if not all_foods:
        return []

    shuffled = all_foods[:]
    random.shuffle(shuffled)

    if len(shuffled) >= target_count:
        return shuffled[:target_count]

    selected = shuffled[:]
    while len(selected) < target_count:
        selected.append(random.choice(all_foods))
    return selected


def create_dummy_recommendations() -> None:
    try:
        patient = UserRegister.objects.get(username=PATIENT_USERNAME, role="patient")
    except UserRegister.DoesNotExist:
        print(
            f"Patient '{PATIENT_USERNAME}' with role='patient' not found. "
            "Please create this user first."
        )
        return

    nutritionist = pick_recommending_nutritionist(patient)
    if not nutritionist:
        print("No nutritionist user found. Please create at least one nutritionist first.")
        return

    foods = list(FoodName.objects.order_by("id"))
    if not foods:
        print("No FoodName records found. Please create/import food names first.")
        return

    meal_types = list(MealType.objects.order_by("id"))
    target_count = random.randint(10, 15)
    selected_foods = build_food_sequence(foods, target_count)

    print(
        f"Creating {target_count} food suggestions for patient '{patient.username}' "
        f"using nutritionist '{nutritionist.username}'..."
    )

    created = 0
    for idx, food in enumerate(selected_foods, start=1):
        meal_type = random.choice(meal_types) if meal_types else None
        recommendation = PatientFoodRecommendation.objects.create(
            patient=patient,
            food=food,
            quantity=random.choice(QUANTITIES),
            meal_time=meal_type,
            notes=NOTES[(idx - 1) % len(NOTES)],
            comment=COMMENTS[(idx - 1) % len(COMMENTS)],
            recommended_by=nutritionist,
        )
        created += 1
        print(
            f"{idx:02d}. Added recommendation #{recommendation.id} "
            f"- food='{food.name}'"
            + (f", meal='{meal_type.name}'" if meal_type else "")
        )

    total_for_patient = PatientFoodRecommendation.objects.filter(patient=patient).count()
    print(
        f"Done. Created {created} new recommendation(s). "
        f"Patient '{patient.username}' now has {total_for_patient} total recommendation(s)."
    )


if __name__ == "__main__":
    create_dummy_recommendations()
