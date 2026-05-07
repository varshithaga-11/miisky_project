import { jwtDecode } from 'jwt-decode';
import { createApiUrl } from '../../access/access.ts';

interface LoginCredentials {
  username: string;
  password: string;
  role: string;
}

interface LoginResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  details?: any;
  userRole?: string;
}

const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  try {
    const response = await fetch(createApiUrl('api/login/'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (response.ok && data.tokens && data.tokens.access) {
      localStorage.setItem('access', data.tokens.access);
      localStorage.setItem('refresh', data.tokens.refresh);
      const userRole = jwtDecode<{ role: string }>(data.tokens.access).role;

      return {
        success: true,
        data: data,
        message: data.message || 'Login successful',
        userRole: userRole,

      };
    } else {
      return {
        success: false,
        error: data.message || 'Invalid credentials',
        details: data
      };
    }

  } catch (error: unknown) {
    console.error('Login API Error:', error);
    return {
      success: false,
      error: 'Network error occurred',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};



export const getUserRolesByIdentifier = async (identifier: string): Promise<{ success: boolean; roles?: string[]; username?: string; error?: string }> => {
  try {
    const response = await fetch(createApiUrl(`api/user-roles-by-identifier/?identifier=${encodeURIComponent(identifier)}`), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        roles: data.roles,
        username: data.username,
      };
    } else {
      return {
        success: false,
        error: data.error || 'Failed to fetch roles',
      };
    }
  } catch (error) {
    console.error('Fetch roles error:', error);
    return {
      success: false,
      error: 'Network error occurred',
    };
  }
};

export default loginUser;