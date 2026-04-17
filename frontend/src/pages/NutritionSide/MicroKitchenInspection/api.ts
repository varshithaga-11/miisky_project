import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";
import type { MicroKitchenProfile } from "../../AdminSide/MicroKitchenInformation/api";

export type { MicroKitchenProfile };

export const getMicroKitchenById = async (id: number): Promise<MicroKitchenProfile> => {
  const url = createApiUrl(`api/microkitchenprofile/${id}/`);
  const response = await axios.get(url, { headers: await getAuthHeaders() });
  return response.data;
};

/** Inspection rows for a kitchen (nutritionist access after backend allows role). */
export const getMicroKitchenInspectionsForKitchen = async (microKitchenId: number) => {
  const url = createApiUrl(`api/microkitcheninspection/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { micro_kitchen: microKitchenId, limit: 100, page: 1 },
  });
  const d = response.data;
  return Array.isArray(d) ? d : (d.results ?? []);
};

export const updateMicroKitchenStatus = async (id: number, status: string): Promise<MicroKitchenProfile> => {
  const url = createApiUrl(`api/microkitchenprofile/${id}/`);
  const response = await axios.patch(url, { status }, { headers: await getAuthHeaders() });
  return response.data;
};
