import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/** Supply chain users — only these can be mapped as delivery persons (backend enforced). */
export interface SupplyChainUser {
  id: number;
  first_name: string;
  last_name: string;
  mobile: string;
  email?: string;
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

export const fetchSupplyChainUsers = async (): Promise<SupplyChainUser[]> => {
  const url = createApiUrl("api/supply-chain-users/");
  const res = await axios.get(url, { headers: await getAuthHeaders() });
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
  delivery_person_id: number;
  /** Prefer: multiple slots per delivery person */
  delivery_slot_ids: number[];
  /** Must be one of delivery_slot_ids (defaults to first if omitted) */
  primary_slot_id?: number;
  /** Legacy single slot (same as delivery_slot_ids: [id]) */
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
