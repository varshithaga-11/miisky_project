import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiTrash2, FiEdit2, FiSearch, FiExternalLink } from "react-icons/fi";
import { getPartnerList, deletePartner, Partner } from "./partnerapi";
import AddPartner from "./AddPartner";
import EditPartner from "./EditPartner";

const PartnerPage: React.FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPartnerList(1, 100, search);
      setPartners(data.results);
    } catch (error) {
      toast.error("Failed to load partners");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Delete partner?")) return;
    try {
      await deletePartner(id);
      toast.success("Deleted!");
      fetchPartners();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Partners</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
        >
          <FiPlus /> Add Partner
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
          <FiSearch className="text-gray-400" />
          <input type="text" placeholder="Search partners..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 outline-none bg-transparent" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100/50">
              <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider">Partner Name</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-x border-gray-50">Website</th>
              <th className="px-6 py-4 text-left font-semibold text-gray-500 uppercase text-xs tracking-wider border-r border-gray-50">Status</th>
              <th className="px-6 py-4 text-right font-semibold text-gray-500 uppercase text-xs tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading partners...</td></tr>
            ) : partners.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No partners found.</td></tr>
            ) : (
              partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {partner.logo && <img src={partner.logo} alt="" className="w-8 h-8 object-contain rounded" />}
                      <span className="font-semibold text-gray-900">{partner.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 border-x border-gray-50">
                    {partner.website_url ? (
                      <a href={partner.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center gap-1 group/link">
                        Visit Site <FiExternalLink className="text-xs opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 border-r border-gray-50">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${partner.is_active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                      {partner.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3 text-lg opacity-40 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditingId(partner.id!)} className="text-blue-600 hover:text-blue-800 transition-transform hover:scale-110"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(partner.id!)} className="text-red-500 hover:text-red-700 transition-transform hover:scale-110"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isAddModalOpen && (
        <AddPartner 
          onSuccess={() => fetchPartners()} 
          onClose={() => setIsAddModalOpen(false)} 
        />
      )}

      {editingId && (
        <EditPartner 
          id={editingId} 
          onSuccess={() => fetchPartners()} 
          onClose={() => setEditingId(null)} 
        />
      )}
    </div>
  );
};

export default PartnerPage;
