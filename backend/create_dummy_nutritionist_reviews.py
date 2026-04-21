import os
import random
import sys

import django

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from app.models import NutritionistRating, UserNutritionistMapping, UserRegister


REVIEW_TEXTS = [
    "Very supportive and practical diet guidance.",
    "Meal plans are easy to follow and effective.",
    "Responds quickly and explains everything clearly.",
    "Helped me improve my eating habits significantly.",
    "Personalized advice that fits my daily routine.",
    "Clear instructions and realistic nutrition targets.",
    "Professional and consistent follow-up every week.",
    "Great consultation experience and useful tips.",
    "I noticed steady progress with the recommended plan.",
    "Simple meal suggestions with good variety.",
    "Good communication and patient-friendly approach.",
    "Helped me stay accountable with my food choices.",
    "Balanced plans that are affordable and practical.",
    "Positive experience overall and strong guidance.",
    "Knowledgeable nutritionist with a structured approach.",
]


def get_or_create_test_patient(index: int) -> UserRegister:
    username = f"dummyreviewpatient{index}"
    patient, created = UserRegister.objects.get_or_create(
        username=username,
        defaults={
            "email": f"{username}@example.com",
            "role": "patient",
            "first_name": "Review",
            "last_name": f"Patient {index}",
        },
    )

    if created:
        patient.set_password("password123")
        patient.save()
        print(f"Created patient: {username}")
    else:
        print(f"Using existing patient: {username}")

    return patient


def ensure_mapping(patient: UserRegister, nutritionist: UserRegister) -> None:
    mapping, created = UserNutritionistMapping.objects.get_or_create(
        user=patient,
        defaults={"nutritionist": nutritionist, "is_active": True},
    )
    if created:
        return

    changed = False
    if mapping.nutritionist_id != nutritionist.id:
        mapping.nutritionist = nutritionist
        changed = True
    if not mapping.is_active:
        mapping.is_active = True
        changed = True
    if changed:
        mapping.save()


def create_dummy_reviews() -> None:
    nutritionist_username = "varshithaganutrition1"

    try:
        nutritionist = UserRegister.objects.get(
            username=nutritionist_username,
            role="nutritionist",
        )
    except UserRegister.DoesNotExist:
        print(
            f"Nutritionist '{nutritionist_username}' not found. "
            "Please create this nutritionist first."
        )
        return

    review_count = random.randint(10, 15)
    print(
        f"Preparing {review_count} test reviews for nutritionist "
        f"'{nutritionist.username}'..."
    )

    created_count = 0
    for i in range(1, review_count + 1):
        patient = get_or_create_test_patient(i)
        ensure_mapping(patient, nutritionist)

        rating_value = random.randint(3, 5)
        review_text = REVIEW_TEXTS[(i - 1) % len(REVIEW_TEXTS)]

        rating_obj, created = NutritionistRating.objects.get_or_create(
            patient=patient,
            nutritionist=nutritionist,
            diet_plan=None,
            defaults={
                "rating": rating_value,
                "review": review_text,
            },
        )

        if created:
            created_count += 1
            print(
                f"Added review from {patient.username}: "
                f"{rating_value} stars"
            )
        else:
            rating_obj.rating = rating_value
            rating_obj.review = review_text
            rating_obj.save(update_fields=["rating", "review"])
            print(
                f"Updated existing review from {patient.username}: "
                f"{rating_value} stars"
            )

    all_ratings = NutritionistRating.objects.filter(nutritionist=nutritionist)
    total = all_ratings.count()
    average = (
        sum(all_ratings.values_list("rating", flat=True)) / total
        if total
        else 0
    )

    print(
        f"Done. Created {created_count} new reviews. "
        f"Nutritionist now has {total} total review(s) "
        f"with avg rating {average:.2f}."
    )


if __name__ == "__main__":
    create_dummy_reviews()
