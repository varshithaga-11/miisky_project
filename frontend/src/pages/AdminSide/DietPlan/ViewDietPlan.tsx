import React, { useEffect, useState } from "react";
import { getDietPlanById } from "../../../utils/api";
import { DietPlan } from "./dietplanapi";

interface ViewProps {
  id: number;
  onClose: () => void;
}

const ViewDietPlan: React.FC<ViewProps> = ({ id, onClose }) => {
  const [data, setData] = useState<DietPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      setLoading(true);
      getDietPlanById(id)
        .then(resp => setData(resp.data))
        .catch(() => setError("Failed to load details"))
        .finally(() => setLoading(false));
    }
  }, [id]);

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative mt-24 max-h-[80vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Diet Plan Details</h2>
        
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : data ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Title</p>
              <p className="font-medium text-gray-900 dark:text-white">{data.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Code</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.code || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                <p className="font-medium text-gray-900 dark:text-white">₹{data.amount || "0"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Discount</p>
                <p className="font-medium text-gray-900 dark:text-white">₹{data.discount_amount || "0"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">No. of Days</p>
                <p className="font-medium text-gray-900 dark:text-white">{data.no_of_days || "-"}</p>
              </div>
            </div>
            {data.features && data.features.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Features</p>
                <ul className="list-disc pl-5 space-y-1">
                  {data.features.map(f => (
                    <li key={f.id} className="text-sm text-gray-800 dark:text-white/90">{f.feature}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default ViewDietPlan;
