import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";
import { getDepartmentList, deleteDepartment, Department } from "./departmentapi";
import AddDepartment from "./AddDepartment";
import EditDepartment from "./EditDepartment";

const DepartmentPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

  const totalPages = useMemo(() => Math.ceil(totalItems / pageSize), [totalItems, pageSize]);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDepartmentList(currentPage, pageSize, search);
      setDepartments(data.results);
      setTotalItems(data.count);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, search]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this department?")) {
      return;
    }

    try {
      await deleteDepartment(id);
      toast.success("Department deleted successfully!");
      fetchDepartments();
    } catch (error: any) {
      console.error("Error deleting department:", error);
      toast.error(error.response?.data?.detail || "Failed to delete department");
    }
  };

  const handleAddDepartment = () => {
    fetchDepartments();
    setShowAddModal(false);
  };

  const handleEditDepartment = () => {
    fetchDepartments();
    setShowEditModal(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FiPlus /> Add Department
        </button>
      </div>

      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <FiSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search departments..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 outline-none text-gray-700"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Head</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Active</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No departments found
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 text-gray-600">{dept.head_name || "-"}</td>
                    <td className="px-6 py-4 text-gray-600">{dept.position}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          dept.is_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {dept.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setSelectedDepartmentId(dept.id!);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                      >
                        <FiEdit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id!)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {departments.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </p>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-3 py-1 border border-gray-300 rounded text-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded ${
                  currentPage === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-300 text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-3 py-1 border border-gray-300 rounded text-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddDepartment onClose={() => setShowAddModal(false)} onAdd={handleAddDepartment} />
      )}

      {showEditModal && selectedDepartmentId && (
        <EditDepartment
          departmentId={selectedDepartmentId}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdated={handleEditDepartment}
        />
      )}
    </div>
  );
};

export default DepartmentPage;
