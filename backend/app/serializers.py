from decimal import Decimal
import math

from rest_framework import serializers
from .models import *
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import FoodGroup

class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})
    created_by = serializers.PrimaryKeyRelatedField(allow_null=True,queryset=UserRegister.objects.all(),required=False)   
    
    class Meta:
        model = UserRegister
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'password',
            'password_confirm',
            'created_by'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = UserRegister(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


class UserManagementSerializer(serializers.ModelSerializer):
    """
    Full CRUD serializer for UserRegister used by AdminSide/UserManagement.
    Supports optional password change via password + password_confirm.
    """
    password = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=False, allow_blank=True, style={'input_type': 'password'})
    city_name = serializers.SerializerMethodField(read_only=True)
    state_name = serializers.SerializerMethodField(read_only=True)
    country_name = serializers.SerializerMethodField(read_only=True)
    created_by_name = serializers.SerializerMethodField(read_only=True)
    created_by_role = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserRegister
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'mobile',
            'whatsapp',
            'dob',
            'gender',
            'photo',
            'address',
            'lat_lng_address',
            'city',
            'city_name',
            'zip_code',
            'state',
            'state_name',
            'country',
            'country_name',
            'latitude',
            'longitude',
            'joined_date',
            'is_active',
            'created_on',
            'created_by',
            'created_by_name',
            'created_by_role',
            'is_patient_mapped',
            'password',
            'password_confirm',
        ]
        read_only_fields = ['created_on', 'city_name', 'state_name', 'country_name', 'created_by_name', 'created_by_role']

    def get_city_name(self, obj):
        return obj.city.name if obj.city else None

    def get_state_name(self, obj):
        return obj.state.name if obj.state else None

    def get_country_name(self, obj):
        return obj.country.name if obj.country else None

    def get_created_by_name(self, obj):
        if obj.created_by:
            name = f"{obj.created_by.first_name or ''} {obj.created_by.last_name or ''}".strip()
            return name or obj.created_by.username
        return "System"

    def get_created_by_role(self, obj):
        return obj.created_by.role if obj.created_by else None

    def validate(self, attrs):
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        if password or password_confirm:
            if password != password_confirm:
                raise serializers.ValidationError({"password_confirm": "Passwords don't match"})
            if password and len(password) < 6:
                raise serializers.ValidationError({"password": "Password must be at least 6 characters"})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        user = UserRegister(**validated_data)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        user = authenticate(username=username, password=password)
        if not user:
            raise Exception("Invalid username or password.")

        refresh = RefreshToken.for_user(user)
        refresh['username'] = user.username    
        refresh['role'] = user.role
        refresh['user_id'] = user.id

        return {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }


class RefreshTokenSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    
    def validate(self, data):
        refresh = data.get("refresh")
        try:
            token = RefreshToken(refresh)
            # Get user from token
            user_id = token.payload.get('user_id')
            if not user_id:
                raise serializers.ValidationError("Invalid refresh token.")
            
            # Get user instance
            user = UserRegister.objects.get(id=user_id)
            
            # Create new refresh token with user data
            new_refresh = RefreshToken.for_user(user)
            new_refresh['username'] = user.username    
            new_refresh['role'] = user.role
            
            return {
                "access": str(new_refresh.access_token)
            }
        except Exception as e:
            raise serializers.ValidationError("Invalid refresh token.")




class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for self-profile updates.
    Allows users to update their personal details.
    """
    class Meta:
        model = UserRegister
        fields = [
            'id', 'username', 'email', 'role',
            'first_name', 'last_name', 'mobile', 'whatsapp',
            'dob', 'gender', 'photo', 'address', 'lat_lng_address', 'city',
            'zip_code', 'state', 'country', 'latitude', 'longitude',
            'joined_date', 'is_active', 'created_on'
        ]
        read_only_fields = ['id', 'username', 'email', 'role', 'joined_date', 'is_active', 'created_on']
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class UserUpdateSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=False)
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=False, write_only=True, allow_blank=False)
    confirm_password = serializers.CharField(required=False, write_only=True, allow_blank=False)

    def validate_username(self, value):
        user = self.context["request"].user
        if UserRegister.objects.filter(username=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        old_password = attrs.get("old_password")
        username = attrs.get("username")
        new_password = attrs.get("new_password")
        confirm_password = attrs.get("confirm_password")

        if not old_password:
            raise serializers.ValidationError({"old_password": "Old password is required."})
        if not user.check_password(old_password):
            raise serializers.ValidationError({"old_password": "Old password is incorrect."})

        if not username and not new_password:
            raise serializers.ValidationError(
                {"non_field_errors": "Provide username and/or new password to update."}
            )

        if new_password is not None:
            if not confirm_password:
                raise serializers.ValidationError(
                    {"confirm_password": "Confirm password is required when changing password."}
                )
            if new_password != confirm_password:
                raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        return attrs


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = "__all__"

    def validate_name(self, value):
        query = Country.objects.filter(name__iexact=value.strip())
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("A country with this name already exists.")
        return value


class StateSerializer(serializers.ModelSerializer):
    country_name = serializers.CharField(source='country.name', read_only=True)
    country_name_input = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = State
        fields = ['id', 'name', 'country', 'country_name', 'country_name_input']

    def create(self, validated_data):
        country_name = validated_data.pop('country_name_input', None)
        if country_name:
            # Look up or create the country by name
            country, _ = Country.objects.get_or_create(name=country_name.strip())
            validated_data['country'] = country
        return super().create(validated_data)

    def validate(self, data):
        name = data.get('name')
        country = data.get('country')
        country_name_input = data.get('country_name_input')

        # During creation or update, we need to handle the country object
        # It could be from the 'country' FK or the 'country_name_input'
        if not country and country_name_input:
            # If we're creating via import/input, check if that country will exist
            # Note: The actual get_or_create happens in create/update,
            # but we can check existence here for validation.
            country = Country.objects.filter(name__iexact=country_name_input.strip()).first()

        if name and country:
            query = State.objects.filter(name__iexact=name.strip(), country=country)
            if self.instance:
                query = query.exclude(id=self.instance.id)
            if query.exists():
                raise serializers.ValidationError({"name": "A state with this name already exists in this country."})
        return data

    def update(self, instance, validated_data):
        country_name = validated_data.pop('country_name_input', None)
        if country_name:
            country, _ = Country.objects.get_or_create(name=country_name.strip())
            validated_data['country'] = country
        return super().update(instance, validated_data)


class CitySerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source='state.name', read_only=True)
    country_name = serializers.CharField(source='state.country.name', read_only=True)
    state_name_input = serializers.CharField(write_only=True, required=False)
    country_name_input = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = City
        fields = ['id', 'name', 'state', 'state_name', 'country_name', 'state_name_input', 'country_name_input']

    def create(self, validated_data):
        state_name = validated_data.pop('state_name_input', None)
        country_name = validated_data.pop('country_name_input', None)
        
        if state_name:
            if country_name:
                # Look up/create country first
                country, _ = Country.objects.get_or_create(name=country_name.strip())
                # Look up/create state under this country
                state, _ = State.objects.get_or_create(name=state_name.strip(), country=country)
            else:
                # Look up/create state (without country context)
                state, _ = State.objects.get_or_create(name=state_name.strip())
            validated_data['state'] = state
        return super().create(validated_data)

    def validate(self, data):
        name = data.get('name')
        state = data.get('state')
        state_name_input = data.get('state_name_input')
        country_name_input = data.get('country_name_input')

        if not state and state_name_input:
            # If we have country info, use it to find the correct state
            if country_name_input:
                country = Country.objects.filter(name__iexact=country_name_input.strip()).first()
                if country:
                    state = State.objects.filter(name__iexact=state_name_input.strip(), country=country).first()
            
            # Fallback if country info didn't help or wasn't provided
            if not state:
                state = State.objects.filter(name__iexact=state_name_input.strip()).first()

        if name and state:
            query = City.objects.filter(name__iexact=name.strip(), state=state)
            if self.instance:
                query = query.exclude(id=self.instance.id)
            if query.exists():
                raise serializers.ValidationError({"name": "A city with this name already exists in this state."})
        return data

    def update(self, instance, validated_data):
        state_name = validated_data.pop('state_name_input', None)
        country_name = validated_data.pop('country_name_input', None)

        if state_name:
            if country_name:
                country, _ = Country.objects.get_or_create(name=country_name.strip())
                state, _ = State.objects.get_or_create(name=state_name.strip(), country=country)
            else:
                state, _ = State.objects.get_or_create(name=state_name.strip())
            validated_data['state'] = state
        return super().update(instance, validated_data)


# ── Food System Serializers ────────────────────────────────────────────────────

class MealTypeSerializer(serializers.ModelSerializer):
    posted_by_role = serializers.CharField(source='posted_by.role', read_only=True)
    posted_by_name = serializers.SerializerMethodField(read_only=True)

    def get_posted_by_name(self, obj):
        if obj.posted_by:
            return f"{obj.posted_by.first_name} {obj.posted_by.last_name}".strip() or obj.posted_by.username
        return None

    class Meta:
        model = MealType
        fields = ["id", "name", "posted_by_role", "posted_by_name"]

    def validate_name(self, value):
        query = MealType.objects.filter(name__iexact=value.strip())
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("A meal type with this name already exists.")
        return value


class MealTypePatientLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealType
        fields = ["id", "name"]


class PackagingMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = PackagingMaterial
        fields = "__all__"

    def validate_name(self, value):
        query = PackagingMaterial.objects.filter(name__iexact=value.strip())
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("A packaging material with this name already exists.")
        return value


class CuisineTypeSerializer(serializers.ModelSerializer):
    posted_by_role = serializers.CharField(source='posted_by.role', read_only=True)
    posted_by_name = serializers.SerializerMethodField(read_only=True)

    def get_posted_by_name(self, obj):
        if obj.posted_by:
            return f"{obj.posted_by.first_name} {obj.posted_by.last_name}".strip() or obj.posted_by.username
        return None

    class Meta:
        model = CuisineType
        fields = ["id", "name", "posted_by_role", "posted_by_name"]

    def validate_name(self, value):
        query = CuisineType.objects.filter(name__iexact=value.strip())
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("A cuisine type with this name already exists.")
        return value


class FoodNutritionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodNutrition
        fields = "__all__"


class FoodByIdNutritionSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(source="food.name", read_only=True)

    class Meta:
        model = FoodNutrition
        fields = [
            "id",
            "food",
            "food_name",
            "calories",
            "protein",
            "carbs",
            "fat",
            "fiber",
            "sugar",
            "saturated_fat",
            "trans_fat",
            "sodium",
            "potassium",
            "calcium",
            "iron",
            "vitamin_a",
            "vitamin_b1",
            "vitamin_b2",
            "vitamin_b3",
            "vitamin_b5",
            "vitamin_b6",
            "vitamin_b7",
            "vitamin_b9",
            "vitamin_b12",
            "vitamin_c",
            "vitamin_d",
            "vitamin_e",
            "vitamin_k",
            "cholesterol",
            "glycemic_index",
            "serving_size",
        ]


class IngredientSerializer(serializers.ModelSerializer):
    posted_by_role = serializers.CharField(source='posted_by.role', read_only=True)
    posted_by_name = serializers.SerializerMethodField(read_only=True)

    def get_posted_by_name(self, obj):
        if obj.posted_by:
            return f"{obj.posted_by.first_name} {obj.posted_by.last_name}".strip() or obj.posted_by.username
        return None

    class Meta:
        model = Ingredient
        fields = ["id", "name", "posted_by_role", "posted_by_name"]

    def validate_name(self, value):
        query = Ingredient.objects.filter(name__iexact=value.strip())
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("An ingredient with this name already exists.")
        return value


class UnitSerializer(serializers.ModelSerializer):
    posted_by_role = serializers.CharField(source='posted_by.role', read_only=True)
    posted_by_name = serializers.SerializerMethodField(read_only=True)

    def get_posted_by_name(self, obj):
        if obj.posted_by:
            return f"{obj.posted_by.first_name} {obj.posted_by.last_name}".strip() or obj.posted_by.username
        return None

    class Meta:
        model = Unit
        fields = ["id", "name", "posted_by_role", "posted_by_name"]

    def validate_name(self, value):
        query = Unit.objects.filter(name__iexact=value.strip())
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("A unit with this name already exists.")
        return value


class FoodIngredientSerializer(serializers.ModelSerializer):
    # Read-only nested display names
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    unit_name       = serializers.CharField(source='unit.name',       read_only=True)

    food_name_input = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    ingredient_name_input = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    unit_name_input = serializers.CharField(write_only=True, required=False)

    posted_by_role = serializers.CharField(source='posted_by.role', read_only=True)
    posted_by_name = serializers.SerializerMethodField(read_only=True)

    def get_posted_by_name(self, obj):
        if obj.posted_by:
            return f"{obj.posted_by.first_name} {obj.posted_by.last_name}".strip() or obj.posted_by.username
        return None

    class Meta:
        model = FoodIngredient
        fields = ['id', 'food', 'ingredient', 'ingredient_name',
                  'quantity', 'unit', 'unit_name', 'notes',
                  'food_name_input', 'ingredient_name_input', 'unit_name_input', 'posted_by_role', 'posted_by_name']
        validators = []  # Disable default unique_together validator to allow update_or_create

    def create(self, validated_data):
        food_name = validated_data.pop('food_name_input', None)
        ingredient_name = validated_data.pop('ingredient_name_input', None)
        unit_name = validated_data.pop('unit_name_input', None)

        if food_name:
            food, _ = Food.objects.get_or_create(name=food_name.strip())
            validated_data['food'] = food
        if ingredient_name:
            ingredient, _ = Ingredient.objects.get_or_create(name=ingredient_name.strip())
            validated_data['ingredient'] = ingredient
        if unit_name:
            unit, _ = Unit.objects.get_or_create(name=unit_name.strip())
            validated_data['unit'] = unit

        # Handle update_or_create for unique_together fields
        food = validated_data.get('food')
        ingredient = validated_data.get('ingredient')
        if food and ingredient:
            instance, created = FoodIngredient.objects.update_or_create(
                food=food,
                ingredient=ingredient,
                defaults=validated_data
            )
            return instance

        return super().create(validated_data)

    def update(self, instance, validated_data):
        food_name = validated_data.pop('food_name_input', None)
        ingredient_name = validated_data.pop('ingredient_name_input', None)
        unit_name = validated_data.pop('unit_name_input', None)

        if food_name:
            food, _ = Food.objects.get_or_create(name=food_name.strip())
            validated_data['food'] = food
        if ingredient_name:
            ingredient, _ = Ingredient.objects.get_or_create(name=ingredient_name.strip())
            validated_data['ingredient'] = ingredient
        if unit_name:
            unit, _ = Unit.objects.get_or_create(name=unit_name.strip())
            validated_data['unit'] = unit

        return super().update(instance, validated_data)


class FoodStepSerializer(serializers.ModelSerializer):
    food_name_input = serializers.CharField(write_only=True, required=False)

    posted_by_role = serializers.CharField(source='posted_by.role', read_only=True)
    posted_by_name = serializers.SerializerMethodField(read_only=True)

    def get_posted_by_name(self, obj):
        if obj.posted_by:
            return f"{obj.posted_by.first_name} {obj.posted_by.last_name}".strip() or obj.posted_by.username
        return None

    class Meta:
        model = FoodStep
        fields = ['id', 'food', 'step_number', 'instruction', 'posted_by_role', 'posted_by_name', 'food_name_input']
        validators = []  # Disable default unique_together validator to allow update_or_create

    def create(self, validated_data):
        food_name = validated_data.pop('food_name_input', None)
        if food_name:
            food, _ = Food.objects.get_or_create(name=food_name.strip())
            validated_data['food'] = food
            
        food = validated_data.get('food')
        step_number = validated_data.get('step_number')
        if food and step_number is not None:
            instance, created = FoodStep.objects.update_or_create(
                food=food,
                step_number=step_number,
                defaults=validated_data
            )
            return instance

        return super().create(validated_data)

    def update(self, instance, validated_data):
        food_name = validated_data.pop('food_name_input', None)
        if food_name:
            food, _ = Food.objects.get_or_create(name=food_name.strip())
            validated_data['food'] = food
        return super().update(instance, validated_data)


class MicroKitchenFoodSerializer(serializers.ModelSerializer):
    food_details = serializers.SerializerMethodField(read_only=True)
    micro_kitchen_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MicroKitchenFood
        fields = ['id', 'micro_kitchen', 'micro_kitchen_details', 'food', 'food_details', 'is_available', 'price', 'preparation_time']
        read_only_fields = ['micro_kitchen']

    def get_food_details(self, obj):
        if obj.food:
            return {
                'id': obj.food.id,
                'name': obj.food.name,
                'description': obj.food.description,
                'image': obj.food.image.url if obj.food.image else None,
                'meal_type_names': list(obj.food.meal_types.values_list('name', flat=True)) if hasattr(obj.food, 'meal_types') else [],
                'cuisine_type_names': list(obj.food.cuisine_types.values_list('name', flat=True)) if hasattr(obj.food, 'cuisine_types') else [],
            }
        return None

    def get_micro_kitchen_details(self, obj):
        if obj.micro_kitchen:
            return {
                'id': obj.micro_kitchen.id,
                'brand_name': obj.micro_kitchen.brand_name,
            }
        return None


class FoodSerializer(serializers.ModelSerializer):
    # Nested read — show full ingredient + step lists when retrieving a food
    ingredients = FoodIngredientSerializer(
        source='foodingredient_set', many=True, read_only=True
    )
    steps = FoodStepSerializer(
        source='foodstep_set', many=True, read_only=True
    )
    meal_type_names = serializers.StringRelatedField(source='meal_types', many=True, read_only=True)
    cuisine_type_names = serializers.StringRelatedField(source='cuisine_types', many=True, read_only=True)
    nutrition = FoodNutritionSerializer(read_only=True)

    meal_type_names_input = serializers.CharField(write_only=True, required=False)
    cuisine_type_names_input = serializers.CharField(write_only=True, required=False)

    # Nutrition fields for easy import
    calories = serializers.FloatField(write_only=True, required=False, allow_null=True)
    protein = serializers.FloatField(write_only=True, required=False, allow_null=True)
    carbs = serializers.FloatField(write_only=True, required=False, allow_null=True)
    fat = serializers.FloatField(write_only=True, required=False, allow_null=True)
    fiber = serializers.FloatField(write_only=True, required=False, allow_null=True)
    serving_size = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)

    glycemic_index = serializers.FloatField(write_only=True, required=False, allow_null=True)
    sugar = serializers.FloatField(write_only=True, required=False, allow_null=True)
    saturated_fat = serializers.FloatField(write_only=True, required=False, allow_null=True)
    trans_fat = serializers.FloatField(write_only=True, required=False, allow_null=True)
    cholesterol = serializers.FloatField(write_only=True, required=False, allow_null=True)
    sodium = serializers.FloatField(write_only=True, required=False, allow_null=True)
    potassium = serializers.FloatField(write_only=True, required=False, allow_null=True)
    calcium = serializers.FloatField(write_only=True, required=False, allow_null=True)
    iron = serializers.FloatField(write_only=True, required=False, allow_null=True)
    vitamin_a = serializers.FloatField(write_only=True, required=False, allow_null=True)
    vitamin_c = serializers.FloatField(write_only=True, required=False, allow_null=True)
    vitamin_d = serializers.FloatField(write_only=True, required=False, allow_null=True)
    vitamin_b12 = serializers.FloatField(write_only=True, required=False, allow_null=True)

    posted_by_role = serializers.CharField(source='posted_by.role', read_only=True)
    posted_by_name = serializers.SerializerMethodField(read_only=True)

    def get_posted_by_name(self, obj):
        if obj.posted_by:
            return f"{obj.posted_by.first_name} {obj.posted_by.last_name}".strip() or obj.posted_by.username
        return None

    class Meta:
        model = Food
        fields = ['id', 'name', 'meal_types', 'meal_type_names', 'cuisine_types', 'cuisine_type_names',
                  'description', 'image', 'ingredients', 'steps', 'nutrition',
                  'meal_type_names_input', 'cuisine_type_names_input',
                  'calories', 'protein', 'carbs', 'fat', 'fiber', 'serving_size',
                  'glycemic_index', 'sugar', 'saturated_fat', 'trans_fat', 'cholesterol',
                  'sodium', 'potassium', 'calcium', 'iron', 'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_b12', 'price', 
                  'posted_by_role', 'posted_by_name']

    def create(self, validated_data):
        meal_names = validated_data.pop('meal_type_names_input', None)
        cuisine_names = validated_data.pop('cuisine_type_names_input', None)
        
        # Pop nutrition data
        nutrition_data = {
            'calories': validated_data.pop('calories', None),
            'protein': validated_data.pop('protein', None),
            'carbs': validated_data.pop('carbs', None),
            'fat': validated_data.pop('fat', None),
            'fiber': validated_data.pop('fiber', None),
            'serving_size': validated_data.pop('serving_size', None),
            'glycemic_index': validated_data.pop('glycemic_index', None),
            'sugar': validated_data.pop('sugar', None),
            'saturated_fat': validated_data.pop('saturated_fat', None),
            'trans_fat': validated_data.pop('trans_fat', None),
            'cholesterol': validated_data.pop('cholesterol', None),
            'sodium': validated_data.pop('sodium', None),
            'potassium': validated_data.pop('potassium', None),
            'calcium': validated_data.pop('calcium', None),
            'iron': validated_data.pop('iron', None),
            'vitamin_a': validated_data.pop('vitamin_a', None),
            'vitamin_c': validated_data.pop('vitamin_c', None),
            'vitamin_d': validated_data.pop('vitamin_d', None),
            'vitamin_b12': validated_data.pop('vitamin_b12', None),
        }

        food = super().create(validated_data)

        # Create nutrition if data is provided
        if any(v is not None and v != "" for v in nutrition_data.values()):
            FoodNutrition.objects.update_or_create(food=food, defaults=nutrition_data)

        if meal_names:
            names = [n.strip() for n in str(meal_names).split(',') if n.strip()]
            for name in names:
                mt, _ = MealType.objects.get_or_create(name=name)
                food.meal_types.add(mt)
        if cuisine_names:
            names = [n.strip() for n in str(cuisine_names).split(',') if n.strip()]
            for name in names:
                ct, _ = CuisineType.objects.get_or_create(name=name)
                food.cuisine_types.add(ct)
        return food

    def update(self, instance, validated_data):
        meal_names = validated_data.pop('meal_type_names_input', None)
        cuisine_names = validated_data.pop('cuisine_type_names_input', None)
        
        # Pop nutrition data
        nutrition_data = {
            'calories': validated_data.pop('calories', None),
            'protein': validated_data.pop('protein', None),
            'carbs': validated_data.pop('carbs', None),
            'fat': validated_data.pop('fat', None),
            'fiber': validated_data.pop('fiber', None),
            'serving_size': validated_data.pop('serving_size', None),
            'glycemic_index': validated_data.pop('glycemic_index', None),
            'sugar': validated_data.pop('sugar', None),
            'saturated_fat': validated_data.pop('saturated_fat', None),
            'trans_fat': validated_data.pop('trans_fat', None),
            'cholesterol': validated_data.pop('cholesterol', None),
            'sodium': validated_data.pop('sodium', None),
            'potassium': validated_data.pop('potassium', None),
            'calcium': validated_data.pop('calcium', None),
            'iron': validated_data.pop('iron', None),
            'vitamin_a': validated_data.pop('vitamin_a', None),
            'vitamin_c': validated_data.pop('vitamin_c', None),
            'vitamin_d': validated_data.pop('vitamin_d', None),
            'vitamin_b12': validated_data.pop('vitamin_b12', None),
        }

        food = super().update(instance, validated_data)

        # Update nutrition if data is provided
        if any(v is not None and v != "" for v in nutrition_data.values()):
            FoodNutrition.objects.update_or_create(food=food, defaults=nutrition_data)

        if meal_names is not None:
            food.meal_types.clear()
            names = [n.strip() for n in str(meal_names).split(',') if n.strip()]
            for name in names:
                mt, _ = MealType.objects.get_or_create(name=name)
                food.meal_types.add(mt)
        
        if cuisine_names is not None:
            food.cuisine_types.clear()
            names = [n.strip() for n in str(cuisine_names).split(',') if n.strip()]
            for name in names:
                ct, _ = CuisineType.objects.get_or_create(name=name)
                food.cuisine_types.add(ct)
                
        return food

    def validate_name(self, value):
        query = Food.objects.filter(name__iexact=value.strip())
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("A food item with this name already exists.")
        return value


class SetDailyMealsFoodListSerializer(serializers.ModelSerializer):
    """Minimal food row for Set Daily Meals picker — id and name only (no nutrition, ingredients, steps)."""
    meal_type_details = MealTypePatientLiteSerializer(source='meal_types', many=True, read_only=True)

    class Meta:
        model = Food
        fields = ["id", "name", "meal_types", "meal_type_details"]


class NormalRangeForHealthParameterSerializer(serializers.ModelSerializer):
    health_parameter_name = serializers.CharField(source='health_parameter.name', read_only=True)
    health_parameter_name_input = serializers.CharField(write_only=True, required=False)
    health_parameter = serializers.PrimaryKeyRelatedField(queryset=HealthParameter.objects.all(), required=False)
    
    class Meta:
        model = NormalRangeForHealthParameter
        fields = "__all__"

    def create(self, validated_data):
        hp_name_input = validated_data.pop('health_parameter_name_input', None)
        if hp_name_input:
            hp, _ = HealthParameter.objects.get_or_create(name=hp_name_input.strip())
            validated_data['health_parameter'] = hp
        
        if not validated_data.get('health_parameter'):
             # If still no parameter, only then use fallback (or better, raise error)
             hp, _ = HealthParameter.objects.get_or_create(name='Unknown Parameter')
             validated_data['health_parameter'] = hp

        return super().create(validated_data)

    def update(self, instance, validated_data):
        hp_name = validated_data.pop('health_parameter_name_input', None)
        if hp_name:
            hp, _ = HealthParameter.objects.get_or_create(name=hp_name.strip())
            validated_data['health_parameter'] = hp
        return super().update(instance, validated_data)


class HealthParameterSerializer(serializers.ModelSerializer):
    normal_ranges = NormalRangeForHealthParameterSerializer(many=True, read_only=True)

    class Meta:
        model = HealthParameter
        fields = "__all__"


class DietPlanFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlanFeature
        fields = "__all__"


class DietPlanSerializer(serializers.ModelSerializer):
    features = DietPlanFeatureSerializer(many=True, read_only=True)
    final_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = DietPlans
        fields = "__all__"

    def validate(self, attrs):
        inst = self.instance

        def _get(key):
            if key in attrs and attrs[key] is not None:
                return attrs[key]
            if inst is not None:
                return getattr(inst, key, None)
            return None

        p = _get("platform_fee_percent")
        n = _get("nutritionist_share_percent")
        k = _get("kitchen_share_percent")
        if p is None and n is None and k is None:
            return attrs
        if p is None or n is None or k is None:
            raise serializers.ValidationError(
                "Provide all three split percentages (platform, nutritionist, kitchen), "
                "or leave all empty to use defaults (15% platform, 15% nutrition, 60% kitchen)."
            )
        total = Decimal(str(p)) + Decimal(str(n)) + Decimal(str(k))
        if total != Decimal("100"):
            raise serializers.ValidationError("Split percentages must sum to 100.")
        return attrs


class PayoutTrackerSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    plan_title = serializers.SerializerMethodField()
    snapshot_total = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True, source="snapshot.total_amount"
    )
    remaining_amount = serializers.SerializerMethodField()

    class Meta:
        model = PayoutTracker
        fields = (
            "id",
            "snapshot",
            "snapshot_total",
            "payout_type",
            "nutritionist",
            "micro_kitchen",
            "total_amount",
            "paid_amount",
            "remaining_amount",
            "period_from",
            "period_to",
            "status",
            "is_closed",
            "closed_reason",
            "closed_on",
            "created_at",
            "patient_name",
            "plan_title",
        )
        read_only_fields = fields

    def get_remaining_amount(self, obj):
        return obj.remaining_amount

    def get_patient_name(self, obj):
        u = getattr(obj.snapshot.user_diet_plan, "user", None)
        if not u:
            return None
        name = f"{u.first_name or ''} {u.last_name or ''}".strip()
        return name or u.username

    def get_plan_title(self, obj):
        dp = getattr(obj.snapshot.user_diet_plan, "diet_plan", None)
        return dp.title if dp else None


class AdminPayoutTrackerForPayoutSerializer(serializers.ModelSerializer):
    """Admin: nutritionist/kitchen trackers that can receive logged transfers."""

    patient_name = serializers.SerializerMethodField()
    plan_title = serializers.SerializerMethodField()
    recipient_label = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    shared_percentage = serializers.SerializerMethodField()

    class Meta:
        model = PayoutTracker
        fields = (
            "id",
            "payout_type",
            "recipient_label",
            "patient_name",
            "plan_title",
            "period_from",
            "period_to",
            "total_amount",
            "paid_amount",
            "remaining_amount",
            "shared_percentage",
            "status",
        )
        read_only_fields = fields

    def get_recipient_label(self, obj):
        if obj.payout_type == PayoutTracker.PAYOUT_TYPE_NUTRITIONIST and obj.nutritionist:
            u = obj.nutritionist
            name = f"{u.first_name or ''} {u.last_name or ''}".strip()
            return name or u.username
        if obj.payout_type == PayoutTracker.PAYOUT_TYPE_KITCHEN and obj.micro_kitchen:
            return obj.micro_kitchen.brand_name or f"Kitchen #{obj.micro_kitchen_id}"
        return "—"

    def get_patient_name(self, obj):
        u = getattr(obj.snapshot.user_diet_plan, "user", None)
        if not u:
            return None
        name = f"{u.first_name or ''} {u.last_name or ''}".strip()
        return name or u.username

    def get_plan_title(self, obj):
        dp = getattr(obj.snapshot.user_diet_plan, "diet_plan", None)
        return dp.title if dp else None

    def get_shared_percentage(self, obj):
        if not obj.snapshot:
            return "0.00"
        if obj.payout_type == PayoutTracker.PAYOUT_TYPE_NUTRITIONIST:
            return str(obj.snapshot.nutrition_percent)
        if obj.payout_type == PayoutTracker.PAYOUT_TYPE_KITCHEN:
            return str(obj.snapshot.kitchen_percent)
        return "0.00"

    def get_remaining_amount(self, obj):
        return str(obj.remaining_amount)




class AdminPayoutPatientTrackersSerializer(serializers.ModelSerializer):
    """Groups open PayoutTracker records under their respective patient (UserRegister)."""

    patient_name = serializers.SerializerMethodField()
    trackers = serializers.SerializerMethodField()

    class Meta:
        model = UserRegister
        fields = ("id", "patient_name", "trackers")

    def get_patient_name(self, obj):
        name = f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return name or obj.username

    def get_trackers(self, obj):
        from .models import PayoutTracker, MicroKitchenProfile
        from django.db.models import F

        request = self.context.get("request")
        user = request.user if request else None

        qs = PayoutTracker.objects.filter(snapshot__user_diet_plan__user=obj)

        # If not admin, restrict to user's trackers
        if user and not (user.is_staff or getattr(user, "role", "") == "admin"):
            if user.role == "nutritionist":
                qs = qs.filter(payout_type=PayoutTracker.PAYOUT_TYPE_NUTRITIONIST, nutritionist=user)
            elif user.role == "micro_kitchen":
                mk = MicroKitchenProfile.objects.filter(user=user).first()
                if mk:
                    qs = qs.filter(payout_type=PayoutTracker.PAYOUT_TYPE_KITCHEN, micro_kitchen=mk)
                else:
                    return [] # Or restricted
            else:
                return []

        qs = (
            qs.filter(is_closed=False)
            .filter(total_amount__gt=F("paid_amount"))
            .select_related(
                "nutritionist",
                "micro_kitchen",
                "snapshot__user_diet_plan__diet_plan",
            )
            .order_by("payout_type")
        )
        return AdminPayoutTrackerForPayoutSerializer(qs, many=True, context=self.context).data


class AdminPayoutPatientSummarySerializer(serializers.ModelSerializer):
    """Lightweight patient rows for payout list screens (no nested trackers)."""

    patient_name = serializers.SerializerMethodField()
    plan_title = serializers.SerializerMethodField()
    payable_lines = serializers.SerializerMethodField()
    total_remaining = serializers.SerializerMethodField()
    plan_total_amount = serializers.SerializerMethodField()

    class Meta:
        model = UserRegister
        fields = ("id", "patient_name", "plan_title", "payable_lines", "total_remaining", "plan_total_amount")

    def get_patient_name(self, obj):
        name = f"{obj.first_name or ''} {obj.last_name or ''}".strip()
        return name or obj.username

    def _open_tracker_qs(self, obj):
        from django.db.models import F

        return (
            PayoutTracker.objects.filter(
                snapshot__user_diet_plan__user=obj,
                payout_type__in=(
                    PayoutTracker.PAYOUT_TYPE_NUTRITIONIST,
                    PayoutTracker.PAYOUT_TYPE_KITCHEN,
                ),
                is_closed=False,
            )
            .filter(total_amount__gt=F("paid_amount"))
            .select_related("snapshot__user_diet_plan__diet_plan")
        )

    def _all_open_tracker_qs(self, obj):
        from django.db.models import F

        return (
            PayoutTracker.objects.filter(snapshot__user_diet_plan__user=obj, is_closed=False)
            .filter(total_amount__gt=F("paid_amount"))
            .select_related("snapshot__user_diet_plan__diet_plan")
        )

    def get_plan_title(self, obj):
        tracker = self._open_tracker_qs(obj).order_by("id").first()
        if not tracker or not tracker.snapshot or not tracker.snapshot.user_diet_plan:
            return None
        dp = tracker.snapshot.user_diet_plan.diet_plan
        return dp.title if dp else None

    def get_payable_lines(self, obj):
        return self._open_tracker_qs(obj).count()

    def get_total_remaining(self, obj):
        total = Decimal("0.00")
        for tracker in self._open_tracker_qs(obj):
            total += tracker.remaining_amount
        return str(total)

    def get_plan_total_amount(self, obj):
        total = Decimal("0.00")
        for tracker in self._all_open_tracker_qs(obj):
            total += tracker.total_amount
        return str(total)


class PayoutTransactionReadSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    plan_title = serializers.SerializerMethodField()
    recipient_label = serializers.SerializerMethodField()
    payout_type = serializers.CharField(source="tracker.payout_type", read_only=True)
    paid_by_display = serializers.SerializerMethodField()
    payment_screenshot_url = serializers.SerializerMethodField()

    class Meta:
        model = PayoutTransaction
        fields = (
            "id",
            "tracker",
            "payout_type",
            "recipient_label",
            "patient_name",
            "plan_title",
            "amount_paid",
            "payout_date",
            "payment_method",
            "transaction_reference",
            "note",
            "paid_on",
            "paid_by_display",
            "payment_screenshot_url",
        )
        read_only_fields = fields

    def get_payment_screenshot_url(self, obj):
        if obj.payment_screenshot:
            request = self.context.get("request")
            url = obj.payment_screenshot.url
            if request:
                return request.build_absolute_uri(url)
            return url
        return None

    def get_paid_by_display(self, obj):
        if not obj.paid_by:
            return None
        u = obj.paid_by
        name = f"{u.first_name or ''} {u.last_name or ''}".strip()
        return name or u.username

    def get_recipient_label(self, obj):
        t = obj.tracker
        if t.payout_type == PayoutTracker.PAYOUT_TYPE_NUTRITIONIST and t.nutritionist:
            u = t.nutritionist
            name = f"{u.first_name or ''} {u.last_name or ''}".strip()
            return name or u.username
        if t.payout_type == PayoutTracker.PAYOUT_TYPE_KITCHEN and t.micro_kitchen:
            return t.micro_kitchen.brand_name or f"Kitchen #{t.micro_kitchen_id}"
        return "—"

    def get_patient_name(self, obj):
        u = getattr(obj.tracker.snapshot.user_diet_plan, "user", None)
        if not u:
            return None
        name = f"{u.first_name or ''} {u.last_name or ''}".strip()
        return name or u.username

    def get_plan_title(self, obj):
        dp = getattr(obj.tracker.snapshot.user_diet_plan, "diet_plan", None)
        return dp.title if dp else None


class PayoutTransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayoutTransaction
        fields = (
            "tracker",
            "amount_paid",
            "payout_date",
            "payment_method",
            "transaction_reference",
            "note",
            "payment_screenshot",
        )

    def validate_tracker(self, tracker):
        if tracker.is_closed:
            raise serializers.ValidationError(
                "This payout tracker is closed; you cannot record a transfer against it."
            )
        if tracker.payout_type not in (
            PayoutTracker.PAYOUT_TYPE_NUTRITIONIST,
            PayoutTracker.PAYOUT_TYPE_KITCHEN,
        ):
            raise serializers.ValidationError(
                "Only nutritionist or kitchen diet-plan payout trackers can be paid from this screen."
            )
        return tracker

    def validate(self, attrs):
        tracker = attrs["tracker"]
        amt = attrs["amount_paid"]
        if amt <= 0:
            raise serializers.ValidationError({"amount_paid": "Amount must be greater than zero."})
        remaining = tracker.remaining_amount
        if amt > remaining + Decimal("0.05"):
            raise serializers.ValidationError(
                {
                    "amount_paid": (
                        f"Amount cannot exceed remaining balance for this tracker (₹{remaining})."
                    )
                }
            )
        return attrs


class AdminPlanPaymentOverviewSerializer(serializers.ModelSerializer):
    """Admin list: frozen snapshot + patient/plan context + total disbursed on linked payout trackers."""

    patient = serializers.SerializerMethodField()
    diet_plan = serializers.SerializerMethodField()
    nutritionist = serializers.SerializerMethodField()
    micro_kitchen = serializers.SerializerMethodField()
    verified_by_name = serializers.SerializerMethodField()
    payout_trackers = serializers.SerializerMethodField()
    total_outstanding = serializers.SerializerMethodField()
    user_diet_plan_status = serializers.CharField(source="user_diet_plan.status", read_only=True)
    payment_status = serializers.CharField(source="user_diet_plan.payment_status", read_only=True)
    is_payment_verified = serializers.BooleanField(
        source="user_diet_plan.is_payment_verified", read_only=True
    )
    amount_paid_reported = serializers.DecimalField(
        source="user_diet_plan.amount_paid",
        max_digits=12,
        decimal_places=2,
        read_only=True,
        allow_null=True,
    )
    transaction_id = serializers.CharField(
        source="user_diet_plan.transaction_id", read_only=True, allow_null=True
    )
    verified_on = serializers.DateTimeField(
        source="user_diet_plan.verified_on", read_only=True, allow_null=True
    )
    plan_start_date = serializers.DateField(
        source="user_diet_plan.start_date", read_only=True, allow_null=True
    )
    plan_end_date = serializers.DateField(
        source="user_diet_plan.end_date", read_only=True, allow_null=True
    )
    total_disbursed = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = PlanPaymentSnapshot
        fields = (
            "id",
            "user_diet_plan",
            "created_at",
            "total_amount",
            "platform_percent",
            "nutrition_percent",
            "kitchen_percent",
            "platform_amount",
            "nutrition_amount",
            "kitchen_amount",
            "patient",
            "diet_plan",
            "nutritionist",
            "micro_kitchen",
            "user_diet_plan_status",
            "payment_status",
            "amount_paid_reported",
            "transaction_id",
            "verified_on",
            "verified_by_name",
            "plan_start_date",
            "plan_end_date",
            "total_disbursed",
            "total_outstanding",
            "payout_trackers",
            "is_payment_verified",
        )
        read_only_fields = fields


class AdminPlanPaymentOverviewLiteSerializer(AdminPlanPaymentOverviewSerializer):
    """Lite version for list views (excludes detailed payout_trackers)."""

    class Meta:
        model = PlanPaymentSnapshot
        fields = (
            "id",
            "user_diet_plan",
            "created_at",
            "total_amount",
            "platform_percent",
            "nutrition_percent",
            "kitchen_percent",
            "platform_amount",
            "nutrition_amount",
            "kitchen_amount",
            "patient",
            "diet_plan",
            "nutritionist",
            "micro_kitchen",
            "user_diet_plan_status",
            "payment_status",
            "amount_paid_reported",
            "transaction_id",
            "verified_on",
            "verified_by_name",
            "plan_start_date",
            "plan_end_date",
            "total_disbursed",
            "total_outstanding",
            "is_payment_verified",
        )
        read_only_fields = fields

    def get_payout_trackers(self, obj):
        rows = []
        for t in obj.payouts.all().order_by("payout_type", "id"):
            if t.payout_type == PayoutTracker.PAYOUT_TYPE_PLATFORM:
                continue

            rem = max(t.total_amount - t.paid_amount, Decimal("0"))
            recipient = "—"
            if t.payout_type == PayoutTracker.PAYOUT_TYPE_NUTRITIONIST and t.nutritionist:
                u = t.nutritionist
                recipient = f"{u.first_name or ''} {u.last_name or ''}".strip() or u.username
            elif t.payout_type == PayoutTracker.PAYOUT_TYPE_KITCHEN and t.micro_kitchen:
                recipient = t.micro_kitchen.brand_name or f"Kitchen #{t.micro_kitchen_id}"

            rows.append(
                {
                    "id": t.id,
                    "payout_type": t.payout_type,
                    "recipient_label": recipient,
                    "period_from": t.period_from,
                    "period_to": t.period_to,
                    "total_amount": str(t.total_amount),
                    "paid_amount": str(t.paid_amount),
                    "remaining_amount": str(rem),
                    "status": t.status,
                    "is_closed": t.is_closed,
                    "closed_reason": t.closed_reason,
                }
            )
        return rows

    def get_total_outstanding(self, obj):
        total = Decimal("0")
        for t in obj.payouts.all():
            if t.payout_type == PayoutTracker.PAYOUT_TYPE_PLATFORM:
                continue
            total += max(t.total_amount - t.paid_amount, Decimal("0"))
        return str(total)

    def get_patient(self, obj):
        u = getattr(obj.user_diet_plan, "user", None)
        if not u:
            return None
        name = f"{u.first_name or ''} {u.last_name or ''}".strip()
        return {
            "id": u.id,
            "name": name or u.username,
            "email": u.email,
        }

    def get_diet_plan(self, obj):
        dp = getattr(obj.user_diet_plan, "diet_plan", None)
        if not dp:
            return None
        return {
            "id": dp.id,
            "title": dp.title,
            "code": dp.code,
            "no_of_days": dp.no_of_days,
        }

    def get_nutritionist(self, obj):
        n = getattr(obj.user_diet_plan, "nutritionist", None)
        if not n:
            return None
        name = f"{n.first_name or ''} {n.last_name or ''}".strip()
        return {"id": n.id, "name": name or n.username}

    def get_micro_kitchen(self, obj):
        mk = getattr(obj.user_diet_plan, "micro_kitchen", None)
        if not mk:
            return None
        return {"id": mk.id, "brand_name": mk.brand_name}

    def get_verified_by_name(self, obj):
        vb = getattr(obj.user_diet_plan, "verified_by", None)
        if not vb:
            return None
        name = f"{vb.first_name or ''} {vb.last_name or ''}".strip()
        return name or vb.username


# ── Role Questionnaires / Profiles ─────────────────────────────────────────────

class HealthConditionMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = HealthConditionMaster
        fields = ["id", "name", "category", "sort_order"]


class UserHealthConditionSerializer(serializers.ModelSerializer):
    condition = HealthConditionMasterSerializer(read_only=True)

    class Meta:
        model = UserHealthCondition
        fields = ["id", "condition", "has_condition", "since_when", "comments"]


class UserQuestionnaireSerializer(serializers.ModelSerializer):
    meal_slots = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    health_conditions = serializers.SerializerMethodField()
    symptoms = serializers.SerializerMethodField()
    deficiencies = serializers.SerializerMethodField()
    autoimmune_diseases = serializers.SerializerMethodField()
    digestive_issues = serializers.SerializerMethodField()
    skin_issues = serializers.SerializerMethodField()
    habits = serializers.SerializerMethodField()
    physical_activities = serializers.SerializerMethodField()

    class Meta:
        model = UserQuestionnaire
        fields = [
            "id",
            "user",
            "age",
            "height_cm",
            "weight_kg",
            "work_type",
            "meals_per_day",
            "meal_slots",
            "skips_meals",
            "snacks_between_meals",
            "food_source",
            "diet_pattern",
            "non_veg_frequency",
            "consumes_egg",
            "consumes_dairy",
            "food_allergy",
            "food_allergy_details",
            "fruits_per_day",
            "vegetables_per_day",
            "surgery_history",
            "surgery_details",
            "medicine_allergy",
            "medicine_allergy_details",
            "dietitian_consultation_before",
            "dietitian_consultation_name",
            "dietitian_consultation_specialty",
            "dietitian_consultation_phone",
            "dietitian_consultation_location",
            "dietitian_consultation_notes",
            "consulted_doctor",
            "consultant_doctor_name",
            "consultant_doctor_specialty",
            "consultant_doctor_phone",
            "other_health_concerns",
            "menstrual_pattern",
            "on_medication",
            "specify_medication",
            "sleep_quality",
            "stress_level",
            "falls_sick_frequency",
            "food_preferences",
            "additional_notes",
            "any_other_comments",
            "any_notes_for_care_team",
            "created_on",
            "updated_on",
            "health_conditions",
            "symptoms",
            "deficiencies",
            "autoimmune_diseases",
            "digestive_issues",
            "skin_issues",
            "habits",
            "physical_activities",
        ]
        read_only_fields = ("created_on", "updated_on")

    def _merged(self, attrs):
        out = {}
        if self.instance:
            for f in self.instance._meta.fields:
                fn = f.name
                if fn in ("id", "pk"):
                    continue
                out[fn] = getattr(self.instance, fn)
        out.update(attrs)
        return out

    def validate(self, attrs):
        from .questionnaire_constants import MEAL_SLOT_KEYS, normalize_comma_keys

        merged = self._merged(attrs)
        request = self.context.get("request")
        user = getattr(request, "user", None) if request else None

        if not user or getattr(user, "gender", None) != "female":
            attrs["menstrual_pattern"] = None
        elif "menstrual_pattern" in attrs and attrs["menstrual_pattern"] == "":
            attrs["menstrual_pattern"] = None

        diet = merged.get("diet_pattern")
        if diet not in ("non_veg", "eggetarian"):
            attrs["non_veg_frequency"] = None

        if merged.get("surgery_history") is False:
            attrs["surgery_details"] = None

        if merged.get("medicine_allergy") is False:
            attrs["medicine_allergy_details"] = None

        if merged.get("consulted_doctor_before") is False:
            attrs["consulted_doctor_name"] = None
            attrs["consulted_doctor_specialty"] = None
            attrs["consulted_doctor_phone"] = None
            attrs["consulted_doctor_location"] = None
            attrs["consulted_doctor_notes"] = None

        if merged.get("on_medication") is False:
            attrs["specify_medication"] = None

        if "meal_slots" in attrs:
            raw = attrs["meal_slots"]
            if raw is None or raw == "":
                attrs["meal_slots"] = None
            elif isinstance(raw, str):
                attrs["meal_slots"] = normalize_comma_keys(raw, MEAL_SLOT_KEYS) or None
            elif isinstance(raw, (list, tuple)):
                norm = [str(x).strip() for x in raw if str(x).strip() in MEAL_SLOT_KEYS]
                attrs["meal_slots"] = norm if norm else None

        return attrs

    def _user(self, obj):
        return obj.user

    def get_health_conditions(self, obj):
        u = self._user(obj)
        if not u:
            return []
        rows = UserHealthCondition.objects.filter(user=u).select_related("condition")
        return [
            {
                "id": r.id,
                "condition_id": r.condition_id,
                "name": r.condition.name,
                "category": r.condition.category,
                "has_condition": r.has_condition,
                "since_when": r.since_when,
                "comments": r.comments,
            }
            for r in rows
        ]

    def get_symptoms(self, obj):
        u = self._user(obj)
        if not u:
            return []
        return [
            {"id": r.symptom_id, "name": r.symptom.name}
            for r in UserSymptom.objects.filter(user=u).select_related("symptom")
            if r.symptom_id
        ]

    def get_deficiencies(self, obj):
        u = self._user(obj)
        if not u:
            return []
        return [
            {"id": r.deficiency_id, "name": r.deficiency.name}
            for r in UserDeficiency.objects.filter(user=u).select_related("deficiency")
            if r.deficiency_id
        ]

    def get_autoimmune_diseases(self, obj):
        u = self._user(obj)
        if not u:
            return []
        return [
            {"id": r.disease_id, "name": r.disease.name}
            for r in UserAutoimmune.objects.filter(user=u).select_related("disease")
            if r.disease_id
        ]

    def get_digestive_issues(self, obj):
        u = self._user(obj)
        if not u:
            return []
        return [
            {"id": r.issue_id, "name": r.issue.name}
            for r in UserDigestiveIssue.objects.filter(user=u).select_related("issue")
            if r.issue_id
        ]

    def get_skin_issues(self, obj):
        u = self._user(obj)
        if not u:
            return []
        return [
            {"id": r.skin_issue_id, "name": r.skin_issue.name}
            for r in UserSkinIssue.objects.filter(user=u).select_related("skin_issue")
            if r.skin_issue_id
        ]

    def get_habits(self, obj):
        u = self._user(obj)
        if not u:
            return []
        return [
            {
                "id": r.habit_id,
                "name": r.habit.name,
                "frequency": r.frequency,
                "since_when": r.since_when,
                "comments": r.comments,
                "other_text": r.other_text,
            }
            for r in UserHabit.objects.filter(user=u).select_related("habit")
            if r.habit_id
        ]

    def get_physical_activities(self, obj):
        u = self._user(obj)
        if not u:
            return []
        return [
            {
                "id": r.activity_id,
                "name": r.activity.name,
                "frequency": r.frequency,
                "duration_minutes": r.duration_minutes,
                "other_text": r.other_text,
            }
            for r in UserPhysicalActivity.objects.filter(user=u).select_related("activity")
            if r.activity_id
        ]


class SymptomMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = SymptomMaster
        fields = ["id", "name", "sort_order"]


class AutoimmuneMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutoimmuneMaster
        fields = ["id", "name", "sort_order"]


class DeficiencyMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeficiencyMaster
        fields = ["id", "name", "sort_order"]


class DigestiveIssueMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = DigestiveIssueMaster
        fields = ["id", "name", "sort_order"]


class SkinIssueMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = SkinIssueMaster
        fields = ["id", "name", "sort_order"]


class HabitMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = HabitMaster
        fields = ["id", "name", "sort_order"]


class ActivityMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityMaster
        fields = ["id", "name", "sort_order"]


class NutritionistProfileSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    allotted_patients = serializers.SerializerMethodField()

    class Meta:
        model = NutritionistProfile
        fields = "__all__"

    def get_user_details(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "username": obj.user.username,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
                "email": obj.user.email,
                "mobile": obj.user.mobile,
                "photo": obj.user.photo.url if obj.user.photo else None,
            }
        return None

    def get_allotted_patients(self, obj):
        if obj.user:
            from .models import UserNutritionistMapping
            mappings = UserNutritionistMapping.objects.filter(nutritionist=obj.user, is_active=True)
            return [
                {
                    "id": m.user.id,
                    "username": m.user.username,
                    "first_name": m.user.first_name,
                    "last_name": m.user.last_name,
                    "email": m.user.email,
                }
                for m in mappings
            ]
        return []


class MicroKitchenProfileSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    latest_inspection = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField(read_only=True)
    longitude = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MicroKitchenProfile
        fields = [
            'id', 'user', 'brand_name', 'kitchen_code', 'fssai_no', 'fssai_cert',
            'pan_no', 'gst_no', 'bank_name', 'acc_no', 'ifsc_code', 'kitchen_area',
            'platform_area', 'water_source', 'cuisine_type', 'meal_type',
            'lpg_cylinders', 'no_of_staff',
            'time_available', 'purification_type', 'has_pets', 'pet_details',
            'has_pests', 'pest_details', 'pest_control_frequency', 'has_hobs',
            'has_refrigerator', 'has_mixer', 'has_grinder', 'has_blender',
            'other_equipment', 'about_you', 'passion_for_cooking', 'health_info',
            'constraints', 'photo_exterior', 'photo_entrance', 'photo_kitchen',
            'photo_platform', 'latitude', 'longitude',
            'status', 'rating', 'total_reviews',
            'user_details', 'latest_inspection'
        ]

    def get_latitude(self, obj):
        return obj.user.latitude if obj.user else None

    def get_longitude(self, obj):
        return obj.user.longitude if obj.user else None

    def get_user_details(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "username": obj.user.username,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
                "email": obj.user.email,
                "mobile": obj.user.mobile,
                "address": obj.user.address,
                "city": obj.user.city.name if obj.user.city else None,
                "state": obj.user.state.name if obj.user.state else None,
                "country": obj.user.country.name if obj.user.country else None,
            }
        return None

    def get_latest_inspection(self, obj):
        inspection = obj.inspections.filter(status__in=["approved", "submitted"]).order_by("-inspection_date").first()
        if inspection:
            return {
                "overall_score": inspection.overall_score,
                "status": inspection.status,
                "inspection_date": inspection.inspection_date,
                "notes": inspection.notes,
                "recommendation": inspection.recommendation
            }
        return None


class MicroKitchenProfileListSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    latest_inspection = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField(read_only=True)
    longitude = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MicroKitchenProfile
        fields = [
            'id', 'user', 'brand_name', 'kitchen_code',
            'status', 'no_of_staff', 'lpg_cylinders',
            'cuisine_type', 'meal_type', 'photo_exterior',
            'time_available', 'latitude', 'longitude',
            'user_details', 'latest_inspection'
        ]

    def get_latitude(self, obj):
        return obj.user.latitude if obj.user else None

    def get_longitude(self, obj):
        return obj.user.longitude if obj.user else None

    def get_latest_inspection(self, obj):
        inspection = obj.inspections.filter(status__in=["approved", "submitted"]).order_by("-inspection_date").first()
        if inspection:
            return {
                "overall_score": inspection.overall_score,
                "status": inspection.status,
                "inspection_date": inspection.inspection_date,
                "notes": inspection.notes,
                "recommendation": inspection.recommendation
            }
        return None

    def get_user_details(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
                "email": obj.user.email,
                "address": obj.user.address,
                "city": obj.user.city.name if obj.user.city else None,
                "state": obj.user.state.name if obj.user.state else None,
                "country": obj.user.country.name if obj.user.country else None,
            }
        return None


class MicroKitchenInspectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MicroKitchenInspection
        fields = "__all__"


class AdminMicroKitchenPatientSlotSerializer(serializers.ModelSerializer):
    """
    Admin-only view for: patients assigned to a specific micro-kitchen,
    including their plan start/end and meal dates (daily slots).
    """
    patient_details = serializers.SerializerMethodField(read_only=True)
    meal_dates = serializers.SerializerMethodField(read_only=True)
    diet_plan_details = serializers.SerializerMethodField(read_only=True)
    micro_kitchen_details = serializers.SerializerMethodField(read_only=True)
    original_micro_kitchen_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserDietPlan
        fields = [
            'id',
            'user',
            'status',
            'start_date',
            'end_date',
            'diet_plan_details',
            'patient_details',
            'meal_dates',
            'micro_kitchen_details',
            'original_micro_kitchen_details',
            'micro_kitchen_effective_from',
        ]

    def get_patient_details(self, obj):
        u = getattr(obj, 'user', None)
        if not u:
            return None
        lat = getattr(u, 'latitude', None)
        lng = getattr(u, 'longitude', None)
        return {
            'id': u.id,
            'username': u.username,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'email': u.email,
            'mobile': u.mobile,
            'address': u.address,
            'latitude': float(lat) if lat is not None else None,
            'longitude': float(lng) if lng is not None else None,
        }

    def get_diet_plan_details(self, obj):
        if obj.diet_plan:
            return {
                'id': obj.diet_plan.id,
                'title': obj.diet_plan.title,
                'code': obj.diet_plan.code,
            }
        return None

    def get_micro_kitchen_details(self, obj):
        if obj.micro_kitchen:
            return {'id': obj.micro_kitchen.id, 'brand_name': obj.micro_kitchen.brand_name}
        return None

    def get_original_micro_kitchen_details(self, obj):
        if obj.original_micro_kitchen:
            return {'id': obj.original_micro_kitchen.id, 'brand_name': obj.original_micro_kitchen.brand_name}
        return None

    def get_meal_dates(self, obj):
        # Distinct meal dates from UserMeal for this plan.
        qs = (
            UserMeal.objects
            .filter(user_diet_plan=obj)
            .values_list('meal_date', flat=True)
            .distinct()
            .order_by('meal_date')
        )
        # Return only a reasonable preview window.
        dates = list(qs)
        return dates[:31]


class DeliveryProfileSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField(read_only=True)
    verified_by_details = serializers.SerializerMethodField(read_only=True)
    kitchen_team_info = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = DeliveryProfile
        fields = [
            "id",
            "user",
            "vehicle_type",
            "other_vehicle_name",
            "vehicle_details",
            "register_number",
            "license_number",
            "license_copy",
            "rc_copy",
            "insurance_copy",
            "aadhar_number",
            "aadhar_image",
            "pan_number",
            "pan_image",
            "puc_image",
            "is_verified",
            "verified_by",
            "verified_on",
            "bank_account_number",
            "ifsc_code",
            "account_holder_name",
            "bank_name",
            "available_slots",
            "user_details",
            "verified_by_details",
            "kitchen_team_info",
        ]
        read_only_fields = ("is_verified", "verified_by", "verified_on", "user")

    def get_user_details(self, obj):
        if not obj.user:
            return None
        u = obj.user
        return {
            "id": u.id,
            "first_name": u.first_name or "",
            "last_name": u.last_name or "",
            "email": getattr(u, "email", None),
            "mobile": getattr(u, "mobile", None),
            "username": getattr(u, "username", None),
        }

    def get_verified_by_details(self, obj):
        if not obj.verified_by:
            return None
        v = obj.verified_by
        return {
            "id": v.id,
            "first_name": v.first_name or "",
            "last_name": v.last_name or "",
        }

    def get_kitchen_team_info(self, obj):
        request = self.context.get("request")
        if not request: return None
        
        from .models import MicroKitchenProfile, MicroKitchenDeliveryTeam
        mk = None
        if getattr(request.user, "role", None) == "micro_kitchen":
            mk = MicroKitchenProfile.objects.filter(user=request.user).first()
        elif "micro_kitchen_id" in request.query_params:
            mk = MicroKitchenProfile.objects.filter(id=request.query_params["micro_kitchen_id"]).first()
            
        if mk and obj.user_id:
            team = MicroKitchenDeliveryTeam.objects.filter(micro_kitchen=mk, delivery_person_id=obj.user_id).first()
            if team:
                return {
                    "role": team.role,
                    "zone_name": team.zone_name,
                    "pincode": team.pincode,
                    "is_active": team.is_active,
                    "assigned_on": team.assigned_on,
                }
        return None


class AdminSupplyChainDeliveryProfileReadSerializer(DeliveryProfileSerializer):
    """Admin API: delivery questionnaire / KYC snapshot for supply-chain overview."""

    class Meta(DeliveryProfileSerializer.Meta):
        pass


class UserNutritionistMappingSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField(read_only=True)
    nutritionist_details = serializers.SerializerMethodField(read_only=True)
    reassignment_details = serializers.SerializerMethodField(read_only=True)

    allotted_by_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserNutritionistMapping
        fields = [
            'id', 'user', 'nutritionist', 'assigned_on', 'is_active',
            'user_details', 'nutritionist_details', 'reassignment_details',
            'allotted_by', 'allotted_by_details',
        ]

    def get_allotted_by_details(self, obj):
        if obj.allotted_by:
            return {
                'id': obj.allotted_by.id,
                'username': obj.allotted_by.username,
                'name': f"{obj.allotted_by.first_name or ''} {obj.allotted_by.last_name or ''}".strip() or obj.allotted_by.username
            }
        return {"id": None, "username": None, "name": None}

    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'email': obj.user.email,
                'mobile': obj.user.mobile,
                'created_by_name': f"{obj.user.created_by.first_name or ''} {obj.user.created_by.last_name or ''}".strip() or obj.user.created_by.username if obj.user.created_by else None
            }
        return None

    def get_nutritionist_details(self, obj):
        if obj.nutritionist:
            return {
                'id': obj.nutritionist.id,
                'username': obj.nutritionist.username,
                'first_name': obj.nutritionist.first_name,
                'last_name': obj.nutritionist.last_name,
                'email': obj.nutritionist.email,
                'mobile': obj.nutritionist.mobile,
            }
        return None

    def get_reassignment_details(self, obj):
        reassign = NutritionistReassignment.objects.filter(new_mapping=obj).first()
        if reassign:
            prev_n = reassign.previous_nutritionist
            return {
                "previous_nutritionist": f"{prev_n.first_name} {prev_n.last_name}".strip() or prev_n.username if prev_n else "System",
                "new_nutritionist": f"{reassign.new_nutritionist.first_name} {reassign.new_nutritionist.last_name}".strip() or reassign.new_nutritionist.username,
                "reason": reassign.reason,
                "notes": reassign.notes,
                "effective_from": reassign.effective_from.strftime("%Y-%m-%d"),
            }
        return None


class PatientNutritionMappingSummarySerializer(serializers.ModelSerializer):
    nutritionist_name = serializers.SerializerMethodField()
    nutritionist_id = serializers.SerializerMethodField()
    allotted_by_name = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    is_mapped = serializers.BooleanField(source='is_patient_mapped', read_only=True)

    class Meta:
        model = UserRegister
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'email', 'mobile', 'created_by_name',
            'nutritionist_id', 'nutritionist_name', 'allotted_by_name', 'is_mapped'
        ]

    def get_created_by_name(self, obj):
        if obj.created_by:
            return f"{obj.created_by.first_name or ''} {obj.created_by.last_name or ''}".strip() or obj.created_by.username
        return None

    def get_nutritionist_name(self, obj):
        # We prefetch _active_mappings in the ViewSet for performance
        mappings = getattr(obj, '_active_mappings', [])
        if mappings:
            m = mappings[0]
            return f"{m.nutritionist.first_name or ''} {m.nutritionist.last_name or ''}".strip() or m.nutritionist.username
        return "Not Assigned"

    def get_nutritionist_id(self, obj):
        mappings = getattr(obj, '_active_mappings', [])
        if mappings:
            return mappings[0].nutritionist_id
        return None

    def get_allotted_by_name(self, obj):
        mappings = getattr(obj, '_active_mappings', [])
        if mappings:
            m = mappings[0]
            if m.allotted_by:
                return f"{m.allotted_by.first_name or ''} {m.allotted_by.last_name or ''}".strip() or m.allotted_by.username
        return "-"


class AdminNutritionistListSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRegister
        fields = ["id", "username", "first_name", "last_name", "email"]


class ReassignNutritionistSerializer(serializers.Serializer):
    """Payload for POST usernutritionistmapping/reassign/ (admin only)."""

    user = serializers.PrimaryKeyRelatedField(queryset=UserRegister.objects.all())
    new_nutritionist = serializers.PrimaryKeyRelatedField(queryset=UserRegister.objects.all())
    reason = serializers.ChoiceField(choices=NutritionistReassignment.REASON_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    effective_from = serializers.DateField(required=False, allow_null=True)

    def validate_new_nutritionist(self, value):
        if getattr(value, "role", None) != "nutritionist":
            raise serializers.ValidationError("Selected user must have role nutritionist.")
        return value

    def validate(self, attrs):
        if attrs.get("reason") == "other":
            notes = (attrs.get("notes") or "").strip()
            if not notes:
                raise serializers.ValidationError(
                    {"notes": 'Notes are required when reason is "other".'}
                )
        return attrs


class ReassignMicroKitchenSerializer(serializers.Serializer):
    """Payload for POST userdietplan/{id}/reassign-micro-kitchen/ (nutritionist or admin)."""

    new_micro_kitchen = serializers.PrimaryKeyRelatedField(queryset=MicroKitchenProfile.objects.all())
    reason = serializers.ChoiceField(choices=MicroKitchenReassignment.REASON_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True, default="")
    effective_from = serializers.DateField(required=False, allow_null=True)


class NutritionistReassignmentSerializer(serializers.ModelSerializer):
    previous_nutritionist_name = serializers.SerializerMethodField()
    new_nutritionist_name = serializers.SerializerMethodField()
    reassigned_by_name = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    plan_start_date = serializers.DateField(source="active_diet_plan.start_date", read_only=True)
    plan_end_date = serializers.DateField(source="active_diet_plan.end_date", read_only=True)

    class Meta:
        model = NutritionistReassignment
        fields = "__all__"

    def get_user_name(self, obj):
        if not obj.user: return "N/A"
        name = f"{obj.user.first_name or ''} {obj.user.last_name or ''}".strip()
        return name or obj.user.username

    def get_previous_nutritionist_name(self, obj):
        if not obj.previous_nutritionist: return "System"
        name = f"{obj.previous_nutritionist.first_name or ''} {obj.previous_nutritionist.last_name or ''}".strip()
        return name or obj.previous_nutritionist.username

    def get_new_nutritionist_name(self, obj):
        if not obj.new_nutritionist: return "N/A"
        name = f"{obj.new_nutritionist.first_name or ''} {obj.new_nutritionist.last_name or ''}".strip()
        return name or obj.new_nutritionist.username

    def get_reassigned_by_name(self, obj):
        if not obj.reassigned_by: return "System"
        name = f"{obj.reassigned_by.first_name or ''} {obj.reassigned_by.last_name or ''}".strip()
        return name or obj.reassigned_by.username


class MicroKitchenReassignmentSerializer(serializers.ModelSerializer):
    previous_kitchen_name = serializers.CharField(source="previous_kitchen.brand_name", read_only=True)
    new_kitchen_name = serializers.CharField(source="new_kitchen.brand_name", read_only=True)
    reassigned_by_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    diet_plan_title = serializers.SerializerMethodField()
    plan_start_date = serializers.DateField(source="user_diet_plan.start_date", read_only=True)
    plan_end_date = serializers.DateField(source="user_diet_plan.end_date", read_only=True)

    class Meta:
        model = MicroKitchenReassignment
        fields = "__all__"

    def get_reassigned_by_name(self, obj):
        if not obj.reassigned_by: return "System"
        name = f"{obj.reassigned_by.first_name or ''} {obj.reassigned_by.last_name or ''}".strip()
        return name or obj.reassigned_by.username

    def get_patient_name(self, obj):
        if not obj.user_diet_plan or not obj.user_diet_plan.user: return "N/A"
        u = obj.user_diet_plan.user
        name = f"{u.first_name or ''} {u.last_name or ''}".strip()
        return name or u.username

    def get_diet_plan_title(self, obj):
        if not obj.user_diet_plan or not obj.user_diet_plan.diet_plan: return "N/A"
        return obj.user_diet_plan.diet_plan.title


# ── Food Composition (FoodName-based) Serializers ──────────────────────────────

class FoodGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodGroup
        fields = "__all__"


class FoodNameSerializer(serializers.ModelSerializer):
    food_group_name = serializers.CharField(source='food_group.name', read_only=True)
    food_group_name_input = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = FoodName
        fields = [
            "id",
            "name",
            "food_group",
            "food_group_name",
            "food_group_name_input",
            "image",
            "code",
            "created_at",
        ]

    def create(self, validated_data):
        group_name = validated_data.pop('food_group_name_input', None)
        if group_name:
            group, _ = FoodGroup.objects.get_or_create(name=group_name.strip())
            validated_data['food_group'] = group
        return super().create(validated_data)

    def update(self, instance, validated_data):
        group_name = validated_data.pop('food_group_name_input', None)
        if group_name:
            group, _ = FoodGroup.objects.get_or_create(name=group_name.strip())
            validated_data['food_group'] = group
        return super().update(instance, validated_data)


class FoodCompositionBaseSerializer(serializers.ModelSerializer):
    food_name_input = serializers.CharField(write_only=True, required=False)
    # Make food_name optional in serializer as we provide food_name_input instead
    food_name = serializers.PrimaryKeyRelatedField(
        queryset=FoodName.objects.all(), 
        required=False, 
        allow_null=True
    )

    def create(self, validated_data):
        food_name = validated_data.pop('food_name_input', None)
        if food_name:
            food, _ = FoodName.objects.get_or_create(name=food_name.strip())
            validated_data['food_name'] = food
        
        # Use update_or_create to prevent duplicates on OneToOne relations
        food_obj = validated_data.get('food_name')
        if food_obj:
            # Remove the lookup field from defaults to avoid multiple values error
            defaults = validated_data.copy()
            defaults.pop('food_name', None)
            instance, created = self.Meta.model.objects.update_or_create(
                food_name=food_obj,
                defaults=defaults
            )
            return instance
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        food_name = validated_data.pop('food_name_input', None)
        if food_name:
            food, _ = FoodName.objects.get_or_create(name=food_name.strip())
            validated_data['food_name'] = food
        return super().update(instance, validated_data)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Ensure 'food_name_display' is ALWAYS present for the frontend tables
        if hasattr(instance, 'food_name') and instance.food_name:
            ret['food_name_display'] = instance.food_name.name
        else:
            ret['food_name_display'] = "N/A"
        return ret


class FoodProximateSerializer(FoodCompositionBaseSerializer):
    class Meta:
        model = FoodProximate
        fields = "__all__"


class FoodWaterSolubleVitaminsSerializer(FoodCompositionBaseSerializer):
    class Meta:
        model = FoodWaterSolubleVitamins
        fields = "__all__"


class FoodFatSolubleVitaminsSerializer(FoodCompositionBaseSerializer):
    class Meta:
        model = FoodFatSolubleVitamins
        fields = "__all__"


class FoodCarotenoidsSerializer(FoodCompositionBaseSerializer):
    class Meta:
        model = FoodCarotenoids
        fields = "__all__"


class FoodMineralsSerializer(FoodCompositionBaseSerializer):
    class Meta:
        model = FoodMinerals
        fields = "__all__"


class FoodSugarsSerializer(FoodCompositionBaseSerializer):
    class Meta:
        model = FoodSugars
        fields = "__all__"


class FoodAminoAcidsSerializer(FoodCompositionBaseSerializer):
    class Meta:
        model = FoodAminoAcids
        fields = "__all__"


class FoodOrganicAcidsSerializer(FoodCompositionBaseSerializer):
    class Meta:
        model = FoodOrganicAcids
        fields = "__all__"


class FoodPolyphenolsSerializer(FoodCompositionBaseSerializer):
    class Meta:
        model = FoodPolyphenols
        fields = "__all__"


class FoodPhytochemicalsSerializer(FoodCompositionBaseSerializer):
    class Meta:
        model = FoodPhytochemicals
        fields = "__all__"


class FoodFattyAcidProfileSerializer(FoodCompositionBaseSerializer):
    class Meta:
        model = FoodFattyAcidProfile
        fields = "__all__"


# Read-only composition rows (no write-only food_name_input); used for patient nutrition detail API.
class FoodProximateReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodProximate
        exclude = ("food_name",)


class FoodWaterSolubleVitaminsReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodWaterSolubleVitamins
        exclude = ("food_name",)


class FoodFatSolubleVitaminsReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodFatSolubleVitamins
        exclude = ("food_name",)


class FoodCarotenoidsReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodCarotenoids
        exclude = ("food_name",)


class FoodMineralsReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodMinerals
        exclude = ("food_name",)


class FoodSugarsReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodSugars
        exclude = ("food_name",)


class FoodAminoAcidsReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodAminoAcids
        exclude = ("food_name",)


class FoodOrganicAcidsReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodOrganicAcids
        exclude = ("food_name",)


class FoodPolyphenolsReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodPolyphenols
        exclude = ("food_name",)


class FoodPhytochemicalsReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodPhytochemicals
        exclude = ("food_name",)


class FoodFattyAcidProfileReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodFattyAcidProfile
        exclude = ("food_name",)


class FoodNameNutritionDetailSerializer(serializers.ModelSerializer):
    """Full FoodName + all composition OneToOne relations (catalog reference data)."""

    food_group_detail = FoodGroupSerializer(source="food_group", read_only=True)
    proximate = FoodProximateReadSerializer(read_only=True)
    water_soluble_vitamins = FoodWaterSolubleVitaminsReadSerializer(read_only=True)
    fat_soluble_vitamins = FoodFatSolubleVitaminsReadSerializer(read_only=True)
    carotenoids = FoodCarotenoidsReadSerializer(read_only=True)
    minerals = FoodMineralsReadSerializer(read_only=True)
    sugars = FoodSugarsReadSerializer(read_only=True)
    amino_acids = FoodAminoAcidsReadSerializer(read_only=True)
    organic_acids = FoodOrganicAcidsReadSerializer(read_only=True)
    polyphenols = FoodPolyphenolsReadSerializer(read_only=True)
    phytochemicals = FoodPhytochemicalsReadSerializer(read_only=True)
    fatty_acid_profile = FoodFattyAcidProfileReadSerializer(read_only=True)

    class Meta:
        model = FoodName
        fields = [
            "id",
            "name",
            "image",
            "code",
            "created_at",
            "food_group",
            "food_group_detail",
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
        ]


class PatientHealthReportSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    reviews = serializers.SerializerMethodField()

    class Meta:
        model = PatientHealthReport
        fields = [
            'id', 'user', 'user_details', 'title', 'report_file', 
            'report_type', 'uploaded_on', 'reviews'
        ]

    def get_user_details(self, obj):
        if obj.user:
            return {
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
                "email": obj.user.email,
            }
        return None

    def get_reviews(self, obj):
        # Return reviews where this report is included (nutritionist and/or doctor comments share one `comments` field)
        from .models import NutritionistReview
        revs = obj.reviews.all().select_related('nutritionist', 'doctor').order_by('-created_on')
        out = []
        for r in revs:
            nut_name = (
                f"{r.nutritionist.first_name} {r.nutritionist.last_name}".strip()
                if r.nutritionist
                else None
            )
            doc_name = (
                f"{r.doctor.first_name} {r.doctor.last_name}".strip()
                if r.doctor
                else None
            )
            reviewer_role = (
                "nutritionist"
                if r.nutritionist_id
                else ("doctor" if r.doctor_id else "unknown")
            )
            display_name = (nut_name or doc_name or "Unknown").strip() or "Unknown"
            out.append({
                "id": r.id,
                "comments": r.comments,
                "created_on": r.created_on,
                # Combined display name for the reviewer (backward compatible with older clients)
                "nutritionist_name": display_name,
                "nutritionist_only_name": nut_name,
                "doctor_name": doc_name,
                "reviewer_role": reviewer_role,
            })
        return out


class NutritionistReviewSerializer(serializers.ModelSerializer):
    report_details = serializers.SerializerMethodField()
    nutritionist_details = serializers.SerializerMethodField(read_only=True)
    doctor_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NutritionistReview
        fields = [
            'id', 'user', 'nutritionist', 'doctor', 'nutritionist_details', 'doctor_details',
            'reports', 'report_details',
            'comments', 'created_on',
        ]

    def get_nutritionist_details(self, obj):
        if obj.nutritionist:
            return {
                'id': obj.nutritionist.id,
                'first_name': obj.nutritionist.first_name,
                'last_name': obj.nutritionist.last_name,
                'email': obj.nutritionist.email,
            }
        return None

    def get_doctor_details(self, obj):
        if obj.doctor:
            return {
                'id': obj.doctor.id,
                'first_name': obj.doctor.first_name,
                'last_name': obj.doctor.last_name,
                'email': obj.doctor.email,
            }
        return None

    def get_report_details(self, obj):
        out = []
        for r in obj.reports.all().order_by('-uploaded_on'):
            url = r.report_file.url if r.report_file else None
            out.append({
                'id': r.id,
                'title': r.title,
                'report_type': r.report_type,
                'uploaded_on': r.uploaded_on,
                'report_file': url,
            })
        return out


class AdminDoctorPatientCommentListSerializer(serializers.ModelSerializer):
    """Admin: doctor reviews on patients with patient context for overview UI."""

    patient_details = serializers.SerializerMethodField()
    report_details = serializers.SerializerMethodField()

    class Meta:
        model = NutritionistReview
        fields = ['id', 'comments', 'created_on', 'patient_details', 'report_details']

    def get_patient_details(self, obj):
        u = obj.user
        if not u:
            return None
        return {
            'id': u.id,
            'username': u.username,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'email': u.email,
            'mobile': u.mobile,
        }

    def get_report_details(self, obj):
        out = []
        for r in obj.reports.all().order_by('-uploaded_on'):
            url = r.report_file.url if r.report_file else None
            out.append({
                'id': r.id,
                'title': r.title,
                'report_type': r.report_type,
                'uploaded_on': r.uploaded_on,
                'report_file': url,
            })
        return out


class ClinicalReviewHealthReportSerializer(serializers.ModelSerializer):
    """Minimal health report payload for nutritionist clinical review dashboard."""

    reviews = serializers.SerializerMethodField()

    class Meta:
        model = PatientHealthReport
        fields = [
            'id', 'user', 'title', 'report_file', 'report_type', 'uploaded_on', 'reviews',
        ]

    def get_reviews(self, obj):
        revs = obj.reviews.all().select_related('nutritionist', 'doctor').order_by('-created_on')
        rows = []
        for r in revs:
            nut_name = (
                f'{r.nutritionist.first_name} {r.nutritionist.last_name}'.strip()
                if r.nutritionist
                else None
            )
            doc_name = (
                f'{r.doctor.first_name} {r.doctor.last_name}'.strip()
                if r.doctor
                else None
            )
            reviewer_role = (
                'nutritionist'
                if r.nutritionist_id
                else ('doctor' if r.doctor_id else 'unknown')
            )
            display_name = (nut_name or doc_name or 'Unknown').strip() or 'Unknown'
            rows.append({
                'id': r.id,
                'comments': r.comments,
                'created_on': r.created_on,
                'nutritionist_name': display_name,
                'nutritionist_only_name': nut_name,
                'doctor_name': doc_name,
                'reviewer_role': reviewer_role,
            })
        return rows


class ClinicalReviewNutritionistReviewSerializer(serializers.ModelSerializer):
    """Minimal nutritionist review for clinical review dashboard (no nutritionist_details)."""

    report_details = serializers.SerializerMethodField()

    class Meta:
        model = NutritionistReview
        fields = [
            'id', 'user', 'nutritionist', 'reports', 'report_details', 'comments', 'created_on',
        ]

    def get_report_details(self, obj):
        return [
            {'id': r.id, 'title': r.title}
            for r in obj.reports.all().order_by('-uploaded_on')
        ]


class UserDietPlanSerializer(serializers.ModelSerializer):
    diet_plan_details = serializers.SerializerMethodField()
    user_details = serializers.SerializerMethodField()
    nutritionist_details = serializers.SerializerMethodField()
    review_details = serializers.SerializerMethodField()
    micro_kitchen_details = serializers.SerializerMethodField()
    original_micro_kitchen_details = serializers.SerializerMethodField()
    verified_by_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserDietPlan
        fields = [
            'id', 'user', 'user_details', 'nutritionist', 'nutritionist_details',
            'original_nutritionist', 'diet_plan', 'diet_plan_details', 'micro_kitchen', 'micro_kitchen_details',
            'original_micro_kitchen', 'original_micro_kitchen_details', 'micro_kitchen_effective_from',
            'review', 'review_details',
            'nutritionist_notes', 'status', 'user_feedback', 'decision_on',
            'amount_paid', 'transaction_id', 'payment_status',
            'payment_screenshot', 'payment_uploaded_on', 'is_payment_verified',
            'verified_by', 'verified_by_details', 'verified_on',
            'start_date', 'end_date', 'nutritionist_effective_from',
            'suggested_on', 'approved_on', 'created_on', 'updated_on'
        ]
        read_only_fields = ['suggested_on', 'approved_on', 'created_on', 'updated_on', 'payment_uploaded_on', 'verified_on', 'verified_by_details']

    def get_diet_plan_details(self, obj):
        if obj.diet_plan:
            return {
                'id': obj.diet_plan.id,
                'title': obj.diet_plan.title,
                'code': obj.diet_plan.code,
                'amount': str(obj.diet_plan.amount),
                'discount_amount': str(obj.diet_plan.discount_amount) if obj.diet_plan.discount_amount else None,
                'final_amount': str(obj.diet_plan.final_amount),
                'no_of_days': obj.diet_plan.no_of_days,
                'features': [
                    {'id': f.id, 'feature': f.feature, 'order': f.order}
                    for f in obj.diet_plan.features.all().order_by('order')
                ]
            }
        return None

    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'email': obj.user.email,
            }
        return None

    def get_nutritionist_details(self, obj):
        if obj.nutritionist:
            return {
                'id': obj.nutritionist.id,
                'first_name': obj.nutritionist.first_name,
                'last_name': obj.nutritionist.last_name,
                'email': obj.nutritionist.email,
            }
        return None

    def get_review_details(self, obj):
        if obj.review:
            return {
                'id': obj.review.id,
                'comments': obj.review.comments,
                'created_on': obj.review.created_on,
                'report_details': [{'id': r.id, 'title': r.title} for r in obj.review.reports.all()]
            }
        return None

    def get_micro_kitchen_details(self, obj):
        if obj.micro_kitchen:
            user = obj.micro_kitchen.user
            return {
                'id': obj.micro_kitchen.id,
                'brand_name': obj.micro_kitchen.brand_name,
                'cuisine_type': obj.micro_kitchen.cuisine_type,
                'latitude': getattr(user, 'latitude', None) if user else None,
                'longitude': getattr(user, 'longitude', None) if user else None,
                'time_available': obj.micro_kitchen.time_available,
                'status': obj.micro_kitchen.status,
            }
        return None

    def get_original_micro_kitchen_details(self, obj):
        if obj.original_micro_kitchen:
            user = obj.original_micro_kitchen.user
            return {
                'id': obj.original_micro_kitchen.id,
                'brand_name': obj.original_micro_kitchen.brand_name,
                'cuisine_type': obj.original_micro_kitchen.cuisine_type,
                'latitude': getattr(user, 'latitude', None) if user else None,
                'longitude': getattr(user, 'longitude', None) if user else None,
                'time_available': obj.original_micro_kitchen.time_available,
                'status': obj.original_micro_kitchen.status,
            }
        return None

    def get_verified_by_details(self, obj):
        if obj.verified_by:
            u = obj.verified_by
            return {
                'id': u.id,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'email': u.email,
                'username': u.username,
            }
        return None


class AdminNutritionistDietPlanListSerializer(serializers.ModelSerializer):
    diet_plan_details = serializers.SerializerMethodField()
    user_details = serializers.SerializerMethodField()
    micro_kitchen_details = serializers.SerializerMethodField()

    class Meta:
        model = UserDietPlan
        fields = [
            'id', 'user_details', 'diet_plan_details', 'micro_kitchen_details',
            'status', 'suggested_on'
        ]

    def get_diet_plan_details(self, obj):
        if obj.diet_plan:
            return {
                'id': obj.diet_plan.id,
                'title': obj.diet_plan.title,
            }
        return None

    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
            }
        return None

    def get_micro_kitchen_details(self, obj):
        if obj.micro_kitchen:
            return {
                'id': obj.micro_kitchen.id,
                'brand_name': obj.micro_kitchen.brand_name,
            }
        return None


class UserDietPlanNewRequestLiteSerializer(serializers.ModelSerializer):
    diet_plan_details = serializers.SerializerMethodField()
    micro_kitchen_details = serializers.SerializerMethodField()

    class Meta:
        model = UserDietPlan
        fields = [
            "id",
            "status",
            "start_date",
            "end_date",
            "diet_plan_details",
            "micro_kitchen_details",
        ]

    def get_diet_plan_details(self, obj):
        if not obj.diet_plan:
            return None
        return {
            "title": obj.diet_plan.title,
            "code": obj.diet_plan.code,
        }

    def get_micro_kitchen_details(self, obj):
        if not obj.micro_kitchen:
            return None
        return {
            "brand_name": obj.micro_kitchen.brand_name,
        }


class SuggestedPlansLiteSerializer(serializers.ModelSerializer):
    diet_plan_details = serializers.SerializerMethodField()
    nutritionist_details = serializers.SerializerMethodField()
    micro_kitchen_details = serializers.SerializerMethodField()
    original_micro_kitchen_details = serializers.SerializerMethodField()

    class Meta:
        model = UserDietPlan
        fields = [
            'id', 'status',
            'suggested_on', 'nutritionist_notes',
            'start_date', 'end_date',
            'transaction_id', 'payment_screenshot', 'payment_uploaded_on',
            'micro_kitchen_effective_from',
            'diet_plan_details', 'nutritionist_details',
            'micro_kitchen_details', 'original_micro_kitchen_details',
        ]

    def get_diet_plan_details(self, obj):
        if obj.diet_plan:
            return {
                'code': obj.diet_plan.code,
                'title': obj.diet_plan.title,
                'final_amount': str(obj.diet_plan.final_amount),
                'no_of_days': obj.diet_plan.no_of_days,
            }
        return None

    def get_nutritionist_details(self, obj):
        if obj.nutritionist:
            return {
                'first_name': obj.nutritionist.first_name,
                'last_name': obj.nutritionist.last_name,
            }
        return None

    def get_micro_kitchen_details(self, obj):
        if obj.micro_kitchen:
            return {
                'brand_name': obj.micro_kitchen.brand_name,
            }
        return None

    def get_original_micro_kitchen_details(self, obj):
        if obj.original_micro_kitchen:
            return {
                'brand_name': obj.original_micro_kitchen.brand_name,
            }
        return None


class ApprovedPlansLiteSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    diet_plan_details = serializers.SerializerMethodField()
    micro_kitchen_details = serializers.SerializerMethodField()

    class Meta:
        model = UserDietPlan
        fields = [
            'id',
            'user_details',
            'diet_plan_details',
            'micro_kitchen_details',
            'start_date',
            'status',
            'created_on',
            'payment_status',
            'nutritionist_notes',
        ]

    def get_user_details(self, obj):
        if not obj.user:
            return None
        return {
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'email': obj.user.email,
        }

    def get_diet_plan_details(self, obj):
        if not obj.diet_plan:
            return None
        return {
            'title': obj.diet_plan.title,
            'no_of_days': obj.diet_plan.no_of_days,
        }

    def get_micro_kitchen_details(self, obj):
        if not obj.micro_kitchen:
            return None
        return {
            'brand_name': obj.micro_kitchen.brand_name,
            'cuisine_type': obj.micro_kitchen.cuisine_type,
        }


class AdminPatientDietPlansLiteSerializer(serializers.ModelSerializer):
    diet_plan_details = serializers.SerializerMethodField()
    nutritionist_details = serializers.SerializerMethodField()
    micro_kitchen_details = serializers.SerializerMethodField()
    original_micro_kitchen_details = serializers.SerializerMethodField()
    verified_by_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserDietPlan
        fields = [
            'id', 'status', 'diet_plan_details', 'nutritionist_details',
            'micro_kitchen_details', 'original_micro_kitchen_details',
            'micro_kitchen_effective_from', 'start_date', 'end_date',
            'payment_status', 'amount_paid', 'transaction_id',
            'payment_screenshot', 'payment_uploaded_on', 'is_payment_verified',
            'verified_by', 'verified_by_details', 'verified_on'
        ]
        read_only_fields = ['payment_uploaded_on', 'verified_on', 'verified_by_details']

    def get_diet_plan_details(self, obj):
        if obj.diet_plan:
            return {
                'title': obj.diet_plan.title,
                'code': obj.diet_plan.code,
                'no_of_days': obj.diet_plan.no_of_days,
            }
        return None

    def get_nutritionist_details(self, obj):
        if obj.nutritionist:
            return {
                'first_name': obj.nutritionist.first_name,
                'last_name': obj.nutritionist.last_name,
                'email': obj.nutritionist.email,
            }
        return None

    def get_micro_kitchen_details(self, obj):
        if obj.micro_kitchen:
            return {
                'brand_name': obj.micro_kitchen.brand_name,
            }
        return None

    def get_original_micro_kitchen_details(self, obj):
        if obj.original_micro_kitchen:
            return {
                'brand_name': obj.original_micro_kitchen.brand_name,
            }
        return None

    def get_verified_by_details(self, obj):
        if obj.verified_by:
            u = obj.verified_by
            return {
                'id': u.id,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'email': u.email,
                'username': u.username,
            }
        return None


class UserMealSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    meal_type_details = serializers.SerializerMethodField()
    food_details = serializers.SerializerMethodField()
    packaging_material_details = serializers.SerializerMethodField()
    micro_kitchen_details = serializers.SerializerMethodField()
    delivery_person_details = serializers.SerializerMethodField()
    delivery_assignment_id = serializers.SerializerMethodField()
    delivery_slot_details = serializers.SerializerMethodField()

    class Meta:
        model = UserMeal
        fields = [
            'id', 'user', 'user_details', 'user_diet_plan', 'meal_type',
            'meal_type_details',
            'food', 'food_details',
            'quantity', 'meal_date', 'is_consumed', 'consumed_at',
            'status',
            'notes', 'packaging_material', 'packaging_material_details',
            'micro_kitchen', 'micro_kitchen_details', 'delivery_person_details',
            'delivery_assignment_id', 'delivery_slot_details',
            'created_on'
        ]
        read_only_fields = ['created_on']

    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'mobile': getattr(obj.user, 'mobile', None),
                'address': getattr(obj.user, 'address', None),
            }
        return None

    def get_meal_type_details(self, obj):
        if obj.meal_type:
            return {
                'id': obj.meal_type.id,
                'name': obj.meal_type.name,
            }
        return None


    def get_food_details(self, obj):
        if obj.food:
            return {
                'id': obj.food.id,
                'name': obj.food.name,
                'image': obj.food.image.url if obj.food.image else None,
                'meal_types': list(obj.food.meal_types.values_list('id', flat=True)),
                'meal_type_details': [
                    {'id': mt.id, 'name': mt.name} for mt in obj.food.meal_types.all()
                ]
            }
        return None

    def get_packaging_material_details(self, obj):
        if obj.packaging_material:
            return {
                'id': obj.packaging_material.id,
                'name': obj.packaging_material.name,
            }
        return None

    def get_micro_kitchen_details(self, obj):
        if obj.micro_kitchen:
            u = obj.micro_kitchen.user
            return {
                'id': obj.micro_kitchen.id,
                'brand_name': obj.micro_kitchen.brand_name,
                'latitude': getattr(u, 'latitude', None) if u else None,
                'longitude': getattr(u, 'longitude', None) if u else None,
                'status': obj.micro_kitchen.status,
            }
        return None

    def get_delivery_person_details(self, obj):
        da = obj.deliveries.filter(is_active=True).select_related('delivery_person').first()
        if not da or not da.delivery_person:
            return None
        dp = da.delivery_person
        return {
            'id': dp.id,
            'first_name': dp.first_name or '',
            'last_name': dp.last_name or '',
            'mobile': getattr(dp, 'mobile', None),
        }

    def get_delivery_assignment_id(self, obj):
        da = obj.deliveries.filter(is_active=True).first()
        return da.id if da else None

    def get_delivery_slot_details(self, obj):
        da = obj.deliveries.filter(is_active=True).select_related('delivery_slot').first()
        if not da or not da.delivery_slot:
            return None
        s = da.delivery_slot
        return {
            'id': s.id,
            'name': s.name,
            'start_time': s.start_time,
            'end_time': s.end_time,
        }


class BulkUserMealSerializer(serializers.ModelSerializer):
    """Bulk save: optional id updates an existing row; omit id to create (multiple same meal_type/day allowed)."""
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = UserMeal
        fields = [
            'id',
            'user',
            'user_diet_plan',
            'meal_type',
            'food',
            'quantity',
            'meal_date',
            'notes',
            'packaging_material',
        ]
        validators = []


class PatientUnavailabilitySerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField(read_only=True)
    meal_types_details = serializers.SerializerMethodField(read_only=True)
    user_diet_plan_details = serializers.SerializerMethodField(read_only=True)
    skip_meal_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PatientUnavailability
        fields = [
            "id",
            "user",
            "user_details",
            "user_diet_plan",
            "user_diet_plan_details",
            "from_date",
            "to_date",
            "scope",
            "meal_types",
            "meal_types_details",
            "reason",
            "patient_comments",
            "status",
            "requested_on",
            "reviewed_by",
            "reviewed_on",
            "review_notes",
            "skip_meal_count",
        ]
        read_only_fields = ["requested_on", "reviewed_by", "reviewed_on", "skip_meal_count"]

    def validate(self, attrs):
        instance = getattr(self, "instance", None)
        scope = attrs.get("scope", getattr(instance, "scope", "all") if instance else "all")
        from_date = attrs.get("from_date", getattr(instance, "from_date", None) if instance else None)
        to_date = attrs.get("to_date", getattr(instance, "to_date", None) if instance else None)

        if from_date and to_date and to_date < from_date:
            raise serializers.ValidationError("to_date must be on or after from_date.")

        meal_types_in = attrs.get("meal_types", serializers.empty)
        if meal_types_in is serializers.empty:
            meal_count = instance.meal_types.count() if instance else 0
        else:
            meal_count = len(meal_types_in) if meal_types_in else 0
        if scope == "meal_type" and meal_count == 0:
            raise serializers.ValidationError(
                {"meal_types": "Select at least one meal type when scope is 'meal_type'."}
            )
        return attrs

    def get_user_details(self, obj):
        if not obj.user:
            return None
        return {
            "id": obj.user.id,
            "first_name": obj.user.first_name or "",
            "last_name": obj.user.last_name or "",
            "email": obj.user.email,
            "mobile": getattr(obj.user, "mobile", None),
        }

    def get_meal_types_details(self, obj):
        return [{"id": m.id, "name": m.name} for m in obj.meal_types.all().order_by("id")]

    def get_user_diet_plan_details(self, obj):
        if not obj.user_diet_plan:
            return None
        return {
            "id": obj.user_diet_plan.id,
            "status": obj.user_diet_plan.status,
            "start_date": obj.user_diet_plan.start_date,
            "end_date": obj.user_diet_plan.end_date,
        }

    def get_skip_meal_count(self, obj):
        qs = UserMeal.objects.filter(
            user_diet_plan_id=obj.user_diet_plan_id,
            user_id=obj.user_id,
            meal_date__range=[obj.from_date, obj.to_date],
        )
        if obj.scope == "meal_type":
            ids = list(obj.meal_types.values_list("id", flat=True))
            if ids:
                qs = qs.filter(meal_type_id__in=ids)
        return qs.count()


class PatientUnavailabilityCreateLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = PatientUnavailability
        fields = [
            "id",
            "user_diet_plan",
            "from_date",
            "to_date",
            "scope",
            "meal_types",
            "reason",
            "patient_comments",
            "status",
        ]
        read_only_fields = ["id", "status"]


class PatientUnavailabilityPastRequestLiteSerializer(serializers.ModelSerializer):
    meal_types_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PatientUnavailability
        fields = [
            "id",
            "from_date",
            "to_date",
            "scope",
            "meal_types_details",
            "status",
            "reason",
            "patient_comments",
        ]

    def get_meal_types_details(self, obj):
        return [{"id": m.id, "name": m.name} for m in obj.meal_types.all().order_by("id")]


class UnavailabilityImpactRowSerializer(serializers.Serializer):
    meal_date = serializers.DateField()
    meal_type_id = serializers.IntegerField(allow_null=True)
    meal_type_name = serializers.CharField(allow_null=True)
    meal_count = serializers.IntegerField()


class MeetingRequestSerializer(serializers.ModelSerializer):
    patient_details = serializers.SerializerMethodField(read_only=True)
    nutritionist_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MeetingRequest
        fields = [
            'id', 'patient', 'patient_details', 'nutritionist', 'nutritionist_details',
            'user_diet_plan', 'availability_slot', 'preferred_date', 'preferred_time', 'reason',
            'status', 'meeting_link', 'nutritionist_notes', 'scheduled_datetime',
            'created_on', 'updated_on'
        ]
        read_only_fields = ['id', 'patient', 'created_on', 'updated_on']

    def get_patient_details(self, obj):
        if obj.patient:
            return {
                'id': obj.patient.id,
                'first_name': obj.patient.first_name or obj.patient.username,
                'last_name': obj.patient.last_name,
                'email': obj.patient.email,
            }
        return None

    def get_nutritionist_details(self, obj):
        if obj.nutritionist:
            return {
                'id': obj.nutritionist.id,
                'first_name': obj.nutritionist.first_name or obj.nutritionist.username,
                'last_name': obj.nutritionist.last_name,
            }
        return None

    def create(self, validated_data):
        # Auto-set the patient to the current user if not provided
        request = self.context.get('request')
        if request and request.user and not validated_data.get('patient'):
            validated_data['patient'] = request.user
        return super().create(validated_data)



class NutritionistAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionistAvailability
        fields = ['id', 'nutritionist', 'date', 'start_time', 'end_time', 'is_booked', 'created_at', 'updated_at']
        read_only_fields = ['id', 'nutritionist', 'is_booked', 'created_at', 'updated_at']


class NutritionistRatingSerializer(serializers.ModelSerializer):
    patient_details = serializers.SerializerMethodField(read_only=True)
    nutritionist_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NutritionistRating
        fields = [
            'id', 'patient', 'patient_details', 'nutritionist', 'nutritionist_details',
            'rating', 'review', 'diet_plan', 'created_at'
        ]
        read_only_fields = ['id', 'patient', 'created_at']

    def get_patient_details(self, obj):
        if obj.patient:
            return {
                'id': obj.patient.id,
                'first_name': obj.patient.first_name or obj.patient.username,
                'last_name': obj.patient.last_name,
            }
        return None

    def get_nutritionist_details(self, obj):
        if obj.nutritionist:
            return {
                'id': obj.nutritionist.id,
                'first_name': obj.nutritionist.first_name or obj.nutritionist.username,
                'last_name': obj.nutritionist.last_name,
            }
        return None

class MicroKitchenRatingSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField(read_only=True)
    kitchen_details = serializers.SerializerMethodField(read_only=True)
    order_type = serializers.SerializerMethodField(read_only=True)
    delivery_person_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MicroKitchenRating
        fields = [
            'id', 'user', 'user_details', 'micro_kitchen', 'kitchen_details',
            'rating', 'review', 'order', 'order_type', 'delivery_person_details', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name or obj.user.username,
                'last_name': obj.user.last_name,
                'mobile': obj.user.mobile,
            }
        return None

    def get_kitchen_details(self, obj):
        if obj.micro_kitchen:
            return {
                'id': obj.micro_kitchen.id,
                'brand_name': obj.micro_kitchen.brand_name,
            }
        return None

    def get_order_type(self, obj):
        if obj.order:
            return obj.order.order_type
        return 'general'

    def get_delivery_person_details(self, obj):
        if obj.order and obj.order.delivery_person:
            dp = obj.order.delivery_person
            return {
                'id': dp.id,
                'first_name': dp.first_name or dp.username,
                'last_name': dp.last_name or '',
                'mobile': getattr(dp, 'mobile', None),
            }
        return None


class SupplyChainDeliveryFeedbackSerializer(serializers.ModelSerializer):
    reported_by_details = serializers.SerializerMethodField(read_only=True)
    order_details = serializers.SerializerMethodField(read_only=True)
    user_meal_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = SupplyChainDeliveryFeedback
        fields = [
            "id",
            "feedback_type",
            "order",
            "order_details",
            "user_meal",
            "user_meal_details",
            "reported_by",
            "reported_by_details",
            "rating",
            "review",
            "issue_type",
            "description",
            "resolved",
            "resolved_by",
            "resolved_at",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "reported_by",
            "resolved",
            "resolved_by",
            "resolved_at",
            "created_at",
        ]

    def get_reported_by_details(self, obj):
        user = getattr(obj, "reported_by", None)
        if not user:
            return None
        return {
            "id": user.id,
            "first_name": user.first_name or "",
            "last_name": user.last_name or "",
            "username": user.username or "",
        }

    def get_order_details(self, obj):
        order = getattr(obj, "order", None)
        if not order:
            return None
        dp = order.delivery_person
        patient = order.user
        return {
            "id": order.id,
            "status": order.status,
            "order_type": order.order_type,
            "order_date": order.created_at,
            "delivery_person": order.delivery_person_id,
            "delivery_person_name": f"{dp.first_name or dp.username} {dp.last_name or ''}".strip() if dp else "N/A",
            "customer_details": {
                "id": patient.id,
                "name": f"{patient.first_name or patient.username} {patient.last_name or ''}".strip()
            } if patient else None
        }

    def get_user_meal_details(self, obj):
        meal = getattr(obj, "user_meal", None)
        if not meal:
            return None
        
        # Try to find delivery person from the active delivery assignment
        delivery = meal.deliveries.filter(is_active=True).select_related("delivery_person").first()
        dp = delivery.delivery_person if delivery else None
        
        patient = meal.user_diet_plan.user if meal.user_diet_plan else None
        
        return {
            "id": meal.id,
            "meal_date": meal.meal_date,
            "status": meal.status,
            "user_diet_plan": meal.user_diet_plan_id,
            "delivery_assignment_id": delivery.id if delivery else None,
            "delivery_person_name": f"{dp.first_name or dp.username} {dp.last_name or ''}".strip() if dp else "N/A",
            "customer_details": {
                "id": patient.id,
                "name": f"{patient.first_name or patient.username} {patient.last_name or ''}".strip()
            } if patient else None
        }


class CartItemSerializer(serializers.ModelSerializer):
    food_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'food', 'food_details', 'quantity']

    def get_food_details(self, obj):
        if obj.food:
            price = obj.food.price
            if obj.cart and obj.cart.micro_kitchen_id:
                mcf = MicroKitchenFood.objects.filter(
                    micro_kitchen_id=obj.cart.micro_kitchen_id, food=obj.food
                ).first()
                if mcf:
                    price = float(mcf.price)
            return {
                'id': obj.food.id,
                'name': obj.food.name,
                'image': obj.food.image.url if obj.food.image else None,
                'price': price,
            }
        return None


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    kitchen_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'micro_kitchen', 'kitchen_details', 'items', 'created_at']

    def get_kitchen_details(self, obj):
        if obj.micro_kitchen:
            return {
                'id': obj.micro_kitchen.id,
                'brand_name': obj.micro_kitchen.brand_name,
            }
        return None


class OrderItemSerializer(serializers.ModelSerializer):
    food_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'food', 'food_details', 'quantity', 'price', 'subtotal']

    def get_food_details(self, obj):
        if obj.food:
            return {
                'id': obj.food.id,
                'name': obj.food.name,
                'image': obj.food.image.url if obj.food.image else None,
            }
        return None


class OrderPaymentHistoryItemSerializer(serializers.ModelSerializer):
    food_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'quantity', 'subtotal', 'food_details']

    def get_food_details(self, obj):
        if obj.food:
            return {
                'id': obj.food.id,
                'name': obj.food.name,
            }
        return None


class OrderPaymentHistoryCardSerializer(serializers.ModelSerializer):
    kitchen_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'created_at',
            'status',
            'order_type',
            'total_amount',
            'final_amount',
            'kitchen_details',
        ]

    def get_kitchen_details(self, obj):
        if obj.micro_kitchen:
            return {
                'id': obj.micro_kitchen.id,
                'brand_name': obj.micro_kitchen.brand_name,
            }
        return None


class OrderPaymentHistoryDetailSerializer(serializers.ModelSerializer):
    items = OrderPaymentHistoryItemSerializer(many=True, read_only=True)
    kitchen_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'created_at',
            'status',
            'order_type',
            'total_amount',
            'final_amount',
            'kitchen_details',
            'items',
        ]

    def get_kitchen_details(self, obj):
        if obj.micro_kitchen:
            return {
                'id': obj.micro_kitchen.id,
                'brand_name': obj.micro_kitchen.brand_name,
            }
        return None


class DeliveryChargeSlabSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryChargeSlab
        fields = ['id', 'micro_kitchen', 'min_km', 'max_km', 'charge']
        extra_kwargs = {
            # Micro-kitchen users omit this; viewset sets it in perform_create.
            'micro_kitchen': {'required': False, 'allow_null': True},
        }

    def validate(self, attrs):
        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None
        role = getattr(user, 'role', None)
        if self.instance is None and role == 'admin' and attrs.get('micro_kitchen') is None:
            raise serializers.ValidationError(
                {'micro_kitchen': 'This field is required when creating as admin.'}
            )

        min_km = attrs.get('min_km')
        max_km = attrs.get('max_km')
        if self.instance:
            if min_km is None:
                min_km = self.instance.min_km
            if max_km is None:
                max_km = self.instance.max_km
        if min_km is not None and max_km is not None and min_km > max_km:
            raise serializers.ValidationError({'min_km': 'Must be less than or equal to max_km.'})
        return attrs


class SupplyChainOrderListSerializer(serializers.ModelSerializer):
    """
    Minimal fields for supply-chain assigned orders table (list only).
    Full detail uses OrderSerializer via retrieve on the same viewset.
    """

    customer_name = serializers.SerializerMethodField()
    customer_mobile = serializers.CharField(source="user.mobile", read_only=True, allow_null=True)
    kitchen_name = serializers.CharField(source="micro_kitchen.brand_name", read_only=True, allow_null=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "customer_mobile",
            "kitchen_name",
            "order_type",
            "status",
            "final_amount",
            "created_at",
        ]

    def get_customer_name(self, obj):
        u = obj.user
        if not u:
            return ""
        parts = [u.first_name or "", u.last_name or ""]
        return " ".join(p for p in parts if p).strip() or ""


class MicroKitchenOrderListSerializer(serializers.ModelSerializer):
    """
    Minimal fields for micro-kitchen order table (list only).
    Full detail uses OrderSerializer via retrieve on MicroKitchenOrdersViewSet.
    """

    customer_name = serializers.SerializerMethodField()
    customer_mobile = serializers.CharField(source="user.mobile", read_only=True, allow_null=True)
    delivery_person_details = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "customer_name",
            "customer_mobile",
            "order_type",
            "status",
            "final_amount",
            "created_at",
            "delivery_person",
            "delivery_person_details",
        ]

    def get_delivery_person_details(self, obj):
        if not obj.delivery_person:
            return None
        dp = obj.delivery_person
        return {
            "id": dp.id,
            "first_name": dp.first_name or "",
            "last_name": dp.last_name or "",
            "mobile": getattr(dp, "mobile", None),
        }

    def get_customer_name(self, obj):
        u = obj.user
        if not u:
            return ""
        parts = [u.first_name or "", u.last_name or ""]
        return " ".join(p for p in parts if p).strip() or ""


class OrderSummarySerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField(read_only=True)
    kitchen_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'order_type', 'created_at', 
            'user_details', 'kitchen_details'
        ]

    def get_user_details(self, obj):
        if obj.user:
            u = obj.user
            return {
                'id': u.id,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'mobile': u.mobile,
            }
        return None

    def get_kitchen_details(self, obj):
        if obj.micro_kitchen:
            mk = obj.micro_kitchen
            return {
                'id': mk.id,
                'brand_name': mk.brand_name,
            }
        return None


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_details = serializers.SerializerMethodField(read_only=True)
    kitchen_details = serializers.SerializerMethodField(read_only=True)
    ratings = MicroKitchenRatingSerializer(many=True, read_only=True)
    delivery_slab_details = serializers.SerializerMethodField(read_only=True)
    delivery_person_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_details', 'micro_kitchen', 'kitchen_details',
            'order_type', 'status',
            'total_amount', 'delivery_distance_km', 'delivery_charge', 'delivery_slab',
            'delivery_slab_details', 'final_amount',
            'delivery_address',
            'delivery_lat_lng_address',
            'delivery_person', 'delivery_person_details',
            'items', 'ratings', 'created_at',
        ]
        extra_kwargs = {
            # Assigned only via assign-delivery-person action (not open PATCH from clients).
            'delivery_person': {'read_only': True},
        }

    def get_user_details(self, obj):
        if obj.user:
            u = obj.user
            lat = getattr(u, 'latitude', None)
            lng = getattr(u, 'longitude', None)
            return {
                'id': u.id,
                'first_name': u.first_name,
                'last_name': u.last_name,
                'mobile': u.mobile,
                'latitude': float(lat) if lat is not None else None,
                'longitude': float(lng) if lng is not None else None,
            }
        return None

    def get_kitchen_details(self, obj):
        if obj.micro_kitchen:
            mk = obj.micro_kitchen
            ku = getattr(mk, 'user', None)
            lat = getattr(ku, 'latitude', None) if ku else None
            lng = getattr(ku, 'longitude', None) if ku else None
            return {
                'id': mk.id,
                'brand_name': mk.brand_name,
                'latitude': float(lat) if lat is not None else None,
                'longitude': float(lng) if lng is not None else None,
            }
        return None

    def get_delivery_slab_details(self, obj):
        s = getattr(obj, 'delivery_slab', None)
        if not s:
            return None
        return {
            'id': s.id,
            'min_km': str(s.min_km),
            'max_km': str(s.max_km),
            'charge': str(s.charge),
        }

    def get_delivery_person_details(self, obj):
        dp = getattr(obj, 'delivery_person', None)
        if not dp:
            return None
        return {
            'id': dp.id,
            'first_name': dp.first_name or '',
            'last_name': dp.last_name or '',
            'mobile': dp.mobile or '',
        }


class AdminMicroKitchenOrderSummarySerializer(serializers.ModelSerializer):
    """Lightweight order serializer for admin list view."""
    user_name = serializers.SerializerMethodField(read_only=True)
    item_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_type', 'status', 'final_amount', 'created_at',
            'user_name', 'item_count'
        ]

    def get_user_name(self, obj):
        if obj.user:
            return f"{obj.user.first_name or obj.user.username} {obj.user.last_name or ''}".strip()
        return "N/A"

    def get_item_count(self, obj):
        return obj.items.count()


class AdminMicroKitchenOrderDetailSerializer(serializers.ModelSerializer):
    """Full detail order serializer for admin by-id view."""
    items = OrderItemSerializer(many=True, read_only=True)
    user_details = serializers.SerializerMethodField(read_only=True)
    kitchen_details = serializers.SerializerMethodField(read_only=True)
    delivery_person_details = serializers.SerializerMethodField(read_only=True)
    delivery_slab_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_details', 'micro_kitchen', 'kitchen_details',
            'order_type', 'status', 'total_amount', 'delivery_charge', 'final_amount',
            'delivery_address', 'delivery_person', 'delivery_person_details',
            'delivery_slab', 'delivery_slab_details',
            'items', 'created_at'
        ]

    def get_user_details(self, obj):
        u = obj.user
        if not u: return None
        return {
            'id': u.id,
            'name': f"{u.first_name or u.username} {u.last_name or ''}".strip(),
            'mobile': u.mobile,
            'address': obj.delivery_address
        }

    def get_kitchen_details(self, obj):
        mk = obj.micro_kitchen
        if not mk: return None
        return {
            'id': mk.id,
            'brand_name': mk.brand_name
        }

    def get_delivery_person_details(self, obj):
        dp = getattr(obj, 'delivery_person', None)
        if not dp:
            return None
        return {
            'id': dp.id,
            'first_name': dp.first_name or '',
            'last_name': dp.last_name or '',
            'mobile': dp.mobile or '',
        }

    def get_delivery_slab_details(self, obj):
        s = getattr(obj, 'delivery_slab', None)
        if not s:
            return None
        return {
            'id': s.id,
            'min_km': str(s.min_km),
            'max_km': str(s.max_km),
            'charge': str(s.charge),
        }




class AdminSupplyChainOrderRowSerializer(serializers.ModelSerializer):
    """Admin dossier: order totals, split snapshot, and delivery receipt flag."""

    kitchen_brand = serializers.CharField(source="micro_kitchen.brand_name", read_only=True, allow_null=True)
    patient_label = serializers.SerializerMethodField()
    payment_snapshot = serializers.SerializerMethodField()
    receipt_uploaded = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "status",
            "order_type",
            "total_amount",
            "delivery_charge",
            "final_amount",
            "delivery_distance_km",
            "created_at",
            "kitchen_brand",
            "patient_label",
            "payment_snapshot",
            "receipt_uploaded",
        ]

    def get_patient_label(self, obj):
        u = obj.user
        if not u:
            return None
        name = f"{u.first_name or ''} {u.last_name or ''}".strip()
        return name or getattr(u, "username", None) or getattr(u, "email", None)

    def get_payment_snapshot(self, obj):
        ps = getattr(obj, "payment_snapshot", None)
        if not ps:
            return None
        return {
            "food_subtotal": str(ps.food_subtotal),
            "delivery_charge": str(ps.delivery_charge),
            "grand_total": str(ps.grand_total),
            "platform_amount": str(ps.platform_amount),
            "kitchen_amount": str(ps.kitchen_amount),
            "platform_percent": str(ps.platform_percent),
            "kitchen_percent": str(ps.kitchen_percent),
        }

    def get_receipt_uploaded(self, obj):
        r = getattr(obj, "supply_chain_delivery_receipt", None)
        return bool(r and getattr(r, "receipt_image", None))


class AdminSupplyChainOrderListSerializer(AdminSupplyChainOrderRowSerializer):
    """Admin API: orders assigned to one supply-chain delivery person (list panel)."""

    class Meta(AdminSupplyChainOrderRowSerializer.Meta):
        pass



class AdminSupplyChainOrderPaginatedListSerializer(serializers.ModelSerializer):
    """Minimal fields for paginated admin supply-chain order list."""
    patient_name = serializers.SerializerMethodField()
    kitchen_name = serializers.CharField(source="micro_kitchen.brand_name", read_only=True, allow_null=True)
    order_id = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_id",
            "patient_name",
            "kitchen_name",
            "order_type",
            "status",
            "final_amount",
            "delivery_charge",
            "created_at",
        ]

    def get_order_id(self, obj):
        return f"ORD-{obj.id:05d}"

    def get_patient_name(self, obj):
        u = obj.user
        if not u:
            return "Unknown Guest"
        name = f"{u.first_name or ''} {u.last_name or ''}".strip()
        return name or u.username

class AdminSupplyChainOrderPaginatedDetailSerializer(OrderSerializer):
    """Full detail for a single supply-chain order."""
    pass


class OrderCommissionConfigSerializer(serializers.ModelSerializer):
    """Admin CRUD for global order commission split (platform + kitchen = 100%)."""

    created_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = OrderCommissionConfig
        fields = [
            "id",
            "platform_commission_percent",
            "kitchen_commission_percent",
            "is_active",
            "notes",
            "created_by",
            "created_at",
            "updated_at",
        ]


class AdminOrderPaymentSnapshotSerializer(serializers.ModelSerializer):
    """Admin read-only list of frozen order payment splits."""

    order = serializers.PrimaryKeyRelatedField(read_only=True)
    order_id = serializers.IntegerField(source="order.id", read_only=True)
    order_status = serializers.CharField(source="order.status", read_only=True)
    order_type = serializers.CharField(source="order.order_type", read_only=True)
    order_created_at = serializers.DateTimeField(source="order.created_at", read_only=True)
    customer_display = serializers.SerializerMethodField()

    class Meta:
        model = OrderPaymentSnapshot
        fields = [
            "id",
            "order",
            "order_id",
            "order_status",
            "order_type",
            "order_created_at",
            "customer_display",
            "food_subtotal",
            "delivery_charge",
            "grand_total",
            "platform_percent",
            "kitchen_percent",
            "platform_amount",
            "kitchen_amount",
            "created_at",
        ]

    def get_customer_display(self, obj):
        u = getattr(obj.order, "user", None)
        if not u:
            return ""
        name = f"{(u.first_name or '').strip()} {(u.last_name or '').strip()}".strip()
        return name or getattr(u, "username", None) or ""


class OrderPaymentSnapshotKitchenSerializer(serializers.ModelSerializer):
    """
    Read-only snapshot of platform vs kitchen split for one order (micro kitchen portal).
    """

    order_id = serializers.IntegerField(source="order.id", read_only=True)
    order_status = serializers.CharField(source="order.status", read_only=True)
    order_type = serializers.CharField(source="order.order_type", read_only=True)
    order_created_at = serializers.DateTimeField(source="order.created_at", read_only=True)
    customer_display = serializers.SerializerMethodField()

    class Meta:
        model = OrderPaymentSnapshot
        fields = [
            "id",
            "order_id",
            "order_status",
            "order_type",
            "order_created_at",
            "customer_display",
            "food_subtotal",
            "delivery_charge",
            "grand_total",
            "platform_percent",
            "kitchen_percent",
            "platform_amount",
            "kitchen_amount",
            "created_at",
        ]

    def get_customer_display(self, obj):
        u = getattr(obj.order, "user", None)
        if not u:
            return ""
        name = f"{(u.first_name or '').strip()} {(u.last_name or '').strip()}".strip()
        return name or getattr(u, "username", None) or ""


class SupplyChainDeliveryEarningsListSerializer(serializers.ModelSerializer):
    """Delivered separate orders for the logged-in supply-chain user — delivery charge is their pass-through earning."""

    kitchen_name = serializers.CharField(source="micro_kitchen.brand_name", read_only=True)
    customer_display = serializers.SerializerMethodField()
    delivery_earning = serializers.DecimalField(
        source="delivery_charge", max_digits=10, decimal_places=2, read_only=True
    )
    snapshot_delivery_charge = serializers.SerializerMethodField()
    receipt = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "kitchen_name",
            "customer_display",
            "order_type",
            "status",
            "delivery_earning",
            "snapshot_delivery_charge",
            "final_amount",
            "created_at",
            "receipt",
        ]

    def get_customer_display(self, obj):
        u = getattr(obj, "user", None)
        if not u:
            return ""
        name = f"{(u.first_name or '').strip()} {(u.last_name or '').strip()}".strip()
        return name or getattr(u, "username", None) or ""

    def get_snapshot_delivery_charge(self, obj):
        snap = getattr(obj, "payment_snapshot", None)
        if snap:
            return str(snap.delivery_charge)
        return None

    def get_receipt(self, obj):
        r = getattr(obj, "supply_chain_delivery_receipt", None)
        if not r:
            return None
        request = self.context.get("request")
        url = None
        if r.receipt_image:
            url = r.receipt_image.url
            if request:
                url = request.build_absolute_uri(url)
        return {
            "id": r.id,
            "receipt_image_url": url,
            "notes": r.notes or "",
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        }


class SupplyChainOrderDeliveryReceiptReadSerializer(serializers.ModelSerializer):
    receipt_image_url = serializers.SerializerMethodField()

    class Meta:
        model = SupplyChainOrderDeliveryReceipt
        fields = ["id", "order", "receipt_image_url", "notes", "created_at", "updated_at"]

    def get_receipt_image_url(self, obj):
        if not obj.receipt_image:
            return None
        request = self.context.get("request")
        url = obj.receipt_image.url
        if request:
            return request.build_absolute_uri(url)
        return url


class MicroKitchenSupplyChainPayoutSerializer(serializers.ModelSerializer):
    micro_kitchen_name = serializers.CharField(source="micro_kitchen.brand_name", read_only=True)
    delivery_person_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    plan_name = serializers.SerializerMethodField()
    paid_by_name = serializers.SerializerMethodField()
    payment_screenshot_url = serializers.SerializerMethodField()

    class Meta:
        model = MicroKitchenSupplyChainPayout
        fields = [
            "id",
            "micro_kitchen",
            "micro_kitchen_name",
            "delivery_person",
            "delivery_person_name",
            "user_diet_plan",
            "plan_name",
            "patient",
            "patient_name",
            "amount",
            "status",
            "period_from",
            "period_to",
            "notes",
            "transaction_reference",
            "payment_screenshot",
            "payment_screenshot_url",
            "paid_on",
            "paid_by",
            "paid_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["micro_kitchen", "paid_by", "paid_on", "created_at", "updated_at"]

    def _user_label(self, user):
        if not user:
            return ""
        full_name = f"{(user.first_name or '').strip()} {(user.last_name or '').strip()}".strip()
        return full_name or (user.username or "")

    def get_delivery_person_name(self, obj):
        return self._user_label(obj.delivery_person)

    def get_patient_name(self, obj):
        return self._user_label(obj.patient)

    def get_plan_name(self, obj):
        plan = getattr(obj, "user_diet_plan", None)
        if not plan:
            return ""
        dp = getattr(plan, "diet_plan", None)
        return getattr(dp, "title", None) or f"Plan #{plan.id}"

    def get_paid_by_name(self, obj):
        return self._user_label(obj.paid_by)

    def get_payment_screenshot_url(self, obj):
        if not obj.payment_screenshot:
            return None
        request = self.context.get("request")
        url = obj.payment_screenshot.url
        if request:
            return request.build_absolute_uri(url)
        return url

    def validate(self, attrs):
        plan = attrs.get("user_diet_plan") or getattr(self.instance, "user_diet_plan", None)
        patient = attrs.get("patient") or getattr(self.instance, "patient", None)
        if plan and patient and getattr(plan, "user_id", None) and plan.user_id != patient.id:
            raise serializers.ValidationError(
                {"patient": "Selected patient does not belong to the selected diet plan."}
            )
        return attrs


class MicroKitchenSupplyChainPayoutListSerializer(serializers.ModelSerializer):
    delivery_person_name = serializers.SerializerMethodField()
    patient_name = serializers.SerializerMethodField()
    plan_name = serializers.SerializerMethodField()

    class Meta:
        model = MicroKitchenSupplyChainPayout
        fields = [
            "id",
            "delivery_person",
            "delivery_person_name",
            "patient",
            "patient_name",
            "user_diet_plan",
            "plan_name",
            "period_from",
            "period_to",
            "amount",
            "status",
            "created_at",
        ]

    def _user_label(self, user):
        if not user:
            return ""
        full_name = f"{(user.first_name or '').strip()} {(user.last_name or '').strip()}".strip()
        return full_name or (user.username or "")

    def get_delivery_person_name(self, obj):
        return self._user_label(obj.delivery_person)

    def get_patient_name(self, obj):
        return self._user_label(obj.patient)

    def get_plan_name(self, obj):
        plan = getattr(obj, "user_diet_plan", None)
        if not plan:
            return ""
        dp = getattr(plan, "diet_plan", None)
        return getattr(dp, "title", None) or f"Plan #{plan.id}"


class SupplyChainPayoutEarningsListSerializer(serializers.ModelSerializer):
    micro_kitchen_name = serializers.CharField(source="micro_kitchen.brand_name", read_only=True)
    patient_name = serializers.SerializerMethodField()
    plan_name = serializers.SerializerMethodField()
    payment_screenshot_url = serializers.SerializerMethodField()

    class Meta:
        model = MicroKitchenSupplyChainPayout
        fields = [
            "id",
            "micro_kitchen_name",
            "patient",
            "patient_name",
            "plan_name",
            "period_from",
            "period_to",
            "amount",
            "status",
            "transaction_reference",
            "payment_screenshot_url",
            "created_at",
            "paid_on",
        ]

    def _user_label(self, user):
        if not user:
            return ""
        full_name = f"{(user.first_name or '').strip()} {(user.last_name or '').strip()}".strip()
        return full_name or (user.username or "")

    def get_patient_name(self, obj):
        return self._user_label(obj.patient)

    def get_plan_name(self, obj):
        plan = getattr(obj, "user_diet_plan", None)
        if not plan:
            return ""
        dp = getattr(plan, "diet_plan", None)
        return getattr(dp, "title", None) or f"Plan #{plan.id}"

    def get_payment_screenshot_url(self, obj):
        if not obj.payment_screenshot:
            return None
        request = self.context.get("request")
        url = obj.payment_screenshot.url
        if request:
            return request.build_absolute_uri(url)
        return url


class SupplyChainPayoutProofUpdateSerializer(serializers.ModelSerializer):
    payment_screenshot_url = serializers.SerializerMethodField()

    class Meta:
        model = MicroKitchenSupplyChainPayout
        fields = [
            "id",
            "transaction_reference",
            "payment_screenshot",
            "payment_screenshot_url",
            "updated_at",
        ]

    def get_payment_screenshot_url(self, obj):
        if not obj.payment_screenshot:
            return None
        request = self.context.get("request")
        url = obj.payment_screenshot.url
        if request:
            return request.build_absolute_uri(url)
        return url


class AdminPatientListSerializer(serializers.ModelSerializer):
    """Summary row for admin patient directory (role=patient users)."""

    has_questionnaire = serializers.SerializerMethodField()
    health_reports_count = serializers.SerializerMethodField()
    active_plan_title = serializers.SerializerMethodField()
    active_plan_status = serializers.SerializerMethodField()
    city_display = serializers.SerializerMethodField()
    state_display = serializers.SerializerMethodField()
    country_display = serializers.SerializerMethodField()
    active_kitchen_name = serializers.SerializerMethodField()
    active_nutritionist_name = serializers.SerializerMethodField()

    class Meta:
        model = UserRegister
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'mobile',
            'is_active', 'is_patient_mapped', 'created_on',
            'has_questionnaire', 'health_reports_count',
            'active_plan_title', 'active_plan_status',
            'active_kitchen_name', 'active_nutritionist_name',
            'address', 'zip_code', 'city_display', 'state_display', 'country_display',
        ]

    def get_has_questionnaire(self, obj):
        if hasattr(obj, '_has_q'):
            return obj._has_q
        return UserQuestionnaire.objects.filter(user=obj).exists()

    def get_health_reports_count(self, obj):
        if hasattr(obj, '_hr_count'):
            return obj._hr_count
        return obj.health_reports.count()

    def _first_active_plan(self, obj):
        plans = getattr(obj, '_active_diet_plans', None)
        if plans:
            return plans[0]
        return UserDietPlan.objects.filter(user=obj, status='active').select_related('diet_plan').order_by('-id').first()

    def get_active_plan_title(self, obj):
        p = self._first_active_plan(obj)
        if p and p.diet_plan:
            return p.diet_plan.title
        return None

    def get_active_plan_status(self, obj):
        p = self._first_active_plan(obj)
        return p.status if p else None

    def get_active_kitchen_name(self, obj):
        p = self._first_active_plan(obj)
        if p and p.micro_kitchen:
            return p.micro_kitchen.brand_name
        return None

    def get_active_nutritionist_name(self, obj):
        p = self._first_active_plan(obj)
        if p and p.nutritionist:
            return f"{p.nutritionist.first_name} {p.nutritionist.last_name}".strip() or p.nutritionist.username
        return None

    def get_city_display(self, obj):
        return obj.city.name if obj.city else None

    def get_state_display(self, obj):
        return obj.state.name if obj.state else None

    def get_country_display(self, obj):
        return obj.country.name if obj.country else None


class AdminPatientDetailSerializer(serializers.ModelSerializer):
    """
    Full patient dossier for admin: questionnaire, health reports, nutritionist reviews,
    diet plans, active plan, and allotted meals (food + packaging material).
    """

    questionnaire = serializers.SerializerMethodField()
    health_reports = serializers.SerializerMethodField()
    nutritionist_reviews = serializers.SerializerMethodField()
    assigned_nutritionist = serializers.SerializerMethodField()
    diet_plans = serializers.SerializerMethodField()
    active_diet_plan = serializers.SerializerMethodField()
    meals_for_active_plan = serializers.SerializerMethodField()
    city_display = serializers.SerializerMethodField()
    state_display = serializers.SerializerMethodField()
    country_display = serializers.SerializerMethodField()

    class Meta:
        model = UserRegister
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'mobile', 'whatsapp',
            'dob', 'gender', 'photo', 'address', 'zip_code', 'city', 'city_display',
            'state', 'state_display', 'country', 'country_display',
            'latitude', 'longitude', 'joined_date', 'is_active', 'is_patient_mapped', 'created_on',
            'questionnaire', 'health_reports', 'nutritionist_reviews', 'assigned_nutritionist',
            'diet_plans', 'active_diet_plan', 'meals_for_active_plan',
        ]

    def get_questionnaire(self, obj):
        q = UserQuestionnaire.objects.filter(user=obj).first()
        if not q:
            return None
        return UserQuestionnaireSerializer(q).data

    def get_health_reports(self, obj):
        qs = PatientHealthReport.objects.filter(user=obj).order_by('-uploaded_on')
        return PatientHealthReportSerializer(qs, many=True).data

    def get_nutritionist_reviews(self, obj):
        qs = NutritionistReview.objects.filter(user=obj).select_related('nutritionist').prefetch_related(
            'reports'
        ).order_by('-created_on')
        return NutritionistReviewSerializer(qs, many=True).data

    def get_assigned_nutritionist(self, obj):
        m = UserNutritionistMapping.objects.select_related('nutritionist').filter(
            user=obj, is_active=True
        ).first()
        if not m:
            return None
        n = m.nutritionist
        return {
            'mapping_id': m.id,
            'assigned_on': m.assigned_on,
            'nutritionist': {
                'id': n.id,
                'username': n.username,
                'first_name': n.first_name,
                'last_name': n.last_name,
                'email': n.email,
                'mobile': n.mobile,
            },
        }

    def get_diet_plans(self, obj):
        qs = UserDietPlan.objects.filter(user=obj).select_related(
            'nutritionist', 'diet_plan', 'micro_kitchen', 'review'
        ).prefetch_related('diet_plan__features').order_by('-suggested_on')
        return UserDietPlanSerializer(qs, many=True).data

    def get_active_diet_plan(self, obj):
        p = UserDietPlan.objects.filter(user=obj, status='active').select_related(
            'nutritionist', 'diet_plan', 'micro_kitchen', 'review'
        ).prefetch_related('diet_plan__features').first()
        if not p:
            return None
        return UserDietPlanSerializer(p).data

    def get_meals_for_active_plan(self, obj):
        p = UserDietPlan.objects.filter(user=obj, status='active').first()
        if not p:
            return []
        meals = UserMeal.objects.filter(user_diet_plan=p).select_related(
            'meal_type', 'food', 'packaging_material'
        ).order_by('meal_date', 'meal_type_id')
        return UserMealSerializer(meals, many=True).data

    def get_city_display(self, obj):
        return obj.city.name if obj.city else None

    def get_state_display(self, obj):
        return obj.state.name if obj.state else None

    def get_country_display(self, obj):
        return obj.country.name if obj.country else None


class AdminMicroKitchenPatientSlotSerializer(serializers.ModelSerializer):
    """
    Shows information for a patient slot/allotment in kitchen logistics.
    """
    patient_details = serializers.SerializerMethodField()
    diet_plan_details = serializers.SerializerMethodField()
    nutritionist_details = serializers.SerializerMethodField()
    original_nutritionist_details = serializers.SerializerMethodField()
    original_micro_kitchen_details = serializers.SerializerMethodField()
    patient_questionnaire = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()
    delivery_slots_details = serializers.SerializerMethodField()

    class Meta:
        model = UserDietPlan
        fields = [
            'id', 'status', 'suggested_on', 'approved_on', 'start_date', 'end_date',
            'patient_details', 'diet_plan_details', 'nutritionist_details',
            'patient_questionnaire', 'nutritionist_notes',
            'original_nutritionist_details', 'nutritionist_effective_from',
            'original_micro_kitchen_details', 'micro_kitchen_effective_from',
            'distance_km', 'delivery_slots_details'
        ]

    def get_patient_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'email': obj.user.email,
                'mobile': obj.user.mobile,
                'address': obj.user.address,
            }
        return None

    def get_diet_plan_details(self, obj):
        if obj.diet_plan:
            return {
                'id': obj.diet_plan.id,
                'plan_name': obj.diet_plan.title,
                'no_of_days': obj.diet_plan.no_of_days,
                'start_date': obj.start_date,
                'end_date': obj.end_date,
            }
        return None

    def get_nutritionist_details(self, obj):
        if obj.nutritionist:
            return {
                'id': obj.nutritionist.id,
                'first_name': obj.nutritionist.first_name,
                'last_name': obj.nutritionist.last_name,
            }
        return None

    def get_original_nutritionist_details(self, obj):
        if obj.original_nutritionist:
            return {
                'id': obj.original_nutritionist.id,
                'first_name': obj.original_nutritionist.first_name,
                'last_name': obj.original_nutritionist.last_name,
            }
        return None

    def get_original_micro_kitchen_details(self, obj):
        if obj.original_micro_kitchen:
            return {
                'id': obj.original_micro_kitchen.id,
                'brand_name': obj.original_micro_kitchen.brand_name,
            }
        return None

    def get_patient_questionnaire(self, obj):
        q = UserQuestionnaire.objects.filter(user=obj.user).first()
        if q:
            return UserQuestionnaireSerializer(q).data
        return None

    def get_distance_km(self, obj):
        target_mk_id = self.context.get('target_micro_kitchen_id')
        patient_user = obj.user
        
        if not target_mk_id or not patient_user or not patient_user.latitude or not patient_user.longitude:
            return None
        
        try:
            from .models import MicroKitchenProfile
            mk = MicroKitchenProfile.objects.filter(id=target_mk_id).select_related('user').first()
            if not mk or not mk.user or not mk.user.latitude or not mk.user.longitude:
                return None
            
            lat1, lon1 = mk.user.latitude, mk.user.longitude
            lat2, lon2 = patient_user.latitude, patient_user.longitude
            
            import math
            R = 6371.0
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            return round(R * c, 2)
        except:
            return None

    def get_delivery_slots_details(self, obj):
        # Get delivery slots from the related DietPlanDeliveryAssignment
        assignment = getattr(obj, 'delivery_assignment', None)
        if assignment and assignment.delivery_slots.exists():
            return DeliverySlotSerializer(assignment.delivery_slots.all(), many=True).data
        return []


class AdminMicroKitchenPatientCardSerializer(serializers.ModelSerializer):
    """
    Slim admin serializer for the modal cards in "Allotted Patients & Slots".
    Includes only the fields currently rendered by the frontend.
    """

    patient_details = serializers.SerializerMethodField()
    diet_plan_details = serializers.SerializerMethodField()
    nutritionist_details = serializers.SerializerMethodField()
    original_nutritionist_details = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()
    delivery_slots_details = serializers.SerializerMethodField()

    class Meta:
        model = UserDietPlan
        fields = [
            "id",
            "status",
            "start_date",
            "end_date",
            "patient_details",
            "diet_plan_details",
            "nutritionist_details",
            "original_nutritionist_details",
            "nutritionist_effective_from",
            "distance_km",
            "delivery_slots_details",
        ]

    def get_patient_details(self, obj):
        if obj.user:
            return {
                "id": obj.user.id,
                "first_name": obj.user.first_name,
                "last_name": obj.user.last_name,
            }
        return None

    def get_diet_plan_details(self, obj):
        if obj.diet_plan:
            return {
                "plan_name": obj.diet_plan.title,
            }
        return None

    def get_nutritionist_details(self, obj):
        if obj.nutritionist:
            return {
                "first_name": obj.nutritionist.first_name,
                "last_name": obj.nutritionist.last_name,
            }
        return None

    def get_original_nutritionist_details(self, obj):
        if obj.original_nutritionist:
            return {
                "first_name": obj.original_nutritionist.first_name,
                "last_name": obj.original_nutritionist.last_name,
            }
        return None

    def get_distance_km(self, obj):
        target_mk_id = self.context.get("target_micro_kitchen_id")
        patient_user = obj.user

        if not target_mk_id or not patient_user or not patient_user.latitude or not patient_user.longitude:
            return None

        try:
            from .models import MicroKitchenProfile

            mk = MicroKitchenProfile.objects.filter(id=target_mk_id).select_related("user").first()
            if not mk or not mk.user or not mk.user.latitude or not mk.user.longitude:
                return None

            lat1, lon1 = mk.user.latitude, mk.user.longitude
            lat2, lon2 = patient_user.latitude, patient_user.longitude

            import math

            R = 6371.0
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return round(R * c, 2)
        except Exception:
            return None

    def get_delivery_slots_details(self, obj):
        assignment = getattr(obj, "delivery_assignment", None)
        if assignment and assignment.delivery_slots.exists():
            return [
                {"id": slot.id, "name": slot.name}
                for slot in assignment.delivery_slots.all()
            ]
        return []


class MicroKitchenPatientSummarySerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing patients in the sidebar.
    """
    patient_details = serializers.SerializerMethodField()
    diet_plan_details = serializers.SerializerMethodField()
    nutritionist_details = serializers.SerializerMethodField()

    class Meta:
        model = UserDietPlan
        fields = [
            'id',
            'status',
            'start_date',
            'end_date',
            'patient_details',
            'diet_plan_details',
            'nutritionist_details',
        ]

    def get_patient_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'email': obj.user.email,
            }
        return None

    def get_diet_plan_details(self, obj):
        return {
            'plan_name': obj.diet_plan.title if obj.diet_plan else "No Plan"
        }

    def get_nutritionist_details(self, obj):
        n = getattr(obj, 'nutritionist', None)
        if not n:
            return None
        return {
            'id': n.id,
            'first_name': n.first_name or '',
            'last_name': n.last_name or '',
            'email': n.email or '',
        }


class AdminNutritionistDetailSerializer(serializers.ModelSerializer):
    """
    Detailed dossier for admin: profile info, assigned patients, suggested plans,
    meals allotted, and meeting requests.
    """
    profile = serializers.SerializerMethodField()
    assigned_patients = serializers.SerializerMethodField()
    suggested_plans = serializers.SerializerMethodField()
    meals_allotted = serializers.SerializerMethodField()
    meeting_requests = serializers.SerializerMethodField()

    city_display = serializers.SerializerMethodField()
    state_display = serializers.SerializerMethodField()
    country_display = serializers.SerializerMethodField()

    class Meta:
        model = UserRegister
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'mobile',
            'whatsapp', 'dob', 'gender', 'photo', 'address', 'zip_code',
            'city', 'city_display', 'state', 'state_display', 'country', 'country_display',
            'joined_date', 'is_active', 'created_on',
            'profile', 'assigned_patients', 'suggested_plans', 'meals_allotted', 'meeting_requests',
        ]

    def get_profile(self, obj):
        try:
            from .models import NutritionistProfile
            profile = NutritionistProfile.objects.filter(user=obj).first()
            if profile:
                return NutritionistProfileSerializer(profile).data
        except:
            pass
        return None

    def get_assigned_patients(self, obj):
        mappings = UserNutritionistMapping.objects.filter(nutritionist=obj, is_active=True).select_related('user')
        return [
            {
                'id': m.user.id,
                'first_name': m.user.first_name,
                'last_name': m.user.last_name,
                'email': m.user.email,
                'mobile': m.user.mobile,
                'assigned_on': m.assigned_on,
            } for m in mappings
        ]

    def get_suggested_plans(self, obj):
        plans = UserDietPlan.objects.filter(nutritionist=obj).select_related('user', 'diet_plan', 'micro_kitchen')
        return UserDietPlanSerializer(plans, many=True).data

    def get_meals_allotted(self, obj):
        # All meals created by this nutritionist (linked via user_diet_plan)
        meals = UserMeal.objects.filter(user_diet_plan__nutritionist=obj).select_related('user', 'food', 'meal_type')
        return UserMealSerializer(meals, many=True).data

    def get_meeting_requests(self, obj):
        meetings = MeetingRequest.objects.filter(nutritionist=obj).select_related('patient')
        return MeetingRequestSerializer(meetings, many=True).data

    def get_city_display(self, obj):
        return obj.city.name if obj.city else None

    def get_state_display(self, obj):
        return obj.state.name if obj.state else None

    def get_country_display(self, obj):
        return obj.country.name if obj.country else None


# ── Support Tickets ───────────────────────────────────────────────────────────

class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserRegister
        fields = ["id", "username", "first_name", "last_name", "role", "mobile"]


class TicketCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TicketCategory
        fields = ["id", "name"]


class SupportTicketSerializer(serializers.ModelSerializer):
    created_by_details = UserSummarySerializer(source="created_by", read_only=True)
    assigned_to_details = UserSummarySerializer(source="assigned_to", read_only=True)
    category_details = TicketCategorySerializer(source="category", read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            "id",
            "created_by",
            "created_by_details",
            "assigned_to",
            "assigned_to_details",
            "category",
            "category_details",
            "user_type",
            "target_user_type",
            "title",
            "description",
            "status",
            "priority",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_by", "user_type", "created_at", "updated_at"]


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_details = UserSummarySerializer(source="sender", read_only=True)

    class Meta:
        model = TicketMessage
        fields = [
            "id",
            "ticket",
            "sender",
            "sender_details",
            "message",
            "is_internal",
            "created_at",
        ]
        read_only_fields = ["sender", "created_at"]


class TicketAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_details = UserSummarySerializer(source="uploaded_by", read_only=True)

    class Meta:
        model = TicketAttachment
        fields = [
            "id",
            "ticket",
            "uploaded_by",
            "uploaded_by_details",
            "file",
            "uploaded_at",
        ]
        read_only_fields = ["uploaded_by", "uploaded_at"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "title",
            "body",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "user",
            "title",
            "body",
            "created_at",
        ]


# --- Diet plan delivery (micro kitchen / admin) ---


class UserDietPlanDeliverySummarySerializer(serializers.ModelSerializer):
    diet_plan_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserDietPlan
        fields = ["id", "status", "start_date", "end_date", "diet_plan_name"]

    def get_diet_plan_name(self, obj):
        if getattr(obj, "diet_plan_id", None) and obj.diet_plan:
            return getattr(obj.diet_plan, "title", None) or None
        return None


class MicroKitchenDeliveryTeamSerializer(serializers.ModelSerializer):
    # Explicit field so validation does not require it on create (set in view for micro_kitchen users).
    delivery_person_details = UserSummarySerializer(source="delivery_person", read_only=True)

    class Meta:
        model = MicroKitchenDeliveryTeam
        fields = [
            "id",
            "micro_kitchen",
            "delivery_person",
            "delivery_person_details",
            "role",
            "is_active",
            "zone_name",
            "pincode",
            "assigned_on",
        ]
        read_only_fields = ["id", "assigned_on"]
        extra_kwargs = {
            "micro_kitchen": {"required": False, "allow_null": True}
        }
        validators = [] # Removed to allow micro_kitchen to be set in perform_create

    def validate_delivery_person(self, value):
        if getattr(value, "role", None) != "supply_chain":
            raise serializers.ValidationError("Only supply-chain users can be added to team.")
        return value


class AdminSupplyChainKitchenTeamRowSerializer(serializers.ModelSerializer):
    """Read-only: micro kitchen context for a delivery team membership."""

    micro_kitchen_details = serializers.SerializerMethodField()

    class Meta:
        model = MicroKitchenDeliveryTeam
        fields = [
            "id",
            "role",
            "is_active",
            "zone_name",
            "pincode",
            "assigned_on",
            "micro_kitchen_details",
        ]

    def get_micro_kitchen_details(self, obj):
        mk = obj.micro_kitchen
        if not mk:
            return None
        return {
            "id": mk.id,
            "brand_name": mk.brand_name,
            "kitchen_code": mk.kitchen_code,
        }


class AdminSupplyChainKitchenTeamListSerializer(AdminSupplyChainKitchenTeamRowSerializer):
    """Admin API: micro-kitchen team rows for one supply-chain user."""

    class Meta(AdminSupplyChainKitchenTeamRowSerializer.Meta):
        pass


class DeliverySlotSerializer(serializers.ModelSerializer):
    micro_kitchen_brand = serializers.CharField(
        source="micro_kitchen.brand_name", read_only=True, allow_null=True
    )

    class Meta:
        model = DeliverySlot
        fields = ["id", "name", "start_time", "end_time", "micro_kitchen", "micro_kitchen_brand"]


class DietPlanDeliveryAssignmentLogSerializer(serializers.ModelSerializer):
    previous_delivery_person_details = UserSummarySerializer(source="previous_delivery_person", read_only=True)
    new_delivery_person_details = UserSummarySerializer(source="new_delivery_person", read_only=True)
    changed_by_details = UserSummarySerializer(source="changed_by", read_only=True)

    class Meta:
        model = DietPlanDeliveryAssignmentLog
        fields = [
            "id",
            "previous_delivery_person",
            "previous_delivery_person_details",
            "new_delivery_person",
            "new_delivery_person_details",
            "reason",
            "notes",
            "effective_from",
            "changed_on",
            "changed_by",
            "changed_by_details",
        ]


class MicroKitchenGlobalAssignmentSummarySerializer(serializers.ModelSerializer):
    """Collapsed card + list: patient, plan meta, reassignment count only."""

    patient_details = serializers.SerializerMethodField()
    user_diet_plan_details = serializers.SerializerMethodField()
    reassignment_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = DietPlanDeliveryAssignment
        fields = ["id", "user_diet_plan", "patient_details", "user_diet_plan_details", "reassignment_count"]

    def get_patient_details(self, obj):
        u = obj.user
        if not u:
            return None
        return {"id": u.id, "first_name": u.first_name or "", "last_name": u.last_name or ""}

    def get_user_diet_plan_details(self, obj):
        p = obj.user_diet_plan
        if not p:
            return None
        return {
            "id": p.id,
            "status": p.status,
            "start_date": p.start_date,
            "end_date": p.end_date,
            "diet_plan_name": p.diet_plan.title if p.diet_plan else None,
        }


class MicroKitchenDeliveryDashboardAllottedPlanSerializer(serializers.ModelSerializer):
    """Kitchen patient table: minimal fields, no delivery assignment payload."""

    patient_details = serializers.SerializerMethodField()
    diet_plan_name = serializers.SerializerMethodField()
    nutritionist_name = serializers.SerializerMethodField()
    has_global_assignment = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserDietPlan
        fields = [
            "id",
            "status",
            "start_date",
            "end_date",
            "patient_details",
            "diet_plan_name",
            "nutritionist_name",
            "has_global_assignment",
        ]

    def get_patient_details(self, obj):
        u = obj.user
        if not u:
            return None
        return {
            "id": u.id,
            "first_name": u.first_name or "",
            "last_name": u.last_name or "",
            "email": u.email or "",
        }

    def get_diet_plan_name(self, obj):
        return obj.diet_plan.title if obj.diet_plan else "—"

    def get_nutritionist_name(self, obj):
        n = obj.nutritionist
        if not n:
            return None
        s = f"{n.first_name or ''} {n.last_name or ''}".strip()
        return s or None


class DietPlanDeliveryAssignmentSerializer(serializers.ModelSerializer):
    user_diet_plan_details = UserDietPlanDeliverySummarySerializer(source="user_diet_plan", read_only=True)
    delivery_person_details = UserSummarySerializer(source="delivery_person", read_only=True)
    patient_details = UserSummarySerializer(source="user", read_only=True)
    default_slot_details = DeliverySlotSerializer(source="default_slot", read_only=True)
    delivery_slots_details = DeliverySlotSerializer(source="delivery_slots", many=True, read_only=True)
    delivery_slot_ids = serializers.SerializerMethodField(read_only=True)
    slot_delivery_assignments = serializers.SerializerMethodField(read_only=True)
    change_logs = DietPlanDeliveryAssignmentLogSerializer(many=True, read_only=True)

    class Meta:
        model = DietPlanDeliveryAssignment
        fields = [
            "id",
            "user_diet_plan",
            "user_diet_plan_details",
            "user",
            "patient_details",
            "micro_kitchen",
            "delivery_person",
            "delivery_person_details",
            "default_slot",
            "default_slot_details",
            "delivery_slots_details",
            "delivery_slot_ids",
            "slot_delivery_assignments",
            "change_logs",
            "is_active",
            "assigned_on",
            "notes",
        ]
        read_only_fields = ["user", "micro_kitchen", "assigned_on", "user_diet_plan"]

    def get_delivery_slot_ids(self, obj):
        return list(obj.delivery_slots.values_list("id", flat=True).order_by("id"))

    def get_slot_delivery_assignments(self, obj):
        rows = (
            obj.slot_delivery_persons.select_related("delivery_slot", "delivery_person")
            .order_by("delivery_slot_id")
        )
        out = []
        for r in rows:
            out.append(
                {
                    "delivery_slot_id": r.delivery_slot_id,
                    "delivery_slot_details": DeliverySlotSerializer(r.delivery_slot).data,
                    "delivery_person_id": r.delivery_person_id,
                    "delivery_person_details": UserSummarySerializer(r.delivery_person).data
                    if r.delivery_person
                    else None,
                }
            )
        return out


class MicroKitchenGlobalAssignmentDetailSerializer(DietPlanDeliveryAssignmentSerializer):
    """Expanded card: same nested data as full serializer without internal FK noise."""

    class Meta(DietPlanDeliveryAssignmentSerializer.Meta):
        fields = [
            "id",
            "user_diet_plan",
            "user_diet_plan_details",
            "patient_details",
            "delivery_person",
            "delivery_person_details",
            "default_slot",
            "default_slot_details",
            "delivery_slots_details",
            "delivery_slot_ids",
            "slot_delivery_assignments",
            "change_logs",
            "is_active",
            "assigned_on",
            "notes",
        ]
        read_only_fields = ["assigned_on", "user_diet_plan"]


class AdminSupplyChainPlanDeliveryAssignmentListSerializer(DietPlanDeliveryAssignmentSerializer):
    """
    Admin API: diet-plan delivery assignments for one supply-chain user
    (allotted patients / slots). Same payload as DietPlanDeliveryAssignmentSerializer.
    """

    class Meta(DietPlanDeliveryAssignmentSerializer.Meta):
        pass


class KitchenMealDeliverySerializer(serializers.ModelSerializer):
    delivery_person_details = UserSummarySerializer(source="delivery_person", read_only=True)
    delivery_slot_details = DeliverySlotSerializer(source="delivery_slot", read_only=True)
    user_meal_details = serializers.SerializerMethodField()
    reassigned_from_details = serializers.SerializerMethodField()

    class Meta:
        model = DeliveryAssignment
        fields = [
            "id",
            "user_meal",
            "user_meal_details",
            "plan_delivery_assignment",
            "delivery_person",
            "delivery_person_details",
            "delivery_slot",
            "delivery_slot_details",
            "status",
            "scheduled_date",
            "scheduled_time",
            "picked_up_at",
            "delivered_at",
            "delivery_notes",
            "is_active",
            "reassigned_from",
            "reassigned_from_details",
            "reassignment_reason",
        ]
        extra_kwargs = {
            "status": {"required": False},
            "picked_up_at": {"required": False, "allow_null": True},
            "delivered_at": {"required": False, "allow_null": True},
            "delivery_notes": {"required": False, "allow_null": True},
        }
        read_only_fields = [
            "id",
            "user_meal",
            "user_meal_details",
            "plan_delivery_assignment",
            "delivery_person",
            "delivery_person_details",
            "delivery_slot",
            "delivery_slot_details",
            "scheduled_date",
            "scheduled_time",
            "is_active",
            "reassignment_reason",
        ]

    def get_user_meal_details(self, obj):
        um = obj.user_meal
        if not um:
            return None
        u = um.user
        mk = um.micro_kitchen
        mt = um.meal_type
        food = um.food
        return {
            "id": um.id,
            "meal_date": str(um.meal_date),
            "meal_type": mt.name if mt else None,
            "meal_type_details": {"name": mt.name} if mt else None,
            "patient_name": (
                f"{u.first_name or ''} {u.last_name or ''}".strip() or u.username
            ),
            "kitchen_brand": mk.brand_name if mk else "",
            "user_details": {
                "first_name": u.first_name or "",
                "last_name": u.last_name or "",
                "mobile": getattr(u, "mobile", None) or "",
                "address": getattr(u, "address", None) or "",
                "latitude": getattr(u, "latitude", None),
                "longitude": getattr(u, "longitude", None),
            },
            "food_details": {"name": food.name} if food else None,
            "food_name": food.name if food else None,
            "micro_kitchen_details": {
                "brand_name": mk.brand_name if mk else "",
                "address": getattr(mk, "address", None) or "" if mk else "",
            }
            if mk
            else None,
        }

    def get_reassigned_from_details(self, obj):
        u = obj.reassigned_from
        if not u:
            return None
        return {
            "id": u.id,
            "first_name": u.first_name or "",
            "last_name": u.last_name or "",
        }


class SupplyChainDeliveryLeaveSerializer(serializers.ModelSerializer):
    user_details = UserSummarySerializer(source="user", read_only=True)

    class Meta:
        model = SupplyChainDeliveryLeave
        fields = [
            "id",
            "user",
            "user_details",
            "leave_type",
            "start_date",
            "end_date",
            "start_time",
            "end_time",
            "notes",
            "kitchen_handling_status",
            "created_on",
        ]
        read_only_fields = ["user", "created_on"]

    def validate(self, attrs):
        if self.instance and self.partial:
            # PATCH only `kitchen_handling_status` (micro kitchen) must not run leave rules or
            # inject start_time/end_time — that would add extra keys and fail permission checks.
            leave_field_keys = {
                "leave_type",
                "start_date",
                "end_date",
                "start_time",
                "end_time",
                "notes",
            }
            if not (set(attrs.keys()) & leave_field_keys):
                return attrs
            leave_type = attrs["leave_type"] if "leave_type" in attrs else self.instance.leave_type
            start_date = attrs["start_date"] if "start_date" in attrs else self.instance.start_date
            end_date = attrs["end_date"] if "end_date" in attrs else self.instance.end_date
            start_time = attrs["start_time"] if "start_time" in attrs else self.instance.start_time
            end_time = attrs["end_time"] if "end_time" in attrs else self.instance.end_time
        else:
            leave_type = attrs.get("leave_type")
            start_date = attrs.get("start_date")
            end_date = attrs.get("end_date")
            start_time = attrs.get("start_time")
            end_time = attrs.get("end_time")

        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("end_date must be on or after start_date.")

        if leave_type == "partial":
            if start_date and end_date and start_date != end_date:
                raise serializers.ValidationError("Partial leave must be for a single date.")
            if not start_time or not end_time:
                raise serializers.ValidationError("start_time and end_time are required for partial leave.")
            if end_time <= start_time:
                raise serializers.ValidationError("end_time must be after start_time.")
        elif leave_type == "full_day":
            attrs["start_time"] = None
            attrs["end_time"] = None
        return attrs


class AdminSupplyChainPlannedLeaveListSerializer(SupplyChainDeliveryLeaveSerializer):
    """Admin API: planned leave rows for one supply-chain user (read list)."""

    class Meta(SupplyChainDeliveryLeaveSerializer.Meta):
        pass


class PatientFoodRecommendationSerializer(serializers.ModelSerializer):
    patient_details = serializers.SerializerMethodField(read_only=True)
    food_details = serializers.SerializerMethodField(read_only=True)
    meal_time_details = serializers.SerializerMethodField(read_only=True)
    recommended_by_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PatientFoodRecommendation
        fields = [
            "id",
            "patient",
            "patient_details",
            "food",
            "food_details",
            "quantity",
            "meal_time",
            "meal_time_details",
            "notes",
            "comment",
            "recommended_by",
            "recommended_by_details",
            "recommended_on",
        ]
        read_only_fields = ["id", "recommended_by", "recommended_on", "recommended_by_details", "patient_details", "food_details", "meal_time_details"]

    def get_patient_details(self, obj):
        u = obj.patient
        if not u:
            return None
        return {
            "id": u.id,
            "first_name": u.first_name or "",
            "last_name": u.last_name or "",
            "email": u.email or "",
        }

    def get_food_details(self, obj):
        f = obj.food
        if not f:
            return None
        request = self.context.get('request')
        image_url = f.image.url if f.image else None
        if image_url and request:
            image_url = request.build_absolute_uri(image_url)
        return {"id": f.id, "name": f.name, "code": f.code, "image": image_url}

    def get_meal_time_details(self, obj):
        m = obj.meal_time
        if not m:
            return None
        return {"id": m.id, "name": m.name}

    def get_recommended_by_details(self, obj):
        u = obj.recommended_by
        if not u:
            return None
        return {
            "id": u.id,
            "first_name": u.first_name or "",
            "last_name": u.last_name or "",
        }

    def validate_patient(self, value):
        if getattr(value, "role", None) != "patient":
            raise serializers.ValidationError("Selected user must be a patient.")
        return value


class DeliveryPersonOrderSerializer(serializers.ModelSerializer):
    customer_display = serializers.SerializerMethodField()
    micro_kitchen_brand = serializers.CharField(source='micro_kitchen.brand_name', read_only=True)
    grand_total = serializers.DecimalField(source='final_amount', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'status', 'order_type', 'created_at', 'grand_total', 
            'delivery_charge', 'customer_display', 'micro_kitchen_brand'
        ]

    def get_customer_display(self, obj):
        u = obj.user
        if u:
            return f"{u.first_name} {u.last_name}".strip() or u.username
        return "Unknown"

class DeliveryPersonPaymentSerializer(serializers.ModelSerializer):
    customer_display = serializers.SerializerMethodField()
    order_created_at = serializers.DateTimeField(source='order.created_at', read_only=True)
    order_status = serializers.CharField(source='order.status', read_only=True)
    order_type = serializers.CharField(source='order.order_type', read_only=True)

    class Meta:
        model = OrderPaymentSnapshot
        fields = [
            'id', 'order_id', 'order_status', 'order_type', 'order_created_at',
            'customer_display', 'food_subtotal', 'delivery_charge', 'grand_total',
            'kitchen_amount', 'created_at'
        ]

    def get_customer_display(self, obj):
        order = obj.order
        if not order: return "N/A"
        u = order.user
        if u:
            return f"{u.first_name} {u.last_name}".strip() or u.username
        return "Unknown"

class DeliveryPersonMealAssignmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='user_meal.user.first_name', read_only=True)
    meal_date = serializers.DateField(source='user_meal.meal_date', read_only=True)
    meal_type = serializers.CharField(source='user_meal.meal_type.name', read_only=True)
    food_name = serializers.CharField(source='user_meal.food.name', read_only=True)
    slot_name = serializers.CharField(source='delivery_slot.name', read_only=True)
    slot_start = serializers.TimeField(source='delivery_slot.start_time', read_only=True)
    slot_end = serializers.TimeField(source='delivery_slot.end_time', read_only=True)

    class Meta:
        model = DeliveryAssignment
        fields = [
            'id', 'user_meal', 'status', 'patient_name', 'meal_date', 
            'meal_type', 'food_name', 'slot_name', 'slot_start', 'slot_end',
            'reassignment_reason'
        ]

class DeliveryPersonLeaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupplyChainDeliveryLeave
        fields = ['id', 'leave_type', 'start_date', 'end_date', 'start_time', 'end_time', 'notes', 'kitchen_handling_status']

class DeliveryPersonFeedbackSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.SerializerMethodField()
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    user_meal_id = serializers.IntegerField(source='user_meal.id', read_only=True)

    class Meta:
        model = SupplyChainDeliveryFeedback
        fields = [
            'id', 'feedback_type', 'rating', 'review', 'issue_type', 
            'description', 'created_at', 'reported_by_name', 
            'order_id', 'user_meal_id'
        ]

    def get_reported_by_name(self, obj):
        u = obj.reported_by
        if u:
            return f"{u.first_name} {u.last_name}".strip() or u.username
        return "Customer"

class DeliveryPersonGlobalAssignmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    diet_plan_name = serializers.CharField(source='user_diet_plan.diet_plan.name', read_only=True)
    start_date = serializers.DateField(source='user_diet_plan.start_date', read_only=True)
    end_date = serializers.DateField(source='user_diet_plan.end_date', read_only=True)
    default_slot_name = serializers.CharField(source='default_slot.name', read_only=True)
    delivery_slots_details = serializers.SerializerMethodField()

    class Meta:
        model = DietPlanDeliveryAssignment
        fields = [
            'id', 'patient_name', 'diet_plan_name', 'start_date', 
            'end_date', 'default_slot_name', 'delivery_slots_details'
        ]

    def get_patient_name(self, obj):
        p = obj.user # In DietPlanDeliveryAssignment, 'user' is the patient
        if p:
            return f"{p.first_name} {p.last_name}".strip() or p.username
        return "Patient"

    def get_delivery_slots_details(self, obj):
        return [{"id": s.id, "name": s.name} for s in obj.delivery_slots.all()]

class MicroKitchenIngredientUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = MicroKitchenIngredientUnit
        fields = '__all__'

class MicroKitchenIngredientSerializer(serializers.ModelSerializer):
    unit_name = serializers.ReadOnlyField(source='unit.unit')
    
    class Meta:
        model = MicroKitchenIngredient
        fields = '__all__'

class InventoryIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.ReadOnlyField(source='ingredient.name')
    unit_name = serializers.ReadOnlyField(source='ingredient.unit.unit')
    kitchen_name = serializers.ReadOnlyField(source='micro_kitchen.brand_name')

    class Meta:
        model = InventoryIngredient
        fields = '__all__'
        read_only_fields = ['micro_kitchen']
