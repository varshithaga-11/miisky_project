import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  getAdminDoctorList,
  getDoctorPatientComments,
  type DoctorPatientComment,
} from "./api";
import { toast, ToastContainer } from "react-toastify";
import {
  FiUser,
  FiSearch,
  FiPhone,
  FiMail,
  FiChevronRight,
  FiActivity,
  FiMessageSquare,
  FiX,
  FiCheckCircle,
  FiClock,
} from "react-icons/fi";
import Button from "../../../components/ui/button/Button";

type DoctorRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string | null;
  photo: string | null;
  is_active: boolean;
};

const DoctorCommentsModal: React.FC<{
  doctor: DoctorRow | null;
  open: boolean;
  onClose: () => void;
}> = ({ doctor, open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<DoctorPatientComment[]>([]);

  useEffect(() => {
    if (!open || !doctor) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getDoctorPatientComments(doctor.id);
        if (!cancelled) setRows(data);
      } catch {
        if (!cancelled) {
          toast.error("Failed to load patient comments");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, doctor]);

  if (!open || !doctor) return null;

  const name = `${doctor.first_name} ${doctor.last_name}`.trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-[32px] border border-gray-100 dark:border-white/10 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Patient comments
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
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-3 rounded-2xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="size-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-black uppercase text-gray-400 tracking-widest italic">
                Loading comments…
              </span>
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FiMessageSquare
                className="mx-auto mb-4 opacity-30"
                size={48}
              />
              <p className="text-sm font-bold uppercase tracking-tight">
                No patient comments recorded for this doctor yet.
              </p>
            </div>
          ) : (
            <ul className="space-y-6">
              {rows.map((row) => {
                const p = row.patient_details;
                const patientLabel = p
                  ? `${p.first_name} ${p.last_name}`.trim() || p.username
                  : "Unknown patient";
                return (
                  <li
                    key={row.id}
                    className="rounded-[24px] border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02] p-6"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-indigo-500 shrink-0" />
                        <span className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">
                          {patientLabel}
                        </span>
                        {p?.email ? (
                          <span className="text-[10px] font-bold text-gray-400 truncate max-w-[200px]">
                            {p.email}
                          </span>
                        ) : null}
                      </div>
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
                );
              })}
            </ul>
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
  const [limit, setLimit] = useState(10);
  const [viewingId, setViewingId] = useState<number | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRow | null>(null);

  const fetchList = useCallback(async (page: number, search: string, lim: number) => {
    setLoading(true);
    try {
      const data = await getAdminDoctorList(page, search, lim);
      setDoctors((data.results || []) as DoctorRow[]);
      setTotalPages(data.total_pages || 1);
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
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <PageMeta
        title="Doctor Overview"
        description="View registered doctors and comments left on patients"
      />
      <PageBreadcrumb pageTitle="Doctor Overview" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="px-4 md:px-8">
        <div className="mb-8 flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="p-4 bg-emerald-600 rounded-[24px] text-white shadow-xl shadow-emerald-600/20 italic">
              <FiActivity size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
                Doctors
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Review profiles and patient comments
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96 shadow-sm group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, email, phone…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 rounded-[28px] border border-transparent focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 outline-none font-bold text-sm tracking-tight shadow-emerald-500/5"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/40 rounded-[44px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b dark:border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                    Doctor
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                    Contact
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                    Status
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">
                    Patient comments
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {loading && doctors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center">
                      <div className="inline-flex flex-col items-center gap-4">
                        <div className="size-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-black uppercase text-gray-400 tracking-widest italic animate-pulse">
                          Loading…
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : doctors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <FiUser size={64} className="text-gray-100 dark:text-gray-800" />
                        <h3 className="text-xl font-black text-gray-200 dark:text-gray-700 uppercase tracking-tighter italic">
                          No doctors match this search
                        </h3>
                      </div>
                    </td>
                  </tr>
                ) : (
                  doctors.map((doc) => (
                    <tr
                      key={doc.id}
                      className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all duration-300"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="size-14 rounded-[20px] bg-gray-100 dark:bg-gray-700 overflow-hidden ring-4 ring-gray-100 dark:ring-white/5 shadow-inner">
                            {doc.photo ? (
                              <img
                                src={doc.photo}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <FiUser size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1 group-hover:text-emerald-600 transition-colors">
                              {doc.first_name} {doc.last_name}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                              ID #{doc.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight flex flex-col gap-1">
                          <span className="flex items-center gap-1">
                            <FiMail /> {doc.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiPhone /> {doc.mobile || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">{getStatusBadge(doc.is_active)}</td>
                      <td className="px-8 py-6 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDoctor(doc);
                            setViewingId(doc.id);
                          }}
                          className="px-6 py-2.5 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 ml-auto shadow-xl shadow-black/10 dark:shadow-white/5"
                        >
                          View comments <FiChevronRight />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-8 py-6 bg-gray-50/50 dark:bg-white/[0.02] border-t dark:border-white/5 flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-6">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                Page {currentPage} of {totalPages}
              </div>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:border-emerald-500 shadow-sm"
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                variant="outline"
                size="sm"
                className="rounded-xl font-black uppercase tracking-widest text-[10px]"
              >
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                size="sm"
                className="rounded-xl font-black uppercase tracking-widest text-[10px]"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DoctorCommentsModal
        doctor={selectedDoctor}
        open={!!viewingId}
        onClose={() => {
          setViewingId(null);
          setSelectedDoctor(null);
        }}
      />
    </div>
  );
};

export default DoctorOverViewPage;
