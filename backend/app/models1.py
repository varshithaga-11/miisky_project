from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# --- User & Base Models ---

class Role(models.Model):
    role_name = models.CharField(max_length=50)
    # status = models.IntegerField()
    is_active=models.BooleanField(default=True)

    class Meta:
        db_table = 'tbl_role'


class UserRegister(AbstractUser):
    # title = models.CharField(max_length=50, null=True, blank=True)
    # type = models.IntegerField(null=True, blank=True)
    # contact_info = models.CharField(max_length=100, null=True, blank=True)
    first_name=models.CharField(max_length=100, null=True, blank=True)
    last_name=models.CharField(max_length=00, null=True, blank=True)
    photo = models.FileField(null=True,blank=True)
    # status = models.IntegerField(null=True, blank=True)
    # activate_code = models.CharField(max_length=15, null=True, blank=True)
    # reset_code = models.CharField(max_length=15, null=True, blank=True)
    created_on = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=50, null=True, blank=True)
    # city_id = models.CharField(max_length=255, null=True, blank=True)
    city=models.CharField(max_length=255, null=True, blank=True)
    # state_id = models.CharField(max_length=50, null=True, blank=True)
    state = models.CharField(max_length=50, null=True, blank=True)

    mobile = models.IntegerField(max_length=10, null=True, blank=True)
    role = models.ForeignKey(
        Role,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='role_id'
    )


    address= models.CharField(max_length=50, null=True, blank=True)
    zip_code = models.IntegerField(null=True, blank=True)
    # lattitude = models.CharField(max_length=50, null=True, blank=True)
    # longitude = models.CharField(max_length=50, null=True, blank=True)
    dob = models.DateField(null=True,blank=True)
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    unique_id = models.CharField(max_length=50, null=True, blank=True)
    vault_no = models.CharField(max_length=100, null=True, blank=True)
    qr_path = models.CharField(max_length=500, null=True, blank=True)
    # location = models.CharField(max_length=100, null=True, blank=True)
    file_name = models.CharField(max_length=1000, null=True, blank=True)
    whatsapp = models.CharField(max_length=50, null=True, blank=True)
    group_name = models.CharField(max_length=100, null=True, blank=True)#blood group
    caste = models.CharField(max_length=100, null=True, blank=True)
    religion = models.CharField(max_length=100, null=True, blank=True)
    medical_history = models.CharField(max_length=500, null=True, blank=True)
    join_date = models.DateTimeField(null=True, blank=True)
    # company_name = models.CharField(max_length=50, null=True, blank=True)
    dor = models.CharField(max_length=50, null=True, blank=True)
    # company_status_id = models.IntegerField(null=True, blank=True)
    company=models.ForeignKey('Company',on_delete=models.SET_NULL,null=True,blank=True)
    bank_name = models.CharField(max_length=50, null=True, blank=True)
    acc_no = models.BigIntegerField(null=True, blank=True)
    branch_name = models.CharField(max_length=50, null=True, blank=True)
    ifsc_code = models.CharField(max_length=50, null=True, blank=True)
    gst_no = models.CharField(max_length=50, null=True, blank=True)
    date = models.CharField(max_length=50, null=True, blank=True)
    txt_others = models.CharField(max_length=50, null=True, blank=True)
    txt_food_preferance = models.CharField(max_length=50, null=True, blank=True)
    food_style_name = models.CharField(max_length=50, null=True, blank=True)
    txt_qualification = models.CharField(max_length=50, null=True, blank=True)
    txt_computer_knowledge = models.CharField(max_length=50, null=True, blank=True)
    micro_kitchen_code = models.CharField(max_length=50, null=True, blank=True)
    food_category = models.CharField(max_length=50, null=True, blank=True)
    details_of_vehicle = models.TextField(null=True, blank=True)
    register_number = models.CharField(max_length=250, null=True, blank=True)
    lc_copy = models.CharField(max_length=250, null=True, blank=True)
    aadhar_copy_supply_chain = models.CharField(max_length=250, null=True, blank=True)
    upload_photo_selfie_sc = models.CharField(max_length=250, null=True, blank=True)
    work_expirence = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'users'

# class Role(models.Model):
#     role_name = models.CharField(max_length=50)
#     status = models.IntegerField()

#     class Meta:
#         db_table = 'tbl_role'


# class Status(models.Model):
#     status_name = models.CharField(max_length=50)

#     class Meta:
#         db_table = 'tbl_status'


# class Country(models.Model):
#     name = models.CharField(max_length=50)
#     created_at = models.DateField()

#     class Meta:
#         db_table = 'tbl_country'


# class State(models.Model):
#     state_name = models.CharField(max_length=333)
#     country = models.ForeignKey(
#         Country,
#         on_delete=models.CASCADE,
#         db_column='country_id'
#     )

#     class Meta:
#         db_table = 'tbl_state'


# class City(models.Model):
#     city_name = models.CharField(max_length=333)
#     state = models.ForeignKey(
#         State,
#         on_delete=models.CASCADE,
#         db_column='state_id'
#     )

#     class Meta:
#         db_table = 'tbl_city'

class Community(models.Model):
    community_name = models.CharField(max_length=250)
    brief_on_community = models.CharField(max_length=250)
    code = models.CharField(max_length=50)
    created_at = models.DateField()
    posted_by = models.ForeignKey(UserRegister,on_delete=models.SET_NULL,null=True)

    class Meta:
        db_table = 'tbl_community'


# --- Recipe & Food Management ---

class RecipeDevEntryThree(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        db_column='user_id'
    )
    input_one = models.CharField(max_length=50)
    eq_base_qty = models.CharField(max_length=50)
    food_group = models.CharField(max_length=50)
    uom_master_id = models.CharField(max_length=50)
    input_two = models.CharField(max_length=50)
    eq_base_qty_two = models.CharField(max_length=50)
    food_group_two = models.CharField(max_length=50)
    uom_master_id_two = models.CharField(max_length=50)
    input_three = models.CharField(max_length=50)
    eq_base_qty_three = models.CharField(max_length=50)
    food_group_three = models.CharField(max_length=50)
    uom_master_id_three = models.CharField(max_length=50)
    input_four = models.CharField(max_length=50)
    eq_base_qty_four = models.CharField(max_length=50)
    food_group_four = models.CharField(max_length=50)
    uom_master_id_four = models.CharField(max_length=50)
    input_five = models.CharField(max_length=50)
    eq_base_qty_five = models.CharField(max_length=50)
    food_group_five = models.CharField(max_length=50)
    uom_master_id_five = models.CharField(max_length=50)
    input_six = models.CharField(max_length=50)
    eq_base_qty_six = models.CharField(max_length=50)
    food_group_six = models.CharField(max_length=50)
    uom_master_id_six = models.CharField(max_length=50)
    input_seven = models.CharField(max_length=50)
    eq_base_qty_seven = models.CharField(max_length=50)
    food_group_seven = models.CharField(max_length=50)
    uom_master_id_seven = models.CharField(max_length=50)
    input_eight = models.CharField(max_length=50)
    eq_base_qty_eight = models.CharField(max_length=50)
    food_group_eight = models.CharField(max_length=50)
    uom_master_id_eight = models.CharField(max_length=50)
    input_eight_nine = models.CharField(max_length=50)
    eq_base_qty_nine = models.CharField(max_length=50)
    food_group_nine = models.CharField(max_length=50)
    uom_master_id_nine = models.CharField(max_length=50)
    input_eight_ten = models.CharField(max_length=50)
    eq_base_qty_ten = models.CharField(max_length=50)
    food_group_ten = models.CharField(max_length=50)
    uom_master_id_ten = models.CharField(max_length=50)
    recepe_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'add_recepe_dev_entry_three'


class RecipeDevEntryTwo(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    recepe_name = models.CharField(max_length=50)
    food_category = models.ForeignKey(
        'FoodCategory',
        on_delete=models.CASCADE,
        db_column='food_category_id'
    )#apple banana
    food_style = models.ForeignKey(
        'TblFoodstyleMaster',
        on_delete=models.CASCADE,
        db_column='food_style_id'
    )
    # country = models.ForeignKey(
    #     Country,
    #     on_delete=models.CASCADE,
    #     db_column='country_id'
    # )
    # state = models.ForeignKey(
    #     State,
    #     on_delete=models.CASCADE,
    #     db_column='state_id'
    # )
    uom_master_id = models.CharField(max_length=50)
    base_qty = models.CharField(max_length=50)
    uom_master_id_two = models.CharField(max_length=50)
    eq_serving_qty = models.CharField(max_length=50)
    ingredients = models.CharField(max_length=10000)
    recepe_image = models.CharField(max_length=250)
    prepration_method_step1 = models.CharField(max_length=10000)
    prepration_method_step2 = models.CharField(max_length=20000)
    prepration_method_step3 = models.CharField(max_length=20000)
    total_prepration_time = models.CharField(max_length=50)
    add_on = models.CharField(max_length=255, null=True)
    vegetables = models.CharField(max_length=255, null=True)
    fruites_and_juices = models.CharField(max_length=255, null=True)
    calorie = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    carbo_hydrates = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    vitamins = models.CharField(max_length=255, null=True)
    fats = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    protein = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    sodium = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    cholestrol = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    iron = models.DecimalField(max_digits=10, decimal_places=2, null=True)

    class Meta:
        db_table = 'add_recepe_dev_entry_two'

class FoodCategory(models.Model):#appple banana
    food_category_name = models.CharField(max_length=50)
    remarks = models.CharField(max_length=100)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status = models.ForeignKey(
        Status,
        on_delete=models.CASCADE,
        db_column='status_id'
    )

    class Meta:
        db_table = 'tbl_food_category'


class FoodSubgroup(models.Model):
    subgroub_name = models.CharField(max_length=250)
    created_by = models.IntegerField()
    created_at = models.DateField()

    class Meta:
        db_table = 'tbl_food_subgroup'


class FoodMainCode(models.Model):
    food_main_category = models.CharField(max_length=250)
    food_main_code = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_main_code'


class FoodMaster(models.Model):
    food_category = models.CharField(max_length=250)
    food_code = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_master'


class FoodProduct(models.Model):
    category = models.ForeignKey(
        'Category',
        on_delete=models.CASCADE,
        db_column='category_id'
    )
    product_code = models.CharField(max_length=50, unique=True)
    product_title = models.CharField(max_length=50)
    uom = models.CharField(max_length=50)
    specification = models.CharField(max_length=100)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status = models.ForeignKey(
        Status,
        on_delete=models.CASCADE,
        db_column='status_id'
    )

    class Meta:
        db_table = 'tbl_food_product'

class RecipeBuilder(models.Model):
    food_master_id = models.CharField(max_length=50)
    items = models.ForeignKey(
        'TblItems',
        on_delete=models.CASCADE,
        db_column='items_id'
    )
    m_id = models.IntegerField()
    txtqty = models.CharField(max_length=50)
    uom_master = models.ForeignKey(
        'UomMaster',
        on_delete=models.CASCADE,
        db_column='uom_master_id'
    )
    txt_ingrdnts = models.CharField(max_length=2000)
    upload_image = models.CharField(max_length=250)
    item_no = models.CharField(max_length=50)
    item_description = models.CharField(max_length=1000)
    qty = models.CharField(max_length=50)
    unit_of_m = models.CharField(max_length=50)
    ingredients_master = models.ForeignKey(
        'TblIngredientsMaster',
        on_delete=models.CASCADE,
        db_column='ingredients_master_id'
    )
    input_code = models.CharField(max_length=50)
    food_name_data = models.CharField(max_length=50)
    clrs = models.CharField(max_length=50)
    crbhydrts = models.CharField(max_length=50)
    vtmns = models.CharField(max_length=50)
    fts = models.CharField(max_length=50)
    prtn = models.CharField(max_length=50)
    sdm = models.CharField(max_length=50)
    cltrl = models.CharField(max_length=50)
    irn = models.CharField(max_length=50)
    v_id = models.IntegerField()
    add_recepe = models.CharField(max_length=1000)
    diet_plan_for = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_rcp_builder'


# --- Diet & Nutrition ---

class DietPlanMaster(models.Model):
    dietplan = models.ForeignKey(
        'TblDietplanAddMasterTable',
        on_delete=models.CASCADE,
        db_column='dietplan_id'
    )
    status = models.IntegerField(default=0)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'diet_plan_master'


class DietQualification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    qulification = models.CharField(max_length=250)
    report = models.CharField(max_length=250)
    recognitions = models.CharField(max_length=250)

    class Meta:
        db_table = 'diet_qualification_details'

class UomMaster(models.Model):#kg,gram ,litters,cup,inch ,pound
    code = models.CharField(max_length=50)
    uom = models.CharField(max_length=100)
    created_at = models.DateTimeField()

    class Meta:
        db_table = 'tbl_uom_master'

class Minerals(models.Model):
    food_group = models.CharField(max_length=50)
    code = models.CharField(max_length=50)
    minerals_id = models.IntegerField()
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    aluminium = models.CharField(max_length=50)
    arsenal = models.CharField(max_length=50)
    cadmium = models.CharField(max_length=50)
    calcIum = models.CharField(max_length=50)
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
        db_table = 'tbl_minerals'

# --- Products & Commerce ---

class Category(models.Model):
    name = models.CharField(max_length=100)
    cat_slug = models.CharField(max_length=100, null=True)

    class Meta:
        db_table = 'category'

class Products(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        db_column='category_id'
    )
    name = models.TextField()
    description = models.TextField()
    slug = models.CharField(max_length=200)
    price = models.FloatField()
    photo = models.CharField(max_length=200)
    date_view = models.DateField()
    counter = models.IntegerField()

    class Meta:
        db_table = 'products'

class Cart(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    product = models.ForeignKey(
        Products,
        on_delete=models.CASCADE,
        db_column='product_id'
    )
    quantity = models.IntegerField()

    class Meta:
        db_table = 'cart'

class Sales(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    pay_id = models.CharField(max_length=50)
    sales_date = models.DateField()

    class Meta:
        db_table = 'sales'

class Details(models.Model):
    sales = models.ForeignKey(
        Sales,
        on_delete=models.CASCADE,
        db_column='sales_id'
    )
    product = models.ForeignKey(
        Products,
        on_delete=models.CASCADE,
        db_column='product_id'
    )
    quantity = models.IntegerField()

    class Meta:
        db_table = 'details'

# --- Misc System Tables ---

class Blog(models.Model):
    messages = models.CharField(max_length=5000)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    status = models.ForeignKey(
        Status,
        on_delete=models.CASCADE,
        db_column='status_id'
    )

    class Meta:
        db_table = 'blog'

class Feedback(models.Model):
    name = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    rbtn = models.CharField(max_length=50)
    messages = models.CharField(max_length=500)
    user_id = models.IntegerField()
    status_id = models.IntegerField()

    class Meta:
        db_table = 'feedback'

# --- Health & Patient Systems ---

class HealthFoodPlan(models.Model):
    name = models.CharField(max_length=100, null=True)
    age = models.IntegerField(null=True)
    gender = models.CharField(max_length=20, null=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    work_type = models.CharField(max_length=100, null=True)
    health_issue_main = models.CharField(max_length=255, null=True)
    health_issues = models.TextField(null=True)
    autoimmune = models.CharField(max_length=50, null=True)
    symptoms = models.TextField(null=True)
    surgery = models.CharField(max_length=50, null=True)
    surgery_type = models.CharField(max_length=255, null=True)
    skin_issues = models.TextField(null=True)
    vitamin_deficiency = models.CharField(max_length=255, null=True)
    food_habits = models.CharField(max_length=255, null=True)
    egg = models.CharField(max_length=20, null=True)
    milk = models.CharField(max_length=20, null=True)
    food_allergy = models.CharField(max_length=20, null=True)
    food_allergy_name = models.CharField(max_length=255, null=True)
    meals = models.CharField(max_length=255, null=True)
    snacks = models.CharField(max_length=255, null=True)
    skip_meals = models.CharField(max_length=100, null=True)
    food_source = models.CharField(max_length=255, null=True)
    dietician = models.CharField(max_length=20, null=True)
    dietician_name = models.CharField(max_length=100, null=True)
    dietician_location = models.CharField(max_length=255, null=True)
    dietician_phone = models.CharField(max_length=20, null=True)
    activity = models.CharField(max_length=50, null=True)
    activity_list = models.TextField(null=True)
    activity_other = models.CharField(max_length=255, null=True)
    habits = models.TextField(null=True)
    improve_health = models.TextField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'health_food_plan'

class PatientHistory(models.Model):
    pat_name = models.CharField(max_length=50)
    pat_location = models.CharField(max_length=50)
    pat_medical_history = models.CharField(max_length=500)
    pat_health_param = models.CharField(max_length=50)
    pat_glucose = models.CharField(max_length=50)
    pat_heart_rate = models.CharField(max_length=50)
    pat_ecg = models.CharField(max_length=50)
    pat_bp_syst = models.CharField(max_length=50)
    pat_bp_diast = models.CharField(max_length=50)
    pat_hb = models.CharField(max_length=50)
    pat_kidney = models.CharField(max_length=50)
    pat_other_param = models.CharField(max_length=50)
    pat_doctor = models.CharField(max_length=50)
    pat_last_report = models.CharField(max_length=500)

    class Meta:
        db_table = 'patient_history'

class Dietician(models.Model):
    name = models.CharField(max_length=50)
    photo = models.CharField(max_length=500)
    location = models.CharField(max_length=100)
    contact = models.CharField(max_length=20)
    role = models.ForeignKey(
        Role,
        on_delete=models.CASCADE,
        db_column='role_id'
    )
    created_at = models.DateTimeField()

    class Meta:
        db_table = 'tbl_dietician'

# --- Nutrition Detailed Tables ---

class AminoAcids(models.Model):
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
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_amino_acids'

class ProximateDietaryFiber(models.Model):
    code = models.CharField(max_length=15)
    food_group = models.CharField(max_length=50)
    prxmate = models.IntegerField()
    food_name = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    water = models.CharField(max_length=50)
    protein = models.CharField(max_length=50)
    ash = models.CharField(max_length=50)
    fatce = models.CharField(max_length=50)
    fibtg = models.CharField(max_length=50)
    fibins = models.CharField(max_length=50)
    fibsol = models.CharField(max_length=50)
    choavldf = models.CharField(max_length=50)
    energy = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_proximate_dietary_fiber'

class FattyAcidProfile(models.Model):
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
    TSFA = models.CharField(max_length=50)
    TMUFA = models.CharField(max_length=50)
    TPUFA = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_fatty_acid_profile'

class IndividualSugar(models.Model):
    food_group = models.CharField(max_length=50)
    code = models.CharField(max_length=50)
    s_id = models.IntegerField()
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
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_individual_sugar'

# --- Ingredients & Supplies ---

class Ingredients(models.Model):
    food_group = models.CharField(max_length=50)
    code = models.CharField(max_length=50)
    food_name_data = models.CharField(max_length=50)
    qty = models.CharField(max_length=50)
    uom = models.CharField(max_length=50)
    clrs = models.CharField(max_length=50)
    crbhydrts = models.CharField(max_length=50)
    vtmns = models.CharField(max_length=100)
    fts = models.CharField(max_length=50)
    prtn = models.CharField(max_length=50)
    sdm = models.CharField(max_length=50)
    cltrl = models.CharField(max_length=50)
    irn = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    status_id = models.IntegerField(default=0)
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_ingredients'

class Suppliers(models.Model):
    vault_no = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=250)
    gst_no = models.CharField(max_length=50)
    contact_no = models.IntegerField()
    representive_name = models.CharField(max_length=50)
    bank_name = models.CharField(max_length=50)
    acc_no = models.BigIntegerField()
    branch_name = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=50)
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_suppliers'

class Tutorial(models.Model):
    titel = models.CharField(max_length=255, null=True)
    message = models.TextField(null=True)
    channel1_data = models.CharField(max_length=250, null=True)
    posted_by = models.IntegerField(null=True)
    date = models.CharField(max_length=50, null=True)
    updated_date = models.CharField(max_length=50, null=True)
    likes = models.IntegerField(default=0)
    youtube_link = models.CharField(max_length=250, null=True)

    class Meta:
        db_table = 'tutorial'

# --- Advanced Food & Logistics ---

class FoodRecipe(models.Model):
    food_product_id = models.CharField(max_length=11)
    ingredients = models.CharField(max_length=250)
    uom_master = models.ForeignKey(
        UomMaster,
        on_delete=models.CASCADE,
        db_column='uom_master_id'
    )
    base_qty = models.IntegerField()
    description = models.CharField(max_length=250)
    special_instruction = models.CharField(max_length=250)
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_recepe'

class InputBOM(models.Model):
    items = models.ForeignKey(
        'TblItems',
        on_delete=models.CASCADE,
        db_column='items_id'
    )
    code = models.CharField(max_length=50)
    food_category_id = models.IntegerField()
    food_code = models.CharField(max_length=50)
    recepe_title = models.CharField(max_length=50)
    food_group = models.CharField(max_length=50)
    input_code = models.CharField(max_length=50)
    food_name_data = models.CharField(max_length=50)
    base_qty_units = models.CharField(max_length=50)
    base_qty_uoms = models.CharField(max_length=50)
    serving_qty_unit = models.CharField(max_length=50)
    serving_qty_unit_uoms = models.CharField(max_length=50)
    base_unit = models.IntegerField()
    base_unit_uom = models.CharField(max_length=50)
    conversion_factor = models.CharField(max_length=50)
    con_uom = models.CharField(max_length=50)
    served_qty = models.CharField(max_length=50)
    served_qty_uom = models.CharField(max_length=50)
    clrs = models.CharField(max_length=50)
    crbhydrts = models.CharField(max_length=50)
    clcm = models.CharField(max_length=50)
    fts = models.CharField(max_length=50)
    prtn = models.CharField(max_length=50)
    phprs = models.CharField(max_length=50)
    cltrl = models.CharField(max_length=50)
    irn = models.CharField(max_length=50)
    cmp_id = models.IntegerField()
    created_at = models.CharField(max_length=50)
    created_by = models.CharField(max_length=11)

    class Meta:
        db_table = 'tbl_input_bom'

class OrderSentLogistic(models.Model):
    patient_name = models.CharField(max_length=50)
    food_category = models.CharField(max_length=50)
    food_style_name = models.CharField(max_length=50)
    food_category_name = models.CharField(max_length=50)
    food_pack_description = models.CharField(max_length=250)
    cook_inst = models.CharField(max_length=250)
    order_service = models.CharField(max_length=50)
    service_date = models.CharField(max_length=50)
    u_id = models.IntegerField()
    created_by = models.IntegerField()
    created_at = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_order_sent_logistic'

class WaterSolubleVitamins(models.Model):
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
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_water_soluble_vtmnsval'

class CallBack(models.Model):
    description = models.TextField(null=True)
    time_slot = models.CharField(max_length=250, null=True)
    google_meet_link = models.CharField(max_length=250, null=True)
    diet_id = models.IntegerField()
    patient_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'call_back'

class ChefPatientFood(models.Model):
    date = models.DateTimeField()
    patient_code = models.CharField(max_length=50)
    product_code = models.CharField(max_length=50)
    qty = models.IntegerField()
    remarks = models.CharField(max_length=100)
    food_shift = models.CharField(max_length=50)
    status = models.IntegerField()

    class Meta:
        db_table = 'chef_patient_food'

class ChefRecipes(models.Model):
    patient_code = models.CharField(max_length=50)
    product_code = models.CharField(max_length=50)
    nutrionist_code = models.CharField(max_length=50)
    ingredients = models.CharField(max_length=50)
    item_code = models.CharField(max_length=50)
    descr = models.CharField(max_length=50)
    uom = models.CharField(max_length=50)
    qty = models.IntegerField()
    source = models.CharField(max_length=100)
    suggetion = models.CharField(max_length=500)
    special_instruction = models.CharField(max_length=500)
    food_shift = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    status = models.IntegerField()

    class Meta:
        db_table = 'chef_recipies'


# --- Diet Food Style (from db_food PDF) ---

class DietFoodStyleAdd(models.Model):
    food_style_master = models.ForeignKey(
        'DietFoodStyleMaster',
        on_delete=models.CASCADE,
        db_column='food_style_master_id'
    )
    created_at = models.DateField(null=True)
    created_by = models.ForeignKey(UserRegister,on_delete=models.SET_NULL,null=True,blank=True)

    class Meta:
        db_table = 'diet_food_style_add'


class DietFoodStyleDataAdd(models.Model):
    country_id = models.IntegerField()
    state_id = models.IntegerField()
    city_id = models.IntegerField()
    # community_id = models.IntegerField()
    Community=models.ForeignKey(Community,on_delete=models.SET_NULL,null=True,blank=True)
    food_style_add_id = models.IntegerField()
    patient_id = models.IntegerField()
    patient=models.ForeignKey(UserRegister,on_delete=models.SET_NULL,null=True,blank=True)
    created_at = models.DateField()
    created_by = models.ForeignKey(UserRegister,on_delete=models.SET_NULL,null=True,blank=True)

    class Meta:
        db_table = 'diet_food_style_data_add'


class DietFoodStyleMaster(models.Model):
    food_style = models.ForeignKey(
        'TblFoodstyleMaster',
        on_delete=models.CASCADE,
        db_column='food_style_id'
    )#only 3 options -breakfast,lunch , dinner
    status = models.IntegerField(null=True, default=0)
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'diet_food_style_master'


class DietSvasthfoodGroupMaster(models.Model):
    food_category = models.ForeignKey(
        FoodCategory,
        on_delete=models.CASCADE,
        db_column='food_category_id'
    )
    status = models.IntegerField(default=0)
    created_by = models.IntegerField()
    created_at = models.DateField()

    class Meta:
        db_table = 'diet_svasthfood_group_master'


class DietSvasthFoodGroupAdd(models.Model):
    food_group = models.ForeignKey(
        DietSvasthfoodGroupMaster,
        on_delete=models.CASCADE,
        db_column='food_group_id'
    )
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'diet_svasth_food_group_add'


class DietSvasthGroupAddData(models.Model):
    food_group_add = models.ForeignKey(
        DietSvasthFoodGroupAdd,
        on_delete=models.CASCADE,
        db_column='food_group_add_id'
    )
    food_style_add = models.ForeignKey(
        DietFoodStyleAdd,
        on_delete=models.CASCADE,
        db_column='food_style_add_id'
    )
    dietitian_comment = models.CharField(max_length=250)
    patient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        db_column='patient_id'
    )
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'diet_svasth_group_add_data'


# --- Misc System (from db_food PDF) ---

class Images(models.Model):
    image = models.CharField(max_length=100)
    image_text = models.TextField()

    class Meta:
        db_table = 'images'


class IpaddressLikesMap(models.Model):
    tutorial_id = models.IntegerField()
    ip_address = models.CharField(max_length=255)

    class Meta:
        db_table = 'ipaddress_likes_map'


class Likes(models.Model):
    userid = models.IntegerField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'likes'


class MyPages(models.Model):
    name = models.CharField(max_length=50)
    mobile = models.CharField(max_length=20)
    email = models.CharField(max_length=50)
    address = models.CharField(max_length=1000)
    food_master_id = models.IntegerField()
    sub_group_id = models.IntegerField()
    food_main_id = models.IntegerField()
    description = models.CharField(max_length=250)
    country_name = models.CharField(max_length=50)
    state_name = models.CharField(max_length=50)
    ingredients = models.CharField(max_length=1000)
    recipe = models.CharField(max_length=1000)
    photo = models.CharField(max_length=1000)

    class Meta:
        db_table = 'my_pages'


class ProductsUploadImage(models.Model):
    product = models.ForeignKey(
        Products,
        on_delete=models.CASCADE,
        db_column='product_id'
    )
    photo = models.CharField(max_length=1000)
    image_title = models.CharField(max_length=50)
    description = models.CharField(max_length=500)
    status_id = models.IntegerField()
    added_at = models.DateTimeField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'products_upload_image'


# --- tbl_* Tables (from db_food PDF) ---

class TblBlogsDietitian(models.Model):
    image = models.CharField(max_length=250)

    class Meta:
        db_table = 'tbl_blogs_dietitian'


class TblCallCenter(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_call_center'


class TblCallCenterAdd(models.Model):
    cal_ceneter_id = models.IntegerField()
    message = models.CharField(max_length=50)
    created_at = models.IntegerField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_call_center_add'


class TblCarotenoid(models.Model):
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
    created_at = models.CharField(max_length=50)
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_carotenoid'


class TblChefFeedback(models.Model):
    subject = models.CharField(max_length=250)
    chef_comment = models.CharField(max_length=250)
    created_at = models.CharField(max_length=250)
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_chef_feedback'


class TblCommentsAdd(models.Model):
    tutorial_id = models.IntegerField()
    ip_address = models.CharField(max_length=250)
    name = models.CharField(max_length=50)
    comments = models.CharField(max_length=500)
    post_date = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_comments_add'


class TblCompanyStatus(models.Model):
    status = models.CharField(max_length=50)
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_company_status'


class TblCompositionIndex(models.Model):
    composition_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_composition_index'


class TblCookingInstruction(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_cooking_instruction'


class TblCreateDietician(models.Model):
    patients = models.CharField(max_length=50)
    patients_category = models.IntegerField()
    food_plan = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_create_dietician'


class TblDays(models.Model):
    days_name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_days'


class TblDevelopSchedule(models.Model):
    food_group_add_id = models.IntegerField()
    time_slot = models.CharField(max_length=50)
    food_packing_id = models.IntegerField()
    patient_id = models.IntegerField()
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_develop_schedule'


class TblDieticianComment(models.Model):
    dietician_comment = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()
    patient_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_dietician_comment'


class TblDieticianDislikeParameter(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_dietician_dislike_parameter'


class TblDieticianLikeParameter(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_dietician_like_parameter'


class TblDietplanAddMasterTable(models.Model):
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=1000)
    code = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_dietplan_add_master_table'


class TblDietplanMasterTable(models.Model):
    dietplan_id = models.IntegerField()
    dietitian_comment = models.CharField(max_length=250)
    created_by = models.IntegerField()
    created_at = models.DateField()
    patient_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_dietplan_master_table'


class TblDietAddSnacks(models.Model):
    snacks_id = models.IntegerField()
    time_slot = models.CharField(max_length=50)
    snacks_name = models.CharField(max_length=50)
    patient_id = models.IntegerField()
    posted_by = models.IntegerField()
    created_at = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_diet_add_snacks'


class TblDietFoodIndexData(models.Model):
    m_id = models.CharField(max_length=50)
    s_id = models.IntegerField()
    qty = models.IntegerField()
    energy = models.CharField(max_length=250)
    carbo_hydrates = models.CharField(max_length=250)
    calcium = models.CharField(max_length=250)
    fats = models.CharField(max_length=250)
    protein = models.CharField(max_length=250)
    phosphorus = models.CharField(max_length=250)
    cholestrol = models.CharField(max_length=250)
    iron = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_diet_food_index_data'


class TblDietFoodPatientIndex(models.Model):
    calorie = models.CharField(max_length=250)
    carbo_hydrates = models.CharField(max_length=250)
    vitamins = models.CharField(max_length=250)
    fats = models.CharField(max_length=250)
    protein = models.CharField(max_length=250)
    sodium = models.CharField(max_length=250)
    cholestrol = models.CharField(max_length=250)
    iron = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_diet_food_patient_index'


class TblDietPlansAdd(models.Model):
    diet_pln_id = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_diet_plans_add'


class TblDietPlanGeneratorReport(models.Model):
    patient_name = models.CharField(max_length=50)
    health_history = models.CharField(max_length=50)
    diet_plan_code = models.IntegerField()
    diet_plan = models.IntegerField()
    description = models.CharField(max_length=250)
    posted_by = models.IntegerField()
    created_at = models.IntegerField()

    class Meta:
        db_table = 'tbl_diet_plan_generator_report'


class TblDietSnacks(models.Model):
    snacks_name = models.CharField(max_length=250)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_diet_snacks'


class TblDoctorsComment(models.Model):
    doctor_comment = models.TextField()
    created_at = models.DateField()
    doctor_id = models.IntegerField()
    patient_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_doctors_comment'


class TblDosAndDont(models.Model):
    health_parameter = models.CharField(max_length=50)
    food_category = models.CharField(max_length=50)
    food_products = models.CharField(max_length=50)
    dos_and_dont = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_dos_and_dont'


class TblEcgData(models.Model):
    titel = models.CharField(max_length=50)
    message = models.CharField(max_length=3000)
    channel1_data = models.CharField(max_length=50)
    posted_by = models.IntegerField()
    date = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_ecg_data'


class TblFattyAcid(models.Model):
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
    created_by = models.IntegerField(db_column='craeted_by')

    class Meta:
        db_table = 'tbl_fatty_acid'


class TblFatSolubleVtmnsVal(models.Model):
    code = models.CharField(max_length=50)
    base_unit = models.CharField(max_length=50)
    food_name = models.CharField(max_length=50)
    erg_cal = models.CharField(max_length=50)
    txt_tocpha = models.CharField(max_length=50)
    txt_tocphb = models.CharField(max_length=50)
    txt_tocphg = models.CharField(max_length=50)
    txt_tocphd = models.CharField(max_length=50)
    txt_toctra = models.CharField(max_length=50)
    txt_toctrb = models.CharField(max_length=50)
    txt_toctrg = models.CharField(max_length=50)
    txt_toctrd = models.CharField(max_length=50)
    txt_vite = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_fat_soluble_vtmns_val'


class TblFoodstyleMaster(models.Model):#only 3 -braekfast,lunch , dinner
    food_style_code = models.CharField(max_length=25)
    title = models.CharField(max_length=50)
    created_by = models.IntegerField()
    created_at = models.DateField()

    class Meta:
        db_table = 'tbl_foodstyle_master'


class TblFoodDietIndexData(models.Model):
    m_id = models.IntegerField()
    calorie = models.CharField(max_length=250)
    carbo_hydrates = models.CharField(max_length=250)
    vitamins = models.CharField(max_length=250)
    fats = models.CharField(max_length=250)
    protein = models.CharField(max_length=250)
    sodium = models.CharField(max_length=250)
    cholestrol = models.CharField(max_length=250)
    iron = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_diet_index_data'


class TblFoodMainDataAdd(models.Model):
    food_master_id = models.IntegerField()
    code = models.IntegerField()
    food_main_id = models.IntegerField()
    sub_group_id = models.IntegerField()
    description = models.CharField(max_length=250)
    calorie = models.CharField(max_length=250)
    carbo_hydrates = models.CharField(max_length=250)
    vitamins = models.CharField(max_length=250)
    fats = models.CharField(max_length=250)
    protein = models.CharField(max_length=250)
    created_by = models.IntegerField()
    created_at = models.DateField()
    sodium = models.CharField(max_length=250)
    cholestrol = models.CharField(max_length=250)
    iron = models.CharField(max_length=250)

    class Meta:
        db_table = 'tbl_food_main_data_add'


class TblFoodMenu(models.Model):
    m_id = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_menu'


class TblFoodPacking(models.Model):
    food_pack_description = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_packing'


class TblFoodPlanGenerator(models.Model):
    week_id = models.IntegerField()
    d_id = models.IntegerField()
    food_master_id = models.IntegerField()
    food_style_add_id = models.IntegerField()
    country_id = models.IntegerField()
    state_id = models.IntegerField()
    items_id = models.IntegerField()
    m_id = models.CharField(max_length=1000)
    um = models.CharField(max_length=50)
    food_group = models.CharField(max_length=250)
    input_code = models.CharField(max_length=50)
    food_name_data = models.CharField(max_length=50)
    base_qty_units = models.IntegerField()
    base_qty_uoms = models.CharField(max_length=50)
    serving_qty_unit = models.IntegerField()
    serving_qty_unit_uoms = models.CharField(max_length=50)
    calorie = models.CharField(max_length=50)
    carbo_hydrates = models.CharField(max_length=50)
    vitamins = models.CharField(max_length=50)
    fats = models.CharField(max_length=50)
    protein = models.CharField(max_length=50)
    sodium = models.CharField(max_length=50)
    cholestrol = models.CharField(max_length=50)
    iron = models.CharField(max_length=50)
    start = models.DateField()
    posted_by = models.IntegerField()
    patient_id = models.IntegerField()
    patient_weight = models.CharField(max_length=50, null=True)
    patient_height = models.CharField(max_length=50, null=True)
    patient_bmi = models.CharField(max_length=50, null=True)
    ingredients = models.TextField(null=True)
    add_on = models.TextField(null=True)
    fruites_and_juices = models.TextField(null=True)
    vegetables = models.TextField(null=True)
    disease_name = models.CharField(max_length=100, null=True)
    title = models.CharField(max_length=50)
    like = models.IntegerField(default=0)

    class Meta:
        db_table = 'tbl_food_plan_generator'


class TblFoodProductGenerator(models.Model):
    food_category_id = models.IntegerField()
    sub_group_id = models.IntegerField()
    food_code = models.CharField(max_length=250)
    food_description = models.CharField(max_length=250)
    base_qty = models.CharField(max_length=50)
    uom_grams = models.CharField(max_length=50)
    equivalent_base = models.CharField(max_length=50)
    uom = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_product_generator'


class TblFoodProductMaster(models.Model):
    food_name = models.CharField(max_length=250)
    food_code = models.CharField(max_length=50)
    base_qty = models.IntegerField()
    uom_master_id = models.IntegerField()
    ingredients_id = models.IntegerField()
    uom = models.IntegerField()
    ing_base_qty = models.IntegerField()
    suppliers_id = models.IntegerField()
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_product_master'


class TblFoodSpecification(models.Model):
    food_specification_name = models.CharField(max_length=100)
    rating = models.CharField(max_length=50)
    measure = models.CharField(max_length=50)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_specification'


class TblHealthparameterMaster(models.Model):
    healthparameter_master_name = models.CharField(max_length=250)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_healthparameter_master'


class TblHealthConditions(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_health_conditions'


class TblImageList(models.Model):
    picture = models.CharField(max_length=500)

    class Meta:
        db_table = 'tbl_image_list'


class TblIngredientsCategoryMaster(models.Model):
    code = models.CharField(max_length=50)
    category_description = models.CharField(max_length=100)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_ingredients_category_master'


class TblIngredientsMaster(models.Model):
    ingredients_id = models.AutoField(primary_key=True)
    item_name = models.CharField(max_length=250)
    item_code = models.CharField(max_length=50)
    uom_master_id = models.IntegerField()
    suppliers_id = models.IntegerField()
    food_packing_id = models.IntegerField()
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_ingredients_master'


class TblItems(models.Model):
    item_name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_items'


class TblLanguagesKnown(models.Model):
    user_id = models.IntegerField()
    language = models.CharField(max_length=100)
    can_speak = models.IntegerField(null=True, default=0)
    can_read = models.IntegerField(null=True, default=0)
    can_write = models.IntegerField(null=True, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'tbl_languages_known'


class TblNutritionFood(models.Model):
    food_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_nutrition_food'


class TblNutritionServiningSize(models.Model):
    servining_size_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_nutrition_servining_size'


class TblNutritionValProducts(models.Model):
    nutrition_food_id = models.IntegerField()
    servining_size_id = models.IntegerField()
    calories = models.CharField(max_length=50)
    total_fat = models.CharField(max_length=50)
    saturated_fat = models.CharField(max_length=50, db_column='Saturated Fat 4.2g')
    sodium = models.CharField(max_length=50)
    total_carbohydrate = models.CharField(max_length=50)
    dietary_fiber = models.CharField(max_length=50)
    sugar = models.CharField(max_length=50)
    protein = models.CharField(max_length=50)
    vitamin_a = models.CharField(max_length=50, db_column='vitamin A')
    vitamin_c = models.CharField(max_length=50, db_column='vitamin C')
    calcium = models.CharField(max_length=50)
    iron = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_nutrition_val_products'


class TblOrganicAcid(models.Model):
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
        db_table = 'tbl_organic_acid'


class TblPackingInstruction(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_packing_instruction'


class TblPatientCategory(models.Model):
    patient_category = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_patient_category'


class TblPatientFoodItem(models.Model):
    food_name = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_patient_food_item'


class TblPatientHealth(models.Model):
    autocode = models.CharField(max_length=100)
    healthparameter_master_id = models.IntegerField()
    product_id = models.IntegerField()
    alpha_num = models.CharField(max_length=50)
    measures = models.CharField(max_length=50)
    actual = models.CharField(max_length=250)
    normal = models.CharField(max_length=50)
    remarks = models.CharField(max_length=50)
    patient_id = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_patient_health'


class TblPatientOrderFood(models.Model):
    diet_id = models.IntegerField()
    food_master_id = models.IntegerField()
    d_id = models.CharField(max_length=50)
    food_category_name = models.CharField(max_length=50)
    food_style_name = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    prp_method_one = models.CharField(max_length=2000)
    prp_method_two = models.CharField(max_length=2000)
    prp_method_three = models.CharField(max_length=2000)
    ingredient = models.CharField(max_length=10000)
    calorie = models.CharField(max_length=50)
    carbo_hydrates = models.CharField(max_length=50)
    vitamins = models.CharField(max_length=50)
    fats = models.CharField(max_length=50)
    protein = models.CharField(max_length=50)
    sodium = models.CharField(max_length=50)
    cholestrol = models.CharField(max_length=50)
    iron = models.CharField(max_length=50)
    diet_name = models.IntegerField()
    created_at = models.CharField(max_length=50)
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_patient_order_food'


class TblPatientSatisfactionIndex(models.Model):
    food_quality = models.CharField(max_length=250)
    food_quantity = models.CharField(max_length=250)
    packing_quality = models.CharField(max_length=250)
    quantity = models.CharField(max_length=250)
    test = models.CharField(max_length=250)
    comments = models.CharField(max_length=250)
    created_at = models.DateField()
    posted_by = models.CharField(max_length=11)

    class Meta:
        db_table = 'tbl_patient_satisfaction_index'


class TblPatDislikeFood(models.Model):
    description = models.CharField(max_length=250)
    patient_id = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'tbl_pat_dislike_food'


class TblPayAnalysis(models.Model):
    bill_no = models.IntegerField()
    date = models.CharField(max_length=50)
    payment_mode = models.CharField(max_length=50)
    status = models.CharField(max_length=50, default='unpaid')
    created_at = models.CharField(max_length=50)
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_pay_analysis'


class TblPayBiils(models.Model):
    bill_no = models.IntegerField()
    datetimepicker = models.CharField(max_length=50)
    service_code = models.IntegerField()
    bill_val = models.CharField(max_length=50)
    query = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_pay_biils'


class TblPhytates(models.Model):
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
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_phytates'


class TblPolyphenols(models.Model):
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
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_polyphenols'


class TblProximateData(models.Model):
    proximate_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_proximate_data'

#in quesytinare
# class TblQuestions(models.Model):#(to ask questions  about patients)
#     pat_name = models.CharField(max_length=50)#patient name 
#     pat_age = models.CharField(max_length=50)#patient age
#     ddl_gender = models.CharField(max_length=50)#gender
#     txt_height = models.CharField(max_length=50)#heigt
#     text_weight = models.CharField(max_length=50)
#     type_of_work = models.CharField(max_length=50)#sedentary, moderate, heavy
#     diet_pat = models.CharField(max_length=50)#veg non veg 
#     consume_egg = models.CharField(max_length=50)
#     consume_dairy = models.CharField(max_length=50)
#     txt_food_allergies_data = models.CharField(max_length=50)#any  food allergy 
#     txt_no_meals = models.CharField(max_length=50)#no of meals per day
#     txt_snack = models.CharField(max_length=50)#boolean-snacks betwwn meaals - do u have
#     txt_fruits_everyday = models.CharField(max_length=50)#how many servings of fruits have everyday -giv roptions like (0-1)(1-3)(4-6)(7 or more)
#     txt_diet = models.CharField(max_length=50)#currently on any diet(yes , no , used to-options)
#     txt_vggetables = models.CharField(max_length=50)#options how many servings of vegetables u have everyday (0-1)(1-3)(4-6)(7 or more)
#     txt_skip_meals = models.CharField(max_length=50)#boolena a, do u skip meals
#     txt_get_food = models.CharField(max_length=50)#where do u  get ur food from  home ,canteen, hotel-options
#     p_activity = models.CharField(max_length=50)# d0 u indulge in any physical activity,Boolean
#     eat_food_out = models.CharField(max_length=50)#how often do u eat out 0,1-2,3-4,more than 4, in a week 
#     consume_alcohol = models.CharField(max_length=50)#how often do u consume alcohaol out 0,1-2,3-4,more than 4, in a week 
#     d_smoke_day = models.CharField(max_length=50)#how often do u  smoke out 0,1-2,3-4,more than 4, in a week 
#     txt_wkup = models.CharField(max_length=50)#(do u wakw upfresh or not)-boolena
#     digestive_prblm = models.CharField(max_length=50)
#     health_issue = models.CharField(max_length=50)
#     eye_issue = models.CharField(max_length=50)
#     txt_skin_issue = models.CharField(max_length=50)
#     txt_anemia = models.CharField(max_length=50)#boolean
#     txt_diabetes = models.CharField(max_length=50)#boolean
#     txt_fm_diabetes = models.CharField(max_length=50)#boolean , family history of diaetes
#     txt_hyper_tnsn = models.CharField(max_length=50)#hypo or hyper tension Ornothing
#     txt_fm_hyptnsn = models.CharField(max_length=50)##boolean , family history of tension
#     txt_cardic_prblm = models.CharField(max_length=50)#booelna
#     txt_fm_cardic_prblm = models.CharField(max_length=50)#bollenafamily
#     txt_thrd_prblm = models.CharField(max_length=50)#thyroid
#     txt_thrd_fm_prblm = models.CharField(max_length=50)#family -thyroid
#     txt_health_issue = models.CharField(max_length=50)
#     txt_fm_prblm = models.CharField(max_length=50)
#     txt_crntly_med = models.CharField(max_length=250)#currently taking medication any 
#     txt_fall_ill = models.CharField(max_length=50)#how many times u do fall ill in a yaer (once,twice.more than oncce)
#     any_m_prblm = models.CharField(max_length=50)
#     txt_prblms_bl = models.CharField(max_length=50)
#     created_at = models.CharField(max_length=50)
#     posted_by = models.IntegerField()

#     class Meta:
#         db_table = 'tbl_questions'


#TblQuestions
class PatientsQuestions(models.Model):  # Questionnaire for patients

    # Work type options
    WORK_TYPE_CHOICES = [
        ('sedentary', 'Sedentary'),
        ('moderate', 'Moderate'),
        ('heavy', 'Heavy'),
    ]
    type_of_work = models.CharField(max_length=20, choices=WORK_TYPE_CHOICES)  # Type of work

    # Diet type options
    DIET_TYPE_CHOICES = [
        ('veg', 'Vegetarian'),
        ('nonveg', 'Non-Vegetarian'),
    ]
    diet_pat = models.CharField(max_length=20, choices=DIET_TYPE_CHOICES)  # Veg / Non-Veg
    consume_egg = models.BooleanField(default=False)  # Eats egg
    consume_dairy = models.BooleanField(default=False)  # Consumes dairy products
    txt_food_allergies_data = models.CharField(max_length=200, blank=True, null=True)  # Food allergies
    txt_no_meals = models.IntegerField()  # Number of meals per day
    txt_snack = models.BooleanField(default=False)  # Snacks between meals

    # Servings options (for fruits & vegetables)
    SERVING_CHOICES = [
        ('0-1', '0-1'),
        ('1-3', '1-3'),
        ('4-6', '4-6'),
        ('7+', '7 or more'),
    ]
    txt_fruits_everyday = models.CharField(max_length=10, choices=SERVING_CHOICES)  # Fruit servings per day
    txt_vggetables = models.CharField(max_length=10, choices=SERVING_CHOICES)  # Vegetable servings per day

    # Diet status options
    DIET_STATUS_CHOICES = [
        ('yes', 'Yes'),
        ('no', 'No'),
        ('used_to', 'Used To'),
    ]
    txt_diet = models.CharField(max_length=10, choices=DIET_STATUS_CHOICES)  # Currently on diet
    txt_skip_meals = models.BooleanField(default=False)  # Skip meals or not

    # Food source options
    FOOD_SOURCE_CHOICES = [
        ('home', 'Home'),
        ('canteen', 'Canteen'),
        ('hotel', 'Hotel'),
    ]
    txt_get_food = models.CharField(max_length=20, choices=FOOD_SOURCE_CHOICES)  # Where food is obtained from

    p_activity = models.BooleanField(default=False)  # Physical activity

    # Frequency options (per week)
    FREQUENCY_CHOICES = [
        ('0', '0'),
        ('1-2', '1-2'),
        ('3-4', '3-4'),
        ('4+', 'More than 4'),
    ]
    eat_food_out = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)  # Eating out frequency
    consume_alcohol = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)  # Alcohol consumption frequency
    d_smoke_day = models.CharField(max_length=10, choices=FREQUENCY_CHOICES)  # Smoking frequency

    txt_wkup = models.BooleanField(default=True)  # Wake up feeling fresh or not
    digestive_prblm = models.CharField(max_length=200, blank=True, null=True)  # Digestive problems
    health_issue = models.CharField(max_length=200, blank=True, null=True)  # General health issues
    eye_issue = models.CharField(max_length=200, blank=True, null=True)  # Eye problems
    txt_skin_issue = models.CharField(max_length=200, blank=True, null=True)  # Skin problems

    txt_anemia = models.BooleanField(default=False)  # Anemia
    txt_diabetes = models.BooleanField(default=False)  # Diabetes
    txt_fm_diabetes = models.BooleanField(default=False)  # Family history of diabetes

    # Blood pressure options
    BP_CHOICES = [
        ('none', 'None'),
        ('hypo', 'Hypo Tension'),
        ('hyper', 'Hyper Tension'),
    ]
    txt_hyper_tnsn = models.CharField(max_length=10, choices=BP_CHOICES)  # Blood pressure condition
    txt_fm_hyptnsn = models.BooleanField(default=False)  # Family history of BP

    txt_cardic_prblm = models.BooleanField(default=False)  # Cardiac problem
    txt_fm_cardic_prblm = models.BooleanField(default=False)  # Family cardiac problem
    txt_thrd_prblm = models.BooleanField(default=False)  # Thyroid problem
    txt_thrd_fm_prblm = models.BooleanField(default=False)  # Family thyroid problem
    txt_health_issue = models.CharField(max_length=200, blank=True, null=True)  # Other health issues
    txt_fm_prblm = models.CharField(max_length=200, blank=True, null=True)  # Family medical problems

    txt_crntly_med = models.CharField(max_length=250, blank=True, null=True)  # Current medication

    # Illness frequency options
    FALL_ILL_CHOICES = [
        ('once', 'Once'),
        ('twice', 'Twice'),
        ('more', 'More than twice'),
    ]
    txt_fall_ill = models.CharField(max_length=10, choices=FALL_ILL_CHOICES)  # Falling ill frequency per year

    any_m_prblm = models.CharField(max_length=200, blank=True, null=True)  # Any menstrual/medical problem
    txt_prblms_bl = models.CharField(max_length=200, blank=True, null=True)  # Additional problems

    created_at = models.DateTimeField(auto_now_add=True)  # Record creation time
    created_by = models.ForeignKey(UserRegister,on_delete=models.SET_NULL,null=True,blank=True)

    class Meta:
        db_table = "tbl_questions"

    def __str__(self):
        return self.pat_name

class TblQuestionSuggestionPat(models.Model):
    patient_id = models.IntegerField()
    suggest = models.CharField(max_length=1000)
    created_at = models.CharField(max_length=50)
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_question_suggestion_pat'


class TblRecepeDevEntry(models.Model):
    title = models.CharField(max_length=50)
    firstname = models.CharField(max_length=50)
    address = models.CharField(max_length=50)
    date = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    mobile = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_recepe_dev_entry'


class TblRecipiesMaster(models.Model):
    food_category_id = models.CharField(max_length=50)
    food_products_id = models.CharField(max_length=50)
    base_quantity = models.CharField(max_length=50)
    ingredients_code = models.CharField(max_length=50)
    ingredients_name = models.CharField(max_length=50)
    uom = models.CharField(max_length=50)
    qty = models.CharField(max_length=100)
    special_instruction = models.CharField(max_length=100)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_recipies_master'


class TblRemainder(models.Model):
    mobile = models.CharField(max_length=50)
    status = models.IntegerField(default=0)
    created_at = models.CharField(max_length=50)
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_remainder'


class TblRemainderDiet(models.Model):
    diet_id = models.IntegerField()
    mobile = models.CharField(max_length=50)
    patient_id = models.CharField(max_length=50)
    status = models.IntegerField(default=0)
    created_at = models.CharField(max_length=50)
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_remainder_diet'


class TblScheduleOtherServices(models.Model):
    service_code = models.CharField(max_length=50)
    date_time = models.CharField(max_length=50)
    time_slotone = models.CharField(max_length=50)
    time_slottwo = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_schedule_other_services'


class TblScmPerson(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_scm_person'


class TblScmPersonAdd(models.Model):
    scm_person_id = models.IntegerField()
    message = models.CharField(max_length=50)
    created_at = models.IntegerField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_scm_person_add'


class TblSubGroup(models.Model):
    sub_group_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'tbl_sub_group'


class TblSubItemGroup(models.Model):
    group_name = models.CharField(max_length=250)

    class Meta:
        db_table = 'tbl_sub_item_group'


class TblSuggestions(models.Model):
    suggestions = models.CharField(max_length=50)
    messages = models.CharField(max_length=250)
    created_at = models.DateField()
    posted_by = models.IntegerField()
    ip = models.CharField(max_length=20)

    class Meta:
        db_table = 'tbl_suggestions'


class TblSvasthfoodGroupMaster(models.Model):
    food_category = models.CharField(max_length=250)
    group_code = models.CharField(max_length=50)
    created_by = models.IntegerField()
    created_at = models.DateField()

    class Meta:
        db_table = 'tbl_svasthfood_group_master'


class TblSvasthhealthPm(models.Model):
    food_group_add_id = models.IntegerField()
    food_code = models.IntegerField()
    food_style_add_id = models.IntegerField()
    food_description = models.CharField(max_length=250)
    sub_group_id = models.IntegerField()
    calorific_value = models.CharField(max_length=50)
    generate_rcp = models.CharField(max_length=250)
    image = models.CharField(max_length=50)
    patient_id = models.IntegerField()
    posted_by = models.IntegerField()
    created_at = models.DateField()

    class Meta:
        db_table = 'tbl_svasthhealth_pm'


class TblSvasthFoodCategory(models.Model):
    food_category_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_svasth_food_category'


class TblSvasthFoodMasterDataAdd(models.Model):
    food_master_id = models.IntegerField()
    food_masters_id = models.IntegerField()
    sub_group_id = models.IntegerField()
    food_title = models.CharField(max_length=250)
    brief_ingredients = models.CharField(max_length=250)
    calorific_val = models.IntegerField()
    recepe = models.CharField(max_length=250)
    patient_id = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_svasth_food_master_data_add'


class TblSvasthFoodPlanMaster(models.Model):
    plan_name = models.CharField(max_length=250)
    code = models.CharField(max_length=250)
    description = models.CharField(max_length=250)
    price_per_uom = models.IntegerField()
    price_per_month = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_svasth_food_plan_master'


class TblSvasthFoodStyle(models.Model):
    food_style_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_svasth_food_style'


class TblSvasthHealthyTips(models.Model):
    health_tips = models.CharField(max_length=250)
    patient_id = models.IntegerField()
    posted_by = models.IntegerField()
    created_at = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_svasth_healthy_tips'


class TblSvasthNutrient(models.Model):
    code = models.CharField(max_length=50)
    snp_parameter_id = models.IntegerField()
    serving_base = models.CharField(max_length=50)
    serving_size_qty = models.CharField(max_length=50)
    serving_size_unit = models.CharField(max_length=50)
    serving_weight_gms = models.CharField(max_length=50)
    metric_qty = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_svasth_nutrient'


class TblSvasthSnpParameters(models.Model):
    snp_parameter = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_svasth_snp_parameters'


class TblUploadHealthChart(models.Model):
    report = models.CharField(max_length=50)
    date = models.DateField()
    posted_by = models.IntegerField()
    updated_by_dietitian = models.IntegerField(default=0)

    class Meta:
        db_table = 'tbl_upload_health_chart'


class TblUploadKitchenDetails(models.Model):
    kitchen_report = models.CharField(max_length=250)
    created_at = models.CharField(max_length=250)
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_upload_kitchen_details'


class TblUploadReport(models.Model):
    report = models.CharField(max_length=50, null=True)
    new_report = models.CharField(max_length=250, null=True)
    date = models.DateField()
    posted_by = models.IntegerField()
    diet_id = models.IntegerField()
    updated_by_dietitian = models.IntegerField(default=0)

    class Meta:
        db_table = 'tbl_upload_report'


class TblUploadReports(models.Model):
    report = models.CharField(max_length=50)
    date = models.DateField()
    posted_by = models.IntegerField()
    updated_by_dietitian = models.IntegerField(default=0)

    class Meta:
        db_table = 'tbl_upload_reports'


class TblUserLoginDetails(models.Model):
    email = models.CharField(max_length=50)
    password = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_user_login_details'


class TblUserMapping(models.Model):
    nutrition = models.CharField(max_length=50)
    food_customer = models.CharField(max_length=50)
    food_supplier = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_user_mapping'


class TblWeeks(models.Model):
    week_name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_weeks'


class ViewRating(models.Model):
    post_id = models.IntegerField()
    rating_number = models.IntegerField()
    total_points = models.IntegerField()
    patient_id = models.IntegerField()
    posted_by = models.IntegerField()
    compliance_rating = models.CharField(max_length=50)
    created = models.DateTimeField()
    modified = models.DateTimeField()
    status = models.IntegerField(default=1)

    class Meta:
        db_table = 'view_rating'
