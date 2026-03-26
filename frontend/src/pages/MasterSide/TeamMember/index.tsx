import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiUser } from "react-icons/fi";
import { getTeamMemberList, deleteTeamMember, TeamMember } from "./teammemberapi";
import { getDepartmentList } from "../Department/departmentapi";
import AddTeamMember from "./AddTeamMember";
import EditTeamMember from "./EditTeamMember";

const TeamMemberPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize]);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTeamMemberList(currentPage, pageSize, search);
      setMembers(data.results);
      setTotalItems(data.count);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await getDepartmentList(1, 100);
      setDepartments(data.results);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchDepartments();
  }, [fetchMembers, fetchDepartments]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this team member?")) return;
    try {
      await deleteTeamMember(id);
      toast.success("Team member deleted successfully!");
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete team member");
    }
  };

  const handleRefresh = () => {
    fetchMembers();
    toast.info("Refreshed team member list");
  };

  return (
    <div className="p-8 bg-[#F8FAFC] min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic text-gray-900 leading-none">
              Team <span className="text-blue-600">Excellence</span>
            </h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-3 leading-none">Managing the intellectual capital of Miisky Svasth.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="p-3 bg-white border border-gray-100 text-gray-400 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm"
              title="Refresh Matrix"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-3 bg-blue-600 text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 active:scale-95 transition-all shadow-xl shadow-blue-500/20 group"
            >
              <FiPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
              Add Expert
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden transition-all hover:shadow-gray-300/50">
          <div className="p-6 border-b border-gray-50 bg-white flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                placeholder="Search experts by identity, role, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 text-xs font-semibold text-gray-700 transition-all outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Member Details</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] border-x border-gray-50">Role manifest</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Division</th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Matrix Status</th>
                  <th className="px-8 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-1 border-gray-100 bg-gray-100 rounded overflow-hidden relative">
                           <div className="absolute inset-0 bg-blue-600 animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}></div>
                        </div>
                        <p className="text-gray-300 font-black uppercase tracking-widest text-[10px] mt-4">Syncing Team Data...</p>
                      </div>
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <FiUser size={48} className="text-gray-200 mb-4" />
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">No active experts detected</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="group hover:bg-blue-50/10 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg overflow-hidden border-2 border-white shadow-lg shadow-blue-500/10 transition-transform group-hover:scale-110">
                            {member.photo_url || member.photo ? (
                              <img src={(member.photo_url || member.photo) as string} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <FiUser />
                            )}
                          </div>
                          <div>
                            <div className="font-black text-gray-900 group-hover:text-blue-700 transition-colors tracking-tight text-sm uppercase">{member.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">{member.email || "UNSPECIFIED_CHANNEL"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 border-x border-gray-50">
                        <span className="text-[10px] font-black text-gray-700 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                          {member.designation}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-gray-500">
                         {departments.find(d => d.id === member.department)?.name?.toUpperCase() || "GENERAL_OPS"}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest border ${
                          member.is_active ? "bg-green-50 text-green-600 border-green-100" : "bg-red-50 text-red-600 border-red-100"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${member.is_active ? "bg-green-500" : "bg-red-500"}`}></span>
                          {member.is_active ? "VERIFIED_ACTIVE" : "INACTIVE_STASIS"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                          <button 
                            onClick={() => { setSelectedMemberId(member.id!); setShowEditModal(true); }} 
                            className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(member.id!)} 
                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-center gap-6 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
              Displaying <span className="text-gray-900">{members.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="text-gray-900">{totalItems}</span> Experts
            </p>
            <div className="flex gap-4">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(currentPage - 1)} 
                className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-30 transition-all shadow-sm"
              >
                Previous
              </button>
              <div className="flex gap-2">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button 
                      key={p} 
                      onClick={() => setCurrentPage(p)} 
                      className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all shadow-sm ${
                        currentPage === p ? "bg-blue-600 text-white shadow-blue-500/20" : "bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <button 
                disabled={currentPage === totalPages || totalPages === 0} 
                onClick={() => setCurrentPage(currentPage + 1)} 
                className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-600 disabled:opacity-30 transition-all shadow-sm"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && <AddTeamMember onClose={() => setShowAddModal(false)} onSuccess={fetchMembers} departments={departments} />}
      {showEditModal && selectedMemberId && <EditTeamMember id={selectedMemberId} onClose={() => setShowEditModal(false)} onSuccess={fetchMembers} departments={departments} />}
    </div>
  );
};

export default TeamMemberPage;
