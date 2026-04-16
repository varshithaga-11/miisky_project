import React, { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiSearch, FiUserPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../../components/common/PageBreadCrumb";
import PageMeta from "../../../../components/common/PageMeta";
import Button from "../../../../components/ui/button/Button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getGroupedMappings,
  getUnmappedPatients,
  SimpleUser,
} from "./api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../../components/ui/table";
import AssignNutritionistModal from "./AssignNutritionistModal";
import ReassignNutrition from "./ReassignNutrition";

const UserNutritionMappingPage: React.FC = () => {
  const [mappings, setMappings] = useState<any[]>([]); // Grouped mappings from backend
  const [unmappedPatients, setUnmappedPatients] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allotmentFilter, setAllotmentFilter] = useState("");
  const [mappingStatus, setMappingStatus] = useState<"all" | "mapped" | "unmapped">("all");
  const [selectedNutritionistName, setSelectedNutritionistName] = useState<string>("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [groupedRes, unmappedRes] = await Promise.all([
        getGroupedMappings(),
        getUnmappedPatients(),
      ]);
      setMappings(groupedRes);
      setUnmappedPatients(unmappedRes);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load mappings or users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Combine both sources into a flat list of "records"
  const allRecords = useMemo(() => {
    const records: any[] = [];
    
    // Add mapped records
    mappings.forEach(group => {
      group.patients.forEach((p: any) => {
        records.push({
          ...p,
          nutritionist_name: group.nutritionist.first_name || group.nutritionist.last_name 
            ? `${group.nutritionist.first_name || ""} ${group.nutritionist.last_name || ""}` 
            : group.nutritionist.username,
          is_mapped: true
        });
      });
    });

    // Add unmapped records
    unmappedPatients.forEach(p => {
      records.push({
        ...p,
        nutritionist_name: "Not Assigned",
        allotted_by: "-",
        is_mapped: false
      });
    });

    return records;
  }, [mappings, unmappedPatients]);

  const filteredRecords = useMemo(() => {
    let result = allRecords;

    if (mappingStatus !== "all") {
      result = result.filter(r => (mappingStatus === "mapped" ? r.is_mapped : !r.is_mapped));
    }

    if (selectedNutritionistName !== "all") {
      result = result.filter(r => r.nutritionist_name === selectedNutritionistName);
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r => 
        `${r.first_name || ""} ${r.last_name || ""} ${r.username}`.toLowerCase().includes(lower) ||
        (r.nutritionist_name || "").toLowerCase().includes(lower) ||
        (r.email || "").toLowerCase().includes(lower)
      );
    }

    if (allotmentFilter) {
      const lower = allotmentFilter.toLowerCase();
      result = result.filter(r => (r.allotted_by || "").toLowerCase().includes(lower));
    }

    return result;
  }, [allRecords, mappingStatus, selectedNutritionistName, searchTerm, allotmentFilter]);

  // Unique nutritionists for the dropdown filter
  const nutritionistOptions = useMemo(() => {
    const names = Array.from(new Set(allRecords.map(r => r.nutritionist_name)))
      .filter(name => name !== "Not Assigned")
      .sort((a,b) => a.localeCompare(b));
    return names;
  }, [allRecords]);

  const handleAssignSuccess = () => {
    setIsModalOpen(false);
    fetchData();
  };

  const handleReassignSuccess = () => {
    setIsReassignOpen(false);
    fetchData();
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="User–Nutritionist Mapping" description="Map patients to nutritionists" />
      <PageBreadcrumb pageTitle="User–Nutritionist Mapping" />

      <div className="mb-6 space-y-4">
        {/* Filters Row 1: Search & Allotted By */}
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 w-full max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patient/nut/email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
              <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Filter by Allotted By..."
                value={allotmentFilter}
                onChange={(e) => setAllotmentFilter(e.target.value)}
                className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 w-full xl:w-auto">
            <Button size="sm" variant="outline" className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2" onClick={() => setIsReassignOpen(true)}>
              <FiRefreshCw className="w-4 h-4" />
              Reassign
            </Button>
            <Button size="sm" className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20" onClick={() => setIsModalOpen(true)}>
              <FiUserPlus className="w-4 h-4" />
              Assign
            </Button>
          </div>
        </div>

        {/* Filters Row 2: Status & Nutritionist Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl">
          <select
            value={mappingStatus}
            onChange={(e) => setMappingStatus(e.target.value as any)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="all">All Mapping Status</option>
            <option value="mapped">Mapped Patients</option>
            <option value="unmapped">Unmapped Patients</option>
          </select>

          <select
            value={selectedNutritionistName}
            onChange={(e) => setSelectedNutritionistName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
          >
            <option value="all">Select Specific Nutritionist...</option>
            {nutritionistOptions.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2 items-center text-xs text-gray-500 dark:text-gray-400 px-1">
          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            Total Records: {filteredRecords.length}
          </span>
          {(searchTerm || allotmentFilter || mappingStatus !== "all" || selectedNutritionistName !== "all") && (
            <button 
              onClick={() => { 
                setSearchTerm(""); 
                setAllotmentFilter(""); 
                setMappingStatus("all");
                setSelectedNutritionistName("all");
              }}
              className="text-blue-600 hover:underline ml-2"
            >
              Clear all filters
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.02]">
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">#</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">Patient</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">Nutritionist</TableCell>
                  <TableCell isHeader className="px-5 py-3 font-semibold text-gray-500 text-start text-xs uppercase tracking-wider dark:text-gray-400">Allotted By</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                      Loading mapping records...
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                      No matching records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((r, idx) => (
                    <TableRow key={`${r.id}-${r.is_mapped}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                      <TableCell className="px-5 py-4 text-xs text-gray-500">{idx + 1}</TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-800 dark:text-white/90">
                            {r.first_name || r.last_name ? `${r.first_name || ""} ${r.last_name || ""}` : r.username}
                          </span>
                          <span className="text-[11px] text-gray-500">{r.username}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.is_mapped ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"}`}>
                          {r.nutritionist_name}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-sm font-medium text-blue-600 dark:text-blue-400">
                        {r.allotted_by || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {isReassignOpen && (
        <ReassignNutrition
          onClose={() => setIsReassignOpen(false)}
          onSuccess={handleReassignSuccess}
          allotments={mappings}
        />
      )}

      {isModalOpen && (
        <AssignNutritionistModal
          onClose={() => setIsModalOpen(false)}
          onAssign={handleAssignSuccess}
          unmappedPatients={unmappedPatients}
        />
      )}
    </>
  );
};

export default UserNutritionMappingPage;
