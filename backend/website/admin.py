from django.contrib import admin
from .models import (
    CompanyInfo, HeroBanner, NavigationMenu,
    MedicalDeviceCategory, MedicalDevice, DeviceFeature, ResearchPaper,
    HealthFoodCategory, HealthFoodProduct,
    HealthFoodConceptCategory, HealthFoodConceptArticle,
    WorkflowSection, WorkflowStep,
    BlogCategory, BlogTag, BlogPost, BlogComment,
    ReportType, WebsiteReport,
    CallbackRequest, ContactInquiry, NewsletterSubscriber,
    Testimonial, FAQCategory, FAQ,
    TeamMember, JobListing, JobApplication,
    GalleryCategory, GalleryItem,
    Partner, VisionMission, AIChatbotConfig,
    StatCounter, MobileAppInfo, ValueProposition,
    # --- New models ---
    Product, Service, GSTInfo,
    Presentation, PresentationDownloadLog,
    WorkflowSubCategory,
    MyHealthFeature, NutritionistPortalFeature,
    MicroKitchenPortalFeature, SupplyChainPortalFeature,
    AIChatSession, UserSuggestion,
    # --- Final gap models ---
    WorkflowSubItem, GSTLeader, GSTClient,
    # --- Legal / About / Patents ---
    LegalPage, CompanyAboutSection, Patent,
)

# --- Company ---
@admin.register(CompanyInfo)
class CompanyInfoAdmin(admin.ModelAdmin):
    list_display = ['name', 'phone_primary', 'email_support', 'updated_at']

# --- Hero Banner ---
@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ['page', 'position', 'title', 'is_active']
    list_filter = ['page', 'is_active']
    ordering = ['page', 'position']

# --- Navigation ---
@admin.register(NavigationMenu)
class NavigationMenuAdmin(admin.ModelAdmin):
    list_display = ['label', 'menu_placement', 'parent', 'position', 'is_active']
    list_filter = ['menu_placement', 'is_active']
    ordering = ['menu_placement', 'position']

# --- Medical Devices ---
@admin.register(MedicalDeviceCategory)
class MedicalDeviceCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'is_active']

class DeviceFeatureInline(admin.TabularInline):
    model = DeviceFeature
    extra = 1

@admin.register(MedicalDevice)
class MedicalDeviceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'primary_technology', 'is_non_invasive', 'is_featured', 'is_active']
    list_filter = ['category', 'primary_technology', 'is_non_invasive', 'is_featured', 'is_active']
    search_fields = ['name', 'description']
    inlines = [DeviceFeatureInline]
    prepopulated_fields = {'slug': ('name',)}

@admin.register(DeviceFeature)
class DeviceFeatureAdmin(admin.ModelAdmin):
    list_display = ['device', 'title', 'position']
    list_filter = ['device']

@admin.register(ResearchPaper)
class ResearchPaperAdmin(admin.ModelAdmin):
    list_display = ['title', 'device', 'published_date', 'is_active']
    list_filter = ['device', 'is_active']
    search_fields = ['title', 'authors']

# --- Health Foods ---
@admin.register(HealthFoodCategory)
class HealthFoodCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'is_active']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(HealthFoodProduct)
class HealthFoodProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'diet_type', 'price', 'is_organic', 'is_featured', 'is_active']
    list_filter = ['category', 'diet_type', 'is_organic', 'is_gluten_free', 'is_featured', 'is_active']
    search_fields = ['name', 'description', 'ingredients']
    prepopulated_fields = {'slug': ('name',)}

# --- Health Food Concept ---
@admin.register(HealthFoodConceptCategory)
class HealthFoodConceptCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'is_active']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(HealthFoodConceptArticle)
class HealthFoodConceptArticleAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'author_name', 'is_featured', 'is_active', 'published_at']
    list_filter = ['category', 'is_featured', 'is_active']
    search_fields = ['title', 'excerpt', 'content']
    prepopulated_fields = {'slug': ('title',)}

# --- Workflow ---
class WorkflowStepInline(admin.TabularInline):
    model = WorkflowStep
    extra = 1

@admin.register(WorkflowSection)
class WorkflowSectionAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'is_active']
    inlines = [WorkflowStepInline]
    prepopulated_fields = {'slug': ('name',)}

@admin.register(WorkflowStep)
class WorkflowStepAdmin(admin.ModelAdmin):
    list_display = ['section', 'step_number', 'title', 'actor', 'is_active']
    list_filter = ['section', 'actor', 'is_active']

# --- Blog ---
@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'is_active']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'author_name', 'status', 'is_featured', 'published_at', 'views_count']
    list_filter = ['category', 'status', 'is_featured', 'is_active']
    search_fields = ['title', 'excerpt', 'content', 'author_name']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['tags']

@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ['name', 'blog_post', 'is_approved', 'created_at']
    list_filter = ['is_approved']
    search_fields = ['name', 'email', 'comment']
    actions = ['approve_comments']

    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)
    approve_comments.short_description = "Approve selected comments"

# --- Reports ---
@admin.register(ReportType)
class ReportTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'is_active']

@admin.register(WebsiteReport)
class WebsiteReportAdmin(admin.ModelAdmin):
    list_display = ['report_type', 'requested_by_name', 'requested_by_email', 'status', 'created_at']
    list_filter = ['report_type', 'status']
    search_fields = ['requested_by_name', 'requested_by_email']

# --- Callback & Contact ---
@admin.register(CallbackRequest)
class CallbackRequestAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'phone', 'source_page', 'status', 'created_at']
    list_filter = ['status', 'source_page']
    search_fields = ['name', 'email', 'phone']

@admin.register(ContactInquiry)
class ContactInquiryAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'inquiry_type', 'subject', 'status', 'created_at']
    list_filter = ['status', 'inquiry_type']
    search_fields = ['name', 'email', 'subject', 'message']

@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ['email', 'name', 'is_active', 'subscribed_at']
    list_filter = ['is_active']
    search_fields = ['email', 'name']

# --- Testimonials & FAQs ---
@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ['name', 'designation', 'testimonial_type', 'rating', 'is_featured', 'is_active']
    list_filter = ['testimonial_type', 'is_featured', 'is_active']

@admin.register(FAQCategory)
class FAQCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'is_active']

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'category', 'position', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['question', 'answer']

# --- Team & Careers ---
@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'designation', 'department', 'position', 'is_active']
    list_filter = ['department', 'is_active']
    search_fields = ['name', 'designation']

@admin.register(JobListing)
class JobListingAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'job_type', 'location', 'openings', 'is_active']
    list_filter = ['department', 'job_type', 'is_active']
    search_fields = ['title', 'job_description']
    prepopulated_fields = {'slug': ('title',)}

@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ['applicant_name', 'job', 'email', 'phone', 'status', 'applied_at']
    list_filter = ['status', 'job']
    search_fields = ['applicant_name', 'email', 'phone']

# --- Gallery ---
@admin.register(GalleryCategory)
class GalleryCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'is_active']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'media_type', 'is_featured', 'is_active']
    list_filter = ['category', 'media_type', 'is_featured', 'is_active']

# --- Partners & About ---
@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ['name', 'partner_type', 'since_year', 'position', 'is_active']
    list_filter = ['partner_type', 'is_active']
    search_fields = ['name', 'description']

@admin.register(VisionMission)
class VisionMissionAdmin(admin.ModelAdmin):
    list_display = ['type', 'title', 'position', 'is_active']
    list_filter = ['type', 'is_active']

# --- Config & Misc ---
@admin.register(AIChatbotConfig)
class AIChatbotConfigAdmin(admin.ModelAdmin):
    list_display = ['chatbot_name', 'is_enabled', 'updated_at']

@admin.register(StatCounter)
class StatCounterAdmin(admin.ModelAdmin):
    list_display = ['label', 'value', 'position', 'is_active']

@admin.register(MobileAppInfo)
class MobileAppInfoAdmin(admin.ModelAdmin):
    list_display = ['title', 'platform', 'app_version', 'download_count', 'rating', 'is_active']
    list_filter = ['platform', 'is_active']

@admin.register(ValueProposition)
class ValuePropositionAdmin(admin.ModelAdmin):
    list_display = ['title', 'page', 'position', 'is_active']
    list_filter = ['page', 'is_active']


# --- Products & Services ---
@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'product_type', 'position', 'is_featured', 'is_active']
    list_filter = ['product_type', 'is_featured', 'is_active']
    search_fields = ['name', 'tagline', 'description']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ['name', 'service_type', 'position', 'is_featured', 'is_active']
    list_filter = ['service_type', 'is_featured', 'is_active']
    search_fields = ['name', 'tagline', 'description']
    prepopulated_fields = {'slug': ('name',)}

# --- GST ---
@admin.register(GSTInfo)
class GSTInfoAdmin(admin.ModelAdmin):
    list_display = ['company_name', 'gstin', 'gsp_registration_number', 'gstn_recognition_date', 'updated_at']

# --- Presentations ---
class PresentationDownloadLogInline(admin.TabularInline):
    model = PresentationDownloadLog
    extra = 0
    readonly_fields = ['downloader_name', 'downloader_email', 'downloader_company', 'ip_address', 'downloaded_at']

@admin.register(Presentation)
class PresentationAdmin(admin.ModelAdmin):
    list_display = ['title', 'presentation_type', 'file_format', 'version', 'download_count', 'requires_login', 'is_active']
    list_filter = ['presentation_type', 'requires_login', 'requires_email_capture', 'is_active']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    inlines = [PresentationDownloadLogInline]

@admin.register(PresentationDownloadLog)
class PresentationDownloadLogAdmin(admin.ModelAdmin):
    list_display = ['presentation', 'downloader_email', 'downloader_name', 'downloader_company', 'downloaded_at']
    list_filter = ['presentation']
    search_fields = ['downloader_email', 'downloader_name', 'downloader_company']
    readonly_fields = ['downloaded_at']

# --- Workflow Sub-Categories ---
class WorkflowSubItemInline(admin.TabularInline):
    model = WorkflowSubItem
    extra = 1

@admin.register(WorkflowSubCategory)
class WorkflowSubCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'portal_type', 'section', 'primary_actor', 'position', 'is_active']
    list_filter = ['portal_type', 'primary_actor', 'is_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [WorkflowSubItemInline]

# --- Portal Features ---
@admin.register(MyHealthFeature)
class MyHealthFeatureAdmin(admin.ModelAdmin):
    list_display = ['title', 'feature_type', 'position', 'is_active']
    list_filter = ['feature_type', 'is_active']

@admin.register(NutritionistPortalFeature)
class NutritionistPortalFeatureAdmin(admin.ModelAdmin):
    list_display = ['title', 'position', 'is_active']
    list_filter = ['is_active']

@admin.register(MicroKitchenPortalFeature)
class MicroKitchenPortalFeatureAdmin(admin.ModelAdmin):
    list_display = ['title', 'position', 'is_active']
    list_filter = ['is_active']

@admin.register(SupplyChainPortalFeature)
class SupplyChainPortalFeatureAdmin(admin.ModelAdmin):
    list_display = ['title', 'position', 'is_active']
    list_filter = ['is_active']

# --- AI Chat Sessions ---
@admin.register(AIChatSession)
class AIChatSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'user_identifier', 'started_at', 'is_resolved', 'escalated_to_human']
    list_filter = ['is_resolved', 'escalated_to_human']
    search_fields = ['session_id', 'user_identifier']
    readonly_fields = ['started_at']

# --- User Suggestions ---
@admin.register(UserSuggestion)
class UserSuggestionAdmin(admin.ModelAdmin):
    list_display = ['category', 'subject', 'name', 'email', 'status', 'rating', 'created_at']
    list_filter = ['category', 'status']
    search_fields = ['name', 'email', 'subject', 'suggestion']
    readonly_fields = ['ip_address', 'created_at']


# --- Workflow Sub-Items ---
@admin.register(WorkflowSubItem)
class WorkflowSubItemAdmin(admin.ModelAdmin):
    list_display = ['label', 'sub_category', 'role', 'position', 'is_active']
    list_filter = ['role', 'is_active', 'sub_category']
    search_fields = ['label', 'description']
    prepopulated_fields = {'slug': ('label',)}


# --- GST Leaders & Clients ---
@admin.register(GSTLeader)
class GSTLeaderAdmin(admin.ModelAdmin):
    list_display = ['name', 'designation', 'experience_years', 'position', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'designation', 'bio']


@admin.register(GSTClient)
class GSTClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'position', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'industry']


# --- Legal Pages ---
@admin.register(LegalPage)
class LegalPageAdmin(admin.ModelAdmin):
    list_display = ['title', 'page_type', 'version', 'effective_date', 'is_active']
    list_filter = ['page_type', 'is_active']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}


# --- About Us Sections ---
@admin.register(CompanyAboutSection)
class CompanyAboutSectionAdmin(admin.ModelAdmin):
    list_display = ['title', 'section_type', 'entity_name', 'position', 'is_active']
    list_filter = ['section_type', 'is_active']
    search_fields = ['title', 'subtitle', 'content']


# --- Patents ---
@admin.register(Patent)
class PatentAdmin(admin.ModelAdmin):
    list_display = ['title', 'patent_number', 'status', 'jurisdiction', 'filing_date', 'grant_date']
    list_filter = ['status', 'jurisdiction', 'is_active']
    search_fields = ['title', 'patent_number', 'application_number', 'abstract', 'inventors']
