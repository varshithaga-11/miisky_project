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
}

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
    limit: 100,
    page: 1,
  });
  return unwrapResults(data);
};

/** PatientHealthReport model */
export const fetchHealthReportsForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/patienthealthreport/", {
    user: patientUserId,
    limit: 200,
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
    limit: 100,
    page: 1,
  });
  return unwrapResults(data);
};

/** UserDietPlan model */
export const fetchUserDietPlansForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/userdietplan/", {
    user: patientUserId,
    limit: 100,
    page: 1,
  });
  return unwrapResults(data);
};

/** UserMeal model — food + packaging for this patient */
export const fetchUserMealsForPatient = async (patientUserId: number): Promise<unknown[]> => {
  const data = await getJson<unknown>("api/usermeal/", {
    user: patientUserId,
    limit: 500,
    page: 1,
  });
  return unwrapResults(data);
};

/** Optional: aggregated admin endpoint (try `adminpatients` then `admin-patients`). */
export const fetchAdminPatientListFallback = async (
  page: number,
  limit: number,
  search?: string
): Promise<PaginatedResponse<PatientUserRow>> => {
  const params: Record<string, string | number> = { page, limit };
  if (search?.trim()) params.search = search.trim();
  try {
    return await getJson<PaginatedResponse<PatientUserRow>>("api/adminpatients/", params);
  } catch {
    return getJson<PaginatedResponse<PatientUserRow>>("api/admin-patients/", params);
  }
};
