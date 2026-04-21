import os
import random
import sys

import django
from django.db.models import Avg, Count

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from app.models import MicroKitchenProfile, MicroKitchenRating, UserRegister


REVIEW_TEXTS = [
    "Meals are fresh and delivered on time.",
    "Good quality food and consistent hygiene.",
    "Portions are balanced and taste is great.",
    "Healthy menu options with proper variety.",
    "Packaging is neat and food stays warm.",
    "Great experience and reliable meal service.",
    "Very satisfied with taste and quality.",
    "Kitchen follows instructions very well.",
    "Professional service and good communication.",
    "Food quality improved my daily routine.",
    "Prompt delivery and excellent consistency.",
    "Clean preparation and healthy ingredients.",
    "Overall good service and meal planning.",
    "Affordable, nutritious and tasty meals.",
    "Would recommend this kitchen to others.",
]


def get_or_create_reviewer(index: int) -> UserRegister:
    username = f"dummykitchenreviewer{index}"
    user, created = UserRegister.objects.get_or_create(
        username=username,
        defaults={
            "email": f"{username}@example.com",
            "role": "patient",
            "first_name": "Kitchen",
            "last_name": f"Reviewer {index}",
        },
    )
    if created:
        user.set_password("password123")
        user.save()
        print(f"Created reviewer user: {username}")
    else:
        print(f"Using existing reviewer user: {username}")
    return user


def pick_micro_kitchen() -> MicroKitchenProfile | None:
    kitchen = (
        MicroKitchenProfile.objects.filter(status="approved")
        .order_by("id")
        .first()
    )
    if kitchen:
        return kitchen
    return MicroKitchenProfile.objects.order_by("id").first()


def create_dummy_micro_kitchen_reviews() -> None:
    kitchen = pick_micro_kitchen()
    if not kitchen:
        print("No micro kitchen found. Please create one first.")
        return

    review_count = random.randint(10, 15)
    kitchen_name = kitchen.brand_name or f"Kitchen #{kitchen.id}"
    print(
        f"Selected micro kitchen: {kitchen_name} (ID: {kitchen.id}, status: {kitchen.status})"
    )
    print(f"Preparing {review_count} test review(s)...")

    created_count = 0
    for i in range(1, review_count + 1):
        reviewer = get_or_create_reviewer(i)
        rating_value = random.randint(3, 5)
        review_text = REVIEW_TEXTS[(i - 1) % len(REVIEW_TEXTS)]

        rating_obj, created = MicroKitchenRating.objects.get_or_create(
            user=reviewer,
            micro_kitchen=kitchen,
            order=None,
            defaults={"rating": rating_value, "review": review_text},
        )

        if created:
            created_count += 1
            print(f"Added review from {reviewer.username}: {rating_value} stars")
        else:
            rating_obj.rating = rating_value
            rating_obj.review = review_text
            rating_obj.save(update_fields=["rating", "review"])
            print(f"Updated review from {reviewer.username}: {rating_value} stars")

    stats = MicroKitchenRating.objects.filter(micro_kitchen=kitchen).aggregate(
        avg_rating=Avg("rating"),
        total=Count("id"),
    )
    kitchen.rating = stats["avg_rating"] or 0
    kitchen.total_reviews = stats["total"] or 0
    kitchen.save(update_fields=["rating", "total_reviews"])

    print(
        f"Done. Created {created_count} new review(s). "
        f"Kitchen now has {kitchen.total_reviews} total review(s) "
        f"with avg rating {kitchen.rating:.2f}."
    )
    print(
        "Open PatientSide > List Of Micro Kitchen and click 'User Reviews' "
        f"for kitchen ID {kitchen.id}."
    )


if __name__ == "__main__":
    create_dummy_micro_kitchen_reviews()
