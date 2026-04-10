import React, { useState, useEffect, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { FiPlus, FiTrash2, FiEdit, FiSearch, FiUser } from "react-icons/fi";
import { getTeamMemberList, deleteTeamMember, TeamMember } from "./teammemberapi";
import { getDepartmentList } from "../Department/departmentapi";
import AddTeamMember from "./AddTeamMember";
import EditTeamMember from "./EditTeamMember";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const TeamMemberPage: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTeamMemberList(currentPage, pageSize, search);
      setMembers(data.results);
      setTotalItems(data.count);
      setTotalPages(data.total_pages);
    } catch (error) {
      toast.error("Failed to load experts");
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

  const handleDelete = (id: number) => {
    setIdToDelete(id);
  };

  const confirmDelete = async () => {
    if (idToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteTeamMember(idToDelete);
      toast.success("Expert deleted successfully!");
      setIdToDelete(null);
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Failed to delete expert.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <PageMeta title="Team Excellence" description="Manage MIISKY intellectual capital" />
      <PageBreadcrumb pageTitle="Our Experts" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search experts by identity, role, or email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-6">
            <Button 
                size="sm" 
                className="inline-flex items-center gap-2"
                onClick={() => setShowAddModal(true)}
            >
              <FiPlus /> Add Expert
            </Button>
            
            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-400 whitespace-nowrap">Show:</Label>
              <Select
                value={String(pageSize)}
                onChange={(val) => { setPageSize(Number(val)); setCurrentPage(1); }}
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" },
                ]}
                className="w-20"
              />
              <span className="text-sm text-gray-400 whitespace-nowrap">entries</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
           <div>
            Showing {totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Expert Details</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Role Manifest</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Division</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">Syncing team data...</TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">No active experts detected</TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 dark:bg-blue-900/10 dark:border-blue-800">
                             {member.photo_url || member.photo ? (
                                <img src={(member.photo_url || member.photo) as string} alt={member.name} className="w-full h-full object-cover rounded-lg" />
                             ) : (
                                <FiUser className="text-blue-500" />
                             )}
                           </div>
                           <div>
                              <div className="font-bold text-gray-900 text-theme-sm dark:text-white uppercase tracking-tight">{member.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{member.email || "NO_EMAIL"}</div>
                           </div>
                        </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                         <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 uppercase dark:bg-blue-900/30 dark:text-blue-400">
                           {member.designation}
                         </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-medium text-theme-sm text-gray-500 dark:text-gray-400">
                         {departments.find(d => d.id === member.department)?.name?.toUpperCase() || "GENERAL_OPS"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.is_active ? "bg-green-50 text-green-600 dark:bg-green-900/30" : "bg-red-50 text-red-600 dark:bg-red-900/30"
                        }`}>
                            {member.is_active ? "Verified Active" : "Inactive Stasis"}
                        </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                        <div className="flex items-center gap-3">
                            <button className="text-blue-600 hover:text-blue-800 text-lg" onClick={() => { setSelectedMemberId(member.id!); setShowEditModal(true); }}><FiEdit /></button>
                            <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(member.id!)}><FiTrash2 /></button>
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
           <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border border-blue-600'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {showAddModal && <AddTeamMember onClose={() => setShowAddModal(false)} onSuccess={fetchMembers} departments={departments} />}
      {showEditModal && selectedMemberId && <EditTeamMember id={selectedMemberId} onClose={() => setShowEditModal(false)} onSuccess={fetchMembers} departments={departments} />}

      <ConfirmationModal
        isOpen={idToDelete !== null}
        onClose={() => setIdToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete Expert?"
        message="Are you sure you want to permanently delete this team member? This action cannot be undone."
        confirmText="Delete Expert"
      />
    </>
  );
};

export default TeamMemberPage;

