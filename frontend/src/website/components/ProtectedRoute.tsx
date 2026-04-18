import { Navigate } from "react-router-dom";
import { authApi } from '@website/utils/api';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = authApi.isAuthenticated();


  const currentPath = window.location.pathname;
  if (!isAuthenticated && !currentPath.includes("/login")) {
    return <Navigate to={`/website/login?next=${currentPath}`} replace />;
  }


  return <>{children}</>;
}
