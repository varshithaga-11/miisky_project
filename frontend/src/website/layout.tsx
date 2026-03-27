import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LayoutProvider, useLayout } from "./context/LayoutContext";
import Layout from "./components/layout/Layout";
import "./website.css";

export function GlobalLayoutWrapper() {
  const { footerStyle, breadcrumbTitle } = useLayout();
  const { pathname } = useLocation();
  const isAuthPage = pathname.includes("/login") || pathname.includes("/register");

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <Layout headerStyle={1} footerStyle={footerStyle} breadcrumbTitle={breadcrumbTitle}>
      <Outlet />
    </Layout>
  );
}

export default function WebsiteLayout() {
  return (
    <AuthProvider>
      <LayoutProvider>
        <div className="website-layout">
          <GlobalLayoutWrapper />
        </div>
      </LayoutProvider>
    </AuthProvider>
  );
}
