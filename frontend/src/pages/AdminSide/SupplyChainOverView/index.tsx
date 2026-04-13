import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  fetchAdminSupplyChainDeliveryProfile,
  fetchAdminSupplyChainKitchenTeam,
  fetchAdminSupplyChainOrders,
  fetchAdminSupplyChainPlanAssignments,
  fetchAdminSupplyChainPlannedLeaves,
  getAdminSupplyChainList,
  type AdminSupplyChainOrderRow,
  type KitchenTeamRow,
} from "./api";
import { profileFileUrl } from "../../SupplyChain/DeliveryQuestionare/api";
import { toast, ToastContainer } from "react-toastify";
import {
  FiUser,
  FiSearch,
  FiPhone,
  FiMail,
  FiX,
  FiCheckCircle,
  FiClock,
  FiLayers,
  FiShoppingBag,
  FiFileText,
  FiCalendar,
  FiChevronRight,
} from "react-icons/fi";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

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
  const [tab, setTab] = useState<DossierTab>(initialTab);
  const [loaded, setLoaded] = useState<Record<DossierTab, boolean>>({
    kitchens: false,
    plans: false,
    orders: false,
    profile: false,
    leave: false,
  });
  const [kitchenTeam, setKitchenTeam] = useState<KitchenTeamRow[] | null>(null);
  const [plans, setPlans] = useState<unknown[] | null>(null);
  const [orders, setOrders] = useState<AdminSupplyChainOrderRow[] | null>(null);
  const [deliveryProfile, setDeliveryProfile] = useState<Record<string, unknown> | null | undefined>(
    undefined
  );
  const [plannedLeaves, setPlannedLeaves] = useState<unknown[] | null>(null);
  const [loadingTab, setLoadingTab] = useState<DossierTab | null>(null);
  const [loadError, setLoadError] = useState<{ tab: DossierTab; message: string } | null>(null);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  useEffect(() => {
    if (!open || !person) {
      setLoaded({
        kitchens: false,
        plans: false,
        orders: false,
        profile: false,
        leave: false,
      });
      setKitchenTeam(null);
      setPlans(null);
      setOrders(null);
      setDeliveryProfile(undefined);
      setPlannedLeaves(null);
      setLoadError(null);
      setLoadingTab(null);
    }
  }, [open, person]);

  useEffect(() => {
    if (!open || !person) return;
    if (loaded[tab]) return;

    let cancelled = false;
    (async () => {
      setLoadingTab(tab);
      setLoadError(null);
      try {
        const uid = person.id;
        if (tab === "kitchens") {
          setKitchenTeam(await fetchAdminSupplyChainKitchenTeam(uid));
        } else if (tab === "plans") {
          setPlans(await fetchAdminSupplyChainPlanAssignments(uid));
        } else if (tab === "orders") {
          setOrders(await fetchAdminSupplyChainOrders(uid));
        } else if (tab === "profile") {
          setDeliveryProfile(await fetchAdminSupplyChainDeliveryProfile(uid));
        } else if (tab === "leave") {
          setPlannedLeaves(await fetchAdminSupplyChainPlannedLeaves(uid));
        }
        if (!cancelled) {
          setLoaded((l) => ({ ...l, [tab]: true }));
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load.";
        if (!cancelled) {
          setLoadError({ tab, message: msg });
          toast.error(msg);
          setLoaded((l) => ({ ...l, [tab]: true }));
        }
      } finally {
        if (!cancelled) setLoadingTab(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, person, tab, loaded]);

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
              Full details — use tabs below
            </p>
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
              {name}
            </h2>
            <p className="text-[10px] text-gray-400 font-semibold mt-1 max-w-lg">
              Kitchens, allotted patients, orders &amp; payments, delivery questionnaire, and planned leave.
            </p>
            <p className="text-xs font-bold text-gray-500 mt-2 flex flex-wrap gap-3">
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
          {loadingTab === tab ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="size-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-black uppercase text-gray-400 tracking-widest italic">
                Loading…
              </span>
            </div>
          ) : loadError?.tab === tab ? (
            <p className="text-center text-red-600 dark:text-red-400 text-sm py-12">{loadError.message}</p>
          ) : (
            <>
              {tab === "kitchens" && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Micro kitchens this person is on the delivery team for
                  </p>
                  {!kitchenTeam || kitchenTeam.length === 0 ? (
                    <p className="text-sm text-gray-500">No kitchen team memberships.</p>
                  ) : (
                    <ul className="space-y-3">
                      {kitchenTeam.map((k: KitchenTeamRow) => (
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
                  {!plans || plans.length === 0 ? (
                    <p className="text-sm text-gray-500">No plan delivery assignments.</p>
                  ) : (
                    <div className="grid gap-3">
                      {(plans as Record<string, unknown>[]).map((row) => (
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
                  {!orders || orders.length === 0 ? (
                    <p className="text-sm text-gray-500">No orders assigned yet.</p>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                      <div className="max-w-full overflow-x-auto">
                        <Table>
                          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                #
                              </TableCell>
                              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Patient
                              </TableCell>
                              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Kitchen
                              </TableCell>
                              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Status
                              </TableCell>
                              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Final
                              </TableCell>
                              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Receipt
                              </TableCell>
                              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Split
                              </TableCell>
                            </TableRow>
                          </TableHeader>
                          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {orders.map((o) => (
                              <TableRow key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                                <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90 font-mono">
                                  {o.id}
                                </TableCell>
                                <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                                  {o.patient_label ?? "—"}
                                </TableCell>
                                <TableCell className="px-5 py-4 text-start">
                                  <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium dark:bg-orange-900/30">
                                    {o.kitchen_brand ?? "—"}
                                  </span>
                                </TableCell>
                                <TableCell className="px-5 py-4 text-start">
                                  <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium dark:bg-blue-900/30">
                                    {o.status}
                                  </span>
                                </TableCell>
                                <TableCell className="px-5 py-4 text-start font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                  ₹{o.final_amount}
                                </TableCell>
                                <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-600 dark:text-gray-400">
                                  {o.receipt_uploaded ? "Yes" : "—"}
                                </TableCell>
                                <TableCell className="px-5 py-4 text-start max-w-[220px]">
                                  {o.payment_snapshot ? (
                                    <span className="text-theme-xs leading-tight block text-gray-500 dark:text-gray-400">
                                      Platform ₹{o.payment_snapshot.platform_amount} / Kitchen ₹
                                      {o.payment_snapshot.kitchen_amount}
                                      <br />
                                      Grand ₹{o.payment_snapshot.grand_total}
                                    </span>
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === "profile" && (
                <div>
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-4">
                    Delivery questionnaire &amp; KYC (same as supply-chain profile form)
                  </p>
                  <DeliveryProfilePanel profile={deliveryProfile ?? null} />
                </div>
              )}

              {tab === "leave" && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    Planned time off
                  </p>
                  {!plannedLeaves || plannedLeaves.length === 0 ? (
                    <p className="text-sm text-gray-500">No leave records.</p>
                  ) : (
                    <ul className="space-y-2">
                      {(plannedLeaves as Record<string, unknown>[]).map((L) => (
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
  const [totalItems, setTotalItems] = useState(0);
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
      setTotalItems(typeof data.count === "number" ? data.count : 0);
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

  const openDetails = (person: SupplyChainRow) => {
    setSelected(person);
    setModalTab("kitchens");
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
    <>
      <PageMeta
        title="Supply chain overview"
        description="Micro kitchens, allotted patients, orders, and delivery profiles"
      />
      <PageBreadcrumb pageTitle="Supply chain overview" />
      <ToastContainer position="bottom-right" className="z-[99999]" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, phone…"
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
                  Person
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Contact
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading && rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                    Loading supply chain users…
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="px-5 py-8 text-center text-gray-400 italic">
                    No supply chain users found.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <TableCell className="px-5 py-4 text-start">
                      <div className="flex items-center gap-4">
                        <div className="size-12 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                          {r.photo ? (
                            <img src={r.photo} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <FiUser size={22} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800 text-theme-sm dark:text-white/90">
                            {r.first_name} {r.last_name}
                          </div>
                          <div className="text-theme-xs text-gray-500 dark:text-gray-400">ID #{r.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">
                      <div className="text-theme-xs text-gray-600 dark:text-gray-400 flex flex-col gap-1">
                        <span className="flex items-center gap-1">
                          <FiMail className="shrink-0" /> {r.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiPhone className="shrink-0" /> {r.mobile || "N/A"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start">{statusBadge(r.is_active)}</TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm">
                      <button
                        type="button"
                        onClick={() => openDetails(r)}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm font-medium"
                      >
                        View details <FiChevronRight className="text-lg" />
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

      <SupplyChainDossierModal
        person={selected}
        open={modalOpen}
        initialTab={modalTab}
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
      />
    </>
  );
};

export default SupplyChainOverViewPage;
