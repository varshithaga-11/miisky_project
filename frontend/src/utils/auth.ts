import { jwtDecode } from "jwt-decode";

export type AppRole =
  | "admin"
  | "master"
  | "nutritionist"
  | "patient"
  | "supply_chain"
  | "food_buyer"
  | "micro_kitchen"
  | "non_patient";

type TokenClaims = {
  role?: AppRole;
  user_id?: number | string;
};

export function getAccessToken(): string | null {
  return localStorage.getItem("access");
}

export function getUserRoleFromToken(): AppRole | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    return (jwtDecode<TokenClaims>(token).role as AppRole) || null;
  } catch {
    return null;
  }
}

export function getUserIdFromToken(): number | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const raw = jwtDecode<TokenClaims>(token).user_id;
    if (raw === undefined || raw === null) return null;
    const n = typeof raw === "string" ? Number(raw) : raw;
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

