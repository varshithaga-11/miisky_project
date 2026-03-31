"""
Miisky — SVASTH Website App Models
"""

from django.db import models
from django.utils.text import slugify


# ===========================================================================
# 1. COMPANY INFORMATION
# ===========================================================================

class CompanyInfo(models.Model):
    """
    Stores global company information shown in the header/footer.
    Single-row config table (use pk=1 always).
    """
    name = models.CharField(max_length=200, default="AARMS Value Chain Private Limited")
    tagline = models.CharField(max_length=300, blank=True, null=True)
    logo = models.ImageField(upload_to='website/company/', null=True, blank=True)
    favicon = models.ImageField(upload_to='website/company/favicons/', null=True, blank=True)

    # Contact
    phone_primary = models.CharField(max_length=20, default="+91 9845497950")
    phone_secondary = models.CharField(max_length=20, blank=True, null=True)
    email_support = models.CharField(max_length=200, default="support@miisky.com")
    email_general = models.CharField(max_length=200, default="g.jagan@aarmsvaluechain.com")
    whatsapp_number = models.CharField(max_length=20, default="+91 9845497950")

    # Address
    address_line1 = models.CharField(max_length=255, default="#211, Temple Street, 9th Main Road")
    address_line2 = models.CharField(max_length=255, default="BEML III Stage, Rajarajeswarinagar")
    city = models.CharField(max_length=100, default="Bengaluru")
    state = models.CharField(max_length=100, default="Karnataka")
    pincode = models.CharField(max_length=10, default="560098")
    country = models.CharField(max_length=100, default='India')
    google_maps_url = models.CharField(max_length=500, blank=True, null=True)
    google_maps_embed_url = models.CharField(max_length=1000, blank=True, null=True)

    # Social Media
    facebook_url = models.CharField(max_length=300, blank=True, null=True)
    twitter_url = models.CharField(max_length=300, blank=True, null=True)
    instagram_url = models.CharField(max_length=300, blank=True, null=True)
    linkedin_url = models.CharField(max_length=300, blank=True, null=True)
    youtube_url = models.CharField(max_length=300, blank=True, null=True)

    # SEO
    meta_title = models.CharField(max_length=200, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.TextField(blank=True, null=True)

    # Miscellaneous
    open_hours = models.CharField(max_length=200, default="Mon - Fri: 9:30am to 6:00pm, Sat: 9:30am to 2:30pm") # e.g. "Mon-Fri: 8:00am to 5:00pm"
    appointment_link = models.CharField(max_length=500, blank=True, null=True)

    # Stat Counters
    years_experience = models.PositiveIntegerField(default=30)
    doctors_count = models.CharField(max_length=50, default="180+")
    services_count = models.CharField(max_length=50, default="200+")
    satisfied_patients = models.CharField(max_length=50, default="10k+")

    # Mission & Vision (JSON format for bullet points)
    our_specialities = models.JSONField(blank=True, null=True)
    our_vision = models.JSONField(blank=True, null=True)
    mission_statement = models.TextField(blank=True, null=True)

    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Company Info"
        verbose_name_plural = "Company Info"


# ===========================================================================
# 2. HERO / BANNER SECTIONS
# ===========================================================================

class HeroBanner(models.Model):
    """
    Hero/banner slides shown at the top of a page.
    Supports multiple banners per page (ordered by position).
    """
    PAGE_CHOICES = [
        ('home', 'Home'),
        ('medical_devices', 'Medical Devices'),
        ('health_foods', 'Health Foods'),
        ('health_food_concept', 'Health Food Concept'),
        ('blog', 'Blog'),
        ('contact', 'Contact Us'),
        ('careers', 'Careers'),
        ('about', 'About Us'),
    ]

    page = models.CharField(max_length=100, default='home')
    title = models.CharField(max_length=300, blank=True, null=True)
    subtitle = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    background_image = models.ImageField(upload_to='website/banners/', null=True, blank=True)
    background_video_url = models.CharField(max_length=500, blank=True, null=True)
    background_color = models.CharField(max_length=20, blank=True, null=True)  # hex code

    cta_text = models.CharField(max_length=100, blank=True, null=True)   # Call to action button text
    cta_url = models.CharField(max_length=255, blank=True, null=True)    # URL or anchor
    cta_secondary_text = models.CharField(max_length=100, blank=True, null=True)
    cta_secondary_url = models.CharField(max_length=255, blank=True, null=True)

    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['page', 'position']

    def __str__(self):
        return f"{self.page} – Banner {self.position}: {self.title}"


# ===========================================================================
# 4. MEDICAL DEVICES
# ===========================================================================

class MedicalDeviceCategory(models.Model):
    """
    Groups devices by category: e.g., Wearables, Kiosks, Ventilators.
    """
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    icon = models.ImageField(upload_to='website/devices/categories/', null=True, blank=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']
        verbose_name = "Device Category"
        verbose_name_plural = "Device Categories"

    def __str__(self):
        return self.name


class MedicalDevice(models.Model):
    """
    Represents each Svasth medical device shown on the website.
    E.g.: Wearable CGM, Pulse Oximeter, Kiosk, BP & 12 Lead ECG,
          Ventilator, Viral Scanner & Temp, Viral Scanner & Breath Reader.
    """
    TECHNOLOGY_CHOICES = [
        ('nir', 'NIR (Near Infrared)'),
        ('ble', 'BLE (Bluetooth Low Energy)'),
        ('wifi', 'WiFi'),
        ('iot', 'IoT'),
        ('ai_ml', 'AI & ML'),
        ('other', 'Other'),
    ]

    category = models.ForeignKey(
        MedicalDeviceCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='devices'
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(max_length=300, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    long_description = models.TextField(blank=True, null=True) # For detail page overview

    # Technology
    primary_technology = models.CharField(max_length=100, blank=True, null=True)
    is_non_invasive = models.BooleanField(default=True)
    is_continuous_monitoring = models.BooleanField(default=False)
    connectivity = models.CharField(max_length=100, blank=True, null=True)
    # e.g. "BLE + WiFi"

    # Health parameters monitored
    parameters_monitored = models.JSONField(null=True, blank=True)
    # e.g. ["glucose", "spo2", "heart_rate", "hemoglobin"]

    # Diseases it detects (for Viral Scanner)
    viral_diseases_detected = models.JSONField(null=True, blank=True)
    # e.g. ["Influenza", "HPV", "Dengue", "Monkeypox", "H1N1", "H2N3"]

    bacterial_diseases_detected = models.JSONField(null=True, blank=True)
    # e.g. ["Malaria", "Typhoid", "Tuberculosis", "UTI", "Yellow Fever"]

    # Media
    image = models.ImageField(upload_to='website/devices/', null=True, blank=True)
    thumbnail = models.ImageField(upload_to='website/devices/thumbnails/', null=True, blank=True)
    video_url = models.URLField(blank=True, null=True)

    # Documents
    presentation_file = models.CharField(max_length=255, null=True, blank=True)
    brochure_file = models.CharField(max_length=255, null=True, blank=True)
    research_paper_file = models.CharField(max_length=255, null=True, blank=True)
    patent_document = models.CharField(max_length=255, null=True, blank=True)
    patent_number = models.CharField(max_length=100, blank=True, null=True)

    # Specifications
    device_weight = models.CharField(max_length=50, blank=True, null=True)
    device_dimensions = models.CharField(max_length=100, blank=True, null=True)
    battery_life = models.CharField(max_length=100, blank=True, null=True)
    operating_temperature = models.CharField(max_length=100, blank=True, null=True)

    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_available = models.BooleanField(default=True)

    # Display
    position = models.PositiveIntegerField(default=1)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.name


class DeviceFeature(models.Model):
    """
    Key features/bullet-points for a medical device.
    """
    device = models.ForeignKey(MedicalDevice, on_delete=models.CASCADE, related_name='features')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    position = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.device.name} – {self.title}"


class ResearchPaper(models.Model):
    """
    Research papers and patents linked to medical devices.
    """
    title = models.CharField(max_length=300)
    authors = models.CharField(max_length=500, blank=True, null=True)
    published_date = models.DateField(blank=True, null=True)
    journal_conference = models.CharField(max_length=300, blank=True, null=True)
    abstract = models.TextField(blank=True, null=True)
    document = models.FileField(upload_to='website/research_papers/', null=True, blank=True)
    external_url = models.CharField(max_length=500, blank=True, null=True)
    device = models.ForeignKey(
        MedicalDevice, on_delete=models.SET_NULL, null=True, blank=True, related_name='research_papers'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ===========================================================================
# 8. BLOG
# ===========================================================================

class BlogCategory(models.Model):
    """
    Categories for blog posts. E.g.: Food Blogs, Health Tips, Recipes.
    """
    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='website/blog/categories/', null=True, blank=True)
    icon = models.CharField(max_length=100, null=True, blank=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['position']
        verbose_name = "Blog Category"
        verbose_name_plural = "Blog Categories"

    def __str__(self):
        return self.name


class BlogTag(models.Model):
    """
    Tags for filtering/searching blog posts.
    """
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    """
    Blog posts (Food Blogs section).
    E.g.: "Sleep Like A Baby", "You Are What You Eat".
    """
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]

    category = models.ForeignKey(
        BlogCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts'
    )
    tags = models.ManyToManyField(BlogTag, blank=True)

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320, unique=True, blank=True)
    excerpt = models.TextField(blank=True, null=True)
    content = models.TextField()

    cover_image = models.CharField(max_length=255, null=True, blank=True)
    cover_image_alt = models.CharField(max_length=200, blank=True, null=True)
    image = models.ImageField(upload_to='website/blog_images/', null=True, blank=True)

    author_name = models.CharField(max_length=200, blank=True, null=True)
    author_designation = models.CharField(max_length=200, blank=True, null=True) # e.g. "Senior Nutritionist"
    author_image = models.ImageField(upload_to='website/authors/', null=True, blank=True)
    author_bio = models.TextField(blank=True, null=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    published_at = models.DateTimeField(null=True, blank=True)

    # SEO
    meta_title = models.CharField(max_length=200, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.TextField(blank=True, null=True)

    # Engagement
    views_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)

    is_featured = models.BooleanField(default=False)
    read_time = models.CharField(max_length=50, blank=True, null=True) # e.g. "5 min read"
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-published_at']

    def __str__(self):
        return self.title


class BlogComment(models.Model):
    """
    Comments on blog posts (with Name field as seen on live site).
    """
    blog_post = models.ForeignKey(BlogPost, on_delete=models.CASCADE, related_name='comments')
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    comment = models.TextField()
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment by {self.name} on {self.blog_post.title}"


# ===========================================================================
# 9. REPORTS
# ===========================================================================

class ReportType(models.Model):
    """
    Types of reports available for generation/download.
    E.g.: Health Report, Diet Plan Report, Food Intake Report.
    """
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    report_template = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    position = models.PositiveIntegerField(default=1)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.name


class WebsiteReport(models.Model):
    """
    Generated reports (linked to a user if logged in).
    Supports: Generate, View/Download, Forward.
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('generated', 'Generated'),
        ('failed', 'Failed'),
    ]

    report_type = models.ForeignKey(ReportType, on_delete=models.SET_NULL, null=True, blank=True)
    requested_by_name = models.CharField(max_length=200, blank=True, null=True)
    requested_by_email = models.EmailField(blank=True, null=True)
    requested_by_phone = models.CharField(max_length=20, blank=True, null=True)

    # Date range for the report
    date_from = models.DateField(null=True, blank=True)
    date_to = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    generated_file = models.CharField(max_length=255, null=True, blank=True)

    # Forward/share options
    forwarded_to_email = models.EmailField(blank=True, null=True)
    forwarded_at = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.report_type} – {self.requested_by_name} ({self.status})"
    


# ===========================================================================
# 13. TESTIMONIALS
# ===========================================================================

class Testimonial(models.Model):
    """
    Customer/user testimonials for the website.
    """
    TYPE_CHOICES = [
        ('patient', 'Patient'),
        ('nutritionist', 'Nutritionist'),
        ('micro_kitchen', 'Micro Kitchen Partner'),
        ('general', 'General'),
    ]

    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=200, blank=True, null=True)
    organization = models.CharField(max_length=200, blank=True, null=True)
    photo = models.ImageField(upload_to='website/testimonials/', null=True, blank=True)
    testimonial_text = models.TextField()
    rating = models.FloatField(default=5.0)
    testimonial_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='general')
    video_url = models.URLField(blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    position = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.name} – Testimonial"


# ===========================================================================
# 14. FAQs
# ===========================================================================

class FAQCategory(models.Model):
    """
    FAQ categories. E.g.: Medical Devices, Health Foods, Subscription, General.
    """
    name = models.CharField(max_length=150)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']
        verbose_name = "FAQ Category"
        verbose_name_plural = "FAQ Categories"

    def __str__(self):
        return self.name


class FAQ(models.Model):
    """
    Frequently asked questions.
    """
    category = models.ForeignKey(
        FAQCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='faqs'
    )
    question = models.TextField()
    answer = models.TextField()
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'position']

    def __str__(self):
        return self.question[:80]


# ===========================================================================
# 14.5. DEPARTMENTS
# ===========================================================================

class Department(models.Model):
    """
    Company departments used for organizing team members and job listings.
    E.g.: Leadership, Technology, Medical, Nutrition, Operations, Sales & Marketing, HR.
    """
    name = models.CharField(max_length=150, unique=True)
    short_description = models.CharField(max_length=300, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='website/departments/', null=True, blank=True)
    head_name = models.CharField(max_length=200, blank=True, null=True)
    head_email = models.CharField(max_length=150, blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
    icon_class = models.CharField(max_length=100, blank=True, null=True) # e.g. "icon-18"
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position']
        verbose_name = "Department"
        verbose_name_plural = "Departments"

    def __str__(self):
        return self.name


# ===========================================================================
# 15. TEAM MEMBERS
# ===========================================================================

class TeamMember(models.Model):
    """
    Company team members displayed on the About/Team page.
    """
    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=200)
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='team_members'
    )
    bio = models.TextField(blank=True, null=True)
    qualification = models.CharField(max_length=300, blank=True, null=True)
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    photo = models.ImageField(upload_to='team_photos/', null=True, blank=True)
    linkedin_url = models.CharField(max_length=300, blank=True, null=True)
    email = models.CharField(max_length=150, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
    is_doctor = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.name} – {self.designation}"


# ===========================================================================
# 16. CAREERS / JOB LISTINGS
# ===========================================================================

class JobListing(models.Model):
    """
    Job openings shown in the Careers section.
    """
    JOB_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('remote', 'Remote'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    department = models.ForeignKey(
        Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='job_listings'
    )
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
    location = models.CharField(max_length=200, blank=True, null=True)
    experience_required = models.CharField(max_length=100, blank=True, null=True)
    # e.g. "2-4 years"

    qualification_required = models.CharField(max_length=300, blank=True, null=True)
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    openings = models.PositiveIntegerField(default=1)

    short_description = models.CharField(max_length=300, blank=True, null=True)
    job_description = models.TextField()
    responsibilities = models.TextField(blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)
    benefits = models.TextField(blank=True, null=True)

    application_form_link = models.CharField(max_length=500, blank=True, null=True) # For external job portals
    application_deadline = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} – {self.department}"


class JobApplication(models.Model):
    """
    Job applications submitted through the Careers page.
    """
    STATUS_CHOICES = [
        ('new', 'New'),
        ('under_review', 'Under Review'),
        ('shortlisted', 'Shortlisted'),
        ('interview_scheduled', 'Interview Scheduled'),
        ('offered', 'Offered'),
        ('rejected', 'Rejected'),
        ('withdrawn', 'Withdrawn'),
    ]

    job = models.ForeignKey(JobListing, on_delete=models.CASCADE, related_name='applications')
    applicant_name = models.CharField(max_length=200)
    email = models.CharField(max_length=150)
    phone = models.CharField(max_length=20)
    resume = models.CharField(max_length=255, null=True, blank=True)
    cover_letter = models.TextField(blank=True, null=True)
    portfolio_url = models.CharField(max_length=500, blank=True, null=True)
    linkedin_url = models.CharField(max_length=500, blank=True, null=True)
    current_ctc = models.CharField(max_length=100, blank=True, null=True)
    expected_ctc = models.CharField(max_length=100, blank=True, null=True)
    notice_period = models.CharField(max_length=100, blank=True, null=True)
    years_of_experience = models.FloatField(null=True, blank=True)

    status = models.CharField(max_length=30, choices=STATUS_CHOICES, default='new')
    admin_notes = models.TextField(blank=True, null=True)

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.applicant_name} → {self.job.title}"


# ===========================================================================
# 17. GALLERY / MEDIA
# ===========================================================================

class GalleryCategory(models.Model):
    """
    Categories for the gallery section.
    E.g.: Medical Devices, Health Foods, Events, Office.
    """
    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True, blank=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['position']
        verbose_name = "Gallery Category"
        verbose_name_plural = "Gallery Categories"

    def __str__(self):
        return self.name


class GalleryItem(models.Model):
    """
    Individual media items (images or videos) in the gallery.
    """
    MEDIA_TYPE_CHOICES = [
        ('image', 'Image'),
        ('video', 'Video'),
    ]

    category = models.ForeignKey(
        GalleryCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='items'
    )
    title = models.CharField(max_length=300, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    media_type = models.CharField(max_length=10, choices=MEDIA_TYPE_CHOICES, default='image')
    image = models.ImageField(upload_to='gallery/', null=True, blank=True)
    video_url = models.URLField(blank=True, null=True)
    thumbnail = models.ImageField(upload_to='gallery/thumbnails/', null=True, blank=True)
    position = models.PositiveIntegerField(default=1)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'position']

    def __str__(self):
        return self.title or f"Gallery Item {self.pk}"


# ===========================================================================
# 18. PARTNERS / COLLABORATIONS
# ===========================================================================

class Partner(models.Model):
    """
    Partners and collaborators. E.g.: IISC Bangalore BEES LAB.
    """
    TYPE_CHOICES = [
        ('academic', 'Academic / Research'),
        ('technology', 'Technology'),
        ('healthcare', 'Healthcare'),
        ('supply_chain', 'Supply Chain'),
        ('government', 'Government'),
        ('investor', 'Investor'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=300)
    logo = models.ImageField(upload_to='website/partners/', null=True, blank=True)
    description = models.TextField(blank=True, null=True)
    website_url = models.CharField(max_length=500, blank=True, null=True)
    partner_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    collaboration_details = models.TextField(blank=True, null=True)
    since_year = models.PositiveIntegerField(null=True, blank=True)
    position = models.PositiveIntegerField(default=1)
    display_on_home = models.BooleanField(default=True)
    logo_alt_text = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.name


# ===========================================================================
# 19. ABOUT SECTION (DETAILED)
# ===========================================================================

class CompanyAboutSection(models.Model):
    """
    Detailed sections for the About Us page.
    """
    SECTION_CHOICES = [
        ('quality_statement', 'Quality Statement'),
        ('service_concept', 'Service Concept'),
        ('social_commitment', 'Social Commitment / CSR'),
        ('company_overview', 'Company Overview'),
        ('promoter_intro', 'Promoter Introduction'),
        ('milestone', 'Milestone / Achievement'),
        ('other', 'Other'),
    ]

    section_type = models.CharField(max_length=30, choices=SECTION_CHOICES)
    title = models.CharField(max_length=300)
    subtitle = models.CharField(max_length=300, blank=True, null=True)
    content = models.TextField()
    bullet_points = models.JSONField(blank=True, null=True)  # List of strings
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to='website/about/sections/', null=True, blank=True)
    
    # For Promoter/Entity specific info
    entity_name = models.CharField(max_length=300, blank=True, null=True)
    entity_description = models.TextField(blank=True, null=True)
    entity_website = models.CharField(max_length=500, blank=True, null=True)

    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position']
        verbose_name = "Company About Section"
        verbose_name_plural = "Company About Sections"

    def __str__(self):
        return f"{self.get_section_type_display()} – {self.title}"


# ===========================================================================
# 20. LEGAL PAGES
# ===========================================================================

class LegalPage(models.Model):
    """
    Legal content: Privacy Policy, Terms, etc.
    """
    PAGE_TYPE_CHOICES = [
        ('privacy_policy', 'Privacy Policy'),
        ('terms_of_service', 'Terms of Service'),
        ('cookie_policy', 'Cookie Policy'),
        ('disclaimer', 'Disclaimer'),
        ('refund_policy', 'Refund & Cancellation Policy'),
        ('other', 'Other'),
    ]

    page_type = models.CharField(max_length=30, choices=PAGE_TYPE_CHOICES, unique=True)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    content = models.TextField()
    
    version = models.CharField(max_length=20, blank=True, null=True)
    effective_date = models.DateField(blank=True, null=True)
    last_updated = models.DateField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Legal Page"
        verbose_name_plural = "Legal Pages"

    def __str__(self):
        return self.title


# ===========================================================================
# 21. PATENTS
# ===========================================================================

class Patent(models.Model):
    """
    Patents for Miisky technologies and inventions.
    """
    STATUS_CHOICES = [
        ('filed', 'Filed'),
        ('pending', 'Pending'),
        ('granted', 'Granted'),
        ('expired', 'Expired'),
        ('rejected', 'Rejected'),
    ]

    title = models.CharField(max_length=400)
    patent_number = models.CharField(max_length=100, blank=True, null=True)
    application_number = models.CharField(max_length=100, blank=True, null=True)
    inventors = models.CharField(max_length=500, blank=True, null=True)
    abstract = models.TextField(blank=True, null=True)
    
    filing_date = models.DateField(blank=True, null=True)
    grant_date = models.DateField(blank=True, null=True)
    expiry_date = models.DateField(blank=True, null=True)
    
    jurisdiction = models.CharField(max_length=100, blank=True, null=True)  # e.g. "India", "USA", "WIPO"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='filed')
    
    patent_document = models.FileField(upload_to='website/patents/', null=True, blank=True)
    external_link = models.CharField(max_length=500, blank=True, null=True)
    technology_area = models.CharField(max_length=200, blank=True, null=True)
    
    device = models.ForeignKey(MedicalDevice, on_delete=models.SET_NULL, null=True, blank=True, related_name='patents')

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-filing_date']

    def __str__(self):
        return self.title


# ===========================================================================
# 22. WORKFLOW STEPS
# ===========================================================================

class WorkflowStep(models.Model):
    """
    Steps for "How it Works" section on the home page.
    """
    title = models.CharField(max_length=200)
    description = models.TextField()
    image = models.ImageField(upload_to='website/workflow/', null=True, blank=True)
    icon_class = models.CharField(max_length=100, blank=True, null=True) # e.g. "icon-20"
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.title


# ===========================================================================
# 23. PRICING PLANS
# ===========================================================================

class PricingPlan(models.Model):
    """
    Subscription/Pricing plans for the website.
    """
    name = models.CharField(max_length=100) # e.g. Basic Plan, Silver Plan
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency_symbol = models.CharField(max_length=10, default="$")
    billing_period = models.CharField(max_length=50, default="monthly")
    savings_text = models.CharField(max_length=100, blank=True, null=True) # e.g. "Save 25%"
    icon_class = models.CharField(max_length=100, default="icon-20")
    
    features = models.JSONField(default=list) # List of feature strings
    
    is_popular = models.BooleanField(default=False)
    cta_text = models.CharField(max_length=100, default="Choose Plan +")
    cta_url = models.CharField(max_length=255, default="/website/pricing")
    
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.name


# ===========================================================================
# 24. WEBSITE INQUIRIES / APPOINTMENTS
# ===========================================================================

class WebsiteInquiry(models.Model):
    """
    Inquiries submitted via contact/appointment forms on the website.
    """
    INQUIRY_TYPE_CHOICES = [
        ('appointment', 'Appointment'),
        ('general_inquiry', 'General Inquiry'),
        ('product_info', 'Product Information'),
        ('partnership', 'Partnership'),
    ]

    STATUS_CHOICES = [
        ('new', 'New'),
        ('responded', 'Responded'),
        ('closed', 'Closed'),
        ('spam', 'Spam'),
    ]

    inquiry_type = models.CharField(max_length=30, choices=INQUIRY_TYPE_CHOICES, default='general_inquiry')
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    subject = models.CharField(max_length=300, blank=True, null=True)
    service_interested = models.CharField(max_length=200, blank=True, null=True)
    preferred_date = models.DateField(blank=True, null=True)
    
    message = models.TextField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    admin_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Website Inquiry"
        verbose_name_plural = "Website Inquiries"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.inquiry_type.capitalize()} – {self.name} ({self.status})"


# ===========================================================================
# 25. DYNAMIC STAT COUNTERS
# ===========================================================================

class StatCounter(models.Model):
    """
    Dynamic counters for the home page (e.g., 30+ Years, 180+ Doctors).
    """
    title = models.CharField(max_length=100)
    value = models.CharField(max_length=50) # e.g. "180", "100K", "30"
    suffix = models.CharField(max_length=20, blank=True, null=True) # e.g. "+", "%", "Years"
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.title}: {self.value}{self.suffix or ''}"


