/**
 * utils/api.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized API handler for the Miisky client-ui.
 * All backend communication should go through this module.
 *
 * Base URL is controlled via the VITE_API_URL environment variable
 * (set in .env.local):
 *   VITE_API_URL=http://127.0.0.1:8000/api/
 * ─────────────────────────────────────────────────────────────────────────────
 */

import type {
  ApiResponse,
  PaginatedResponse,
} from "./types";

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000/api";

// ─── Token Storage Helpers ───────────────────────────────────────────────────

const COOKIE_KEY  = "miisky_auth";          // Cookie name read by middleware
const TOKEN_KEY   = "access";
const REFRESH_KEY = "refresh";
const USER_KEY    = "miisky_user";

/** Write a client-side cookie so the Next.js middleware can check auth. */
function setAuthCookie(token: string) {
  if (typeof document === "undefined") return;
  // Max-age 3600 s = 1 hour (matches JWT ACCESS_TOKEN_LIFETIME)
  document.cookie = `${COOKIE_KEY}=${token}; path=/; max-age=3600; SameSite=Lax`;
}

/** Clear the auth cookie. */
function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

export const tokenStorage = {
  getAccess:  (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  setAccess:  (token: string) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    setAuthCookie(token);                   // ← also write the middleware cookie
  },

  getRefresh: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(REFRESH_KEY) : null,
  setRefresh: (token: string) =>
    typeof window !== "undefined" && localStorage.setItem(REFRESH_KEY, token),

  getUser: (): StoredUser | null => {
    if (typeof window === "undefined") return null;
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
  },
  setUser: (u: StoredUser) =>
    typeof window !== "undefined" && localStorage.setItem(USER_KEY, JSON.stringify(u)),

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem(USER_KEY);
      clearAuthCookie();                    // ← also clear the middleware cookie
    }
  },
};

export interface StoredUser {
  id?: number;
  username: string;
  email?: string;
  role?: string;
}

// ─── Core Fetch Wrapper ──────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** If true, the Authorization header is NOT attached (public endpoints) */
  public?: boolean;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { body, public: isPublic, ...rest } = options;

  const isFormData = body instanceof FormData;
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(rest.headers as Record<string, string>),
  };

  // Attach JWT access token when available
  const accessToken = tokenStorage.getAccess();
  if (!isPublic && accessToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
  }

  const url = `${BASE_URL}/${endpoint.replace(/^\//, "")}`;

  const response = await fetch(url, {
    ...rest,
    headers,
    body: body !== undefined ? (isFormData ? body : JSON.stringify(body)) as any : undefined,
  });

  // ── Handle token expiry (401) ──
  if (response.status === 401 && !isPublic) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry the original request once with the new token
      (headers as Record<string, string>)["Authorization"] =
        `Bearer ${tokenStorage.getAccess()}`;
      const retryResponse = await fetch(url, {
        ...rest,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      if (!retryResponse.ok) throw await buildError(retryResponse);
      return retryResponse.json() as Promise<T>;
    } else {
      tokenStorage.clear();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) throw await buildError(response);

  // Handle 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

async function tryRefreshToken(): Promise<boolean> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return false;

  try {
    // Backend refresh endpoint: POST /api/token/refresh/
    const res = await fetch(`${BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    // Response shape: { access: "..." }
    const newAccess = data.access;
    if (!newAccess) return false;
    tokenStorage.setAccess(newAccess);
    return true;
  } catch {
    return false;
  }
}

async function buildError(response: Response): Promise<Error> {
  try {
    const data = await response.json();
    const message =
      data?.detail ||
      data?.message ||
      Object.values(data ?? {}).flat().join(" ") ||
      `HTTP ${response.status}`;
    return new Error(message);
  } catch {
    return new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}

// ─── Public Methods ──────────────────────────────────────────────────────────

/** HTTP GET — typed response */
export function get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  return request<T>(endpoint, { ...options, method: "GET" });
}

/** HTTP POST — sends a JSON body */
export function post<T>(
  endpoint: string,
  body: unknown,
  options: RequestOptions = {}
): Promise<T> {
  return request<T>(endpoint, { ...options, method: "POST", body });
}

/** HTTP PUT — full replacement */
export function put<T>(
  endpoint: string,
  body: unknown,
  options: RequestOptions = {}
): Promise<T> {
  return request<T>(endpoint, { ...options, method: "PUT", body });
}

/** HTTP PATCH — partial update */
export function patch<T>(
  endpoint: string,
  body: unknown,
  options: RequestOptions = {}
): Promise<T> {
  return request<T>(endpoint, { ...options, method: "PATCH", body });
}

/** HTTP DELETE */
export function del<T = void>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  return request<T>(endpoint, { ...options, method: "DELETE" });
}

// ─── Convenience Helpers ─────────────────────────────────────────────────────

/**
 * Fetch a paginated list from a Django REST Framework list endpoint.
 * Supports optional query params object.
 */
export async function getList<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<PaginatedResponse<T>> {
  const query = params
    ? "?" +
      new URLSearchParams(
        Object.fromEntries(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
        )
      ).toString()
    : "";

  return get<PaginatedResponse<T>>(`${endpoint}${query}`);
}

/**
 * Fetch a single resource by its ID.
 */
export function getOne<T>(endpoint: string, id: string | number): Promise<T> {
  return get<T>(`${endpoint}/${id}/`);
}

// ─── Auth Endpoints ──────────────────────────────────────────────────────────

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
  role?: string;           // defaults to 'User' on the backend
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

/** Backend login response shape */
interface LoginResponse {
  status: string;
  message: string;
  tokens: AuthTokens;
}

/** Backend register response shape */
interface RegisterResponse {
  status: string;
  message: string;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
    created_by: number | null;
  };
}

export const authApi = {
  /**
   * Sign in using the real backend endpoint.
   * POST /api/login/  →  { username, password }
   * Response: { status, message, tokens: { access, refresh } }
   */
  login: async (payload: LoginPayload): Promise<AuthTokens> => {
    const res = await post<LoginResponse>("login/", payload, { public: true });

    if (res.status !== "success" || !res.tokens) {
      const errMsg =
        typeof res.message === "string"
          ? res.message
          : JSON.stringify(res.message);
      throw new Error(errMsg || "Login failed.");
    }

    tokenStorage.setAccess(res.tokens.access);
    tokenStorage.setRefresh(res.tokens.refresh);

    // Decode username/role from JWT payload (base64 middle segment)
    try {
      const payload64 = res.tokens.access.split(".")[1];
      const decoded = JSON.parse(atob(payload64));
      tokenStorage.setUser({
        id:       decoded.user_id,
        username: decoded.username,
        role:     decoded.role,
      });
    } catch {
      // non-critical
    }

    return res.tokens;
  },

  /**
   * Register a new user.
   * POST /api/register/ → { username, email, first_name, last_name, password, password_confirm }
   */
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const res = await post<RegisterResponse>("register/", payload, { public: true });
    if (res.status !== "success") {
      const errMsg =
        typeof res.message === "string"
          ? res.message
          : JSON.stringify(res.message);
      throw new Error(errMsg || "Registration failed.");
    }
    return res;
  },

  /**
   * Clear all auth tokens from local storage.
   */
  logout: (): void => {
    tokenStorage.clear();
  },

  /** True if an access token exists in storage */
  isAuthenticated: (): boolean => Boolean(tokenStorage.getAccess()),

  /** Returns the cached user info decoded from the JWT */
  getCurrentUser: () => tokenStorage.getUser(),
};

// ─── Contact Endpoint ─────────────────────────────────────────────────────────

export const contactApi = {
  send: (data: any) =>
    post<ApiResponse<null>>("website/websiteinquiry/", data, { public: true }),
};

// ─── Appointment Endpoint ────────────────────────────────────────────────────

export const appointmentApi = {
  create: (data: import("./types").AppointmentPayload) =>
    post<ApiResponse<import("./types").Appointment>>("appointments/", data, {
      public: true,
    }),
};

// ─── Domain Endpoints (add as the backend grows) ─────────────────────────────

export const doctorsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    getList<import("./types").Doctor>("doctors/", params),
  detail: (id: string | number) =>
    getOne<import("./types").Doctor>("doctors", id),
};

export const departmentsApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    getList<import("./types").Department>("departments/", params),
  detail: (id: string | number) =>
    getOne<import("./types").Department>("departments", id),
};

export const blogApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    getList<import("./types").BlogPost>("blog/", params),
  detail: (slug: string) =>
    get<import("./types").BlogPost>(`blog/${slug}/`),
  create: (data: FormData) =>
    post<any>("website/blogpost/", data, { public: true }),
};

export const servicesApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    getList<import("./types").Service>("services/", params),
};

export const portfolioApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    getList<import("./types").PortfolioItem>("portfolio/", params),
};

export const pricingApi = {
  list: () => getList<import("./types").PricingPlan>("pricing/"),
};

export const careersApi = {
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    getList<any>("website/joblisting/", params),
  detail: (id: string | number) =>
    get<any>(`website/joblisting/${id}/`),
  apply: (data: FormData) =>
    post<any>("website/jobapplication/", data, { public: true }),
};
