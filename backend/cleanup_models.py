#!/usr/bin/env python3
"""
Script to remove unwanted models and related code from website app.
"""
import re
import os

def remove_models_from_file(filepath, model_patterns):
    """Remove model definitions and sections from models.py"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_len = len(content)
    
    for pattern in model_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    removed_lines = (original_len - len(content)) // 100
    print(f"[models.py] Removed ~{removed_lines} lines")

def remove_serializers_from_file(filepath, serializer_patterns):
    """Remove serializer classes from serializers.py"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_len = len(content)
    
    for pattern in serializer_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    removed_lines = (original_len - len(content)) // 100
    print(f"[serializers.py] Removed ~{removed_lines} lines")

def remove_viewsets_from_file(filepath, viewset_patterns):
    """Remove ViewSet classes from views.py"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_len = len(content)
    
    for pattern in viewset_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    removed_lines = (original_len - len(content)) // 100
    print(f"[views.py] Removed ~{removed_lines} lines")

def remove_urls_from_file(filepath, url_patterns):
    """Remove router registrations from urls.py"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_len = len(content)
    
    for pattern in url_patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    removed_lines = (original_len - len(content)) // 100
    print(f"[urls.py] Removed ~{removed_lines} lines")

# Models to remove
MODEL_PATTERNS = [
    # Section 3: NavigationMenu
    r'# ===========================================================================\n# 3\. NAVIGATION MENU\n# ===========================================================================\n\nclass NavigationMenu\(models\.Model\):.*?\n\n(?=# ===========================================================================)',
    
    # Section 5: HealthFood*
    r'# ===========================================================================\n# 5\. HEALTH FOOD PRODUCTS\n# ===========================================================================\n\nclass HealthFoodCategory.*?class HealthFoodProduct.*?\n\n(?=# ===========================================================================)',
    
    # Section 6: HealthFoodConcept*
    r'# ===========================================================================\n# 6\. HEALTH FOOD CONCEPT.*?(?=# ===========================================================================\n# 8\.)',
    
    # Section 7: Workflow* (but not WorkflowSubCategory or WorkflowSubItem)
    r'# ===========================================================================\n# 7\. WORKFLOW\n# ===========================================================================\n\nclass WorkflowSection.*?class WorkflowStep.*?\n\n(?=# ===========================================================================\n# 8\.)',
    
    # Section 10: CallbackRequest
    r'# ===========================================================================\n# 10\. CALLBACK REQUESTS\n# ===========================================================================\n\nclass CallbackRequest.*?\n\n(?=# ===========================================================================\n# 11\.)',
    
    # Section 11: ContactInquiry
    r'# ===========================================================================\n# 11\. CONTACT US FORM.*?\n\nclass ContactInquiry.*?\n\n(?=# ===========================================================================\n# 12\.)',
    
    # Section 12: NewsletterSubscriber
    r'# ===========================================================================\n# 12\. NEWSLETTER SUBSCRIBERS\n# ===========================================================================\n\nclass NewsletterSubscriber.*?\n\n(?=# ===========================================================================)',
    
    # Section 13: Testimonial
    r'# ===========================================================================\n# 13\. TESTIMONIALS\n# ===========================================================================\n\nclass Testimonial.*?\n\n(?=# ===========================================================================)',
    
    # Section 19: VisionMission
    r'# ===========================================================================\n# 19\. VISION / MISSION / VALUES\n# ===========================================================================\n\nclass VisionMission.*?\n\n(?=# ===========================================================================)',
    
    # Section 20: AIChatbotConfig
    r'# ===========================================================================\n# 20\. AI CHATBOT CONFIGURATION\n# ===========================================================================\n\nclass AIChatbotConfig.*?\n\n(?=# ===========================================================================)',
    
    # Section 21: StatCounter
    r'# ===========================================================================\n# 21\. STATISTICS.*?\n# ===========================================================================\n\nclass StatCounter.*?\n\n(?=# ===========================================================================)',
    
    # Section 22: MobileAppInfo
    r'# ===========================================================================\n# 22\. MOBILE APP INFORMATION\n# ===========================================================================\n\nclass MobileAppInfo.*?\n\n(?=# ===========================================================================)',
    
    # Section 23: ValueProposition
    r'# ===========================================================================\n# 23\. VALUE PROPOSITION.*?\n# ===========================================================================\n\nclass ValueProposition.*?\n\n(?=# ===========================================================================)',
    
    # Section 24: Product
    r'# ===========================================================================\n# 24\. PRODUCTS.*?\n# ===========================================================================\n\nclass Product.*?\n\n(?=# ===========================================================================)',
    
    # Section 25: Service
    r'# ===========================================================================\n# 25\. SERVICES.*?\n# ===========================================================================\n\nclass Service.*?\n\n(?=# ===========================================================================)',
    
    # Section 26: GSTInfo
    r'# ===========================================================================\n# 26\. GST PAGE.*?\n# ===========================================================================\n\nclass GSTInfo.*?\n\n(?=# ===========================================================================)',
    
    # Section 27: Presentation & PresentationDownloadLog
    r'# ===========================================================================\n# 27\. PRESENTATIONS.*?\n# ===========================================================================\n\nclass Presentation.*?\n\n(?=# ===========================================================================)',
    
    # Section 28: WorkflowSubCategory
    r'# ===========================================================================\n# 28\. WORKFLOW SUB-CATEGORIES.*?\n# ===========================================================================\n\nclass WorkflowSubCategory.*?\n\n(?=# ===========================================================================)',
    
    # Section 29: MyHealthFeature
    r'# ===========================================================================\n# 29\. MY HEALTH PORTAL.*?\n# ===========================================================================\n\nclass MyHealthFeature.*?\n\n(?=# ===========================================================================)',
    
    # Section 30: NutritionistPortalFeature
    r'# ===========================================================================\n# 30\. NUTRITIONIST PORTAL.*?\n# ===========================================================================\n\nclass NutritionistPortalFeature.*?\n\n(?=# ===========================================================================)',
    
    # Section 31: MicroKitchenPortalFeature
    r'# ===========================================================================\n# 31\. MICRO KITCHEN PORTAL.*?\n# ===========================================================================\n\nclass MicroKitchenPortalFeature.*?\n\n(?=# ===========================================================================)',
    
    # Section 32: SupplyChainPortalFeature
    r'# ===========================================================================\n# 32\. SUPPLY CHAIN PORTAL.*?\n# ===========================================================================\n\nclass SupplyChainPortalFeature.*?\n\n(?=# ===========================================================================)',
    
    # Section 33: AIChatSession
    r'# ===========================================================================\n# 33\. AI CHAT CONFIGURATION.*?\n# ===========================================================================\n\nclass AIChatSession.*?\n\n(?=# ===========================================================================)',
    
    # Section 34: UserSuggestion
    r'# ===========================================================================\n# 34\. SUGGESTIONS.*?\n# ===========================================================================\n\nclass UserSuggestion.*?\n\n(?=# ===========================================================================)',
    
    # Section 35: WorkflowSubItem
    r'# ===========================================================================\n# 35\. WORKFLOW SUB-ITEMS.*?\n# ===========================================================================\n\nclass WorkflowSubItem.*?\n\n(?=# ===========================================================================)',
    
    # Section 36: GSTLeader & GSTClient
    r'# ===========================================================================\n# 36\. GST PAGE SECTIONS.*?\n# ===========================================================================\n\nclass GSTLeader.*?class GSTClient.*?\n\n(?=# ===========================================================================)',
    
    # Section 37: LegalPage
    r'# ===========================================================================\n# 37\. LEGAL PAGES.*?\n# ===========================================================================\n\nclass LegalPage.*?\n\n(?=# ===========================================================================)',
    
    # Section 38: CompanyAboutSection
    r'# ===========================================================================\n# 38\. COMPANY ABOUT SECTIONS.*?\n# ===========================================================================\n\nclass CompanyAboutSection.*?\n\n(?=# ===========================================================================)',
    
    # Section 39: Patent
    r'# ===========================================================================\n# 39\. PATENTS.*?\n# ===========================================================================\n\nclass Patent.*',
]

SERIALIZER_PATTERNS = [
    # Navigation Menu
    r'# ===========================================================================\n# 3\. NAVIGATION MENU.*?(?=# ===========================================================================)',
    
    # Health Food
    r'# ===========================================================================\n# 5\. HEALTH FOOD.*?(?=# ===========================================================================)',
    
    # Health Food Concept
    r'# ===========================================================================\n# 6\. HEALTH FOOD CONCEPT.*?(?=# ===========================================================================)',
    
    # Callback Request
    r'# ===========================================================================\n# 10\. CALLBACK REQUESTS.*?(?=# ===========================================================================)',
    
    # Contact Inquiry
    r'# ===========================================================================\n# 11\. CONTACT.*?(?=# ===========================================================================)',
    
    # Newsletter
    r'# ===========================================================================\n# 12\. NEWSLETTER.*?(?=# ===========================================================================)',
    
    # Testimonials
    r'# ===========================================================================\n# 13\. TESTIMONIALS.*?(?=# ===========================================================================)',
    
    # Vision/Mission
    r'# ===========================================================================\n# 19\. VISION.*?(?=# ===========================================================================)',
    
    # AI Chatbot
    r'# ===========================================================================\n# 20\. AI CHATBOT.*?(?=# ===========================================================================)',
    
    # Stat Counter
    r'# ===========================================================================\n# 21\. STAT COUNTERS.*?(?=# ===========================================================================)',
    
    # Mobile App
    r'# ===========================================================================\n# 22\. MOBILE APP.*?(?=# ===========================================================================)',
    
    # Value Proposition
    r'# ===========================================================================\n# 23\. VALUE.*?(?=# ===========================================================================)',
    
    # Products
    r'# ===========================================================================\n# 24\. PRODUCTS.*?(?=# ===========================================================================)',
    
    # Services
    r'# ===========================================================================\n# 25\. SERVICES.*?(?=# ===========================================================================)',
    
    # GST
    r'# ===========================================================================\n# 26\. GST.*?(?=# ===========================================================================)',
    
    # Presentations
    r'# ===========================================================================\n# 27\. PRESENTATIONS.*?(?=# ===========================================================================)',
    
    # Workflow SubCategory
    r'# ===========================================================================\n# 28\. WORKFLOW SUB-CATEGORIES.*?(?=# ===========================================================================)',
    
    # My Health
    r'# ===========================================================================\n# 29\. MY HEALTH.*?(?=# ===========================================================================)',
    
    # Nutritionist Portal
    r'# ===========================================================================\n# 30\. NUTRITIONIST.*?(?=# ===========================================================================)',
    
    # Micro Kitchen Portal
    r'# ===========================================================================\n# 31\. MICRO KITCHEN.*?(?=# ===========================================================================)',
    
    # Supply Chain Portal
    r'# ===========================================================================\n# 32\. SUPPLY CHAIN.*?(?=# ===========================================================================)',
    
    # AI Chat Sessions
    r'# ===========================================================================\n# 33\. AI CHAT SESSIONS.*?(?=# ===========================================================================)',
    
    # User Suggestions
    r'# ===========================================================================\n# 34\. USER SUGGESTIONS.*?(?=# ===========================================================================)',
    
    # Workflow SubItems
    r'# ===========================================================================\n# 35\. WORKFLOW SUB-ITEMS.*?(?=# ===========================================================================)',
    
    # GST Leaders/Clients
    r'# ===========================================================================\n# 36\. GST LEADERS.*?(?=# ===========================================================================)',
    
    # Legal Pages
    r'# ===========================================================================\n# 37.*?LEGAL.*?(?=# ===========================================================================)',
    
    # Company About
    r'# ===========================================================================\n# 38.*?COMPANY ABOUT.*?(?=# ===========================================================================)',
    
    # Patents
    r'# ===========================================================================\n# 39.*?PATENT.*',
]

VIEWSET_PATTERNS = [
    # Various viewsets - similar patterns as serializers
] + SERIALIZER_PATTERNS

URL_PATTERNS = [
    r"router\.register\(r'navigationmenu'.*?\)",
    r"router\.register\(r'healthfoodcategory'.*?\)",
    r"router\.register\(r'healthfoodproduct'.*?\)",
    r"router\.register\(r'healthfoodconceptcategory'.*?\)",
    r"router\.register\(r'healthfoodconceptarticle'.*?\)",
    r"router\.register\(r'workflowsection'.*?\)",
    r"router\.register\(r'workflowstep'.*?\)",
    r"router\.register\(r'callbackrequest'.*?\)",
    r"router\.register\(r'contactinquiry'.*?\)",
    r"router\.register\(r'newslettersubscriber'.*?\)",
    r"router\.register\(r'testimonial'.*?\)",
    r"router\.register\(r'visionmission'.*?\)",
    r"router\.register\(r'aichatbotconfig'.*?\)",
    r"router\.register\(r'statcounter'.*?\)",
    r"router\.register\(r'mobileappinfo'.*?\)",
    r"router\.register\(r'valueproposition'.*?\)",
    r"router\.register\(r'product'.*?\)",
    r"router\.register\(r'service'.*?\)",
    r"router\.register\(r'gstinfo'.*?\)",
    r"router\.register\(r'presentation'.*?\)",
    r"router\.register\(r'presentationdownloadlog'.*?\)",
    r"router\.register\(r'workflowsubcategory'.*?\)",
    r"router\.register\(r'myhealthfeature'.*?\)",
    r"router\.register\(r'nutritionistportalfeature'.*?\)",
    r"router\.register\(r'microkitchenportalfeature'.*?\)",
    r"router\.register\(r'supplychainportalfeature'.*?\)",
    r"router\.register\(r'aichatsession'.*?\)",
    r"router\.register\(r'usersuggestion'.*?\)",
    r"router\.register\(r'workflowsubitem'.*?\)",
    r"router\.register\(r'gstleader'.*?\)",
    r"router\.register\(r'gstclient'.*?\)",
    r"router\.register\(r'legalpage'.*?\)",
    r"router\.register\(r'companyaboutsection'.*?\)",
    r"router\.register\(r'patent'.*?\)",
]

if __name__ == '__main__':
    base_path = r'c:\Users\Vidhu\Documents\GitHub\miisky_project\backend\website'
    
    print("Starting model removal process...")
    print("=" * 60)
    
    # Process models.py
    print("\n[1/4] Removing models from models.py...")
    remove_models_from_file(os.path.join(base_path, 'models.py'), MODEL_PATTERNS)
    
    # Process serializers.py
    print("[2/4] Removing serializers from serializers.py...")
    remove_serializers_from_file(os.path.join(base_path, 'serializers.py'), SERIALIZER_PATTERNS)
    
    # Process views.py
    print("[3/4] Removing viewsets from views.py...")
    remove_viewsets_from_file(os.path.join(base_path, 'views.py'), VIEWSET_PATTERNS)
    
    # Process urls.py
    print("[4/4] Removing URL routes from urls.py...")
    remove_urls_from_file(os.path.join(base_path, 'urls.py'), URL_PATTERNS)
    
    print("\n" + "=" * 60)
    print("✓ Model removal completed successfully!")
