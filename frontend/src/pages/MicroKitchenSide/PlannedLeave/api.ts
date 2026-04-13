import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import { SupplyChainLeave } from "../../SupplyChain/api";
import type { OrderDatePeriod } from "../../NonPatient/orderapi";

export type PaginatedTeamLeaves = {
  results: SupplyChainLeave[];
  count: number;
  totalPages?: number;
  currentPage?: number;
};

/** Micro kitchen: planned leave rows for delivery team members (same API as supply-chain-leave with filters). */
export const fetchMicroKitchenTeamLeaves = async (
  page = 1,
  limit = 10,
  search?: string,
  period: OrderDatePeriod | string = "this_month",
  customRangeStart?: string,
  customRangeEnd?: string
): Promise<PaginatedTeamLeaves> => {
  let url = createApiUrl(`api/supply-chain-leave/?page=${page}&limit=${limit}`);
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (period && period !== "all") {
    url += `&period=${encodeURIComponent(period)}`;
    if (period === "custom_range" && customRangeStart && customRangeEnd) {
      url += `&start_date=${encodeURIComponent(customRangeStart)}&end_date=${encodeURIComponent(customRangeEnd)}`;
    }
  }
  const res = await axios.get(url, { headers: await getAuthHeaders() });
  const d = res.data;
  if (Array.isArray(d)) {
    return { results: d, count: d.length, totalPages: 1, currentPage: 1 };
  }
  return {
    results: d?.results ?? [],
    count: d?.count ?? 0,
    totalPages: d?.total_pages ?? 1,
    currentPage: d?.current_page ?? page,
  };
};
