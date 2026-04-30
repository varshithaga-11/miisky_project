import React from "react";
import { 
  Truck, 
  FileText, 
  Users, 
  Package, 
  ClipboardList,
  Milestone,
  MapPin, 
  Layers, 
  Wallet, 
  Star, 
  UserCog, 
  HelpCircle,
  Bell,
  LayoutDashboard,
  ChefHat,
  ChevronRight
} from "lucide-react";

/**
 * Micro-Kitchen Instructions Component
 * 
 * Provides an operational guide for partner kitchens to manage orders, 
 * preparations, and logistics within the Miisky ecosystem.
 */
const MicroKitchenInstructions: React.FC = () => {
  const steps = [
    {
      title: "1. Dashboard",
      description:
        "Use Dashboard to monitor active workload, service status, and critical kitchen updates at a glance.",
      icon: <LayoutDashboard className="w-6 h-6 text-indigo-500" />,
      menu: "Dashboard",
    },
    {
      title: "2. Questionnaire",
      description:
        "Complete and maintain the kitchen questionnaire flow used for operational and compliance readiness.",
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      menu: "Questionnaire",
    },
    {
      title: "3. Inspection Report",
      description:
        "Review and maintain inspection-report information used to track kitchen standards and audit readiness.",
      icon: <FileText className="w-6 h-6 text-sky-500" />,
      menu: "Inspection Report",
    },
    {
      title: "4. Patients",
      description:
        "Access assigned patient profiles and coordinate kitchen-side execution for their planned dietary requirements.",
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      menu: "Patients",
    },
    {
      title: "5. Daily Prep(From Patients)",
      description:
        "Track daily prep requirements generated from patient-side planning so kitchen operations remain synchronized.",
      icon: <Truck className="w-6 h-6 text-amber-500" />,
      menu: "Daily Prep(From Patients)",
    },
    {
      title: "6. Kitchen execution",
      description:
        "Use Kitchen execution to track in-kitchen progress and ensure prepared meals align with required execution states.",
      icon: <ClipboardList className="w-6 h-6 text-lime-600" />,
      menu: "Kitchen execution",
    },
    {
      title: "7. Manage Orders(From Non Patients and Patients)",
      description:
        "Handle combined order operations for both patient and non-patient channels from a single order-management view.",
      icon: <Package className="w-6 h-6 text-rose-500" />,
      menu: "Manage Orders(From Non Patients and Patients)",
    },
    {
      title: "8. Order payments",
      description:
        "Review order payment records and payment snapshots related to fulfilled kitchen orders.",
      icon: <Wallet className="w-6 h-6 text-fuchsia-600" />,
      menu: "Order payments",
    },
    {
      title: "9. Delivery charges",
      description:
        "Configure delivery charges used during checkout and dispatch operations for service areas.",
      icon: <MapPin className="w-6 h-6 text-cyan-500" />,
      menu: "Delivery charges",
    },
    {
      title: "10. Team Management",
      description:
        "Manage supply chain users and staff assignments specifically for your kitchen operations.",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      menu: "Team Management",
    },
    {
      title: "11. Inventory",
      description:
        "Manage kitchen stocks, ingredients, and measurement units to ensure preparation resources are always accounted for.",
      icon: <ClipboardList className="w-6 h-6 text-violet-500" />,
      menu: "Inventory",
      subItems: [
        "Ingredient Units",
        "Base Ingredients",
        "Stock Management",
      ],
    },
    {
      title: "12. Delivery management",
      description:
        "Manage assignment, team planning, profiles, and delivery quality workflows from one control section.",
      icon: <Milestone className="w-6 h-6 text-orange-600" />,
      menu: "Delivery management",
      subItems: [
        "Global assignment",
        "Team members",
        "Team planned leave",
        "Delivery profiles",
        "Delivery Reviews",
        "Supply chain payouts",
      ],
    },
    {
      title: "13. Available Foods",
      description:
        "Maintain the kitchen's available food catalog so discoverability and ordering remain current.",
      icon: <Layers className="w-6 h-6 text-orange-500" />,
      menu: "Available Foods",
    },
    {
      title: "14. Diet plan payouts",
      description:
        "Track payouts linked to diet-plan execution and review related settlement details.",
      icon: <Wallet className="w-6 h-6 text-teal-500" />,
      menu: "Diet plan payouts",
    },
    {
      title: "15. Kitchen Reviews",
      description:
        "Monitor Kitchen Reviews to assess service quality feedback and improve delivery performance.",
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      menu: "Kitchen Reviews",
    },
    {
      title: "16. Profile",
      description:
        "Maintain profile and account details used for kitchen identity, communication, and secure access.",
      icon: <UserCog className="w-6 h-6 text-indigo-600" />,
      menu: "Profile",
    },
    {
      title: "17. Support Tickets",
      description:
        "Create and track support issues with platform teams for operational or technical assistance.",
      icon: <HelpCircle className="w-6 h-6 text-purple-500" />,
      menu: "Support Tickets",
    },
    {
      title: "18. Notifications",
      description:
        "Monitor real-time updates related to orders, delivery actions, support status, and workflow changes.",
      icon: <Bell className="w-6 h-6 text-red-500" />,
      menu: "Notifications",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      {/* Aesthetic Header */}
      <div className="relative p-10 overflow-hidden bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-20 -mt-20 blur-3xl transition-all duration-700 group-hover:bg-emerald-500/10"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-bold tracking-tight mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Kitchen Partner Guide
            </div>
             <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
              Empowering Your <br/>Kitchen <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">Performance</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-light max-w-xl">
              From regulatory setup to daily preparation, follow this manual to maximize your efficiency as a Miisky Micro-Kitchen partner.
            </p>
          </div>
          <div className="hidden lg:block">
             <ChefHat className="w-32 h-32 text-emerald-500 opacity-10" />
          </div>
        </div>
      </div>

      {/* Logic Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className="flex flex-col bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-700 dark:text-gray-200 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shadow-inner mb-6">
              {step.icon}
            </div>

            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3 tracking-tight">{step.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed flex-grow">
              {step.description}
            </p>

            <div className="pt-4 border-t border-gray-50 dark:border-gray-700/50 mt-auto">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] uppercase tracking-widest">
                <ChevronRight className="w-3 h-3" />
                Linked Menu: {step.menu}
              </div>
              {step.subItems && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {step.subItems.map((subItem, subIdx) => (
                    <span
                      key={subIdx}
                      className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-[10px] text-gray-500 dark:text-gray-400 rounded-lg"
                    >
                      {subItem}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Operational Protocol Banner */}
      <div className="bg-emerald-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-center md:text-left">
            <h2 className="text-3xl font-bold mb-4">Precision Preparation</h2>
            <p className="text-emerald-100 leading-relaxed text-lg font-light">
              Your kitchen is a clinical partner. By following the "Daily Prep" logs exactly, you ensure that patients receive their medical nutrition exactly as prescribed by their nutritionists. Thank you for your commitment to quality.
            </p>
          </div>
          <div className="flex-shrink-0">
             <div className="p-8 rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20">
                <p className="text-4xl font-black text-white">100%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Clinical Accuracy</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MicroKitchenInstructions;
