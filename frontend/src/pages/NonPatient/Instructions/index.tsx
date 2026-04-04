import React from "react";
import { 
  ShoppingBag, 
  Layers, 
  Briefcase, 
  ShoppingCart, 
  Package, 
  Wallet, 
  UserCog, 
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  LayoutDashboard
} from "lucide-react";

/**
 * Non-Patient Instructions Component
 * 
 * Provides a shopping and navigational guide for non-patient users 
 * who interact with the Miisky ecosystem through our partner micro-kitchens.
 */
const NonPatientInstructions: React.FC = () => {
  const steps = [
    {
      title: "1. Shopping Dashboard",
      description: "Quickly view your recent orders, cart status, and account summary in one unified overview.",
      icon: <LayoutDashboard className="w-6 h-6 text-indigo-500" />,
      menu: "Dashboard"
    },
    {
      title: "2. Explore Healthy Foods",
      description: "Browse through a massive selection of healthy, curated items available for direct purchase from our partner kitchens.",
      icon: <Layers className="w-6 h-6 text-blue-500" />,
      menu: "Foods"
    },
    {
      title: "3. Discover Micro-Kitchens",
      description: "Find partner kitchens operating in your area. Review their menus and clinical specializations to choose the best source for your meals.",
      icon: <Briefcase className="w-6 h-6 text-emerald-500" />,
      menu: "Micro Kitchen"
    },
    {
      title: "4. Manage Your Cart",
      description: "Keep track of items you're interested in, adjust quantities, and initiate our secure checkout process.",
      icon: <ShoppingCart className="w-6 h-6 text-amber-500" />,
      menu: "Cart"
    },
    {
      title: "5. My Bookings",
      description: "Track your active orders in real-time, view estimated delivery times, and manage your current shopping log.",
      icon: <Package className="w-6 h-6 text-rose-500" />,
      menu: "My Bookings"
    },
    {
      title: "6. Order History",
      description: "A complete financial record of all your purchases. Each entry contains invoices and detailed order breakdowns for your reference.",
      icon: <Wallet className="w-6 h-6 text-cyan-500" />,
      menu: "Order History"
    },
    {
      title: "7. Profile & Security",
      description: "Securely manage your personal information, delivery addresses, and account security preferences.",
      icon: <UserCog className="w-6 h-6 text-orange-500" />,
      menu: "Profile"
    },
    {
      title: "8. Support & Feedback",
      description: "If you encounter any issues with an order or the platform, our dedicated support team is just a ticket away.",
      icon: <HelpCircle className="w-6 h-6 text-slate-500" />,
      menu: "Support Tickets"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-12">
      {/* Aesthetic Header */}
      <div className="relative p-10 overflow-hidden bg-white dark:bg-gray-800 rounded-[2.5rem] border border-gray-100 dark:border-gray-700 shadow-xl group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-indigo-500/10 transition-colors duration-700"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold tracking-tight mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Shopping Experience Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Seamlessly Navigating <br/>The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Miisky Marketplace</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl font-light">
            Providing you with access to premium nutritional products and vetted partner kitchens for your dietary needs.
          </p>
        </div>
      </div>

      {/* Logic Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, idx) => (
          <div 
            key={idx} 
            className="flex flex-col bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-700/50 flex items-center justify-center text-gray-700 dark:text-gray-200 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500 shadow-inner mb-6">
              {step.icon}
            </div>

            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">{step.title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed flex-grow">
              {step.description}
            </p>

            <div className="pt-4 border-t border-gray-50 dark:border-gray-700/50 mt-auto">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                <ChevronRight className="w-3 h-3" />
                Linked to: {step.menu}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Banner */}
      <div className="bg-indigo-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden text-center md:text-left">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl">
             <h2 className="text-3xl font-bold mb-4 flex items-center gap-3 justify-center md:justify-start">
              <ShoppingBag className="w-8 h-8 text-indigo-400" />
              Better Food, Faster.
            </h2>
            <p className="text-indigo-100 leading-relaxed text-lg font-light">
              Miisky is more than a platform; it's a commitment to your health. Each food item is sourced from kitchens that adhere to clinical health standards, ensuring your direct purchases contribute to a better lifestyle.
            </p>
          </div>
          <div className="w-full md:w-auto p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-center gap-4 mb-4">
              <CheckCircle2 className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-bold uppercase tracking-widest">Verified Kitchens Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonPatientInstructions;
