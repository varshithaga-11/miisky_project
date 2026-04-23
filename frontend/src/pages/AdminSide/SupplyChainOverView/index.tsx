import React, { useCallback, useEffect, useState } from "react";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PageMeta from "../../../components/common/PageMeta";
import {
  fetchAdminSupplyChainHubSummary,
  fetchAdminSupplyChainKitchenTeam,
  fetchAdminSupplyChainPlanAssignments,
  fetchAdminSupplyChainOrders,
  fetchAdminSupplyChainOrdersPaginated,
  fetchAdminSupplyChainOrderDetail,
  fetchAdminSupplyChainDailyWork,
  fetchAdminSupplyChainDeliveryProfile,
  fetchAdminSupplyChainPlannedLeaves,
  fetchAdminSupplyChainDeliveryRatings,
  fetchAdminSupplyChainEarnings,
  fetchAdminSupplyChainTickets,
  PaginatedResponse,
  AdminSupplyChainEarningsPaginatedResp,
  getAdminSupplyChainList,
  type AdminSupplyChainOrderRow,
  type AdminSupplyChainOrderPaginatedRow,
  type KitchenTeamRow,
  type DeliveryFeedbackRow,
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
  FiTruck,
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiChevronLeft,
  FiMapPin,
  FiSettings,
  FiAlertCircle,
} from "react-icons/fi";

import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../../components/ui/table";
import Select from "../../../components/form/Select";
import Label from "../../../components/form/Label";

type PagState<T> = {
  results: T[];
  page: number;
  hasMore: boolean;
};

const initialPag = {
  results: [],
  page: 1,
  hasMore: true,
};

const Sentinel = ({ loading, hasMore }: { loading: boolean; hasMore: boolean }) => (
  <div id="scroll-sentinel" className="h-20 flex items-center justify-center">
    {loading ? (
      <div className="flex items-center gap-2">
        <div className="size-4 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
        <span className="text-[10px] font-black uppercase text-blue-600/50 tracking-widest italic">Loading more...</span>
      </div>
    ) : !hasMore ? (
      <span className="text-[10px] font-black uppercase text-gray-300 tracking-[0.2em] italic">End of records</span>
    ) : null}
  </div>
);

export function FilterBar({
  startDate,
  endDate,
  onFilterChange,
  activePeriod,
  onPeriodChange,
  extra,
}: {
  startDate: string;
  endDate: string;
  activePeriod: string;
  onPeriodChange: (p: string) => void;
  onFilterChange: (s: string, e: string, p: string) => void;
  extra?: React.ReactNode;
}) {
  const handlePeriodChange = (val: string) => {
    onPeriodChange(val);
    if (val === "custom") return;
    if (val === "") {
      onFilterChange("", "", "");
      return;
    }

    const now = new Date();
    const end = now.toISOString().split("T")[0];
    let start = "";

    switch (val) {
      case "today":
        start = end;
        break;
      case "weekly": {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        start = d.toISOString().split("T")[0];
        break;
      }
      case "monthly": {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        start = d.toISOString().split("T")[0];
        break;
      }
      case "yearly": {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        start = d.toISOString().split("T")[0];
        break;
      }
    }
    onFilterChange(start, end, val);
  };

  return (
    <div className="flex flex-wrap gap-4 items-end bg-gray-50/50 dark:bg-white/10 p-5 rounded-[32px] border border-gray-100 dark:border-white/10 mb-6 shadow-sm transition-all duration-300">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest pl-1 italic">Quick Period</Label>
        <Select 
          value={activePeriod}
          onChange={handlePeriodChange}
          options={[
            { value: "", label: "Select Period" },
            { value: "today", label: "Today" },
            { value: "weekly", label: "Last 7 Days" },
            { value: "monthly", label: "Last 30 Days" },
            { value: "yearly", label: "Last Year" },
          ]}
          className="w-44 h-11 text-xs font-bold rounded-2xl shadow-sm border-gray-200"
        />
      </div>

      {extra}
      <button 
         onClick={() => {
           onPeriodChange("");
           onFilterChange("", "", "");
         }}
         className="h-11 px-5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1.5 group"
      >
        <div className="p-1.5 rounded-lg group-hover:bg-red-50 transition-colors">
          <FiX size={14} />
        </div>
        Reset
      </button>
    </div>
  );
}

type SupplyChainRow = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  mobile: string | null;
  photo: string | null;
  is_active: boolean;
};

type DossierTab = "overview" | "kitchens" | "plans" | "daily-work" | "orders" | "earnings" | "profile" | "leave" | "ratings" | "issues" | "tickets";

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

type FeedbackTargetType = "all" | "order" | "user_meal";
type FeedbackOrderType = "all" | "patient" | "non_patient";

function FeedbackScopeFilters({
  targetType,
  orderType,
  onTargetTypeChange,
  onOrderTypeChange,
}: {
  targetType: FeedbackTargetType;
  orderType: FeedbackOrderType;
  onTargetTypeChange: (value: FeedbackTargetType) => void;
  onOrderTypeChange: (value: FeedbackOrderType) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-white/[0.03] p-2 rounded-2xl">
        {[
          ["all", "All"],
          ["order", "Orders"],
          ["user_meal", "UserMeals"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => onTargetTypeChange(value as FeedbackTargetType)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              targetType === value
                ? "bg-indigo-500 text-white"
                : "text-gray-500 hover:bg-white dark:hover:bg-white/[0.06]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {targetType === "order" && (
        <select
          value={orderType}
          onChange={(e) => onOrderTypeChange(e.target.value as FeedbackOrderType)}
          className="px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          <option value="all">All Orders</option>
          <option value="patient">Patient Orders</option>
          <option value="non_patient">Non-patient Orders</option>
        </select>
      )}
    </div>
  );
}


function IssuesPanel({ 
  ratings, 
  loadingMore, 
  hasMore,
  targetType,
  orderType,
  onTargetTypeChange,
  onOrderTypeChange,
}: { 
  ratings: DeliveryFeedbackRow[]; 
  loadingMore: boolean; 
  hasMore: boolean;
  targetType: FeedbackTargetType;
  orderType: FeedbackOrderType;
  onTargetTypeChange: (value: FeedbackTargetType) => void;
  onOrderTypeChange: (value: FeedbackOrderType) => void;
}) {
  const issues = React.useMemo(() => {
    return (ratings || []).filter((x: DeliveryFeedbackRow) => x.feedback_type === "issue");
  }, [ratings]);

  return (
    <div className="space-y-4">
      <FeedbackScopeFilters
        targetType={targetType}
        orderType={orderType}
        onTargetTypeChange={onTargetTypeChange}
        onOrderTypeChange={onOrderTypeChange}
      />
      {(!issues || issues.length === 0) ? (
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">
            No delivery issues reported for this period.
          </p>
          <Sentinel loading={loadingMore} hasMore={hasMore} />
        </div>
      ) : (
        <div className="grid gap-4">
          {issues.map((r: any) => (
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
          <Sentinel loading={loadingMore} hasMore={hasMore} />
        </div>
      )}
    </div>
  );
}

function RatingsPanel({ 
  ratings, 
  loadingMore, 
  hasMore,
  avgRating,
  targetType,
  orderType,
  onTargetTypeChange,
  onOrderTypeChange,
}: { 
  ratings: DeliveryFeedbackRow[]; 
  loadingMore: boolean; 
  hasMore: boolean;
  avgRating: string;
  targetType: FeedbackTargetType;
  orderType: FeedbackOrderType;
  onTargetTypeChange: (value: FeedbackTargetType) => void;
  onOrderTypeChange: (value: FeedbackOrderType) => void;
}) {
  const reviews = React.useMemo(() => {
    return (ratings || []).filter((x) => x.feedback_type === "rating");
  }, [ratings]);

  return (
    <div className="space-y-4">
      <FeedbackScopeFilters
        targetType={targetType}
        orderType={orderType}
        onTargetTypeChange={onTargetTypeChange}
        onOrderTypeChange={onOrderTypeChange}
      />
      {(!reviews || reviews.length === 0) ? (
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">
            No feedback records found for this period.
          </p>
          <Sentinel loading={loadingMore} hasMore={hasMore} />
        </div>
      ) : (
        <div className="space-y-4">
           <div className="p-6 rounded-[32px] bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 flex items-center justify-between shadow-sm">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Lifetime Rating</p>
                 <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter italic mt-1">{avgRating} out of 5</p>
              </div>
              <FiStar className="size-10 text-amber-500 fill-amber-500 opacity-20" />
           </div>
           <ul className="space-y-4">
             {reviews.map((fb: DeliveryFeedbackRow) => (
               <li key={fb.id} className="rounded-3xl border border-gray-100 dark:border-white/10 p-6 bg-white shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                     <span className="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600">
                       Rating #{fb.id}
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
             <Sentinel loading={loadingMore} hasMore={hasMore} />
           </ul>
        </div>
      )}
    </div>
  );
}

function EarningsPanel({
  earnings,
  loadingMore,
  hasMore,
  startDate,
  endDate,
  onFilterChange,
  activePeriod,
  onPeriodChange,
}: {
  earnings: PagState<any> & { total_orders: number; total_delivery_earnings: string };
  loadingMore: boolean;
  hasMore: boolean;
  startDate: string;
  endDate: string;
  onFilterChange: (s: string, e: string, p: string) => void;
  activePeriod: string;
  onPeriodChange: (p: string) => void;
}) {
  return (
    <div className="space-y-6">
      <FilterBar 
        startDate={startDate} 
        endDate={endDate} 
        onFilterChange={onFilterChange} 
        activePeriod={activePeriod}
        onPeriodChange={onPeriodChange}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-8 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
            Total Earnings
          </p>
          <p className="text-4xl font-black mt-1 italic tracking-tighter">
            ₹{earnings.total_delivery_earnings}
          </p>
        </div>
        <div className="p-8 rounded-[32px] bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Total Orders
          </p>
          <p className="text-4xl font-black mt-1 text-gray-900 dark:text-white italic tracking-tighter">
            {earnings.total_orders}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-gray-100 dark:border-white/10 bg-white dark:bg-white/[0.02] shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50 dark:bg-black/20">
            <TableRow>
              <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Order</TableCell>
              <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Kitchen</TableCell>
              <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Earnings</TableCell>
              <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Date</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
            {earnings.results.map((e: any) => (
              <TableRow key={e.id} className="hover:bg-blue-50/20 transition-colors">
                <TableCell className="px-6 py-4 font-bold text-blue-600 italic">#{e.id}</TableCell>
                <TableCell className="px-6 py-4">
                  <p className="font-bold text-gray-900 dark:text-white text-xs uppercase tracking-tight">{e.micro_kitchen_brand || "—"}</p>
                </TableCell>
                <TableCell className="px-6 py-4 font-black text-gray-900 dark:text-white italic">₹{e.delivery_charge}</TableCell>
                <TableCell className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   {new Date(e.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Sentinel loading={loadingMore} hasMore={hasMore} />
      </div>
    </div>
  );
}

function DailyWorkPanel({
  dailyWork,
  loadingMore,
  hasMore,
  startDate,
  endDate,
  onFilterChange,
  activePeriod,
  onPeriodChange,
}: {
  dailyWork: any[];
  loadingMore: boolean;
  hasMore: boolean;
  startDate: string;
  endDate: string;
  onFilterChange: (start: string, end: string, period: string) => void;
  activePeriod: string;
  onPeriodChange: (p: string) => void;
}) {
  return (
    <div className="space-y-4">
      <FilterBar 
        startDate={startDate} 
        endDate={endDate} 
        onFilterChange={onFilterChange} 
        activePeriod={activePeriod}
        onPeriodChange={onPeriodChange}
      />

      {!dailyWork || (dailyWork.length === 0 && !loadingMore) ? (
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">
            No daily meal assignments found for this period.
          </p>
          <Sentinel loading={loadingMore} hasMore={hasMore} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03] shadow-sm">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                <TableRow>
                  <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Meal & Time</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Patient & Kitchen</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Date</TableCell>
                  <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {dailyWork.map((d: any) => (
                  <TableRow key={d.id} className="hover:bg-blue-50/20 transition-colors">
                    <TableCell className="px-6 py-5">
                      <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">
                        {d.user_meal_details?.meal_type || "Meal"}
                      </p>
                      <p className="text-[10px] text-blue-600 font-black uppercase mt-0.5 tracking-widest italic tracking-tighter">
                        {d.scheduled_time || "Scheduled"}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">
                        {d.user_meal_details?.patient_name || "—"}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest italic">
                        {d.user_meal_details?.kitchen_brand || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-400 tabular-nums">
                        {d.scheduled_date}
                      </p>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <span
                        className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                          d.status === "delivered" ? "bg-green-50 text-green-600" : d.status === "picked_up" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {d.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Sentinel loading={loadingMore} hasMore={hasMore} />
          </div>
        </div>
      )}
    </div>
  );
}

function TicketsPanel({
  tickets,
  loadingMore,
  hasMore,
}: {
  tickets: any[];
  loadingMore: boolean;
  hasMore: boolean;
}) {
  const personLabel = (user: any, fallbackRole?: string) => {
    if (!user) {
      return { name: "—", role: fallbackRole || "—" };
    }
    const name = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username || "—";
    const role = user.role || fallbackRole || "—";
    return { name, role };
  };

  if (!tickets || (tickets.length === 0 && !loadingMore)) {
    return (
      <div className="space-y-4">
        <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">
          No support tickets found.
        </p>
        <Sentinel loading={loadingMore} hasMore={hasMore} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((t: any) => (
          (() => {
            const fromUser = personLabel(t.created_by_details, t.user_type);
            const toUser = personLabel(t.assigned_to_details, t.target_user_type);
            return (
          <li
            key={t.id}
            className="rounded-3xl border border-gray-100 dark:border-white/10 p-6 bg-white dark:bg-white/[0.02] shadow-sm flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-3 gap-2">
              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                #{t.id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                  t.status === "resolved" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {t.status}
              </span>
            </div>
            <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{t.subject || t.title}</p>
            <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>
            <div className="mt-3 rounded-2xl bg-gray-50/70 dark:bg-white/[0.03] border border-gray-100 dark:border-white/10 p-3 space-y-2">
              <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest">
                <span className="font-black text-gray-400">From</span>
                <span className="font-bold text-gray-700 dark:text-gray-200 normal-case">{fromUser.name}</span>
                <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 font-black">{fromUser.role}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-widest">
                <span className="font-black text-gray-400">To</span>
                <span className="font-bold text-gray-700 dark:text-gray-200 normal-case">{toUser.name}</span>
                <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-600 font-black">{toUser.role}</span>
              </div>
            </div>
            <div className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {new Date(t.created_at).toLocaleDateString()} · PRIORITY: {t.priority}
            </div>
          </li>
            );
          })()
        ))}
      </ul>
      <Sentinel loading={loadingMore} hasMore={hasMore} />
    </div>
  );
}

const MENU_ITEMS: { key: DossierTab; title: string; description: string; icon: any }[] = [
  { key: "kitchens", title: "Kitchen Assignments", description: "Kitchen teams and active delivery zones", icon: <FiLayers /> },
  { key: "plans", title: "Patient Allotments", description: "Currently allotted patients and delivery slots", icon: <FiUser /> },
  {
    key: "daily-work",
    title: "Daily Work",
    description: "Daily meal delivery assignments",
    icon: <FiTruck />,
  },
  { key: "orders", title: "Delivery Orders", description: "Detailed order history and delivery status", icon: <FiShoppingBag /> },
  { key: "earnings", title: "Payouts & Earnings", description: "Delivery fees, wallet balances, and payouts", icon: <FiDollarSign /> },
  { key: "ratings", title: "Ratings & Performance", description: "Average staff ratings and feedback from patients", icon: <FiStar /> },
  { key: "issues", title: "Delivery Issues", description: "Reported delivery exceptions: damaged food, late arrival, address issues", icon: <FiAlertCircle /> },
  { key: "tickets", title: "Support Tickets", description: "Operational issues and technical support history", icon: <FiMessageSquare /> },
  { key: "profile", title: "KYC & Profile", description: "Identity verification, license, and vehicle records", icon: <FiFileText /> },
  { key: "leave", title: "Planned Leave", description: "Time-off records and planned unavailability", icon: <FiCalendar /> },
];

const AdminOrderDetailView: React.FC<{
  open: boolean;
  onClose: () => void;
  order: any;
  loading: boolean;
}> = ({ open, onClose, order, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Order Summary</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  order?.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {order?.status}
                </span>
              </div>
              <p className="text-sm font-bold text-blue-600 italic">
                #{order?.id ? String(order.id).padStart(5, '0') : '—'} • {order?.order_type?.replace("_", " ")}
              </p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                Placed on: {order?.created_at ? new Date(order.created_at).toLocaleString() : '—'}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
              <FiX className="text-2xl text-gray-400" />
            </button>
          </div>

          {loading ? (
            <div className="py-32 text-center">
               <div className="size-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
               <p className="text-gray-400 italic font-bold uppercase tracking-widest animate-pulse text-xs">Fetching full dossier...</p>
            </div>
          ) : !order ? (
            <div className="py-20 text-center text-red-400 italic font-bold">Dossier unavailable or error occurred.</div>
          ) : (
            <div className="space-y-8">
              {/* People Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-[2rem] bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><FiUser size={80} /></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-blue-500" /> Patient Information
                  </p>
                  <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">
                    {order.user_details?.first_name} {order.user_details?.last_name}
                  </p>
                  <p className="text-sm font-bold text-gray-500 flex items-center gap-1.5">
                    <FiPhone className="text-blue-500" /> {order.user_details?.mobile || "No Contact"}
                  </p>
                </div>

                <div className="p-6 rounded-[2rem] bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><FiGrid size={80} /></div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-amber-500" /> Kitchen Details
                  </p>
                  <p className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-1">
                    {order.kitchen_details?.brand_name || "Unknown Kitchen"}
                  </p>
                  <p className="text-xs font-bold text-gray-500 italic">
                    Assigned Delivery ID: #{order.delivery_person || "N/A"}
                  </p>
                </div>
              </div>

              {/* Delivery Section */}
              <div className="p-6 rounded-[2rem] bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/10">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FiMapPin className="text-red-500" /> Delivery Logistics
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 size-2 rounded-full bg-red-500 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <div>
                       <p className="text-sm font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                         {order.delivery_address || "No address provided"}
                       </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="px-4 py-2 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm">
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Distance</p>
                       <p className="text-sm font-black text-gray-900 dark:text-white">{order.delivery_distance_km || "0"} KM</p>
                    </div>
                    {order.delivery_slab_details && (
                      <div className="px-4 py-2 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm">
                         <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pricing Slab</p>
                         <p className="text-sm font-black text-gray-900 dark:text-white">{order.delivery_slab_details.min_km}-{order.delivery_slab_details.max_km} KM</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <FiShoppingBag className="text-green-500" /> Ordered Items
                </p>
                <div className="space-y-3">
                  {order.items?.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-4 bg-white dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden border border-gray-200 dark:border-white/10">
                          {item.food_details?.image ? (
                             <img src={item.food_details.image} className="w-full h-full object-cover" alt="" />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center text-gray-300"><FiActivity /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight">
                            {item.food_details?.name || "Unknown Item"}
                          </p>
                          <p className="text-xs font-bold text-gray-400 italic">
                             ₹{item.price} x {item.quantity}
                          </p>
                        </div>
                      </div>
                      <p className="text-lg font-black text-gray-900 dark:text-white italic tracking-tighter">
                        ₹{item.subtotal || item.price}
                      </p>
                    </div>
                  ))}
                  {(!order.items || order.items.length === 0) && (
                    <p className="text-center text-gray-400 text-xs italic py-8 bg-gray-50/50 rounded-3xl border border-dashed">No item details available in dossier.</p>
                  )}
                </div>
              </div>

              {/* Ratings Section */}
              {order.ratings && order.ratings.length > 0 && (
                <div className="p-6 rounded-[2rem] bg-amber-50/30 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20">
                  <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FiStar className="fill-amber-400 text-amber-400" /> Patient Feedback
                  </p>
                  {order.ratings.map((r: any, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} size={14} className={i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
                        ))}
                        <span className="text-xs font-black text-amber-600 dark:text-amber-400 ml-2">{r.rating}/5</span>
                      </div>
                      {r.review && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 italic bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-amber-100/20">
                           "{r.review}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Financials Section */}
              <div className="p-8 rounded-[2.5rem] bg-blue-600 text-white shadow-2xl shadow-blue-600/30 relative overflow-hidden">
                <div className="absolute -bottom-10 -right-10 size-40 bg-white/5 rounded-full blur-3xl" />
                <div className="absolute -top-10 -left-10 size-40 bg-blue-400/10 rounded-full blur-3xl" />
                
                <div className="relative space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">Food Subtotal</span>
                    <span className="font-bold">₹{order.total_amount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">Delivery Fees</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-lg font-bold">Standard</span>
                    </div>
                    <span className="font-bold">₹{order.delivery_charge}</span>
                  </div>
                  <div className="h-px bg-white/10" />
                  <div className="flex justify-between items-center pt-2">
                    <div>
                       <span className="text-sm font-black uppercase tracking-widest block leading-none">Grand Total</span>
                       <span className="text-[10px] font-bold opacity-60 italic">Inclusive of all taxes & charges</span>
                    </div>
                    <span className="text-4xl font-black italic tracking-tighter drop-shadow-lg">₹{order.final_amount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SupplyChainDossierModal: React.FC<{
  person: SupplyChainRow | null;
  open: boolean;
  onClose: () => void;
}> = ({ person, open, onClose }) => {
  const scrollBodyRef = React.useRef<HTMLDivElement | null>(null);
  const [screen, setScreen] = useState<"hub" | DossierTab>("hub");
  const [loaded, setLoaded] = useState<Record<DossierTab, boolean>>({
    overview: false,
    kitchens: false,
    plans: false,
    "daily-work": false,
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

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kitchenTeam, setKitchenTeam] = useState<PagState<KitchenTeamRow>>(initialPag);
  const [plans, setPlans] = useState<PagState<any>>(initialPag);
  const [dailyWork, setDailyWork] = useState<PagState<any>>(initialPag);
  const [orders, setOrders] = useState<PagState<AdminSupplyChainOrderPaginatedRow>>(initialPag);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [earnings, setEarnings] = useState<PagState<any> & { total_orders: number; total_delivery_earnings: string }>({
    ...initialPag,
    total_orders: 0,
    total_delivery_earnings: "0",
  });
  const [tickets, setTickets] = useState<PagState<any>>(initialPag);
  const [deliveryProfile, setDeliveryProfile] = useState<Record<string, unknown> | null | undefined>(undefined);
  const [plannedLeaves, setPlannedLeaves] = useState<PagState<any>>(initialPag);
  const [deliveryRatings, setDeliveryRatings] = useState<PagState<DeliveryFeedbackRow>>(initialPag);
  const [dwStartDate, setDwStartDate] = useState("");
  const [dwEndDate, setDwEndDate] = useState("");
  const [dwPeriod, setDwPeriod] = useState("");

  const [ordStartDate, setOrdStartDate] = useState("");
  const [ordEndDate, setOrdEndDate] = useState("");
  const [ordStatus, setOrdStatus] = useState("");
  const [ordPeriod, setOrdPeriod] = useState("");

  const [earnStartDate, setEarnStartDate] = useState("");
  const [earnEndDate, setEarnEndDate] = useState("");
  const [earnPeriod, setEarnPeriod] = useState("");

  const [fbStartDate, setFbStartDate] = useState("");
  const [fbEndDate, setFbEndDate] = useState("");
  const [fbTargetType, setFbTargetType] = useState<FeedbackTargetType>("all");
  const [fbOrderType, setFbOrderType] = useState<FeedbackOrderType>("all");

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
        "daily-work": false,
        orders: false,
        earnings: false,
        profile: false,
        leave: false,
        ratings: false,
        issues: false,
        tickets: false,
      });
      setSummaryStats(null);
      setKitchenTeam(initialPag);
      setPlans(initialPag);
      setDailyWork(initialPag);
      setOrders(initialPag);
      setEarnings({ ...initialPag, total_orders: 0, total_delivery_earnings: "0" });
      setTickets(initialPag);
      setDeliveryProfile(undefined);
      setPlannedLeaves(initialPag);
      setDeliveryRatings(initialPag);
      setDwStartDate("");
      setDwEndDate("");
      setDwPeriod("");
      setOrdStartDate("");
      setOrdEndDate("");
      setOrdStatus("");
      setOrdPeriod("");
      setEarnStartDate("");
      setEarnEndDate("");
      setEarnPeriod("");
      setFbStartDate("");
      setFbEndDate("");
      setFbTargetType("all");
      setFbOrderType("all");
      setError(null);
      setLoadingMore(false);
    }
  }, [open, person]);

  const loadView = useCallback(async (view: DossierTab) => {
    if (!person) return;
    setScreen(view);
    if (loaded[view] && view !== "ratings" && view !== "issues") return;

    setLoading(true);
    setError(null);
    try {
      const uid = person.id;
      switch (view) {
        case "kitchens": {
          const res = await fetchAdminSupplyChainKitchenTeam(uid, 1);
          setKitchenTeam({ results: res.results, page: 1, hasMore: !!res.next });
          break;
        }
        case "plans": {
          const res = await fetchAdminSupplyChainPlanAssignments(uid, 1);
          setPlans({ results: res.results, page: 1, hasMore: !!res.next });
          break;
        }
        case "daily-work": {
          const res = await fetchAdminSupplyChainDailyWork(uid, 1, 10, dwStartDate, dwEndDate, dwPeriod);
          setDailyWork({ results: res.results, page: 1, hasMore: !!res.next });
          break;
        }
        case "orders": {
          const res = await fetchAdminSupplyChainOrdersPaginated(uid, 1, 10, ordStartDate, ordEndDate, ordStatus);
          setOrders({ results: res.results, page: 1, hasMore: !!res.next });
          break;
        }
        case "earnings": {
          const res = await fetchAdminSupplyChainEarnings(uid, 1);
          setEarnings({
            results: res.results,
            page: 1,
            hasMore: !!res.next,
            total_orders: res.total_orders,
            total_delivery_earnings: res.total_delivery_earnings,
          });
          break;
        }
        case "tickets": {
          const res = await fetchAdminSupplyChainTickets(uid, 1);
          setTickets({ results: res.results, page: 1, hasMore: !!res.next });
          break;
        }
        case "profile":
          setDeliveryProfile(await fetchAdminSupplyChainDeliveryProfile(uid));
          break;
        case "leave": {
          const res = await fetchAdminSupplyChainPlannedLeaves(uid, 1);
          setPlannedLeaves({ results: res.results, page: 1, hasMore: !!res.next });
          break;
        }
        case "ratings":
        case "issues": {
          const res = await fetchAdminSupplyChainDeliveryRatings(
            uid,
            1,
            10,
            fbStartDate,
            fbEndDate,
            fbTargetType,
            fbTargetType === "order" ? fbOrderType : "all",
            view === "ratings" ? "rating" : "issue"
          );
          setDeliveryRatings({ results: res.results, page: 1, hasMore: !!res.next });
          break;
        }
        default:
          break;
      }
      setLoaded((prev) => ({ ...prev, [view]: true }));
    } catch (e: any) {
      setError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [person, loaded, fbStartDate, fbEndDate, fbTargetType, fbOrderType]);

  const loadMore = useCallback(async () => {
    if (!person || loading || loadingMore || screen === "hub" || screen === "profile") return;
    const uid = person.id;
    const tab = screen;

    try {
      setLoadingMore(true);
      switch (tab) {
        case "kitchens": {
          if (!kitchenTeam.hasMore) break;
          const res = await fetchAdminSupplyChainKitchenTeam(uid, kitchenTeam.page + 1);
          setKitchenTeam((prev: PagState<KitchenTeamRow>) => ({ results: [...prev.results, ...res.results], page: prev.page + 1, hasMore: !!res.next }));
          break;
        }
        case "plans": {
          if (!plans.hasMore) break;
          const res = await fetchAdminSupplyChainPlanAssignments(uid, plans.page + 1);
          setPlans((prev: PagState<any>) => ({ results: [...prev.results, ...res.results], page: prev.page + 1, hasMore: !!res.next }));
          break;
        }
        case "daily-work": {
          if (!dailyWork.hasMore) break;
          const res = await fetchAdminSupplyChainDailyWork(uid, dailyWork.page + 1, 10, dwStartDate, dwEndDate, dwPeriod);
          setDailyWork((prev: PagState<any>) => ({ results: [...prev.results, ...res.results], page: prev.page + 1, hasMore: !!res.next }));
          break;
        }
        case "orders": {
          if (!orders.hasMore) break;
          const res = await fetchAdminSupplyChainOrdersPaginated(uid, orders.page + 1, 10, ordStartDate, ordEndDate, ordStatus);
          setOrders((prev: PagState<AdminSupplyChainOrderPaginatedRow>) => ({ results: [...prev.results, ...res.results], page: prev.page + 1, hasMore: !!res.next }));
          break;
        }
        case "earnings": {
          if (!earnings.hasMore) break;
          const res = await fetchAdminSupplyChainEarnings(uid, earnings.page + 1, 10, earnStartDate, earnEndDate);
          setEarnings((prev: PagState<any> & { total_orders: number; total_delivery_earnings: string }) => ({
            ...prev,
            results: [...prev.results, ...res.results],
            page: prev.page + 1,
            hasMore: !!res.next,
            total_orders: res.total_orders,
            total_delivery_earnings: res.total_delivery_earnings,
          }));
          break;
        }
        case "tickets": {
          if (!tickets.hasMore) break;
          const res = await fetchAdminSupplyChainTickets(uid, tickets.page + 1);
          setTickets((prev: PagState<any>) => ({ results: [...prev.results, ...res.results], page: prev.page + 1, hasMore: !!res.next }));
          break;
        }
        case "leave": {
          if (!plannedLeaves.hasMore) break;
          const res = await fetchAdminSupplyChainPlannedLeaves(uid, plannedLeaves.page + 1);
          setPlannedLeaves((prev: PagState<any>) => ({ results: [...prev.results, ...res.results], page: prev.page + 1, hasMore: !!res.next }));
          break;
        }
        case "ratings":
        case "issues": {
          if (!deliveryRatings.hasMore) break;
          const res = await fetchAdminSupplyChainDeliveryRatings(
            uid,
            deliveryRatings.page + 1,
            10,
            fbStartDate,
            fbEndDate,
            fbTargetType,
            fbTargetType === "order" ? fbOrderType : "all",
            tab === "ratings" ? "rating" : "issue"
          );
          setDeliveryRatings((prev: PagState<DeliveryFeedbackRow>) => ({ results: [...prev.results, ...res.results], page: prev.page + 1, hasMore: !!res.next }));
          break;
        }
      }
    } catch (e: any) {
      console.error("Load more failed", e);
    } finally {
      setLoadingMore(false);
    }
  }, [person, screen, loading, loadingMore, kitchenTeam, plans, dailyWork, orders, earnings, tickets, plannedLeaves, deliveryRatings, fbStartDate, fbEndDate, fbTargetType, fbOrderType]);

  useEffect(() => {
    if (screen === "hub" || screen === "profile" || loading) return;
    const root = scrollBodyRef.current;
    if (!root) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, root }
    );
    const sen = root.querySelector("#scroll-sentinel");
    if (sen) obs.observe(sen);
    return () => obs.disconnect();
  }, [screen, loadMore, loading]);

  const goHub = () => {
    setScreen("hub");
    setError(null);
  };

  const avgRating = React.useMemo(() => {
    if (summaryStats) return summaryStats.avg_rating.toFixed(1);
    const results = deliveryRatings.results;
    if (!results || results.length === 0) return "0.0";
    const r = results.filter((x: DeliveryFeedbackRow) => x.feedback_type === "rating" && x.rating);
    if (!r.length) return "0.0";
    return (r.reduce((a: number, b: DeliveryFeedbackRow) => a + (b.rating || 0), 0) / r.length).toFixed(1);
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

        <div
          id="dossier-scroll-container"
          ref={scrollBodyRef}
          className="flex-1 overflow-y-auto px-6 py-8 bg-gradient-to-b from-blue-50/10 to-white dark:from-gray-900 dark:to-gray-950"
        >
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
                      {kitchenTeam.results.length === 0 && !loadingMore ? (
                        <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">No kitchen team memberships found.</p>
                      ) : (
                        <div className="space-y-4">
                          <ul className="grid gap-4">
                            {kitchenTeam.results.map((k: KitchenTeamRow) => (
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
                          <Sentinel loading={loadingMore} hasMore={kitchenTeam.hasMore} />
                        </div>
                      )}
                    </div>
                  )}

                  {screen === "plans" && (
                    <div className="space-y-4">
                      {plans.results.length === 0 && !loadingMore ? (
                        <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">No plan delivery assignments found.</p>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(plans.results as Record<string, unknown>[]).map((row) => (
                              <PlanAssignmentCard key={String(row.id)} row={row} />
                            ))}
                          </div>
                          <Sentinel loading={loadingMore} hasMore={plans.hasMore} />
                        </div>
                      )}
                    </div>
                  )}

                  {screen === "daily-work" && (
                    <DailyWorkPanel 
                      dailyWork={dailyWork.results} 
                      loadingMore={loadingMore} 
                      hasMore={dailyWork.hasMore} 
                      startDate={dwStartDate}
                      endDate={dwEndDate}
                      activePeriod={dwPeriod}
                      onPeriodChange={setDwPeriod}
                      onFilterChange={(s, e, p) => {
                        setDwStartDate(s);
                        setDwEndDate(e);
                        // Force reload
                        const uid = person.id;
                        (async () => {
                           setLoading(true);
                           try {
                             const res = await fetchAdminSupplyChainDailyWork(uid, 1, 10, s, e, p);
                             setDailyWork({ results: res.results, page: 1, hasMore: !!res.next });
                             setLoaded(prev => ({ ...prev, "daily-work": true }));
                           } finally {
                             setLoading(false);
                           }
                        })();
                      }}
                    />
                  )}

                  {screen === "orders" && (
                    <div className="space-y-4">
                      <FilterBar 
                        startDate={ordStartDate} 
                        endDate={ordEndDate} 
                        activePeriod={ordPeriod}
                        onPeriodChange={setOrdPeriod}
                        onFilterChange={(s, e, p) => {
                          setOrdStartDate(s);
                          setOrdEndDate(e);
                          const uid = person.id;
                          (async () => {
                             setLoading(true);
                             try {
                               const res = await fetchAdminSupplyChainOrdersPaginated(uid, 1, 10, s, e, ordStatus);
                               setOrders({ results: res.results, page: 1, hasMore: !!res.next });
                             } finally { setLoading(false); }
                          })();
                        }}
                        extra={
                          <div className="space-y-1">
                            <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1 italic">Status</Label>
                            <Select 
                              value={ordStatus} 
                              onChange={(val) => {
                                setOrdStatus(val);
                                const uid = person.id;
                                (async () => {
                                   setLoading(true);
                                   try {
                                     const res = await fetchAdminSupplyChainOrdersPaginated(uid, 1, 10, ordStartDate, ordEndDate, val);
                                     setOrders({ results: res.results, page: 1, hasMore: !!res.next });
                                   } finally { setLoading(false); }
                                })();
                              }}
                              options={[
                                { value: "", label: "All Status" },
                                { value: "pending", label: "Pending" },
                                { value: "accepted", label: "Accepted" },
                                { value: "picked_up", label: "Picked Up" },
                                { value: "delivered", label: "Delivered" },
                                { value: "cancelled", label: "Cancelled" },
                              ]}
                              className="w-full h-11 text-xs font-bold rounded-2xl"
                            />
                          </div>
                        }
                      />
                      {orders.results.length === 0 && !loadingMore ? (
                        <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed text-center">No delivery orders records found.</p>
                      ) : (
                        <div className="overflow-hidden bg-white dark:bg-white/[0.02] rounded-3xl border border-gray-100 dark:border-white/10 shadow-sm">
                          <Table>
                            <TableHeader className="bg-gray-50/50 dark:bg-gray-800/50">
                              <TableRow>
                                <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Order</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Patient</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Amount</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]">Status</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-black text-gray-500 uppercase tracking-widest text-[10px]"></TableCell>
                              </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                              {orders.results.map((o: AdminSupplyChainOrderPaginatedRow) => (
                                <TableRow key={o.id} className="hover:bg-blue-50/20 transition-colors">
                                  <TableCell className="px-6 py-5">
                                     <p className="text-theme-sm font-black text-blue-600 italic tracking-tighter">{o.order_id}</p>
                                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{o.created_at?.split("T")[0]}</p>
                                  </TableCell>
                                  <TableCell className="px-6 py-5">
                                    <p className="font-black text-gray-900 dark:text-white uppercase tracking-tight text-sm">{o.patient_name || "—"}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest italic">{o.kitchen_name || "—"}</p>
                                  </TableCell>
                                  <TableCell className="px-6 py-5">
                                    <p className="font-black text-gray-900 dark:text-white text-sm">₹{o.final_amount}</p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-widest">Delivery: ₹{o.delivery_charge}</p>
                                  </TableCell>
                                  <TableCell className="px-6 py-5">
                                    <span
                                      className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                        o.status === "delivered" ? "bg-green-50 text-green-600" : o.status === "cancelled" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                                      }`}
                                    >
                                      {o.status}
                                    </span>
                                  </TableCell>
                                  <TableCell className="px-6 py-5">
                                    <button 
                                      onClick={() => {
                                        setSelectedOrderId(o.id);
                                        (async () => {
                                          setLoadingDetail(true);
                                          try {
                                            const detail = await fetchAdminSupplyChainOrderDetail(o.id);
                                            setOrderDetail(detail);
                                          } finally { setLoadingDetail(false); }
                                        })();
                                      }}
                                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
                                    >
                                      <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                    </button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <Sentinel loading={loadingMore} hasMore={orders.hasMore} />
                        </div>
                      )}
                    </div>
                  )}

                  {screen === "earnings" && (
                    <EarningsPanel 
                       earnings={earnings} 
                       loadingMore={loadingMore} 
                       hasMore={earnings.hasMore}
                       startDate={earnStartDate}
                       endDate={earnEndDate}
                       activePeriod={earnPeriod}
                       onPeriodChange={setEarnPeriod}
                       onFilterChange={(s, e) => {
                          setEarnStartDate(s);
                          setEarnEndDate(e);
                          const uid = person.id;
                          (async () => {
                             setLoading(true);
                             try {
                               const res = await fetchAdminSupplyChainEarnings(uid, 1, 10, s, e);
                               setEarnings({
                                 results: res.results,
                                 page: 1,
                                 hasMore: !!res.next,
                                 total_orders: res.total_orders,
                                 total_delivery_earnings: res.total_delivery_earnings,
                               });
                             } finally { setLoading(false); }
                          })();
                       }}
                    />
                  )}

                  {screen === "profile" && <DeliveryProfilePanel profile={deliveryProfile ?? null} />}

                  {screen === "leave" && (
                    <div className="space-y-4">
                      {plannedLeaves.results.length === 0 && !loadingMore ? (
                        <p className="text-sm font-bold text-gray-400 p-12 text-center uppercase tracking-widest italic bg-gray-50/50 rounded-3xl border border-dashed">No time-off records found.</p>
                      ) : (
                        <div className="space-y-4">
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(plannedLeaves.results as Record<string, any>[]).map((L) => (
                              <li key={L.id} className="rounded-3xl border border-gray-100 dark:border-white/10 p-6 bg-white dark:bg-white/[0.02] shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                                <div>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                      {L.leave_type?.replace("_", " ")}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 italic">
                                      ID: #{L.id}
                                    </span>
                                  </div>
                                  <div className="font-black text-gray-900 dark:text-white uppercase tracking-tighter italic text-xl mb-1">
                                    {L.start_date} → {L.end_date}
                                  </div>
                                  {(L.start_time || L.end_time) && (
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                      {L.start_time || "—"} - {L.end_time || "—"}
                                    </div>
                                  )}
                                  {L.notes && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 italic line-clamp-2 mt-2 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                                      "{L.notes}"
                                    </p>
                                  )}
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                                    <FiClock className="size-3" />
                                    <span>Applied: {L.created_on ? new Date(L.created_on).toLocaleString() : "—"}</span>
                                  </div>
                                  <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${L.kitchen_handling_status === 'complete' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {L.kitchen_handling_status || "pending"}
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                          <Sentinel loading={loadingMore} hasMore={plannedLeaves.hasMore} />
                        </div>
                      )}
                    </div>
                  )}

                  {screen === "ratings" && (
                    <RatingsPanel 
                      ratings={deliveryRatings.results}
                      loadingMore={loadingMore}
                      hasMore={deliveryRatings.hasMore}
                      avgRating={avgRating}
                      targetType={fbTargetType}
                      orderType={fbOrderType}
                      onTargetTypeChange={(target) => {
                        setFbTargetType(target);
                        if (target !== "order") setFbOrderType("all");
                        const uid = person.id;
                        (async () => {
                           setLoading(true);
                           try {
                             const res = await fetchAdminSupplyChainDeliveryRatings(
                               uid,
                               1,
                               10,
                               fbStartDate,
                               fbEndDate,
                               target,
                               target === "order" ? fbOrderType : "all",
                               "rating"
                             );
                             setDeliveryRatings({ results: res.results, page: 1, hasMore: !!res.next });
                           } finally { setLoading(false); }
                        })();
                      }}
                      onOrderTypeChange={(orderType) => {
                        setFbOrderType(orderType);
                        const uid = person.id;
                        (async () => {
                           setLoading(true);
                           try {
                             const res = await fetchAdminSupplyChainDeliveryRatings(
                               uid,
                               1,
                               10,
                               fbStartDate,
                               fbEndDate,
                               fbTargetType,
                               fbTargetType === "order" ? orderType : "all",
                               "rating"
                             );
                             setDeliveryRatings({ results: res.results, page: 1, hasMore: !!res.next });
                           } finally { setLoading(false); }
                        })();
                      }}
                    />
                  )}

                  {screen === "issues" && (
                    <IssuesPanel 
                      ratings={deliveryRatings.results} 
                      loadingMore={loadingMore} 
                      hasMore={deliveryRatings.hasMore} 
                      targetType={fbTargetType}
                      orderType={fbOrderType}
                      onTargetTypeChange={(target) => {
                        setFbTargetType(target);
                        if (target !== "order") setFbOrderType("all");
                        const uid = person.id;
                        (async () => {
                           setLoading(true);
                           try {
                             const res = await fetchAdminSupplyChainDeliveryRatings(
                               uid,
                               1,
                               10,
                               fbStartDate,
                               fbEndDate,
                               target,
                               target === "order" ? fbOrderType : "all",
                               "issue"
                             );
                             setDeliveryRatings({ results: res.results, page: 1, hasMore: !!res.next });
                           } finally { setLoading(false); }
                        })();
                      }}
                      onOrderTypeChange={(orderType) => {
                        setFbOrderType(orderType);
                        const uid = person.id;
                        (async () => {
                           setLoading(true);
                           try {
                             const res = await fetchAdminSupplyChainDeliveryRatings(
                               uid,
                               1,
                               10,
                               fbStartDate,
                               fbEndDate,
                               fbTargetType,
                               fbTargetType === "order" ? orderType : "all",
                               "issue"
                             );
                             setDeliveryRatings({ results: res.results, page: 1, hasMore: !!res.next });
                           } finally { setLoading(false); }
                        })();
                      }}
                    />
                  )}

                  {screen === "tickets" && <TicketsPanel tickets={tickets.results} loadingMore={loadingMore} hasMore={tickets.hasMore} />}
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
        <AdminOrderDetailView 
          open={!!selectedOrderId} 
          onClose={() => {
            setSelectedOrderId(null);
            setOrderDetail(null);
          }}
          order={orderDetail}
          loading={loadingDetail}
        />
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
