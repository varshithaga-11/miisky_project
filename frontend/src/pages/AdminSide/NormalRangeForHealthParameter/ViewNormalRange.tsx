import React, { useEffect, useState } from "react";
import { getNormalRangeById, NormalRange } from "./normalrangeapi";

interface ViewProps {
  id: number;
  onClose: () => void;
}

const ViewNormalRange: React.FC<ViewProps> = ({ id, onClose }) => {
  const [data, setData] = useState<NormalRange | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      setLoading(true);
      getNormalRangeById(id)
        .then(setData)
        .catch(() => setError("Failed to load details"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative mt-24 max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Normal Range Details</h2>
        
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : data ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Parameter</p>
              <p className="font-medium text-gray-900 dark:text-white">{data.health_parameter_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Min Value</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.min_value ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Max Value</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.max_value ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Unit</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.unit || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Qualitative Value</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.qualitative_value || "-"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Raw Value</p>
              <p className="font-medium text-gray-900 dark:text-white">{data.raw_value || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Reference Text</p>
              <p className="font-medium text-gray-900 dark:text-white">{data.reference_text || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Remarks</p>
              <p className="font-medium text-gray-900 dark:text-white">{data.remarks || "-"}</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default ViewNormalRange;
