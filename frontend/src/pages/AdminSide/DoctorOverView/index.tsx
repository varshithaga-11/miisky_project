import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  getAdminDoctorList,
  getAdminDoctorPatients,
  getDoctorPatientCommentsPaginated,
  type DoctorOverviewPatientRow,
  type DoctorPatientComment,
} from "./api";
import { toast, ToastContainer } from "react-toastify";
import {
  FiUser,
  FiSearch,
  FiPhone,
  FiMail,
  FiChevronRight,
  FiChevronLeft,
  FiMessageSquare,
  FiX,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import Button from "../../../components/ui/button/Button";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

type DoctorRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string | null;
  photo: string | null;
  is_active: boolean;
};

const PATIENTS_PAGE_SIZE = 10;
const COMMENTS_PAGE_SIZE = 10;

const DoctorCommentsModal: React.FC<{
  doctor: DoctorRow | null;
  open: boolean;
  onClose: () => void;
}> = ({ doctor, open, onClose }) => {
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientRows, setPatientRows] = useState<DoctorOverviewPatientRow[]>([]);
  const [patientsPage, setPatientsPage] = useState(1);
  const [patientsTotalPages, setPatientsTotalPages] = useState(1);

  const [selectedPatient, setSelectedPatient] = useState<{
    id: number;
    label: string;
  } | null>(null);

  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentRows, setCommentRows] = useState<DoctorPatientComment[]>([]);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsTotalPages, setCommentsTotalPages] = useState(1);

  useEffect(() => {
    if (!open || !doctor) return;
    setSelectedPatient(null);
    setPatientsPage(1);
    setCommentsPage(1);
    setPatientRows([]);
    setCommentRows([]);
  }, [open, doctor?.id]);

  useEffect(() => {
    if (!open || !doctor || selectedPatient) return;
    let cancelled = false;
    (async () => {
      setPatientsLoading(true);
      try {
        const data = await getAdminDoctorPatients(
          doctor.id,
          patientsPage,
          PATIENTS_PAGE_SIZE
        );
        if (!cancelled) {
          setPatientRows(data.results || []);
          setPatientsTotalPages(data.total_pages || 1);
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load patients");
          setPatientRows([]);
        }
      } finally {
        if (!cancelled) setPatientsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, doctor?.id, selectedPatient, patientsPage]);

  useEffect(() => {
    if (!open || !doctor || !selectedPatient) return;
    let cancelled = false;
    (async () => {
      setCommentsLoading(true);
      try {
        const data = await getDoctorPatientCommentsPaginated(
          doctor.id,
          selectedPatient.id,
          commentsPage,
          COMMENTS_PAGE_SIZE
        );
        if (!cancelled) {
          setCommentRows(data.results || []);
          setCommentsTotalPages(data.total_pages || 1);
        }
      } catch {
        if (!cancelled) {
          toast.error("Failed to load comments");
          setCommentRows([]);
        }
      } finally {
        if (!cancelled) setCommentsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, doctor?.id, selectedPatient?.id, commentsPage]);

  if (!open || !doctor) return null;

  const name = `${doctor.first_name} ${doctor.last_name}`.trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-white/10 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              {selectedPatient ? "Comments" : "Patients with comments"}
            </p>
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
              {name}
            </h2>
            <p className="text-xs font-bold text-gray-500 mt-1 flex flex-wrap gap-3">
              <span className="flex items-center gap-1">
                <FiMail size={12} /> {doctor.email}
              </span>
              {doctor.mobile ? (
                <span className="flex items-center gap-1">
                  <FiPhone size={12} /> {doctor.mobile}
                </span>
              ) : null}
            </p>
            {selectedPatient ? (
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2">
                Patient: {selectedPatient.label}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {selectedPatient ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedPatient(null);
                  setCommentsPage(1);
                  setCommentRows([]);
                }}
                className="px-4 py-2 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2"
              >
                <FiChevronLeft size={16} /> Patients
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {!selectedPatient ? (
            <>
              {patientsLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <div className="size-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-black uppercase text-gray-400 tracking-widest italic">
                    Loading patients…
                  </span>
                </div>
              ) : patientRows.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <FiUser className="mx-auto mb-4 opacity-30" size={48} />
                  <p className="text-sm font-bold uppercase tracking-tight">
                    No patients with comments for this doctor yet.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {patientRows.map((row) => {
                    const p = row.patient;
                    const label = p
                      ? `${p.first_name} ${p.last_name}`.trim() || p.username
                      : "Unknown patient";
                    return (
                      <li key={p?.id ?? label}>
                        <button
                          type="button"
                          onClick={() => {
                            if (!p?.id) return;
                            setSelectedPatient({ id: p.id, label });
                            setCommentsPage(1);
                          }}
                          disabled={!p?.id}
                          className="w-full text-left rounded-[24px] border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] p-5 hover:border-emerald-500/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-colors flex items-center justify-between gap-4 group"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <FiUser className="text-indigo-500 shrink-0" />
                              <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight truncate">
                                {label}
                              </span>
                            </div>
                            {p?.email ? (
                              <p className="text-[10px] font-bold text-gray-400 truncate">
                                {p.email}
                              </p>
                            ) : null}
                            <p className="text-[10px] font-bold text-gray-500 mt-2">
                              {row.comment_count} comment
                              {row.comment_count === 1 ? "" : "s"}
                              {row.last_comment_at
                                ? ` · Last ${new Date(row.last_comment_at).toLocaleString()}`
                                : ""}
                            </p>
                          </div>
                          <FiChevronRight className="text-gray-400 group-hover:text-emerald-500 shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {!patientsLoading && patientRows.length > 0 ? (
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex flex-wrap justify-between items-center gap-4">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                    Page {patientsPage} of {Math.max(1, patientsTotalPages)}
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => setPatientsPage((p) => Math.max(1, p - 1))}
                      disabled={patientsPage <= 1}
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-black uppercase tracking-widest text-[10px]"
                    >
                      Previous
                    </Button>
                    <Button
                      type="button"
                      onClick={() =>
                        setPatientsPage((p) =>
                          Math.min(patientsTotalPages, p + 1)
                        )
                      }
                      disabled={patientsPage >= patientsTotalPages}
                      variant="outline"
                      size="sm"
                      className="rounded-xl font-black uppercase tracking-widest text-[10px]"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          ) : commentsLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="size-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-black uppercase text-gray-400 tracking-widest italic">
                Loading comments…
              </span>
            </div>
          ) : commentRows.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiMessageSquare className="mx-auto mb-4 opacity-30" size={48} />
              <p className="text-sm font-bold uppercase tracking-tight">
                No comments for this patient.
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-6">
                {commentRows.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-[24px] border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] p-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                      <time
                        className="text-[10px] font-black uppercase text-gray-400 tracking-widest"
                        dateTime={row.created_on}
                      >
                        {new Date(row.created_on).toLocaleString()}
                      </time>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
                      {row.comments}
                    </p>
                    {row.report_details && row.report_details.length > 0 ? (
                      <div className="mt-4 pt-4 border-t border-gray-200/80 dark:border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                          Linked reports
                        </p>
                        <ul className="flex flex-wrap gap-2">
                          {row.report_details.map((r) => (
                            <li
                              key={r.id}
                              className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/10"
                            >
                              {r.title || r.report_type || `Report #${r.id}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex flex-wrap justify-between items-center gap-4">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                  Page {commentsPage} of {Math.max(1, commentsTotalPages)}
                </div>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setCommentsPage((p) => Math.max(1, p - 1))}
                    disabled={commentsPage <= 1}
                    variant="outline"
                    size="sm"
                    className="rounded-xl font-black uppercase tracking-widest text-[10px]"
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    onClick={() =>
                      setCommentsPage((p) => Math.min(commentsTotalPages, p + 1))
                    }
                    disabled={commentsPage >= commentsTotalPages}
                    variant="outline"
                    size="sm"
                    className="rounded-xl font-black uppercase tracking-widest text-[10px]"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DoctorOverViewPage: React.FC = () => {
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit, setLimit] = useState(10);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRow | null>(null);

  const fetchList = useCallback(async (page: number, search: string, lim: number) => {
    setLoading(true);
    try {
      const data = await getAdminDoctorList(page, search, lim);
      setDoctors((data.results || []) as DoctorRow[]);
      setTotalPages(data.total_pages || 1);
      setTotalItems(data.count ?? 0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(currentPage, searchTerm, limit);
  }, [currentPage, searchTerm, limit, fetchList]);

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-200 dark:border-green-800">
        <FiCheckCircle size={12} /> Active
      </span>
    ) : (
      <span className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-gray-200 dark:border-gray-700">
        <FiClock size={12} /> Inactive
      </span>
    );
  };

  return (
    <>
      <PageMeta
        title="Doctor Overview"
        description="View registered doctors and comments left on patients"
      />
      <PageBreadcrumb pageTitle="Doctor Overview" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm dark:text-gray-600 whitespace-nowrap">Show:</Label>
            <Select
              value={String(limit)}
              onChange={(val) => {
                setLimit(Number(val));
                setCurrentPage(1);
              }}
              options={[
                { value: "10", label: "10" },
                { value: "20", label: "20" },
                { value: "50", label: "50" },
                { value: "100", label: "100" },
              ]}
              className="w-20"
            />
            <span className="text-sm text-gray-600 whitespace-nowrap">entries</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div>
            Showing {totalItems === 0 ? 0 : (currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, totalItems)} of {totalItems} entries
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Doctor
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Contact
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Patients
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                    Loading doctors…
                  </TableCell>
                </TableRow>
              ) : doctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                    No doctors match this search
                  </TableCell>
                </TableRow>
              ) : (
                doctors.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-4">
                        <div className="size-12 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                          {doc.photo ? (
                            <img src={doc.photo} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <FiUser size={22} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-theme-sm dark:text-white/90">
                            {doc.first_name} {doc.last_name}
                          </div>
                          <div className="text-theme-xs text-gray-500 dark:text-gray-400">ID #{doc.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="text-theme-xs text-gray-600 dark:text-gray-400 flex flex-col gap-1">
                        <span className="flex items-center gap-1">
                          <FiMail className="shrink-0" /> {doc.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiPhone className="shrink-0" /> {doc.mobile || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">{getStatusBadge(doc.is_active)}</TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDoctor(doc);
                          setViewingId(doc.id);
                        }}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                      >
                        View patients <FiChevronRight className="text-lg" />
                      </button>
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
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
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
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      <DoctorCommentsModal
        doctor={selectedDoctor}
        open={!!viewingId}
        onClose={() => {
          setViewingId(null);
          setSelectedDoctor(null);
        }}
      />
    </>
  );
};

export default DoctorOverViewPage;
