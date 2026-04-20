import { useEffect, useState } from "react";
import { FiSearch, FiActivity, FiMinus, FiEye, FiX, FiInfo } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getHealthParametersWithRanges } from "./api";

interface NormalRange {
  id: number;
  min_value: number | null;
  max_value: number | null;
  unit: string | null;
  reference_text: string | null;
  qualitative_value: string | null;
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
  const [selectedParam, setSelectedParam] = useState<Parameter | null>(null);

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

      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
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
                className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/60 dark:border-gray-800 p-6 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900/40 transition-all group relative"
              >
                <button 
                  onClick={() => setSelectedParam(param)}
                  className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 dark:bg-gray-800 text-slate-400 dark:text-gray-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:opacity-100"
                  title="View full details"
                >
                  <FiEye className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-5 pr-10">
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
                    param.normal_ranges.slice(0, 1).map((range, idx) => (
                      <div key={idx} className="flex flex-col p-4 bg-slate-50/50 dark:bg-gray-800/30 rounded-2xl border border-slate-100 dark:border-white/5 h-full group/range relative overflow-hidden transition-all hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                           <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest leading-none">Normal Range</span>
                           </div>
                           <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                             {range.unit || "No Unit"}
                           </span>
                        </div>
                        
                        <div className="flex items-end gap-3 flex-wrap">
                           <div className="text-3xl font-black text-slate-700 dark:text-gray-200 leading-none">
                             {range.min_value ?? "?"} <span className="text-slate-300 font-bold mx-0.5">-</span> {range.max_value ?? "?"}
                           </div>
                        </div>

                        <div className="mt-4 h-1.5 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden flex shadow-inner">
                            <div className="w-1/3 h-full bg-amber-400 opacity-20" />
                            <div className="w-1/3 h-full bg-emerald-500" />
                            <div className="w-1/3 h-full bg-rose-500 opacity-20" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 rounded-xl text-sm border border-amber-100/50 dark:border-amber-900/20">
                       <FiMinus /> No specific ranges defined yet.
                    </div>
                  )}
                  {param.normal_ranges.length > 1 && (
                    <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-widest">
                      + {param.normal_ranges.length - 1} more variations available
                    </p>
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

      {/* Detailed Modal */}
      {selectedParam && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedParam(null)} />
          
          <div className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100 dark:border-white/5 animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-8 pb-4 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-20">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <FiActivity className="h-7 w-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{selectedParam.name}</h2>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Full Clinical Reference</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedParam(null)}
                className="w-12 h-12 bg-slate-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100 dark:border-white/5"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                {selectedParam.normal_ranges.map((range, idx) => (
                  <div key={idx} className="bg-slate-50/50 dark:bg-gray-900/50 rounded-[2rem] border border-slate-100 dark:border-white/5 p-8 relative overflow-hidden group">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                       <div className="space-y-6 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Variation {idx + 1}</span>
                            {range.interpretation_flag && (
                              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                {range.interpretation_flag}
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-4">
                            <div className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">
                              {range.min_value ?? "?"}<span className="text-blue-400 mx-1">-</span>{range.max_value ?? "?"}
                            </div>
                            <div className="text-xl font-black text-blue-500/40 dark:text-blue-400/30 uppercase tracking-tighter">
                              {range.unit || "N/A"}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             {range.qualitative_value && (
                               <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-white/5">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Condition</p>
                                  <p className="font-bold text-slate-700 dark:text-gray-200">{range.qualitative_value}</p>
                               </div>
                             )}
                             {range.reference_text && (
                               <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-white/5 col-span-full">
                                  <div className="flex items-center gap-2 mb-2">
                                    <FiInfo className="text-blue-500 h-4 w-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Medical Guidance</p>
                                  </div>
                                  <p className="text-sm font-medium text-slate-600 dark:text-gray-400 leading-relaxed italic border-l-4 border-blue-500/20 pl-4 py-1">
                                    "{range.reference_text}"
                                  </p>
                               </div>
                             )}
                          </div>
                       </div>

                       <div className="md:w-64 space-y-6">
                          {range.remarks && (
                            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/20 h-full flex flex-col justify-between">
                               <p className="text-[10px] font-black text-amber-600 dark:text-amber-500 uppercase tracking-widest mb-3">Clinical Notes</p>
                               <p className="text-[13px] font-bold text-amber-800 dark:text-amber-300 leading-snug">
                                 {range.remarks}
                               </p>
                               <div className="mt-4 flex justify-end">
                                 <div className="w-10 h-10 bg-amber-200/50 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                   <FiInfo className="text-amber-600 h-5 w-5" />
                                 </div>
                               </div>
                            </div>
                          )}
                       </div>
                    </div>
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 p-8 transform translate-x-1/2 -translate-y-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                      <FiActivity size={300} strokeWidth={1} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-gray-900/30 flex justify-end gap-4">
              <button 
                onClick={() => setSelectedParam(null)}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                Close Library
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReferenceLibraryPage;
