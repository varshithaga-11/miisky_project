import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

declare const __API_URL__: string;

const apiBase = (typeof __API_URL__ !== "undefined" ? __API_URL__ : "").replace(/\/$/, "");

/** Turn Django FileField paths into absolute URLs for links and images. */
export function resolveMediaUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (String(path).startsWith("http")) return String(path);
  const p = String(path).startsWith("/") ? String(path) : `/${path}`;
  return `${apiBase}${p}`;
}

export interface PaginatedResponse<T> {
  count: number;
  next: number | null;
  previous: number | null;
  current_page: number;
  total_pages: number;
  results: T[];
}

/** User row from `api/usermanagement/` (same shape as admin user management). */
export interface PatientUserRow {
  id: number;
  username: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  role?: string;
  mobile?: string | null;
  is_active?: boolean;
  is_patient_mapped?: boolean;
  created_on?: string | null;
  city?: number | null;
  state?: number | null;
  country?: number | null;
  address?: string | null;
  active_plan_title?: string | null;
  active_plan_status?: string | null;
  active_kitchen_name?: string | null;
  active_nutritionist_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export type MicroKitchenForDistance = {
  id: number;
  brand_name: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status?: string;
};

export interface MicroKitchenDistanceRow {
  id: number;
  user_id: number;
  brand_name: string;
  latitude: number | null;
  longitude: number | null;
  distance_km: number | null;
  city: string | null;
  status: string;
}

/** 
 * Fetch distances from a specific patient to all approved micro-kitchens.
 * Calculated entirely on backend; no pagination.
 */
export const fetchMicroKitchenDistancesForPatient = async (
  patientId: number
): Promise<MicroKitchenDistanceRow[]> => {
  return getJson<MicroKitchenDistanceRow[]>(`api/admin/patient-microkitchen-distances/${patientId}/`);
};

async function getJson<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const url = createApiUrl(path);
  const response = await axios.get<T>(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return response.data;
}

/** Unwrap DRF paginated `{ results: [] }` or return array as-is. */
export function unwrapResults<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && "results" in data && Array.isArray((data as PaginatedResponse<T>).results)) {
    return (data as PaginatedResponse<T>).results;
  }
  return [];
}

/**
 * Patient directory: uses existing UserManagement API with role=patient
 * (avoids relying on admin-patients-only routes).
 */
export const fetchPatientUserList = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PaginatedResponse<PatientUserRow>> => {
  const params: Record<string, string | number> = { page, limit, role: "patient" };
  if (search?.trim()) params.search = search.trim();
  return getJson<PaginatedResponse<PatientUserRow>>("api/usermanagement/", params);
};

/** Single user — UserRegister / usermanagement model */
export const fetchUserById = async (userId: number): Promise<PatientUserRow> => {
  return getJson<PatientUserRow>(`api/usermanagement/${userId}/`);
};

/** UserQuestionnaire model — filter by patient user id (admin). */
export const fetchQuestionnairesForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/userquestionnaire/", {
    user: patientUserId,
  });
  return unwrapResults(data);
};

/** PatientHealthReport model */
export const fetchHealthReportsForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/patienthealthreport/", {
    user: patientUserId,
    limit: 50,
    page: 1,
  });
  return unwrapResults(data);
};

/** UserNutritionistMapping model — mapping row(s) for this patient */
export const fetchNutritionistMappingsForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/usernutritionistmapping/", {
    user: patientUserId,
    limit: 50,
    page: 1,
  });
  return unwrapResults(data);
};

/** Nutritionist reassignment history */
export const fetchNutritionistHistoryForPatient = async (patientUserId: number): Promise<unknown[]> => {
  return getJson<unknown[]>("api/usernutritionistmapping/history/", {
    user: patientUserId,
  });
};

/** Micro Kitchen reassignment history */
export const fetchKitchenHistoryForPatient = async (patientUserId: number): Promise<unknown[]> => {
  return getJson<unknown[]>("api/userdietplan/kitchen-history/", {
    user: patientUserId,
  });
};

/** NutritionistProfile model — pass nutritionist's UserRegister id as `user` */
export const fetchNutritionistProfileByUserId = async (nutritionistUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/nutritionistprofile/", {
    user: nutritionistUserId,
    limit: 10,
    page: 1,
  });
  return unwrapResults(data);
};

/** NutritionistReview model */
export const fetchNutritionistReviewsForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/nutritionistreview/", {
    user: patientUserId,
    limit: 30,
    page: 1,
  });
  return unwrapResults(data);
};

/** UserDietPlan model (Paginated via ModelViewSet) */
export const fetchUserDietPlansForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/userdietplan/", {
    user: patientUserId,
    limit: 30,
    page: 1,
  });
  return unwrapResults(data);
};

/** Diet Plans model - Admin specific unpaginated with reassignment logs */
export const fetchPatientDietPlansNoPaginate = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/admin-patient-dietplans-nopaginate/", {
    user: patientUserId,
  });
  return unwrapResults(data);
};

/** UserMeal model — food + packaging for this patient, optionally filtered by month and year */
export const fetchUserMealsForPatient = async (
  patientUserId: number,
  month?: number,
  year?: number
): Promise<unknown[]> => {
  const params: Record<string, string | number> = {
    user: patientUserId,
  };
  if (month && year) {
    params.month = month;
    params.year = year;
  } else {
    params.limit = 60;
    params.page = 1;
  }

  const data = await getJson<unknown>("api/usermeal/", params);
  return unwrapResults(data);
};

/** Optional: aggregated admin endpoint (try `adminpatients` then `admin-patients`). */
export const fetchAdminPatientList = async (
  page: number,
  limit: number,
  search?: string
): Promise<PaginatedResponse<PatientUserRow>> => {
  const params: Record<string, string | number> = { page, limit };
  if (search?.trim()) params.search = search.trim();
  return getJson<PaginatedResponse<PatientUserRow>>("api/admin-patients/", params);
};

/** Diet plans payment history — filtered by patient user ID */
export const fetchDietPlanPaymentsForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/userdietplan/", {
    user: patientUserId,
  });
  const plans = unwrapResults(data);
  // Transform to payment entries similar to Transaction interface
  return plans
    .filter((p: any) => p.amount_paid || p.payment_status)
    .map((p: any) => ({
      id: p.id,
      date: p.payment_uploaded_on || p.created_on,
      amount: p.amount_paid || 0,
      status: p.payment_status || "—",
      type: "Diet Plan Status",
      reference: p.transaction_id || "—",
      details: p.diet_plan_details?.title || "Plan Purchase",
      screenshot: p.payment_screenshot,
      originalData: p,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/** Order payment history — filtered by patient user ID, supports pagination */
export const fetchOrderPaymentsForUserAdmin = async (
  patientUserId: number,
  page: number = 1,
  limit: number = 10,
  filters?: { search?: string; start_date?: string; end_date?: string }
): Promise<{ count: number; results: any[]; next: string | null }> => {
  const url = createApiUrl("api/admin/patient-order-payments-summary/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: {
      user: patientUserId,
      page,
      limit,
      ...filters,
    },
  });
  const data = res.data;
  const results = (data.results || []).map((o: any) => ({
    id: o.id,
    date: o.created_at,
    amount: o.final_amount || o.total_amount || 0,
    status: o.status || "—",
    type: "Meal Order",
    reference: `#${o.id}`,
    details: o.kitchen_details?.brand_name || "Food Order",
    // We no longer send the full order object in originalData for the summary list
    originalData: { id: o.id }, 
  }));
  return { ...data, results };
};

/** Fetch detailed order payment info (full payload) */
export const fetchOrderPaymentDetailsAdmin = async (orderId: number): Promise<any> => {
  const url = createApiUrl(`api/admin/patient-order-payments-details/${orderId}/`);
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
  });
  return res.data;
};

/** Meeting requests for patient (No Pagination) */
export const fetchMeetingsForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/admin-patient-meetings-nopaginate/", {
    patient: patientUserId,
  });
  return unwrapResults(data);
};

/** Support tickets for patient (No Pagination) */
export const fetchSupportTicketsForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/admin-patient-tickets-nopaginate/", {
    user: patientUserId,
  });
  return unwrapResults(data);
};

/** Nutritionist ratings given by patient (No Pagination) */
export const fetchNutritionistRatingsForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/admin-patient-nutritionist-ratings-nopaginate/", {
    patient: patientUserId,
  });
  return unwrapResults(data);
};

/** Kitchen ratings given by patient (No Pagination) */
export const fetchKitchenRatingsForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/admin-patient-kitchen-ratings-nopaginate/", {
    user: patientUserId,
  });
  return unwrapResults(data);
};
