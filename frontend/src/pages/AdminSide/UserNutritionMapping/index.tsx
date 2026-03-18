import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createUserNutritionMapping, getAllUsers, SimpleUser } from "./api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";

const UserNutritionMappingPage: React.FC = () => {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedNutritionistId, setSelectedNutritionistId] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await getAllUsers();
        setUsers(res.results);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const unmappedPatients = useMemo(
    () => users.filter((u) => u.role === "patient" && !u.is_patient_mapped),
    [users]
  );
  const nutritionists = useMemo(
    () => users.filter((u) => u.role === "nutritionist"),
    [users]
  );

  const handleAssign = async () => {
    if (!selectedPatientId || !selectedNutritionistId) {
      toast.error("Please select both patient and nutritionist");
      return;
    }
    try {
      const patientId = Number(selectedPatientId);
      const nutritionistId = Number(selectedNutritionistId);
      await createUserNutritionMapping(patientId, nutritionistId);
      toast.success("Nutritionist assigned to patient");
      // mark patient as mapped locally
      setUsers((prev) =>
        prev.map((u) =>
          u.id === patientId ? { ...u, is_patient_mapped: true } : u
        )
      );
      setSelectedPatientId("");
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data || err.message || "Failed to assign";
      toast.error(typeof msg === "string" ? msg : "Failed to assign");
    }
  };

  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="light" className="z-[99999]" />
      <PageMeta title="User–Nutritionist Mapping" description="Map patients to nutritionists" />
      <PageBreadcrumb pageTitle="User–Nutritionist Mapping" />

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1">
            <Label>Patient (only unmapped)</Label>
            <Select
              value={selectedPatientId}
              onChange={(val) => setSelectedPatientId(val)}
              options={[
                { value: "", label: "Select Patient" },
                ...unmappedPatients.map((p) => ({
                  value: String(p.id),
                  label: `${p.first_name || ""} ${p.last_name || ""} (${p.username})`,
                })),
              ]}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <Label>Nutritionist</Label>
            <Select
              value={selectedNutritionistId}
              onChange={(val) => setSelectedNutritionistId(val)}
              options={[
                { value: "", label: "Select Nutritionist" },
                ...nutritionists.map((n) => ({
                  value: String(n.id),
                  label: `${n.first_name || ""} ${n.last_name || ""} (${n.username})`,
                })),
              ]}
              className="w-full"
            />
          </div>
          <Button onClick={handleAssign} disabled={loading || !users.length}>
            Assign
          </Button>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Unmapped Patients
          </h3>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>#</TableCell>
                    <TableCell isHeader>Username</TableCell>
                    <TableCell isHeader>Name</TableCell>
                    <TableCell isHeader>Email</TableCell>
                    <TableCell isHeader>Mobile</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="px-5 py-6 text-center text-gray-500">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : unmappedPatients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="px-5 py-6 text-center text-gray-500">
                        All patients are mapped.
                      </TableCell>
                    </TableRow>
                  ) : (
                    unmappedPatients.map((p, idx) => (
                      <TableRow key={p.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>{p.username}</TableCell>
                        <TableCell>{`${p.first_name || ""} ${p.last_name || ""}`}</TableCell>
                        <TableCell>{p.email}</TableCell>
                        <TableCell>{p.mobile || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserNutritionMappingPage;

