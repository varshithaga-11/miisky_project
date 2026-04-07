import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/** Supply chain users — only these can be mapped as delivery persons (backend enforced). */
export interface SupplyChainUser {
  id: number;
  first_name: string;
  last_name: string;
  mobile: string;
  email?: string;
  team_member_id?: number;
  team_role?: "primary" | "backup" | "temporary";
  is_active?: boolean;
  zone_name?: string | null;
  pincode?: string | null;
}

export interface KitchenAllottedPlan {
  id: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  patient_details?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  diet_plan_details?: { plan_name: string };
  nutritionist_details?: { id: number; first_name: string; last_name: string; email: string } | null;
}

export interface DeliverySlot {
  id: number;
  name: string;
  start_time: string | null;
  end_time: string | null;
  micro_kitchen: number | null;
}

/** Per-slot delivery person when different staff cover different time windows. */
export interface SlotDeliveryAssignmentRow {
  delivery_slot_id: number;
  delivery_slot_details?: DeliverySlot;
  delivery_person_id: number | null;
  delivery_person_details?: { id: number; first_name: string; last_name: string; username?: string };
}

export interface PlanDeliveryAssignment {
  id: number;
  user_diet_plan: number;
  user_diet_plan_details?: {
    id: number;
    status: string;
    start_date: string | null;
    end_date: string | null;
  };
  delivery_person: number | null;
  delivery_person_details?: { id: number; first_name: string; last_name: string; username?: string };
  default_slot: number | null;
  default_slot_details?: DeliverySlot;
  /** All slots this delivery person covers for the plan */
  delivery_slot_ids?: number[];
  delivery_slots_details?: DeliverySlot[];
  /** When set, each slot maps to a delivery person (can differ per slot). */
  slot_delivery_assignments?: SlotDeliveryAssignmentRow[];
  patient_details?: { id: number; first_name: string; last_name: string };
  is_active: boolean;
  assigned_on: string;
  notes: string | null;
}

export interface MealDeliveryAssignment {
  id: number;
  user_meal: number;
  user_meal_details?: {
    id: number;
    meal_date: string;
    meal_type: string | null;
    patient_name: string;
    food_name: string | null;
  };
  delivery_person: number | null;
  delivery_person_details?: { id: number; first_name: string; last_name: string };
  delivery_slot: number | null;
  status: string;
  scheduled_date: string;
  reassignment_reason: string | null;
}

export interface SupplyChainLeave {
  id: number;
  user: number;
  user_details?: { id: number; first_name: string; last_name: string; username?: string };
  leave_type: "full_day" | "partial";
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  notes: string | null;
}

/** @param allSupplyChainUsers For micro_kitchen only: full supply_chain pool (not just current team). */
export const fetchSupplyChainUsers = async (options?: {
  allSupplyChainUsers?: boolean;
}): Promise<SupplyChainUser[]> => {
  const url = createApiUrl("api/supply-chain-users/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: options?.allSupplyChainUsers ? { all: "1" } : undefined,
  });
  return Array.isArray(res.data) ? res.data : [];
};

/** Patients/plans allotted to this micro kitchen (via nutritionist workflow). */
export const fetchKitchenAllottedPlans = async (): Promise<KitchenAllottedPlan[]> => {
  const url = createApiUrl("api/micro-kitchen-patients/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { limit: 500, page: 1 },
  });
  const data = res.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const fetchDeliverySlots = async (): Promise<DeliverySlot[]> => {
  const url = createApiUrl("api/delivery-slot/");
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const data = res.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const fetchPlanDeliveryAssignments = async (): Promise<PlanDeliveryAssignment[]> => {
  const url = createApiUrl("api/plandeliveryassignment/");
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const data = res.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const createPlanDeliveryAssignment = async (payload: {
  user_diet_plan_id: number;
  /** Different person per slot group (preferred when multiple people cover different slots). */
  slot_assignments?: Array<{ delivery_person_id: number; delivery_slot_ids: number[] }>;
  /** Legacy: one person for all listed slots */
  delivery_person_id?: number;
  delivery_slot_ids?: number[];
  primary_slot_id?: number;
  default_slot_id?: number;
  notes?: string | null;
}): Promise<PlanDeliveryAssignment> => {
  const url = createApiUrl("api/plandeliveryassignment/");
  const res = await axios.post(url, payload, { headers: await getAuthHeaders() });
  return res.data;
};

export const patchPlanDeliveryAssignment = async (
  id: number,
  payload: {
    delivery_person_id?: number;
    default_slot_id?: number;
    delivery_slot_ids?: number[];
    primary_slot_id?: number;
    slot_assignments?: Array<{ delivery_person_id: number; delivery_slot_ids: number[] }>;
    notes?: string | null;
    effective_from?: string;
    reason?: string;
    change_notes?: string | null;
  }
): Promise<PlanDeliveryAssignment> => {
  const url = createApiUrl(`api/plandeliveryassignment/${id}/`);
  const res = await axios.patch(url, payload, { headers: await getAuthHeaders() });
  return res.data;
};

export const fetchMealDeliveryAssignments = async (mealDate?: string): Promise<MealDeliveryAssignment[]> => {
  const url = mealDate
    ? createApiUrl(`api/mealdeliveryassignment/?meal_date=${encodeURIComponent(mealDate)}`)
    : createApiUrl("api/mealdeliveryassignment/");
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const data = res.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const reassignMealDelivery = async (
  assignmentId: number,
  newDeliveryPersonId: number,
  reason?: string
): Promise<MealDeliveryAssignment> => {
  const url = createApiUrl(`api/mealdeliveryassignment/${assignmentId}/reassign/`);
  const res = await axios.post(
    url,
    { new_delivery_person_id: newDeliveryPersonId, reason: reason || "On leave" },
    { headers: await getAuthHeaders() }
  );
  return res.data;
};

export const fetchSupplyChainLeaves = async (): Promise<SupplyChainLeave[]> => {
  const url = createApiUrl("api/supply-chain-leave/");
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const data = res.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export interface MicroKitchenTeamMember {
  id: number;
  micro_kitchen: number;
  delivery_person: number;
  delivery_person_details?: {
    id: number;
    first_name: string;
    last_name: string;
    username?: string;
    email?: string;
    mobile?: string;
  };
  role: "primary" | "backup" | "temporary";
  is_active: boolean;
  zone_name: string | null;
  pincode: string | null;
  assigned_on: string;
}

export const fetchMicroKitchenDeliveryTeam = async (): Promise<MicroKitchenTeamMember[]> => {
  const url = createApiUrl("api/micro-kitchen-delivery-team/");
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const data = res.data;
  return Array.isArray(data) ? data : data?.results ?? [];
};

export const createMicroKitchenDeliveryTeamMember = async (payload: {
  delivery_person: number;
  /** Sent when known so validation always has a kitchen id; server still enforces permissions. */
  micro_kitchen?: number;
  role: "primary" | "backup" | "temporary";
  is_active?: boolean;
  zone_name?: string | null;
  pincode?: string | null;
}): Promise<MicroKitchenTeamMember> => {
  const url = createApiUrl("api/micro-kitchen-delivery-team/");
  const res = await axios.post(url, payload, { headers: await getAuthHeaders() });
  return res.data;
};

export const patchMicroKitchenDeliveryTeamMember = async (
  id: number,
  payload: Partial<{
    role: "primary" | "backup" | "temporary";
    is_active: boolean;
    zone_name: string | null;
    pincode: string | null;
  }>
): Promise<MicroKitchenTeamMember> => {
  const url = createApiUrl(`api/micro-kitchen-delivery-team/${id}/`);
  const res = await axios.patch(url, payload, { headers: await getAuthHeaders() });
  return res.data;
};

export const deleteMicroKitchenDeliveryTeamMember = async (id: number): Promise<void> => {
  const url = createApiUrl(`api/micro-kitchen-delivery-team/${id}/`);
  await axios.delete(url, { headers: await getAuthHeaders() });
};
