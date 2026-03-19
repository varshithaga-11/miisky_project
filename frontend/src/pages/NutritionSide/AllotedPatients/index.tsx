import { useEffect, useState, useMemo } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AllotedPatient, getMyAllotedPatients } from "./api";
import Badge from "../../../components/ui/badge/Badge";
import InputField from "../../../components/form/input/InputField";
import { UserCircleIcon, GroupIcon } from "../../../icons";

const AllottedPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<AllotedPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getMyAllotedPatients();
        setPatients(res || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load allotted patients");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const fullName = `${p.user.first_name || ""} ${p.user.last_name || ""}`.toLowerCase();
      const username = p.user.username.toLowerCase();
      const email = p.user.email.toLowerCase();
      const search = searchTerm.toLowerCase();
      return (
        fullName.includes(search) || 
        username.includes(search) || 
        email.includes(search)
      );
    });
  }, [patients, searchTerm]);

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="Allotted Patients" description="View and manage patients assigned to you" />
      <PageBreadcrumb pageTitle="Allotted Patients" />

      <div className="space-y-6">
        {/* Statistics Header */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                <GroupIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Patients</p>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{patients.length}</h4>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03] md:flex-row md:items-center md:justify-between">
          <div className="w-full md:w-80">
            <InputField
              placeholder="Search by name, email or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredPatients.length}</span> patient(s)
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.02]">
                  <TableCell isHeader className="px-5 py-4 text-start font-bold">Patient</TableCell>
                  <TableCell isHeader className="px-5 py-4 text-start font-bold">Contact Info</TableCell>
                  <TableCell isHeader className="px-5 py-4 text-start font-bold text-center">Age/Weight</TableCell>
                  <TableCell isHeader className="px-5 py-4 text-start font-bold">LifeStyle</TableCell>
                  <TableCell isHeader className="px-5 py-4 text-start font-bold text-center">Diet Pattern</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
                        <span className="text-gray-500">Loading patients...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="px-5 py-20 text-center text-gray-500 italic">
                      {searchTerm ? "No patients found matching your search." : "No patients have been allotted to you yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPatients.map((p) => (
                    <TableRow key={p.mapping_id} className="border-t border-gray-100 dark:border-white/[0.05] hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors">
                      <TableCell className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-500 dark:bg-brand-500/10">
                            <UserCircleIcon className="h-6 w-6" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate font-semibold text-gray-900 dark:text-white">
                              {p.user.first_name || p.user.last_name
                                ? `${p.user.first_name || ""} ${p.user.last_name || ""}`
                                : p.user.username}
                            </span>
                            <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                              @{p.user.username}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-800 dark:text-gray-200">{p.user.email}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{p.user.mobile || "No mobile provided"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 flex-wrap min-w-[120px]">
                          <Badge variant="light" color="info" size="sm">
                            {p.questionnaire?.age ?? "N/A"} yr
                          </Badge>
                          <Badge variant="light" color="success" size="sm">
                            {p.questionnaire?.weight_kg ? `${p.questionnaire.weight_kg}kg` : "N/A"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4">
                        <div className="max-w-[180px]">
                          <p className="text-sm text-gray-700 dark:text-gray-300 truncate" title={p.questionnaire?.work_type || "N/A"}>
                            {p.questionnaire?.work_type || "N/A"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="px-5 py-4 text-center">
                        {p.questionnaire?.diet_pattern ? (
                          <Badge variant="solid" color="primary" size="sm">
                            {p.questionnaire.diet_pattern}
                          </Badge>
                        ) : (
                          <span className="text-xs text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllottedPatientsPage;


