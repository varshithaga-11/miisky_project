# Miisky Project — Workflow Overview

A nutrition & diet management platform connecting **Patients**, **Nutritionists**, **Micro Kitchens**, **Supply Chain**, and **Food Buyers**.

---

## 1. User Roles & Access Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           USER REGISTRATION & AUTH                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│  Roles: admin | nutritionist | patient | supply_chain | food_buyer |             │
│        micro_kitchen | non_patient                                                │
│                                                                                   │
│  Flow: Register → Login (JWT) → Role-based access                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Role | Primary Functions |
|------|-------------------|
| **Admin** | User management, food system, health parameters, diet plans |
| **Nutritionist** | Patient mapping, health report review, diet suggestions, meetings |
| **Patient** | Questionnaire, health reports, diet plans, meals, meetings (with nutrition consultation) |
| **Non Patient** | Order food directly from micro kitchen — no nutrition consultation; supply chain delivers |
| **Micro Kitchen** | Kitchen profile, inspections, meal prep, marks food ready for delivery |
| **Supply Chain** | Pick up from kitchen, deliver to patient / non patient |
| **Food Buyer** | Food procurement |

---

## 2. Core Workflows

### 2.1 Patient ↔ Nutritionist Flow

```
Patient                    Nutritionist                  System
   │                            │                           │
   ├── Register & Questionnaire ───────────────────────────►│
   │                            │                           │
   ├── Upload Health Reports ──────────────────────────────►│ PatientHealthReport
   │                            │                           │
   │                            ├── Review Reports ────────►│ NutritionistReview
   │                            │                           │
   │                            ├── Assign Nutritionist ───►│ UserNutritionistMapping
   │                            │   (is_patient_mapped)     │
   │                            │                           │
   │                            ├── Suggest Diet Plan ─────►│ UserDietPlan (suggested)
   │                            │                           │
   ├── Approve/Reject Plan ◄────────────────────────────────│
   │   (approve → payment_pending)                          │
   │                            │                           │
   ├── Pay ◄────────────────────────────────────────────────│ UserDietPlan (active)
   │                            │                           │
   │                            ├── Allot Meals ───────────►│ UserMeal (per day)
   │                            │                           │
   ├── Request Meeting ────────────────────────────────────►│ MeetingRequest
   │                            │                           │
   │                            ├── Approve/Reject ────────►│ meeting_link, scheduled_datetime
   │                            │                           │
   └── Attend Meeting                                          │
```

### 2.2 Diet Plan Lifecycle (UserDietPlan)

```
suggested → approved → payment_pending → active → completed
                │
                └── rejected
```

| Status | Description |
|--------|-------------|
| `suggested` | Nutritionist suggested based on review |
| `approved` | Patient accepted (before payment) |
| `rejected` | Patient declined |
| `payment_pending` | Awaiting payment |
| `active` | Plan running (meals allotted) |
| `completed` | Plan period ended |
| `stopped` | Manually stopped |

### 2.3 Micro Kitchen Flow

```
Micro Kitchen                    Admin/Inspector              System
       │                               │                         │
       ├── Create Profile ──────────────────────────────────────►│ MicroKitchenProfile (draft)
       │   (FSSAI, equipment, cuisine, photos)                   │
       │                               │                         │
       │                               ├── Schedule Inspection ─►│ MicroKitchenInspection
       │                               │   (12 rating criteria)  │
       │                               │                         │
       │                               ├── Submit → Approved ───►│ MicroKitchenProfile (approved)
       │                               │   or Rejected           │
       │                               │                         │
       └── Kitchen ready for meal orders                          │
```

**Inspection Status:** `draft` → `submitted` → `approved` / `rejected`

**Kitchen Profile Status:** `draft` → `approved` / `rejected`

### 2.4 Micro Kitchen Assignment & Food Delivery Flow

```
Nutritionist / Patient          Micro Kitchen              Supply Chain              Patient
        │                             │                           │                      │
        ├── Allot kitchen to patient ─►│                           │                      │
        │   (or patient selects)      │                           │                      │
        │                             │                           │                      │
        │                             ├── Prep meals as per plan   │                      │
        │                             │                           │                      │
        │                             ├── Mark "Food Ready" ──────►│                      │
        │                             │                           │                      │
        │                             │                           ├── Pick up from kitchen
        │                             │                           │                      │
        │                             │                           ├── Deliver ───────────►│
        │                             │                           │                      │
        └─────────────────────────────────────────────────────────┴──────────────────────┘
```

| Step | Who | Action |
|------|-----|--------|
| 1 | Nutritionist **or** Patient | Assign/select micro kitchen for the patient |
| 2 | Micro Kitchen | Prepare meals as per allotted plan |
| 3 | Micro Kitchen | Mark food ready for supply chain |
| 4 | Supply Chain | Pick up from kitchen, deliver to patient |
| 5 | Patient | Receive delivery |

### 2.5 Non-Patient Order Flow (No Nutrition Consultation)

Non patients order food directly from micro kitchen, without diet plan or nutritionist.

```
Non Patient                  Micro Kitchen              Supply Chain
     │                             │                           │
     ├── Browse kitchens ─────────►│                           │
     │                             │                           │
     ├── Order food (direct) ─────►│                           │
     │                             │                           │
     │                             ├── Prepare order           │
     │                             │                           │
     │                             ├── Mark "Food Ready" ─────►│
     │                             │                           │
     │                             │                           ├── Pick up
     │                             │                           │
     │                             │                           ├── Deliver ─────► Non Patient
     │                             │                           │
     └─────────────────────────────────────────────────────────┘
```

| Step | Who | Action |
|------|-----|--------|
| 1 | Non Patient | Browse micro kitchens, place order (no diet plan) |
| 2 | Micro Kitchen | Prepare order, mark food ready |
| 3 | Supply Chain | Pick up, deliver to non patient |

---

## 3. Food & Nutrition Data Flow

### 3.1 Recipe / Food Structure

```
MealType (Breakfast, Lunch, etc.)
    │
    └── Food (Idli, Chapati, etc.)
            ├── FoodNutrition (calories, protein, etc.)
            ├── FoodIngredient ──► Ingredient + Unit + quantity
            └── FoodStep (cooking instructions)
```

### 3.2 Indian Food Composition (FoodName-based)

```
FoodGroup (e.g. CEREALS, FRUITS)
    │
    └── FoodName
            ├── FoodProximate (protein, fat, fiber, energy)
            ├── FoodWaterSolubleVitamins (B1, B2, B3, B6, B9, C)
            ├── FoodFatSolubleVitamins (retinol, tocopherols)
            ├── FoodCarotenoids
            ├── FoodMinerals
            ├── FoodSugars
            ├── FoodAminoAcids
            ├── FoodOrganicAcids
            ├── FoodPolyphenols
            ├── FoodPhytochemicals
            └── FoodFattyAcidProfile
```

### 3.3 Meal Allotment

```
UserDietPlan (active)
    │
    └── UserMeal (per day)
            ├── meal_type (Breakfast/Lunch/Dinner)
            ├── food (from Food)
            ├── quantity
            ├── meal_date
            └── is_consumed, consumed_at
```

---

## 4. Health & Lab Parameters

```
HealthParameter (e.g. Hemoglobin, Glucose)
    │
    └── NormalRangeForHealthParameter
            ├── min_value, max_value
            ├── unit
            ├── qualitative_value
            └── reference_text
```

- Patient uploads **PatientHealthReport** (blood test, scan, etc.)
- Nutritionist creates **NutritionistReview** with comments
- **UserQuestionnaire** stores diet pattern, allergies, health conditions, etc.

---

## 5. Diet Plans & Features

```
DietPlans (templates)
    ├── title, code, amount, discount_amount, no_of_days
    └── DietPlanFeature (e.g. "Personalized diet chart", "24/7 support")
```

---

## 6. Location Hierarchy

```
Country → State → City
```

Used by: `UserRegister`, `MicroKitchenProfile` (lat/long for maps)

---

## 7. Menu & Functionality by Role

| Role | Menu | Submenu | Functionality |
|------|------|---------|---------------|
| admin | Dashboard | — | Main overview of the platform |
| admin | Locations | Countries | Add, edit, manage country list |
| admin | Locations | States | Manage states linked to countries |
| admin | Locations | Cities | Manage cities linked to states |
| admin | Food Management | Meal Type | Define meal types (Breakfast, Lunch, Dinner, Snacks) |
| admin | Food Management | Cuisine Type | Define cuisine types (North Indian, South Indian, etc.) |
| admin | Food Management | Foods | Add, edit food items with meal & cuisine types |
| admin | Food Management | Units | Define measurement units (Gram, Cup, etc.) |
| admin | Food Management | Ingredients | Manage raw ingredients used in recipes |
| admin | Food Management | Recipe Management | Create recipes: link food → ingredients + cooking steps |
| admin | Food Composition | Food Groups | Group foods (Cereals, Fruits, Oils, etc.) |
| admin | Food Composition | Food Names | Add food names under groups for nutrition database |
| admin | Food Composition | Proximate | Store protein, fat, fiber, energy per food |
| admin | Food Composition | Water Soluble Vitamins | B1, B2, B3, B6, B9, C values per food |
| admin | Food Composition | Fat Soluble Vitamins | Retinol, tocopherols per food |
| admin | Food Composition | Carotenoids | Lutein, lycopene, beta-carotene per food |
| admin | Food Composition | Minerals | Calcium, iron, zinc, etc. per food |
| admin | Food Composition | Sugars | Starch, fructose, glucose per food |
| admin | Food Composition | Amino Acids | Amino acid profile per food |
| admin | Food Composition | Organic Acids | Oxalate, citric acid, etc. per food |
| admin | Food Composition | Polyphenols | Phenolic acids per food |
| admin | Food Composition | Phytochemicals | Oligosaccharides, phytosterols per food |
| admin | Food Composition | Fatty Acid Profile | SFA, MUFA, PUFA per food |
| admin | User Management | — | Create, edit users (all roles) |
| admin | Micro Kitchens | Kitchen Information | View kitchen profiles & inspection reports |
| admin | Health Monitoring | Health Parameters | Define lab parameters (Hemoglobin, Glucose, etc.) |
| admin | Health Monitoring | Normal Ranges | Set min/max normal values per parameter |
| admin | Health Monitoring | Diet Plans | Create diet plan templates with features & pricing |
| admin | Mappings | User–Nutritionist Mapping | Map patients to nutritionists |
| patient | Questionnaire | — | Fill diet, health, allergies, preferences |
| patient | Nutritionist Allotted | — | See assigned nutritionist |
| patient | Diet Plans | — | View active diet plans |
| patient | Suggested Plans | — | View & approve/reject plans suggested by nutritionist |
| patient / non_patient | Micro-Kitchens | — | Browse approved kitchens; patient: select or view allotted kitchen; non_patient: order food directly (no consultation) |
| patient | Health Reports | — | Upload blood tests, scans, prescriptions |
| patient | Meals Allotted | — | View daily meal plan & mark consumed |
| patient | Consultation | — | Request meeting with nutritionist |
| nutritionist | Questionnaire | — | Fill nutritionist profile / settings |
| nutritionist | Allotted Patients | — | View patients assigned to them |
| nutritionist | Meal Optimizer | — | Allot meals per patient per day; allot micro kitchen to patient |
| nutritionist | Patient Documents | — | Review uploaded reports & add comments |
| nutritionist | Suggest Plan | — | Suggest diet plan to patient |
| nutritionist | Approved Plans | — | View approved & active plans |
| nutritionist | Meeting Requests | — | Approve or reject patient meeting requests |
| micro_kitchen | Questionnaire | — | Fill kitchen profile (FSSAI, equipment, photos) |
| micro_kitchen | Inspection Report | — | View inspection status & ratings; mark food ready for supply chain |
| supply_chain | Delivery Questionnaire | — | Fill vehicle, license, insurance; pick up from kitchen & deliver to patient |

---

## 8. Key Relationships Diagram

```
                    UserRegister
                          │
    ┌─────────────────────┼─────────────────────┐
    │                     │                     │
    ▼                     ▼                     ▼
NutritionistProfile  MicroKitchenProfile   DeliveryProfile
    │                     │
    │                     ▼
    │               MicroKitchenInspection
    │
    ├── UserNutritionistMapping ◄── Patient
    │
    ├── NutritionistReview ◄── PatientHealthReport
    │
    ├── UserDietPlan ◄── DietPlans
    │        │
    │        ├── UserMeal ◄── Food, MealType
    │        │
    │        └── MeetingRequest
    │
    └── UserQuestionnaire
```

---

*References: `backend/app/models.py`, `frontend/src/layout/MasterLayout/MasterSidebar.tsx`*
