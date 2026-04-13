"""
Miisky — Nutrition & Diet Management Platform

Models for: Users, Nutritionists, Patients, Micro Kitchens, Food System,
Health Reports, Diet Plans, Meals, Meetings.

See PROJECT_ROOT/WORKFLOW.md for full workflow and relationships.
"""
from decimal import Decimal

from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.db.models import Sum
import logging

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from multiselectfield import MultiSelectField

logger = logging.getLogger(__name__)


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
        ('doctor', 'Doctor'),
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

    # Location (for nearest-microkitchen / geo queries; PointField-ready: use lat/lng for now)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    lat_lng_address = models.CharField(max_length=255, null=True, blank=True)


    joined_date = models.DateTimeField(null=True, blank=True)


    is_patient_mapped = models.BooleanField(default=False)



    is_active = models.BooleanField(default=True)
    created_on = models.DateTimeField(auto_now_add=True)


class NutritionistProfile(models.Model):
    user = models.OneToOneField(UserRegister, on_delete=models.SET_NULL,null=True,blank=True)

    qualification = models.CharField(max_length=255, null=True, blank=True)
    years_of_experience=models.CharField(max_length=255, null=True, blank=True)
    experience = models.TextField(null=True, blank=True)
    license_number = models.CharField(max_length=255, null=True, blank=True)
    specializations=models.CharField(max_length=255, null=True, blank=True)
    certifications=models.CharField(max_length=255, null=True, blank=True)
    education=models.CharField(max_length=255, null=True, blank=True)
    languages=models.CharField(max_length=255, null=True, blank=True)
    social_media_links_website_links=models.CharField(max_length=255, null=True, blank=True)
    rating = models.FloatField(default=0)
    total_reviews = models.IntegerField(default=0)
    available_modes = models.CharField(
        max_length=255, 
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

    # Location: use user.latitude, user.longitude (UserRegister)

    # 🔹 Status
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    # 🔹 Patient ratings (like NutritionistProfile)
    rating = models.FloatField(default=0)
    total_reviews = models.IntegerField(default=0)


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
    """KYC / vehicle / bank details for supply-chain delivery staff (one row per user)."""

    user = models.OneToOneField(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="delivery_profile",
    )

    # Vehicle
    VEHICLE_TYPE_CHOICES = [
        ("bike", "Bike"),
        ("scooter", "Scooter"),
        ("car", "Car"),
        ("van", "Van"),
        ("other", "Other"),
    ]

    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPE_CHOICES, null=True, blank=True)
    other_vehicle_name = models.CharField(max_length=100, null=True, blank=True)
    vehicle_details = models.TextField(null=True, blank=True)
    register_number = models.CharField(max_length=20, null=True, blank=True)

    # Documents
    license_number = models.CharField(max_length=50, null=True, blank=True)
    license_copy = models.FileField(upload_to="delivery/licenses/", null=True, blank=True)
    rc_copy = models.FileField(upload_to="delivery/rc/", null=True, blank=True)
    insurance_copy = models.FileField(upload_to="delivery/insurance/", null=True, blank=True)
    aadhar_number = models.CharField(max_length=20, null=True, blank=True)
    aadhar_image = models.FileField(upload_to="delivery/aadhar/", null=True, blank=True)
    pan_number = models.CharField(max_length=20, null=True, blank=True)
    pan_image = models.FileField(upload_to="delivery/pan/", null=True, blank=True)
    puc_image = models.FileField(upload_to="delivery/puc/", null=True, blank=True)

    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_deliveries",
    )
    verified_on = models.DateTimeField(null=True, blank=True)

    bank_account_number = models.CharField(max_length=20, null=True, blank=True)
    ifsc_code = models.CharField(max_length=11, null=True, blank=True)
    account_holder_name = models.CharField(max_length=100, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)

    available_slots = models.TextField(null=True, blank=True)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        if self.user_id:
            return f"DeliveryProfile(user={self.user_id})"
        return "DeliveryProfile(unlinked)"


class HealthConditionMaster(models.Model):
    CATEGORY_CHOICES = [
        ('chronic', 'Chronic'),
        ('infectious', 'Infectious'),
        ('metabolic', 'Metabolic'),
        ('digestive', 'Digestive'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    sort_order = models.PositiveIntegerField(null=True, blank=True, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name'], name='uniq_health_condition_master_name'),
        ]

    def __str__(self):
        return self.name


class UserHealthCondition(models.Model):
    user = models.ForeignKey(UserRegister, on_delete=models.SET_NULL,null=True,blank=True, related_name='health_conditions')
    condition = models.ForeignKey(HealthConditionMaster, on_delete=models.SET_NULL,null=True,blank=True)

    has_condition = models.BooleanField(default=False)
    since_when = models.DateField(null=True, blank=True)
    comments = models.TextField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'condition'], name='uniq_user_health_condition'),
        ]

    def __str__(self):
        return f"{self.user} - {self.condition.name}"


class SymptomMaster(models.Model):
    name = models.CharField(max_length=100)
    sort_order = models.PositiveIntegerField(null=True, blank=True, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name'], name='uniq_symptom_master_name'),
        ]

    def __str__(self):
        return self.name


class UserSymptom(models.Model):
    user = models.ForeignKey(UserRegister, on_delete=models.SET_NULL,null=True,blank=True, related_name='symptoms')
    symptom = models.ForeignKey(SymptomMaster, on_delete=models.SET_NULL,null=True,blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'symptom'], name='uniq_user_symptom'),
        ]


class AutoimmuneMaster(models.Model):
    name = models.CharField(max_length=100)
    sort_order = models.PositiveIntegerField(null=True, blank=True, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name'], name='uniq_autoimmune_master_name'),
        ]

    def __str__(self):
        return self.name


class UserAutoimmune(models.Model):
    user = models.ForeignKey(UserRegister, on_delete=models.SET_NULL,null=True,blank=True, related_name='autoimmune_diseases')
    disease = models.ForeignKey(AutoimmuneMaster, on_delete=models.SET_NULL,null=True,blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'disease'], name='uniq_user_autoimmune'),
        ]


class DeficiencyMaster(models.Model):
    name = models.CharField(max_length=100)
    sort_order = models.PositiveIntegerField(null=True, blank=True, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name'], name='uniq_deficiency_master_name'),
        ]

    def __str__(self):
        return self.name


class UserDeficiency(models.Model):
    user = models.ForeignKey(UserRegister, on_delete=models.SET_NULL,null=True,blank=True, related_name='deficiencies')
    deficiency = models.ForeignKey(DeficiencyMaster, on_delete=models.SET_NULL,null=True,blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'deficiency'], name='uniq_user_deficiency'),
        ]


class DigestiveIssueMaster(models.Model):
    name = models.CharField(max_length=100)
    sort_order = models.PositiveIntegerField(null=True, blank=True, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name'], name='uniq_digestive_issue_master_name'),
        ]

    def __str__(self):
        return self.name


class UserDigestiveIssue(models.Model):
    user = models.ForeignKey(UserRegister, on_delete=models.SET_NULL,null=True,blank=True, related_name='digestive_issues')
    issue = models.ForeignKey(DigestiveIssueMaster, on_delete=models.SET_NULL,null=True,blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'issue'], name='uniq_user_digestive_issue'),
        ]


class SkinIssueMaster(models.Model):
    name = models.CharField(max_length=100)
    sort_order = models.PositiveIntegerField(null=True, blank=True, default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name'], name='uniq_skin_issue_master_name'),
        ]

    def __str__(self):
        return self.name


class UserSkinIssue(models.Model):
    user = models.ForeignKey(UserRegister, on_delete=models.SET_NULL,null=True,blank=True, related_name='skin_issues')
    skin_issue = models.ForeignKey(SkinIssueMaster, on_delete=models.SET_NULL,null=True,blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'skin_issue'], name='uniq_user_skin_issue'),
        ]

    def __str__(self):
        return f"{self.user} - {self.skin_issue.name}"



class HabitMaster(models.Model):
    name = models.CharField(max_length=100, unique=True)
    sort_order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class UserHabit(models.Model):
    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_habits'
    )

    habit = models.ForeignKey(
        HabitMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    frequency = models.IntegerField(null=True, blank=True)
    since_when = models.DateField(null=True, blank=True)
    comments = models.TextField(null=True, blank=True)

    other_text = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'habit'],
                name='uniq_user_habit'
            )
        ]

    def __str__(self):
        habit_name = self.habit.name if self.habit else "Deleted Habit"
        user_name = str(self.user) if self.user else "Unknown User"
        return f"{user_name} - {habit_name}"


class ActivityMaster(models.Model):
    name = models.CharField(max_length=100, unique=True)
    sort_order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.name

class UserPhysicalActivity(models.Model):
    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='physical_activities'
    )

    activity = models.ForeignKey(
        ActivityMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # 🔹 optional extra info (future-ready)
    frequency = models.IntegerField(null=True, blank=True)
    duration_minutes = models.IntegerField(null=True, blank=True)

    # 🔹 for "Others"
    other_text = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'activity'],
                name='uniq_user_activity'
            )
        ]

    def __str__(self):
        activity_name = self.activity.name if self.activity else "Deleted Activity"
        user_name = str(self.user) if self.user else "Unknown User"
        return f"{user_name} - {activity_name}"



class UserQuestionnaire(models.Model):
    user = models.OneToOneField(UserRegister, on_delete=models.SET_NULL, null=True, blank=True)

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


    MEAL_SLOT_CHOICES = [
        ("early_morning", "Early Morning"),
        ("breakfast", "Breakfast"),
        ("mid_morning", "Mid Morning"),
        ("lunch", "Lunch"), 
        ("evening_snacks", "Evening Snacks"),
        ("dinner", "Dinner"),
        ("none", "None"),
    ]

    meals_per_day = models.IntegerField(null=True, blank=True)
    meal_slots = MultiSelectField(
        choices=MEAL_SLOT_CHOICES,
        null=True,
        blank=True
    )
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

    non_veg_frequency = models.CharField(
        max_length=40,
        choices=[
            ('daily', 'Daily'),
            ('three_four_times_week', '3–4 times a week'),
            ('one_two_times_week', '1–2 times a week'),
            ('occasional', 'Occasionally (once in 2–3 weeks)'),
        ],
        null=True,
        blank=True,
    )

    consumes_egg = models.BooleanField(null=True, blank=True)
    consumes_dairy = models.BooleanField(null=True, blank=True)

    food_allergy = models.BooleanField(null=True, blank=True)
    food_allergy_details = models.TextField(null=True, blank=True)

    fruits_per_day = models.IntegerField(null=True, blank=True)
    vegetables_per_day = models.IntegerField(null=True, blank=True)

    # 🔹 MEDICAL FLAGS
    surgery_history = models.BooleanField(null=True, blank=True)
    surgery_details = models.TextField(null=True, blank=True)

    medicine_allergy = models.BooleanField(null=True, blank=True)
    medicine_allergy_details = models.TextField(null=True, blank=True)

    consulted_doctor = models.BooleanField(null=True, blank=True)
    consultant_doctor_name = models.CharField(max_length=200, null=True, blank=True)
    consultant_doctor_specialty = models.CharField(max_length=200, null=True, blank=True)
    consultant_doctor_phone = models.CharField(max_length=30, null=True, blank=True)

    


    menstrual_pattern = models.CharField(
        max_length=20,
        choices=[
            ('heavy', 'Heavy bleeding'),
            ('very_less', 'Very less bleeding'),
            ('none', 'None'),
        ],
        null=True,
        blank=True,
    )

    on_medication = models.BooleanField(null=True, blank=True)

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

    # 🔹 FOOD PREFERENCES
    food_preferences = models.TextField(null=True, blank=True)

    # 🔹 EXTRA NOTES
    additional_notes = models.TextField(null=True, blank=True)

    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)


    other_health_concerns = models.TextField(null=True, blank=True)

    any_other_comments = models.TextField(null=True, blank=True)

    any_notes_for_care_team = models.TextField(null=True, blank=True)

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

    is_approved = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class CuisineType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    # Example: North Indian, South Indian, Chinese, Italian

    is_approved = models.BooleanField(default=False)

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

    micro_kitchen = models.ForeignKey(MicroKitchenProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='foods')

    price = models.IntegerField(null=True, blank=True)

    is_approved = models.BooleanField(default=False)

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

    is_approved = models.BooleanField(default=False)

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

    is_approved = models.BooleanField(default=False)

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

    is_approved = models.BooleanField(default=False)

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


class PackagingMaterial(models.Model):
    """
    Types of packaging materials available (e.g., Plastic Box, Paper Bag, etc.)
    """
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

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

    # Optional override for patient plan payment split (% of gross). If any is null, code defaults apply (15/15/60).
    platform_fee_percent = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
        help_text="Override: platform share % of gross (must set all three to override)",
    )
    nutritionist_share_percent = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
    )
    kitchen_share_percent = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True,
    )

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
    doctor = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="given_doctor_reviews"
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
    


from django.utils.timezone import now
from datetime import timedelta


class UserDietPlan(models.Model):

    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="diet_plans"
    )

    nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="suggested_diet_plans"
    )
    #previous nutritionist
    original_nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="originally_assigned_plans",
    )

    diet_plan = models.ForeignKey(
        DietPlans,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # ✅ Single kitchen (as per your requirement)
    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="diet_plan_users"
    )
    #previous micro kitchen
    original_micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="originally_assigned_plans"
    )

    review = models.ForeignKey(
        NutritionistReview,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_diet_plans"
    )

    nutritionist_notes = models.TextField(null=True, blank=True)

    # 🔥 Plan Status
    STATUS_CHOICES = [
        ('suggested', 'Suggested'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('payment_pending', 'Payment Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('stopped', 'Stopped'),
    ]

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='suggested')

    # 🔹 User response
    user_feedback = models.TextField(null=True, blank=True)
    decision_on = models.DateTimeField(null=True, blank=True)

    # 🔥 Payment Info
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    transaction_id = models.CharField(max_length=100, null=True, blank=True)

    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('uploaded', 'Screenshot Uploaded'),
        ('verified', 'Verified'),
        ('failed', 'Failed')
    ]

    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='pending')

    # 📸 Screenshot Upload
    payment_screenshot = models.ImageField(
        upload_to='payment_screenshots/',
        null=True,
        blank=True
    )

    payment_uploaded_on = models.DateTimeField(null=True, blank=True)

    # ✅ Admin Verification
    is_payment_verified = models.BooleanField(default=False)

    verified_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_payments'
    )

    verified_on = models.DateTimeField(null=True, blank=True)

    # 📅 Plan duration
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    # From this date the current `nutritionist` owns meal workflow (set on nutritionist reassignment)
    #for example if plan is from 26th to 28th of march and meals are set on 26th and the admin changes the nutrition starting from 28th then 26th and 27th meals are set by the previous nutritionist and 28th meal and future dates are set by the new nutritionist
    nutritionist_effective_from = models.DateField(null=True, blank=True)

    #for example if plan is from 26th to 28th of march and meals are set on 26th and the nutritionist assigns a new micro kitchen starting from 28th then 26th and 27th meals are set by the previous micro kitchen and 28th meal and future dates are set by the new micro kitchen

    micro_kitchen_effective_from = models.DateField(null=True, blank=True)

    # 🕒 Tracking
    suggested_on = models.DateTimeField(auto_now_add=True)
    approved_on = models.DateTimeField(null=True, blank=True)

    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    # =====================================================
    # 🔥 BUSINESS LOGIC METHODS
    # =====================================================

    def approve(self, start_date=None):
        """User approves the plan"""
        self.status = 'payment_pending'
        self.approved_on = now()
        self.decision_on = now()

        if start_date:
            self.start_date = start_date
            if self.diet_plan and self.diet_plan.no_of_days:
                # no_of_days=2 means start + end (inclusive): 26th + 27th → end_date = 27th = start + 1 day
                self.end_date = start_date + timedelta(days=self.diet_plan.no_of_days - 1)

        self.save()

    def reject(self, feedback=None):
        """User rejects the plan"""
        self.status = 'rejected'
        self.user_feedback = feedback
        self.decision_on = now()
        self.save()

    def upload_payment(self, screenshot=None, amount_paid=None, transaction_id=None):
        """User uploads payment details (screenshot optional)"""
        if screenshot:
            self.payment_screenshot = screenshot
            self.payment_uploaded_on = now()
        self.amount_paid = amount_paid
        self.transaction_id = transaction_id
        self.payment_status = 'uploaded'
        self.status = 'payment_pending'
        self.save()

    def verify_payment(self, admin_user, start_date=None, delivery_person=None, default_slot=None):
        """Admin verifies payment, assigns start date, and activates plan"""
        self.is_payment_verified = True
        self.verified_by = admin_user
        self.verified_on = now()

        self.payment_status = 'verified'
        self.status = 'active'

        if start_date:
            self.start_date = start_date
        elif not self.start_date:
            self.start_date = now().date()

        if self.diet_plan and self.diet_plan.no_of_days and self.start_date:
            # no_of_days=2 means start + end (inclusive): 26th + 27th → end_date = 27th = start + 1 day
            self.end_date = self.start_date + timedelta(days=self.diet_plan.no_of_days - 1)

        self.save()
        from .plan_payment import ensure_plan_payment_snapshot
        ensure_plan_payment_snapshot(self)

        # Step 1 — one-time global delivery setup (optional until admin sends person + slot)
        if delivery_person is not None and default_slot is not None:
            DietPlanDeliveryAssignment.objects.update_or_create(
                user_diet_plan=self,
                defaults={
                    'user': self.user,
                    'micro_kitchen': self.micro_kitchen,
                    'delivery_person': delivery_person,
                    'default_slot': default_slot,
                    'assigned_by': admin_user,
                    'is_active': True,
                },
            )

    def reject_payment(self):
        """Admin rejects payment"""
        self.payment_status = 'failed'
        self.status = 'payment_pending'
        self.is_payment_verified = False
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
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="meals"
    )

    user_diet_plan = models.ForeignKey(
        UserDietPlan,
        on_delete=models.SET_NULL,null=True,blank=True,
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
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="user_meals"
    )

    quantity = models.FloatField(null=True, blank=True)
    # grams / units / servings

    meal_date = models.DateField()

    # 🔹 Tracking
    is_consumed = models.BooleanField(default=False)

    consumed_at = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(null=True, blank=True)

    packaging_material = models.ForeignKey(
        PackagingMaterial,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_meals"
    )

    # Kitchen responsible for this meal slot (differs from plan.micro_kitchen after mid-plan reassignment).
    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="scheduled_user_meals",
    )

    created_on = models.DateTimeField(auto_now_add=True)

    # class Meta:
    #     unique_together = ('user', 'meal_date', 'meal_type')
    #     indexes = [
    #         models.Index(fields=['user', 'meal_date']),
    #         models.Index(fields=['micro_kitchen', 'meal_date']),
    #     ]

    class Meta:
        # REMOVED: unique_together = ('user', 'meal_date', 'meal_type')
        indexes = [
            models.Index(fields=['user', 'meal_date']),
            models.Index(fields=['user', 'meal_date', 'meal_type']),  # fast per-meal-type queries
            models.Index(fields=['micro_kitchen', 'meal_date']),
        ]
        ordering = ['meal_date', 'meal_type']

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
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="meeting_requests"
    )

    nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="nutritionist_meetings"
    )

    user_diet_plan = models.ForeignKey(
        UserDietPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="meetings"
    )

    # Link to a specific availability slot (optional)
    availability_slot = models.OneToOneField(
        'NutritionistAvailability',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="meeting"
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

# --------------------------------------------------------------
# 🗓️ Nutritionist Availability
# --------------------------------------------------------------

class NutritionistAvailability(models.Model):
    """
    Nutritionist sets their available time slots for consultations.
    """
    nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="availabilities"
    )

    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

    is_booked = models.BooleanField(default=False)

    # Tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('nutritionist', 'date', 'start_time')
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.nutritionist} - {self.date} ({self.start_time}-{self.end_time})"


# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------
# --------------------------------------------------------------------

class NutritionistRating(models.Model):
    patient = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='given_ratings'
    )
    nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='received_ratings'
    )

    # Rating out of 5
    rating = models.PositiveIntegerField()  # 1 to 5

    # Optional feedback
    review = models.TextField(null=True, blank=True)

    # Link to diet plan (optional but recommended)
    diet_plan = models.ForeignKey(
        UserDietPlan,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('patient', 'nutritionist', 'diet_plan')

    def __str__(self):
        return f"{self.patient} rated {self.nutritionist} - {self.rating}"



class MicroKitchenRating(models.Model):
    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='given_kitchen_ratings'
    )

    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='received_ratings'
    )

    # Rating (1 to 5)
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )

    # Optional review
    review = models.TextField(null=True, blank=True)

    # Optional: link to order
    order = models.ForeignKey(
        'Order',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='ratings'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # unique_together = ('user', 'micro_kitchen') # Replaced to allow per-order rating
        unique_together = ('order',)

    def __str__(self):
        return f"{self.user} rated {self.micro_kitchen} - {self.rating}"

# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------
# --------------------------------------------------------------------


class MicroKitchenFood(models.Model):
    """Junction: which foods a micro kitchen offers, with kitchen-specific price & availability."""
    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='kitchen_foods'
    )
    food = models.ForeignKey(
        Food,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='kitchen_mappings'
    )
    is_available = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    preparation_time = models.IntegerField(
        null=True,
        blank=True,
        help_text="Time in minutes"
    )

    class Meta:
        unique_together = ('micro_kitchen', 'food')

    def __str__(self):
        return f"{self.micro_kitchen} - {self.food}"

# ------------------------------------------------------------
# --------------------------------------------------------------------


# ------------------------------------------------------------
# --------------------------------------------------------------------

class DeliveryChargeSlab(models.Model):
    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='delivery_slabs'
    )

    min_km = models.DecimalField(max_digits=5, decimal_places=2)
    max_km = models.DecimalField(max_digits=5, decimal_places=2)

    charge = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.micro_kitchen} ({self.min_km} - {self.max_km} km) = ₹{self.charge}"


class Order(models.Model):
    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='orders'
    )

    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='orders'
    )

    order_type = models.CharField(
        max_length=20,
        choices=[
            ('patient', 'Patient Order'),
            ('non_patient', 'Non Patient Order'),
        ],
        default='non_patient'
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ('placed', 'Placed'),
            ('accepted', 'Accepted'),
            ('preparing', 'Preparing'),
            ('ready', 'Ready'),
            ('picked_up', 'Picked Up'),
            ('delivered', 'Delivered'),
            ('cancelled', 'Cancelled'),
        ],
        default='placed'
    )

    # 💰 Food total
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    # 🚚 Delivery info (ADD THIS)
    delivery_distance_km = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    # (Optional but BEST) store slab used
    delivery_slab = models.ForeignKey(
        DeliveryChargeSlab,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # 💵 Final bill (food total + delivery_charge)
    final_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    delivery_address = models.TextField()

    delivery_lat_lng_address = models.CharField(max_length=255, blank=True, default="")

    delivery_person = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_orders",
        help_text="Supply-chain user assigned to deliver this order (kitchen assigns).",
    )

    created_at = models.DateTimeField(auto_now_add=True)


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='items'
    )

    food = models.ForeignKey(
        Food,
        on_delete=models.SET_NULL,null=True,blank=True,
    )

    quantity = models.PositiveIntegerField()

    price = models.DecimalField(max_digits=10, decimal_places=2)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)



class Cart(models.Model):
    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='cart'
    )

    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,null=True,blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)


class CartItem(models.Model):
    cart = models.ForeignKey(
        Cart,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='items'
    )

    food = models.ForeignKey(
        Food,
        on_delete=models.SET_NULL,null=True,blank=True,
    )

    quantity = models.PositiveIntegerField()



# ------------------------------------------------------------
# --------------------------------------------------------------------


# ------------------------------------------------------------
# --------------------------------------------------------------------

class Notification(models.Model):
    user = models.ForeignKey(UserRegister, on_delete=models.SET_NULL,null=True, related_name="notifications")
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} → {self.user.username}"
    

# ------------------------------------------------------------
# --------------------------------------------------------------------


# ------------------------------------------------------------
# --------------------------------------------------------------------


# 🔹 CATEGORY MODEL
class TicketCategory(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# 🔹 MAIN SUPPORT TICKET
class SupportTicket(models.Model):

    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]

    USER_TYPE_CHOICES = [
        ('patient', 'Patient'),
        ('nutritionist', 'Nutritionist'),
        ('kitchen', 'Kitchen'),
        ('doctor', 'Doctor'),
        ('non_patient', 'Non Patient'),
    ]

    TARGET_USER_TYPE_CHOICES = [
        ('admin', 'Support/Admin'),
        ('nutritionist', 'Account Nutritionist'),
        ('kitchen', 'Account Kitchen'),
        ('doctor', 'Account Doctor'),
    ]

    created_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="created_tickets"
    )

    assigned_to = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tickets"
    )

    category = models.ForeignKey(
        TicketCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tickets"
    )

    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES
    )

    target_user_type = models.CharField(
        max_length=20,
        choices=TARGET_USER_TYPE_CHOICES,
        default='admin'
    )

    title = models.CharField(max_length=255)
    description = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='open'
    )

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"#{self.id} - {self.title} ({self.status})"


# 🔹 TICKET CONVERSATION (CHAT)
class TicketMessage(models.Model):

    ticket = models.ForeignKey(
        SupportTicket,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="messages"
    )

    sender = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True
    )

    message = models.TextField()

    is_internal = models.BooleanField(default=False)
    # True → only admin/support can see

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Ticket #{self.ticket.id} - {self.sender}"


# 🔹 ATTACHMENTS
class TicketAttachment(models.Model):

    ticket = models.ForeignKey(
        SupportTicket,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="attachments"
    )

    uploaded_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True
    )

    file = models.FileField(upload_to="support_attachments/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for Ticket #{self.ticket.id}"

# ------------------------------------------------------------
# --------------------------------------------------------------------


# ------------------------------------------------------------
# --------------------------------------------------------------------



class NutritionistReassignment(models.Model):
    """Audit log for every time a patient's nutritionist changes."""

    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="reassignments",
    )
    previous_nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reassigned_from",
    )
    new_nutritionist = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reassigned_to",
    )
    new_mapping = models.ForeignKey(
        "UserNutritionistMapping",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reassignment_event",
    )

    REASON_CHOICES = [
        ("nutritionist_left", "Nutritionist Left"),
        ("patient_request", "Patient Request"),
        ("admin_decision", "Admin Decision"),
        ("nutritionist_on_leave", "Nutritionist On Leave"),
        ("other", "Other"),
    ]
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    notes = models.TextField(null=True, blank=True)

    reassigned_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="performed_reassignments",
    )
    reassigned_on = models.DateTimeField(auto_now_add=True)

    # From which date the new nutritionist takes over meals (mirrors MicroKitchenReassignment)
    effective_from = models.DateField(null=True, blank=True)

    # Diet plan active at time of reassignment (context)
    active_diet_plan = models.ForeignKey(
        "UserDietPlan",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    def __str__(self):
        return f"{self.user}: {self.previous_nutritionist} → {self.new_nutritionist} ({self.reason})"



class MicroKitchenReassignment(models.Model):
    """Audit log every time a patient's kitchen changes mid-plan."""

    user_diet_plan = models.ForeignKey(
        'UserDietPlan',
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="kitchen_reassignments"
    )
    previous_kitchen = models.ForeignKey(
        'MicroKitchenProfile',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="reassigned_from"
    )
    new_kitchen = models.ForeignKey(
        'MicroKitchenProfile',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="reassigned_to"
    )

    REASON_CHOICES = [
        ('kitchen_closed', 'Kitchen Closed'),
        ('kitchen_suspended', 'Kitchen Suspended'),
        ('patient_request', 'Patient Request'),
        ('admin_decision', 'Admin Decision'),
        ('quality_issue', 'Quality Issue'),
    ]
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    notes = models.TextField(null=True, blank=True)

    reassigned_by = models.ForeignKey(
        'UserRegister',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="performed_kitchen_reassignments"
    )
    reassigned_on = models.DateTimeField(auto_now_add=True)

    # Which date the new kitchen takes over from
    effective_from = models.DateField()


# ------------------------------------------------------------
# --------------------------------------------------------------------


# ------------------------------------------------------------
# --------------------------------------------------------------------


class PlanPaymentSnapshot(models.Model):
    """
    Immutable financial record created when admin verifies payment.
    Percentages and amounts are frozen so later catalog changes do not affect this plan.
    """

    user_diet_plan = models.OneToOneField(
        "UserDietPlan",
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="payment_snapshot",
    )

    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

    platform_percent = models.DecimalField(max_digits=5, decimal_places=2)
    nutrition_percent = models.DecimalField(max_digits=5, decimal_places=2)
    kitchen_percent = models.DecimalField(max_digits=5, decimal_places=2)

    platform_amount = models.DecimalField(max_digits=12, decimal_places=2)
    nutrition_amount = models.DecimalField(max_digits=12, decimal_places=2)
    kitchen_amount = models.DecimalField(max_digits=12, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Snapshot for plan {self.user_diet_plan_id} — ₹{self.total_amount}"


class OrderCommissionConfig(models.Model):
    """
    Single global commission rate for order payouts.
    Exactly one row should be active at a time.
    """

    platform_commission_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("100"))],
        help_text="Platform cut (%)",
    )
    kitchen_commission_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0")), MaxValueValidator(Decimal("100"))],
        help_text="Kitchen cut (%)",
    )
    is_active = models.BooleanField(default=True)
    notes = models.TextField(null=True, blank=True)
    created_by = models.ForeignKey(
        "UserRegister",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_order_commission_configs",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Order commission config"

    def clean(self):
        super().clean()
        if (
            self.platform_commission_percent is not None
            and self.kitchen_commission_percent is not None
        ):
            total = self.platform_commission_percent + self.kitchen_commission_percent
            if total != Decimal("100"):
                raise ValidationError(
                    f"Platform % + Kitchen % must equal 100. Currently: {total}%"
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        if self.is_active:
            OrderCommissionConfig.objects.exclude(pk=self.pk).filter(
                is_active=True
            ).update(is_active=False)
        super().save(*args, **kwargs)

    @classmethod
    def get_active(cls):
        config = cls.objects.filter(is_active=True).first()
        if not config:
            raise ValueError(
                "No active OrderCommissionConfig found. "
                "Please create one in the admin panel."
            )
        return config

    def __str__(self):
        return (
            f"Platform {self.platform_commission_percent}% / "
            f"Kitchen {self.kitchen_commission_percent}%"
            f"{' [active]' if self.is_active else ''}"
        )


class OrderPaymentSnapshot(models.Model):
    """
    Immutable order split snapshot created when an order is inserted.
    Food subtotal is split by commission, while delivery charge is pass-through.
    """

    order = models.OneToOneField(
        "Order",
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="payment_snapshot",
    )

    food_subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    delivery_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Pass-through to delivery person. Not included in split.",
    )
    grand_total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        help_text="food_subtotal + delivery_charge",
    )

    platform_percent = models.DecimalField(max_digits=5, decimal_places=2)
    kitchen_percent = models.DecimalField(max_digits=5, decimal_places=2)

    platform_amount = models.DecimalField(max_digits=12, decimal_places=2)
    kitchen_amount = models.DecimalField(max_digits=12, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Order payment snapshot"

    def __str__(self):
        return (
            f"Order #{self.order_id} | "
            f"Platform ₹{self.platform_amount} ({self.platform_percent}%) | "
            f"Kitchen ₹{self.kitchen_amount} ({self.kitchen_percent}%)"
        )


class SupplyChainOrderDeliveryReceipt(models.Model):
    """
    Receipt / proof uploaded by supply-chain staff for a delivered order's delivery charge (pass-through).
    One row per order.
    """

    order = models.OneToOneField(
        "Order",
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="supply_chain_delivery_receipt",
    )
    uploaded_by = models.ForeignKey(
        "UserRegister",
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="order_delivery_receipt_uploads",
    )
    receipt_image = models.ImageField(upload_to="supply_chain_order_receipts/")
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Supply chain order delivery receipt"

    def __str__(self):
        return f"Receipt order #{self.order_id}"


class PayoutTracker(models.Model):
    """
    Amount owed to one recipient for one period; multiple PayoutTransaction rows may apply until paid.
    On reassignment, unpaid trackers for nutritionist/kitchen are closed and new rows cover new periods.
    """

    snapshot = models.ForeignKey(
        PlanPaymentSnapshot,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="payouts",
    )

    PAYOUT_TYPE_PLATFORM = "platform"
    PAYOUT_TYPE_NUTRITIONIST = "nutritionist"
    PAYOUT_TYPE_KITCHEN = "kitchen"
    PAYOUT_TYPE_CHOICES = [
        (PAYOUT_TYPE_PLATFORM, "Platform"),
        (PAYOUT_TYPE_NUTRITIONIST, "Nutritionist"),
        (PAYOUT_TYPE_KITCHEN, "Kitchen"),
    ]
    payout_type = models.CharField(max_length=20, choices=PAYOUT_TYPE_CHOICES)

    nutritionist = models.ForeignKey(
        UserRegister,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="nutritionist_payout_trackers",
    )
    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="kitchen_payout_trackers",
    )

    total_amount = models.DecimalField(max_digits=12, decimal_places=2)
    paid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    period_from = models.DateField(null=True, blank=True)
    period_to = models.DateField(null=True, blank=True)

    STATUS_PENDING = "pending"
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_PAID = "paid"
    STATUS_CLOSED = "closed"
    STATUS_CANCELLED = "cancelled"
    STATUS_CHOICES = [
        (STATUS_PENDING, "Pending"),
        (STATUS_IN_PROGRESS, "In Progress"),
        (STATUS_PAID, "Fully Paid"),
        (STATUS_CLOSED, "Closed Early"),
        (STATUS_CANCELLED, "Cancelled"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)

    is_closed = models.BooleanField(default=False)
    closed_reason = models.TextField(null=True, blank=True)
    closed_by = models.ForeignKey(
        UserRegister,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="closed_payout_trackers",
    )
    closed_on = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def remaining_amount(self):
        return max(self.total_amount - self.paid_amount, Decimal("0.00"))

    @property
    def is_fully_paid(self):
        return self.paid_amount >= self.total_amount

    def clean(self):
        if self.payout_type == self.PAYOUT_TYPE_NUTRITIONIST:
            if not self.nutritionist_id:
                raise ValidationError("Nutritionist payout must have a nutritionist set.")
            if self.micro_kitchen_id:
                raise ValidationError("Nutritionist payout must not have a kitchen set.")
        elif self.payout_type == self.PAYOUT_TYPE_KITCHEN:
            if not self.micro_kitchen_id:
                raise ValidationError("Kitchen payout must have a micro_kitchen set.")
            if self.nutritionist_id:
                raise ValidationError("Kitchen payout must not have a nutritionist set.")
        elif self.payout_type == self.PAYOUT_TYPE_PLATFORM:
            if self.nutritionist_id or self.micro_kitchen_id:
                raise ValidationError("Platform payout must have neither nutritionist nor kitchen set.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        if self.payout_type == self.PAYOUT_TYPE_PLATFORM:
            return f"Platform payout — ₹{self.total_amount} [{self.period_from} → {self.period_to}]"
        if self.payout_type == self.PAYOUT_TYPE_NUTRITIONIST:
            return f"Nutritionist payout ({self.nutritionist}) — ₹{self.total_amount} [{self.period_from} → {self.period_to}]"
        return f"Kitchen payout ({self.micro_kitchen}) — ₹{self.total_amount} [{self.period_from} → {self.period_to}]"

    class Meta:
        ordering = ["created_at"]


class PayoutTransaction(models.Model):
    """One real transfer logged against a PayoutTracker; updates tracker.paid_amount on save/delete."""

    tracker = models.ForeignKey(
        PayoutTracker,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="transactions",
    )

    amount_paid = models.DecimalField(max_digits=12, decimal_places=2)
    payout_date = models.DateField(null=True, blank=True)

    PAYMENT_METHOD_BANK = "bank_transfer"
    PAYMENT_METHOD_UPI = "upi"
    PAYMENT_METHOD_CASH = "cash"
    PAYMENT_METHOD_CHEQUE = "cheque"
    PAYMENT_METHOD_OTHER = "other"
    PAYMENT_METHOD_CHOICES = [
        (PAYMENT_METHOD_BANK, "Bank Transfer"),
        (PAYMENT_METHOD_UPI, "UPI"),
        (PAYMENT_METHOD_CASH, "Cash"),
        (PAYMENT_METHOD_CHEQUE, "Cheque"),
        (PAYMENT_METHOD_OTHER, "Other"),
    ]
    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        null=True,
        blank=True,
    )

    payment_screenshot = models.ImageField(
        upload_to="payout_screenshots/",
        null=True,
        blank=True,
    )
    transaction_reference = models.CharField(max_length=100, null=True, blank=True)
    note = models.CharField(max_length=255, null=True, blank=True)

    paid_by = models.ForeignKey(
        UserRegister,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="initiated_payout_transactions",
    )
    paid_on = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self._update_tracker()

    def delete(self, *args, **kwargs):
        tid = self.tracker_id
        super().delete(*args, **kwargs)
        PayoutTransaction._recalc_tracker_paid_amount(tid)

    @staticmethod
    def _recalc_tracker_paid_amount(tracker_id):
        if not tracker_id:
            return
        try:
            tracker = PayoutTracker.objects.get(pk=tracker_id)
        except PayoutTracker.DoesNotExist:
            return
        total_paid = (
            PayoutTransaction.objects.filter(tracker_id=tracker_id).aggregate(s=Sum("amount_paid"))["s"]
            or Decimal("0.00")
        )
        tracker.paid_amount = total_paid
        if tracker.is_closed:
            tracker.status = PayoutTracker.STATUS_CLOSED
        elif total_paid >= tracker.total_amount:
            tracker.status = PayoutTracker.STATUS_PAID
        elif total_paid > 0:
            tracker.status = PayoutTracker.STATUS_IN_PROGRESS
        else:
            tracker.status = PayoutTracker.STATUS_PENDING
        PayoutTracker.objects.filter(pk=tracker.pk).update(paid_amount=tracker.paid_amount, status=tracker.status)

    def _update_tracker(self):
        tracker = self.tracker
        total_paid = (
            tracker.transactions.aggregate(s=Sum("amount_paid"))["s"] or Decimal("0.00")
        )
        tracker.paid_amount = total_paid
        if tracker.is_closed:
            tracker.status = PayoutTracker.STATUS_CLOSED
        elif total_paid >= tracker.total_amount:
            tracker.status = PayoutTracker.STATUS_PAID
        elif total_paid > 0:
            tracker.status = PayoutTracker.STATUS_IN_PROGRESS
        else:
            tracker.status = PayoutTracker.STATUS_PENDING
        PayoutTracker.objects.filter(pk=tracker.pk).update(paid_amount=tracker.paid_amount, status=tracker.status)

    def __str__(self):
        return f"₹{self.amount_paid} via {self.payment_method} on {self.payout_date}"

    class Meta:
        ordering = ["paid_on"]


# ------------------------------------------------------------
# --------------------------------------------------------------------


# ------------------------------------------------------------
# --------------------------------------------------------------------

# --------------------Reset OTP For Password Change--------------------------

    
class EmailOTP(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return timezone.now() > self.created_at + timedelta(minutes=5) 
    



# --------------------------------------------------------------
# -------------------------------------------------------------
# ------------------------------------------------------------
# SUPPLY CHAIN / DELIVERY MODELS
# --------------------------------------------------------------------

class DeliverySlot(models.Model):
    """
    Time window for diet-plan deliveries (e.g. morning / evening).
    Referenced by DietPlanDeliveryAssignment.default_slot and DeliveryAssignment.delivery_slot.
    """

    name = models.CharField(max_length=100)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    micro_kitchen = models.ForeignKey(
        'MicroKitchenProfile',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delivery_slots',
    )

    def __str__(self):
        return self.name


class MicroKitchenDeliveryTeam(models.Model):
    """
    Defines which delivery persons belong to a micro kitchen.
    Each micro kitchen has its own pool/team of delivery persons.
    """

    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="delivery_team",
    )
    delivery_person = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name="kitchen_assignments",
    )

    ROLE_CHOICES = [
        ("primary", "Primary"),
        ("backup", "Backup"),
        ("temporary", "Temporary"),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="primary")
    is_active = models.BooleanField(default=True)
    zone_name = models.CharField(max_length=100, null=True, blank=True)
    pincode = models.CharField(max_length=10, null=True, blank=True)
    assigned_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("micro_kitchen", "delivery_person")
        ordering = ["-assigned_on"]

    def __str__(self):
        return f"{self.delivery_person} -> {self.micro_kitchen} ({self.role})"


# ============================================================
# 🌍 LAYER 1 — GLOBAL ASSIGNMENT
# ============================================================

class DietPlanDeliveryAssignment(models.Model):
    """
    One record per active UserDietPlan.
    Admin assigns delivery person + slot ONCE here.
    All meals under this plan auto-inherit this assignment.
    """

    user_diet_plan = models.OneToOneField(
        UserDietPlan,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='delivery_assignment'
    )

    # Denormalized for easy querying (no need to join UserDietPlan every time)
    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='plan_delivery_assignments'
    )
    micro_kitchen = models.ForeignKey(
        MicroKitchenProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='plan_delivery_assignments'
    )

    delivery_person = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='primary_delivery_plans'
    )

    default_slot = models.ForeignKey(
        DeliverySlot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Primary slot used when auto-creating daily deliveries (e.g. first of the day).",
    )

    delivery_slots = models.ManyToManyField(
        DeliverySlot,
        blank=True,
        related_name='diet_plan_assignments',
        help_text="All time windows this delivery person covers for the plan (can be several).",
    )

    is_active = models.BooleanField(default=True)
    assigned_on = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_plan_delivery_assignments'
    )
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Plan {self.user_diet_plan_id} → {self.delivery_person}"

    def change_delivery_person(
        self,
        new_person,
        *,
        changed_by,
        effective_from=None,
        reason='reassigned',
        notes=None,
    ):
        """
        Permanent mid-plan handoff: updates global assignment and appends an audit log.
        Past DeliveryAssignment rows are unchanged; new UserMeals get the new person via create_from_plan.
        """
        from django.utils import timezone as dj_tz

        old = self.delivery_person
        if getattr(new_person, 'pk', None) == getattr(old, 'pk', None):
            return self

        self.delivery_person = new_person
        self.save(update_fields=['delivery_person'])

        DietPlanDeliveryAssignmentLog.objects.create(
            plan_assignment=self,
            previous_delivery_person=old,
            new_delivery_person=new_person,
            reason=reason,
            notes=notes,
            changed_by=changed_by,
            effective_from=effective_from or dj_tz.now().date(),
        )
        return self


class DietPlanSlotDeliveryPerson(models.Model):
    """
    Per delivery slot, which supply-chain user delivers for this plan.
    Allows different persons for different time windows (e.g. morning vs evening).
    """

    plan_assignment = models.ForeignKey(
        DietPlanDeliveryAssignment,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='slot_delivery_persons',
    )
    delivery_slot = models.ForeignKey(
        DeliverySlot,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='plan_slot_delivery_persons',
    )
    delivery_person = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='slot_specific_plan_deliveries',
    )

    class Meta:
        unique_together = [('plan_assignment', 'delivery_slot')]

    def __str__(self):
        return f"Plan assignment {self.plan_assignment_id} slot {self.delivery_slot_id} → {self.delivery_person_id}"


class DietPlanDeliveryAssignmentLog(models.Model):
    """
    Audit log every time the global delivery person changes mid-plan.
    """
    plan_assignment = models.ForeignKey(
        DietPlanDeliveryAssignment,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='change_logs'
    )

    previous_delivery_person = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='removed_from_plans'
    )
    new_delivery_person = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='added_to_plans'
    )

    REASON_CHOICES = [
        ('left', 'Delivery Person Left'),
        ('on_leave', 'On Leave'),
        ('reassigned', 'Admin Reassignment'),
        ('patient_request', 'Patient Request'),
        ('performance', 'Performance Issue'),
        ('other', 'Other'),
    ]
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    notes = models.TextField(null=True, blank=True)

    changed_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='delivery_plan_changes'
    )
    changed_on = models.DateTimeField(auto_now_add=True)
    effective_from = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Plan {self.plan_assignment.user_diet_plan_id}: {self.previous_delivery_person} → {self.new_delivery_person}"


# ============================================================
# 📦 LAYER 2 — DAILY EXECUTION
# ============================================================

class DeliveryAssignment(models.Model):
    """
    One row per meal delivery. Auto-created when UserMeal is created.
    Inherits delivery_person + slot from DietPlanDeliveryAssignment.
    For a one-day reassignment (leave etc.) → call reassign().
    """

    user_meal = models.ForeignKey(
        UserMeal,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='deliveries'
    )

    plan_delivery_assignment = models.ForeignKey(
        DietPlanDeliveryAssignment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='daily_assignments'
    )

    delivery_person = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assignments'
    )

    delivery_slot = models.ForeignKey(
        DeliverySlot,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    is_active = models.BooleanField(default=True)

    # Filled only when this row was created due to a reassignment
    reassigned_from = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reassigned_from_deliveries'
    )
    reassignment_reason = models.CharField(max_length=100, null=True, blank=True)

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('assigned', 'Assigned'),
        ('picked_up', 'Picked Up'),
        ('in_transit', 'In Transit'),
        ('delivered', 'Delivered'),
        ('failed', 'Failed'),
        ('rescheduled', 'Rescheduled'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    scheduled_date = models.DateField()
    scheduled_time = models.TimeField(null=True, blank=True)
    picked_up_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    delivery_photo = models.ImageField(upload_to='delivery_proofs/', null=True, blank=True)
    delivery_notes = models.TextField(null=True, blank=True)

    delivery_otp = models.CharField(max_length=6, null=True, blank=True)
    is_otp_verified = models.BooleanField(default=False)

    delivered_lat = models.FloatField(null=True, blank=True)
    delivered_lng = models.FloatField(null=True, blank=True)

    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['delivery_person', 'scheduled_date']),
            models.Index(fields=['user_meal', 'status']),
            models.Index(fields=['user_meal', 'is_active']),
        ]

    def __str__(self):
        return f"Delivery for {self.user_meal} → {self.delivery_person} ({self.status})"

    @classmethod
    def create_from_plan(cls, user_meal):
        """
        Call this whenever a UserMeal is created.
        Auto-pulls delivery_person + slot from the global assignment.
        """
        plan_assignment = (
            DietPlanDeliveryAssignment.objects.filter(
                user_diet_plan=user_meal.user_diet_plan,
                is_active=True,
            )
            .select_related('delivery_person', 'default_slot')
            .first()
        )

        delivery_person = None
        delivery_slot = plan_assignment.default_slot if plan_assignment else None
        if plan_assignment and delivery_slot:
            slot_row = DietPlanSlotDeliveryPerson.objects.filter(
                plan_assignment=plan_assignment,
                delivery_slot=delivery_slot,
            ).select_related('delivery_person').first()
            if slot_row and slot_row.delivery_person_id:
                delivery_person = slot_row.delivery_person
        if delivery_person is None and plan_assignment:
            delivery_person = plan_assignment.delivery_person

        return cls.objects.create(
            user_meal=user_meal,
            plan_delivery_assignment=plan_assignment,
            delivery_person=delivery_person,
            delivery_slot=delivery_slot,
            scheduled_date=user_meal.meal_date,
            status='assigned' if plan_assignment else 'pending',
        )

    @classmethod
    def ensure_for_meal(cls, user_meal):
        """Idempotent: one active daily row per UserMeal (Step 2)."""
        existing = cls.objects.filter(user_meal=user_meal, is_active=True).first()
        if existing:
            return existing
        return cls.create_from_plan(user_meal)

    @classmethod
    def reassign(cls, user_meal, new_person, reason=None, delivery_slot=None):
        """
        Use when delivery person is on leave for a specific day.
        Only affects this one meal. Global assignment stays untouched.
        Optional delivery_slot overrides the previous row's slot (e.g. global per-slot pick).
        """
        old = cls.objects.filter(user_meal=user_meal, is_active=True).first()
        old_person = old.delivery_person if old else None
        resolved_slot = delivery_slot if delivery_slot is not None else (old.delivery_slot if old else None)

        if old:
            old.is_active = False
            old.status = 'rescheduled'
            old.save()

        return cls.objects.create(
            user_meal=user_meal,
            plan_delivery_assignment=old.plan_delivery_assignment if old else None,
            delivery_person=new_person,
            delivery_slot=resolved_slot,
            is_active=True,
            status='assigned',
            scheduled_date=user_meal.meal_date,
            reassigned_from=old_person,
            reassignment_reason=reason,
        )


class SupplyChainDeliveryLeave(models.Model):
    """
    Planned days off for supply-chain delivery staff.
    Micro kitchens can see leaves for people who deliver for them and reassign meals on those days.
    """

    user = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='delivery_leaves',
    )
    LEAVE_TYPE_CHOICES = [
        ('full_day', 'Full Day'),
        ('partial', 'Partial / Half Day'),
    ]
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return f"{self.user} | {self.start_date} -> {self.end_date}"


class DeliveryIssue(models.Model):
    assignment = models.ForeignKey(
        DeliveryAssignment,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='issues'
    )
    reported_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    ISSUE_TYPES = [
        ('not_home', 'Patient Not Home'),
        ('wrong_address', 'Wrong Address'),
        ('food_damaged', 'Food Damaged'),
        ('late_delivery', 'Late Delivery'),
        ('kitchen_delay', 'Kitchen Delay'),
        ('other', 'Other'),
    ]
    issue_type = models.CharField(max_length=30, choices=ISSUE_TYPES)
    description = models.TextField(null=True, blank=True)

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')

    resolved = models.BooleanField(default=False)
    resolved_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_delivery_issues'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.issue_type} | {self.assignment} | {'Resolved' if self.resolved else 'Open'}"


class DeliveryRating(models.Model):
    assignment = models.OneToOneField(
        DeliveryAssignment,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='rating'
    )
    rated_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        super().clean()
        if not self.assignment_id:
            return
        a = self.assignment
        if not a.is_active:
            raise ValidationError(
                {'assignment': 'Rating must be linked to the active delivery row for this meal.'}
            )
        if a.status != 'delivered':
            raise ValidationError(
                {'assignment': 'Rating is only allowed after delivery is completed.'}
            )

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Rating {self.rating}/5 → {self.assignment.delivery_person}"







# -----------------------------------------------
# -----------------------------------------------
# ----------------------------------------------- 



class PatientFoodRecommendation(models.Model):
    patient = models.ForeignKey(
        UserRegister,  
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='food_recommendations'
    )

    food = models.ForeignKey(
        FoodName,
        on_delete=models.SET_NULL,null=True,blank=True,
        related_name='recommended_to'
    )

    # Optional details
    quantity = models.CharField(max_length=100, blank=True, null=True)  
    # e.g., "1 bowl", "2 slices", "100g"

    meal_time = models.ForeignKey(
        MealType,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='food_recommendations'
    )

    # Core requirement
    notes = models.TextField(blank=True, null=True)
    comment = models.TextField(blank=True, null=True)

    recommended_by = models.ForeignKey(
        UserRegister,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    recommended_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patient} - {self.food}"


@receiver(post_save, sender=Order)
def create_order_payment_snapshot(sender, instance, created, **kwargs):
    """
    Auto-create immutable payout split snapshot when a new order is created.
    Skips if no active commission config exists (order still saves; set config in admin).
    """
    if not created:
        return

    if OrderPaymentSnapshot.objects.filter(order=instance).exists():
        return

    try:
        config = OrderCommissionConfig.get_active()
    except ValueError as e:
        logger.warning(
            "OrderPaymentSnapshot skipped for order %s: %s",
            getattr(instance, "pk", instance),
            e,
        )
        return

    food_subtotal = Decimal(str(instance.total_amount or 0))
    delivery_charge = Decimal(str(instance.delivery_charge or 0))
    platform_pct = config.platform_commission_percent
    kitchen_pct = config.kitchen_commission_percent

    platform_amount = (food_subtotal * platform_pct / Decimal("100")).quantize(
        Decimal("0.01")
    )
    kitchen_amount = food_subtotal - platform_amount

    OrderPaymentSnapshot.objects.create(
        order=instance,
        food_subtotal=food_subtotal,
        delivery_charge=delivery_charge,
        grand_total=food_subtotal + delivery_charge,
        platform_percent=platform_pct,
        kitchen_percent=kitchen_pct,
        platform_amount=platform_amount,
        kitchen_amount=kitchen_amount,
    )