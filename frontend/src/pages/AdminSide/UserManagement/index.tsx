import { useEffect, useState ,useMemo} from "react";
import { FiTrash2, FiEdit, FiSearch, FiPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { getUserList, deleteUser, userId } from "./api";
import AddUser from "./AddUser";
import EditUser from "./EditUser";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

export interface UserRegister {
  id?: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active?: boolean;
  created_by?: number;
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
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'master'|'employee'>('all');
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUserList(currentPage, pageSize, searchTerm, userId);
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
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch {
      alert("Failed to delete user.");
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

  // We still use local filtering for status and role since they weren't fully integrated into backend params yet
  // but search and page-size are now backend-driven.
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(user => user.is_active);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(user => !user.is_active);
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }
    
    return filtered;
  }, [users, statusFilter, roleFilter]);


  const sortedDefinitions = useMemo(() => {
    if (!sortField) return filteredUsers;
    
    return [...filteredUsers].sort((a, b) => {
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
  }, [filteredUsers, sortField, sortDirection]);

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
                    { value: "employee", label: "Employee" },
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

            <Button 
              size="sm" 
              className="inline-flex items-center gap-2"
              onClick={() => setIsAddModalOpen(true)}
            >
              <FiPlus />
              Add User
            </Button>

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
                      <div className="flex space-x-3">
                        <button className="text-blue-600 hover:text-blue-800" onClick={() => { setEditUserId(user.id!); setIsEditModalOpen(true); }}>
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(user.id!)}>
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
    </>
  );
};

export default UserManagementPage;
