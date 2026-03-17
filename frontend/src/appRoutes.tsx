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
const LineChart = lazy(() => import("./pages/Charts/LineChart"));
const BarChart = lazy(() => import("./pages/Charts/BarChart"));
const Calendar = lazy(() => import("./pages/Calendar"));
const MasterLayout = lazy(() => import("./layout/MasterLayout/MasterLayout"));
const Blank = lazy(() => import("./pages/Blank"));
const ImportSQLDataPage = lazy(() => import("./pages/ImportSQLDataPage"));

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


import ClientPage from "./pages/registration/client";
import SupplierPage from "./pages/registration/supplier";





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
          <Route path="master/client" element={<ClientPage />} />
          <Route path="master/supplier" element={<SupplierPage />} />
          <Route path="master/usermanagement" element={<UserManagementPage />} />
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
          <Route path="/import-sql-data" element={<ImportSQLDataPage />} />


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

          {/* Charts */}
          <Route path="/line-chart" element={<LineChart />} />
          <Route path="/bar-chart" element={<BarChart />} />
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

        {/* Charts */}
        <Route path="/line-chart" element={<LineChart />} />
        <Route path="/bar-chart" element={<BarChart />} />

        {/* Auth Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
