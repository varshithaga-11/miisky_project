import React from "react";
import { 
  Truck, 
  FileText, 
  Users, 
  Package, 
  MapPin, 
  Layers, 
  Wallet, 
  Star, 
  UserCog, 
  HelpCircle,
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
      title: "1. Operational Dashboard",
      description: "Quickly monitor active orders, daily prep requirements, and your kitchen's overall performance metrics.",
      icon: <LayoutDashboard className="w-6 h-6 text-indigo-500" />,
      menu: "Dashboard"
    },
    {
      title: "2. Regulatory Setup",
      description: "Ensure your kitchen's administrative and clinical foundation. Access the setup 'Questionnaire' and review 'Inspection Reports' to maintain high health standards.",
      icon: <FileText className="w-6 h-6 text-blue-500" />,
      menu: "Questionnaire & Inspection"
    },
    {
      title: "3. Patient Management",
      description: "View and manage the specific list of clinical patients assigned to your kitchen for diet plan fulfillment.",
      icon: <Users className="w-6 h-6 text-emerald-500" />,
      menu: "Patients"
    },
    {
      title: "4. Daily Preparation",
      description: "Manage clinical meal requirements. Use 'Daily Prep' to see precisely what needs to be cooked for your assigned patients every day.",
      icon: <Truck className="w-6 h-6 text-amber-500" />,
      menu: "Daily Prep (From Patients)"
    },
    {
      title: "5. Order Fulfillment",
      description: "Process and manage diverse orders. This includes specific requests from clinical patients and separate orders from non-patient users.",
      icon: <Package className="w-6 h-6 text-rose-500" />,
      menu: "Manage Orders"
    },
    {
      title: "6. Logistics Management",
      description: "Configure delivery geographical parameters and manage shipping/delivery charges for your distribution network.",
      icon: <MapPin className="w-6 h-6 text-cyan-500" />,
      menu: "Delivery charges"
    },
    {
      title: "7. Culinary Database",
      description: "Maintain your kitchen's food catalog. List and update 'Available Foods' that the Miisky community can purchase directly.",
      icon: <Layers className="w-6 h-6 text-orange-500" />,
      menu: "Available Foods"
    },
    {
      title: "8. Payouts & Finance",
      description: "Track the revenue generated from clinical diet plans and manage documentation for service fee payouts.",
      icon: <Wallet className="w-6 h-6 text-teal-500" />,
      menu: "Diet plan payouts"
    },
    {
      title: "9. Feedback & Support",
      description: "Monitor 'Kitchen Reviews' to improve quality and use 'Support Tickets' to communicate with Miisky admin for any technical needs.",
      icon: <Star className="w-6 h-6 text-yellow-500" />,
      menu: "Reviews & Support"
    }
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
