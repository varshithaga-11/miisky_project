from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Company & General
router.register(r'companyinfo', views.CompanyInfoViewSet, basename='companyinfo')
router.register(r'herobanner', views.HeroBannerViewSet, basename='herobanner')


# Medical Devices
router.register(r'medicaldevicecategory', views.MedicalDeviceCategoryViewSet, basename='medicaldevicecategory')
router.register(r'medicaldevice', views.MedicalDeviceViewSet, basename='medicaldevice')
router.register(r'devicefeature', views.DeviceFeatureViewSet, basename='devicefeature')
router.register(r'researchpaper', views.ResearchPaperViewSet, basename='researchpaper')

# Health Foods


# Blog
router.register(r'blogcategory', views.BlogCategoryViewSet, basename='blogcategory')
router.register(r'blogtag', views.BlogTagViewSet, basename='blogtag')
router.register(r'blogpost', views.BlogPostViewSet, basename='blogpost')
router.register(r'blogcomment', views.BlogCommentViewSet, basename='blogcomment')

# Reports
router.register(r'reporttype', views.ReportTypeViewSet, basename='reporttype')
router.register(r'websitereport', views.WebsiteReportViewSet, basename='websitereport')

# Forms / Submissions


# Trust & Engagement

router.register(r'faqcategory', views.FAQCategoryViewSet, basename='faqcategory')
router.register(r'faq', views.FAQViewSet, basename='faq')

# Team & Careers
router.register(r'department', views.DepartmentViewSet, basename='department')
router.register(r'teammember', views.TeamMemberViewSet, basename='teammember')
router.register(r'joblisting', views.JobListingViewSet, basename='joblisting')
router.register(r'jobapplication', views.JobApplicationViewSet, basename='jobapplication')

# Gallery
router.register(r'gallerycategory', views.GalleryCategoryViewSet, basename='gallerycategory')
router.register(r'galleryitem', views.GalleryItemViewSet, basename='galleryitem')

# Partners
router.register(r'partner', views.PartnerViewSet, basename='partner')

urlpatterns = [
    path('', include(router.urls)),
]
