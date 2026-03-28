import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export interface PlatformPaymentSettings {
  id: number;
  default_platform_fee_percent: string;
  default_nutritionist_share_percent: string;
  default_kitchen_share_percent: string;
  updated_at: string;
}

export async function fetchPlatformPaymentSettings(): Promise<PlatformPaymentSettings> {
  const url = createApiUrl("api/admin/platform-payment-settings/");
  const res = await axios.get<PlatformPaymentSettings>(url, { headers: await getAuthHeaders() });
  return res.data;
}

export type PlatformPaymentSettingsPatch = {
  default_platform_fee_percent?: string | number;
  default_nutritionist_share_percent?: string | number;
  default_kitchen_share_percent?: string | number;
};

export async function patchPlatformPaymentSettings(
  data: PlatformPaymentSettingsPatch
): Promise<PlatformPaymentSettings> {
  const url = createApiUrl("api/admin/platform-payment-settings/");
  const res = await axios.patch<PlatformPaymentSettings>(url, data, { headers: await getAuthHeaders() });
  return res.data;
}
