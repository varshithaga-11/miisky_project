import React, { useEffect, useState } from "react";
import { getHealthParameterById, HealthParameter } from "./healthparameterapi";

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
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative mt-24">
        <button onClick={onClose} className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 text-4xl font-bold">×</button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Health Parameter Details</h2>
        
        {loading ? (
          <div className="py-10 text-center text-gray-500">Loading...</div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : data ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Parameter Name</p>
              <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Normal Ranges</p>
              <p className="font-medium text-gray-900 dark:text-white">{data.normal_ranges?.length || 0} configured</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export default ViewHealthParameter;
