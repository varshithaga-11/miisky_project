import { jwtDecode } from 'jwt-decode';

// Global type declaration for API_URL
declare const __API_URL__: string;

// Type definitions
interface JwtPayload {
  exp: number;
  [key: string]: any;
}

interface RefreshTokenResponse {
  access: string;
}

interface AuthHeaders {
  'Content-Type': string;
  'Authorization': string;
  [key: string]: string;
}

interface FileUploadHeaders {
  'Content-Type': string;
  'Authorization': string;
  [key: string]: string;
}

const API_URL: string = __API_URL__;

const createApiUrl = (path: string): string => {
  const url = `${API_URL}${path}`;
  return url;
};

const getAuthHeaders = async (): Promise<AuthHeaders> => {
  let access_token: string | null = localStorage.getItem('access');
  let refresh_token: string | null = localStorage.getItem('refresh');

  if (isAccessTokenExpired(access_token)) {
    console.log("Access token expired or missing, attempting refresh...");
    try {
      const newAccessToken = await refreshAccessToken(refresh_token);
      access_token = newAccessToken;
      localStorage.setItem('access', newAccessToken);
      console.log("Token refreshed successfully.");
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Optional: redirect to login if refresh fails
      // window.location.href = '/login';
      throw error;
    }
  }

  const headers: AuthHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${access_token}`,
  };
  return headers;
};

const getAuthHeadersFile = async (): Promise<FileUploadHeaders> => {
  let access_token: string | null = localStorage.getItem('access');
  let refresh_token: string | null = localStorage.getItem('refresh');

  if (isAccessTokenExpired(access_token)) {
    const newAccessToken = await refreshAccessToken(refresh_token);
    access_token = newAccessToken;
    localStorage.setItem('access', newAccessToken);
  }

  const headers: FileUploadHeaders = {
    'Content-Type': 'multipart/form-data',
    'Authorization': `Bearer ${access_token}`,
  };
  return headers;
};

const isAccessTokenExpired = (access_token: string | null): boolean => {
  if (!access_token) {
    return true;
  }

  try {
    const decoded = jwtDecode<JwtPayload>(access_token);
    const currentTime = Date.now() / 1000;
    // Buffer of 10 seconds
    const isExpired = decoded.exp < (currentTime + 10);
    return isExpired;
  } catch (error) {
    return true;
  }
};

const refreshAccessToken = async (refresh_token: string | null): Promise<string> => {
  if (!refresh_token) {
    console.error("No refresh token found in localStorage.");
    throw new Error('No refresh token available. Please log in again.');
  }

  const refreshUrl = createApiUrl('api/token/refresh/');
  console.log("Requesting token refresh from:", refreshUrl);
  
  const response = await fetch(refreshUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      refresh: refresh_token,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Refresh API returned error:", response.status, data);
    throw new Error(data.message || data.detail || 'Failed to refresh access token');
  }

  const accessToken = data.access;
  
  if (!accessToken) {
    console.error("Refresh API returned 200 but no access token was found in body:", data);
    throw new Error('No access token received in response');
  }
  
  return accessToken;
};

export { createApiUrl, getAuthHeaders, getAuthHeadersFile };
export type { AuthHeaders, FileUploadHeaders, JwtPayload, RefreshTokenResponse };
