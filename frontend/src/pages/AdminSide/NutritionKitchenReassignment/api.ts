import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../../access/access";

export const getNutritionistReassignments = async (page: number = 1, limit: number = 10, search: string = "", user?: number) => {
  const params: any = { page, limit, search };
  if (user) params.user = user;
  
  const url = createApiUrl("api/nutritionist-reassignment/");
  const response = await axios.get(url, {
    params,
    headers: await getAuthHeaders()
  });
  return response.data;
};

export const getKitchenReassignments = async (page: number = 1, limit: number = 10, search: string = "", user?: number) => {
  const params: any = { page, limit, search };
  if (user) params.user = user;
  
  const url = createApiUrl("api/kitchen-reassignment/");
  const response = await axios.get(url, {
    params,
    headers: await getAuthHeaders()
  });
  return response.data;
};
