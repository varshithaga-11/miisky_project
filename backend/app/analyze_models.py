import re
import os

# List of tables from the SQL dump (parsed manually from the first message)
sql_tables = [
    'add_recepe_dev_entry_three', 'add_recepe_dev_entry_two', 'blog', 'call_back', 'cart', 'category', 'chef_patient_food', 
    'chef_recipies', 'details', 'diet_food_style_add', 'diet_food_style_data_add', 'diet_food_style_master', 
    'diet_plan_master', 'diet_qualification_details', 'diet_svasthfood_group_master', 'diet_svasth_food_group_add', 
    'diet_svasth_group_add_data', 'feedback', 'health_food_plan', 'images', 'ipaddress_likes_map', 'likes', 'my_pages', 
    'patient_history', 'products', 'products_upload_image', 'sales', 'tbl_amino_acids', 'tbl_blogs_dietitian', 
    'tbl_call_center', 'tbl_call_center_add', 'tbl_carotenoid', 'tbl_chef_feedback', 'tbl_city', 'tbl_comments_add', 
    'tbl_community', 'tbl_company_status', 'tbl_composition_index', 'tbl_cooking_instruction', 'tbl_country', 
    'tbl_create_dietician', 'tbl_days', 'tbl_develop_schedule', 'tbl_dietician', 'tbl_dietician_comment', 
    'tbl_dietician_dislike_parameter', 'tbl_dietician_like_parameter', 'tbl_dietplan_add_master_table', 
    'tbl_dietplan_master_table', 'tbl_diet_add_snacks', 'tbl_diet_food_index_data', 'tbl_diet_food_patient_index', 
    'tbl_diet_plans_add', 'tbl_diet_plan_generator_report', 'tbl_diet_snacks', 'tbl_doctors_comment', 'tbl_dos_and_dont', 
    'tbl_ecg_data', 'tbl_fatty_acid', 'tbl_fatty_acid_profile', 'tbl_fat_soluble_vtmns_val', 'tbl_foodstyle_master', 
    'tbl_food_category', 'tbl_food_diet_index_data', 'tbl_food_main_code', 'tbl_food_main_data_add', 'tbl_food_master', 
    'tbl_food_menu', 'tbl_food_packing', 'tbl_food_plan_generator', 'tbl_food_product', 'tbl_food_product_generator', 
    'tbl_food_product_master', 'tbl_food_recepe', 'tbl_food_specification', 'tbl_food_subgroup', 'tbl_healthparameter_master', 
    'tbl_health_conditions', 'tbl_image_list', 'tbl_individual_sugar', 'tbl_ingredients', 'tbl_ingredients_category_master', 
    'tbl_ingredients_master', 'tbl_input_bom', 'tbl_items', 'tbl_languages_known', 'tbl_minerals', 'tbl_nutrition_food', 
    'tbl_nutrition_servining_size', 'tbl_nutrition_val_products', 'tbl_order_sent_logistic', 'tbl_organic_acid', 
    'tbl_packing_instruction', 'tbl_patient_category', 'tbl_patient_food_item', 'tbl_patient_health', 'tbl_patient_order_food', 
    'tbl_patient_satisfaction_index', 'tbl_pat_dislike_food', 'tbl_pay_analysis', 'tbl_pay_biils', 'tbl_phytates', 
    'tbl_polyphenols', 'tbl_proximate_data', 'tbl_proximate_dietary_fiber', 'tbl_questions', 'tbl_question_suggestion_pat', 
    'tbl_rcp_builder', 'tbl_recepe_dev_entry', 'tbl_recipies_master', 'tbl_remainder', 'tbl_remainder_diet', 'tbl_role', 
    'tbl_schedule_other_services', 'tbl_scm_person', 'tbl_scm_person_add', 'tbl_state', 'tbl_status', 'tbl_sub_group', 
    'tbl_sub_item_group', 'tbl_suggestions', 'tbl_suppliers', 'tbl_svasthfood_group_master', 'tbl_svasth_food_category', 
    'tbl_svasth_food_master_data_add', 'tbl_svasth_food_plan_master', 'tbl_svasth_food_style', 'tbl_svasth_healthy_tips', 
    'tbl_svasth_nutrient', 'tbl_svasth_snp_parameters', 'tbl_uom_master', 'tbl_upload_health_chart', 'tbl_upload_kitchen_details', 
    'tbl_upload_report', 'tbl_upload_reports', 'tbl_user_login_details', 'tbl_user_mapping', 'tbl_water_soluble_vtmnsval', 
    'tbl_weeks', 'tutorial', 'users', 'view_rating'
]

file_path = r'd:\varshitha2\miisky_project\backend\app\models.py'
if os.path.exists(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    # Use regex to find all db_table definitions
    db_tables_in_file = re.findall(r"db_table\s*=\s*'([^']+)'", content)

    missing_tables = sorted(list(set(sql_tables) - set(db_tables_in_file)))
    extra_tables = sorted(list(set(db_tables_in_file) - set(sql_tables)))

    print(f"Total tables in SQL dump: {len(sql_tables)}")
    print(f"Total tables in models.py: {len(db_tables_in_file)}")
    print(f"Missing tables: {len(missing_tables)}")
    for table in missing_tables:
        print(f"  - {table}")

    # print(f"Extra tables: {len(extra_tables)}")
    # for table in extra_tables:
    #     print(f"  - {table}")

    # Check for duplicates in models.py
    duplicates = [table for table in db_tables_in_file if db_tables_in_file.count(table) > 1]
    if duplicates:
        print(f"Duplicate tables in models.py: {len(set(duplicates))}")
        for table in set(duplicates):
            print(f"  - {table}")
else:
    print(f"File not found: {file_path}")
