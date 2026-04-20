import { createApiUrl, getAuthHeaders } from "../../../access/access";
import axios from "axios";

export const checkMasterDependency = async (type: string, id: number) => {
  const url = createApiUrl("api/adminside/questionnaire-master/delete/");
  const response = await axios.get(url, {
    headers: await getAuthHeaders(),
    params: { type, id }
  });
  return response.data;
};

export const deleteMasterRecord = async (type: string, id: number) => {
  const url = createApiUrl("api/adminside/questionnaire-master/delete/");
  const response = await axios.delete(url, {
    headers: await getAuthHeaders(),
    params: { type, id }
  });
  return response.data;
};
