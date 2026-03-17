from django.db import transaction
from typing import List, Dict, Any
from serializers.import_validators import get_model_and_serializer

class ImportService:
    @staticmethod
    def import_data(module_name, submenu_name, data):
        """
        Processes a list of dictionaries and saves them to the database.
        """
        Model, Serializer = get_model_and_serializer(module_name, submenu_name)
        if not Model or not Serializer:
            return {
                "success": False,
                "message": f"Mapping not found for {module_name}/{submenu_name}",
                "created": 0,
                "updated": 0,
                "errors": [{"row": 0, "errors": ["Mapping configuration missing."]}]
            }

        created_count = 0
        updated_count = 0
        errors: List[Dict[str, Any]] = []

        with transaction.atomic():
            for index, row_data in enumerate(data):
                try:
                    # Check for duplicates if 'name' or some unique field exists
                    # This is a simple implementation. For production, you might want more complex logic.
                    instance = None
                    search_field = 'name'
                    
                    # Custom search field logic can be added here
                    if 'id' in row_data and row_data['id']:
                        instance = Model.objects.filter(id=row_data['id']).first()
                    elif search_field in row_data and row_data[search_field]:
                        instance = Model.objects.filter(**{search_field: row_data[search_field]}).first()

                    if instance:
                        serializer = Serializer(instance, data=row_data, partial=True)
                        if serializer.is_valid():
                            serializer.save()
                            updated_count += 1
                        else:
                            errors.append({"row": index + 1, "errors": serializer.errors})
                    else:
                        serializer = Serializer(data=row_data)
                        if serializer.is_valid():
                            serializer.save()
                            created_count += 1
                        else:
                            errors.append({"row": index + 1, "errors": serializer.errors})
                except Exception as e:
                    errors.append({"row": index + 1, "errors": [str(e)]})

        return {
            "success": len(errors) == 0 if data else True,
            "message": "Import processed" if data else "No data to import",
            "created": created_count,
            "updated": updated_count,
            "errors": errors
        }
