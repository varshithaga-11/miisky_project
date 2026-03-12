# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AddRecepeDevEntryThree(models.Model):
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
        # managed = False
        db_table = 'add_recepe_dev_entry_three'


class AddRecepeDevEntryTwo(models.Model):
    recepe_dev_en_id = models.AutoField(primary_key=True)
    user = models.ForeignKey('Users', on_delete=models.CASCADE, db_column='user_id')
    recepe_name = models.CharField(max_length=50)
    food_category = models.ForeignKey('TblFoodCategory', on_delete=models.CASCADE, db_column='food_category_id')
    food_style = models.ForeignKey('TblFoodstyleMaster', on_delete=models.CASCADE, db_column='food_style_id')
    country = models.ForeignKey('TblCountry', on_delete=models.CASCADE, db_column='country_id')
    state = models.ForeignKey('TblState', on_delete=models.CASCADE, db_column='state_id')
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
    add_on = models.CharField(max_length=255, blank=True, null=True)
    vegetables = models.CharField(max_length=255, blank=True, null=True)
    fruites_and_juices = models.CharField(max_length=255, blank=True, null=True)
    calorie = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    carbo_hydrates = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    vitamins = models.CharField(max_length=255, blank=True, null=True)
    fats = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    protein = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    sodium = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    cholestrol = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    iron = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    recepe_created_at = models.DateTimeField()

    class Meta:
        # managed = False
        db_table = 'add_recepe_dev_entry_two'


class Blog(models.Model):
    messages = models.CharField(max_length=5000)
    user_id = models.IntegerField()
    status_id = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'blog'


class CallBack(models.Model):
    description = models.TextField(blank=True, null=True)
    time_slot = models.CharField(max_length=250, blank=True, null=True)
    google_meet_link = models.CharField(max_length=250, blank=True, null=True)
    diet_id = models.IntegerField()
    patient_id = models.IntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        # managed = False
        db_table = 'call_back'


class Cart(models.Model):
    user_id = models.IntegerField()
    product_id = models.IntegerField()
    quantity = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'cart'


class Category(models.Model):
    name = models.CharField(max_length=100)
    cat_slug = models.CharField(max_length=100, blank=True, null=True)
    posted_by = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        # managed = False
        db_table = 'category'


class ChefPatientFood(models.Model):
    date = models.DateTimeField()
    patient_code = models.CharField(max_length=50)
    product_code = models.CharField(max_length=50)
    qty = models.IntegerField()
    remarks = models.CharField(max_length=100)
    food_shift = models.CharField(max_length=50)
    status = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'chef_patient_food'


class ChefRecipies(models.Model):
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
        # managed = False
        db_table = 'chef_recipies'


class Details(models.Model):
    sales_id = models.IntegerField()
    product_id = models.IntegerField()
    quantity = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'details'


class DietFoodStyleAdd(models.Model):
    food_style_add_id = models.AutoField(primary_key=True)
    food_style_master_id = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'diet_food_style_add'


class DietFoodStyleDataAdd(models.Model):
    country_id = models.IntegerField()
    state_id = models.IntegerField()
    city_id = models.IntegerField()
    community_id = models.IntegerField()
    food_style_add_id = models.IntegerField()
    patient_id = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'diet_food_style_data_add'


class DietFoodStyleMaster(models.Model):
    food_style_master_id = models.AutoField(primary_key=True)
    food_style_id = models.IntegerField()
    status = models.IntegerField(blank=True, null=True)
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'diet_food_style_master'


class DietFoodTaken(models.Model):
    food_group = models.CharField(max_length=100)
    food_name = models.CharField(max_length=255)
    energy = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    protein = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    fat = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    carbohydrate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    base_value = models.CharField(max_length=100, blank=True, null=True)
    food_image = models.CharField(max_length=255, blank=True, null=True)
    posted_by = models.IntegerField()
    patient_id = models.IntegerField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        # managed = False
        db_table = 'diet_food_taken'


class DietPlanMaster(models.Model):
    diet_pln_id = models.AutoField(primary_key=True)
    dietplan_id = models.IntegerField()
    status = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'diet_plan_master'


class DietQualificationDetails(models.Model):
    user_id = models.IntegerField()
    qulification = models.CharField(max_length=250)
    report = models.CharField(max_length=250)
    recognitions = models.CharField(max_length=250)

    class Meta:
        # managed = False
        db_table = 'diet_qualification_details'


class DietSvasthFoodGroupAdd(models.Model):
    food_group_add_id = models.AutoField(primary_key=True)
    food_group_id = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'diet_svasth_food_group_add'


class DietSvasthGroupAddData(models.Model):
    food_group_add_id = models.IntegerField()
    food_style_add_id = models.IntegerField()
    dietitian_comment = models.CharField(max_length=250)
    patient_id = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'diet_svasth_group_add_data'


class DietSvasthfoodGroupMaster(models.Model):
    food_group_id = models.AutoField(primary_key=True)
    food_category_id = models.IntegerField()
    status = models.IntegerField()
    created_by = models.IntegerField()
    created_at = models.DateField()

    class Meta:
        # managed = False
        db_table = 'diet_svasthfood_group_master'


class Feedback(models.Model):
    name = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    rbtn = models.CharField(max_length=50)
    messages = models.CharField(max_length=500)
    user_id = models.IntegerField()
    status_id = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'feedback'


class HealthFoodPlan(models.Model):
    name = models.CharField(max_length=100, blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    gender = models.CharField(max_length=20, blank=True, null=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    work_type = models.CharField(max_length=100, blank=True, null=True)
    health_issue_main = models.CharField(max_length=255, blank=True, null=True)
    health_issues = models.TextField(blank=True, null=True)
    autoimmune = models.CharField(max_length=50, blank=True, null=True)
    symptoms = models.TextField(blank=True, null=True)
    surgery = models.CharField(max_length=50, blank=True, null=True)
    surgery_type = models.CharField(max_length=255, blank=True, null=True)
    skin_issues = models.TextField(blank=True, null=True)
    vitamin_deficiency = models.CharField(max_length=255, blank=True, null=True)
    food_habits = models.CharField(max_length=255, blank=True, null=True)
    egg = models.CharField(max_length=20, blank=True, null=True)
    milk = models.CharField(max_length=20, blank=True, null=True)
    food_allergy = models.CharField(max_length=20, blank=True, null=True)
    food_allergy_name = models.CharField(max_length=255, blank=True, null=True)
    meals = models.CharField(max_length=255, blank=True, null=True)
    snacks = models.CharField(max_length=255, blank=True, null=True)
    skip_meals = models.CharField(max_length=100, blank=True, null=True)
    food_source = models.CharField(max_length=255, blank=True, null=True)
    dietician = models.CharField(max_length=20, blank=True, null=True)
    dietician_name = models.CharField(max_length=100, blank=True, null=True)
    dietician_location = models.CharField(max_length=255, blank=True, null=True)
    dietician_phone = models.CharField(max_length=20, blank=True, null=True)
    activity = models.CharField(max_length=50, blank=True, null=True)
    activity_list = models.TextField(blank=True, null=True)
    activity_other = models.CharField(max_length=255, blank=True, null=True)
    habits = models.TextField(blank=True, null=True)
    improve_health = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        # managed = False
        db_table = 'health_food_plan'


class Images(models.Model):
    id = models.IntegerField(primary_key=True)
    image = models.CharField(max_length=100)
    image_text = models.TextField()

    class Meta:
        # managed = False
        db_table = 'images'


class IpaddressLikesMap(models.Model):
    tutorial_id = models.IntegerField()
    ip_address = models.CharField(max_length=255)

    class Meta:
        # managed = False
        db_table = 'ipaddress_likes_map'


class Likes(models.Model):
    userid = models.IntegerField()
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'likes'


class MyPages(models.Model):
    m_id = models.AutoField(primary_key=True)
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
        # managed = False
        db_table = 'my_pages'


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
        # managed = False
        db_table = 'patient_history'


class Products(models.Model):
    category_id = models.IntegerField()
    name = models.TextField()
    description = models.TextField()
    slug = models.CharField(max_length=200)
    price = models.FloatField()
    photo = models.CharField(max_length=200)
    date_view = models.DateField()
    counter = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'products'


class ProductsUploadImage(models.Model):
    product_id = models.IntegerField()
    photo = models.CharField(max_length=1000)
    image_title = models.CharField(max_length=50)
    description = models.CharField(max_length=500)
    status_id = models.IntegerField()
    added_at = models.DateTimeField()
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'products_upload_image'


class Sales(models.Model):
    user_id = models.IntegerField()
    pay_id = models.CharField(max_length=50)
    sales_date = models.DateField()

    class Meta:
        # managed = False
        db_table = 'sales'


class StandardReportChat(models.Model):
    report = models.TextField(blank=True, null=True)
    date = models.DateTimeField(blank=True, null=True)
    posted_by = models.IntegerField(blank=True, null=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    diet_id = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        # managed = False
        db_table = 'standard_report_chat'


class TblAminoAcids(models.Model):
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
        # managed = False
        db_table = 'tbl_amino_acids'


class TblBlogsDietitian(models.Model):
    image = models.CharField(max_length=250)

    class Meta:
        # managed = False
        db_table = 'tbl_blogs_dietitian'


class TblCallCenter(models.Model):
    cal_ceneter_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_call_center'


class TblCallCenterAdd(models.Model):
    cal_ceneter_id = models.IntegerField()
    message = models.CharField(max_length=50)
    created_at = models.IntegerField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
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
    created_at = models.DateTimeField()
    created_by = models.IntegerField(blank=True, null=True)

    class Meta:
        # managed = False
        db_table = 'tbl_carotenoid'


class TblChefFeedback(models.Model):
    subject = models.CharField(max_length=250)
    chef_comment = models.CharField(max_length=250)
    created_at = models.CharField(max_length=250)
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_chef_feedback'


class TblCity(models.Model):
    city_id = models.BigAutoField(primary_key=True)
    city_name = models.CharField(max_length=333)
    state_id = models.BigIntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_city'


class TblCommentsAdd(models.Model):
    tutorial_id = models.IntegerField()
    ip_address = models.CharField(max_length=250)
    name = models.CharField(max_length=50)
    comments = models.CharField(max_length=500)
    post_date = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_comments_add'


class TblCommunity(models.Model):
    community_name = models.CharField(max_length=250)
    brief_on_community = models.CharField(max_length=250)
    code = models.CharField(max_length=50)
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_community'


class TblCompanyStatus(models.Model):
    company_status_id = models.AutoField(primary_key=True)
    status = models.CharField(max_length=50)
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_company_status'


class TblCompositionIndex(models.Model):
    composition_name = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_composition_index'


class TblCookingInstruction(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_cooking_instruction'


class TblCountry(models.Model):
    country_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    created_at = models.DateField()

    class Meta:
        # managed = False
        db_table = 'tbl_country'


class TblCreateDietician(models.Model):
    patients = models.CharField(max_length=50)
    patients_category = models.IntegerField()
    food_plan = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_create_dietician'


class TblDays(models.Model):
    d_id = models.AutoField(primary_key=True)
    days_name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_days'


class TblDevelopSchedule(models.Model):
    food_group_add_id = models.IntegerField()
    time_slot = models.CharField(max_length=50)
    food_packing_id = models.IntegerField()
    patient_id = models.IntegerField()
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_develop_schedule'


class TblDietAddSnacks(models.Model):
    snacks_data_id = models.AutoField(primary_key=True)
    snacks_id = models.IntegerField()
    time_slot = models.CharField(max_length=50)
    snacks_name = models.CharField(max_length=50)
    patient_id = models.IntegerField()
    posted_by = models.IntegerField()
    created_at = models.CharField(max_length=50)
    uom = models.CharField(max_length=50, blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    calorie = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    carbo_hydrates = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    vitamins = models.CharField(max_length=100, blank=True, null=True)
    fats = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    protein = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    sodium = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    cholestrol = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    iron = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    class Meta:
        # managed = False
        db_table = 'tbl_diet_add_snacks'


class TblDietChatMenu(models.Model):
    diet_id = models.IntegerField()
    food_name = models.CharField(max_length=255)
    base_value = models.CharField(max_length=100, blank=True, null=True)
    energy = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    protein = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    carbohydrate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    fat = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    food_image = models.CharField(max_length=255, blank=True, null=True)
    food_group = models.CharField(max_length=100, blank=True, null=True)
    helps = models.TextField(blank=True, null=True)
    not_recommended = models.TextField(blank=True, null=True)
    product_code = models.CharField(max_length=100, blank=True, null=True)
    patient_id = models.IntegerField()
    posted_by = models.IntegerField()
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        # managed = False
        db_table = 'tbl_diet_chat_menu'


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
        # managed = False
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
        # managed = False
        db_table = 'tbl_diet_food_patient_index'


class TblDietPlanGeneratorReport(models.Model):
    patient_name = models.CharField(max_length=50)
    health_history = models.CharField(max_length=50)
    diet_plan_code = models.IntegerField()
    diet_plan = models.IntegerField()
    description = models.CharField(max_length=250)
    posted_by = models.IntegerField()
    created_at = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_diet_plan_generator_report'


class TblDietPlansAdd(models.Model):
    diet_pln_master_id = models.AutoField(primary_key=True)
    diet_pln_id = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_diet_plans_add'


class TblDietSnacks(models.Model):
    snacks_id = models.AutoField(primary_key=True)
    snacks_name = models.CharField(max_length=250)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        # managed = False
        db_table = 'tbl_diet_snacks'


class TblDietician(models.Model):
    diet_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    photo = models.CharField(max_length=500)
    location = models.CharField(max_length=100)
    contact = models.CharField(max_length=20)
    role_id = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        # managed = False
        db_table = 'tbl_dietician'


class TblDieticianComment(models.Model):
    dietician_comment = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()
    patient_id = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_dietician_comment'


class TblDieticianDislikeParameter(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_dietician_dislike_parameter'


class TblDieticianFoodAvoid(models.Model):
    dietician_food_taken = models.TextField(blank=True, null=True)
    dietician_comment = models.TextField(blank=True, null=True)
    patient_id = models.IntegerField()
    created_by = models.IntegerField()
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        # managed = False
        db_table = 'tbl_dietician_food_avoid'


class TblDieticianLikeParameter(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_dietician_like_parameter'


class TblDietplanAddMasterTable(models.Model):
    dietplan_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=50)
    description = models.CharField(max_length=1000)
    code = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_dietplan_add_master_table'


class TblDietplanMasterTable(models.Model):
    diet_com_id = models.AutoField(primary_key=True)
    dietplan_id = models.IntegerField()
    dietitian_comment = models.CharField(max_length=250)
    created_by = models.IntegerField()
    created_at = models.DateField()
    patient_id = models.IntegerField()
    food_avoid = models.TextField(blank=True, null=True)

    class Meta:
        # managed = False
        db_table = 'tbl_dietplan_master_table'


class TblDoctorsComment(models.Model):
    doctor_comment = models.TextField()
    created_at = models.DateField()
    doctor_id = models.IntegerField()
    patient_id = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_doctors_comment'


class TblDosAndDont(models.Model):
    dos_and_dont_id = models.AutoField(primary_key=True)
    health_parameter = models.CharField(max_length=50)
    food_category = models.CharField(max_length=50)
    food_products = models.CharField(max_length=50)
    dos_and_dont = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_dos_and_dont'


class TblEcgData(models.Model):
    titel = models.CharField(max_length=50)
    message = models.CharField(max_length=3000)
    channel1_data = models.CharField(max_length=50)
    posted_by = models.IntegerField()
    date = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_ecg_data'


class TblFatSolubleVtmnsVal(models.Model):
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
    created_by = models.IntegerField(blank=True, null=True)

    class Meta:
        # managed = False
        db_table = 'tbl_fat_soluble_vtmns_val'


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
    craeted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_fatty_acid'


class TblFattyAcidProfile(models.Model):
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
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_fatty_acid_profile'


class TblFoodCategory(models.Model):
    food_category_id = models.AutoField(primary_key=True)
    food_category_name = models.CharField(max_length=50)
    remarks = models.CharField(max_length=100)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_food_category'


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
        # managed = False
        db_table = 'tbl_food_diet_index_data'


class TblFoodMainCode(models.Model):
    food_main_id = models.AutoField(primary_key=True)
    food_main_category = models.CharField(max_length=250)
    food_main_code = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_food_main_code'


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
        # managed = False
        db_table = 'tbl_food_main_data_add'


class TblFoodMaster(models.Model):
    food_master_id = models.AutoField(primary_key=True)
    food_category = models.CharField(max_length=250)
    food_code = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_food_master'


class TblFoodMenu(models.Model):
    m_id = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_food_menu'


class TblFoodPacking(models.Model):
    food_packing_id = models.AutoField(primary_key=True)
    food_pack_description = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
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
    patient_weight = models.CharField(max_length=50, blank=True, null=True)
    patient_height = models.CharField(max_length=50, blank=True, null=True)
    patient_bmi = models.CharField(max_length=50, blank=True, null=True)
    ingredients = models.TextField(blank=True, null=True)
    add_on = models.TextField(blank=True, null=True)
    fruites_and_juices = models.TextField(blank=True, null=True)
    vegetables = models.TextField(blank=True, null=True)
    disease_name = models.CharField(max_length=100, blank=True, null=True)
    title = models.CharField(max_length=50)
    like = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_food_plan_generator'


class TblFoodProduct(models.Model):
    food_product_id = models.AutoField(primary_key=True)
    category_id = models.IntegerField()
    product_code = models.CharField(unique=True, max_length=50)
    product_title = models.CharField(max_length=50)
    uom = models.CharField(max_length=50)
    specification = models.CharField(max_length=100)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_food_product'


class TblFoodProductGenerator(models.Model):
    food_product_id = models.AutoField(primary_key=True)
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
        # managed = False
        db_table = 'tbl_food_product_generator'


class TblFoodProductMaster(models.Model):
    food_product_id = models.AutoField(primary_key=True)
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
        # managed = False
        db_table = 'tbl_food_product_master'


class TblFoodRecepe(models.Model):
    food_product_id = models.CharField(max_length=11)
    ingredients = models.CharField(max_length=250)
    uom_master_id = models.IntegerField()
    base_qty = models.IntegerField()
    description = models.CharField(max_length=250)
    special_instruction = models.CharField(max_length=250)
    created_at = models.DateField()
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_food_recepe'


class TblFoodSpecification(models.Model):
    food_specification_id = models.AutoField(primary_key=True)
    food_specification_name = models.CharField(max_length=100)
    rating = models.CharField(max_length=50)
    measure = models.CharField(max_length=50)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_food_specification'


class TblFoodSubgroup(models.Model):
    sub_group_id = models.AutoField(primary_key=True)
    subgroub_name = models.CharField(max_length=250)
    created_by = models.IntegerField()
    created_at = models.DateField()

    class Meta:
        # managed = False
        db_table = 'tbl_food_subgroup'


class TblFoodstyleMaster(models.Model):
    food_style_id = models.AutoField(primary_key=True)
    food_style_code = models.CharField(max_length=25)
    title = models.CharField(max_length=50)
    created_by = models.IntegerField()
    created_at = models.DateField()

    class Meta:
        # managed = False
        db_table = 'tbl_foodstyle_master'


class TblHealthConditions(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        # managed = False
        db_table = 'tbl_health_conditions'


class TblHealthparameterMaster(models.Model):
    healthparameter_master_id = models.AutoField(primary_key=True)
    healthparameter_master_name = models.CharField(max_length=250)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_healthparameter_master'


class TblImageList(models.Model):
    picture = models.CharField(max_length=500)

    class Meta:
        # managed = False
        db_table = 'tbl_image_list'


class TblIndividualSugar(models.Model):
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
        # managed = False
        db_table = 'tbl_individual_sugar'


class TblIngredients(models.Model):
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
    status_id = models.IntegerField()
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_ingredients'


class TblIngredientsCategoryMaster(models.Model):
    ingredients_id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=50)
    category_description = models.CharField(max_length=100)
    posted_by = models.IntegerField()
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        # managed = False
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
        # managed = False
        db_table = 'tbl_ingredients_master'


class TblInputBom(models.Model):
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
        # managed = False
        db_table = 'tbl_input_bom'


class TblItems(models.Model):
    items_id = models.AutoField(primary_key=True)
    item_name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_items'


class TblLanguagesKnown(models.Model):
    user_id = models.PositiveIntegerField()
    language = models.CharField(max_length=100)
    can_speak = models.IntegerField(blank=True, null=True)
    can_read = models.IntegerField(blank=True, null=True)
    can_write = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        # managed = False
        db_table = 'tbl_languages_known'


class TblMinerals(models.Model):
    food_group = models.CharField(max_length=50)
    code = models.CharField(max_length=50)
    minerals_id = models.IntegerField()
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


class TblNutritionFood(models.Model):
    nutrition_food_id = models.AutoField(primary_key=True)
    food_name = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_nutrition_food'


class TblNutritionServiningSize(models.Model):
    servining_size_id = models.AutoField(primary_key=True)
    servining_size_name = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_nutrition_servining_size'


class TblNutritionValProducts(models.Model):
    nutrition_product_id = models.AutoField(primary_key=True)
    nutrition_food_id = models.IntegerField()
    servining_size_id = models.IntegerField()
    calories = models.CharField(max_length=50)
    total_fat = models.CharField(max_length=50)
    saturated_fat_4_2g = models.CharField(db_column='Saturated Fat 4.2g', max_length=50)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    sodium = models.CharField(max_length=50)
    total_carbohydrate = models.CharField(max_length=50)
    dietary_fiber = models.CharField(max_length=50)
    sugar = models.CharField(max_length=50)
    protein = models.CharField(max_length=50)
    vitamin_a = models.CharField(db_column='vitamin A', max_length=50)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    vitamin_c = models.CharField(db_column='vitamin C', max_length=50)  # Field name made lowercase. Field renamed to remove unsuitable characters.
    calcium = models.CharField(max_length=50)
    iron = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_nutrition_val_products'


class TblOrderSentLogistic(models.Model):
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
        # managed = False
        db_table = 'tbl_order_sent_logistic'


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
        # managed = False
        db_table = 'tbl_organic_acid'


class TblPackingInstruction(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_packing_instruction'


class TblPatDislikeFood(models.Model):
    description = models.CharField(max_length=250)
    patient_id = models.IntegerField()
    created_at = models.DateTimeField()

    class Meta:
        # managed = False
        db_table = 'tbl_pat_dislike_food'


class TblPatientCategory(models.Model):
    patient_id = models.AutoField(primary_key=True)
    patient_category = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_patient_category'


class TblPatientFoodItem(models.Model):
    food_name = models.CharField(max_length=250)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_patient_food_item'


class TblPatientHealth(models.Model):
    patienthealth_id = models.AutoField(primary_key=True)
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
        # managed = False
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
        # managed = False
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
        # managed = False
        db_table = 'tbl_patient_satisfaction_index'


class TblPayAnalysis(models.Model):
    bill_no = models.IntegerField()
    date = models.CharField(max_length=50)
    payment_mode = models.CharField(max_length=50)
    status = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    created_by = models.IntegerField()

    class Meta:
        # managed = False
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
        # managed = False
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
        # managed = False
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
        # managed = False
        db_table = 'tbl_polyphenols'


class TblProximateData(models.Model):
    proximate_id = models.AutoField(primary_key=True)
    proximate_name = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_proximate_data'


class TblProximateDietaryFiber(models.Model):
    code = models.CharField(max_length=15, blank=True, null=True)
    food_group = models.CharField(max_length=50, blank=True, null=True)
    prxmate = models.IntegerField(blank=True, null=True)
    food_name = models.CharField(max_length=50, blank=True, null=True)
    base_unit = models.CharField(max_length=50, blank=True, null=True)
    water = models.CharField(max_length=50, db_collation='utf8mb3_bin', blank=True, null=True)
    protein = models.CharField(max_length=50, blank=True, null=True)
    ash = models.CharField(max_length=50, blank=True, null=True)
    fatce = models.CharField(max_length=50, blank=True, null=True)
    fibtg = models.CharField(max_length=50, blank=True, null=True)
    fibins = models.CharField(max_length=50, blank=True, null=True)
    fibsol = models.CharField(max_length=50, blank=True, null=True)
    choavldf = models.CharField(max_length=50, blank=True, null=True)
    energy = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.CharField(max_length=50, blank=True, null=True)
    created_by = models.IntegerField(blank=True, null=True)

    class Meta:
        # managed = False
        db_table = 'tbl_proximate_dietary_fiber'


class TblQuestionSuggestionPat(models.Model):
    patient_id = models.IntegerField()
    suggest = models.CharField(max_length=1000)
    created_at = models.CharField(max_length=50)
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_question_suggestion_pat'


class TblQuestions(models.Model):
    pat_name = models.CharField(max_length=50)
    pat_age = models.CharField(max_length=50)
    ddl_gender = models.CharField(max_length=50)
    txt_height = models.CharField(max_length=50)
    text_weight = models.CharField(max_length=50)
    type_of_work = models.CharField(max_length=50)
    diet_pat = models.CharField(max_length=50)
    consume_egg = models.CharField(max_length=50)
    consume_dairy = models.CharField(max_length=50)
    txt_food_allergies_data = models.CharField(max_length=50)
    txt_no_meals = models.CharField(max_length=50)
    txt_snack = models.CharField(max_length=50)
    txt_fruits_everyday = models.CharField(max_length=50)
    txt_diet = models.CharField(max_length=50)
    txt_vggetables = models.CharField(max_length=50)
    txt_skip_meals = models.CharField(max_length=50)
    txt_get_food = models.CharField(max_length=50)
    p_activity = models.CharField(max_length=50)
    eat_food_out = models.CharField(max_length=50)
    consume_alcohol = models.CharField(max_length=50)
    d_smoke_day = models.CharField(max_length=50)
    txt_wkup = models.CharField(max_length=50)
    digestive_prblm = models.CharField(max_length=50)
    health_issue = models.CharField(max_length=50)
    eye_issue = models.CharField(max_length=50)
    txt_skin_issue = models.CharField(max_length=50)
    txt_anemia = models.CharField(max_length=50)
    txt_diabetes = models.CharField(max_length=50)
    txt_fm_diabetes = models.CharField(max_length=50)
    txt_hyper_tnsn = models.CharField(max_length=50)
    txt_fm_hyptnsn = models.CharField(max_length=50)
    txt_cardic_prblm = models.CharField(max_length=50)
    txt_fm_cardic_prblm = models.CharField(max_length=50)
    txt_thrd_prblm = models.CharField(max_length=50)
    txt_thrd_fm_prblm = models.CharField(max_length=50)
    txt_health_issue = models.CharField(max_length=50)
    txt_fm_prblm = models.CharField(max_length=50)
    txt_crntly_med = models.CharField(max_length=250)
    txt_fall_ill = models.CharField(max_length=50)
    any_m_prblm = models.CharField(max_length=50)
    txt_prblms_bl = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_questions'


class TblRcpBuilder(models.Model):
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
        # managed = False
        db_table = 'tbl_rcp_builder'


class TblRecepeDevEntry(models.Model):
    recepe_dev_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=50)
    firstname = models.CharField(max_length=50)
    address = models.CharField(max_length=50)
    date = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    mobile = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_recepe_dev_entry'


class TblRecipiesMaster(models.Model):
    recipies_master_id = models.AutoField(primary_key=True)
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
        # managed = False
        db_table = 'tbl_recipies_master'


class TblRemainder(models.Model):
    mobile = models.CharField(max_length=50)
    status = models.IntegerField()
    created_at = models.CharField(max_length=50)
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_remainder'


class TblRemainderDiet(models.Model):
    diet_id = models.IntegerField()
    mobile = models.CharField(max_length=50)
    patient_id = models.CharField(max_length=50)
    status = models.IntegerField()
    created_at = models.CharField(max_length=50)
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_remainder_diet'


class TblRole(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50)
    status = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_role'


class TblScheduleOtherServices(models.Model):
    service_code = models.CharField(max_length=50)
    date_time = models.CharField(max_length=50)
    time_slotone = models.CharField(max_length=50)
    time_slottwo = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_schedule_other_services'


class TblScmPerson(models.Model):
    scm_person_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_scm_person'


class TblScmPersonAdd(models.Model):
    scm_person_id = models.IntegerField()
    message = models.CharField(max_length=50)
    created_at = models.IntegerField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_scm_person_add'


class TblState(models.Model):
    state_id = models.BigAutoField(primary_key=True)
    state_name = models.CharField(max_length=333, db_collation='utf8mb3_general_ci')
    country_id = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_state'


class TblStatus(models.Model):
    status_id = models.AutoField(primary_key=True)
    status_name = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_status'


class TblSubGroup(models.Model):
    sub_group_id = models.AutoField(primary_key=True)
    sub_group_name = models.CharField(max_length=100)

    class Meta:
        # managed = False
        db_table = 'tbl_sub_group'


class TblSubItemGroup(models.Model):
    s_id = models.AutoField(primary_key=True)
    group_name = models.CharField(max_length=250)

    class Meta:
        # managed = False
        db_table = 'tbl_sub_item_group'


class TblSuggestions(models.Model):
    suggestions = models.CharField(max_length=50)
    messages = models.CharField(max_length=250)
    created_at = models.DateField()
    posted_by = models.IntegerField()
    ip = models.CharField(max_length=20)

    class Meta:
        # managed = False
        db_table = 'tbl_suggestions'


class TblSuppliers(models.Model):
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
        # managed = False
        db_table = 'tbl_suppliers'


class TblSvasthFoodCategory(models.Model):
    food_category_id = models.AutoField(primary_key=True)
    food_category_name = models.CharField(max_length=50)

    class Meta:
        # managed = False
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
        # managed = False
        db_table = 'tbl_svasth_food_master_data_add'


class TblSvasthFoodPlanMaster(models.Model):
    svasth_food_plan_id = models.AutoField(primary_key=True)
    plan_name = models.CharField(max_length=250)
    code = models.CharField(max_length=250)
    description = models.CharField(max_length=250)
    price_per_uom = models.IntegerField()
    price_per_month = models.IntegerField()
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_svasth_food_plan_master'


class TblSvasthFoodStyle(models.Model):
    food_style_id = models.AutoField(primary_key=True)
    food_style_name = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_svasth_food_style'


class TblSvasthHealthyTips(models.Model):
    health_tips_id = models.AutoField(primary_key=True)
    health_tips = models.CharField(max_length=250)
    patient_id = models.IntegerField()
    posted_by = models.IntegerField()
    created_at = models.CharField(max_length=50)

    class Meta:
        # managed = False
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
        # managed = False
        db_table = 'tbl_svasth_nutrient'


class TblSvasthSnpParameters(models.Model):
    snp_parameter_id = models.AutoField(primary_key=True)
    snp_parameter = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_svasth_snp_parameters'


class TblSvasthfoodGroupMaster(models.Model):
    food_category_id = models.AutoField(primary_key=True)
    food_category = models.CharField(max_length=250)
    group_code = models.CharField(max_length=50)
    created_by = models.IntegerField()
    created_at = models.DateField()

    class Meta:
        # managed = False
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
        # managed = False
        db_table = 'tbl_svasthhealth_pm'


class TblUomMaster(models.Model):
    uom_master_id = models.AutoField(primary_key=True)
    code = models.CharField(max_length=50)
    uom = models.CharField(max_length=100)
    created_at = models.DateTimeField()

    class Meta:
        # managed = False
        db_table = 'tbl_uom_master'


class TblUploadHealthChart(models.Model):
    report = models.CharField(max_length=50)
    date = models.DateField()
    posted_by = models.IntegerField()
    updated_by_dietitian = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_upload_health_chart'


class TblUploadKitchenDetails(models.Model):
    kitchen_report = models.CharField(max_length=250)
    created_at = models.CharField(max_length=250)
    posted_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_upload_kitchen_details'


class TblUploadReport(models.Model):
    report = models.CharField(max_length=50, blank=True, null=True)
    new_report = models.CharField(max_length=250, blank=True, null=True)
    date = models.DateField()
    posted_by = models.IntegerField()
    diet_id = models.IntegerField()
    updated_by_dietitian = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_upload_report'


class TblUploadReports(models.Model):
    report = models.CharField(max_length=50)
    date = models.DateField()
    posted_by = models.IntegerField()
    updated_by_dietitian = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_upload_reports'


class TblUserLoginDetails(models.Model):
    email = models.CharField(max_length=50)
    password = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_user_login_details'


class TblUserMapping(models.Model):
    nutrition = models.CharField(max_length=50)
    food_customer = models.CharField(max_length=50)
    food_supplier = models.CharField(max_length=50)

    class Meta:
        # managed = False
        db_table = 'tbl_user_mapping'


class TblWaterSolubleVtmnsval(models.Model):
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
        # managed = False
        db_table = 'tbl_water_soluble_vtmnsval'


class TblWeeks(models.Model):
    week_id = models.AutoField(primary_key=True)
    week_name = models.CharField(max_length=50)
    created_at = models.DateField()
    created_by = models.IntegerField()

    class Meta:
        # managed = False
        db_table = 'tbl_weeks'


class Tutorial(models.Model):
    titel = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField(blank=True, null=True)
    channel1_data = models.CharField(max_length=250, blank=True, null=True)
    posted_by = models.IntegerField(blank=True, null=True)
    date = models.CharField(max_length=50, blank=True, null=True)
    updated_date = models.CharField(max_length=50, blank=True, null=True)
    likes = models.IntegerField(blank=True, null=True)
    youtube_link = models.CharField(max_length=250, blank=True, null=True)

    class Meta:
        # managed = False
        db_table = 'tutorial'


class Users(models.Model):
    title = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=200, blank=True, null=True)
    password = models.CharField(max_length=60, blank=True, null=True)
    type = models.IntegerField(blank=True, null=True)
    firstname = models.CharField(max_length=50, blank=True, null=True)
    lastname = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    contact_info = models.CharField(max_length=100, blank=True, null=True)
    photo = models.CharField(max_length=200, blank=True, null=True)
    status = models.IntegerField(blank=True, null=True)
    activate_code = models.CharField(max_length=15, blank=True, null=True)
    reset_code = models.CharField(max_length=15, blank=True, null=True)
    created_on = models.DateField(blank=True, null=True)
    country = models.CharField(max_length=50, blank=True, null=True)
    city_id = models.CharField(max_length=255, blank=True, null=True)
    state_id = models.CharField(max_length=50, blank=True, null=True)
    mobile = models.CharField(max_length=50, blank=True, null=True)
    role_id = models.IntegerField(blank=True, null=True)
    zip_code = models.IntegerField(blank=True, null=True)
    lattitude = models.CharField(max_length=50, blank=True, null=True)
    longitude = models.CharField(max_length=50, blank=True, null=True)
    dob = models.CharField(max_length=50, blank=True, null=True)
    gender = models.CharField(max_length=50, blank=True, null=True)
    unique_id = models.CharField(max_length=50, blank=True, null=True)
    vault_no = models.CharField(max_length=100, blank=True, null=True)
    qr_path = models.CharField(max_length=500, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    file_name = models.CharField(max_length=1000, blank=True, null=True)
    whatsapp = models.CharField(max_length=50, blank=True, null=True)
    group_name = models.CharField(max_length=100, blank=True, null=True)
    caste = models.CharField(max_length=100, blank=True, null=True)
    religion = models.CharField(max_length=100, blank=True, null=True)
    medical_history = models.CharField(max_length=500, blank=True, null=True)
    join_date = models.DateTimeField(blank=True, null=True)
    company_name = models.CharField(max_length=50, blank=True, null=True)
    dor = models.CharField(max_length=50, blank=True, null=True)
    company_status_id = models.IntegerField(blank=True, null=True)
    bank_name = models.CharField(max_length=50, blank=True, null=True)
    acc_no = models.BigIntegerField(blank=True, null=True)
    branch_name = models.CharField(max_length=50, blank=True, null=True)
    ifsc_code = models.CharField(max_length=50, blank=True, null=True)
    gst_no = models.CharField(max_length=50, blank=True, null=True)
    date = models.CharField(max_length=50, blank=True, null=True)
    pat_weight = models.CharField(max_length=50, blank=True, null=True)
    pat_height = models.CharField(max_length=50, blank=True, null=True)
    txt_others = models.CharField(max_length=50, blank=True, null=True)
    txt_food_preferance = models.CharField(max_length=50, blank=True, null=True)
    food_style_name = models.CharField(max_length=50, blank=True, null=True)
    txt_qualification = models.CharField(max_length=50, blank=True, null=True)
    txt_computer_knowledge = models.CharField(max_length=50, blank=True, null=True)
    micro_kitchen_code = models.CharField(max_length=50, blank=True, null=True)
    food_category = models.CharField(max_length=50, blank=True, null=True)
    details_of_vehicle = models.TextField(blank=True, null=True)
    register_number = models.CharField(max_length=250, blank=True, null=True)
    lc_copy = models.CharField(max_length=250, blank=True, null=True)
    aadhar_copy_supply_chain = models.CharField(max_length=250, blank=True, null=True)
    upload_photo_selfie_sc = models.CharField(max_length=250, blank=True, null=True)
    work_expirence = models.TextField(blank=True, null=True)

    class Meta:
        # managed = False
        db_table = 'users'


class ViewRating(models.Model):
    rating_id = models.AutoField(primary_key=True)
    post_id = models.IntegerField()
    rating_number = models.IntegerField()
    total_points = models.IntegerField()
    patient_id = models.IntegerField()
    posted_by = models.IntegerField()
    compliance_rating = models.CharField(max_length=50)
    created = models.DateTimeField()
    modified = models.DateTimeField()
    status = models.IntegerField(db_comment='1 = Block, 0 = Unblock')

    class Meta:
        # managed = False
        db_table = 'view_rating'
