import axios from 'axios';
import { createApiUrl } from '../../access/access.ts';

// Types for the registration API
interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  password_confirm: string;
  role: string;
  mobile?: string;
  whatsapp?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: number;
  state?: number;
  zip_code?: string;
  photo?: any;
  caste?: string;
  religion?: string;
  group?: string;
  lat_lng_address?: string;
}

interface ApiResponse {
  success: boolean;
  status?: string;
  message?: string;
  data?: any;
  error?: string;
  details?: any;
}

// Register a new user
export const registerUser = async (userData: UserData): Promise<ApiResponse> => {
  try {
    console.log('--- Registration Attempt ---');
    console.log('Target URL:', createApiUrl('api/register/'));
    console.log('Data:', userData);
    
    let config: any = {
      headers: {}
    };

    let dataToSend: any;

    if (userData.photo) {
      dataToSend = new FormData();
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          dataToSend.append(key, value);
        }
      });
      // Axios will set the correct Content-Type for FormData
    } else {
      dataToSend = userData;
      config.headers['Content-Type'] = 'application/json';
    }

    const response = await axios.post(createApiUrl('api/register/'), dataToSend, config);

    console.log('Registration Success:', response.status, response.data);

    if (response.data.status === 'success') {
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'User registered successfully'
      };
    } else {
      return {
        success: false,
        error: response.data.message || 'Registration failed',
        details: response.data.message
      };
    }
  } catch (error: any) {
    console.error('--- Registration Error ---');
    if (axios.isAxiosError(error)) {
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      console.error('Headers:', error.response?.headers);
      console.error('Config:', error.config);
      
      const errorMessage = error.response?.data?.message || error.message;
      const details = error.response?.data?.message || error.response?.data || error.message;
      
      return {
        success: false,
        error: `API Error: ${errorMessage}`,
        details: details
      };
    }
    
    console.error('Non-Axios Error:', error);
    return {
      success: false,
      error: `Network error occurred: ${error.message}`,
      details: error.message
    };
  }
};

// Export types for use in other components
export type { UserData, ApiResponse };

export const getAvailableRoles = async (): Promise<{ success: boolean; roles?: string[]; error?: string }> => {
  try {
    const token = localStorage.getItem("access");
    const response = await axios.get(createApiUrl("api/available-roles/"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return { success: true, roles: response.data.roles };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || "Failed to fetch roles" };
  }
};

export const switchRole = async (role: string): Promise<{ success: boolean; tokens?: any; error?: string }> => {
  try {
    const token = localStorage.getItem("access");
    const response = await axios.post(
      createApiUrl("api/switch-role/"),
      { role },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return { success: true, tokens: response.data.tokens };
  } catch (error: any) {
    return { success: false, error: error.response?.data?.error || "Failed to switch role" };
  }
};
