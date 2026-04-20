import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export const checkFoodDependency = async (type: string, id: number) => {
  const url = createApiUrl(`api/adminside/food-management/delete/`);
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { type, id }
  });
  return response.data as { detail: string };
};

export const deleteFoodRecord = async (type: string, id: number) => {
  const url = createApiUrl(`api/adminside/food-management/delete/`);
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
    params: { type, id }
  });
  return response.data;
};
