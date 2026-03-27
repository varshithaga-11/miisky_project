from django.shortcuts import render
from django.db.models import Q
from django.db import transaction
from rest_framework import viewsets, status, filters
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
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
from rest_framework.exceptions import PermissionDenied
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
class IsAdminRole(BasePermission):
    """Allow only authenticated users with role='admin'."""

    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and getattr(u, 'role', None) == 'admin')


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
    Optional query param: role (e.g. role=patient) to restrict list.
    """
    queryset = UserRegister.objects.all().order_by('-id')
    serializer_class = UserManagementSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'mobile', 'whatsapp', 'city__name', 'state__name', 'country__name']
    permission_classes = [AllowAny]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def get_queryset(self):
        qs = UserRegister.objects.all().order_by('-id').select_related('city', 'state', 'country')
        role = self.request.query_params.get('role')
        if role:
            qs = qs.filter(role=role.strip())
        return qs

    # NOTE: UserRegister currently has no created_by field.
    # We intentionally do not filter by created_by, so list shows all users.


# ── Role Questionnaires / Profiles ViewSets ────────────────────────────────────

class UserQuestionnaireViewSet(viewsets.ModelViewSet):
    queryset = UserQuestionnaire.objects.select_related('user').all()
    serializer_class = UserQuestionnaireSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def get_queryset(self):
        qs = UserQuestionnaire.objects.select_related('user').all()
        u = self.request.user
        patient_id = self.request.query_params.get('user')
        if getattr(u, 'role', None) == 'admin':
            if patient_id:
                return qs.filter(user_id=patient_id)
            return qs
        if getattr(u, 'role', None) in ('patient', 'non_patient'):
            return qs.filter(user=u)
        if getattr(u, 'role', None) == 'nutritionist':
            mapped_ids = UserNutritionistMapping.objects.filter(
                nutritionist=u, is_active=True
            ).values_list('user_id', flat=True)
            return qs.filter(user_id__in=mapped_ids)
        return qs.none()

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

    def get_queryset(self):
        qs = NutritionistProfile.objects.select_related('user').all()
        u = self.request.user
        uid = self.request.query_params.get('user')
        if getattr(u, 'role', None) == 'admin':
            if uid:
                return qs.filter(user_id=uid)
            return qs
        if getattr(u, 'role', None) == 'nutritionist':
            return qs.filter(user=u)
        return qs.none()

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
        validated = dict(serializer.validated_data)
        obj, _ = MicroKitchenProfile.objects.update_or_create(
            user=request.user,
            defaults=validated
        )
        lat, lng = None, None
        if 'latitude' in request.data:
            v = request.data.get('latitude')
            if v not in (None, ''):
                try:
                    lat = float(v)
                except (TypeError, ValueError):
                    pass
        if 'longitude' in request.data:
            v = request.data.get('longitude')
            if v not in (None, ''):
                try:
                    lng = float(v)
                except (TypeError, ValueError):
                    pass
        if lat is not None or lng is not None:
            user = request.user
            if lat is not None:
                user.latitude = lat
            if lng is not None:
                user.longitude = lng
            user.save()
        return Response(self.get_serializer(obj).data)


class MicroKitchenFoodViewSet(viewsets.ModelViewSet):
    queryset = MicroKitchenFood.objects.all().select_related('micro_kitchen', 'food').prefetch_related('food__meal_types', 'food__cuisine_types')
    serializer_class = MicroKitchenFoodSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='menu', permission_classes=[AllowAny])
    def menu(self, request):
        """Public: list available foods for a kitchen (for customer menu view)."""
        micro_kitchen_id = request.query_params.get('micro_kitchen')
        if not micro_kitchen_id:
            return Response({'error': 'micro_kitchen required'}, status=400)
        qs = self.queryset.filter(micro_kitchen_id=micro_kitchen_id, is_available=True)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='available', permission_classes=[AllowAny])
    def available(self, request):
        """Public: list all available MicroKitchenFood (is_available=True). Optional: micro_kitchen, search."""
        qs = self.queryset.filter(is_available=True)
        micro_kitchen_id = request.query_params.get('micro_kitchen')
        search = request.query_params.get('search', '').strip()
        if micro_kitchen_id:
            qs = qs.filter(micro_kitchen_id=micro_kitchen_id)
        qs = qs.filter(micro_kitchen__status='approved')
        if search:
            qs = qs.filter(
                Q(food__name__icontains=search) |
                Q(micro_kitchen__brand_name__icontains=search)
            )
        qs = qs.order_by('micro_kitchen__brand_name', 'food__name')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        if user.role == 'admin':
            # Optional admin filter: list foods only for one kitchen
            micro_kitchen_id = self.request.query_params.get('micro_kitchen')
            if micro_kitchen_id:
                qs = qs.filter(micro_kitchen_id=micro_kitchen_id)
            return qs
        profile = MicroKitchenProfile.objects.filter(user=user).first()
        if not profile:
            return self.queryset.none()
        # Micro-kitchen users only see their own menu
        return self.queryset.filter(micro_kitchen=profile)

    def perform_create(self, serializer):
        profile = MicroKitchenProfile.objects.filter(user=self.request.user).first()
        if not profile:
            raise ValueError("Micro kitchen profile not found")
        serializer.save(micro_kitchen=profile)


class MicroKitchenInspectionViewSet(viewsets.ModelViewSet):
    queryset = MicroKitchenInspection.objects.all().order_by("-id")
    serializer_class = MicroKitchenInspectionSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = Pagination

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.role == 'admin':
            qs = MicroKitchenInspection.objects.all().order_by("-id")
            micro_kitchen_id = self.request.query_params.get('micro_kitchen')
            if micro_kitchen_id:
                qs = qs.filter(micro_kitchen_id=micro_kitchen_id)
            return qs

        # Micro kitchen users only see their own inspections
        if user.role == 'micro_kitchen':
            return MicroKitchenInspection.objects.filter(micro_kitchen__user=user).order_by("-id")

        return MicroKitchenInspection.objects.none()

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

    def get_queryset(self):
        qs = UserNutritionistMapping.objects.select_related("user", "nutritionist").all()
        u = self.request.user
        patient_id = self.request.query_params.get('user')
        if getattr(u, 'role', None) == 'admin':
            if patient_id:
                return qs.filter(user_id=patient_id)
            return qs
        if getattr(u, 'role', None) == 'nutritionist':
            return qs.filter(nutritionist=u)
        if getattr(u, 'role', None) in ('patient', 'non_patient'):
            return qs.filter(user=u)
        return qs.none()

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
        # 1. Patients where current user is active nutritionist
        mapped_qs = UserNutritionistMapping.objects.select_related("user").filter(
            nutritionist=request.user, is_active=True
        )
        
        # 2. Patients where current user was original nutritionist on an active plan
        # This allows the "former" nutritionist to still see the patient they were working with
        was_original_qs = UserDietPlan.objects.filter(
            original_nutritionist=request.user, status='active'
        ).select_related('user')
        
        # Build set of patient IDs to avoid duplicates
        patient_map = {} # user_id -> {'mapping': mapping, 'diet_plan': diet_plan}
        
        for m in mapped_qs:
            patient_map[m.user.id] = {'user': m.user, 'mapping_id': m.id, 'assigned_on': m.assigned_on}
            
        for dp in was_original_qs:
            if dp.user.id not in patient_map:
                patient_map[dp.user.id] = {'user': dp.user, 'mapping_id': None, 'assigned_on': dp.created_on}

        results = []
        for pid, data in patient_map.items():
            patient = data['user']
            
            # Fetch active reassignment info if any
            reassignment = NutritionistReassignment.objects.filter(
                user=patient, 
                active_diet_plan__status='active'
            ).order_by('-reassigned_on').first()
            
            reassignment_data = None
            if reassignment:
                reassignment_data = {
                    "previous_nutritionist": reassignment.previous_nutritionist.username if reassignment.previous_nutritionist else None,
                    "new_nutritionist": reassignment.new_nutritionist.username if reassignment.new_nutritionist else None,
                    "reason": reassignment.reason,
                    "notes": reassignment.notes,
                    "effective_from": reassignment.effective_from,
                }

            try:
                q = patient.userquestionnaire
            except UserQuestionnaire.DoesNotExist:
                q = None
                
            results.append(
                {
                    "mapping_id": data['mapping_id'],
                    "assigned_on": data['assigned_on'],
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
                    "reassignment_details": reassignment_data,
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

    @action(
        detail=False,
        methods=["post"],
        url_path="reassign",
        permission_classes=[IsAuthenticated, IsAdminRole],
    )
    def reassign(self, request):
        serializer = ReassignNutritionistSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        patient = serializer.validated_data["user"]
        new_nutritionist = serializer.validated_data["new_nutritionist"]
        reason = serializer.validated_data["reason"]
        notes_raw = serializer.validated_data.get("notes") or ""
        notes = notes_raw.strip() or None
        effective_from = serializer.validated_data.get("effective_from")
        if effective_from is None:
            effective_from = timezone.now().date()

        old_mapping = (
            UserNutritionistMapping.objects.select_related("nutritionist")
            .filter(user=patient, is_active=True)
            .first()
        )
        if not old_mapping:
            return Response(
                {"detail": "No active nutritionist mapping for this patient."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        previous_nutritionist = old_mapping.nutritionist
        if previous_nutritionist and previous_nutritionist.pk == new_nutritionist.pk:
            return Response(
                {"detail": "New nutritionist must be different from the current one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        active_plan = (
            UserDietPlan.objects.filter(user=patient, status="active")
            .order_by("-id")
            .first()
        )

        with transaction.atomic():
            if active_plan:
                prev_plan_nutritionist = active_plan.nutritionist
                active_plan.original_nutritionist = prev_plan_nutritionist
                active_plan.nutritionist = new_nutritionist
                active_plan.nutritionist_effective_from = effective_from
                active_plan.save(
                    update_fields=[
                        "original_nutritionist",
                        "nutritionist",
                        "nutritionist_effective_from",
                    ]
                )

            NutritionistReassignment.objects.create(
                user=patient,
                previous_nutritionist=previous_nutritionist,
                new_nutritionist=new_nutritionist,
                reason=reason,
                notes=notes,
                reassigned_by=request.user,
                active_diet_plan=active_plan,
                effective_from=effective_from,
            )

            new_mapping = UserNutritionistMapping(
                user=patient,
                nutritionist=new_nutritionist,
                is_active=True,
            )
            new_mapping.save()

        out = UserNutritionistMappingSerializer(
            UserNutritionistMapping.objects.select_related("user", "nutritionist").get(
                pk=new_mapping.pk
            )
        )
        return Response(out.data, status=status.HTTP_201_CREATED)


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


class PackagingMaterialViewSet(viewsets.ModelViewSet):
    queryset = PackagingMaterial.objects.all()
    serializer_class = PackagingMaterialSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_packagingmaterials(self, request):
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
        micro_kitchen = self.request.query_params.get('micro_kitchen')
        available_only = self.request.query_params.get('available_only', '').lower() == 'true'
        if meal_type:
            queryset = queryset.filter(meal_types=meal_type)
        if cuisine_type:
            queryset = queryset.filter(cuisine_types=cuisine_type)
        if micro_kitchen:
            queryset = queryset.filter(micro_kitchen=micro_kitchen)
        if available_only:
            available_food_ids = MicroKitchenFood.objects.filter(
                is_available=True
            ).values_list('food_id', flat=True).distinct()
            queryset = queryset.filter(id__in=available_food_ids)
        return queryset.distinct()
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'meal_types__name', 'cuisine_types__name', 'micro_kitchen__brand_name']


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
            from django.db.models import Q
            from .models import UserDietPlan, UserNutritionistMapping
            
            # 1. Patients where they are currently active
            active_patient_ids = UserNutritionistMapping.objects.filter(
                nutritionist=user, is_active=True
            ).values_list('user_id', flat=True)
            
            # 2. Patients where they were the original nutritionist (reassigned)
            reassigned_plans = UserDietPlan.objects.filter(
                original_nutritionist=user, status='active'
            ).select_related('user')
            
            # Combine logic
            # Query for reports where:
            # - Patient is in active_patient_ids (Full access)
            # - OR Patient is in reassigned_plans AND uploaded_on < nutritionist_effective_from
            
            condition = Q(user_id__in=active_patient_ids)
            
            for plan in reassigned_plans:
                if plan.nutritionist_effective_from:
                    condition |= Q(user_id=plan.user_id, uploaded_on__lt=plan.nutritionist_effective_from)
                else:
                    # If no effective date set yet, original nutritionist can see everything until it is set
                    condition |= Q(user_id=plan.user_id)
            
            queryset = queryset.filter(condition)
            
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
            from django.db.models import Q
            from .models import UserNutritionistMapping
            
            # 1. Identify patients currently mapped to this nutritionist
            mapped_patient_ids = UserNutritionistMapping.objects.filter(
                nutritionist=user, is_active=True
            ).values_list('user_id', flat=True)
            
            # 2. Nutritionists can see:
            # - Any review they gave personally (even if patient is reassigned)
            # - ANY review for a patient they are currently managing (to see history)
            
            queryset = queryset.filter(
                Q(nutritionist=user) | Q(user_id__in=mapped_patient_ids)
            )
            
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
    queryset = UserDietPlan.objects.all().select_related(
        'user', 'nutritionist', 'diet_plan', 'review', 'micro_kitchen', 'micro_kitchen__user',
        'original_micro_kitchen', 'original_micro_kitchen__user', 'verified_by',
    ).prefetch_related('diet_plan__features')
    serializer_class = UserDietPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset

        patient_id = self.request.query_params.get('user')
        status_filter = self.request.query_params.get('status')
        payment_status_filter = self.request.query_params.get('payment_status')

        if user.role == "admin":
            if patient_id:
                queryset = queryset.filter(user_id=patient_id)
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            if payment_status_filter:
                queryset = queryset.filter(payment_status=payment_status_filter)
            return queryset.order_by('-suggested_on')

        if user.role == "nutritionist":
            # Identify patients mapped to this nutritionist (active)
            mapped_patient_ids = list(UserNutritionistMapping.objects.filter(
                nutritionist=user, is_active=True
            ).values_list('user_id', flat=True))
            
            # Also include patients where this nutritionist is the original_nutritionist (reassigned)
            # This is crucial for them to see the plan and edit dates prior to the switch.
            was_original_patient_ids = list(UserDietPlan.objects.filter(
                original_nutritionist=user, status='active'
            ).values_list('user_id', flat=True))
            
            all_relevant_patient_ids = list(set(mapped_patient_ids + was_original_patient_ids))
            
            queryset = queryset.filter(user_id__in=all_relevant_patient_ids)
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
        """Patient approves plan. Optional start_date; admin assigns it when verifying payment."""
        udp = self.get_object()
        if udp.user_id != request.user.id:
            return Response({"detail": "Only the assigned patient can approve."}, status=status.HTTP_403_FORBIDDEN)
        if udp.status != 'suggested':
            return Response({"detail": f"Cannot approve: current status is {udp.status}."}, status=status.HTTP_400_BAD_REQUEST)
        start_date = None
        start_date_str = request.data.get('start_date')
        if start_date_str:
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
    def upload_payment(self, request, pk=None):
        """Patient uploads payment screenshot. Accepts multipart/form-data with 'screenshot' file, 
        plus amount_paid and transaction_id."""
        udp = self.get_object()
        if udp.user_id != request.user.id:
            return Response({"detail": "Only the assigned patient can upload payment."}, status=status.HTTP_403_FORBIDDEN)
        if udp.status != 'payment_pending':
            return Response({"detail": f"Cannot upload payment: status is {udp.status}."}, status=status.HTTP_400_BAD_REQUEST)
        
        screenshot = request.FILES.get('screenshot') or request.FILES.get('payment_screenshot')
        if not screenshot:
            return Response({"detail": "Payment screenshot file is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        amount_paid = request.data.get('amount_paid')
        transaction_id = request.data.get('transaction_id')
        
        # Convert empty strings to None
        if amount_paid == "": amount_paid = None
        if transaction_id == "": transaction_id = None
        
        udp.upload_payment(
            screenshot=screenshot, 
            amount_paid=amount_paid, 
            transaction_id=transaction_id
        )
        return Response(self.get_serializer(udp).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        """Admin verifies payment and assigns start date. Activates plan."""
        udp = self.get_object()
        if request.user.role != 'admin':
            return Response({"detail": "Only admin can verify payment."}, status=status.HTTP_403_FORBIDDEN)
        if udp.payment_status != 'uploaded':
            return Response({"detail": f"Cannot verify: payment status is {udp.payment_status}."}, status=status.HTTP_400_BAD_REQUEST)
        start_date_str = request.data.get('start_date')
        start_date = None
        if start_date_str:
            from datetime import datetime
            try:
                start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response({"detail": "Invalid start_date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
            if start_date < timezone.now().date():
                return Response({"detail": "Start date cannot be in the past."}, status=status.HTTP_400_BAD_REQUEST)
        udp.verify_payment(admin_user=request.user, start_date=start_date)
        return Response(self.get_serializer(udp).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def reject_payment(self, request, pk=None):
        """Admin rejects payment. Patient can re-upload screenshot."""
        udp = self.get_object()
        if request.user.role != 'admin':
            return Response({"detail": "Only admin can reject payment."}, status=status.HTTP_403_FORBIDDEN)
        udp.reject_payment()
        return Response(self.get_serializer(udp).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reassign-micro-kitchen')
    def reassign_micro_kitchen(self, request, pk=None):
        """Nutritionist or admin: change kitchen from effective_from; pins past meals to old kitchen, deletes future meals."""
        plan = self.get_object()
        role = getattr(request.user, 'role', None)
        if role not in ('nutritionist', 'admin'):
            return Response(
                {"detail": "Only nutritionist or admin can reassign micro kitchen."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ReassignMicroKitchenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_kitchen = serializer.validated_data['new_micro_kitchen']
        reason = serializer.validated_data['reason']
        notes_raw = serializer.validated_data.get('notes') or ''
        notes = notes_raw.strip() or None
        effective_from = serializer.validated_data.get('effective_from')
        if effective_from is None:
            effective_from = timezone.now().date()

        # Enforce the handoff date within plan duration, so ownership split is deterministic.
        if plan.start_date and effective_from < plan.start_date:
            return Response(
                {"detail": "effective_from cannot be before the plan start_date."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if plan.end_date and effective_from > plan.end_date:
            return Response(
                {"detail": "effective_from cannot be after the plan end_date."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_kitchen.status != 'approved':
            return Response(
                {"detail": "New kitchen must be approved before assignment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        previous = plan.micro_kitchen
        if previous and new_kitchen.pk == previous.pk:
            return Response(
                {"detail": "New kitchen must be different from the current kitchen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if plan.status not in ('active', 'approved', 'payment_pending'):
            return Response(
                {"detail": f"Cannot reassign kitchen for plan status {plan.status}."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if role == 'nutritionist':
            patient = plan.user
            pid = patient.pk if patient else None
            allowed = (
                (pid and UserNutritionistMapping.objects.filter(
                    nutritionist=request.user, user_id=pid, is_active=True
                ).exists())
                or (plan.nutritionist_id == request.user.id)
                or (plan.original_nutritionist_id == request.user.id)
            )
            if not allowed:
                return Response(
                    {"detail": "You cannot reassign kitchen for this patient/plan."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        with transaction.atomic():
            update_fields = ['micro_kitchen', 'micro_kitchen_effective_from']
            if not plan.original_micro_kitchen_id and previous is not None:
                plan.original_micro_kitchen = previous
                update_fields.append('original_micro_kitchen')

            if previous:
                UserMeal.objects.filter(
                    user_diet_plan=plan,
                    meal_date__lt=effective_from,
                ).update(micro_kitchen=previous)

            UserMeal.objects.filter(
                user_diet_plan=plan,
                meal_date__gte=effective_from,
            ).delete()

            plan.micro_kitchen = new_kitchen
            plan.micro_kitchen_effective_from = effective_from
            plan.save(update_fields=update_fields)

            MicroKitchenReassignment.objects.create(
                user_diet_plan=plan,
                previous_kitchen=previous,
                new_kitchen=new_kitchen,
                reason=reason,
                notes=notes,
                reassigned_by=request.user,
                effective_from=effective_from,
            )

            if plan.user_id:
                Notification.objects.create(
                    user_id=plan.user_id,
                    title="Your kitchen has been updated",
                    body=(
                        f"From {effective_from} onward, meals will be prepared by a new kitchen. "
                        "Your nutritionist will update remaining meal slots."
                    ),
                )
            if plan.nutritionist_id:
                Notification.objects.create(
                    user_id=plan.nutritionist_id,
                    title="Action required: reassign meals",
                    body=(
                        f"Kitchen changed for patient (user id {plan.user_id}). "
                        f"Please reassign meals from {effective_from}."
                    ),
                )

        plan.refresh_from_db()
        return Response(self.get_serializer(plan).data, status=status.HTTP_200_OK)


class UserMealViewSet(viewsets.ModelViewSet):
    queryset = UserMeal.objects.all().select_related(
        'user', 'user_diet_plan', 'meal_type', 'food', 'packaging_material', 'micro_kitchen'
    )
    serializer_class = UserMealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset

        patient_id = self.request.query_params.get('user')
        plan_id = self.request.query_params.get('user_diet_plan')
        date_str = self.request.query_params.get('meal_date')
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')

        if user.role == "admin":
            pass
        elif user.role == "nutritionist":
            # Active mappings
            mapped_patient_ids = list(UserNutritionistMapping.objects.filter(
                nutritionist=user, is_active=True
            ).values_list('user_id', flat=True))
            
            # Reassigned but formerly original mappings
            was_original_patient_ids = list(UserDietPlan.objects.filter(
                original_nutritionist=user, status='active'
            ).values_list('user_id', flat=True))
            
            all_relevant_patient_ids = list(set(mapped_patient_ids + was_original_patient_ids))
            
            queryset = queryset.filter(user_diet_plan__user_id__in=all_relevant_patient_ids)
        elif user.role == "micro_kitchen":
            # Meals scheduled for this kitchen (per-slot; supports mid-plan reassignment)
            queryset = queryset.filter(micro_kitchen__user=user)
        else:
            queryset = queryset.filter(user=user)

        if patient_id:
            queryset = queryset.filter(user_id=patient_id)
        if plan_id:
            queryset = queryset.filter(user_diet_plan_id=plan_id)
        if date_str:
            queryset = queryset.filter(meal_date=date_str)
        if start_date and end_date:
            queryset = queryset.filter(meal_date__range=[start_date, end_date])

        return queryset.order_by('meal_date', 'meal_type__id')

    def perform_create(self, serializer):
        udp = serializer.validated_data.get('user_diet_plan')
        mk = getattr(udp, 'micro_kitchen', None) if udp else None
        serializer.save(micro_kitchen=mk)

    @action(detail=False, methods=['get'], url_path='kitchen-patients')
    def kitchen_patients(self, request):
        """For micro_kitchen role: returns patients who have active diet plans assigned to this kitchen.
        Used for the patient filter dropdown in MealsBasedOnDaily."""
        user = request.user
        if getattr(user, 'role', None) != 'micro_kitchen':
            return Response({"detail": "Only micro kitchen users can access this."}, status=status.HTTP_403_FORBIDDEN)
        mk = MicroKitchenProfile.objects.filter(user=user).first()
        if not mk:
            return Response([])
        meal_user_ids = UserMeal.objects.filter(micro_kitchen=mk).values_list('user_id', flat=True).distinct()
        plan_user_ids = UserDietPlan.objects.filter(
            micro_kitchen=mk,
            status__in=['active', 'payment_pending', 'approved'],
        ).values_list('user_id', flat=True).distinct()
        all_ids = sorted(set(meal_user_ids) | set(plan_user_ids))
        patients = []
        for u in UserRegister.objects.filter(id__in=all_ids).order_by('first_name', 'last_name'):
            patients.append({
                'id': u.id,
                'patient_details': {
                    'id': u.id,
                    'first_name': u.first_name or '',
                    'last_name': u.last_name or '',
                },
            })
        return Response(patients)

    @action(detail=False, methods=['get'], url_path='monthly')
    def monthly_meals(self, request):
        """Fetch all meals for a month in one call. For micro_kitchen: only meals of allotted patients.
        Params: year, month. Optional: user (patient id)."""
        user = request.user
        year = request.query_params.get('year')
        month = request.query_params.get('month')
        if not year or not month:
            return Response(
                {"detail": "year and month are required (e.g. ?year=2025&month=3)"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            y, m = int(year), int(month)
            from datetime import date, timedelta
            start_date = date(y, m, 1)
            if m == 12:
                end_date = date(y, 12, 31)
            else:
                end_date = date(y, m + 1, 1) - timedelta(days=1)
        except (ValueError, TypeError):
            return Response({"detail": "Invalid year or month"}, status=status.HTTP_400_BAD_REQUEST)

        # Base queryset with date filter
        queryset = UserMeal.objects.select_related(
            'user', 'user_diet_plan', 'meal_type', 'food', 'packaging_material', 'micro_kitchen'
        ).filter(meal_date__range=[start_date, end_date])

        # Scope to logged-in user's role
        if getattr(user, 'role', None) == 'micro_kitchen':
            queryset = queryset.filter(micro_kitchen__user=user)
        elif getattr(user, 'role', None) == 'nutritionist':
            mapped_patient_ids = UserNutritionistMapping.objects.filter(
                nutritionist=user, is_active=True
            ).values_list('user_id', flat=True)
            queryset = queryset.filter(user_diet_plan__user_id__in=mapped_patient_ids)
        elif getattr(user, 'role', None) not in ('admin', 'Admin') and not getattr(user, 'is_staff', False):
            queryset = queryset.filter(user=user)

        patient_id = request.query_params.get('user')
        if patient_id:
            queryset = queryset.filter(user_id=patient_id)

        queryset = queryset.order_by('meal_date', 'meal_type__id')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='bulk-create')
    def bulk_create_meals(self, request):
        """Allows nutritionist to set multiple meals at once. Uses update_or_create per (user, meal_date, meal_type)."""
        data = request.data
        if not isinstance(data, list):
            return Response({"detail": "Expected a list of meal objects."}, status=status.HTTP_400_BAD_REQUEST)

        # Use BulkUserMealSerializer (no UniqueTogetherValidator - we handle via update_or_create)
        serializer = BulkUserMealSerializer(data=data, many=True)
        if serializer.is_valid():
            # Handle potential duplicates (unique_together: user, date, meal_type)
            # Efficiently batch create or update
            meals_to_create = []
            for item in serializer.validated_data:
                udp = item['user_diet_plan']
                mk = getattr(udp, 'micro_kitchen', None)
                UserMeal.objects.update_or_create(
                    user=item['user'],
                    meal_date=item['meal_date'],
                    meal_type=item['meal_type'],
                    defaults={
                        'food': item['food'],
                        'quantity': item.get('quantity'),
                        'user_diet_plan': udp,
                        'notes': item.get('notes'),
                        'packaging_material_id': item.get('packaging_material'),
                        'micro_kitchen': mk,
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


class MicroKitchenRatingViewSet(viewsets.ModelViewSet):
    queryset = MicroKitchenRating.objects.all().select_related('user', 'micro_kitchen', 'order')
    serializer_class = MicroKitchenRatingSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'], url_path='rate')
    def rate(self, request):
        """Create or update rating for a micro kitchen (upsert)."""
        micro_kitchen_id = request.data.get('micro_kitchen_id')
        rating_val = request.data.get('rating')
        review_text = request.data.get('review', '')
        order_id = request.data.get('order')
        if not micro_kitchen_id or rating_val is None or not order_id:
            return Response(
                {'error': 'micro_kitchen_id, rating and order are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            rating_val = int(rating_val)
            if rating_val < 1 or rating_val > 5:
                raise ValueError('Rating must be 1-5')
        except (ValueError, TypeError):
            return Response({'error': 'Rating must be 1-5'}, status=status.HTTP_400_BAD_REQUEST)
        obj, created = MicroKitchenRating.objects.update_or_create(
            user=request.user,
            order_id=order_id,
            defaults={'rating': rating_val, 'review': review_text or None, 'micro_kitchen_id': micro_kitchen_id}
        )
        self._recalculate_kitchen_stats(obj.micro_kitchen)
        return Response(self.get_serializer(obj).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def get_queryset(self):
        user = self.request.user
        qs = self.queryset
        if user.role == 'admin':
            pass
        elif user.role == 'micro_kitchen':
            qs = qs.filter(micro_kitchen__user=user)
        elif user.role == 'nutritionist':
            from .models import UserDietPlan
            kitchen_ids = UserDietPlan.objects.filter(nutritionist=user).exclude(micro_kitchen__isnull=True).values_list('micro_kitchen_id', flat=True).distinct()
            qs = qs.filter(micro_kitchen_id__in=kitchen_ids)
        else:
            qs = qs.filter(user=user)
        micro_kitchen_id = self.request.query_params.get('micro_kitchen')
        if micro_kitchen_id:
            qs = qs.filter(micro_kitchen_id=micro_kitchen_id)
        return qs

    def perform_create(self, serializer):
        rating_obj = serializer.save(user=self.request.user)
        self._recalculate_kitchen_stats(rating_obj.micro_kitchen)

    def perform_update(self, serializer):
        rating_obj = serializer.save()
        self._recalculate_kitchen_stats(rating_obj.micro_kitchen)

    def perform_destroy(self, instance):
        kitchen = instance.micro_kitchen
        instance.delete()
        self._recalculate_kitchen_stats(kitchen)

    def _recalculate_kitchen_stats(self, micro_kitchen):
        from django.db.models import Avg, Count
        stats = MicroKitchenRating.objects.filter(micro_kitchen=micro_kitchen).aggregate(
            avg_rating=Avg('rating'),
            total=Count('id')
        )
        micro_kitchen.rating = stats['avg_rating'] or 0
        micro_kitchen.total_reviews = stats['total'] or 0
        micro_kitchen.save()

class CartViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'], url_path='add-item')
    def add_item(self, request):
        food_id = request.data.get('food_id')
        kitchen_id = request.data.get('kitchen_id')
        quantity = int(request.data.get('quantity', 1))

        if not food_id or not kitchen_id:
            return Response({"error": "food_id and kitchen_id required"}, status=400)

        # Ensure user has a cart for this kitchen
        cart, _ = Cart.objects.get_or_create(user=request.user, micro_kitchen_id=kitchen_id)
        
        # Check if item exists in cart
        cart_item, created = CartItem.objects.get_or_create(cart=cart, food_id=food_id, defaults={'quantity': quantity})
        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        return Response({"message": "Item added to cart", "cart_id": cart.id})


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            qs = Order.objects.all().order_by('-created_at')
            micro_kitchen_id = self.request.query_params.get('micro_kitchen')
            if micro_kitchen_id:
                qs = qs.filter(micro_kitchen_id=micro_kitchen_id)
            return qs

        if user.role == 'micro_kitchen':
            return Order.objects.filter(micro_kitchen__user=user).order_by('-created_at')

        return Order.objects.filter(user=user).order_by('-created_at')

    @action(detail=False, methods=['post'], url_path='place-order')
    def place_order(self, request):
        cart_id = request.data.get('cart_id')
        delivery_address = request.data.get('delivery_address')

        if not cart_id:
            return Response({"error": "cart_id required"}, status=400)

        try:
            cart = Cart.objects.get(id=cart_id, user=request.user)
            cart_items = cart.items.all()
            
            if not cart_items:
                return Response({"error": "Cart is empty"}, status=400)

            # Get price from MicroKitchenFood if available, else Food
            def get_price(item):
                mcf = MicroKitchenFood.objects.filter(
                    micro_kitchen=cart.micro_kitchen, food=item.food
                ).first()
                if mcf:
                    return float(mcf.price)
                return (item.food.price or 0) if item.food.price else 0

            total_amount = sum(get_price(item) * item.quantity for item in cart_items)
            
            # Create Order
            order = Order.objects.create(
                user=request.user,
                micro_kitchen=cart.micro_kitchen,
                order_type='patient' if request.user.role == 'patient' else 'non_patient',
                total_amount=total_amount,
                delivery_address=delivery_address or (getattr(request.user, 'address', '')),
                status='placed'
            )

            # Create OrderItems
            for item in cart_items:
                price = get_price(item)
                OrderItem.objects.create(
                    order=order,
                    food=item.food,
                    quantity=item.quantity,
                    price=price,
                    subtotal=price * item.quantity
                )

            # Clear cart
            cart.delete()

            return Response({"message": "Order placed successfully", "order_id": order.id}, status=201)

        except Cart.DoesNotExist:
            return Response({"error": "Cart not found"}, status=404)

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_order_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        
        valid_statuses = [s[0] for s in Order._meta.get_field('status').choices]
        if new_status not in valid_statuses:
            return Response({"error": "Invalid status"}, status=400)

        order.status = new_status
        order.save()
        return Response({"message": f"Order status updated to {new_status}"})


class CartItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)


class AdminPatientOverviewViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin-only: paginated list of users with role=patient (summary columns);
    retrieve returns nested questionnaire, health reports, nutritionist reviews,
    diet plans, active plan, and UserMeal rows (food + packaging material).
    """

    permission_classes = [IsAuthenticated, IsAdminRole]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'mobile']

    def get_queryset(self):
        from django.db.models import Count, Exists, OuterRef, Prefetch

        qs = UserRegister.objects.filter(role='patient').select_related('city', 'state', 'country')
        if self.action == 'list':
            qs = qs.annotate(
                _hr_count=Count('health_reports', distinct=True),
                _has_q=Exists(UserQuestionnaire.objects.filter(user_id=OuterRef('pk'))),
            ).prefetch_related(
                Prefetch(
                    'diet_plans',
                    queryset=UserDietPlan.objects.filter(status='active').select_related('diet_plan').order_by('-id'),
                    to_attr='_active_diet_plans',
                )
            )
        return qs.order_by('-id')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AdminPatientDetailSerializer
        return AdminPatientListSerializer


class AdminMicroKitchenPatientsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin-only: list patients assigned to a specific micro kitchen (daily slots).
    """

    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = AdminMicroKitchenPatientSlotSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['user__username', 'user__email', 'user__first_name', 'user__last_name']

    def get_queryset(self):
        micro_kitchen_id = self.request.query_params.get('micro_kitchen')
        status_param = self.request.query_params.get('status')

        if not micro_kitchen_id:
            return UserDietPlan.objects.none()

        qs = UserDietPlan.objects.filter(micro_kitchen_id=micro_kitchen_id).select_related(
            'user', 'diet_plan'
        )

        if status_param:
            qs = qs.filter(status=status_param)
        else:
            qs = qs.filter(status__in=['active', 'payment_pending', 'approved'])

        return qs.order_by('-suggested_on')


class MicroKitchenPatientsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Allows a Micro-Kitchen to view patients currently allotted to them via diet plans.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = AdminMicroKitchenPatientSlotSerializer
    pagination_class = Pagination

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) != 'micro_kitchen':
            return UserDietPlan.objects.none()

        return UserDietPlan.objects.filter(
            micro_kitchen__user=user,
            status__in=['active', 'approved', 'payment_pending']
        ).select_related('user', 'diet_plan', 'micro_kitchen').order_by('-id')


# ---- Admin MicroKitchen panels (NO pagination) -----------------------------

class AdminMicroKitchenPatientsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        micro_kitchen_id = request.query_params.get("micro_kitchen")
        status_param = request.query_params.get("status")

        if not micro_kitchen_id:
            return Response([])

        qs = UserDietPlan.objects.filter(micro_kitchen_id=micro_kitchen_id).select_related(
            "user", "diet_plan"
        )

        if status_param:
            qs = qs.filter(status=status_param)
        else:
            qs = qs.filter(status__in=["active", "payment_pending", "approved"])

        qs = qs.order_by("-suggested_on")
        serializer = AdminMicroKitchenPatientSlotSerializer(qs, many=True)
        return Response(serializer.data)


class AdminMicroKitchenInspectionsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        micro_kitchen_id = request.query_params.get("micro_kitchen")
        if not micro_kitchen_id:
            return Response([])

        qs = MicroKitchenInspection.objects.filter(micro_kitchen_id=micro_kitchen_id).order_by("-id")
        serializer = MicroKitchenInspectionSerializer(qs, many=True)
        return Response(serializer.data)


class AdminMicroKitchenReviewsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        micro_kitchen_id = request.query_params.get("micro_kitchen")
        if not micro_kitchen_id:
            return Response([])

        qs = MicroKitchenRating.objects.filter(micro_kitchen_id=micro_kitchen_id).order_by("-id")
        serializer = MicroKitchenRatingSerializer(qs, many=True)
        return Response(serializer.data)


class AdminMicroKitchenOrdersNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        micro_kitchen_id = request.query_params.get("micro_kitchen")
        if not micro_kitchen_id:
            return Response([])

        qs = Order.objects.filter(micro_kitchen_id=micro_kitchen_id).select_related("user", "micro_kitchen").order_by(
            "-created_at"
        )
        serializer = OrderSerializer(qs, many=True)
        return Response(serializer.data)


class AdminMicroKitchenFoodsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        micro_kitchen_id = request.query_params.get("micro_kitchen")
        if not micro_kitchen_id:
            return Response([])

        qs = (
            MicroKitchenFood.objects.filter(
                micro_kitchen_id=micro_kitchen_id,
                is_available=True,
            )
            .select_related("micro_kitchen", "food")
            .prefetch_related("food__meal_types", "food__cuisine_types")
            .order_by("micro_kitchen__brand_name", "food__name")
        )
        serializer = MicroKitchenFoodSerializer(qs, many=True)
        return Response(serializer.data)


class AdminMicroKitchenMealsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        micro_kitchen_id = request.query_params.get("micro_kitchen")
        if not micro_kitchen_id:
            return Response([])

        qs = UserMeal.objects.filter(
            micro_kitchen_id=micro_kitchen_id
        ).select_related(
            "user", "user_diet_plan", "meal_type", "food", "packaging_material", "micro_kitchen"
        ).order_by("meal_date", "meal_type__id")

        serializer = UserMealSerializer(qs, many=True)
        return Response(serializer.data)

# ---- Admin Nutritionist panels (NO pagination) -----------------------------

class AdminNutritionistPatientsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        nutritionist_id = request.query_params.get("nutritionist")
        if not nutritionist_id:
            return Response([])

        mappings = UserNutritionistMapping.objects.filter(
            nutritionist_id=nutritionist_id, is_active=True
        ).select_related("user")
        
        results = []
        for m in mappings:
            p = m.user
            results.append({
                "id": p.id,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "email": p.email,
                "mobile": p.mobile,
                "assigned_on": m.assigned_on,
            })
        return Response(results)


class AdminNutritionistDietPlansNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        nutritionist_id = request.query_params.get("nutritionist")
        if not nutritionist_id:
            return Response([])

        qs = UserDietPlan.objects.filter(nutritionist_id=nutritionist_id).select_related(
            "user", "diet_plan", "micro_kitchen"
        ).order_by("-suggested_on")
        serializer = UserDietPlanSerializer(qs, many=True)
        return Response(serializer.data)


class AdminNutritionistMealsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        nutritionist_id = request.query_params.get("nutritionist")
        if not nutritionist_id:
            return Response([])

        qs = UserMeal.objects.filter(
            user_diet_plan__nutritionist_id=nutritionist_id
        ).select_related(
            "user", "user_diet_plan", "meal_type", "food", "packaging_material"
        ).order_by("-meal_date", "meal_type__id")
        serializer = UserMealSerializer(qs, many=True)
        return Response(serializer.data)


class AdminNutritionistMeetingsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        nutritionist_id = request.query_params.get("nutritionist")
        if not nutritionist_id:
            return Response([])

        qs = MeetingRequest.objects.filter(
            nutritionist_id=nutritionist_id
        ).select_related("patient").order_by("-created_on")
        serializer = MeetingRequestSerializer(qs, many=True)
        return Response(serializer.data)


class AdminNutritionistOverviewViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin-only: list users with role=nutritionist; 
    retrieve returns full nutritionist dossier.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['username', 'email', 'first_name', 'last_name', 'mobile']

    def get_queryset(self):
        return UserRegister.objects.filter(role='nutritionist').order_by('-id')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AdminNutritionistDetailSerializer
        # We can use a simpler serializer for the list if needed, or stick to a basic one.
        # UserManagementSerializer is fine for summary list.
        return UserManagementSerializer


# ── Support Tickets ───────────────────────────────────────────────────────────

class TicketCategoryViewSet(viewsets.ModelViewSet):
    queryset = TicketCategory.objects.all().order_by("name")
    serializer_class = TicketCategorySerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    def get_permissions(self):
        # Everyone authenticated can read categories (for ticket creation).
        if self.action in ["list", "retrieve", "list_all"]:
            return [IsAuthenticated()]
        # Only admin can manage categories.
        return [IsAuthenticated(), IsAdminRole()]

    @action(detail=False, methods=["get"], url_path="all")
    def list_all(self, request):
        qs = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class SupportTicketViewSet(viewsets.ModelViewSet):
    serializer_class = SupportTicketSerializer
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "description", "created_by__username", "created_by__first_name", "created_by__last_name"]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        qs = SupportTicket.objects.all().select_related("created_by", "assigned_to", "category").order_by("-id")

        status_param = self.request.query_params.get("status")
        user_type_param = self.request.query_params.get("user_type")
        mine = self.request.query_params.get("mine")

        if getattr(u, "role", None) != "admin":
            qs = qs.filter(created_by=u)
        else:
            if mine in ["1", "true", "True", "yes", "y"]:
                qs = qs.filter(created_by=u)

        if status_param:
            qs = qs.filter(status=status_param)
        if user_type_param:
            qs = qs.filter(user_type=user_type_param)
        return qs

    def perform_create(self, serializer):
        u = self.request.user

        role = getattr(u, "role", None)
        if role == "patient" or role == "non_patient":
            user_type = "patient"
        elif role == "nutritionist":
            user_type = "nutritionist"
        elif role == "micro_kitchen":
            user_type = "kitchen"
        else:
            # Admin creating on behalf; accept incoming user_type if valid, else default to patient.
            user_type = self.request.data.get("user_type") or "patient"

        assigned_to = serializer.validated_data.get("assigned_to", None)
        if getattr(u, "role", None) != "admin":
            assigned_to = None

        serializer.save(created_by=u, user_type=user_type, assigned_to=assigned_to)

    def perform_update(self, serializer):
        u = self.request.user
        if getattr(u, "role", None) != "admin":
            # Non-admins can only update limited fields
            allowed = {"title", "description", "priority"}
            incoming = set(serializer.validated_data.keys())
            if not incoming.issubset(allowed):
                raise PermissionDenied("You are not allowed to update these fields.")
        serializer.save()

    @action(detail=False, methods=["get"], url_path="all")
    def list_all(self, request):
        qs = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class TicketMessageViewSet(viewsets.ModelViewSet):
    serializer_class = TicketMessageSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ["message", "sender__username", "sender__first_name", "sender__last_name"]

    def get_queryset(self):
        u = self.request.user
        qs = TicketMessage.objects.all().select_related(
            "ticket", "sender", "ticket__created_by", "ticket__assigned_to", "ticket__category"
        ).order_by("created_at")

        ticket_id = self.request.query_params.get("ticket")
        if ticket_id:
            qs = qs.filter(ticket_id=ticket_id)

        if getattr(u, "role", None) != "admin":
            qs = qs.filter(ticket__created_by=u, is_internal=False)
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        ticket = serializer.validated_data.get("ticket")

        # Only admin can post internal notes; also enforce ticket access.
        is_internal = bool(serializer.validated_data.get("is_internal", False))
        if getattr(u, "role", None) != "admin":
            is_internal = False
            if not ticket or ticket.created_by_id != u.id:
                raise PermissionDenied("Not allowed to post on this ticket.")

        serializer.save(sender=u, is_internal=is_internal)


class TicketAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = TicketAttachmentSerializer
    pagination_class = Pagination
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        u = self.request.user
        qs = TicketAttachment.objects.all().select_related("ticket", "uploaded_by", "ticket__created_by").order_by("-id")
        ticket_id = self.request.query_params.get("ticket")
        if ticket_id:
            qs = qs.filter(ticket_id=ticket_id)
        if getattr(u, "role", None) != "admin":
            qs = qs.filter(ticket__created_by=u)
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        ticket = serializer.validated_data.get("ticket")
        if getattr(u, "role", None) != "admin":
            if not ticket or ticket.created_by_id != u.id:
                raise PermissionDenied("Not allowed to upload for this ticket.")
        serializer.save(uploaded_by=u)
