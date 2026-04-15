# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class Aaumconnectsms(models.Model):
    sno = models.AutoField(db_column='SNO', primary_key=True)  # Field name made lowercase.
    sender = models.CharField(db_column='Sender', max_length=50, blank=True, null=True)  # Field name made lowercase.
    virtualno = models.CharField(db_column='VirtualNo', max_length=50, blank=True, null=True)  # Field name made lowercase.
    content = models.CharField(db_column='Content', max_length=50, blank=True, null=True)  # Field name made lowercase.
    datetimestamp = models.DateTimeField(db_column='DateTimeStamp', blank=True, null=True)  # Field name made lowercase.
    address = models.CharField(max_length=250, blank=True, null=True)
    speed = models.CharField(db_column='Speed', max_length=50, blank=True, null=True)  # Field name made lowercase.
    batterystatus = models.CharField(db_column='BatteryStatus', max_length=50, blank=True, null=True)  # Field name made lowercase.
    voltage = models.CharField(db_column='Voltage', max_length=50, blank=True, null=True)  # Field name made lowercase.
    charging = models.CharField(db_column='Charging', max_length=50, blank=True, null=True)  # Field name made lowercase.
    devicedatetime = models.DateTimeField(db_column='DeviceDateTime', blank=True, null=True)  # Field name made lowercase.
    aaum_lat = models.CharField(db_column='Aaum_LAT', max_length=50, blank=True, null=True)  # Field name made lowercase.
    aaum_long = models.CharField(db_column='Aaum_LONG', max_length=50, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'aaumconnectsms'


class AirtelData(models.Model):
    airtel_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.CharField(max_length=50)
    mobile = models.BigIntegerField()
    qrpath = models.CharField(max_length=100)
    vault_no = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'airtel_data'


class Amrendra(models.Model):
    id = models.IntegerField()
    image = models.TextField()
    name = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = 'amrendra'


class BankingInfo(models.Model):
    via = models.CharField(max_length=50)
    acc = models.CharField(max_length=50)
    bname = models.CharField(max_length=50)
    toa = models.CharField(max_length=50)
    accno = models.CharField(max_length=50)
    ifsc = models.CharField(max_length=50)
    nbanking = models.CharField(max_length=50)
    dom = models.CharField(max_length=50)
    acc1 = models.CharField(max_length=50)
    bname1 = models.CharField(max_length=50)
    toa1 = models.CharField(max_length=50)
    accno1 = models.CharField(max_length=50)
    ifsc1 = models.CharField(max_length=50)
    nbanking1 = models.CharField(max_length=50)
    dom1 = models.CharField(max_length=50)
    acc2 = models.CharField(max_length=50)
    bname2 = models.CharField(max_length=50)
    toa2 = models.CharField(max_length=50)
    accno2 = models.CharField(max_length=50)
    ifsc2 = models.CharField(max_length=50)
    nbanking2 = models.CharField(max_length=50)
    dom2 = models.CharField(max_length=50)
    acc3 = models.CharField(max_length=50)
    bname3 = models.CharField(max_length=50)
    toa3 = models.CharField(max_length=50)
    accno3 = models.CharField(max_length=50)
    ifsc3 = models.CharField(max_length=50)
    nbanking3 = models.CharField(max_length=50)
    dom3 = models.CharField(max_length=50)
    acc4 = models.CharField(max_length=50)
    bname4 = models.CharField(max_length=50)
    toa4 = models.CharField(max_length=50)
    accno4 = models.CharField(max_length=50)
    ifsc4 = models.CharField(max_length=50)
    nbanking4 = models.CharField(max_length=50)
    dom4 = models.CharField(max_length=50)
    bname5 = models.CharField(max_length=50)
    emiamt = models.CharField(max_length=50)
    emidate = models.CharField(max_length=50)
    doc = models.CharField(max_length=100)
    tol = models.CharField(max_length=50)
    bname6 = models.CharField(max_length=50)
    emiamt1 = models.CharField(max_length=50)
    emidate1 = models.CharField(max_length=50)
    doc1 = models.CharField(max_length=50)
    tol1 = models.CharField(max_length=50)
    bname7 = models.CharField(max_length=50)
    emiamt2 = models.CharField(max_length=50)
    emidate2 = models.CharField(max_length=50)
    doc2 = models.CharField(max_length=50)
    tol2 = models.CharField(max_length=50)
    bname8 = models.CharField(max_length=50)
    emiamt3 = models.CharField(max_length=50)
    emidate3 = models.CharField(max_length=50)
    doc3 = models.CharField(max_length=50)
    tol3 = models.CharField(max_length=50)
    bname9 = models.CharField(max_length=50)
    emiamt4 = models.CharField(max_length=50)
    emidate4 = models.CharField(max_length=50)
    doc4 = models.CharField(max_length=50)
    tol4 = models.CharField(max_length=50)
    bname10 = models.CharField(max_length=50)
    emiamt5 = models.CharField(max_length=50)
    emidate5 = models.CharField(max_length=50)
    doc5 = models.CharField(max_length=50)
    tol5 = models.CharField(max_length=50)
    card = models.CharField(max_length=50)
    cardtype = models.CharField(max_length=50)
    accno5 = models.CharField(max_length=50)
    cardno = models.CharField(max_length=50)
    limit0 = models.CharField(max_length=50)
    cardexp = models.CharField(max_length=50)
    cardlimit = models.CharField(max_length=50)
    cd = models.CharField(max_length=50)
    card1 = models.CharField(max_length=50)
    cardtype1 = models.CharField(max_length=50)
    accno6 = models.CharField(max_length=50)
    cardno1 = models.CharField(max_length=50)
    limit1 = models.CharField(max_length=50)
    cardexp1 = models.CharField(max_length=50)
    cardlimit1 = models.CharField(max_length=50)
    cd1 = models.CharField(max_length=50)
    card2 = models.CharField(max_length=50)
    cardtype2 = models.CharField(max_length=50)
    accno7 = models.CharField(max_length=50)
    cardno2 = models.CharField(max_length=50)
    limit2 = models.CharField(max_length=50)
    cardexp2 = models.CharField(max_length=50)
    cardlimit2 = models.CharField(max_length=50)
    cd2 = models.CharField(max_length=50)
    card3 = models.CharField(max_length=50)
    cardtype3 = models.CharField(max_length=50)
    accno8 = models.CharField(max_length=50)
    cardno3 = models.CharField(max_length=50)
    limit3 = models.CharField(max_length=50)
    cardexp3 = models.CharField(max_length=50)
    cardlimit3 = models.CharField(max_length=50)
    cd3 = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'banking_info'


class Bonds(models.Model):
    via = models.CharField(max_length=50)
    title = models.CharField(max_length=50)
    invest = models.CharField(max_length=50)
    nob = models.CharField(max_length=50)
    interest = models.CharField(max_length=50)
    matvalue = models.CharField(max_length=50)
    matdate = models.CharField(max_length=50)
    doc = models.CharField(max_length=50)
    updated_at = models.DateTimeField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'bonds'


class BreakfastAccucheck(models.Model):
    bid = models.AutoField(primary_key=True)
    bdate = models.CharField(max_length=50)
    btime = models.CharField(max_length=50)
    before_20mins = models.CharField(max_length=50)
    after_20mins = models.CharField(max_length=50)
    sim_no = models.CharField(max_length=50)
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'breakfast_accucheck'


class Callback(models.Model):
    name = models.CharField(max_length=30)
    company = models.CharField(max_length=30)
    email = models.CharField(max_length=30)
    phone = models.CharField(max_length=30)
    mobile = models.CharField(max_length=30)
    created_at = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'callback'


class Cities(models.Model):
    city_id = models.AutoField(primary_key=True)
    city_name = models.CharField(max_length=100)
    city_state = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'cities'


class ClientLocationMaster(models.Model):
    state = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=100)
    vault_no = models.CharField(max_length=100)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'client_location_master'


class ClientMailingDetails(models.Model):
    userid = models.IntegerField()
    client_name = models.CharField(max_length=100)
    contactperson = models.CharField(db_column='ContactPerson', max_length=30)  # Field name made lowercase.
    querymail = models.CharField(db_column='QueryMail', max_length=80)  # Field name made lowercase.
    state = models.CharField(db_column='State', max_length=30)  # Field name made lowercase.
    city = models.CharField(db_column='City', max_length=40)  # Field name made lowercase.
    contactaddress = models.CharField(db_column='ContactAddress', max_length=150)  # Field name made lowercase.
    client_mail = models.CharField(max_length=120)
    provisional_id = models.CharField(db_column='Provisional_ID', max_length=100)  # Field name made lowercase.
    contact_no = models.CharField(db_column='Contact_no', max_length=100)  # Field name made lowercase.
    vault_no = models.CharField(max_length=100)
    created_at = models.DateTimeField(db_column='Created_at')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'client_mailing_details'


class ClinicalTrialNew(models.Model):
    cl_lab_id = models.AutoField(primary_key=True)
    clinical_trial_subject_to = models.CharField(max_length=250, blank=True, null=True)
    kanva_regno = models.CharField(max_length=250, blank=True, null=True)
    svasth_device_no = models.CharField(max_length=250, blank=True, null=True)
    device_reading_no = models.IntegerField(blank=True, null=True)
    fasting_one_dr_no = models.CharField(max_length=250, blank=True, null=True)
    fasting_two_dr_no = models.CharField(max_length=250, blank=True, null=True)
    pp_one_dr_no = models.CharField(max_length=250, blank=True, null=True)
    pp_twodr_no = models.CharField(max_length=250, blank=True, null=True)
    fasting_clab_reading = models.CharField(max_length=250, blank=True, null=True)
    pp_clab_reading = models.CharField(max_length=250, blank=True, null=True)
    random_v = models.CharField(max_length=50, blank=True, null=True)
    date = models.CharField(max_length=250, blank=True, null=True)
    created_by = models.CharField(max_length=250, blank=True, null=True)
    created_at = models.DateTimeField()
    adc_1 = models.IntegerField()
    adc_2 = models.IntegerField()
    adc_3 = models.IntegerField()
    adc_4 = models.IntegerField()
    adc_5 = models.IntegerField()
    adc_6 = models.IntegerField()
    adc_7 = models.IntegerField()
    adc_8 = models.IntegerField()
    adc_9 = models.IntegerField()
    adc_10 = models.IntegerField()
    adc_11 = models.IntegerField()
    adc_12 = models.IntegerField()
    adc_13 = models.IntegerField()
    adc_14 = models.IntegerField()
    adc_15 = models.IntegerField()
    adc_16 = models.IntegerField()
    adc_17 = models.IntegerField()
    adc_18 = models.IntegerField()
    adc_19 = models.IntegerField()
    adc_20 = models.IntegerField()
    adc_21 = models.IntegerField()
    adc_22 = models.IntegerField()
    adc_23 = models.IntegerField()
    adc_24 = models.IntegerField()
    adc_25 = models.IntegerField()
    adc_26 = models.IntegerField()
    adc_27 = models.IntegerField()
    adc_28 = models.IntegerField()
    adc_29 = models.IntegerField()
    adc_30 = models.IntegerField()
    adc_31 = models.IntegerField()
    adc_32 = models.IntegerField()
    adc_33 = models.IntegerField()
    adc_34 = models.IntegerField()
    adc_35 = models.IntegerField()
    adc_36 = models.IntegerField()
    adc_37 = models.IntegerField()
    adc_38 = models.IntegerField()
    adc_39 = models.IntegerField()
    adc_40 = models.IntegerField()
    adc_41 = models.IntegerField()
    adc_42 = models.IntegerField()
    adc_43 = models.IntegerField()
    adc_44 = models.IntegerField()
    adc_45 = models.IntegerField()
    adc_46 = models.IntegerField()
    adc_47 = models.IntegerField()
    adc_48 = models.IntegerField()
    adc_49 = models.IntegerField()
    adc_50 = models.IntegerField()
    adc_51 = models.IntegerField()
    adc_52 = models.IntegerField()
    adc_53 = models.IntegerField()
    adc_54 = models.IntegerField()
    adc_55 = models.IntegerField()
    adc_56 = models.IntegerField()
    adc_57 = models.IntegerField()
    adc_58 = models.IntegerField()
    adc_59 = models.IntegerField()
    adc_60 = models.IntegerField()
    adc_61 = models.IntegerField()
    adc_62 = models.IntegerField()
    adc_63 = models.IntegerField()
    adc_64 = models.IntegerField()
    adc_65 = models.IntegerField()
    adc_66 = models.IntegerField()
    adc_67 = models.IntegerField()
    adc_68 = models.IntegerField()
    adc_69 = models.IntegerField()
    adc_70 = models.IntegerField()
    adc_71 = models.IntegerField()
    adc_72 = models.IntegerField()
    adc_73 = models.IntegerField()
    adc_74 = models.IntegerField()
    adc_75 = models.IntegerField()
    adc_76 = models.IntegerField()
    adc_77 = models.IntegerField()
    adc_78 = models.IntegerField()
    adc_79 = models.IntegerField()
    adc_80 = models.IntegerField()
    lab_bg_val = models.CharField(max_length=250, blank=True, null=True)
    fast_or_pp = models.CharField(max_length=250, blank=True, null=True)
    std_dev = models.CharField(max_length=250, blank=True, null=True)
    std_mean = models.CharField(max_length=250, blank=True, null=True)
    cov = models.CharField(max_length=250, blank=True, null=True)
    cov_r = models.CharField(max_length=250, blank=True, null=True)
    remarks = models.CharField(db_column='Remarks', max_length=200, blank=True, null=True)  # Field name made lowercase.
    site_name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'clinical_trial_new'


class ClinicalTrialPulseOximeter(models.Model):
    cl_lab_id = models.AutoField(primary_key=True)
    clinical_trial_subject_to = models.CharField(max_length=250, blank=True, null=True)
    kanva_regno = models.CharField(max_length=250, blank=True, null=True)
    svasth_device_no = models.CharField(max_length=250, blank=True, null=True)
    device_reading_no = models.IntegerField(blank=True, null=True)
    fasting_one_dr_no = models.CharField(max_length=250, blank=True, null=True)
    fasting_two_dr_no = models.CharField(max_length=250, blank=True, null=True)
    pp_one_dr_no = models.CharField(max_length=250, blank=True, null=True)
    pp_twodr_no = models.CharField(max_length=250, blank=True, null=True)
    fasting_clab_reading = models.CharField(max_length=250, blank=True, null=True)
    pp_clab_reading = models.CharField(max_length=250, blank=True, null=True)
    random_v = models.CharField(max_length=50, blank=True, null=True)
    date = models.CharField(max_length=250, blank=True, null=True)
    created_by = models.CharField(max_length=250, blank=True, null=True)
    created_at = models.DateTimeField()
    adc_1 = models.IntegerField()
    adc_2 = models.IntegerField()
    adc_3 = models.IntegerField()
    adc_4 = models.IntegerField()
    adc_5 = models.IntegerField()
    adc_6 = models.IntegerField()
    adc_7 = models.IntegerField()
    adc_8 = models.IntegerField()
    adc_9 = models.IntegerField()
    adc_10 = models.IntegerField()
    adc_11 = models.IntegerField()
    adc_12 = models.IntegerField()
    adc_13 = models.IntegerField()
    adc_14 = models.IntegerField()
    adc_15 = models.IntegerField()
    adc_16 = models.IntegerField()
    adc_17 = models.IntegerField()
    adc_18 = models.IntegerField()
    adc_19 = models.IntegerField()
    adc_20 = models.IntegerField()
    adc_21 = models.IntegerField()
    adc_22 = models.IntegerField()
    adc_23 = models.IntegerField()
    adc_24 = models.IntegerField()
    adc_25 = models.IntegerField()
    adc_26 = models.IntegerField()
    adc_27 = models.IntegerField()
    adc_28 = models.IntegerField()
    adc_29 = models.IntegerField()
    adc_30 = models.IntegerField()
    adc_31 = models.IntegerField()
    adc_32 = models.IntegerField()
    adc_33 = models.IntegerField()
    adc_34 = models.IntegerField()
    adc_35 = models.IntegerField()
    adc_36 = models.IntegerField()
    adc_37 = models.IntegerField()
    adc_38 = models.IntegerField()
    adc_39 = models.IntegerField()
    adc_40 = models.IntegerField()
    adc_41 = models.IntegerField()
    adc_42 = models.IntegerField()
    adc_43 = models.IntegerField()
    adc_44 = models.IntegerField()
    adc_45 = models.IntegerField()
    adc_46 = models.IntegerField()
    adc_47 = models.IntegerField()
    adc_48 = models.IntegerField()
    adc_49 = models.IntegerField()
    adc_50 = models.IntegerField()
    adc_51 = models.IntegerField()
    adc_52 = models.IntegerField()
    adc_53 = models.IntegerField()
    adc_54 = models.IntegerField()
    adc_55 = models.IntegerField()
    adc_56 = models.IntegerField()
    adc_57 = models.IntegerField()
    adc_58 = models.IntegerField()
    adc_59 = models.IntegerField()
    adc_60 = models.IntegerField()
    adc_61 = models.IntegerField()
    adc_62 = models.IntegerField()
    adc_63 = models.IntegerField()
    adc_64 = models.IntegerField()
    adc_65 = models.IntegerField()
    adc_66 = models.IntegerField()
    adc_67 = models.IntegerField()
    adc_68 = models.IntegerField()
    adc_69 = models.IntegerField()
    adc_70 = models.IntegerField()
    adc_71 = models.IntegerField()
    adc_72 = models.IntegerField()
    adc_73 = models.IntegerField()
    adc_74 = models.IntegerField()
    adc_75 = models.IntegerField()
    adc_76 = models.IntegerField()
    adc_77 = models.IntegerField()
    adc_78 = models.IntegerField()
    adc_79 = models.IntegerField()
    adc_80 = models.IntegerField()
    lab_bg_val = models.CharField(max_length=250, blank=True, null=True)
    fast_or_pp = models.CharField(max_length=250, blank=True, null=True)
    std_dev = models.CharField(max_length=250, blank=True, null=True)
    std_mean = models.CharField(max_length=250, blank=True, null=True)
    cov = models.CharField(max_length=250, blank=True, null=True)
    cov_r = models.CharField(max_length=250, blank=True, null=True)
    remarks = models.CharField(db_column='Remarks', max_length=200, blank=True, null=True)  # Field name made lowercase.
    bg_gluc = models.CharField(db_column='BG_GLUC', max_length=50, blank=True, null=True)  # Field name made lowercase.
    sitename = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'clinical_trial_pulse_oximeter'


class Comment(models.Model):
    vault_no = models.CharField(max_length=20)
    comment_name = models.CharField(max_length=50)
    post_id = models.CharField(max_length=50)
    post_vnum = models.CharField(max_length=150)
    comment = models.CharField(max_length=200)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'comment'


class CompanyDetails(models.Model):
    via = models.CharField(max_length=100)
    vault_no = models.CharField(max_length=50)
    company_brief = models.CharField(max_length=5000, blank=True, null=True)
    company_products = models.CharField(max_length=5000, blank=True, null=True)
    company_facilities = models.CharField(max_length=5000, blank=True, null=True)
    company_clients = models.CharField(max_length=1000, blank=True, null=True)
    company_plan = models.CharField(max_length=1000, blank=True, null=True)
    company_logo = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'company_details'


class CompanyUserGallery(models.Model):
    vault_no = models.CharField(max_length=100)
    via = models.CharField(max_length=100)
    file_name = models.CharField(db_column='FILE_NAME', max_length=200)  # Field name made lowercase.
    file_size = models.CharField(db_column='FILE_SIZE', max_length=50)  # Field name made lowercase.
    file_type = models.CharField(db_column='FILE_TYPE', max_length=50)  # Field name made lowercase.
    full_file_name = models.CharField(db_column='FULL_FILE_NAME', max_length=150)  # Field name made lowercase.
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'company_user_gallery'


class Companyletterhead(models.Model):
    filename = models.CharField(max_length=255)
    vault_no = models.CharField(max_length=255)
    created_at = models.CharField(max_length=255)
    doc_name = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'companyletterhead'


class Companyregistration(models.Model):
    company_core = models.CharField(max_length=40)
    category = models.CharField(max_length=40)
    professional = models.CharField(db_column='Professional', max_length=10, blank=True, null=True)  # Field name made lowercase.
    serviceproviders = models.CharField(db_column='ServiceProviders', max_length=10, blank=True, null=True)  # Field name made lowercase.
    manufacturers = models.CharField(db_column='Manufacturers', max_length=30, blank=True, null=True)  # Field name made lowercase.
    firm_name = models.CharField(max_length=500)
    status = models.CharField(max_length=10)
    yos = models.CharField(max_length=30)
    address = models.CharField(max_length=1000)
    country = models.CharField(max_length=10)
    state = models.CharField(max_length=30)
    city = models.CharField(max_length=30)
    pin = models.CharField(max_length=20)
    password = models.CharField(max_length=100)
    gstno = models.CharField(max_length=100)
    membershipno = models.CharField(db_column='MembershipNo', max_length=50, blank=True, null=True)  # Field name made lowercase.
    mobile = models.CharField(max_length=100)
    email = models.CharField(unique=True, max_length=150)
    confirmation = models.CharField(db_column='Confirmation', max_length=100, blank=True, null=True)  # Field name made lowercase.
    otpdigit = models.IntegerField(db_column='OtpDigit', blank=True, null=True)  # Field name made lowercase.
    vault_no = models.CharField(max_length=20)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'companyregistration'


class Contacts(models.Model):
    id = models.AutoField(db_column='ID', primary_key=True)  # Field name made lowercase.
    vault_no = models.CharField(max_length=50)
    name = models.CharField(max_length=200)
    skype_id = models.CharField(max_length=150, blank=True, null=True)
    fb_id = models.CharField(max_length=150, blank=True, null=True)
    in_id = models.CharField(max_length=150, blank=True, null=True)
    tweet_id = models.CharField(max_length=150, blank=True, null=True)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'contacts'


class Countries(models.Model):
    sortname = models.CharField(max_length=3)
    name = models.CharField(max_length=150)
    phonecode = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'countries'


class CountryCodes(models.Model):
    country_name = models.CharField(max_length=50)
    internet_code = models.CharField(max_length=10)
    country_code = models.CharField(max_length=10)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'country_codes'


class CustomerGstReceivableAmount(models.Model):
    generate_gstinvoice_no = models.IntegerField(db_column='Generate_gstinvoice_no')  # Field name made lowercase.
    sale_order = models.CharField(db_column='Sale_order', max_length=100)  # Field name made lowercase.
    so_date = models.DateField(db_column='So_date')  # Field name made lowercase.
    customercode = models.CharField(db_column='CustomerCode', max_length=100)  # Field name made lowercase.
    customername = models.CharField(db_column='CustomerName', max_length=100)  # Field name made lowercase.
    billing_address = models.CharField(db_column='Billing_Address', max_length=100)  # Field name made lowercase.
    shipping_address = models.CharField(db_column='Shipping_Address', max_length=100)  # Field name made lowercase.
    billing_state = models.CharField(db_column='Billing_state', max_length=100)  # Field name made lowercase.
    shipping_state = models.CharField(db_column='Shipping_state', max_length=100)  # Field name made lowercase.
    gstn_no = models.IntegerField(db_column='Gstn_no')  # Field name made lowercase.
    invoice_no = models.IntegerField(db_column='Invoice_no')  # Field name made lowercase.
    invoice_date = models.DateField(db_column='Invoice_date')  # Field name made lowercase.
    sgst_amt = models.CharField(db_column='Sgst_amt', max_length=100)  # Field name made lowercase.
    cgst_amt = models.CharField(db_column='Cgst_amt', max_length=100)  # Field name made lowercase.
    igst_amt = models.CharField(db_column='Igst_amt', max_length=100)  # Field name made lowercase.
    due_date = models.DateField(db_column='Due_date')  # Field name made lowercase.
    return_date = models.DateField(db_column='Return_date')  # Field name made lowercase.
    gstdue_date = models.DateField(db_column='Gstdue_date')  # Field name made lowercase.
    gstchallan_no = models.CharField(db_column='Gstchallan_no', max_length=100)  # Field name made lowercase.
    gstchallan_date = models.DateField(db_column='Gstchallan_date')  # Field name made lowercase.
    vault_no = models.CharField(max_length=100)
    userid = models.IntegerField(db_column='Userid')  # Field name made lowercase.
    document_scans = models.CharField(db_column='Document_scans', max_length=100)  # Field name made lowercase.
    created_at = models.DateTimeField(db_column='Created_at')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'customer_gst_receivable_amount'


class CustomerReceivableAmount(models.Model):
    generate_gstinvoice_no = models.IntegerField(db_column='Generate_gstinvoice_no')  # Field name made lowercase.
    sale_order = models.CharField(db_column='Sale_order', max_length=100)  # Field name made lowercase.
    so_date = models.DateField(db_column='So_date')  # Field name made lowercase.
    customercode = models.CharField(db_column='CustomerCode', max_length=100)  # Field name made lowercase.
    customername = models.CharField(db_column='CustomerName', max_length=100)  # Field name made lowercase.
    billing_address = models.CharField(db_column='Billing_Address', max_length=100)  # Field name made lowercase.
    shipping_address = models.CharField(db_column='Shipping_Address', max_length=100)  # Field name made lowercase.
    billing_state = models.CharField(db_column='Billing_state', max_length=100)  # Field name made lowercase.
    shipping_state = models.CharField(db_column='Shipping_state', max_length=100)  # Field name made lowercase.
    gstn_no = models.IntegerField(db_column='Gstn_no')  # Field name made lowercase.
    isregistered = models.CharField(db_column='isRegistered', max_length=5)  # Field name made lowercase.
    invoice_no = models.IntegerField(db_column='Invoice_no')  # Field name made lowercase.
    invoice_value = models.CharField(db_column='Invoice_value', max_length=100)  # Field name made lowercase.
    invoice_date = models.DateField(db_column='Invoice_date')  # Field name made lowercase.
    credit_days = models.CharField(db_column='Credit_days', max_length=50)  # Field name made lowercase.
    due_date = models.DateField(db_column='Due_date')  # Field name made lowercase.
    receivable_amt = models.CharField(db_column='Receivable_amt', max_length=100)  # Field name made lowercase.
    vault_no = models.CharField(max_length=100)
    userid = models.IntegerField(db_column='Userid')  # Field name made lowercase.
    created_at = models.DateTimeField(db_column='Created_at')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'customer_receivable_amount'


class CustomerTypeMaster(models.Model):
    customer_type = models.CharField(db_column='Customer_type', max_length=255)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'customer_type_master'


class DinnerAccucheck(models.Model):
    did = models.AutoField(primary_key=True)
    ddate = models.CharField(max_length=50)
    dtime = models.CharField(max_length=50)
    before_20mins = models.CharField(max_length=50)
    after_20mins = models.CharField(max_length=50)
    sim_no = models.CharField(max_length=50)
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'dinner_accucheck'


class Driving(models.Model):
    vault_no = models.CharField(max_length=50)
    dno = models.CharField(max_length=50)
    ia = models.CharField(max_length=50)
    rd = models.CharField(max_length=50)
    doc_driving = models.CharField(max_length=50)
    u_no = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'driving'


class Education(models.Model):
    via = models.CharField(max_length=20)
    school = models.CharField(max_length=10)
    year = models.CharField(max_length=50)
    title = models.CharField(max_length=50)
    institution = models.CharField(max_length=50)
    grade = models.CharField(max_length=50)
    keywords = models.CharField(max_length=50)
    keysub = models.CharField(max_length=50)
    college = models.CharField(max_length=50)
    year1 = models.CharField(max_length=50)
    title1 = models.CharField(max_length=50)
    institution1 = models.CharField(max_length=50)
    grade1 = models.CharField(max_length=50)
    keywords1 = models.CharField(max_length=50)
    keysub1 = models.CharField(max_length=50)
    degree = models.CharField(max_length=50)
    year2 = models.CharField(max_length=50)
    title2 = models.CharField(max_length=50)
    institution2 = models.CharField(max_length=50)
    grade2 = models.CharField(max_length=50)
    keywords2 = models.CharField(max_length=50)
    keysub2 = models.CharField(max_length=50)
    degree1 = models.CharField(max_length=50)
    year3 = models.CharField(max_length=50)
    title3 = models.CharField(max_length=50)
    institution3 = models.CharField(max_length=50)
    grade3 = models.CharField(max_length=50)
    keywords3 = models.CharField(max_length=50)
    keysub3 = models.CharField(max_length=50)
    professional = models.CharField(max_length=15)
    year4 = models.CharField(max_length=20)
    title4 = models.CharField(max_length=100)
    institution4 = models.CharField(max_length=100)
    grade4 = models.CharField(max_length=100)
    keywords4 = models.CharField(max_length=100)
    keysub4 = models.CharField(max_length=100)
    professional1 = models.CharField(max_length=100)
    year5 = models.CharField(max_length=100)
    title5 = models.CharField(max_length=100)
    institution5 = models.CharField(max_length=100)
    grade5 = models.CharField(max_length=100)
    keywords5 = models.CharField(max_length=100)
    keysub5 = models.CharField(max_length=100)
    professional2 = models.CharField(max_length=100)
    year6 = models.CharField(max_length=100)
    title6 = models.CharField(max_length=100)
    institution6 = models.CharField(max_length=100)
    grade6 = models.CharField(max_length=100)
    keywords6 = models.CharField(max_length=100)
    keysub6 = models.CharField(max_length=100)
    pg = models.CharField(max_length=100)
    year7 = models.CharField(max_length=100)
    title7 = models.CharField(max_length=100)
    institution7 = models.CharField(max_length=100)
    grade7 = models.CharField(max_length=100)
    keywords7 = models.CharField(max_length=100)
    keysub7 = models.CharField(max_length=100)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'education'


class EmailContacts(models.Model):
    email = models.CharField(max_length=250)
    vault_no = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'email_contacts'


class Feedback(models.Model):
    feedback_id = models.AutoField(primary_key=True)
    user_id = models.IntegerField()
    feedback_txt = models.CharField(max_length=120)
    star = models.CharField(max_length=1)
    date = models.CharField(db_column='Date', max_length=30)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'feedback'


class Groups(models.Model):
    vault_no = models.CharField(max_length=50)
    gname = models.CharField(unique=True, max_length=100)
    ginfo = models.CharField(max_length=500)
    gpic = models.CharField(max_length=200)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'groups'


class GstVoice(models.Model):
    vault_no = models.CharField(max_length=20)
    via = models.CharField(max_length=20)
    status = models.CharField(max_length=1000)
    topic = models.CharField(max_length=100)
    g_id = models.CharField(max_length=20)
    macro = models.CharField(max_length=20)
    micro = models.CharField(max_length=20)
    nano = models.CharField(max_length=20)
    post_upload = models.CharField(max_length=200, blank=True, null=True)
    alert_status = models.IntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'gst_voice'


class Gstr1B2Binvoices(models.Model):
    userid = models.CharField(db_column='Userid', max_length=50)  # Field name made lowercase.
    inum = models.CharField(max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)
    ledgerid = models.IntegerField(db_column='ledgerId', blank=True, null=True)  # Field name made lowercase.
    jvstatus = models.IntegerField(db_column='JVStatus')  # Field name made lowercase.
    idt = models.DateField(blank=True, null=True)
    exp_typ = models.CharField(max_length=50, blank=True, null=True)
    matching_controllerno = models.CharField(db_column='Matching_controllerno', max_length=100, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    flag = models.CharField(max_length=10, db_collation='latin1_swedish_ci', blank=True, null=True)
    reasons = models.CharField(max_length=500, blank=True, null=True)
    chksum = models.CharField(max_length=64, db_collation='latin1_swedish_ci')
    email = models.CharField(max_length=75, db_collation='latin1_swedish_ci', blank=True, null=True)
    phone_no = models.CharField(max_length=50, blank=True, null=True)
    itemcode = models.CharField(db_column='ItemCode', max_length=30, blank=True, null=True)  # Field name made lowercase.
    val = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    rchrg = models.CharField(max_length=1, db_collation='latin1_swedish_ci', blank=True, null=True)
    od_num = models.CharField(max_length=30, db_collation='latin1_swedish_ci', blank=True, null=True)
    od_dt = models.DateTimeField(blank=True, null=True)
    etin = models.CharField(max_length=15, db_collation='latin1_swedish_ci', blank=True, null=True)
    num = models.IntegerField(blank=True, null=True)
    hsn_sc = models.CharField(max_length=10)
    txval = models.DecimalField(max_digits=11, decimal_places=2, blank=True, null=True)
    gstrate = models.CharField(max_length=30, blank=True, null=True)
    irt = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    iamt = models.DecimalField(max_digits=11, decimal_places=2, blank=True, null=True)
    crt = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    camt = models.DecimalField(max_digits=11, decimal_places=2, blank=True, null=True)
    srt = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    samt = models.DecimalField(max_digits=11, decimal_places=2, blank=True, null=True)
    csrt = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    csamt = models.DecimalField(max_digits=11, decimal_places=2, blank=True, null=True)
    sbnum = models.CharField(max_length=30, db_collation='latin1_swedish_ci')
    sbdt = models.CharField(max_length=50, db_collation='latin1_swedish_ci')
    sbpcode = models.CharField(max_length=25, db_collation='latin1_swedish_ci')
    typ = models.CharField(max_length=2, db_collation='latin1_swedish_ci', blank=True, null=True)
    ad_amt = models.DecimalField(max_digits=15, decimal_places=2)
    sply_ty = models.CharField(max_length=5, db_collation='latin1_swedish_ci', blank=True, null=True)
    nil_amt = models.DecimalField(max_digits=15, decimal_places=2)
    expt_amt = models.DecimalField(max_digits=15, decimal_places=2)
    section_type = models.CharField(db_column='Section_type', max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    customercode = models.CharField(db_column='CustomerCode', max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    divisioncode = models.CharField(db_column='DivisionCode', max_length=100, blank=True, null=True)  # Field name made lowercase.
    customername = models.CharField(db_column='CustomerName', max_length=100, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    sellerstate = models.CharField(db_column='SellerState', max_length=75, blank=True, null=True)  # Field name made lowercase.
    emailofseller = models.CharField(db_column='EmailofSeller', max_length=100, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    emailofreceiver = models.CharField(db_column='EmailofReceiver', max_length=100, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    pos = models.CharField(max_length=2, db_collation='latin1_swedish_ci', blank=True, null=True)
    gstr_tableref = models.CharField(db_column='Gstr_tableref', max_length=50, db_collation='latin1_swedish_ci')  # Field name made lowercase.
    gstinno_seller = models.CharField(db_column='Gstinno_seller', max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    gstinno_customer = models.CharField(db_column='Gstinno_customer', max_length=30, blank=True, null=True)  # Field name made lowercase.
    contact_of_customer = models.CharField(db_column='Contact_of_customer', max_length=50, blank=True, null=True)  # Field name made lowercase.
    name_of_seller = models.CharField(db_column='Name_of_seller', max_length=50, db_collation='latin1_swedish_ci')  # Field name made lowercase.
    address_of_seller = models.CharField(db_column='Address_of_seller', max_length=200, blank=True, null=True)  # Field name made lowercase.
    name_of_receiver = models.CharField(db_column='Name_of_receiver', max_length=255, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    address_of_receiver = models.CharField(db_column='Address_of_receiver', max_length=255, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    ctin = models.CharField(max_length=30, db_collation='latin1_swedish_ci', blank=True, null=True)
    name_of_customer = models.CharField(db_column='Name_of_customer', max_length=100, blank=True, null=True)  # Field name made lowercase.
    addressofcustomer = models.CharField(db_column='AddressOfCustomer', max_length=255, blank=True, null=True)  # Field name made lowercase.
    statecodeofcustomer = models.CharField(db_column='StatecodeofCustomer', max_length=50, blank=True, null=True)  # Field name made lowercase.
    statenameofcustomer = models.CharField(db_column='StatenameofCustomer', max_length=50, blank=True, null=True)  # Field name made lowercase.
    basic_rate = models.DecimalField(db_column='Basic_rate', max_digits=15, decimal_places=5, blank=True, null=True)  # Field name made lowercase.
    itm_det = models.CharField(max_length=300, db_collation='latin1_swedish_ci', blank=True, null=True)
    prtc = models.CharField(max_length=255, db_collation='latin1_swedish_ci', blank=True, null=True)
    sprtc = models.CharField(max_length=255, blank=True, null=True)
    sval = models.CharField(max_length=50, blank=True, null=True)
    uqc = models.CharField(max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)
    qty = models.CharField(max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)
    basic_value = models.CharField(db_column='Basic_value', max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    product_services = models.CharField(max_length=30, blank=True, null=True)
    freight = models.DecimalField(db_column='Freight', max_digits=15, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    insurance = models.DecimalField(db_column='Insurance', max_digits=15, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    financial_period = models.CharField(db_column='Financial_period', max_length=30, blank=True, null=True)  # Field name made lowercase.
    discountrate = models.DecimalField(db_column='DiscountRate', max_digits=15, decimal_places=2, blank=True, null=True)  # Field name made lowercase.
    discountvalue = models.CharField(db_column='DiscountValue', max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    vault_no = models.CharField(max_length=50)
    othr_chrg = models.DecimalField(max_digits=15, decimal_places=2)
    inv_typ = models.CharField(max_length=100, db_collation='latin1_swedish_ci', blank=True, null=True)
    rt = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True)
    finaldoc = models.CharField(db_column='FinalDoc', max_length=200, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    grossturn_previousfy = models.DecimalField(db_column='Grossturn_previousfy', max_digits=15, decimal_places=2)  # Field name made lowercase.
    grossturn_currentfy = models.DecimalField(db_column='Grossturn_currentfy', max_digits=15, decimal_places=2)  # Field name made lowercase.
    delivery_chellan = models.CharField(db_column='Delivery_chellan', max_length=100, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    receipt_payment_mode = models.CharField(max_length=50, db_collation='latin1_swedish_ci')
    receipt_voucherno = models.CharField(max_length=50, db_collation='latin1_swedish_ci')
    voucher_type = models.CharField(db_column='Voucher_type', max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    payment_number = models.CharField(db_column='Payment_number', max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    date_of_receipt = models.DateField()
    bank_name = models.CharField(max_length=50, db_collation='latin1_swedish_ci')
    amnt = models.IntegerField()
    status = models.IntegerField()
    preparedby = models.IntegerField(db_column='preparedBy', blank=True, null=True)  # Field name made lowercase.
    verifiedby = models.IntegerField(db_column='verifiedBy', blank=True, null=True)  # Field name made lowercase.
    approvedby = models.IntegerField(db_column='approvedBy', blank=True, null=True)  # Field name made lowercase.
    created_at = models.DateTimeField(db_column='Created_at')  # Field name made lowercase.
    updated_at = models.DateTimeField(db_column='Updated_at')  # Field name made lowercase.
    email_customer = models.CharField(db_column='Email_customer', max_length=150, blank=True, null=True)  # Field name made lowercase.
    phone_receiver = models.CharField(db_column='Phone_Receiver', max_length=50, blank=True, null=True)  # Field name made lowercase.
    exchrate = models.DecimalField(db_column='exchRate', max_digits=10, decimal_places=0, blank=True, null=True)  # Field name made lowercase.
    exchcur = models.DecimalField(db_column='exchCur', max_digits=10, decimal_places=0, blank=True, null=True)  # Field name made lowercase.
    bcountryofsupply = models.CharField(db_column='bcountryOfSupply', max_length=500, blank=True, null=True)  # Field name made lowercase.
    bemailid = models.CharField(db_column='bemailId', max_length=150, blank=True, null=True)  # Field name made lowercase.
    fbasicrate = models.DecimalField(max_digits=10, decimal_places=0, blank=True, null=True)
    fbasicvalue = models.DecimalField(max_digits=10, decimal_places=0, blank=True, null=True)
    fdiscountvalue = models.DecimalField(max_digits=10, decimal_places=0, blank=True, null=True)
    ftxval = models.DecimalField(max_digits=10, decimal_places=0, blank=True, null=True)
    ifsccode = models.CharField(max_length=150, blank=True, null=True)
    bankacno = models.CharField(max_length=150, blank=True, null=True)
    od_type = models.CharField(max_length=15)
    customerid = models.IntegerField(db_column='customerId', blank=True, null=True)  # Field name made lowercase.
    reasoncredittype = models.CharField(db_column='reasoncreditType', max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)  # Field name made lowercase.
    rsn = models.CharField(max_length=100, db_collation='latin1_swedish_ci', blank=True, null=True)
    ntty = models.CharField(max_length=2, blank=True, null=True)
    branch = models.CharField(max_length=50, blank=True, null=True)
    nt_dt = models.DateField()
    nt_num = models.CharField(max_length=50, db_collation='latin1_swedish_ci', blank=True, null=True)
    gstin_receiver = models.CharField(db_column='Gstin_Receiver', max_length=15, blank=True, null=True)  # Field name made lowercase.
    pos_receiver = models.CharField(db_column='Pos_Receiver', max_length=250)  # Field name made lowercase.
    creditdate = models.CharField(db_column='CreditDate', max_length=150, db_collation='latin1_swedish_ci')  # Field name made lowercase.
    disbursment = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'gstr1_b2binvoices'


class HospitalUpload(models.Model):
    vault_no = models.CharField(max_length=50)
    bno = models.CharField(max_length=50)
    bd = models.CharField(max_length=50)
    doc_hospital = models.CharField(max_length=50)
    uno = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'hospital_upload'


class Immovable(models.Model):
    via = models.CharField(max_length=50)
    land = models.CharField(max_length=50)
    area = models.CharField(max_length=50)
    unit = models.CharField(max_length=50)
    tpv = models.CharField(max_length=50)
    cmv = models.CharField(max_length=50)
    ownership = models.CharField(max_length=50)
    unit1 = models.CharField(max_length=50)
    doc = models.CharField(max_length=50)
    building = models.CharField(max_length=50)
    area1 = models.CharField(max_length=50)
    unit2 = models.CharField(max_length=50)
    tpv1 = models.CharField(max_length=50)
    cmv1 = models.CharField(max_length=50)
    ownership1 = models.CharField(max_length=50)
    unit3 = models.CharField(max_length=50)
    doc1 = models.CharField(max_length=50)
    commercial = models.CharField(max_length=50)
    area2 = models.CharField(max_length=50)
    unit4 = models.CharField(max_length=50)
    tpv2 = models.CharField(max_length=50)
    cmv2 = models.CharField(max_length=50)
    ownership2 = models.CharField(max_length=50)
    unit5 = models.CharField(max_length=50)
    doc2 = models.CharField(max_length=50)
    farmhouse = models.CharField(max_length=50)
    unit6 = models.CharField(max_length=50)
    area3 = models.CharField(max_length=50)
    tpv3 = models.CharField(max_length=50)
    cmv3 = models.CharField(max_length=50)
    unit7 = models.CharField(max_length=50)
    ownership3 = models.CharField(max_length=50)
    doc3 = models.CharField(max_length=50)
    updated_at = models.DateTimeField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'immovable'


class ImportEmail(models.Model):
    via = models.CharField(max_length=150)
    vault_no = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=200)
    email = models.CharField(max_length=150, blank=True, null=True)
    source = models.CharField(max_length=100)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'import_email'


class IncomeInfo(models.Model):
    via = models.CharField(max_length=50)
    ay = models.CharField(max_length=50)
    income = models.CharField(max_length=50)
    fd = models.CharField(max_length=50)
    tax = models.CharField(max_length=50)
    doc = models.CharField(max_length=50)
    ay1 = models.CharField(max_length=50)
    income1 = models.CharField(max_length=50)
    fd1 = models.CharField(max_length=50)
    tax1 = models.CharField(max_length=50)
    doc1 = models.CharField(max_length=50)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'income_info'


class Innovations(models.Model):
    via = models.CharField(max_length=100)
    vault_no = models.CharField(max_length=50)
    source = models.CharField(max_length=100)
    innovations = models.CharField(max_length=50)
    title = models.CharField(max_length=100)
    brief = models.CharField(max_length=1000)
    pain = models.CharField(max_length=200)
    doc = models.CharField(max_length=100)
    doc1 = models.CharField(max_length=100)
    mile_date = models.CharField(max_length=100)
    milestones = models.CharField(max_length=500)
    scaling = models.CharField(max_length=1000)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'innovations'


class InsulinAccucheck(models.Model):
    insid = models.AutoField(primary_key=True)
    insdate = models.CharField(max_length=30)
    instime = models.CharField(max_length=30)
    before_20mins = models.CharField(max_length=30)
    after_20mins = models.CharField(max_length=30)
    sim_no = models.CharField(max_length=30)
    name = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'insulin_accucheck'


class Insurance(models.Model):
    via = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    matvalue = models.CharField(max_length=50)
    doc = models.CharField(max_length=100)
    premium = models.CharField(max_length=50)
    matvalue1 = models.CharField(max_length=50)
    doc1 = models.CharField(max_length=50)
    updated_at = models.DateTimeField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'insurance'


class IntakeEvents(models.Model):
    vault_no = models.CharField(max_length=50)
    breakfast_time = models.CharField(max_length=50)
    lunch_time = models.CharField(max_length=50)
    dinner_time = models.CharField(max_length=50)
    medicine_time = models.CharField(max_length=50)
    insulin_time = models.CharField(max_length=50)
    lab_accucheck_fasting = models.CharField(max_length=50)
    fast_time = models.CharField(max_length=50)
    lab_accucheck_prandial = models.CharField(max_length=50)
    prandial_time = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'intake_events'


class KioskBmiChart(models.Model):
    type = models.CharField(db_column='Type', max_length=50)  # Field name made lowercase.
    bmi = models.CharField(db_column='BMI', max_length=50)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'kiosk_bmi_chart'


class KioskBodyChart(models.Model):
    male = models.CharField(db_column='Male', max_length=40)  # Field name made lowercase.
    female = models.CharField(db_column='Female', max_length=40)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'kiosk_body_chart'


class KioskBpChart(models.Model):
    systolic = models.CharField(db_column='Systolic', max_length=30)  # Field name made lowercase.
    diastolic = models.CharField(db_column='Diastolic', max_length=30)  # Field name made lowercase.
    type = models.CharField(db_column='Type', max_length=50)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'kiosk_bp_chart'


class KioskDataAnalysis(models.Model):
    rfid = models.CharField(max_length=30)
    patientname = models.CharField(max_length=50)
    diabetes = models.IntegerField()
    diabetes_inv = models.IntegerField()
    labvalue = models.IntegerField(blank=True, null=True)
    accucheck = models.IntegerField()
    adc = models.CharField(max_length=500)
    hr = models.CharField(max_length=30)
    spo2 = models.CharField(max_length=30)
    hb = models.CharField(max_length=30)
    height = models.CharField(max_length=30)
    weight = models.CharField(max_length=30)
    temp = models.CharField(max_length=30)
    bpsys = models.CharField(max_length=30)
    bpdys = models.CharField(max_length=30)
    ecg = models.CharField(max_length=30)
    datetime = models.CharField(unique=True, max_length=50)

    class Meta:
        managed = False
        db_table = 'kiosk_data_analysis'
        db_table_comment = 'Data Analysis & Co-efficient Calculation from Python'


class KioskGlucoseChart(models.Model):
    type = models.CharField(db_column='Type', max_length=50)  # Field name made lowercase.
    fbs = models.CharField(db_column='FBS', max_length=30)  # Field name made lowercase.
    ppbs = models.CharField(db_column='PPBS', max_length=30)  # Field name made lowercase.
    hba1c = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'kiosk_glucose_chart'


class LabAccucheck(models.Model):
    labid = models.AutoField(primary_key=True)
    labdate = models.CharField(max_length=50)
    labtime = models.CharField(max_length=50)
    before_20mins = models.CharField(max_length=50)
    after_20mins = models.CharField(max_length=50)
    lab_val = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    sim_no = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'lab_accucheck'


class LunchAccucheck(models.Model):
    lid = models.AutoField(primary_key=True)
    ldate = models.CharField(max_length=50)
    ltime = models.CharField(max_length=50)
    before_20mins = models.CharField(max_length=50)
    after_20mins = models.CharField(max_length=50)
    sim_no = models.CharField(max_length=50)
    name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'lunch_accucheck'


class Macro(models.Model):
    via = models.CharField(max_length=50)
    vault_no = models.CharField(max_length=50)
    gname = models.CharField(max_length=50)
    g_id = models.IntegerField()
    ppl_vnum = models.CharField(max_length=50)
    ppl = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'macro'


class MealsTimings(models.Model):
    breakfast_from = models.TimeField()
    breakfast_to = models.TimeField()
    lunch_from = models.TimeField()
    lunch_to = models.TimeField()
    dinner_from = models.TimeField()
    dinner_to = models.TimeField()
    medicines = models.TimeField()
    insulin = models.TimeField()
    lab_accucheck = models.CharField(max_length=50)
    lab_accucheck_date = models.CharField(max_length=50)
    lab_accucheck_time = models.CharField(max_length=50)
    svasth_accucheck = models.CharField(max_length=50)
    svasth_accucheck_date = models.CharField(max_length=50)
    svasth_accucheck_time = models.CharField(max_length=50)
    lab_fasting = models.CharField(max_length=50)
    lab_fasting_date = models.CharField(max_length=50)
    lab_fasting_time = models.CharField(max_length=50)
    svasth_fasting = models.CharField(max_length=50)
    svasth_fasting_date = models.CharField(max_length=50)
    svasth_fasting_time = models.CharField(max_length=50)
    lab_post_prandial = models.CharField(max_length=50)
    lab_post_prandial_date = models.CharField(max_length=50)
    lab_post_prandial_time = models.CharField(max_length=50)
    svasth_post_prandial = models.CharField(max_length=50)
    svasth_post_prandial_date = models.CharField(max_length=50)
    svasth_post_prandial_time = models.CharField(max_length=50)
    vault_no = models.CharField(max_length=50)
    sub_time = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'meals_timings'


class MedicalHistory(models.Model):
    vault_no = models.CharField(max_length=50)
    category = models.CharField(max_length=50)
    doctor_name = models.CharField(max_length=50)
    address = models.CharField(max_length=150)
    contact_no = models.CharField(max_length=50)
    mobile_no = models.CharField(max_length=50)
    brief_medical_history = models.CharField(max_length=150)
    date_time = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'medical_history'


class MedicalUpload(models.Model):
    vault_no = models.CharField(max_length=50)
    bno = models.CharField(max_length=50)
    bd = models.CharField(max_length=50)
    doc_medical = models.CharField(max_length=50)
    uno = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'medical_upload'


class MedicineAccucheck(models.Model):
    medid = models.AutoField(primary_key=True)
    meddate = models.CharField(max_length=30)
    medtime = models.CharField(max_length=30)
    before_20mins = models.CharField(max_length=30)
    after_20mins = models.CharField(max_length=30)
    sim_no = models.CharField(max_length=30)
    name = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'medicine_accucheck'


class Micro(models.Model):
    via = models.CharField(max_length=100)
    vault_no = models.CharField(max_length=200)
    gname = models.CharField(max_length=100)
    g_id = models.IntegerField()
    ppl_vnum = models.CharField(max_length=50)
    ppl = models.CharField(max_length=100)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'micro'


class Mystatistics(models.Model):
    bg = models.CharField(max_length=50)
    age = models.CharField(max_length=30)
    height = models.CharField(max_length=50)
    weight = models.CharField(max_length=50)
    diabetes = models.CharField(max_length=50)
    bloodpressure = models.CharField(max_length=50)
    vault_no = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'mystatistics'


class Nano(models.Model):
    via = models.CharField(max_length=50)
    vault_no = models.CharField(max_length=50)
    gname = models.CharField(max_length=100)
    g_id = models.IntegerField()
    ppl_vnum = models.CharField(max_length=50)
    ppl = models.CharField(max_length=100)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'nano'


class Others(models.Model):
    via = models.CharField(max_length=50)
    otype = models.CharField(max_length=20)
    odesc = models.CharField(max_length=150)
    updated_at = models.DateTimeField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'others'


class Pan(models.Model):
    vault_no = models.CharField(max_length=50)
    dno = models.CharField(max_length=50)
    ia = models.CharField(max_length=50)
    rd = models.CharField(max_length=50)
    doc_pan = models.CharField(max_length=50)
    u_no = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'pan'


class Patientdevicemapping(models.Model):
    patientid = models.IntegerField(db_column='PatientId', blank=True, null=True)  # Field name made lowercase.
    patientrefno = models.CharField(db_column='PatientRefNo', max_length=50, blank=True, null=True)  # Field name made lowercase.
    patientname = models.CharField(db_column='patientName', max_length=50, blank=True, null=True)  # Field name made lowercase.
    devicenumber = models.IntegerField(db_column='DeviceNumber', blank=True, null=True)  # Field name made lowercase.
    category = models.CharField(max_length=10, blank=True, null=True)
    labvalue = models.CharField(db_column='labValue', max_length=30, blank=True, null=True)  # Field name made lowercase.
    labdate = models.DateField(db_column='labDate')  # Field name made lowercase.
    labtime = models.TimeField(db_column='labTime')  # Field name made lowercase.
    accuvalue = models.IntegerField(db_column='AccuValue', blank=True, null=True)  # Field name made lowercase.
    accudate = models.DateField(db_column='AccuDate', blank=True, null=True)  # Field name made lowercase.
    accutime = models.DateTimeField(db_column='AccuTime', blank=True, null=True)  # Field name made lowercase.
    kioskni = models.CharField(db_column='kioskNi', max_length=30, blank=True, null=True)  # Field name made lowercase.
    kiosknidate = models.DateField(db_column='kioskNiDate')  # Field name made lowercase.
    kiosknitime = models.TimeField(db_column='kioskNiTime')  # Field name made lowercase.
    kioski = models.CharField(db_column='kioskI', max_length=30, blank=True, null=True)  # Field name made lowercase.
    kioskidate = models.DateField(db_column='kioskIDate')  # Field name made lowercase.
    kioskitime = models.TimeField(db_column='kioskITime')  # Field name made lowercase.
    wearable = models.CharField(max_length=30, blank=True, null=True)
    wearabledate = models.DateField(db_column='wearableDate')  # Field name made lowercase.
    wearabletime = models.TimeField(db_column='wearableTime')  # Field name made lowercase.
    createddate = models.DateTimeField(db_column='createdDate')  # Field name made lowercase.
    oximiter = models.CharField(max_length=15, blank=True, null=True)
    oximiterdate = models.DateField(db_column='oximiterDate', blank=True, null=True)  # Field name made lowercase.
    oximitertime = models.TimeField(db_column='oximiterTime', blank=True, null=True)  # Field name made lowercase.
    oximeterhba1c = models.CharField(db_column='oximeterHba1c', max_length=20, blank=True, null=True)  # Field name made lowercase.
    oximeterhba1cdate = models.DateField(db_column='oximeterHba1cDate', blank=True, null=True)  # Field name made lowercase.
    oximeterhba1ctime = models.TimeField(db_column='oximeterHba1cTime', blank=True, null=True)  # Field name made lowercase.
    labhba1c = models.CharField(db_column='labHba1c', max_length=15, blank=True, null=True)  # Field name made lowercase.
    labhba1cdate = models.DateField(db_column='labHba1cDate', blank=True, null=True)  # Field name made lowercase.
    labhba1ctime = models.TimeField(db_column='labHba1cTime', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'patientdevicemapping'


class Pedometer(models.Model):
    macid = models.CharField(max_length=17)
    distance = models.CharField(max_length=500)
    stepcount = models.CharField(max_length=500)
    calories = models.CharField(max_length=100)
    activity = models.CharField(max_length=50)
    datetime1 = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'pedometer'


class PeriodPredictor(models.Model):
    my_last_period = models.CharField(max_length=50)
    normal_cycle = models.CharField(max_length=50)
    revised_cycle = models.CharField(max_length=50)
    exceeded = models.CharField(max_length=50)
    next_period_date = models.CharField(max_length=50)
    predicted_start_date = models.CharField(max_length=50)
    predicted_end_date = models.CharField(max_length=50)
    vault_no = models.CharField(max_length=50)
    created_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'period_predictor'


class PersonalDetails(models.Model):
    via = models.CharField(max_length=20)
    date = models.CharField(max_length=50)
    fname = models.CharField(max_length=50)
    fkey = models.CharField(max_length=50)
    bplace = models.CharField(max_length=50)
    father = models.CharField(max_length=50)
    mother = models.CharField(max_length=50)
    brother = models.CharField(max_length=50)
    sister = models.CharField(max_length=50)
    sname = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'personal_details'


class PplTbl(models.Model):
    id = models.AutoField(db_column='ID', primary_key=True)  # Field name made lowercase.
    vault_no = models.CharField(max_length=50)
    via = models.CharField(max_length=100)
    ppl = models.CharField(max_length=100)
    gname = models.CharField(max_length=100)
    macro = models.CharField(max_length=50)
    micro = models.CharField(max_length=50)
    nano = models.CharField(max_length=50)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'ppl_tbl'


class ProfessionalCodes(models.Model):
    professional_name = models.CharField(max_length=100)
    professional_code = models.CharField(max_length=20)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'professional_codes'


class ProfessionalTypes(models.Model):
    type_name = models.CharField(max_length=50)
    type_codes = models.CharField(max_length=50)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'professional_types'


class Profile(models.Model):
    vault_no = models.CharField(max_length=50)
    via = models.CharField(max_length=60)
    c_name = models.CharField(max_length=100)
    email = models.CharField(max_length=120)
    mobile = models.CharField(max_length=20)
    pro_no = models.CharField(max_length=20)
    pro_pic = models.CharField(max_length=500, blank=True, null=True)
    qrpath = models.CharField(db_column='qrPath', max_length=255, blank=True, null=True)  # Field name made lowercase.
    user_theme = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'profile'


class ProformainvoiceMaster(models.Model):
    invoicenumber = models.CharField(db_column='InvoiceNumber', max_length=255, blank=True, null=True)  # Field name made lowercase.
    gstinnumber = models.CharField(db_column='GstinNumber', max_length=255, blank=True, null=True)  # Field name made lowercase.
    producttype = models.CharField(db_column='ProductType', max_length=255)  # Field name made lowercase.
    loanaccountnumber = models.CharField(db_column='LoanAccountNumber', max_length=255)  # Field name made lowercase.
    bcname = models.CharField(db_column='BcName', max_length=255)  # Field name made lowercase.
    groupid = models.CharField(db_column='GroupId', max_length=255)  # Field name made lowercase.
    groupname = models.CharField(db_column='GroupName', max_length=255)  # Field name made lowercase.
    nameofborrower = models.CharField(db_column='NameofBorrower', max_length=255)  # Field name made lowercase.
    actualdisbdate = models.DateField(db_column='ActualDisbDate')  # Field name made lowercase.
    disbamount = models.FloatField(db_column='DisbAmount')  # Field name made lowercase.
    mode = models.CharField(db_column='Mode', max_length=255)  # Field name made lowercase.
    rateofint = models.FloatField(db_column='RateofInt')  # Field name made lowercase.
    tenure = models.IntegerField(db_column='Tenure')  # Field name made lowercase.
    repfrequency = models.CharField(db_column='RepFrequency', max_length=255)  # Field name made lowercase.
    bankbranch = models.CharField(db_column='BankBranch', max_length=255)  # Field name made lowercase.
    nameofbank = models.CharField(db_column='NameofBank', max_length=255)  # Field name made lowercase.
    batchnumber = models.CharField(db_column='BatchNumber', max_length=255)  # Field name made lowercase.
    repaystartdate = models.CharField(db_column='RepayStartDate', max_length=255)  # Field name made lowercase.
    insurancepremium = models.FloatField(db_column='InsurancePremium')  # Field name made lowercase.
    branch = models.CharField(db_column='Branch', max_length=255)  # Field name made lowercase.
    state = models.CharField(db_column='State', max_length=255)  # Field name made lowercase.
    taxablevalue = models.FloatField(db_column='TaxableValue')  # Field name made lowercase.
    sgst = models.FloatField(db_column='Sgst')  # Field name made lowercase.
    cgst = models.FloatField(db_column='Cgst')  # Field name made lowercase.
    address = models.CharField(db_column='Address', max_length=255, blank=True, null=True)  # Field name made lowercase.
    flag = models.CharField(max_length=255, blank=True, null=True)
    userid = models.CharField(db_column='Userid', max_length=255, blank=True, null=True)  # Field name made lowercase.
    vault_no = models.CharField(max_length=255, blank=True, null=True)
    createddatetime = models.DateTimeField(db_column='CreatedDateTime')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'proformainvoice_master'


class QueryString(models.Model):
    name = models.CharField(max_length=50)
    mobile = models.CharField(max_length=50)
    address = models.CharField(max_length=500)

    class Meta:
        managed = False
        db_table = 'query_string'


class Ration(models.Model):
    vault_no = models.CharField(max_length=50)
    dno = models.CharField(max_length=50)
    ia = models.CharField(max_length=50)
    rd = models.CharField(max_length=50)
    doc_ration = models.CharField(max_length=50)
    u_no = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'ration'


class SchoolFileData(models.Model):
    user_name = models.CharField(max_length=250)
    report = models.CharField(max_length=250)
    date = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'school_file_data'


class Shares(models.Model):
    via = models.CharField(max_length=50)
    company = models.CharField(max_length=50)
    from1 = models.CharField(max_length=50)
    to1 = models.CharField(max_length=15)
    face = models.CharField(max_length=50)
    date = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    val = models.CharField(max_length=50)
    quantity = models.CharField(max_length=50)
    maturity = models.CharField(max_length=50)
    current = models.CharField(max_length=50)
    demat = models.CharField(max_length=50)
    dividend = models.CharField(max_length=50)
    doc = models.CharField(max_length=50)
    updated_at = models.DateTimeField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'shares'


class Social(models.Model):
    vault_no = models.CharField(max_length=50)
    dno = models.CharField(max_length=50)
    ia = models.CharField(max_length=50)
    rd = models.CharField(max_length=50)
    doc_social = models.CharField(max_length=50)
    u_no = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'social'


class States(models.Model):
    name = models.CharField(max_length=30)
    country_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'states'


class Status(models.Model):
    vault_no = models.CharField(max_length=20)
    via = models.CharField(max_length=20)
    status = models.CharField(max_length=1000)
    topic = models.CharField(max_length=100)
    g_id = models.CharField(max_length=20)
    macro = models.CharField(max_length=20)
    micro = models.CharField(max_length=20)
    nano = models.CharField(max_length=20)
    post_upload = models.CharField(max_length=200, blank=True, null=True)
    alert_status = models.IntegerField()
    created_at = models.DateTimeField()
    updated_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'status'


class StudentDetails(models.Model):
    student_id = models.AutoField(db_column='Student_id', primary_key=True)  # Field name made lowercase.
    student_name = models.CharField(db_column='Student_Name', max_length=1000, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'student_details'


class StudentRegistration(models.Model):
    student_id = models.AutoField(primary_key=True)
    student_name = models.CharField(max_length=100)
    class_session = models.CharField(max_length=50)
    father_name = models.CharField(max_length=50)
    school = models.CharField(max_length=50)
    place = models.CharField(max_length=50)
    dob = models.DateField()
    class_field = models.CharField(db_column='class', max_length=50)  # Field renamed because it was a Python reserved word.
    section = models.CharField(max_length=10)
    mobile = models.BigIntegerField()
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    role_id = models.IntegerField()
    status_id = models.IntegerField()
    qrpath = models.CharField(max_length=100)
    vault_no = models.CharField(max_length=100)
    id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'student_registration'


class Subject(models.Model):
    subj_id = models.AutoField(db_column='SUBJ_ID', primary_key=True)  # Field name made lowercase.
    subj_code = models.CharField(db_column='SUBJ_CODE', max_length=30)  # Field name made lowercase.
    subj_description = models.CharField(db_column='SUBJ_DESCRIPTION', max_length=255)  # Field name made lowercase.
    unit = models.IntegerField(db_column='UNIT')  # Field name made lowercase.
    pre_requisite = models.CharField(db_column='PRE_REQUISITE', max_length=30)  # Field name made lowercase.
    course_id = models.IntegerField(db_column='COURSE_ID')  # Field name made lowercase.
    ay = models.CharField(db_column='AY', max_length=30)  # Field name made lowercase.
    semester = models.CharField(db_column='SEMESTER', max_length=20)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'subject'


class SvasthAdmin(models.Model):
    uid = models.AutoField(primary_key=True)
    access_key = models.CharField(max_length=50)
    uname = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'svasth_admin'


class SvasthClinicalTrial(models.Model):
    kiosk_location = models.CharField(max_length=50)
    height = models.CharField(max_length=50)
    weight = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    mobile = models.CharField(max_length=50)
    rfid = models.CharField(max_length=50)
    vault_no = models.CharField(max_length=50)
    bioimpedance = models.CharField(max_length=50)
    bioimpedance2 = models.CharField(max_length=50)
    message = models.CharField(max_length=250)
    age = models.CharField(max_length=11)
    gender = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'svasth_clinical_trial'


class SvasthConnect(models.Model):
    temp = models.FloatField()
    hrpul = models.CharField(max_length=50)
    spo2 = models.CharField(max_length=50)
    hrecg = models.CharField(max_length=50)
    diabetes = models.IntegerField()
    diabetes_inv = models.IntegerField(blank=True, null=True)
    avg_diabetes = models.IntegerField()
    bpsys = models.FloatField()
    bpdia = models.FloatField()
    distance = models.CharField(max_length=50)
    calorie = models.CharField(max_length=50)
    speed = models.CharField(max_length=50)
    location = models.CharField(max_length=200)
    dt1 = models.CharField(max_length=50)
    dt2 = models.CharField(max_length=50)
    sim_no = models.CharField(max_length=50)
    vaultno = models.CharField(db_column='vaultNo', max_length=30, blank=True, null=True)  # Field name made lowercase.
    dis_name = models.CharField(max_length=50)
    patient = models.CharField(max_length=50)
    ecg_peak = models.FloatField()
    ppg_peak = models.FloatField()
    ecg_data = models.CharField(max_length=10000)
    highest_ecg = models.FloatField()
    lowest_ecg = models.FloatField()
    std_dev = models.FloatField()
    device_no = models.CharField(max_length=50)
    mac_no = models.CharField(max_length=50)
    alcohol = models.CharField(max_length=50)
    battery_level = models.CharField(max_length=50)
    rfid = models.CharField(max_length=50)
    kiosk_location = models.CharField(max_length=100)
    kiosk_no = models.CharField(max_length=30)
    imei = models.CharField(max_length=50, blank=True, null=True)
    rfid_user = models.CharField(max_length=30)
    lat = models.FloatField()
    longi = models.FloatField()
    weight = models.CharField(max_length=30)
    bmi = models.CharField(max_length=30)
    height = models.CharField(max_length=30)
    patientname = models.CharField(db_column='PatientName', max_length=40)  # Field name made lowercase.
    hospitalname = models.CharField(db_column='HospitalName', max_length=40)  # Field name made lowercase.
    hb = models.CharField(max_length=30)
    repeatedcounts = models.CharField(db_column='RepeatedCounts', max_length=50)  # Field name made lowercase.
    averagepower = models.CharField(db_column='AveragePower', max_length=15)  # Field name made lowercase.
    factor = models.CharField(db_column='Factor', max_length=15)  # Field name made lowercase.
    coefficient = models.FloatField()
    sqrt = models.CharField(db_column='Sqrt', max_length=15)  # Field name made lowercase.
    hbredadc = models.CharField(db_column='hbRedAdc', max_length=1500, blank=True, null=True)  # Field name made lowercase.
    hbiradc = models.CharField(db_column='hbIrAdc', max_length=1500, blank=True, null=True)  # Field name made lowercase.
    message = models.CharField(max_length=10000)
    statusid = models.IntegerField(db_column='statusId')  # Field name made lowercase.
    invdiabetesarray = models.CharField(db_column='InvDiabetesArray', max_length=500, blank=True, null=True)  # Field name made lowercase.
    rr_rate = models.CharField(max_length=50)
    calibrated = models.CharField(max_length=50, blank=True, null=True)
    current_date_time = models.DateTimeField()
    current_dat = models.DateField()
    current_tim = models.TimeField()
    pmobile = models.CharField(max_length=50)
    visitor_name = models.CharField(max_length=100)
    bioimpedance = models.CharField(max_length=100)
    bioimpedance2 = models.CharField(max_length=100)
    age = models.CharField(max_length=50)
    gender = models.CharField(max_length=50)
    icw = models.CharField(max_length=50)
    ffm = models.CharField(max_length=50)
    fm = models.CharField(max_length=50)
    tbw = models.CharField(max_length=50)
    ecw = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'svasth_connect'


class SvasthDeviceMaster(models.Model):
    device_no = models.CharField(max_length=50)
    rfid_no = models.CharField(max_length=30)
    device_simno = models.CharField(max_length=50)
    servpro = models.CharField(max_length=50)
    modelname = models.CharField(max_length=50)
    device_child = models.CharField(max_length=50)
    cur_date = models.CharField(max_length=50)
    check_devices = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'svasth_device_master'


class SvasthKioskMaster(models.Model):
    kid = models.AutoField(primary_key=True)
    kioskname = models.CharField(db_column='kioskName', max_length=30, blank=True, null=True)  # Field name made lowercase.
    kioskno = models.CharField(db_column='kioskNo', max_length=30, blank=True, null=True)  # Field name made lowercase.
    kiosksimno = models.CharField(db_column='kioskSimNo', max_length=30, blank=True, null=True)  # Field name made lowercase.
    createddate = models.DateTimeField(db_column='createdDate', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'svasth_kiosk_master'


class SvasthRegistration(models.Model):
    vault_no = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    device_sim_no = models.CharField(max_length=50)
    device_model_no = models.CharField(max_length=50)
    diabeticnondiabetic = models.CharField(db_column='DiabeticNonDiabetic', max_length=30)  # Field name made lowercase.
    dt2 = models.DateTimeField()
    device_parent_child = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'svasth_registration'


class SvasthReports(models.Model):
    vault_no = models.CharField(max_length=50)
    bno = models.CharField(max_length=50)
    bd = models.CharField(max_length=50)
    doc_svasth_reports = models.CharField(max_length=50)
    uno = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'svasth_reports'


class SvasthRfidRegistration(models.Model):
    rfid = models.AutoField(primary_key=True)
    devicetype = models.CharField(db_column='deviceType', max_length=25, blank=True, null=True)  # Field name made lowercase.
    rfid_no = models.CharField(max_length=30, blank=True, null=True)
    imei_no = models.CharField(max_length=50, blank=True, null=True)
    vault_no = models.CharField(max_length=30)
    name = models.CharField(max_length=30)
    aarms_no = models.CharField(max_length=30)
    dt2 = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'svasth_rfid_registration'


class SvasthStatemaster(models.Model):
    id = models.IntegerField()
    statename = models.CharField(db_column='StateName', max_length=75)  # Field name made lowercase.
    statecode = models.IntegerField(db_column='StateCode')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'svasth_statemaster'


class SvasthTrialRegistration(models.Model):
    sid = models.AutoField(primary_key=True)
    email = models.CharField(max_length=50)
    mobile = models.CharField(max_length=50)
    date_time = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'svasth_trial_registration'


class SvasthUpload(models.Model):
    vault_no = models.CharField(max_length=50)
    dno = models.CharField(max_length=50)
    ia = models.CharField(max_length=50)
    rd = models.CharField(max_length=50)
    doc_svasth = models.CharField(max_length=50)
    u_no = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'svasth_upload'


class Svasthalgorithm(models.Model):
    algorithmversion = models.CharField(db_column='algorithmVersion', max_length=30, blank=True, null=True)  # Field name made lowercase.
    algorithmname = models.CharField(db_column='algorithmName', max_length=50, blank=True, null=True)  # Field name made lowercase.
    variables = models.IntegerField()
    stdmean = models.FloatField(db_column='stdMean')  # Field name made lowercase.
    stddev = models.FloatField(db_column='stdDev')  # Field name made lowercase.
    coefficient = models.FloatField()
    createdby = models.CharField(db_column='createdBy', max_length=50)  # Field name made lowercase.
    createddate = models.DateTimeField(db_column='createdDate')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'svasthalgorithm'


class Svasthdental(models.Model):
    username = models.CharField(db_column='userName', max_length=30, blank=True, null=True)  # Field name made lowercase.
    vaultnumber = models.CharField(db_column='vaultNumber', max_length=30, blank=True, null=True)  # Field name made lowercase.
    image_profile = models.CharField(max_length=1000, blank=True, null=True)
    dental_video = models.CharField(max_length=200, blank=True, null=True)
    createdat = models.CharField(db_column='createdAt', max_length=30, blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'svasthdental'


class Svasthpatientregistration(models.Model):
    hospitalname = models.CharField(db_column='HospitalName', max_length=50)  # Field name made lowercase.
    patientrefno = models.CharField(db_column='PatientRefNo', max_length=30, blank=True, null=True)  # Field name made lowercase.
    clinicname = models.CharField(db_column='ClinicName', max_length=50, blank=True, null=True)  # Field name made lowercase.
    patientname = models.CharField(db_column='PatientName', max_length=50)  # Field name made lowercase.
    contactdetails = models.CharField(db_column='ContactDetails', max_length=50)  # Field name made lowercase.
    email = models.CharField(db_column='Email', max_length=50)  # Field name made lowercase.
    age = models.IntegerField(db_column='Age')  # Field name made lowercase.
    briefmedicalhistory = models.CharField(db_column='BriefMedicalHistory', max_length=10000)  # Field name made lowercase.
    patientaddress = models.CharField(db_column='PatientAddress', max_length=100)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'svasthpatientregistration'


class TableBp(models.Model):
    bp = models.CharField(max_length=50)
    vault_no = models.BigIntegerField()
    status_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'table_bp'


class TableDental(models.Model):
    dental = models.CharField(max_length=50)
    vault_no = models.BigIntegerField()
    satus_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'table_dental'


class TableGlucose(models.Model):
    glu_in = models.CharField(max_length=50)
    hr = models.CharField(max_length=50)
    spot = models.CharField(max_length=50)
    temp = models.CharField(max_length=10)
    hb = models.CharField(max_length=50)
    vault_no = models.BigIntegerField()
    status_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'table_glucose'


class TableWeight(models.Model):
    weight = models.CharField(max_length=10)
    height = models.CharField(max_length=10)
    bmi = models.CharField(max_length=10)
    vault_no = models.BigIntegerField()
    status_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'table_weight'


class TblAdmin(models.Model):
    menu_id = models.AutoField(primary_key=True)
    menu_name = models.CharField(max_length=50, blank=True, null=True)
    menu_li = models.CharField(max_length=50, blank=True, null=True)
    navigation_url = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_admin'


class TblBranch(models.Model):
    branch_maping_id = models.AutoField(primary_key=True)
    super_user_id = models.IntegerField(blank=True, null=True)
    branch_user_id = models.IntegerField(blank=True, null=True)
    status_id = models.IntegerField(blank=True, null=True)
    user_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_branch'


class TblBranchName(models.Model):
    branch_id = models.AutoField(primary_key=True)
    branch_name = models.CharField(max_length=50, blank=True, null=True)
    user_id = models.IntegerField(blank=True, null=True)
    status_id = models.IntegerField(blank=True, null=True)
    company_name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_branch_name'


class TblCategory(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=20)

    class Meta:
        managed = False
        db_table = 'tbl_category'


class TblCity(models.Model):
    city_id = models.AutoField(primary_key=True)
    city_name = models.CharField(max_length=50, blank=True, null=True)
    state_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_city'


class TblClinicalTrialData(models.Model):
    name = models.CharField(max_length=250)
    ni_glucose = models.CharField(max_length=250)
    glucose = models.CharField(max_length=250)
    spo_two = models.CharField(max_length=250)
    heart_rate = models.CharField(max_length=250)
    temprature = models.CharField(max_length=250)
    adv_values = models.CharField(max_length=250)
    message = models.CharField(max_length=250)
    location = models.CharField(max_length=250)
    device_no = models.CharField(max_length=250)
    date = models.CharField(max_length=250)

    class Meta:
        managed = False
        db_table = 'tbl_clinical_trial_data'


class TblDeviceCreate(models.Model):
    device_name = models.CharField(max_length=100)
    device_type = models.CharField(max_length=100)
    device_model = models.CharField(max_length=100)
    device_image = models.CharField(max_length=500)
    device_mac_no = models.CharField(max_length=100)
    device_description = models.CharField(max_length=500)
    invasive_glucose = models.CharField(max_length=100)
    non_invasive_glucose = models.CharField(max_length=100)
    heart_rate = models.CharField(max_length=100)
    spo2 = models.CharField(max_length=100)
    haemoglobin = models.CharField(max_length=100)
    bp_systolic = models.CharField(max_length=100)
    bp_diastolic = models.CharField(max_length=100)
    bp_cuffless = models.CharField(max_length=100)
    body_temp = models.CharField(max_length=100)
    body_weight = models.CharField(max_length=100)
    body_height = models.CharField(max_length=100)
    bmi = models.CharField(max_length=100)
    calories_burnt = models.CharField(max_length=100)
    distance_walked = models.CharField(max_length=100)
    respiratory = models.CharField(max_length=100)
    heart_rate_ecg = models.CharField(max_length=100)
    location_tracking = models.CharField(max_length=100)
    alcohol = models.CharField(max_length=100)
    rfid = models.CharField(max_length=100)
    sim = models.CharField(max_length=100)
    ble = models.CharField(max_length=100)
    panic_button = models.CharField(max_length=100)
    wifi_hotspot = models.CharField(max_length=100)
    android = models.CharField(max_length=100)
    fall_body = models.CharField(max_length=100)
    printed_report = models.CharField(max_length=100)
    health_alerts = models.CharField(max_length=100)
    created_at = models.DateTimeField()
    vault_no = models.CharField(max_length=100)
    status = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tbl_device_create'


class TblDownloadCoeffcntPython(models.Model):
    stdmean = models.CharField(max_length=50)
    stddev = models.CharField(max_length=50)
    coeff = models.CharField(max_length=50)
    craeted_at = models.DateTimeField()
    user_name = models.CharField(max_length=50)
    ddl_cofficentcllassic = models.CharField(db_column='ddl_cofficentCllassic', max_length=250)  # Field name made lowercase.
    upload_date = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'tbl_download_coeffcnt_python'


class TblDownloadPredictionsPython(models.Model):
    patients = models.CharField(db_column='PATIENTS', max_length=50)  # Field name made lowercase.
    bg_lab = models.CharField(db_column='BG_lab', max_length=50)  # Field name made lowercase.
    stdmean = models.CharField(max_length=50)
    stddev = models.CharField(max_length=50)
    pred = models.CharField(max_length=50)
    user_name = models.CharField(max_length=50)
    ddl_cofficentcllassic = models.CharField(db_column='ddl_cofficentCllassic', max_length=50)  # Field name made lowercase.
    craeted_at = models.DateTimeField()
    upload_date = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'tbl_download_predictions_python'


class TblEcgData(models.Model):
    user_name = models.CharField(max_length=50)
    ecg_data = models.CharField(max_length=1000)
    ecg_data_one = models.CharField(max_length=3000)
    ecg_data_two = models.CharField(max_length=3000)
    ecg_data_three = models.CharField(max_length=3000)
    ecg_data_four = models.CharField(max_length=3000)
    ecg_data_five = models.CharField(max_length=3000)
    ecg_data_six = models.CharField(max_length=3000)
    date = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'tbl_ecg_data'


class TblEcgGraphChannel10Report(models.Model):
    channel10_id = models.AutoField(primary_key=True)
    channel10_data = models.CharField(max_length=1000)
    device_no = models.CharField(max_length=50)
    from_date = models.CharField(max_length=50)
    to_date = models.CharField(max_length=50)
    user_name = models.CharField(max_length=50)
    created_date = models.DateTimeField()
    status = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tbl_ecg_graph_channel10_report'


class TblEcgGraphChannel3Report(models.Model):
    channel3_id = models.AutoField(primary_key=True)
    channel3_data = models.CharField(max_length=1000)
    device_no = models.CharField(max_length=50)
    from_date = models.CharField(max_length=50)
    to_date = models.CharField(max_length=50)
    user_name = models.CharField(max_length=50)
    created_date = models.DateTimeField()
    status = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tbl_ecg_graph_channel3_report'


class TblEcgGraphChannel4Report(models.Model):
    channel4_id = models.AutoField(primary_key=True)
    channel4_data = models.CharField(max_length=1000)
    device_no = models.CharField(max_length=50)
    from_date = models.CharField(max_length=50)
    to_date = models.CharField(max_length=50)
    user_name = models.CharField(max_length=50)
    created_date = models.DateTimeField()
    status = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tbl_ecg_graph_channel4_report'


class TblEcgGraphChannel5Report(models.Model):
    channel5_id = models.AutoField(primary_key=True)
    channel5_data = models.CharField(max_length=1000)
    device_no = models.CharField(max_length=50)
    from_date = models.CharField(max_length=50)
    to_date = models.CharField(max_length=50)
    user_name = models.CharField(max_length=50)
    created_date = models.DateTimeField()
    status = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tbl_ecg_graph_channel5_report'


class TblEcgGraphChannel6Report(models.Model):
    channel6_id = models.AutoField(primary_key=True)
    channel6_data = models.CharField(max_length=1000)
    device_no = models.CharField(max_length=50)
    from_date = models.CharField(max_length=50)
    to_date = models.CharField(max_length=50)
    user_name = models.CharField(max_length=50)
    created_date = models.DateTimeField()
    status = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tbl_ecg_graph_channel6_report'


class TblEcgGraphChannel7Report(models.Model):
    channel7_id = models.AutoField(primary_key=True)
    channel7_data = models.CharField(max_length=1000)
    device_no = models.CharField(max_length=50)
    from_date = models.CharField(max_length=50)
    to_date = models.CharField(max_length=50)
    user_name = models.CharField(max_length=50)
    created_date = models.DateTimeField()
    status = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tbl_ecg_graph_channel7_report'


class TblEcgGraphChannel8Report(models.Model):
    channel8_id = models.AutoField(primary_key=True)
    channel8_data = models.CharField(max_length=1000)
    device_no = models.CharField(max_length=50)
    from_date = models.CharField(max_length=50)
    to_date = models.CharField(max_length=50)
    user_name = models.CharField(max_length=50)
    created_date = models.DateTimeField()
    status = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tbl_ecg_graph_channel8_report'


class TblEcgGraphChannel9Report(models.Model):
    channel9_id = models.AutoField(primary_key=True)
    channel9_data = models.CharField(max_length=1000)
    device_no = models.CharField(max_length=50)
    from_date = models.CharField(max_length=50)
    to_date = models.CharField(max_length=50)
    user_name = models.CharField(max_length=50)
    created_date = models.DateTimeField()
    status = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tbl_ecg_graph_channel9_report'


class TblImage(models.Model):
    chnls = models.CharField(max_length=50)
    userimage = models.CharField(db_column='userImage', max_length=50)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'tbl_image'


class TblLog(models.Model):
    log_id = models.AutoField(primary_key=True)
    userunique_id = models.CharField(max_length=250, blank=True, null=True)
    log_time = models.DateTimeField(blank=True, null=True)
    ip = models.CharField(max_length=250, blank=True, null=True)
    logout_time = models.CharField(max_length=250, blank=True, null=True)
    sid = models.CharField(max_length=250, blank=True, null=True)
    validupto = models.DateTimeField(blank=True, null=True)
    status_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_log'


class TblMapping(models.Model):
    map_id = models.AutoField(primary_key=True)
    category_id = models.IntegerField()
    subcategory_id = models.IntegerField()
    status_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tbl_mapping'


class TblRegistrationDetails(models.Model):
    main_category = models.CharField(max_length=50)
    txtname = models.CharField(max_length=50)
    txtdob = models.CharField(max_length=50)
    txtlocation = models.CharField(db_column='txtLocation', max_length=50)  # Field name made lowercase.
    zipcode = models.CharField(max_length=50)
    email_id = models.CharField(max_length=50)
    password = models.CharField(max_length=50)
    user_prof = models.CharField(max_length=50)
    prof_spec = models.CharField(max_length=50)
    phone_number = models.CharField(max_length=50)
    created_at = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'tbl_registration_details'


class TblRmcePython(models.Model):
    intercept = models.CharField(max_length=50)
    rmse_on_training = models.CharField(db_column='RMSE_on_training', max_length=50)  # Field name made lowercase.
    total_error = models.CharField(max_length=50)
    squared_error = models.CharField(max_length=50)
    user_name = models.CharField(max_length=50)
    ddl_cofficentcllassic = models.CharField(db_column='ddl_cofficentCllassic', max_length=50)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'tbl_rmce_python'


class TblRole(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50, blank=True, null=True)
    status_id = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_role'


class TblRtpcrVal(models.Model):
    date = models.CharField(max_length=250)
    reading_val = models.CharField(max_length=250)
    centre = models.CharField(max_length=250)
    patient_ref = models.CharField(max_length=250)
    rt_pcr_test = models.CharField(max_length=250)
    rtpcr_ctvalue = models.CharField(max_length=250)

    class Meta:
        managed = False
        db_table = 'tbl_rtpcr_val'


class TblState(models.Model):
    state_id = models.AutoField(primary_key=True)
    state_name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_state'


class TblStatus(models.Model):
    status_id = models.AutoField(primary_key=True)
    status_name = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tbl_status'


class TblSubCategory(models.Model):
    sub_category_id = models.AutoField(primary_key=True)
    user_prof = models.IntegerField()
    sub_category_name = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'tbl_sub_category'


class TblSvasthTrialTwo(models.Model):
    uid = models.IntegerField()
    gender = models.CharField(max_length=50)
    first_name = models.CharField(max_length=250)
    last_name = models.CharField(max_length=250)
    dob = models.CharField(max_length=250)
    mobile = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    profile_password = models.CharField(max_length=50)
    confirm_password = models.CharField(max_length=50)
    pin_number = models.IntegerField()
    vault_no = models.CharField(max_length=250)
    date = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'tbl_svasth_trial_two'


class TblTrialSvasthVariable(models.Model):
    ir = models.TextField()
    red = models.TextField()
    green = models.TextField()
    ni_glucose = models.TextField()
    temparature = models.TextField()
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'tbl_trial_svasth_variable'


class TblUploadReportBckup(models.Model):
    user_name = models.CharField(max_length=250)
    loc_name = models.CharField(max_length=250)
    report = models.CharField(max_length=250)
    date = models.CharField(max_length=250)

    class Meta:
        managed = False
        db_table = 'tbl_upload_report_bckup'


class TblUsbData(models.Model):
    date_time = models.CharField(max_length=50)
    user_name = models.CharField(max_length=50)
    adc_values = models.CharField(max_length=3000)
    systolic_pressure = models.CharField(max_length=250)
    diastolic_pressure = models.CharField(max_length=250)
    hr = models.CharField(max_length=250)

    class Meta:
        managed = False
        db_table = 'tbl_usb_data'


class TblUser(models.Model):
    user_id = models.AutoField(primary_key=True)
    userunique_id = models.CharField(max_length=50, blank=True, null=True)
    username = models.CharField(max_length=50, blank=True, null=True)
    password = models.CharField(max_length=50, blank=True, null=True)
    email = models.CharField(max_length=50, blank=True, null=True)
    category = models.IntegerField()
    pass_salt = models.CharField(max_length=50, blank=True, null=True)
    pass_phrase = models.CharField(max_length=50, blank=True, null=True)
    mobile = models.CharField(max_length=50, blank=True, null=True)
    company_name = models.CharField(max_length=50, blank=True, null=True)
    city_id = models.CharField(max_length=50, blank=True, null=True)
    address = models.CharField(db_column='Address', max_length=50, blank=True, null=True)  # Field name made lowercase.
    state_id = models.IntegerField(blank=True, null=True)
    role_id = models.IntegerField(blank=True, null=True)
    status_id = models.IntegerField(blank=True, null=True)
    branch_id = models.IntegerField(blank=True, null=True)
    image = models.CharField(max_length=100, blank=True, null=True)
    created_date = models.DateTimeField(db_column='Created_date', blank=True, null=True)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'tbl_user'


class TblUserAngel(models.Model):
    user_id = models.AutoField(primary_key=True)
    userunique_id = models.CharField(max_length=50)
    username = models.CharField(max_length=50)
    password = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    category = models.CharField(max_length=50)
    mobile = models.CharField(max_length=50)
    company_name = models.CharField(max_length=100)
    city_id = models.IntegerField()
    address = models.CharField(db_column='Address', max_length=200)  # Field name made lowercase.
    state_id = models.IntegerField()
    role_id = models.IntegerField()
    whatsapp_group_id = models.IntegerField()
    branch_id = models.IntegerField()
    gender = models.CharField(max_length=50)
    dob = models.CharField(max_length=50)
    whatsapp_number = models.CharField(max_length=50)
    whatsapp_group = models.CharField(max_length=50)
    country = models.CharField(max_length=50)
    location = models.CharField(max_length=500)
    zip = models.CharField(max_length=50)
    vault_no = models.CharField(max_length=100)
    qrcode_image = models.CharField(max_length=500)
    user_image = models.CharField(max_length=200)
    created_at = models.DateTimeField()
    status_id = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'tbl_user_angel'


class TblUserDetailsPython(models.Model):
    user_id = models.AutoField(primary_key=True)
    user_name = models.CharField(max_length=50)
    date = models.CharField(max_length=50)
    file = models.CharField(max_length=250)

    class Meta:
        managed = False
        db_table = 'tbl_user_details_python'


class TblUserSvasth(models.Model):
    user_id = models.AutoField(primary_key=True)
    fname = models.CharField(max_length=50)
    lname = models.CharField(max_length=50)
    email = models.CharField(max_length=50)
    mobile = models.CharField(max_length=50)
    password = models.CharField(max_length=50)
    nameofalias = models.CharField(max_length=50)
    usercode = models.CharField(max_length=50)
    status_id = models.IntegerField()
    otp_number = models.IntegerField()
    createddatetime = models.DateTimeField()
    fullname = models.CharField(max_length=50)

    class Meta:
        managed = False
        db_table = 'tbl_user_svasth'


class TblViewReadingAhm(models.Model):
    heart_rate = models.CharField(db_column='Heart_Rate', max_length=50)  # Field name made lowercase.
    spo2 = models.CharField(db_column='SpO2', max_length=50)  # Field name made lowercase.
    hemoglobin = models.CharField(db_column='Hemoglobin', max_length=50)  # Field name made lowercase.
    steps_completed = models.CharField(db_column='Steps_Completed', max_length=50)  # Field name made lowercase.
    calories_burnt = models.CharField(db_column='Calories_Burnt', max_length=50)  # Field name made lowercase.
    distance_travelled = models.CharField(db_column='Distance_travelled', max_length=50)  # Field name made lowercase.
    speed = models.CharField(db_column='Speed', max_length=100)  # Field name made lowercase.
    activity = models.CharField(db_column='Activity', max_length=100)  # Field name made lowercase.
    temperature = models.CharField(db_column='Temperature', max_length=100)  # Field name made lowercase.
    sleep_duration = models.CharField(db_column='Sleep_Duration', max_length=100)  # Field name made lowercase.
    light_sleep = models.CharField(db_column='Light_Sleep', max_length=100)  # Field name made lowercase.
    deep_sleep = models.CharField(db_column='Deep_sleep', max_length=100)  # Field name made lowercase.
    sleep_onset = models.CharField(db_column='Sleep_onset', max_length=50)  # Field name made lowercase.
    devices_mac_no = models.CharField(db_column='Devices_Mac_No', max_length=50)  # Field name made lowercase.
    sim_no = models.CharField(max_length=50)
    name = models.CharField(max_length=50)
    mobile = models.CharField(max_length=50)
    location = models.CharField(max_length=50)
    message = models.CharField(max_length=500)
    rfid = models.CharField(max_length=50)
    vault_no = models.CharField(max_length=50)
    status_id = models.CharField(max_length=50)
    created_date = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'tbl_view_reading_ahm'


class TblViralScan(models.Model):
    date = models.CharField(max_length=250)
    patient_recoerd_no = models.IntegerField()
    user_name = models.CharField(max_length=250)
    frenulum_1550_mean = models.CharField(max_length=250)
    frenulum_1550_stddev = models.CharField(max_length=250)
    frenulum_1800_mean = models.CharField(max_length=250)
    frenulum_1800_stddev = models.CharField(max_length=250)
    frenulum_2050_mean = models.CharField(max_length=250)
    frenulum_2050_stddev = models.CharField(max_length=250)
    frenulum_2400_mean = models.CharField(max_length=250)
    frenulum_2400_stddev = models.CharField(max_length=250)
    nasopharynx_1550_mean = models.CharField(max_length=250)
    nasopharynx_1550_stddev = models.CharField(max_length=250)
    nasopharynx_1800_mean = models.CharField(max_length=250)
    nasopharynx_1800_stddev = models.CharField(max_length=250)
    nasopharynx_2400_mean = models.CharField(max_length=250)
    nasopharynx_2400_stddev = models.CharField(max_length=250)
    oropharynx_1550_mean = models.CharField(max_length=250)
    oropharynx_1550_stddev = models.CharField(max_length=250)
    oropharynx_1800_mean = models.CharField(max_length=250)
    oropharynx_1800_stddev = models.CharField(max_length=250)
    oropharynx_2400_mean = models.CharField(max_length=250)
    oropharynx_2400_stddev = models.CharField(max_length=250)
    hypopharynx_1550_mean = models.CharField(max_length=250)
    hypopharynx_1550_stddev = models.CharField(max_length=250)
    hypopharynx_1800_mean = models.CharField(max_length=250)
    hypopharynx_1800_stddev = models.CharField(max_length=250)
    hypopharynx_2050_mean = models.CharField(max_length=250)
    hypopharynx_2050_stddev = models.CharField(max_length=250)
    hypopharynx_2400_mean = models.CharField(max_length=250)
    hypopharynx_2400_stddev = models.CharField(max_length=250)
    time = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'tbl_viral_scan'


class TblViralScanDataUpload(models.Model):
    date = models.CharField(max_length=250)
    device_no = models.CharField(max_length=250)
    device_reading_no = models.CharField(max_length=250)
    patient_record_ref = models.CharField(max_length=250)
    reading_1 = models.CharField(max_length=250)
    oral_region = models.CharField(max_length=250)
    dates = models.CharField(max_length=250)
    col_1 = models.CharField(max_length=250)
    col_2 = models.CharField(max_length=250)
    col_3 = models.CharField(max_length=250)
    col_4 = models.CharField(max_length=250)
    col_5 = models.CharField(max_length=250)
    col_6 = models.CharField(max_length=250)
    col_7 = models.CharField(max_length=250)
    col_8 = models.CharField(max_length=250)
    col_9 = models.CharField(max_length=250)
    col_10 = models.CharField(max_length=250)
    col_11 = models.CharField(max_length=250)
    col_12 = models.CharField(max_length=250)
    col_13 = models.CharField(max_length=250)
    col_14 = models.CharField(max_length=250)
    col_15 = models.CharField(max_length=250)
    col_16 = models.CharField(max_length=250)
    col_17 = models.CharField(max_length=250)
    col_18 = models.CharField(max_length=250)
    col_19 = models.CharField(max_length=250)
    col_20 = models.CharField(max_length=250)
    col_21 = models.CharField(max_length=250)
    col_22 = models.CharField(max_length=250)
    col_23 = models.CharField(max_length=250)
    col_24 = models.CharField(max_length=250)
    col_25 = models.CharField(max_length=250)
    col_26 = models.CharField(max_length=250)
    col_27 = models.CharField(max_length=250)
    col_28 = models.CharField(max_length=250)
    col_29 = models.CharField(max_length=250)
    col_30 = models.CharField(max_length=250)
    col_31 = models.CharField(max_length=250)
    col_32 = models.CharField(max_length=250)
    col_33 = models.CharField(max_length=250)
    col_34 = models.CharField(max_length=250)
    col_35 = models.CharField(max_length=250)
    col_36 = models.CharField(max_length=250)
    col_37 = models.CharField(max_length=250)
    col_38 = models.CharField(max_length=250)
    col_39 = models.CharField(max_length=250)
    col_40 = models.CharField(max_length=250)
    col_41 = models.CharField(max_length=250)

    class Meta:
        managed = False
        db_table = 'tbl_viral_scan_data_upload'


class Testschedulebp(models.Model):
    svasthbp7am = models.CharField(db_column='Svasthbp7am', max_length=30)  # Field name made lowercase.
    svasthbp9am = models.CharField(db_column='Svasthbp9am', max_length=30)  # Field name made lowercase.
    svasthbp11am = models.CharField(db_column='Svasthbp11am', max_length=30)  # Field name made lowercase.
    svasthbp1pm = models.CharField(db_column='Svasthbp1pm', max_length=30)  # Field name made lowercase.
    svasthbp4pm = models.CharField(db_column='Svasthbp4pm', max_length=30)  # Field name made lowercase.
    svasthbp7pm = models.CharField(db_column='Svasthbp7pm', max_length=30)  # Field name made lowercase.
    svasthbp10pm = models.CharField(db_column='Svasthbp10pm', max_length=30)  # Field name made lowercase.
    hospitalname = models.CharField(db_column='HospitalName', max_length=30)  # Field name made lowercase.
    createdat = models.DateTimeField(db_column='CreatedAt')  # Field name made lowercase.
    deviceno = models.CharField(db_column='DeviceNo', max_length=15)  # Field name made lowercase.
    patientname = models.CharField(db_column='PatientName', max_length=30)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'testschedulebp'


class Testscheduleglucose(models.Model):
    fbs7am = models.CharField(db_column='Fbs7am', max_length=30)  # Field name made lowercase.
    ppbs9am = models.CharField(db_column='Ppbs9am', max_length=30)  # Field name made lowercase.
    hospitalname = models.CharField(db_column='HospitalName', max_length=30)  # Field name made lowercase.
    createdat = models.CharField(db_column='CreatedAt', max_length=30)  # Field name made lowercase.
    deviceno = models.CharField(db_column='DeviceNo', max_length=15)  # Field name made lowercase.
    patientname = models.CharField(db_column='PatientName', max_length=30)  # Field name made lowercase.
    gludate = models.DateField()

    class Meta:
        managed = False
        db_table = 'testscheduleglucose'


class Testschedulegrbs(models.Model):
    grbsdate = models.DateField()
    grbs7am = models.IntegerField()
    grbs9am = models.IntegerField()
    grbs11am = models.IntegerField()
    grbs1pm = models.IntegerField()
    grbs4pm = models.IntegerField()
    grbs7pm = models.IntegerField()
    grbs10pm = models.IntegerField()
    hospitalname = models.CharField(db_column='HospitalName', max_length=30)  # Field name made lowercase.
    createdat = models.CharField(db_column='CreatedAt', max_length=30)  # Field name made lowercase.
    deviceno = models.CharField(db_column='DeviceNo', max_length=15)  # Field name made lowercase.
    patientname = models.CharField(db_column='PatientName', max_length=30)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'testschedulegrbs'


class Testschedulehr(models.Model):
    hr7am = models.CharField(max_length=30)
    hr11am = models.CharField(max_length=30)
    hr4pm = models.CharField(max_length=30)
    hr10pm = models.CharField(max_length=30)
    hospitalname = models.CharField(db_column='HospitalName', max_length=30)  # Field name made lowercase.
    createdat = models.CharField(db_column='CreatedAt', max_length=50)  # Field name made lowercase.
    deviceno = models.IntegerField(db_column='DeviceNo')  # Field name made lowercase.
    patientname = models.CharField(db_column='PatientName', max_length=30)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'testschedulehr'


class Testschedulesvasthmobile(models.Model):
    svasthmobile7am = models.CharField(db_column='SvasthMobile7am', max_length=30)  # Field name made lowercase.
    svasthmobile9am = models.CharField(db_column='SvasthMobile9am', max_length=30)  # Field name made lowercase.
    svasthmobile11am = models.CharField(db_column='SvasthMobile11am', max_length=30)  # Field name made lowercase.
    svasthmobile1pm = models.CharField(db_column='SvasthMobile1pm', max_length=30)  # Field name made lowercase.
    svasthmobile4pm = models.CharField(db_column='SvasthMobile4pm', max_length=30)  # Field name made lowercase.
    svasthmobile7pm = models.CharField(db_column='SvasthMobile7pm', max_length=30)  # Field name made lowercase.
    svasthmobile10pm = models.CharField(db_column='SvasthMobile10pm', max_length=30)  # Field name made lowercase.
    createdat = models.CharField(db_column='CreatedAt', max_length=30)  # Field name made lowercase.
    hospitalname = models.CharField(db_column='HospitalName', max_length=30)  # Field name made lowercase.
    svasthmobdate = models.DateField()
    deviceno = models.CharField(db_column='DeviceNo', max_length=15)  # Field name made lowercase.
    patientname = models.CharField(db_column='PatientName', max_length=30)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'testschedulesvasthmobile'


class Testschedulesvasthwear(models.Model):
    svasthwear645to830 = models.CharField(max_length=30)
    svasthwear830to930 = models.CharField(max_length=30)
    svasthwear1030to1130 = models.CharField(max_length=30)
    svasthwear1230to130 = models.CharField(max_length=30)
    svasthwear330to430 = models.CharField(max_length=30)
    svasthwear630to730 = models.CharField(max_length=30)
    svasthwear930to1030 = models.CharField(max_length=30)
    createdat = models.CharField(db_column='CreatedAt', max_length=30)  # Field name made lowercase.
    hospitalname = models.CharField(db_column='HospitalName', max_length=30)  # Field name made lowercase.
    deviceno = models.CharField(db_column='DeviceNo', max_length=15)  # Field name made lowercase.
    patientname = models.CharField(db_column='PatientName', max_length=30)  # Field name made lowercase.
    svasthweardate = models.DateField()

    class Meta:
        managed = False
        db_table = 'testschedulesvasthwear'


class UqcMaster(models.Model):
    unit_quantity_code = models.CharField(db_column='Unit_quantity_code', max_length=255)  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'uqc_master'
