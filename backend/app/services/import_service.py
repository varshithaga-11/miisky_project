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
        
        if check_field:
            existing_values = set(Model.objects.values_list(check_field, flat=True))

        # Dynamic mapping for nested fields (Excel Header -> Serializer Field)
        NESTED_FIELD_MAP = {
            'country_name': 'country_name_input',
            'state_name': 'state_name_input',
            'health_parameter_name': 'health_parameter_name_input',
            'category_name': 'category_name_input',
            'food_name': 'food_name_input',
            'ingredient_name': 'ingredient_name_input',
            'unit_name': 'unit_name_input',
            'meal_type_names': 'meal_type_names_input',
            'cuisine_type_names': 'cuisine_type_names_input',
        }

        for index, row_data in enumerate(data):
            # Map Excel column names to Serializer inputs for nested objects
            # e.g. 'country_name' in Excel becomes 'country_name_input' for the Serializer
            mapped_row_data = row_data.copy()
            for excel_key, serializer_key in NESTED_FIELD_MAP.items():
                if excel_key in mapped_row_data and serializer_key not in mapped_row_data:
                    mapped_row_data[serializer_key] = mapped_row_data[excel_key]

            # Inject created_at if not present and the model/serializer might expect it
            if 'created_at' not in mapped_row_data or not mapped_row_data['created_at']:
                if hasattr(Model, 'created_at'):
                    mapped_row_data['created_at'] = current_date

            # Check if this record already exists in the database
            is_old = False
            original_val = mapped_row_data.get(check_field) if check_field else None
            if check_field and original_val and original_val in existing_values:
                is_old = True

            serializer = Serializer(data=mapped_row_data)
            row_errors = []
            
            # If it's an old record, mark it as a warning (not a fatal error for submission)
            if is_old:
                # We still add it to row_errors for the analysis view, 
                # but we'll handle it specifically during submission
                row_errors.append(f"{check_field}: Record already exists (will be skipped).")

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
            row_copy['errors'] = row_errors
            row_copy['is_old'] = is_old
            
            # Add "old" or "new" tag to the name/title field for representation
            if check_field and original_val:
                tag = "(old)" if is_old else "(new)"
                row_copy[check_field] = f"{original_val} {tag}"
            
            processed_data.append(row_copy)
            
            if row_errors:
                # For submission tracking, we check if there are REAL errors (not just duplicates)
                has_fatal_errors = False
                for err in row_errors:
                    if "already exists" not in err:
                        has_fatal_errors = True
                        break
                
                if has_fatal_errors:
                    error_rows.append(row_copy)
                else:
                    # If it only has duplicates, we add it to processed_data for display
                    # but we don't put it in error_rows so it doesn't block submission
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
                                    FoodStep.objects.create(food=instance.food, step_number=idx, instruction=step_text)
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
        return {
            'success': len(error_rows) == 0,
            'message': f'Analysis complete for {submenu}. {len(error_rows)} errors found. {len(valid_rows_data)} new records ready.' if error_rows else f'Analysis complete for {submenu}. All rows checked!',
            'created': len(valid_rows_data),
            'updated': 0,
            'data': processed_data,
            'errors': error_rows
        }
