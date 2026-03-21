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
            'photo_platform', 'latitude', 'longitude', 'status', 
            'rating', 'total_reviews',
            'user_details', 'latest_inspection'
        ]

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

    class Meta:
        model = NutritionistReview
        fields = [
            'id', 'user', 'nutritionist', 'reports', 'report_details', 
            'comments', 'created_on'
        ]

    def get_report_details(self, obj):
        return [
            {"id": r.id, "title": r.title}
            for r in obj.reports.all()
        ]


class UserDietPlanSerializer(serializers.ModelSerializer):
    diet_plan_details = serializers.SerializerMethodField()
    user_details = serializers.SerializerMethodField()
    nutritionist_details = serializers.SerializerMethodField()
    review_details = serializers.SerializerMethodField()

    class Meta:
        model = UserDietPlan
        fields = [
            'id', 'user', 'user_details', 'nutritionist', 'nutritionist_details',
            'diet_plan', 'diet_plan_details', 'review', 'review_details',
            'nutritionist_notes', 'status', 'user_feedback', 'decision_on',
            'amount_paid', 'transaction_id', 'payment_status',
            'start_date', 'end_date',
            'suggested_on', 'approved_on', 'created_on', 'updated_on'
        ]
        read_only_fields = ['suggested_on', 'approved_on', 'created_on', 'updated_on']

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


class UserMealSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField()
    meal_type_details = serializers.SerializerMethodField()
    cuisine_type_details = serializers.SerializerMethodField()
    food_details = serializers.SerializerMethodField()

    class Meta:
        model = UserMeal
        fields = [
            'id', 'user', 'user_details', 'user_diet_plan', 'meal_type', 
            'meal_type_details', 'cuisine_type', 'cuisine_type_details', 
            'food', 'food_details',
            'quantity', 'meal_date', 'is_consumed', 'consumed_at', 
            'notes', 'created_on'
        ]
        read_only_fields = ['created_on']

    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
                'last_name': obj.user.last_name,
            }
        return None

    def get_meal_type_details(self, obj):
        if obj.meal_type:
            return {
                'id': obj.meal_type.id,
                'name': obj.meal_type.name,
            }
        return None

    def get_cuisine_type_details(self, obj):
        if obj.cuisine_type:
            return {
                'id': obj.cuisine_type.id,
                'name': obj.cuisine_type.name,
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


class MeetingRequestSerializer(serializers.ModelSerializer):
    patient_details = serializers.SerializerMethodField(read_only=True)
    nutritionist_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MeetingRequest
        fields = [
            'id', 'patient', 'patient_details', 'nutritionist', 'nutritionist_details',
            'user_diet_plan', 'preferred_date', 'preferred_time', 'reason',
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


class UserMicroKitchenMappingSerializer(serializers.ModelSerializer):
    patient_details = serializers.SerializerMethodField(read_only=True)
    patient_questionnaire = serializers.SerializerMethodField(read_only=True)
    nutritionist_details = serializers.SerializerMethodField(read_only=True)
    kitchen_details = serializers.SerializerMethodField(read_only=True)
    diet_plan_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = UserMicroKitchenMapping
        fields = [
            'id', 'patient', 'patient_details', 'patient_questionnaire', 'nutritionist', 'nutritionist_details',
            'micro_kitchen', 'kitchen_details', 'diet_plan', 'diet_plan_details',
            'status', 'suggested_at', 'responded_at', 'is_active'
        ]
        read_only_fields = ['id', 'suggested_at', 'responded_at']

    def get_patient_details(self, obj):
        if obj.patient:
            return {
                'id': obj.patient.id,
                'first_name': obj.patient.first_name or obj.patient.username,
                'last_name': obj.patient.last_name,
                'email': obj.patient.email,
                'mobile': obj.patient.mobile,
                'address': obj.patient.address,
            }
        return None

    def get_patient_questionnaire(self, obj):
        if obj.patient:
            try:
                # Local import to avoid circular dependency
                from .serializers import UserQuestionnaireSerializer
                q = obj.patient.userquestionnaire
                return UserQuestionnaireSerializer(q).data
            except:
                return None
        return None

    def get_nutritionist_details(self, obj):
        if obj.nutritionist:
            return {
                'id': obj.nutritionist.id,
                'first_name': obj.nutritionist.first_name,
                'last_name': obj.nutritionist.last_name,
            }
        return None

    def get_kitchen_details(self, obj):
        if obj.micro_kitchen:
            user = obj.micro_kitchen.user
            return {
                'id': obj.micro_kitchen.id,
                'brand_name': obj.micro_kitchen.brand_name,
                'cuisine_type': obj.micro_kitchen.cuisine_type,
                'photo_exterior': obj.micro_kitchen.photo_exterior.url if obj.micro_kitchen.photo_exterior else None,
                'city': user.city.name if user and user.city else None,
                'state': user.state.name if user and user.state else None,
            }
        return None

    def get_diet_plan_details(self, obj):
        if obj.diet_plan:
            return {
                'id': obj.diet_plan.id,
                'plan_name': obj.diet_plan.diet_plan.title if obj.diet_plan.diet_plan else "Custom-Plan",
                'start_date': obj.diet_plan.start_date,
                'end_date': obj.diet_plan.end_date,
            }
        return None


class MicroKitchenRatingSerializer(serializers.ModelSerializer):
    user_details = serializers.SerializerMethodField(read_only=True)
    kitchen_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = MicroKitchenRating
        fields = [
            'id', 'user', 'user_details', 'micro_kitchen', 'kitchen_details',
            'rating', 'review', 'order', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']

    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name or obj.user.username,
                'last_name': obj.user.last_name,
            }
        return None

    def get_kitchen_details(self, obj):
        if obj.micro_kitchen:
            return {
                'id': obj.micro_kitchen.id,
                'brand_name': obj.micro_kitchen.brand_name,
            }
        return None


class CartItemSerializer(serializers.ModelSerializer):
    food_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CartItem
        fields = ['id', 'cart', 'food', 'food_details', 'quantity']

    def get_food_details(self, obj):
        if obj.food:
            return {
                'id': obj.food.id,
                'name': obj.food.name,
                'image': obj.food.image.url if obj.food.image else None,
                'price': obj.food.price,
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


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_details = serializers.SerializerMethodField(read_only=True)
    kitchen_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_details', 'micro_kitchen', 'kitchen_details',
            'order_type', 'status', 'total_amount', 'delivery_address',
            'items', 'created_at'
        ]

    def get_user_details(self, obj):
        if obj.user:
            return {
                'id': obj.user.id,
                'first_name': obj.user.first_name,
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

