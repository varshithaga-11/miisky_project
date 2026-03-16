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




