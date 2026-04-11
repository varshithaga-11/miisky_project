import axios, { isAxiosError } from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export const getAdminSupplyChainList = async (
  page: number = 1,
  search: string = "",
  limit: number = 10
): Promise<{
  results: unknown[];
  total_pages: number;
  count?: number;
}> => {
  const url = createApiUrl(
    `api/admin-supply-chain/?page=${page}&search=${encodeURIComponent(search)}&limit=${limit}`
  );
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

export type KitchenTeamRow = {
  id: number;
  role: string;
  is_active: boolean;
  zone_name: string | null;
  pincode: string | null;
  assigned_on: string;
  micro_kitchen_details: {
    id: number;
    brand_name: string | null;
    kitchen_code: string | null;
  } | null;
};

export type PaymentSnapshotRow = {
  food_subtotal: string;
  delivery_charge: string;
  grand_total: string;
  platform_amount: string;
  kitchen_amount: string;
  platform_percent: string;
  kitchen_percent: string;
} | null;

export type AdminSupplyChainOrderRow = {
  id: number;
  status: string;
  order_type: string;
  total_amount: string;
  delivery_charge: string;
  final_amount: string;
  delivery_distance_km: string | null;
  created_at: string;
  kitchen_brand: string | null;
  patient_label: string | null;
  payment_snapshot: PaymentSnapshotRow;
  receipt_uploaded: boolean;
};

export type SupplyChainDossier = {
  user: Record<string, unknown>;
  kitchen_team: KitchenTeamRow[];
  plan_assignments: unknown[];
  orders: AdminSupplyChainOrderRow[];
  delivery_profile: Record<string, unknown> | null;
  planned_leaves: unknown[];
};

function apiErrorDetail(err: unknown): string | null {
  if (isAxiosError(err)) {
    const d = err.response?.data as { detail?: unknown } | undefined;
    if (d?.detail != null) {
      return typeof d.detail === "string" ? d.detail : JSON.stringify(d.detail);
    }
  }
  return null;
}

export const fetchSupplyChainDossier = async (
  userId: number
): Promise<SupplyChainDossier> => {
  const url = createApiUrl(`api/admin-supply-chain-dossier/?user=${userId}`);
  try {
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
  } catch (err) {
    const detail = apiErrorDetail(err);
    throw new Error(detail || "Failed to load supply chain dossier.");
  }
};
