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
router.register(r'admin-microkitchen-patients', AdminMicroKitchenPatientsViewSet, basename='admin-microkitchen-patients')
router.register(r'admin-nutritionists', AdminNutritionistOverviewViewSet, basename='admin-nutritionists')
router.register(r'admin-doctors', AdminDoctorOverviewViewSet, basename='admin-doctors')
router.register(r'admin-supply-chain', AdminSupplyChainOverviewViewSet, basename='admin-supply-chain')
router.register(
    r'admin-supply-chain-kitchen-team',
    AdminSupplyChainKitchenTeamViewSet,
    basename='admin-supply-chain-kitchen-team',
)
router.register(
    r'admin-supply-chain-plan-assignments',
    AdminSupplyChainPlanAssignmentsViewSet,
    basename='admin-supply-chain-plan-assignments',
)
router.register(
    r'admin-supply-chain-orders',
    AdminSupplyChainOrdersViewSet,
    basename='admin-supply-chain-orders',
)
router.register(
    r'admin-supply-chain-delivery-profile',
    AdminSupplyChainDeliveryProfileViewSet,
    basename='admin-supply-chain-delivery-profile',
)
router.register(
    r'admin-supply-chain-planned-leaves',
    AdminSupplyChainPlannedLeavesViewSet,
    basename='admin-supply-chain-planned-leaves',
)
router.register(
    r'admin-supply-chain-delivery-ratings',
    AdminSupplyChainDeliveryRatingsViewSet,
    basename='admin-supply-chain-delivery-ratings',
)
router.register(
    r'admin-supply-chain-earnings',
    AdminSupplyChainEarningsViewSet,
    basename='admin-supply-chain-earnings',
)
router.register(
    r'admin-supply-chain-tickets',
    AdminSupplyChainTicketsViewSet,
    basename='admin-supply-chain-tickets',
)
router.register(r'micro-kitchen-patients', MicroKitchenPatientsViewSet, basename='micro-kitchen-patients')
router.register(
    r'micro-kitchen-global-delivery-assignments',
    MicroKitchenGlobalDeliveryAssignmentViewSet,
    basename='micro-kitchen-global-delivery-assignments',
)
router.register(r'userquestionnaire', UserQuestionnaireViewSet, basename='userquestionnaire')
router.register(
    r'admin-questionnaire-questions',
    AdminQuestionnaireQuestionListViewSet,
    basename='admin-questionnaire-questions',
)
router.register(r'health-condition-master', HealthConditionMasterViewSet, basename='health-condition-master')
router.register(r'symptom-master', SymptomMasterViewSet, basename='symptom-master')
router.register(r'autoimmune-master', AutoimmuneMasterViewSet, basename='autoimmune-master')
router.register(r'deficiency-master', DeficiencyMasterViewSet, basename='deficiency-master')
router.register(r'digestive-issue-master', DigestiveIssueMasterViewSet, basename='digestive-issue-master')
router.register(r'skin-issue-master', SkinIssueMasterViewSet, basename='skin-issue-master')
router.register(r'habit-master', HabitMasterViewSet, basename='habit-master')
router.register(r'activity-master', ActivityMasterViewSet, basename='activity-master')
router.register(r'nutritionistprofile', NutritionistProfileViewSet, basename='nutritionistprofile')
router.register(r'microkitchenprofile', MicroKitchenProfileViewSet, basename='microkitchenprofile')
router.register(r'microkitchenfood', MicroKitchenFoodViewSet, basename='microkitchenfood')
router.register(r'microkitcheninspection', MicroKitchenInspectionViewSet, basename='microkitcheninspection')
router.register(r'deliveryprofile', DeliveryProfileViewSet, basename='deliveryprofile')
router.register(r'usernutritionistmapping', UserNutritionistMappingViewSet, basename='usernutritionistmapping')
router.register(r'patient-nutrition-mapping-summary', PatientNutritionMappingSummaryViewSet, basename='patient-nutrition-mapping-summary')
router.register(r'set-daily-meals', SetDailyMealsViewSet, basename='set-daily-meals')
router.register(r'patienthealthreport', PatientHealthReportViewSet, basename='patienthealthreport')
router.register(r'nutritionistreview', NutritionistReviewViewSet, basename='nutritionistreview')
router.register(r'usermeal', UserMealViewSet, basename='usermeal')
router.register(r'patient-unavailability', PatientUnavailabilityViewSet, basename='patient-unavailability')
router.register(r'userdietplan', UserDietPlanViewSet, basename='userdietplan')
router.register(r'patient-food-recommendation', PatientFoodRecommendationViewSet, basename='patient-food-recommendation')
router.register(r'meetingrequest', MeetingRequestViewSet, basename='meetingrequest')
router.register(r'nutritionistavailability', NutritionistAvailabilityViewSet, basename='nutritionistavailability')
router.register(r'nutritionistrating', NutritionistRatingViewSet, basename='nutritionistrating')
router.register(r'microkitchenrating', MicroKitchenRatingViewSet, basename='microkitchenrating')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'cart-item', CartItemViewSet, basename='cart-item')
router.register(r'order', OrderViewSet, basename='order')
router.register(r'deliverychargeslab', DeliveryChargeSlabViewSet, basename='deliverychargeslab')
router.register(r'delivery-slot', DeliverySlotKitchenViewSet, basename='delivery-slot')
router.register(r'plandeliveryassignment', DietPlanDeliveryAssignmentViewSet, basename='plandeliveryassignment')
router.register(r'mealdeliveryassignment', KitchenMealDeliveryViewSet, basename='mealdeliveryassignment')
router.register(r'supply-chain-leave', SupplyChainDeliveryLeaveViewSet, basename='supply-chain-leave')
router.register(r'micro-kitchen-delivery-team', MicroKitchenDeliveryTeamViewSet, basename='micro-kitchen-delivery-team')

# Support Ticket routes
router.register(r'ticketcategory', TicketCategoryViewSet, basename='ticketcategory')
router.register(r'supportticket', SupportTicketViewSet, basename='supportticket')
router.register(r'notifications', NotificationViewSet, basename='notifications')
router.register(r'ticketmessage', TicketMessageViewSet, basename='ticketmessage')
router.register(r'ticketattachment', TicketAttachmentViewSet, basename='ticketattachment')
router.register(r'nutritionist-reassignment', NutritionistReassignmentViewSet, basename='nutritionist-reassignment')
router.register(r'kitchen-reassignment', MicroKitchenReassignmentViewSet, basename='kitchen-reassignment')

# Food System routes
router.register(r'mealtype',      MealTypeViewSet,    basename='mealtype')
router.register(r'packagingmaterial', PackagingMaterialViewSet)
router.register(r'cuisinetype',   CuisineTypeViewSet, basename='cuisinetype')
router.register(r'food',          FoodViewSet, basename='food')
router.register(r'ingredient',    IngredientViewSet,  basename='ingredient')
router.register(r'unit',          UnitViewSet,        basename='unit')
router.register(r'foodingredient', FoodIngredientViewSet, basename='foodingredient')
router.register(r'foodstep',      FoodStepViewSet,       basename='foodstep')
router.register(r'foodnutrition', FoodNutritionViewSet)
router.register(r'foodbyid', FoodByIdViewSet, basename='foodbyid')
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
    path(
        "admin-questionnaire-questions/",
        AdminQuestionnaireQuestionListViewSet.as_view({"get": "list"}),
        name="admin-questionnaire-questions-list",
    ),
    path(
        "admin-questionnaire-questions/download/",
        AdminQuestionnaireQuestionListViewSet.as_view({"get": "download"}),
        name="admin-questionnaire-questions-download",
    ),
    path("delivery-feedback/", views.DeliveryFeedbackView.as_view(), name="delivery-feedback"),
    path("adminside/location/delete/", views.AdminLocationDeleteView.as_view(), name="location-delete"),
    path("adminside/questionnaire-master/delete/", views.AdminQuestionnaireMasterDeleteView.as_view(), name="questionnaire-master-delete"),
    path("adminside/food-management/delete/", views.AdminFoodManagementDeleteView.as_view(), name="food-management-delete"),
    path("microkitchen/delivery-feedback/", views.MicroKitchenDeliveryFeedbackView.as_view(), name="microkitchen-delivery-feedback"),
    path("microkitchen/delivery-feedback-list/", views.MicroKitchenDeliveryFeedbackListView.as_view(), name="microkitchen-delivery-feedback-list"),
    path("supplychain/delivery-feedback-list/", views.SupplyChainDeliveryFeedbackListView.as_view(), name="supplychain-delivery-feedback-list"),
    path('delivery-staff/', DeliveryStaffListView.as_view(), name='delivery-staff'),
    path('supply-chain-users/', SupplyChainUsersListView.as_view(), name='supply-chain-users'),
    path(
        "micro-kitchen-delivery-dashboard/summary/",
        MicroKitchenDeliveryDashboardSummaryAPIView.as_view(),
        name="micro-kitchen-delivery-dashboard-summary",
    ),
    path(
        "micro-kitchen-orders/",
        MicroKitchenOrdersViewSet.as_view({"get": "list"}),
        name="micro-kitchen-orders-list",
    ),
    path(
        "micro-kitchen-orders/<int:pk>/",
        MicroKitchenOrdersViewSet.as_view({"get": "retrieve"}),
        name="micro-kitchen-orders-detail",
    ),
    path(
        "usernutritionistmapping/all-nutritionists/",
        views.AdminAllNutritionistsViewSet.as_view({"get": "list"}),
        name="admin-all-nutritionists",
    ),
    # Admin order commission & snapshots (explicit routes — avoids router registration edge cases)
    path(
        "order-commission-config/",
        OrderCommissionConfigViewSet.as_view({"get": "list", "post": "create"}),
        name="order-commission-config-list",
    ),
    path(
        "order-commission-config/<int:pk>/",
        OrderCommissionConfigViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="order-commission-config-detail",
    ),
    path(
        "order-payment-snapshot/",
        OrderPaymentSnapshotAdminViewSet.as_view({"get": "list"}),
        name="order-payment-snapshot-list",
    ),
    path(
        "order-payment-snapshot/<int:pk>/",
        OrderPaymentSnapshotAdminViewSet.as_view({"get": "retrieve"}),
        name="order-payment-snapshot-detail",
    ),
    # Explicit routes (same ViewSet as before); ensures list/detail resolve even if router order varies.
    path(
        "supply-chain-assigned-orders/",
        SupplyChainAssignedOrdersViewSet.as_view({"get": "list"}),
        name="supply-chain-assigned-orders-list",
    ),
    path(
        "supply-chain-assigned-orders/<int:pk>/",
        SupplyChainAssignedOrdersViewSet.as_view({"get": "retrieve"}),
        name="supply-chain-assigned-orders-detail",
    ),
    path(
        "admin-supply-chain-hub-summary/",
        views.AdminSupplyChainHubSummaryView.as_view(),
        name="admin-supply-chain-hub-summary",
    ),
    path(
        "admin-supply-chain-kitchen-team-nopaginate/",
        views.AdminSupplyChainKitchenTeamNoPaginationView.as_view(),
        name="admin-supply-chain-kitchen-team-nopaginate",
    ),
    path(
        "admin-supply-chain-plan-assignments-nopaginate/",
        views.AdminSupplyChainPlanAssignmentsNoPaginationView.as_view(),
        name="admin-supply-chain-plan-assignments-nopaginate",
    ),
    path(
        "admin-supply-chain-orders-nopaginate/",
        views.AdminSupplyChainOrdersNoPaginationView.as_view(),
        name="admin-supply-chain-orders-nopaginate",
    ),
    path(
        "admin-supply-chain-daily-work-nopaginate/",
        views.AdminSupplyChainDailyWorkNoPaginationView.as_view(),
    ),
    path(
        "admin-supply-chain-planned-leaves-nopaginate/",
        views.AdminSupplyChainPlannedLeavesNoPaginationView.as_view(),
        name="admin-supply-chain-planned-leaves-nopaginate",
    ),
    path(
        "admin-supply-chain-delivery-ratings-nopaginate/",
        views.AdminSupplyChainDeliveryRatingsNoPaginationView.as_view(),
        name="admin-supply-chain-delivery-ratings-nopaginate",
    ),
    path(
        "admin-supply-chain-earnings-nopaginate/",
        views.AdminSupplyChainEarningsNoPaginationView.as_view(),
        name="admin-supply-chain-earnings-nopaginate",
    ),
    path(
        "admin-supply-chain-tickets-nopaginate/",
        views.AdminSupplyChainTicketsNoPaginationView.as_view(),
        name="admin-supply-chain-tickets-nopaginate",
    ),
    path("", include(router.urls)),
    path("current-user/", CurrentUserView.as_view(), name="current-user"),
    path("updateusernamepassword/", UserUpdateView.as_view(), name="updateusernamepassword"),
    path('sendotp/', SendOtpView.as_view(),name='sendotp'),
    path('verifyotp/', VerifyOTPView.as_view(),name='verifyotp'),
    path('resetpassword/', ResetPasswordView.as_view(), name='resetpassword'),
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
        "admin-microkitchen-delivery-ratings-nopaginate/",
        views.AdminMicroKitchenDeliveryRatingsNoPaginationView.as_view(),
        name="admin-microkitchen-delivery-ratings-nopaginate",
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
        "admin-microkitchen-payouts-nopaginate/",
        views.AdminMicroKitchenPayoutsNoPaginationView.as_view(),
        name="admin-microkitchen-payouts-nopaginate",
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
    path(
        "admin-microkitchen-delivery-team-nopaginate/",
        views.AdminMicroKitchenDeliveryTeamNoPaginationView.as_view(),
        name="admin-microkitchen-delivery-team-nopaginate",
    ),
    path(
        "admin-microkitchen-global-assignments-nopaginate/",
        views.AdminMicroKitchenGlobalAssignmentsNoPaginationView.as_view(),
        name="admin-microkitchen-global-assignments-nopaginate",
    ),
    path(
        "admin-microkitchen-meal-delivery-assignments-nopaginate/",
        views.AdminMicroKitchenMealDeliveryAssignmentsNoPaginationView.as_view(),
        name="admin-microkitchen-meal-delivery-assignments-nopaginate",
    ),
    path(
        "admin-microkitchen-delivery-profiles-nopaginate/",
        views.AdminMicroKitchenDeliveryProfilesNoPaginationView.as_view(),
        name="admin-microkitchen-delivery-profiles-nopaginate",
    ),
    path(
        "admin-microkitchen-planned-leaves-nopaginate/",
        views.AdminMicroKitchenPlannedLeavesNoPaginationView.as_view(),
        name="admin-microkitchen-planned-leaves-nopaginate",
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
    path(
        "admin-nutritionist-reviews-nopaginate/",
        views.AdminNutritionistReviewsNoPaginationView.as_view(),
        name="admin-nutritionist-reviews-nopaginate",
    ),
    path(
        "admin-nutritionist-tickets-nopaginate/",
        views.AdminNutritionistTicketsNoPaginationView.as_view(),
        name="admin-nutritionist-tickets-nopaginate",
    ),
    path(
        "admin-nutritionist-payouts-nopaginate/",
        views.AdminNutritionistPayoutsNoPaginationView.as_view(),
        name="admin-nutritionist-payouts-nopaginate",
    ),
    path(
        "admin-doctor-patient-comments-nopaginate/",
        views.AdminDoctorPatientCommentsNoPaginationView.as_view(),
        name="admin-doctor-patient-comments-nopaginate",
    ),
    path(
        "admin-doctor-patients/",
        views.AdminDoctorPatientsPaginatedView.as_view(),
        name="admin-doctor-patients",
    ),
    path(
        "admin-doctor-patient-comments/",
        views.AdminDoctorPatientCommentsPaginatedView.as_view(),
        name="admin-doctor-patient-comments",
    ),
    # Admin patient panels (no pagination for modal display)
    path(
        "admin-patient-dietplans-nopaginate/",
        views.AdminPatientDietPlansNoPaginationView.as_view(),
        name="admin-patient-dietplans-nopaginate",
    ),
    path(
        "admin-patient-meetings-nopaginate/",
        views.AdminPatientMeetingsNoPaginationView.as_view(),
        name="admin-patient-meetings-nopaginate",
    ),
    path(
        "admin-patient-tickets-nopaginate/",
        views.AdminPatientTicketsNoPaginationView.as_view(),
        name="admin-patient-tickets-nopaginate",
    ),
    path(
        "admin-patient-nutritionist-ratings-nopaginate/",
        views.AdminPatientNutritionistRatingsNoPaginationView.as_view(),
        name="admin-patient-nutritionist-ratings-nopaginate",
    ),
    path(
        "admin-patient-kitchen-ratings-nopaginate/",
        views.AdminPatientKitchenRatingsNoPaginationView.as_view(),
        name="admin-patient-kitchen-ratings-nopaginate",
    ),
    path(
        "admin-order-payments-nopaginate/",
        views.AdminOrderPaymentsNoPaginationView.as_view(),
        name="admin-order-payments-nopaginate",
    ),
    path('import/<str:module>/<str:submenu>/', UniversalImportView.as_view(), name='universal-import'),
    path('import/<str:module>/<str:submenu>/template/', TemplateDownloadView.as_view(), name='template-download'),
    path('register/', UserRegisterView.as_view(), name='register'),
    # path('userlist/', UserListView.as_view(), name='user_list'),
    path("admin/patient-orders-summary/", views.AdminOrdersSummaryView.as_view(), name="admin-patient-orders-summary"),
    path("admin/patient-orders-details/<int:pk>/", views.AdminOrdersDetailView.as_view(), name="admin-patient-orders-details"),
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
        "microkitchen/order-payment-snapshots/",
        views.MicroKitchenOrderPaymentSnapshotsView.as_view(),
        name="microkitchen-order-payment-snapshots",
    ),
    path(
        "supply-chain/delivery-earnings/",
        views.SupplyChainDeliveryEarningsListView.as_view(),
        name="supply-chain-delivery-earnings",
    ),
    path(
        "supply-chain/order-delivery-receipt/",
        views.SupplyChainOrderDeliveryReceiptUpsertView.as_view(),
        name="supply-chain-order-delivery-receipt",
    ),
    path(
        "microkitchen/supply-chain-payouts/",
        views.MicroKitchenSupplyChainPayoutListCreateView.as_view(),
        name="microkitchen-supply-chain-payouts",
    ),
    path(
        "microkitchen/supply-chain-payouts/<int:pk>/",
        views.MicroKitchenSupplyChainPayoutDetailView.as_view(),
        name="microkitchen-supply-chain-payout-detail",
    ),
    path(
        "supply-chain/payout-earnings/",
        views.SupplyChainPayoutEarningsListView.as_view(),
        name="supply-chain-payout-earnings",
    ),
    path(
        "supply-chain/payout-earnings/<int:pk>/proof/",
        views.SupplyChainPayoutProofUpsertView.as_view(),
        name="supply-chain-payout-earnings-proof",
    ),
    path(
        "admin/plan-payout-trackers/",
        views.AdminPayoutTrackersForPayView.as_view(),
        name="admin-plan-payout-trackers",
    ),
    path(
        "admin/plan-payout-patients/",
        views.AdminPayoutPatientsWithTrackersView.as_view(),
        name="admin-plan-payout-patients",
    ),
    path(
        "admin/plan-payout-transactions/",
        views.AdminPayoutTransactionListCreateView.as_view(),
        name="admin-plan-payout-transactions",
    ),
    path(
        "partner/plan-payout-transactions/",
        views.PartnerPayoutTransactionListView.as_view(),
        name="partner-plan-payout-transactions",
    ),
    path(
        "admin/plan-payments-overview/",
        views.AdminPlanPaymentsOverviewView.as_view(),
        name="admin-plan-payments-overview",
    ),
    path(
        "admin/nutrition-allotted-plan-payouts/",
        views.AdminNutritionAllottedPlanPayoutsView.as_view(),
        name="admin-nutrition-allotted-plan-payouts",
    ),
    path(
        "admin/microkitchen-allotted-plan-payouts/",
        views.AdminMicroKitchenAllottedPlanPayoutsView.as_view(),
        name="admin-microkitchen-allotted-plan-payouts",
    ),
    path(
        "admin/patient-microkitchen-distances/<int:patient_id>/",
        PatientToMicroKitchenDistanceView.as_view(),
        name="patient-microkitchen-distances",
    ),
    # ...
    # path('userlist/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user_detail'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    path("patient/service-providers/", views.PatientServiceProvidersView.as_view(), name="patient-service-providers"),
    path("expert/service-providers/", views.ExpertServiceProvidersView.as_view(), name="expert-service-providers"),
    # path('sendotp/', SendOtpView.as_view(),name='sendotp'),
    # path('verifyotp/', VerifyOTPView.as_view(),name='verifyotp'),
    # path('resetpassword/', ResetPasswordView.as_view(), name='resetpassword'),
    # path('updateuser/', UpdateUserView.as_view(), name='updateuser'),
]