from decimal import Decimal

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
            'is_patient_mapped',
            'password',
            'password_confirm',
        ]
        read_only_fields = ['created_on', 'city_name', 'state_name', 'country_name']

    def get_city_name(self, obj):
        return obj.city.name if obj.city else None

    def get_state_name(self, obj):
        return obj.state.name if obj.state else None

    def get_country_name(self, obj):
        return obj.country.name if obj.country else None

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
            'dob', 'gender', 'photo', 'address', 'city',
            'zip_code', 'state', 'country', 'latitude', 'longitude',
            'joined_date', 'is_active', 'created_on'
        ]
        read_only_fields = ['id', 'username', 'email', 'role', 'joined_date', 'is_active', 'created_on']
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


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
    class Meta:
        model = MealType
        fields = "__all__"

    def validate_name(self, value):
        query = MealType.objects.filter(name__iexact=value.strip())
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("A meal type with this name already exists.")
        return value


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
    class Meta:
        model = CuisineType
        fields = "__all__"

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


class IngredientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ingredient
        fields = "__all__"

    def validate_name(self, value):
        query = Ingredient.objects.filter(name__iexact=value.strip())
        if self.instance:
            query = query.exclude(id=self.instance.id)
        if query.exists():
            raise serializers.ValidationError("An ingredient with this name already exists.")
        return value


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = "__all__"

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

    class Meta:
        model = FoodIngredient
        fields = ['id', 'food', 'ingredient', 'ingredient_name',
                  'quantity', 'unit', 'unit_name', 'notes',
                  'food_name_input', 'ingredient_name_input', 'unit_name_input']
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

    class Meta:
        model = FoodStep
        fields = "__all__"
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
    calories = serializers.FloatField(write_only=True, required=False)
    protein = serializers.FloatField(write_only=True, required=False)
    carbs = serializers.FloatField(write_only=True, required=False)
    fat = serializers.FloatField(write_only=True, required=False)
    fiber = serializers.FloatField(write_only=True, required=False)
    serving_size = serializers.CharField(write_only=True, required=False)

    glycemic_index = serializers.FloatField(write_only=True, required=False)
    sugar = serializers.FloatField(write_only=True, required=False)
    saturated_fat = serializers.FloatField(write_only=True, required=False)
    trans_fat = serializers.FloatField(write_only=True, required=False)
    cholesterol = serializers.FloatField(write_only=True, required=False)
    sodium = serializers.FloatField(write_only=True, required=False)
    potassium = serializers.FloatField(write_only=True, required=False)
    calcium = serializers.FloatField(write_only=True, required=False)
    iron = serializers.FloatField(write_only=True, required=False)
    vitamin_a = serializers.FloatField(write_only=True, required=False)
    vitamin_c = serializers.FloatField(write_only=True, required=False)
    vitamin_d = serializers.FloatField(write_only=True, required=False)
    vitamin_b12 = serializers.FloatField(write_only=True, required=False)

    class Meta:
        model = Food
        fields = ['id', 'name', 'meal_types', 'meal_type_names', 'cuisine_types', 'cuisine_type_names',
                  'description', 'image', 'ingredients', 'steps', 'nutrition',
                  'meal_type_names_input', 'cuisine_type_names_input',
                  'calories', 'protein', 'carbs', 'fat', 'fiber', 'serving_size',
                  'glycemic_index', 'sugar', 'saturated_fat', 'trans_fat', 'cholesterol',
                  'sodium', 'potassium', 'calcium', 'iron', 'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_b12', 'price']

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


class NormalRangeForHealthParameterSerializer(serializers.ModelSerializer):
    health_parameter_name = serializers.CharField(source='health_parameter.name', read_only=True)
    health_parameter_name_input = serializers.CharField(write_only=True, required=False)
    health_parameter = serializers.PrimaryKeyRelatedField(queryset=HealthParameter.objects.all(), required=False)
    
    class Meta:
        model = NormalRangeForHealthParameter
        fields = "__all__"

    def create(self, validated_data):
        hp_name = validated_data.pop('health_parameter_name_input', None)
        if not hp_name:
            hp_name = validated_data.get('health_parameter_name', None)
        if not hp_name:
            hp_name = 'Unknown Parameter'
        hp, _ = HealthParameter.objects.get_or_create(name=hp_name.strip())
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

    def get_payout_trackers(self, obj):
        rows = []
        for t in obj.payouts.all().order_by("payout_type", "id"):
            rem = max(t.total_amount - t.paid_amount, Decimal("0"))
            recipient = "—"
            if t.payout_type == PayoutTracker.PAYOUT_TYPE_PLATFORM:
                recipient = "Miisky (platform)"
            elif t.payout_type == PayoutTracker.PAYOUT_TYPE_NUTRITIONIST and t.nutritionist:
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

class UserQuestionnaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuestionnaire
        fields = "__all__"


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
    class Meta:
        model = DeliveryProfile
        fields = "__all__"


class UserNutritionistMappingSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField(read_only=True)
    nutritionist_details = serializers.SerializerMethodField(read_only=True)
    reassignment_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserNutritionistMapping
        fields = [
            'id', 'user', 'nutritionist', 'assigned_on', 'is_active',
            'user_details', 'nutritionist_details', 'reassignment_details',
        ]

    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'username': obj.user.username,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
                'email': obj.user.email,
                'mobile': obj.user.mobile,
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
    previous_nutritionist_name = serializers.CharField(source="previous_nutritionist.username", read_only=True)
    new_nutritionist_name = serializers.CharField(source="new_nutritionist.username", read_only=True)
    reassigned_by_name = serializers.CharField(source="reassigned_by.username", read_only=True)

    class Meta:
        model = NutritionistReassignment
        fields = "__all__"


class MicroKitchenReassignmentSerializer(serializers.ModelSerializer):
    previous_kitchen_name = serializers.CharField(source="previous_kitchen.brand_name", read_only=True)
    new_kitchen_name = serializers.CharField(source="new_kitchen.brand_name", read_only=True)
    reassigned_by_name = serializers.CharField(source="reassigned_by.username", read_only=True)

    class Meta:
        model = MicroKitchenReassignment
        fields = "__all__"


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
        fields = "__all__"

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
        # Return reviews where this report is included
        from .models import NutritionistReview
        revs = obj.reviews.all().order_by('-created_on')
        return [
            {
                "id": r.id, 
                "comments": r.comments, 
                "created_on": r.created_on,
                "nutritionist_name": f"{r.nutritionist.first_name} {r.nutritionist.last_name}" if r.nutritionist else "Unknown"
            } 
            for r in revs
        ]


class NutritionistReviewSerializer(serializers.ModelSerializer):
    report_details = serializers.SerializerMethodField()
    nutritionist_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = NutritionistReview
        fields = [
            'id', 'user', 'nutritionist', 'nutritionist_details', 'reports', 'report_details',
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


class UserMealSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    meal_type_details = serializers.SerializerMethodField()
    food_details = serializers.SerializerMethodField()
    packaging_material_details = serializers.SerializerMethodField()
    micro_kitchen_details = serializers.SerializerMethodField()

    class Meta:
        model = UserMeal
        fields = [
            'id', 'user', 'user_details', 'user_diet_plan', 'meal_type',
            'meal_type_details',
            'food', 'food_details',
            'quantity', 'meal_date', 'is_consumed', 'consumed_at',
            'notes', 'packaging_material', 'packaging_material_details',
            'micro_kitchen', 'micro_kitchen_details', 'created_on'
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


class BulkUserMealSerializer(serializers.ModelSerializer):
    """Serializer for bulk create/update - no UniqueTogetherValidator (handled by update_or_create)."""
    class Meta:
        model = UserMeal
        fields = ['user', 'user_diet_plan', 'meal_type', 'food', 'quantity', 'meal_date', 'notes', 'packaging_material']
        validators = []  # Skip UniqueTogetherValidator - backend uses update_or_create


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

        return super().create(validated_data)

class MicroKitchenRatingSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField(read_only=True)
    kitchen_details = serializers.SerializerMethodField(read_only=True)
    order_type = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MicroKitchenRating
        fields = [
            'id', 'user', 'user_details', 'micro_kitchen', 'kitchen_details',
            'rating', 'review', 'order', 'order_type', 'created_at'
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


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_details = serializers.SerializerMethodField(read_only=True)
    kitchen_details = serializers.SerializerMethodField(read_only=True)
    ratings = MicroKitchenRatingSerializer(many=True, read_only=True)
    delivery_slab_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_details', 'micro_kitchen', 'kitchen_details',
            'order_type', 'status',
            'total_amount', 'delivery_distance_km', 'delivery_charge', 'delivery_slab',
            'delivery_slab_details', 'final_amount',
            'delivery_address',
            'items', 'ratings', 'created_at',
        ]

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

    class Meta:
        model = UserDietPlan
        fields = [
            'id', 'status', 'suggested_on', 'approved_on', 'start_date', 'end_date',
            'patient_details', 'diet_plan_details', 'nutritionist_details',
            'patient_questionnaire', 'nutritionist_notes',
            'original_nutritionist_details', 'nutritionist_effective_from',
            'original_micro_kitchen_details', 'micro_kitchen_effective_from'
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
            return {
                'age': q.age,
                'weight_kg': q.weight_kg,
                'work_type': q.work_type,
                'food_allergy': q.food_allergy,
                'food_allergy_details': q.food_allergy_details,
                'diet_pattern': q.diet_pattern,
                'food_source': q.food_source,
                'has_diabetes': q.has_diabetes,
                'has_bp': q.has_bp,
                'has_cardiac_issues': q.has_cardiac_issues,
                'health_conditions': q.health_conditions,
                'food_preferences': q.food_preferences,
                'consumes_egg': q.consumes_egg,
                'consumes_dairy': q.consumes_dairy,
            }
        return None


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
        fields = ["id", "username", "first_name", "last_name"]


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
        read_only_fields = ["created_by", "created_at", "updated_at"]


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
        fields = ["id", "user", "title", "body", "is_read", "created_at"]
        read_only_fields = ["id", "user", "title", "body", "created_at"]
