import axios from "axios";
import { createApiUrl, getAuthHeaders } from "../../access/access";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
  user_id: string;
}

export const getUserIdFromToken = (): string | null => {
  const token = localStorage.getItem("access");
  if (!token) return null;
  try {
    return jwtDecode<JwtPayload>(token).user_id;
  } catch {
    return null;
  }
};

export const getProfile = async () => {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("No user ID found in token");
    const url = createApiUrl(`api/profile/${userId}/`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const updateProfile = async (data: any) => {
    const userId = getUserIdFromToken();
    if (!userId) throw new Error("No user ID found in token");
    const url = createApiUrl(`api/profile/${userId}/`);
    const response = await axios.patch(url, data, {
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};

export const getCountries = async () => {
    const url = createApiUrl("api/country/all/");
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getStates = async (countryId: string | number) => {
    const url = createApiUrl(`api/state/all/?country=${countryId}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};

export const getCities = async (stateId: string | number) => {
    const url = createApiUrl(`api/city/all/?state=${stateId}`);
    const response = await axios.get(url, { headers: await getAuthHeaders() });
    return response.data;
};
