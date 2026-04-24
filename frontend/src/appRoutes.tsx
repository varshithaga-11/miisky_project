// gkghb

import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
const SignIn = lazy(() => import("./pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("./pages/AuthPages/SignUp"));
const AdminDashboard = lazy(() => import("./pages/AdminSide/Dashboard/index"));
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
const KitchenOrdersPage = lazy(() => import("./pages/MicroKitchenSide/SeparateOrders/index"));
const MicroKitchenDeliveryChargesPage = lazy(() => import("./pages/MicroKitchenSide/DeliveryCharges/index"));
const PatientCartPage = lazy(() => import("./pages/PatientSide/Cart/index"));
const PatientOrdersPage = lazy(() => import("./pages/PatientSide/Orders/index"));
const MicroKitchenDeliveryFeedbackPage = lazy(() => import("./pages/MicroKitchenSide/DeliveryFeedback"));
import ForgotPassword from "./pages/AuthPages/ForgotPassword";

import UserManagementPage from "./pages/AdminSide/UserManagement/index";
import CountryManagementPage from "./pages/AdminSide/Country/index";
import HealthConditionMasterPage from "./pages/AdminSide/HealthConditionMaster/index";
import SymptomMasterPage from "./pages/AdminSide/SymptomMaster/index";
import AutoimmuneMasterPage from "./pages/AdminSide/AutoimmuneMaster/index";
import DeficiencyMasterPage from "./pages/AdminSide/DeficiencyMaster/index";
import DigestiveIssueMasterPage from "./pages/AdminSide/DigestiveIssueMaster/index";
import SkinIssueMasterPage from "./pages/AdminSide/SkinIssueMaster/index";
import HabitMasterPage from "./pages/AdminSide/HabitMaster/index";
import ActivityMasterPage from "./pages/AdminSide/ActivityMaster/index";
import StateManagementPage from "./pages/AdminSide/State/index";
import CityManagementPage from "./pages/AdminSide/City/index";
import MealTypeManagementPage from "./pages/AdminSide/MealType/index";
import DeliverySlotManagementPage from "./pages/AdminSide/DeliverySlot/index";
import PackagingMaterialManagementPage from "./pages/AdminSide/PackagingMaterial/index";
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
import DeliveryAssignmentsPage from "./pages/SupplyChain/Assignments/index";
import SupplyChainDashboardPage from "./pages/SupplyChain/Dashboard/index";
import SupplyChainEarningsPage from "./pages/SupplyChain/Earnings/index";
import SupplyChainPlannedLeavePage from "./pages/SupplyChain/PlannedLeave/index";
import SupplyChainSeperateOrdersPage from "./pages/SupplyChain/SeperateOrders/index";
import UserNutritionMappingPage from "./pages/AdminSide/UserNutritionMapping";
import AllotedPatientsPage from "./pages/NutritionSide/AllotedPatients";
import UploadedDocumentsByPatientPage from "./pages/NutritionSide/UploadedDocumentsByPatient/index";
import SuggestPlanToPatientsPage from "./pages/NutritionSide/SuggestPlanToPatients/index";
import SuggestFoodNameToPatientsPage from "./pages/NutritionSide/SuggestFoodNameToPatients/index";
import SuggestedFoodNameFromNutritionPage from "./pages/PatientSide/SuggestedFoodNameFromNutrition/index";
import ApprovesPlansByPatientsPage from "./pages/NutritionSide/ApprovesPlansByPatients/index";
import SetDailyMealsPage from "./pages/NutritionSide/SetDailyMeals/index";
import NutritionAllotedPage from "./pages/PatientSide/NutritionAlloted";
import PlansPage from "./pages/PatientSide/Plans/index";
import SuggestedPlansPage from "./pages/PatientSide/SuggestedPlans/index";
import ListOfMicroKitchenPage from "./pages/PatientSide/ListOfMicroKitchen/index";
import NonPatientFoodsPage from "./pages/NonPatient/Foods/index";
import NonPatientListOfMicroKitchenPage from "./pages/NonPatient/ListOfMicroKitchens/index";

import HealthReportUploadPage from "./pages/PatientSide/HealthReportUpload/index";
import MealsAllotedPage from "./pages/PatientSide/MealsAlloted/index";
import PatientDeliveryIssuePage from "./pages/PatientSide/DeliveryIssue";
import SendingMeetingRequest from "./pages/PatientSide/SendingMeetingRequest/index";
import MeetingRequestsByPatients from "./pages/NutritionSide/MeetingRequestsByPatients/index";
import ListOfMicroKitchensPage from "./pages/NutritionSide/ListOfMicroKitchens/index";
import MicroKitchenInspectionPage from "./pages/NutritionSide/MicroKitchenInspection/index";
import ReviewsPage from "./pages/MicroKitchenSide/Reviews/index";
import AvailableFoodsPage from "./pages/MicroKitchenSide/AvailableFoods/index";
import MicroKitchenInformationPage from "./pages/AdminSide/MicroKitchenInformation/index";
import NutritionInformationPage from "./pages/AdminSide/NutritionInformation/index";
import DoctorOverViewPage from "./pages/AdminSide/DoctorOverView/index";
import SupplyChainOverViewPage from "./pages/AdminSide/SupplyChainOverView/index";
import PatientPaymentVerificationPage from "./pages/AdminSide/PatientPaymentVerification/index";
import PatientOverviewPage from "./pages/AdminSide/PatientOverview/index";
import PatientAllQuestionariePage from "./pages/AdminSide/PatientAllQuestionarie/index";
import DoctorAllPatientsPage from "./pages/DoctorSide/AllPatients/index";
import DoctorSupportTicketPage from "./pages/DoctorSide/SupportTicket/index";
import NonPatientInformationPage from "./pages/AdminSide/NonPatientInformation/index";
import ProfileInformationPage from "./pages/ProfileInformation/index";
import UpdateUsernamePasswordPage from "./pages/ProfileInformation/UpdateUsernamePassword";
import TicketCategoryPage from "./pages/AdminSide/TicketCategory";
import SupportTicketRequestsPage from "./pages/AdminSide/SupportTicketRequests";
import PatientSupportTicketPage from "./pages/PatientSide/SupportTicket";
import AdminNotificationsPage from "./pages/AdminSide/Notifications/index";
import NutritionNotificationsPage from "./pages/NutritionSide/Notification/index";
import PatientNotificationsPage from "./pages/PatientSide/Notification/index";
import MicroKitchenNotificationsPage from "./pages/MicroKitchenSide/Notification/index";
import DoctorNotificationsPage from "./pages/DoctorSide/Notification/index";
import SupplyChainNotificationsPage from "./pages/SupplyChain/Notification/index";
import SupplyChainUserManagementPage from "./pages/MicroKitchenSide/UserManagement/index";
import NutritionSupportTicketPage from "./pages/NutritionSide/SupportTicket";
import MicroKitchenSupportTicketPage from "./pages/MicroKitchenSide/SupportTicket";
import NonPatientSupportTicketPage from "./pages/NonPatient/SupportTicket";
import SupplyChainSupportTicketPage from "./pages/SupplyChain/SupportTicket/index";
import SupplyChainDeliveryFeedbackPage from "./pages/SupplyChain/DeliveryFeedback";
import PatientDashboardPage from "./pages/PatientSide/Dashboard/index";
import NutritionDashboardPage from "./pages/NutritionSide/Dashboard/index";
import MicroKitchenDashboardPage from "./pages/MicroKitchenSide/Dashboard/index";
import NonPatientDashboardPage from "./pages/NonPatient/Dashboard/index";
import NutritionKitchenReassignment from "./pages/AdminSide/NutritionKitchenReassignment/index";
import OrderManagementPage from "./pages/AdminSide/OrderManagement/index";
import KitchenPayoutsPage from "./pages/AdminSide/KitchenPayouts/index";
import RecordPlanPayoutsPage from "./pages/AdminSide/RecordPlanPayouts/index";
import PlanPaymentsOverviewPage from "./pages/AdminSide/PlanPaymentsOverview/index";
import OrderCommissionPage from "./pages/AdminSide/OrderCommission";
import NutritionPlanPayoutsPage from "./pages/NutritionSide/PlanPayouts/index";
import MicroKitchenPlanPayoutsPage from "./pages/MicroKitchenSide/PlanPayouts/index";
import MicroKitchenSupplyChainPayoutPage from "./pages/MicroKitchenSide/SupplyChainPayout/index";
import MicroKitchenOrderPaymentSnapshotsPage from "./pages/MicroKitchenSide/OrderPaymentSnapshots/index";
import ReferenceLibraryPage from "./pages/NutritionSide/ReferenceLibrary/index";
import ListOfFoods from "./pages/NutritionSide/ReferenceLibrary/ListOfFoods";
import AvailabilityCalendar from "./pages/NutritionSide/AvailabilityCalendar/index";
import PaymentHistoryPage from "./pages/PatientSide/PaymentHistory/index";
import NonPatientPaymentHistoryPage from "./pages/NonPatient/PaymentHistory/index";
import NutritionInstructionsPage from "./pages/NutritionSide/Instructions/index";
import PatientInstructionsPage from "./pages/PatientSide/Instructions/index";
import NonPatientInstructionsPage from "./pages/NonPatient/Instructions/index";
import MicroKitchenInstructionsPage from "./pages/MicroKitchenSide/Instructions/index";
import MicroKitchenDeliveryManagementPage from "./pages/MicroKitchenSide/DeliveryManagement/index";
import MicroKitchenPlannedLeavePage from "./pages/MicroKitchenSide/PlannedLeave/index";
import MicroKitchenGlobalDeliveryPage from "./pages/MicroKitchenSide/DeliveryManagement/GlobalAssignments";
import MicroKitchenDailyDeliveryPage from "./pages/MicroKitchenSide/DeliveryManagement/DailyReassignments";
import MicroKitchenDeliveryPersonInfoPage from "./pages/MicroKitchenSide/DeliveryPersonInfo/index";
import SupplyChainTeamMemberForMKPage from "./pages/MicroKitchenSide/SupplyChainTeamMemberForMK";
import NutritionPatientUnavailabilityPage from "./pages/NutritionSide/PatientUnavailability/index";
import PatientUnavailabilityRequestPage from "./pages/PatientSide/PatientUnavailability/index";
import KitchenExecutionPage from "./pages/MicroKitchenSide/KitchenExecution/index";
import NutritionWorkFlowPage from "./pages/NutritionSide/WorkFlow/index";
import MicroKitchenWorkFlowPage from "./pages/MicroKitchenSide/WorkFlow/index";
import NutritionUserMappingPage from "./pages/NutritionSide/NutritionMapping/UserMapping";
import PatientWorkFlowPage from "./pages/PatientSide/WorkFlow/index";



// Master Side Pages
import MasterDashboard from "./pages/MasterSide/Dashboard/index";
import CompanyInfoPage from "./pages/MasterSide/CompanyInfo/index";
import HeroBannerPage from "./pages/MasterSide/HeroBanner/index";
import MedicalDeviceCategoryPage from "./pages/MasterSide/MedicalDeviceCategory/index";
import MedicalDevicePage from "./pages/MasterSide/MedicalDevice/index";
import DeviceFeaturePage from "./pages/MasterSide/DeviceFeature/index";
import ResearchPaperPage from "./pages/MasterSide/ResearchPaper/index";
import BlogCategoryPage from "./pages/MasterSide/BlogCategory/index";
import BlogTagPage from "./pages/MasterSide/BlogTag/index";
import BlogPostPage from "./pages/MasterSide/BlogPost/index";
import WebsiteBlogCreate from "./website/blog-create/page";
import BlogCommentPage from "./pages/MasterSide/BlogComment/index";
import FAQCategoryPage from "./pages/MasterSide/FAQCategory/index";
import FAQPage from "./pages/MasterSide/FAQ/index";
import ReportTypePage from "./pages/MasterSide/ReportType/index";
import WebsiteReportPage from "./pages/MasterSide/WebsiteReport/index";
import DepartmentPage from "./pages/MasterSide/Department/index";
import TeamMemberPage from "./pages/MasterSide/TeamMember/index";
import JobListingPage from "./pages/MasterSide/JobListing/index";
import JobApplicationPage from "./pages/MasterSide/JobApplication/index";
import GalleryCategoryPage from "./pages/MasterSide/GalleryCategory/index";
import GalleryItemPage from "./pages/MasterSide/GalleryItem/index";
import PartnerPage from "./pages/MasterSide/Partner/index";
import LegalPageList from "./pages/MasterSide/LegalPage/index";
import CompanyAboutSectionList from "./pages/MasterSide/CompanyAboutSection/index";
import PatentList from "./pages/MasterSide/Patent/index";
import TestimonialPage from "./pages/MasterSide/Testimonial/index";
import WorkflowStepPage from "./pages/MasterSide/WorkflowStep/index";
import PricingPlanPage from "./pages/MasterSide/PricingPlan/index";
// import StatCounterPage from "./pages/MasterSide/StatCounter/index";
import WebsiteInquiryPage from "./pages/MasterSide/WebsiteInquiry/index";

// Website Pages
const WebsiteLayout = lazy(() => import("./website/layout"));
const WebsiteHome = lazy(() => import("./website/page"));
const WebsiteAbout = lazy(() => import("./website/about/page"));
const WebsiteBlog = lazy(() => import("./website/blog/page"));
// const WebsiteBlog2 = lazy(() => import("./website/blog-2/page"));
const WebsiteBlogDetails = lazy(() => import("./website/blog-details/page"));
const WebsiteContact = lazy(() => import("./website/contact/page"));
const WebsiteDepartments = lazy(() => import("./website/departments/page"));
const WebsiteDepartmentDetails = lazy(() => import("./website/department-details/page"));
// const WebsiteDepartmentDetails2 = lazy(() => import("./website/department-details-2/page"));
// const WebsiteDepartmentDetails3 = lazy(() => import("./website/department-details-3/page"));
// const WebsiteDepartmentDetails4 = lazy(() => import("./website/department-details-4/page"));
// const WebsiteDepartmentDetails5 = lazy(() => import("./website/department-details-5/page"));
// const WebsiteDepartmentDetails6 = lazy(() => import("./website/department-details-6/page"));
const WebsiteDoctors = lazy(() => import("./website/doctors/page"));
const WebsiteDoctorDetails = lazy(() => import("./website/doctor-details/page"));
const WebsitePortfolio = lazy(() => import("./website/portfolio/page"));
// const WebsitePortfolio2 = lazy(() => import("./website/portfolio-2/page"));
const WebsitePricing = lazy(() => import("./website/pricing/page"));
const WebsiteLogin = lazy(() => import("./website/login/page"));
const WebsiteRegister = lazy(() => import("./website/register/page"));
// const WebsiteIndex2 = lazy(() => import("./website/index-2/page"));
// const WebsiteIndex3 = lazy(() => import("./website/index-3/page"));
const WebsiteError = lazy(() => import("./website/error/page"));
const WebsiteFAQ = lazy(() => import("./website/faq/page"));
const WebsiteCareerDetails = lazy(() => import("./website/career-details/page"));
const WebsiteCareers = lazy(() => import("./website/careers/page"));
const WebsiteCareerApply = lazy(() => import("./website/career-apply/page"));
const WebsiteMedicalDevices = lazy(() => import("./website/medical-devices/page"));
const WebsiteMedicalDeviceDetails = lazy(() => import("./website/medical-device-details/page"));
const WebsiteDeviceCategories = lazy(() => import("./website/device-categories/page"));
const WebsiteResearch = lazy(() => import("./website/research/page"));
const WebsiteResearchDetails = lazy(() => import("./website/research-details/page"));
const WebsitePatents = lazy(() => import("./website/patents/page"));
const WebsitePatentDetails = lazy(() => import("./website/patent-details/page"));
const WebsiteGallery = lazy(() => import("./website/gallery/page"));
const WebsiteGalleryDetails = lazy(() => import("./website/gallery-details/page"));
const WebsitePartners = lazy(() => import("./website/partners/page"));
const WebsitePartnerDetails = lazy(() => import("./website/partner-details/page"));
// const WebsiteAppointment = lazy(() => import("./website/appointment/page"));

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
          <Route path="master/dashboard" element={<MasterDashboard />} />

          {/* Master Management Routes */}
          <Route path="master/companyinfo" element={<CompanyInfoPage />} />
          <Route path="master/herobanner" element={<HeroBannerPage />} />
          <Route path="master/medicaldevicecategory" element={<MedicalDeviceCategoryPage />} />
          <Route path="master/medicaldevice" element={<MedicalDevicePage />} />
          <Route path="master/devicefeature" element={<DeviceFeaturePage />} />
          <Route path="master/researchpaper" element={<ResearchPaperPage />} />
          <Route path="master/blogcategory" element={<BlogCategoryPage />} />
          <Route path="master/blogtag" element={<BlogTagPage />} />
          <Route path="master/blogpost" element={<BlogPostPage />} />
          <Route path="master/blogcomment" element={<BlogCommentPage />} />
          <Route path="master/faqcategory" element={<FAQCategoryPage />} />
          <Route path="master/faq" element={<FAQPage />} />
          <Route path="master/reporttype" element={<ReportTypePage />} />
          <Route path="master/websitereport" element={<WebsiteReportPage />} />
          <Route path="master/department" element={<DepartmentPage />} />
          <Route path="master/teammember" element={<TeamMemberPage />} />
          <Route path="master/joblisting" element={<JobListingPage />} />
          <Route path="master/jobapplication" element={<JobApplicationPage />} />
          <Route path="master/gallerycategory" element={<GalleryCategoryPage />} />
          <Route path="master/galleryitem" element={<GalleryItemPage />} />
          <Route path="master/partner" element={<PartnerPage />} />
          <Route path="master/legalpage" element={<LegalPageList />} />
          <Route path="master/companyaboutsection" element={<CompanyAboutSectionList />} />
          <Route path="master/patent" element={<PatentList />} />
          <Route path="master/testimonial" element={<TestimonialPage />} />
          <Route path="master/workflowstep" element={<WorkflowStepPage />} />
          <Route path="master/pricingplan" element={<PricingPlanPage />} />
          {/* <Route path="master/statcounter" element={<StatCounterPage />} /> */}
          <Route path="master/websiteinquiry" element={<WebsiteInquiryPage />} />

          <Route path="master/master-dashboard" element={<MasterDashboard />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="patient/dashboard" element={<PatientDashboardPage />} />
          <Route path="nutrition/dashboard" element={<NutritionDashboardPage />} />
          <Route path="microkitchen/dashboard" element={<MicroKitchenDashboardPage />} />
          <Route path="non-patient/dashboard" element={<NonPatientDashboardPage />} />
          <Route path="admin/usermanagement" element={<UserManagementPage />} />
          <Route path="admin/micro-kitchen-information" element={<MicroKitchenInformationPage />} />
          <Route path="admin/nutrition-information" element={<NutritionInformationPage />} />
          <Route path="admin/doctor-overview" element={<DoctorOverViewPage />} />
          <Route path="admin/supply-chain-overview" element={<SupplyChainOverViewPage />} />
          <Route path="admin/country" element={<CountryManagementPage />} />
          <Route path="admin/health-condition-master" element={<HealthConditionMasterPage />} />
          <Route path="admin/symptom-master" element={<SymptomMasterPage />} />
          <Route path="admin/autoimmune-master" element={<AutoimmuneMasterPage />} />
          <Route path="admin/deficiency-master" element={<DeficiencyMasterPage />} />
          <Route path="admin/digestive-issue-master" element={<DigestiveIssueMasterPage />} />
          <Route path="admin/skin-issue-master" element={<SkinIssueMasterPage />} />
          <Route path="admin/habit-master" element={<HabitMasterPage />} />
          <Route path="admin/activity-master" element={<ActivityMasterPage />} />
          <Route path="admin/state" element={<StateManagementPage />} />
          <Route path="admin/city" element={<CityManagementPage />} />
          <Route path="admin/meal-type" element={<MealTypeManagementPage />} />
          <Route path="admin/delivery-slot" element={<DeliverySlotManagementPage />} />
          <Route path="admin/packaging-material" element={<PackagingMaterialManagementPage />} />
          <Route path="admin/cuisine-type" element={<CuisineTypeManagementPage />} />
          <Route path="admin/food" element={<FoodManagementPage />} />
          <Route path="nutrition/food" element={<ListOfFoods />} />
          <Route path="admin/unit" element={<UnitManagementPage />} />
          <Route path="admin/ingredient" element={<IngredientManagementPage />} />
          <Route path="admin/food-ingredient" element={<FoodIngredientManagementPage />} />
          <Route path="admin/food-step" element={<FoodStepManagementPage />} />
          <Route path="admin/recipe-creator" element={<RecipeManagementPage />} />
          <Route path="admin/health-parameter" element={<HealthParameterManagementPage />} />
          <Route path="admin/normal-range" element={<NormalRangeManagementPage />} />
          <Route path="admin/diet-plan" element={<DietPlanManagementPage />} />
          <Route path="admin/food-group" element={<FoodGroupManagementPage />} />
          <Route path="admin/food-name" element={<FoodNameManagementPage />} />
          <Route path="admin/food-proximate" element={<FoodProximateManagementPage />} />
          <Route path="admin/food-water-soluble-vitamins" element={<FoodWaterSolubleVitaminsManagementPage />} />
          <Route path="admin/food-fat-soluble-vitamins" element={<FoodFatSolubleVitaminsManagementPage />} />
          <Route path="admin/food-carotenoids" element={<FoodCarotenoidsManagementPage />} />
          <Route path="admin/food-minerals" element={<FoodMineralsManagementPage />} />
          <Route path="admin/food-sugars" element={<FoodSugarsManagementPage />} />
          <Route path="admin/food-amino-acids" element={<FoodAminoAcidsManagementPage />} />
          <Route path="admin/food-organic-acids" element={<FoodOrganicAcidsManagementPage />} />
          <Route path="admin/food-polyphenols" element={<FoodPolyphenolsManagementPage />} />
          <Route path="admin/food-phytochemicals" element={<FoodPhytochemicalsManagementPage />} />
          <Route path="admin/food-fatty-acid-profile" element={<FoodFattyAcidProfileManagementPage />} />
          <Route path="admin/user-nutrition-mapping" element={<UserNutritionMappingPage />} />
          <Route path="admin/patient-payment-verification" element={<PatientPaymentVerificationPage />} />
          <Route path="admin/patients-overview" element={<PatientOverviewPage />} />
          <Route path="admin/patient-all-questionarie" element={<PatientAllQuestionariePage />} />
          <Route path="doctor/all-patients" element={<DoctorAllPatientsPage />} />
          <Route path="doctor/support-tickets" element={<DoctorSupportTicketPage />} />
          <Route path="doctor/notifications" element={<DoctorNotificationsPage />} />
          <Route path="admin/non-patient-information" element={<NonPatientInformationPage />} />
          <Route path="admin/ticket-category" element={<TicketCategoryPage />} />
          <Route path="admin/support-ticket-requests" element={<SupportTicketRequestsPage />} />
          <Route path="admin/notifications" element={<AdminNotificationsPage />} />
          <Route path="admin/reassignment-logs" element={<NutritionKitchenReassignment />} />
          <Route path="admin/all-orders" element={<OrderManagementPage />} />
          <Route path="admin/order-commission" element={<OrderCommissionPage />} />
          <Route path="admin/payouts" element={<KitchenPayoutsPage />} />
          <Route path="admin/record-plan-payouts" element={<RecordPlanPayoutsPage />} />
          <Route path="admin/plan-payments-overview" element={<PlanPaymentsOverviewPage />} />
          <Route path="nutrition/reference/ranges" element={<ReferenceLibraryPage />} />
          <Route path="patient/questionnaire" element={<PatientQuestionnairePage />} />
          <Route path="patient/nutrition-allotted" element={<NutritionAllotedPage />} />
          <Route path="patient/plans" element={<PlansPage />} />
          <Route path="nutrition/plans" element={<PlansPage />} />
          <Route path="patient/suggested-plans" element={<SuggestedPlansPage />} />
          <Route path="patient/suggested-kitchens" element={<SuggestedPlansPage />} />
          <Route path="patient/foods" element={<NonPatientFoodsPage />} />
          <Route path="patient/micro-kitchens" element={<ListOfMicroKitchenPage />} />
          <Route path="patient/discover-kitchens" element={<NonPatientListOfMicroKitchenPage />} />
          <Route path="patient/kitchen/:kitchenId/menu" element={<KitchenMenuPage />} />
          <Route path="patient/cart" element={<PatientCartPage />} />
          <Route path="patient/orders" element={<PatientOrdersPage />} />
          <Route path="patient/payment-history" element={<PaymentHistoryPage />} />
          <Route path="microkitchen/orders" element={<KitchenOrdersPage />} />
          <Route path="microkitchen/instructions" element={<MicroKitchenInstructionsPage />} />
          <Route path="microkitchen/delivery-charges" element={<MicroKitchenDeliveryChargesPage />} />
          <Route path="patient/health-reports" element={<HealthReportUploadPage />} />
          <Route path="patient/meals-allotted" element={<MealsAllotedPage />} />
          <Route path="patient/delivery-issues" element={<PatientDeliveryIssuePage />} />
          <Route path="patient/meeting-request" element={<SendingMeetingRequest />} />
          <Route path="patient/support-tickets" element={<PatientSupportTicketPage />} />
          <Route path="patient/notifications" element={<PatientNotificationsPage />} />
          <Route path="patient/instructions" element={<PatientInstructionsPage />} />
          <Route path="patient/suggested-foods" element={<SuggestedFoodNameFromNutritionPage />} />
          <Route path="patient/unavailability" element={<PatientUnavailabilityRequestPage />} />
          <Route path="patient/workflow" element={<PatientWorkFlowPage />} />

          <Route path="nutrition/questionnaire" element={<NutritionQuestionarePage />} />
          <Route path="nutrition/allotted-patients" element={<AllotedPatientsPage />} />
          <Route path="nutrition/set-meals" element={<SetDailyMealsPage />} />
          <Route path="nutrition/patient-unavailability" element={<NutritionPatientUnavailabilityPage />} />
          <Route path="nutrition/uploaded-documents" element={<UploadedDocumentsByPatientPage />} />
          <Route path="nutrition/suggest-foods" element={<SuggestFoodNameToPatientsPage />} />
          <Route path="nutrition/suggest-plan" element={<SuggestPlanToPatientsPage />} />
          <Route path="nutrition/allot-micro-kitchen" element={<SuggestPlanToPatientsPage />} />
          <Route path="nutrition/approved-plans" element={<ApprovesPlansByPatientsPage />} />
          <Route path="nutrition/meeting-requests" element={<MeetingRequestsByPatients />} />
          <Route path="nutrition/micro-kitchens" element={<ListOfMicroKitchensPage />} />
          <Route path="nutrition/micro-kitchen-inspection" element={<MicroKitchenInspectionPage />} />
          <Route path="nutrition/support-tickets" element={<NutritionSupportTicketPage />} />
          <Route path="nutrition/notifications" element={<NutritionNotificationsPage />} />
          <Route path="nutrition/plan-payouts" element={<NutritionPlanPayoutsPage />} />
          <Route path="nutrition/availability-calendar" element={<AvailabilityCalendar />} />
          <Route path="nutrition/instructions" element={<NutritionInstructionsPage />} />
          <Route path="nutrition/workflow" element={<NutritionWorkFlowPage />} />
          <Route path="nutrition/nutrition-mapping/user-mapping" element={<NutritionUserMappingPage />} />
          <Route path="nutrition/blogcategory" element={<BlogCategoryPage />} />
          <Route path="nutrition/blogtag" element={<BlogTagPage />} />
          <Route path="nutrition/blogpost" element={<BlogPostPage />} />
          <Route path="nutrition/blogcomment" element={<BlogCommentPage />} />

          {/* Nutritionist Food Management */}
          <Route path="nutrition/meal-type" element={<MealTypeManagementPage />} />
          <Route path="nutrition/cuisine-type" element={<CuisineTypeManagementPage />} />
          <Route path="nutrition/food-management" element={<FoodManagementPage />} />
          <Route path="nutrition/unit" element={<UnitManagementPage />} />
          <Route path="nutrition/ingredient" element={<IngredientManagementPage />} />
          <Route path="nutrition/recipe-management" element={<RecipeManagementPage />} />
          <Route path="microkitchen/reviews" element={<ReviewsPage />} />
          <Route path="microkitchen/delivery-feedback" element={<MicroKitchenDeliveryFeedbackPage />} />
          <Route path="microkitchen/available-foods" element={<AvailableFoodsPage />} />
          <Route path="microkitchen/workflow" element={<MicroKitchenWorkFlowPage />} />
          <Route path="microkitchen/questionnaire" element={<MicroKitchenQuestionarePage />} />
          <Route path="microkitchen/inspection-report" element={<InspectionReportPage />} />
          <Route path="microkitchen/patients" element={<MicroKitchenPatientsPage />} />
          <Route path="microkitchen/daily-prep" element={<MealsBasedOnDailyPage />} />
          <Route path="microkitchen/kitchen-execution" element={<KitchenExecutionPage />} />
          <Route path="microkitchen/support-tickets" element={<MicroKitchenSupportTicketPage />} />
          <Route path="microkitchen/plan-payouts" element={<MicroKitchenPlanPayoutsPage />} />
          <Route path="microkitchen/supply-chain-payouts" element={<MicroKitchenSupplyChainPayoutPage />} />
          <Route path="microkitchen/order-payments" element={<MicroKitchenOrderPaymentSnapshotsPage />} />
          <Route path="microkitchen/notifications" element={<MicroKitchenNotificationsPage />} />
          <Route path="microkitchen/delivery" element={<MicroKitchenDeliveryManagementPage />} />
          <Route path="microkitchen/delivery/global" element={<MicroKitchenGlobalDeliveryPage />} />
          <Route path="microkitchen/delivery/daily" element={<MicroKitchenDailyDeliveryPage />} />
          <Route path="microkitchen/delivery/team-members" element={<SupplyChainTeamMemberForMKPage />} />
          <Route path="microkitchen/delivery/profiles" element={<MicroKitchenDeliveryPersonInfoPage />} />
          <Route path="microkitchen/planned-leave" element={<MicroKitchenPlannedLeavePage />} />
          <Route path="microkitchen/user-management" element={<SupplyChainUserManagementPage />} />
          <Route path="non-patient/payment-history" element={<NonPatientPaymentHistoryPage />} />
          <Route path="non-patient/instructions" element={<NonPatientInstructionsPage />} />
          <Route path="non-patient/support-tickets" element={<NonPatientSupportTicketPage />} />
          <Route path="supplychain/dashboard" element={<SupplyChainDashboardPage />} />
          <Route path="supplychain/daily-work" element={<DeliveryAssignmentsPage />} />
          <Route path="supplychain/seperate-orders" element={<SupplyChainSeperateOrdersPage />} />
          <Route path="supplychain/earnings" element={<SupplyChainEarningsPage />} />
          <Route path="supplychain/planned-leave" element={<SupplyChainPlannedLeavePage />} />
          <Route path="supplychain/delivery-feedback" element={<SupplyChainDeliveryFeedbackPage />} />
          <Route path="supplychain/delivery-questionnaire" element={<DeliveryQuestionarePage />} />
          <Route path="supplychain/support-tickets" element={<SupplyChainSupportTicketPage />} />
          <Route path="supplychain/notifications" element={<SupplyChainNotificationsPage />} />
          <Route path="supplychain/assignments" element={<Navigate to="/supplychain/daily-work" replace />} />


          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/profile-info" element={<ProfileInformationPage />} />
          <Route path="/profile-info/security" element={<UpdateUsernamePasswordPage />} />
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

        {/* Website Routes */}
        <Route path="/" element={<WebsiteLayout />}>
          <Route index element={<WebsiteHome />} />
          <Route path="about" element={<WebsiteAbout />} />
          <Route path="blog" element={<WebsiteBlog />} />
          <Route path="blog-create" element={<WebsiteBlogCreate />} />
          {/* <Route path="blog-standard" element={<WebsiteBlog2 />} /> */}
          <Route path="blog-details" element={<WebsiteBlogDetails />} />
          <Route path="blog-details/:uid" element={<WebsiteBlogDetails />} />
          <Route path="contact" element={<WebsiteContact />} />
          <Route path="departments" element={<WebsiteDepartments />} />
          <Route path="department-details" element={<WebsiteDepartmentDetails />} />
          <Route path="department-details/:uid" element={<WebsiteDepartmentDetails />} />
          {/* <Route path="department-details-2" element={<WebsiteDepartmentDetails2 />} />
          <Route path="department-details-3" element={<WebsiteDepartmentDetails3 />} />
          <Route path="department-details-4" element={<WebsiteDepartmentDetails4 />} />
          <Route path="department-details-5" element={<WebsiteDepartmentDetails5 />} />
          <Route path="department-details-6" element={<WebsiteDepartmentDetails6 />} /> */}
          <Route path="doctors" element={<WebsiteDoctors />} />
          <Route path="doctor-details" element={<WebsiteDoctorDetails />} />
          <Route path="doctor-details/:uid" element={<WebsiteDoctorDetails />} />
          <Route path="portfolio" element={<WebsitePortfolio />} />
          {/* <Route path="portfolio-2" element={<WebsitePortfolio2 />} /> */}
          <Route path="plans" element={<WebsitePricing />} />
          <Route path="login" element={<WebsiteLogin />} />
          <Route path="register" element={<WebsiteRegister />} />
          {/* <Route path="index-2" element={<WebsiteIndex2 />} />
          <Route path="index-3" element={<WebsiteIndex3 />} /> */}
          <Route path="error" element={<WebsiteError />} />
          <Route path="faq" element={<WebsiteFAQ />} />
          <Route path="careers" element={<WebsiteCareers />} />
          <Route path="careers/:uid" element={<WebsiteCareerDetails />} />
          <Route path="careers/apply/:uid" element={<WebsiteCareerApply />} />
          <Route path="medical-devices" element={<WebsiteMedicalDevices />} />
          <Route path="medical-devices/:uid" element={<WebsiteMedicalDeviceDetails />} />
          <Route path="device-categories" element={<WebsiteDeviceCategories />} />
          <Route path="research" element={<WebsiteResearch />} />
          <Route path="research/:uid" element={<WebsiteResearchDetails />} />
          <Route path="patents" element={<WebsitePatents />} />
          <Route path="patents/:uid" element={<WebsitePatentDetails />} />
          <Route path="gallery" element={<WebsiteGallery />} />
          <Route path="gallery/:uid" element={<WebsiteGalleryDetails />} />
          <Route path="partners" element={<WebsitePartners />} />
          <Route path="partners/:uid" element={<WebsitePartnerDetails />} />
          {/* <Route path="appointment" element={<WebsiteAppointment />} /> */}
        </Route>


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
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/resetpassword" element={<ForgotPassword />} />

        {/* Fallback Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
