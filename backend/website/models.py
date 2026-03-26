"""
Miisky — SVASTH Website App Models

Covers all sections of the live website at miisky.com:
  - Company Info & Contact
  - Navigation / Menu
  - Hero / Banner Sections
  - Medical Devices & NIR Technology
  - Health Foods & Product Catalog
  - Health Food Concept Articles
  - Workflow Steps
  - Blog / Food Blogs
  - Reports
  - Callback Requests
  - Testimonials & FAQs
  - Newsletter Subscribers
  - Team Members
  - Careers / Job Listings
  - Gallery / Media
  - Partners / Collaborations
  - AI Chatbot Configuration
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
    name = models.CharField(max_length=200, default="Miisky Technovation Private Limited")
    tagline = models.CharField(max_length=300, blank=True, null=True)
    logo = models.ImageField(upload_to='website/company/', null=True, blank=True)
    favicon = models.ImageField(upload_to='website/company/', null=True, blank=True)

    # Contact
    phone_primary = models.CharField(max_length=20, blank=True, null=True)
    phone_secondary = models.CharField(max_length=20, blank=True, null=True)
    email_support = models.EmailField(blank=True, null=True)
    email_general = models.EmailField(blank=True, null=True)
    whatsapp_number = models.CharField(max_length=20, blank=True, null=True)

    # Address
    address_line1 = models.CharField(max_length=255, blank=True, null=True)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    country = models.CharField(max_length=100, default='India')
    google_maps_url = models.URLField(blank=True, null=True)
    google_maps_embed_url = models.URLField(blank=True, null=True)

    # Social Media
    facebook_url = models.URLField(blank=True, null=True)
    twitter_url = models.URLField(blank=True, null=True)
    instagram_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    youtube_url = models.URLField(blank=True, null=True)

    # SEO
    meta_title = models.CharField(max_length=200, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)
    meta_keywords = models.TextField(blank=True, null=True)

    # Working Hours
    working_hours = models.CharField(max_length=200, blank=True, null=True)
    # e.g. "Mon–Sat: 9 AM – 6 PM"

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

    page = models.CharField(max_length=50, choices=PAGE_CHOICES, default='home')
    title = models.CharField(max_length=300, blank=True, null=True)
    subtitle = models.CharField(max_length=500, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    background_image = models.ImageField(upload_to='website/banners/', null=True, blank=True)
    background_video_url = models.URLField(blank=True, null=True)
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
# 3. NAVIGATION MENU
# ===========================================================================

class NavigationMenu(models.Model):
    """
    Manages the website navigation links.
    Supports top-level and dropdown sub-items via parent FK.
    """
    MENU_POSITION_CHOICES = [
        ('header', 'Header'),
        ('footer', 'Footer'),
        ('sidebar', 'Sidebar'),
    ]

    label = models.CharField(max_length=100)
    url = models.CharField(max_length=255, blank=True, null=True)
    parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children'
    )
    position = models.PositiveIntegerField(default=1)
    menu_placement = models.CharField(max_length=20, choices=MENU_POSITION_CHOICES, default='header')
    open_in_new_tab = models.BooleanField(default=False)
    icon_class = models.CharField(max_length=100, blank=True, null=True)  # e.g. Font Awesome class
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['menu_placement', 'position']

    def __str__(self):
        return f"[{self.menu_placement}] {self.label}"


# ===========================================================================
# 4. MEDICAL DEVICES
# ===========================================================================

class MedicalDeviceCategory(models.Model):
    """
    Groups devices by category: e.g., Wearables, Kiosks, Ventilators.
    """
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    icon = models.ImageField(upload_to='website/device_categories/', null=True, blank=True)
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

    # Technology
    primary_technology = models.CharField(max_length=20, choices=TECHNOLOGY_CHOICES, blank=True, null=True)
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
    presentation_file = models.FileField(upload_to='website/devices/presentations/', null=True, blank=True)
    brochure_file = models.FileField(upload_to='website/devices/brochures/', null=True, blank=True)
    research_paper_file = models.FileField(upload_to='website/devices/research/', null=True, blank=True)
    patent_document = models.FileField(upload_to='website/devices/patents/', null=True, blank=True)
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
    document = models.FileField(upload_to='website/research/', null=True, blank=True)
    external_url = models.URLField(blank=True, null=True)
    device = models.ForeignKey(
        MedicalDevice, on_delete=models.SET_NULL, null=True, blank=True, related_name='research_papers'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


# ===========================================================================
# 5. HEALTH FOOD PRODUCTS
# ===========================================================================

class HealthFoodCategory(models.Model):
    """
    Product categories for Svasth Health Foods.
    E.g.: Millet Products, Soups, Malts, Snacks.
    """
    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='website/food_categories/', null=True, blank=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['position']
        verbose_name = "Health Food Category"
        verbose_name_plural = "Health Food Categories"

    def __str__(self):
        return self.name


class HealthFoodProduct(models.Model):
    """
    Health food products listed on the Svasth Health Foods page.
    E.g.: Ragi Malt, Foxtail Millet Soup, etc.
    """
    DIET_TYPE_CHOICES = [
        ('veg', 'Vegetarian'),
        ('vegan', 'Vegan'),
        ('non_veg', 'Non-Vegetarian'),
        ('eggetarian', 'Eggetarian'),
    ]

    category = models.ForeignKey(
        HealthFoodCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='products'
    )

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    short_description = models.CharField(max_length=400, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    ingredients = models.TextField(blank=True, null=True)
    health_benefits = models.TextField(blank=True, null=True)
    usage_instructions = models.TextField(blank=True, null=True)
    storage_instructions = models.TextField(blank=True, null=True)

    diet_type = models.CharField(max_length=20, choices=DIET_TYPE_CHOICES, default='veg')
    is_organic = models.BooleanField(default=False)
    is_plastic_free = models.BooleanField(default=False)
    is_gluten_free = models.BooleanField(default=False)

    # Nutritional info (per serving)
    serving_size = models.CharField(max_length=100, blank=True, null=True)
    calories_per_serving = models.FloatField(null=True, blank=True)
    protein_g = models.FloatField(null=True, blank=True)
    carbs_g = models.FloatField(null=True, blank=True)
    fat_g = models.FloatField(null=True, blank=True)
    fiber_g = models.FloatField(null=True, blank=True)

    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    quantity_per_pack = models.CharField(max_length=100, blank=True, null=True)  # e.g. "500g"

    # Media
    image = models.ImageField(upload_to='website/health_foods/', null=True, blank=True)
    thumbnail = models.ImageField(upload_to='website/health_foods/thumbnails/', null=True, blank=True)
    additional_images = models.JSONField(null=True, blank=True)  # list of image paths

    # Health conditions it helps
    health_conditions_addressed = models.JSONField(null=True, blank=True)
    # e.g. ["diabetes", "pcod", "obesity", "thyroid"]

    # Certifications
    certifications = models.CharField(max_length=300, blank=True, null=True)
    fssai_no = models.CharField(max_length=20, blank=True, null=True)

    # Display
    position = models.PositiveIntegerField(default=1)
    is_featured = models.BooleanField(default=False)
    is_available = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['category', 'position']

    def __str__(self):
        return self.name


# ===========================================================================
# 6. HEALTH FOOD CONCEPT (Articles / Educational Content)
# ===========================================================================

class HealthFoodConceptCategory(models.Model):
    """
    Category for health concept articles.
    E.g.: Lifestyle Diseases, Nutritional Deficiencies, Gut Health.
    """
    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    icon = models.ImageField(upload_to='website/concept_categories/', null=True, blank=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.name


class HealthFoodConceptArticle(models.Model):
    """
    Health & wellness articles in the "Health Food Concept" section.
    Topics include: Food is Medicine, Diabetes, PCOD, Obesity, Sleep, etc.
    """
    category = models.ForeignKey(
        HealthFoodConceptCategory, on_delete=models.SET_NULL, null=True, blank=True, related_name='articles'
    )

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320, unique=True, blank=True)
    excerpt = models.TextField(blank=True, null=True)
    content = models.TextField(blank=True, null=True)

    cover_image = models.ImageField(upload_to='website/concept_articles/', null=True, blank=True)
    pdf_document = models.FileField(upload_to='website/concept_articles/pdfs/', null=True, blank=True)
    external_read_more_url = models.URLField(blank=True, null=True)

    author_name = models.CharField(max_length=200, blank=True, null=True)
    author_designation = models.CharField(max_length=200, blank=True, null=True)
    author_image = models.ImageField(upload_to='website/authors/', null=True, blank=True)

    # Health tags
    health_tags = models.JSONField(null=True, blank=True)
    # e.g. ["diabetes", "food_as_medicine", "obesity", "pcod"]

    # SEO
    meta_title = models.CharField(max_length=200, blank=True, null=True)
    meta_description = models.TextField(blank=True, null=True)

    position = models.PositiveIntegerField(default=1)
    is_featured = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    published_at = models.DateTimeField(null=True, blank=True)
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


# ===========================================================================
# 7. WORKFLOW
# ===========================================================================

class WorkflowSection(models.Model):
    """
    Top-level workflow sections shown in the Workflow dropdown.
    E.g.: My Health, Nutritionist, Micro Kitchen, Supply Chain, Health Cooks, Support, Suggestions.
    """
    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True, blank=True)
    subtitle = models.CharField(max_length=300, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    icon = models.ImageField(upload_to='website/workflow/', null=True, blank=True)
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.name


class WorkflowStep(models.Model):
    """
    Individual steps within a workflow section.
    Full flow: Consumer → Subscription → App → Kitchen → Logistics → Consumer.
    """
    section = models.ForeignKey(
        WorkflowSection, on_delete=models.CASCADE, related_name='steps'
    )

    step_number = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    icon = models.ImageField(upload_to='website/workflow/steps/', null=True, blank=True)
    icon_class = models.CharField(max_length=100, blank=True, null=True)

    # Actor (who performs this step)
    ACTOR_CHOICES = [
        ('consumer', 'Consumer'),
        ('nutritionist', 'Nutritionist'),
        ('micro_kitchen', 'Micro Kitchen'),
        ('supply_chain', 'Supply Chain'),
        ('health_cook', 'Health Cook'),
        ('admin', 'Admin'),
        ('system', 'System'),
    ]
    actor = models.CharField(max_length=30, choices=ACTOR_CHOICES, blank=True, null=True)

    image = models.ImageField(upload_to='website/workflow/steps/', null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['section', 'step_number']
        unique_together = ['section', 'step_number']

    def __str__(self):
        return f"{self.section.name} – Step {self.step_number}: {self.title}"


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
    image = models.ImageField(upload_to='website/blog_categories/', null=True, blank=True)
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

    cover_image = models.ImageField(upload_to='website/blog/', null=True, blank=True)
    cover_image_alt = models.CharField(max_length=200, blank=True, null=True)

    author_name = models.CharField(max_length=200, blank=True, null=True)
    author_image = models.ImageField(upload_to='website/blog/authors/', null=True, blank=True)
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
    report_template = models.FileField(upload_to='website/report_templates/', null=True, blank=True)
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
    generated_file = models.FileField(upload_to='website/generated_reports/', null=True, blank=True)

    # Forward/share options
    forwarded_to_email = models.EmailField(blank=True, null=True)
    forwarded_at = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.report_type} – {self.requested_by_name} ({self.status})"


# ===========================================================================
# 10. CALLBACK REQUESTS
# ===========================================================================

class CallbackRequest(models.Model):
    """
    "Request for Callback" form submissions.
    Seen in the teal banner section across multiple pages.
    """
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('resolved', 'Resolved'),
        ('not_reachable', 'Not Reachable'),
    ]

    email = models.EmailField()
    phone = models.CharField(max_length=20)
    name = models.CharField(max_length=200, blank=True, null=True)

    # Extended Contact Form (Contact Us page has date/time slot)
    description = models.TextField(blank=True, null=True)
    preferred_date = models.DateField(null=True, blank=True)
    preferred_time = models.TimeField(null=True, blank=True)

    # Source page
    source_page = models.CharField(max_length=100, blank=True, null=True)
    # e.g. "home", "medical_devices", "health_foods"

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    admin_notes = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Callback: {self.name or self.email} – {self.phone}"


# ===========================================================================
# 11. CONTACT US FORM SUBMISSIONS
# ===========================================================================

class ContactInquiry(models.Model):
    """
    General contact form submissions from the Contact Us page.
    """
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('spam', 'Spam'),
    ]

    INQUIRY_TYPE_CHOICES = [
        ('general', 'General'),
        ('medical_device', 'Medical Device'),
        ('health_food', 'Health Food'),
        ('career', 'Career'),
        ('partnership', 'Partnership'),
        ('support', 'Support'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    inquiry_type = models.CharField(max_length=30, choices=INQUIRY_TYPE_CHOICES, default='general')
    subject = models.CharField(max_length=300, blank=True, null=True)
    message = models.TextField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    admin_reply = models.TextField(blank=True, null=True)
    replied_at = models.DateTimeField(null=True, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Contact Inquiry"
        verbose_name_plural = "Contact Inquiries"

    def __str__(self):
        return f"{self.name} – {self.subject or self.inquiry_type}"


# ===========================================================================
# 12. NEWSLETTER SUBSCRIBERS
# ===========================================================================

class NewsletterSubscriber(models.Model):
    """
    Email subscribers for the Miisky newsletter.
    """
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    unsubscribed_at = models.DateTimeField(null=True, blank=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email


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
# 15. TEAM MEMBERS
# ===========================================================================

class TeamMember(models.Model):
    """
    Company team members displayed on the About/Team page.
    """
    DEPARTMENT_CHOICES = [
        ('leadership', 'Leadership'),
        ('technology', 'Technology'),
        ('medical', 'Medical Advisory'),
        ('nutrition', 'Nutrition'),
        ('operations', 'Operations'),
        ('sales', 'Sales & Marketing'),
        ('hr', 'Human Resources'),
    ]

    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=200)
    department = models.CharField(max_length=30, choices=DEPARTMENT_CHOICES, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    qualification = models.CharField(max_length=300, blank=True, null=True)
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    photo = models.ImageField(upload_to='website/team/', null=True, blank=True)
    linkedin_url = models.URLField(blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
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
    Departments: Accounts, Logistics, IT Department.
    """
    DEPARTMENT_CHOICES = [
        ('accounts', 'Accounts'),
        ('logistics', 'Logistics'),
        ('it', 'IT Department'),
        ('operations', 'Operations'),
        ('medical', 'Medical'),
        ('nutrition', 'Nutrition'),
        ('sales', 'Sales & Marketing'),
        ('hr', 'Human Resources'),
        ('other', 'Other'),
    ]

    JOB_TYPE_CHOICES = [
        ('full_time', 'Full Time'),
        ('part_time', 'Part Time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
        ('remote', 'Remote'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    department = models.CharField(max_length=30, choices=DEPARTMENT_CHOICES)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='full_time')
    location = models.CharField(max_length=200, blank=True, null=True)
    experience_required = models.CharField(max_length=100, blank=True, null=True)
    # e.g. "2-4 years"

    qualification_required = models.CharField(max_length=300, blank=True, null=True)
    salary_range = models.CharField(max_length=100, blank=True, null=True)
    openings = models.PositiveIntegerField(default=1)

    job_description = models.TextField()
    responsibilities = models.TextField(blank=True, null=True)
    requirements = models.TextField(blank=True, null=True)
    benefits = models.TextField(blank=True, null=True)

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
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    resume = models.FileField(upload_to='website/careers/resumes/')
    cover_letter = models.TextField(blank=True, null=True)
    portfolio_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
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
    image = models.ImageField(upload_to='website/gallery/', null=True, blank=True)
    video_url = models.URLField(blank=True, null=True)
    thumbnail = models.ImageField(upload_to='website/gallery/thumbnails/', null=True, blank=True)
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
    website_url = models.URLField(blank=True, null=True)
    partner_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    collaboration_details = models.TextField(blank=True, null=True)
    since_year = models.PositiveIntegerField(null=True, blank=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.name


# ===========================================================================
# 19. VISION / MISSION / VALUES
# ===========================================================================

class VisionMission(models.Model):
    """
    Company Vision, Mission, and Core Values for the About/Home section.
    """
    TYPE_CHOICES = [
        ('vision', 'Vision'),
        ('mission', 'Mission'),
        ('value', 'Core Value'),
        ('goal', 'Goal'),
    ]

    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    title = models.CharField(max_length=200, blank=True, null=True)
    content = models.TextField()
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    icon_image = models.ImageField(upload_to='website/about/', null=True, blank=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['type', 'position']

    def __str__(self):
        return f"{self.type.upper()}: {self.title or self.content[:60]}"


# ===========================================================================
# 20. AI CHATBOT CONFIGURATION
# ===========================================================================

class AIChatbotConfig(models.Model):
    """
    Configuration for the AI Chatbot (placeholder section seen on the website).
    """
    is_enabled = models.BooleanField(default=False)
    welcome_message = models.TextField(blank=True, null=True)
    fallback_message = models.TextField(blank=True, null=True)
    chatbot_name = models.CharField(max_length=100, default='Svasth AI Assistant')
    chatbot_avatar = models.ImageField(upload_to='website/chatbot/', null=True, blank=True)
    primary_color = models.CharField(max_length=20, blank=True, null=True)
    api_endpoint = models.URLField(blank=True, null=True)
    api_key_hint = models.CharField(max_length=100, blank=True, null=True)  # masked reference
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "AI Chatbot Config"
        verbose_name_plural = "AI Chatbot Config"

    def __str__(self):
        return f"Chatbot Config (enabled={self.is_enabled})"


# ===========================================================================
# 21. STATISTICS / KEY NUMBERS (Home page counters)
# ===========================================================================

class StatCounter(models.Model):
    """
    Key statistics displayed on the home page.
    E.g.: 500+ Patients, 50+ Nutritionists, 100+ Kitchens.
    """
    label = models.CharField(max_length=200)
    value = models.CharField(max_length=50)  # e.g. "500+", "50+", "100+"
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    icon_image = models.ImageField(upload_to='website/stats/', null=True, blank=True)
    description = models.CharField(max_length=300, blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.value} {self.label}"


# ===========================================================================
# 22. MOBILE APP INFORMATION
# ===========================================================================

class MobileAppInfo(models.Model):
    """
    Mobile app download information (Svasth App section on Health Foods page).
    """
    PLATFORM_CHOICES = [
        ('android', 'Android'),
        ('ios', 'iOS'),
        ('both', 'Both'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    platform = models.CharField(max_length=10, choices=PLATFORM_CHOICES, default='both')
    app_version = models.CharField(max_length=20, blank=True, null=True)
    playstore_url = models.URLField(blank=True, null=True)
    appstore_url = models.URLField(blank=True, null=True)
    app_screenshot = models.ImageField(upload_to='website/app/', null=True, blank=True)
    app_icon = models.ImageField(upload_to='website/app/', null=True, blank=True)
    qr_code = models.ImageField(upload_to='website/app/', null=True, blank=True)
    download_count = models.PositiveIntegerField(default=0)
    rating = models.FloatField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Mobile App Info"
        verbose_name_plural = "Mobile App Info"

    def __str__(self):
        return f"{self.title} ({self.platform})"


# ===========================================================================
# 23. VALUE PROPOSITION (Health Foods page)
# ===========================================================================

class ValueProposition(models.Model):
    """
    Value proposition bullet points shown on the Health Foods page.
    E.g.: "Use of Organic & Contamination free ingredients",
           "Plastic free Packaging", "Zero Plastic, Ingredients sourced from certified farms".
    """
    title = models.CharField(max_length=300)
    description = models.TextField(blank=True, null=True)
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    icon_image = models.ImageField(upload_to='website/value_props/', null=True, blank=True)
    page = models.CharField(max_length=50, blank=True, null=True)  # which page this belongs to
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.title


# ===========================================================================
# 24. PRODUCTS (Corporate nav → Aaum Connect, Miisky Login, Svasth)
# ===========================================================================

class Product(models.Model):
    """
    Company products listed in the 'Products' corporate nav dropdown.
    E.g.: Aaum Connect, Miisky Registration/Login, Svasth.
    """
    PRODUCT_TYPE_CHOICES = [
        ('platform', 'Platform / Portal'),
        ('hardware', 'Hardware Device'),
        ('software', 'Software / App'),
        ('service', 'Service'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    tagline = models.CharField(max_length=300, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    product_type = models.CharField(max_length=20, choices=PRODUCT_TYPE_CHOICES, default='platform')

    logo = models.ImageField(upload_to='website/products/', null=True, blank=True)
    banner_image = models.ImageField(upload_to='website/products/banners/', null=True, blank=True)
    screenshot = models.ImageField(upload_to='website/products/screenshots/', null=True, blank=True)

    # Links
    product_url = models.URLField(blank=True, null=True)       # e.g. Svasth dashboard URL
    login_url = models.URLField(blank=True, null=True)
    register_url = models.URLField(blank=True, null=True)
    trial_url = models.URLField(blank=True, null=True)         # Svasth Trial link
    playstore_url = models.URLField(blank=True, null=True)
    appstore_url = models.URLField(blank=True, null=True)

    # Sub-links (e.g., Svasth → Dashboard, Login, Trail)
    sub_links = models.JSONField(null=True, blank=True)
    # e.g. [{"label": "Svasth Dashboard", "url": "/SVASTH_DashboardPage.php"}, ...]

    key_features = models.TextField(blank=True, null=True)
    target_audience = models.CharField(max_length=300, blank=True, null=True)

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


# ===========================================================================
# 25. SERVICES (Corporate nav → BID2SKY, SCM BIZCONNECT, SCM Junction, AARMS)
# ===========================================================================

class Service(models.Model):
    """
    Company services listed in the 'Services' corporate nav dropdown.
    E.g.: BID2SKY, SCM BIZCONNECT, SCM Junction, AARMS Value Solutions.
    """
    SERVICE_TYPE_CHOICES = [
        ('b2b', 'B2B Platform'),
        ('scm', 'Supply Chain Management'),
        ('gst', 'GST / Tax Compliance'),
        ('analytics', 'Analytics & Reporting'),
        ('logistics', 'Logistics'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    tagline = models.CharField(max_length=300, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES, default='other')

    logo = models.ImageField(upload_to='website/services/', null=True, blank=True)
    banner_image = models.ImageField(upload_to='website/services/banners/', null=True, blank=True)

    # Key features bullet points
    features = models.JSONField(null=True, blank=True)
    # e.g. ["End-to-end SCM", "Real-time tracking", "Analytics dashboard"]

    service_url = models.URLField(blank=True, null=True)
    brochure_file = models.FileField(upload_to='website/services/brochures/', null=True, blank=True)

    target_industries = models.CharField(max_length=300, blank=True, null=True)
    # e.g. "FMCG, Pharmaceuticals, Retail"

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


# ===========================================================================
# 26. GST PAGE (miisky.com/gst.php — Miisky as a GSP/GST Suvidha Provider)
# ===========================================================================

class GSTInfo(models.Model):
    """
    Information about Miisky (Aarms Value Chain) as a GSTN-approved GSP.
    Single-row config table — Miisky is recognized as a GST Suvidha Provider.
    """
    company_name = models.CharField(max_length=300, default='Aarms Value Chain')
    gstin = models.CharField(max_length=20, blank=True, null=True)
    gsp_registration_number = models.CharField(max_length=100, blank=True, null=True)
    gstn_recognition_date = models.DateField(null=True, blank=True)

    # Page content
    hero_title = models.CharField(max_length=300, blank=True, null=True)
    hero_subtitle = models.CharField(max_length=500, blank=True, null=True)
    hero_description = models.TextField(blank=True, null=True)

    # About the GSP model
    gsp_model_title = models.CharField(max_length=200, blank=True, null=True)
    # e.g. "Open Software Enabler"
    gsp_model_description = models.TextField(blank=True, null=True)

    # End-to-end solutions
    solutions_title = models.CharField(max_length=200, blank=True, null=True)
    # e.g. "End to End Solutions"
    solutions_description = models.TextField(blank=True, null=True)

    # Features (JSON list)
    gst_features = models.JSONField(null=True, blank=True)
    # e.g. ["GST Return Filing", "E-Invoice", "E-Way Bill", "Reconciliation"]

    # Integration capabilities
    integration_types = models.JSONField(null=True, blank=True)
    # e.g. ["ERP Integration", "Tally", "SAP", "Custom APIs"]

    # Compliance info
    compliance_statements = models.TextField(blank=True, null=True)

    # Media
    page_banner = models.ImageField(upload_to='website/gst/', null=True, blank=True)
    gstn_certificate = models.FileField(upload_to='website/gst/certificates/', null=True, blank=True)

    # Contact for GST queries
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "GST Info"
        verbose_name_plural = "GST Info"

    def __str__(self):
        return f"GST Info – {self.company_name}"


# ===========================================================================
# 27. PRESENTATIONS (Corporate nav → Downloadable PDFs: MIISKY, GST, SVASTH)
# ===========================================================================

class Presentation(models.Model):
    """
    Downloadable presentations/PDFs linked from the 'Presentation' nav dropdown.
    Types: Company Presentation, GST Presentation, SVASTH Presentation.
    """
    PRESENTATION_TYPE_CHOICES = [
        ('miisky', 'Miisky Corporate'),
        ('gst', 'GST / GSP'),
        ('svasth', 'SVASTH Health'),
        ('health_food_concept', 'Health Food Concept'),
        ('medical_device', 'Medical Device'),
        ('investor', 'Investor Deck'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=300)
    slug = models.SlugField(max_length=320, unique=True, blank=True)
    presentation_type = models.CharField(
        max_length=30, choices=PRESENTATION_TYPE_CHOICES, default='miisky'
    )
    description = models.TextField(blank=True, null=True)
    thumbnail = models.ImageField(upload_to='website/presentations/thumbnails/', null=True, blank=True)

    # File (PDF, PPTX, etc.)
    file = models.FileField(upload_to='website/presentations/', null=True, blank=True)
    external_file_url = models.URLField(blank=True, null=True)  # for Google Drive / external links

    file_size_mb = models.FloatField(null=True, blank=True)
    file_format = models.CharField(max_length=10, blank=True, null=True)
    # e.g. "PDF", "PPTX"

    version = models.CharField(max_length=20, blank=True, null=True)
    # e.g. "v2.1", "2024 Edition"

    published_date = models.DateField(null=True, blank=True)
    download_count = models.PositiveIntegerField(default=0)

    # Access control
    requires_login = models.BooleanField(default=False)
    requires_email_capture = models.BooleanField(default=False)
    # If True, show email form before download

    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.title} ({self.presentation_type})"


class PresentationDownloadLog(models.Model):
    """
    Logs each presentation download with email capture if required.
    """
    presentation = models.ForeignKey(
        Presentation, on_delete=models.CASCADE, related_name='download_logs'
    )
    downloader_name = models.CharField(max_length=200, blank=True, null=True)
    downloader_email = models.EmailField(blank=True, null=True)
    downloader_company = models.CharField(max_length=200, blank=True, null=True)
    downloader_phone = models.CharField(max_length=20, blank=True, null=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    downloaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-downloaded_at']

    def __str__(self):
        return f"{self.downloader_email or 'Anonymous'} → {self.presentation.title}"


# ===========================================================================
# 28. WORKFLOW SUB-CATEGORIES (SVASTH nav dropdown full structure)
# ===========================================================================
# The SVASTH Workflow dropdown has 8 sub-sections, each representing a
# different portal/actor in the food-as-medicine ecosystem.
# We model each as a WorkflowSubCategory linked to the parent WorkflowSection.

class WorkflowSubCategory(models.Model):
    """
    Detailed sub-categories within each Workflow section.
    Maps to the nested SVASTH nav: Workflow → My Health → [sub-items]
    """
    PORTAL_TYPE_CHOICES = [
        ('my_health', 'My Health (Patient Portal)'),
        ('nutritionist', 'Nutritionist Portal'),
        ('micro_kitchen', 'Micro Kitchen Portal'),
        ('supply_chain', 'Supply Chain Portal'),
        ('health_cook', 'Health Cook Portal'),
        ('support', 'Support Portal'),
        ('ai_chat', 'AI Chat Assistant'),
        ('suggestions', 'Suggestions & Feedback'),
    ]

    section = models.ForeignKey(
        WorkflowSection, on_delete=models.CASCADE,
        null=True, blank=True, related_name='sub_categories'
    )
    portal_type = models.CharField(max_length=30, choices=PORTAL_TYPE_CHOICES)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    subtitle = models.CharField(max_length=300, blank=True, null=True)

    icon = models.ImageField(upload_to='website/workflow/subcategories/', null=True, blank=True)
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    banner_image = models.ImageField(upload_to='website/workflow/subcategories/', null=True, blank=True)

    # Portal URL (deep link to the SVASTH app section)
    portal_url = models.CharField(max_length=255, blank=True, null=True)

    # Features this sub-category offers (JSON list)
    features = models.JSONField(null=True, blank=True)
    # e.g. ["View health reports", "Track food intake", "Book nutritionist"]

    # Who uses this (actor)
    ACTOR_CHOICES = [
        ('patient', 'Patient / Consumer'),
        ('nutritionist', 'Nutritionist'),
        ('micro_kitchen_owner', 'Micro Kitchen Owner'),
        ('delivery_partner', 'Delivery / Logistics Partner'),
        ('health_cook', 'Health Cook'),
        ('admin', 'Admin / Support'),
        ('ai', 'AI System'),
        ('all', 'All Users'),
    ]
    primary_actor = models.CharField(max_length=30, choices=ACTOR_CHOICES, blank=True, null=True)

    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['position']
        verbose_name = "Workflow Sub Category"
        verbose_name_plural = "Workflow Sub Categories"

    def __str__(self):
        return f"{self.portal_type} – {self.name}"


# ===========================================================================
# 29. MY HEALTH PORTAL (Patient-facing, under Workflow → My Health)
# ===========================================================================

class MyHealthFeature(models.Model):
    """
    Features available inside the 'My Health' patient portal section.
    E.g.: View Health Reports, Track Food Intake, Book Nutritionist, etc.
    """
    FEATURE_TYPE_CHOICES = [
        ('health_tracking', 'Health Parameter Tracking'),
        ('food_tracking', 'Food & Diet Tracking'),
        ('appointment', 'Appointment Booking'),
        ('reports', 'Health Reports'),
        ('subscription', 'Subscription Management'),
        ('notifications', 'Alerts & Notifications'),
        ('chat', 'Chat with Nutritionist'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    feature_type = models.CharField(max_length=30, choices=FEATURE_TYPE_CHOICES, default='other')
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    icon_image = models.ImageField(upload_to='website/my_health/', null=True, blank=True)
    screenshot = models.ImageField(upload_to='website/my_health/screenshots/', null=True, blank=True)
    portal_deep_link = models.CharField(max_length=255, blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.title


# ===========================================================================
# 30. NUTRITIONIST PORTAL (Under Workflow → Nutritionist)
# ===========================================================================

class NutritionistPortalFeature(models.Model):
    """
    Features available inside the Nutritionist Portal section.
    E.g.: Manage Patient Diet Plans, View Health Parameters, Schedule Sessions.
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    icon_image = models.ImageField(upload_to='website/nutritionist_portal/', null=True, blank=True)
    portal_deep_link = models.CharField(max_length=255, blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.title


# ===========================================================================
# 31. MICRO KITCHEN PORTAL (Under Workflow → Micro Kitchen)
# ===========================================================================

class MicroKitchenPortalFeature(models.Model):
    """
    Features for the Micro Kitchen partner portal.
    E.g.: Receive Orders, Manage Production, Track Deliveries, Revenue Dashboard.
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    icon_image = models.ImageField(upload_to='website/micro_kitchen_portal/', null=True, blank=True)
    portal_deep_link = models.CharField(max_length=255, blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.title


# ===========================================================================
# 32. SUPPLY CHAIN PORTAL (Under Workflow → Supply Chain)
# ===========================================================================

class SupplyChainPortalFeature(models.Model):
    """
    Features for the Supply Chain / Logistics portal.
    E.g.: Delivery Schedule, Route Optimization, Inventory Management.
    """
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    icon_image = models.ImageField(upload_to='website/supply_chain_portal/', null=True, blank=True)
    portal_deep_link = models.CharField(max_length=255, blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.title


# ===========================================================================
# 33. AI CHAT CONFIGURATION (Under Workflow → AI Chat)
# ===========================================================================
# Note: General AIChatbotConfig already exists in model #20.
# This model stores conversation logs / AI chat history from the SVASTH portal.

class AIChatSession(models.Model):
    """
    Logs AI Chat sessions from the Workflow → AI Chat section of SVASTH.
    """
    session_id = models.CharField(max_length=100, unique=True)
    user_identifier = models.CharField(max_length=200, blank=True, null=True)
    # could be email, phone, or anonymous ID

    messages = models.JSONField(default=list)
    # e.g. [{"role": "user", "content": "..."}, {"role": "ai", "content": "..."}]

    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    is_resolved = models.BooleanField(default=False)
    escalated_to_human = models.BooleanField(default=False)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"AI Chat Session {self.session_id}"


# ===========================================================================
# 34. SUGGESTIONS (Under Workflow → Suggestions)
# ===========================================================================

class UserSuggestion(models.Model):
    """
    User suggestions and feedback submitted from the Workflow → Suggestions section.
    """
    STATUS_CHOICES = [
        ('new', 'New'),
        ('under_review', 'Under Review'),
        ('implemented', 'Implemented'),
        ('declined', 'Declined'),
    ]

    CATEGORY_CHOICES = [
        ('feature_request', 'Feature Request'),
        ('bug_report', 'Bug Report'),
        ('food_feedback', 'Food / Nutrition Feedback'),
        ('device_feedback', 'Device Feedback'),
        ('general', 'General'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=200, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='general')
    subject = models.CharField(max_length=300, blank=True, null=True)
    suggestion = models.TextField()
    attachment = models.FileField(upload_to='website/suggestions/', null=True, blank=True)
    rating = models.PositiveIntegerField(null=True, blank=True)
    # Optional star rating 1-5

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    admin_response = models.TextField(blank=True, null=True)
    responded_at = models.DateTimeField(null=True, blank=True)

    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.category} – {self.subject or self.suggestion[:60]}"


# ===========================================================================
# 35. WORKFLOW SUB-ITEMS (3rd-level nav under each WorkflowSubCategory)
# ===========================================================================
# The SVASTH Workflow has a 3-level structure:
#   Workflow (top) → My Health (sub-category) → My Health Status, My Doctor, My Dietitian (sub-items)
#   Workflow → Nutritionist → Doctor, Dietitian
#   Workflow → Micro Kitchen → Kitchen Admin, Cook
#   Workflow → Supply Chain → Delivery Boy, Feedback

class WorkflowSubItem(models.Model):
    """
    Third-level navigation items under each WorkflowSubCategory.
    Examples:
      My Health → My Health Status, My Doctor, My Dietitian
      Nutritionist → Doctor, Dietitian
      Micro Kitchen → Kitchen Admin, Cook
      Supply Chain → Delivery Boy, Feedback
    """
    sub_category = models.ForeignKey(
        WorkflowSubCategory, on_delete=models.CASCADE, related_name='sub_items'
    )
    label = models.CharField(max_length=200)
    # e.g. "My Health Status", "My Doctor", "Kitchen Admin"

    slug = models.SlugField(max_length=220, unique=True, blank=True)

    # Role this sub-item represents
    ROLE_CHOICES = [
        ('patient', 'Patient / Consumer'),
        ('doctor', 'Doctor / Physician'),
        ('dietitian', 'Dietitian / Nutritionist'),
        ('kitchen_admin', 'Kitchen Admin'),
        ('cook', 'Cook / Chef'),
        ('delivery_boy', 'Delivery Boy / Rider'),
        ('feedback', 'Feedback Collector'),
        ('support_agent', 'Support Agent'),
        ('other', 'Other'),
    ]
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, blank=True, null=True)

    description = models.TextField(blank=True, null=True)
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    icon_image = models.ImageField(upload_to='website/workflow/subitems/', null=True, blank=True)

    # Deep link to this specific portal view
    portal_url = models.CharField(max_length=255, blank=True, null=True)

    # Features available in this specific sub-item view
    features = models.JSONField(null=True, blank=True)

    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.sub_category.name}-{self.label}")
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['sub_category', 'position']
        verbose_name = "Workflow Sub Item"
        verbose_name_plural = "Workflow Sub Items"

    def __str__(self):
        return f"{self.sub_category.name} → {self.label}"


# ===========================================================================
# 36. GST PAGE SECTIONS (Leaders & Clients on the GST page)
# ===========================================================================

class GSTLeader(models.Model):
    """
    Leadership profiles shown on the GST page.
    E.g.: G. Jagannathan, Kaushikk Trivedi, Vijaya Krishna.
    """
    name = models.CharField(max_length=200)
    designation = models.CharField(max_length=300, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    photo = models.ImageField(upload_to='website/gst/leaders/', null=True, blank=True)
    linkedin_url = models.URLField(blank=True, null=True)
    experience_years = models.PositiveIntegerField(null=True, blank=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.name} – {self.designation}"


class GSTClient(models.Model):
    """
    Major clients/customers listed on the GST page.
    E.g.: Emerson, Signode, JSW, Saint-Gobain, Honeywell.
    """
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='website/gst/clients/', null=True, blank=True)
    website_url = models.URLField(blank=True, null=True)
    industry = models.CharField(max_length=200, blank=True, null=True)
    # e.g. "Manufacturing", "Steel", "Industrial Automation"
    testimonial = models.TextField(blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return self.name


# ===========================================================================
# 37. LEGAL PAGES (Privacy Policy, Terms of Service — found in footer)
# ===========================================================================

class LegalPage(models.Model):
    """
    Legal content pages linked from the footer.
    E.g.: Privacy Policy, Terms of Service, Cookie Policy.
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
    effective_date = models.DateField(null=True, blank=True)
    last_updated = models.DateField(null=True, blank=True)
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
# 38. COMPANY ABOUT SECTIONS (Quality Statement, AARMS Foundation, Service Concept)
# ===========================================================================

class CompanyAboutSection(models.Model):
    """
    Individual content sections on the About Us page.
    E.g.: Quality Statement, Service Concept (5-point list), AARMS Social Commitment.
    """
    SECTION_TYPE_CHOICES = [
        ('quality_statement', 'Quality Statement'),
        ('service_concept', 'Service Concept'),
        ('social_commitment', 'Social Commitment / CSR'),
        ('company_overview', 'Company Overview'),
        ('promoter_intro', 'Promoter Introduction'),
        ('milestone', 'Milestone / Achievement'),
        ('other', 'Other'),
    ]

    section_type = models.CharField(max_length=30, choices=SECTION_TYPE_CHOICES)
    title = models.CharField(max_length=300)
    subtitle = models.CharField(max_length=300, blank=True, null=True)
    content = models.TextField()
    bullet_points = models.JSONField(null=True, blank=True)
    # e.g. ["Outsourced model", "Value chains", "Supply chain solutions", ...]
    icon_class = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to='website/about/sections/', null=True, blank=True)
    # For foundation/trust info (AARMS Foundation / Gopalvidyakendra)
    entity_name = models.CharField(max_length=300, blank=True, null=True)
    entity_description = models.TextField(blank=True, null=True)
    entity_website = models.URLField(blank=True, null=True)
    position = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position']
        verbose_name = "Company About Section"
        verbose_name_plural = "Company About Sections"

    def __str__(self):
        return f"{self.section_type}: {self.title}"


# ===========================================================================
# 39. PATENTS (Medical Devices nav → Patents section)
# ===========================================================================

class Patent(models.Model):
    """
    Patents held by Miisky for its medical devices and technology.
    Linked from the Medical Devices nav → Patents section.
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
    device = models.ForeignKey(
        'MedicalDevice', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='patents'
    )
    inventors = models.CharField(max_length=500, blank=True, null=True)
    abstract = models.TextField(blank=True, null=True)
    filing_date = models.DateField(null=True, blank=True)
    grant_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    jurisdiction = models.CharField(max_length=100, blank=True, null=True)
    # e.g. "India", "US", "International (PCT)"
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='filed')
    patent_document = models.FileField(upload_to='website/patents/', null=True, blank=True)
    external_link = models.URLField(blank=True, null=True)
    technology_area = models.CharField(max_length=200, blank=True, null=True)
    # e.g. "Non-Invasive Monitoring", "NIR Technology", "AI Health Diagnostics"
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-filing_date']

    def __str__(self):
        return f"{self.title} ({self.patent_number or 'No. TBD'})"
