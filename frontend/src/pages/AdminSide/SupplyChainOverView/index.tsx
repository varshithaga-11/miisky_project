import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  fetchAdminSupplyChainDeliveryProfile,
  fetchAdminSupplyChainKitchenTeam,
  fetchAdminSupplyChainOrders,
  fetchAdminSupplyChainPlanAssignments,
  fetchAdminSupplyChainPlannedLeaves,
  fetchAdminSupplyChainDeliveryRatings,
  fetchAdminSupplyChainEarnings,
  fetchAdminSupplyChainTickets,
  fetchAdminSupplyChainHubSummary,
  getAdminSupplyChainList,
  type AdminSupplyChainOrderRow,
  type KitchenTeamRow,
  type DeliveryFeedbackRow,
  type AdminSupplyChainEarningsResp,
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
  FiStar,
  FiAlertTriangle,
  FiMessageSquare,
  FiDollarSign,
  FiActivity,
  FiGrid,
  FiArrowLeft,
  FiAlertCircle,
  FiShoppingCart,
  FiTruck,
  FiMapPin,
  FiSettings,
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

type DossierTab = "overview" | "kitchens" | "plans" | "orders" | "earnings" | "profile" | "leave" | "ratings" | "issues" | "tickets";

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


function IssuesPanel({ ratings }: { ratings: DeliveryFeedbackRow[] | null }) {
  const issues = React.useMemo(() => {
    return (ratings || []).filter((x) => x.feedback_type === "issue");
  }, [ratings]);

  if (!issues || issues.length === 0) {
    return (
      <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">
        No delivery issues reported for this person.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {issues.map((r) => (
        <div
          key={r.id}
          className="rounded-3xl border border-gray-100 dark:border-white/10 p-6 bg-white dark:bg-white/[0.02] shadow-sm flex flex-col sm:flex-row justify-between gap-4"
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                {r.issue_type?.replace("_", " ") || "Issue"}
              </span>
              <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${r.resolved ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                {r.resolved ? "Resolved" : "Active"}
              </span>
              <span className="text-[10px] font-bold text-gray-400 italic">
                {new Date(r.created_at).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-200 mt-2 italic leading-relaxed">
              &quot;{r.description || r.review || "No details provided"}&quot;
            </p>
            <div className="mt-4 pt-4 border-t dark:border-white/5 flex flex-wrap gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>Order: <span className="text-blue-500">#{r.order_details?.id || r.order}</span></span>
              <span>Reported By: {r.reported_by_details ? `${r.reported_by_details.first_name} ${r.reported_by_details.last_name}` : "Patient"}</span>
            </div>
          </div>
          {r.resolved_at && (
             <div className="sm:text-right text-[10px] text-gray-400">
               <div className="font-black uppercase tracking-widest text-green-600 mb-1">Cleared At</div>
               {new Date(r.resolved_at).toLocaleString()}
             </div>
          )}
        </div>
      ))}
    </div>
  );
}

function EarningsPanel({ earnings }: { earnings: AdminSupplyChainEarningsResp | null }) {
  if (!earnings || !earnings.results?.length) {
    return <p className="text-sm text-gray-500 text-center py-8">No delivery earnings recorded yet.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-green-600 dark:text-green-400">Total Delivery Payout</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter italic">₹{earnings.total_delivery_earnings}</p>
        </div>
        <div className="text-right text-[10px] font-bold text-gray-400 uppercase">
          {earnings.total_orders} Orders Delivered
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Date</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Kitchen</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Amount</TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs">Receipt</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {earnings.results.map((e) => (
              <TableRow key={e.id} className="hover:bg-gray-50 hover:dark:bg-white/[0.02]">
                <TableCell className="px-5 py-3 text-theme-sm text-gray-800 dark:text-gray-200">
                  {new Date(e.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm text-gray-800 dark:text-gray-200">
                  {e.kitchen_name || "—"}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm font-black text-gray-900 dark:text-white">
                  ₹{e.delivery_earning}
                </TableCell>
                <TableCell className="px-5 py-3 text-theme-sm">
                  {e.receipt ? (
                    <span className="text-green-600 text-[10px] font-black uppercase">Uploaded</span>
                  ) : (
                    <span className="text-gray-400 text-[10px] font-bold uppercase italic">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function TicketsPanel({ tickets }: { tickets: any[] | null }) {
  if (!tickets || !tickets.length) {
    return <p className="text-sm text-gray-500 text-center py-8">No support tickets created by this person.</p>;
  }

  return (
    <ul className="space-y-3">
      {tickets.map((t) => (
        <li key={t.id} className="p-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-white dark:bg-gray-800/40">
          <div className="flex justify-between items-start mb-2">
            <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500">
              #{t.id} · {t.category_details?.name || "General"}
            </span>
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
              t.status === "resolved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}>
              {t.status}
            </span>
          </div>
          <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{t.subject}</p>
          <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>
          <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {new Date(t.created_at).toLocaleDateString()} · PRIORITY: {t.priority}
          </div>
        </li>
      ))}
    </ul>
  );
}

const MENU_ITEMS: { key: DossierTab; title: string; description: string; icon: any }[] = [
  { key: "kitchens", title: "Kitchen Assignments", description: "Kitchen teams and active delivery zones", icon: <FiLayers /> },
  { key: "plans", title: "Patient Allotments", description: "Currently allotted patients and delivery slots", icon: <FiUser /> },
  { key: "orders", title: "Delivery Orders", description: "Detailed order history and delivery status", icon: <FiShoppingBag /> },
  { key: "earnings", title: "Payouts & Earnings", description: "Delivery fees, wallet balances, and payouts", icon: <FiDollarSign /> },
  { key: "ratings", title: "Ratings & Performance", description: "Average staff ratings and feedback from patients", icon: <FiStar /> },
  { key: "issues", title: "Delivery Issues", description: "Reported delivery exceptions: damaged food, late arrival, address issues", icon: <FiAlertCircle /> },
  { key: "tickets", title: "Support Tickets", description: "Operational issues and technical support history", icon: <FiMessageSquare /> },
  { key: "profile", title: "KYC & Profile", description: "Identity verification, license, and vehicle records", icon: <FiFileText /> },
  { key: "leave", title: "Planned Leave", description: "Time-off records and planned unavailability", icon: <FiCalendar /> },
];

const SupplyChainDossierModal: React.FC<{
  person: SupplyChainRow | null;
  open: boolean;
  onClose: () => void;
}> = ({ person, open, onClose }) => {
  const [screen, setScreen] = useState<"hub" | DossierTab>("hub");
  const [loaded, setLoaded] = useState<Record<DossierTab, boolean>>({
    overview: false,
    kitchens: false,
    plans: false,
    orders: false,
    earnings: false,
    profile: false,
    leave: false,
    ratings: false,
    issues: false,
    tickets: false,
  });

  const [summaryStats, setSummaryStats] = useState<{
    kitchen_count: number;
    plan_count: number;
    order_count: number;
    total_earnings: string;
    avg_rating: number;
    ticket_count: number;
  } | null>(null);

  const [kitchenTeam, setKitchenTeam] = useState<KitchenTeamRow[] | null>(null);
  const [plans, setPlans] = useState<unknown[] | null>(null);
  const [orders, setOrders] = useState<AdminSupplyChainOrderRow[] | null>(null);
  const [earnings, setEarnings] = useState<AdminSupplyChainEarningsResp | null>(null);
  const [tickets, setTickets] = useState<any[] | null>(null);
  const [deliveryProfile, setDeliveryProfile] = useState<Record<string, unknown> | null | undefined>(undefined);
  const [plannedLeaves, setPlannedLeaves] = useState<unknown[] | null>(null);
  const [deliveryRatings, setDeliveryRatings] = useState<DeliveryFeedbackRow[] | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!person) return;
    try {
      setLoading(true);
      const data = await fetchAdminSupplyChainHubSummary(person.id);
      setSummaryStats(data);
    } catch (e: any) {
      console.error(e);
      // Fallback or ignore for summary
    } finally {
      setLoading(false);
    }
  }, [person]);

  useEffect(() => {
    if (open && person) {
      setScreen("hub");
      fetchSummary();
    }
  }, [open, person, fetchSummary]);

  useEffect(() => {
    if (!open || !person) {
      setLoaded({
        overview: false,
        kitchens: false,
        plans: false,
        orders: false,
        earnings: false,
        profile: false,
        leave: false,
        ratings: false,
        issues: false,
        tickets: false,
      });
      setSummaryStats(null);
      setKitchenTeam(null);
      setPlans(null);
      setOrders(null);
      setEarnings(null);
      setTickets(null);
      setDeliveryProfile(undefined);
      setPlannedLeaves(null);
      setDeliveryRatings(null);
      setError(null);
    }
  }, [open, person]);

  const loadView = useCallback(async (view: DossierTab) => {
    if (!person) return;
    setScreen(view);
    if (loaded[view]) return;

    setLoading(true);
    setError(null);
    try {
      const uid = person.id;
      switch (view) {
        case "kitchens":
          setKitchenTeam(await fetchAdminSupplyChainKitchenTeam(uid));
          break;
        case "plans":
          setPlans(await fetchAdminSupplyChainPlanAssignments(uid));
          break;
        case "orders":
          setOrders(await fetchAdminSupplyChainOrders(uid));
          break;
        case "earnings":
          setEarnings(await fetchAdminSupplyChainEarnings(uid));
          break;
        case "tickets":
          setTickets(await fetchAdminSupplyChainTickets(uid));
          break;
        case "profile":
          setDeliveryProfile(await fetchAdminSupplyChainDeliveryProfile(uid));
          break;
        case "leave":
          setPlannedLeaves(await fetchAdminSupplyChainPlannedLeaves(uid));
          break;
        case "ratings":
        case "issues":
          setDeliveryRatings(await fetchAdminSupplyChainDeliveryRatings(uid));
          break;
        default:
          break;
      }
      setLoaded(prev => ({ ...prev, [view]: true }));
    } catch (e: any) {
      setError(e.message || "Failed to load data");
      toast.error(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [person, loaded]);

  const goHub = () => {
    setScreen("hub");
    setError(null);
  };

  const avgRating = React.useMemo(() => {
    if (summaryStats) return summaryStats.avg_rating.toFixed(1);
    if (!deliveryRatings || deliveryRatings.length === 0) return "0.0";
    const r = deliveryRatings.filter((x) => x.feedback_type === "rating" && x.rating);
    if (!r.length) return "0.0";
    return (r.reduce((a, b) => a + (b.rating || 0), 0) / r.length).toFixed(1);
  }, [deliveryRatings, summaryStats]);

  if (!open || !person) return null;

  const name = `${person.first_name} ${person.last_name}`.trim();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-[2px] overflow-y-auto">
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-blue-100 dark:border-gray-800 my-8">
        
        <header className="flex-shrink-0 flex items-start justify-between gap-4 border-b border-blue-50/50 dark:border-gray-800 px-6 py-5 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30 dark:from-gray-900 dark:to-blue-950/20">
          <div className="min-w-0">
            {screen !== "hub" && (
              <button
                type="button"
                onClick={goHub}
                className="mb-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-blue-600 hover:text-blue-800 dark:text-blue-400 transition-colors"
                aria-label="Back to hub"
              >
                <FiArrowLeft className="w-3 h-3" />
                Back to hub
              </button>
            )}
            <h2 className="text-xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent truncate italic tracking-tighter">
              {screen === "hub" ? "Supply chain hub" : MENU_ITEMS.find(m => m.key === screen)?.title}
            </h2>
            <p className="text-sm text-gray-500 mt-1 truncate font-semibold uppercase tracking-widest text-[10px]">
              {name} · <span className="text-gray-400 font-mono text-[10px]">USER ID: {person.id}</span>
            </p>
          </div>
          <button
            type="button"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all"
            onClick={onClose}
          >
            <FiX className="w-5 h-5 text-gray-400" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8 bg-gradient-to-b from-blue-50/10 to-white dark:from-gray-900 dark:to-gray-950">
          {screen === "hub" && (
            <div className="space-y-10 pb-10">
              <section>
                <div className="mb-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
                    Admin summary views
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 font-medium">
                    Open read-only summaries for the supply chain personnel and their delivery performance.
                  </p>
                </div>


                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {MENU_ITEMS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => loadView(item.key)}
                      className="group text-left rounded-[32px] border border-gray-100 dark:border-gray-800 p-8 hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:border-blue-500 transition-all bg-white dark:bg-gray-900/50 relative overflow-hidden"
                    >
                      {/* Watermark Icon */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-blue-600 pointer-events-none">
                        {React.cloneElement(item.icon as React.ReactElement<any>, { size: 120 })}
                      </div>

                      {/* Small Icon Container */}
                      <div className="size-9 rounded-full bg-blue-50 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform shadow-sm">
                        {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
                      </div>

                      {/* Content */}
                      <div className="relative z-10">
                        <div className="font-extrabold text-gray-900 dark:text-white text-xl tracking-tight leading-tight">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-400 dark:text-gray-500 mt-2 font-medium italic leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}

          {screen !== "hub" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {loading && (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="size-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                  <span className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] italic">Gathering records…</span>
                </div>
              )}

              {!loading && error && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900 px-6 py-4 text-sm text-red-600 dark:text-red-400 font-bold uppercase tracking-widest text-center italic">
                  Oops! {error}
                </div>
              )}

              {!loading && !error && (
                <>
                  {screen === "kitchens" && (
                    <div className="space-y-4">
                      {!kitchenTeam || kitchenTeam.length === 0 ? (
                        <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">No kitchen team memberships found.</p>
                      ) : (
                        <ul className="grid gap-4">
                          {kitchenTeam.map((k: KitchenTeamRow) => (
                            <li key={k.id} className="rounded-3xl border border-gray-100 dark:border-white/10 p-6 bg-white dark:bg-white/[0.02] shadow-sm hover:shadow-md transition-shadow">
                              <div className="font-black text-gray-900 dark:text-white text-lg uppercase tracking-tight italic">
                                {k.micro_kitchen_details?.brand_name || k.micro_kitchen_details?.kitchen_code || `Kitchen #${k.micro_kitchen_details?.id ?? "?"}`}
                              </div>
                              <div className="flex flex-wrap gap-4 mt-3">
                                 <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Role: {k.role}</span>
                                 <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg ${k.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'}`}>Status: {k.is_active ? 'Active' : 'Inactive'}</span>
                                 {k.zone_name && <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest rounded-lg">Zone: {k.zone_name}</span>}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {screen === "plans" && (
                    <div className="space-y-4">
                      {!plans || plans.length === 0 ? (
                        <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">No plan delivery assignments found.</p>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(plans as Record<string, unknown>[]).map((row) => (
                            <PlanAssignmentCard key={String(row.id)} row={row} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {screen === "orders" && (
                    <div className="space-y-4">
                      {!orders || orders.length === 0 ? (
                        <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">No orders assigned to this person yet.</p>
                      ) : (
                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                          <Table>
                            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                              <TableRow>
                                <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Order ID</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Patient & Kitchen</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Amount</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Status</TableCell>
                              </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                              {orders.map((o) => (
                                <TableRow key={o.id} className="hover:bg-blue-50/20 transition-colors">
                                  <TableCell className="px-6 py-5 text-theme-sm font-black text-blue-600 italic tracking-tighter">#{o.id}</TableCell>
                                  <TableCell className="px-6 py-5">
                                    <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">{o.patient_label || "—"}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest italic">{o.kitchen_brand || "—"}</p>
                                  </TableCell>
                                  <TableCell className="px-6 py-5 text-theme-sm font-black tracking-tighter">₹{o.final_amount}</TableCell>
                                  <TableCell className="px-6 py-5">
                                    <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest">
                                      {o.status}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  )}

                  {screen === "earnings" && <EarningsPanel earnings={earnings} />}

                  {screen === "profile" && <DeliveryProfilePanel profile={deliveryProfile ?? null} />}

                  {screen === "leave" && (
                    <div className="space-y-4">
                      {!plannedLeaves || plannedLeaves.length === 0 ? (
                        <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">No time-off records found.</p>
                      ) : (
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {(plannedLeaves as Record<string, unknown>[]).map((L) => (
                            <li key={String(L.id)} className="rounded-3xl border border-gray-100 dark:border-white/10 p-5 bg-white dark:bg-white/[0.02] shadow-sm">
                              <div className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">{String(L.leave_type)}</div>
                              <div className="font-black text-gray-900 dark:text-white uppercase tracking-tighter italic text-lg">{String(L.start_date)} → {String(L.end_date)}</div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {screen === "ratings" && (
                    <div className="space-y-4">
                      {!deliveryRatings || deliveryRatings.length === 0 ? (
                        <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">No feedback records found yet.</p>
                      ) : (
                        <div className="space-y-4">
                           <div className="p-6 rounded-[32px] bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 flex items-center justify-between">
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Lifetime Rating</p>
                                 <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic italic mt-1">{avgRating} out of 5</p>
                              </div>
                              <FiStar className="size-10 text-amber-500 fill-amber-500 opacity-20" />
                           </div>
                           <ul className="space-y-4">
                            {deliveryRatings.map((fb) => (
                              <li key={fb.id} className="rounded-3xl border border-gray-100 dark:border-white/10 p-6 bg-white shadow-sm">
                                 <div className="flex justify-between items-center mb-4">
                                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                      fb.feedback_type === 'rating' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                    }`}>
                                      {fb.feedback_type}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(fb.created_at).toLocaleDateString()}</span>
                                 </div>
                                 {fb.rating && (
                                   <div className="flex gap-1 mb-3">
                                     {Array.from({length: 5}).map((_, i) => (
                                       <FiStar key={i} size={18} className={i < (fb.rating||0) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                                     ))}
                                   </div>
                                 )}
                                 <p className="text-sm font-bold text-gray-700 dark:text-gray-200 italic leading-relaxed">"{fb.review || fb.description || "No comment provided."}"</p>
                                 {fb.reported_by_details && (
                                   <div className="mt-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">— {fb.reported_by_details.first_name} {fb.reported_by_details.last_name || ""}</div>
                                 )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {screen === "tickets" && <TicketsPanel tickets={tickets} />}
                </>
              )}
            </div>
          )}
        </div>

        <footer className="footer-glow h-20 px-8 flex items-center justify-end border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all hover:bg-gray-100 dark:hover:bg-white/5 active:scale-95 border border-transparent hover:border-gray-200"
          >
            Dismiss
          </button>
        </footer>
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
        onClose={() => {
          setModalOpen(false);
          setSelected(null);
        }}
      />
    </>
  );
};

export default SupplyChainOverViewPage;
