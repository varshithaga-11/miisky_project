import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  fetchSupplyChainDossier,
  getAdminSupplyChainList,
  type KitchenTeamRow,
  type SupplyChainDossier,
} from "./api";
import { profileFileUrl } from "../../SupplyChain/DeliveryQuestionare/api";
import { toast, ToastContainer } from "react-toastify";
import {
  FiUser,
  FiSearch,
  FiPhone,
  FiMail,
  FiTruck,
  FiX,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiShoppingBag,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import Button from "../../../components/ui/button/Button";

type SupplyChainRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string | null;
  photo: string | null;
  is_active: boolean;
};

type DossierTab = "kitchens" | "plans" | "orders" | "profile" | "leave";

function PlanAssignmentCard({ row }: { row: Record<string, unknown> }) {
  const patient = row.patient_details as
    | { first_name?: string; last_name?: string; username?: string; email?: string }
    | undefined;
  const plan = row.user_diet_plan_details as
    | { status?: string; start_date?: string | null; end_date?: string | null }
    | undefined;
  const slots = row.delivery_slots_details as
    | Array<{ id?: number; name?: string; start_time?: string | null; end_time?: string | null }>
    | undefined;
  const slotAssign = row.slot_delivery_assignments as
    | Array<{
        delivery_slot_details?: { name?: string };
        delivery_person_details?: { first_name?: string; last_name?: string };
      }>
    | undefined;

  const pName = patient
    ? `${patient.first_name || ""} ${patient.last_name || ""}`.trim() ||
      patient.username ||
      patient.email
    : "—";

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-800/40 p-4 text-sm">
      <div className="font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
        {pName}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-wide">
        <div>
          Plan:{" "}
          <span className="text-gray-800 dark:text-gray-200 normal-case">
            {plan?.status ?? "—"}
          </span>
        </div>
        <div>
          Dates:{" "}
          <span className="text-gray-800 dark:text-gray-200 normal-case">
            {plan?.start_date ?? "—"} → {plan?.end_date ?? "—"}
          </span>
        </div>
        <div className="sm:col-span-2">
          Slots:{" "}
          <span className="text-gray-800 dark:text-gray-200 normal-case">
            {slots?.length
              ? slots.map((s) => s.name || `#${s.id}`).join(", ")
              : "—"}
          </span>
        </div>
        {slotAssign && slotAssign.length > 0 ? (
          <div className="sm:col-span-2 text-[10px] text-gray-400">
            Per-slot:{" "}
            {slotAssign
              .map(
                (s) =>
                  `${s.delivery_slot_details?.name ?? "?"} → ${
                    s.delivery_person_details
                      ? `${s.delivery_person_details.first_name || ""} ${
                          s.delivery_person_details.last_name || ""
                        }`.trim()
                      : "—"
                  }`
              )
              .join(" · ")}
          </div>
        ) : null}
        <div className="sm:col-span-2 text-[10px] text-gray-400">
          Assignment active: {(row.is_active as boolean) ? "Yes" : "No"} ·{" "}
          {row.assigned_on ? String(row.assigned_on) : ""}
        </div>
      </div>
    </div>
  );
}

function DeliveryProfilePanel({ profile }: { profile: Record<string, unknown> | null }) {
  if (!profile) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        No delivery questionnaire / KYC profile submitted yet.
      </p>
    );
  }

  const fileLink = (key: string, label: string) => {
    const v = profile[key];
    if (!v || typeof v !== "string") return null;
    const href = profileFileUrl(v);
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-indigo-600 dark:text-indigo-400 underline text-xs font-bold"
      >
        {label}
      </a>
    );
  };

  const row = (k: string, label: string) => {
    const v = profile[k];
    if (v === undefined || v === null || v === "") return null;
    return (
      <div className="flex flex-col sm:flex-row sm:justify-between gap-1 py-2 border-b border-gray-100 dark:border-white/5 text-sm">
        <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">{label}</span>
        <span className="text-gray-900 dark:text-white font-semibold break-all">{String(v)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {row("vehicle_type", "Vehicle type")}
      {row("other_vehicle_name", "Other vehicle")}
      {row("vehicle_details", "Vehicle details")}
      {row("register_number", "Registration")}
      {row("license_number", "License #")}
      {row("aadhar_number", "Aadhar #")}
      {row("pan_number", "PAN #")}
      {row("bank_account_number", "Bank account")}
      {row("ifsc_code", "IFSC")}
      {row("account_holder_name", "Account holder")}
      {row("bank_name", "Bank name")}
      {row("available_slots", "Available slots (JSON)")}
      <div className="flex flex-wrap gap-3 pt-2">
        {fileLink("license_copy", "License copy")}
        {fileLink("rc_copy", "RC copy")}
        {fileLink("insurance_copy", "Insurance")}
        {fileLink("aadhar_image", "Aadhar image")}
        {fileLink("pan_image", "PAN image")}
        {fileLink("puc_image", "PUC image")}
      </div>
      <div className="pt-2 text-xs text-gray-500">
        Verified: {profile.is_verified ? "Yes" : "No"}
        {profile.verified_on ? ` · ${String(profile.verified_on)}` : ""}
      </div>
    </div>
  );
}

const SupplyChainDossierModal: React.FC<{
  person: SupplyChainRow | null;
  open: boolean;
  initialTab: DossierTab;
  onClose: () => void;
}> = ({ person, open, initialTab, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SupplyChainDossier | null>(null);
  const [tab, setTab] = useState<DossierTab>(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open || !person) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const d = await fetchSupplyChainDossier(person.id);
        if (!cancelled) setData(d);
      } catch (e) {
        if (!cancelled) {
          const msg = e instanceof Error ? e.message : "Failed to load supply chain details";
          toast.error(msg);
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, person]);

  if (!open || !person) return null;

  const name = `${person.first_name} ${person.last_name}`.trim();
  const tabs: { id: DossierTab; label: string; icon: React.ReactNode }[] = [
    { id: "kitchens", label: "Kitchens", icon: <FiLayers size={14} /> },
    { id: "plans", label: "Allotted patients", icon: <FiUser size={14} /> },
    { id: "orders", label: "Orders & pay", icon: <FiShoppingBag size={14} /> },
    { id: "profile", label: "Questionnaire", icon: <FiFileText size={14} /> },
    { id: "leave", label: "Planned leave", icon: <FiCalendar size={14} /> },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-[28px] border border-gray-100 dark:border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-start justify-between gap-4 shrink-0">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
              Supply chain overview
            </p>
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
              {name}
            </h2>
            <p className="text-xs font-bold text-gray-500 mt-1 flex flex-wrap gap-3">
              <span className="flex items-center gap-1">
                <FiMail size={12} /> {person.email}
              </span>
              {person.mobile ? (
                <span className="flex items-center gap-1">
                  <FiPhone size={12} /> {person.mobile}
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

        <div className="px-4 pt-3 flex flex-wrap gap-2 border-b border-gray-100 dark:border-white/5 shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                tab === t.id
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="size-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-black uppercase text-gray-400 tracking-widest italic">
                Loading…
              </span>
            </div>
          ) : !data ? (
            <p className="text-center text-gray-500 py-12">No data.</p>
          ) : (
            <>
              {tab === "kitchens" && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Micro kitchens this person is on the delivery team for
                  </p>
                  {data.kitchen_team.length === 0 ? (
                    <p className="text-sm text-gray-500">No kitchen team memberships.</p>
                  ) : (
                    <ul className="space-y-3">
                      {data.kitchen_team.map((k: KitchenTeamRow) => (
                        <li
                          key={k.id}
                          className="rounded-2xl border border-gray-100 dark:border-white/10 p-4 bg-gray-50/50 dark:bg-white/[0.02]"
                        >
                          <div className="font-black text-gray-900 dark:text-white">
                            {k.micro_kitchen_details?.brand_name ||
                              k.micro_kitchen_details?.kitchen_code ||
                              `Kitchen #${k.micro_kitchen_details?.id ?? "?"}`}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Role: {k.role} · Active: {k.is_active ? "Yes" : "No"}
                            {k.zone_name ? ` · Zone: ${k.zone_name}` : ""}
                            {k.pincode ? ` · PIN: ${k.pincode}` : ""}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">
                            Since {k.assigned_on ? String(k.assigned_on) : "—"}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {tab === "plans" && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Diet plans where this person delivers (allotted patients)
                  </p>
                  {data.plan_assignments.length === 0 ? (
                    <p className="text-sm text-gray-500">No plan delivery assignments.</p>
                  ) : (
                    <div className="grid gap-3">
                      {(data.plan_assignments as Record<string, unknown>[]).map((row) => (
                        <PlanAssignmentCard key={String(row.id)} row={row} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tab === "orders" && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Orders assigned to this delivery person (with payment split snapshot)
                  </p>
                  {data.orders.length === 0 ? (
                    <p className="text-sm text-gray-500">No orders assigned yet.</p>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-white/10">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-gray-50/80 dark:bg-white/[0.03] text-[10px] font-black uppercase text-gray-400">
                            <th className="px-3 py-2">#</th>
                            <th className="px-3 py-2">Patient</th>
                            <th className="px-3 py-2">Kitchen</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Final</th>
                            <th className="px-3 py-2">Receipt</th>
                            <th className="px-3 py-2">Split</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                          {data.orders.map((o) => (
                            <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                              <td className="px-3 py-2 font-mono">{o.id}</td>
                              <td className="px-3 py-2">{o.patient_label ?? "—"}</td>
                              <td className="px-3 py-2">{o.kitchen_brand ?? "—"}</td>
                              <td className="px-3 py-2">{o.status}</td>
                              <td className="px-3 py-2">₹{o.final_amount}</td>
                              <td className="px-3 py-2">{o.receipt_uploaded ? "Yes" : "—"}</td>
                              <td className="px-3 py-2 max-w-[220px]">
                                {o.payment_snapshot ? (
                                  <span className="text-[10px] leading-tight block text-gray-500">
                                    Platform ₹{o.payment_snapshot.platform_amount} / Kitchen ₹
                                    {o.payment_snapshot.kitchen_amount}
                                    <br />
                                    Grand ₹{o.payment_snapshot.grand_total}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {tab === "profile" && (
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">
                    Delivery questionnaire &amp; KYC (same as supply-chain profile form)
                  </p>
                  <DeliveryProfilePanel
                    profile={data.delivery_profile as Record<string, unknown> | null}
                  />
                </div>
              )}

              {tab === "leave" && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Planned time off
                  </p>
                  {data.planned_leaves.length === 0 ? (
                    <p className="text-sm text-gray-500">No leave records.</p>
                  ) : (
                    <ul className="space-y-2">
                      {(data.planned_leaves as Record<string, unknown>[]).map((L) => (
                        <li
                          key={String(L.id)}
                          className="rounded-xl border border-gray-100 dark:border-white/10 p-3 text-sm"
                        >
                          <span className="font-bold">{String(L.start_date)} → {String(L.end_date)}</span>
                          <span className="text-gray-500 text-xs ml-2">
                            ({String(L.leave_type)})
                          </span>
                          {L.notes ? (
                            <p className="text-xs text-gray-500 mt-1">{String(L.notes)}</p>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SupplyChainOverViewPage: React.FC = () => {
  const [rows, setRows] = useState<SupplyChainRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<SupplyChainRow | null>(null);
  const [modalTab, setModalTab] = useState<DossierTab>("kitchens");

  const fetchList = useCallback(async (page: number, search: string, lim: number) => {
    setLoading(true);
    try {
      const data = await getAdminSupplyChainList(page, search, lim);
      setRows((data.results || []) as SupplyChainRow[]);
      setTotalPages(data.total_pages || 1);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load supply chain users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList(currentPage, searchTerm, limit);
  }, [currentPage, searchTerm, limit, fetchList]);

  const openDossier = (person: SupplyChainRow, tab: DossierTab) => {
    setSelected(person);
    setModalTab(tab);
    setModalOpen(true);
  };

  const statusBadge = (isActive: boolean) =>
    isActive ? (
      <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-200 dark:border-green-800">
        <FiCheckCircle size={12} /> Active
      </span>
    ) : (
      <span className="px-3 py-1 bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-gray-200 dark:border-gray-700">
        <FiClock size={12} /> Inactive
      </span>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900 pb-12">
      <PageMeta
        title="Supply chain overview"
        description="Micro kitchens, allotted patients, orders, and delivery profiles"
      />
      <PageBreadcrumb pageTitle="Supply chain overview" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="px-4 md:px-8">
        <div className="mb-8 flex flex-col md:flex-row gap-6 justify-between items-center">
          <div className="flex gap-4 items-center">
            <div className="p-4 bg-amber-600 rounded-[24px] text-white shadow-xl shadow-amber-600/20 italic">
              <FiTruck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none">
                Supply chain
              </h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Delivery staff, kitchens, and assignments
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-96 shadow-sm group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors" />
            <input
              type="text"
              placeholder="Search name, email, phone…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 rounded-[28px] border border-transparent focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/5 outline-none font-bold text-sm tracking-tight"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800/40 rounded-[44px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-white/[0.02] border-b dark:border-white/5">
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                    Person
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                    Contact
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                    Status
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest italic text-right">
                    Modals
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {loading && rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center">
                      <div className="inline-flex flex-col items-center gap-4">
                        <div className="size-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-black uppercase text-gray-400 tracking-widest italic">
                          Loading…
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-24 text-center text-gray-500">
                      No supply chain users found.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-all duration-300"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="size-14 rounded-[20px] bg-gray-100 dark:bg-gray-700 overflow-hidden ring-4 ring-gray-100 dark:ring-white/5 shadow-inner">
                            {r.photo ? (
                              <img src={r.photo} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <FiUser size={24} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none mb-1 group-hover:text-amber-600 transition-colors">
                              {r.first_name} {r.last_name}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                              ID #{r.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-tight flex flex-col gap-1">
                          <span className="flex items-center gap-1">
                            <FiMail /> {r.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiPhone /> {r.mobile || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">{statusBadge(r.is_active)}</td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openDossier(r, "kitchens")}
                            className="px-3 py-1.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[9px] font-black uppercase tracking-wider"
                          >
                            Kitchens
                          </button>
                          <button
                            type="button"
                            onClick={() => openDossier(r, "plans")}
                            className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-[9px] font-black uppercase tracking-wider"
                          >
                            Patients
                          </button>
                          <button
                            type="button"
                            onClick={() => openDossier(r, "orders")}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white text-[9px] font-black uppercase tracking-wider"
                          >
                            Orders
                          </button>
                          <button
                            type="button"
                            onClick={() => openDossier(r, "profile")}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white text-[9px] font-black uppercase tracking-wider"
                          >
                            Form
                          </button>
                          <button
                            type="button"
                            onClick={() => openDossier(r, "leave")}
                            className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white text-[9px] font-black uppercase tracking-wider"
                          >
                            Leave
                          </button>
                        </div>
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
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-white/5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase outline-none focus:border-amber-500 shadow-sm"
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

      <SupplyChainDossierModal
        person={selected}
        open={modalOpen}
        initialTab={modalTab}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
      />
    </div>
  );
};

export default SupplyChainOverViewPage;
