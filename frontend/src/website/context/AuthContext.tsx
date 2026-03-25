import { createContext, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../utils/api";

interface AuthContextType {
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const logout = useCallback(async () => {
    try {
      // Clear tokens from storage
      authApi.logout();

      // Redirect to login page
      navigate("/website/login");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still redirect even if there's an error
      navigate("/website/login");
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
