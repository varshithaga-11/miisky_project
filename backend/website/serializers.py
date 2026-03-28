"""
Serializers for the Miisky SVASTH Website app.
One serializer per model, with nested read serializers where needed.
"""

from rest_framework import serializers
from .models import *


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
    # This ensures the API returns the full URL string in responses
    background_image_url = serializers.ImageField(source='background_image', read_only=True)
    # This allows the frontend to upload a file WITHOUT any string validation issues
    background_image = serializers.ImageField(required=False, allow_null=True, write_only=True)

    class Meta:
        model = HeroBanner
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']



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
        read_only_fields = ['created_at']


class BlogPostSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    tags = BlogTagSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField(read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=BlogTag.objects.all(), source='tags', write_only=True, required=False
    )

    class Meta:
        model = BlogPost
        fields = '__all__'

    def get_comments(self, obj):
        approved_comments = obj.comments.filter(is_approved=True)
        return BlogCommentSerializer(approved_comments, many=True).data


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
# 14.5. DEPARTMENTS
# ===========================================================================

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


# ===========================================================================
# 15. TEAM MEMBERS
# ===========================================================================

class TeamMemberSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    photo_url = serializers.SerializerMethodField()
    photo = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = TeamMember
        fields = [
            'id', 'name', 'designation', 'department', 'department_name',
            'bio', 'qualification', 'experience_years', 'photo', 'photo_url',
            'linkedin_url', 'email', 'phone', 'position', 'is_active', 'created_at'
        ]

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return obj.photo.url
        return None


# ===========================================================================
# 16. CAREERS
# ===========================================================================

class JobListingSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = JobListing
        fields = '__all__'


class JobApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job.title', read_only=True)
    job_department = serializers.CharField(source='job.department.name', read_only=True)

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
    image_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    image = serializers.ImageField(write_only=True, required=False)
    thumbnail = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = GalleryItem
        fields = [
            'id', 'category', 'category_name', 'title', 'description', 
            'media_type', 'image', 'image_url', 'video_url', 
            'thumbnail', 'thumbnail_url', 'position', 'is_featured', 
            'is_active', 'created_at'
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None


# ===========================================================================
# 18. PARTNERS
# ===========================================================================

class PartnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Partner
        fields = '__all__'


class CompanyAboutSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CompanyAboutSection
        fields = '__all__'


class LegalPageSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalPage
        fields = '__all__'


class PatentSerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)

    class Meta:
        model = Patent
        fields = '__all__'


# ===========================================================================
# 22. WORKFLOW STEPS
# ===========================================================================

class WorkflowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStep
        fields = '__all__'


# ===========================================================================
# 23. PRICING PLANS
# ===========================================================================

class PricingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = PricingPlan
        fields = '__all__'
