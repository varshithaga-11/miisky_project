import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from app.models import UserRegister, UserNutritionistMapping

def create_dummy_patients():
    try:
        nutritionist = UserRegister.objects.get(username="varshithaganutrition1", role='nutritionist')
    except UserRegister.DoesNotExist:
        print("Nutritionist 'varshithaganutrition1' not found. Creating it first...")
        nutritionist = UserRegister.objects.create(
            username="varshithaganutrition1",
            email="varshithaganutrition1@example.com",
            role='nutritionist',
            first_name="Varshitha",
            last_name="Nutritionist"
        )
        nutritionist.set_password("password123")
        nutritionist.save()

    print(f"Using Nutritionist: {nutritionist.username}")

    # Create 12 dummy patients for testing pagination (5 per page -> page 1, 2, 3)
    for i in range(1, 13):
        patient_username = f"dummypatient{i}"
        patient, created = UserRegister.objects.get_or_create(
            username=patient_username,
            defaults={
                'email': f"{patient_username}@example.com",
                'role': 'patient',
                'first_name': f"Dummy",
                'last_name': f"Patient {i}"
            }
        )
        if created:
            patient.set_password("password123")
            patient.save()
            print(f"Created patient: {patient_username}")
        else:
            print(f"Patient {patient_username} already exists")

        # Map patient to nutritionist
        mapping, m_created = UserNutritionistMapping.objects.get_or_create(
            user=patient,
            defaults={
                'nutritionist': nutritionist,
                'is_active': True
            }
        )
        if not m_created:
            if mapping.nutritionist != nutritionist:
                mapping.nutritionist = nutritionist
                mapping.is_active = True
                mapping.save()
                print(f"Updated mapping for {patient_username}")
            else:
                if not mapping.is_active:
                    mapping.is_active = True
                    mapping.save()
                    print(f"Activated mapping for {patient_username}")

    print("Successfully created/updated 12 dummy patients and mapped them to the nutritionist.")

if __name__ == '__main__':
    create_dummy_patients()
