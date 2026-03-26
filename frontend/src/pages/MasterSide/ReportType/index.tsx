import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch } from "react-icons/fi";
import { getReportTypeList, deleteReportType, ReportType } from "./reporttypeapi";
import AddReportType from "./AddReportType";
import EditReportType from "./EditReportType";

const ReportTypePage: React.FC = () => {
  const [types, setTypes] = useState<ReportType[]>([]);
  const [, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchReportTypes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReportTypeList(1, 100, search);
      setTypes(data.results);
    } catch (error) {
      toast.error("Failed to load report types");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchReportTypes();
  }, [fetchReportTypes]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete?")) return;
    try {
      await deleteReportType(id);
      toast.success("Deleted!");
      fetchReportTypes();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Report Types</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
        >
          <FiPlus /> Add Type
        </button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex items-center gap-2">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 text-left font-semibold">Name</th>
              <th className="px-6 py-3 text-left font-semibold">Description</th>
              <th className="px-6 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type) => <tr key={type.id} className="border-b">
              <td className="px-6 py-4">{type.name}</td>
              <td className="px-6 py-4">{type.description || "-"}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2 text-lg">
                  <button onClick={() => setEditingId(type.id!)} className="text-blue-600 hover:text-blue-800"><FiEdit2 /></button>
                  <button onClick={() => handleDelete(type.id!)} className="text-red-600 hover:text-red-800"><FiTrash2 /></button>
                </div>
              </td>
            </tr>)
            }
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddReportType 
          onSuccess={() => fetchReportTypes()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditReportType 
          id={editingId} 
          onSuccess={() => fetchReportTypes()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default ReportTypePage;
