"""
Miisky Svasth - operational master data (Miisky Technovation / miisky.com).

This app is separate from ``website`` (CMS). Models follow stakeholder master
tables: medical areas, biomarkers, data sources (UV / visible / IR / ECG / PPG /
accelerometer / gas), devices, algorithms, mappings, raw ADC transfer, and
optional processed biomarker results for the analytics pipeline.

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
    sort_order = models.PositiveIntegerField(default=0, help_text="Display order in admin and APIs.")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "medical_code"]
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
    loinc_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        db_index=True,
        help_text="Optional LOINC for interoperability.",
    )
    sort_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "biomarker_code"]
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
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
    )
    sort_order = models.PositiveIntegerField(default=0)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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

    category = models.ForeignKey(
        DataSourceCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sources",
    )
    source_code = models.CharField(max_length=50, unique=True, db_index=True)
    title = models.CharField(max_length=200)
    wavelength_nm = models.PositiveIntegerField(blank=True, null=True)
    module_ref = models.CharField(max_length=80, blank=True, null=True)
    extra = models.JSONField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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

    device_sub_code = models.CharField(max_length=80, blank=True, null=True)
    device_title = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=120, blank=True, null=True, db_index=True)
    firmware_version = models.CharField(max_length=80, blank=True, null=True)
    hardware_revision = models.CharField(max_length=80, blank=True, null=True)
    kiosk = models.ForeignKey(
        "KioskMaster",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="devices",
    )
    date_operational = models.DateField(blank=True, null=True)
    image = models.ImageField(upload_to="medicaldevice/devices/", blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["serial_number", "device_title"]
        verbose_name = "Device master"
        verbose_name_plural = "Device masters"

    def __str__(self) -> str:
        return f"{self.device_sub_code} - {self.device_title}"


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
    biomarker = models.ForeignKey(
        Biomarker, on_delete=models.SET_NULL, null=True, blank=True, related_name="algorithms"
    )
    device = models.ForeignKey(
        DeviceMaster, on_delete=models.SET_NULL, null=True, blank=True, related_name="algorithms"
    )
    version_code = models.CharField(max_length=40)
    version_date = models.DateField(blank=True, null=True)
    testing_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True, help_text="Inactive algorithms stay in DB for audit but are not offered for new flows.")
    created_at = models.DateTimeField(auto_now_add=True)

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
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="personalized_variants",
    )
    external_patient_key = models.CharField(max_length=80, db_index=True)
    tuning_params = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
        base = self.base_algorithm
        ac = base.algorithm_code if base else "?"
        return f"{ac} -> {self.external_patient_key}"


# -----------------------------------------------------------------------------
# BIO MARKER TO MEDICAL AREAS MAPPING
# -----------------------------------------------------------------------------


class BiomarkerMedicalAreaMapping(models.Model):
    """
    Example:
        biomarker=GLU_FAST, medical_area=DIAB, patient_category code ADULT_M
        normal_min=70, normal_max=99, normal_range_text="70-99 mg/dL"
    """

    biomarker = models.ForeignKey(
        Biomarker, on_delete=models.SET_NULL, null=True, blank=True, related_name="medical_area_maps"
    )
    medical_area = models.ForeignKey(
        MedicalArea, on_delete=models.SET_NULL, null=True, blank=True, related_name="biomarker_maps"
    )
    patient_category = models.ForeignKey(
        PatientCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="biomarker_norm_maps",
    )
    normal_min = models.FloatField(blank=True, null=True)
    normal_max = models.FloatField(blank=True, null=True)
    critical_min = models.FloatField(blank=True, null=True)
    critical_max = models.FloatField(blank=True, null=True)
    normal_range_text = models.CharField(max_length=120, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
        b = self.biomarker
        m = self.medical_area
        p = self.patient_category
        return (
            f"{b.biomarker_code if b else '?'} / "
            f"{m.medical_code if m else '?'} / "
            f"{p.code if p else '?'}"
        )


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

    device = models.ForeignKey(
        DeviceMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="biomarker_parameter_maps",
    )
    device_description = models.CharField(max_length=300, blank=True, null=True)
    biomarker = models.ForeignKey(
        Biomarker, on_delete=models.SET_NULL, null=True, blank=True, related_name="device_parameter_maps"
    )
    algorithm = models.ForeignKey(
        Algorithm, on_delete=models.SET_NULL, null=True, blank=True, related_name="device_parameter_maps"
    )
    version_code = models.CharField(max_length=40)
    is_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
        dev = self.device
        bio = self.biomarker
        return f"{dev.device_sub_code if dev else '?'} -> {bio.biomarker_code if bio else '?'}"


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

    biomarker = models.ForeignKey(
        Biomarker, on_delete=models.SET_NULL, null=True, blank=True, related_name="source_maps"
    )
    biomarker_title = models.CharField(max_length=300, blank=True, null=True)
    source = models.ForeignKey(
        DataSource, on_delete=models.SET_NULL, null=True, blank=True, related_name="biomarker_maps_primary"
    )
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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

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
        b = self.biomarker
        s = self.source
        return f"{b.biomarker_code if b else '?'} <- {s.source_code if s else '?'}"


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

    device = models.ForeignKey(
        DeviceMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="patient_maps",
    )
    patient = models.ForeignKey(
        "app.UserRegister",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="svasth_device_patient_mappings",
    )
    device_ble_id = models.CharField(max_length=64, blank=True, null=True, db_index=True)
    device_mapping_number = models.CharField(max_length=80, blank=True, null=True)
    mobile_sim_no = models.CharField(max_length=40, blank=True, null=True)
    mobile_imei_no = models.CharField(max_length=40, blank=True, null=True)
    device_wifi_id = models.CharField(max_length=80, blank=True, null=True)
    is_primary = models.BooleanField(default=True, help_text="Current active mapping for this patient-device pair.")
    notes = models.TextField(blank=True, null=True)
    mapped_at = models.DateTimeField(auto_now_add=True)
    unmapped_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-mapped_at"]
        verbose_name = "Device-patient mapping"
        verbose_name_plural = "Device-patient mappings"

    def __str__(self) -> str:
        dev = self.device
        return f"{dev.device_sub_code if dev else '?'} -> patient {self.patient_id}"


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

    device = models.ForeignKey(
        DeviceMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="algorithm_flows",
    )
    device_sub_id = models.CharField(max_length=80, blank=True, null=True)
    algorithm = models.ForeignKey(
        Algorithm, on_delete=models.SET_NULL, null=True, blank=True, related_name="device_flows"
    )
    personalised_algorithm = models.ForeignKey(
        PersonalizedAlgorithm,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="device_flows",
    )
    android_app_id = models.CharField(max_length=200, blank=True, null=True)
    version_control_no = models.CharField(max_length=80, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["device", "device_sub_id"]
        verbose_name = "Device algorithm flow"
        verbose_name_plural = "Device algorithm flows"

    def __str__(self) -> str:
        dev = self.device
        alg = self.algorithm
        return f"{dev.device_sub_code if dev else '?'} -> {alg.algorithm_code if alg else '?'}"


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

    PROCESSING_STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("PROCESSED", "Processed"),
        ("FAILED", "Failed"),
        ("SKIPPED", "Skipped"),
    ]

    device = models.ForeignKey(
        DeviceMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="raw_transfers",
    )
    patient = models.ForeignKey(
        "app.UserRegister",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="svasth_basic_data_transfers",
    )
    biomarker = models.ForeignKey(
        Biomarker,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="raw_transfers",
        help_text="When the uplink is already tied to a biomarker channel.",
    )
    data_source = models.ForeignKey(
        DataSource,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="raw_transfers",
    )
    source_type = models.CharField(
        max_length=40,
        help_text="Logical channel: UV, visible, IR, PPG, ECG, ACC, GAS, etc.",
    )
    reading_date = models.DateField()
    reading_time = models.TimeField()
    adc_values = models.JSONField()
    processing_status = models.CharField(
        max_length=20,
        choices=PROCESSING_STATUS_CHOICES,
        default="PENDING",
        db_index=True,
    )
    error_message = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-reading_date", "-reading_time"]
        indexes = [
            models.Index(fields=["device", "reading_date"]),
            models.Index(fields=["processing_status", "reading_date"]),
        ]
        verbose_name = "Basic data transfer"
        verbose_name_plural = "Basic data transfers"

    def __str__(self) -> str:
        return f"{self.reading_id} @ {self.reading_date}"


# -----------------------------------------------------------------------------
# PROCESSED BIOMARKER RESULT — downstream of raw transfer + algorithm
# -----------------------------------------------------------------------------


class ProcessedBiomarkerResult(models.Model):
    """
    Clinical/engineering result after applying an algorithm to raw (or fused) data.

    Example:
        value=105.2, unit="mg/dL", interpretation="HIGH",
        patient_id_external="PAT-88421", recorded_at=...
    """

    INTERPRETATION_CHOICES = [
        ("NORMAL", "Normal"),
        ("HIGH", "High"),
        ("LOW", "Low"),
        ("CRITICAL_HIGH", "Critical high"),
        ("CRITICAL_LOW", "Critical low"),
        ("UNKNOWN", "Unknown"),
    ]

    device = models.ForeignKey(
        DeviceMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="processed_results",
    )
    biomarker = models.ForeignKey(
        Biomarker, on_delete=models.SET_NULL, null=True, blank=True, related_name="processed_results"
    )
    patient_id_external = models.ForeignKey(
        "app.UserRegister",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="processed_results",
    )
    source_raw_reading = models.ForeignKey(
        BasicDataTransfer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="processed_results",
    )
    algorithm = models.ForeignKey(
        Algorithm,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="processed_results",
    )
    value = models.FloatField()
    unit = models.CharField(max_length=40, help_text="Snapshot of unit at computation time.")
    interpretation = models.CharField(max_length=20, choices=INTERPRETATION_CHOICES, default="UNKNOWN")
    recorded_at = models.DateTimeField(db_index=True)
    confidence = models.FloatField(blank=True, null=True, help_text="0.0–1.0 when the model exposes it.")
    extra = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]
        indexes = [
            models.Index(fields=["device", "biomarker", "recorded_at"]),
            models.Index(fields=["patient_id_external", "recorded_at"]),
        ]
        verbose_name = "Processed biomarker result"
        verbose_name_plural = "Processed biomarker results"

    def __str__(self) -> str:
        code = self.biomarker.biomarker_code if self.biomarker else "?"
        return f"{code}={self.value} {self.unit} @ {self.recorded_at}"


# -----------------------------------------------------------------------------
# LEGACY SVASTH NORMALIZED TABLES (from old models2.py cleanup)
# -----------------------------------------------------------------------------


class KioskMaster(models.Model):
    """
    Normalized replacement for legacy kiosk tables.
    Derived from: svasth_kiosk_master and kiosk fields in svasth_connect.
    """

    kiosk_code = models.CharField(max_length=50, unique=True, db_index=True)
    kiosk_name = models.CharField(max_length=120)
    location = models.CharField(max_length=255, blank=True, null=True)
    sim_no = models.CharField(max_length=40, blank=True, null=True)
    state_name = models.CharField(max_length=80, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["kiosk_code"]
        verbose_name = "Kiosk master"
        verbose_name_plural = "Kiosk masters"

    def __str__(self) -> str:
        return f"{self.kiosk_code} - {self.kiosk_name}"


class DeviceTelemetrySnapshot(models.Model):
    """
    Structured snapshot replacing wide legacy svasth_connect payload rows.
    Keep core vitals explicit and preserve uncommon payload in extra_payload.
    """

    device = models.ForeignKey(
        DeviceMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="telemetry_snapshots",
    )
    patient = models.ForeignKey(
        "app.UserRegister",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="svasth_telemetry_snapshots",
    )
    kiosk = models.ForeignKey(
        KioskMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="telemetry_snapshots",
    )

    temperature_c = models.FloatField(blank=True, null=True)
    heart_rate_bpm = models.FloatField(blank=True, null=True)
    spo2_percent = models.FloatField(blank=True, null=True)
    glucose_mg_dl = models.FloatField(blank=True, null=True)
    hb_g_dl = models.FloatField(blank=True, null=True)
    bp_systolic = models.FloatField(blank=True, null=True)
    bp_diastolic = models.FloatField(blank=True, null=True)
    weight_kg = models.FloatField(blank=True, null=True)
    height_cm = models.FloatField(blank=True, null=True)
    bmi = models.FloatField(blank=True, null=True)
    rr_rate = models.FloatField(blank=True, null=True)
    ecg_peak = models.FloatField(blank=True, null=True)
    ppg_peak = models.FloatField(blank=True, null=True)

    battery_level = models.CharField(max_length=40, blank=True, null=True)
    signal_status = models.CharField(max_length=40, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    extra_payload = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["device", "created_at"]),
            models.Index(fields=["patient", "created_at"]),
        ]
        verbose_name = "Device telemetry snapshot"
        verbose_name_plural = "Device telemetry snapshots"

    def __str__(self) -> str:
        dev = self.device
        label = f"{dev.device_sub_code or dev.pk}" if dev else "—"
        return f"snapshot #{self.pk} – {label}"


class ClinicalTrialObservation(models.Model):
    """
    Clean clinical trial capture model.
    Consolidates useful columns from svasth_clinical_trial / tbl_clinical_trial_data.
    """

    trial_code = models.CharField(max_length=50, db_index=True)
    participant_name = models.CharField(max_length=120)
    patient = models.ForeignKey(
        "app.UserRegister",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="svasth_clinical_trial_observations",
    )
    device = models.ForeignKey(
        DeviceMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="clinical_trial_observations",
    )
    kiosk = models.ForeignKey(
        KioskMaster,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="clinical_trial_observations",
    )
    non_invasive_glucose = models.FloatField(blank=True, null=True)
    lab_glucose = models.FloatField(blank=True, null=True)
    spo2_percent = models.FloatField(blank=True, null=True)
    heart_rate_bpm = models.FloatField(blank=True, null=True)
    temperature_c = models.FloatField(blank=True, null=True)
    adc_values = models.CharField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Clinical trial observation"
        verbose_name_plural = "Clinical trial observations"

    def __str__(self) -> str:
        return f"{self.trial_code} - {self.participant_name}"


class PatientDocument(models.Model):
    """
    Generic patient document/report upload store.
    Consolidates legacy upload/report tables into one normalized table.
    """

    DOC_TYPE_CHOICES = [
        ("REPORT", "Report"),
        ("SCAN", "Scan"),
        ("PRESCRIPTION", "Prescription"),
        ("OTHER", "Other"),
    ]

    patient = models.ForeignKey(
        "app.UserRegister",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="svasth_patient_documents",
    )
    document_type = models.CharField(max_length=20, choices=DOC_TYPE_CHOICES, default="OTHER")
    document_title = models.CharField(max_length=200, blank=True, null=True)
    file_path = models.FileField(upload_to='patient_documents/')
    uploaded_by = models.ForeignKey(
        "app.UserRegister",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="svasth_patient_documents_uploaded_by",
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["-uploaded_at"]
        verbose_name = "Patient document"
        verbose_name_plural = "Patient documents"

    def __str__(self) -> str:
        label = self.patient_id if self.patient_id is not None else self.pk
        return f"{label} - {self.document_type}"


class AlgorithmCalibration(models.Model):
    """
    Stores calibration/coefficient snapshots from legacy algorithm coefficient tables.
    """

    algorithm = models.ForeignKey(
        Algorithm,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="calibrations",
    )
    std_mean = models.FloatField(blank=True, null=True)
    std_dev = models.FloatField(blank=True, null=True)
    coefficient = models.FloatField(blank=True, null=True)
    variables_count = models.IntegerField(blank=True, null=True)
    source_tag = models.CharField(max_length=80, blank=True, null=True)
    uploaded_by = models.ForeignKey(
        "app.UserRegister",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="svasth_algorithm_calibrations",
    )
    effective_from = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Algorithm calibration"
        verbose_name_plural = "Algorithm calibrations"

    def __str__(self) -> str:
        alg = self.algorithm
        ac = alg.algorithm_code if alg else "?"
        return f"{ac} - calibration"
