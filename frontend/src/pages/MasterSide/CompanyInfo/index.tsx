import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { getCompanyInfoList, deleteCompanyInfo, CompanyInfo } from "./companyinfoapi";
import AddCompanyInfo from "./AddCompanyInfo";
import EditCompanyInfo from "./EditCompanyInfo";

const CompanyInfoPage: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCompanyInfoList(1, 100);
      setCompanies(data.results);
    } catch (error) {
      toast.error("Failed to load company info");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure? This will delete company data.")) return;
    try {
      await deleteCompanyInfo(id);
      toast.success("Info deleted!");
      fetchCompanies();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Company Information</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-shadow shadow-sm active:scale-95"
        >
          <FiPlus /> Add Info
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-sm">Company Name</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-sm border-x border-gray-100">Support Email</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-sm">Primary Phone</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-600 text-sm border-l border-gray-100">Location</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-600 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">Loading details...</td></tr>
              ) : companies.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 font-medium">No company info records found.</td></tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id} className="hover:bg-blue-50/20 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-gray-900">{company.name}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm border-x border-gray-100">{company.email_support || "-"}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{company.phone_primary || "-"}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm border-l border-gray-100">{company.city || "-"}, {company.state || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 text-lg opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingId(company.id!)} className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"><FiEdit2 /></button>
                        <button onClick={() => handleDelete(company.id!)} className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <AddCompanyInfo 
          onSuccess={() => fetchCompanies()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditCompanyInfo 
          id={editingId} 
          onSuccess={() => fetchCompanies()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default CompanyInfoPage;
