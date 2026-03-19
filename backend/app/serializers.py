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
            'zip_code',
            'state',
            'country',
            'joined_date',
            'is_active',
            'created_on',
            'is_patient_mapped',
            'password',
            'password_confirm',
        ]
        read_only_fields = ['created_on']

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
    current_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    new_password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    
    class Meta:
        model = UserRegister
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'current_password',
            'new_password'
        ]
        extra_kwargs = {
            'current_password': {'write_only': True},
            'new_password': {'write_only': True},
        }
    
    def validate(self, attrs):
        """Validate that the current password is correct"""
        current_password = attrs.get('current_password')
        if current_password and self.instance:
            if not self.instance.check_password(current_password):
                raise serializers.ValidationError({
                    'current_password': 'Current password is incorrect.'
                })
        return attrs
        
    def update(self, instance, validated_data):
        # Remove password fields from validated_data
        current_password = validated_data.pop('current_password', None)
        new_password = validated_data.pop('new_password', None)
        validated_data.pop('password_confirm', None)
        
        # Update regular fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password only if new_password is provided
        if new_password:
            instance.set_password(new_password)
        
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
                  'sodium', 'potassium', 'calcium', 'iron', 'vitamin_a', 'vitamin_c', 'vitamin_d', 'vitamin_b12']

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


# ── Role Questionnaires / Profiles ─────────────────────────────────────────────

class UserQuestionnaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserQuestionnaire
        fields = "__all__"


class NutritionistProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionistProfile
        fields = "__all__"


class MicroKitchenProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MicroKitchenProfile
        fields = "__all__"


class DeliveryProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryProfile
        fields = "__all__"


class UserNutritionistMappingSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserNutritionistMapping
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

