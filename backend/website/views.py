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


class PolymorphicLookupMixin:
    """
    Mixin to allow lookups by either 'id' or 'uid'.
    Try numeric ID first if applicable, otherwise try UID.
    """
    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        # 1. Try lookup by UID (priority for SEO/New links)
        obj = queryset.filter(uid=lookup_value).first()
        if obj:
            self.check_object_permissions(self.request, obj)
            return obj
            
        # 2. Try lookup by numeric ID (fallback for legacy/admin links)
        if str(lookup_value).isdigit():
            obj = queryset.filter(id=lookup_value).first()
            if obj:
                self.check_object_permissions(self.request, obj)
                return obj
        
        # 3. Standard Fallback to 404 (uses original lookup_field logic)
        from django.shortcuts import get_object_or_404
        return get_object_or_404(queryset, **{self.lookup_field: lookup_value})


def _bool(val):
    """Convert query param string to boolean."""
    return str(val).lower() in ('1', 'true', 'yes')


# ===========================================================================
# 1. COMPANY INFO
# ===========================================================================

class CompanyInfoViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    queryset = CompanyInfo.objects.all()
    serializer_class = CompanyInfoSerializer
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'tagline', 'email_support', 'city', 'state']


# ===========================================================================
# 2. HERO BANNER
# ===========================================================================

class HeroBannerViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = HeroBannerSerializer
    lookup_field = 'uid'
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

class MedicalDeviceCategoryViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = MedicalDeviceCategorySerializer
    lookup_field = 'uid'
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


class MedicalDeviceViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    lookup_field = 'uid'
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
            val = params['category']
            if val.isdigit():
                qs = qs.filter(category_id=val)
            else:
                qs = qs.filter(category__uid=val)
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
    def features(self, request, uid=None):
        device = self.get_object()
        serializer = DeviceFeatureSerializer(device.features.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], url_path='research-papers')
    def research_papers(self, request, uid=None):
        device = self.get_object()
        papers = device.research_papers.filter(is_active=True)
        serializer = ResearchPaperSerializer(papers, many=True)
        return Response(serializer.data)


class DeviceFeatureViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = DeviceFeatureSerializer
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering = ['device', 'position']

    def get_queryset(self):
        qs = DeviceFeature.objects.select_related('device')
        device = self.request.query_params.get('device')
        if device:
            if device.isdigit():
                qs = qs.filter(device_id=device)
            else:
                qs = qs.filter(device__uid=device)
        return qs


class ResearchPaperViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = ResearchPaperSerializer
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'authors', 'abstract']
    ordering = ['-published_date']

    def get_queryset(self):
        qs = ResearchPaper.objects.filter(is_active=True)
        device = self.request.query_params.get('device')
        if device:
            if device.isdigit():
                qs = qs.filter(device_id=device)
            else:
                qs = qs.filter(device__uid=device)
        return qs


# ===========================================================================
# 8. BLOG
# ===========================================================================

class BlogCategoryViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = BlogCategorySerializer
    lookup_field = 'uid'
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


class BlogTagViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class BlogPostViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'excerpt', 'content', 'author_name']
    ordering_fields = ['published_at', 'views_count', 'likes_count']
    ordering = ['-published_at']
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [permission() for permission in self.permission_classes]

    def get_serializer_class(self):
        if self.action == 'list':
            return BlogPostListSerializer
        return BlogPostSerializer

    def get_queryset(self):
        qs = BlogPost.objects.select_related('category').prefetch_related('tags')
        p = self.request.query_params
        if p.get('category'):
            val = p['category']
            if val.isdigit():
                qs = qs.filter(category_id=val)
            else:
                qs = qs.filter(category__uid=val)
        if p.get('tag'):
            val = p['tag']
            if val.isdigit():
                qs = qs.filter(tags=val)
            else:
                qs = qs.filter(tags__uid=val)
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
    def increment_views(self, request, uid=None):
        post = self.get_object()
        post.views_count += 1
        post.save(update_fields=['views_count'])
        return Response({'views_count': post.views_count})

    @action(detail=True, methods=['post'], url_path='like', permission_classes=[AllowAny])
    def like(self, request, uid=None):
        post = self.get_object()
        post.engagement += 1
        post.save(update_fields=['engagement'])
        return Response({'engagement': post.engagement})

    @action(detail=True, methods=['post'], url_path='unlike', permission_classes=[AllowAny])
    def unlike(self, request, uid=None):
        post = self.get_object()
        if post.engagement > 0:
            post.engagement -= 1
            post.save(update_fields=['engagement'])
        return Response({'engagement': post.engagement})


class BlogCommentViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = BlogCommentSerializer
    lookup_field = 'uid'
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
            if blog_post.isdigit():
                qs = qs.filter(blog_post_id=blog_post)
            else:
                qs = qs.filter(blog_post__uid=blog_post)
        
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
    lookup_field = 'uid'
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
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['requested_by_name', 'requested_by_email']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = WebsiteReport.objects.select_related('report_type')
        p = self.request.query_params
        if p.get('report_type'):
            val = p['report_type']
            if val.isdigit():
                qs = qs.filter(report_type_id=val)
            else:
                qs = qs.filter(report_type__uid=val)
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
    lookup_field = 'uid'
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
    lookup_field = 'uid'
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
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['question', 'answer']
    ordering = ['category', 'position']

    def get_queryset(self):
        qs = FAQ.objects.select_related('category')
        p = self.request.query_params
        if p.get('category'):
            val = p['category']
            if val.isdigit():
                qs = qs.filter(category_id=val)
            else:
                qs = qs.filter(category__uid=val)
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

class DepartmentViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    lookup_field = 'uid'
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

class TeamMemberViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = TeamMemberSerializer
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'designation', 'bio']
    ordering = ['position']

    def get_queryset(self):
        qs = TeamMember.objects.all()
        p = self.request.query_params
        if p.get('department'):
            val = p['department']
            if val.isdigit():
                qs = qs.filter(department_id=val)
            else:
                qs = qs.filter(department__uid=val)
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 16. CAREERS
# ===========================================================================

class JobListingViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = JobListingSerializer
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'job_description', 'requirements']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = JobListing.objects.all()
        p = self.request.query_params
        if p.get('department'):
            val = p['department']
            if val.isdigit():
                qs = qs.filter(department_id=val)
            else:
                qs = qs.filter(department__uid=val)
        if p.get('job_type'):
            qs = qs.filter(job_type=p['job_type'])
        is_active = p.get('is_active')
        if is_active is not None:
            if is_active.lower() != 'all':
                qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('-created_at')


class JobApplicationViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    lookup_field = 'uid'
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
            val = p['job']
            if val.isdigit():
                qs = qs.filter(job_id=val)
            else:
                qs = qs.filter(job__uid=val)
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
    lookup_field = 'uid'
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


class GalleryItemViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = GalleryItemSerializer
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering = ['category', 'position']

    def get_queryset(self):
        qs = GalleryItem.objects.select_related('category')
        p = self.request.query_params
        if p.get('category'):
            val = p['category']
            if val.isdigit():
                qs = qs.filter(category_id=val)
            else:
                qs = qs.filter(category__uid=val)
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

class PartnerViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = PartnerSerializer
    lookup_field = 'uid'
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
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['about_title', 'choose_title', 'about_description', 'choose_description']
    ordering = ['-updated_at']

    def get_queryset(self):
        qs = CompanyAboutSection.objects.all()
        p = self.request.query_params
            
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
    lookup_field = 'uid'
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

class PatentViewSet(PolymorphicLookupMixin, viewsets.ModelViewSet):
    serializer_class = PatentSerializer
    lookup_field = 'uid'
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
    lookup_field = 'uid'
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
    lookup_field = 'uid'
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
            "website_inquiries": {
                "total": WebsiteInquiry.objects.count(),
                "new": WebsiteInquiry.objects.filter(status='new').count()
            },
            "stat_counters": StatCounter.objects.count(),
        }
        return Response(stats)


# ===========================================================================
# 24. WEBSITE INQUIRIES
# ===========================================================================

class WebsiteInquiryViewSet(viewsets.ModelViewSet):
    queryset = WebsiteInquiry.objects.all()
    serializer_class = WebsiteInquirySerializer
    lookup_field = 'uid'
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone', 'subject', 'message']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        # Always force 'new' status for public submissions
        serializer.save(status='new')

    def get_queryset(self):
        qs = WebsiteInquiry.objects.all()
        p = self.request.query_params
        if p.get('inquiry_type'):
            qs = qs.filter(inquiry_type=p['inquiry_type'])
        if p.get('status'):
            qs = qs.filter(status=p['status'])
        return qs


# ===========================================================================
# 25. STAT COUNTERS
# ===========================================================================

class StatCounterViewSet(viewsets.ModelViewSet):
    serializer_class = StatCounterSerializer
    lookup_field = 'uid'
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = WebsitePagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'value']
    ordering = ['position']

    def get_queryset(self):
        qs = StatCounter.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        elif not self.request.user.is_authenticated:
            qs = qs.filter(is_active=True)
        return qs.order_by('position')
