import React from "react";
import {
  FileText,
  Upload,
  UserCheck,
  Briefcase,
  CheckCircle,
  CalendarRange,
  Truck,
  Video,
  Layers,
  ShoppingCart,
  Package,
  Wallet,
  HelpCircle,
  Bell,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

/**
 * Patient Instructions Component
 * 
 * Provides a comprehensive guide for patients to navigate and use the Miisky 
 * platform effectively for their nutritional journey.
 */
const PatientInstructions: React.FC = () => {
  const steps = [
    {
      title: "1. Intake Questionnaire",
      description: "Start your journey by completing the intake questionnaire. This provides our clinical team with essential information about your health history and goals.",
      icon: <FileText className="w-6 h-6 text-indigo-500" />,
      menu: "Questionnaire"
    },
    {
      title: "2. Health Reports",
      description: "Upload your medical reports and tests. Your assigned nutritionist will review these documents and provide expert clinical comments.",
      icon: <Upload className="w-6 h-6 text-blue-500" />,
      menu: "Health Reports"
    },
    {
      title: "3. Nutritionist Allotted",
      description: "Once assigned, you can see all your dietitian's details here. This ensures you have a dedicated clinical professional monitoring your progress.",
      icon: <UserCheck className="w-6 h-6 text-emerald-500" />,
      menu: "Nutritionist Allotted"
    },
    {
      title: "4. Diet Plans & Micro-Kitchens",
      description:
        "Explore diet strategies and partner kitchens. Under this menu, open Suggested Plans & Kitchens for plans your nutritionist recommends, and Suggested foods for tailored food ideas. Diet Plans and Micro-Kitchens show broader catalogues you can browse.",
      icon: <Briefcase className="w-6 h-6 text-amber-500" />,
      menu: "Diet Plans & Micro-Kitchens",
      subItems: ["Diet Plans", "Micro-Kitchens", "Suggested Plans & Kitchens", "Suggested foods"],
    },
    {
      title: "5. Meals Allotted",
      description: "View specific meal assignments detailing exactly what and when you should be eating as part of your clinical diet plan.",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      menu: "Meals Allotted",
    },
    {
      title: "6. Away / meal skip",
      description:
        "Tell us when you will be away or need to skip meals so your kitchen and care team can adjust delivery and planning. Add dates and reasons where prompted so allocations stay accurate.",
      icon: <CalendarRange className="w-6 h-6 text-sky-500" />,
      menu: "Away / meal skip",
    },
    {
      title: "7. Delivery Issues",
      description:
        "Report late deliveries, wrong items, or packaging problems tied to your meal service. Submit details here so operations can investigate and follow up with you.",
      icon: <Truck className="w-6 h-6 text-orange-600" />,
      menu: "Delivery Issues",
    },
    {
      title: "8. Consultation",
      description: "Need professional advice? Request a direct video or audio meeting with your assigned nutritionist for detailed guidance.",
      icon: <Video className="w-6 h-6 text-rose-500" />,
      menu: "Consultation",
    },
    {
      title: "9. Order Separately (Foods)",
      description: "Browse specific healthy items available at our partner micro-kitchens. You can purchase these separately from your main diet plan.",
      icon: <Layers className="w-6 h-6 text-cyan-500" />,
      menu: "Foods",
    },
    {
      title: "10. Cart & Checkout",
      description: "Review and manage the items you intend to purchase before completing your order through our secure checkout process.",
      icon: <ShoppingCart className="w-6 h-6 text-orange-500" />,
      menu: "Cart",
    },
    {
      title: "11. My Bookings",
      description: "Track all your separate food orders and bookings outside your main subscription plan and check their status.",
      icon: <Package className="w-6 h-6 text-purple-500" />,
      menu: "My Bookings",
    },
    {
      title: "12. Payment History",
      description: "A centralized view of all your transactions, including payments for diet plans, consultations, and individual food orders.",
      icon: <Wallet className="w-6 h-6 text-teal-500" />,
      menu: "Payment History",
    },
    {
      title: "13. Support Tickets",
      description: "Report issues or request help from our Admin, Nutritionists, or Micro-Kitchen teams specifically to resolve any challenges.",
      icon: <HelpCircle className="w-6 h-6 text-slate-500" />,
      menu: "Support Tickets",
    },
    {
      title: "14. Notifications",
      description: "Stay updated with real-time alerts regarding kitchen reassignments, nutritionist updates, support ticket status, and clinical milestones.",
      icon: <Bell className="w-6 h-6 text-red-500" />,
      menu: "Notifications",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      {/* Aesthetic Header */}
      <div className="relative p-10 overflow-hidden bg-white dark:bg-gray-800 rounded-[3rem] border border-gray-100 dark:border-gray-700 shadow-xl group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-brand-500/10 transition-colors duration-700"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 text-sm font-bold tracking-tight mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-500"></span>
            Patient Success Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Navigating Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Miisky Journey</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl font-light">
            Everything you need to know about how your clinical diet management dashboard works. Follow these steps for an optimal experience.
          </p>
        </div>
      </div>

      {/* Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className="flex flex-col bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-700 dark:text-gray-200 shadow-inner group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                {step.icon}
              </div>
              <div className="text-3xl font-black text-gray-50 dark:text-gray-700/30 select-none">
                {String(idx + 1).padStart(2, '0')}
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">{step.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed flex-grow">
              {step.description}
            </p>

            <div className="pt-4 border-t border-gray-50 dark:border-gray-700/50 mt-auto">
              <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-widest">
                <ChevronRight className="w-4 h-4" />
                Menu: {step.menu}
              </div>
              {step.subItems && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {step.subItems.map((sub, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-50 dark:bg-gray-700 text-[10px] text-gray-500 dark:text-gray-400 rounded-lg">
                      {sub}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Support Status Banner */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3 justify-center md:justify-start">
              <CheckCircle2 className="w-8 h-8 text-brand-500" />
              Comprehensive Support
            </h2>
            <p className="text-gray-400 leading-relaxed text-lg">
              Our clinical and technical teams are here for you. Use the "Support Tickets" section to reach out to us at any time. We monitor your health reports, meal feedback, and payment history to ensure a seamless clinical journey.
            </p>
          </div>
          <div className="flex-shrink-0">
             <div className="inline-flex flex-col items-center p-6 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 ring-1 ring-brand-500/50 ring-offset-4 ring-offset-slate-900">
                <p className="text-3xl font-black text-brand-500">24/7</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Monitoring</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInstructions;
