import { useEffect, useMemo, useState } from "react";
import { FiEdit, FiPlus, FiSearch, FiTrash2, FiEye } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { deleteFoodName, FoodName, getFoodNameList } from "./foodnameapi";
import AddFoodName from "./AddFoodName";
import EditFoodName from "./EditFoodName";
import { FoodGroup, getFoodGroupList } from "../FoodGroup/foodgroupapi";
import ImportButton from "../../../components/common/ImportButton";

const FoodNameManagementPage: React.FC = () => {
  const [items, setItems] = useState<FoodName[]>([]);
  const [foodGroups, setFoodGroups] = useState<FoodGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewData, setViewData] = useState<FoodName | null>(null);
  const [editId, setEditId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    getFoodGroupList(1, "all")
      .then((res) => setFoodGroups(res.results))
      .catch((err) => console.error(err));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getFoodNameList(currentPage, pageSize, searchTerm);
      setItems(res.results);
      setTotalItems(res.count);
      setTotalPages(res.total_pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const groupNameFor = (row: FoodName) => {
    return row.food_group_name || foodGroups.find((g) => String(g.id) === String(row.food_group))?.name || "N/A";
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this food name?")) return;
    try {
      await deleteFoodName(id);
      fetchData();
    } catch {
      alert("Failed to delete food name.");
    }
  };

  const visible = useMemo(() => items, [items]);

  return (
    <>
      <PageMeta title="Food Name Management" description="Manage food names" />
      <PageBreadcrumb pageTitle="Food Name Management" />
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search food names..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-6">
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsAddOpen(true)}>
              <FiPlus /> Add Food Name
            </Button>
            <ImportButton />
            <div className="flex items-center gap-2">
              <Label className="text-sm dark:text-gray-600 whitespace-nowrap">Show:</Label>
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
              <span className="text-sm text-gray-600 whitespace-nowrap">entries</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of{" "}
            {totalItems} entries
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  #
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Food Name
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Food Group
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Code
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 italic">
                    Loading food names...
                  </TableCell>
                </TableRow>
              ) : visible.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 italic">
                    No food names found
                  </TableCell>
                </TableRow>
              ) : (
                visible.map((row, index) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                      {(currentPage - 1) * pageSize + index + 1}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start font-bold text-gray-800 text-theme-sm dark:text-white/90">{row.name}</TableCell>
                    <TableCell className="px-5 py-4 text-start">{groupNameFor(row)}</TableCell>
                    <TableCell className="px-5 py-4 text-start">{row.code || "—"}</TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                      <div className="flex items-center gap-3">
                        <button
                          className="text-gray-500 hover:text-gray-700 text-lg transition-colors"
                          title="View Details"
                          onClick={() => {
                            setViewData(row);
                            setIsViewOpen(true);
                          }}
                        >
                          <FiEye />
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-800 text-lg"
                          onClick={() => {
                            setEditId(row.id!);
                            setIsEditOpen(true);
                          }}
                        >
                          <FiEdit />
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-lg" onClick={() => handleDelete(row.id!)}>
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
                      ? "bg-blue-600 text-white border border-blue-600"
                      : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
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

      {isAddOpen && (
        <AddFoodName
          onClose={() => setIsAddOpen(false)}
          onAdd={() => {
            fetchData();
            setIsAddOpen(false);
          }}
        />
      )}
      {isEditOpen && editId !== null && (
        <EditFoodName
          foodNameId={editId}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onUpdated={() => {
            fetchData();
            setIsEditOpen(false);
            setEditId(null);
          }}
        />
      )}

      {isViewOpen && viewData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-0 w-full max-w-lg overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-between text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FiEye className="text-2xl" /> Food Name Details
              </h2>
              <button onClick={() => setIsViewOpen(false)} className="text-white hover:text-gray-200 text-2xl font-bold">
                &times;
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">ID</div>
                  <div className="text-md font-bold text-gray-900 dark:text-white">{viewData.id}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Code</div>
                  <div className="text-md font-bold text-gray-900 dark:text-white">{viewData.code || "—"}</div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">Food Name</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">{viewData.name}</div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Food Group</div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">{groupNameFor(viewData)}</div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <Button onClick={() => setIsViewOpen(false)} variant="primary">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FoodNameManagementPage;

