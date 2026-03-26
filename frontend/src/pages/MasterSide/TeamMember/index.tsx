import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw } from "react-icons/fi";
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
    <div className="p-8 bg-[#F8FAFC] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Team Excellence</h1>
            <p className="text-gray-500 mt-1">Manage your professional team members and their roles.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-blue-600 transition-all shadow-sm"
              title="Refresh List"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
            >
              <FiPlus strokeWidth={3} /> Add Member
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-50 bg-white flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Search by name, designation, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 text-gray-700 transition-all outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Member Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Designation</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 font-medium">Synchronizing Team Data...</p>
                      </div>
                    </td>
                  </tr>
                ) : members.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <FiSearch size={32} />
                        </div>
                        <p className="text-xl font-bold text-gray-400">No members found</p>
                        <p className="text-gray-400">Try adjusting your search criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr key={member.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden border-2 border-white shadow-sm">
                            {member.photo ? (
                              <img src={member.photo} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              member.name.charAt(0)
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{member.name}</div>
                            <div className="text-xs text-gray-500 font-medium">{member.email || "No email provided"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                          {member.designation}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                           {departments.find(d => d.id === member.department)?.name || "General"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight ${
                          member.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${member.is_active ? "bg-green-500" : "bg-red-500"}`}></span>
                          {member.is_active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button 
                            onClick={() => { setSelectedMemberId(member.id!); setShowEditModal(true); }} 
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-50"
                            title="Edit Details"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(member.id!)} 
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-50"
                            title="Delete Member"
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

          <div className="px-6 py-5 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm font-semibold text-gray-500">
              Showing <span className="text-gray-900">{members.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}-{Math.min(currentPage * pageSize, totalItems)}</span> of <span className="text-gray-900">{totalItems}</span> experts
            </p>
            <div className="flex gap-2">
              <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(currentPage - 1)} 
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 transition-all shadow-sm"
              >
                Prev
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = i + 1; // Simplification, can be improved for many pages
                  return (
                    <button 
                      key={p} 
                      onClick={() => setCurrentPage(p)} 
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                        currentPage === p ? "bg-blue-600 text-white shadow-blue-200" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
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
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 transition-all shadow-sm"
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
