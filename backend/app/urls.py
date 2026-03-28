from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import *

router = DefaultRouter()

# router.register(r'profile', ProfileView, basename='profile')
# router.register(r"companies", CompanyViewSet, basename="company")
router.register(r'country', CountryViewSet)
router.register(r'state', StateViewSet, basename='state')
router.register(r'city', CityViewSet, basename='city')
router.register(r'usermanagement', UserManagementViewSet, basename='usermanagement')
router.register(r'admin-patients', AdminPatientOverviewViewSet, basename='admin-patients')
router.register(r'adminpatients', AdminPatientOverviewViewSet, basename='adminpatients')
router.register(r'admin-microkitchen-patients', AdminMicroKitchenPatientsViewSet, basename='admin-microkitchen-patients')
router.register(r'admin-nutritionists', AdminNutritionistOverviewViewSet, basename='admin-nutritionists')
router.register(r'micro-kitchen-patients', MicroKitchenPatientsViewSet, basename='micro-kitchen-patients')
router.register(r'userquestionnaire', UserQuestionnaireViewSet, basename='userquestionnaire')
router.register(r'nutritionistprofile', NutritionistProfileViewSet, basename='nutritionistprofile')
router.register(r'microkitchenprofile', MicroKitchenProfileViewSet, basename='microkitchenprofile')
router.register(r'microkitchenfood', MicroKitchenFoodViewSet, basename='microkitchenfood')
router.register(r'microkitcheninspection', MicroKitchenInspectionViewSet, basename='microkitcheninspection')
router.register(r'deliveryprofile', DeliveryProfileViewSet, basename='deliveryprofile')
router.register(r'usernutritionistmapping', UserNutritionistMappingViewSet, basename='usernutritionistmapping')
router.register(r'patienthealthreport', PatientHealthReportViewSet, basename='patienthealthreport')
router.register(r'nutritionistreview', NutritionistReviewViewSet, basename='nutritionistreview')
router.register(r'usermeal', UserMealViewSet, basename='usermeal')
router.register(r'userdietplan', UserDietPlanViewSet, basename='userdietplan')
router.register(r'meetingrequest', MeetingRequestViewSet, basename='meetingrequest')
router.register(r'nutritionistrating', NutritionistRatingViewSet, basename='nutritionistrating')
router.register(r'microkitchenrating', MicroKitchenRatingViewSet, basename='microkitchenrating')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-item', CartItemViewSet, basename='cart-item')
router.register(r'order', OrderViewSet, basename='order')
router.register(r'deliverychargeslab', DeliveryChargeSlabViewSet, basename='deliverychargeslab')

# Support Ticket routes
router.register(r'ticketcategory', TicketCategoryViewSet, basename='ticketcategory')
router.register(r'supportticket', SupportTicketViewSet, basename='supportticket')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'ticketmessage', TicketMessageViewSet, basename='ticketmessage')
router.register(r'ticketattachment', TicketAttachmentViewSet, basename='ticketattachment')
router.register(r'nutritionist-reassignment', NutritionistReassignmentViewSet, basename='nutritionist-reassignment')
router.register(r'kitchen-reassignment', MicroKitchenReassignmentViewSet, basename='kitchen-reassignment')

# Food System routes
router.register(r'mealtype',      MealTypeViewSet)
router.register(r'packagingmaterial', PackagingMaterialViewSet)
router.register(r'cuisinetype',   CuisineTypeViewSet)
router.register(r'food',          FoodViewSet, basename='food')
router.register(r'ingredient',    IngredientViewSet)
router.register(r'unit',          UnitViewSet)
router.register(r'foodingredient', FoodIngredientViewSet, basename='foodingredient')
router.register(r'foodstep',      FoodStepViewSet,       basename='foodstep')
router.register(r'foodnutrition', FoodNutritionViewSet)
router.register(r'foodgroup', FoodGroupViewSet)
router.register(r'foodname', FoodNameViewSet)
router.register(r'foodproximate', FoodProximateViewSet)
router.register(r'foodwatersolublevitamins', FoodWaterSolubleVitaminsViewSet)
router.register(r'foodfatsolublevitamins', FoodFatSolubleVitaminsViewSet)
router.register(r'foodcarotenoids', FoodCarotenoidsViewSet)
router.register(r'foodminerals', FoodMineralsViewSet)
router.register(r'foodsugars', FoodSugarsViewSet)
router.register(r'foodaminoacids', FoodAminoAcidsViewSet)
router.register(r'foodorganicacids', FoodOrganicAcidsViewSet)
router.register(r'foodpolyphenols', FoodPolyphenolsViewSet)
router.register(r'foodphytochemicals', FoodPhytochemicalsViewSet)
router.register(r'foodfattyacidprofile', FoodFattyAcidProfileViewSet)
router.register(r'healthparameter', HealthParameterViewSet)
router.register(r'normalrange', NormalRangeForHealthParameterViewSet)
router.register(r'dietplan', DietPlanViewSet)
router.register(r'dietplanfeature', DietPlanFeatureViewSet)


router.register(r'profile', ProfileViewSet, basename='profile')


urlpatterns = [
    path('', include(router.urls)),
    path("dashboard-counts/admin/", views.AdminDashboardCountsView.as_view(), name="dashboard-counts-admin"),
    path("dashboard-counts/patient/", views.PatientDashboardCountsView.as_view(), name="dashboard-counts-patient"),
    path("dashboard-counts/nutrition/", views.NutritionDashboardCountsView.as_view(), name="dashboard-counts-nutrition"),
    path("dashboard-counts/microkitchen/", views.MicroKitchenDashboardCountsView.as_view(), name="dashboard-counts-microkitchen"),
    path("dashboard-counts/non-patient/", views.NonPatientDashboardCountsView.as_view(), name="dashboard-counts-non-patient"),
    # Admin micro-kitchen panels (no pagination for modal display)
    path(
        "admin-microkitchen-patients-nopaginate/",
        views.AdminMicroKitchenPatientsNoPaginationView.as_view(),
        name="admin-microkitchen-patients-nopaginate",
    ),
    path(
        "admin-microkitchen-inspections-nopaginate/",
        views.AdminMicroKitchenInspectionsNoPaginationView.as_view(),
        name="admin-microkitchen-inspections-nopaginate",
    ),
    path(
        "admin-microkitchen-reviews-nopaginate/",
        views.AdminMicroKitchenReviewsNoPaginationView.as_view(),
        name="admin-microkitchen-reviews-nopaginate",
    ),
    path(
        "admin-microkitchen-orders-nopaginate/",
        views.AdminMicroKitchenOrdersNoPaginationView.as_view(),
        name="admin-microkitchen-orders-nopaginate",
    ),
    path(
        "admin-microkitchen-foods-nopaginate/",
        views.AdminMicroKitchenFoodsNoPaginationView.as_view(),
        name="admin-microkitchen-foods-nopaginate",
    ),
    path(
        "admin-microkitchen-meals-nopaginate/",
        views.AdminMicroKitchenMealsNoPaginationView.as_view(),
        name="admin-microkitchen-meals-nopaginate",
    ),
    # Admin nutritionist panels (no pagination for modal display)
    path(
        "admin-nutritionist-patients-nopaginate/",
        views.AdminNutritionistPatientsNoPaginationView.as_view(),
        name="admin-nutritionist-patients-nopaginate",
    ),
    path(
        "admin-nutritionist-dietplans-nopaginate/",
        views.AdminNutritionistDietPlansNoPaginationView.as_view(),
        name="admin-nutritionist-dietplans-nopaginate",
    ),
    path(
        "admin-nutritionist-meals-nopaginate/",
        views.AdminNutritionistMealsNoPaginationView.as_view(),
        name="admin-nutritionist-meals-nopaginate",
    ),
    path(
        "admin-nutritionist-meetings-nopaginate/",
        views.AdminNutritionistMeetingsNoPaginationView.as_view(),
        name="admin-nutritionist-meetings-nopaginate",
    ),
    path('import/<str:module>/<str:submenu>/', UniversalImportView.as_view(), name='universal-import'),
    path('import/<str:module>/<str:submenu>/template/', TemplateDownloadView.as_view(), name='template-download'),
    path('register/', UserRegisterView.as_view(), name='register'),
    # path('userlist/', UserListView.as_view(), name='user_list'),
    path("admin/all-orders/", views.AdminAllOrdersView.as_view(), name="admin-all-orders"),
    path("admin/kitchen-payouts/", views.AdminKitchenPayoutsView.as_view(), name="admin-kitchen-payouts"),
    path(
        "nutrition/plan-payouts/",
        views.NutritionistPlanPayoutsView.as_view(),
        name="nutrition-plan-payouts",
    ),
    path(
        "microkitchen/plan-payouts/",
        views.MicroKitchenPlanPayoutsView.as_view(),
        name="microkitchen-plan-payouts",
    ),
    path(
        "admin/plan-payout-trackers/",
        views.AdminPayoutTrackersForPayView.as_view(),
        name="admin-plan-payout-trackers",
    ),
    path(
        "admin/plan-payout-transactions/",
        views.AdminPayoutTransactionListCreateView.as_view(),
        name="admin-plan-payout-transactions",
    ),
    # ...
    # path('userlist/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user_detail'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    # path('sendotp/', SendOtpView.as_view(),name='sendotp'),
    # path('verifyotp/', VerifyOTPView.as_view(),name='verifyotp'),
    # path('resetpassword/', ResetPasswordView.as_view(), name='resetpassword'),
    # path('updateuser/', UpdateUserView.as_view(), name='updateuser'),
]