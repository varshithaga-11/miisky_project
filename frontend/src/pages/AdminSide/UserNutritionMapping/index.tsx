import { useEffect, useMemo, useState } from "react";
import { FiRefreshCw, FiSearch, FiUserPlus } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getGroupedMappings,
  getUnmappedPatients,
  SimpleUser,
} from "./api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import AssignNutritionistModal from "./AssignNutritionistModal";
import ReassignNutrition from "./ReassignNutrition";

const UserNutritionMappingPage: React.FC = () => {
  const [mappings, setMappings] = useState<any[]>([]); // Grouped mappings from backend
  const [unmappedPatients, setUnmappedPatients] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredGroupedMappings = useMemo(() => {
    if (!searchTerm) return mappings;
    const lower = searchTerm.toLowerCase();
    return mappings.filter((g: any) => {
      const nutName = `${g.nutritionist.first_name || ""} ${g.nutritionist.last_name || ""} ${g.nutritionist.username}`.toLowerCase();
      const patientMatch = g.patients.some((p: any) =>
        `${p.first_name || ""} ${p.last_name || ""} ${p.username}`.toLowerCase().includes(lower)
      );
      return nutName.includes(lower) || patientMatch;
    });
  }, [mappings, searchTerm]);

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
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search nutritionist or patient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
            <FiSearch className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <div className="flex items-center gap-4">
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsReassignOpen(true)}>
              <FiRefreshCw />
              Reassign nutritionist
            </Button>
            <Button size="sm" className="inline-flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
              <FiUserPlus />
              Assign Nutritionist
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {filteredGroupedMappings.length} nutritionist groups
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Current mappings grouped by nutritionist */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-1">
            Nutritionists &amp; Their Allotted Patients
          </h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Nutritionist</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Patients Allotted</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Total</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">
                        Loading mappings...
                      </TableCell>
                    </TableRow>
                  ) : filteredGroupedMappings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="px-5 py-8 text-center text-gray-400 italic">
                        No active mappings found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGroupedMappings.map(({ nutritionist, patients }) => (
                      <TableRow key={nutritionist.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                        <TableCell className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800 dark:text-white/90">
                              {nutritionist.first_name || nutritionist.last_name
                                ? `${nutritionist.first_name || ""} ${nutritionist.last_name || ""}`
                                : nutritionist.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {nutritionist.username} · {nutritionist.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            {patients.map((p) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-gray-100"
                              >
                                {p.first_name || p.last_name
                                  ? `${p.first_name || ""} ${p.last_name || ""}`
                                  : p.username}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{patients.length}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Unmapped patients list */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-1">
            Unmapped Patients
          </h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">#</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Username</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Name</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Email</TableCell>
                    <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400">Mobile</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 italic">
                        Loading patients...
                      </TableCell>
                    </TableRow>
                  ) : unmappedPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="px-5 py-8 text-center text-gray-400 italic">
                        All patients are mapped.
                      </TableCell>
                    </TableRow>
                  ) : (
                    unmappedPatients.map((p, idx) => (
                      <TableRow key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                        <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">{idx + 1}</TableCell>
                        <TableCell className="px-5 py-4 font-medium text-gray-800 dark:text-white/90">{p.username}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{`${p.first_name || ""} ${p.last_name || ""}`}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{p.email}</TableCell>
                        <TableCell className="px-5 py-4 text-gray-500 dark:text-gray-400">{p.mobile || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
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


