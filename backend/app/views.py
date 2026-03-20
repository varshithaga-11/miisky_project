from django.shortcuts import render
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
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
    max_page_size = 10

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


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Admin CRUD for UserRegister model.
    Supports search on username/email/name/mobile and optional filter by created_by.
    Accepts multipart/form-data for photo upload.
    """
    queryset = UserRegister.objects.all().order_by('-id')
    serializer_class = UserManagementSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'mobile', 'whatsapp', 'city__name', 'state__name', 'country__name']
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    # NOTE: UserRegister currently has no created_by field.
    # We intentionally do not filter by created_by, so list shows all users.


# ── Role Questionnaires / Profiles ViewSets ────────────────────────────────────

class UserQuestionnaireViewSet(viewsets.ModelViewSet):
    queryset = UserQuestionnaire.objects.select_related('user').all()
    serializer_class = UserQuestionnaireSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    @action(detail=False, methods=['get', 'post', 'put', 'patch'], url_path='me')
    def me(self, request):
        instance = UserQuestionnaire.objects.filter(user=request.user).first()
        if request.method.lower() == 'get':
            if not instance:
                return Response({}, status=status.HTTP_200_OK)
            return Response(self.get_serializer(instance).data)

        serializer = self.get_serializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj, _ = UserQuestionnaire.objects.update_or_create(
            user=request.user,
            defaults=serializer.validated_data
        )
        return Response(self.get_serializer(obj).data)


class NutritionistProfileViewSet(viewsets.ModelViewSet):
    queryset = NutritionistProfile.objects.select_related('user').all()
    serializer_class = NutritionistProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]
    pagination_class = Pagination

    @action(detail=False, methods=['get', 'post', 'put', 'patch'], url_path='me')
    def me(self, request):
        instance = NutritionistProfile.objects.filter(user=request.user).first()
        if request.method.lower() == 'get':
            if not instance:
                return Response({}, status=status.HTTP_200_OK)
            return Response(self.get_serializer(instance).data)

        serializer = self.get_serializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj, _ = NutritionistProfile.objects.update_or_create(
            user=request.user,
            defaults=serializer.validated_data
        )
        return Response(self.get_serializer(obj).data)


class MicroKitchenProfileViewSet(viewsets.ModelViewSet):
    serializer_class = MicroKitchenProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['brand_name', 'kitchen_code', 'user__username', 'user__email']

    def get_queryset(self):
        qs = MicroKitchenProfile.objects.select_related('user').all().order_by('-id')
        status_param = self.request.query_params.get('status')
        if status_param:
            qs = qs.filter(status=status_param)
        return qs

    @action(detail=False, methods=['get', 'post', 'put', 'patch'], url_path='me')
    def me(self, request):
        instance = MicroKitchenProfile.objects.filter(user=request.user).first()
        if request.method.lower() == 'get':
            if not instance:
                return Response({}, status=status.HTTP_200_OK)
            return Response(self.get_serializer(instance).data)

        serializer = self.get_serializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj, _ = MicroKitchenProfile.objects.update_or_create(
            user=request.user,
            defaults=serializer.validated_data
        )
        return Response(self.get_serializer(obj).data)


class MicroKitchenInspectionViewSet(viewsets.ModelViewSet):
    queryset = MicroKitchenInspection.objects.all().order_by("-id")
    serializer_class = MicroKitchenInspectionSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = Pagination

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'Admin':
            return MicroKitchenInspection.objects.all().order_by("-id")
        
        # Micro kitchen users only see their own inspections
        return MicroKitchenInspection.objects.filter(micro_kitchen__user=user).order_by("-id")

    def perform_create(self, serializer):
        serializer.save(inspector=self.request.user if self.request.user.is_authenticated else None)


class DeliveryProfileViewSet(viewsets.ModelViewSet):
    queryset = DeliveryProfile.objects.select_related('user').all()
    serializer_class = DeliveryProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    @action(detail=False, methods=['get', 'post', 'put', 'patch'], url_path='me')
    def me(self, request):
        instance = DeliveryProfile.objects.filter(user=request.user).first()
        if request.method.lower() == 'get':
            if not instance:
                return Response({}, status=status.HTTP_200_OK)
            return Response(self.get_serializer(instance).data)

        serializer = self.get_serializer(instance=instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        obj, _ = DeliveryProfile.objects.update_or_create(
            user=request.user,
            defaults=serializer.validated_data
        )
        return Response(self.get_serializer(obj).data)


class UserNutritionistMappingViewSet(viewsets.ModelViewSet):
    queryset = UserNutritionistMapping.objects.select_related("user", "nutritionist").all()
    serializer_class = UserNutritionistMappingSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def perform_create(self, serializer):
        mapping = serializer.save()
        if hasattr(mapping.user, "is_patient_mapped") and not mapping.user.is_patient_mapped:
            mapping.user.is_patient_mapped = True
            mapping.user.save(update_fields=["is_patient_mapped"])

    def perform_update(self, serializer):
        mapping = serializer.save()
        if hasattr(mapping.user, "is_patient_mapped") and not mapping.is_active:
            has_other = UserNutritionistMapping.objects.filter(
                user=mapping.user, is_active=True
            ).exclude(pk=mapping.pk).exists()
            if not has_other:
                mapping.user.is_patient_mapped = False
                mapping.user.save(update_fields=["is_patient_mapped"])

    def perform_destroy(self, instance):
        user = instance.user
        super().perform_destroy(instance)
        if hasattr(user, "is_patient_mapped"):
            has_other = UserNutritionistMapping.objects.filter(user=user, is_active=True).exists()
            if not has_other:
                user.is_patient_mapped = False
                user.save(update_fields=["is_patient_mapped"])

    @action(detail=False, methods=["get"], url_path="my-patients")
    def my_patients(self, request):
        qs = UserNutritionistMapping.objects.select_related("user").filter(
            nutritionist=request.user, is_active=True
        )
        results = []
        for mapping in qs:
            patient = mapping.user
            try:
                q = patient.userquestionnaire
            except UserQuestionnaire.DoesNotExist:
                q = None
            results.append(
                {
                    "mapping_id": mapping.id,
                    "assigned_on": mapping.assigned_on,
                    "user": {
                        "id": patient.id,
                        "username": patient.username,
                        "first_name": patient.first_name,
                        "last_name": patient.last_name,
                        "email": patient.email,
                        "mobile": patient.mobile,
                        "address": patient.address,
                        "city": patient.city.name if patient.city else None,
                        "zip_code": patient.zip_code,
                        "state": patient.state.name if patient.state else None,
                        "country": patient.country.name if patient.country else None,
                        "is_patient_mapped": getattr(patient, "is_patient_mapped", False),
                    },
                    "questionnaire": UserQuestionnaireSerializer(q).data if q else None,
                }
            )
        return Response(results)

    @action(detail=False, methods=["get"], url_path="my-nutritionist")
    def my_nutritionist(self, request):
        mapping = UserNutritionistMapping.objects.select_related("nutritionist").filter(
            user=request.user, is_active=True
        ).first()
        if not mapping:
            return Response({}, status=status.HTTP_200_OK)

        nutritionist = mapping.nutritionist
        try:
            profile = nutritionist.nutritionistprofile
        except NutritionistProfile.DoesNotExist:
            profile = None

        return Response(
            {
                "mapping_id": mapping.id,
                "assigned_on": mapping.assigned_on,
                "nutritionist": {
                    "id": nutritionist.id,
                    "username": nutritionist.username,
                    "first_name": nutritionist.first_name,
                    "last_name": nutritionist.last_name,
                    "email": nutritionist.email,
                    "mobile": nutritionist.mobile,
                },
                "profile": NutritionistProfileSerializer(profile).data if profile else None,
            }
        )


class CountryViewSet(viewsets.ModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_countries(self, request):
        queryset = self.filter_queryset(self.get_queryset())  # keep search working
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class StateViewSet(viewsets.ModelViewSet):
    serializer_class = StateSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'country__name']

    def get_queryset(self):
        queryset = State.objects.select_related('country').all()
        country = self.request.query_params.get('country')
        if country:
            queryset = queryset.filter(country=country)
        return queryset

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_states(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CityViewSet(viewsets.ModelViewSet):
    serializer_class = CitySerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'state__name', 'state__country__name']

    def get_queryset(self):
        queryset = City.objects.select_related('state__country').all()
        state = self.request.query_params.get('state')
        country = self.request.query_params.get('country')
        if state:
            queryset = queryset.filter(state=state)
        elif country:
            queryset = queryset.filter(state__country=country)
        return queryset

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_cities(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_mealtypes(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CuisineTypeViewSet(viewsets.ModelViewSet):
    queryset = CuisineType.objects.all()
    serializer_class = CuisineTypeSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_cuisinetypes(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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
    serializer_class = FoodSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'meal_types__name', 'cuisine_types__name']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foods(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        queryset = Food.objects.prefetch_related(
            'meal_types',
            'cuisine_types',
            'foodingredient_set__ingredient',
            'foodingredient_set__unit',
            'foodstep_set',
            'nutrition'
        ).all()
        meal_type = self.request.query_params.get('meal_type')
        cuisine_type = self.request.query_params.get('cuisine_type')
        if meal_type:
            queryset = queryset.filter(meal_types=meal_type)
        if cuisine_type:
            queryset = queryset.filter(cuisine_types=cuisine_type)
        return queryset.distinct()
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'meal_types__name', 'cuisine_types__name']


class FoodNutritionViewSet(viewsets.ModelViewSet):
    queryset = FoodNutrition.objects.all()
    serializer_class = FoodNutritionSerializer
    permission_classes = [AllowAny]
    search_fields = ['food__name']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodnutritions(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


# ── Food Composition (FoodName-based) ViewSets ─────────────────────────────────

class FoodGroupViewSet(viewsets.ModelViewSet):
    queryset = FoodGroup.objects.all()
    serializer_class = FoodGroupSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodgroups(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodNameViewSet(viewsets.ModelViewSet):
    queryset = FoodName.objects.select_related('food_group').all()
    serializer_class = FoodNameSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'code', 'food_group__name']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodnames(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodProximateViewSet(viewsets.ModelViewSet):
    queryset = FoodProximate.objects.select_related('food_name').all()
    serializer_class = FoodProximateSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodproximates(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodWaterSolubleVitaminsViewSet(viewsets.ModelViewSet):
    queryset = FoodWaterSolubleVitamins.objects.select_related('food_name').all()
    serializer_class = FoodWaterSolubleVitaminsSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodwatersolublevitamins(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodFatSolubleVitaminsViewSet(viewsets.ModelViewSet):
    queryset = FoodFatSolubleVitamins.objects.select_related('food_name').all()
    serializer_class = FoodFatSolubleVitaminsSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodfatsolublevitamins(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodCarotenoidsViewSet(viewsets.ModelViewSet):
    queryset = FoodCarotenoids.objects.select_related('food_name').all()
    serializer_class = FoodCarotenoidsSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodcarotenoids(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodMineralsViewSet(viewsets.ModelViewSet):
    queryset = FoodMinerals.objects.select_related('food_name').all()
    serializer_class = FoodMineralsSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodminerals(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodSugarsViewSet(viewsets.ModelViewSet):
    queryset = FoodSugars.objects.select_related('food_name').all()
    serializer_class = FoodSugarsSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodsugars(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodAminoAcidsViewSet(viewsets.ModelViewSet):
    queryset = FoodAminoAcids.objects.select_related('food_name').all()
    serializer_class = FoodAminoAcidsSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodaminoacids(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodOrganicAcidsViewSet(viewsets.ModelViewSet):
    queryset = FoodOrganicAcids.objects.select_related('food_name').all()
    serializer_class = FoodOrganicAcidsSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodorganicacids(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodPolyphenolsViewSet(viewsets.ModelViewSet):
    queryset = FoodPolyphenols.objects.select_related('food_name').all()
    serializer_class = FoodPolyphenolsSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodpolyphenols(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodPhytochemicalsViewSet(viewsets.ModelViewSet):
    queryset = FoodPhytochemicals.objects.select_related('food_name').all()
    serializer_class = FoodPhytochemicalsSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodphytochemicals(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class FoodFattyAcidProfileViewSet(viewsets.ModelViewSet):
    queryset = FoodFattyAcidProfile.objects.select_related('food_name').all()
    serializer_class = FoodFattyAcidProfileSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodfattyacidprofiles(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_ingredients(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_units(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodingredients(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodsteps(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class HealthParameterViewSet(viewsets.ModelViewSet):
    queryset = HealthParameter.objects.all()
    serializer_class = HealthParameterSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user if self.request.user.is_authenticated else None)

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_healthparameters(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_dietplans(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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
                "foodgroup": ["name", "description"],
                "foodname": ["name", "food_group_name", "code", "description"],
                "meal-type": ["name"],
                "mealtype": ["name"],
                "cuisine-type": ["name"],
                "cuisinetype": ["name"],
                "food": ["name", "description", "meal_type_names", "cuisine_type_names", 
                         "calories", "protein", "carbs", "fat", "fiber", "serving_size",
                         "glycemic_index", "sugar", "saturated_fat", "trans_fat", "cholesterol",
                         "sodium", "potassium", "calcium", "iron", 
                         "vitamin_a", "vitamin_c", "vitamin_d", "vitamin_b12"],
                "foodproximate": [
                    "food_name", "base_unit", "proximate", "water", "protein", "fat", "ash", "fat_crude_extract", "fiber_total", "fiber_insoluble", "fiber_soluble", "carbohydrates", "energy"
                ],
                "foodwatersolublevitamins": [
                    "food_name", "base_unit", "water_soluble_index", "thiamine_b1", "riboflavin_b2", "niacin_b3", "pantothenic_acid_b5", "biotin_b7", "folate_b9", "vitamin_b6", "vitamin_c"
                ],
                "foodfatsolublevitamins": [
                    "food_name", "base_unit", "retinol", "alpha_tocopherol", "beta_tocopherol", "gamma_tocopherol", "delta_tocopherol", "alpha_tocotrienol", "beta_tocotrienol", "gamma_tocotrienol", "delta_tocotrienol", "total_vitamin_e"
                ],
                "foodcarotenoids": [
                    "food_name", "base_unit", "lutein", "zeaxanthin", "lycopene", "beta_cryptoxanthin", "beta_carotene", "total_carotenoids", "retinol_activity_equivalent", "carotenoid_activity"
                ],
                "foodminerals": [
                    "food_name", "base_unit", "calcium", "phosphorus", "magnesium", "sodium", "potassium", "iron", "zinc", "copper", "manganese", "selenium", "chromium", "molybdenum", "cobalt", "aluminium", "arsenic", "cadmium", "mercury", "lead", "nickel", "lithium"
                ],
                "foodsugars": [
                    "food_name", "base_unit", "total_carbohydrates", "starch", "fructose", "glucose", "sucrose", "maltose", "total_sugars"
                ],
                "foodaminoacids": [
                    "food_name", "base_unit", "histidine", "isoleucine", "leucine", "lysine", "methionine", "cystine", "phenylalanine", "threonine", "tryptophan", "valine"
                ],
                "foodorganicacids": [
                    "food_name", "base_unit", "oxalate_total", "oxalate_soluble", "oxalate_insoluble", "citric_acid", "fumaric_acid", "malic_acid", "quinic_acid", "succinic_acid", "tartaric_acid"
                ],
                "foodpolyphenols": [
                    "food_name", "base_unit", "benzoic_acid", "benzaldehyde", "protocatechuic_acid", "vanillic_acid", "gallic_acid", "cinnamic_acid", "o_coumaric_acid", "p_coumaric_acid", "caffeic_acid"
                ],
                "foodphytochemicals": [
                    "food_name", "base_unit", "raffinose", "stachyose", "verbascose", "ajugose", "campesterol", "stigmasterol", "beta_sitosterol", "phytate", "saponin"
                ],
                "foodfattyacidprofile": [
                    "food_name", "base_unit", "butyric", "caproic", "caprylic", "capric", "lauric", "myristic", "palmitic", "stearic", "arachidic", "behenic", "lignoceric", "myristoleic", "palmitoleic", "oleic", "elaidic", "eicosenoic", "erucic", "linoleic", "alpha_linolenic", "total_sfa", "total_mufa", "total_pufa"
                ],
                "unit": ["name"],
                "ingredient": ["name"],
                "recipe": ["food_name", "ingredient_name", "quantity", "unit_name", "notes", "steps"],
                "food-step": ["food_name", "step_number", "instruction"],
                "foodwatersolublevitamins": [
                    "food_name", "base_unit", "water_soluble_index", "thiamine_b1", "riboflavin_b2", "niacin_b3", "pantothenic_acid_b5", "biotin_b7", "folate_b9", "vitamin_b6", "vitamin_c"
                ]
            },
            "health": {
                "health-parameter": ["name"],
                "healthparameter": ["name"],
                "normal-range": ["health_parameter_name", "raw_value", "min_value", "max_value", "unit", "reference_text", "qualitative_value", "remarks"],
                "normalrange": ["health_parameter_name", "raw_value", "min_value", "max_value", "unit", "reference_text", "qualitative_value", "remarks"],
                "diet-plan": ["title", "code", "amount", "discount_amount", "no_of_days"],
                "dietplan": ["title", "code", "amount", "discount_amount", "no_of_days"]
            },
            "auth": {
                "usermanagement": ["username", "email", "first_name", "last_name", "role", "mobile", "whatsapp", "dob", "gender", "address", "zip_code", "country_name", "state_name", "city_name", "joined_date", "password", "password_confirm", "is_active"]
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
            ],
            "foodgroup": [
                ["Cereals and Millets", "Main source of energy"], ["Pulses and Legumes", "Rich in protein"],
                ["Leafy Vegetables", "High in vitamins"], ["Other Vegetables", "Vitamins and minerals"],
                ["Fruits", "Vitamins and antioxidants"], ["Milk and Milk Products", "Calcium and protein"],
                ["Animal Foods", "High quality protein"], ["Fats and Oils", "Energy dense"],
                ["Nuts and Oilseeds", "Healthy fats"], ["Sugar and Confectionery", "Simple carbohydrates"]
            ],
            "usermanagement": [
                ["johndoe", "john@example.com", "John", "Doe", "patient", "1234567890", "1234567890", "1990-01-01", "male", "123 Main St", "123456", "India", "Karnataka", "Bangalore", "2023-01-01T10:00:00", "password123", "password123", "TRUE"],
                ["janesmith", "jane@example.com", "Jane", "Smith", "nutritionist", "9876543210", "9876543210", "1985-05-15", "female", "456 Oak Ave", "654321", "India", "Maharashtra", "Mumbai", "2023-02-01T11:00:00", "securepass", "securepass", "TRUE"],
                ["adminuser", "admin@miisky.com", "System", "Admin", "admin", "5556667777", "5556667777", "1980-10-20", "other", "789 Admin Blvd", "999888", "United States", "California", "Los Angeles", "2022-12-01T09:00:00", "admin123", "admin123", "TRUE"],
                ["bobross", "bob@example.com", "Bob", "Ross", "patient", "1112223333", "1112223333", "1970-07-07", "male", "101 Art Way", "111000", "Canada", "Ontario", "Toronto", "2023-03-01T12:00:00", "painter123", "painter123", "TRUE"],
                ["aliceinwonderland", "alice@example.com", "Alice", "Wonder", "patient", "4445556666", "4445556666", "1995-12-12", "female", "202 Rabbit Hole", "222333", "United Kingdom", "England", "London", "2023-04-01T13:00:00", "teaparty", "teaparty", "TRUE"]
            ],
            "foodname": [
                ["Rice", "Cereals and Millets", "R001", "Polished white rice"], ["Wheat", "Cereals and Millets", "W002", "Whole wheat grain"],
                ["Bengal Gram", "Pulses and Legumes", "BG003", "Chickpeas"], ["Spinach", "Leafy Vegetables", "S004", "Fresh green leafy vegetable"],
                ["Potato", "Other Vegetables", "P005", "Common tuber"], ["Apple", "Fruits", "A006", "Red delicious apple"],
                ["Milk", "Milk and Milk Products", "M007", "Whole cow milk"], ["Egg", "Animal Foods", "E008", "Poultry egg"],
                ["Peanut", "Nuts and Oilseeds", "PN009", "Roasted peanuts"], ["Sugar", "Sugar and Confectionery", "S010", "White cane sugar"]
            ],
            "foodproximate": [
                ["Rice", "100g", "1.1", "12.5", "6.8", "0.5", "0.7", "0.4", "2.2", "1.5", "0.7", "78.2", "345"],
                ["Wheat", "100g", "1.2", "13.2", "11.8", "1.5", "1.5", "1.0", "12.5", "10.2", "2.3", "71.2", "340"],
                ["Bengal Gram", "100g", "1.5", "11.0", "17.1", "5.3", "3.0", "2.8", "25.2", "18.5", "6.7", "60.9", "360"],
                ["Spinach", "100g", "0.8", "91.4", "2.9", "0.4", "1.5", "0.3", "2.2", "2.0", "0.2", "3.6", "23"],
                ["Potato", "100g", "0.9", "77.0", "2.0", "0.1", "1.0", "0.5", "2.2", "1.8", "0.4", "17.0", "77"],
                ["Apple", "100g", "0.7", "85.6", "0.3", "0.2", "0.3", "0.1", "2.4", "1.0", "1.4", "13.8", "52"],
                ["Milk", "100g", "1.0", "87.0", "3.2", "3.4", "0.7", "0.0", "0.0", "0.0", "0.0", "4.8", "64"],
                ["Egg", "100g", "1.2", "75.0", "12.6", "10.0", "1.0", "0.0", "0.0", "0.0", "0.0", "1.2", "143"],
                ["Peanut", "100g", "1.8", "6.5", "25.8", "49.2", "2.5", "2.0", "8.5", "5.6", "2.9", "16.1", "567"],
                ["Sugar", "100g", "0.5", "0.1", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "99.8", "387"]
            ],
            "foodwatersolublevitamins": [
                ["Rice", "100g", "1.0", "0.07", "0.03", "1.6", "0.6", "0.5", "8", "0.15", "0"],
                ["Wheat", "100g", "1.1", "0.41", "0.12", "5.5", "1.0", "2.5", "38", "0.3", "0"],
                ["Bengal Gram", "100g", "1.2", "0.48", "0.18", "1.5", "0.8", "5.0", "557", "0.5", "3"],
                ["Spinach", "100g", "0.9", "0.08", "0.2", "0.7", "0.1", "1.0", "194", "0.2", "28"],
                ["Potato", "100g", "1.0", "0.08", "0.03", "1.1", "0.3", "0.1", "16", "0.3", "20"],
                ["Apple", "100g", "0.8", "0.02", "0.03", "0.1", "0.1", "0.1", "3", "0.04", "4.6"],
                ["Milk", "100g", "1.0", "0.04", "0.18", "0.1", "0.4", "2.0", "5", "0.04", "1"],
                ["Egg", "100g", "1.1", "0.06", "0.46", "0.1", "1.5", "20", "44", "0.1", "0"],
                ["Peanut", "100g", "1.3", "0.6", "0.1", "12", "1.8", "15", "240", "0.3", "0"],
                ["Sugar", "100g", "0.5", "0", "0", "0", "0", "0", "0", "0", "0"]
            ],
            "foodfatsolublevitamins": [
                ["Rice", "100g", "0", "0.1", "0.1", "0", "0", "0", "0", "0", "0", "0.1"],
                ["Wheat", "100g", "0", "1.0", "0.2", "0.5", "0.1", "0.5", "0.1", "0.1", "0.1", "1.5"],
                ["Bengal Gram", "100g", "0", "0.8", "0.1", "0.4", "0.1", "0.2", "0.1", "0.1", "0.1", "1.0"],
                ["Spinach", "100g", "0", "2.0", "0.5", "1.0", "0.2", "0.5", "0.1", "0.1", "0.1", "2.5"],
                ["Potato", "100g", "0", "0.1", "0.0", "0.1", "0.0", "0.0", "0.0", "0.0", "0.0", "0.1"],
                ["Apple", "100g", "0", "0.2", "0.1", "0.1", "0.0", "0.0", "0.0", "0.0", "0.0", "0.2"],
                ["Milk", "100g", "28", "0.1", "0.0", "0.1", "0.0", "0.0", "0.0", "0.0", "0.0", "0.1"],
                ["Egg", "100g", "140", "1.2", "0.5", "0.4", "0.1", "0.1", "0.0", "0.0", "0.0", "1.5"],
                ["Peanut", "100g", "0", "8.3", "1.2", "3.5", "0.5", "1.5", "0.2", "0.2", "0.2", "10.1"],
                ["Sugar", "100g", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]
            ],
            "foodcarotenoids": [
                ["Rice", "100g", "0", "0", "0", "0", "0", "0", "0", "0"],
                ["Wheat", "100g", "10", "5", "0", "2", "5", "22", "2", "5"],
                ["Bengal Gram", "100g", "15", "8", "0", "5", "12", "40", "4", "10"],
                ["Spinach", "100g", "12000", "5600", "0", "50", "5600", "23250", "469", "5600"],
                ["Potato", "100g", "5", "2", "0", "1", "1", "9", "1", "2"],
                ["Apple", "100g", "18", "11", "0", "5", "27", "61", "3", "7"],
                ["Milk", "100g", "0", "0", "0", "0", "5", "5", "1", "2"],
                ["Egg", "100g", "250", "220", "0", "10", "15", "495", "12", "25"],
                ["Peanut", "100g", "0", "0", "0", "0", "0", "0", "0", "0"],
                ["Sugar", "100g", "0", "0", "0", "0", "0", "0", "0", "0"]
            ],
            "foodminerals": [
                ["Rice", "100g", "10", "160", "25", "5", "110", "0.7", "1.2", "0.2", "1.1", "1", "0.1", "0.01", "0.01", "1", "0.01", "0.01", "0.001", "0.01", "0.01", "0.01"],
                ["Wheat", "100g", "41", "306", "138", "3", "340", "3.9", "3.4", "0.5", "3.8", "12", "1.1", "0.02", "0.01", "5", "0.02", "0.01", "0.001", "0.02", "0.02", "0.02"],
                ["Bengal Gram", "100g", "202", "312", "130", "73", "845", "5.3", "4.5", "0.8", "1.6", "25", "1.5", "0.05", "0.02", "12", "0.05", "0.02", "0.002", "0.05", "0.05", "0.05"],
                ["Spinach", "100g", "73", "21", "84", "65", "206", "1.1", "0.2", "0.01", "0.5", "1", "0.1", "0.01", "0.01", "1", "0.01", "0.01", "0.001", "0.01", "0.01", "0.01"],
                ["Potato", "100g", "10", "40", "22", "6", "400", "0.5", "0.3", "0.1", "0.1", "0.3", "0.1", "0.01", "0.01", "1", "0.01", "0.01", "0.001", "0.01", "0.01", "0.01"],
                ["Apple", "100g", "6", "11", "5", "1", "107", "0.1", "0.1", "0.03", "0.03", "0.1", "0.02", "0.01", "0.01", "1", "0.01", "0.01", "0.001", "0.01", "0.01", "0.01"],
                ["Milk", "100g", "120", "95", "12", "50", "150", "0.1", "0.4", "0.01", "0.01", "1", "0.01", "0.01", "0.01", "1", "0.01", "0.01", "0.001", "0.01", "0.01", "0.01"],
                ["Egg", "100g", "50", "178", "10", "124", "126", "1.2", "1.1", "0.1", "0.01", "10", "0.1", "0.01", "0.01", "2", "0.01", "0.01", "0.001", "0.01", "0.01", "0.01"],
                ["Peanut", "100g", "90", "376", "168", "18", "705", "4.6", "3.3", "1.1", "1.9", "7", "2.1", "0.01", "0.01", "10", "0.01", "0.01", "0.001", "0.01", "0.01", "0.01"],
                ["Sugar", "100g", "1", "0", "0", "0", "2", "0.1", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]
            ],
            "foodsugars": [
                ["Rice", "100g", "78.2", "75.0", "0.1", "0.1", "0.5", "0.1", "0.8"],
                ["Wheat", "100g", "71.2", "68.0", "0.2", "0.2", "1.2", "0.2", "1.8"],
                ["Bengal Gram", "100g", "60.9", "55.0", "0.5", "0.5", "2.5", "0.5", "4.0"],
                ["Spinach", "100g", "3.6", "0.1", "0.1", "0.1", "0.1", "0.1", "0.4"],
                ["Potato", "100g", "17.0", "15.0", "0.2", "0.2", "0.1", "0.1", "0.6"],
                ["Apple", "100g", "13.8", "2.0", "5.9", "2.4", "2.1", "0.1", "10.5"],
                ["Milk", "100g", "4.8", "0", "0", "0", "0.0", "0.0", "4.8"],
                ["Egg", "100g", "1.1", "0", "0.1", "0.1", "0.1", "0.1", "0.4"],
                ["Peanut", "100g", "16.1", "4.0", "0.5", "0.5", "3.5", "0.1", "4.6"],
                ["Sugar", "100g", "99.8", "0", "0", "0", "99.8", "0", "99.8"]
            ],
            "foodaminoacids": [
                ["Rice", "100g", "140", "280", "540", "260", "150", "80", "330", "240", "80", "420"],
                ["Wheat", "100g", "250", "420", "840", "300", "180", "250", "550", "350", "150", "540"],
                ["Bengal Gram", "100g", "640", "1010", "1680", "1530", "310", "280", "1160", "840", "210", "1120"],
                ["Spinach", "100g", "60", "130", "230", "160", "50", "30", "140", "120", "40", "160"],
                ["Potato", "100g", "40", "80", "120", "100", "30", "20", "90", "80", "30", "110"],
                ["Apple", "100g", "5", "10", "20", "15", "5", "5", "10", "10", "2", "15"],
                ["Milk", "100g", "90", "160", "320", "250", "80", "30", "160", "140", "40", "210"],
                ["Egg", "100g", "300", "680", "1080", "900", "390", "280", "660", "530", "160", "860"],
                ["Peanut", "100g", "650", "910", "1670", "920", "320", "240", "1300", "880", "250", "1080"],
                ["Sugar", "100g", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]
            ],
            "foodorganicacids": [
                ["Rice", "100g", "10", "5", "5", "2", "1", "2", "0.5", "1", "0.5"],
                ["Wheat", "100g", "15", "8", "7", "3", "2", "3", "1", "2", "1"],
                ["Bengal Gram", "100g", "15", "14", "13", "10", "3", "5", "2", "3", "2"],
                ["Spinach", "100g", "750", "150", "600", "20", "5", "50", "10", "15", "5"],
                ["Potato", "100g", "20", "10", "10", "15", "2", "10", "5", "5", "2"],
                ["Apple", "100g", "12", "6", "6", "25", "2", "450", "8", "12", "5"],
                ["Milk", "100g", "5", "2", "3", "150", "0.5", "5", "0.2", "2", "0.1"],
                ["Egg", "100g", "2", "1", "1", "5", "0.1", "2", "0.1", "1", "0.1"],
                ["Peanut", "100g", "50", "20", "30", "10", "5", "15", "2", "8", "3"],
                ["Sugar", "100g", "0", "0", "0", "0", "0", "0", "0", "0", "0"]
            ],
            "foodpolyphenols": [
                ["Rice", "100g", "2", "1", "5", "3", "1", "8", "1", "5", "12"],
                ["Wheat", "100g", "5", "2", "12", "8", "2", "15", "2", "12", "45"],
                ["Bengal Gram", "100g", "10", "5", "25", "15", "5", "35", "5", "25", "85"],
                ["Spinach", "100g", "8", "4", "18", "12", "3", "22", "3", "18", "65"],
                ["Potato", "100g", "5", "3", "15", "10", "2", "12", "2", "15", "35"],
                ["Apple", "100g", "12", "8", "35", "25", "8", "55", "8", "35", "120"],
                ["Milk", "100g", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
                ["Egg", "100g", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
                ["Peanut", "100g", "15", "10", "45", "30", "10", "75", "10", "45", "180"],
                ["Sugar", "100g", "0", "0", "0", "0", "0", "0", "0", "0", "0"]
            ],
            "foodphytochemicals": [
                ["Rice", "100g", "0.05", "0.02", "0.01", "0.01", "1.2", "0.5", "12", "180", "5"],
                ["Wheat", "100g", "0.12", "0.08", "0.05", "0.02", "3.5", "2.8", "45", "250", "12"],
                ["Bengal Gram", "100g", "2.5", "1.2", "0.8", "0.5", "5.8", "4.2", "85", "450", "650"],
                ["Spinach", "100g", "0.05", "0.02", "0.01", "0.01", "0.5", "0.3", "5", "50", "150"],
                ["Potato", "100g", "0.08", "0.05", "0.02", "0.02", "0.8", "0.6", "10", "80", "50"],
                ["Apple", "100g", "0.02", "0.01", "0.01", "0.01", "1.5", "1.2", "15", "30", "20"],
                ["Milk", "100g", "0", "0", "0", "0", "2.5", "0.1", "1", "0", "0"],
                ["Egg", "100g", "0", "0", "0", "0", "0", "0", "0", "0", "0"],
                ["Peanut", "100g", "0.15", "0.10", "0.08", "0.05", "15.0", "12.0", "120", "350", "850"],
                ["Sugar", "100g", "0", "0", "0", "0", "0", "0", "0", "0", "0"]
            ],
            "foodfattyacidprofile": [
                ["Rice", "100g", "0.01", "0", "0", "0", "0.01", "0.15", "0.25", "0.02", "0", "0", "0", "0.01", "0.01", "0.22", "0", "0", "0", "0.25", "0.01", "0.45", "0.23", "0.26"],
                ["Wheat", "100g", "0.02", "0", "0", "0.01", "0.02", "0.25", "0.45", "0.05", "0.01", "0.01", "0", "0.02", "0.02", "0.35", "0", "0", "0", "0.85", "0.05", "0.85", "0.40", "0.90"],
                ["Bengal Gram", "100g", "0.05", "0.01", "0.01", "0.02", "0.05", "0.55", "1.25", "0.12", "0.02", "0.02", "0.01", "0.05", "0.05", "1.15", "0.01", "0.02", "0.01", "2.50", "0.15", "2.25", "1.25", "2.65"],
                ["Spinach", "100g", "0.01", "0", "0", "0", "0", "0.05", "0.08", "0.01", "0", "0", "0", "0.01", "0.01", "0.05", "0", "0", "0", "0.15", "0.08", "0.15", "0.08", "0.23"],
                ["Potato", "100g", "0", "0", "0", "0", "0", "0.02", "0.03", "0.01", "0", "0", "0", "0", "0.01", "0.02", "0", "0", "0", "0.05", "0.01", "0.06", "0.03", "0.06"],
                ["Apple", "100g", "0", "0", "0", "0", "0", "0.01", "0.03", "0.01", "0", "0", "0", "0", "0.01", "0.02", "0", "0", "0", "0.08", "0.02", "0.05", "0.03", "0.10"],
                ["Milk", "100g", "0.12", "0.08", "0.05", "0.10", "0.35", "0.25", "0.85", "0.45", "0.05", "0.02", "0.01", "0.05", "0.05", "0.75", "0.02", "0.01", "0.01", "0.12", "0.05", "2.35", "0.85", "1.17"],
                ["Egg", "100g", "0.05", "0.02", "0.01", "0.02", "0.05", "0.15", "2.50", "0.85", "0.02", "0.01", "0.01", "0.05", "0.15", "3.50", "0.05", "0.02", "0.01", "1.50", "0.12", "3.85", "3.75", "1.62"],
                ["Peanut", "100g", "0.05", "0.01", "0.01", "0.02", "0.05", "0.15", "5.20", "1.25", "0.65", "0.75", "0.35", "0.05", "0.15", "23.50", "0.05", "0.55", "0.05", "15.50", "0.15", "8.50", "24.50", "15.65"],
                ["Sugar", "100g", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]
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

class ProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = UserRegister.objects.all()
    serializer_class = ProfileSerializer    
    
    def get_queryset(self):
        return UserRegister.objects.filter(id=self.request.user.id)
    
    def update(self, request, *args, **kwargs):
        partial = True  # allows partial update
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class PatientHealthReportViewSet(viewsets.ModelViewSet):
    queryset = PatientHealthReport.objects.all()
    serializer_class = PatientHealthReportSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        
        # Check for specific patient filter
        patient_id = self.request.query_params.get('user')
        
        if user.role == "admin":
            if patient_id:
                queryset = queryset.filter(user_id=patient_id)
            return queryset
            
        if user.role == "nutritionist":
            # Identify patients mapped to this nutritionist
            mapped_patient_ids = UserNutritionistMapping.objects.filter(
                nutritionist=user, is_active=True
            ).values_list('user_id', flat=True)
            
            # Start with reports for ALL mapped patients
            queryset = queryset.filter(user_id__in=mapped_patient_ids)
            
            # Refine to specific patient if requested
            if patient_id:
                queryset = queryset.filter(user_id=patient_id)
            
            return queryset
            
        # Patients see their own reports
        return queryset.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NutritionistReviewViewSet(viewsets.ModelViewSet):
    queryset = NutritionistReview.objects.all()
    serializer_class = NutritionistReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset
        
        # Check for specific patient
        patient_id = self.request.query_params.get('user')
        
        if user.role == "admin":
            if patient_id:
                queryset = queryset.filter(user_id=patient_id)
            return queryset
            
        if user.role == "nutritionist":
            # Nutritionists see reviews they gave
            queryset = queryset.filter(nutritionist=user)
            if patient_id:
                queryset = queryset.filter(user_id=patient_id)
            return queryset
            
        if user.role == "patient" or user.role == "non_patient":
            # Patients see reviews given to them
            return queryset.filter(user=user)
            
        return queryset.none()

    def perform_create(self, serializer):
        # Automatically set the nutritionist to the logged-in user
        serializer.save(nutritionist=self.request.user)


class UserDietPlanViewSet(viewsets.ModelViewSet):
    queryset = UserDietPlan.objects.all().select_related('user', 'nutritionist', 'diet_plan', 'review').prefetch_related('diet_plan__features')
    serializer_class = UserDietPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset

        patient_id = self.request.query_params.get('user')
        status_filter = self.request.query_params.get('status')

        if user.role == "admin":
            if patient_id:
                queryset = queryset.filter(user_id=patient_id)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset.order_by('-suggested_on')

        if user.role == "nutritionist":
            # Identify patients mapped to this nutritionist
            mapped_patient_ids = UserNutritionistMapping.objects.filter(
                nutritionist=user, is_active=True
            ).values_list('user_id', flat=True)
            
            queryset = queryset.filter(user_id__in=mapped_patient_ids)
            if patient_id:
                queryset = queryset.filter(user_id=patient_id)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset.order_by('-suggested_on')

        if user.role == "patient" or user.role == "non_patient":
            queryset = queryset.filter(user=user)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            return queryset.order_by('-suggested_on')

        return queryset.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "nutritionist":
            patient = serializer.validated_data.get('user')
            pid = patient.id if hasattr(patient, 'id') else patient
            if pid and not UserNutritionistMapping.objects.filter(
                nutritionist=user, user_id=pid, is_active=True
            ).exists():
                from rest_framework.exceptions import ValidationError
                raise ValidationError("You can only suggest plans to your assigned patients.")
        serializer.save(nutritionist=user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Patient approves plan, selects start_date. End date auto-calculated."""
        udp = self.get_object()
        if udp.user_id != request.user.id:
            return Response({"detail": "Only the assigned patient can approve."}, status=status.HTTP_403_FORBIDDEN)
        if udp.status != 'suggested':
            return Response({"detail": f"Cannot approve: current status is {udp.status}."}, status=status.HTTP_400_BAD_REQUEST)
        start_date_str = request.data.get('start_date')
        if not start_date_str:
            return Response({"detail": "start_date is required."}, status=status.HTTP_400_BAD_REQUEST)
        from datetime import datetime
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({"detail": "Invalid start_date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
        if start_date < timezone.now().date():
            return Response({"detail": "Start date cannot be in the past."}, status=status.HTTP_400_BAD_REQUEST)
        udp.approve(start_date=start_date)
        return Response(self.get_serializer(udp).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Patient rejects the suggested plan."""
        udp = self.get_object()
        if udp.user_id != request.user.id:
            return Response({"detail": "Only the assigned patient can reject."}, status=status.HTTP_403_FORBIDDEN)
        if udp.status != 'suggested':
            return Response({"detail": f"Cannot reject: current status is {udp.status}."}, status=status.HTTP_400_BAD_REQUEST)
        udp.reject(feedback=request.data.get('user_feedback'))
        return Response(self.get_serializer(udp).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def confirm_payment(self, request, pk=None):
        """Confirm payment success and activate plan."""
        udp = self.get_object()
        if udp.user_id != request.user.id:
            return Response({"detail": "Only the assigned patient can confirm payment."}, status=status.HTTP_403_FORBIDDEN)
        if udp.status != 'payment_pending':
            return Response({"detail": f"Cannot confirm payment: status is {udp.status}."}, status=status.HTTP_400_BAD_REQUEST)
        amount = request.data.get('amount')
        transaction_id = request.data.get('transaction_id', '')
        if not amount:
            return Response({"detail": "amount is required."}, status=status.HTTP_400_BAD_REQUEST)
        from decimal import Decimal
        try:
            amount = Decimal(str(amount))
        except Exception:
            return Response({"detail": "Invalid amount."}, status=status.HTTP_400_BAD_REQUEST)
        udp.confirm_payment(amount=amount, transaction_id=transaction_id)
        return Response(self.get_serializer(udp).data, status=status.HTTP_200_OK)


class UserMealViewSet(viewsets.ModelViewSet):
    queryset = UserMeal.objects.all().select_related('user', 'user_diet_plan', 'meal_type', 'food')
    serializer_class = UserMealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset

        patient_id = self.request.query_params.get('user')
        plan_id = self.request.query_params.get('user_diet_plan')
        date_str = self.request.query_params.get('meal_date')

        if user.role == "admin":
            pass
        elif user.role == "nutritionist":
            # Identify patients mapped to this nutritionist
            mapped_patient_ids = UserNutritionistMapping.objects.filter(
                nutritionist=user, is_active=True
            ).values_list('user_id', flat=True)
            queryset = queryset.filter(user_diet_plan__user_id__in=mapped_patient_ids)
        else:
            queryset = queryset.filter(user=user)

        if patient_id:
            queryset = queryset.filter(user_id=patient_id)
        if plan_id:
            queryset = queryset.filter(user_diet_plan_id=plan_id)
        if date_str:
            queryset = queryset.filter(meal_date=date_str)

        return queryset.order_by('meal_date', 'meal_type__id')

    @action(detail=False, methods=['post'], url_path='bulk-create')
    def bulk_create_meals(self, request):
        """Allows nutritionist to set multiple meals at once."""
        data = request.data
        if not isinstance(data, list):
            return Response({"detail": "Expected a list of meal objects."}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=data, many=True)
        if serializer.is_valid():
            # Handle potential duplicates (unique_together: user, date, meal_type)
            # Efficiently batch create or update
            meals_to_create = []
            for item in serializer.validated_data:
                UserMeal.objects.update_or_create(
                    user=item['user'],
                    meal_date=item['meal_date'],
                    meal_type=item['meal_type'],
                    defaults={
                        'food': item['food'],
                        'cuisine_type': item.get('cuisine_type'),
                        'quantity': item.get('quantity'),
                        'user_diet_plan': item['user_diet_plan'],
                        'notes': item.get('notes')
                    }
                )
            return Response({"status": "successfully processed bulk meals"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MeetingRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling consultation meeting requests between patients and nutritionists.
    """
    queryset = MeetingRequest.objects.all().select_related('patient', 'nutritionist', 'user_diet_plan')
    serializer_class = MeetingRequestSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['patient__first_name', 'patient__last_name', 'nutritionist__first_name', 'reason']

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)

        if role in ['patient', 'non_patient']:
            # Patients see their own requests
            return self.queryset.filter(patient=user).order_by('-created_on')
        elif role == 'nutritionist':
            # Nutritionists see requests sent to them
            return self.queryset.filter(nutritionist=user).order_by('-created_on')
        elif role == 'Admin' or user.is_staff:
            # Admins see everything
            return self.queryset.order_by('-created_on')
        
        return self.queryset.none()

    def perform_create(self, serializer):
        # Always set the patient as the current user
        serializer.save(patient=self.request.user)

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_meeting_status(self, request, pk=None):
        """
        Specific action for nutritionists to approve/reject/schedule meetings.
        Expected data: { status: 'approved'|'rejected', meeting_link: '...', scheduled_datetime: '...' }
        """
        meeting = self.get_object()
        user = request.user

        # Only assigned nutritionist or Admin can update status
        if meeting.nutritionist != user and user.role != 'Admin':
            return Response({"detail": "Not authorized to update this request."}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        if not new_status:
            return Response({"detail": "status is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Update based on logic
        if new_status == 'approved':
            link = request.data.get('meeting_link')
            dt = request.data.get('scheduled_datetime')
            if not link or not dt:
                return Response({"detail": "meeting_link and scheduled_datetime are required for approval."}, status=status.HTTP_400_BAD_REQUEST)
            meeting.approve(meeting_link=link, scheduled_datetime=dt)
        elif new_status == 'rejected':
            note = request.data.get('nutritionist_notes')
            meeting.reject(note=note)
        elif new_status == 'completed':
            meeting.mark_completed()
        else:
            # Generic update
            serializer = self.get_serializer(meeting, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()

        return Response(self.get_serializer(meeting).data)


class NutritionistRatingViewSet(viewsets.ModelViewSet):
    queryset = NutritionistRating.objects.all().select_related('patient', 'nutritionist', 'diet_plan')
    serializer_class = NutritionistRatingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return self.queryset
        elif user.role == 'nutritionist':
            return self.queryset.filter(nutritionist=user)
        else:
            return self.queryset.filter(patient=user)

    def perform_create(self, serializer):
        rating_obj = serializer.save(patient=self.request.user)
        self.recalculate_nutritionist_stats(rating_obj.nutritionist)

    def perform_update(self, serializer):
        rating_obj = serializer.save()
        self.recalculate_nutritionist_stats(rating_obj.nutritionist)

    def perform_destroy(self, instance):
        nutritionist = instance.nutritionist
        instance.delete()
        self.recalculate_nutritionist_stats(nutritionist)

    def recalculate_nutritionist_stats(self, nutritionist):
        from django.db.models import Avg, Count
        stats = NutritionistRating.objects.filter(nutritionist=nutritionist).aggregate(
            avg_rating=Avg('rating'),
            total=Count('id')
        )
        
        try:
            profile = nutritionist.nutritionistprofile
            profile.rating = stats['avg_rating'] or 0
            profile.total_reviews = stats['total'] or 0
            profile.save()
        except NutritionistProfile.DoesNotExist:
            pass


class UserMicroKitchenMappingViewSet(viewsets.ModelViewSet):
    queryset = UserMicroKitchenMapping.objects.all().select_related('patient', 'nutritionist', 'micro_kitchen', 'diet_plan')
    serializer_class = UserMicroKitchenMappingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        
        # Filtering
        patient_id = self.request.query_params.get('patient')
        if patient_id:
            qs = qs.filter(patient_id=patient_id)
            
        diet_plan_id = self.request.query_params.get('diet_plan')
        if diet_plan_id:
            qs = qs.filter(diet_plan_id=diet_plan_id)

        if user.role == 'admin':
            return qs
        if user.role == 'nutritionist':
            return qs.filter(nutritionist=user)
        if user.role == 'micro_kitchen':
            return qs.filter(micro_kitchen__user=user)
        if user.role == 'patient' or user.role == 'non_patient':
            return qs.filter(patient=user)
        
        return qs.none()

    def perform_create(self, serializer):
        # When nutritionist creates a suggestion
        serializer.save(nutritionist=self.request.user)

    def perform_update(self, serializer):
        # Automatically set responded_at when patient accepts/rejects
        old_status = self.get_object().status
        new_status = self.request.data.get('status')
        
        if old_status == 'suggested' and new_status in ['accepted', 'rejected']:
            serializer.save(
                responded_at=timezone.now(),
                is_active=(new_status == 'accepted')
            )
        else:
            serializer.save()
