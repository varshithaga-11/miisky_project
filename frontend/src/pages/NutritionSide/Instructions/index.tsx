import React from "react";
import { 
  LayoutDashboard,
  FileText, 
  Users, 
  Layers, 
  Briefcase, 
  ClipboardList, 
  Video, 
  Wallet,
  BookOpen,
  CalendarRange,
  UserCog,
  HelpCircle,
  Bell,
  Download,
  MessageSquare,
  ArrowRight
} from "lucide-react";

/**
 * Nutrition Instructions Component
 * 
 * Provides a comprehensive guide for nutritionists on how to navigate and use 
 * the Miisky platform to manage patients, plans, and clinical operations.
 */
const NutritionInstructions: React.FC = () => {
  const steps = [
    {
      title: "Dashboard",
      description:
        "Start on Dashboard to review high-level updates, active clinical workflows, and quick navigation to your most used nutrition operations.",
      icon: <LayoutDashboard className="w-6 h-6 text-violet-500" />,
      items: ["Dashboard"],
    },
    {
      title: "Questionnaire",
      description:
        "Use Questionnaire to review structured intake responses that help guide your clinical decisions and patient-specific recommendations.",
      icon: <FileText className="w-6 h-6 text-indigo-500" />,
      items: ["Questionnaire"],
    },
    {
      title: "Allotted Patients",
      description:
        "Manage your active caseload and navigate directly to clinical support functions linked to allotted patients.",
      icon: <Users className="w-6 h-6 text-indigo-500" />,
      items: ["Allotted Patients", "Suggest foods", "Patient Documents"],
      features: [<Download className="w-3 h-3" />, <MessageSquare className="w-3 h-3" />]
    },
    {
      title: "Nutrition & Patient Mapping",
      description:
        "Use Nutrition & Patient Mapping to view and manage nutritionist-patient assignments from one place.",
      icon: <Users className="w-6 h-6 text-blue-500" />,
      items: ["Nutrition & Patient Mapping"],
    },
    {
      title: "Meal Optimizer",
      description:
        "Meal Optimizer helps you assign and tune daily meal distributions aligned to approved plans and patient goals.",
      icon: <Layers className="w-6 h-6 text-rose-500" />,
      items: ["Meal Optimizer"]
    },
    {
      title: "Patient unavailability",
      description:
        "Track and manage patient unavailability windows so meal schedules and clinical planning remain accurate.",
      icon: <CalendarRange className="w-6 h-6 text-sky-500" />,
      items: ["Patient unavailability"],
    },
    {
      title: "Micro Kitchens & Diet Plans",
      description:
        "Review kitchens and plan options that support patient execution across preparation capability and diet strategy.",
      icon: <Briefcase className="w-6 h-6 text-amber-500" />,
      items: ["Micro Kitchens", "Kitchen inspection", "Diet Plans"]
    },
    {
      title: "Suggested & Approved Plans",
      description:
        "Create recommendations and monitor finalized outcomes through plan suggestion and approval workflows.",
      icon: <ClipboardList className="w-6 h-6 text-emerald-500" />,
      items: ["Suggest Plan & Kitchen", "Approved Plans"]
    },
    {
      title: "Engagement Hub",
      description:
        "Handle consultation coordination by managing patient meeting demand and your working schedule visibility.",
      icon: <Video className="w-6 h-6 text-orange-500" />,
      items: ["Meeting Requests", "Availability Calendar"]
    },
    {
      title: "Reference Library",
      description:
        "Use the reference set for clinical baselines and food-level context while planning recommendations.",
      icon: <BookOpen className="w-6 h-6 text-cyan-500" />,
      items: ["Normal Ranges", "Foods"]
    },
    {
      title: "Finance",
      description:
        "Review credited compensation tied to patient plan payout flows in the finance section.",
      icon: <Wallet className="w-6 h-6 text-teal-500" />,
      items: ["Finance"]
    },
    {
      title: "Food Management",
      description:
        "Maintain nutrition-side master data used for meal planning, recipe design, and ingredient-level operations.",
      icon: <Briefcase className="w-6 h-6 text-lime-600" />,
      items: ["Meal Type", "Cuisine Type", "Foods", "Units", "Ingredients", "Recipe Management"],
    },
    {
      title: "Profile",
      description:
        "Keep your personal and account-level information updated to support secure and accurate platform usage.",
      icon: <UserCog className="w-6 h-6 text-indigo-600" />,
      items: ["Profile"],
    },
    {
      title: "Support Tickets",
      description:
        "Use Support Tickets to raise, track, and resolve operational or technical issues with the support workflow.",
      icon: <HelpCircle className="w-6 h-6 text-purple-500" />,
      items: ["Support Tickets"]
    },
    {
      title: "Notifications",
      description:
        "Monitor real-time updates related to meetings, support status, planning workflows, and patient-facing changes.",
      icon: <Bell className="w-6 h-6 text-red-500" />,
      items: ["Notifications"],
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-[3rem] p-10 border border-gray-100 dark:border-gray-700 shadow-xl">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500 text-white rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            Module Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
            How Miisky <span className="text-brand-500">Works for You</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl leading-relaxed">
            Welcome to your clinical dashboard. Below is a detailed breakdown of how each menu helps you deliver premium nutritional care and manage your professional practice efficiently.
          </p>
        </div>
        
        {/* Notification Alert Simulation */}
        <div className="mt-8 flex flex-wrap gap-4">
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm animate-pulse">
            <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
              <Bell className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Live Notifications</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Receive alerts for tickets, meetings, and updates.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className="group flex flex-col bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-700 dark:text-gray-200 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-inner">
                {step.icon}
              </div>
              {step.features && (
                <div className="flex gap-1">
                  {step.features.map((f, i) => (
                    <div key={i} className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-400">
                      {f}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">{step.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed flex-grow">
              {step.description}
            </p>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Core Interaction</p>
              <div className="flex flex-col gap-2">
                {step.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <ArrowRight className="w-3 h-3 text-brand-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification Footer Card */}
      <div className="bg-brand-600 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 text-center lg:text-left">
          <div className="max-w-xl">
            <h2 className="text-3xl font-bold mb-4">Stay Notified, Always</h2>
            <p className="text-brand-100 leading-relaxed">
              Your "Notifications" center is highly active. You will receive real-time alerts whenever a patient opens a support ticket, requests a clinical meeting, or any significant update occurs in your patient profiles.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20">
                <Bell className="w-10 h-10 mb-4 mx-auto lg:mx-0" />
                <p className="text-xs font-bold uppercase tracking-wider text-brand-200">Alert Center</p>
             </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-brand-400/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default NutritionInstructions;
