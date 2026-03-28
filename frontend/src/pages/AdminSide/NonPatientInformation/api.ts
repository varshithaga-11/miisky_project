import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { PaginatedResponses, UserRegister } from "../UserManagement/api";

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
