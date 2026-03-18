import { useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AllotedPatient, getMyAllotedPatients } from "./api";

const AllotedPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<AllotedPatient[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="Allotted Patients" description="Patients assigned to you" />
      <PageBreadcrumb pageTitle="Allotted Patients" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>#</TableCell>
                <TableCell isHeader>Patient</TableCell>
                <TableCell isHeader>Email</TableCell>
                <TableCell isHeader>Mobile</TableCell>
                <TableCell isHeader>Age</TableCell>
                <TableCell isHeader>Weight (kg)</TableCell>
                <TableCell isHeader>Work type</TableCell>
                <TableCell isHeader>Diet pattern</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : patients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500">
                    No patients allotted.
                  </TableCell>
                </TableRow>
              ) : (
                patients.map((p, idx) => (
                  <TableRow key={p.mapping_id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      {p.user.first_name || p.user.last_name
                        ? `${p.user.first_name || ""} ${p.user.last_name || ""}`
                        : p.user.username}
                    </TableCell>
                    <TableCell>{p.user.email}</TableCell>
                    <TableCell>{p.user.mobile || "-"}</TableCell>
                    <TableCell>{p.questionnaire?.age ?? "-"}</TableCell>
                    <TableCell>{p.questionnaire?.weight_kg ?? "-"}</TableCell>
                    <TableCell>{p.questionnaire?.work_type ?? "-"}</TableCell>
                    <TableCell>{p.questionnaire?.diet_pattern ?? "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default AllotedPatientsPage;

