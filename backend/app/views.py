from datetime import date, datetime, timedelta

from django.shortcuts import render, get_object_or_404
from django.db.models import Count, DecimalField, F, Prefetch, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.db import transaction
from rest_framework import viewsets, status, filters, mixins, generics
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
import math
from decimal import Decimal
from rest_framework import status

from .models import *
from .serializers import *

import os
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from .utils.file_parsers import get_file_parser
from .services.import_service import ImportService
from .questionnaire_sync import sync_user_questionnaire_relations

class Pagination(PageNumberPagination):
    page_query_param = "page"
    page_size_query_param = "limit"
    page_size = 10
    max_page_size = 500

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


class NotificationPagination(PageNumberPagination):
    """Pagination for notifications list; allows larger page sizes than global Pagination."""

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
            "next": next_page,
            "previous": previous_page,
            "current_page": current_page,
            "total_pages": total_pages,
            "results": data,
        })



def _notification_user_display(user):
    if not user:
        return "Someone"
    name = f"{(user.first_name or '').strip()} {(user.last_name or '').strip()}".strip()
    return name or getattr(user, "username", None) or "Someone"


# Create your views here.
class IsAdminRole(BasePermission):
    """Allow only authenticated users with role='admin'."""

    def has_permission(self, request, view):
        u = request.user
        return bool(u and u.is_authenticated and getattr(u, 'role', None) == 'admin')


class IsAdminOrDoctorRole(BasePermission):
    """Allow authenticated users with role admin or doctor (shared admin-patient directory)."""

    def has_permission(self, request, view):
        u = request.user
        return bool(
            u and u.is_authenticated and getattr(u, 'role', None) in ('admin', 'doctor')
        )


class AuthenticatedReadAdminWrite(BasePermission):
    """Any authenticated user may list/retrieve (for dropdowns); only admin may create/update/delete."""

    def has_permission(self, request, view):
        u = request.user
        if not u or not u.is_authenticated:
            return False
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return True
        return getattr(u, "role", None) == "admin"


class PatientToMicroKitchenDistanceView(APIView):
    """
    Calculate distances between a specific patient and all approved micro-kitchens.
    Returns a sorted list of kitchen names, lat/lng, and calculated distance.
    Used for the distance finding between microkitchen and patients in admin panel.
    """
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, patient_id):
        try:
            patient = UserRegister.objects.get(id=patient_id)
        except UserRegister.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        p_lat = patient.latitude
        p_lng = patient.longitude

        if p_lat is None or p_lng is None:
             return Response({
                 "error": "Patient has no coordinates (latitude/longitude)",
                 "name": f"{patient.first_name} {patient.last_name}"
             }, status=400)

        # Get all approved micro-kitchens with their profiles
        kitchens = MicroKitchenProfile.objects.select_related('user').filter(status='approved')
        
        # Helper to calculate distances. Note: _haversine_km is defined later in the file.
        # It's okay because methods are looked up at runtime, but we'll manually implement here
        # or refer it if we can. Actually, we'll use it since it's in the module.

        results = []
        for mk in kitchens:
            k_lat = mk.user.latitude
            k_lng = mk.user.longitude
            
            # Using the helper from below
            dist = _haversine_km(p_lat, p_lng, k_lat, k_lng)
            
            results.append({
                "id": mk.id,
                "user_id": mk.user.id,
                "brand_name": mk.brand_name or mk.user.username,
                "latitude": k_lat,
                "longitude": k_lng,
                "distance_km": round(dist, 2) if dist is not None else None,
                "city": mk.user.city.name if mk.user.city else None,
                "status": mk.status
            })

        # Sort by distance (shorter first). None (infinite) moves to the end.
        results.sort(key=lambda x: x['distance_km'] if x['distance_km'] is not None else float('inf'))

        return Response(results)


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


class AdminDashboardCountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from website.models import Patent

        return Response({
            "countries": Country.objects.count(),
            "states": State.objects.count(),
            "cities": City.objects.count(),
            "users": UserRegister.objects.count(),
            "patients": UserRegister.objects.filter(role="patient").count(),
            "nonPatients": UserRegister.objects.filter(role="non_patient").count(),
            "nutritionists": UserRegister.objects.filter(role="nutritionist").count(),
            "microKitchens": UserRegister.objects.filter(role="micro_kitchen").count(),
            "allottedPatients": UserRegister.objects.filter(is_patient_mapped=True).count(),
            "patents": Patent.objects.count(),
            "supportTickets": SupportTicket.objects.count(),
            "healthParameters": HealthParameter.objects.count(),
            "mealTypes":     MealType.objects.count(),
            "cuisineTypes":  CuisineType.objects.count(),
            "packaging":      PackagingMaterial.objects.count(),
            "recipes":       Food.objects.count(),
            "foodGroups":    FoodGroup.objects.count(),
            "foodNames":     FoodName.objects.count(),
            "nutrients":     FoodProximate.objects.count(),
            "dietPlans":     DietPlans.objects.count(),
            "verifications":  UserDietPlan.objects.filter(status='payment_pending').count(),
            # Status Counts for Activity Section
            "ticketsOpen": SupportTicket.objects.filter(status='open').count(),
            "ticketsInProgress": SupportTicket.objects.filter(status='in_progress').count(),
            "ticketsResolved": SupportTicket.objects.filter(status='resolved').count(),
            "plansPaymentPending": UserDietPlan.objects.filter(status='payment_pending').count(),
            "plansActive": UserDietPlan.objects.filter(status='active').count(),
            "plansCompleted": UserDietPlan.objects.filter(status='completed').count(),
        })


class PatientDashboardCountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "questionnaire": UserQuestionnaire.objects.filter(user=user).count(),
            "healthReports": PatientHealthReport.objects.filter(user=user).count(),
            "nutritionistAllotted": UserNutritionistMapping.objects.filter(user=user, is_active=True).count(),
            "dietPlans": UserDietPlan.objects.filter(user=user).count(),
            "microKitchens": MicroKitchenProfile.objects.filter(status="approved").count(),
            "suggestedPlans": UserDietPlan.objects.filter(user=user, status="suggested").count(),
            "mealsAllotted": UserMeal.objects.filter(user=user).count(),
            "consultations": MeetingRequest.objects.filter(patient=user).count(),
            "foods": MicroKitchenFood.objects.filter(is_available=True).count(),
            "cartItems": CartItem.objects.filter(cart__user=user).count(),
            "bookings": Order.objects.filter(user=user).count(),
            "supportTickets": SupportTicket.objects.filter(created_by=user).count(),
            # Status based analytics
            "plansPaymentPending": UserDietPlan.objects.filter(user=user, status='payment_pending').count(),
            "plansActive": UserDietPlan.objects.filter(user=user, status='active').count(),
            "plansCompleted": UserDietPlan.objects.filter(user=user, status='completed').count(),
            "consultationsPending": MeetingRequest.objects.filter(patient=user, status='pending').count(),
        })


class PatientServiceProvidersView(APIView):
    """Fetch assigned nutritionists and kitchens for the patient."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role != 'patient' and user.role != 'non_patient':
            return Response({"error": "Only patients/non-patients have assigned providers"}, status=400)

        # 1. Nutritionists (Mapped via UserNutritionistMapping)
        nut_mappings = UserNutritionistMapping.objects.filter(user=user).select_related('nutritionist')
        nutritionists = []
        seen_nuts = set()
        for m in nut_mappings:
            if m.nutritionist and m.nutritionist.id not in seen_nuts:
                name = [m.nutritionist.first_name, m.nutritionist.last_name]
                nutritionists.append({
                    "id": m.nutritionist.id,
                    "name": " ".join(filter(None, name)).strip() or m.nutritionist.username,
                    "is_active": m.is_active,
                    "role": "nutritionist"
                })
                seen_nuts.add(m.nutritionist.id)

        # 2. Kitchens (Mapped via UserDietPlan -> micro_kitchen OR via Order -> micro_kitchen)
        kitchens = []
        seen_kitchens = set()

        # Check UserDietPlan (typically for patients)
        diet_plans = UserDietPlan.objects.filter(user=user).select_related('micro_kitchen__user')
        for p in diet_plans:
            if p.micro_kitchen and p.micro_kitchen.user and p.micro_kitchen.user.id not in seen_kitchens:
                kitchens.append({
                    "id": p.micro_kitchen.user.id,
                    "name": p.micro_kitchen.brand_name or p.micro_kitchen.user.username,
                    "is_active": p.status == 'active',
                    "role": "kitchen"
                })
                seen_kitchens.add(p.micro_kitchen.user.id)

        # Check Order (for both patients and non-patients)
        orders = Order.objects.filter(user=user).select_related('micro_kitchen__user')
        for o in orders:
            if o.micro_kitchen and o.micro_kitchen.user and o.micro_kitchen.user.id not in seen_kitchens:
                kitchens.append({
                    "id": o.micro_kitchen.user.id,
                    "name": o.micro_kitchen.brand_name or o.micro_kitchen.user.username,
                    "is_active": True,
                    "role": "kitchen"
                })
                seen_kitchens.add(o.micro_kitchen.user.id)

        return Response({
            "nutritionists": nutritionists,
            "kitchens": kitchens
        })


class ExpertServiceProvidersView(APIView):
    """Fetch associated nutritionists/kitchens for experts."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = getattr(user, 'role', None)

        if role == 'nutritionist':
            # Find all kitchens linked to this nutritionist's patients
            plans = UserDietPlan.objects.filter(nutritionist=user).select_related('micro_kitchen__user')
            kitchens = []
            seen = set()
            for p in plans:
                if p.micro_kitchen and p.micro_kitchen.user and p.micro_kitchen.user.id not in seen:
                    kitchens.append({
                        "id": p.micro_kitchen.user.id,
                        "name": p.micro_kitchen.brand_name or p.micro_kitchen.user.username,
                        "is_active": p.status == 'active',
                        "role": "kitchen"
                    })
                    seen.add(p.micro_kitchen.user.id)
            return Response({"nutritionists": [], "kitchens": kitchens})

        elif role == 'micro_kitchen':
            # Find all nutritionists linked to this kitchen's patients
            # Kitchen is a Profile, linked to user
            try:
                mk_profile = user.micro_kitchen
            except:
                return Response({"nutritionists": [], "kitchens": []})

            plans = UserDietPlan.objects.filter(micro_kitchen=mk_profile).select_related('nutritionist')
            nutritionists = []
            seen = set()
            for p in plans:
                if p.nutritionist and p.nutritionist.id not in seen:
                    name = [p.nutritionist.first_name, p.nutritionist.last_name]
                    nutritionists.append({
                        "id": p.nutritionist.id,
                        "name": " ".join(filter(None, name)).strip() or p.nutritionist.username,
                        "is_active": True, # UserRegister itself doesn't have is_active for experts? It has, but we'll assume yes
                        "role": "nutritionist"
                    })
                    seen.add(p.nutritionist.id)
            return Response({"nutritionists": nutritionists, "kitchens": []})

        return Response({"error": "Only experts can use this endpoint"}, status=400)


class NutritionDashboardCountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        mapped_ids = UserNutritionistMapping.objects.filter(
            nutritionist=user, is_active=True
        ).values_list("user_id", flat=True)

        return Response({
            "questionnaire": NutritionistProfile.objects.filter(user=user).count(),
            "allottedPatients": UserNutritionistMapping.objects.filter(nutritionist=user, is_active=True).count(),
            "mealOptimizer": UserMeal.objects.filter(user_id__in=mapped_ids).count(),
            "microKitchens": MicroKitchenProfile.objects.filter(status="approved").count(),
            "patientDocuments": PatientHealthReport.objects.filter(user_id__in=mapped_ids).count(),
            "suggestedPlans": UserDietPlan.objects.filter(nutritionist=user, status="suggested").count(),
            "approvedPlans": UserDietPlan.objects.filter(nutritionist=user, status="approved").count(),
            "meetingRequests": MeetingRequest.objects.filter(nutritionist=user).count(),
            "supportTickets": SupportTicket.objects.filter(Q(created_by=user) | Q(assigned_to=user)).count(),
            # Status based analytics
            "plansSuggested": UserDietPlan.objects.filter(nutritionist=user, status="suggested").count(),
            "plansApproved": UserDietPlan.objects.filter(nutritionist=user, status="approved").count(),
            "meetingsPending": MeetingRequest.objects.filter(nutritionist=user, status="pending").count(),
            "meetingsResolved": MeetingRequest.objects.filter(nutritionist=user, status="resolved").count(),
        })


class MicroKitchenDashboardCountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        kitchen = MicroKitchenProfile.objects.filter(user=user).first()
        kitchen_id = kitchen.id if kitchen else None
        today = timezone.now().date()

        return Response({
            "questionnaire": 1 if kitchen_id else 0,
            "inspectionReports": MicroKitchenInspection.objects.filter(micro_kitchen_id=kitchen_id).count() if kitchen_id else 0,
            "patients": UserDietPlan.objects.filter(
                 Q(micro_kitchen_id=kitchen_id) | Q(original_micro_kitchen_id=kitchen_id),
                 status__in=['active', 'approved', 'payment_pending']
            ).count() if kitchen_id else 0,
            "dailyPrep": UserMeal.objects.filter(micro_kitchen_id=kitchen_id, meal_date=today).count() if kitchen_id else 0,
            "orders": Order.objects.filter(micro_kitchen_id=kitchen_id, created_at__date=today).count() if kitchen_id else 0,
            "availableFoods": MicroKitchenFood.objects.filter(micro_kitchen_id=kitchen_id, is_available=True).count() if kitchen_id else 0,
            "kitchenReviews": MicroKitchenRating.objects.filter(micro_kitchen_id=kitchen_id).count() if kitchen_id else 0,
            "supportTickets": SupportTicket.objects.filter(Q(created_by=user) | Q(assigned_to=user)).count(),
            # Status Counts
            "ordersPending": Order.objects.filter(micro_kitchen_id=kitchen_id, status__in=["placed", "accepted", "preparing", "ready"]).count() if kitchen_id else 0,
            "ordersCompleted": Order.objects.filter(micro_kitchen_id=kitchen_id, status="delivered").count() if kitchen_id else 0,
            "foodsAvailable": MicroKitchenFood.objects.filter(micro_kitchen_id=kitchen_id, is_available=True).count() if kitchen_id else 0,
            "foodsOutOfStock": MicroKitchenFood.objects.filter(micro_kitchen_id=kitchen_id, is_available=False).count() if kitchen_id else 0,
        })


class NonPatientDashboardCountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "foods": MicroKitchenFood.objects.filter(is_available=True).count(),
            "microKitchens": MicroKitchenProfile.objects.filter(status="approved").count(),
            "cartItems": CartItem.objects.filter(cart__user=user).count(),
            "bookings": Order.objects.filter(user=user).count(),
            "supportTickets": SupportTicket.objects.filter(created_by=user).count(),
            # Status based analytics
            "ordersPending": Order.objects.filter(user=user, status="pending").count(),
            "ordersCompleted": Order.objects.filter(user=user, status="delivered").count(),
        })


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
        
        status_param = self.request.query_params.get('status')
        if status_param == 'active':
            qs = qs.filter(is_active=True)
        elif status_param == 'inactive':
            qs = qs.filter(is_active=False)
            
        return qs

    # NOTE: UserRegister currently has no created_by field.
    # We intentionally do not filter by created_by, so list shows all users.


class AdminAllOrdersView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        search = request.query_params.get('search', '').strip()
        microkitchen = request.query_params.get('microkitchen', '').strip()
        
        # We'll pull from both Order (non-patient/general) and UserDietPlan (patient plans)
        # to give a comprehensive view, or just Order if that's the primary tracking.
        # For now, let's focus on the 'Order' model as it's the most "standard" order.
        qs = Order.objects.all().select_related('user', 'micro_kitchen', 'delivery_slab').order_by('-created_at')
        
        if microkitchen:
            qs = qs.filter(micro_kitchen_id=microkitchen)

        if search:
            qs = qs.filter(
                Q(id__icontains=search) |
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(micro_kitchen__brand_name__icontains=search) |
                Q(status__icontains=search)
            )

        paginator = Pagination()
        paginated_qs = paginator.paginate_queryset(qs, request)
        
        results = []
        for o in paginated_qs:
            results.append({
                "id": o.id,
                "order_id": f"ORD-{o.id:05d}",
                "patient_name": f"{o.user.first_name} {o.user.last_name}" if o.user else "Unknown Guest",
                "kitchen_name": o.micro_kitchen.brand_name if o.micro_kitchen else "Not Assigned",
                "amount": float(o.final_amount),
                "status": o.status,
                "created_at": o.created_at,
            })
            
        return paginator.get_paginated_response(results)


class AdminKitchenPayoutsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        kitchens = MicroKitchenProfile.objects.all()
        results = []
        for k in kitchens:
            total_sales = (
                Order.objects.filter(micro_kitchen=k, status="delivered").aggregate(
                    total=Sum("total_amount")
                )["total"]
                or 0
            )
            kt = PayoutTracker.objects.filter(
                payout_type=PayoutTracker.PAYOUT_TYPE_KITCHEN,
                micro_kitchen=k,
            )
            plan_pending = sum(
                max((t.total_amount - t.paid_amount), Decimal("0")) for t in kt
            )
            plan_disbursed = kt.aggregate(s=Sum("paid_amount"))["s"] or Decimal("0")
            results.append(
                {
                    "id": k.id,
                    "kitchen_name": k.brand_name,
                    "total_sales": float(total_sales),
                    "order_commission_example": float(total_sales) * 0.1,
                    "diet_plan_payout_pending": float(plan_pending),
                    "diet_plan_payout_disbursed": float(plan_disbursed),
                    "payout_status": "Pending" if plan_pending else "Clear",
                }
            )

        paginator = Pagination()
        paginated_data = paginator.paginate_queryset(results, request)
        return paginator.get_paginated_response(paginated_data)


class NutritionistPlanPayoutsView(generics.ListAPIView):
    """Paginated list of patients who have payout records for the logged-in nutritionist."""
    permission_classes = [IsAuthenticated]
    pagination_class = Pagination
    serializer_class = AdminPayoutPatientTrackersSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name']

    def get_queryset(self):
        if getattr(self.request.user, "role", None) != "nutritionist":
             return UserRegister.objects.none()
             
        from .models import PayoutTracker
        return (
            UserRegister.objects.filter(
                diet_plans__payment_snapshot__payouts__payout_type=PayoutTracker.PAYOUT_TYPE_NUTRITIONIST,
                diet_plans__payment_snapshot__payouts__nutritionist=self.request.user,
            )
            .distinct()
            .order_by("first_name", "last_name", "id")
        )

class MicroKitchenPlanPayoutsView(generics.ListAPIView):
    """Paginated list of patients who have payout records for the logged-in micro kitchen."""
    permission_classes = [IsAuthenticated]
    pagination_class = Pagination
    serializer_class = AdminPayoutPatientTrackersSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['first_name', 'last_name']

    def get_queryset(self):
        if getattr(self.request.user, "role", None) != "micro_kitchen":
             return UserRegister.objects.none()
             
        from .models import PayoutTracker, MicroKitchenProfile
        mk = MicroKitchenProfile.objects.filter(user=self.request.user).first()
        if not mk:
            return UserRegister.objects.none()

        return (
            UserRegister.objects.filter(
                diet_plans__payment_snapshot__payouts__payout_type=PayoutTracker.PAYOUT_TYPE_KITCHEN,
                diet_plans__payment_snapshot__payouts__micro_kitchen=mk,
            )
            .distinct()
            .order_by("first_name", "last_name", "id")
        )


class MicroKitchenOrderPaymentSnapshotsView(generics.ListAPIView):
    """
    Paginated list of frozen order payment splits (food subtotal → platform vs kitchen)
    for customer orders belonging to the logged-in micro kitchen.
    Separate from diet-plan payouts.
    """

    permission_classes = [IsAuthenticated]
    pagination_class = Pagination
    serializer_class = OrderPaymentSnapshotKitchenSerializer

    def get_queryset(self):
        from .models import MicroKitchenProfile, OrderPaymentSnapshot

        user = self.request.user
        if getattr(user, "role", None) != "micro_kitchen":
            return OrderPaymentSnapshot.objects.none()

        mk = MicroKitchenProfile.objects.filter(user=user).first()
        if not mk:
            return OrderPaymentSnapshot.objects.none()

        qs = (
            OrderPaymentSnapshot.objects.filter(order__micro_kitchen=mk)
            .select_related("order", "order__user")
        )

        search = (self.request.query_params.get("search") or "").strip()
        if search:
            if search.isdigit():
                qs = qs.filter(order_id=int(search))
            else:
                qs = qs.filter(
                    Q(order__user__first_name__icontains=search)
                    | Q(order__user__last_name__icontains=search)
                    | Q(order__user__username__icontains=search)
                )

        return qs.order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        stats = queryset.aggregate(
            total_orders=Count("id"),
            total_kitchen_amount=Sum("kitchen_amount"),
            total_platform_amount=Sum("platform_amount"),
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data["total_orders"] = stats["total_orders"] or 0
            response.data["total_kitchen_amount"] = str(stats["total_kitchen_amount"] or 0)
            response.data["total_platform_amount"] = str(stats["total_platform_amount"] or 0)
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "results": serializer.data,
                "total_orders": stats["total_orders"] or 0,
                "total_kitchen_amount": str(stats["total_kitchen_amount"] or 0),
                "total_platform_amount": str(stats["total_platform_amount"] or 0),
            }
        )


class SupplyChainDeliveryEarningsListView(generics.ListAPIView):
    """
    Delivered separate (customer) orders assigned to this supply-chain user.
    Delivery charge is the pass-through amount tied to that delivery.
    """

    permission_classes = [IsAuthenticated]
    pagination_class = Pagination
    serializer_class = SupplyChainDeliveryEarningsListSerializer

    def get_queryset(self):
        if getattr(self.request.user, "role", None) != "supply_chain":
            return Order.objects.none()

        qs = (
            Order.objects.filter(delivery_person=self.request.user, status="delivered")
            .select_related("micro_kitchen", "user", "payment_snapshot", "supply_chain_delivery_receipt")
            .order_by("-created_at")
        )

        search = (self.request.query_params.get("search") or "").strip()
        if search:
            if search.isdigit():
                qs = qs.filter(id=int(search))
            else:
                qs = qs.filter(
                    Q(user__first_name__icontains=search)
                    | Q(user__last_name__icontains=search)
                    | Q(user__username__icontains=search)
                    | Q(micro_kitchen__brand_name__icontains=search)
                )

        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        stats = queryset.aggregate(
            total_orders=Count("id"),
            total_delivery_earnings=Sum("delivery_charge"),
        )
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data["total_orders"] = stats["total_orders"] or 0
            response.data["total_delivery_earnings"] = str(stats["total_delivery_earnings"] or 0)
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "results": serializer.data,
                "total_orders": stats["total_orders"] or 0,
                "total_delivery_earnings": str(stats["total_delivery_earnings"] or 0),
            }
        )


class SupplyChainOrderDeliveryReceiptUpsertView(APIView):
    """Create or update receipt image + notes for a delivered order assigned to the caller."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "supply_chain":
            raise PermissionDenied()

        order_id = request.data.get("order_id")
        if not order_id:
            return Response({"detail": "order_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            oid = int(order_id)
        except (TypeError, ValueError):
            return Response({"detail": "Invalid order_id"}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(
            Order,
            id=oid,
            delivery_person=request.user,
            status="delivered",
        )

        receipt = getattr(order, "supply_chain_delivery_receipt", None)
        img = request.FILES.get("receipt_image")
        notes = (request.data.get("notes") or "").strip() or ""

        if receipt:
            if img:
                receipt.receipt_image = img
            receipt.notes = notes
            receipt.uploaded_by = request.user
            receipt.save()
            created = False
        else:
            if not img:
                return Response(
                    {"detail": "receipt_image file is required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            receipt = SupplyChainOrderDeliveryReceipt.objects.create(
                order=order,
                uploaded_by=request.user,
                receipt_image=img,
                notes=notes,
            )
            created = True

        data = SupplyChainOrderDeliveryReceiptReadSerializer(
            receipt, context={"request": request}
        ).data
        return Response(data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class PartnerPayoutTransactionListView(generics.ListAPIView):
    """List transactions for the logged-in partner (nutritionist or micro-kitchen)."""
    permission_classes = [IsAuthenticated]
    pagination_class = Pagination
    serializer_class = PayoutTransactionReadSerializer

    def get_queryset(self):
        from .models import PayoutTracker, MicroKitchenProfile
        user = self.request.user
        qs = PayoutTransaction.objects.none()
        
        if user.role == "nutritionist":
             qs = PayoutTransaction.objects.filter(tracker__nutritionist=user)
        elif user.role == "micro_kitchen":
             mk = MicroKitchenProfile.objects.filter(user=user).first()
             if mk:
                 qs = PayoutTransaction.objects.filter(tracker__micro_kitchen=mk)
        elif user.is_staff or getattr(user, "role", "") == "admin":
             qs = PayoutTransaction.objects.all()
             
        tracker_id = self.request.query_params.get("tracker")
        if tracker_id:
            qs = qs.filter(tracker_id=tracker_id)
            
        return qs.select_related(
            "tracker__nutritionist",
            "tracker__micro_kitchen",
            "tracker__snapshot__user_diet_plan__user",
            "tracker__snapshot__user_diet_plan__diet_plan",
            "paid_by",
        ).order_by("-paid_on")


class AdminPayoutTrackersForPayView(APIView):
    """List nutritionist/kitchen payout trackers that still have a remaining balance (admin)."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        ptype = (request.query_params.get("type") or "all").lower()
        qs = (
            PayoutTracker.objects.filter(
                payout_type__in=(
                    PayoutTracker.PAYOUT_TYPE_NUTRITIONIST,
                    PayoutTracker.PAYOUT_TYPE_KITCHEN,
                ),
                is_closed=False,
            )
            .filter(total_amount__gt=F("paid_amount"))
            .select_related(
                "nutritionist",
                "micro_kitchen",
                "snapshot__user_diet_plan__user",
                "snapshot__user_diet_plan__diet_plan",
            )
            .order_by("payout_type", "-id")
        )
        if ptype == "nutritionist":
            qs = qs.filter(payout_type=PayoutTracker.PAYOUT_TYPE_NUTRITIONIST)
        elif ptype == "kitchen":
            qs = qs.filter(payout_type=PayoutTracker.PAYOUT_TYPE_KITCHEN)
        return Response(AdminPayoutTrackerForPayoutSerializer(qs, many=True).data)


class AdminPayoutPatientsWithTrackersView(generics.ListAPIView):
    """
    Paginated list of patients who have at least one open/unpaid PayoutTracker.
    Includes the actual trackers nested inside each patient result.
    """

    permission_classes = [IsAuthenticated, IsAdminRole]
    pagination_class = Pagination
    serializer_class = AdminPayoutPatientTrackersSerializer

    def get_serializer_class(self):
        include_trackers = str(self.request.query_params.get("include_trackers", "1")).lower()
        if include_trackers in ("0", "false", "no"):
            return AdminPayoutPatientSummarySerializer
        return AdminPayoutPatientTrackersSerializer

    def get_queryset(self):
        from .models import PayoutTracker, UserRegister
        from django.db.models import F

        # We only want patients who have at least one tracker (nutritionist or kitchen) that is not closed and has money owed.
        qs = (
            UserRegister.objects.filter(
                diet_plans__payment_snapshot__payouts__payout_type__in=[
                    PayoutTracker.PAYOUT_TYPE_NUTRITIONIST,
                    PayoutTracker.PAYOUT_TYPE_KITCHEN,
                ],
                diet_plans__payment_snapshot__payouts__is_closed=False,
                diet_plans__payment_snapshot__payouts__total_amount__gt=F(
                    "diet_plans__payment_snapshot__payouts__paid_amount"
                ),
            )
            .distinct()
            .order_by("first_name", "last_name", "id")
        )
        search = (self.request.query_params.get("search") or "").strip()
        if search:
            qs = qs.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(username__icontains=search)
                | Q(email__icontains=search)
                | Q(diet_plans__diet_plan__title__icontains=search)
                | Q(diet_plans__diet_plan__code__icontains=search)
                | Q(diet_plans__payment_snapshot__payouts__nutritionist__first_name__icontains=search)
                | Q(diet_plans__payment_snapshot__payouts__nutritionist__last_name__icontains=search)
                | Q(diet_plans__payment_snapshot__payouts__nutritionist__username__icontains=search)
                | Q(diet_plans__payment_snapshot__payouts__micro_kitchen__brand_name__icontains=search)
            ).distinct()
        patient_id = self.request.query_params.get("patient_id")
        if patient_id:
            qs = qs.filter(id=patient_id)
        return qs


class AdminPayoutTransactionListCreateView(APIView):
    """List recent plan payout transfers or log a new payment (multipart supported)."""

    permission_classes = [IsAuthenticated, IsAdminRole]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        qs = PayoutTransaction.objects.select_related(
            "tracker__nutritionist",
            "tracker__micro_kitchen",
            "tracker__snapshot__user_diet_plan__user",
            "tracker__snapshot__user_diet_plan__diet_plan",
            "paid_by",
        ).all()
        tracker_id = request.query_params.get("tracker")
        if tracker_id:
            qs = qs.filter(tracker_id=tracker_id)
        
        qs = qs.order_by("-paid_on")
        paginator = Pagination()
        page = paginator.paginate_queryset(qs, request)
        ser = PayoutTransactionReadSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(ser.data)

    def post(self, request):
        ser = PayoutTransactionCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        tx = ser.save(paid_by=request.user)
        return Response(
            PayoutTransactionReadSerializer(tx, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class AdminPlanPaymentsOverviewView(APIView):
    """Paginated list of all verified plan payments (PlanPaymentSnapshot) with plan and patient context."""

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        qs = PlanPaymentSnapshot.objects.select_related(
            "user_diet_plan__user",
            "user_diet_plan__diet_plan",
            "user_diet_plan__nutritionist",
            "user_diet_plan__micro_kitchen",
            "user_diet_plan__verified_by",
        ).prefetch_related(
            Prefetch(
                "payouts",
                queryset=PayoutTracker.objects.select_related(
                    "nutritionist", "micro_kitchen"
                ).order_by("payout_type", "id"),
            ),
        )
        search = request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(user_diet_plan__user__first_name__icontains=search)
                | Q(user_diet_plan__user__last_name__icontains=search)
                | Q(user_diet_plan__user__email__icontains=search)
                | Q(user_diet_plan__user__username__icontains=search)
                | Q(user_diet_plan__diet_plan__title__icontains=search)
                | Q(user_diet_plan__diet_plan__code__icontains=search)
                | Q(user_diet_plan__transaction_id__icontains=search)
            )
        qs = (
            qs.annotate(
                total_disbursed=Coalesce(
                    Sum("payouts__paid_amount"),
                    Value(Decimal("0.00")),
                    output_field=DecimalField(max_digits=12, decimal_places=2),
                ),
            )
            .order_by("-created_at")
        )
        paginator = Pagination()
        page = paginator.paginate_queryset(qs, request)
        ser = AdminPlanPaymentOverviewSerializer(page, many=True)
        return paginator.get_paginated_response(ser.data)


class AdminNutritionAllottedPlanPayoutsView(APIView):
    """
    Admin: diet-plan payout lines for one nutritionist, only for patients currently
    mapped to that nutritionist (active UserNutritionistMapping).
    Query: nutrition_id = UserRegister id of the nutritionist.
    """

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        nid = request.query_params.get("nutrition_id")
        if not nid:
            return Response({"results": []})

        search = (request.query_params.get("search") or "").strip().lower()
        mappings = UserNutritionistMapping.objects.filter(
            nutritionist_id=nid, is_active=True
        ).select_related("user")

        results = []
        for m in mappings:
            p = m.user
            if not p:
                continue
            if search:
                blob = " ".join(
                    [
                        (p.first_name or ""),
                        (p.last_name or ""),
                        (p.username or ""),
                        (p.email or ""),
                    ]
                ).lower()
                if search not in blob:
                    continue

            trackers_list = list(
                PayoutTracker.objects.filter(
                    payout_type=PayoutTracker.PAYOUT_TYPE_NUTRITIONIST,
                    nutritionist_id=nid,
                    snapshot__user_diet_plan__user_id=p.id,
                )
                .select_related(
                    "nutritionist",
                    "snapshot__user_diet_plan__diet_plan",
                )
                .order_by("-created_at")
            )

            total_paid = sum((t.paid_amount for t in trackers_list), Decimal("0.00"))
            total_remaining = sum((t.remaining_amount for t in trackers_list), Decimal("0.00"))
            total_share = sum((t.total_amount for t in trackers_list), Decimal("0.00"))
            payable_lines = sum(
                1
                for t in trackers_list
                if not t.is_closed and t.total_amount > t.paid_amount
            )

            trackers_data = []
            for tracker in trackers_list:
                t_data = AdminPayoutTrackerForPayoutSerializer(tracker).data
                udp = tracker.snapshot.user_diet_plan
                uid = udp.user_id if udp else None
                nreas = NutritionistReassignment.objects.filter(user_id=uid).select_related(
                    "previous_nutritionist", "new_nutritionist"
                ).order_by("-reassigned_on")
                t_data["nutritionist_reassignments"] = [
                    {
                        "from": nr.previous_nutritionist.username if nr.previous_nutritionist else "None",
                        "to": nr.new_nutritionist.username if nr.new_nutritionist else "None",
                        "reason": nr.reason,
                        "date": nr.reassigned_on,
                    }
                    for nr in nreas
                ]
                trackers_data.append(t_data)

            plan_title = None
            for t in trackers_list:
                if not t.is_closed and t.total_amount > t.paid_amount:
                    dp = getattr(t.snapshot.user_diet_plan, "diet_plan", None)
                    plan_title = dp.title if dp else None
                    break
            if plan_title is None and trackers_list:
                dp = getattr(trackers_list[0].snapshot.user_diet_plan, "diet_plan", None)
                plan_title = dp.title if dp else None

            results.append(
                {
                    "id": p.id,
                    "patient_name": f"{p.first_name or ''} {p.last_name or ''}".strip() or p.username,
                    "email": p.email,
                    "mobile": getattr(p, "mobile", None),
                    "assigned_on": m.assigned_on,
                    "plan_title": plan_title,
                    "payable_lines": payable_lines,
                    "total_remaining": str(total_remaining),
                    "total_paid": str(total_paid),
                    "plan_share_total": str(total_share),
                    "trackers": trackers_data,
                }
            )

        results.sort(key=lambda r: (r["patient_name"] or "").lower())
        return Response({"results": results})


class AdminMicroKitchenAllottedPlanPayoutsView(APIView):
    """
    Admin: diet-plan kitchen payout lines for one micro kitchen, only for patients
    allotted to that kitchen via UserDietPlan (current or original kitchen).
    Query: microkitchen_id = MicroKitchenProfile id.
    """

    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        mk_id = request.query_params.get("microkitchen_id")
        if not mk_id:
            return Response({"results": []})

        search = (request.query_params.get("search") or "").strip().lower()

        patient_ids = (
            UserDietPlan.objects.filter(
                Q(micro_kitchen_id=mk_id) | Q(original_micro_kitchen_id=mk_id),
                status__in=["active", "payment_pending", "approved"],
            )
            .values_list("user_id", flat=True)
            .distinct()
        )
        patients = UserRegister.objects.filter(id__in=patient_ids).order_by(
            "first_name", "last_name", "id"
        )

        results = []
        for p in patients:
            if search:
                blob = " ".join(
                    [
                        (p.first_name or ""),
                        (p.last_name or ""),
                        (p.username or ""),
                        (p.email or ""),
                    ]
                ).lower()
                if search not in blob:
                    continue

            trackers_list = list(
                PayoutTracker.objects.filter(
                    payout_type=PayoutTracker.PAYOUT_TYPE_KITCHEN,
                    micro_kitchen_id=mk_id,
                    snapshot__user_diet_plan__user_id=p.id,
                )
                .select_related(
                    "micro_kitchen",
                    "snapshot__user_diet_plan__diet_plan",
                )
                .order_by("-created_at")
            )

            total_paid = sum((t.paid_amount for t in trackers_list), Decimal("0.00"))
            total_remaining = sum((t.remaining_amount for t in trackers_list), Decimal("0.00"))
            total_share = sum((t.total_amount for t in trackers_list), Decimal("0.00"))
            payable_lines = sum(
                1
                for t in trackers_list
                if not t.is_closed and t.total_amount > t.paid_amount
            )

            trackers_data = []
            for tracker in trackers_list:
                t_data = AdminPayoutTrackerForPayoutSerializer(tracker).data
                udp = tracker.snapshot.user_diet_plan
                t_data["kitchen_reassignments"] = []
                if udp:
                    kreas = MicroKitchenReassignment.objects.filter(
                        user_diet_plan_id=udp.id
                    ).select_related("previous_kitchen", "new_kitchen").order_by("-reassigned_on")
                    t_data["kitchen_reassignments"] = [
                        {
                            "from": kr.previous_kitchen.brand_name if kr.previous_kitchen else "None",
                            "to": kr.new_kitchen.brand_name if kr.new_kitchen else "None",
                            "reason": kr.reason,
                            "date": kr.reassigned_on,
                        }
                        for kr in kreas
                    ]
                trackers_data.append(t_data)

            plan_title = None
            for t in trackers_list:
                if not t.is_closed and t.total_amount > t.paid_amount:
                    dp = getattr(t.snapshot.user_diet_plan, "diet_plan", None)
                    plan_title = dp.title if dp else None
                    break
            if plan_title is None and trackers_list:
                dp = getattr(trackers_list[0].snapshot.user_diet_plan, "diet_plan", None)
                plan_title = dp.title if dp else None

            results.append(
                {
                    "id": p.id,
                    "patient_name": f"{p.first_name or ''} {p.last_name or ''}".strip() or p.username,
                    "email": p.email,
                    "mobile": getattr(p, "mobile", None),
                    "assigned_on": None,
                    "plan_title": plan_title,
                    "payable_lines": payable_lines,
                    "total_remaining": str(total_remaining),
                    "total_paid": str(total_paid),
                    "plan_share_total": str(total_share),
                    "trackers": trackers_data,
                }
            )

        return Response({"results": results})


# ── Role Questionnaires / Profiles ViewSets ────────────────────────────────────

_QUESTIONNAIRE_REL_KEYS = frozenset(
    (
        'health_conditions',
        'symptoms',
        'deficiencies',
        'autoimmune_diseases',
        'digestive_issues',
        'skin_issues',
    )
)


def _questionnaire_prefetch_qs():
    return UserQuestionnaire.objects.select_related('user').prefetch_related(
        'user__health_conditions__condition',
        'user__symptoms__symptom',
        'user__deficiencies__deficiency',
        'user__autoimmune_diseases__disease',
        'user__digestive_issues__issue',
        'user__skin_issues__skin_issue',
    )


class UserQuestionnaireViewSet(viewsets.ModelViewSet):
    queryset = _questionnaire_prefetch_qs().all()
    serializer_class = UserQuestionnaireSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser]

    def get_queryset(self):
        qs = _questionnaire_prefetch_qs().all()
        u = self.request.user
        patient_id = self.request.query_params.get('user')
        if getattr(u, 'role', None) in ('admin', 'doctor'):
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
            instance = _questionnaire_prefetch_qs().filter(pk=instance.pk).first()
            return Response(self.get_serializer(instance).data)

        data = request.data
        nested = {k: data[k] for k in _QUESTIONNAIRE_REL_KEYS if k in data}
        payload = {k: v for k, v in data.items() if k not in _QUESTIONNAIRE_REL_KEYS}

        serializer = self.get_serializer(instance=instance, data=payload, partial=True)
        serializer.is_valid(raise_exception=True)
        vd = dict(serializer.validated_data)
        vd.pop('user', None)
        obj, _ = UserQuestionnaire.objects.update_or_create(
            user=request.user,
            defaults=vd
        )
        sync_user_questionnaire_relations(request.user, nested)
        obj = _questionnaire_prefetch_qs().filter(pk=obj.pk).first()
        return Response(self.get_serializer(obj).data)


class HealthConditionMasterViewSet(viewsets.ModelViewSet):
    queryset = HealthConditionMaster.objects.all().order_by("name")
    serializer_class = HealthConditionMasterSerializer
    permission_classes = [AuthenticatedReadAdminWrite]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "category"]

    @action(detail=False, methods=["get"], url_path="all")
    def get_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class SymptomMasterViewSet(viewsets.ModelViewSet):
    queryset = SymptomMaster.objects.all().order_by("name")
    serializer_class = SymptomMasterSerializer
    permission_classes = [AuthenticatedReadAdminWrite]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    @action(detail=False, methods=["get"], url_path="all")
    def get_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AutoimmuneMasterViewSet(viewsets.ModelViewSet):
    queryset = AutoimmuneMaster.objects.all().order_by("name")
    serializer_class = AutoimmuneMasterSerializer
    permission_classes = [AuthenticatedReadAdminWrite]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    @action(detail=False, methods=["get"], url_path="all")
    def get_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class DeficiencyMasterViewSet(viewsets.ModelViewSet):
    queryset = DeficiencyMaster.objects.all().order_by("name")
    serializer_class = DeficiencyMasterSerializer
    permission_classes = [AuthenticatedReadAdminWrite]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    @action(detail=False, methods=["get"], url_path="all")
    def get_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class DigestiveIssueMasterViewSet(viewsets.ModelViewSet):
    queryset = DigestiveIssueMaster.objects.all().order_by("name")
    serializer_class = DigestiveIssueMasterSerializer
    permission_classes = [AuthenticatedReadAdminWrite]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    @action(detail=False, methods=["get"], url_path="all")
    def get_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class SkinIssueMasterViewSet(viewsets.ModelViewSet):
    queryset = SkinIssueMaster.objects.all().order_by("name")
    serializer_class = SkinIssueMasterSerializer
    permission_classes = [AuthenticatedReadAdminWrite]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]

    @action(detail=False, methods=["get"], url_path="all")
    def get_all(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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

    @action(detail=False, methods=['get'], url_path='list_minimal', pagination_class=None)
    def list_minimal(self, request):
        qs = self.get_queryset().values('id', 'brand_name', 'cuisine_type')
        return Response(list(qs))

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
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food__name', 'micro_kitchen__brand_name']

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
    queryset = DeliveryProfile.objects.select_related("user", "verified_by").all()
    serializer_class = DeliveryProfileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    pagination_class = Pagination

    def _delivery_person_ids_for_kitchen(self, mk):
        """
        Supply-chain users who appear in global / daily delivery for this kitchen.
        """
        dp_ids = set(
            DietPlanDeliveryAssignment.objects.filter(micro_kitchen=mk).values_list(
                "delivery_person_id", flat=True
            )
        )
        dp_ids |= set(
            DietPlanSlotDeliveryPerson.objects.filter(plan_assignment__micro_kitchen=mk).values_list(
                "delivery_person_id", flat=True
            )
        )
        dp_ids |= set(
            DeliveryAssignment.objects.filter(user_meal__micro_kitchen=mk).values_list(
                "delivery_person_id", flat=True
            )
        )
        dp_ids.discard(None)
        return dp_ids

    def get_queryset(self):
        u = self.request.user
        role = getattr(u, "role", None)
        if role == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=u).first()
            if not mk:
                return DeliveryProfile.objects.none()
            dp_ids = self._delivery_person_ids_for_kitchen(mk)
            return DeliveryProfile.objects.filter(user_id__in=dp_ids).select_related("user", "verified_by")
        if role == "supply_chain":
            return DeliveryProfile.objects.filter(user=u).select_related("user", "verified_by")
        if role == "admin":
            return DeliveryProfile.objects.select_related("user", "verified_by").all()
        return DeliveryProfile.objects.none()

    def list(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        return super().list(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

    def update(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)

    @action(detail=False, methods=['get', 'post', 'put', 'patch'], url_path='me')
    def me(self, request):
        if getattr(request.user, "role", None) != "supply_chain":
            return Response(
                {"detail": "Only supply chain users can manage delivery profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
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

    @action(detail=False, methods=['get'], url_path='kitchen-delivery-profiles')
    def kitchen_delivery_profiles(self, request):
        """Paginated delivery profiles for supply-chain staff tied to this micro kitchen."""
        if getattr(request.user, "role", None) != "micro_kitchen":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        mk = MicroKitchenProfile.objects.filter(user=request.user).first()
        if not mk:
            return Response(
                {"count": 0, "next": None, "previous": None, "current_page": 1, "total_pages": 0, "results": []}
            )
        qs = (
            DeliveryProfile.objects.filter(user_id__in=self._delivery_person_ids_for_kitchen(mk))
            .select_related("user", "verified_by")
            .order_by("user__first_name", "user__last_name", "id")
        )
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='verify')
    def verify(self, request, pk=None):
        """Micro kitchen: mark delivery profile as verified."""
        if getattr(request.user, "role", None) != "micro_kitchen":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        profile = self.get_object()
        profile.is_verified = True
        profile.verified_by = request.user
        profile.verified_on = timezone.now()
        profile.save(update_fields=["is_verified", "verified_by", "verified_on"])
        return Response(self.get_serializer(profile).data)


def _build_nutritionist_my_patients_list(nutritionist_user):
    """Same payload as `my-patients` for one nutritionist (used by my_patients and clinical_review_dashboard)."""
    mapped_qs = UserNutritionistMapping.objects.select_related("user").filter(
        nutritionist=nutritionist_user, is_active=True
    )
    was_original_qs = UserDietPlan.objects.filter(
        original_nutritionist=nutritionist_user, status="active"
    ).select_related("user")
    patient_map = {}
    for m in mapped_qs:
        patient_map[m.user.id] = {
            "user": m.user,
            "mapping_id": m.id,
            "assigned_on": m.assigned_on,
        }
    for dp in was_original_qs:
        if dp.user.id not in patient_map:
            patient_map[dp.user.id] = {
                "user": dp.user,
                "mapping_id": None,
                "assigned_on": dp.created_on,
            }
    results = []
    for _pid, data in patient_map.items():
        patient = data["user"]
        reassignment = (
            NutritionistReassignment.objects.filter(
                user=patient, active_diet_plan__status="active"
            )
            .order_by("-reassigned_on")
            .first()
        )
        reassignment_data = None
        if reassignment:
            reassignment_data = {
                "previous_nutritionist": reassignment.previous_nutritionist.username
                if reassignment.previous_nutritionist
                else None,
                "new_nutritionist": reassignment.new_nutritionist.username
                if reassignment.new_nutritionist
                else None,
                "reason": reassignment.reason,
                "notes": reassignment.notes,
                "effective_from": reassignment.effective_from,
            }
        try:
            q = patient.userquestionnaire
        except UserQuestionnaire.DoesNotExist:
            q = None
        active_plan = (
            UserDietPlan.objects.filter(user=patient, status="active")
            .select_related("micro_kitchen", "original_micro_kitchen")
            .first()
        )
        kitchen_data = None
        if active_plan:
            kitchen_data = {
                "current_kitchen": active_plan.micro_kitchen.brand_name
                if active_plan.micro_kitchen
                else None,
                "original_kitchen": active_plan.original_micro_kitchen.brand_name
                if active_plan.original_micro_kitchen
                else None,
                "effective_from": active_plan.micro_kitchen_effective_from,
            }
        results.append(
            {
                "mapping_id": data["mapping_id"],
                "assigned_on": data["assigned_on"],
                "active_kitchen": kitchen_data,
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
                    "latitude": getattr(patient, "latitude", None),
                    "longitude": getattr(patient, "longitude", None),
                },
                "questionnaire": UserQuestionnaireSerializer(q).data if q else None,
                "reassignment_details": reassignment_data,
            }
        )
    return results


def _build_clinical_review_patient_rows(nutritionist_user):
    """
    Lightweight patient list for clinical-review-dashboard only:
    mapping_id, assigned_on, user (id, name, email, mobile). No questionnaire, kitchen, or reassignment.
    """
    mapped_qs = UserNutritionistMapping.objects.select_related("user").filter(
        nutritionist=nutritionist_user, is_active=True
    )
    was_original_qs = UserDietPlan.objects.filter(
        original_nutritionist=nutritionist_user, status="active"
    ).select_related("user")
    patient_map = {}
    for m in mapped_qs:
        patient_map[m.user.id] = {
            "user": m.user,
            "mapping_id": m.id,
            "assigned_on": m.assigned_on,
        }
    for dp in was_original_qs:
        if dp.user.id not in patient_map:
            patient_map[dp.user.id] = {
                "user": dp.user,
                "mapping_id": None,
                "assigned_on": dp.created_on,
            }
    results = []
    for _pid, data in patient_map.items():
        patient = data["user"]
        results.append(
            {
                "mapping_id": data["mapping_id"],
                "assigned_on": data["assigned_on"],
                "user": {
                    "id": patient.id,
                    "first_name": patient.first_name or "",
                    "last_name": patient.last_name or "",
                    "email": patient.email or "",
                    "mobile": patient.mobile or "",
                },
            }
        )
    return results


def _nutritionist_accessible_health_reports_queryset(nutritionist_user, patient_id):
    """Match PatientHealthReportViewSet access rules for nutritionists, scoped to one patient."""
    active_patient_ids = UserNutritionistMapping.objects.filter(
        nutritionist=nutritionist_user, is_active=True
    ).values_list("user_id", flat=True)
    reassigned_plans = UserDietPlan.objects.filter(
        original_nutritionist=nutritionist_user, status="active"
    ).select_related("user")
    condition = Q(user_id__in=active_patient_ids)
    for plan in reassigned_plans:
        if plan.nutritionist_effective_from:
            condition |= Q(
                user_id=plan.user_id,
                uploaded_on__lt=plan.nutritionist_effective_from,
            )
        else:
            condition |= Q(user_id=plan.user_id)
    return (
        PatientHealthReport.objects.filter(condition)
        .filter(user_id=patient_id)
        .select_related("user")
        .prefetch_related(
            Prefetch(
                "reviews",
                queryset=NutritionistReview.objects.select_related(
                    "nutritionist"
                ).order_by("-created_on"),
            )
        )
        .order_by("-uploaded_on")
    )


def _nutritionist_accessible_reviews_queryset(nutritionist_user, patient_id):
    """Match NutritionistReviewViewSet access rules for nutritionists, scoped to one patient."""
    mapped_patient_ids = UserNutritionistMapping.objects.filter(
        nutritionist=nutritionist_user, is_active=True
    ).values_list("user_id", flat=True)
    return (
        NutritionistReview.objects.filter(
            Q(nutritionist=nutritionist_user) | Q(user_id__in=mapped_patient_ids)
        )
        .filter(user_id=patient_id)
        .select_related("nutritionist")
        .prefetch_related("reports")
        .order_by("-created_on")
    )


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
        return Response(_build_nutritionist_my_patients_list(request.user))

    @action(detail=False, methods=["get"], url_path="clinical-review-dashboard")
    def clinical_review_dashboard(self, request):
        """
        Single endpoint: paginated patient list (search on name/email/username),
        plus health reports and nutritionist reviews for the selected patient.
        Query: page, page_size (default 5), search, patient_id (optional).
        """
        user = request.user
        if getattr(user, "role", None) != "nutritionist":
            return Response(
                {"detail": "Nutritionists only."},
                status=status.HTTP_403_FORBIDDEN,
            )

        from django.core.paginator import Paginator

        results = _build_clinical_review_patient_rows(user)
        search = (request.query_params.get("search") or "").strip()
        if search:
            ids = [r["user"]["id"] for r in results]
            if not ids:
                results = []
            else:
                matched_ids = UserRegister.objects.filter(id__in=ids).filter(
                    Q(first_name__icontains=search)
                    | Q(last_name__icontains=search)
                    | Q(email__icontains=search)
                    | Q(username__icontains=search)
                ).values_list("id", flat=True)
                matched_set = set(matched_ids)
                results = [r for r in results if r["user"]["id"] in matched_set]

        results.sort(key=lambda x: x["assigned_on"], reverse=True)

        try:
            page_size = int(request.query_params.get("page_size", 5))
        except ValueError:
            page_size = 5
        page_size = max(1, min(page_size, 50))
        try:
            page = int(request.query_params.get("page", 1))
        except ValueError:
            page = 1

        allowed_ids = {r["user"]["id"] for r in results}
        paginator = Paginator(results, page_size)
        page_obj = paginator.get_page(page)
        page_results = list(page_obj.object_list)

        selected_user_id = None
        patient_id_param = request.query_params.get("patient_id")
        if patient_id_param is not None and patient_id_param != "":
            try:
                pid = int(patient_id_param)
            except ValueError:
                pid = None
            if pid is not None and pid in allowed_ids:
                selected_user_id = pid
        if selected_user_id is None and page_results:
            selected_user_id = page_results[0]["user"]["id"]

        reports_data = []
        reviews_data = []
        reports_total = 0
        reviews_total = 0
        if selected_user_id is not None:
            rq = _nutritionist_accessible_health_reports_queryset(user, selected_user_id)
            reports_data = ClinicalReviewHealthReportSerializer(rq, many=True).data
            reports_total = len(reports_data)
            vq = _nutritionist_accessible_reviews_queryset(user, selected_user_id)
            reviews_data = ClinicalReviewNutritionistReviewSerializer(vq, many=True).data
            reviews_total = len(reviews_data)

        next_page = page_obj.next_page_number() if page_obj.has_next() else None
        prev_page = page_obj.previous_page_number() if page_obj.has_previous() else None

        return Response(
            {
                "count": paginator.count,
                "page": page_obj.number,
                "page_size": page_size,
                "next": next_page,
                "previous": prev_page,
                "total_pages": paginator.num_pages,
                "results": page_results,
                "selected_user_id": selected_user_id,
                "reports": reports_data,
                "reviews": reviews_data,
                "reports_total": reports_total,
                "reviews_total": reviews_total,
            }
        )

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

    @action(detail=False, methods=["get"], url_path="grouped-mappings")
    def grouped_mappings(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Admin only."}, status=403)

        mappings = UserNutritionistMapping.objects.filter(is_active=True).select_related(
            "user", "nutritionist"
        )
        by_nut = {}
        for m in mappings:
            nid = m.nutritionist_id
            if nid not in by_nut:
                by_nut[nid] = {
                    "nutritionist": {
                        "id": m.nutritionist.id,
                        "username": m.nutritionist.username,
                        "first_name": m.nutritionist.first_name,
                        "last_name": m.nutritionist.last_name,
                        "email": m.nutritionist.email,
                    },
                    "patients": [],
                }
            by_nut[nid]["patients"].append(
                {
                    "id": m.user.id,
                    "username": m.user.username,
                    "first_name": m.user.first_name,
                    "last_name": m.user.last_name,
                    "email": m.user.email,
                    "mobile": m.user.mobile,
                }
            )

        results = sorted(
            by_nut.values(),
            key=lambda x: (
                x["nutritionist"]["first_name"] or "",
                x["nutritionist"]["last_name"] or "",
                x["nutritionist"]["username"],
            ),
        )
        return Response(results)

    @action(detail=False, methods=["get"], url_path="unmapped-patients")
    def unmapped_patients(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Admin only."}, status=403)

        unmapped = UserRegister.objects.filter(
            role="patient", is_patient_mapped=False
        ).order_by("username")
        results = []
        for p in unmapped:
            results.append(
                {
                    "id": p.id,
                    "username": p.username,
                    "first_name": p.first_name,
                    "last_name": p.last_name,
                    "email": p.email,
                    "mobile": p.mobile,
                }
            )
        return Response(results)

    @action(detail=False, methods=["get"], url_path="all-nutritionists")
    def all_nutritionists(self, request):
        if request.user.role != "admin":
            return Response({"detail": "Admin only."}, status=403)

        nuts = UserRegister.objects.filter(role="nutritionist").order_by("username")
        results = []
        for n in nuts:
            results.append(
                {
                    "id": n.id,
                    "username": n.username,
                    "first_name": n.first_name,
                    "last_name": n.last_name,
                    "email": n.email,
                }
            )
        return Response(results)


class AdminAllNutritionistsViewSet(viewsets.ViewSet):
    """
    Admin-only endpoint for listing nutritionists.
    Kept separate from UserNutritionistMappingViewSet to provide a stable URL binding.
    """

    permission_classes = [IsAuthenticated, IsAdminOrDoctorRole]

    def list(self, request):
        qs = UserRegister.objects.filter(role="nutritionist").order_by("username")
        return Response(AdminNutritionistListSerializer(qs, many=True).data)

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

            new_mapping = UserNutritionistMapping(
                user=patient,
                nutritionist=new_nutritionist,
                is_active=True,
            )
            new_mapping.save()

            NutritionistReassignment.objects.create(
                user=patient,
                previous_nutritionist=previous_nutritionist,
                new_nutritionist=new_nutritionist,
                new_mapping=new_mapping,
                reason=reason,
                notes=notes,
                reassigned_by=request.user,
                active_diet_plan=active_plan,
                effective_from=effective_from,
            )

        from .plan_payment import refresh_ledger_payouts_if_exists

        refresh_ledger_payouts_if_exists(active_plan)

        out = UserNutritionistMappingSerializer(
            UserNutritionistMapping.objects.select_related("user", "nutritionist").get(
                pk=new_mapping.pk
            )
        )
        return Response(out.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="history")
    def history(self, request):
        patient_id = request.query_params.get('user')
        if not patient_id:
            return Response({"detail": "User ID is required."}, status=400)
        
        history = NutritionistReassignment.objects.filter(user_id=patient_id).select_related(
            "previous_nutritionist", "new_nutritionist", "reassigned_by", "active_diet_plan"
        ).order_by("-reassigned_on")
        
        serializer = NutritionistReassignmentSerializer(history, many=True)
        return Response(serializer.data)


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
        if country:
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


class FoodByIdViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def retrieve(self, request, pk=None):
        nutrition = FoodNutrition.objects.select_related("food").filter(food_id=pk).first()
        if not nutrition:
            return Response({"detail": "Food nutrition not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(FoodByIdNutritionSerializer(nutrition).data)


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

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_group_id=food_group)
        return queryset

    @action(detail=False, methods=['get'], url_path='all')
    def get_all_foodnames(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(
        detail=True,
        methods=["get"],
        url_path="nutrition-detail",
        permission_classes=[IsAuthenticated],
    )
    def nutrition_detail(self, request, pk=None):
        """
        GET /api/foodname/<pk>/nutrition-detail/
        Full composition (proximate, vitamins, minerals, fatty acids, etc.).
        Patients may only view foods they have been recommended.
        """
        instance = get_object_or_404(
            FoodName.objects.select_related(
                "food_group",
                "proximate",
                "water_soluble_vitamins",
                "fat_soluble_vitamins",
                "carotenoids",
                "minerals",
                "sugars",
                "amino_acids",
                "organic_acids",
                "polyphenols",
                "phytochemicals",
                "fatty_acid_profile",
            ),
            pk=pk,
        )
        role = getattr(request.user, "role", None)
        if role == "patient":
            if not PatientFoodRecommendation.objects.filter(
                patient=request.user, food_id=instance.pk
            ).exists():
                raise PermissionDenied(
                    "You can only view nutrition details for foods suggested to you."
                )
        elif role not in ("admin", "nutritionist", "doctor", "master"):
            raise PermissionDenied()
        serializer = FoodNameNutritionDetailSerializer(instance)
        return Response(serializer.data)


class FoodProximateViewSet(viewsets.ModelViewSet):
    queryset = FoodProximate.objects.select_related('food_name').all()
    serializer_class = FoodProximateSerializer
    permission_classes = [AllowAny]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['food_name__name', 'food_name__code']

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_name__food_group_id=food_group)
        return queryset

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

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_name__food_group_id=food_group)
        return queryset

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

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_name__food_group_id=food_group)
        return queryset

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

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_name__food_group_id=food_group)
        return queryset

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

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_name__food_group_id=food_group)
        return queryset

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

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_name__food_group_id=food_group)
        return queryset

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

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_name__food_group_id=food_group)
        return queryset

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

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_name__food_group_id=food_group)
        return queryset

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

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_name__food_group_id=food_group)
        return queryset

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

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_name__food_group_id=food_group)
        return queryset

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

    def get_queryset(self):
        queryset = super().get_queryset()
        food_group = self.request.query_params.get('food_group')
        if food_group:
            queryset = queryset.filter(food_name__food_group_id=food_group)
        return queryset

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

    @action(detail=False, methods=['get'], url_path='list_minimal', pagination_class=None)
    def list_minimal(self, request):
        # final_amount is a property, so we can't use .values() on it.
        qs = self.get_queryset()
        data = [
            {
                "id": p.id,
                "title": p.title,
                "code": p.code,
                "final_amount": p.final_amount,
                "no_of_days": p.no_of_days
            }
            for p in qs
        ]
        return Response(data)

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
                "recipe": ["food_name", "ingredient_name1", "quantity1", "unit_name1", "notes1", "ingredient_name2", "quantity2", "unit_name2", "notes2", "ingredient_name3", "quantity3", "unit_name3", "notes3", "step1", "step2", "step3", "step4", "step5"],
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

            "questionnaire": {
                "health-condition": ["name", "category"],
                "symptom": ["name"],
                "autoimmune": ["name"],
                "deficiency": ["name"],
                "digestive-issue": ["name"],
                "skin-issue": ["name"],
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
                ["Masala Dosa", "Rice", "200", "Gram", "Soaked", "Urad Dal", "100", "Gram", "Soaked", "Potato", "100", "Gram", "Boiled", "Soak rice and urad dal", "Grind to paste", "Ferment for 8 hours", "Cook on tawa", "Add potato masala"],
                ["Pizza Margherita", "Flour", "200", "Gram", "Sieved", "Tomato", "50", "Gram", "Pureed", "Mozzarella", "50", "Gram", "Grated", "Prepare dough", "Add sauce and cheese", "Bake at 250C", "Add basil", ""],
                ["Sushi", "Sushi Rice", "100", "Gram", "Cooked", "Fish", "50", "Gram", "Sliced", "Seaweed", "1", "Piece", "Sheet", "Cook rice", "Slice fish", "Roll sushi", "Slice into pieces", ""],
                ["Tacos", "Tortilla", "2", "Piece", "Warm", "Corn", "50", "Gram", "Roasted", "Beans", "30", "Gram", "Cooked", "Warm tortillas", "Add corn and beans", "Add salsa", "Serve with lime", ""],
                ["Croissant", "Flour", "150", "Gram", "Dough", "Butter", "70", "Gram", "Chilled", "Sugar", "10", "Gram", "Fine", "Prepare dough", "Layer with butter", "Fold and chill", "Shape croissants", "Bake until golden"],
                ["Pad Thai", "Noodles", "100", "Gram", "Boiled", "Tofu", "50", "Gram", "Cubed", "Peanuts", "10", "Gram", "Crushed", "Boil noodles", "Fry tofu", "Mix sauce", "Stir-fry everything", "Serve hot"],
                ["Cheeseburger", "Beef Patty", "1", "Piece", "Grilled", "Cheese", "1", "Slice", "Melted", "Bun", "1", "Piece", "Toasted", "Grill patty", "Melt cheese on top", "Toast bun", "Assemble burger", "Serve with fries"],
                ["Green Salad", "Lettuce", "50", "Gram", "Fresh", "Tomato", "30", "Gram", "Diced", "Cucumber", "30", "Gram", "Sliced", "Wash greens", "Chop veggies", "Toss with dressing", "", ""],
                ["Spring Rolls", "Wrappers", "2", "Piece", "Rice paper", "Cabbage", "50", "Gram", "Shredded", "Carrot", "20", "Gram", "Julienned", "Prepare filling", "Wrap tightly", "Deep fry", "Drain oil", "Serve with sauce"],
                ["Ramen", "Noodles", "100", "Gram", "Boiled", "Broth", "200", "Milliliter", "Hot", "Egg", "1", "Piece", "Soft boiled", "Prepare broth", "Boil noodles", "Add toppings", "Serve hot", ""]
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
            ],
            "health-condition": [
                ["Pre-Diabetic", "metabolic"], ["Diabetes Type I", "metabolic"], ["Diabetes Type II", "metabolic"], ["Juvenile Diabetes", "metabolic"],
                ["Hypertension", "chronic"], ["Cardiac Issues", "chronic"], ["CKD", "chronic"], ["Anemia", "other"],
                ["Thyroid", "metabolic"], ["Migraine", "chronic"], ["PCOD & PCOS", "metabolic"], ["Triglycerides", "metabolic"],
                ["Cholesterol", "metabolic"], ["Cancer", "chronic"], ["Gout", "metabolic"], ["Osteoporosis", "chronic"],
                ["Obesity", "metabolic"], ["Urine Infection", "infectious"], ["Glucoma", "chronic"], ["Malaria", "infectious"],
                ["Dengue", "infectious"], ["Chicken Pox", "infectious"], ["Herpes", "infectious"], ["Gall Stone", "digestive"],
                ["Fatty Liver", "digestive"], ["Liver Cirrhosis", "digestive"], ["Kidney Stone", "other"], ["IBS", "digestive"], ["Gastritis", "digestive"]
            ],
            "symptom": [
                ["Fatigue"], ["Sudden weight loss"], ["Sudden weight Gain"], ["Muscle pain"], ["Joint pain"],
                ["Hair loss"], ["Bloating"], ["Diarrhoea"], ["Constipation"], ["Numbness/tingling"],
                ["Difficulty Concentrating"], ["Palpitations"], ["Blurry vision"], ["Mouth ulcers"]
            ],
            "autoimmune": [
                ["Rheumatoid Arthritis"], ["Celiac disease"], ["Pernicious Anemia"], ["Vitiligo"], ["Addison’s disease"],
                ["Ulcerative Colitis"], ["Crohn’s disease"], ["Guillain- Barre Syndrome"], ["Kawasaki disease"], ["Psoriasis"],
                ["Alopecia Areata"], ["Fibromyalgia"]
            ],
            "deficiency": [
                ["Vitamin A"], ["Vitamin B1"], ["Vitamin B9"], ["Vitamin B12"], ["Vitamin C"],
                ["Vitamin D3"], ["Vitamin K"], ["Calcium"], ["Magnesium"], ["Zinc"],
                ["Iron"], ["Potassium"], ["Sodium"]
            ],
            "digestive-issue": [
                ["Acid Reflux / GERD"], ["IBS (Irritable Bowel Syndrome)"], ["Bloating / Gas"], ["Chronic Constipation"], ["Chronic Diarrhea"],
                ["Gastritis"], ["Peptic Ulcer"], ["Crohn's Disease"], ["Celiac Disease"], ["Food Intolerance"],
                ["Gallstones"], ["Ulcerative Colitis"], ["Hemorrhoids"], ["Diverticulitis"], ["Lactose Intolerance"],
                ["Hiatal Hernia"], ["Fatty Liver"], ["Pancreatitis"], ["Stomach Flu / Gastroenteritis"], ["Indigestion / Dyspepsia"],
                ["Heartburn"], ["Nausea"], ["Abdominal Pain"], ["Loss of Appetite"], ["Small Intestinal Bacterial Overgrowth (SIBO)"]
            ],
            "skin-issue": [
                ["Allergy"], ["Acne prone"], ["Eczema"], ["Dandruff"], ["Dryness"], ["Itchiness"]
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

        if user.role == "doctor":
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
    queryset = NutritionistReview.objects.all().select_related('nutritionist', 'doctor', 'user')
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

        if user.role == "doctor":
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
        user = self.request.user
        if getattr(user, 'role', None) == 'doctor':
            serializer.save(doctor=user, nutritionist=None)
        else:
            serializer.save(nutritionist=user)


class UserDietPlanViewSet(viewsets.ModelViewSet):
    queryset = UserDietPlan.objects.all().select_related(
        'user', 'nutritionist', 'diet_plan', 'review', 'micro_kitchen', 'micro_kitchen__user',
        'original_micro_kitchen', 'original_micro_kitchen__user', 'verified_by',
    ).prefetch_related('diet_plan__features')
    serializer_class = UserDietPlanSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        "user__first_name", "user__last_name", "user__email", "user__mobile",
        "diet_plan__title", "diet_plan__code",
        "micro_kitchen__brand_name", "micro_kitchen__kitchen_code",
        "status", "payment_status"
    ]
    ordering_fields = ["suggested_on", "created_on", "status", "payment_status"]

    @action(detail=False, methods=['get'], url_path='all-user-plans', pagination_class=None)
    def all_user_plans(self, request):
        """Fetches all diet plans for the logged-in user without pagination."""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="kitchen-history")
    def kitchen_history(self, request):
        patient_id = request.query_params.get('user')
        if not patient_id:
            return Response({"detail": "User ID is required."}, status=400)
        
        history = MicroKitchenReassignment.objects.filter(user_diet_plan__user_id=patient_id).select_related(
            "user_diet_plan", "previous_kitchen", "new_kitchen", "reassigned_by"
        ).order_by("-reassigned_on")
        
        serializer = MicroKitchenReassignmentSerializer(history, many=True)
        return Response(serializer.data)

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

        if user.role == "doctor":
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
        # screenshot is now optional, but transaction_id and amount_paid should be provided if screenshot is missing.
        transaction_id = request.data.get('transaction_id')
        amount_paid = request.data.get('amount_paid')
        
        if not screenshot and not transaction_id:
            return Response({"detail": "Either a payment screenshot or a transaction ID is required."}, status=status.HTTP_400_BAD_REQUEST)
        
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

        # Step 1 — optional global delivery assignment (requires both person + slot)
        dp_raw = request.data.get('delivery_person_id')
        slot_raw = request.data.get('default_slot_id')
        delivery_person = None
        default_slot = None
        if dp_raw is not None and str(dp_raw).strip() != '':
            try:
                delivery_person = UserRegister.objects.get(pk=int(dp_raw))
            except (UserRegister.DoesNotExist, ValueError, TypeError):
                return Response({"detail": "Invalid delivery_person_id."}, status=status.HTTP_400_BAD_REQUEST)
        if slot_raw is not None and str(slot_raw).strip() != '':
            try:
                default_slot = DeliverySlot.objects.get(pk=int(slot_raw))
            except (DeliverySlot.DoesNotExist, ValueError, TypeError):
                return Response({"detail": "Invalid default_slot_id."}, status=status.HTTP_400_BAD_REQUEST)
        if (delivery_person is not None) ^ (default_slot is not None):
            return Response(
                {
                    "detail": "Provide both delivery_person_id and default_slot_id to create the plan delivery assignment, or omit both.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        udp.verify_payment(
            admin_user=request.user,
            start_date=start_date,
            delivery_person=delivery_person,
            default_slot=default_slot,
        )
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
        from .plan_payment import refresh_ledger_payouts_if_exists

        refresh_ledger_payouts_if_exists(plan)
        return Response(self.get_serializer(plan).data, status=status.HTTP_200_OK)


def _set_daily_meals_allowed_patient_ids(nutritionist_user):
    mapped = set(
        UserNutritionistMapping.objects.filter(
            nutritionist=nutritionist_user, is_active=True
        ).values_list("user_id", flat=True)
    )
    original = set(
        UserDietPlan.objects.filter(
            original_nutritionist=nutritionist_user, status="active"
        ).values_list("user_id", flat=True)
    )
    return mapped | original


class SetDailyMealsViewSet(viewsets.ViewSet):
    """
    Nutritionist-only endpoints for Set Daily Meals page:
    paginated patients, meal/cuisine filter options, patient detail (questionnaire + kitchen + today meals),
    plan meals by day window, calendar month meals, paginated foods.
    """

    permission_classes = [IsAuthenticated]

    def _nutritionist_only(self, request):
        if getattr(request.user, "role", None) != "nutritionist":
            return Response(
                {"detail": "Nutritionists only."}, status=status.HTTP_403_FORBIDDEN
            )
        return None

    @action(detail=False, methods=["get"], url_path="patients")
    def patients(self, request):
        err = self._nutritionist_only(request)
        if err:
            return err
        from django.core.paginator import Paginator

        user = request.user
        results = _build_nutritionist_my_patients_list(user)
        search = (request.query_params.get("search") or "").strip()
        if search:
            ids = [r["user"]["id"] for r in results]
            if not ids:
                results = []
            else:
                matched_ids = UserRegister.objects.filter(id__in=ids).filter(
                    Q(first_name__icontains=search)
                    | Q(last_name__icontains=search)
                    | Q(email__icontains=search)
                    | Q(username__icontains=search)
                ).values_list("id", flat=True)
                matched_set = set(matched_ids)
                results = [r for r in results if r["user"]["id"] in matched_set]

        results.sort(key=lambda x: x["assigned_on"], reverse=True)

        try:
            page_size = int(request.query_params.get("page_size", 5))
        except ValueError:
            page_size = 5
        page_size = max(1, min(page_size, 50))
        try:
            page = int(request.query_params.get("page", 1))
        except ValueError:
            page = 1

        paginator = Paginator(results, page_size)
        page_obj = paginator.get_page(page)
        page_results = list(page_obj.object_list)

        allowed_ids = {r["user"]["id"] for r in results}
        selected_user_id = None
        patient_id_param = request.query_params.get("patient_id")
        if patient_id_param is not None and patient_id_param != "":
            try:
                pid = int(patient_id_param)
            except ValueError:
                pid = None
            if pid is not None and pid in allowed_ids:
                selected_user_id = pid
        if selected_user_id is None and page_results:
            selected_user_id = page_results[0]["user"]["id"]

        next_page = page_obj.next_page_number() if page_obj.has_next() else None
        prev_page = page_obj.previous_page_number() if page_obj.has_previous() else None

        return Response(
            {
                "count": paginator.count,
                "page": page_obj.number,
                "page_size": page_size,
                "next": next_page,
                "previous": prev_page,
                "total_pages": paginator.num_pages,
                "results": page_results,
                "selected_user_id": selected_user_id,
            }
        )

    @action(detail=False, methods=["get"], url_path="filter-options")
    def filter_options(self, request):
        err = self._nutritionist_only(request)
        if err:
            return err
        try:
            limit = int(request.query_params.get("limit", 5))
        except ValueError:
            limit = 5
        limit = max(1, min(limit, 50))
        try:
            mt_page = int(request.query_params.get("meal_types_page", 1))
        except ValueError:
            mt_page = 1
        try:
            cu_page = int(request.query_params.get("cuisines_page", 1))
        except ValueError:
            cu_page = 1

        cuisine_id = request.query_params.get("cuisine_id")
        meal_type_id = request.query_params.get("meal_type_id")

        mt_qs = MealType.objects.all().order_by("name")
        if cuisine_id:
            mt_qs = mt_qs.filter(food__cuisine_types__id=cuisine_id).distinct()

        cu_qs = CuisineType.objects.all().order_by("name")
        if meal_type_id:
            cu_qs = cu_qs.filter(food__meal_types__id=meal_type_id).distinct()

        mt_count = mt_qs.count()
        cu_count = cu_qs.count()
        mt_start = (mt_page - 1) * limit
        cu_start = (cu_page - 1) * limit
        mt_results = list(mt_qs[mt_start : mt_start + limit].values("id", "name"))
        cu_results = list(cu_qs[cu_start : cu_start + limit].values("id", "name"))

        def _page_meta(total, page, page_size):
            total_pages = max(1, (total + page_size - 1) // page_size) if total else 1
            return {
                "count": total,
                "page": page,
                "limit": page_size,
                "total_pages": total_pages,
                "next": page + 1 if page * page_size < total else None,
                "previous": page - 1 if page > 1 else None,
                "results": mt_results if total == mt_count else None,
            }

        return Response(
            {
                "meal_types": {
                    "count": mt_count,
                    "page": mt_page,
                    "limit": limit,
                    "total_pages": max(1, (mt_count + limit - 1) // limit) if mt_count else 1,
                    "next": mt_page + 1 if mt_page * limit < mt_count else None,
                    "previous": mt_page - 1 if mt_page > 1 else None,
                    "results": mt_results,
                },
                "cuisine_types": {
                    "count": cu_count,
                    "page": cu_page,
                    "limit": limit,
                    "total_pages": max(1, (cu_count + limit - 1) // limit) if cu_count else 1,
                    "next": cu_page + 1 if cu_page * limit < cu_count else None,
                    "previous": cu_page - 1 if cu_page > 1 else None,
                    "results": cu_results,
                },
            }
        )

    @action(detail=False, methods=["get"], url_path="patient-detail")
    def patient_detail(self, request):
        err = self._nutritionist_only(request)
        if err:
            return err

        user_id = request.query_params.get("user_id")
        if not user_id:
            return Response(
                {"detail": "user_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            uid = int(user_id)
        except ValueError:
            return Response(
                {"detail": "Invalid user_id."}, status=status.HTTP_400_BAD_REQUEST
            )

        if uid not in _set_daily_meals_allowed_patient_ids(request.user):
            return Response(
                {"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN
            )

        patient = UserRegister.objects.filter(id=uid).first()
        if not patient:
            return Response(
                {"detail": "Patient not found."}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            q = patient.userquestionnaire
        except UserQuestionnaire.DoesNotExist:
            q = None

        plan = (
            UserDietPlan.objects.filter(user=patient, status="active")
            .select_related(
                "micro_kitchen",
                "original_micro_kitchen",
                "diet_plan",
            )
            .first()
        )

        kitchen_block = None
        if plan:
            kitchen_block = {
                "plan_id": plan.id,
                "start_date": plan.start_date,
                "end_date": plan.end_date,
                "micro_kitchen_effective_from": plan.micro_kitchen_effective_from,
                "nutritionist_effective_from": plan.nutritionist_effective_from,
                "current_micro_kitchen": {
                    "id": plan.micro_kitchen_id,
                    "brand_name": plan.micro_kitchen.brand_name if plan.micro_kitchen else None,
                }
                if plan.micro_kitchen
                else None,
                "original_micro_kitchen": {
                    "id": plan.original_micro_kitchen_id,
                    "brand_name": plan.original_micro_kitchen.brand_name
                    if plan.original_micro_kitchen
                    else None,
                }
                if plan.original_micro_kitchen
                else None,
            }

        reassignment = (
            NutritionistReassignment.objects.filter(
                user=patient, active_diet_plan__status="active"
            )
            .order_by("-reassigned_on")
            .first()
        )
        reassignment_data = None
        if reassignment:
            reassignment_data = {
                "previous_nutritionist": reassignment.previous_nutritionist.username
                if reassignment.previous_nutritionist
                else None,
                "new_nutritionist": reassignment.new_nutritionist.username
                if reassignment.new_nutritionist
                else None,
                "reason": reassignment.reason,
                "notes": reassignment.notes,
                "effective_from": reassignment.effective_from,
            }

        today = timezone.now().date()
        today_meals_qs = (
            UserMeal.objects.filter(user_id=uid, meal_date=today)
            .select_related(
                "meal_type",
                "food",
                "packaging_material",
                "micro_kitchen",
                "user_diet_plan",
            )
            .prefetch_related(
                Prefetch(
                    "deliveries",
                    queryset=DeliveryAssignment.objects.filter(is_active=True).select_related(
                        "delivery_person", "delivery_slot"
                    ),
                )
            )
            .order_by("meal_type__id")
        )
        today_meals = UserMealSerializer(today_meals_qs, many=True).data

        return Response(
            {
                "user": {
                    "id": patient.id,
                    "first_name": patient.first_name or "",
                    "last_name": patient.last_name or "",
                    "email": patient.email or "",
                    "mobile": patient.mobile or "",
                },
                "questionnaire": UserQuestionnaireSerializer(q).data if q else None,
                "kitchen": kitchen_block,
                "reassignment_details": reassignment_data,
                "today_food": today_meals,
            }
        )

    @action(detail=False, methods=["get"], url_path="plan-meals")
    def plan_meals(self, request):
        err = self._nutritionist_only(request)
        if err:
            return err
        user_id = request.query_params.get("user_id")
        plan_id = request.query_params.get("plan_id")
        if not user_id or not plan_id:
            return Response(
                {"detail": "user_id and plan_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            uid = int(user_id)
            pid = int(plan_id)
        except ValueError:
            return Response(
                {"detail": "Invalid ids."}, status=status.HTTP_400_BAD_REQUEST
            )

        if uid not in _set_daily_meals_allowed_patient_ids(request.user):
            return Response(
                {"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN
            )

        plan = UserDietPlan.objects.filter(id=pid, user_id=uid).first()
        if not plan:
            return Response(
                {"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND
            )

        try:
            offset_days = int(request.query_params.get("offset_days", 0))
        except ValueError:
            offset_days = 0
        try:
            days = int(request.query_params.get("days", 10))
        except ValueError:
            days = 10
        days = max(1, min(days, 60))

        if not plan.start_date or not plan.end_date:
            return Response(
                {
                    "plan_id": plan.id,
                    "range_start": None,
                    "range_end": None,
                    "offset_days": offset_days,
                    "days": days,
                    "next_offset_days": None,
                    "has_more": False,
                    "meals": [],
                }
            )

        window_start = plan.start_date + timedelta(days=offset_days)
        window_end = window_start + timedelta(days=days - 1)
        if window_start > plan.end_date:
            return Response(
                {
                    "plan_id": plan.id,
                    "range_start": None,
                    "range_end": None,
                    "offset_days": offset_days,
                    "days": days,
                    "next_offset_days": None,
                    "has_more": False,
                    "meals": [],
                }
            )

        if window_end > plan.end_date:
            window_end = plan.end_date

        meals_qs = (
            UserMeal.objects.filter(
                user_id=uid,
                user_diet_plan_id=pid,
                meal_date__range=[window_start, window_end],
            )
            .select_related(
                "meal_type",
                "food",
                "packaging_material",
                "micro_kitchen",
                "user_diet_plan",
            )
            .prefetch_related(
                Prefetch(
                    "deliveries",
                    queryset=DeliveryAssignment.objects.filter(is_active=True).select_related(
                        "delivery_person", "delivery_slot"
                    ),
                )
            )
            .order_by("meal_date", "meal_type__id")
        )
        meals_data = UserMealSerializer(meals_qs, many=True).data

        next_offset = offset_days + days
        has_more = plan.end_date > window_end

        return Response(
            {
                "plan_id": plan.id,
                "range_start": window_start,
                "range_end": window_end,
                "offset_days": offset_days,
                "days": days,
                "next_offset_days": next_offset if has_more else None,
                "has_more": has_more,
                "meals": meals_data,
            }
        )

    @action(detail=False, methods=["get"], url_path="calendar-month")
    def calendar_month(self, request):
        err = self._nutritionist_only(request)
        if err:
            return err
        user_id = request.query_params.get("user_id")
        plan_id = request.query_params.get("plan_id")
        month = request.query_params.get("month")
        year = request.query_params.get("year")
        if not all([user_id, plan_id, month, year]):
            return Response(
                {"detail": "user_id, plan_id, month, year are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            uid = int(user_id)
            pid = int(plan_id)
            m = int(month)
            y = int(year)
        except ValueError:
            return Response(
                {"detail": "Invalid parameters."}, status=status.HTTP_400_BAD_REQUEST
            )

        if uid not in _set_daily_meals_allowed_patient_ids(request.user):
            return Response(
                {"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN
            )

        if not UserDietPlan.objects.filter(id=pid, user_id=uid).exists():
            return Response(
                {"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND
            )

        meals_qs = (
            UserMeal.objects.filter(
                user_id=uid,
                user_diet_plan_id=pid,
                meal_date__month=m,
                meal_date__year=y,
            )
            .select_related(
                "meal_type",
                "food",
                "packaging_material",
                "micro_kitchen",
                "user_diet_plan",
            )
            .prefetch_related(
                Prefetch(
                    "deliveries",
                    queryset=DeliveryAssignment.objects.filter(is_active=True).select_related(
                        "delivery_person", "delivery_slot"
                    ),
                )
            )
            .order_by("meal_date", "meal_type__id")
        )
        return Response(
            {
                "month": m,
                "year": y,
                "meals": UserMealSerializer(meals_qs, many=True).data,
            }
        )

    @action(detail=False, methods=["get"], url_path="foods")
    def foods(self, request):
        err = self._nutritionist_only(request)
        if err:
            return err
        try:
            page = int(request.query_params.get("page", 1))
        except ValueError:
            page = 1
        try:
            limit = int(request.query_params.get("limit", 20))
        except ValueError:
            limit = 20
        limit = max(1, min(limit, 100))
        search = (request.query_params.get("search") or "").strip()
        meal_type = request.query_params.get("meal_type")
        cuisine_type = request.query_params.get("cuisine_type")

        qs = Food.objects.all().order_by("name")
        if meal_type:
            qs = qs.filter(meal_types=meal_type)
        if cuisine_type:
            qs = qs.filter(cuisine_types=cuisine_type)
        if search:
            qs = qs.filter(name__icontains=search)
        qs = qs.distinct()

        from django.core.paginator import Paginator

        paginator = Paginator(qs, limit)
        page_obj = paginator.get_page(page)
        page_results = SetDailyMealsFoodListSerializer(page_obj.object_list, many=True).data

        return Response(
            {
                "count": paginator.count,
                "page": page_obj.number,
                "limit": limit,
                "total_pages": paginator.num_pages,
                "next": page_obj.next_page_number() if page_obj.has_next() else None,
                "previous": page_obj.previous_page_number() if page_obj.has_previous() else None,
                "results": page_results,
            }
        )


class UserMealViewSet(viewsets.ModelViewSet):
    queryset = UserMeal.objects.all().select_related(
        'user', 'user_diet_plan', 'meal_type', 'food', 'packaging_material', 'micro_kitchen'
    ).prefetch_related(
        Prefetch(
            'deliveries',
            queryset=DeliveryAssignment.objects.filter(is_active=True).select_related(
                'delivery_person', 'delivery_slot'
            ),
        )
    )
    serializer_class = UserMealSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = Pagination

    @property
    def paginator(self):
        """Match DRF GenericAPIView.paginator; disable pagination when month+year query params (calendar-style list)."""
        if not hasattr(self, '_paginator'):
            pcl = getattr(self, 'pagination_class', None)
            if pcl is None:
                self._paginator = None
            else:
                req = getattr(self, 'request', None)
                if req and req.query_params.get('month') and req.query_params.get('year'):
                    self._paginator = None
                else:
                    self._paginator = pcl()
        return self._paginator

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

        month = self.request.query_params.get('month')
        year = self.request.query_params.get('year')
        if month and year:
            queryset = queryset.filter(meal_date__month=month, meal_date__year=year)

        return queryset.order_by('meal_date', 'meal_type__id')

    def perform_create(self, serializer):
        udp = serializer.validated_data.get('user_diet_plan')
        mk = getattr(udp, 'micro_kitchen', None) if udp else None
        serializer.save(micro_kitchen=mk)
        # Step 2 — daily delivery row from global plan assignment
        DeliveryAssignment.ensure_for_meal(serializer.instance)

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

    @action(detail=True, methods=['post'], url_path='assign-delivery')
    def assign_delivery(self, request, pk=None):
        """Micro kitchen: assign a supply-chain delivery person to this meal (single-day row)."""
        user = request.user
        if getattr(user, 'role', None) != 'micro_kitchen':
            return Response(
                {"detail": "Only micro kitchen users can assign delivery."},
                status=status.HTTP_403_FORBIDDEN,
            )
        mk = MicroKitchenProfile.objects.filter(user=user).first()
        if not mk:
            return Response({"detail": "No micro kitchen profile."}, status=status.HTTP_400_BAD_REQUEST)
        meal = self.get_object()
        if meal.micro_kitchen_id != mk.id:
            return Response(
                {"detail": "This meal is not scheduled for your kitchen."},
                status=status.HTTP_403_FORBIDDEN,
            )
        delivery_person_id = request.data.get('delivery_person_id')
        if not delivery_person_id:
            return Response(
                {"detail": "delivery_person_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            person = UserRegister.objects.get(pk=int(delivery_person_id))
        except (UserRegister.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Invalid delivery_person_id."}, status=status.HTTP_400_BAD_REQUEST)
        if getattr(person, 'role', None) != 'supply_chain':
            return Response(
                {"detail": "Delivery person must be a supply chain user."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        slot_id = request.data.get('delivery_slot_id')
        delivery_slot = None
        if slot_id is not None and str(slot_id).strip() != '':
            try:
                delivery_slot = DeliverySlot.objects.get(pk=int(slot_id))
            except (DeliverySlot.DoesNotExist, ValueError, TypeError):
                return Response({"detail": "Invalid delivery_slot_id."}, status=status.HTTP_400_BAD_REQUEST)
        reason = request.data.get('reason') or 'Kitchen assign'
        with transaction.atomic():
            DeliveryAssignment.ensure_for_meal(meal)
            DeliveryAssignment.reassign(meal, person, reason=reason, delivery_slot=delivery_slot)
        meal = self.get_queryset().get(pk=meal.pk)
        return Response(self.get_serializer(meal).data)

    @action(detail=False, methods=['post'], url_path='bulk-assign-delivery')
    def bulk_assign_delivery(self, request):
        """Micro kitchen: assign one supply-chain person to all meals in a date range (optional patient filter)."""
        user = request.user
        if getattr(user, 'role', None) != 'micro_kitchen':
            return Response(
                {"detail": "Only micro kitchen users can bulk assign delivery."},
                status=status.HTTP_403_FORBIDDEN,
            )
        mk = MicroKitchenProfile.objects.filter(user=user).first()
        if not mk:
            return Response({"detail": "No micro kitchen profile."}, status=status.HTTP_400_BAD_REQUEST)
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')
        delivery_person_id = request.data.get('delivery_person_id')
        if not start_date or not end_date or not delivery_person_id:
            return Response(
                {"detail": "start_date, end_date, and delivery_person_id are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            person = UserRegister.objects.get(pk=int(delivery_person_id))
        except (UserRegister.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Invalid delivery_person_id."}, status=status.HTTP_400_BAD_REQUEST)
        if getattr(person, 'role', None) != 'supply_chain':
            return Response(
                {"detail": "Delivery person must be a supply chain user."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        only_unassigned = request.data.get('only_unassigned', True)
        if isinstance(only_unassigned, str):
            only_unassigned = only_unassigned.lower() in ('1', 'true', 'yes')
        patient_id = request.data.get('user')
        meals = UserMeal.objects.filter(micro_kitchen=mk, meal_date__range=[start_date, end_date])
        if patient_id:
            try:
                meals = meals.filter(user_id=int(patient_id))
            except (ValueError, TypeError):
                return Response({"detail": "Invalid user (patient) id."}, status=status.HTTP_400_BAD_REQUEST)
        updated = 0
        with transaction.atomic():
            for um in meals.iterator():
                DeliveryAssignment.ensure_for_meal(um)
                if only_unassigned:
                    da = DeliveryAssignment.objects.filter(user_meal=um, is_active=True).first()
                    if da and da.delivery_person_id:
                        continue
                DeliveryAssignment.reassign(um, person, reason='bulk_kitchen_assign')
                updated += 1
        return Response({"updated": updated, "start_date": start_date, "end_date": end_date})

    @action(detail=False, methods=['get'], url_path='monthly', pagination_class=None)
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
        ).prefetch_related(
            Prefetch(
                'deliveries',
                queryset=DeliveryAssignment.objects.filter(is_active=True).select_related(
                    'delivery_person', 'delivery_slot'
                ),
            )
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

    @action(detail=False, methods=['get'], url_path='timeline', pagination_class=None)
    def timeline_meals(self, request):
        """Fetch all meals for a date range (defaults to today to end of month)."""
        queryset = self.filter_queryset(self.get_queryset())
        
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        from datetime import date
        import calendar
        
        today = date.today()
        
        if not start_date_str:
            queryset = queryset.filter(meal_date__gte=today)
        
        if not end_date_str and not start_date_str:
            _, last_day = calendar.monthrange(today.year, today.month)
            end_date = date(today.year, today.month, last_day)
            queryset = queryset.filter(meal_date__lte=end_date)
            
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
            reassignment_cache = {}

            def resolve_kitchen_id_for_date(plan, meal_date):
                """
                Resolve the kitchen that owns a meal_date using reassignment history.
                Ensures dates before effective_from stay with previous kitchen.
                """
                if not plan:
                    return None

                plan_id = plan.id
                if plan_id not in reassignment_cache:
                    rows = list(
                        plan.kitchen_reassignments.order_by('effective_from', 'id').values(
                            'effective_from', 'previous_kitchen_id', 'new_kitchen_id'
                        )
                    )
                    reassignment_cache[plan_id] = rows

                rows = reassignment_cache[plan_id]
                if not rows:
                    return getattr(plan, 'micro_kitchen_id', None)

                current_kitchen_id = (
                    rows[0].get('previous_kitchen_id')
                    or getattr(plan, 'original_micro_kitchen_id', None)
                    or getattr(plan, 'micro_kitchen_id', None)
                )

                for r in rows:
                    if meal_date >= r['effective_from']:
                        current_kitchen_id = r.get('new_kitchen_id') or current_kitchen_id
                    else:
                        break

                return current_kitchen_id

            for item in serializer.validated_data:
                udp = item['user_diet_plan']
                meal_date = item['meal_date']
                target_kitchen_id = resolve_kitchen_id_for_date(udp, meal_date)

                meal_obj, created = UserMeal.objects.get_or_create(
                    user=item['user'],
                    meal_date=meal_date,
                    meal_type=item['meal_type'],
                    defaults={
                        'food': item['food'],
                        'quantity': item.get('quantity'),
                        'user_diet_plan': udp,
                        'notes': item.get('notes'),
                        'packaging_material': item.get('packaging_material'),
                        'micro_kitchen_id': target_kitchen_id,
                    }
                )

                if created:
                    DeliveryAssignment.ensure_for_meal(meal_obj)
                    continue

                meal_obj.food = item['food']
                meal_obj.quantity = item.get('quantity')
                meal_obj.user_diet_plan = udp
                meal_obj.notes = item.get('notes')
                meal_obj.packaging_material = item.get('packaging_material')
                # Always align with resolved historical owner for that date.
                meal_obj.micro_kitchen_id = target_kitchen_id

                meal_obj.save()
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
        meeting = serializer.save(patient=self.request.user)
        
        # Check if an availability slot was used and mark it booked
        if meeting.availability_slot:
            meeting.availability_slot.is_booked = True
            meeting.availability_slot.save()
            # If slot is provided, update meeting values to match slot
            meeting.preferred_date = meeting.availability_slot.date
            meeting.preferred_time = meeting.availability_slot.start_time
            meeting.save()

        patient_name = _notification_user_display(meeting.patient)
        Notification.objects.create(
            user_id=meeting.nutritionist_id,
            title="New consultation request",
            body=(
                f"{patient_name} sent a new consultation request. "
                f"Preferred date: {meeting.preferred_date}."
            ),
        )

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
            if meeting.patient_id:
                Notification.objects.create(
                    user_id=meeting.patient_id,
                    title="Consultation approved",
                    body=(
                        "Your consultation has been approved. Open Consultation to view the "
                        "meeting link and scheduled time."
                    ),
                )
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


class NutritionistAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = NutritionistAvailability.objects.all()
    serializer_class = NutritionistAvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)

        if role == 'nutritionist':
            return self.queryset.filter(nutritionist=user).order_by('date', 'start_time')
        
        nutritionist_id = self.request.query_params.get('nutritionist')
        if nutritionist_id:
            return self.queryset.filter(
                nutritionist_id=nutritionist_id, 
                is_booked=False, 
                date__gte=timezone.now().date()
            ).order_by('date', 'start_time')
        
        if role == 'admin' or user.is_staff:
            return self.queryset.order_by('-date', 'start_time')
        
        return self.queryset.none()

    def perform_create(self, serializer):
        serializer.save(nutritionist=self.request.user)

    @action(detail=False, methods=['delete'], url_path='clear-past')
    def clear_past_slots(self, request):
        """
        Delete all unbooked slots of the current nutritionist where date < today.
        """
        user = request.user
        if getattr(user, 'role', None) != 'nutritionist':
            return Response({"detail": "Only nutritionists can perform this."}, status=status.HTTP_403_FORBIDDEN)
        
        today = timezone.now().date()
        # Only delete unbooked ones to avoid data inconsistency for meetings
        past_unbooked = NutritionistAvailability.objects.filter(
            nutritionist=user, 
            date__lt=today, 
            is_booked=False
        )
        count, _ = past_unbooked.delete()
        
        return Response({"message": f"Successfully deleted {count} past unbooked slots."})

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
    pagination_class = Pagination

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

    @action(detail=False, methods=['get'], url_path='all-reviews')
    def all_reviews(self, request):
        """Get all reviews for a kitchen without pagination."""
        kitchen_id = request.query_params.get('kitchen_id')
        if not kitchen_id:
            return Response({'error': 'kitchen_id is required'}, status=400)
        
        qs = MicroKitchenRating.objects.filter(micro_kitchen_id=kitchen_id).select_related('user').order_by('-created_at')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

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

        # Add search and order_type filters
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(review__icontains=search) |
                Q(order__id__icontains=search)
            )
        order_type = self.request.query_params.get('order_type')
        if order_type and order_type != 'all':
            qs = qs.filter(order__order_type=order_type)

        return qs.order_by('-created_at')

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
        return (
            Cart.objects.filter(user=self.request.user)
            .select_related('micro_kitchen', 'micro_kitchen__user')
            .prefetch_related('items__food')
        )

    @action(detail=True, methods=['get'], url_path='checkout-preview')
    def checkout_preview(self, request, pk=None):
        cart = self.get_object()
        data = _compute_checkout_for_cart(request.user, cart)
        slab = data['delivery_slab']
        payload = {
            'food_subtotal': str(data['food_subtotal']),
            'delivery_distance_km': str(data['delivery_distance_km'])
            if data['delivery_distance_km'] is not None
            else None,
            'delivery_charge': str(data['delivery_charge']),
            'delivery_slab': None,
            'final_amount': str(data['final_amount']),
            'warnings': data['warnings'],
        }
        if slab:
            payload['delivery_slab'] = {
                'id': slab.id,
                'min_km': str(slab.min_km),
                'max_km': str(slab.max_km),
                'charge': str(slab.charge),
            }
        return Response(payload)

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


def _haversine_km(lat1, lon1, lat2, lon2):
    """Great-circle distance in km; returns None if coords invalid or missing."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return None
    try:
        a1, o1, a2, o2 = float(lat1), float(lon1), float(lat2), float(lon2)
    except (TypeError, ValueError):
        return None
    r = 6371.0
    p1, p2 = math.radians(a1), math.radians(a2)
    dphi = math.radians(a2 - a1)
    dl = math.radians(o2 - o1)
    h = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    c = 2 * math.atan2(math.sqrt(h), math.sqrt(1 - h))
    return r * c


def _slab_penalty_km(slab, d_km: Decimal) -> Decimal:
    """0 if d is inside [min_km, max_km]; else distance to nearest slab edge."""
    if slab.min_km <= d_km <= slab.max_km:
        return Decimal('0')
    if d_km < slab.min_km:
        return slab.min_km - d_km
    return d_km - slab.max_km


def _resolve_delivery_slab_for_distance(kitchen_profile, d_km: Decimal):
    """
    Pick slab for distance. Exact range match first; otherwise nearest slab (handles gaps and beyond max range).
    """
    slabs = list(
        DeliveryChargeSlab.objects.filter(micro_kitchen=kitchen_profile).order_by('min_km')
    )
    warnings = []
    if not slabs:
        return None, Decimal('0'), warnings + ['no_slabs']
    for s in slabs:
        if s.min_km <= d_km <= s.max_km:
            return s, Decimal(str(s.charge)), warnings
    best = min(slabs, key=lambda s: _slab_penalty_km(s, d_km))
    if _slab_penalty_km(best, d_km) > 0:
        warnings.append('nearest_slab_applied')
    return best, Decimal(str(best.charge)), warnings


def _cart_food_total_decimal(cart):
    total = Decimal('0')
    for item in cart.items.select_related('food'):
        mcf = MicroKitchenFood.objects.filter(
            micro_kitchen=cart.micro_kitchen, food=item.food
        ).first()
        if mcf and mcf.price is not None:
            p = Decimal(str(mcf.price))
        else:
            fp = getattr(item.food, 'price', None) if item.food else None
            p = Decimal(str(fp)) if fp is not None else Decimal('0')
        total += p * item.quantity
    return total.quantize(Decimal('0.01'))


def _compute_checkout_for_cart(user, cart):
    """
    Food subtotal, delivery distance/charge/slab, final total, and warning codes for UI.
    """
    warnings = []
    total_dec = _cart_food_total_decimal(cart)
    kitchen_profile = cart.micro_kitchen
    kitchen_user = kitchen_profile.user if kitchen_profile else None

    dist_km = None
    dist_dec = None
    slab = None
    delivery_charge_dec = Decimal('0')

    if not kitchen_profile:
        warnings.append('no_kitchen')
    elif not kitchen_user:
        warnings.append('no_kitchen')
    elif getattr(user, 'latitude', None) is None or getattr(user, 'longitude', None) is None:
        warnings.append('no_customer_coordinates')
    elif getattr(kitchen_user, 'latitude', None) is None or getattr(kitchen_user, 'longitude', None) is None:
        warnings.append('no_kitchen_coordinates')
    else:
        dist_km = _haversine_km(
            user.latitude,
            user.longitude,
            kitchen_user.latitude,
            kitchen_user.longitude,
        )
        if dist_km is not None:
            dist_dec = Decimal(str(round(dist_km, 2)))
            slab, delivery_charge_dec, sw = _resolve_delivery_slab_for_distance(kitchen_profile, dist_dec)
            warnings.extend(sw)

    final_dec = (total_dec + delivery_charge_dec).quantize(Decimal('0.01'))
    return {
        'food_subtotal': total_dec,
        'delivery_distance_km': dist_dec,
        'delivery_charge': delivery_charge_dec,
        'delivery_slab': slab,
        'final_amount': final_dec,
        'warnings': warnings,
    }


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer
    pagination_class = Pagination

    def get_queryset(self):
        user = self.request.user
        base = Order.objects.select_related(
            'user', 'micro_kitchen', 'micro_kitchen__user', 'delivery_slab', 'delivery_person'
        ).prefetch_related('items__food', 'ratings').order_by('-created_at')

        if user.role == 'admin':
            qs = base
            micro_kitchen_id = self.request.query_params.get('micro_kitchen')
            if micro_kitchen_id:
                qs = qs.filter(micro_kitchen_id=micro_kitchen_id)
            order_user_id = self.request.query_params.get('user')
            if order_user_id:
                qs = qs.filter(user_id=order_user_id)
        elif user.role == 'micro_kitchen':
            qs = base.filter(micro_kitchen__user=user)
        elif user.role == 'supply_chain':
            qs = base.filter(delivery_person=user)
        else:
            qs = base.filter(user=user)

        # Common filters for all roles
        status = self.request.query_params.get('status')
        if status and status != 'all':
            qs = qs.filter(status=status)
            
        order_type = self.request.query_params.get('order_type')
        if order_type and order_type != 'all':
            qs = qs.filter(order_type=order_type)
            
        search = self.request.query_params.get('search')
        if search:
            from django.db.models import Q
            qs = qs.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(delivery_address__icontains=search) |
                Q(id__icontains=search)
            )

        # Date range filtering
        period = self.request.query_params.get('period')
        if period and period != 'all':
            from .utils.date_utils import get_period_range
            start_date = self.request.query_params.get('start_date')
            end_date = self.request.query_params.get('end_date')
            try:
                s, e = get_period_range(period, start_date, end_date)
                qs = qs.filter(created_at__date__range=[s, e])
            except Exception as ex:
                print(f"Error calculating date range: {ex}")

        return qs

    def list(self, request, *args, **kwargs):
        """Overrides list to include stats for the current filter."""
        queryset = self.filter_queryset(self.get_queryset())
        
        # Calculate stats for the full filtered queryset (before pagination)
        from django.db.models import Sum, Count
        stats = queryset.aggregate(
            total_orders=Count('id'),
            total_amount=Sum('final_amount')
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            # Add stats to the paginated response
            response.data['total_orders'] = stats['total_orders'] or 0
            response.data['total_amount'] = stats['total_amount'] or 0
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'total_orders': stats['total_orders'] or 0,
            'total_amount': stats['total_amount'] or 0
        })

    @action(detail=False, methods=['get'], url_path='payment-stats')
    def payment_stats(self, request):
        """Calculate summary stats (total count, total amount) for the filtered orders."""
        qs = self.get_queryset()
        from django.db.models import Sum, Count
        stats = qs.aggregate(
            total_orders=Count('id'),
            total_amount=Sum('final_amount')
        )
        return Response({
            'total_orders': stats['total_orders'] or 0,
            'total_amount': stats['total_amount'] or 0
        })

    @action(detail=False, methods=['post'], url_path='place-order')
    def place_order(self, request):
        cart_id = request.data.get('cart_id')
        delivery_address = request.data.get('delivery_address')

        if not cart_id:
            return Response({"error": "cart_id required"}, status=400)

        try:
            cart = (
                Cart.objects.select_related('micro_kitchen', 'micro_kitchen__user')
                .prefetch_related('items__food')
                .get(id=cart_id, user=request.user)
            )
            cart_items = list(cart.items.select_related('food'))
            if not cart_items:
                return Response({"error": "Cart is empty"}, status=400)

            def get_price(item):
                mcf = MicroKitchenFood.objects.filter(
                    micro_kitchen=cart.micro_kitchen, food=item.food
                ).first()
                if mcf:
                    return float(mcf.price)
                return (item.food.price or 0) if item.food and item.food.price else 0

            breakdown = _compute_checkout_for_cart(request.user, cart)
            total_dec = breakdown['food_subtotal']
            dist_dec = breakdown['delivery_distance_km']
            delivery_charge_dec = breakdown['delivery_charge']
            slab = breakdown['delivery_slab']
            final_dec = breakdown['final_amount']
            customer = request.user
            kitchen_profile = cart.micro_kitchen

            order = Order.objects.create(
                user=customer,
                micro_kitchen=kitchen_profile,
                order_type='patient' if customer.role == 'patient' else 'non_patient',
                total_amount=total_dec,
                delivery_distance_km=dist_dec,
                delivery_charge=delivery_charge_dec,
                delivery_slab=slab,
                final_amount=final_dec,
                delivery_address=delivery_address or (getattr(customer, 'address', '') or ''),
                status='placed',
            )

            for item in cart_items:
                price = get_price(item)
                OrderItem.objects.create(
                    order=order,
                    food=item.food,
                    quantity=item.quantity,
                    price=price,
                    subtotal=price * item.quantity,
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

    @action(detail=True, methods=['patch'], url_path='assign-delivery-person')
    def assign_delivery_person(self, request, pk=None):
        """
        Persist which supply-chain user delivers this order.
        Stored on Order.delivery_person. Micro kitchen may only pick users on their active delivery team.
        Send {"delivery_person": null} to clear.
        """
        order = self.get_object()
        role = getattr(request.user, 'role', None)
        if role not in ('micro_kitchen', 'admin'):
            raise PermissionDenied()
        raw = request.data.get('delivery_person', request.data.get('delivery_person_id'))
        if raw in (None, ''):
            order.delivery_person = None
            order.save(update_fields=['delivery_person'])
            return Response(self.get_serializer(order).data)
        try:
            dp_id = int(raw)
        except (TypeError, ValueError):
            return Response({'delivery_person': ['Invalid value.']}, status=status.HTTP_400_BAD_REQUEST)
        dp = UserRegister.objects.filter(id=dp_id, role='supply_chain').first()
        if not dp:
            return Response({'detail': 'Only supply-chain users can be assigned.'}, status=status.HTTP_400_BAD_REQUEST)
        if role == 'micro_kitchen':
            mk = MicroKitchenProfile.objects.filter(user=request.user).first()
            if not mk or order.micro_kitchen_id != mk.id:
                raise PermissionDenied()
            if not MicroKitchenDeliveryTeam.objects.filter(
                micro_kitchen=mk, delivery_person_id=dp_id, is_active=True
            ).exists():
                return Response(
                    {'detail': 'This person is not on your active delivery team.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        order.delivery_person_id = dp_id
        order.save(update_fields=['delivery_person'])
        return Response(self.get_serializer(order).data)


class DeliveryChargeSlabViewSet(viewsets.ModelViewSet):
    serializer_class = DeliveryChargeSlabSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', None)
        if role == 'admin':
            qs = DeliveryChargeSlab.objects.select_related('micro_kitchen').all().order_by(
                'micro_kitchen_id', 'min_km'
            )
            mk = self.request.query_params.get('micro_kitchen')
            if mk:
                qs = qs.filter(micro_kitchen_id=mk)
            return qs
        if role == 'micro_kitchen':
            profile = MicroKitchenProfile.objects.filter(user=user).first()
            if not profile:
                return DeliveryChargeSlab.objects.none()
            return DeliveryChargeSlab.objects.filter(micro_kitchen=profile).order_by('min_km')
        return DeliveryChargeSlab.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        role = getattr(user, 'role', None)
        if role == 'micro_kitchen':
            profile = MicroKitchenProfile.objects.filter(user=user).first()
            if not profile:
                raise PermissionDenied('No micro kitchen profile for this account.')
            serializer.save(micro_kitchen=profile)
            return
        if role == 'admin':
            serializer.save()
            return
        raise PermissionDenied()

    def perform_update(self, serializer):
        self._ensure_owner_or_admin(serializer.instance)
        serializer.save()

    def perform_destroy(self, instance):
        self._ensure_owner_or_admin(instance)
        instance.delete()

    def _ensure_owner_or_admin(self, instance):
        user = self.request.user
        if getattr(user, 'role', None) == 'admin':
            return
        if getattr(user, 'role', None) == 'micro_kitchen':
            profile = MicroKitchenProfile.objects.filter(user=user).first()
            if profile and instance.micro_kitchen_id == profile.id:
                return
        raise PermissionDenied()


class CartItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = CartItemSerializer

    def get_queryset(self):
        return CartItem.objects.filter(cart__user=self.request.user)


class AdminPatientOverviewViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin and doctor: paginated list of users with role=patient (summary columns);
    retrieve returns nested questionnaire, health reports, nutritionist reviews,
    diet plans, active plan, and UserMeal rows (food + packaging material).
    """

    permission_classes = [IsAuthenticated, IsAdminOrDoctorRole]
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
    pagination_class = Pagination

    def get_serializer_class(self):
        if self.action == 'list':
            return MicroKitchenPatientSummarySerializer
        return AdminMicroKitchenPatientSlotSerializer

    def get_queryset(self):
        user = self.request.user
        if getattr(user, 'role', None) != 'micro_kitchen':
            return UserDietPlan.objects.none()

        from django.db.models import Q
        return UserDietPlan.objects.filter(
            Q(micro_kitchen__user=user) | Q(original_micro_kitchen__user=user),
            status__in=['active', 'approved', 'payment_pending']
        ).select_related(
            'user', 'diet_plan', 'nutritionist', 'micro_kitchen', 'original_micro_kitchen'
        ).order_by('-id')


# ---- Admin MicroKitchen panels (NO pagination) -----------------------------

class AdminMicroKitchenPatientsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        micro_kitchen_id = request.query_params.get("micro_kitchen")
        status_param = request.query_params.get("status")

        if not micro_kitchen_id:
            return Response([])

        from django.db.models import Q
        # Include patients currently or originally allotted to this kitchen
        qs = UserDietPlan.objects.filter(
            Q(micro_kitchen_id=micro_kitchen_id) | Q(original_micro_kitchen_id=micro_kitchen_id)
        ).select_related(
            "user", "diet_plan", "nutritionist", "original_nutritionist", "micro_kitchen", "original_micro_kitchen"
        )

        if status_param:
            qs = qs.filter(status=status_param)
        else:
            qs = qs.filter(status__in=["active", "payment_pending", "approved"])

        qs = qs.order_by("-suggested_on")
        # Target micro kitchen id for distance calculation in serializer
        serializer = AdminMicroKitchenPatientSlotSerializer(
            qs, many=True, context={'request': request, 'target_micro_kitchen_id': micro_kitchen_id}
        )
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

        qs = Food.objects.filter(micro_kitchen_id=micro_kitchen_id).select_related("cuisine", "meal_type", "food_group").order_by("-id")
        serializer = FoodSerializer(qs, many=True)
        return Response(serializer.data)


class AdminMicroKitchenPayoutsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        mk_id = request.query_params.get("micro_kitchen")
        if not mk_id:
            return Response([])

        # Filter trackers specifically for this Micro-Kitchen
        trackers = PayoutTracker.objects.filter(
            micro_kitchen_id=mk_id
        ).select_related(
            "snapshot__user_diet_plan__user",
            "snapshot__user_diet_plan__diet_plan",
            "snapshot__user_diet_plan__nutritionist",
            "micro_kitchen"
        ).order_by("-created_at")

        from collections import defaultdict
        patient_groups = defaultdict(lambda: {
            "patient": None,
            "trackers": []
        })

        for tracker in trackers:
            try:
                udp = tracker.snapshot.user_diet_plan
                patient = udp.user
                p_id = patient.id
                
                if not patient_groups[p_id]["patient"]:
                    patient_groups[p_id]["patient"] = {
                        "id": p_id,
                        "name": f"{patient.first_name} {patient.last_name}".strip(),
                        "email": patient.email,
                        "mobile": patient.mobile
                    }
                
                t_data = AdminPayoutTrackerForPayoutSerializer(tracker).data
                t_data['payout_type'] = tracker.payout_type
                t_data['recipient_label'] = tracker.micro_kitchen.brand_name if tracker.micro_kitchen else "—"
                
                # Reassignment logic
                kreas = MicroKitchenReassignment.objects.filter(user_diet_plan_id=udp.id).select_related('previous_kitchen', 'new_kitchen').order_by('-reassigned_on')
                t_data['kitchen_reassignments'] = [{
                    "from": kr.previous_kitchen.brand_name if kr.previous_kitchen else "None",
                    "to": kr.new_kitchen.brand_name if kr.new_kitchen else "None",
                    "reason": kr.reason,
                    "date": kr.reassigned_on
                } for kr in kreas]
                
                patient_groups[p_id]["trackers"].append(t_data)
            except:
                continue

        return Response(list(patient_groups.values()))


class AdminMicroKitchenMealsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        micro_kitchen_id = request.query_params.get("micro_kitchen")
        month = request.query_params.get("month")
        year = request.query_params.get("year")

        if not micro_kitchen_id:
            return Response([])

        qs = UserMeal.objects.filter(micro_kitchen_id=micro_kitchen_id).select_related(
            "user", "meal_type", "food", "packaging_material"
        )

        if month and year:
            qs = qs.filter(meal_date__month=month, meal_date__year=year)

        qs = qs.order_by("-meal_date", "meal_type")
        serializer = UserMealSerializer(qs, many=True)
        return Response(serializer.data)

# ---- Admin Nutritionist panels (NO pagination) -----------------------------

class AdminNutritionistPatientsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        nutritionist_id = request.query_params.get("nutritionist")
        if not nutritionist_id:
            return Response([])

        # Active mappings
        mappings = UserNutritionistMapping.objects.filter(
            nutritionist_id=nutritionist_id, is_active=True
        ).select_related("user")
        
        results = []
        for m in mappings:
            p = m.user
            # Get latest active diet plan for this patient to find their current kitchen
            plan = UserDietPlan.objects.filter(user=p, status='active').select_related('micro_kitchen', 'micro_kitchen__user').first()
            
            # Reassignments for this user to this nutritionist
            reassignments = NutritionistReassignment.objects.filter(
                user=p, new_nutritionist_id=nutritionist_id
            ).select_related('previous_nutritionist', 'reassigned_by').order_by('-reassigned_on')
            
            history = []
            for r in reassignments:
                history.append({
                    "from": f"{r.previous_nutritionist.first_name} {r.previous_nutritionist.last_name}" if r.previous_nutritionist else "None",
                    "reason": r.reason,
                    "notes": r.notes,
                    "by": f"{r.reassigned_by.first_name} {r.reassigned_by.last_name}" if r.reassigned_by else "Admin",
                    "date": r.reassigned_on,
                    "effective_from": r.effective_from
                })

            results.append({
                "id": p.id,
                "first_name": p.first_name,
                "last_name": p.last_name,
                "email": p.email,
                "mobile": p.mobile,
                "assigned_on": m.assigned_on,
                "kitchen_brand": plan.micro_kitchen.brand_name if plan and plan.micro_kitchen else "Not Assigned",
                "kitchen_id": plan.micro_kitchen.id if plan and plan.micro_kitchen else None,
                "reassignment_history": history
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
        
        data = UserDietPlanSerializer(qs, many=True).data
        # Inject reassignment context if any
        for plan_data in data:
            plan_id = plan_data['id']
            # Kitchen reassignments for this plan
            kreas = MicroKitchenReassignment.objects.filter(user_diet_plan_id=plan_id).select_related('previous_kitchen', 'new_kitchen', 'reassigned_by').order_by('-reassigned_on')
            plan_data['kitchen_reassignments'] = [{
                "from": kr.previous_kitchen.brand_name if kr.previous_kitchen else "None",
                "to": kr.new_kitchen.brand_name if kr.new_kitchen else "None",
                "reason": kr.reason,
                "date": kr.reassigned_on,
                "effective_from": kr.effective_from,
                "by": kr.reassigned_by.username if kr.reassigned_by else "Admin"
            } for kr in kreas]
            
        return Response(data)


class AdminNutritionistMealsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        nutritionist_id = request.query_params.get("nutritionist")
        month = request.query_params.get("month")
        year = request.query_params.get("year")
        
        if not nutritionist_id:
            return Response([])

        qs = UserMeal.objects.filter(
            user_diet_plan__nutritionist_id=nutritionist_id
        ).select_related(
            "user", "user_diet_plan", "user_diet_plan__micro_kitchen", "meal_type", "food", "packaging_material"
        )
        
        if month and year:
            qs = qs.filter(meal_date__month=month, meal_date__year=year)
            
        qs = qs.order_by("-meal_date", "meal_type__id")
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
        ).select_related("patient", "user_diet_plan").order_by("-created_on")
        serializer = MeetingRequestSerializer(qs, many=True)
        return Response(serializer.data)

class AdminNutritionistReviewsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        nutritionist_id = request.query_params.get("nutritionist")
        if not nutritionist_id:
            return Response([])
        
        qs = NutritionistRating.objects.filter(nutritionist_id=nutritionist_id).select_related('patient').order_by('-created_at')
        serializer = NutritionistRatingSerializer(qs, many=True)
        return Response(serializer.data)

class AdminNutritionistTicketsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        user_id = request.query_params.get("user")
        if not user_id:
            return Response([])
        
        qs = SupportTicket.objects.filter(created_by_id=user_id).select_related('category', 'assigned_to').order_by('-id')
        serializer = SupportTicketSerializer(qs, many=True)
        return Response(serializer.data)


class AdminNutritionistPayoutsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        nutritionist_id = request.query_params.get("nutritionist")
        if not nutritionist_id:
            return Response([])

        # Filter trackers specifically for this Nutritionist
        trackers = PayoutTracker.objects.filter(
            nutritionist_id=nutritionist_id
        ).select_related(
            "snapshot__user_diet_plan__user",
            "snapshot__user_diet_plan__diet_plan",
            "snapshot__user_diet_plan__micro_kitchen",
            "nutritionist"
        ).order_by("-created_at")

        from collections import defaultdict
        patient_groups = defaultdict(lambda: {
            "patient": None,
            "trackers": []
        })

        for tracker in trackers:
            try:
                udp = tracker.snapshot.user_diet_plan
                patient = udp.user
                p_id = patient.id
                
                if not patient_groups[p_id]["patient"]:
                    patient_groups[p_id]["patient"] = {
                        "id": p_id,
                        "name": f"{patient.first_name} {patient.last_name}".strip(),
                        "email": patient.email,
                        "mobile": patient.mobile
                    }
                
                t_data = AdminPayoutTrackerForPayoutSerializer(tracker).data
                t_data['payout_type'] = tracker.payout_type
                t_data['recipient_label'] = f"{tracker.nutritionist.first_name} {tracker.nutritionist.last_name}".strip() if tracker.nutritionist else "—"

                # Nutritionist reassignments
                nreas = NutritionistReassignment.objects.filter(user_id=udp.user_id).select_related('previous_nutritionist', 'new_nutritionist').order_by('-reassigned_on')
                t_data['nutritionist_reassignments'] = [{
                    "from": nr.previous_nutritionist.username if nr.previous_nutritionist else "None",
                    "to": nr.new_nutritionist.username if nr.new_nutritionist else "None",
                    "reason": nr.reason,
                    "date": nr.reassigned_on
                } for nr in nreas]
                
                patient_groups[p_id]["trackers"].append(t_data)
            except:
                continue

        return Response(list(patient_groups.values()))

# ---- Admin Patient panels (NO pagination for modal display) -----------------------------

class AdminPatientMeetingsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        patient_id = request.query_params.get("patient")
        if not patient_id:
            return Response([])

        qs = (
            MeetingRequest.objects.filter(patient_id=patient_id)
            .select_related("patient", "nutritionist", "user_diet_plan")
            .order_by("-preferred_date", "-preferred_time")
        )
        serializer = MeetingRequestSerializer(qs, many=True)
        return Response(serializer.data)


class AdminPatientTicketsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        patient_id = request.query_params.get("user")
        if not patient_id:
            return Response([])

        qs = (
            SupportTicket.objects.filter(created_by_id=patient_id)
            .select_related("created_by", "assigned_to", "category")
            .order_by("-created_at")
        )
        serializer = SupportTicketSerializer(qs, many=True)
        return Response(serializer.data)


class AdminPatientNutritionistRatingsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        patient_id = request.query_params.get("patient")
        if not patient_id:
            return Response([])

        qs = (
            NutritionistRating.objects.filter(patient_id=patient_id)
            .select_related("patient", "nutritionist", "diet_plan")
            .order_by("-created_at")
        )
        serializer = NutritionistRatingSerializer(qs, many=True)
        return Response(serializer.data)


class AdminPatientKitchenRatingsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        patient_id = request.query_params.get("user")
        if not patient_id:
            return Response([])

        qs = (
            MicroKitchenRating.objects.filter(user_id=patient_id)
            .select_related("user", "micro_kitchen", "order")
            .order_by("-created_at")
        )
        serializer = MicroKitchenRatingSerializer(qs, many=True)
        return Response(serializer.data)


class AdminOrderPaymentsNoPaginationView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        user_id = request.query_params.get("user")
        if not user_id:
            return Response([])

        qs = (
            Order.objects.filter(user_id=user_id)
            .select_related("user", "micro_kitchen")
            .order_by("-created_at")
        )
        serializer = OrderSerializer(qs, many=True)
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

        from django.db.models import Q
        if getattr(u, "role", None) != "admin":
            # Non-admins: only see what they created OR what is assigned specifically to them
            qs = qs.filter(Q(created_by=u) | Q(assigned_to=u))
        else:
            # Admins: only see what was sent to 'admin' OR what they created themselves
            if mine in ["1", "true", "True", "yes", "y"]:
                qs = qs.filter(created_by=u)
            else:
                qs = qs.filter(Q(target_user_type="admin") | Q(created_by=u))

        if status_param:
            qs = qs.filter(status=status_param)
        if user_type_param:
            qs = qs.filter(user_type=user_type_param)
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        target_user_type = self.request.data.get("target_user_type", "admin")
        explicit_assigned_to = self.request.data.get("assigned_to")

        role = getattr(u, "role", None)
        if role == "patient" or role == "non_patient":
            user_type = "patient"
        elif role == "nutritionist":
            user_type = "nutritionist"
        elif role == "micro_kitchen":
            user_type = "kitchen"
        elif role == "doctor":
            user_type = "doctor"
        else:
            user_type = self.request.data.get("user_type") or "patient"

        # Auto-assignment logic based on target_user_type
        assigned_to = None
        
        if explicit_assigned_to:
            assigned_to = UserRegister.objects.filter(id=explicit_assigned_to).first()

        if not assigned_to and role != "admin":
            if target_user_type == 'nutritionist':
                mapping = UserNutritionistMapping.objects.filter(user=u, is_active=True).first()
                if mapping:
                    assigned_to = mapping.nutritionist
            elif target_user_type == 'kitchen':
                plan = UserDietPlan.objects.filter(user=u, status='active').first()
                if plan and plan.micro_kitchen:
                    assigned_to = plan.micro_kitchen.user

        ticket = serializer.save(created_by=u, user_type=user_type, assigned_to=assigned_to, target_user_type=target_user_type)
        creator_label = _notification_user_display(ticket.created_by)
        title_preview = (ticket.title or "Support ticket").strip()[:200]
        
        # Notify admins
        for admin in UserRegister.objects.filter(role="admin", is_active=True):
            Notification.objects.create(
                user_id=admin.id,
                title="New support ticket",
                body=f"{creator_label} created ticket #{ticket.id}: {title_preview}",
            )
            
        # Notify specific assigned user if any
        if ticket.assigned_to and ticket.assigned_to.role != 'admin':
            Notification.objects.create(
                user_id=ticket.assigned_to.id,
                title=f"New Chat from {creator_label} regarding ticket",
                body=f"You have a new message regarding: {title_preview}",
            )

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
            from django.db.models import Q
            qs = qs.filter(Q(ticket__created_by=u) | Q(ticket__assigned_to=u), is_internal=False)
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        ticket = serializer.validated_data.get("ticket")

        # Only admin can post internal notes; also enforce ticket access.
        is_internal = bool(serializer.validated_data.get("is_internal", False))
        if getattr(u, "role", None) != "admin":
            is_internal = False
            # Check if user is either the creator or the assigned recipient
            if not ticket or (ticket.created_by_id != u.id and ticket.assigned_to_id != u.id):
                raise PermissionDenied("Not allowed to post on this ticket.")

        message = serializer.save(sender=u, is_internal=is_internal)
        
        # Notify the other party
        recipient = None
        if ticket.created_by_id == u.id:
            recipient = ticket.assigned_to
        else:
            recipient = ticket.created_by
            
        if recipient:
            Notification.objects.create(
                user_id=recipient.id,
                title=f"New Message from {_notification_user_display(u)}",
                body=f"Ticket #{ticket.id}: {message.message[:100]}",
            )


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
            from django.db.models import Q
            qs = qs.filter(Q(ticket__created_by=u) | Q(ticket__assigned_to=u))
        return qs

    def perform_create(self, serializer):
        u = self.request.user
        ticket = serializer.validated_data.get("ticket")
        if getattr(u, "role", None) != "admin":
            if not ticket or (ticket.created_by_id != u.id and ticket.assigned_to_id != u.id):
                raise PermissionDenied("Not allowed to upload for this ticket.")
        serializer.save(uploaded_by=u)


class NotificationViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    """
    Current user's notifications: filters (is_read, period, custom dates), pagination, counts.
    """

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = NotificationPagination

    def get_queryset(self):
        qs = Notification.objects.filter(user=self.request.user)
        params = self.request.query_params
        is_read = params.get("is_read")
        if is_read and str(is_read).lower() != "all":
            if str(is_read).lower() == "true":
                qs = qs.filter(is_read=True)
            elif str(is_read).lower() == "false":
                qs = qs.filter(is_read=False)

        period = (params.get("period") or "").strip()
        start_s = params.get("start_date")
        end_s = params.get("end_date")
        today = timezone.now().date()
        start_d = end_d = None

        try:
            if period == "today":
                start_d = end_d = today
            elif period == "this_week":
                start_d = today - timedelta(days=today.weekday())
                end_d = today
            elif period == "this_month":
                start_d = today.replace(day=1)
                end_d = today
            elif period == "last_month":
                first_this = today.replace(day=1)
                last_prev = first_this - timedelta(days=1)
                start_d = last_prev.replace(day=1)
                end_d = last_prev
            elif period == "this_quarter":
                quarter_start_month = 3 * ((today.month - 1) // 3) + 1
                start_d = date(today.year, quarter_start_month, 1)
                end_d = today
            elif period == "this_year":
                start_d = date(today.year, 1, 1)
                end_d = today
            elif period == "custom" and start_s and end_s:
                start_d = datetime.strptime(str(start_s), "%Y-%m-%d").date()
                end_d = datetime.strptime(str(end_s), "%Y-%m-%d").date()
        except (ValueError, TypeError):
            start_d = end_d = None

        if start_d and end_d:
            qs = qs.filter(created_at__date__gte=start_d, created_at__date__lte=end_d)

        return qs.order_by("-created_at")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        limit = request.query_params.get("limit")

        total_count = queryset.count()
        read_count = queryset.filter(is_read=True).count()
        unread_count = queryset.filter(is_read=False).count()
        counts = {"total": total_count, "read": read_count, "unread": unread_count}

        if limit and str(limit).lower() == "all":
            serializer = self.get_serializer(queryset, many=True)
            return Response({"counts": counts, "results": serializer.data})

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            paginated_response.data["counts"] = counts
            return paginated_response

        serializer = self.get_serializer(queryset, many=True)
        return Response({"counts": counts, "results": serializer.data})

    @action(detail=False, methods=["post"], url_path="mark_all_read")
    def mark_all_read(self, request):
        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(is_read=True)
        return Response(
            {
                "message": f"Marked {updated_count} notifications as read",
                "updated_count": updated_count,
            }
        )

    @action(detail=True, methods=["post"], url_path="mark_as_read")
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])
        return Response({"message": "Notification marked as read"})

class NutritionistReassignmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    View to list nutritionist reassignments, primarily for admins.
    """
    queryset = NutritionistReassignment.objects.select_related(
        'user', 'previous_nutritionist', 'new_nutritionist', 'reassigned_by', 'active_diet_plan'
    ).order_by('-reassigned_on')
    serializer_class = NutritionistReassignmentSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'user__username', 'user__first_name', 'user__last_name',
        'previous_nutritionist__username', 'new_nutritionist__username',
        'reason', 'notes'
    ]

    def get_queryset(self):
        qs = super().get_queryset()
        user_id = self.request.query_params.get('user')
        if user_id:
            qs = qs.filter(user_id=user_id)
        return qs

class MicroKitchenReassignmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    View to list micro kitchen reassignments, primarily for admins.
    """
    queryset = MicroKitchenReassignment.objects.select_related(
        'user_diet_plan__user', 'previous_kitchen', 'new_kitchen', 'reassigned_by'
    ).order_by('-reassigned_on')
    serializer_class = MicroKitchenReassignmentSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]
    pagination_class = Pagination
    filter_backends = [filters.SearchFilter]
    search_fields = [
        'user_diet_plan__user__username', 'user_diet_plan__user__first_name', 'user_diet_plan__user__last_name',
        'previous_kitchen__brand_name', 'new_kitchen__brand_name',
        'reason', 'notes'
    ]

    def get_queryset(self):
        qs = super().get_queryset()
        user_id = self.request.query_params.get('user')
        if user_id:
            qs = qs.filter(user_diet_plan__user_id=user_id)
        return qs





class SendOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = request.data.get("email") # Identifier can be email or username
        if not identifier:
            return Response({"error": "Email or Username is required"})

        user = UserRegister.objects.filter(Q(email=identifier) | Q(username=identifier)).first()
        if not user:
            return Response({"error": "User with this email or username not found"})

        email = user.email
        if not email:
            return Response({"error": "User has no email address associated. Please contact support."})

        otp = str(random.randint(100000, 999999))

        otp_obj, created = EmailOTP.objects.get_or_create(email=email)
        otp_obj.otp = otp
        otp_obj.created_at = timezone.now()  
        otp_obj.verified = False
        otp_obj.save()

        # Send OTP via Email
        try:
            from django.core.mail import send_mail
            from django.conf import settings
            
            subject = "Your Password Reset OTP"
            message = f"Hello,\n\nYour OTP for resetting your password is: {otp}.\n\nThis OTP is valid for 5 minutes.\n\nIf you did not request this, please ignore this email."
            from_email = settings.DEFAULT_FROM_EMAIL
            recipient_list = [email]
            
            send_mail(subject, message, from_email, recipient_list, fail_silently=False)
            
            obfuscated_email = f"{email[:3]}...@{email.split('@')[-1]}"
            return Response({
                "message": f"OTP sent successfully to your registered email ({obfuscated_email})",
                "email": email 
            })
        except Exception as e:
            return Response({"error": f"Failed to send email: {str(e)}"})


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp_input = request.data.get('otp')

        try:
            otp_obj = EmailOTP.objects.get(email=email)

            if otp_obj.is_expired():
                return Response({'error': 'OTP expired'})

            if otp_obj.otp == otp_input:
                otp_obj.verified = True  
                otp_obj.save()
                return Response({'message': 'OTP verified successfully'})
            else:
                return Response({'error': 'Invalid OTP'})

        except EmailOTP.DoesNotExist:
            return Response({'error': 'OTP not found'})

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email_or_mobile = request.data.get("email")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if not all([email_or_mobile, new_password, confirm_password]):
            return Response({"error": "All fields are required."})

        if new_password != confirm_password:
            return Response({"error": "Passwords do not match."})

        # ===============================
        #    OTP CHECK
        # ===============================
        try:
            otp_obj = EmailOTP.objects.get(email=email_or_mobile)
            if not otp_obj.verified:
                return Response({"error": "OTP not verified for this email."})
        except EmailOTP.DoesNotExist:
            return Response({"error": "OTP not found. Please verify OTP first."})

        # ===============================
        #   USER LOOKUP
        # ===============================
        # Check by email or mobile
        user = UserRegister.objects.filter(email=email_or_mobile).first()

        if not user:
            user = UserRegister.objects.filter(mobile=email_or_mobile).first()

        if not user:
            return Response({"error": "User with this email or mobile not found."})

        # ===============================
        #   UPDATE PASSWORD
        # ===============================
        user.set_password(new_password)
        user.save()

        # Reset OTP flag
        otp_obj.verified = False
        otp_obj.save()

        return Response({"message": "Password reset successful."})


def _parse_iso_date(val):
    if val is None or val == "":
        return None
    if hasattr(val, "year"):
        return val
    if isinstance(val, str):
        return datetime.strptime(val[:10], "%Y-%m-%d").date()
    return None


class DeliveryStaffListView(APIView):
    """Users with a DeliveryProfile — selectable as delivery persons."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = getattr(request.user, "role", None)
        if role not in ("micro_kitchen", "admin"):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        qs = (
            UserRegister.objects.filter(delivery_profile__isnull=False)
            .order_by("first_name", "last_name")
        )
        data = [
            {
                "id": u.id,
                "first_name": u.first_name or "",
                "last_name": u.last_name or "",
                "mobile": u.mobile or "",
            }
            for u in qs
        ]
        return Response(data)


class MicroKitchenDeliveryTeamViewSet(viewsets.ModelViewSet):
    serializer_class = MicroKitchenDeliveryTeamSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        role = getattr(self.request.user, "role", None)
        qs = MicroKitchenDeliveryTeam.objects.select_related(
            "micro_kitchen",
            "delivery_person",
        )
        if role == "admin":
            mk_id = self.request.query_params.get("micro_kitchen")
            if mk_id:
                qs = qs.filter(micro_kitchen_id=mk_id)
            return qs.order_by("-assigned_on")
        if role == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=self.request.user).first()
            if not mk:
                return MicroKitchenDeliveryTeam.objects.none()
            return qs.filter(micro_kitchen=mk).order_by("-assigned_on")
        return MicroKitchenDeliveryTeam.objects.none()

    def perform_create(self, serializer):
        role = getattr(self.request.user, "role", None)
        if role == "admin":
            if serializer.validated_data.get("micro_kitchen") is None:
                raise ValidationError({"micro_kitchen": ["This field is required."]})
            serializer.save()
            return
        if role == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=self.request.user).first()
            if not mk:
                raise PermissionDenied("No micro kitchen profile found for this account.")
            serializer.save(micro_kitchen=mk)
            return
        raise PermissionDenied("Forbidden.")

    def perform_update(self, serializer):
        obj = self.get_object()
        role = getattr(self.request.user, "role", None)
        if role == "admin":
            serializer.save()
            return
        if role == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=self.request.user).first()
            if not mk or obj.micro_kitchen_id != mk.id:
                raise PermissionDenied("Forbidden.")
            serializer.save(micro_kitchen=mk)
            return
        raise PermissionDenied("Forbidden.")

    def perform_destroy(self, instance):
        role = getattr(self.request.user, "role", None)
        if role == "admin":
            instance.delete()
            return
        if role == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=self.request.user).first()
            if not mk or instance.micro_kitchen_id != mk.id:
                raise PermissionDenied("Forbidden.")
            instance.delete()
            return
        raise PermissionDenied("Forbidden.")


class SupplyChainUsersListView(APIView):
    """Users available for delivery assignment based on user's role."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = getattr(request.user, "role", None)
        if role not in ("micro_kitchen", "admin"):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        if role == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=request.user).first()
            if not mk:
                return Response([])
            # Full supply_chain pool (e.g. "add team member" screen). Default remains current team only.
            if request.query_params.get("all") in ("1", "true", "yes"):
                qs = UserRegister.objects.filter(role="supply_chain").order_by(
                    "first_name", "last_name", "id"
                )
                data = [
                    {
                        "id": u.id,
                        "first_name": u.first_name or "",
                        "last_name": u.last_name or "",
                        "mobile": u.mobile or "",
                        "email": u.email or "",
                    }
                    for u in qs
                ]
                return Response(data)
            team_qs = (
                MicroKitchenDeliveryTeam.objects.filter(micro_kitchen=mk, is_active=True)
                .select_related("delivery_person")
                .order_by("role", "delivery_person__first_name", "delivery_person__last_name", "id")
            )
            data = [
                {
                    "id": t.delivery_person_id,
                    "first_name": t.delivery_person.first_name or "",
                    "last_name": t.delivery_person.last_name or "",
                    "mobile": t.delivery_person.mobile or "",
                    "email": t.delivery_person.email or "",
                    "team_member_id": t.id,
                    "team_role": t.role,
                    "is_active": t.is_active,
                    "zone_name": t.zone_name,
                    "pincode": t.pincode,
                }
                for t in team_qs
            ]
            return Response(data)

        qs = UserRegister.objects.filter(role="supply_chain").order_by("first_name", "last_name", "id")
        data = [
            {
                "id": u.id,
                "first_name": u.first_name or "",
                "last_name": u.last_name or "",
                "mobile": u.mobile or "",
                "email": u.email or "",
            }
            for u in qs
        ]
        return Response(data)


class DeliverySlotKitchenViewSet(viewsets.ModelViewSet):
    queryset = DeliverySlot.objects.select_related("micro_kitchen").all()
    serializer_class = DeliverySlotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        u = self.request.user
        role = getattr(u, "role", None)
        if role == "admin":
            return DeliverySlot.objects.select_related("micro_kitchen").all().order_by("name")
        if role == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=u).first()
            if not mk:
                return DeliverySlot.objects.none()
            return (
                DeliverySlot.objects.filter(Q(micro_kitchen=mk) | Q(micro_kitchen__isnull=True))
                .select_related("micro_kitchen")
                .order_by("name")
            )
        return DeliverySlot.objects.none()

    def create(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response({"detail": "Only admin can create delivery slots."}, status=status.HTTP_403_FORBIDDEN)
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response({"detail": "Only admin can update delivery slots."}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response({"detail": "Only admin can update delivery slots."}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "admin":
            return Response({"detail": "Only admin can delete delivery slots."}, status=status.HTTP_403_FORBIDDEN)
        return super().destroy(request, *args, **kwargs)


def _apply_plan_delivery_slots(assignment, slot_ids, primary_slot_id=None):
    """
    Persist M2M delivery_slots and default_slot (primary).
    slot_ids: non-empty list of DeliverySlot PKs. primary_slot_id must be one of them (else first).
    """
    if not slot_ids:
        return
    uniq = []
    seen = set()
    for x in slot_ids:
        i = int(x)
        if i not in seen:
            seen.add(i)
            uniq.append(i)
    found = set(DeliverySlot.objects.filter(pk__in=uniq).values_list("id", flat=True))
    if len(found) != len(uniq):
        raise ValueError("invalid_slots")
    assignment.delivery_slots.set(uniq)
    prim = primary_slot_id
    if prim is None:
        prim = uniq[0]
    else:
        prim = int(prim)
        if prim not in uniq:
            raise ValueError("primary_not_in_slots")
    assignment.default_slot_id = prim
    assignment.save(update_fields=["default_slot"])


def _sync_slot_persons_from_single(assignment, person):
    """One delivery person for every slot on the assignment (legacy / single-person mode)."""
    assignment.slot_delivery_persons.all().delete()
    if not person:
        return
    for sid in assignment.delivery_slots.values_list("id", flat=True):
        DietPlanSlotDeliveryPerson.objects.create(
            plan_assignment=assignment,
            delivery_slot_id=sid,
            delivery_person=person,
        )


def _apply_slot_assignments_from_groups(assignment, groups, primary_slot_id):
    """
    groups: list of dicts with delivery_person_id and delivery_slot_ids (non-empty).
    Sets assignment.delivery_person to whoever covers primary_slot_id; M2M + per-slot junction rows.
    """
    if not groups or not isinstance(groups, (list, tuple)):
        raise ValueError("empty_groups")
    uniq = []
    seen = set()
    for g in groups:
        if not isinstance(g, dict):
            raise ValueError("bad_group")
        dp_id = g.get("delivery_person_id")
        raw = g.get("delivery_slot_ids")
        if dp_id is None or raw is None or not isinstance(raw, (list, tuple)) or len(raw) == 0:
            raise ValueError("empty_group")
        dp_id = int(dp_id)
        dp = UserRegister.objects.get(pk=dp_id)
        if getattr(dp, "role", None) != "supply_chain":
            raise ValueError("not_supply_chain")
        for x in raw:
            sid = int(x)
            if sid in seen:
                raise ValueError("duplicate_slot")
            seen.add(sid)
            uniq.append(sid)
    if not uniq:
        raise ValueError("no_slots")
    prim = primary_slot_id
    if prim is None or str(prim).strip() == "":
        prim = uniq[0]
    else:
        prim = int(prim)
    if prim not in seen:
        raise ValueError("primary_not_in_slots")
    primary_person = None
    for g in groups:
        dp_id = int(g["delivery_person_id"])
        sids = [int(x) for x in g["delivery_slot_ids"]]
        if prim in sids:
            primary_person = UserRegister.objects.get(pk=dp_id)
            break
    if primary_person is None:
        raise ValueError("primary_owner")
    assignment.delivery_person = primary_person
    assignment.save(update_fields=["delivery_person"])
    _apply_plan_delivery_slots(assignment, uniq, primary_slot_id=prim)
    assignment.slot_delivery_persons.all().delete()
    for g in groups:
        dp = UserRegister.objects.get(pk=int(g["delivery_person_id"]))
        for x in g["delivery_slot_ids"]:
            sid = int(x)
            DietPlanSlotDeliveryPerson.objects.create(
                plan_assignment=assignment,
                delivery_slot_id=sid,
                delivery_person=dp,
            )


class DietPlanDeliveryAssignmentViewSet(viewsets.ModelViewSet):
    queryset = DietPlanDeliveryAssignment.objects.select_related(
        "user_diet_plan",
        "user",
        "micro_kitchen",
        "delivery_person",
        "default_slot",
        "assigned_by",
    ).prefetch_related(
        "delivery_slots",
        Prefetch(
            "slot_delivery_persons",
            queryset=DietPlanSlotDeliveryPerson.objects.select_related("delivery_slot", "delivery_person"),
        ),
    ).all()
    serializer_class = DietPlanDeliveryAssignmentSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "head", "options"]

    def get_queryset(self):
        u = self.request.user
        role = getattr(u, "role", None)
        if role == "admin":
            return self.queryset.order_by("-assigned_on")
        if role == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=u).first()
            if not mk:
                return DietPlanDeliveryAssignment.objects.none()
            return self.queryset.filter(micro_kitchen=mk).order_by("-assigned_on")
        return DietPlanDeliveryAssignment.objects.none()

    def create(self, request, *args, **kwargs):
        """Create or replace global delivery assignment for a plan (micro kitchen or admin)."""
        role = getattr(request.user, "role", None)
        if role not in ("admin", "micro_kitchen"):
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)

        plan_id = request.data.get("user_diet_plan_id")
        dp_id = request.data.get("delivery_person_id")
        notes = request.data.get("notes")
        raw_slot_ids = request.data.get("delivery_slot_ids")
        legacy_slot_id = request.data.get("default_slot_id")
        primary_slot_id = request.data.get("primary_slot_id")
        slot_assignments = request.data.get("slot_assignments")

        def _slot_group_error_response(exc):
            code = str(exc)
            msg = {
                "empty_groups": "slot_assignments must be a non-empty list.",
                "bad_group": "Each slot_assignment must be an object with delivery_person_id and delivery_slot_ids.",
                "empty_group": "Each group needs a supply chain user and at least one delivery_slot_id.",
                "duplicate_slot": "Each delivery slot can only be assigned to one person.",
                "no_slots": "No delivery slots in slot_assignments.",
                "primary_not_in_slots": "primary_slot_id must be one of the assigned slots.",
                "primary_owner": "Could not resolve delivery person for primary slot.",
                "not_supply_chain": "Delivery person must be a supply chain user.",
            }.get(
                code,
                "Invalid slot_assignments.",
            )
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)

        # --- Multi-person per slot (different person per slot group) ---
        if slot_assignments is not None and isinstance(slot_assignments, (list, tuple)) and len(slot_assignments) > 0:
            if not plan_id:
                return Response(
                    {"detail": "user_diet_plan_id is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                plan = UserDietPlan.objects.select_related("user", "micro_kitchen").get(pk=int(plan_id))
            except (UserDietPlan.DoesNotExist, ValueError, TypeError):
                return Response({"detail": "Invalid user_diet_plan_id."}, status=status.HTTP_400_BAD_REQUEST)

            if role == "micro_kitchen":
                mk = MicroKitchenProfile.objects.filter(user=request.user).first()
                if not mk or plan.micro_kitchen_id != mk.id:
                    return Response(
                        {"detail": "This diet plan is not assigned to your kitchen."},
                        status=status.HTTP_403_FORBIDDEN,
                    )

            if plan.status != "active":
                return Response(
                    {"detail": "Plan must be active to attach a delivery assignment."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            obj, created = DietPlanDeliveryAssignment.objects.update_or_create(
                user_diet_plan=plan,
                defaults={
                    "user": plan.user,
                    "micro_kitchen": plan.micro_kitchen,
                    "assigned_by": request.user,
                    "is_active": True,
                    "notes": notes if notes is not None else None,
                },
            )
            try:
                _apply_slot_assignments_from_groups(obj, slot_assignments, primary_slot_id)
            except ValueError as e:
                if str(e) in (
                    "empty_groups",
                    "bad_group",
                    "empty_group",
                    "duplicate_slot",
                    "no_slots",
                    "primary_not_in_slots",
                    "primary_owner",
                    "not_supply_chain",
                ):
                    return _slot_group_error_response(e)
                if str(e) == "invalid_slots":
                    return Response({"detail": "Invalid delivery_slot_ids."}, status=status.HTTP_400_BAD_REQUEST)
                raise
            except UserRegister.DoesNotExist:
                return Response({"detail": "Invalid delivery_person_id in slot_assignments."}, status=status.HTTP_400_BAD_REQUEST)
            obj.refresh_from_db()
            serializer = self.get_serializer(obj)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        # --- Legacy: one delivery_person_id + delivery_slot_ids ---
        if not plan_id or not dp_id:
            return Response(
                {"detail": "user_diet_plan_id and delivery_person_id are required (or use slot_assignments)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if raw_slot_ids is not None:
            if not isinstance(raw_slot_ids, (list, tuple)) or len(raw_slot_ids) == 0:
                return Response(
                    {"detail": "delivery_slot_ids must be a non-empty list of slot ids."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            slot_ids = [int(x) for x in raw_slot_ids]
        elif legacy_slot_id is not None and str(legacy_slot_id).strip() != "":
            slot_ids = [int(legacy_slot_id)]
        else:
            return Response(
                {
                    "detail": "Provide slot_assignments, delivery_slot_ids (non-empty list), or default_slot_id (single slot).",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            plan = UserDietPlan.objects.select_related("user", "micro_kitchen").get(pk=int(plan_id))
        except (UserDietPlan.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Invalid user_diet_plan_id."}, status=status.HTTP_400_BAD_REQUEST)

        if role == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=request.user).first()
            if not mk or plan.micro_kitchen_id != mk.id:
                return Response(
                    {"detail": "This diet plan is not assigned to your kitchen."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        if plan.status != "active":
            return Response(
                {"detail": "Plan must be active to attach a delivery assignment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            delivery_person = UserRegister.objects.get(pk=int(dp_id))
        except (UserRegister.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Invalid delivery_person_id."}, status=status.HTTP_400_BAD_REQUEST)

        if getattr(delivery_person, "role", None) != "supply_chain":
            return Response(
                {"detail": "Delivery person must be a supply chain user."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        obj, created = DietPlanDeliveryAssignment.objects.update_or_create(
            user_diet_plan=plan,
            defaults={
                "user": plan.user,
                "micro_kitchen": plan.micro_kitchen,
                "delivery_person": delivery_person,
                "assigned_by": request.user,
                "is_active": True,
                "notes": notes if notes is not None else None,
            },
        )
        try:
            prim = int(primary_slot_id) if primary_slot_id is not None and str(primary_slot_id).strip() != "" else None
            _apply_plan_delivery_slots(obj, slot_ids, primary_slot_id=prim)
        except ValueError as e:
            if str(e) == "invalid_slots":
                return Response({"detail": "Invalid delivery_slot_ids."}, status=status.HTTP_400_BAD_REQUEST)
            if str(e) == "primary_not_in_slots":
                return Response(
                    {"detail": "primary_slot_id must be one of delivery_slot_ids."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            raise
        _sync_slot_persons_from_single(obj, delivery_person)
        obj.refresh_from_db()
        serializer = self.get_serializer(obj)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        dp_id = request.data.get("delivery_person_id")
        slot_id = request.data.get("default_slot_id")
        raw_slot_ids = request.data.get("delivery_slot_ids")
        primary_slot_id = request.data.get("primary_slot_id")
        slot_assignments = request.data.get("slot_assignments")

        def _patch_slot_group_err(exc):
            code = str(exc)
            msg = {
                "empty_groups": "slot_assignments must be a non-empty list.",
                "bad_group": "Each slot_assignment must be an object with delivery_person_id and delivery_slot_ids.",
                "empty_group": "Each group needs a supply chain user and at least one delivery_slot_id.",
                "duplicate_slot": "Each delivery slot can only be assigned to one person.",
                "no_slots": "No delivery slots in slot_assignments.",
                "primary_not_in_slots": "primary_slot_id must be one of the assigned slots.",
                "primary_owner": "Could not resolve delivery person for primary slot.",
                "not_supply_chain": "Delivery person must be a supply chain user.",
            }.get(code, "Invalid slot_assignments.")
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)

        if "notes" in request.data:
            instance.notes = request.data.get("notes") or None
            instance.save(update_fields=["notes"])

        had_slot_assignments = False
        if slot_assignments is not None and isinstance(slot_assignments, (list, tuple)) and len(slot_assignments) > 0:
            had_slot_assignments = True
            try:
                _apply_slot_assignments_from_groups(instance, slot_assignments, primary_slot_id)
            except ValueError as e:
                if str(e) in (
                    "empty_groups",
                    "bad_group",
                    "empty_group",
                    "duplicate_slot",
                    "no_slots",
                    "primary_not_in_slots",
                    "primary_owner",
                    "not_supply_chain",
                ):
                    return _patch_slot_group_err(e)
                if str(e) == "invalid_slots":
                    return Response({"detail": "Invalid delivery_slot_ids."}, status=status.HTTP_400_BAD_REQUEST)
                raise
            except UserRegister.DoesNotExist:
                return Response(
                    {"detail": "Invalid delivery_person_id in slot_assignments."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            instance.refresh_from_db()
        elif raw_slot_ids is not None:
            if not isinstance(raw_slot_ids, (list, tuple)) or len(raw_slot_ids) == 0:
                return Response(
                    {"detail": "delivery_slot_ids must be a non-empty list."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            slot_ids = [int(x) for x in raw_slot_ids]
            try:
                prim = (
                    int(primary_slot_id)
                    if primary_slot_id is not None and str(primary_slot_id).strip() != ""
                    else None
                )
                _apply_plan_delivery_slots(instance, slot_ids, primary_slot_id=prim)
            except ValueError as e:
                if str(e) == "invalid_slots":
                    return Response({"detail": "Invalid delivery_slot_ids."}, status=status.HTTP_400_BAD_REQUEST)
                if str(e) == "primary_not_in_slots":
                    return Response(
                        {"detail": "primary_slot_id must be one of delivery_slot_ids."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                raise
            instance.refresh_from_db()
            _sync_slot_persons_from_single(instance, instance.delivery_person)

        if dp_id is not None and str(dp_id).strip() != "" and not had_slot_assignments:
            try:
                new_dp = UserRegister.objects.get(pk=int(dp_id))
            except (UserRegister.DoesNotExist, ValueError, TypeError):
                return Response({"detail": "Invalid delivery_person_id."}, status=status.HTTP_400_BAD_REQUEST)
            if getattr(new_dp, "role", None) != "supply_chain":
                return Response(
                    {"detail": "Delivery person must be a supply chain user."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            reason = request.data.get("reason") or "reassigned"
            eff = _parse_iso_date(request.data.get("effective_from"))
            instance.change_delivery_person(
                new_dp,
                changed_by=request.user,
                effective_from=eff,
                reason=reason,
                notes=request.data.get("change_notes"),
            )
            instance.refresh_from_db()
            _sync_slot_persons_from_single(instance, instance.delivery_person)

        if raw_slot_ids is None and not had_slot_assignments and slot_id is not None and str(slot_id).strip() != "":
            try:
                slot = DeliverySlot.objects.get(pk=int(slot_id))
            except (DeliverySlot.DoesNotExist, ValueError, TypeError):
                return Response({"detail": "Invalid default_slot_id."}, status=status.HTTP_400_BAD_REQUEST)
            instance.default_slot = slot
            instance.save(update_fields=["default_slot"])
            if not instance.delivery_slots.filter(pk=slot.pk).exists():
                instance.delivery_slots.add(slot)
            instance.refresh_from_db()
            _sync_slot_persons_from_single(instance, instance.delivery_person)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class KitchenMealDeliveryViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = DeliveryAssignment.objects.select_related(
        "user_meal",
        "user_meal__user",
        "user_meal__meal_type",
        "user_meal__food",
        "user_meal__micro_kitchen",
        "delivery_person",
        "delivery_slot",
        "plan_delivery_assignment",
    ).all()
    serializer_class = KitchenMealDeliverySerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "head", "options", "patch", "post"]

    def get_queryset(self):
        from .utils.date_utils import get_period_range

        def _apply_date_filters(qs):
            meal_date = self.request.query_params.get("meal_date")
            if meal_date:
                return qs.filter(scheduled_date=meal_date)

            period = self.request.query_params.get("period")
            start_date = self.request.query_params.get("start_date")
            end_date = self.request.query_params.get("end_date")
            if period:
                try:
                    s, e = get_period_range(period, start_date, end_date)
                    return qs.filter(scheduled_date__range=[s, e])
                except ValueError:
                    return qs.none()

            month = self.request.query_params.get("month")
            year = self.request.query_params.get("year")
            if month and year:
                return qs.filter(scheduled_date__month=month, scheduled_date__year=year)
            return qs

        u = self.request.user
        role = getattr(u, "role", None)
        if role == "supply_chain":
            qs = self.queryset.filter(delivery_person=u, is_active=True)
            qs = _apply_date_filters(qs)
            return qs.order_by("-scheduled_date", "id")
        if role == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=u).first()
            if not mk:
                return DeliveryAssignment.objects.none()
            qs = self.queryset.filter(user_meal__micro_kitchen=mk, is_active=True)
            qs = _apply_date_filters(qs)
            return qs.order_by("-scheduled_date", "id")
        return DeliveryAssignment.objects.none()

    def partial_update(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) != "supply_chain":
            return Response(
                {"detail": "Only supply chain users can update delivery status."},
                status=status.HTTP_403_FORBIDDEN,
            )
        instance = self.get_object()
        if instance.delivery_person_id != request.user.id:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)

    @action(detail=True, methods=["post"], url_path="reassign")
    def reassign(self, request, pk=None):
        if getattr(request.user, "role", None) != "micro_kitchen":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        new_id = request.data.get("new_delivery_person_id")
        reason = request.data.get("reason") or "On leave"
        slot_id = request.data.get("delivery_slot_id")
        if not new_id:
            return Response(
                {"detail": "new_delivery_person_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        instance = self.get_object()
        try:
            new_person = UserRegister.objects.get(pk=int(new_id))
        except (UserRegister.DoesNotExist, ValueError, TypeError):
            return Response({"detail": "Invalid new_delivery_person_id."}, status=status.HTTP_400_BAD_REQUEST)
        if getattr(new_person, "role", None) != "supply_chain":
            return Response(
                {"detail": "Delivery person must be a supply chain user."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        delivery_slot = None
        if slot_id is not None and str(slot_id).strip() != "":
            try:
                delivery_slot = DeliverySlot.objects.get(pk=int(slot_id))
            except (DeliverySlot.DoesNotExist, ValueError, TypeError):
                return Response({"detail": "Invalid delivery_slot_id."}, status=status.HTTP_400_BAD_REQUEST)
        um = instance.user_meal
        DeliveryAssignment.reassign(um, new_person, reason=reason, delivery_slot=delivery_slot)
        new_da = DeliveryAssignment.objects.filter(user_meal=um, is_active=True).first()
        return Response(KitchenMealDeliverySerializer(new_da).data)


class SupplyChainDeliveryLeaveViewSet(viewsets.ModelViewSet):
    serializer_class = SupplyChainDeliveryLeaveSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_queryset(self):
        u = self.request.user
        role = getattr(u, "role", None)
        if role == "supply_chain":
            return SupplyChainDeliveryLeave.objects.filter(user=u).order_by("-start_date")
        if role == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=u).first()
            if not mk:
                return SupplyChainDeliveryLeave.objects.none()
            dp_ids = set(
                DeliveryAssignment.objects.filter(user_meal__micro_kitchen=mk)
                .values_list("delivery_person_id", flat=True)
                .distinct()
            )
            dp_ids |= set(
                DietPlanDeliveryAssignment.objects.filter(micro_kitchen=mk)
                .values_list("delivery_person_id", flat=True)
                .distinct()
            )
            dp_ids.discard(None)
            return (
                SupplyChainDeliveryLeave.objects.filter(user_id__in=dp_ids)
                .select_related("user")
                .order_by("-start_date")
            )
        return SupplyChainDeliveryLeave.objects.none()

    def perform_create(self, serializer):
        if getattr(self.request.user, "role", None) != "supply_chain":
            raise PermissionDenied("Only supply chain users can create leave entries.")
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        if getattr(self.request.user, "role", None) != "supply_chain":
            raise PermissionDenied()
        if serializer.instance.user_id != self.request.user.id:
            raise PermissionDenied()
        serializer.save()

    def perform_destroy(self, instance):
        if getattr(self.request.user, "role", None) != "supply_chain":
            raise PermissionDenied()
        if instance.user_id != self.request.user.id:
            raise PermissionDenied()
        instance.delete()


class PatientFoodRecommendationViewSet(viewsets.ModelViewSet):
    """Nutritionists suggest foods from the FoodName catalog to allotted patients; patients read their list."""

    serializer_class = PatientFoodRecommendationSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, "role", None)
        qs = PatientFoodRecommendation.objects.select_related(
            "patient", "food", "recommended_by"
        ).order_by("-recommended_on")
        if role == "patient":
            return qs.filter(patient=user)
        if role == "nutritionist":
            mapped = UserNutritionistMapping.objects.filter(
                nutritionist=user, is_active=True
            ).values_list("user_id", flat=True)
            qs = qs.filter(patient_id__in=mapped)
            pid = self.request.query_params.get("patient")
            if pid:
                try:
                    pid_int = int(pid)
                    if pid_int not in mapped:
                        return PatientFoodRecommendation.objects.none()
                    qs = qs.filter(patient_id=pid_int)
                except (TypeError, ValueError):
                    return PatientFoodRecommendation.objects.none()
            return qs
        if role == "admin":
            return qs
        return PatientFoodRecommendation.objects.none()

    def perform_create(self, serializer):
        if getattr(self.request.user, "role", None) != "nutritionist":
            raise PermissionDenied("Only nutritionists can create food recommendations.")
        patient = serializer.validated_data.get("patient")
        if not UserNutritionistMapping.objects.filter(
            nutritionist=self.request.user, user=patient, is_active=True
        ).exists():
            raise ValidationError({"patient": ["This patient is not in your allotted list."]})
        serializer.save(recommended_by=self.request.user)

    def perform_update(self, serializer):
        role = getattr(self.request.user, "role", None)
        if role == "patient":
            raise PermissionDenied()
        inst = serializer.instance
        if role == "admin":
            serializer.save()
            return
        if role == "nutritionist":
            if inst.recommended_by_id != self.request.user.id:
                raise PermissionDenied("You can only edit your own recommendations.")
            if not UserNutritionistMapping.objects.filter(
                nutritionist=self.request.user, user=inst.patient, is_active=True
            ).exists():
                raise PermissionDenied()
            if "patient" in serializer.validated_data:
                raise ValidationError({"patient": "Cannot change patient on update."})
            serializer.save()
            return
        raise PermissionDenied()

    def perform_destroy(self, instance):
        role = getattr(self.request.user, "role", None)
        if role == "patient":
            raise PermissionDenied()
        if role == "admin":
            instance.delete()
            return
        if role == "nutritionist":
            if instance.recommended_by_id != self.request.user.id:
                raise PermissionDenied("You can only delete your own recommendations.")
            instance.delete()
            return
        raise PermissionDenied()
