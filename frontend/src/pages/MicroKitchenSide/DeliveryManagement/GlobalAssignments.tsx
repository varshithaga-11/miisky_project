import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  UserCircle2,
  Clock,
  Plus,
  Users,
  Truck,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";
import PageMeta from "../../../components/common/PageMeta";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  fetchPlanDeliveryAssignments,
  fetchSupplyChainUsers,
  fetchDeliverySlots,
  fetchKitchenAllottedPlans,
  createPlanDeliveryAssignment,
  patchPlanDeliveryAssignment,
  PlanDeliveryAssignment,
  SupplyChainUser,
  DeliverySlot,
  KitchenAllottedPlan,
} from "./api";

/** Slot ids for a row (M2M or legacy single default_slot). */
function rowSlotIds(row: PlanDeliveryAssignment): number[] {
  if (row.delivery_slot_ids?.length) return row.delivery_slot_ids;
  if (row.default_slot != null) return [row.default_slot];
  return [];
}

function slotLabel(slotId: number, slotList: DeliverySlot[]): string {
  return slotList.find((s) => s.id === slotId)?.name ?? `Slot #${slotId}`;
}

function rowSlotsDisplay(row: PlanDeliveryAssignment, slotList: DeliverySlot[]): string {
  const details = row.delivery_slots_details;
  if (details?.length) return details.map((s) => s.name).join(", ");
  const ids = rowSlotIds(row);
  if (!ids.length) return "—";
  return ids.map((id) => slotLabel(id, slotList)).join(", ");
}

function sortedIdsEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

type EditState = {
  personId: string;
  slotIds: number[];
  primarySlotId: string;
  reason: string;
};

type AddPersonSlotRow = {
  key: string;
  personId: string;
  slotIds: number[];
};

function newAddRow(): AddPersonSlotRow {
  return { key: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, personId: "", slotIds: [] };
}

function unionAddSlotIds(rows: AddPersonSlotRow[]): number[] {
  const s = new Set<number>();
  for (const r of rows) for (const id of r.slotIds) s.add(id);
  return [...s].sort((a, b) => a - b);
}

function distinctPerSlotPersonCount(row: PlanDeliveryAssignment): number {
  const m = row.slot_delivery_assignments;
  if (!m?.length) return 0;
  return new Set(m.map((a) => a.delivery_person_id).filter(Boolean)).size;
}

const LOG_REASONS = [
  { value: "reassigned", label: "Admin / kitchen reassignment" },
  { value: "on_leave", label: "On leave (permanent handoff)" },
  { value: "left", label: "Previous person left" },
  { value: "patient_request", label: "Patient request" },
  { value: "performance", label: "Performance" },
  { value: "other", label: "Other" },
];

export default function GlobalAssignmentsPage() {
  const [rows, setRows] = useState<PlanDeliveryAssignment[]>([]);
  const [allottedPlans, setAllottedPlans] = useState<KitchenAllottedPlan[]>([]);
  const [supplyUsers, setSupplyUsers] = useState<SupplyChainUser[]>([]);
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<number, EditState>>({});

  const [addOpen, setAddOpen] = useState(false);
  const [addPlanId, setAddPlanId] = useState("");
  const [addRows, setAddRows] = useState<AddPersonSlotRow[]>(() => [newAddRow()]);
  const [addPrimarySlotId, setAddPrimarySlotId] = useState("");
  const [addNotes, setAddNotes] = useState("");
  const [addSaving, setAddSaving] = useState(false);

  const planIdsWithAssignment = useMemo(() => new Set(rows.map((r) => r.user_diet_plan)), [rows]);

  const activePlansForSelect = useMemo(
    () => allottedPlans.filter((p) => p.status === "active"),
    [allottedPlans]
  );

  /** Slots used per supply-chain user across assignments (union). */
  const slotIdsBySupplyUser = useMemo(() => {
    const m = new Map<number, Set<number>>();
    for (const r of rows) {
      if (r.slot_delivery_assignments && r.slot_delivery_assignments.length > 0) {
        for (const a of r.slot_delivery_assignments) {
          if (a.delivery_person_id == null || a.delivery_slot_id == null) continue;
          const set = m.get(a.delivery_person_id) ?? new Set<number>();
          set.add(a.delivery_slot_id);
          m.set(a.delivery_person_id, set);
        }
        continue;
      }
      if (r.delivery_person == null) continue;
      const set = m.get(r.delivery_person) ?? new Set<number>();
      for (const id of rowSlotIds(r)) set.add(id);
      m.set(r.delivery_person, set);
    }
    return m;
  }, [rows]);

  const addAllSlotIds = useMemo(() => unionAddSlotIds(addRows), [addRows]);

  /** Keep primary slot valid when slot sets change. */
  useEffect(() => {
    const all = unionAddSlotIds(addRows);
    if (all.length === 0) {
      setAddPrimarySlotId("");
      return;
    }
    setAddPrimarySlotId((p) => {
      const pi = p ? parseInt(p, 10) : NaN;
      if (Number.isFinite(pi) && all.includes(pi)) return p;
      return String(all[0]);
    });
  }, [addRows]);

  const load = async () => {
    try {
      setLoading(true);
      const [a, plans, su, sl] = await Promise.all([
        fetchPlanDeliveryAssignments(),
        fetchKitchenAllottedPlans(),
        fetchSupplyChainUsers(),
        fetchDeliverySlots(),
      ]);
      setRows(a);
      setAllottedPlans(plans);
      setSupplyUsers(su);
      setSlots(sl);
    } catch (e) {
      console.error(e);
      toast.error("Could not load delivery data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ensureEdit = (row: PlanDeliveryAssignment) => {
    if (editing[row.id]) return;
    const ids = rowSlotIds(row);
    const primary =
      row.default_slot != null ? String(row.default_slot) : ids.length ? String(ids[0]) : "";
    setEditing((prev) => ({
      ...prev,
      [row.id]: {
        personId: row.delivery_person != null ? String(row.delivery_person) : "",
        slotIds: [...ids],
        primarySlotId: primary,
        reason: "reassigned",
      },
    }));
  };

  const toggleEditSlot = (rowId: number, slotId: number) => {
    setEditing((prev) => {
      const st = prev[rowId];
      if (!st) return prev;
      const has = st.slotIds.includes(slotId);
      let nextIds = has ? st.slotIds.filter((id) => id !== slotId) : [...st.slotIds, slotId];
      let primary = st.primarySlotId;
      if (has && String(slotId) === primary) {
        primary = nextIds.length ? String(nextIds[0]) : "";
      }
      if (!has && !primary && nextIds.length) primary = String(slotId);
      return { ...prev, [rowId]: { ...st, slotIds: nextIds, primarySlotId: primary } };
    });
  };

  const saveRow = async (row: PlanDeliveryAssignment) => {
    const st = editing[row.id];
    if (!st) return;
    if (st.slotIds.length === 0) {
      toast.error("Select at least one delivery slot.");
      return;
    }
    const primaryNum = st.primarySlotId ? parseInt(st.primarySlotId, 10) : NaN;
    if (!Number.isFinite(primaryNum) || !st.slotIds.includes(primaryNum)) {
      toast.error("Choose a primary slot from the selected slots.");
      return;
    }
    try {
      const payload: Parameters<typeof patchPlanDeliveryAssignment>[1] = {};
      const pid = st.personId ? parseInt(st.personId, 10) : undefined;
      const origIds = rowSlotIds(row);
      if (pid !== undefined && pid !== row.delivery_person) {
        payload.delivery_person_id = pid;
        payload.reason = st.reason;
      }
      if (!sortedIdsEqual(st.slotIds, origIds)) {
        payload.delivery_slot_ids = st.slotIds;
      }
      if (primaryNum !== (row.default_slot ?? undefined)) {
        payload.primary_slot_id = primaryNum;
      }
      if (Object.keys(payload).length === 0) {
        toast.info("No changes to save.");
        return;
      }
      const updated = await patchPlanDeliveryAssignment(row.id, payload);
      setRows((prev) => prev.map((r) => (r.id === row.id ? updated : r)));
      setEditing((prev) => {
        const next = { ...prev };
        delete next[row.id];
        return next;
      });
      toast.success("Saved.");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.detail || "Save failed.");
    }
  };

  /** A slot can belong to only one row; checking it in a row claims it from others. */
  const toggleAddRowSlot = (rowKey: string, slotId: number) => {
    setAddRows((prev) => {
      const target = prev.find((r) => r.key === rowKey);
      if (!target) return prev;
      const has = target.slotIds.includes(slotId);
      return prev.map((r) => {
        if (r.key === rowKey) {
          const nextIds = has ? r.slotIds.filter((id) => id !== slotId) : [...r.slotIds, slotId];
          return { ...r, slotIds: nextIds };
        }
        if (!has && r.slotIds.includes(slotId)) {
          return { ...r, slotIds: r.slotIds.filter((id) => id !== slotId) };
        }
        return r;
      });
    });
  };

  const submitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const groups = addRows
      .filter((r) => r.personId && r.slotIds.length > 0)
      .map((r) => ({
        delivery_person_id: parseInt(r.personId, 10),
        delivery_slot_ids: r.slotIds,
      }));
    if (!addPlanId || groups.length === 0) {
      toast.error("Choose a plan and add at least one supply chain user with one or more slots.");
      return;
    }
    if (addAllSlotIds.length === 0) {
      toast.error("Select at least one delivery slot across all rows.");
      return;
    }
    const prim = addPrimarySlotId ? parseInt(addPrimarySlotId, 10) : addAllSlotIds[0];
    if (!addAllSlotIds.includes(prim)) {
      toast.error("Primary slot must be one of the selected slots.");
      return;
    }
    setAddSaving(true);
    try {
      const created = await createPlanDeliveryAssignment({
        user_diet_plan_id: parseInt(addPlanId, 10),
        slot_assignments: groups,
        primary_slot_id: prim,
        notes: addNotes.trim() || null,
      });
      setRows((prev) => {
        const others = prev.filter((r) => r.user_diet_plan !== created.user_diet_plan);
        return [created, ...others];
      });
      toast.success("Delivery assignment saved.");
      setAddOpen(false);
      setAddPlanId("");
      setAddRows([newAddRow()]);
      setAddPrimarySlotId("");
      setAddNotes("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Could not create assignment.");
    } finally {
      setAddSaving(false);
    }
  };

  const patientName = (p: KitchenAllottedPlan) => {
    const d = p.patient_details;
    if (!d) return "—";
    return `${d.first_name || ""} ${d.last_name || ""}`.trim() || "—";
  };

  const nutritionistName = (p: KitchenAllottedPlan) => {
    const n = p.nutritionist_details;
    if (!n) return "—";
    return `${n.first_name || ""} ${n.last_name || ""}`.trim() || "—";
  };

  return (
    <>
      <PageMeta
        title="Global delivery assignment | Micro Kitchen"
        description="Map supply chain delivery staff and delivery slots to patient diet plans"
      />
      <PageBreadcrumb pageTitle="Global delivery assignment" />
      <ToastContainer position="top-right" />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-4 lg:px-8 py-8 max-w-6xl mx-auto space-y-8">
        <div className="flex flex-wrap items-center gap-4">
          <Link
            to="/microkitchen/delivery"
            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Delivery hub
          </Link>
        </div>

        <header className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Global delivery assignment</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
              Map <strong>supply chain</strong> staff to each active plan. You can assign different people to different
              delivery slots, or one person to several slots (set a primary slot for new meals).{" "}
              <Link className="text-indigo-600 underline" to="/microkitchen/delivery/daily">
                Daily reassignment
              </Link>{" "}
              is for a single meal only.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setAddPlanId("");
              setAddRows([newAddRow()]);
              setAddPrimarySlotId("");
              setAddNotes("");
              setAddOpen(true);
            }}
            className="inline-flex items-center gap-2 shrink-0 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add assignment
          </button>
        </header>

        {loading ? (
          <div className="py-20 text-center text-gray-500">Loading…</div>
        ) : (
          <>
            <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Patients allotted to your kitchen</h2>
                <span className="text-xs text-gray-500">(via nutritionist / diet plan)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-800">
                      <th className="px-4 py-3 font-medium">Patient</th>
                      <th className="px-4 py-3 font-medium">Nutritionist</th>
                      <th className="px-4 py-3 font-medium">Plan</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Dates</th>
                      <th className="px-4 py-3 font-medium">Assignment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allottedPlans.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                          No diet plans linked to this kitchen yet.
                        </td>
                      </tr>
                    ) : (
                      allottedPlans.map((p) => {
                        const has = planIdsWithAssignment.has(p.id);
                        return (
                          <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/80">
                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{patientName(p)}</td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{nutritionistName(p)}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {p.diet_plan_details?.plan_name || "—"}
                            </td>
                            <td className="px-4 py-3 capitalize">{p.status.replace("_", " ")}</td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                              {p.start_date && p.end_date ? `${p.start_date} → ${p.end_date}` : "—"}
                            </td>
                            <td className="px-4 py-3">
                              {has ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Mapped
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 text-xs">
                                  <CircleDashed className="w-3.5 h-3.5" /> Not set
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-violet-500" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Supply chain users</h2>
                <span className="text-xs text-gray-500">(map as delivery person)</span>
              </div>
              {supplyUsers.length === 0 ? (
                <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                  No supply chain users found. Create users with role &quot;Supply Chain&quot; in admin, then map them
                  here.
                </p>
              ) : (
                <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {supplyUsers.map((u) => {
                    const idSet = slotIdsBySupplyUser.get(u.id);
                    const slotSummary =
                      idSet && idSet.size > 0
                        ? [...idSet]
                            .sort((a, b) => a - b)
                            .map((id) => slotLabel(id, slots))
                            .join(", ")
                        : null;
                    return (
                      <li
                        key={u.id}
                        className="rounded-xl border border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50/80 dark:bg-gray-800/50"
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {u.first_name} {u.last_name}
                        </p>
                        {slotSummary && (
                          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 flex items-start gap-1">
                            <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{slotSummary}</span>
                          </p>
                        )}
                        {u.mobile && <p className="text-xs text-gray-500 mt-1">{u.mobile}</p>}
                        {u.email && <p className="text-xs text-gray-500 truncate">{u.email}</p>}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4">
                Current global assignments
              </h2>
              {rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center text-gray-500">
                  No plan delivery assignments yet. Use <strong>Add assignment</strong> for an active plan, or ask admin
                  to verify payment with delivery details.
                </div>
              ) : (
                <div className="space-y-4">
                  {rows.map((row) => {
                    const st = editing[row.id];
                    const patient =
                      row.patient_details &&
                      `${row.patient_details.first_name || ""} ${row.patient_details.last_name || ""}`.trim();
                    return (
                      <div
                        key={row.id}
                        className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Patient</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{patient || "—"}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              Plan #{row.user_diet_plan}
                              {row.user_diet_plan_details?.start_date && row.user_diet_plan_details?.end_date && (
                                <>
                                  {" "}
                                  · {row.user_diet_plan_details.start_date} → {row.user_diet_plan_details.end_date}
                                </>
                              )}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => ensureEdit(row)}
                              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                              Edit
                            </button>
                            {st && (
                              <button
                                type="button"
                                onClick={() => saveRow(row)}
                                className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                              >
                                <Save className="w-4 h-4" />
                                Save
                              </button>
                            )}
                          </div>
                        </div>

                        {st && distinctPerSlotPersonCount(row) > 1 && (
                          <p className="mt-3 text-xs text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2 border border-amber-200/80 dark:border-amber-800">
                            Saving here assigns one delivery person to every selected slot — the current per-slot
                            mapping will be replaced.
                          </p>
                        )}

                        <div className="mt-4 grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                              <UserCircle2 className="w-3.5 h-3.5" />
                              Supply chain (delivery)
                            </label>
                            {st ? (
                              <>
                                <select
                                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                                  value={st.personId}
                                  onChange={(e) =>
                                    setEditing((prev) => ({
                                      ...prev,
                                      [row.id]: { ...st, personId: e.target.value },
                                    }))
                                  }
                                >
                                  <option value="">Select…</option>
                                  {supplyUsers.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.first_name} {u.last_name}
                                      {u.mobile ? ` · ${u.mobile}` : ""}
                                    </option>
                                  ))}
                                </select>
                                {st.personId && parseInt(st.personId, 10) !== row.delivery_person && (
                                  <div className="mt-2">
                                    <label className="text-xs text-gray-500">Reason (audit log)</label>
                                    <select
                                      className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                                      value={st.reason}
                                      onChange={(e) =>
                                        setEditing((prev) => ({
                                          ...prev,
                                          [row.id]: { ...st, reason: e.target.value },
                                        }))
                                      }
                                    >
                                      {LOG_REASONS.map((r) => (
                                        <option key={r.value} value={r.value}>
                                          {r.label}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-gray-800 dark:text-gray-200">
                                {row.delivery_person_details
                                  ? `${row.delivery_person_details.first_name || ""} ${row.delivery_person_details.last_name || ""}`
                                  : "—"}
                              </p>
                            )}
                          </div>
                          <div className="sm:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                              <Clock className="w-3.5 h-3.5" />
                              Delivery slots (primary marked)
                            </label>
                            {st ? (
                              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-3">
                                <div className="flex flex-wrap gap-3">
                                  {slots.map((s) => (
                                    <label
                                      key={s.id}
                                      className="inline-flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        className="rounded border-gray-300"
                                        checked={st.slotIds.includes(s.id)}
                                        onChange={() => toggleEditSlot(row.id, s.id)}
                                      />
                                      <span>{s.name}</span>
                                    </label>
                                  ))}
                                </div>
                                {st.slotIds.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-1">Primary (default for new meals)</p>
                                    <div className="flex flex-wrap gap-3">
                                      {st.slotIds.map((sid) => {
                                        const s = slots.find((x) => x.id === sid);
                                        return (
                                          <label
                                            key={sid}
                                            className="inline-flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                                          >
                                            <input
                                              type="radio"
                                              name={`primary-${row.id}`}
                                              className="border-gray-300"
                                              checked={st.primarySlotId === String(sid)}
                                              onChange={() =>
                                                setEditing((prev) => {
                                                  const cur = prev[row.id];
                                                  if (!cur) return prev;
                                                  return {
                                                    ...prev,
                                                    [row.id]: { ...cur, primarySlotId: String(sid) },
                                                  };
                                                })
                                              }
                                            />
                                            <span>{s?.name ?? sid}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-800 dark:text-gray-200">
                                {rowSlotsDisplay(row, slots)}
                                {rowSlotIds(row).length > 1 && row.default_slot != null && (
                                  <span className="block text-xs text-gray-500 mt-1">
                                    Primary: {slotLabel(row.default_slot, slots)}
                                  </span>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        {!st && row.slot_delivery_assignments && row.slot_delivery_assignments.length > 0 && (
                          <div className="mt-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/40 p-4">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                              Who delivers which slot
                            </p>
                            <ul className="space-y-1.5 text-sm">
                              {row.slot_delivery_assignments.map((a) => (
                                <li
                                  key={a.delivery_slot_id}
                                  className="flex justify-between gap-4 text-gray-800 dark:text-gray-200"
                                >
                                  <span>{a.delivery_slot_details?.name ?? slotLabel(a.delivery_slot_id, slots)}</span>
                                  <span className="font-medium text-right shrink-0">
                                    {a.delivery_person_details
                                      ? `${a.delivery_person_details.first_name || ""} ${a.delivery_person_details.last_name || ""}`.trim()
                                      : "—"}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {addOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-200 dark:border-gray-800"
              role="dialog"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Add global assignment</h3>
              <p className="text-sm text-gray-500 mb-4">
                Choose an <strong>active</strong> plan. Add one or more rows: each person can cover one or more slots. A
                slot can only belong to one person. Pick the <strong>primary</strong> slot for new meal defaults.
              </p>
              <form onSubmit={submitAdd} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Diet plan (patient)</label>
                  <select
                    required
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    value={addPlanId}
                    onChange={(e) => setAddPlanId(e.target.value)}
                  >
                    <option value="">Select plan…</option>
                    {activePlansForSelect.map((p) => (
                      <option key={p.id} value={p.id}>
                        {patientName(p)} — {p.diet_plan_details?.plan_name || `Plan #${p.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-medium text-gray-500">Delivery people &amp; slots</label>
                  {addRows.map((ar, idx) => (
                    <div
                      key={ar.key}
                      className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 space-y-2 bg-gray-50/50 dark:bg-gray-800/30"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Person {idx + 1}
                        </span>
                        {addRows.length > 1 && (
                          <button
                            type="button"
                            className="text-xs text-red-600 dark:text-red-400 hover:underline"
                            onClick={() => setAddRows((prev) => prev.filter((r) => r.key !== ar.key))}
                          >
                            Remove row
                          </button>
                        )}
                      </div>
                      <select
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                        value={ar.personId}
                        onChange={(e) =>
                          setAddRows((prev) =>
                            prev.map((r) => (r.key === ar.key ? { ...r, personId: e.target.value } : r))
                          )
                        }
                      >
                        <option value="">Select supply chain user…</option>
                        {supplyUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.first_name} {u.last_name}
                          </option>
                        ))}
                      </select>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((s) => (
                          <label
                            key={s.id}
                            className="inline-flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="rounded border-gray-300"
                              checked={ar.slotIds.includes(s.id)}
                              onChange={() => toggleAddRowSlot(ar.key, s.id)}
                            />
                            <span>{s.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAddRows((prev) => [...prev, newAddRow()])}
                    className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                  >
                    + Add another delivery person
                  </button>
                </div>

                {addAllSlotIds.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-2">Primary slot</label>
                    <p className="text-xs text-gray-500 mb-2">Used as the default for new meal deliveries.</p>
                    <div className="flex flex-wrap gap-3">
                      {addAllSlotIds.map((sid) => {
                        const s = slots.find((x) => x.id === sid);
                        return (
                          <label
                            key={sid}
                            className="inline-flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="add-primary-slot"
                              className="border-gray-300"
                              checked={addPrimarySlotId === String(sid)}
                              onChange={() => setAddPrimarySlotId(String(sid))}
                            />
                            <span>{s?.name ?? sid}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes (optional)</label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm min-h-[72px]"
                    value={addNotes}
                    onChange={(e) => setAddNotes(e.target.value)}
                    placeholder="Internal notes"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAddOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addSaving}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-50"
                  >
                    {addSaving ? "Saving…" : "Save assignment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
