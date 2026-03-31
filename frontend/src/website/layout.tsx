import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LayoutProvider, useLayout } from "./context/LayoutContext";
import Layout from "./components/layout/Layout";
import "./website.css";

export function GlobalLayoutWrapper() {
  const { headerStyle, footerStyle, breadcrumbTitle, setHeaderStyle } = useLayout();
  const { pathname } = useLocation();
  const isAuthPage = pathname.includes("/login") || pathname.includes("/register");

  useEffect(() => {
    if (pathname === "/website" || pathname === "/website/") {
      setHeaderStyle(1);
    } else {
      setHeaderStyle(3);
    }
  }, [pathname, setHeaderStyle]);

  if (isAuthPage) {
    return <Outlet />;
  }

  return (
    <Layout headerStyle={headerStyle} footerStyle={footerStyle} breadcrumbTitle={breadcrumbTitle}>
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
