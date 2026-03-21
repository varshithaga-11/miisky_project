// gkghb

import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const MasterDashboard = lazy(() => import("./pages/Dashboard/index"));
// const AdminPage = lazy(() => import("./pages/Master/Adminpage"));
// const CompanyList = lazy(() => import("./pages/Master/Companypage"));
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Videos = lazy(() => import("./pages/UiElements/Videos"));
const Images = lazy(() => import("./pages/UiElements/Images"));
const Alerts = lazy(() => import("./pages/UiElements/Alerts"));
const Badges = lazy(() => import("./pages/UiElements/Badges"));
const Avatars = lazy(() => import("./pages/UiElements/Avatars"));
const Buttons = lazy(() => import("./pages/UiElements/Buttons"));
const Calendar = lazy(() => import("./pages/Calendar"));
const MasterLayout = lazy(() => import("./layout/MasterLayout/MasterLayout"));
const Blank = lazy(() => import("./pages/Blank"));
const KitchenMenuPage = lazy(() => import("./pages/NonPatient/KitchenMenu/index"));
const CartPage = lazy(() => import("./pages/NonPatient/Cart/index"));
const OrdersPage = lazy(() => import("./pages/NonPatient/Orders/index"));
const KitchenOrdersPage = lazy(() => import("./pages/MicroKitchenSide/Orders/index"));

import UserManagementPage from "./pages/AdminSide/UserManagement/index";
import CountryManagementPage from "./pages/AdminSide/Country/index";
import StateManagementPage from "./pages/AdminSide/State/index";
import CityManagementPage from "./pages/AdminSide/City/index";
import MealTypeManagementPage from "./pages/AdminSide/MealType/index";
import CuisineTypeManagementPage from "./pages/AdminSide/CuisineType/index";
import FoodManagementPage from "./pages/AdminSide/Food/index";
import UnitManagementPage from "./pages/AdminSide/Unit/index";
import IngredientManagementPage from "./pages/AdminSide/Ingredient/index";
import FoodIngredientManagementPage from "./pages/AdminSide/FoodIngredient/index";
import FoodStepManagementPage from "./pages/AdminSide/FoodStep/index";
import RecipeManagementPage from "./pages/AdminSide/RecipeManagement/index";
import HealthParameterManagementPage from "./pages/AdminSide/HealthParameter/index";
import NormalRangeManagementPage from "./pages/AdminSide/NormalRangeForHealthParameter/index";
import DietPlanManagementPage from "./pages/AdminSide/DietPlan/index";
import FoodGroupManagementPage from "./pages/AdminSide/FoodGroup/index";
import FoodNameManagementPage from "./pages/AdminSide/FoodName/index";
import FoodProximateManagementPage from "./pages/AdminSide/FoodProximate/index";
import FoodWaterSolubleVitaminsManagementPage from "./pages/AdminSide/FoodWaterSolubleVitamins/index";
import FoodFatSolubleVitaminsManagementPage from "./pages/AdminSide/FoodFatSolubleVitamins/index";
import FoodCarotenoidsManagementPage from "./pages/AdminSide/FoodCarotenoids/index";
import FoodMineralsManagementPage from "./pages/AdminSide/FoodMinerals/index";
import FoodSugarsManagementPage from "./pages/AdminSide/FoodSugars/index";
import FoodAminoAcidsManagementPage from "./pages/AdminSide/FoodAminoAcids/index";
import FoodOrganicAcidsManagementPage from "./pages/AdminSide/FoodOrganicAcids/index";
import FoodPolyphenolsManagementPage from "./pages/AdminSide/FoodPolyphenols/index";
import FoodPhytochemicalsManagementPage from "./pages/AdminSide/FoodPhytochemicals/index";
import FoodFattyAcidProfileManagementPage from "./pages/AdminSide/FoodFattyAcidProfile/index";
import PatientQuestionnairePage from "./pages/PatientSide/Questionnaire/index";
import NutritionQuestionarePage from "./pages/NutritionSide/NutritionQuestionare/index";
import MicroKitchenQuestionarePage from "./pages/MicroKitchenSide/MicroKitchenQuestionare/index";
import InspectionReportPage from "./pages/MicroKitchenSide/InspectionReport/index";
import MicroKitchenPatientsPage from "./pages/MicroKitchenSide/Patients/index";
import MealsBasedOnDailyPage from "./pages/MicroKitchenSide/MealsBasedOnDaily/index";
import DeliveryQuestionarePage from "./pages/SupplyChain/DeliveryQuestionare/index";
import UserNutritionMappingPage from "./pages/AdminSide/UserNutritionMapping";
import AllotedPatientsPage from "./pages/NutritionSide/AllotedPatients";
import UploadedDocumentsByPatientPage from "./pages/NutritionSide/UploadedDocumentsByPatient/index";
import SuggestPlanToPatientsPage from "./pages/NutritionSide/SuggestPlanToPatients/index";
import ApprovesPlansByPatientsPage from "./pages/NutritionSide/ApprovesPlansByPatients/index";
import SetDailyMealsPage from "./pages/NutritionSide/SetDailyMeals/index";
import NutritionAllotedPage from "./pages/PatientSide/NutritionAlloted";
import PlansPage from "./pages/PatientSide/Plans/index";
import SuggestedPlansPage from "./pages/PatientSide/SuggestedPlans/index";
import ListOfMicroKitchenPage from "./pages/PatientSide/ListOfMicroKitchen/index";
import NonPatientFoodsPage from "./pages/NonPatient/Foods/index";
import NonPatientListOfMicroKitchenPage from "./pages/NonPatient/ListOfMicroKitchens/index";

import AllotedMicroKitchenByNutritionPage from "./pages/PatientSide/AllotedMicroKitchenByNutrition/index";
import HealthReportUploadPage from "./pages/PatientSide/HealthReportUpload/index";
import MealsAllotedPage from "./pages/PatientSide/MealsAlloted/index";
import SendingMeetingRequest from "./pages/PatientSide/SendingMeetingRequest/index";
import MeetingRequestsByPatients from "./pages/NutritionSide/MeetingRequestsByPatients/index";
import ListOfMicroKitchensPage from "./pages/NutritionSide/ListOfMicroKitchens/index";
import AllotMicroKitchenToPatientsPage from "./pages/NutritionSide/AllotMicroKitchenToPatients/index";
import ReviewsPage from "./pages/MicroKitchenSide/Reviews/index";
import AvailableFoodsPage from "./pages/MicroKitchenSide/AvailableFoods/index";
import MicroKitchenInformationPage from "./pages/AdminSide/MicroKitchenInformation/index";
import NutritionInformationPage from "./pages/AdminSide/NutritionInformation/index";



const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// interface RoutesComponentProps {
//     hasPreloaderShown: boolean;
// }

// export function appRoutes({ hasPreloaderShown }: RoutesComponentProps) {

export function appRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Dashboard Layout */}
        <Route element={<MasterLayout />}>
          <Route path="master/master-dashboard" element={<MasterDashboard />} />
          <Route path="master/usermanagement" element={<UserManagementPage />} />
          <Route path="master/micro-kitchen-information" element={<MicroKitchenInformationPage />} />
          <Route path="master/nutrition-information" element={<NutritionInformationPage />} />
          <Route path="master/country" element={<CountryManagementPage />} />
          <Route path="master/state" element={<StateManagementPage />} />
          <Route path="master/city" element={<CityManagementPage />} />
          <Route path="master/meal-type" element={<MealTypeManagementPage />} />
          <Route path="master/cuisine-type" element={<CuisineTypeManagementPage />} />
          <Route path="master/food" element={<FoodManagementPage />} />
          <Route path="master/unit" element={<UnitManagementPage />} />
          <Route path="master/ingredient" element={<IngredientManagementPage />} />
          <Route path="master/food-ingredient" element={<FoodIngredientManagementPage />} />
          <Route path="master/food-step" element={<FoodStepManagementPage />} />
          <Route path="master/recipe-creator" element={<RecipeManagementPage />} />
          <Route path="master/health-parameter" element={<HealthParameterManagementPage />} />
          <Route path="master/normal-range" element={<NormalRangeManagementPage />} />
          <Route path="master/diet-plan" element={<DietPlanManagementPage />} />
          <Route path="master/food-group" element={<FoodGroupManagementPage />} />
          <Route path="master/food-name" element={<FoodNameManagementPage />} />
          <Route path="master/food-proximate" element={<FoodProximateManagementPage />} />
          <Route path="master/food-water-soluble-vitamins" element={<FoodWaterSolubleVitaminsManagementPage />} />
          <Route path="master/food-fat-soluble-vitamins" element={<FoodFatSolubleVitaminsManagementPage />} />
          <Route path="master/food-carotenoids" element={<FoodCarotenoidsManagementPage />} />
          <Route path="master/food-minerals" element={<FoodMineralsManagementPage />} />
          <Route path="master/food-sugars" element={<FoodSugarsManagementPage />} />
          <Route path="master/food-amino-acids" element={<FoodAminoAcidsManagementPage />} />
          <Route path="master/food-organic-acids" element={<FoodOrganicAcidsManagementPage />} />
          <Route path="master/food-polyphenols" element={<FoodPolyphenolsManagementPage />} />
          <Route path="master/food-phytochemicals" element={<FoodPhytochemicalsManagementPage />} />
          <Route path="master/food-fatty-acid-profile" element={<FoodFattyAcidProfileManagementPage />} />
          <Route path="master/user-nutrition-mapping" element={<UserNutritionMappingPage />} />
          <Route path="patient/questionnaire" element={<PatientQuestionnairePage />} />
          <Route path="patient/nutrition-allotted" element={<NutritionAllotedPage />} />
          <Route path="patient/plans" element={<PlansPage />} />
          <Route path="patient/suggested-plans" element={<SuggestedPlansPage />} />
          <Route path="patient/foods" element={<NonPatientFoodsPage />} />
          <Route path="patient/micro-kitchens" element={<ListOfMicroKitchenPage />} />
          <Route path="patient/discover-kitchens" element={<NonPatientListOfMicroKitchenPage />} />
          <Route path="patient/kitchen/:kitchenId/menu" element={<KitchenMenuPage />} />
          <Route path="patient/cart" element={<CartPage />} />
          <Route path="patient/orders" element={<OrdersPage />} />
          <Route path="microkitchen/orders" element={<KitchenOrdersPage />} />
          <Route path="patient/suggested-kitchens" element={<AllotedMicroKitchenByNutritionPage />} />
          <Route path="patient/health-reports" element={<HealthReportUploadPage />} />
          <Route path="patient/meals-allotted" element={<MealsAllotedPage />} />
          <Route path="patient/meeting-request" element={<SendingMeetingRequest />} />
          <Route path="nutrition/questionnaire" element={<NutritionQuestionarePage />} />
          <Route path="nutrition/allotted-patients" element={<AllotedPatientsPage />} />
          <Route path="nutrition/set-meals" element={<SetDailyMealsPage />} />
          <Route path="nutrition/uploaded-documents" element={<UploadedDocumentsByPatientPage />} />
          <Route path="nutrition/suggest-plan" element={<SuggestPlanToPatientsPage />} />
          <Route path="nutrition/approved-plans" element={<ApprovesPlansByPatientsPage />} />
          <Route path="nutrition/meeting-requests" element={<MeetingRequestsByPatients />} />
          <Route path="nutrition/micro-kitchens" element={<ListOfMicroKitchensPage />} />
          <Route path="nutrition/allot-micro-kitchen" element={<AllotMicroKitchenToPatientsPage />} />
          <Route path="microkitchen/reviews" element={<ReviewsPage />} />
          <Route path="microkitchen/available-foods" element={<AvailableFoodsPage />} />
          <Route path="microkitchen/questionnaire" element={<MicroKitchenQuestionarePage />} />
          <Route path="microkitchen/inspection-report" element={<InspectionReportPage />} />
          <Route path="microkitchen/patients" element={<MicroKitchenPatientsPage />} />
          <Route path="microkitchen/daily-prep" element={<MealsBasedOnDailyPage />} />
          <Route path="supplychain/delivery-questionnaire" element={<DeliveryQuestionarePage />} />


          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/blank" element={<Blank />} />

          {/* Forms */}
          {/* <Route path="/form-elements" element={<FormElements />} /> */}

          {/* Tables */}
          {/* <Route path="/basic-tables" element={<BasicTables />} /> */}

          {/* Ui Elements */}
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/avatars" element={<Avatars />} />
          <Route path="/badge" element={<Badges />} />
          <Route path="/buttons" element={<Buttons />} />
          <Route path="/images" element={<Images />} />
          <Route path="/videos" element={<Videos />} />

        </Route>


        {/* Admin Management */}
        {/* Create Admin */}

        {/* Tables */}

        {/* Admin Management */}
        {/* Create Admin */}

        {/* Tables */}
        {/* <Route path="basic-tables" element={<BasicTables />} /> */}

        {/* Ui Elements */}
        <Route path="alerts" element={<Alerts />} />
        <Route path="avatars" element={<Avatars />} />
        <Route path="badge" element={<Badges />} />
        <Route path="buttons" element={<Buttons />} />
        <Route path="images" element={<Images />} />
        <Route path="videos" element={<Videos />} />

        {/* Auth Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
