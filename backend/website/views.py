"""
Views for the Miisky SVASTH Website app.
Uses only DRF built-in filters (SearchFilter, OrderingFilter) + manual
get_queryset() filtering so that django-filter is NOT required.
"""

from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Q
from .pagination import WebsitePagination


from .models import *
from .serializers import *


def _bool(val):
    """Convert query param string to boolean."""
    return str(val).lower() in ('1', 'true', 'yes')


# ===========================================================================
# 1. COMPANY INFO
# ===========================================================================

class CompanyInfoViewSet(viewsets.ModelViewSet):
    queryset = CompanyInfo.objects.all()
    serializer_class = CompanyInfoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'tagline', 'email_support', 'city', 'state']


# ===========================================================================
# 2. HERO BANNER
# ===========================================================================

class HeroBannerViewSet(viewsets.ModelViewSet):
    serializer_class = HeroBannerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'subtitle', 'call_to_action_text']
    ordering_fields = ['position']
    ordering = ['position']

    def get_queryset(self):
        qs = HeroBanner.objects.all()
        target_page = self.request.query_params.get('target_page')
        is_active = self.request.query_params.get('is_active')
        
        if target_page:
            qs = qs.filter(page=target_page)
            
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
            
        return qs.order_by('position')


# ===========================================================================
# 4. MEDICAL DEVICES
# ===========================================================================

class MedicalDeviceCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalDeviceCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['position']

    def get_queryset(self):
        qs = MedicalDeviceCategory.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('position')


class MedicalDeviceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'short_description']
    ordering_fields = ['position', 'name', 'price']
    ordering = ['position']

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return MedicalDeviceSerializer
        return MedicalDeviceWriteSerializer

    def get_queryset(self):
        qs = MedicalDevice.objects.select_related('category')
        params = self.request.query_params
        if params.get('category'):
            qs = qs.filter(category=params['category'])
        if params.get('is_featured') is not None:
            qs = qs.filter(is_featured=_bool(params['is_featured']))
        if params.get('is_non_invasive') is not None:
            qs = qs.filter(is_non_invasive=_bool(params['is_non_invasive']))
        if params.get('is_available') is not None:
            qs = qs.filter(is_available=_bool(params['is_available']))
        if params.get('primary_technology'):
            qs = qs.filter(primary_technology=params['primary_technology'])
        is_active = params.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('position')

    @action(detail=True, methods=['get'], url_path='features')
    def features(self, request, pk=None):
        device = self.get_object()
        serializer = DeviceFeatureSerializer(device.features.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='research-papers')
    def research_papers(self, request, pk=None):
        device = self.get_object()
        papers = device.research_papers.filter(is_active=True)
        serializer = ResearchPaperSerializer(papers, many=True)
        return Response(serializer.data)


class DeviceFeatureViewSet(viewsets.ModelViewSet):
    serializer_class = DeviceFeatureSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering = ['device', 'position']

    def get_queryset(self):
        qs = DeviceFeature.objects.select_related('device')
        device = self.request.query_params.get('device')
        if device:
            qs = qs.filter(device=device)
        return qs


class ResearchPaperViewSet(viewsets.ModelViewSet):
    serializer_class = ResearchPaperSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'authors', 'abstract']
    ordering = ['-published_date']

    def get_queryset(self):
        qs = ResearchPaper.objects.filter(is_active=True)
        device = self.request.query_params.get('device')
        if device:
            qs = qs.filter(device=device)
        return qs


# ===========================================================================
# 8. BLOG
# ===========================================================================

class BlogCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = BlogCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['position']

    def get_queryset(self):
        qs = BlogCategory.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('position')


class BlogTagViewSet(viewsets.ModelViewSet):
    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class BlogPostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'excerpt', 'content', 'author_name']
    ordering_fields = ['published_at', 'views_count', 'likes_count']
    ordering = ['-published_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer

    def get_queryset(self):
        qs = BlogPost.objects.select_related('category').prefetch_related('tags')
        p = self.request.query_params
        if p.get('category'):
            qs = qs.filter(category=p['category'])
        if p.get('status'):
            qs = qs.filter(status=p['status'])
        if p.get('is_featured') is not None:
            qs = qs.filter(is_featured=_bool(p['is_featured']))
        is_active = p.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=True, methods=['post'], url_path='increment-views', permission_classes=[AllowAny])
    def increment_views(self, request, pk=None):
        post = self.get_object()
        post.views_count += 1
        post.save(update_fields=['views_count'])
        return Response({'views_count': post.views_count})

    @action(detail=True, methods=['post'], url_path='like', permission_classes=[AllowAny])
    def like(self, request, pk=None):
        post = self.get_object()
        post.likes_count += 1
        post.save(update_fields=['likes_count'])
        return Response({'likes_count': post.likes_count})


class BlogCommentViewSet(viewsets.ModelViewSet):
    serializer_class = BlogCommentSerializer
    permission_classes = [AllowAny]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'comment', 'email']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = BlogComment.objects.all()
        # Authenticated users (staff/master) see all comments; public users only approved ones.
        if not self.request.user.is_authenticated:
            qs = qs.filter(is_approved=True)

        params = self.request.query_params
        blog_post = params.get('blog_post')
        if blog_post:
            qs = qs.filter(blog_post=blog_post)
        
        return qs

    @action(detail=True, methods=['patch'], url_path='approve', permission_classes=[IsAuthenticated])
    def approve(self, request, pk=None):
        comment = self.get_object()
        comment.is_approved = True
        comment.save(update_fields=['is_approved'])
        return Response({'status': 'approved'})


# ===========================================================================
# 9. REPORTS
# ===========================================================================

class ReportTypeViewSet(viewsets.ModelViewSet):
    serializer_class = ReportTypeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['position']

    def get_queryset(self):
        qs = ReportType.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class WebsiteReportViewSet(viewsets.ModelViewSet):
    serializer_class = WebsiteReportSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['requested_by_name', 'requested_by_email']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = WebsiteReport.objects.select_related('report_type')
        p = self.request.query_params
        if p.get('report_type'):
            qs = qs.filter(report_type=p['report_type'])
        if p.get('status'):
            qs = qs.filter(status=p['status'])
        return qs

    @action(detail=True, methods=['post'], url_path='forward')
    def forward(self, request, pk=None):
        report = self.get_object()
        email = request.data.get('email')
        if not email:
            return Response({'error': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)
        report.forwarded_to_email = email
        report.forwarded_at = timezone.now()
        report.save(update_fields=['forwarded_to_email', 'forwarded_at'])
        return Response({'status': 'forwarded', 'email': email})


# ===========================================================================
# 13. TESTIMONIALS
# ===========================================================================

class TestimonialViewSet(viewsets.ModelViewSet):
    serializer_class = TestimonialSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'designation', 'organization', 'testimonial_text']
    ordering = ['position']

    def get_queryset(self):
        qs = Testimonial.objects.all()
        p = self.request.query_params
        if p.get('testimonial_type'):
            qs = qs.filter(testimonial_type=p['testimonial_type'])
        if p.get('is_featured') is not None:
            qs = qs.filter(is_featured=_bool(p['is_featured']))
        is_active = p.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('position')


# ===========================================================================
# 14. FAQs
# ===========================================================================

class FAQCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = FAQCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering = ['position']

    def get_queryset(self):
        qs = FAQCategory.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs


class FAQViewSet(viewsets.ModelViewSet):
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['question', 'answer']
    ordering = ['category', 'position']

    def get_queryset(self):
        qs = FAQ.objects.select_related('category')
        p = self.request.query_params
        if p.get('category'):
            qs = qs.filter(category=p['category'])
        is_active = p.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('category', 'position')


# ===========================================================================
# 14.5. DEPARTMENTS
# ===========================================================================

class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['position']

    def get_queryset(self):
        qs = Department.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 15. TEAM MEMBERS
# ===========================================================================

class TeamMemberViewSet(viewsets.ModelViewSet):
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'designation', 'bio']
    ordering = ['position']

    def get_queryset(self):
        qs = TeamMember.objects.all()
        p = self.request.query_params
        if p.get('department'):
            qs = qs.filter(department=p['department'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 16. CAREERS
# ===========================================================================

class JobListingViewSet(viewsets.ModelViewSet):
    serializer_class = JobListingSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'job_description', 'requirements']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = JobListing.objects.all()
        p = self.request.query_params
        if p.get('department'):
            qs = qs.filter(department=p['department'])
        if p.get('job_type'):
            qs = qs.filter(job_type=p['job_type'])
        is_active = p.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('-created_at')


class JobApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['applicant_name', 'email', 'phone']
    ordering = ['-applied_at']

    def get_serializer_class(self):
        if self.request.user and self.request.user.is_staff:
            return JobApplicationAdminSerializer
        return JobApplicationSerializer

    def get_queryset(self):
        qs = JobApplication.objects.select_related('job')
        p = self.request.query_params
        if p.get('job'):
            qs = qs.filter(job=p['job'])
        if p.get('status'):
            qs = qs.filter(status=p['status'])
        return qs

    @action(detail=True, methods=['patch'], url_path='update-status', permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        application = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('admin_notes', '')
        if new_status:
            application.status = new_status
        if notes:
            application.admin_notes = notes
        application.save()
        return Response({'status': application.status})


# ===========================================================================
# 17. GALLERY
# ===========================================================================

class GalleryCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering = ['position']

    def get_queryset(self):
        qs = GalleryCategory.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('position')


class GalleryItemViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryItemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering = ['category', 'position']

    def get_queryset(self):
        qs = GalleryItem.objects.select_related('category')
        p = self.request.query_params
        if p.get('category'):
            qs = qs.filter(category=p['category'])
        if p.get('media_type'):
            qs = qs.filter(media_type=p['media_type'])
        if p.get('is_featured') is not None:
            qs = qs.filter(is_featured=_bool(p['is_featured']))
        is_active = p.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('category', 'position')


# ===========================================================================
# 18. PARTNERS
# ===========================================================================

class PartnerViewSet(viewsets.ModelViewSet):
    serializer_class = PartnerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['position']

    def get_queryset(self):
        qs = Partner.objects.all()
        p = self.request.query_params
        if p.get('partner_type'):
            qs = qs.filter(partner_type=p['partner_type'])
        is_active = p.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('position')


# ===========================================================================
# 19. ABOUT SECTION (DETAILED)
# ===========================================================================

class CompanyAboutSectionViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyAboutSectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'subtitle', 'content']
    ordering = ['position']

    def get_queryset(self):
        qs = CompanyAboutSection.objects.all()
        p = self.request.query_params
        if p.get('section_type'):
            qs = qs.filter(section_type=p['section_type'])
            
        is_active = p.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
            
        return qs


# ===========================================================================
# 20. LEGAL PAGES
# ===========================================================================

class LegalPageViewSet(viewsets.ModelViewSet):
    serializer_class = LegalPageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content', 'page_type']

    def get_queryset(self):
        qs = LegalPage.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 21. PATENTS
# ===========================================================================

class PatentViewSet(viewsets.ModelViewSet):
    serializer_class = PatentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'patent_number', 'inventors', 'abstract']
    ordering = ['-filing_date']

    def get_queryset(self):
        qs = Patent.objects.select_related('device')
        p = self.request.query_params
        if p.get('device'):
            qs = qs.filter(device=p['device'])
        if p.get('status'):
            qs = qs.filter(status=p['status'])
        is_active = p.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('-filing_date')


# ===========================================================================
# 22. WORKFLOW STEPS
# ===========================================================================

class WorkflowStepViewSet(viewsets.ModelViewSet):
    serializer_class = WorkflowStepSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering = ['position']

    def get_queryset(self):
        qs = WorkflowStep.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs.order_by('position')


# ===========================================================================
# 23. PRICING PLANS
# ===========================================================================

class PricingPlanViewSet(viewsets.ModelViewSet):
    serializer_class = PricingPlanSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'savings_text']
    ordering = ['position']

    def get_queryset(self):
        qs = PricingPlan.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs.order_by('position')


# ===========================================================================
# 22. DASHBOARD STATS
# ===========================================================================

from rest_framework.views import APIView

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stats = {
            "hero_banners": HeroBanner.objects.count(),
            "blog_posts": BlogPost.objects.count(),
            "blog_comments": {
                "total": BlogComment.objects.count(),
                "pending": BlogComment.objects.filter(is_approved=False).count()
            },
            "medical_devices": MedicalDevice.objects.count(),
            "team_members": TeamMember.objects.count(),
            "gallery_items": GalleryItem.objects.count(),
            "job_applications": {
                "total": JobApplication.objects.count(),
                "pending": JobApplication.objects.filter(status='pending').count()
            },
            "website_reports": {
                "total": WebsiteReport.objects.count(),
                "pending": WebsiteReport.objects.filter(status='pending').count()
            },
            "partners": Partner.objects.count(),
            "patents": Patent.objects.count(),
        }
        return Response(stats)
