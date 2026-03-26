"""
Serializers for the Miisky SVASTH Website app.
One serializer per model, with nested read serializers where needed.
"""

from rest_framework import serializers
from .models import (
    CompanyInfo,
    HeroBanner,
    NavigationMenu,
    MedicalDeviceCategory,
    MedicalDevice,
    DeviceFeature,
    ResearchPaper,
    HealthFoodCategory,
    HealthFoodProduct,
    HealthFoodConceptCategory,
    HealthFoodConceptArticle,
    WorkflowSection,
    WorkflowStep,
    BlogCategory,
    BlogTag,
    BlogPost,
    BlogComment,
    ReportType,
    WebsiteReport,
    CallbackRequest,
    ContactInquiry,
    NewsletterSubscriber,
    Testimonial,
    FAQCategory,
    FAQ,
    TeamMember,
    JobListing,
    JobApplication,
    GalleryCategory,
    GalleryItem,
    Partner,
    VisionMission,
    AIChatbotConfig,
    StatCounter,
    MobileAppInfo,
    ValueProposition,
    # --- New models ---
    Product,
    Service,
    GSTInfo,
    Presentation,
    PresentationDownloadLog,
    WorkflowSubCategory,
    MyHealthFeature,
    NutritionistPortalFeature,
    MicroKitchenPortalFeature,
    SupplyChainPortalFeature,
    AIChatSession,
    UserSuggestion,
    # --- Final gap models ---
    WorkflowSubItem,
    GSTLeader,
    GSTClient,
    # --- Legal / About / Patents ---
    LegalPage,
    CompanyAboutSection,
    Patent,
)


# ===========================================================================
# 1. COMPANY INFO
# ===========================================================================

class CompanyInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyInfo
        fields = '__all__'


# ===========================================================================
# 2. HERO BANNER
# ===========================================================================

class HeroBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroBanner
        fields = '__all__'


# ===========================================================================
# 3. NAVIGATION MENU
# ===========================================================================

class NavigationMenuChildSerializer(serializers.ModelSerializer):
    """Nested serializer for dropdown child items."""
    class Meta:
        model = NavigationMenu
        fields = ['id', 'label', 'url', 'position', 'open_in_new_tab', 'icon_class', 'is_active']


class NavigationMenuSerializer(serializers.ModelSerializer):
    children = NavigationMenuChildSerializer(many=True, read_only=True)

    class Meta:
        model = NavigationMenu
        fields = '__all__'


# ===========================================================================
# 4. MEDICAL DEVICES
# ===========================================================================

class MedicalDeviceCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalDeviceCategory
        fields = '__all__'


class DeviceFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeviceFeature
        fields = '__all__'


class ResearchPaperSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResearchPaper
        fields = '__all__'


class MedicalDeviceSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    features = DeviceFeatureSerializer(many=True, read_only=True)
    research_papers = ResearchPaperSerializer(many=True, read_only=True)

    class Meta:
        model = MedicalDevice
        fields = '__all__'


class MedicalDeviceWriteSerializer(serializers.ModelSerializer):
    """Write serializer without nested read-only fields."""
    class Meta:
        model = MedicalDevice
        fields = '__all__'


# ===========================================================================
# 5. HEALTH FOOD PRODUCTS
# ===========================================================================

class HealthFoodCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthFoodCategory
        fields = '__all__'


class HealthFoodProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = HealthFoodProduct
        fields = '__all__'


class HealthFoodProductWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthFoodProduct
        fields = '__all__'


# ===========================================================================
# 6. HEALTH FOOD CONCEPT
# ===========================================================================

class HealthFoodConceptCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthFoodConceptCategory
        fields = '__all__'


class HealthFoodConceptArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = HealthFoodConceptArticle
        fields = '__all__'


class HealthFoodConceptArticleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing articles."""
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = HealthFoodConceptArticle
        fields = [
            'id', 'category', 'category_name', 'title', 'slug',
            'excerpt', 'cover_image', 'author_name', 'is_featured',
            'is_active', 'published_at',
        ]


# ===========================================================================
# 7. WORKFLOW
# ===========================================================================

class WorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = '__all__'


class WorkflowSectionSerializer(serializers.ModelSerializer):
    steps = WorkflowStepSerializer(many=True, read_only=True)

    class Meta:
        model = WorkflowSection
        fields = '__all__'


class WorkflowSectionWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowSection
        fields = '__all__'


# ===========================================================================
# 8. BLOG
# ===========================================================================

class BlogCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogCategory
        fields = '__all__'


class BlogTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogTag
        fields = '__all__'


class BlogCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlogComment
        fields = '__all__'
        read_only_fields = ['is_approved', 'created_at']


class BlogPostSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    comments = BlogCommentSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=BlogTag.objects.all(), source='tags', write_only=True, required=False
    )

    class Meta:
        model = BlogPost
        fields = '__all__'


class BlogPostListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing blog posts."""
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = BlogPost
        fields = [
            'id', 'category', 'category_name', 'title', 'slug', 'excerpt',
            'cover_image', 'author_name', 'status', 'published_at',
            'views_count', 'likes_count', 'is_featured', 'is_active',
        ]


# ===========================================================================
# 9. REPORTS
# ===========================================================================

class ReportTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReportType
        fields = '__all__'


class WebsiteReportSerializer(serializers.ModelSerializer):
    report_type_name = serializers.CharField(source='report_type.name', read_only=True)

    class Meta:
        model = WebsiteReport
        fields = '__all__'


# ===========================================================================
# 10. CALLBACK REQUESTS
# ===========================================================================

class CallbackRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = CallbackRequest
        fields = '__all__'
        read_only_fields = ['status', 'admin_notes', 'created_at', 'updated_at']


class CallbackRequestAdminSerializer(serializers.ModelSerializer):
    """Admin serializer with full field access."""
    class Meta:
        model = CallbackRequest
        fields = '__all__'


# ===========================================================================
# 11. CONTACT INQUIRIES
# ===========================================================================

class ContactInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = '__all__'
        read_only_fields = ['status', 'admin_reply', 'replied_at', 'ip_address', 'created_at', 'updated_at']


class ContactInquiryAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInquiry
        fields = '__all__'


# ===========================================================================
# 12. NEWSLETTER
# ===========================================================================

class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = '__all__'
        read_only_fields = ['subscribed_at', 'unsubscribed_at']


# ===========================================================================
# 13. TESTIMONIALS
# ===========================================================================

class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = '__all__'


# ===========================================================================
# 14. FAQs
# ===========================================================================

class FAQCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQCategory
        fields = '__all__'


class FAQSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = FAQ
        fields = '__all__'


# ===========================================================================
# 15. TEAM MEMBERS
# ===========================================================================

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = '__all__'


# ===========================================================================
# 16. CAREERS
# ===========================================================================

class JobListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobListing
        fields = '__all__'


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_department = serializers.CharField(source='job.department', read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ['status', 'admin_notes', 'applied_at', 'updated_at']


class JobApplicationAdminSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'


# ===========================================================================
# 17. GALLERY
# ===========================================================================

class GalleryCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryCategory
        fields = '__all__'


class GalleryItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = GalleryItem
        fields = '__all__'


# ===========================================================================
# 18. PARTNERS
# ===========================================================================

class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = '__all__'


# ===========================================================================
# 19. VISION / MISSION / VALUES
# ===========================================================================

class VisionMissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = VisionMission
        fields = '__all__'


# ===========================================================================
# 20. AI CHATBOT CONFIG
# ===========================================================================

class AIChatbotConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIChatbotConfig
        fields = '__all__'


# ===========================================================================
# 21. STAT COUNTERS
# ===========================================================================

class StatCounterSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatCounter
        fields = '__all__'


# ===========================================================================
# 22. MOBILE APP INFO
# ===========================================================================

class MobileAppInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = MobileAppInfo
        fields = '__all__'


# ===========================================================================
# 23. VALUE PROPOSITIONS
# ===========================================================================

class ValuePropositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ValueProposition
        fields = '__all__'


# ===========================================================================
# 24. PRODUCTS
# ===========================================================================

class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'


# ===========================================================================
# 25. SERVICES
# ===========================================================================

class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


# ===========================================================================
# 26. GST INFO
# ===========================================================================

class GSTInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = GSTInfo
        fields = '__all__'


# ===========================================================================
# 27. PRESENTATIONS
# ===========================================================================

class PresentationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presentation
        fields = '__all__'


class PresentationDownloadLogSerializer(serializers.ModelSerializer):
    presentation_title = serializers.CharField(source='presentation.title', read_only=True)

    class Meta:
        model = PresentationDownloadLog
        fields = '__all__'


# ===========================================================================
# 28. WORKFLOW SUB-CATEGORIES
# ===========================================================================

class WorkflowSubCategorySerializer(serializers.ModelSerializer):
    section_name = serializers.CharField(source='section.name', read_only=True)

    class Meta:
        model = WorkflowSubCategory
        fields = '__all__'


# ===========================================================================
# 29. MY HEALTH FEATURES
# ===========================================================================

class MyHealthFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyHealthFeature
        fields = '__all__'


# ===========================================================================
# 30. NUTRITIONIST PORTAL FEATURES
# ===========================================================================

class NutritionistPortalFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionistPortalFeature
        fields = '__all__'


# ===========================================================================
# 31. MICRO KITCHEN PORTAL FEATURES
# ===========================================================================

class MicroKitchenPortalFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = MicroKitchenPortalFeature
        fields = '__all__'


# ===========================================================================
# 32. SUPPLY CHAIN PORTAL FEATURES
# ===========================================================================

class SupplyChainPortalFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplyChainPortalFeature
        fields = '__all__'


# ===========================================================================
# 33. AI CHAT SESSIONS
# ===========================================================================

class AIChatSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIChatSession
        fields = '__all__'


# ===========================================================================
# 34. USER SUGGESTIONS
# ===========================================================================

class UserSuggestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSuggestion
        fields = '__all__'
        read_only_fields = ['status', 'admin_response', 'responded_at', 'ip_address', 'created_at']


class UserSuggestionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSuggestion
        fields = '__all__'


# ===========================================================================
# 35. WORKFLOW SUB-ITEMS (3rd-level nav)
# ===========================================================================

class WorkflowSubItemSerializer(serializers.ModelSerializer):
    sub_category_name = serializers.CharField(source='sub_category.name', read_only=True)

    class Meta:
        model = WorkflowSubItem
        fields = '__all__'


# ===========================================================================
# 36. GST LEADERS & CLIENTS
# ===========================================================================

class GSTLeaderSerializer(serializers.ModelSerializer):
    class Meta:
        model = GSTLeader
        fields = '__all__'


class GSTClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = GSTClient
        fields = '__all__'


# ===========================================================================
# 37-39. LEGAL PAGES, COMPANY ABOUT SECTIONS, PATENTS
# ===========================================================================

class LegalPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalPage
        fields = '__all__'


class CompanyAboutSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyAboutSection
        fields = '__all__'


class PatentSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)

    class Meta:
        model = Patent
        fields = '__all__'
