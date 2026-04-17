import { useEffect, useState, useMemo } from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus, FiEye } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getUserList, deleteUser } from "./api";
import { toast, ToastContainer } from "react-toastify";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import ImportButton from "../../../components/common/ImportButton";

export interface UserRegister {
  id?: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active?: boolean;
  created_by?: number;
  mobile?: string | null;
  whatsapp?: string | null;
  dob?: string | null;
  gender?: "male" | "female" | "other" | null;
  address?: string | null;
  lat_lng_address?: string | null;
  zip_code?: string | null;
  country?: number | null;
  state?: number | null;
  city?: number | null;
  joined_date?: string | null;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserRegister[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [sortField, setSortField] = useState<keyof UserRegister | null>(null);

  // Search, sort, pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<
    | "all"
    | "admin"
    | "master"
    | "nutritionist"
    | "patient"
    | "supply_chain"
    | "food_buyer"
    | "micro_kitchen"
    | "non_patient"
  >("all");
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [viewUser, setViewUser] = useState<UserRegister | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [idToDelete, setIdToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUserList(currentPage, pageSize, searchTerm, roleFilter, statusFilter);
      setUsers(response.results);
      setTotalItems(response.count);
      setTotalPages(response.total_pages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const headers = await getAuthHeaders();

      // 1. Check for User Diet Plans (for patients)
      const dietPlansRes = await axios.get(createApiUrl("api/userdietplan/"), {
        headers, params: { user: id, limit: 1 }
      });
      const dietPlanCount = dietPlansRes.data.count || 0;
      if (dietPlanCount > 0) {
        toast.error(`Cannot delete user. They have ${dietPlanCount} associated diet plans. Delete the plans first.`);
        return;
      }

      // 2. Check for Orders (for patients/non-patients)
      const ordersRes = await axios.get(createApiUrl("api/order/"), {
        headers, params: { user: id, limit: 1 }
      });
      const orderCount = ordersRes.data.count || 0;
      if (orderCount > 0) {
        toast.error(`Cannot delete user. They have ${orderCount} associated orders. Delete the orders first.`);
        return;
      }

      // 3. Check for Kitchen Profile (if kitchen role)
      const kitchenRes = await axios.get(createApiUrl("api/microkitchenprofile/"), {
        headers, params: { user: id, limit: 1 }
      });
      if (kitchenRes.data.count > 0) {
        toast.error("Cannot delete user. This user has an associated Micro Kitchen profile. Delete the kitchen profile first.");
        return;
      }

      // 4. Check for Nutritionist Profile (if nutritionist role)
      const nutRes = await axios.get(createApiUrl("api/nutritionistprofile/"), {
        headers, params: { user: id, limit: 1 }
      });
      if (nutRes.data.count > 0) {
        toast.error("Cannot delete user. This user has an associated Nutritionist profile. Delete the profile first.");
        return;
      }

      // 5. Check for Support Tickets (Created by)
      const ticketsCreatedRes = await axios.get(createApiUrl("api/supportticket/"), {
        headers, params: { created_by: id, limit: 1 }
      });
      if (ticketsCreatedRes.data.count > 0) {
        toast.error("Cannot delete user. They have created support tickets. Delete the tickets first.");
        return;
      }

      // 6. Check for Support Tickets (Assigned to)
      const ticketsAssignedRes = await axios.get(createApiUrl("api/supportticket/"), {
        headers, params: { assigned_to: id, limit: 1 }
      });
      if (ticketsAssignedRes.data.count > 0) {
        toast.error("Cannot delete user. They have support tickets assigned to them. Reassign or delete those tickets first.");
        return;
      }

      // All checks passed — open confirmation modal
      setIdToDelete(id);
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to check user dependencies.");
    }
  };

  const confirmDelete = async () => {
    if (idToDelete === null) return;
    setIsDeleting(true);
    try {
      await deleteUser(idToDelete);
      toast.success("User deleted successfully.");
      setIdToDelete(null);
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to delete user. They may have other hidden dependencies.");
    } finally {
      setIsDeleting(false);
    }
  };

  const onUserAdded = () => {
    fetchUsers();
    setIsAddModalOpen(false);
  };

  const onUserUpdated = () => {
    fetchUsers();
    setIsEditModalOpen(false);
    setEditUserId(null);
  };

  const sortedDefinitions = useMemo(() => {
    if (!sortField) return users;

    return [...users].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (!aValue && !bValue) return 0;
      if (!aValue) return 1;
      if (!bValue) return -1;

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [users, sortField, sortDirection]);

  const handleSort = (field: keyof UserRegister) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };


  if (error) return <div className="p-6 text-red-500">Error: {error}</div>

  return (
    <>
      <PageMeta title="User Management" description="Manage users" />
      <PageBreadcrumb pageTitle="User Management" />
      <ToastContainer position="bottom-right" className="z-[99999]" />
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search ..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm dark:text-gray-400 whitespace-nowrap">Role:</Label>
                <Select
                  value={roleFilter}
                  onChange={(val) => setRoleFilter(val as any)}
                  options={[
                    { value: "all", label: "All" },
                    { value: "admin", label: "Admin" },
                    { value: "master", label: "Master" },
                    { value: "nutritionist", label: "Nutritionist/Dietician" },
                    { value: "patient", label: "Patient" },
                    { value: "supply_chain", label: "Supply Chain" },
                    { value: "food_buyer", label: "Food Buyer" },
                    { value: "micro_kitchen", label: "Micro Kitchen" },
                    { value: "non_patient", label: "Non Patient" },
                  ]}
                  className="w-32"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm dark:text-gray-400 whitespace-nowrap">Status:</Label>
                <Select
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val as any)}
                  options={[
                    { value: "all", label: "All" },
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  className="w-32"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <ImportButton onSuccess={fetchUsers} />
              <Button
                size="sm"
                className="inline-flex items-center gap-2"
                onClick={() => setIsAddModalOpen(true)}
              >
                <FiPlus />
                Add User
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Label className="text-sm dark:text-gray-400 whitespace-nowrap">Show:</Label>
              <Select
                value={String(pageSize)}
                onChange={(val) => {
                  setPageSize(Number(val));
                  setCurrentPage(1);
                }}
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" },
                ]}
                className="w-20"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">#</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 cursor-pointer" onClick={() => handleSort('username')}>Username</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400 cursor-pointer" onClick={() => handleSort('email')}>Email</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">First Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Last Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Role</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Active</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-400 italic">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : sortedDefinitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-400 italic">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedDefinitions.map((user, index) => (
                  <TableRow key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{user.username}</TableCell>
                    <TableCell className="px-5 py-4">{user.email}</TableCell>
                    <TableCell className="px-5 py-4">{user.first_name}</TableCell>
                    <TableCell className="px-5 py-4">{user.last_name}</TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={user.is_active}
                        readOnly
                        className="w-4 h-4 accent-green-600 rounded"
                      />
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="text-emerald-600 hover:text-emerald-800 p-1"
                          onClick={() => setViewUser(user)}
                          title="View user registrations info"
                        >
                          <FiEye />
                        </button>
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 p-1"
                          onClick={() => {
                            setEditUserId(user.id!);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <FiEdit />
                        </button>
                        <button type="button" className="text-red-600 hover:text-red-800 p-1" onClick={() => handleDelete(user.id!)}>
                          <FiTrash2 />
                        </button>
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
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border dark:border-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isAddModalOpen && <AddUser onClose={() => setIsAddModalOpen(false)} onAdd={onUserAdded} />}
      {isEditModalOpen && editUserId !== null && (
        <EditUser
          userId={editUserId}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={onUserUpdated}
        />
      )}

      <ConfirmationModal
        isOpen={idToDelete !== null}
        onClose={() => setIdToDelete(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete User?"
        message="Are you sure you want to permanently delete this user? This action cannot be undone."
        confirmText="Delete User"
      />

      {viewUser && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-2xl relative shadow-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setViewUser(null)}
              className="absolute top-2 right-4 text-3xl text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">User Registration Info</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Username</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{viewUser.username}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Email</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{viewUser.email}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Full Name</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {viewUser.first_name || ""} {viewUser.last_name || ""}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Role</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs">
                    {viewUser.role}
                  </span>
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Status</span>
                <p className="text-sm font-medium">
                   {viewUser.is_active ? (
                     <span className="text-green-600">Active</span>
                   ) : (
                     <span className="text-red-600">Inactive</span>
                   )}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Mobile</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{viewUser.mobile || "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">WhatsApp</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{viewUser.whatsapp || "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">DOB</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{viewUser.dob || "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Gender</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{viewUser.gender || "—"}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Joined Date</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{viewUser.joined_date || "—"}</p>
              </div>
              <div className="md:col-span-2 space-y-1 border-t border-gray-100 dark:border-white/[0.05] pt-4">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Street address</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                  {viewUser.address || "—"}
                </p>
              </div>
              <div className="md:col-span-2 space-y-1">
                <span className="text-xs text-gray-500 uppercase tracking-wider">Address from map / GPS</span>
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                  {viewUser.lat_lng_address || "—"}
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setViewUser(null)} variant="outline">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagementPage;
