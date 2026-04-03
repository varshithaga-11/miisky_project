import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { PaginatedResponses, UserRegister } from "../UserManagement/api";
import { getUserById } from "../UserManagement/api";

export { getUserById };

/**
 * Paginated list of users with role `non_patient` (public / retail food customers).
 * Uses `api/usermanagement/?role=non_patient` (server-side filter).
 */
export async function fetchNonPatientUserList(
  page = 1,
  limit = 10,
  search?: string
): Promise<PaginatedResponses<UserRegister>> {
  const url = createApiUrl("api/usermanagement/");
  const params: Record<string, string | number> = {
    page,
    limit,
    role: "non_patient",
  };
  if (search?.trim()) params.search = search.trim();
  const res = await axios.get<PaginatedResponses<UserRegister>>(url, {
    headers: await getAuthHeaders(),
    params,
  });
  return res.data;
}

export type { UserRegister };

/** Support tickets for any user (No Pagination) */
export const fetchSupportTicketsForUser = async (userId: number): Promise<unknown[]> => {
  const url = createApiUrl("api/admin-patient-tickets-nopaginate/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { user: userId },
  });
  return res.data;
};

/** Kitchen ratings given by any user (No Pagination) */
export const fetchKitchenRatingsForUser = async (userId: number): Promise<unknown[]> => {
  const url = createApiUrl("api/admin-patient-kitchen-ratings-nopaginate/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { user: userId },
  });
  return res.data;
};

/** Order payments for any user (No Pagination) */
export const fetchOrderPaymentsForUser = async (userId: number): Promise<unknown[]> => {
  const url = createApiUrl("api/admin-order-payments-nopaginate/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { user: userId },
  });
  // Transform to match PaymentEntry shape if needed, or return as is
  return (res.data as any[]).map((o: any) => ({
    id: o.id,
    date: o.created_at,
    amount: o.final_amount || o.total_amount || 0,
    status: o.status || "—",
    type: "Meal Order",
    reference: `#${o.id}`,
    details: o.kitchen_details?.brand_name || "Food Order",
    originalData: o,
  }));
};

/** Health questionnaires for any user (No Pagination) */
export const fetchQuestionnairesForUser = async (userId: number): Promise<unknown[]> => {
  const url = createApiUrl("api/userquestionnaire/");
  const res = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { user: userId },
  });
  // DRF returns { results: [] } if paginated, or [] if not.
  if (Array.isArray(res.data)) return res.data;
  if (res.data && typeof res.data === "object" && "results" in res.data) {
    return (res.data as any).results;
  }
  return [];
};
