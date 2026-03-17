from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings



from django.contrib.auth.models import AbstractUser
from django.db import models



class Country(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateField(blank=True,null=True)



class State(models.Model):
    name = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL,null=True,blank=True)


class City(models.Model):
    name = models.CharField(max_length=150)
    state = models.ForeignKey(State, on_delete=models.SET_NULL,null=True,blank=True)



class UserRegister(AbstractUser):

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('nutritionist_dietician', 'NUTRITIONIST/DIETICIAN'),
        ('patients', 'PATIENTS'),
        ('supply_chain_management', 'SUPPLY CHAIN MANAGEMENT'),
        ('food_buyer', 'FOOD BUYER'),
        ('micro_kitchen', 'MICRO KITCHEN'),
        ('non_patient', 'NON PATIENT'),
    ]

    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        null=True,
        blank=True
    )

    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)

    photo = models.ImageField(upload_to='users/', null=True, blank=True)
    aadhar_card=models.ImageField(upload_to='usersaadharcard/', null=True, blank=True)


    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.ForeignKey(City,on_delete=models.SET_NULL,null=True,blank=True)
    zip_code = models.CharField(max_length=10, null=True, blank=True)

    state = models.ForeignKey(State,on_delete=models.SET_NULL,null=True,blank=True)
    country = models.ForeignKey(Country,on_delete=models.SET_NULL,null=True,blank=True)

    mobile = models.CharField(max_length=15, null=True, blank=True)
    whatsapp = models.CharField(max_length=15, null=True, blank=True)


    dob = models.DateField(null=True, blank=True)

    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]

    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, null=True, blank=True)
    work_expirence = models.TextField(null=True, blank=True)

    # company = models.ForeignKey(
    #     'Company',
    #     on_delete=models.SET_NULL,
    #     null=True,
    #     blank=True
    # )
    
    lattitude = models.CharField(max_length=50, null=True, blank=True)
    longitude = models.CharField(max_length=50, null=True, blank=True)

    vault_no = models.CharField(max_length=100, null=True, blank=True)
    file_name = models.CharField(max_length=255, null=True, blank=True)

    blood_group = models.CharField(max_length=100, null=True, blank=True)
    caste = models.CharField(max_length=100, null=True, blank=True)
    religion = models.CharField(max_length=100, null=True, blank=True)
    community_name=models.CharField(max_length=100,null=True,blank=True)#Brahmin , lingayat
    any_community_information=models.CharField(max_length=200, null=True, blank=True)
    any_description=models.TextField(null=True,blank=True)

    medical_history = models.TextField(null=True, blank=True)

    join_date = models.DateTimeField(null=True, blank=True)

    bank_name = models.CharField(max_length=100, null=True, blank=True)
    acc_no = models.CharField(max_length=20, null=True, blank=True)
    branch_name = models.CharField(max_length=100, null=True, blank=True)
    ifsc_code = models.CharField(max_length=20, null=True, blank=True)
    gst_no = models.CharField(max_length=50, null=True, blank=True)

    txt_qualification = models.CharField(max_length=100, null=True, blank=True)
    txt_computer_knowledge = models.CharField(max_length=100, null=True, blank=True)

    micro_kitchen_code = models.CharField(max_length=50, null=True, blank=True)
    # food_category = models.CharField(max_length=100, null=True, blank=True)

    details_of_vehicle = models.TextField(null=True, blank=True)
    register_number = models.CharField(max_length=250, null=True, blank=True)

    lc_copy = models.CharField(max_length=250, null=True, blank=True)

    upload_photo_selfie_sc = models.CharField(max_length=250, null=True, blank=True)



    is_active=models.BooleanField(default=True)
    created_on = models.DateField(null=True, blank=True)
    created_by=models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)


# =============================================================================
# FOOD SYSTEM MODELS
# Structure: FoodCategory → Food → FoodIngredient (Ingredient + Unit)
#                                 └── FoodStep
# =============================================================================


class FoodCategory(models.Model):
    """
    Top-level grouping for foods.

    Example data:
        id | name
        ---------
        1  | Breakfast
        2  | Lunch
        3  | Dinner
        4  | Snacks
    """
    name = models.CharField(max_length=100)
    # Example: Breakfast, Lunch, Dinner, Snacks

    def __str__(self):
        return self.name


class Food(models.Model):
    """
    Represents a single food dish belonging to a category.

    Example data:
        id | name       | category  | description
        -------------------------------------------
        1  | Idli       | Breakfast | Soft steamed rice cakes
        2  | Ragi Idli  | Breakfast | Healthy ragi version
        3  | Chapati    | Dinner    | Whole wheat flatbread
    """
    name = models.CharField(max_length=150)
    # Example: Idli, Ragi Idli, Rava Idli, Masala Dosa

    category = models.ForeignKey(FoodCategory, on_delete=models.CASCADE)
    # Example: Idli → Breakfast

    description = models.TextField(blank=True, null=True)
    # Example: "Soft steamed rice cakes from South India"

    image = models.ImageField(upload_to='foods/', null=True, blank=True)
    # Example image path: media/foods/idli.jpg

    def __str__(self):
        return self.name


class FoodNutrition(models.Model):
    food = models.OneToOneField(Food, on_delete=models.CASCADE, related_name='nutrition')

    # 🔥 MACRONUTRIENTS
    calories = models.FloatField(null=True, blank=True)  # e.g. 120 kcal
    protein = models.FloatField(null=True, blank=True)   # grams
    carbs = models.FloatField(null=True, blank=True)     # grams
    fat = models.FloatField(null=True, blank=True)       # grams
    fiber = models.FloatField(null=True, blank=True)     # grams

    # 🔥 ADVANCED MACROS
    sugar = models.FloatField(null=True, blank=True)     # grams
    saturated_fat = models.FloatField(null=True, blank=True)  # grams
    trans_fat = models.FloatField(null=True, blank=True)      # grams

    # 🔥 MINERALS
    sodium = models.FloatField(null=True, blank=True)    # mg
    potassium = models.FloatField(null=True, blank=True) # mg
    calcium = models.FloatField(null=True, blank=True)   # mg
    iron = models.FloatField(null=True, blank=True)      # mg

    # 🔥 VITAMINS
    vitamin_a = models.FloatField(null=True, blank=True)
    vitamin_c = models.FloatField(null=True, blank=True)
    vitamin_d = models.FloatField(null=True, blank=True)
    vitamin_b12 = models.FloatField(null=True, blank=True)

    # 🔥 OTHER USEFUL
    cholesterol = models.FloatField(null=True, blank=True)  # mg
    glycemic_index = models.FloatField(null=True, blank=True)  # important for diabetes

    # 🔥 META
    serving_size = models.CharField(max_length=100, null=True, blank=True)  
    # e.g. "1 plate", "100g", "2 pieces"

    def __str__(self):
        return self.food.name
    

class Ingredient(models.Model):
    """
    Raw ingredient used in food recipes.

    Example data:
        id | name
        --------------
        1  | Rice
        2  | Urad Dal
        3  | Ragi Flour
        4  | Salt
        5  | Water
    """
    name = models.CharField(max_length=150)
    # Example: Rice, Urad Dal, Ragi Flour, Salt, Water

    def __str__(self):
        return self.name


class Unit(models.Model):
    """
    Measurement unit for ingredients.

    Example data:
        id | name
        --------------
        1  | Gram
        2  | Kilogram
        3  | Cup
        4  | Tablespoon
        5  | Teaspoon
        6  | Piece
    """
    name = models.CharField(max_length=50)
    # Example: Gram, Kilogram, Cup, Tablespoon, Teaspoon, Piece

    def __str__(self):
        return self.name


class FoodIngredient(models.Model):
    """
    Links a food to its ingredients with quantity and unit.

    Example data for Ragi Idli:
        food       | ingredient  | quantity | unit | notes
        ---------------------------------------------------
        Ragi Idli  | Ragi Flour  | 200      | Gram |
        Ragi Idli  | Urad Dal    | 50       | Gram |
        Ragi Idli  | Salt        | 5        | Gram |
        Ragi Idli  | Water       | 150      | Gram |

    Example data for Vegetable Upma:
        food           | ingredient | quantity | unit       | notes
        ------------------------------------------------------------
        Vegetable Upma | Rava       | 200      | Gram       | roasted
        Vegetable Upma | Onion      | 80       | Gram       | chopped
        Vegetable Upma | Carrot     | 50       | Gram       | diced
        Vegetable Upma | Oil        | 2        | Tablespoon |
    """
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    # Example: Ragi Idli

    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    # Example: Ragi Flour

    quantity = models.FloatField()
    # Example: 200

    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True)
    # Example: Gram

    notes = models.CharField(max_length=200, blank=True, null=True)
    # Example: roasted, chopped, grated

    def __str__(self):
        return f"{self.food.name} - {self.ingredient.name}"
    

    class Meta:
        unique_together = ['food', 'ingredient']


class FoodStep(models.Model):
    """
    Step-by-step cooking instructions for a food item.

    Example data for Ragi Idli:
        step_number | instruction
        ------------------------------------------
        1           | Soak urad dal for 4 hours
        2           | Grind urad dal into batter
        3           | Mix ragi flour with batter
        4           | Ferment overnight
        5           | Steam in idli mould for 10 minutes
    """
    food = models.ForeignKey(Food, on_delete=models.CASCADE)
    # Example: Ragi Idli

    step_number = models.IntegerField()
    # Example: 1, 2, 3

    instruction = models.TextField()
    # Example: "Mix ragi flour and urad dal batter"

    class Meta:
        ordering = ['step_number']

    def __str__(self):
        return f"{self.food.name} - Step {self.step_number}"
    
    class Meta:
        ordering = ['step_number']
        unique_together = ['food', 'step_number']



class HealthParameter(models.Model):#diabetes, bloodpressure,RBE
    name = models.CharField(max_length=255)
    posted_by = models.ForeignKey(UserRegister,on_delete=models.SET_NULL,null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active=models.BooleanField(default=True)

    def _str__(self):
        return self.name
    
class NormalRangeForHealthParameter(models.Model):
    health_parameter = models.ForeignKey(HealthParameter,on_delete=models.CASCADE,related_name='normal_ranges')  # e.g. Hemoglobin, Glucose
    raw_value = models.TextField(null=True, blank=True)  # original messy data → "4.36|3.7-5.6 mg/dL", "Negative", "Normal: <100 Prediabetes: 100-125"
    min_value = models.FloatField(null=True, blank=True)  # extracted → 3.7
    max_value = models.FloatField(null=True, blank=True)  # extracted → 5.6
    unit = models.CharField(max_length=50, null=True, blank=True)  # "mg/dL", "%", "cells/mcL"
    reference_text = models.TextField(null=True, blank=True)  # "Normal: <100 Prediabetes: 100-125 Diabetes: >=126"
    qualitative_value = models.CharField(max_length=100, null=True, blank=True)  # "Negative", "Nil", "Pale Yellow"
    interpretation_flag = models.CharField(max_length=10, null=True, blank=True)  # "*", "H", "L"
    remarks = models.TextField(null=True, blank=True)  # "Slightly elevated", "Within normal limits"
    created_at = models.DateTimeField(auto_now_add=True)  # auto timestamp when record created
    is_active = models.BooleanField(default=True)  # active/inactive flag
    created_by = models.ForeignKey(UserRegister,on_delete=models.SET_NULL,null=True,blank=True)  # user who added this range

    def __str__(self):
        return self.health_parameter.name


class DietPlans(models.Model):
    title = models.CharField(max_length=100)  # e.g. "Weight Loss Plan"
    code = models.CharField(max_length=50, unique=True, null=True, blank=True)  # e.g. "WL001"

    amount = models.DecimalField(max_digits=10, decimal_places=2)  # e.g. 2000.00
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)  # e.g. 500.00

    no_of_days = models.IntegerField(null=True, blank=True)  # e.g. 30 days

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    created_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    @property
    def final_amount(self):
        # amount = 2000, discount = 500 → 1500
        if self.discount_amount:
            return max(self.amount - self.discount_amount, 0)
        return self.amount

    def __str__(self):
        return self.title


class DietPlanFeature(models.Model):
    diet_plan = models.ForeignKey(
        DietPlans,
        on_delete=models.CASCADE,
        related_name='features'
    )  # linked to plan
    feature = models.CharField(max_length=255)  # e.g. "Personalized diet chart"
    order = models.PositiveIntegerField(default=0)  # 1,2,3...

    def __str__(self):
        return f"{self.diet_plan.title} - {self.feature}"

    class Meta:
        ordering = ['order']