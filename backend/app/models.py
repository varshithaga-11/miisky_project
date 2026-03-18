from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings



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
    food = models.ForeignKey(Food, on_delete=models.CASCADE, null=True, blank=True)
    # Example: Ragi Idli

    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, null=True, blank=True)
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

# --------------------------------------------------------------------

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

# --------------------------------------------------------------------


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



# --------------------------------------------------------------------






class TblAminoAcids(models.Model):#Amino Acid Profile

    code = models.CharField(max_length=50)
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    histidine = models.CharField(max_length=50)
    soleucine = models.CharField(max_length=50)
    luecine = models.CharField(max_length=50)
    lysine = models.CharField(max_length=50)
    methionine = models.CharField(max_length=50)
    cystin = models.CharField(max_length=50)
    phenylalanine = models.CharField(max_length=50)
    threonine = models.CharField(max_length=50)
    tryptophan = models.CharField(max_length=50)
    valine = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.ForeignKey('UserRegister', on_delete=models.SET_NULL,null=True,blank=True, db_column='created_by', db_constraint=False)

    class Meta:
        # managed = False
        db_table = 'tbl_amino_acids'


class TblCarotenoid(models.Model):#Carotenoids
    code = models.CharField(max_length=50)
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    txt_lutein = models.CharField(max_length=50)
    txt_zxthn = models.CharField(max_length=50)
    txt_lycopene = models.CharField(max_length=50)
    txt_crypto = models.CharField(max_length=50)
    txt_carotene = models.CharField(max_length=50)
    txt_crtns = models.CharField(max_length=50)
    txt_crt = models.CharField(max_length=50)
    txt_cartd = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    created_by = models.ForeignKey('UserRegister', on_delete=models.SET_NULL, blank=True, null=True, db_column='created_by', db_constraint=False)

    class Meta:
        # managed = False
        db_table = 'tbl_carotenoid'

class TblFatSolubleVtmnsVal(models.Model):#Fat Soluble Vitamins

    code = models.CharField(max_length=50, blank=True, null=True)
    base_unit = models.CharField(max_length=250, blank=True, null=True)
    food_name = models.CharField(max_length=50)
    erg_cal = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    txt_tocpha = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    txt_tocphb = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    txt_tocphg = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    txt_tocphd = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    txt_toctra = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    txt_toctrb = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    txt_toctrg = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    txt_toctrd = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    txt_vite = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField()
    created_by = models.ForeignKey('UserRegister', on_delete=models.SET_NULL, blank=True, null=True, db_column='created_by', db_constraint=False)

    class Meta:
        # managed = False
        db_table = 'tbl_fat_soluble_vtmns_val'


class TblFattyAcid(models.Model):#Fatty Acid Profile

    code = models.CharField(max_length=50)
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    capric = models.CharField(max_length=50)
    lauric = models.CharField(max_length=50)
    myristic = models.CharField(max_length=50)
    palmitic = models.CharField(max_length=50)
    stearic = models.CharField(max_length=50)
    arachidic = models.CharField(max_length=50)
    behenic = models.CharField(max_length=50)
    lignoceric = models.CharField(max_length=50)
    myristoleic = models.CharField(max_length=50)
    palmitoleic = models.CharField(max_length=50)
    oleic = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    craeted_by = models.ForeignKey('UserRegister', on_delete=models.SET_NULL, null=True, blank=True, db_column='craeted_by', db_constraint=False)

    class Meta:
        # managed = False
        db_table = 'tbl_fatty_acid'


class TblFattyAcidProfile(models.Model):#Fatty Acid Profile of Edible Oils and Fats


    food_group = models.CharField(max_length=250)
    code = models.CharField(max_length=50)
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    butyric = models.CharField(max_length=50)
    caproic = models.CharField(max_length=50)
    caprylic = models.CharField(max_length=50)
    capric = models.CharField(max_length=50)
    lauric = models.CharField(max_length=50)
    myristic = models.CharField(max_length=50)
    palmitic = models.CharField(max_length=50)
    stearic = models.CharField(max_length=50)
    arachidic = models.CharField(max_length=50)
    behenic = models.CharField(max_length=50)
    lignoceric = models.CharField(max_length=50)
    myristoleic = models.CharField(max_length=50)
    palmitoleic = models.CharField(max_length=50)
    elaidic = models.CharField(max_length=50)
    oleic = models.CharField(max_length=50)
    eicosenoic = models.CharField(max_length=50)
    erucic = models.CharField(max_length=50)
    linoleic = models.CharField(max_length=50)
    alpha_linolenic = models.CharField(max_length=50)
    tsfa = models.CharField(db_column='TSFA', max_length=50)  # Field name made lowercase.
    tmufa = models.CharField(db_column='TMUFA', max_length=50)  # Field name made lowercase.
    tpufa = models.CharField(db_column='TPUFA', max_length=50)  # Field name made lowercase.
    created_at = models.CharField(max_length=50)
    created_by = models.ForeignKey('UserRegister', on_delete=models.SET_NULL,null=True,blank=True, db_column='created_by', db_constraint=False)

    class Meta:
        # managed = False
        db_table = 'tbl_fatty_acid_profile'


class TblOrganicAcid(models.Model):#Organic Acids

    code = models.CharField(max_length=50)
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    oxalate = models.CharField(max_length=50)
    soluble = models.CharField(max_length=50)
    insoluble = models.CharField(max_length=50)
    citac = models.CharField(max_length=50)
    fumac = models.CharField(max_length=50)
    malac = models.CharField(max_length=50)
    quinic_acid = models.CharField(max_length=50)
    sucac = models.CharField(max_length=50)
    tarac = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_organic_acid'

#
class TblPhytates(models.Model):#OLIGOSACCHARIDES, PHYTOSTEROLS, PHYTATES AND SAPONINS


    code = models.CharField(max_length=50)
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    raffinose = models.CharField(max_length=50)
    stachyose = models.CharField(max_length=50)
    verbascose = models.CharField(max_length=50)
    ajugose = models.CharField(max_length=50)
    campesterol = models.CharField(max_length=50)
    stigmasterol = models.CharField(max_length=50)
    sitostero = models.CharField(max_length=50)
    phytate = models.CharField(max_length=50)
    saponin = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.ForeignKey('UserRegister', on_delete=models.SET_NULL, null=True, blank=True, db_column='created_by', db_constraint=False)

    class Meta:
        # managed = False
        db_table = 'tbl_phytates'


class TblProximateDietaryFiber(models.Model):#Proximate Principles and Dietary Fiber

    code = models.CharField(max_length=15, blank=True, null=True)
    food_group = models.CharField(max_length=50, blank=True, null=True)
    prxmate = models.IntegerField(blank=True, null=True)
    food_name = models.CharField(max_length=50, blank=True, null=True)
    base_unit = models.CharField(max_length=50, blank=True, null=True)
    water = models.CharField(max_length=50, blank=True, null=True)
    protein = models.CharField(max_length=50, blank=True, null=True)
    ash = models.CharField(max_length=50, blank=True, null=True)
    fatce = models.CharField(max_length=50, blank=True, null=True)
    fibtg = models.CharField(max_length=50, blank=True, null=True)
    fibins = models.CharField(max_length=50, blank=True, null=True)
    fibsol = models.CharField(max_length=50, blank=True, null=True)
    choavldf = models.CharField(max_length=50, blank=True, null=True)
    energy = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.CharField(max_length=50, blank=True, null=True)
    created_by = models.ForeignKey('UserRegister', on_delete=models.SET_NULL, null=True, blank=True, db_column='created_by', db_constraint=False)

    class Meta:
        # managed = False
        db_table = 'tbl_proximate_dietary_fiber'


class TblWaterSolubleVtmnsval(models.Model):#Water Soluble Vitamins

    food_group = models.CharField(max_length=50)
    code = models.CharField(max_length=50)
    waterslbl = models.IntegerField()
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    thiamine = models.CharField(max_length=50)
    riboflavin = models.CharField(max_length=50)
    niacin = models.CharField(max_length=50)
    pantothenic = models.CharField(max_length=50)
    txt_vitbc = models.CharField(max_length=50)
    txt_biot = models.CharField(max_length=50)
    txt_folate = models.CharField(max_length=50)
    tx_ascorbic = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.ForeignKey('UserRegister', on_delete=models.SET_NULL, null=True, blank=True, db_column='created_by', db_constraint=False)

    class Meta:
        # managed = False
        db_table = 'tbl_water_soluble_vtmnsval'



class TblProximateData(models.Model):
    proximate_id = models.AutoField(primary_key=True)
    proximate_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_proximate_data'


class TblSubItemGroup(models.Model):
    s_id = models.AutoField(primary_key=True)
    group_name = models.CharField(max_length=250)

    class Meta:
        db_table = 'tbl_sub_item_group'


class TblMinerals(models.Model):#Minerals and Trace Elements

    food_group = models.CharField(max_length=50)
    code = models.CharField(max_length=50)
    minerals = models.ForeignKey('TblProximateData', on_delete=models.SET_NULL, null=True, blank=True, db_column='minerals_id', db_constraint=False)
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    aluminium = models.CharField(max_length=50)
    arsenal = models.CharField(max_length=50)
    cadmium = models.CharField(max_length=50)
    calcium = models.CharField(db_column='calcIum', max_length=50)  # Field name made lowercase.
    chromium = models.CharField(max_length=50)
    cobalt = models.CharField(max_length=50)
    copper = models.CharField(max_length=50)
    iron = models.CharField(max_length=50)
    lead = models.CharField(max_length=50)
    lithium = models.CharField(max_length=50)
    magnesium = models.CharField(max_length=50)
    manganese = models.CharField(max_length=50)
    mercury = models.CharField(max_length=50)
    molebdeum = models.CharField(max_length=50)
    nickel = models.CharField(max_length=50)
    phosphorous = models.CharField(max_length=50)
    potassium = models.CharField(max_length=50)
    selenium = models.CharField(max_length=50)
    sodium = models.CharField(max_length=50)
    zinc = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_minerals'

class TblPolyphenols(models.Model):#Polyphenols
    code = models.CharField(max_length=50)
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    benzoic_acid = models.CharField(max_length=50)
    benzaldehyde = models.CharField(max_length=50)
    protocatechuic = models.CharField(max_length=50)
    vanillic_acid = models.CharField(max_length=50)
    gallic_acid = models.CharField(max_length=50)
    cinamic = models.CharField(max_length=50)
    o_coumaric = models.CharField(max_length=50)
    p_coumaric = models.CharField(max_length=50)
    caffeic_acid = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.ForeignKey('UserRegister', on_delete=models.SET_NULL, null=True, blank=True, db_column='created_by', db_constraint=False)

    class Meta:
        # managed = False
        db_table = 'tbl_polyphenols'


class TblIndividualSugar(models.Model):#Starch and Individual Sugars

    food_group = models.CharField(max_length=50)
    code = models.CharField(max_length=50)
    s_id = models.ForeignKey('TblSubItemGroup', on_delete=models.SET_NULL,null=True,blank=True, db_column='s_id', db_constraint=False)
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    carbo_hydrates = models.CharField(max_length=50)
    starch = models.CharField(max_length=50)
    fructs = models.CharField(max_length=50)
    glucose = models.CharField(max_length=50)
    sucrose = models.CharField(max_length=50)
    maltose = models.CharField(max_length=50)
    sugar = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.ForeignKey('UserRegister', on_delete=models.SET_NULL,null=True,blank=True, db_column='created_by', db_constraint=False)

    class Meta:
        # managed = False
        db_table = 'tbl_individual_sugar'