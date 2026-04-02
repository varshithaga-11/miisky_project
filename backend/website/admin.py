"""
Django Admin configuration for the Miisky SVASTH Website app.
Registers all 25 models with rich list displays, search, filters, and inlines.
"""

from django.contrib import admin
from .models import (
    CompanyInfo,
    HeroBanner,
    MedicalDeviceCategory,
    MedicalDevice,
    DeviceFeature,
    ResearchPaper,
    BlogCategory,
    BlogTag,
    BlogPost,
    BlogComment,
    ReportType,
    WebsiteReport,
    Testimonial,
    FAQCategory,
    FAQ,
    Department,
    TeamMember,
    JobListing,
    JobApplication,
    GalleryCategory,
    GalleryItem,
    Partner,
    CompanyAboutSection,
    LegalPage,
    Patent,
)


# ===========================================================================
# 1. COMPANY INFO
# ===========================================================================

@admin.register(CompanyInfo)
class CompanyInfoAdmin(admin.ModelAdmin):
    list_display = ('name', 'email_general', 'email_support', 'phone_primary', 'city', 'updated_at')
    search_fields = ('name', 'email_general', 'email_support', 'phone_primary', 'city')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Basic Info', {'fields': ('name', 'tagline', 'logo', 'favicon')}),
        ('Contact', {'fields': ('phone_primary', 'phone_secondary', 'email_support', 'email_general', 'whatsapp_number')}),
        ('Address', {'fields': ('address_line1', 'address_line2', 'city', 'state', 'pincode', 'country', 'google_maps_url', 'google_maps_embed_url')}),
        ('Social Media', {'fields': ('facebook_url', 'twitter_url', 'instagram_url', 'linkedin_url', 'youtube_url')}),
        ('SEO', {'fields': ('meta_title', 'meta_description', 'meta_keywords')}),
        ('Working Hours', {'fields': ('working_hours',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


# ===========================================================================
# 2. HERO BANNER
# ===========================================================================

@admin.register(HeroBanner)
class HeroBannerAdmin(admin.ModelAdmin):
    list_display = ('page', 'title', 'position', 'is_active', 'created_at')
    list_filter = ('page', 'is_active')
    search_fields = ('title', 'subtitle', 'description')
    list_editable = ('position', 'is_active')
    ordering = ('page', 'position')
    readonly_fields = ('created_at', 'updated_at')


# ===========================================================================
# 4. MEDICAL DEVICES
# ===========================================================================

class DeviceFeatureInline(admin.TabularInline):
    model = DeviceFeature
    extra = 1
    fields = ('title', 'description', 'icon_class', 'position')
    ordering = ('position',)


class ResearchPaperInline(admin.TabularInline):
    model = ResearchPaper
    extra = 0
    fields = ('title', 'authors', 'published_date', 'journal_conference', 'is_active')


class PatentInline(admin.TabularInline):
    model = Patent
    extra = 0
    fields = ('title', 'patent_number', 'status', 'filing_date', 'is_active')


@admin.register(MedicalDeviceCategory)
class MedicalDeviceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'is_active')
    list_editable = ('position', 'is_active')
    search_fields = ('name', 'description')
    ordering = ('position',)


@admin.register(MedicalDevice)
class MedicalDeviceAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'primary_technology', 'is_available', 'is_featured', 'is_active', 'position')
    list_filter = ('category', 'primary_technology', 'is_non_invasive', 'is_continuous_monitoring', 'is_available', 'is_featured', 'is_active')
    search_fields = ('name', 'slug', 'short_description', 'description', 'connectivity')
    list_editable = ('position', 'is_active', 'is_featured')
    readonly_fields = ('slug', 'created_at', 'updated_at')
    ordering = ('position',)
    inlines = [DeviceFeatureInline, ResearchPaperInline, PatentInline]
    fieldsets = (
        ('Basic Info', {'fields': ('name', 'slug', 'category', 'short_description', 'description')}),
        ('Technology', {'fields': ('primary_technology', 'is_non_invasive', 'is_continuous_monitoring', 'connectivity')}),
        ('Health Data', {'fields': ('parameters_monitored', 'viral_diseases_detected', 'bacterial_diseases_detected')}),
        ('Media', {'fields': ('image', 'thumbnail', 'video_url')}),
        ('Documents', {'fields': ('presentation_file', 'brochure_file', 'research_paper_file', 'patent_document', 'patent_number')}),
        ('Specifications', {'fields': ('device_weight', 'device_dimensions', 'battery_life', 'operating_temperature')}),
        ('Pricing & Display', {'fields': ('price', 'is_available', 'position', 'is_featured', 'is_active')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(DeviceFeature)
class DeviceFeatureAdmin(admin.ModelAdmin):
    list_display = ('device', 'title', 'position')
    list_filter = ('device',)
    search_fields = ('title', 'description', 'device__name')
    ordering = ('device', 'position')


@admin.register(ResearchPaper)
class ResearchPaperAdmin(admin.ModelAdmin):
    list_display = ('title', 'authors', 'device', 'published_date', 'is_active')
    list_filter = ('is_active', 'published_date')
    search_fields = ('title', 'authors', 'abstract', 'journal_conference')
    readonly_fields = ('created_at',)


# ===========================================================================
# 8. BLOG
# ===========================================================================

class BlogCommentInline(admin.TabularInline):
    model = BlogComment
    extra = 0
    fields = ('name', 'email', 'comment', 'is_approved', 'created_at')
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)


@admin.register(BlogCategory)
class BlogCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'position', 'is_active')
    list_editable = ('position', 'is_active')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('position',)


@admin.register(BlogTag)
class BlogTagAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}


@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'author_name', 'status', 'is_featured', 'is_active', 'published_at', 'views_count', 'likes_count')
    list_filter = ('status', 'category', 'is_featured', 'is_active')
    search_fields = ('title', 'slug', 'excerpt', 'content', 'author_name')
    list_editable = ('status', 'is_featured', 'is_active')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('slug', 'created_at', 'updated_at', 'views_count', 'likes_count')
    filter_horizontal = ('tags',)
    ordering = ('-published_at',)
    inlines = [BlogCommentInline]
    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'category', 'tags', 'excerpt', 'content')}),
        ('Media', {'fields': ('cover_image', 'cover_image_alt')}),
        ('Author', {'fields': ('author_name', 'author_image', 'author_bio')}),
        ('Publishing', {'fields': ('status', 'published_at', 'is_featured', 'is_active')}),
        ('SEO', {'fields': ('meta_title', 'meta_description', 'meta_keywords')}),
        ('Engagement', {'fields': ('views_count', 'likes_count')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(BlogComment)
class BlogCommentAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'blog_post', 'is_approved', 'created_at')
    list_filter = ('is_approved', 'created_at')
    search_fields = ('name', 'email', 'comment', 'blog_post__title')
    list_editable = ('is_approved',)
    readonly_fields = ('created_at',)
    ordering = ('-created_at',)
    actions = ['approve_comments']

    @admin.action(description='Approve selected comments')
    def approve_comments(self, request, queryset):
        queryset.update(is_approved=True)


# ===========================================================================
# 9. REPORTS
# ===========================================================================

@admin.register(ReportType)
class ReportTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'position', 'is_active')
    list_editable = ('position', 'is_active')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('position',)


@admin.register(WebsiteReport)
class WebsiteReportAdmin(admin.ModelAdmin):
    list_display = ('report_type', 'requested_by_name', 'requested_by_email', 'status', 'date_from', 'date_to', 'created_at')
    list_filter = ('status', 'report_type', 'created_at')
    search_fields = ('requested_by_name', 'requested_by_email', 'requested_by_phone')
    readonly_fields = ('created_at', 'updated_at', 'forwarded_at')
    ordering = ('-created_at',)
    fieldsets = (
        ('Report Info', {'fields': ('report_type', 'date_from', 'date_to', 'status', 'generated_file')}),
        ('Requested By', {'fields': ('requested_by_name', 'requested_by_email', 'requested_by_phone')}),
        ('Forward/Share', {'fields': ('forwarded_to_email', 'forwarded_at')}),
        ('Notes', {'fields': ('notes',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


# ===========================================================================
# 13. TESTIMONIALS
# ===========================================================================

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('name', 'designation', 'testimonial_type', 'rating', 'is_featured', 'is_active', 'position')
    list_filter = ('testimonial_type', 'is_featured', 'is_active')
    search_fields = ('name', 'designation', 'organization', 'testimonial_text')
    list_editable = ('is_featured', 'is_active', 'position')
    readonly_fields = ('created_at',)
    ordering = ('position',)


# ===========================================================================
# 14. FAQs
# ===========================================================================

class FAQInline(admin.TabularInline):
    model = FAQ
    extra = 1
    fields = ('question', 'answer', 'position', 'is_active')
    ordering = ('position',)


@admin.register(FAQCategory)
class FAQCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'is_active')
    list_editable = ('position', 'is_active')
    search_fields = ('name',)
    ordering = ('position',)
    inlines = [FAQInline]


@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'category', 'position', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('question', 'answer')
    list_editable = ('position', 'is_active')
    readonly_fields = ('created_at',)
    ordering = ('category', 'position')


# ===========================================================================
# 14.5. DEPARTMENTS
# ===========================================================================

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'head_name', 'head_email', 'position', 'is_active')
    list_editable = ('position', 'is_active')
    search_fields = ('name', 'description', 'head_name', 'head_email')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('position',)


# ===========================================================================
# 15. TEAM MEMBERS
# ===========================================================================

@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ('name', 'designation', 'department', 'experience_years', 'is_active', 'position')
    list_filter = ('department', 'is_active')
    search_fields = ('name', 'designation', 'bio', 'qualification', 'email')
    list_editable = ('is_active', 'position')
    readonly_fields = ('created_at',)
    ordering = ('position',)
    fieldsets = (
        ('Personal Info', {'fields': ('name', 'designation', 'department', 'photo')}),
        ('Professional Info', {'fields': ('bio', 'qualification', 'experience_years')}),
        ('Contact', {'fields': ('email', 'phone', 'linkedin_url')}),
        ('Display', {'fields': ('position', 'is_active')}),
        ('Timestamps', {'fields': ('created_at',), 'classes': ('collapse',)}),
    )


# ===========================================================================
# 16. CAREERS
# ===========================================================================

class JobApplicationInline(admin.TabularInline):
    model = JobApplication
    extra = 0
    fields = ('applicant_name', 'email', 'phone', 'status', 'applied_at')
    readonly_fields = ('applied_at',)
    ordering = ('-applied_at',)
    show_change_link = True


@admin.register(JobListing)
class JobListingAdmin(admin.ModelAdmin):
    list_display = ('title', 'department', 'job_type', 'location', 'openings', 'application_deadline', 'is_active')
    list_filter = ('department', 'job_type', 'is_active')
    search_fields = ('title', 'slug', 'job_description', 'requirements', 'location')
    readonly_fields = ('slug', 'created_at', 'updated_at')
    ordering = ('-created_at',)
    inlines = [JobApplicationInline]
    fieldsets = (
        ('Job Info', {'fields': ('title', 'slug', 'department', 'job_type', 'location')}),
        ('Requirements', {'fields': ('experience_required', 'qualification_required', 'salary_range', 'openings')}),
        ('Details', {'fields': ('job_description', 'responsibilities', 'requirements', 'benefits')}),
        ('Publishing', {'fields': ('application_deadline', 'is_active')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('applicant_name', 'email', 'phone', 'job', 'status', 'applied_at')
    list_filter = ('status', 'job__department', 'applied_at')
    search_fields = ('applicant_name', 'email', 'phone', 'job__title')
    readonly_fields = ('applied_at', 'updated_at')
    ordering = ('-applied_at',)
    actions = ['mark_shortlisted', 'mark_rejected']
    fieldsets = (
        ('Applicant Info', {'fields': ('job', 'applicant_name', 'email', 'phone')}),
        ('Application', {'fields': ('resume', 'cover_letter', 'portfolio_url', 'linkedin_url')}),
        ('Compensation', {'fields': ('current_ctc', 'expected_ctc', 'notice_period', 'years_of_experience')}),
        ('Status', {'fields': ('status', 'admin_notes')}),
        ('Timestamps', {'fields': ('applied_at', 'updated_at'), 'classes': ('collapse',)}),
    )

    @admin.action(description='Mark selected applications as Shortlisted')
    def mark_shortlisted(self, request, queryset):
        queryset.update(status='shortlisted')

    @admin.action(description='Mark selected applications as Rejected')
    def mark_rejected(self, request, queryset):
        queryset.update(status='rejected')


# ===========================================================================
# 17. GALLERY
# ===========================================================================

class GalleryItemInline(admin.TabularInline):
    model = GalleryItem
    extra = 1
    fields = ('title', 'media_type', 'image', 'video_url', 'position', 'is_active')
    ordering = ('position',)


@admin.register(GalleryCategory)
class GalleryCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'position', 'is_active')
    list_editable = ('position', 'is_active')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('position',)
    inlines = [GalleryItemInline]


@admin.register(GalleryItem)
class GalleryItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'media_type', 'is_featured', 'is_active', 'position', 'created_at')
    list_filter = ('category', 'media_type', 'is_featured', 'is_active')
    search_fields = ('title', 'description')
    list_editable = ('is_featured', 'is_active', 'position')
    readonly_fields = ('created_at',)
    ordering = ('category', 'position')


# ===========================================================================
# 18. PARTNERS
# ===========================================================================

@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    list_display = ('name', 'partner_type', 'since_year', 'position', 'is_active')
    list_filter = ('partner_type', 'is_active')
    search_fields = ('name', 'description', 'collaboration_details')
    list_editable = ('position', 'is_active')
    readonly_fields = ('created_at',)
    ordering = ('position',)


# ===========================================================================
# 19. ABOUT SECTION (DETAILED)
# ===========================================================================

@admin.register(CompanyAboutSection)
class CompanyAboutSectionAdmin(admin.ModelAdmin):
    list_display = ('about_title', 'about_tagline', 'is_active', 'updated_at')
    list_filter = ('is_active',)
    search_fields = ('about_title', 'about_tagline', 'about_description', 'choose_title')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('About Us Configuration', {
            'fields': (
                'about_tagline', 'about_title', 'about_description', 
                'about_specialties', 'about_vision',
                'about_experience_years', 'about_experience_text',
                'about_image_1'
            )
        }),
        ('Why Choose Us Section (Image 2)', {
            'fields': (
                'choose_tagline', 'choose_title', 'choose_description',
                'speciality_label', 'speciality_title', 'speciality_description',
                'speciality_points', 'video_url', 'video_image'
            )
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'), 
            'classes': ('collapse',)
        }),
    )


# ===========================================================================
# 20. LEGAL PAGES
# ===========================================================================

@admin.register(LegalPage)
class LegalPageAdmin(admin.ModelAdmin):
    list_display = ('title', 'page_type', 'version', 'effective_date', 'is_active', 'updated_at')
    list_filter = ('page_type', 'is_active')
    search_fields = ('title', 'slug', 'content')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('page_type',)
    fieldsets = (
        ('Page Info', {'fields': ('page_type', 'title', 'slug', 'content')}),
        ('Versioning', {'fields': ('version', 'effective_date', 'last_updated')}),
        ('Publishing', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )


# ===========================================================================
# 21. PATENTS
# ===========================================================================

@admin.register(Patent)
class PatentAdmin(admin.ModelAdmin):
    list_display = ('title', 'patent_number', 'status', 'jurisdiction', 'device', 'filing_date', 'is_active')
    list_filter = ('status', 'jurisdiction', 'is_active')
    search_fields = ('title', 'patent_number', 'application_number', 'inventors', 'abstract', 'technology_area')
    list_editable = ('status', 'is_active')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-filing_date',)
    fieldsets = (
        ('Patent Info', {'fields': ('title', 'patent_number', 'application_number', 'inventors', 'abstract')}),
        ('Dates', {'fields': ('filing_date', 'grant_date', 'expiry_date')}),
        ('Classification', {'fields': ('jurisdiction', 'status', 'technology_area', 'device')}),
        ('Documents', {'fields': ('patent_document', 'external_link')}),
        ('Publishing', {'fields': ('is_active',)}),
        ('Timestamps', {'fields': ('created_at', 'updated_at'), 'classes': ('collapse',)}),
    )
