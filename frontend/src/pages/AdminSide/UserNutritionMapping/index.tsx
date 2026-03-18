import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createUserNutritionMapping,
  getAllUserNutritionMappings,
  getAllUsers,
  SimpleUser,
  UserNutritionMapping,
} from "./api";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";

const UserNutritionMappingPage: React.FC = () => {
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [mappings, setMappings] = useState<UserNutritionMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedNutritionistId, setSelectedNutritionistId] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [usersRes, mappingsRes] = await Promise.all([getAllUsers(), getAllUserNutritionMappings()]);
        setUsers(usersRes.results);
        setMappings(mappingsRes);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load users or mappings");
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

  const usersById = useMemo(() => {
    const map: Record<number, SimpleUser> = {};
    users.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  const groupedMappings = useMemo(() => {
    const activeMappings = mappings.filter((m) => m.is_active);
    const byNutritionist: {
      nutritionist: SimpleUser;
      patients: SimpleUser[];
    }[] = [];
    const nutIndex: Record<number, number> = {};

    activeMappings.forEach((m) => {
      const nutritionist = usersById[m.nutritionist];
      const patient = usersById[m.user];
      if (!nutritionist || !patient) return;

      if (nutIndex[nutritionist.id] === undefined) {
        nutIndex[nutritionist.id] = byNutritionist.length;
        byNutritionist.push({ nutritionist, patients: [patient] });
      } else {
        byNutritionist[nutritionist.id].patients.push(patient);
      }
    });

    // sort by nutritionist name for stable UI
    return byNutritionist.sort((a, b) => {
      const an = `${a.nutritionist.first_name || ""} ${a.nutritionist.last_name || ""} ${a.nutritionist.username}`;
      const bn = `${b.nutritionist.first_name || ""} ${b.nutritionist.last_name || ""} ${b.nutritionist.username}`;
      return an.localeCompare(bn);
    });
  }, [mappings, usersById]);

  const handleAssign = async () => {
    if (!selectedPatientId || !selectedNutritionistId) {
      toast.error("Please select both patient and nutritionist");
      return;
    }
    try {
      const patientId = Number(selectedPatientId);
      const nutritionistId = Number(selectedNutritionistId);
      const created = await createUserNutritionMapping(patientId, nutritionistId);
      toast.success("Nutritionist assigned to patient");
      // mark patient as mapped locally
      setUsers((prev) =>
        prev.map((u) =>
          u.id === patientId ? { ...u, is_patient_mapped: true } : u
        )
      );
      setMappings((prev) => [...prev, created]);
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

      <div className="space-y-8">
        {/* Assignment controls */}
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

        {/* Current mappings grouped by nutritionist */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Nutritionists &amp; Their Allotted Patients
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            First column shows each nutritionist, and in front you can see the list of patients allotted to them.
          </p>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableCell isHeader>Nutritionist</TableCell>
                    <TableCell isHeader>Patients Allotted</TableCell>
                    <TableCell isHeader>Total</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="px-5 py-6 text-center text-gray-500">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : groupedMappings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="px-5 py-6 text-center text-gray-500">
                        No active mappings yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groupedMappings.map(({ nutritionist, patients }) => (
                      <TableRow key={nutritionist.id}>
                        <TableCell className="whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {nutritionist.first_name || nutritionist.last_name
                                ? `${nutritionist.first_name || ""} ${nutritionist.last_name || ""}`
                                : nutritionist.username}
                            </span>
                            <span className="text-xs text-gray-500">
                              {nutritionist.username} · {nutritionist.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
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
                        <TableCell>{patients.length}</TableCell>
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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

