#!/usr/bin/env python3
"""
Clean up serializers, views, and urls files by removing references to deleted models.
"""
import re

def cleanup_serializers():
    """Remove serializer classes for deleted models"""
    filepath = r'c:\Users\Vidhu\Documents\GitHub\miisky_project\backend\website\serializers.py'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_size = len(content)
    
    # Patterns for serializer classes to remove (matching class definitions and their complete content)
    remove_patterns = [
        # Navigation Menu Serializers
        (r'# ===========================================================================\n# 3\. NAVIGATION MENU\n# ===========================================================================\n\nclass NavigationMenuChildSerializer.*?class NavigationMenuSerializer.*?\n\n', ''),
        # Health Food Serializers
        (r'# ===========================================================================\n# 5\. HEALTH FOOD.*?(?=# ===========================================================================\n# 6\.)', ''),
        # Health Food Concept Serializers
        (r'# ===========================================================================\n# 6\. HEALTH FOOD CONCEPT.*?(?=# ===========================================================================\n# 7\.)', ''),
        # Callback Request Serializers
        (r'# ===========================================================================\n# 10\. CALLBACK.*?(?=# ===========================================================================\n# 11\.)', ''),
        # Contact Inquiry Serializers
        (r'# ===========================================================================\n# 11\. CONTACT.*?(?=# ===========================================================================\n# 12\.)', ''),
        # Newsletter Serializers
        (r'# ===========================================================================\n# 12\. NEWSLETTER.*?(?=# ===========================================================================\n# 13\.)', ''),
        # Testimonials Serializers
        (r'# ===========================================================================\n# 13\. TESTIMONIALS.*?(?=# ===========================================================================)', ''),
        #Vision/Mission Serializers  
        (r'# ===========================================================================\n# 19\. VISION.*?(?=# ===========================================================================)', ''),
        # AI Chatbot Serializers
        (r'# ===========================================================================\n# 20\. AI CHATBOT.*?(?=# ===========================================================================)', ''),
        # Stat Counter Serializers
        (r'# ===========================================================================\n# 21\. STAT COUNTERS.*?(?=# ===========================================================================)', ''),
        # Mobile App Serializers
        (r'# ===========================================================================\n# 22\. MOBILE APP.*?(?=# ===========================================================================)', ''),
        # Value Proposition Serializers
        (r'# ===========================================================================\n# 23\. VALUE.*?(?=# ===========================================================================)', ''),
        # Product Serializers
        (r'# ===========================================================================\n# 24\. PRODUCTS.*?(?=# ===========================================================================)', ''),
        # Service Serializers
        (r'# ===========================================================================\n# 25\. SERVICES.*?(?=# ===========================================================================)', ''),
        # GST Serializers
        (r'# ===========================================================================\n# 26\. GST.*?(?=# ===========================================================================)', ''),
        # Presentation Serializers
        (r'# ===========================================================================\n# 27\. PRESENTATIONS.*?(?=# ===========================================================================)', ''),
        # Workflow SubCategory Serializers
        (r'# ===========================================================================\n# 28\. WORKFLOW SUB-CATEGORIES.*?(?=# ===========================================================================)', ''),
        # My Health Serializers
        (r'# ===========================================================================\n# 29\. MY HEALTH.*?(?=# ===========================================================================)', ''),
        # Nutritionist Portal Serializers
        (r'# ===========================================================================\n# 30\. NUTRITIONIST.*?(?=# ===========================================================================)', ''),
        # Micro Kitchen Portal Serializers
        (r'# ===========================================================================\n# 31\. MICRO KITCHEN.*?(?=# ===========================================================================)', ''),
        # Supply Chain Portal Serializers
        (r'# ===========================================================================\n# 32\. SUPPLY CHAIN.*?(?=# ===========================================================================)', ''),
        # AI Chat Sessions Serializers
        (r'# ===========================================================================\n# 33\. AI CHAT SESSIONS.*?(?=# ===========================================================================)', ''),
        # User Suggestions Serializers
        (r'# ===========================================================================\n# 34\. USER SUGGESTIONS.*?(?=# ===========================================================================)', ''),
        # Workflow SubItems Serializers
        (r'# ===========================================================================\n# 35\. WORKFLOW SUB-ITEMS.*?(?=# ===========================================================================)', ''),
        # GST Leaders/Clients Serializers
        (r'# ===========================================================================\n# 36\. GST LEADERS.*?(?=# ===========================================================================)', ''),
        # Legal Pages Serializers
        (r'# ===========================================================================\n# 37.*?LEGAL.*?(?=# ===========================================================================)', ''),
        # Company About Serializers
        (r'# ===========================================================================\n# 38.*?COMPANY ABOUT.*?(?=# ===========================================================================)', ''),
        # Patents Serializers
        (r'# ===========================================================================\n# 39.*?PATENT.*', ''),
    ]
    
    for pattern, replacement in remove_patterns:
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"[serializers.py] Removed {(original_size - len(content)) // 100} lines approximately")

def cleanup_views():
    """Remove ViewSet classes for deleted models"""
    filepath = r'c:\Users\Vidhu\Documents\GitHub\miisky_project\backend\website\views.py'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_size = len(content)
    
    # Simple approach: remove ViewSet definitions by class name
    viewsets_to_remove = [
        'NavigationMenuViewSet',
        'HealthFoodCategoryViewSet',
        'HealthFoodProductViewSet',
        'HealthFoodConceptCategoryViewSet',
        'HealthFoodConceptArticleViewSet',
        'WorkflowSectionViewSet',
        'WorkflowStepViewSet',
        'CallbackRequestViewSet',
        'ContactInquiryViewSet',
        'NewsletterSubscriberViewSet',
        'TestimonialViewSet',
        'VisionMissionViewSet',
        'AIChatbotConfigViewSet',
        'StatCounterViewSet',
        'MobileAppInfoViewSet',
        'ValuePropositionViewSet',
        'ProductViewSet',
        'ServiceViewSet',
        'GSTInfoViewSet',
        'PresentationViewSet',
        'PresentationDownloadLogViewSet',
        'WorkflowSubCategoryViewSet',
        'MyHealthFeatureViewSet',
        'NutritionistPortalFeatureViewSet',
        'MicroKitchenPortalFeatureViewSet',
        'SupplyChainPortalFeatureViewSet',
        'AIChatSessionViewSet',
        'UserSuggestionViewSet',
        'WorkflowSubItemViewSet',
        'GSTLeaderViewSet',
        'GSTClientViewSet',
        'LegalPageViewSet',
        'CompanyAboutSectionViewSet',
        'PatentViewSet',
    ]
    
    for viewset in viewsets_to_remove:
        pattern = rf'# ===========================================================================\n#.*?\n# ===========================================================================\n\nclass {viewset}\(.*?\n(?=\n(?:class |# ===========================================================================)|$)'
        content = re.sub(pattern, '', content, flags=re.DOTALL)
        
        # Also remove standalone comments/sections if they exist
        pattern2 = rf'# ===========================================================================\n#.*?{viewset}.*?\n# ===========================================================================\n\n'
        content = re.sub(pattern2, '', content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"[views.py] Removed {(original_size - len(content)) // 100} lines approximately")

def cleanup_urls():
    """Remove router registrations for deleted models"""
    filepath = r'c:\Users\Vidhu\Documents\GitHub\miisky_project\backend\website\urls.py'
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_size = len(content)
    
    # Patterns to remove (router.register lines with optional comments)
    routes_to_remove = [
        r"router\.register\(r'navigationmenu'.*?\)\n?",
        r"router\.register\(r'healthfoodcategory'.*?\)\n?",
        r"router\.register\(r'healthfoodproduct'.*?\)\n?",
        r"router\.register\(r'healthfoodconceptcategory'.*?\)\n?",
        r"router\.register\(r'healthfoodconceptarticle'.*?\)\n?",
        r"router\.register\(r'workflowsection'.*?\)\n?",
        r"router\.register\(r'workflowstep'.*?\)\n?",
        r"router\.register\(r'callbackrequest'.*?\)\n?",
        r"router\.register\(r'contactinquiry'.*?\)\n?",
        r"router\.register\(r'newslettersubscriber'.*?\)\n?",
        r"router\.register\(r'testimonial'.*?\)\n?",
        r"router\.register\(r'visionmission'.*?\)\n?",
        r"router\.register\(r'aichatbotconfig'.*?\)\n?",
        r"router\.register\(r'statcounter'.*?\)\n?",
        r"router\.register\(r'mobileappinfo'.*?\)\n?",
        r"router\.register\(r'valueproposition'.*?\)\n?",
        r"router\.register\(r'product'.*?\)\n?",
        r"router\.register\(r'service'.*?\)\n?",
        r"router\.register\(r'gstinfo'.*?\)\n?",
        r"router\.register\(r'presentation'.*?\)\n?",
        r"router\.register\(r'presentationdownloadlog'.*?\)\n?",
        r"router\.register\(r'workflowsubcategory'.*?\)\n?",
        r"router\.register\(r'myhealthfeature'.*?\)\n?",
        r"router\.register\(r'nutritionistportalfeature'.*?\)\n?",
        r"router\.register\(r'microkitchenportalfeature'.*?\)\n?",
        r"router\.register\(r'supplychainportalfeature'.*?\)\n?",
        r"router\.register\(r'aichatsession'.*?\)\n?",
        r"router\.register\(r'usersuggestion'.*?\)\n?",
        r"router\.register\(r'workflowsubitem'.*?\)\n?",
        r"router\.register\(r'gstleader'.*?\)\n?",
        r"router\.register\(r'gstclient'.*?\)\n?",
        r"router\.register\(r'legalpage'.*?\)\n?",
        r"router\.register\(r'companyaboutsection'.*?\)\n?",
        r"router\.register\(r'patent'.*?\)\n?",
    ]
    
    for pattern in routes_to_remove:
        content = re.sub(pattern, '', content, flags=re.IGNORECASE | re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"[urls.py] Removed {(original_size - len(content)) // 100} lines approximately")

if __name__ == '__main__':
    print("Cleaning up Django app files...")
    print("=" * 60)
    cleanup_serializers()
    cleanup_views()
    cleanup_urls()
    print("=" * 60)
    print("✓ Cleanup completed!")
