import React from "react";
import { 
  FileText, 
  Users, 
  Layers, 
  Briefcase, 
  ClipboardList, 
  Video, 
  Wallet,
  BookOpen,
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
      title: "Allotted Patients",
      description: "Manage your direct list of patients and their clinical history. Use the 'Patient Documents' submenu to view, download, and comment on multiple patient-uploaded medical records simultaneously.",
      icon: <Users className="w-6 h-6 text-indigo-500" />,
      items: ["Allotted Patients List", "Patient Documents (Download & Comment)"],
      features: [<Download className="w-3 h-3" />, <MessageSquare className="w-3 h-3" />]
    },
    {
      title: "Kitchens & Plans",
      description: "Browse the curated lists of Micro-Kitchens and Diet Plans available in the ecosystem to understand the culinary support and strategy options for your patients.",
      icon: <Briefcase className="w-6 h-6 text-amber-500" />,
      items: ["Micro Kitchens List", "Available Diet Plans"]
    },
    {
      title: "Suggested & Approved Plans",
      description: "A dual-action menu for strategy. 'Suggest Plan & Kitchen' allows you to assign specific diets and manage kitchen assignments/reassignments. 'Approved Plans' provides a complete historical log of a patient's plan evolution.",
      icon: <ClipboardList className="w-6 h-6 text-emerald-500" />,
      items: ["Suggest Plan & Kitchen", "Kitchen Reassignment", "Approved Plans History"]
    },
    {
      title: "Meal Optimizer",
      description: "The core operational tool to allot specific meals to your allotted patients, ensuring their daily intake matches the clinical goals of their approved plan.",
      icon: <Layers className="w-6 h-6 text-rose-500" />,
      items: ["Allot Meals", "Daily Optimization"]
    },
    {
      title: "Engagement Hub",
      description: "Your communication center. Define your consultation availability slots in the 'Availability Calendar' and manage incoming 'Meeting Requests' from patients seeking guidance.",
      icon: <Video className="w-6 h-6 text-orange-500" />,
      items: ["Availability Calendar Slots", "Patient Meeting Requests"]
    },
    {
      title: "Reference Library",
      description: "A clinical knowledge base where you can verify health normal ranges and access detailed nutritional profiles of various foods to inform your dietary decisions.",
      icon: <BookOpen className="w-6 h-6 text-cyan-500" />,
      items: ["Health Normal Ranges", "Food Nutrient Info"]
    },
    {
      title: "Finance",
      description: "Transparent revenue tracking. View the specific portions of patient plan payments credited to you for your professional nutritional services.",
      icon: <Wallet className="w-6 h-6 text-teal-500" />,
      items: ["Credited Amounts", "Patient Plan Revenue"]
    },
    {
      title: "Support Tasks",
      description: "Stay connected for assistance. Use this portal to chat directly with Micro-Kitchen teams or reach out to the Miisky support team to resolve any technical or operational issues.",
      icon: <HelpCircle className="w-6 h-6 text-purple-500" />,
      items: ["Chat with Micro-Kitchens", "Miisky Support Team"]
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
