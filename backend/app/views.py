from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.pagination import PageNumberPagination
from django.conf import settings
from django.http import FileResponse, HttpResponse
from django.utils import timezone
from django.contrib.auth.hashers import make_password
import os
import random
from rest_framework import status

from .models import *
from .serializers import *

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
                "response_code": status.HTTP_400_BAD_REQUEST,
                "message": serializer.errors
            })
        except Exception as e:
            message = str(e)
            return Response({
                "status": "failed",
                "response_code": status.HTTP_500_INTERNAL_SERVER_ERROR,
                "message": message
            })
 

class LoginView(APIView):
    permission_classes = [AllowAny] 
    
    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data)
            if serializer.is_valid():
                return Response({"status":"success","response_code":status.HTTP_200_OK,"message":"User logged in successfully","tokens":serializer.validated_data})
            return Response({"status":"failed","response_code":status.HTTP_404_NOT_FOUND,"message":serializer.errors})
        except Exception as e:
            message = str(e)
            return Response({"status":"failed","response_code":status.HTTP_500_INTERNAL_SERVER_ERROR,"message":message})
        

class RefreshTokenView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        try:
            serializer = RefreshTokenSerializer(data=request.data)
            if serializer.is_valid():
                return Response(serializer.validated_data)
            return Response({"status":"failed","response_code":status.HTTP_404_NOT_FOUND,"message":serializer.errors})
        except Exception as e:
            message = str(e)
            return Response({"status":"failed","response_code":status.HTTP_500_INTERNAL_SERVER_ERROR,"message":message})


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

