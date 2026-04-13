import React, { useEffect, useState } from "react";
import { getHealthParameterById, HealthParameter } from "./healthparameterapi";
import { FiActivity, FiInfo, FiCheckCircle, FiXCircle } from "react-icons/fi";

interface ViewProps {
  id: number;
  onClose: () => void;
}

const ViewHealthParameter: React.FC<ViewProps> = ({ id, onClose }) => {
  const [data, setData] = useState<HealthParameter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      setLoading(true);
      getHealthParameterById(id)
        .then(setData)
        .catch(() => setError("Failed to load details"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-0 w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FiInfo className="text-blue-500" />
            Parameter Details
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 p-1"
          >
            <FiXCircle size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 animate-pulse">Fetching details...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-center">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Parameter Name</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{data.name}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {data.is_active !== false ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold">
                        <FiCheckCircle /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold">
                        <FiXCircle /> Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                   Normal Ranges
                   <span className="px-2 py-0.5 text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                     {data.normal_ranges?.length || 0} Total
                   </span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {data.normal_ranges && data.normal_ranges.length > 0 ? (
                    data.normal_ranges.map((nr: any, idx: number) => (
                      <div key={nr.id || idx} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800/50 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm overflow-hidden">
                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0">
                          <FiActivity size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-gray-400 font-medium">Range</p>
                          <p className="font-bold text-gray-900 dark:text-white truncate">
                            {nr.min_value} - {nr.max_value} <span className="text-blue-500 font-normal">{nr.unit}</span>
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full p-8 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center text-gray-400">
                      <FiActivity size={32} className="mb-2 opacity-20" />
                      <p className="text-sm italic">No normal ranges configured</p>
                    </div>
                  )}
                </div>
              </div>

              {data.created_at && (
                <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] text-gray-400 text-center">
                    Created on {new Date(data.created_at).toLocaleDateString()} at {new Date(data.created_at).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewHealthParameter;

