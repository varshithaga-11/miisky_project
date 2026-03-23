import { Navigate } from "react-router-dom";
import { authApi } from "../utils/api";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authApi.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${window.location.pathname}`} replace />;
  }

  return <>{children}</>;
}
