import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../components/ui/table";
import Select from "../../../../components/form/Select";
import Label from "../../../../components/form/Label";
import { getNutritionistReassignments, getKitchenReassignments } from "./api";

const NutritionKitchenReassignment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"nutritionist" | "kitchen">("nutritionist");
  const [nutritionistData, setNutritionistData] = useState<any[]>([]);
  const [kitchenData, setKitchenData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search, pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchData();
  }, [activeTab, currentPage, pageSize, searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (activeTab === "nutritionist") {
        response = await getNutritionistReassignments(currentPage, pageSize, searchTerm);
        setNutritionistData(response.results);
      } else {
        response = await getKitchenReassignments(currentPage, pageSize, searchTerm);
        setKitchenData(response.results);
      }
      setTotalItems(response.count);
      setTotalPages(response.total_pages);
    } catch (err: any) {
      setError(err.message || "Something went wrong while fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const switchTab = (tab: "nutritionist" | "kitchen") => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm("");
  };

  if (error) return <div className="p-6 text-red-500 font-medium">Error: {error}</div>;

  return (
    <>
      <PageMeta title="Reassignment Logs" description="View nutrition and kitchen reassignment history" />
      <PageBreadcrumb pageTitle="Reassignment Logs" />

      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => switchTab("nutritionist")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "nutritionist"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Nutritionists
          </button>
          <button
            onClick={() => switchTab("kitchen")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "kitchen"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            Kitchens
          </button>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[300px]">
            <input
              type="text"
              placeholder={`Search ${activeTab === "nutritionist" ? "patients/nutritionists..." : "patients/kitchens..."}`}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-2">
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

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">#</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Patient</TableCell>
                {activeTab === "nutritionist" ? (
                  <>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Previous Nutri.</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">New Nutri.</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Diet Plan</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Previous Kitchen</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">New Kitchen</TableCell>
                  </>
                )}
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Reason</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Plan Duration</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Effective From</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Reassigned On</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={activeTab === "nutritionist" ? 7 : 8} className="px-5 py-8 text-center text-gray-400 italic">
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : (activeTab === "nutritionist" ? nutritionistData : kitchenData).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={activeTab === "nutritionist" ? 7 : 8} className="px-5 py-8 text-center text-gray-400 italic">
                    No reassignment logs found.
                  </TableCell>
                </TableRow>
              ) : (
                (activeTab === "nutritionist" ? nutritionistData : kitchenData).map((item, index) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                    <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">
                      {activeTab === "nutritionist" ? item.user_name : item.patient_name}
                    </TableCell>
                    
                    {activeTab === "nutritionist" ? (
                      <>
                        <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{item.previous_nutritionist_name || "N/A"}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/80">{item.new_nutritionist_name}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="px-5 py-4">{item.diet_plan_title}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-600 dark:text-gray-400">{item.previous_kitchen_name || "N/A"}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-800 dark:text-white/80">{item.new_kitchen_name}</TableCell>
                      </>
                    )}

                    <TableCell className="px-5 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                        {item.reason?.replace(/_/g, " ")}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-xs">
                      {item.plan_start_date && item.plan_end_date ? (
                        <div className="flex flex-col">
                          <span className="text-gray-700 dark:text-gray-300">{item.plan_start_date}</span>
                          <span className="text-gray-400">to</span>
                          <span className="text-gray-700 dark:text-gray-300">{item.plan_end_date}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not set</span>
                      )}
                    </TableCell>
                    <TableCell className="px-5 py-4">{item.effective_from}</TableCell>
                    <TableCell className="px-5 py-4 text-xs text-gray-500">
                      {new Date(item.reassigned_on).toLocaleString()}
                      <div className="text-[10px] mt-0.5 mt-1 text-gray-400">by {item.reassigned_by_name}</div>
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
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
          </div>
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
    </>
  );
};

export default NutritionKitchenReassignment;
