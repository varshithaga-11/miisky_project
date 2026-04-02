import React, { useEffect, useState } from "react";
import { FiSearch, FiCheckCircle } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getDietPlans as getDietPlanList } from "../../../utils/api";
import { DietPlan } from "../../AdminSide/DietPlan/dietplanapi";
import { toast, ToastContainer } from 'react-toastify';

const PatientPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<DietPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const resp = await getDietPlanList({ page: 1, limit: 100 });
      const data = resp.data;
      setPlans(Array.isArray(data) ? data : data.results);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to load diet plans");
    } finally {
      setLoading(false);
    }
  };

  const filteredPlans = plans.filter(plan => 
    plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    plan.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <PageMeta title="Diet Plans" description="Explore our curated diet plans" />
      <PageBreadcrumb pageTitle="Available Diet Plans" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredPlans.length} plans
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 dark:bg-white/[0.03] rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 dark:text-gray-400">No diet plans found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {filteredPlans.map((plan) => (
            <div 
              key={plan.id} 
              className="group relative overflow-hidden flex flex-col bg-white dark:bg-white/[0.03] rounded-2xl border border-gray-200 dark:border-white/[0.05] hover:shadow-2xl hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 dark:border-white/[0.05]">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    {plan.code}
                  </span>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {plan.no_of_days} Days
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {plan.title}
                </h3>
              </div>

              {/* Price Section */}
              <div className="p-6 flex flex-col">
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    ₹{plan.final_amount}
                  </span>
                  {plan.discount_amount && Number(plan.discount_amount) > 0 && (
                    <span className="text-sm text-gray-400 line-through">
                      ₹{plan.amount}
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 flex-grow">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Features</p>
                  <ul className="space-y-2.5">
                    {plan.features && plan.features.length > 0 ? (
                      plan.features.sort((a,b) => (a.order || 0) - (b.order || 0)).map((feature) => (
                        <li key={feature.id} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <FiCheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature.feature}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm italic text-gray-400">Standard features included</li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Decorative background element */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all duration-300"></div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default PatientPlansPage;
