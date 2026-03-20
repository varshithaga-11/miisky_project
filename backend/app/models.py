"""
Miisky — Nutrition & Diet Management Platform

Models for: Users, Nutritionists, Patients, Micro Kitchens, Food System,
Health Reports, Diet Plans, Meals, Meetings.

See PROJECT_ROOT/WORKFLOW.md for full workflow and relationships.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class Country(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateField(auto_now_add=True, blank=True, null=True)



class State(models.Model):
    name = models.CharField(max_length=100)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL,null=True,blank=True)


class City(models.Model):
    name = models.CharField(max_length=150)
    state = models.ForeignKey(State, on_delete=models.SET_NULL,null=True,blank=True)



# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------


class UserRegister(AbstractUser):

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('nutritionist', 'Nutritionist/Dietician'),
        ('patient', 'Patient'),
        ('supply_chain', 'Supply Chain'),
        ('food_buyer', 'Food Buyer'),
        ('micro_kitchen', 'Micro Kitchen'),
        ('non_patient', 'Non Patient'),
    ]

    role = models.CharField(max_length=50, choices=ROLE_CHOICES)

    # Basic Info
    first_name = models.CharField(max_length=100, null=True, blank=True)
    last_name = models.CharField(max_length=100, null=True, blank=True)
    email = models.EmailField(unique=True)

    mobile = models.CharField(max_length=15, null=True, blank=True)
    whatsapp = models.CharField(max_length=15, null=True, blank=True)

    dob = models.DateField(null=True, blank=True)

    gender = models.CharField(max_length=10, choices=[
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ], null=True, blank=True)

    photo = models.ImageField(upload_to='users/', null=True, blank=True)

    # Address
    address = models.CharField(max_length=255, null=True, blank=True)
    city = models.ForeignKey(City, on_delete=models.SET_NULL, null=True, blank=True)
    zip_code = models.CharField(max_length=10, null=True, blank=True)

    state = models.ForeignKey(State, on_delete=models.SET_NULL, null=True, blank=True)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, null=True, blank=True)


    joined_date = models.DateTimeField(null=True, blank=True)


    is_patient_mapped = models.BooleanField(default=False)



    is_active = models.BooleanField(default=True)
    created_on = models.DateTimeField(auto_now_add=True)


class NutritionistProfile(models.Model):
    user = models.OneToOneField(UserRegister, on_delete=models.SET_NULL,null=True,blank=True)

    qualification = models.CharField(max_length=100, null=True, blank=True)
    years_of_experience=models.CharField(max_length=100, null=True, blank=True)
    experience = models.TextField(null=True, blank=True)
    license_number = models.CharField(max_length=100, null=True, blank=True)
    specializations=models.CharField(max_length=100, null=True, blank=True)
    certifications=models.CharField(max_length=100, null=True, blank=True)
    education=models.CharField(max_length=100, null=True, blank=True)
    languages=models.CharField(max_length=100, null=True, blank=True)
    social_media_links_website_links=models.CharField(max_length=100, null=True, blank=True)
    rating = models.FloatField(default=0)
    total_reviews = models.IntegerField(default=0)
    available_modes = models.CharField(
        max_length=100, 
        help_text="Comma-separated modes: video,audio, chat, in_person",
        null=True, 
        blank=True
    )
    is_verified=models.BooleanField(default=False)




class MicroKitchenProfile(models.Model):
    user = models.OneToOneField(UserRegister, on_delete=models.SET_NULL,null=True,blank=True, related_name="micro_kitchen")

    # 🔹 Basic Info
    brand_name = models.CharField(max_length=100,null=True,blank=True)
    kitchen_code = models.CharField(max_length=50, unique=True,null=True,blank=True)

    # 🔹 Compliance
    fssai_no = models.CharField(max_length=14,null=True,blank=True)
    fssai_cert = models.FileField(upload_to='kitchen/fssai/',null=True,blank=True)
    pan_no = models.CharField(max_length=10,null=True,blank=True)
    gst_no = models.CharField(max_length=50, null=True, blank=True)

    # 🔹 Bank Details
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    acc_no = models.CharField(max_length=20, null=True, blank=True)
    ifsc_code = models.CharField(max_length=20, null=True, blank=True)

    # 🔹 Infrastructure
    kitchen_area = models.FloatField(null=True, blank=True, help_text="sq.ft")
    platform_area = models.FloatField(null=True, blank=True)


    water_source = models.CharField(max_length=50, null=True, blank=True,help_text="borewell,cmc,municipal")

    PURIFICATION_CHOICES = [
        ('ro', 'RO'),
        ('uv', 'UV'),
        ('ionized', 'Ionized'),
        ('none', 'None')
    ]
    purification_type = models.CharField(max_length=50, choices=PURIFICATION_CHOICES, null=True, blank=True)

    no_of_water_taps = models.IntegerField(null=True, blank=True)

    # 🔹 Hygiene
    has_pets = models.BooleanField(default=False)
    pet_details = models.CharField(max_length=255, null=True, blank=True)

    has_pests = models.BooleanField(default=False)
    pest_details = models.CharField(max_length=255, null=True, blank=True)
    PEST_CONTROL_FREQUENCY_CHOICES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('half_yearly', 'Half Yearly'),
        ('annually', 'Annually'),
    ]

    pest_control_frequency = models.CharField(
        max_length=20,
        choices=PEST_CONTROL_FREQUENCY_CHOICES,
        null=True,
        blank=True
    )

    # 🔹 Equipment (stored simply)
    has_hobs = models.BooleanField(default=False)
    has_refrigerator = models.BooleanField(default=False)
    has_mixer = models.BooleanField(default=False)
    has_grinder = models.BooleanField(default=False)
    has_blender = models.BooleanField(default=False)
    other_equipment = models.TextField(null=True, blank=True)

    # 🔹 Operations
    cuisine_type = models.CharField(max_length=255,null=True,blank=True)
    meal_type=models.CharField(max_length=255,null=True,blank=True)
    lpg_cylinders = models.IntegerField(null=True, blank=True)
    no_of_staff=models.IntegerField(null=True, blank=True)
    time_available = models.CharField(max_length=100, null=True, blank=True)

    # 🔹 About
    about_you = models.TextField(null=True, blank=True)
    passion_for_cooking = models.TextField(null=True, blank=True)
    health_info = models.TextField(null=True, blank=True)
    constraints = models.TextField(null=True, blank=True)

    # 🔹 Media
    kitchen_video_url = models.URLField(null=True, blank=True)

    photo_exterior = models.ImageField(upload_to='kitchen/photos/', null=True, blank=True)
    photo_entrance = models.ImageField(upload_to='kitchen/photos/', null=True, blank=True)
    photo_kitchen = models.ImageField(upload_to='kitchen/photos/', null=True, blank=True)
    photo_platform = models.ImageField(upload_to='kitchen/photos/', null=True, blank=True)
    additional_photos = models.JSONField(null=True, blank=True)

    # 🔹 Location
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    # 🔹 Status
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')


class MicroKitchenInspection(models.Model):

    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="inspections"
    )

    inspector = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # 🔹 Identification
    mc_code = models.CharField(max_length=50)
    inspection_date = models.DateField()

    # 🔹 Status Tracking (VERY USEFUL 🔥)
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    # 🔹 Ratings (1–10)
    external_cleanliness = models.IntegerField(null=True, blank=True)
    interior_cleanliness = models.IntegerField(null=True, blank=True)
    kitchen_platform_adequacy = models.IntegerField(null=True, blank=True)
    kitchen_platform_neatness = models.IntegerField(null=True, blank=True)
    safety = models.IntegerField(null=True, blank=True)
    pure_water = models.IntegerField(null=True, blank=True)
    storage_facilities = models.IntegerField(null=True, blank=True)
    packing_space = models.IntegerField(null=True, blank=True)
    kitchen_size = models.IntegerField(null=True, blank=True)
    discussion_with_chef = models.IntegerField(null=True, blank=True)
    other_observations = models.IntegerField(null=True, blank=True)
    support_staff = models.IntegerField(null=True, blank=True)

    # 🔹 Media (Image/Video)
    external_cleanliness_media = models.FileField(upload_to='inspection/', null=True, blank=True)
    interior_cleanliness_media = models.FileField(upload_to='inspection/', null=True, blank=True)
    kitchen_platform_adequacy_media = models.FileField(upload_to='inspection/', null=True, blank=True)
    kitchen_platform_neatness_media = models.FileField(upload_to='inspection/', null=True, blank=True)
    safety_media = models.FileField(upload_to='inspection/', null=True, blank=True)
    pure_water_media = models.FileField(upload_to='inspection/', null=True, blank=True)
    storage_facilities_media = models.FileField(upload_to='inspection/', null=True, blank=True)
    packing_space_media = models.FileField(upload_to='inspection/', null=True, blank=True)
    kitchen_size_media = models.FileField(upload_to='inspection/', null=True, blank=True)
    discussion_with_chef_media = models.FileField(upload_to='inspection/', null=True, blank=True)
    other_observations_media = models.FileField(upload_to='inspection/', null=True, blank=True)
    support_staff_media = models.FileField(upload_to='inspection/', null=True, blank=True)

    # 🔹 Extra Notes per inspection (IMPORTANT)
    notes = models.TextField(null=True, blank=True)

    # 🔹 Final Recommendation
    recommendation = models.TextField(null=True, blank=True)

    # 🔹 Score (auto calculated 🔥)
    overall_score = models.FloatField(null=True, blank=True)

    # 🔹 Audit Fields
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    def clean(self):
        # ✅ Validate rating between 1–10
        rating_fields = [
            'external_cleanliness', 'interior_cleanliness',
            'kitchen_platform_adequacy', 'kitchen_platform_neatness',
            'safety', 'pure_water', 'storage_facilities',
            'packing_space', 'kitchen_size',
            'discussion_with_chef', 'other_observations',
            'support_staff'
        ]

        for field in rating_fields:
            value = getattr(self, field)
            if value is not None and (value < 1 or value > 10):
                raise ValueError(f"{field} must be between 1 and 10")

    def save(self, *args, **kwargs):
        # 🔥 Auto calculate overall score (average)
        rating_fields = [
            self.external_cleanliness, self.interior_cleanliness,
            self.kitchen_platform_adequacy, self.kitchen_platform_neatness,
            self.safety, self.pure_water, self.storage_facilities,
            self.packing_space, self.kitchen_size,
            self.discussion_with_chef, self.other_observations,
            self.support_staff
        ]

        valid_ratings = [r for r in rating_fields if r is not None]

        if valid_ratings:
            self.overall_score = round(sum(valid_ratings) / len(valid_ratings), 2)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.micro_kitchen} - {self.inspection_date}"


class DeliveryProfile(models.Model):
    user = models.OneToOneField(UserRegister, on_delete=models.SET_NULL,null=True,blank=True, related_name="delivery_profile")

    # 🔹 Vehicle Info
    VEHICLE_TYPE_CHOICES = [
        ('bike', 'Bike'),
        ('scooter', 'Scooter'),
        ('car', 'Car'),
        ('van', 'Van'),
        ('other', 'Other'),
    ]

    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES, null=True, blank=True)
    vehicle_details = models.TextField(null=True, blank=True)

    register_number = models.CharField(max_length=20, null=True, blank=True)

    # 🔹 Documents
    license_number = models.CharField(max_length=50, null=True, blank=True)
    license_copy = models.FileField(upload_to='delivery/licenses/', null=True, blank=True)

    rc_copy = models.FileField(upload_to='delivery/rc/', null=True, blank=True)  # Registration Certificate
    insurance_copy = models.FileField(upload_to='delivery/insurance/', null=True, blank=True)

    available_slots = models.JSONField(null=True, blank=True)



class UserQuestionnaire(models.Model):
    user = models.OneToOneField(UserRegister, on_delete=models.SET_NULL,null=True,blank=True)

    # 🔹 BASIC DETAILS
    age = models.IntegerField(null=True, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    weight_kg = models.FloatField(null=True, blank=True)

    # 🔹 LIFESTYLE
    work_type = models.CharField(
        max_length=20,
        choices=[
            ('sedentary', 'Sedentary'),
            ('moderate', 'Moderate'),
            ('heavy', 'Heavy')
        ],
        null=True,
        blank=True
    )

    physical_activity = models.BooleanField(null=True, blank=True)
    meals_per_day = models.IntegerField(null=True, blank=True)
    skips_meals = models.BooleanField(null=True, blank=True)
    snacks_between_meals = models.BooleanField(null=True, blank=True)

    food_source = models.CharField(
        max_length=20,
        choices=[
            ('home', 'Home'),
            ('canteen', 'Canteen'),
            ('hotel', 'Hotel')
        ],
        null=True,
        blank=True
    )

    # 🔹 FOOD HABITS
    diet_pattern = models.CharField(
        max_length=20,
        choices=[
            ('veg', 'Veg'),
            ('non_veg', 'Non Veg'),
            ('eggetarian', 'Eggetarian')
        ],
        null=True,
        blank=True
    )

    consumes_egg = models.BooleanField(null=True, blank=True)
    consumes_dairy = models.BooleanField(null=True, blank=True)

    food_allergy = models.BooleanField(null=True, blank=True)
    food_allergy_details = models.TextField(null=True, blank=True)

    fruits_per_day = models.IntegerField(null=True, blank=True)
    vegetables_per_day = models.IntegerField(null=True, blank=True)

    # 🔹 HEALTH (store complex data in JSON)
    health_conditions = models.JSONField(null=True, blank=True)
    # Example: ["diabetes", "thyroid"]

    symptoms = models.JSONField(null=True, blank=True)
    # Example: ["fatigue", "hair_loss"]

    deficiencies = models.JSONField(null=True, blank=True)
    # Example: ["vitamin_b12", "iron"]

    autoimmune_diseases = models.JSONField(null=True, blank=True)
    # Example: ["psoriasis", "celiac"]

    digestive_issues = models.JSONField(null=True, blank=True)
    # Example: ["acidity", "bloating"]

    family_history = models.JSONField(null=True, blank=True)
    # Example: ["diabetes", "cardiac"]

    # 🔹 MEDICAL FLAGS
    has_diabetes = models.BooleanField(null=True, blank=True)
    has_thyroid = models.BooleanField(null=True, blank=True)
    has_bp = models.CharField(
        max_length=10,
        choices=[
            ('high', 'High'),
            ('low', 'Low'),
            ('normal', 'Normal')
        ],
        null=True,
        blank=True
    )
    has_cardiac_issues = models.BooleanField(null=True, blank=True)
    is_anemic = models.BooleanField(null=True, blank=True)

    surgery_history = models.BooleanField(null=True, blank=True)
    on_medication = models.BooleanField(null=True, blank=True)

    # 🔹 HABITS
    alcohol_per_week = models.IntegerField(null=True, blank=True)
    smoking_per_day = models.IntegerField(null=True, blank=True)

    # 🔹 WELL-BEING
    sleep_quality = models.CharField(
        max_length=20,
        choices=[
            ('fresh', 'Fresh'),
            ('not_fresh', 'Not Fresh')
        ],
        null=True,
        blank=True
    )

    stress_level = models.CharField(
        max_length=10,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High')
        ],
        null=True,
        blank=True
    )

    falls_sick_frequency = models.CharField(
        max_length=20,
        choices=[
            ('once', 'Once'),
            ('twice', 'Twice'),
            ('frequent', 'Frequent')
        ],
        null=True,
        blank=True
    )

    # 🔹 FOOD PREFERENCES (IMPORTANT PART)
    food_preferences = models.JSONField(null=True, blank=True)
    """
    Example structure:
    {
        "vegetables": ["onion", "garlic"],
        "fruits": ["banana", "apple"],
        "grains": ["ragi", "oats"],
        "pulses": ["rajma"],
        "oils": ["ghee"],
        "dairy": ["milk"],
        "nuts": ["almond"],
        "seeds": ["chia", "pumpkin"]
    }
    """

    # 🔹 EXTRA NOTES
    additional_notes = models.TextField(null=True, blank=True)

    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} Questionnaire"
    


# =============================================================================
# FOOD SYSTEM MODELS
# Structure: FoodCategory → Food → FoodIngredient (Ingredient + Unit)
#                                 └── FoodStep
# =============================================================================



# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------

# --------------------------------------------------------------------

class MealType(models.Model):
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


class CuisineType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    # Example: North Indian, South Indian, Chinese, Italian

    def __str__(self):
        return self.name


class Food(models.Model):
    """
    Represents a single food dish belonging to meal types.

    Example data:
        id | name       | meal_types | description
        -------------------------------------------
        1  | Idli       | Breakfast | Soft steamed rice cakes
        2  | Ragi Idli  | Breakfast | Healthy ragi version
        3  | Chapati    | Dinner    | Whole wheat flatbread
    """
    name = models.CharField(max_length=150)
    # Example: Idli, Ragi Idli, Rava Idli, Masala Dosa

    meal_types = models.ManyToManyField(MealType, blank=True)
    # Example: Idli → Breakfast

    cuisine_types = models.ManyToManyField(CuisineType, blank=True)
    # Example: Idli → South Indian

    description = models.TextField(blank=True, null=True)
    # Example: "Soft steamed rice cakes from South India"

    image = models.ImageField(upload_to='foods/', null=True, blank=True)
    # Example image path: media/foods/idli.jpg

    def __str__(self):
        return self.name


class FoodNutrition(models.Model):
    food = models.OneToOneField(Food, on_delete=models.SET_NULL,null=True,blank=True, related_name='nutrition')

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
    food = models.ForeignKey(Food, on_delete=models.SET_NULL,null=True,blank=True)
    # Example: Ragi Idli

    ingredient = models.ForeignKey(Ingredient, on_delete=models.SET_NULL,null=True,blank=True)
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
    food = models.ForeignKey(Food, on_delete=models.SET_NULL,null=True,blank=True)
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

# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------
# --------------------------------------------------------------------

class HealthParameter(models.Model):#diabetes, bloodpressure,RBE
    name = models.CharField(max_length=255)
    posted_by = models.ForeignKey(UserRegister,on_delete=models.SET_NULL,null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active=models.BooleanField(default=True)

    def _str__(self):
        return self.name
    
class NormalRangeForHealthParameter(models.Model):
    health_parameter = models.ForeignKey(HealthParameter,on_delete=models.SET_NULL,null=True,blank=True,related_name='normal_ranges')  # e.g. Hemoglobin, Glucose
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

# --------------------------------------------------------------------

# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------

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
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='features'
    )  # linked to plan
    feature = models.CharField(max_length=255)  # e.g. "Personalized diet chart"
    order = models.PositiveIntegerField(default=0)  # 1,2,3...

    def __str__(self):
        return f"{self.diet_plan.title} - {self.feature}"

    class Meta:
        ordering = ['order']



# --------------------------------------------------------------------

# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------



# --------------------------------------------------------------------

class FoodGroup(models.Model):
    name = models.CharField(max_length=150, unique=True)
    # Example: "EDIBLE OILS AND FATS", "CEREALS", "FRUITS"

    def __str__(self):
        return self.name
    
class FoodName(models.Model):
    name = models.CharField(max_length=150)
    food_group = models.ForeignKey(
        FoodGroup,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='foods'
    )
    code = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name



class FoodProximate(models.Model):#Proximate Principles and Dietary Fiber

    food_name = models.OneToOneField(
        FoodName,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='proximate'
    )

    base_unit = models.CharField(max_length=50, null=True, blank=True)

    # Proximate composition
    proximate=models.FloatField(null=True, blank=True)
    water = models.FloatField(null=True, blank=True)
    protein = models.FloatField(null=True, blank=True)
    fat = models.FloatField(null=True, blank=True)
    ash = models.FloatField(null=True, blank=True)
    

    # Dietary fiber
    fat_crude_extract = models.FloatField(null=True, blank=True)
    fiber_total = models.FloatField(null=True, blank=True)
    fiber_insoluble = models.FloatField(null=True, blank=True)
    fiber_soluble = models.FloatField(null=True, blank=True)

    # Carbohydrates & energy
    carbohydrates = models.FloatField(null=True, blank=True)
    energy = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.food_name.name if self.food_name else 'Unknown'} - Proximate"


class FoodWaterSolubleVitamins(models.Model):#Water Soluble Vitamins

    food_name = models.OneToOneField(
        FoodName,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='water_soluble_vitamins'
    )

    base_unit = models.CharField(max_length=50, null=True, blank=True)


    water_soluble_index=models.FloatField(null=True, blank=True)

    # ---------------- B-Complex Vitamins ----------------
    thiamine_b1 = models.FloatField(null=True, blank=True)
    riboflavin_b2 = models.FloatField(null=True, blank=True)
    niacin_b3 = models.FloatField(null=True, blank=True)
    pantothenic_acid_b5 = models.FloatField(null=True, blank=True)
    biotin_b7 = models.FloatField(null=True, blank=True)
    folate_b9 = models.FloatField(null=True, blank=True)

    # ---------------- Other Water Soluble ----------------
    vitamin_b6 = models.FloatField(null=True, blank=True)
    vitamin_c = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.food_name.name if self.food_name else 'Unknown'} - Water Soluble Vitamins"


class FoodFatSolubleVitamins(models.Model):#Fat Soluble Vitamins

    food_name = models.OneToOneField(
        FoodName,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='fat_soluble_vitamins'
    )

    base_unit = models.CharField(max_length=50, null=True, blank=True)

    # Vitamin A
    retinol = models.FloatField(null=True, blank=True)  # erg_cal

    # Tocopherols (Vitamin E)
    alpha_tocopherol = models.FloatField(null=True, blank=True)
    beta_tocopherol = models.FloatField(null=True, blank=True)
    gamma_tocopherol = models.FloatField(null=True, blank=True)
    delta_tocopherol = models.FloatField(null=True, blank=True)

    # Tocotrienols (Vitamin E variants)
    alpha_tocotrienol = models.FloatField(null=True, blank=True)
    beta_tocotrienol = models.FloatField(null=True, blank=True)
    gamma_tocotrienol = models.FloatField(null=True, blank=True)
    delta_tocotrienol = models.FloatField(null=True, blank=True)

    # Total Vitamin E
    total_vitamin_e = models.FloatField(null=True, blank=True)


    def __str__(self):
        return f"{self.food_name.name if self.food_name else 'Unknown'} - Fat Soluble Vitamins"


class FoodCarotenoids(models.Model):#Carotenoids

    food_name = models.OneToOneField(
        FoodName,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='carotenoids'
    )

    base_unit = models.CharField(max_length=50, null=True, blank=True)

    # Individual carotenoids
    lutein = models.FloatField(null=True, blank=True)
    zeaxanthin = models.FloatField(null=True, blank=True)
    lycopene = models.FloatField(null=True, blank=True)
    beta_cryptoxanthin = models.FloatField(null=True, blank=True)
    beta_carotene = models.FloatField(null=True, blank=True)

    # Derived / totals
    total_carotenoids = models.FloatField(null=True, blank=True)
    retinol_activity_equivalent = models.FloatField(null=True, blank=True)
    carotenoid_activity = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.food_name.name if self.food_name else 'Unknown'} - Carotenoids"


class FoodMinerals(models.Model):#Minerals and Trace Elements

    food_name = models.OneToOneField(
        FoodName,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='minerals'
    )

    base_unit = models.CharField(max_length=50, null=True, blank=True)

    # ---------------- Macro Minerals ----------------
    calcium = models.FloatField(null=True, blank=True)
    phosphorus = models.FloatField(null=True, blank=True)
    magnesium = models.FloatField(null=True, blank=True)
    sodium = models.FloatField(null=True, blank=True)
    potassium = models.FloatField(null=True, blank=True)

    # ---------------- Trace Elements ----------------
    iron = models.FloatField(null=True, blank=True)
    zinc = models.FloatField(null=True, blank=True)
    copper = models.FloatField(null=True, blank=True)
    manganese = models.FloatField(null=True, blank=True)
    selenium = models.FloatField(null=True, blank=True)
    chromium = models.FloatField(null=True, blank=True)
    molybdenum = models.FloatField(null=True, blank=True)
    cobalt = models.FloatField(null=True, blank=True)

    # ---------------- Heavy / Toxic Elements ----------------
    aluminium = models.FloatField(null=True, blank=True)
    arsenic = models.FloatField(null=True, blank=True)
    cadmium = models.FloatField(null=True, blank=True)
    mercury = models.FloatField(null=True, blank=True)
    lead = models.FloatField(null=True, blank=True)

    # ---------------- Optional ----------------
    nickel = models.FloatField(null=True, blank=True)
    lithium = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.food_name.name if self.food_name else 'Unknown'} - Minerals"



class FoodSugars(models.Model):#Starch and Individual Sugars
    food_name = models.OneToOneField(
        FoodName,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='sugars'
    )

    base_unit = models.CharField(max_length=50, null=True, blank=True)

    # ---------------- Carbohydrates ----------------
    total_carbohydrates = models.FloatField(null=True, blank=True)
    starch = models.FloatField(null=True, blank=True)

    # ---------------- Individual Sugars ----------------
    fructose = models.FloatField(null=True, blank=True)
    glucose = models.FloatField(null=True, blank=True)
    sucrose = models.FloatField(null=True, blank=True)
    maltose = models.FloatField(null=True, blank=True)

    # ---------------- Total Sugars ----------------
    total_sugars = models.FloatField(null=True, blank=True)


    def __str__(self):
        return f"{self.food_name.name if self.food_name else 'Unknown'} - Sugars"


class FoodAminoAcids(models.Model):#Amino Acid Profile

    food_name = models.OneToOneField(FoodName, on_delete=models.SET_NULL,null=True,blank=True, related_name='amino_acids')

    base_unit = models.CharField(max_length=50, null=True, blank=True)

    histidine = models.FloatField(null=True, blank=True)
    isoleucine = models.FloatField(null=True, blank=True)
    leucine = models.FloatField(null=True, blank=True)
    lysine = models.FloatField(null=True, blank=True)
    methionine = models.FloatField(null=True, blank=True)
    cystine = models.FloatField(null=True, blank=True)
    phenylalanine = models.FloatField(null=True, blank=True)
    threonine = models.FloatField(null=True, blank=True)
    tryptophan = models.FloatField(null=True, blank=True)
    valine = models.FloatField(null=True, blank=True)



class FoodOrganicAcids(models.Model):#Organic Acids

    food_name = models.OneToOneField(
        FoodName,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='organic_acids'
    )

    base_unit = models.CharField(max_length=50, null=True, blank=True)

    # Organic acids
    oxalate_total = models.FloatField(null=True, blank=True)
    oxalate_soluble = models.FloatField(null=True, blank=True)
    oxalate_insoluble = models.FloatField(null=True, blank=True)

    citric_acid = models.FloatField(null=True, blank=True)
    fumaric_acid = models.FloatField(null=True, blank=True)
    malic_acid = models.FloatField(null=True, blank=True)
    quinic_acid = models.FloatField(null=True, blank=True)
    succinic_acid = models.FloatField(null=True, blank=True)
    tartaric_acid = models.FloatField(null=True, blank=True)


    def __str__(self):
        return f"{self.food_name.name if self.food_name else 'Unknown'} - Organic Acids"
    


class FoodPolyphenols(models.Model):#Polyphenols

    food_name = models.OneToOneField(
        FoodName,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='polyphenols'
    )

    base_unit = models.CharField(max_length=50, null=True, blank=True)

    # ---------------- Phenolic Acids ----------------
    benzoic_acid = models.FloatField(null=True, blank=True)
    benzaldehyde = models.FloatField(null=True, blank=True)
    protocatechuic_acid = models.FloatField(null=True, blank=True)
    vanillic_acid = models.FloatField(null=True, blank=True)
    gallic_acid = models.FloatField(null=True, blank=True)
    cinnamic_acid = models.FloatField(null=True, blank=True)
    o_coumaric_acid = models.FloatField(null=True, blank=True)
    p_coumaric_acid = models.FloatField(null=True, blank=True)
    caffeic_acid = models.FloatField(null=True, blank=True)


    def __str__(self):
        return f"{self.food_name.name if self.food_name else 'Unknown'} - Polyphenols"


##OLIGOSACCHARIDES, PHYTOSTEROLS, PHYTATES AND SAPONIN
class FoodPhytochemicals(models.Model):
    food_name = models.OneToOneField(
        FoodName,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='phytochemicals'
    )

    base_unit = models.CharField(max_length=50, null=True, blank=True)

    # ---------------- Oligosaccharides ----------------
    raffinose = models.FloatField(null=True, blank=True)
    stachyose = models.FloatField(null=True, blank=True)
    verbascose = models.FloatField(null=True, blank=True)
    ajugose = models.FloatField(null=True, blank=True)

    # ---------------- Phytosterols ----------------
    campesterol = models.FloatField(null=True, blank=True)
    stigmasterol = models.FloatField(null=True, blank=True)
    beta_sitosterol = models.FloatField(null=True, blank=True)

    # ---------------- Other Compounds ----------------
    phytate = models.FloatField(null=True, blank=True)
    saponin = models.FloatField(null=True, blank=True)


    def __str__(self):
        return f"{self.food_name.name if self.food_name else 'Unknown'} - Phytochemicals"


#Fatty Acid Profile 

class FoodFattyAcidProfile(models.Model):
    food_name = models.OneToOneField(
        FoodName,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='fatty_acid_profile'
    )

    base_unit = models.CharField(max_length=50, null=True, blank=True)

    # 🔹 Short-chain fatty acids (SCFA)
    butyric = models.FloatField(null=True, blank=True)
    caproic = models.FloatField(null=True, blank=True)
    caprylic = models.FloatField(null=True, blank=True)

    # 🔹 Saturated fatty acids (SFA)
    capric = models.FloatField(null=True, blank=True)
    lauric = models.FloatField(null=True, blank=True)
    myristic = models.FloatField(null=True, blank=True)
    palmitic = models.FloatField(null=True, blank=True)
    stearic = models.FloatField(null=True, blank=True)
    arachidic = models.FloatField(null=True, blank=True)
    behenic = models.FloatField(null=True, blank=True)
    lignoceric = models.FloatField(null=True, blank=True)

    # 🔹 Monounsaturated fatty acids (MUFA)
    myristoleic = models.FloatField(null=True, blank=True)
    palmitoleic = models.FloatField(null=True, blank=True)
    oleic = models.FloatField(null=True, blank=True)
    elaidic = models.FloatField(null=True, blank=True)
    eicosenoic = models.FloatField(null=True, blank=True)
    erucic = models.FloatField(null=True, blank=True)

    # 🔹 Polyunsaturated fatty acids (PUFA)
    linoleic = models.FloatField(null=True, blank=True)
    alpha_linolenic = models.FloatField(null=True, blank=True)

    # 🔹 Totals (very useful for reports)
    total_sfa = models.FloatField(null=True, blank=True)
    total_mufa = models.FloatField(null=True, blank=True)
    total_pufa = models.FloatField(null=True, blank=True)

    def __str__(self):
        return f"{self.food_name.name if self.food_name else 'Unknown'} - Fatty Acid Profile"
    


# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------

from django.db.models import Q

class UserNutritionistMapping(models.Model):
    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="nutrition_mappings"
    )
    nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="patient_mappings"
    )

    assigned_on = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        # ✅ Only ONE active nutritionist per user
        constraints = [
            models.UniqueConstraint(
                fields=['user'],
                condition=Q(is_active=True),
                name='unique_active_nutritionist_per_user'
            )
        ]

        # ✅ Performance optimization
        indexes = [
            models.Index(fields=['user', 'is_active']),
        ]

    def save(self, *args, **kwargs):
        # ✅ Ensure assigned user is actually a nutritionist
        if self.nutritionist.role != 'nutritionist':
            raise ValueError("Assigned user must have role = 'nutritionist'")

        # ✅ Auto-deactivate old mappings (optional but recommended 🔥)
        if self.is_active:
            UserNutritionistMapping.objects.filter(
                user=self.user,
                is_active=True
            ).exclude(pk=self.pk).update(is_active=False)

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user} → {self.nutritionist} ({'Active' if self.is_active else 'Inactive'})"






# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------


#✅ 1️⃣ Patient Health Reports (Multiple Uploads)


class PatientHealthReport(models.Model):
    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="health_reports"
    )

    title = models.CharField(max_length=100, null=True, blank=True)  # e.g. "Blood Test Jan"
    
    report_file = models.FileField(upload_to='health_reports/')
    
    report_type = models.CharField(
        max_length=50,
        null=True,
        blank=True,
        help_text="blood_test, scan, prescription, etc."
    )

    uploaded_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.title}"
    


#✅ 2️⃣ Nutritionist Review (Comments on Reports)


class NutritionistReview(models.Model):
    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="reviews"
    )

    nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="given_reviews"
    )

    reports = models.ManyToManyField(
        PatientHealthReport,
        blank=True,
        related_name="reviews"
    )

    comments = models.TextField(null=True, blank=True)

    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review for {self.user} by {self.nutritionist}"
    

#✅ 3️⃣ Diet Plan Assignment
from django.utils.timezone import now
from datetime import timedelta


class UserDietPlan(models.Model):

    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="diet_plans"
    )

    nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="suggested_diet_plans"
    )

    diet_plan = models.ForeignKey(
        DietPlans,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    review = models.ForeignKey(
        NutritionistReview,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_diet_plans"
    )

    # Nutritionist notes when suggesting (based on documents/review)
    nutritionist_notes = models.TextField(null=True, blank=True)

    # 🔥 FULL FLOW STATUS (covers everything)
    STATUS_CHOICES = [
        ('suggested', 'Suggested'),     # nutritionist suggested
        ('approved', 'Approved'),       # user accepted
        ('rejected', 'Rejected'),       # user rejected
        ('payment_pending', 'Payment Pending'),
        ('active', 'Active'),           # plan running
        ('completed', 'Completed'),
        ('stopped', 'Stopped'),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='suggested'
    )

    # 🔹 User response
    user_feedback = models.TextField(null=True, blank=True)
    decision_on = models.DateTimeField(null=True, blank=True)

    # 🔥 Payment Info (only used after approval)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    transaction_id = models.CharField(max_length=100, null=True, blank=True)

    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed')
    ]

    payment_status = models.CharField(
        max_length=20,
        choices=PAYMENT_STATUS,
        default='pending'
    )

    # 🔹 Plan duration
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    # 🔹 Tracking
    suggested_on = models.DateTimeField(auto_now_add=True)
    approved_on = models.DateTimeField(null=True, blank=True)

    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    # 🔥 Business Logic
    def approve(self, start_date=None):
        """Patient approves plan and selects start date. End date auto-calculated from diet_plan.no_of_days."""
        self.status = 'payment_pending'
        self.approved_on = now()
        self.decision_on = now()
        if start_date:
            self.start_date = start_date
            if self.diet_plan and self.diet_plan.no_of_days:
                self.end_date = start_date + timedelta(days=self.diet_plan.no_of_days)
        self.save()

    def reject(self, feedback=None):
        self.status = 'rejected'
        self.user_feedback = feedback
        self.decision_on = now()
        self.save()

    def confirm_payment(self, amount, transaction_id):
        """Called when payment succeeds. Activates plan."""
        self.amount_paid = amount
        self.transaction_id = transaction_id
        self.payment_status = 'success'
        self.status = 'active'
        if not self.start_date:
            self.start_date = now().date()
        if self.diet_plan and self.diet_plan.no_of_days and not self.end_date:
            self.end_date = self.start_date + timedelta(days=self.diet_plan.no_of_days)
        self.save()

    def activate_plan(self):
        """Legacy: activate when payment already succeeded."""
        if self.payment_status == 'success':
            self.status = 'active'
            if not self.start_date:
                self.start_date = now().date()
            if self.diet_plan and self.diet_plan.no_of_days and not self.end_date:
                self.end_date = self.start_date + timedelta(days=self.diet_plan.no_of_days)
            self.save()

    def __str__(self):
        return f"{self.user} - {self.diet_plan} ({self.status})"


# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------
# --------------------------------------------------------------------

class UserMeal(models.Model):
    """
    Stores personalized meals for each user per day.
    THIS is where Option 2 (personalization) actually happens.
    """

    user = models.ForeignKey(
        UserRegister,
        on_delete=models.CASCADE,
        related_name="meals"
    )

    user_diet_plan = models.ForeignKey(
        UserDietPlan,
        on_delete=models.CASCADE,
        related_name="meals"
    )
    # 🔥 Important: link to the ACTIVE plan instance (not just DietPlans)

    meal_type = models.ForeignKey(
        MealType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    # Breakfast / Lunch / Dinner

    food = models.ForeignKey(
        Food,
        on_delete=models.CASCADE,
        related_name="user_meals"
    )

    quantity = models.FloatField(null=True, blank=True)
    # grams / units / servings

    meal_date = models.DateField()

    # 🔹 Tracking
    is_consumed = models.BooleanField(default=False)

    consumed_at = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(null=True, blank=True)

    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'meal_date', 'meal_type')
        indexes = [
            models.Index(fields=['user', 'meal_date']),
        ]

    def __str__(self):
        return f"{self.user} - {self.meal_type} - {self.meal_date}"


# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------
# --------------------------------------------------------------------


from django.db import models
from django.utils.timezone import now

class MeetingRequest(models.Model):
    """
    Patient requests a meeting with a nutritionist.
    """

    patient = models.ForeignKey(
        UserRegister,
        on_delete=models.CASCADE,
        related_name="meeting_requests"
    )

    nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.CASCADE,
        related_name="nutritionist_meetings"
    )

    user_diet_plan = models.ForeignKey(
        UserDietPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="meetings"
    )
    # optional: link meeting to a specific plan

    # 🗓️ Scheduling
    preferred_date = models.DateField()
    preferred_time = models.TimeField()

    # 📝 Message from patient
    reason = models.TextField(null=True, blank=True)

    # 🔥 Status Flow
    STATUS_CHOICES = [
        ('pending', 'Pending'),        # requested by patient
        ('approved', 'Approved'),      # nutritionist accepted
        ('rejected', 'Rejected'),      # nutritionist rejected
        ('completed', 'Completed'),    # meeting done
        ('cancelled', 'Cancelled'),    # cancelled by either side
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    # 🔗 Google Meet Link
    meeting_link = models.URLField(null=True, blank=True)

    # Nutritionist response
    nutritionist_notes = models.TextField(null=True, blank=True)

    # Final scheduled time (can differ from preferred)
    scheduled_datetime = models.DateTimeField(null=True, blank=True)

    # Tracking
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    def approve(self, meeting_link, scheduled_datetime):
        self.status = 'approved'
        self.meeting_link = meeting_link
        self.scheduled_datetime = scheduled_datetime
        self.save()

    def reject(self, note=None):
        self.status = 'rejected'
        self.nutritionist_notes = note
        self.save()

    def mark_completed(self):
        self.status = 'completed'
        self.save()

    def __str__(self):
        return f"{self.patient} → {self.nutritionist} ({self.status})"