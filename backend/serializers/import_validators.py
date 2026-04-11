from app.models import (
    Country, State, City, MealType, CuisineType, Food, 
    Ingredient, Unit, HealthParameter, NormalRangeForHealthParameter, 
    DietPlans, FoodIngredient, FoodStep,
    FoodGroup, FoodName, FoodProximate, FoodWaterSolubleVitamins,
    FoodFatSolubleVitamins, FoodCarotenoids, FoodMinerals, FoodSugars,
    FoodAminoAcids, FoodOrganicAcids, FoodPolyphenols, FoodPhytochemicals,
    FoodFattyAcidProfile, UserRegister,
    HealthConditionMaster, SymptomMaster, AutoimmuneMaster, DeficiencyMaster,
    DigestiveIssueMaster, SkinIssueMaster, HabitMaster, ActivityMaster
)
from app.serializers import (
    CountrySerializer, StateSerializer, CitySerializer, 
    MealTypeSerializer, CuisineTypeSerializer, FoodSerializer, 
    IngredientSerializer, UnitSerializer, HealthParameterSerializer, 
    NormalRangeForHealthParameterSerializer, DietPlanSerializer,
    FoodIngredientSerializer, FoodStepSerializer,
    FoodGroupSerializer, FoodNameSerializer, FoodProximateSerializer,
    FoodWaterSolubleVitaminsSerializer, FoodFatSolubleVitaminsSerializer,
    FoodCarotenoidsSerializer, FoodMineralsSerializer, FoodSugarsSerializer,
    FoodAminoAcidsSerializer, FoodOrganicAcidsSerializer, FoodPolyphenolsSerializer,
    FoodPhytochemicalsSerializer, FoodFattyAcidProfileSerializer,
    UserManagementSerializer,
    HealthConditionMasterSerializer, SymptomMasterSerializer, AutoimmuneMasterSerializer,
    DeficiencyMasterSerializer, DigestiveIssueMasterSerializer, SkinIssueMasterSerializer,
    HabitMasterSerializer, ActivityMasterSerializer
)

# Mapping of module + submenu to Model and Serializer
MODEL_MAPPING = {
    'location': {
        'country': (Country, CountrySerializer),
        'state': (State, StateSerializer),
        'city': (City, CitySerializer),
    },
    'auth': {
        'usermanagement': (UserRegister, UserManagementSerializer),
    },
    'food': {
        'mealtype': (MealType, MealTypeSerializer),
        'meal-type': (MealType, MealTypeSerializer),
        'cuisinetype': (CuisineType, CuisineTypeSerializer),
        'cuisine-type': (CuisineType, CuisineTypeSerializer),
        'food': (Food, FoodSerializer),
        'ingredient': (Ingredient, IngredientSerializer),
        'unit': (Unit, UnitSerializer),
        'recipe': (FoodIngredient, FoodIngredientSerializer),
        'food-step': (FoodStep, FoodStepSerializer),
        'foodgroup': (FoodGroup, FoodGroupSerializer),
        'food-group': (FoodGroup, FoodGroupSerializer),
        'foodname': (FoodName, FoodNameSerializer),
        'food-name': (FoodName, FoodNameSerializer),
        'foodproximate': (FoodProximate, FoodProximateSerializer),
        'food-proximate': (FoodProximate, FoodProximateSerializer),
        'foodwatersolublevitamins': (FoodWaterSolubleVitamins, FoodWaterSolubleVitaminsSerializer),
        'food-water-soluble-vitamins': (FoodWaterSolubleVitamins, FoodWaterSolubleVitaminsSerializer),
        'foodfatsolublevitamins': (FoodFatSolubleVitamins, FoodFatSolubleVitaminsSerializer),
        'food-fat-soluble-vitamins': (FoodFatSolubleVitamins, FoodFatSolubleVitaminsSerializer),
        'foodcarotenoids': (FoodCarotenoids, FoodCarotenoidsSerializer),
        'food-carotenoids': (FoodCarotenoids, FoodCarotenoidsSerializer),
        'foodminerals': (FoodMinerals, FoodMineralsSerializer),
        'food-minerals': (FoodMinerals, FoodMineralsSerializer),
        'foodsugars': (FoodSugars, FoodSugarsSerializer),
        'food-sugars': (FoodSugars, FoodSugarsSerializer),
        'foodaminoacids': (FoodAminoAcids, FoodAminoAcidsSerializer),
        'food-amino-acids': (FoodAminoAcids, FoodAminoAcidsSerializer),
        'foodorganicacids': (FoodOrganicAcids, FoodOrganicAcidsSerializer),
        'food-organic-acids': (FoodOrganicAcids, FoodOrganicAcidsSerializer),
        'foodpolyphenols': (FoodPolyphenols, FoodPolyphenolsSerializer),
        'food-polyphenols': (FoodPolyphenols, FoodPolyphenolsSerializer),
        'foodphytochemicals': (FoodPhytochemicals, FoodPhytochemicalsSerializer),
        'food-phytochemicals': (FoodPhytochemicals, FoodPhytochemicalsSerializer),
        'foodfattyacidprofile': (FoodFattyAcidProfile, FoodFattyAcidProfileSerializer),
        'food-fatty-acid-profile': (FoodFattyAcidProfile, FoodFattyAcidProfileSerializer),
    },
    'health': {
        'healthparameter': (HealthParameter, HealthParameterSerializer),
        'health-parameter': (HealthParameter, HealthParameterSerializer),
        'normalrange': (NormalRangeForHealthParameter, NormalRangeForHealthParameterSerializer),
        'normal-range': (NormalRangeForHealthParameter, NormalRangeForHealthParameterSerializer),
        'dietplan': (DietPlans, DietPlanSerializer),
        'diet-plan': (DietPlans, DietPlanSerializer),
    },
    'questionnaire': {
        'health-condition': (HealthConditionMaster, HealthConditionMasterSerializer),
        'symptom': (SymptomMaster, SymptomMasterSerializer),
        'autoimmune': (AutoimmuneMaster, AutoimmuneMasterSerializer),
        'deficiency': (DeficiencyMaster, DeficiencyMasterSerializer),
        'digestive-issue': (DigestiveIssueMaster, DigestiveIssueMasterSerializer),
        'skin-issue': (SkinIssueMaster, SkinIssueMasterSerializer),
        'habit': (HabitMaster, HabitMasterSerializer),
        'activity': (ActivityMaster, ActivityMasterSerializer),
    }
}

def get_model_and_serializer(module_name, submenu_name):
    module_data = MODEL_MAPPING.get(module_name.lower())
    if not module_data:
        return None, None
    
    return module_data.get(submenu_name.lower(), (None, None))
