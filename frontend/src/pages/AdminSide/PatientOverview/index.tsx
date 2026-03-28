import { useEffect, useState, useMemo } from "react";
import { FiSearch, FiEye, FiNavigation2, FiX } from "react-icons/fi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import { fetchPatientUserList, PatientUserRow, fetchAllMicroKitchenProfiles, MicroKitchenForDistance } from "./api";
import { haversineKm } from "../../../utils/haversineKm";
import { PatientDetailModal } from "./PatientDetailModal";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

const PatientOverviewPage: React.FC = () => {
  const [rows, setRows] = useState<PatientUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientUserRow | null>(null);

  const [distanceModalPatient, setDistanceModalPatient] = useState<PatientUserRow | null>(null);
  const [microKitchens, setMicroKitchens] = useState<MicroKitchenForDistance[] | null>(null);
  const [kitchensLoading, setKitchensLoading] = useState(false);
  const [kitchensFetchError, setKitchensFetchError] = useState(false);

  const loadMicroKitchens = async () => {
    setKitchensLoading(true);
    setKitchensFetchError(false);
    try {
      setMicroKitchens(await fetchAllMicroKitchenProfiles());
    } catch (e) {
      console.error(e);
      setKitchensFetchError(true);
      setMicroKitchens(null);
    } finally {
      setKitchensLoading(false);
    }
  };

  const openDistanceModal = async (p: PatientUserRow) => {
    setDistanceModalPatient(p);
    if (microKitchens !== null) return;
    await loadMicroKitchens();
  };

  const closeDistanceModal = () => setDistanceModalPatient(null);

  const distanceRows = useMemo(() => {
    if (!distanceModalPatient || microKitchens === null) return [];
    const plat = distanceModalPatient.latitude;
    const plng = distanceModalPatient.longitude;
    const patientOk =
      plat != null &&
      plng != null &&
      !Number.isNaN(Number(plat)) &&
      !Number.isNaN(Number(plng));

    return microKitchens
      .map((k) => {
        const klat = k.latitude;
        const klng = k.longitude;
        const kitchenOk =
          klat != null &&
          klng != null &&
          !Number.isNaN(Number(klat)) &&
          !Number.isNaN(Number(klng));
        let km: number | null = null;
        if (patientOk && kitchenOk) {
          km = haversineKm(Number(plat), Number(plng), Number(klat), Number(klng));
        }
        return { kitchen: k, km };
      })
      .sort((a, b) => {
        if (a.km === null && b.km === null) {
          return (a.kitchen.brand_name || "").localeCompare(b.kitchen.brand_name || "");
        }
        if (a.km === null) return 1;
        if (b.km === null) return -1;
        return a.km - b.km;
      });
  }, [distanceModalPatient, microKitchens]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetchPatientUserList(currentPage, pageSize, searchTerm);
        setRows(res.results);
        setTotalItems(res.count);
        setTotalPages(res.total_pages);
      } catch (e) {
        console.error(e);
        setRows([]);
        setTotalItems(0);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, pageSize, searchTerm]);

  const openDetail = (patient: PatientUserRow) => {
    setSelectedPatient(patient);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedPatient(null);
  };

  return (
    <>
      <PageMeta title="Patients Overview" description="Browse patients and open one detail view at a time" />
      <PageBreadcrumb pageTitle="Patients Overview" />

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-200/80 dark:border-gray-700 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950/20 p-6 sm:p-8 shadow-sm">
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search name, email, mobile..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                    { value: "10", label: "10" },
                    { value: "25", label: "25" },
                    { value: "50", label: "50" },
                  ]}
                  className="w-20"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Patient list: <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">GET api/usermanagement/?role=patient</code>.
              Opening a patient shows a menu; each option loads that model in the same window.
            </p>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems} patients
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      #
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Patient
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Mobile
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Dietitian
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Kitchen
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Plan Status
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-400 italic">
                        Loading patients...
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="px-5 py-8 text-center text-gray-400 italic">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((r, index) => (
                      <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20">
                        <TableCell className="px-5 py-4">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {[r.first_name, r.last_name].filter(Boolean).join(" ") || r.username}
                          </div>
                          <div className="text-xs text-gray-500">{r.email}</div>
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{r.mobile || "—"}</TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {r.active_nutritionist_name || (r.is_patient_mapped ? "Mapped" : "—")}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {r.active_kitchen_name || "—"}
                        </TableCell>
                        <TableCell className="px-5 py-4 text-sm">
                          {r.active_plan_title ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 dark:text-white leading-tight">{r.active_plan_title}</span>
                              <span className="text-[10px] text-emerald-500 font-bold uppercase">{r.active_plan_status}</span>
                            </div>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              title="Distance to all micro kitchens"
                              onClick={() => openDistanceModal(r)}
                              className="inline-flex items-center justify-center rounded-lg p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/15 dark:text-indigo-400 dark:hover:bg-indigo-500/25"
                            >
                              <FiNavigation2 className="h-4 w-4" aria-hidden />
                            </button>
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                              onClick={() => openDetail(r)}
                            >
                              <FiEye /> View details
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
            <div className="mt-6 flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedPatient && (
        <PatientDetailModal patient={selectedPatient} open={detailOpen} onClose={closeDetail} />
      )}

      {distanceModalPatient && (
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          role="presentation"
          onClick={closeDistanceModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-patient-distance-title"
            className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-4 dark:border-gray-800">
              <div className="min-w-0">
                <h2 id="admin-patient-distance-title" className="text-lg font-bold text-gray-900 dark:text-white">
                  Distance to micro kitchens
                </h2>
                <p className="mt-1 text-sm text-gray-500 truncate">
                  {[distanceModalPatient.first_name, distanceModalPatient.last_name].filter(Boolean).join(" ") ||
                    distanceModalPatient.username}
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Patient coordinates:{" "}
                  {distanceModalPatient.latitude != null && distanceModalPatient.longitude != null ? (
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">
                      {Number(distanceModalPatient.latitude).toFixed(5)}, {Number(distanceModalPatient.longitude).toFixed(5)}
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">Not set — distances unavailable</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDistanceModal}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(85vh-8rem)] px-6 py-4">
              {kitchensLoading ? (
                <div className="flex flex-col items-center gap-3 py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <span className="text-sm text-gray-500">Loading kitchens…</span>
                </div>
              ) : kitchensFetchError ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-300">Could not load micro kitchens.</p>
                  <button
                    type="button"
                    onClick={() => loadMicroKitchens()}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white hover:bg-blue-700"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800/50">
                        <th className="px-4 py-3">Kitchen</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Lat, lng</th>
                        <th className="px-4 py-3 text-end">Distance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {distanceRows.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-10 text-center text-gray-500 italic">
                            No micro kitchens found.
                          </td>
                        </tr>
                      ) : (
                        distanceRows.map(({ kitchen, km }) => (
                          <tr key={kitchen.id} className="border-b border-gray-50 last:border-0 dark:border-gray-800">
                            <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                              {kitchen.brand_name || `Kitchen #${kitchen.id}`}
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                              {kitchen.status || "—"}
                            </td>
                            <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                              {kitchen.latitude != null && kitchen.longitude != null
                                ? `${Number(kitchen.latitude).toFixed(5)}, ${Number(kitchen.longitude).toFixed(5)}`
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-end font-semibold text-indigo-600 dark:text-indigo-400">
                              {km !== null ? `${km.toFixed(2)} km` : "—"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-4 text-xs text-gray-400">
                Haversine great-circle distance (approximate). Not driving distance.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientOverviewPage;
