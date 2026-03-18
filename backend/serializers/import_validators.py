from app.models import (
    Country, State, City, MealType, CuisineType, Food, 
    Ingredient, Unit, HealthParameter, NormalRangeForHealthParameter, 
    DietPlans, FoodIngredient, FoodStep
)
from app.serializers import (
    CountrySerializer, StateSerializer, CitySerializer, 
    MealTypeSerializer, CuisineTypeSerializer, FoodSerializer, 
    IngredientSerializer, UnitSerializer, HealthParameterSerializer, 
    NormalRangeForHealthParameterSerializer, DietPlanSerializer,
    FoodIngredientSerializer, FoodStepSerializer
)

# Mapping of module + submenu to Model and Serializer
MODEL_MAPPING = {
    'location': {
        'country': (Country, CountrySerializer),
        'state': (State, StateSerializer),
        'city': (City, CitySerializer),
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
    },
    'health': {
        'healthparameter': (HealthParameter, HealthParameterSerializer),
        'health-parameter': (HealthParameter, HealthParameterSerializer),
        'normalrange': (NormalRangeForHealthParameter, NormalRangeForHealthParameterSerializer),
        'normal-range': (NormalRangeForHealthParameter, NormalRangeForHealthParameterSerializer),
        'dietplan': (DietPlans, DietPlanSerializer),
        'diet-plan': (DietPlans, DietPlanSerializer),
    }
}

def get_model_and_serializer(module_name, submenu_name):
    module_data = MODEL_MAPPING.get(module_name.lower())
    if not module_data:
        return None, None
    
    return module_data.get(submenu_name.lower(), (None, None))
