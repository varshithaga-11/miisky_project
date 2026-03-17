from app.models import (
    Country, State, City, MealType, CuisineType, Food, 
    Ingredient, Unit, HealthParameter, NormalRangeForHealthParameter, 
    DietPlans, FoodIngredient
)
from app.serializers import (
    CountrySerializer, StateSerializer, CitySerializer, 
    MealTypeSerializer, CuisineTypeSerializer, FoodSerializer, 
    IngredientSerializer, UnitSerializer, HealthParameterSerializer, 
    NormalRangeForHealthParameterSerializer, DietPlanSerializer,
    FoodIngredientSerializer
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
        'cuisinetype': (CuisineType, CuisineTypeSerializer),
        'food': (Food, FoodSerializer),
        'ingredient': (Ingredient, IngredientSerializer),
        'unit': (Unit, UnitSerializer),
        'recipe': (FoodIngredient, FoodIngredientSerializer),
    },
    'health': {
        'healthparameter': (HealthParameter, HealthParameterSerializer),
        'normalrange': (NormalRangeForHealthParameter, NormalRangeForHealthParameterSerializer),
        'dietplan': (DietPlans, DietPlanSerializer),
    }
}

def get_model_and_serializer(module_name, submenu_name):
    module_data = MODEL_MAPPING.get(module_name.lower())
    if not module_data:
        return None, None
    
    return module_data.get(submenu_name.lower(), (None, None))
