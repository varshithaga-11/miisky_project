import { Link } from "react-router-dom";
import {
  LayoutGrid,
  Globe2,
  CalendarClock,
  Truck,
  ChevronRight,
  Package,
  Users,
  MapPin,
  Wallet,
  Star,
  FileText,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";

const deliverySubPages = [
  {
    title: "Global delivery assignment",
    description: "Set the default delivery person and time slot for each active diet plan tied to your kitchen.",
    path: "/microkitchen/delivery/global",
    icon: Globe2,
    color: "from-indigo-600 to-violet-600",
  },
  {
    title: "Daily meal reassignment",
    description: "Temporarily assign a different delivery person for a specific meal (e.g. leave or route change).",
    path: "/microkitchen/delivery/daily",
    icon: CalendarClock,
    color: "from-amber-500 to-orange-600",
  },
];

const allKitchenMenuLinks: { label: string; path: string; icon: typeof Truck }[] = [
  { label: "Dashboard", path: "/microkitchen/dashboard", icon: LayoutGrid },
  { label: "Kitchen guide", path: "/microkitchen/instructions", icon: BookOpen },
  { label: "Questionnaire", path: "/microkitchen/questionnaire", icon: FileText },
  { label: "Inspection report", path: "/microkitchen/inspection-report", icon: FileText },
  { label: "Patients", path: "/microkitchen/patients", icon: Users },
  { label: "Daily prep", path: "/microkitchen/daily-prep", icon: Truck },
  { label: "Manage orders", path: "/microkitchen/orders", icon: Package },
  { label: "Delivery charges", path: "/microkitchen/delivery-charges", icon: MapPin },
  { label: "Available foods", path: "/microkitchen/available-foods", icon: Package },
  { label: "Diet plan payouts", path: "/microkitchen/plan-payouts", icon: Wallet },
  { label: "Kitchen reviews", path: "/microkitchen/reviews", icon: Star },
  { label: "Support tickets", path: "/microkitchen/support-tickets", icon: HelpCircle },
];

export default function MicroKitchenDeliveryManagementHub() {
  return (
    <>
      <PageMeta title="Delivery Management | Micro Kitchen" description="Delivery assignments and kitchen menu" />
      <PageBreadcrumb pageTitle="Delivery management" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 lg:px-8 py-8 max-w-6xl mx-auto space-y-10">
        <header className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-2">
                Logistics
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                Delivery management
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-xl">
                Choose global defaults per diet plan, or reassign one meal at a time. Below you can also jump to any
                micro kitchen screen.
              </p>
            </div>
            <Link
              to="/microkitchen/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <LayoutGrid className="w-4 h-4" />
              Back to dashboard
            </Link>
          </div>
        </header>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            Delivery actions
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {deliverySubPages.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div
                  className={`absolute inset-0 opacity-10 bg-gradient-to-br ${item.color} pointer-events-none`}
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-lg mb-4`}
                    >
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
            All micro kitchen menu
          </h2>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
            {allKitchenMenuLinks.map((row) => (
              <Link
                key={row.path}
                to={row.path}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
              >
                <span className="flex items-center gap-3 text-gray-800 dark:text-gray-200">
                  <row.icon className="w-4 h-4 text-gray-400" />
                  {row.label}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
            <div className="px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50 text-sm text-gray-500 dark:text-gray-400">
              Profile & account settings: use <span className="font-medium text-gray-700 dark:text-gray-300">Profile</span>{" "}
              in the sidebar (<code className="text-xs">/profile-info</code>).
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
