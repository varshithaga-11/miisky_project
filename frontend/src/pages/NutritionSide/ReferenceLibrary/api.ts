import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

/**
 * Fetches all health parameters with their associated normal ranges.
 */
export const getHealthParametersWithRanges = async (page: number = 1, limit: number = 10, search: string = "") => {
  const url = createApiUrl("api/healthparameter/");
  const response = await axios.get(url, {
    params: { page, limit, search },
    headers: await getAuthHeaders()
  });
  return response.data;
};

/**
 * Fetches detailed normal ranges for a specific parameter.
 */
export const getNormalRanges = async (parameterId?: number) => {
  const url = createApiUrl("api/normalrange/");
  const response = await axios.get(url, {
    params: { health_parameter: parameterId },
    headers: await getAuthHeaders()
  });
  return response.data;
};
