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


# ===========================================================================
# 2. HERO BANNER
# ===========================================================================

class HeroBannerViewSet(viewsets.ModelViewSet):
    serializer_class = HeroBannerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['position']
    ordering = ['position']

    def get_queryset(self):
        qs = HeroBanner.objects.all()
        page = self.request.query_params.get('page')
        is_active = self.request.query_params.get('is_active')
        if page:
            qs = qs.filter(page=page)
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 3. NAVIGATION MENU
# ===========================================================================

class NavigationMenuViewSet(viewsets.ModelViewSet):
    serializer_class = NavigationMenuSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.OrderingFilter]
    ordering = ['position']

    def get_queryset(self):
        qs = NavigationMenu.objects.filter(parent=None, is_active=True)
        placement = self.request.query_params.get('menu_placement')
        if placement:
            qs = qs.filter(menu_placement=placement)
        return qs


# ===========================================================================
# 4. MEDICAL DEVICES
# ===========================================================================

class MedicalDeviceCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalDeviceCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = MedicalDeviceCategory.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class MedicalDeviceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
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
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs

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
# 5. HEALTH FOOD PRODUCTS
# ===========================================================================

class HealthFoodCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = HealthFoodCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = HealthFoodCategory.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class HealthFoodProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'short_description', 'ingredients', 'health_benefits']
    ordering_fields = ['position', 'name', 'price']
    ordering = ['category', 'position']

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return HealthFoodProductSerializer
        return HealthFoodProductWriteSerializer

    def get_queryset(self):
        qs = HealthFoodProduct.objects.select_related('category')
        p = self.request.query_params
        if p.get('category'):
            qs = qs.filter(category=p['category'])
        if p.get('diet_type'):
            qs = qs.filter(diet_type=p['diet_type'])
        if p.get('is_featured') is not None:
            qs = qs.filter(is_featured=_bool(p['is_featured']))
        if p.get('is_organic') is not None:
            qs = qs.filter(is_organic=_bool(p['is_organic']))
        if p.get('is_plastic_free') is not None:
            qs = qs.filter(is_plastic_free=_bool(p['is_plastic_free']))
        if p.get('is_gluten_free') is not None:
            qs = qs.filter(is_gluten_free=_bool(p['is_gluten_free']))
        if p.get('is_available') is not None:
            qs = qs.filter(is_available=_bool(p['is_available']))
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 6. HEALTH FOOD CONCEPT ARTICLES
# ===========================================================================

class HealthFoodConceptCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = HealthFoodConceptCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = HealthFoodConceptCategory.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class HealthFoodConceptArticleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'excerpt', 'content', 'author_name']
    ordering_fields = ['published_at', 'position']
    ordering = ['-published_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return HealthFoodConceptArticleListSerializer
        return HealthFoodConceptArticleSerializer

    def get_queryset(self):
        qs = HealthFoodConceptArticle.objects.select_related('category')
        p = self.request.query_params
        if p.get('category'):
            qs = qs.filter(category=p['category'])
        if p.get('is_featured') is not None:
            qs = qs.filter(is_featured=_bool(p['is_featured']))
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 7. WORKFLOW
# ===========================================================================

class WorkflowSectionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return WorkflowSectionSerializer
        return WorkflowSectionWriteSerializer

    def get_queryset(self):
        qs = WorkflowSection.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class WorkflowStepViewSet(viewsets.ModelViewSet):
    serializer_class = WorkflowStepSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['section', 'step_number']

    def get_queryset(self):
        qs = WorkflowStep.objects.select_related('section')
        p = self.request.query_params
        if p.get('section'):
            qs = qs.filter(section=p['section'])
        if p.get('actor'):
            qs = qs.filter(actor=p['actor'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 8. BLOG
# ===========================================================================

class BlogCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = BlogCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = BlogCategory.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class BlogTagViewSet(viewsets.ModelViewSet):
    queryset = BlogTag.objects.all()
    serializer_class = BlogTagSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class BlogPostViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]
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
            qs = qs.filter(is_active=_bool(is_active))
        else:
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
    ordering = ['-created_at']

    def get_queryset(self):
        qs = BlogComment.objects.all()
        if self.request.user and self.request.user.is_staff:
            pass  # admin sees all
        else:
            qs = qs.filter(is_approved=True)
        blog_post = self.request.query_params.get('blog_post')
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
# 10. CALLBACK REQUESTS
# ===========================================================================

class CallbackRequestViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.user and self.request.user.is_staff:
            return CallbackRequestAdminSerializer
        return CallbackRequestSerializer

    def get_queryset(self):
        qs = CallbackRequest.objects.all()
        p = self.request.query_params
        if p.get('status'):
            qs = qs.filter(status=p['status'])
        if p.get('source_page'):
            qs = qs.filter(source_page=p['source_page'])
        return qs

    @action(detail=True, methods=['patch'], url_path='update-status', permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        callback = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('admin_notes', '')
        if new_status:
            callback.status = new_status
        if notes:
            callback.admin_notes = notes
        callback.save()
        return Response({'status': callback.status})


# ===========================================================================
# 11. CONTACT INQUIRIES
# ===========================================================================

class ContactInquiryViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone', 'subject', 'message']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.user and self.request.user.is_staff:
            return ContactInquiryAdminSerializer
        return ContactInquirySerializer

    def get_queryset(self):
        qs = ContactInquiry.objects.all()
        p = self.request.query_params
        if p.get('status'):
            qs = qs.filter(status=p['status'])
        if p.get('inquiry_type'):
            qs = qs.filter(inquiry_type=p['inquiry_type'])
        return qs

    def perform_create(self, serializer):
        ip = self.request.META.get('REMOTE_ADDR')
        serializer.save(ip_address=ip)

    @action(detail=True, methods=['patch'], url_path='reply', permission_classes=[IsAuthenticated])
    def reply(self, request, pk=None):
        inquiry = self.get_object()
        inquiry.admin_reply = request.data.get('admin_reply', '')
        inquiry.status = 'resolved'
        inquiry.replied_at = timezone.now()
        inquiry.save()
        return Response({'status': 'replied'})


# ===========================================================================
# 12. NEWSLETTER
# ===========================================================================

class NewsletterSubscriberViewSet(viewsets.ModelViewSet):
    serializer_class = NewsletterSubscriberSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['email', 'name']
    ordering = ['-subscribed_at']

    def get_queryset(self):
        qs = NewsletterSubscriber.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        return qs

    @action(detail=True, methods=['post'], url_path='unsubscribe', permission_classes=[AllowAny])
    def unsubscribe(self, request, pk=None):
        subscriber = self.get_object()
        subscriber.is_active = False
        subscriber.unsubscribed_at = timezone.now()
        subscriber.save()
        return Response({'status': 'unsubscribed'})


# ===========================================================================
# 13. TESTIMONIALS
# ===========================================================================

class TestimonialViewSet(viewsets.ModelViewSet):
    serializer_class = TestimonialSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
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
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 14. FAQs
# ===========================================================================

class FAQCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = FAQCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = FAQCategory.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class FAQViewSet(viewsets.ModelViewSet):
    serializer_class = FAQSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
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
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class JobApplicationViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
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
    ordering = ['position']

    def get_queryset(self):
        qs = GalleryCategory.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class GalleryItemViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryItemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
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
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 18. PARTNERS
# ===========================================================================

class PartnerViewSet(viewsets.ModelViewSet):
    serializer_class = PartnerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
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
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 19. VISION / MISSION / VALUES
# ===========================================================================

class VisionMissionViewSet(viewsets.ModelViewSet):
    serializer_class = VisionMissionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['type', 'position']

    def get_queryset(self):
        qs = VisionMission.objects.all()
        p = self.request.query_params
        if p.get('type'):
            qs = qs.filter(type=p['type'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 20. AI CHATBOT CONFIG
# ===========================================================================

class AIChatbotConfigViewSet(viewsets.ModelViewSet):
    queryset = AIChatbotConfig.objects.all()
    serializer_class = AIChatbotConfigSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# ===========================================================================
# 21. STAT COUNTERS
# ===========================================================================

class StatCounterViewSet(viewsets.ModelViewSet):
    serializer_class = StatCounterSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = StatCounter.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 22. MOBILE APP INFO
# ===========================================================================

class MobileAppInfoViewSet(viewsets.ModelViewSet):
    serializer_class = MobileAppInfoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['platform']

    def get_queryset(self):
        qs = MobileAppInfo.objects.all()
        p = self.request.query_params
        if p.get('platform'):
            qs = qs.filter(platform=p['platform'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 23. VALUE PROPOSITIONS
# ===========================================================================

class ValuePropositionViewSet(viewsets.ModelViewSet):
    serializer_class = ValuePropositionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = ValueProposition.objects.all()
        p = self.request.query_params
        if p.get('page'):
            qs = qs.filter(page=p['page'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 24. PRODUCTS (Corporate nav → Aaum Connect, Miisky, Svasth)
# ===========================================================================

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'tagline', 'description']
    ordering = ['position']

    def get_queryset(self):
        qs = Product.objects.all()
        p = self.request.query_params
        if p.get('product_type'):
            qs = qs.filter(product_type=p['product_type'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 25. SERVICES (Corporate nav → BID2SKY, SCM, AARMS)
# ===========================================================================

class ServiceViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'tagline', 'description']
    ordering = ['position']

    def get_queryset(self):
        qs = Service.objects.all()
        p = self.request.query_params
        if p.get('service_type'):
            qs = qs.filter(service_type=p['service_type'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 26. GST INFO
# ===========================================================================

class GSTInfoViewSet(viewsets.ModelViewSet):
    queryset = GSTInfo.objects.all()
    serializer_class = GSTInfoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]


# ===========================================================================
# 27. PRESENTATIONS
# ===========================================================================

class PresentationViewSet(viewsets.ModelViewSet):
    serializer_class = PresentationSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering = ['position']

    def get_queryset(self):
        qs = Presentation.objects.all()
        p = self.request.query_params
        if p.get('presentation_type'):
            qs = qs.filter(presentation_type=p['presentation_type'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs

    @action(detail=True, methods=['post'], url_path='download', permission_classes=[AllowAny])
    def log_download(self, request, pk=None):
        presentation = self.get_object()
        presentation.download_count += 1
        presentation.save(update_fields=['download_count'])
        PresentationDownloadLog.objects.create(
            presentation=presentation,
            downloader_name=request.data.get('name', ''),
            downloader_email=request.data.get('email', ''),
            downloader_company=request.data.get('company', ''),
            downloader_phone=request.data.get('phone', ''),
            ip_address=request.META.get('REMOTE_ADDR'),
        )
        file_url = str(presentation.file) if presentation.file else presentation.external_file_url
        return Response({'status': 'logged', 'download_count': presentation.download_count, 'file_url': file_url})


class PresentationDownloadLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PresentationDownloadLogSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['-downloaded_at']

    def get_queryset(self):
        qs = PresentationDownloadLog.objects.select_related('presentation')
        if self.request.query_params.get('presentation'):
            qs = qs.filter(presentation=self.request.query_params['presentation'])
        return qs


# ===========================================================================
# 28. WORKFLOW SUB-CATEGORIES (My Health, Nutritionist, Micro Kitchen, etc.)
# ===========================================================================

class WorkflowSubCategoryViewSet(viewsets.ModelViewSet):
    serializer_class = WorkflowSubCategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering = ['position']

    def get_queryset(self):
        qs = WorkflowSubCategory.objects.select_related('section')
        p = self.request.query_params
        if p.get('section'):
            qs = qs.filter(section=p['section'])
        if p.get('portal_type'):
            qs = qs.filter(portal_type=p['portal_type'])
        if p.get('primary_actor'):
            qs = qs.filter(primary_actor=p['primary_actor'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 29-32. PORTAL FEATURE ViewSets
# ===========================================================================

class MyHealthFeatureViewSet(viewsets.ModelViewSet):
    serializer_class = MyHealthFeatureSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = MyHealthFeature.objects.all()
        p = self.request.query_params
        if p.get('feature_type'):
            qs = qs.filter(feature_type=p['feature_type'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class NutritionistPortalFeatureViewSet(viewsets.ModelViewSet):
    serializer_class = NutritionistPortalFeatureSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = NutritionistPortalFeature.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class MicroKitchenPortalFeatureViewSet(viewsets.ModelViewSet):
    serializer_class = MicroKitchenPortalFeatureSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = MicroKitchenPortalFeature.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class SupplyChainPortalFeatureViewSet(viewsets.ModelViewSet):
    serializer_class = SupplyChainPortalFeatureSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = SupplyChainPortalFeature.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 33. AI CHAT SESSIONS
# ===========================================================================

class AIChatSessionViewSet(viewsets.ModelViewSet):
    serializer_class = AIChatSessionSerializer
    permission_classes = [AllowAny]
    ordering = ['-started_at']

    def get_queryset(self):
        qs = AIChatSession.objects.all()
        p = self.request.query_params
        if p.get('is_resolved') is not None:
            qs = qs.filter(is_resolved=_bool(p['is_resolved']))
        if p.get('escalated_to_human') is not None:
            qs = qs.filter(escalated_to_human=_bool(p['escalated_to_human']))
        return qs

    @action(detail=True, methods=['patch'], url_path='resolve', permission_classes=[IsAuthenticated])
    def resolve(self, request, pk=None):
        session = self.get_object()
        session.is_resolved = True
        session.ended_at = timezone.now()
        session.save(update_fields=['is_resolved', 'ended_at'])
        return Response({'status': 'resolved'})


# ===========================================================================
# 34. USER SUGGESTIONS
# ===========================================================================

class UserSuggestionViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'subject', 'suggestion']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.request.user and self.request.user.is_staff:
            return UserSuggestionAdminSerializer
        return UserSuggestionSerializer

    def get_queryset(self):
        qs = UserSuggestion.objects.all()
        p = self.request.query_params
        if p.get('category'):
            qs = qs.filter(category=p['category'])
        if p.get('status'):
            qs = qs.filter(status=p['status'])
        return qs

    def perform_create(self, serializer):
        ip = self.request.META.get('REMOTE_ADDR')
        serializer.save(ip_address=ip)

    @action(detail=True, methods=['patch'], url_path='respond', permission_classes=[IsAuthenticated])
    def respond(self, request, pk=None):
        suggestion = self.get_object()
        suggestion.admin_response = request.data.get('admin_response', '')
        suggestion.status = request.data.get('status', 'under_review')
        suggestion.responded_at = timezone.now()
        suggestion.save()
        return Response({'status': suggestion.status})


# ===========================================================================
# 35. WORKFLOW SUB-ITEMS (3rd-level nav)
# ===========================================================================

class WorkflowSubItemViewSet(viewsets.ModelViewSet):
    serializer_class = WorkflowSubItemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['label', 'description']
    ordering = ['sub_category', 'position']

    def get_queryset(self):
        qs = WorkflowSubItem.objects.select_related('sub_category')
        p = self.request.query_params
        if p.get('sub_category'):
            qs = qs.filter(sub_category=p['sub_category'])
        if p.get('role'):
            qs = qs.filter(role=p['role'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 36. GST LEADERS & CLIENTS
# ===========================================================================

class GSTLeaderViewSet(viewsets.ModelViewSet):
    serializer_class = GSTLeaderSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = GSTLeader.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


class GSTClientViewSet(viewsets.ModelViewSet):
    serializer_class = GSTClientSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'industry']
    ordering = ['position']

    def get_queryset(self):
        qs = GSTClient.objects.all()
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 37. LEGAL PAGES
# ===========================================================================

class LegalPageViewSet(viewsets.ModelViewSet):
    serializer_class = LegalPageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

    def get_queryset(self):
        qs = LegalPage.objects.all()
        p = self.request.query_params
        if p.get('page_type'):
            qs = qs.filter(page_type=p['page_type'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 38. COMPANY ABOUT SECTIONS
# ===========================================================================

class CompanyAboutSectionViewSet(viewsets.ModelViewSet):
    serializer_class = CompanyAboutSectionSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['position']

    def get_queryset(self):
        qs = CompanyAboutSection.objects.all()
        p = self.request.query_params
        if p.get('section_type'):
            qs = qs.filter(section_type=p['section_type'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs


# ===========================================================================
# 39. PATENTS
# ===========================================================================

class PatentViewSet(viewsets.ModelViewSet):
    serializer_class = PatentSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'patent_number', 'abstract', 'inventors']
    ordering = ['-filing_date']

    def get_queryset(self):
        qs = Patent.objects.select_related('device')
        p = self.request.query_params
        if p.get('status'):
            qs = qs.filter(status=p['status'])
        if p.get('device'):
            qs = qs.filter(device=p['device'])
        is_active = p.get('is_active')
        if is_active is not None:
            qs = qs.filter(is_active=_bool(is_active))
        else:
            qs = qs.filter(is_active=True)
        return qs
