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
    // Use PATCH for partial updates if the viewset supports it (which it does via ModelViewSet)
    const response = await axios.patch(url, data, {
        headers: {
            ...(await getAuthHeaders()),
            "Content-Type": "multipart/form-data", // Support photo upload
        },
    });
    return response.data;
};
