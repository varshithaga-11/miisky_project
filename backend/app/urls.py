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
router.register(r'userquestionnaire', UserQuestionnaireViewSet, basename='userquestionnaire')
router.register(r'nutritionistprofile', NutritionistProfileViewSet, basename='nutritionistprofile')
router.register(r'microkitchenprofile', MicroKitchenProfileViewSet, basename='microkitchenprofile')
router.register(r'microkitcheninspection', MicroKitchenInspectionViewSet, basename='microkitcheninspection')
router.register(r'deliveryprofile', DeliveryProfileViewSet, basename='deliveryprofile')
router.register(r'usernutritionistmapping', UserNutritionistMappingViewSet, basename='usernutritionistmapping')
router.register(r'patienthealthreport', PatientHealthReportViewSet, basename='patienthealthreport')
router.register(r'nutritionistreview', NutritionistReviewViewSet, basename='nutritionistreview')
router.register(r'usermeal', UserMealViewSet, basename='usermeal')
router.register(r'userdietplan', UserDietPlanViewSet, basename='userdietplan')
router.register(r'meetingrequest', MeetingRequestViewSet, basename='meetingrequest')
router.register(r'nutritionistrating', NutritionistRatingViewSet, basename='nutritionistrating')
router.register(r'usermicrokitchenmapping', UserMicroKitchenMappingViewSet, basename='usermicrokitchenmapping')

# Food System routes
router.register(r'mealtype',      MealTypeViewSet)
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
    path('import/<str:module>/<str:submenu>/', UniversalImportView.as_view(), name='universal-import'),
    path('import/<str:module>/<str:submenu>/template/', TemplateDownloadView.as_view(), name='template-download'),
    path('register/', UserRegisterView.as_view(), name='register'),
    # path('userlist/', UserListView.as_view(), name='user_list'),
    # ...
    # path('userlist/<int:pk>/', UserRetrieveUpdateDestroyView.as_view(), name='user_detail'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', RefreshTokenView.as_view(), name='token_refresh'),
    # path('sendotp/', SendOtpView.as_view(),name='sendotp'),
    # path('verifyotp/', VerifyOTPView.as_view(),name='verifyotp'),
    # path('resetpassword/', ResetPasswordView.as_view(), name='resetpassword'),
    # path('updateuser/', UpdateUserView.as_view(), name='updateuser'),
]