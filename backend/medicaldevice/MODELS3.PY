# Yes — let’s turn your **entire architecture into clean, connected Django models** 🔥
# I’ll give you a **production-ready structure** with proper relationships, scalable design, and clear separation.

# ---

# # 🧱 Recommended App Structure


# masters/
# mappings/
# devices/
# algorithms/
# patients/
# data/
# outputs/



# masters/models.py
from django.db import models


class MedicalArea(models.Model):
    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    explanation = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# 🧠 Examples of Medical Areas#Departments
# Code	Title	Meaning
# CARD	Cardiology	Heart-related
# DIAB	Diabetes	Blood Sugar
# PULM	Pulmonology	Lungs
# NUTR	Nutrition	Diet & food
# ENDO	Endocrinology	Endocrine System
# GYNE	Gynecology	Women's Health
# URO	Urology	Urinary System
# NEPH	 Nephrology	Kidney

class PatientCategory(models.Model):
    GENDER_CHOICES = [
        ("ALL", "All"),
        ("MALE", "Male"),
        ("FEMALE", "Female"),
    ]

    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=100)

    gender = models.CharField(max_length=10, choices=GENDER_CHOICES, default="ALL")

    age_min = models.IntegerField(help_text="Minimum age in years")
    age_max = models.IntegerField(help_text="Maximum age in years")

    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} ({self.age_min}-{self.age_max})"


class Biomarker(models.Model):
    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=100)

    unit_primary = models.CharField(max_length=20)
    unit_alternative = models.CharField(max_length=20, blank=True, null=True)
    conversion_factor = models.FloatField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class BiomarkerPatientCategoryRange(models.Model):
    biomarker = models.ForeignKey(Biomarker, on_delete=models.CASCADE)
    patient_category = models.ForeignKey(PatientCategory, on_delete=models.CASCADE)

    normal_min = models.FloatField()
    normal_max = models.FloatField()

    critical_min = models.FloatField(blank=True, null=True)
    critical_max = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"{self.biomarker} → {self.patient_category}"


# 🟢 PatientCategory Table
# id	code	title	gender	age_min	age_max
# 1	PED_ALL	Paediatric	ALL	0	12
# 2	ADULT_M	Adult Male	MALE	18	60
# 3	ADULT_F	Adult Female	FEMALE	18	60
# 4	GER_ALL	Geriatric	ALL	60	120
# 🟡 Biomarker Table
# id	code	title
# 1	BM_GLU	Glucose
# 2	BM_HR	Heart Rate
# 🔵 BiomarkerPatientCategoryRange Table
# biomarker	category	normal_min	normal_max
# Glucose	Adult Male	70	110
# Glucose	Adult Female	70	105
# Glucose	Paediatric	75	120
# HR	Adult Male	60	100
# HR	Geriatric	65	110





class DataSourceCategory(models.Model):
    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title




class DataSource(models.Model):
    category = models.ForeignKey(
        DataSourceCategory,
        on_delete=models.CASCADE,
        related_name="sources"
    )

    code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=100)

    wavelength_nm = models.IntegerField(blank=True, null=True)
    module_ref = models.CharField(max_length=50, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title





# 🟣 DataSourceCategory Table
# id	code	title
# 1	NIR	Infrared
# 2	PPG	PPG Sensor
# 3	ECG	ECG Sensor
# 4	ACC	Accelerometer
# 5	GAS	Gas Sensor
# 🟢 DataSource Table
# id	category	code	title	wavelength
# 1	NIR	IR_940	IR LED 940nm	940
# 2	NIR	IR_660	IR LED 660nm	660
# 3	PPG	PPG_MAX30101	MAX30101	null
# 4	ECG	ECG_4LEAD	4 Lead ECG	null
# 5	ACC	ACC_ADXL345	ADXL345	null
# 6	GAS	Gas_MQ135	MQ135	null




class BiomarkerSourceMap(models.Model):
    biomarker = models.ForeignKey(Biomarker, on_delete=models.CASCADE)
    primary_source = models.ForeignKey(
        DataSource, on_delete=models.CASCADE, related_name="primary_sources"
    )
    secondary_source = models.ForeignKey(
        DataSource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="secondary_sources",
    )
    remarks = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.biomarker} ← {self.primary_source}"


# 🟢 3. DEVICES APP


class MedicalDevice(models.Model):
    DEVICE_TYPE_CHOICES = [
        ("WEARABLE", "Wearable"),
        ("KIOSK", "Kiosk"),
        ("VENTILATOR", "Ventilator"),
        ("PULSE", "Pulse Device"),
    ]

    code = models.CharField(max_length=20)
    title = models.CharField(max_length=100)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPE_CHOICES)

    ble_id = models.CharField(max_length=50, blank=True, null=True)
    wifi_id = models.CharField(max_length=50, blank=True, null=True)
    sim_support = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# 🟠 4. ALGORITHMS APP



class Algorithm(models.Model):
    name = models.CharField(max_length=100)
    version = models.CharField(max_length=20)

    biomarker = models.ForeignKey(Biomarker, on_delete=models.CASCADE)
    device = models.ForeignKey(MedicalDevice, on_delete=models.CASCADE)

    std_mean = models.FloatField(blank=True, null=True)
    std_dev = models.FloatField(blank=True, null=True)
    coefficient = models.FloatField(blank=True, null=True)
    variables_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} v{self.version}"


class PersonalizedAlgorithm(models.Model):
    base_algorithm = models.ForeignKey(Algorithm, on_delete=models.CASCADE)
    patient_id = models.IntegerField()  # link later to patient app
    tuning_params = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)

# 🔴 5. PATIENTS APP


class Patient(models.Model):
    name = models.CharField(max_length=100)
    mobile = models.CharField(max_length=15, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class DevicePatientMap(models.Model):
    device = models.ForeignKey(MedicalDevice, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)

    mapped_at = models.DateTimeField(auto_now_add=True)
    unmapped_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"{self.device} → {self.patient}"


# 🔗 DEVICE ↔ BIOMARKER ↔ ALGORITHM LINK



class DeviceBiomarkerMap(models.Model):
    device = models.ForeignKey(MedicalDevice, on_delete=models.CASCADE)
    biomarker = models.ForeignKey(Biomarker, on_delete=models.CASCADE)
    algorithm = models.ForeignKey(Algorithm, on_delete=models.CASCADE)

    version_code = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.device} → {self.biomarker}"


# ⚫ 6. DATA APP (CORE TABLE 🔥)


class RawReading(models.Model):
    FASTING_CHOICES = [
        ("FASTING", "Fasting"),
        ("PP", "Post Prandial"),
        ("RANDOM", "Random"),
    ]

    device = models.ForeignKey(MedicalDevice, on_delete=models.CASCADE)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    source = models.ForeignKey(DataSource, on_delete=models.CASCADE)

    biomarker = models.ForeignKey(Biomarker, on_delete=models.CASCADE)

    reading_datetime = models.DateTimeField()

    adc_values = models.JSONField()  # raw sensor values

    processed_value = models.FloatField(blank=True, null=True)

    fast_or_pp = models.CharField(
        max_length=10, choices=FASTING_CHOICES, default="RANDOM"
    )

    lab_reference_value = models.FloatField(blank=True, null=True)

    std_dev = models.FloatField(blank=True, null=True)
    std_mean = models.FloatField(blank=True, null=True)

    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)


# 🟢 7. OUTPUTS APP



class ProcessedReading(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    biomarker = models.ForeignKey(Biomarker, on_delete=models.CASCADE)

    value = models.FloatField()
    status = models.CharField(max_length=20)  # Normal / High / Low

    recorded_at = models.DateTimeField()

    def __str__(self):
        return f"{self.patient} - {self.biomarker} = {self.value}"

# # 🔁 FINAL RELATION FLOW (VERY IMPORTANT)

# ```text
# MedicalArea
#     ↑
# Biomarker ← DataSource
#     ↑
# DeviceBiomarkerMap → Algorithm
#     ↑
# MedicalDevice → DevicePatientMap → Patient
#     ↓
# RawReading (MAIN TABLE)
#     ↓
# ProcessedReading
# ```
