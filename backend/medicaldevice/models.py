"""
Miisky Svasth - operational master data (Miisky Technovation / miisky.com).

This app is separate from ``website`` (CMS). Models follow stakeholder master
tables: medical areas, biomarkers, data sources (UV / visible / IR / ECG / PPG /
accelerometer / gas), devices, algorithms, mappings, and raw ADC transfer.

Example rows are given in each model docstring.
"""

from __future__ import annotations

from django.db import models


# -----------------------------------------------------------------------------
# MEDICAL AREAS MASTER - MEDICAL CODE, DESCRIPTION, EXPLANATION
# -----------------------------------------------------------------------------


class MedicalArea(models.Model):
    """
    Example:
        medical_code="DIAB"
        description="Diabetes & glycaemic control"
        explanation="CGM / glucose-related biomarkers and endocrine follow-up."
    """

    medical_code = models.CharField(max_length=40, unique=True, db_index=True)
    description = models.CharField(max_length=500)
    explanation = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["medical_code"]
        verbose_name = "Medical area"
        verbose_name_plural = "Medical areas"

    def __str__(self) -> str:
        return f"{self.medical_code} - {self.description[:40]}"


# -----------------------------------------------------------------------------
# PATIENT CLASS - PAEDIATRIC / MALE / WOMEN / GERIATRIC
# -----------------------------------------------------------------------------


class PatientCategory(models.Model):
    """
    Example:
        code="PED", title="Paediatric", gender_scope="ALL", age_min=0, age_max=17
        code="ADULT_M", title="Adult male", gender_scope="MALE", age_min=18, age_max=59
        code="GER", title="Geriatric", gender_scope="ALL", age_min=60, age_max=120
    """

    GENDER_SCOPE_CHOICES = [
        ("ALL", "All"),
        ("MALE", "Male"),
        ("FEMALE", "Female / Women"),
    ]

    code = models.CharField(max_length=40, unique=True)
    title = models.CharField(max_length=120)
    gender_scope = models.CharField(
        max_length=10,
        choices=GENDER_SCOPE_CHOICES,
        default="ALL",
        help_text="Use with age range to express MALE / WOMEN / PAEDIATRIC / GERIATRIC norms.",
    )
    age_min = models.PositiveSmallIntegerField(blank=True, null=True)
    age_max = models.PositiveSmallIntegerField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["code"]
        verbose_name = "Patient category"
        verbose_name_plural = "Patient categories"

    def __str__(self) -> str:
        return self.title


# -----------------------------------------------------------------------------
# BIO-MARKER MASTER (+ medical area link, units, norm)
# -----------------------------------------------------------------------------


class Biomarker(models.Model):
    """
    Example:
        biomarker_code="GLU_FAST"
        description="Fasting glucose"
        unit_primary="mg/dL", unit_alternative="mmol/L"
        conversion_factor=0.0555
        alternative_measurement="Lab plasma glucose"
        standard_norm="Per ADA / local lab reference"
    """

    biomarker_code = models.CharField(max_length=40, unique=True, db_index=True)
    description = models.CharField(max_length=300)
    medical_area = models.ForeignKey(
        MedicalArea,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="biomarkers",
    )
    unit_primary = models.CharField(max_length=40, help_text="e.g. mg/dL")
    unit_alternative = models.CharField(max_length=40, blank=True, null=True, help_text="e.g. mmol/L")
    conversion_factor = models.FloatField(blank=True, null=True)
    alternative_measurement = models.CharField(max_length=200, blank=True, null=True)
    standard_norm = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["biomarker_code"]
        verbose_name = "Biomarker"
        verbose_name_plural = "Biomarkers"

    def __str__(self) -> str:
        return f"{self.biomarker_code} - {self.description}"


# -----------------------------------------------------------------------------
# DATA SOURCES MASTER - UV / VISIBLE / IR LED / ECG / PPG / ACC / GAS
# -----------------------------------------------------------------------------


class DataSourceCategory(models.Model):
    """
    Example:
        hierarchy_code="1.0", title="UV range", parent=None
        hierarchy_code="1.1", title="UV 350 nm", parent=<UV range>
        hierarchy_code="3.0", title="IR LED", parent=None
        hierarchy_code="5.0", title="PPG module", parent=None
    """

    hierarchy_code = models.CharField(max_length=20, unique=True, db_index=True)
    title = models.CharField(max_length=200)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    sort_order = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["hierarchy_code", "sort_order"]
        verbose_name = "Data source category"
        verbose_name_plural = "Data source categories"

    def __str__(self) -> str:
        return f"{self.hierarchy_code} {self.title}"


class DataSource(models.Model):
    """
    Example (wavelength / part):
        source_code="UV_350", title="UV 350 nm", wavelength_nm=350
        source_code="IR_940", title="IR LED 940 nm", wavelength_nm=940
        source_code="PPG_MAX30101", module_ref="MAX30101"
        source_code="ECG_TI_4LEAD", module_ref="TI 4-lead"
        source_code="ACC_LIS2D", module_ref="LIS2D"
    """

    category = models.ForeignKey(DataSourceCategory, on_delete=models.CASCADE, related_name="sources")
    source_code = models.CharField(max_length=50, unique=True, db_index=True)
    title = models.CharField(max_length=200)
    wavelength_nm = models.PositiveIntegerField(blank=True, null=True)
    module_ref = models.CharField(max_length=80, blank=True, null=True)
    extra = models.JSONField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["source_code"]
        verbose_name = "Data source"
        verbose_name_plural = "Data sources"

    def __str__(self) -> str:
        return f"{self.source_code} ({self.title})"


# -----------------------------------------------------------------------------
# MEDICAL DEVICES MASTER - DEVICE ID, SUB CODE, TITLE, DATE, IMAGE
# -----------------------------------------------------------------------------


class DeviceMaster(models.Model):
    """
    Example:
        device_id="SVA-CGM-01"
        device_sub_code="REV-B"
        device_title="Svasth wearable CGM"
        date_operational=2025-01-15
    """

    device_id = models.CharField(max_length=80, unique=True, db_index=True)
    device_sub_code = models.CharField(max_length=80, blank=True, null=True)
    device_title = models.CharField(max_length=200)
    date_operational = models.DateField(blank=True, null=True)
    image = models.ImageField(upload_to="medicaldevice/devices/", blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["device_id"]
        verbose_name = "Device master"
        verbose_name_plural = "Device masters"

    def __str__(self) -> str:
        return f"{self.device_id} - {self.device_title}"


# -----------------------------------------------------------------------------
# ALGORITHM MASTER
# -----------------------------------------------------------------------------


class Algorithm(models.Model):
    """
    Example:
        algorithm_code="ALG-GLU-001"
        version_code="1.2.0"
        version_date=2026-03-01
        testing_date=2026-03-10
    """

    algorithm_code = models.CharField(max_length=80, unique=True, db_index=True)
    biomarker = models.ForeignKey(Biomarker, on_delete=models.CASCADE, related_name="algorithms")
    device = models.ForeignKey(DeviceMaster, on_delete=models.CASCADE, related_name="algorithms")
    version_code = models.CharField(max_length=40)
    version_date = models.DateField(blank=True, null=True)
    testing_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-version_date", "algorithm_code"]
        verbose_name = "Algorithm"
        verbose_name_plural = "Algorithms"

    def __str__(self) -> str:
        return f"{self.algorithm_code} v{self.version_code}"


class PersonalizedAlgorithm(models.Model):
    """
    Example:
        external_patient_key="PAT-10042"
        tuning_params={"offset": -2.1, "scale": 1.0}
    """

    base_algorithm = models.ForeignKey(
        Algorithm,
        on_delete=models.CASCADE,
        related_name="personalized_variants",
    )
    external_patient_key = models.CharField(max_length=80, db_index=True)
    tuning_params = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["base_algorithm", "external_patient_key"],
                name="uniq_personalized_algorithm_per_patient",
            ),
        ]
        verbose_name = "Personalized algorithm"
        verbose_name_plural = "Personalized algorithms"

    def __str__(self) -> str:
        return f"{self.base_algorithm.algorithm_code} -> {self.external_patient_key}"


# -----------------------------------------------------------------------------
# BIO MARKER TO MEDICAL AREAS MAPPING
# -----------------------------------------------------------------------------


class BiomarkerMedicalAreaMapping(models.Model):
    """
    Example:
        biomarker=GLU_FAST, medical_area=DIAB, patient_category code ADULT_M
        normal_min=70, normal_max=99, normal_range_text="70-99 mg/dL"
    """

    biomarker = models.ForeignKey(Biomarker, on_delete=models.CASCADE, related_name="medical_area_maps")
    medical_area = models.ForeignKey(MedicalArea, on_delete=models.CASCADE, related_name="biomarker_maps")
    patient_category = models.ForeignKey(
        PatientCategory,
        on_delete=models.CASCADE,
        related_name="biomarker_norm_maps",
    )
    normal_min = models.FloatField(blank=True, null=True)
    normal_max = models.FloatField(blank=True, null=True)
    critical_min = models.FloatField(blank=True, null=True)
    critical_max = models.FloatField(blank=True, null=True)
    normal_range_text = models.CharField(max_length=120, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["biomarker", "medical_area", "patient_category"],
                name="uniq_biomarker_medarea_patientcategory",
            ),
        ]
        verbose_name = "Biomarker-medical area mapping"
        verbose_name_plural = "Biomarker-medical area mappings"

    def __str__(self) -> str:
        return f"{self.biomarker.biomarker_code} / {self.medical_area.medical_code} / {self.patient_category.code}"


# -----------------------------------------------------------------------------
# DEVICE TO BIO-MARKER PARAMETER MAPPING
# -----------------------------------------------------------------------------


class DeviceBiomarkerParameterMapping(models.Model):
    """
    Example:
        device=SVA-CGM-01
        device_description="PPG + IR channel stack A"
        biomarker=GLU_FAST
        algorithm=ALG-GLU-001
        version_code=1.2.0
    """

    device = models.ForeignKey(DeviceMaster, on_delete=models.CASCADE, related_name="biomarker_parameter_maps")
    device_description = models.CharField(max_length=300, blank=True, null=True)
    biomarker = models.ForeignKey(Biomarker, on_delete=models.CASCADE, related_name="device_parameter_maps")
    algorithm = models.ForeignKey(Algorithm, on_delete=models.CASCADE, related_name="device_parameter_maps")
    version_code = models.CharField(max_length=40)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["device", "biomarker", "version_code"],
                name="uniq_device_biomarker_version",
            ),
        ]
        verbose_name = "Device-biomarker parameter mapping"
        verbose_name_plural = "Device-biomarker parameter mappings"

    def __str__(self) -> str:
        return f"{self.device.device_id} -> {self.biomarker.biomarker_code}"


# -----------------------------------------------------------------------------
# BIO-MARKER TO SOURCES MAPPING
# -----------------------------------------------------------------------------


class BiomarkerSourceMapping(models.Model):
    """
    Example:
        biomarker=GLU_FAST, source=IR_940, multi_source=IR_1550
        remarks="Ratio corrects for skin scatter"

    Denormalized titles optional for exports matching legacy column names.
    """

    biomarker = models.ForeignKey(Biomarker, on_delete=models.CASCADE, related_name="source_maps")
    biomarker_title = models.CharField(max_length=300, blank=True, null=True)
    source = models.ForeignKey(DataSource, on_delete=models.CASCADE, related_name="biomarker_maps_primary")
    source_title = models.CharField(max_length=200, blank=True, null=True)
    multi_source = models.ForeignKey(
        DataSource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="biomarker_maps_secondary",
    )
    multi_source_title = models.CharField(max_length=200, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["biomarker", "source", "multi_source"],
                condition=models.Q(multi_source__isnull=False),
                name="uniq_biomarker_source_multi_when_set",
            ),
            models.UniqueConstraint(
                fields=["biomarker", "source"],
                condition=models.Q(multi_source__isnull=True),
                name="uniq_biomarker_source_when_multi_null",
            ),
        ]
        verbose_name = "Biomarker-source mapping"
        verbose_name_plural = "Biomarker-source mappings"

    def __str__(self) -> str:
        return f"{self.biomarker.biomarker_code} <- {self.source.source_code}"


# -----------------------------------------------------------------------------
# DEVICE TO PATIENT MAPPING
# -----------------------------------------------------------------------------


class DevicePatientMapping(models.Model):
    """
    Example:
        device_ble_id="AA:BB:CC:DD:EE:FF"
        device_mapping_number="MAP-009231"
        patient_id_external="PAT-88421"
        patient_name="Sample user"
        mobile_sim_no="98XXXXXXXX"
        mobile_imei_no="35XXXXXXXXXXXXX"
        device_wifi_id="SVA-WIFI-01"
    """

    device = models.ForeignKey(DeviceMaster, on_delete=models.CASCADE, related_name="patient_maps")
    device_ble_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    device_mapping_number = models.CharField(max_length=80, blank=True, null=True)
    patient_id_external = models.CharField(max_length=80, db_index=True)
    patient_name = models.CharField(max_length=200, blank=True, null=True)
    mobile_sim_no = models.CharField(max_length=40, blank=True, null=True)
    mobile_imei_no = models.CharField(max_length=40, blank=True, null=True)
    device_wifi_id = models.CharField(max_length=80, blank=True, null=True)
    mapped_at = models.DateTimeField(auto_now_add=True)
    unmapped_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-mapped_at"]
        verbose_name = "Device-patient mapping"
        verbose_name_plural = "Device-patient mappings"

    def __str__(self) -> str:
        return f"{self.device.device_id} -> {self.patient_id_external}"


# -----------------------------------------------------------------------------
# DEVICE TO ALGORITHM DATA FLOW
# -----------------------------------------------------------------------------


class DeviceAlgorithmFlow(models.Model):
    """
    Example:
        device_sub_id="SUB-01"
        android_app_id="com.miisky.svasth"
        version_control_no="FW-2.1.0"
    """

    device = models.ForeignKey(DeviceMaster, on_delete=models.CASCADE, related_name="algorithm_flows")
    device_sub_id = models.CharField(max_length=80, blank=True, null=True)
    algorithm = models.ForeignKey(Algorithm, on_delete=models.CASCADE, related_name="device_flows")
    personalised_algorithm = models.ForeignKey(
        PersonalizedAlgorithm,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="device_flows",
    )
    android_app_id = models.CharField(max_length=200, blank=True, null=True)
    version_control_no = models.CharField(max_length=80, blank=True, null=True)

    class Meta:
        ordering = ["device", "device_sub_id"]
        verbose_name = "Device algorithm flow"
        verbose_name_plural = "Device algorithm flows"

    def __str__(self) -> str:
        return f"{self.device.device_id} -> {self.algorithm.algorithm_code}"


# -----------------------------------------------------------------------------
# BASIC DATA TRANSFER - ADC payload
# -----------------------------------------------------------------------------


class BasicDataTransfer(models.Model):
    """
    Example:
        device_sub_id="SUB-01"
        source_type="IR"
        reading_id="RD-20260415-0001"
        reading_date / reading_time
        adc_values=[412, 415, 418, ...]
    """

    device = models.ForeignKey(DeviceMaster, on_delete=models.CASCADE, related_name="raw_transfers")
    device_sub_id = models.CharField(max_length=80, blank=True, null=True)
    source_type = models.CharField(
        max_length=40,
        help_text="Logical channel: UV, visible, IR, PPG, ECG, ACC, GAS, etc.",
    )
    reading_id = models.CharField(max_length=80, unique=True, db_index=True)
    reading_date = models.DateField()
    reading_time = models.TimeField()
    adc_values = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-reading_date", "-reading_time"]
        indexes = [
            models.Index(fields=["device", "reading_date"]),
        ]
        verbose_name = "Basic data transfer"
        verbose_name_plural = "Basic data transfers"

    def __str__(self) -> str:
        return f"{self.reading_id} @ {self.reading_date}"
