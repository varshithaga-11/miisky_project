from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# --- User & Base Models ---

class UserRegister(AbstractUser):
    title = models.CharField(max_length=50, null=True, blank=True)
    type = models.IntegerField(null=True, blank=True)
    contact_info = models.CharField(max_length=100, null=True, blank=True)
    photo = models.CharField(max_length=200, null=True, blank=True)
    status = models.IntegerField(null=True, blank=True)
    activate_code = models.CharField(max_length=15, null=True, blank=True)
    reset_code = models.CharField(max_length=15, null=True, blank=True)
    created_on = models.DateField(null=True, blank=True)
    country = models.CharField(max_length=50, null=True, blank=True)
    city_id = models.CharField(max_length=255, null=True, blank=True)
    state_id = models.CharField(max_length=50, null=True, blank=True)
    mobile = models.CharField(max_length=50, null=True, blank=True)
    role_id = models.IntegerField(null=True, blank=True)
    zip_code = models.IntegerField(null=True, blank=True)
    lattitude = models.CharField(max_length=50, null=True, blank=True)
    longitude = models.CharField(max_length=50, null=True, blank=True)
    dob = models.CharField(max_length=50, null=True, blank=True)
    gender = models.CharField(max_length=50, null=True, blank=True)
    unique_id = models.CharField(max_length=50, null=True, blank=True)
    vault_no = models.CharField(max_length=100, null=True, blank=True)
    qr_path = models.CharField(max_length=500, null=True, blank=True)
    location = models.CharField(max_length=100, null=True, blank=True)
    file_name = models.CharField(max_length=1000, null=True, blank=True)
    whatsapp = models.CharField(max_length=50, null=True, blank=True)
    group_name = models.CharField(max_length=100, null=True, blank=True)
    caste = models.CharField(max_length=100, null=True, blank=True)
    religion = models.CharField(max_length=100, null=True, blank=True)
    medical_history = models.CharField(max_length=500, null=True, blank=True)
    join_date = models.DateTimeField(null=True, blank=True)
    company_name = models.CharField(max_length=50, null=True, blank=True)
    dor = models.CharField(max_length=50, null=True, blank=True)
    company_status_id = models.IntegerField(null=True, blank=True)
    bank_name = models.CharField(max_length=50, null=True, blank=True)
    acc_no = models.BigIntegerField(null=True, blank=True)
    branch_name = models.CharField(max_length=50, null=True, blank=True)
    ifsc_code = models.CharField(max_length=50, null=True, blank=True)
    gst_no = models.CharField(max_length=50, null=True, blank=True)
    date = models.CharField(max_length=50, null=True, blank=True)
    pat_weight = models.CharField(max_length=50, null=True, blank=True)
    pat_height = models.CharField(max_length=50, null=True, blank=True)
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

class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50)
    status = models.IntegerField()

    class Meta:
        db_table = 'tbl_role'

class Status(models.Model):
    status_id = models.AutoField(primary_key=True)
    status_name = models.CharField(max_length=50)

    class Meta:
        db_table = 'tbl_status'

class Country(models.Model):
    country_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    created_at = models.DateField()

    class Meta:
        db_table = 'tbl_country'

class State(models.Model):
    state_id = models.AutoField(primary_key=True)
    state_name = models.CharField(max_length=333)
    country_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_state'

class City(models.Model):
    city_id = models.AutoField(primary_key=True)
    city_name = models.CharField(max_length=333)
    state_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_city'

class Community(models.Model):
    id = models.AutoField(primary_key=True)
    community_name = models.CharField(max_length=250)
    brief_on_community = models.CharField(max_length=250)
    code = models.CharField(max_length=50)
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_community'

# --- Recipe & Food Management ---

class RecipeDevEntryThree(models.Model):
    recepe_en_three = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
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
    recepe_dev_en_id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    recepe_name = models.CharField(max_length=50)
    food_category_id = models.IntegerField()
    food_style_id = models.IntegerField()
    country_id = models.IntegerField()
    state_id = models.IntegerField()
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

class FoodCategory(models.Model):
    food_category_id = models.AutoField(primary_key=True)
    food_category_name = models.CharField(max_length=50)
    remarks = models.CharField(max_length=100)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_category'

class FoodSubgroup(models.Model):
    sub_group_id = models.AutoField(primary_key=True)
    subgroub_name = models.CharField(max_length=250)
    created_by = models.IntegerField()
    created_at = models.DateField()

    class Meta:
        db_table = 'tbl_food_subgroup'

class FoodMainCode(models.Model):
    food_main_id = models.AutoField(primary_key=True)
    food_main_category = models.CharField(max_length=250)
    food_main_code = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_main_code'

class FoodMaster(models.Model):
    food_master_id = models.AutoField(primary_key=True)
    food_category = models.CharField(max_length=250)
    food_code = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_master'

class FoodProduct(models.Model):
    food_product_id = models.AutoField(primary_key=True)
    category_id = models.IntegerField()
    product_code = models.CharField(max_length=50, unique=True)
    product_title = models.CharField(max_length=50)
    uom = models.CharField(max_length=50)
    specification = models.CharField(max_length=100)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_product'

class RecipeBuilder(models.Model):
    id = models.AutoField(primary_key=True)
    food_master_id = models.CharField(max_length=50)
    items_id = models.IntegerField()
    m_id = models.IntegerField()
    txtqty = models.CharField(max_length=50)
    uom_master_id = models.IntegerField()
    txt_ingrdnts = models.CharField(max_length=2000)
    upload_image = models.CharField(max_length=250)
    item_no = models.CharField(max_length=50)
    item_description = models.CharField(max_length=1000)
    qty = models.CharField(max_length=50)
    unit_of_m = models.CharField(max_length=50)
    ingredients_master_id = models.IntegerField()
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
    diet_pln_id = models.AutoField(primary_key=True)
    dietplan_id = models.IntegerField()
    status = models.IntegerField(default=0)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        db_table = 'diet_plan_master'

class DietQualification(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    qulification = models.CharField(max_length=250)
    report = models.CharField(max_length=250)
    recognitions = models.CharField(max_length=250)

    class Meta:
        db_table = 'diet_qualification_details'

class UomMaster(models.Model):
    uom_master_id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=50)
    uom = models.CharField(max_length=100)
    created_at = models.DateTimeField()

    class Meta:
        db_table = 'tbl_uom_master'

class Minerals(models.Model):
    id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    cat_slug = models.CharField(max_length=100, null=True)

    class Meta:
        db_table = 'category'

class Products(models.Model):
    id = models.AutoField(primary_key=True)
    category_id = models.IntegerField()
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
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    product_id = models.IntegerField()
    quantity = models.IntegerField()

    class Meta:
        db_table = 'cart'

class Sales(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    pay_id = models.CharField(max_length=50)
    sales_date = models.DateField()

    class Meta:
        db_table = 'sales'

class Details(models.Model):
    id = models.AutoField(primary_key=True)
    sales_id = models.IntegerField()
    product_id = models.IntegerField()
    quantity = models.IntegerField()

    class Meta:
        db_table = 'details'

# --- Misc System Tables ---

class Blog(models.Model):
    id = models.AutoField(primary_key=True)
    messages = models.CharField(max_length=5000)
    user_id = models.IntegerField()
    status_id = models.IntegerField()

    class Meta:
        db_table = 'blog'

class Feedback(models.Model):
    id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
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
    pat_id = models.AutoField(primary_key=True)
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
    diet_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    photo = models.CharField(max_length=500)
    location = models.CharField(max_length=100)
    contact = models.CharField(max_length=20)
    role_id = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        db_table = 'tbl_dietician'

# --- Nutrition Detailed Tables ---

class AminoAcids(models.Model):
    id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
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
    ingredients_id = models.AutoField(primary_key=True)
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
    suppliers_id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
    food_product_id = models.CharField(max_length=11)
    ingredients = models.CharField(max_length=250)
    uom_master_id = models.IntegerField()
    base_qty = models.IntegerField()
    description = models.CharField(max_length=250)
    special_instruction = models.CharField(max_length=250)
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        db_table = 'tbl_food_recepe'

class InputBOM(models.Model):
    bom_id = models.AutoField(primary_key=True)
    items_id = models.IntegerField()
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
    l_id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
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
    id = models.AutoField(primary_key=True)
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
