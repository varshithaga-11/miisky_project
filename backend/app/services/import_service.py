from django.db import transaction
from django.utils import timezone
from serializers.import_validators import get_model_and_serializer

class ImportService:
    @staticmethod
    def import_data(module, submenu, data, action='analyse'):
        Model, Serializer = get_model_and_serializer(module, submenu)
        
        if not Model or not Serializer:
            return {
                "success": False,
                "message": f"Mapping not found for {module}/{submenu}",
                "created": 0,
                "updated": 0,
                "data": data,
                "errors": [{"row": 0, "errors": ["Mapping configuration missing."]}]
            }

        processed_data = []
        error_rows = []
        valid_rows_data = []
        
        # Get current date for models that have created_at
        current_date = timezone.now().date().isoformat()
        
        # Determine the field to check for duplicates (name or title)
        check_field = None
        existing_values = set()
        
        # Check if the model has a name or title field and fetch existing values
        if hasattr(Model, 'name'):
            check_field = 'name'
        elif hasattr(Model, 'title'):
            check_field = 'title'
        elif hasattr(Model, 'food_name'):
            check_field = 'food_name'
        elif hasattr(Model, 'username'):
            check_field = 'username'
        
        if check_field:
            if check_field == 'food_name':
                # For composition models, existing_values should be names of food items
                existing_values = set(Model.objects.select_related('food_name').values_list('food_name__name', flat=True))
            else:
                existing_values = set(Model.objects.values_list(check_field, flat=True))
        
        # Specific check for join models without single name/title field
        if module == "food":
            if submenu == "recipe":
                from app.models import FoodIngredient
                existing_values = set(FoodIngredient.objects.select_related('food', 'ingredient').values_list('food__name', 'ingredient__name'))
                check_field = ('food_name', 'ingredient_name')
            elif submenu == "food-step":
                from app.models import FoodStep
                existing_values = set(FoodStep.objects.select_related('food').values_list('food__name', 'step_number'))
                check_field = ('food_name', 'step_number')

        # Dynamic mapping for nested fields (Excel Header -> Serializer Field)
        NESTED_FIELD_MAP = {
            'country_name': 'country_name_input',
            'state_name': 'state_name_input',
            'city_name': 'city_name_input',
            'health_parameter_name': 'health_parameter_name_input',
            'category_name': 'category_name_input',
            'food_name': 'food_name_input',
            'food_group_name': 'food_group_name_input',
            'ingredient_name': 'ingredient_name_input',
            'unit_name': 'unit_name_input',
            'meal_type_names': 'meal_type_names_input',
            'cuisine_type_names': 'cuisine_type_names_input',
        }

        for index, row_data in enumerate(data):
            # Map Excel column names to Serializer inputs for nested objects
            # e.g. 'country_name' in Excel becomes 'country_name_input' for the Serializer
            mapped_row_data = row_data.copy()
            
            # --- Capture original values for duplicate checking BEFORE mapping/deletion ---
            orig_vals_for_check = {}
            if check_field:
                if isinstance(check_field, tuple):
                    orig_vals_for_check[check_field[0]] = mapped_row_data.get(check_field[0])
                    orig_vals_for_check[check_field[1]] = mapped_row_data.get(check_field[1])
                else:
                    orig_vals_for_check[check_field] = mapped_row_data.get(check_field)

            for excel_key, serializer_key in NESTED_FIELD_MAP.items():
                if excel_key in mapped_row_data:
                    # Move value to the _input field if not already set
                    if serializer_key not in mapped_row_data:
                        mapped_row_data[serializer_key] = mapped_row_data[excel_key]
                    
                    # IMPORTANT: If the excel_key is the same as a real model field (like 'food_name')
                    # and the value is a string (a name, not a PK), we MUST remove it from mapped_row_data
                    # to prevent DRF from trying to validate it as a PrimaryKeyRelatedField.
                    if excel_key != serializer_key and isinstance(mapped_row_data[excel_key], str):
                        # Only delete if it's not the same key (e.g., 'food_name' -> 'food_name_input')
                        # This prevents the "Incorrect type. Expected pk value, received str" error.
                        del mapped_row_data[excel_key]

            # Inject created_at if not present and the model/serializer might expect it
            if 'created_at' not in mapped_row_data or not mapped_row_data['created_at']:
                if hasattr(Model, 'created_at'):
                    mapped_row_data['created_at'] = current_date

            # Replace NaN/Inf values in numeric fields with None early to prevent JSON errors
            import math
            for key, value in mapped_row_data.items():
                if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
                    mapped_row_data[key] = None

            # Extra validation for NormalRangeForHealthParameter
            if module == "health" and submenu in ["normal-range", "normalrange"]:
                required_fields = ["health_parameter_name", "raw_value", "min_value", "max_value", "unit"]
                missing = [f for f in required_fields if not mapped_row_data.get(f)]
                if missing:
                    row_copy = mapped_row_data.copy()
                    row_copy['errors'] = [f"Missing or invalid: {', '.join(missing)}"]
                    row_copy['is_old'] = False
                    processed_data.append(row_copy)
                    continue

            # Check if this record already exists in the database
            is_old = False
            if check_field:
                if isinstance(check_field, tuple):
                    # Check for join tables (food_name, ingredient_name) or (food_name, step_number)
                    val1 = orig_vals_for_check.get(check_field[0])
                    val2 = orig_vals_for_check.get(check_field[1])
                    if val1 and val2 is not None:
                         # Ensure step_number is integer if that's what's in DB
                        if check_field[1] == 'step_number':
                            try: val2 = int(val2)
                            except: pass
                        if (str(val1), val2) in existing_values:
                            is_old = True
                else:
                    original_val = orig_vals_for_check.get(check_field)
                    if original_val and original_val in existing_values:
                        is_old = True

            serializer = Serializer(data=mapped_row_data)
            row_errors = []
            
            # If it's an old record, mark it as a warning (not a fatal error for submission)
            if is_old:
                # User requested specific phrasing: "Already exists (this will be skipped)"
                row_errors.append("Already exists (this will be skipped)")
            else:
                # Only validate new records via the serializer
                if not serializer.is_valid():
                    # Format errors into a list of strings
                    for field, errors in serializer.errors.items():
                        if isinstance(errors, list):
                            for error in errors:
                                row_errors.append(f"{field}: {error}")
                        else:
                            row_errors.append(f"{field}: {errors}")
            
            # Create a copy for analysis table display
            row_copy = mapped_row_data.copy()
            
            # --- RESTORE original values for display in the analysis table ---
            # If we deleted a field (like 'food_name') because it was a string, 
            # we should put it back for the user to see in the table.
            if check_field:
                if isinstance(check_field, tuple):
                    if check_field[0] not in row_copy:
                        row_copy[check_field[0]] = orig_vals_for_check.get(check_field[0])
                    if check_field[1] not in row_copy:
                        row_copy[check_field[1]] = orig_vals_for_check.get(check_field[1])
                else:
                    if check_field not in row_copy:
                        row_copy[check_field] = orig_vals_for_check.get(check_field)

            row_copy['errors'] = row_errors
            row_copy['is_old'] = is_old
            
            # Add "old" or "new" tag to the name/title field for representation
            if check_field:
                tag = "(Already exists)" if is_old else "(new)"
                target_key = check_field if not isinstance(check_field, tuple) else check_field[0]
                orig_val = row_copy.get(target_key)
                if orig_val:
                    row_copy[target_key] = f"{orig_val} {tag}"
            
            processed_data.append(row_copy)
            
            if row_errors:
                # For submission tracking, we check if there are REAL errors (not just duplicates)
                has_fatal_errors = False
                for err in row_errors:
                    if "Already exists" not in err:
                        has_fatal_errors = True
                        break
                
                if has_fatal_errors:
                    error_rows.append(row_copy)
                else:
                    # If it only has duplicates, we add it to valid_rows_data for display
                    # but we don't put it in error_rows so it doesn't block submission.
                    # HOWEVER, we should NOT add it to valid_rows_data because we want to SKIP it.
                    pass
            else:
                valid_rows_data.append(mapped_row_data)

        # Handle Import (Submission)
        created_count = 0
        if action == 'submit' and not error_rows:
            try:
                with transaction.atomic():
                    for row_data in valid_rows_data:
                        # Clean up any tags we might have added during analysis representation
                        # though valid_rows_data should technically be the clean original ones
                        clean_row = row_data.copy()
                        if check_field and check_field in clean_row:
                            val = str(clean_row[check_field])
                            if " (old)" in val:
                                val = val.replace(" (old)", "")
                            if " (new)" in val:
                                val = val.replace(" (new)", "")
                            clean_row[check_field] = val

                        serializer = Serializer(data=clean_row)
                        if serializer.is_valid():
                            instance = serializer.save()
                            created_count += 1
                            # Create FoodStep records from 'steps' column if present
                            steps_str = clean_row.get('steps', '')
                            if steps_str and hasattr(instance, 'food') and instance.food:
                                from app.models import FoodStep
                                steps_list = [s.strip() for s in steps_str.split(';') if s.strip()]
                                for idx, step_text in enumerate(steps_list, start=1):
                                    FoodStep.objects.update_or_create(
                                        food=instance.food,
                                        step_number=idx,
                                        defaults={"instruction": step_text}
                                    )
                        else:
                            # If it somehow fails now, raise the specific errors
                            raise Exception(f"Row validation failed: {serializer.errors}")
            except Exception as e:
                return {
                    "success": False,
                    "message": f"Error during import: {str(e)}",
                    "created": 0,
                    "updated": 0,
                    "data": processed_data,
                    "errors": [{"row": 0, "errors": [str(e)]}]
                }

            return {
                "success": True,
                "message": f"Successfully imported {created_count} records!",
                "created": created_count,
                "updated": 0,
                "data": [],
                "errors": []
            }

        # Otherwise, return analysis result
        duplicates = sum(1 for r in processed_data if r.get('is_old'))
        msg = f'Analysis complete for {submenu}.'
        if error_rows:
            msg += f' {len(error_rows)} fatal errors found.'
        if duplicates:
            msg += f' {duplicates} records Already exists (this will be skipped).'
        msg += f' {len(valid_rows_data)} new records ready for import.'

        return {
            'success': len(error_rows) == 0,
            'message': msg,
            'created': len(valid_rows_data),
            'updated': 0,
            'data': processed_data,
            'errors': error_rows
        }
