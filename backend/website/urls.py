"""
URL routing for the Miisky SVASTH Website app.

All routes are prefixed with /api/website/ in the main urls.py.

Available endpoints:
  companyinfo/
  herobanner/
  navigationmenu/
  medicaldevicecategory/
  medicaldevice/
  devicefeature/
  researchpaper/
  healthfoodcategory/
  healthfoodproduct/
  healthfoodconceptcategory/
  healthfoodconceptarticle/
  workflowsection/
  workflowstep/
  blogcategory/
  blogtag/
  blogpost/
  blogcomment/
  reporttype/
  websitereport/
  callbackrequest/
  contactinquiry/
  newslettersubscriber/
  testimonial/
  faqcategory/
  faq/
  teammember/
  joblisting/
  jobapplication/
  gallerycategory/
  galleryitem/
  partner/
  visionmission/
  aichatbotconfig/
  statcounter/
  mobileappinfo/
  valueproposition/
  product/
  service/
  gstinfo/
  presentation/
  presentationdownloadlog/
  workflowsubcategory/
  myhealthfeature/
  nutritionistportalfeature/
  microkitchenportalfeature/
  supplychainportalfeature/
  aichatsession/
  usersuggestion/
  workflowsubitem/
  gstleader/
  gstclient/
  legalpage/
  companyaboutsection/
  patent/
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()

# Company & General
router.register(r'companyinfo', views.CompanyInfoViewSet, basename='companyinfo')
router.register(r'herobanner', views.HeroBannerViewSet, basename='herobanner')
router.register(r'navigationmenu', views.NavigationMenuViewSet, basename='navigationmenu')

# Medical Devices
router.register(r'medicaldevicecategory', views.MedicalDeviceCategoryViewSet, basename='medicaldevicecategory')
router.register(r'medicaldevice', views.MedicalDeviceViewSet, basename='medicaldevice')
router.register(r'devicefeature', views.DeviceFeatureViewSet, basename='devicefeature')
router.register(r'researchpaper', views.ResearchPaperViewSet, basename='researchpaper')

# Health Foods
router.register(r'healthfoodcategory', views.HealthFoodCategoryViewSet, basename='healthfoodcategory')
router.register(r'healthfoodproduct', views.HealthFoodProductViewSet, basename='healthfoodproduct')

# Health Food Concept
router.register(r'healthfoodconceptcategory', views.HealthFoodConceptCategoryViewSet, basename='healthfoodconceptcategory')
router.register(r'healthfoodconceptarticle', views.HealthFoodConceptArticleViewSet, basename='healthfoodconceptarticle')

# Workflow
router.register(r'workflowsection', views.WorkflowSectionViewSet, basename='workflowsection')
router.register(r'workflowstep', views.WorkflowStepViewSet, basename='workflowstep')

# Blog
router.register(r'blogcategory', views.BlogCategoryViewSet, basename='blogcategory')
router.register(r'blogtag', views.BlogTagViewSet, basename='blogtag')
router.register(r'blogpost', views.BlogPostViewSet, basename='blogpost')
router.register(r'blogcomment', views.BlogCommentViewSet, basename='blogcomment')

# Reports
router.register(r'reporttype', views.ReportTypeViewSet, basename='reporttype')
router.register(r'websitereport', views.WebsiteReportViewSet, basename='websitereport')

# Forms / Submissions
router.register(r'callbackrequest', views.CallbackRequestViewSet, basename='callbackrequest')
router.register(r'contactinquiry', views.ContactInquiryViewSet, basename='contactinquiry')
router.register(r'newslettersubscriber', views.NewsletterSubscriberViewSet, basename='newslettersubscriber')

# Trust & Engagement
router.register(r'testimonial', views.TestimonialViewSet, basename='testimonial')
router.register(r'faqcategory', views.FAQCategoryViewSet, basename='faqcategory')
router.register(r'faq', views.FAQViewSet, basename='faq')

# Team & Careers
router.register(r'teammember', views.TeamMemberViewSet, basename='teammember')
router.register(r'joblisting', views.JobListingViewSet, basename='joblisting')
router.register(r'jobapplication', views.JobApplicationViewSet, basename='jobapplication')

# Gallery
router.register(r'gallerycategory', views.GalleryCategoryViewSet, basename='gallerycategory')
router.register(r'galleryitem', views.GalleryItemViewSet, basename='galleryitem')

# Partners
router.register(r'partner', views.PartnerViewSet, basename='partner')

# About / Vision
router.register(r'visionmission', views.VisionMissionViewSet, basename='visionmission')

# Config & Misc
router.register(r'aichatbotconfig', views.AIChatbotConfigViewSet, basename='aichatbotconfig')
router.register(r'statcounter', views.StatCounterViewSet, basename='statcounter')
router.register(r'mobileappinfo', views.MobileAppInfoViewSet, basename='mobileappinfo')
router.register(r'valueproposition', views.ValuePropositionViewSet, basename='valueproposition')

# Products & Services (Corporate nav)
router.register(r'product', views.ProductViewSet, basename='product')
router.register(r'service', views.ServiceViewSet, basename='service')

# GST Info
router.register(r'gstinfo', views.GSTInfoViewSet, basename='gstinfo')

# Presentations
router.register(r'presentation', views.PresentationViewSet, basename='presentation')
router.register(r'presentationdownloadlog', views.PresentationDownloadLogViewSet, basename='presentationdownloadlog')

# Workflow Sub-Categories (SVASTH nav)
router.register(r'workflowsubcategory', views.WorkflowSubCategoryViewSet, basename='workflowsubcategory')

# Portal Features
router.register(r'myhealthfeature', views.MyHealthFeatureViewSet, basename='myhealthfeature')
router.register(r'nutritionistportalfeature', views.NutritionistPortalFeatureViewSet, basename='nutritionistportalfeature')
router.register(r'microkitchenportalfeature', views.MicroKitchenPortalFeatureViewSet, basename='microkitchenportalfeature')
router.register(r'supplychainportalfeature', views.SupplyChainPortalFeatureViewSet, basename='supplychainportalfeature')

# AI Chat Sessions
router.register(r'aichatsession', views.AIChatSessionViewSet, basename='aichatsession')

# User Suggestions
router.register(r'usersuggestion', views.UserSuggestionViewSet, basename='usersuggestion')

# Workflow Sub-Items (3rd-level nav)
router.register(r'workflowsubitem', views.WorkflowSubItemViewSet, basename='workflowsubitem')

# GST Leaders & Clients
router.register(r'gstleader', views.GSTLeaderViewSet, basename='gstleader')
router.register(r'gstclient', views.GSTClientViewSet, basename='gstclient')

# Legal, About Sections & Patents
router.register(r'legalpage', views.LegalPageViewSet, basename='legalpage')
router.register(r'companyaboutsection', views.CompanyAboutSectionViewSet, basename='companyaboutsection')
router.register(r'patent', views.PatentViewSet, basename='patent')

urlpatterns = [
    path('', include(router.urls)),
]
