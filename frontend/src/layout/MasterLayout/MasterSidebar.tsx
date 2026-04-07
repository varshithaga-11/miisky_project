import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  LayoutDashboard,
  FileText,
  MapPin,
  UserCog,
  ChevronDownIcon,
  Briefcase,
  CheckCircle,
  Users,
  Layers,
  Video,
  Truck,
  Milestone,
  ShoppingCart,
  Package,
  ClipboardList,
  HelpCircle,
  Bell,
  BookOpen,
  Wallet,
  Calendar,
  Mail,
  Search,
  X,
  CalendarRange,
  Heart,
} from "lucide-react"; // 👈 Example icons

import { HorizontaLDots } from "../../icons";

import { useSidebar } from "../../context/SidebarContext";
import { getUserRoleFromToken } from "../../utils/auth";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const adminNavItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Dashboard",
    path: "/admin/dashboard",
  },
  // {
  //   icon: <LayoutDashboard className="w-5 h-5" />,
  //   name: "Company",
  //   path: "/companies",
  // },
  {
    icon: <MapPin className="w-5 h-5" />,
    name: "Locations",
    subItems: [
      { name: "Countries", path: "/admin/country" },
      { name: "States", path: "/admin/state" },
      { name: "Cities", path: "/admin/city" },
    ],
  },
  {
    icon: <Heart className="w-5 h-5" />,
    name: "Questionnaire masters",
    subItems: [
      { name: "Health conditions", path: "/admin/health-condition-master" },
      { name: "Symptoms", path: "/admin/symptom-master" },
      { name: "Autoimmune", path: "/admin/autoimmune-master" },
      { name: "Deficiencies(Minerals and Vitamins)", path: "/admin/deficiency-master" },
      { name: "Digestive issues", path: "/admin/digestive-issue-master" },
      { name: "Skin issues", path: "/admin/skin-issue-master" },
    ],
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    name: "Food Management",
    subItems: [
      { name: "Meal Type", path: "/admin/meal-type" },
      { name: "Cuisine Type", path: "/admin/cuisine-type" },
      { name: "Packaging Material", path: "/admin/packaging-material" },
      { name: "Delivery slots", path: "/admin/delivery-slot" },
      { name: "Foods", path: "/admin/food" },
      { name: "Units", path: "/admin/unit" },
      { name: "Ingredients", path: "/admin/ingredient" },
      { name: "Recipe Management", path: "/admin/recipe-creator" },
    ],
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Food Composition",
    subItems: [
      { name: "Food Groups", path: "/admin/food-group" },
      { name: "Food Names", path: "/admin/food-name" },
      { name: "Proximate", path: "/admin/food-proximate" },
      { name: "Water Soluble Vitamins", path: "/admin/food-water-soluble-vitamins" },
      { name: "Fat Soluble Vitamins", path: "/admin/food-fat-soluble-vitamins" },
      { name: "Carotenoids", path: "/admin/food-carotenoids" },
      { name: "Minerals", path: "/admin/food-minerals" },
      { name: "Sugars", path: "/admin/food-sugars" },
      { name: "Amino Acids", path: "/admin/food-amino-acids" },
      { name: "Organic Acids", path: "/admin/food-organic-acids" },
      { name: "Polyphenols", path: "/admin/food-polyphenols" },
      { name: "Phytochemicals", path: "/admin/food-phytochemicals" },
      { name: "Fatty Acid Profile", path: "/admin/food-fatty-acid-profile" },
    ],
  },
  {
    icon: <UserCog className="w-5 h-5" />,
    name: "User Management",
    path: "/admin/usermanagement",
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Nutrition Mapping",
    subItems: [
      { name: "User Mapping", path: "/admin/user-nutrition-mapping" },
      { name: "Reassignment Logs", path: "/admin/reassignment-logs" },
    ],
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    name: "Overview Information",
    subItems: [
      { name: "Patients Overview", path: "/admin/patients-overview" },
      { name: "Non-Patient Users", path: "/admin/non-patient-information" },
      { name: "Micro Kitchens", path: "/admin/micro-kitchen-information" },
      { name: "Nutritionists", path: "/admin/nutrition-information" },
    ],
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    name: "Finance & Payments",
    subItems: [
      { name: "Payment Verification", path: "/admin/patient-payment-verification" },
      { name: "Record Plan Payouts", path: "/admin/record-plan-payouts" },
      { name: "Plan Payments Overview", path: "/admin/plan-payments-overview" },
    ],
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    name: "Orders Management",
    subItems: [
      { name: "All Orders", path: "/admin/all-orders" },
      // { name: "Kitchen Payouts", path: "/admin/payouts" },
    ],
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Health Monitoring",
    subItems: [
      { name: "Health Parameters", path: "/admin/health-parameter" },
      { name: "Normal Ranges", path: "/admin/normal-range" },
      { name: "Diet Plans", path: "/admin/diet-plan" },
    ],
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    name: "Support",
    subItems: [
      { name: "Ticket Categories", path: "/admin/ticket-category" },
      { name: "Support Ticket Requests", path: "/admin/support-ticket-requests" },
    ],
  },
  {
    icon: <Bell className="w-5 h-5" />,
    name: "Notifications",
    path: "/admin/notifications",
  },
  {
    icon: <UserCog className="w-5 h-5" />,
    name: "Profile",
    path: "/profile-info",
  },

];

const patientNavItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Dashboard",
    path: "/patient/dashboard",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    name: "Patient Guide",
    path: "/patient/instructions",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Questionnaire",
    path: "/patient/questionnaire",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Health Reports",
    path: "/patient/health-reports",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Nutritionist Allotted",
    path: "/patient/nutrition-allotted",
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    name: "Diet Plans & Micro-Kitchens",
    subItems: [
      { name: "Diet Plans", path: "/patient/plans" },
      { name: "Micro-Kitchens", path: "/patient/micro-kitchens" },
      { name: "Suggested Plans & Kitchens", path: "/patient/suggested-plans" },
    ],
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    name: "Meals Allotted",
    path: "/patient/meals-allotted",
  },
  {
    icon: <Video className="w-5 h-5" />,
    name: "Consultation",
    path: "/patient/meeting-request",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    name: "Foods",
    path: "/patient/foods",
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    name: "Cart",
    path: "/patient/cart",
  },
  {
    icon: <Package className="w-5 h-5" />,
    name: "My Bookings",
    path: "/patient/orders",
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    name: "Payment History",
    path: "/patient/payment-history",
  },
  {
    icon: <UserCog className="w-5 h-5" />,
    name: "Profile",
    path: "/profile-info",
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    name: "Support Tickets",
    path: "/patient/support-tickets",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    name: "Notifications",
    path: "/patient/notifications",
  },
];

const nutritionistNavItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Dashboard",
    path: "/nutrition/dashboard",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    name: "Nutrition Guide",
    path: "/nutrition/instructions",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Questionnaire",
    path: "/nutrition/questionnaire",
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Allotted Patients",
    subItems: [
      { name: "Allotted Patients", path: "/nutrition/allotted-patients" },
      { name: "Patient Documents", path: "/nutrition/uploaded-documents" },
    ],
  },
  {
    icon: <Layers className="w-5 h-5" />,
    name: "Meal Optimizer",
    path: "/nutrition/set-meals",
  },

  {
    icon: <Briefcase className="w-5 h-5" />,
    name: "Micro Kitchens & Diet Plans",
    subItems: [
      { name: "Micro Kitchens", path: "/nutrition/micro-kitchens" },
      { name: "Diet Plans", path: "/nutrition/plans" },
    ],
  },

  {
    icon: <FileText className="w-5 h-5" />,
    name: "Suggested & Approved Plans",
    subItems: [
      { name: "Suggest Plan & Kitchen", path: "/nutrition/suggest-plan" },
      { name: "Approved Plans", path: "/nutrition/approved-plans" },
    ],
  },
  {
    icon: <Video className="w-5 h-5" />,
    name: "Engagement Hub",
    subItems: [
      { name: "Meeting Requests", path: "/nutrition/meeting-requests" },
      { name: "Availability Calendar", path: "/nutrition/availability-calendar" },
    ],
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    name: "Finance",
    path: "/nutrition/plan-payouts",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    name: "Reference Library",
    subItems: [
      { name: "Normal Ranges", path: "/nutrition/reference/ranges" },
      { name: "Foods", path: "/nutrition/food" },
    ],
  },
  {
    icon: <UserCog className="w-5 h-5" />,
    name: "Profile",
    path: "/profile-info",
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    name: "Support Tickets",
    path: "/nutrition/support-tickets",
  },
  {
    icon: <Bell className="w-5 h-5" />,
    name: "Notifications",
    path: "/nutrition/notifications",
  },
];

const microKitchenNavItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Dashboard",
    path: "/microkitchen/dashboard",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    name: "Kitchen Guide",
    path: "/microkitchen/instructions",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Questionnaire",
    path: "/microkitchen/questionnaire",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Inspection Report",
    path: "/microkitchen/inspection-report",
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Patients",
    path: "/microkitchen/patients",
  },
  {
    icon: <Truck className="w-5 h-5" />,
    name: "Daily Prep(From Patients)",
    path: "/microkitchen/daily-prep",
  },
  {
    icon: <Package className="w-5 h-5" />,
    name: "Manage Orders(From Non Patients and Patients)",
    path: "/microkitchen/orders",
  },
  {
    icon: <MapPin className="w-5 h-5" />,
    name: "Delivery charges",
    path: "/microkitchen/delivery-charges",
  },
  {
    icon: <Milestone className="w-5 h-5" />,
    name: "Delivery management",
    subItems: [
      { name: "Global assignment", path: "/microkitchen/delivery/global" },
      { name: "Daily reassignment", path: "/microkitchen/delivery/daily" },
      { name: "Team members", path: "/microkitchen/delivery/team-members" },
      { name: "Delivery profiles", path: "/microkitchen/delivery/profiles" },
    ],
  },
  {
    icon: <Layers className="w-5 h-5" />,
    name: "Available Foods",
    path: "/microkitchen/available-foods",
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    name: "Diet plan payouts",
    path: "/microkitchen/plan-payouts",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Kitchen Reviews",
    path: "/microkitchen/reviews",
  },
  {
    icon: <UserCog className="w-5 h-5" />,
    name: "Profile",
    path: "/profile-info",
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    name: "Support Tickets",
    path: "/microkitchen/support-tickets",
  },
];

const supplyChainNavItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Dashboard",
    path: "/supplychain/dashboard",
  },
  {
    icon: <ClipboardList className="w-5 h-5" />,
    name: "All daily work",
    path: "/supplychain/daily-work",
  },
  {
    icon: <Package className="w-5 h-5" />,
    name: "My delivery orders",
    path: "/supplychain/seperate-orders",
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    name: "Earnings",
    path: "/supplychain/earnings",
  },
  {
    icon: <CalendarRange className="w-5 h-5" />,
    name: "Planned leave",
    path: "/supplychain/planned-leave",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Delivery Questionnaire",
    path: "/supplychain/delivery-questionnaire",
  },
  {
    icon: <UserCog className="w-5 h-5" />,
    name: "Profile",
    path: "/profile-info",
  },
];

const nonPatientNavItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Dashboard",
    path: "/non-patient/dashboard",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    name: "Navigation Guide",
    path: "/non-patient/instructions",
  },
  {
    icon: <Layers className="w-5 h-5" />,
    name: "Foods",
    path: "/patient/foods",
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    name: "Micro Kitchen",
    path: "/patient/discover-kitchens",
  },
  {
    icon: <ShoppingCart className="w-5 h-5" />,
    name: "Cart",
    path: "/patient/cart",
  },
  {
    icon: <Package className="w-5 h-5" />,
    name: "My Bookings",
    path: "/patient/orders",
  },
  {
    icon: <Wallet className="w-5 h-5" />,
    name: "Order History",
    path: "/non-patient/payment-history",
  },
  {
    icon: <UserCog className="w-5 h-5" />,
    name: "Profile",
    path: "/profile-info",
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    name: "Support Tickets",
    path: "/non-patient/support-tickets",
  },
];

const masterNavItems: NavItem[] = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    name: "Dashboard",
    path: "/master/dashboard",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    name: "Blog Management",
    subItems: [
      { name: "Blog Categories", path: "/master/blogcategory" },
      { name: "Blog Comments", path: "/master/blogcomment" },
      { name: "Blog Posts", path: "/master/blogpost" },
      { name: "Blog Tags", path: "/master/blogtag" },
    ],
  },
  {
    icon: <Briefcase className="w-5 h-5" />,
    name: "Company Management",
    subItems: [
      { name: "About Sections", path: "/master/companyaboutsection" },
      { name: "Company Info", path: "/master/companyinfo" },
      { name: "Hero Banners", path: "/master/herobanner" },
      { name: "Legal Pages", path: "/master/legalpage" },
      { name: "Workflow Steps", path: "/master/workflowstep" },
    ],
  },
  {
    icon: <HelpCircle className="w-5 h-5" />,
    name: "Content Management",
    subItems: [
      { name: "FAQ Categories", path: "/master/faqcategory" },
      { name: "FAQs", path: "/master/faq" },
      { name: "Pricing Plans", path: "/master/pricingplan" },
      { name: "Report Types", path: "/master/reporttype" },
      // { name: "Stat Counters", path: "/master/statcounter" },
      { name: "Testimonials", path: "/master/testimonial" },
      { name: "Website Reports", path: "/master/websitereport" },
    ],
  },
  {
    icon: <Layers className="w-5 h-5" />,
    name: "Gallery & Media",
    subItems: [
      { name: "Gallery Categories", path: "/master/gallerycategory" },
      { name: "Gallery Items", path: "/master/galleryitem" },
    ],
  },
  {
    icon: <Package className="w-5 h-5" />,
    name: "Medical Devices",
    subItems: [
      { name: "Device Categories", path: "/master/medicaldevicecategory" },
      { name: "Device Features", path: "/master/devicefeature" },
      { name: "Devices", path: "/master/medicaldevice" },
      { name: "Patents", path: "/master/patent" },
      { name: "Research Papers", path: "/master/researchpaper" },
    ],
  },
  {
    icon: <Truck className="w-5 h-5" />,
    name: "Partners",
    path: "/master/partner",
  },
  {
    icon: <Users className="w-5 h-5" />,
    name: "Team & Careers",
    subItems: [
      { name: "Departments", path: "/master/department" },
      { name: "Job Applications", path: "/master/jobapplication" },
      { name: "Job Listings", path: "/master/joblisting" },
      { name: "Team Members", path: "/master/teammember" },
    ],
  },
  {
    icon: <Mail className="w-5 h-5" />,
    name: "Website Inquiries",
    path: "/master/websiteinquiry",
  },
];

const MasterSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [openSubmenu, setOpenSubmenu] = useState<{
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const navItems = useMemo<NavItem[]>(() => {
    const role = getUserRoleFromToken();
    let items: NavItem[] = [];

    if (role === "master") items = masterNavItems;
    else if (role === "patient") items = patientNavItems;
    else if (role === "non_patient") items = nonPatientNavItems;
    else if (role === "nutritionist") items = nutritionistNavItems;
    else if (role === "micro_kitchen") items = microKitchenNavItems;
    else if (role === "supply_chain") items = supplyChainNavItems;
    else items = adminNavItems;

    if (!searchTerm) return items;

    const lowerSearch = searchTerm.toLowerCase();
    return items
      .map((item): NavItem | null => {
        const matchesName = item.name.toLowerCase().includes(lowerSearch);
        const matchedSubItems = item.subItems?.filter((sub) =>
          sub.name.toLowerCase().includes(lowerSearch)
        );

        if (matchesName || (matchedSubItems && matchedSubItems.length > 0)) {
          return {
            ...item,
            subItems: matchedSubItems?.length ? matchedSubItems : item.subItems,
          };
        }
        return null;
      })
      .filter((item): item is NavItem => item !== null);
  }, [searchTerm]);

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) =>
      prev && prev.index === index ? null : { index }
    );
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index)}
              className={`menu-item group ${openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={`menu-item-icon-size ${openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.index === index
                    ? "rotate-180 text-brand-500"
                    : ""
                    }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${isActive(nav.path)
                  ? "menu-item-active"
                  : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`menu-item-icon-size ${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.index === index
                    ? `${subMenuHeight[`${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      {(subItem.new || subItem.pro) && (
                        <span className="flex items-center gap-1 ml-auto">
                          {subItem.new && (
                            <span
                              className={`menu-dropdown-badge ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                                }`}
                            >
                              new
                            </span>
                          )}
                          {subItem.pro && (
                            <span
                              className={`menu-dropdown-badge ${isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                                }`}
                            >
                              pro
                            </span>
                          )}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const dashboardPath = useMemo(() => {
    const role = getUserRoleFromToken();
    if (role === "master") return "/master/dashboard";
    if (role === "patient") return "/patient/dashboard";
    if (role === "non_patient") return "/non-patient/dashboard";
    if (role === "nutritionist") return "/nutrition/dashboard";
    if (role === "micro_kitchen") return "/microkitchen/dashboard";
    if (role === "supply_chain") return "/supplychain/dashboard";
    return "/admin/dashboard";
  }, []);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
      ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
      ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="py-8 flex justify-center">
        <Link to={dashboardPath}>
          <img
            src="/miisky-logo.png"
            alt="Miisky Logo"
            className={`${isExpanded || isHovered || isMobileOpen ? "h-10" : "h-6"} w-auto`}
          />
        </Link>
      </div>

      {(isExpanded || isHovered || isMobileOpen) && (
        <div className="px-4 mb-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-gray-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <h2
            className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
              ? "lg:justify-center"
              : "justify-start"
              }`}
          >
            {isExpanded || isHovered || isMobileOpen ? (
              "Menu"
            ) : (
              <HorizontaLDots className="size-6" />
            )}
          </h2>
          {renderMenuItems(navItems)}
        </nav>
      </div>
    </aside>
  );
};

export default MasterSidebar;
