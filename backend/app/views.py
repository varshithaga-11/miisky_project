from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.conf import settings
from django.http import FileResponse, HttpResponse
import csv
from django.utils import timezone
from django.contrib.auth.hashers import make_password
import os
import random
from rest_framework import status

from .models import *
from .serializers import *

import os
from rest_framework.decorators import action
from .utils.file_parsers import get_file_parser
from .services.import_service import ImportService

class Pagination(PageNumberPagination):
    page_query_param = "page"
    page_size_query_param = "limit"
    page_size = 10
    max_page_size = 100

    def get_paginated_response(self, data):
        current_page = self.page.number
        total_pages = self.page.paginator.num_pages

        next_page = self.page.next_page_number() if self.page.has_next() else None
        previous_page = self.page.previous_page_number() if self.page.has_previous() else None

        return Response({
            "count": self.page.paginator.count,
            "next": next_page,            # ✅ numeric next
            "previous": previous_page,    # ✅ numeric previous
            "current_page": current_page,
            "total_pages": total_pages,
            "results": data,
        })



# Create your views here.
class UserRegisterView(APIView):
    permission_classes = [AllowAny]  
    
    def post(self, request):
        try:
            serializer = UserRegisterSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                return Response({
                    "status": "success",
                    "response_code": status.HTTP_201_CREATED,
                    "message": "User registered successfully",
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email,
                        "role": user.role,
                        "created_by": user.created_by.id if user.created_by else None
                    }
                })
            return Response({
                "status": "failed",
                "message": serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            message = str(e)
            return Response({
                "status": "failed",
                "message": message
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
 

class LoginView(APIView):
    permission_classes = [AllowAny] 
    
    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                return Response({"status":"success","message":"User logged in successfully","tokens":serializer.validated_data})
            return Response({"status":"failed","message":serializer.errors}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            message = str(e)
            return Response({"status":"failed","message":message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class RefreshTokenView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        try:
            serializer = RefreshTokenSerializer(data=request.data)
            if serializer.is_valid():
                return Response(serializer.validated_data)
            return Response({"status":"failed","message":serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            message = str(e)
            return Response({"status":"failed","message":message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProfileView(viewsets.ModelViewSet):
    # permission_classes = [IsAuthenticated]
    queryset = UserRegister.objects.all()
    serializer_class = ProfileSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'mobile']


class CountryViewSet(viewsets.ModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class StateViewSet(viewsets.ModelViewSet):
    queryset = State.objects.all()
    serializer_class = StateSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class CityViewSet(viewsets.ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


# ── Food System ViewSets ───────────────────────────────────────────────────────

class MealTypeViewSet(viewsets.ModelViewSet):
    """
    CRUD for meal types.
    Endpoints:
        GET    /app/mealtype/       → list all types
        POST   /app/mealtype/       → create new type
        GET    /app/mealtype/{id}/  → retrieve single
        PUT    /app/mealtype/{id}/  → update
        DELETE /app/mealtype/{id}/  → delete
    """
    queryset = MealType.objects.all()
    serializer_class = MealTypeSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    permission_classes = [AllowAny]


class CuisineTypeViewSet(viewsets.ModelViewSet):
    queryset = CuisineType.objects.all()
    serializer_class = CuisineTypeSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    permission_classes = [AllowAny]


class FoodViewSet(viewsets.ModelViewSet):
    """
    CRUD for foods. Returns nested ingredients and steps on detail view.
    Endpoints:
        GET    /app/food/       → list all foods (with nested ingredients & steps)
        POST   /app/food/       → create food
        GET    /app/food/{id}/  → retrieve food detail
        PUT    /app/food/{id}/  → update
        DELETE /app/food/{id}/  → delete
    """
    queryset = Food.objects.prefetch_related(
        'meal_types',
        'cuisine_types',
        'foodingredient_set__ingredient',
        'foodingredient_set__unit',
        'foodstep_set',
        'nutrition'
    ).all()
    serializer_class = FoodSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class FoodNutritionViewSet(viewsets.ModelViewSet):
    queryset = FoodNutrition.objects.all()
    serializer_class = FoodNutritionSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['food__name']


class IngredientViewSet(viewsets.ModelViewSet):
    """
    CRUD for ingredients.
    Endpoints: /app/ingredient/
    """
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class UnitViewSet(viewsets.ModelViewSet):
    """
    CRUD for units (Gram, Cup, Tablespoon, etc.).
    Endpoints: /app/unit/
    """
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class FoodIngredientViewSet(viewsets.ModelViewSet):
    """
    Links a food to its ingredients with quantity and unit.
    Endpoints: /app/foodingredient/
    Filter by food: /app/foodingredient/?food=<id>
    """
    serializer_class = FoodIngredientSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food__name', 'ingredient__name']

    def get_queryset(self):
        qs = FoodIngredient.objects.select_related(
            'food', 'ingredient', 'unit'
        ).all()
        food_id = self.request.query_params.get('food')
        if food_id:
            qs = qs.filter(food_id=food_id)
        return qs


class FoodStepViewSet(viewsets.ModelViewSet):
    """
    Step-by-step cooking instructions for a food.
    Endpoints: /app/foodstep/
    Filter by food: /app/foodstep/?food=<id>
    """
    serializer_class = FoodStepSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food__name', 'instruction']

    def get_queryset(self):
        qs = FoodStep.objects.select_related('food').all()
        food_id = self.request.query_params.get('food')
        if food_id:
            qs = qs.filter(food_id=food_id)
        return qs


class HealthParameterViewSet(viewsets.ModelViewSet):
    queryset = HealthParameter.objects.all()
    serializer_class = HealthParameterSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user if self.request.user.is_authenticated else None)


class NormalRangeForHealthParameterViewSet(viewsets.ModelViewSet):
    queryset = NormalRangeForHealthParameter.objects.all()
    serializer_class = NormalRangeForHealthParameterSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['health_parameter__name', 'raw_value', 'unit', 'remarks']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)


class DietPlanViewSet(viewsets.ModelViewSet):
    queryset = DietPlans.objects.all()
    serializer_class = DietPlanSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'code']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user if self.request.user.is_authenticated else None)


class DietPlanFeatureViewSet(viewsets.ModelViewSet):
    queryset = DietPlanFeature.objects.all()
    serializer_class = DietPlanFeatureSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['feature', 'diet_plan__title']


class UniversalImportView(APIView):
    """
    Universal Import API for Location, Food, and Health modules.
    Endpoint: /api/<module>/<submenu>/import/
    """
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [AllowAny] # Adjust as needed

    def post(self, request, module, submenu):
        file_obj = request.data.get('file')
        if not file_obj:
            return Response({"success": False, "message": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

        file_name = file_obj.name
        file_extension = os.path.splitext(file_name)[1].lower()

        try:
            parser = get_file_parser(file_extension)
            file_content = file_obj.read()
            data = parser(file_content)
        except ValueError as e:
            return Response({"success": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"success": False, "message": f"Error parsing file: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        action = request.data.get('action', 'analyse')
        result = ImportService.import_data(module, submenu, data, action=action)
        
        # Always return 200 for analysis so frontend can show the results table
        # For 'submit', we return 200 but results['success'] will be false if it failed
        return Response(result, status=status.HTTP_200_OK)

class TemplateDownloadView(APIView):
    """
    API to download sample Excel/CSV templates for specific modules and submenus.
    Endpoint: /api/import/<module>/<submenu>/template/
    """
    permission_classes = [AllowAny]

    def get(self, request, module, submenu):
        from openpyxl import Workbook
        from io import BytesIO
        
        # Define headers for each submenu based on available fields
        templates = {
            "location": {
                "country": ["name"],
                "state": ["name", "country_name"],
                "city": ["name", "state_name", "country_name"]
            },
            "food": {
                "meal-type": ["name"],
                "mealtype": ["name"],
                "cuisine-type": ["name"],
                "cuisinetype": ["name"],
                "food": ["name", "description", "meal_type_names", "cuisine_type_names", 
                         "calories", "protein", "carbs", "fat", "fiber", "serving_size",
                         "glycemic_index", "sugar", "saturated_fat", "trans_fat", "cholesterol",
                         "sodium", "potassium", "calcium", "iron", 
                         "vitamin_a", "vitamin_c", "vitamin_d", "vitamin_b12"],
                "unit": ["name"],
                "ingredient": ["name"],
                "recipe": ["food_name", "ingredient_name", "quantity", "unit_name", "notes", "steps"],
                "food-step": ["food_name", "step_number", "instruction"]
            },
            "health": {
                "health-parameter": ["name"],
                "healthparameter": ["name"],
                "normal-range": ["health_parameter_name", "raw_value", "min_value", "max_value", "unit", "reference_text", "qualitative_value", "remarks"],
                "normalrange": ["health_parameter_name", "raw_value", "min_value", "max_value", "unit", "reference_text", "qualitative_value", "remarks"],
                "diet-plan": ["title", "code", "amount", "discount_amount", "no_of_days"],
                "dietplan": ["title", "code", "amount", "discount_amount", "no_of_days"]
            }
        }

        module_templates = templates.get(module, {})
        headers = module_templates.get(submenu, ["name"])

        # Create Excel Workbook
        wb = Workbook()
        ws = wb.active
        ws.title = f"{submenu.replace('-', ' ').title()} Template"
        
        # Add Headers
        ws.append(headers)
        
        # Add 10 sample rows for each template
        sample_rows = {
            "country": [
                ["India"], ["United States"], ["Canada"], ["Australia"], ["Germany"],
                ["Brazil"], ["Japan"], ["South Africa"], ["France"], ["Italy"]
            ],
            "state": [
                ["Karnataka", "India"], ["California", "United States"], ["Ontario", "Canada"], ["Queensland", "Australia"], ["Bavaria", "Germany"],
                ["Sao Paulo", "Brazil"], ["Tokyo", "Japan"], ["Gauteng", "South Africa"], ["Île-de-France", "France"], ["Lombardy", "Italy"]
            ],
            "city": [
                ["Bangalore", "Karnataka", "India"], ["Los Angeles", "California", "United States"], ["Toronto", "Ontario", "Canada"], ["Brisbane", "Queensland", "Australia"], ["Munich", "Bavaria", "Germany"],
                ["São Paulo", "Sao Paulo", "Brazil"], ["Tokyo", "Tokyo", "Japan"], ["Johannesburg", "Gauteng", "South Africa"], ["Paris", "Île-de-France", "France"], ["Milan", "Lombardy", "Italy"]
            ],
            "meal-type": [
                ["Breakfast"], ["Lunch"], ["Dinner"], ["Snack"], ["Brunch"],
                ["Tea"], ["Supper"], ["Late Night"], ["Dessert"], ["Appetizer"]
            ],
            "mealtype": [
                ["Breakfast"], ["Lunch"], ["Dinner"], ["Snack"], ["Brunch"],
                ["Tea"], ["Supper"], ["Late Night"], ["Dessert"], ["Appetizer"]
            ],
            "cuisine-type": [
                ["South Indian"], ["North Indian"], ["Italian"], ["Chinese"], ["Mexican"],
                ["French"], ["Japanese"], ["Thai"], ["American"], ["Mediterranean"]
            ],
            "cuisinetype": [
                ["South Indian"], ["North Indian"], ["Italian"], ["Chinese"], ["Mexican"],
                ["French"], ["Japanese"], ["Thai"], ["American"], ["Mediterranean"]
            ],
            "food": [
                ["Masala Dosa", "Crispy rice crepe with potato filling", "Breakfast, Snacks", "South Indian", "350", "8", "50", "12", "4", "1 plate", "55", "2", "1.5", "0", "0", "450", "150", "30", "1.5", "0", "0", "0", "0"],
                ["Pizza Margherita", "Classic Italian pizza with tomato and mozzarella", "Lunch, Dinner", "Italian", "300", "12", "40", "10", "2", "1 slice", "60", "3", "2", "0", "0", "500", "200", "35", "2", "0", "0", "0", "0"],
                ["Sushi", "Japanese rice rolls with fish", "Lunch, Dinner", "Japanese", "250", "15", "35", "5", "1", "6 pieces", "30", "1", "0.5", "0", "0", "400", "100", "20", "1", "0", "0", "0", "0"],
                ["Tacos", "Mexican corn tortillas with filling", "Lunch, Dinner", "Mexican", "220", "10", "30", "7", "2", "2 tacos", "25", "1", "0.8", "0", "0", "350", "90", "18", "1", "0", "0", "0", "0"],
                ["Croissant", "French buttery pastry", "Breakfast, Snack", "French", "180", "4", "20", "9", "1", "1 piece", "15", "0.5", "0.3", "0", "0", "200", "50", "10", "0.5", "0", "0", "0", "0"],
                ["Pad Thai", "Thai stir-fried noodles", "Lunch, Dinner", "Thai", "400", "14", "60", "12", "3", "1 plate", "70", "2", "1.7", "0", "0", "600", "180", "40", "2", "0", "0", "0", "0"],
                ["Cheeseburger", "American beef burger with cheese", "Lunch, Dinner", "American", "500", "20", "45", "25", "2", "1 burger", "80", "4", "2.5", "0", "0", "700", "250", "50", "3", "0", "0", "0", "0"],
                ["Green Salad", "Fresh mixed greens", "Lunch, Dinner", "Mediterranean", "120", "3", "15", "4", "2", "1 bowl", "10", "0.2", "0.1", "0", "0", "100", "40", "8", "0.3", "0", "0", "0", "0"],
                ["Spring Rolls", "Chinese crispy rolls with vegetables", "Snack, Appetizer", "Chinese", "160", "5", "20", "6", "1", "2 rolls", "18", "0.7", "0.4", "0", "0", "220", "60", "12", "0.6", "0", "0", "0", "0"],
                ["Ramen", "Japanese noodle soup", "Lunch, Dinner", "Japanese", "380", "13", "55", "8", "2", "1 bowl", "65", "2.2", "1.1", "0", "0", "520", "170", "32", "1.8", "0", "0", "0", "0"]
            ],
            "unit": [
                ["Gram"], ["Kilogram"], ["Liter"], ["Milliliter"], ["Tablespoon"],
                ["Teaspoon"], ["Cup"], ["Piece"], ["Slice"], ["Bowl"]
            ],
            "ingredient": [
                ["Rice"], ["Tomato"], ["Mozzarella"], ["Fish"], ["Corn"],
                ["Butter"], ["Noodles"], ["Beef"], ["Lettuce"], ["Carrot"]
            ],
            "recipe": [
                ["Masala Dosa", "Rice", "200", "Gram", "Soaked and ground", "1. Soak rice and urad dal for 6 hours; 2. Grind to paste; 3. Cook on tawa"],
                ["Pizza Margherita", "Tomato", "100", "Gram", "Sliced", "1. Prepare dough; 2. Add toppings; 3. Bake"],
                ["Sushi", "Fish", "50", "Gram", "Fresh", "1. Cook rice; 2. Slice fish; 3. Roll sushi"],
                ["Tacos", "Corn", "80", "Gram", "Roasted", "1. Prepare tortillas; 2. Add filling; 3. Serve"],
                ["Croissant", "Butter", "60", "Gram", "Chilled", "1. Prepare dough; 2. Add butter; 3. Bake"],
                ["Pad Thai", "Noodles", "150", "Gram", "Boiled", "1. Prepare sauce; 2. Stir-fry noodles; 3. Serve"],
                ["Cheeseburger", "Beef", "120", "Gram", "Grilled", "1. Prepare patty; 2. Add cheese; 3. Assemble burger"],
                ["Green Salad", "Lettuce", "50", "Gram", "Fresh", "1. Wash greens; 2. Chop vegetables; 3. Toss salad"],
                ["Spring Rolls", "Carrot", "40", "Gram", "Julienned", "1. Prepare filling; 2. Roll; 3. Fry"],
                ["Ramen", "Noodles", "100", "Gram", "Boiled", "1. Prepare broth; 2. Cook noodles; 3. Assemble bowl"]
            ],
            "food-step": [
                ["Masala Dosa", "1", "Soak rice and urad dal for 6 hours."],
                ["Pizza Margherita", "1", "Prepare dough and let rise."],
                ["Sushi", "1", "Cook sushi rice and season."],
                ["Tacos", "1", "Prepare tortillas."],
                ["Croissant", "1", "Prepare dough and chill."],
                ["Pad Thai", "1", "Prepare sauce ingredients."],
                ["Cheeseburger", "1", "Prepare beef patty and grill."],
                ["Green Salad", "1", "Wash and chop greens."],
                ["Spring Rolls", "1", "Prepare vegetable filling."],
                ["Ramen", "1", "Prepare broth and cook noodles."]
            ],
            "health-parameter": [
                ["Hemoglobin"], ["Blood Pressure"], ["Blood Sugar"], ["Cholesterol"], ["Heart Rate"],
                ["BMI"], ["Vitamin D"], ["Calcium"], ["Iron"], ["Potassium"]
            ],
            "healthparameter": [
                ["Hemoglobin"], ["Blood Pressure"], ["Blood Sugar"], ["Cholesterol"], ["Heart Rate"],
                ["BMI"], ["Vitamin D"], ["Calcium"], ["Iron"], ["Potassium"]
            ],
            "normal-range": [
                ["Hemoglobin", "14.5 g/dL", "13.5", "17.5", "g/dL", "Normal 13.5-17.5", "", "Male range"],
                ["Blood Pressure", "120/80 mmHg", "90", "140", "mmHg", "Normal 90-140", "", "Adult range"],
                ["Blood Sugar", "90 mg/dL", "70", "110", "mg/dL", "Normal 70-110", "", "Fasting"],
                ["Cholesterol", "180 mg/dL", "150", "200", "mg/dL", "Normal 150-200", "", "Total cholesterol"],
                ["Heart Rate", "72 bpm", "60", "100", "bpm", "Normal 60-100", "", "Resting"],
                ["BMI", "22", "18.5", "24.9", "kg/m2", "Normal 18.5-24.9", "", "Healthy weight"],
                ["Vitamin D", "30 ng/mL", "20", "50", "ng/mL", "Normal 20-50", "", "Optimal"],
                ["Calcium", "9.5 mg/dL", "8.5", "10.5", "mg/dL", "Normal 8.5-10.5", "", "Serum calcium"],
                ["Iron", "100 mcg/dL", "60", "170", "mcg/dL", "Normal 60-170", "", "Serum iron"],
                ["Potassium", "4.0 mmol/L", "3.5", "5.0", "mmol/L", "Normal 3.5-5.0", "", "Serum potassium"]
            ],
            "normalrange": [
                ["Hemoglobin", "14.5 g/dL", "13.5", "17.5", "g/dL", "Normal 13.5-17.5", "", "Male range"],
                ["Blood Pressure", "120/80 mmHg", "90", "140", "mmHg", "Normal 90-140", "", "Adult range"],
                ["Blood Sugar", "90 mg/dL", "70", "110", "mg/dL", "Normal 70-110", "", "Fasting"],
                ["Cholesterol", "180 mg/dL", "150", "200", "mg/dL", "Normal 150-200", "", "Total cholesterol"],
                ["Heart Rate", "72 bpm", "60", "100", "bpm", "Normal 60-100", "", "Resting"],
                ["BMI", "22", "18.5", "24.9", "kg/m2", "Normal 18.5-24.9", "", "Healthy weight"],
                ["Vitamin D", "30 ng/mL", "20", "50", "ng/mL", "Normal 20-50", "", "Optimal"],
                ["Calcium", "9.5 mg/dL", "8.5", "10.5", "mg/dL", "Normal 8.5-10.5", "", "Serum calcium"],
                ["Iron", "100 mcg/dL", "60", "170", "mcg/dL", "Normal 60-170", "", "Serum iron"],
                ["Potassium", "4.0 mmol/L", "3.5", "5.0", "mmol/L", "Normal 3.5-5.0", "", "Serum potassium"]
            ],
            "diet-plan": [
                ["Weight Loss", "WL001", "2000.00", "500.00", "30"],
                ["Muscle Gain", "MG002", "2500.00", "600.00", "45"],
                ["Diabetes Control", "DC003", "1800.00", "400.00", "60"],
                ["Heart Health", "HH004", "2200.00", "550.00", "30"],
                ["Bone Strength", "BS005", "2100.00", "500.00", "40"],
                ["General Wellness", "GW006", "2300.00", "520.00", "30"],
                ["Senior Care", "SC007", "1700.00", "350.00", "90"],
                ["Child Nutrition", "CN008", "1600.00", "300.00", "60"],
                ["Pregnancy Diet", "PD009", "2400.00", "700.00", "60"],
                ["Sports Nutrition", "SN010", "2600.00", "800.00", "30"]
            ],
            "dietplan": [
                ["Weight Loss", "WL001", "2000.00", "500.00", "30"],
                ["Muscle Gain", "MG002", "2500.00", "600.00", "45"],
                ["Diabetes Control", "DC003", "1800.00", "400.00", "60"],
                ["Heart Health", "HH004", "2200.00", "550.00", "30"],
                ["Bone Strength", "BS005", "2100.00", "500.00", "40"],
                ["General Wellness", "GW006", "2300.00", "520.00", "30"],
                ["Senior Care", "SC007", "1700.00", "350.00", "90"],
                ["Child Nutrition", "CN008", "1600.00", "300.00", "60"],
                ["Pregnancy Diet", "PD009", "2400.00", "700.00", "60"],
                ["Sports Nutrition", "SN010", "2600.00", "800.00", "30"]
            ]
        }
        if submenu in sample_rows:
            for row in sample_rows[submenu]:
                ws.append(row)

        # Style the header
        from openpyxl.styles import Font
        for cell in ws[1]:
            cell.font = Font(bold=True)

        # Save to BytesIO
        output = BytesIO()
        wb.save(output)
        output.seek(0)

        response = HttpResponse(
            output.read(), 
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename="{submenu}_template.xlsx"'
        return response

