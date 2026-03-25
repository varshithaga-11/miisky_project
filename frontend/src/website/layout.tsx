import { Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import "./website.css";

export default function WebsiteLayout() {
  return (
    <AuthProvider>
      <div className="website-layout">
        <Outlet />
      </div>
    </AuthProvider>
  );
}
