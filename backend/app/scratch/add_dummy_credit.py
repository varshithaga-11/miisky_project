import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from app.models import UserDietPlan, PlanWalletCredit, BillingConfig, UserRegister

def add_dummy_credit():
    try:
        plan_id = 24
        patient_id = 3
        amount = 1000.00
        
        plan = UserDietPlan.objects.get(id=plan_id)
        patient = UserRegister.objects.get(id=patient_id)
        billing_config = BillingConfig.objects.get(user_diet_plan=plan)
        
        credit = PlanWalletCredit.objects.create(
            user_diet_plan=plan,
            billing_config=billing_config,
            credit_type='mid_plan_topup',
            amount=amount,
            status='captured',
            created_by=patient, # Marking as if patient added it
            notes='Dummy credit added for testing.'
        )
        
        print(f"Successfully added {amount} credit to Plan {plan_id} for Patient {patient_id}.")
        print(f"Credit ID: {credit.id}")
        
    except UserDietPlan.DoesNotExist:
        print(f"Plan {plan_id} does not exist.")
    except UserRegister.DoesNotExist:
        print(f"User {patient_id} does not exist.")
    except BillingConfig.DoesNotExist:
        print(f"BillingConfig for Plan {plan_id} does not exist.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    add_dummy_credit()
