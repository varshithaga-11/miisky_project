import { useEffect, useState } from "react";
import { FiSearch, FiActivity, FiMinus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getHealthParametersWithRanges } from "./api";

interface NormalRange {
  id: number;
  min_value: number | null;
  max_value: number | null;
  unit: string | null;
  reference_text: string | null;
  interpretation_flag: string | null;
  remarks: string | null;
}

interface Parameter {
  id: number;
  name: string;
  normal_ranges: NormalRange[];
  is_active: boolean;
}

const ReferenceLibraryPage: React.FC = () => {
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getHealthParametersWithRanges(currentPage, pageSize, searchTerm);
        setParameters(res.results || []);
      } catch (e) {
        console.error("Failed to load reference data", e);
        setParameters([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, searchTerm, pageSize]);

  return (
    <>
      <PageMeta 
        title="Clinical Reference Library" 
        description="Search health parameters and their standard normal ranges for patient report interpretation." 
      />
      <PageBreadcrumb pageTitle="Reference Library / Normal Ranges" />

      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl overflow-hidden relative">
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Normal Ranges Reference</h2>
              <p className="text-blue-100 max-w-md">
                Standard clinical benchmarks for interpreting blood reports and metabolic health parameters.
              </p>
            </div>
            <div className="relative w-full md:w-80 group">
              <input
                type="text"
                placeholder="Search parameter (e.g. HbA1c)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-white/40 group-hover:bg-white/15 transition-all"
              />
              <FiSearch className="absolute left-4 top-3.5 text-blue-200 group-hover:text-white transition-colors h-5 w-5" />
            </div>
          </div>
          {/* Decorative Background Elements */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl" />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl h-48 animate-pulse border border-slate-100 dark:border-gray-800" />
            ))}
          </div>
        ) : parameters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-gray-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-gray-800">
             <div className="w-16 h-16 bg-slate-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FiActivity className="text-slate-300 h-8 w-8" />
             </div>
             <p className="text-slate-500 font-medium">No parameters match your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {parameters.map((param) => (
              <div 
                key={param.id} 
                className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/60 dark:border-gray-800 p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900/40 transition-all group"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <FiActivity className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-lg tracking-tight">{param.name}</h3>
                    <span className="text-[10px] bg-slate-100 dark:bg-gray-800 text-slate-500 uppercase px-2 py-0.5 rounded font-bold">Standard</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {param.normal_ranges.length > 0 ? (
                    param.normal_ranges.map((range, idx) => (
                      <div key={idx} className="flex flex-col p-4 bg-slate-50/50 dark:bg-gray-800/30 rounded-xl border border-slate-100 dark:border-white/5 h-full">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Reference Range</span>
                           <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{range.unit || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="text-2xl font-black text-slate-700 dark:text-gray-200">
                             {range.min_value ?? "?"} <span className="text-slate-400 font-normal mx-1">/</span> {range.max_value ?? "?"}
                           </div>
                           <div className="h-1.5 flex-1 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                              <div className="w-1/3 h-full bg-amber-400 opacity-30" />
                              <div className="w-1/3 h-full bg-emerald-500" />
                              <div className="w-1/3 h-full bg-rose-500 opacity-30" />
                           </div>
                        </div>
                        {range.reference_text && (
                          <p className="mt-3 text-sm text-slate-600 dark:text-gray-400 leading-relaxed italic line-clamp-2">
                            "{range.reference_text}"
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 rounded-xl text-sm border border-amber-100/50 dark:border-amber-900/20">
                       <FiMinus /> No specific ranges defined yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Footer */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-slate-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
           <div className="text-sm text-slate-400">
             Reference data is for clinical guidance only. Always cross-verify with local lab standards.
           </div>
           <div className="flex items-center gap-2">
             <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
             <span className="text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-widest">System Verified</span>
           </div>
        </div>
      </div>
    </>
  );
};

export default ReferenceLibraryPage;
